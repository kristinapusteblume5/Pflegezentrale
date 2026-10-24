import { Injectable } from '@nestjs/common';
import { Db, Queryable } from '../db/db.service';

export interface ActivityInput {
  careRecipientId?: string | null;
  familyId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  actorId?: string | null;
  changes?: unknown;
  result?: string;
}

@Injectable()
export class ActivityService {
  constructor(private readonly db: Db) {}

  /** Optional innerhalb einer Transaktion (client), damit Änderung und Protokoll zusammen gelten. */
  async log(e: ActivityInput, client?: Queryable): Promise<void> {
    const run = (text: string, params: unknown[]) => (client ? client.query(text, params) : this.db.query(text, params));
    await run(
      `INSERT INTO activity_events (care_recipient_id, family_id, entity_type, entity_id, action, actor_id, changes, result)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        e.careRecipientId ?? null,
        e.familyId ?? null,
        e.entityType,
        e.entityId ?? null,
        e.action,
        e.actorId ?? null,
        e.changes === undefined ? null : JSON.stringify(e.changes),
        e.result ?? 'ok',
      ],
    );
  }
}
