import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PoolClient } from 'pg';
import { z } from 'zod';
import { ActivityService } from '../activity/activity.service';
import { isUuid, normalizeEmail, parse, randomToken, safeEqualHex, sha256 } from '../common/util';
import { CONFIG, Config } from '../config';
import { Db } from '../db/db.service';
import { RateLimiter } from './rate-limiter';

export const passwordSchema = z.string().min(12, 'Mindestens 12 Zeichen').max(200);
const emailSchema = z.string().email().max(254);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1).max(100),
  familyName: z.string().trim().min(1).max(100),
});
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(200), deviceLabel: z.string().max(100).optional() });
export const refreshSchema = z.object({ refreshToken: z.string().min(10).max(300) });
export const acceptInviteSchema = z.object({
  token: z.string().min(10).max(200),
  password: passwordSchema,
  displayName: z.string().trim().min(1).max(100),
});

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

@Injectable()
export class AuthService {
  private readonly jwt: JwtService;
  /** Wird für unbekannte E-Mail-Adressen verglichen, damit Antwortzeit nichts verrät. */
  private dummyHash?: Promise<string>;

  constructor(
    private readonly db: Db,
    private readonly activity: ActivityService,
    private readonly limiter: RateLimiter,
    @Inject(CONFIG) private readonly cfg: Config,
  ) {
    this.jwt = new JwtService({ secret: cfg.jwtSecret });
  }

  async register(input: unknown): Promise<TokenPair> {
    if (!this.cfg.allowRegistration) throw new ForbiddenException('Registrierung ist deaktiviert, bitte Einladung nutzen');
    const d = parse(registerSchema, input);
    const email = normalizeEmail(d.email);
    const hash = await argon2.hash(d.password, { type: argon2.argon2id });
    return this.db.tx(async (c) => {
      const userId = await this.insertUser(c, email, hash, d.displayName);
      const fam = await c.query<{ id: string }>('INSERT INTO families (name) VALUES ($1) RETURNING id', [d.familyName]);
      await c.query(`INSERT INTO family_memberships (family_id, user_id, role) VALUES ($1,$2,'admin')`, [fam.rows[0].id, userId]);
      await this.activity.log({ familyId: fam.rows[0].id, entityType: 'family', entityId: fam.rows[0].id, action: 'family.created', actorId: userId }, c);
      return this.createSession(c, userId);
    });
  }

  async acceptInviteNewUser(input: unknown): Promise<TokenPair> {
    const d = parse(acceptInviteSchema, input);
    const hash = await argon2.hash(d.password, { type: argon2.argon2id });
    return this.db.tx(async (c) => {
      const inv = await this.claimInvitation(c, d.token);
      const exists = await c.query('SELECT 1 FROM users WHERE email=$1', [inv.email]);
      if (exists.rowCount) throw new ConflictException('Für diese Adresse existiert bereits ein Konto, bitte anmelden und Einladung dort annehmen');
      const userId = await this.insertUser(c, inv.email, hash, d.displayName);
      await this.addMembership(c, inv, userId);
      return this.createSession(c, userId);
    });
  }

  async acceptInviteExistingUser(userId: string, token: string): Promise<{ familyId: string }> {
    return this.db.tx(async (c) => {
      const inv = await this.claimInvitation(c, token);
      const u = await c.query<{ email: string }>('SELECT email FROM users WHERE id=$1', [userId]);
      if (u.rows[0]?.email !== inv.email) throw new ForbiddenException('Einladung gilt für eine andere E-Mail-Adresse');
      await this.addMembership(c, inv, userId);
      return { familyId: inv.family_id };
    });
  }

  async login(input: unknown, ip: string): Promise<TokenPair> {
    const d = parse(loginSchema, input);
    const email = normalizeEmail(d.email);
    const key = `login:${ip}:${email}`;
    if (this.limiter.tooMany(key, this.cfg.loginMaxAttempts, this.cfg.loginWindowMs)) {
      throw new HttpException('Zu viele Anmeldeversuche, bitte später erneut versuchen', HttpStatus.TOO_MANY_REQUESTS);
    }
    const r = await this.db.query<{ id: string; password_hash: string; disabled_at: Date | null }>(
      'SELECT id, password_hash, disabled_at FROM users WHERE email=$1',
      [email],
    );
    const user = r.rows[0];
    this.dummyHash ??= argon2.hash('dummy-password-for-timing', { type: argon2.argon2id });
    const ok = await argon2.verify(user?.password_hash ?? (await this.dummyHash), d.password).catch(() => false);
    if (!user || !ok || user.disabled_at) {
      this.limiter.record(key);
      throw new UnauthorizedException('E-Mail oder Passwort falsch');
    }
    this.limiter.reset(key);
    return this.db.tx((c) => this.createSession(c, user.id, d.deviceLabel));
  }

  async refresh(input: unknown): Promise<TokenPair> {
    const { refreshToken } = parse(refreshSchema, input);
    const [sid, secret] = refreshToken.split('.');
    const invalid = new UnauthorizedException('Sitzung ungültig');
    if (!isUuid(sid) || !secret) throw invalid;
    return this.db.tx(async (c) => {
      const r = await c.query<{
        id: string; user_id: string; refresh_hash: string; prev_refresh_hash: string | null;
        expires_at: Date; revoked_at: Date | null; disabled_at: Date | null;
      }>(
        `SELECT s.id, s.user_id, s.refresh_hash, s.prev_refresh_hash, s.expires_at, s.revoked_at, u.disabled_at
           FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.id = $1::uuid FOR UPDATE OF s`,
        [sid],
      );
      const s = r.rows[0];
      if (!s || s.revoked_at || s.disabled_at || s.expires_at < new Date()) throw invalid;
      const presented = sha256(secret);
      if (s.prev_refresh_hash && safeEqualHex(presented, s.prev_refresh_hash)) {
        // Wiederverwendung eines bereits rotierten Tokens: Sitzung sperren.
        await c.query('UPDATE sessions SET revoked_at = now(), updated_at = now() WHERE id=$1', [s.id]);
        await this.activity.log({ entityType: 'session', entityId: s.id, action: 'session.reuse_detected', actorId: s.user_id, result: 'revoked' }, c);
        // Commit trotz Fehler nötig, daher bewusst kein Throw innerhalb der Transaktion:
        return { __invalid: true } as unknown as TokenPair;
      }
      if (!safeEqualHex(presented, s.refresh_hash)) throw invalid;
      const next = randomToken();
      await c.query(
        `UPDATE sessions SET prev_refresh_hash = refresh_hash, refresh_hash = $2, expires_at = $3, updated_at = now() WHERE id = $1`,
        [s.id, sha256(next), this.refreshExpiry()],
      );
      return this.pair(s.user_id, s.id, `${s.id}.${next}`);
    }).then((res) => {
      if ((res as unknown as { __invalid?: boolean }).__invalid) throw invalid;
      return res;
    });
  }

  async logout(sessionId: string): Promise<void> {
    await this.db.query('UPDATE sessions SET revoked_at = now(), updated_at = now() WHERE id=$1 AND revoked_at IS NULL', [sessionId]);
  }

  async revokeAllSessions(userId: string, client?: PoolClient): Promise<void> {
    const sql = 'UPDATE sessions SET revoked_at = now(), updated_at = now() WHERE user_id=$1 AND revoked_at IS NULL';
    if (client) await client.query(sql, [userId]);
    else await this.db.query(sql, [userId]);
  }

  verifyAccess(token: string): { sub: string; sid: string } {
    try {
      const p = this.jwt.verify<{ sub: string; sid: string }>(token);
      if (!p.sub || !p.sid) throw new Error('claims');
      return p;
    } catch {
      throw new UnauthorizedException();
    }
  }

  // ---------- intern ----------

  private refreshExpiry(): Date {
    return new Date(Date.now() + this.cfg.refreshTtlDays * 86_400_000);
  }

  private pair(userId: string, sessionId: string, refreshToken: string): TokenPair {
    const accessToken = this.jwt.sign({ sub: userId, sid: sessionId }, { expiresIn: this.cfg.accessTtlSeconds });
    return { accessToken, refreshToken, expiresInSeconds: this.cfg.accessTtlSeconds };
  }

  private async createSession(c: PoolClient, userId: string, deviceLabel?: string): Promise<TokenPair> {
    const secret = randomToken();
    const r = await c.query<{ id: string }>(
      `INSERT INTO sessions (user_id, refresh_hash, device_label, expires_at) VALUES ($1,$2,$3,$4) RETURNING id`,
      [userId, sha256(secret), deviceLabel ?? null, this.refreshExpiry()],
    );
    return this.pair(userId, r.rows[0].id, `${r.rows[0].id}.${secret}`);
  }

  private async insertUser(c: PoolClient, email: string, hash: string, displayName: string): Promise<string> {
    try {
      const r = await c.query<{ id: string }>(
        'INSERT INTO users (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id',
        [email, hash, displayName],
      );
      return r.rows[0].id;
    } catch (e) {
      if ((e as { code?: string }).code === '23505') throw new ConflictException('Diese E-Mail-Adresse ist bereits registriert');
      throw e;
    }
  }

  private async claimInvitation(c: PoolClient, token: string) {
    const r = await c.query<{ id: string; family_id: string; email: string; role: string }>(
      `UPDATE invitations SET accepted_at = now()
        WHERE token_hash = $1 AND accepted_at IS NULL AND expires_at > now()
        RETURNING id, family_id, email, role`,
      [sha256(token)],
    );
    if (!r.rows[0]) throw new NotFoundException('Einladung ungültig oder abgelaufen');
    return r.rows[0];
  }

  private async addMembership(c: PoolClient, inv: { id: string; family_id: string; role: string }, userId: string) {
    await c.query(
      `INSERT INTO family_memberships (family_id, user_id, role) VALUES ($1,$2,$3)
       ON CONFLICT (family_id, user_id) DO NOTHING`,
      [inv.family_id, userId, inv.role],
    );
    await this.activity.log({ familyId: inv.family_id, entityType: 'membership', entityId: userId, action: 'membership.joined', actorId: userId, changes: { role: inv.role } }, c);
  }
}
