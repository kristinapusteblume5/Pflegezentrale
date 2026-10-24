import { Pool } from 'pg';
import { migrate } from './migrate';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL fehlt');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const applied = await migrate(pool);
    console.log(applied.length ? `Angewendet: ${applied.join(', ')}` : 'Keine neuen Migrationen');
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
