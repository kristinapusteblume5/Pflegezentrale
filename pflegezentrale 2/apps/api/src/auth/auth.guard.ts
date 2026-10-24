import { CanActivate, createParamDecorator, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Db } from '../db/db.service';
import { AuthService } from './auth.service';

export interface AuthUser {
  id: string;
  sessionId: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly db: Db) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException();
    const claims = this.auth.verifyAccess(header.slice(7));
    // Sitzung bei jeder Anfrage prüfen, damit Entzug sofort wirkt.
    const r = await this.db.query(
      `SELECT 1 FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.id = $1 AND s.user_id = $2 AND s.revoked_at IS NULL AND s.expires_at > now() AND u.disabled_at IS NULL`,
      [claims.sid, claims.sub],
    );
    if (!r.rowCount) throw new UnauthorizedException();
    req.user = { id: claims.sub, sessionId: claims.sid } satisfies AuthUser;
    return true;
  }
}

export const CurrentUser = createParamDecorator((_d: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user);
