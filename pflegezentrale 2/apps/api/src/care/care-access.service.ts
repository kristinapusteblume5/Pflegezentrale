import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Action, isAllowed, Role, seesAllRecipients } from '../common/roles';
import { uuidOr404 } from '../common/util';
import { Db } from '../db/db.service';

export interface FamilyAccess {
  familyId: string;
  role: Role;
}
export interface CareAccess extends FamilyAccess {
  careRecipientId: string;
}

/**
 * Zentrale Zugriffsprüfung. Kein Fachdatenzugriff ohne diese Prüfung.
 * Nicht-Mitglieder erhalten 404 (keine Information über Existenz),
 * Mitglieder mit zu geringer Rolle erhalten 403.
 */
@Injectable()
export class CareAccessService {
  constructor(private readonly db: Db) {}

  async requireFamily(userId: string, familyId: string, action: Action): Promise<FamilyAccess> {
    uuidOr404(familyId);
    const r = await this.db.query<{ role: Role }>('SELECT role FROM family_memberships WHERE family_id=$1 AND user_id=$2', [familyId, userId]);
    const role = r.rows[0]?.role;
    if (!role) throw new NotFoundException();
    // Familienverwaltung: lesen darf jedes Mitglied, schreiben admin/member, verwalten nur admin.
    const allowed =
      action === 'read' ||
      (action === 'write' && (role === 'admin' || role === 'member')) ||
      (action === 'admin' && role === 'admin');
    if (!allowed) throw new ForbiddenException();
    return { familyId, role };
  }

  async requireRecipient(userId: string, careRecipientId: string, action: Action): Promise<CareAccess> {
    uuidOr404(careRecipientId);
    const r = await this.db.query<{ family_id: string; role: Role; granted: boolean }>(
      `SELECT cr.family_id, fm.role,
              EXISTS (SELECT 1 FROM care_recipient_permissions p WHERE p.care_recipient_id = cr.id AND p.user_id = fm.user_id) AS granted
         FROM care_recipients cr
         JOIN family_memberships fm ON fm.family_id = cr.family_id AND fm.user_id = $1
        WHERE cr.id = $2 AND cr.deleted_at IS NULL`,
      [userId, careRecipientId],
    );
    const row = r.rows[0];
    if (!row) throw new NotFoundException();
    if (!seesAllRecipients(row.role) && !row.granted) throw new NotFoundException();
    if (!isAllowed(row.role, row.granted, action)) throw new ForbiddenException();
    return { familyId: row.family_id, role: row.role, careRecipientId };
  }
}
