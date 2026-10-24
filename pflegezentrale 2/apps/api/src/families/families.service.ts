import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { ActivityService } from '../activity/activity.service';
import { AuthService } from '../auth/auth.service';
import { CareAccessService } from '../care/care-access.service';
import { Inject } from '@nestjs/common';
import { CONFIG, Config } from '../config';
import { normalizeEmail, parse, randomToken, sha256, uuidOr404 } from '../common/util';
import { Db } from '../db/db.service';

const roleSchema = z.enum(['admin', 'member', 'caregiver', 'readonly']);
export const inviteSchema = z.object({ email: z.string().email().max(254), role: roleSchema });
export const roleChangeSchema = z.object({ role: roleSchema });

@Injectable()
export class FamiliesService {
  constructor(
    private readonly db: Db,
    private readonly access: CareAccessService,
    private readonly activity: ActivityService,
    private readonly auth: AuthService,
    @Inject(CONFIG) private readonly cfg: Config,
  ) {}

  async listMine(userId: string) {
    const r = await this.db.query(
      `SELECT f.id, f.name, fm.role FROM families f JOIN family_memberships fm ON fm.family_id = f.id WHERE fm.user_id = $1 ORDER BY f.name`,
      [userId],
    );
    return r.rows;
  }

  async listMembers(userId: string, familyId: string) {
    await this.access.requireFamily(userId, familyId, 'read');
    const r = await this.db.query(
      `SELECT u.id, u.display_name AS "displayName", u.email, fm.role
         FROM family_memberships fm JOIN users u ON u.id = fm.user_id WHERE fm.family_id = $1 ORDER BY u.display_name`,
      [familyId],
    );
    return r.rows;
  }

  /** Gibt den Einladungstoken einmalig zurück. Es wird nichts versendet, der Admin teilt den Link selbst. */
  async invite(userId: string, familyId: string, input: unknown) {
    await this.access.requireFamily(userId, familyId, 'admin');
    const d = parse(inviteSchema, input);
    const token = randomToken();
    const expires = new Date(Date.now() + this.cfg.inviteTtlDays * 86_400_000);
    const email = normalizeEmail(d.email);
    const r = await this.db.query<{ id: string }>(
      `INSERT INTO invitations (family_id, email, role, token_hash, invited_by, expires_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [familyId, email, d.role, sha256(token), userId, expires],
    );
    await this.activity.log({ familyId, entityType: 'invitation', entityId: r.rows[0].id, action: 'invitation.created', actorId: userId, changes: { role: d.role } });
    return { token, expiresAt: expires.toISOString() };
  }

  async changeRole(userId: string, familyId: string, targetUserId: string, input: unknown) {
    await this.access.requireFamily(userId, familyId, 'admin');
    uuidOr404(targetUserId);
    const d = parse(roleChangeSchema, input);
    await this.db.tx(async (c) => {
      const cur = await c.query<{ role: string }>('SELECT role FROM family_memberships WHERE family_id=$1 AND user_id=$2 FOR UPDATE', [familyId, targetUserId]);
      if (!cur.rows[0]) throw new NotFoundException();
      if (cur.rows[0].role === 'admin' && d.role !== 'admin') await this.assertNotLastAdmin(c, familyId);
      await c.query('UPDATE family_memberships SET role=$3, updated_at=now() WHERE family_id=$1 AND user_id=$2', [familyId, targetUserId, d.role]);
      await this.activity.log({ familyId, entityType: 'membership', entityId: targetUserId, action: 'membership.role_changed', actorId: userId, changes: { from: cur.rows[0].role, to: d.role } }, c);
    });
    return { ok: true };
  }

  /** Entzug wirkt sofort, weil jede Anfrage die Mitgliedschaft prüft. */
  async removeMember(userId: string, familyId: string, targetUserId: string) {
    await this.access.requireFamily(userId, familyId, 'admin');
    uuidOr404(targetUserId);
    await this.db.tx(async (c) => {
      const cur = await c.query<{ role: string }>('SELECT role FROM family_memberships WHERE family_id=$1 AND user_id=$2 FOR UPDATE', [familyId, targetUserId]);
      if (!cur.rows[0]) throw new NotFoundException();
      if (cur.rows[0].role === 'admin') await this.assertNotLastAdmin(c, familyId);
      await c.query('DELETE FROM care_recipient_permissions WHERE user_id=$1 AND care_recipient_id IN (SELECT id FROM care_recipients WHERE family_id=$2)', [targetUserId, familyId]);
      await c.query('DELETE FROM family_memberships WHERE family_id=$1 AND user_id=$2', [familyId, targetUserId]);
      await this.activity.log({ familyId, entityType: 'membership', entityId: targetUserId, action: 'membership.removed', actorId: userId }, c);
    });
  }

  private async assertNotLastAdmin(c: { query: Db['query'] }, familyId: string) {
    const r = await c.query<{ n: string }>(`SELECT count(*)::text AS n FROM family_memberships WHERE family_id=$1 AND role='admin'`, [familyId]);
    if (Number(r.rows[0].n) <= 1) throw new ConflictException('Der letzte Administrator kann nicht entfernt oder herabgestuft werden');
  }
}
