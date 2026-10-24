import { INestApplication } from '@nestjs/common';
import { Pool } from 'pg';
import request from 'supertest';
import { auth, register, resetDb, startApp } from './helpers';

describe('Authentifizierung', () => {
  let app: INestApplication;
  let pool: Pool;

  beforeAll(async () => {
    pool = await resetDb();
    app = await startApp();
  });
  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('lehnt Registrierung ab, wenn sie deaktiviert ist', async () => {
    const closed = await startApp({ allowRegistration: false });
    await request(closed.getHttpServer())
      .post('/auth/register')
      .send({ email: 'x@example.test', password: 'sehr-sicheres-passwort-1', displayName: 'X', familyName: 'F' })
      .expect(403);
    await closed.close();
  });

  it('registriert, speichert Passwort nur als Hash und erlaubt Login', async () => {
    await register(app, 'anna@example.test', 'Anna');
    const row = (await pool.query("SELECT password_hash FROM users WHERE email='anna@example.test'")).rows[0];
    expect(row.password_hash).toMatch(/^\$argon2id\$/);
    const r = await request(app.getHttpServer()).post('/auth/login').send({ email: 'ANNA@example.test', password: 'sehr-sicheres-passwort-1' }).expect(200);
    expect(r.body.accessToken).toBeDefined();
  });

  it('weist schwache Passwörter und doppelte E-Mail ab', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({ email: 'b@example.test', password: 'kurz', displayName: 'B', familyName: 'F' }).expect(400);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'anna@example.test', password: 'sehr-sicheres-passwort-1', displayName: 'A2', familyName: 'F' })
      .expect(409);
  });

  it('antwortet bei falschem Passwort und unbekannter Adresse gleich', async () => {
    const a = await request(app.getHttpServer()).post('/auth/login').send({ email: 'anna@example.test', password: 'falsch-falsch-falsch' }).expect(401);
    const b = await request(app.getHttpServer()).post('/auth/login').send({ email: 'niemand@example.test', password: 'falsch-falsch-falsch' }).expect(401);
    expect(a.body.message).toEqual(b.body.message);
  });

  it('schützt Endpunkte ohne oder mit manipuliertem Token', async () => {
    await request(app.getHttpServer()).get('/families').expect(401);
    await request(app.getHttpServer()).get('/families').set(auth('abc.def.ghi')).expect(401);
  });

  it('rotiert Refresh-Tokens und sperrt die Sitzung bei Wiederverwendung', async () => {
    const t = await register(app, 'rot@example.test', 'Rot');
    const r1 = await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: t.refreshToken }).expect(200);
    expect(r1.body.refreshToken).not.toEqual(t.refreshToken);
    // altes Token erneut verwenden: Wiederverwendung erkannt
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: t.refreshToken }).expect(401);
    // auch das neue Token und das Access-Token sind jetzt wirkungslos
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: r1.body.refreshToken }).expect(401);
    await request(app.getHttpServer()).get('/families').set(auth(r1.body)).expect(401);
  });

  it('beendet die Sitzung beim Logout sofort', async () => {
    const t = await register(app, 'logout@example.test', 'Logout');
    await request(app.getHttpServer()).get('/families').set(auth(t)).expect(200);
    await request(app.getHttpServer()).post('/auth/logout').set(auth(t)).expect(204);
    await request(app.getHttpServer()).get('/families').set(auth(t)).expect(401);
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: t.refreshToken }).expect(401);
  });

  it('lehnt Refresh mit ungültiger oder fremder Sitzungs-ID ab', async () => {
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: 'nicht-uuid.geheim-geheim' }).expect(401);
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: '3f2b8c1e-9a4d-4b7e-8c1d-2a3b4c5d6e7f.geheim-geheim' }).expect(401);
  });

  it('sperrt Konten bei deaktiviertem Nutzer sofort', async () => {
    const t = await register(app, 'weg@example.test', 'Weg');
    await pool.query("UPDATE users SET disabled_at = now() WHERE email='weg@example.test'");
    await request(app.getHttpServer()).get('/families').set(auth(t)).expect(401);
    await request(app.getHttpServer()).post('/auth/login').send({ email: 'weg@example.test', password: 'sehr-sicheres-passwort-1' }).expect(401);
  });

  it('begrenzt wiederholte Fehlversuche', async () => {
    await register(app, 'limit@example.test', 'Limit');
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).post('/auth/login').send({ email: 'limit@example.test', password: 'falsch-falsch-falsch' }).expect(401);
    }
    await request(app.getHttpServer()).post('/auth/login').send({ email: 'limit@example.test', password: 'sehr-sicheres-passwort-1' }).expect(429);
  });
});
