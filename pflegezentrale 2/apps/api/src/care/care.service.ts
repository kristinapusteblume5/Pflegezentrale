import { Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { ActivityService } from '../activity/activity.service';
import { parse, uuidOr404 } from '../common/util';
import { seesAllRecipients, Role } from '../common/roles';
import { Db } from '../db/db.service';
import { CareAccessService } from './care-access.service';

export const createRecipientSchema = z.object({ displayName: z.string().trim().min(1).max(120), notes: z.string().max(5000).optional() });
export const updateRecipientSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  notes: z.string().max(5000).nullable().optional(),
});

@Injectable()
export class CareService {
  constructor(private readonly db: Db, private readonly access: CareAccessService, private readonly activity: ActivityService) {}

  async create(userId: string, familyId: string, input: unknown) {
    await this.access.requireFamily(userId, familyId, 'write');
    const d = parse(createRecipientSchema, input);
    return this.db.tx(async (c) => {
      const r = await c.query(
        `INSERT INTO care_recipients (family_id, display_name, notes, created_by, updated_by) VALUES ($1,$2,$3,$4,$4)
         RETURNING id, family_id AS "familyId", display_name AS "displayName", notes`,
        [familyId, d.displayName, d.notes ?? null, userId],
      );
      await this.activity.log({ careRecipientId: r.rows[0].id, familyId, entityType: 'care_recipient', entityId: r.rows[0].id, action: 'care_recipient.created', actorId: userId }, c);
      return r.rows[0];
    });
  }

  async listForFamily(userId: string, familyId: string) {
    const { role } = await this.access.requireFamily(userId, familyId, 'read');
    const all = seesAllRecipients(role as Role);
    const r = await this.db.query(
      `SELECT cr.id, cr.display_name AS "displayName"
         FROM care_recipients cr
        WHERE cr.family_id = $1 AND cr.deleted_at IS NULL
          AND ($3::boolean OR EXISTS (SELECT 1 FROM care_recipient_permissions p WHERE p.care_recipient_id = cr.id AND p.user_id = $2))
        ORDER BY cr.display_name`,
      [familyId, userId, all],
    );
    return r.rows;
  }

  async get(userId: string, id: string) {
    await this.access.requireRecipient(userId, id, 'read');
    const r = await this.db.query(
      `SELECT id, family_id AS "familyId", display_name AS "displayName", notes, updated_at AS "updatedAt" FROM care_recipients WHERE id = $1`,
      [id],
    );
    if (!r.rows[0]) throw new NotFoundException();
    return r.rows[0];
  }

  async update(userId: string, id: string, input: unknown) {
    const acc = await this.access.requireRecipient(userId, id, 'write');
    const d = parse(updateRecipientSchema, input);
    return this.db.tx(async (c) => {
      const before = await c.query<{ display_name: string; notes: string | null }>('SELECT display_name, notes FROM care_recipients WHERE id=$1 FOR UPDATE', [id]);
      const b = before.rows[0];
      const name = d.displayName ?? b.display_name;
      const notes = d.notes === undefined ? b.notes : d.notes;
      const r = await c.query(
        `UPDATE care_recipients SET display_name=$2, notes=$3, updated_by=$4, updated_at=now() WHERE id=$1
         RETURNING id, family_id AS "familyId", display_name AS "displayName", notes`,
        [id, name, notes, userId],
      );
      await this.activity.log(
        { careRecipientId: id, familyId: acc.familyId, entityType: 'care_recipient', entityId: id, action: 'care_recipient.updated', actorId: userId,
          changes: { before: { displayName: b.display_name, notes: b.notes }, after: { displayName: name, notes } } },
        c,
      );
      return r.rows[0];
    });
  }

  async grant(userId: string, id: string, targetUserId: string) {
    const acc = await this.access.requireRecipient(userId, id, 'admin');
    uuidOr404(targetUserId);
    const m = await this.db.query('SELECT 1 FROM family_memberships WHERE family_id=$1 AND user_id=$2', [acc.familyId, targetUserId]);
    if (!m.rowCount) throw new NotFoundException();
    await this.db.tx(async (c) => {
      await c.query(
        'INSERT INTO care_recipient_permissions (care_recipient_id, user_id, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [id, targetUserId, userId],
      );
      await this.activity.log({ careRecipientId: id, familyId: acc.familyId, entityType: 'permission', entityId: targetUserId, action: 'permission.granted', actorId: userId }, c);
    });
  }

  async revoke(userId: string, id: string, targetUserId: string) {
    const acc = await this.access.requireRecipient(userId, id, 'admin');
    uuidOr404(targetUserId);
    await this.db.tx(async (c) => {
      await c.query('DELETE FROM care_recipient_permissions WHERE care_recipient_id=$1 AND user_id=$2', [id, targetUserId]);
      await this.activity.log({ careRecipientId: id, familyId: acc.familyId, entityType: 'permission', entityId: targetUserId, action: 'permission.revoked', actorId: userId }, c);
    });
  }

  async activityFor(userId: string, id: string, limit = 50) {
    await this.access.requireRecipient(userId, id, 'read');
    const r = await this.db.query(
      `SELECT e.id, e.entity_type AS "entityType", e.entity_id AS "entityId", e.action, e.occurred_at AS "occurredAt", e.result,
              e.changes, u.display_name AS "actorName"
         FROM activity_events e LEFT JOIN users u ON u.id = e.actor_id
        WHERE e.care_recipient_id = $1 ORDER BY e.occurred_at DESC, e.id LIMIT $2`,
      [id, Math.min(Math.max(limit, 1), 200)],
    );
    return r.rows;
  }
}
