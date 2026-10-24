import { INestApplication } from '@nestjs/common';
import { Pool } from 'pg';
import request from 'supertest';
import { createApp } from '../src/app';
import { Config } from '../src/config';
import { migrate } from '../src/db/migrate';

export const TEST_DB = process.env.DATABASE_URL ?? 'postgres://pflege:pflege_dev@localhost:5432/pflege_test';

export function testConfig(over: Partial<Config> = {}): Config {
  return {
    databaseUrl: TEST_DB,
    jwtSecret: 'test-secret-test-secret-test-secret-123456',
    accessTtlSeconds: 900,
    refreshTtlDays: 30,
    allowRegistration: true,
    inviteTtlDays: 7,
    loginMaxAttempts: 5,
    loginWindowMs: 60_000,
    ...over,
  };
}

export async function resetDb(): Promise<Pool> {
  const pool = new Pool({ connectionString: TEST_DB });
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await migrate(pool);
  return pool;
}

export async function startApp(over: Partial<Config> = {}): Promise<INestApplication> {
  const app = await createApp(testConfig(over), { logger: false });
  await app.init();
  return app;
}

export interface Tokens { accessToken: string; refreshToken: string }

export async function register(app: INestApplication, email: string, name = 'Test Person', family = 'Familie Test'): Promise<Tokens> {
  const r = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password: 'sehr-sicheres-passwort-1', displayName: name, familyName: family })
    .expect(201);
  return r.body;
}

export const auth = (t: Tokens | string) => ({ Authorization: `Bearer ${typeof t === 'string' ? t : t.accessToken}` });

export async function firstFamily(app: INestApplication, t: Tokens): Promise<{ id: string; role: string }> {
  const r = await request(app.getHttpServer()).get('/families').set(auth(t)).expect(200);
  return r.body[0];
}

export async function userId(pool: Pool, email: string): Promise<string> {
  return (await pool.query('SELECT id FROM users WHERE email=$1', [email])).rows[0].id;
}

/** Einladung erzeugen und als neuer Nutzer annehmen. */
export async function inviteAndJoin(app: INestApplication, adminTokens: Tokens, familyId: string, email: string, role: string): Promise<Tokens> {
  const inv = await request(app.getHttpServer()).post(`/families/${familyId}/invitations`).set(auth(adminTokens)).send({ email, role }).expect(201);
  const acc = await request(app.getHttpServer())
    .post('/auth/accept-invite')
    .send({ token: inv.body.token, password: 'noch-ein-sicheres-passwort', displayName: `Mitglied ${role}` })
    .expect(201);
  return acc.body;
}
