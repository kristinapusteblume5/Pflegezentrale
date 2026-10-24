import { INestApplication } from '@nestjs/common';
import { Pool } from 'pg';
import request from 'supertest';
import { auth, firstFamily, inviteAndJoin, register, resetDb, startApp, Tokens, userId } from './helpers';

describe('Familien, Rollen und Zugriffsschutz', () => {
  let app: INestApplication;
  let pool: Pool;
  const http = () => request(app.getHttpServer());

  let anna: Tokens, ben: Tokens, eve: Tokens;
  let familyA: string, recipientA: string;

  beforeAll(async () => {
    pool = await resetDb();
    app = await startApp();
    anna = await register(app, 'anna@example.test', 'Anna', 'Familie A');
    familyA = (await firstFamily(app, anna)).id;
    recipientA = (await http().post(`/families/${familyA}/care-recipients`).set(auth(anna)).send({ displayName: 'Testperson Eins' }).expect(201)).body.id;
    ben = await inviteAndJoin(app, anna, familyA, 'ben@example.test', 'member');
    // Eve ist in einer völlig anderen Familie
    eve = await register(app, 'eve@example.test', 'Eve', 'Familie E');
  });
  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  describe('Zusammenarbeit', () => {
    it('beide Nutzer sehen dieselben Daten und Änderungen sind sichtbar und protokolliert', async () => {
      const r1 = await http().get(`/care-recipients/${recipientA}`).set(auth(ben)).expect(200);
      expect(r1.body.displayName).toBe('Testperson Eins');
      await http().patch(`/care-recipients/${recipientA}`).set(auth(ben)).send({ notes: 'Synthetische Notiz' }).expect(200);
      const r2 = await http().get(`/care-recipients/${recipientA}`).set(auth(anna)).expect(200);
      expect(r2.body.notes).toBe('Synthetische Notiz');
      const log = await http().get(`/care-recipients/${recipientA}/activity`).set(auth(anna)).expect(200);
      const upd = log.body.find((e: { action: string }) => e.action === 'care_recipient.updated');
      expect(upd.actorName).toBe('Mitglied member');
      expect(upd.changes.before.notes).toBeNull();
      expect(upd.changes.after.notes).toBe('Synthetische Notiz');
    });

    it('listet Mitglieder und Betreute der Familie', async () => {
      const m = await http().get(`/families/${familyA}/members`).set(auth(ben)).expect(200);
      expect(m.body.map((x: { role: string }) => x.role).sort()).toEqual(['admin', 'member']);
      const l = await http().get(`/families/${familyA}/care-recipients`).set(auth(ben)).expect(200);
      expect(l.body).toHaveLength(1);
    });
  });

  describe('Fremdzugriff (IDOR)', () => {
    it('Nutzer einer anderen Familie erhält 404 auf alle Ressourcen', async () => {
      await http().get(`/care-recipients/${recipientA}`).set(auth(eve)).expect(404);
      await http().patch(`/care-recipients/${recipientA}`).set(auth(eve)).send({ displayName: 'Gehackt' }).expect(404);
      await http().get(`/care-recipients/${recipientA}/activity`).set(auth(eve)).expect(404);
      await http().get(`/families/${familyA}/members`).set(auth(eve)).expect(404);
      await http().get(`/families/${familyA}/care-recipients`).set(auth(eve)).expect(404);
      await http().post(`/families/${familyA}/care-recipients`).set(auth(eve)).send({ displayName: 'X' }).expect(404);
      await http().post(`/families/${familyA}/invitations`).set(auth(eve)).send({ email: 'eve2@example.test', role: 'admin' }).expect(404);
      await http().put(`/care-recipients/${recipientA}/permissions/${await userId(pool, 'eve@example.test')}`).set(auth(eve)).expect(404);
    });

    it('Daten bleiben unverändert nach Angriffsversuchen', async () => {
      const r = await http().get(`/care-recipients/${recipientA}`).set(auth(anna)).expect(200);
      expect(r.body.displayName).toBe('Testperson Eins');
    });

    it('manipulierte oder ungültige IDs liefern 404 statt Fehler', async () => {
      await http().get('/care-recipients/1;DROP TABLE users').set(auth(anna)).expect(404);
      await http().get('/care-recipients/00000000-0000-0000-0000-000000000000').set(auth(anna)).expect(404);
      await http().get('/families/nicht-uuid/members').set(auth(anna)).expect(404);
    });

    it('Eve kann sich nicht selbst per Einladungstoken in fremde Rolle heben', async () => {
      await http().post('/auth/accept-invite/existing').set(auth(eve)).send({ token: 'erfunden-erfunden-erfunden' }).expect(404);
    });
  });

  describe('Rollen', () => {
    it('Mitglied (member) darf nicht verwalten', async () => {
      const annaId = await userId(pool, 'anna@example.test');
      await http().post(`/families/${familyA}/invitations`).set(auth(ben)).send({ email: 'x@example.test', role: 'member' }).expect(403);
      await http().put(`/families/${familyA}/members/${annaId}/role`).set(auth(ben)).send({ role: 'readonly' }).expect(403);
      await http().delete(`/families/${familyA}/members/${annaId}`).set(auth(ben)).expect(403);
    });

    it('readonly und caregiver: ohne Freigabe unsichtbar, mit Freigabe nur lesbar', async () => {
      const ro = await inviteAndJoin(app, anna, familyA, 'ro@example.test', 'readonly');
      const cg = await inviteAndJoin(app, anna, familyA, 'cg@example.test', 'caregiver');
      for (const t of [ro, cg]) {
        await http().get(`/care-recipients/${recipientA}`).set(auth(t)).expect(404);
        expect((await http().get(`/families/${familyA}/care-recipients`).set(auth(t)).expect(200)).body).toHaveLength(0);
      }
      const cgId = await userId(pool, 'cg@example.test');
      await http().put(`/care-recipients/${recipientA}/permissions/${cgId}`).set(auth(anna)).expect(204);
      await http().get(`/care-recipients/${recipientA}`).set(auth(cg)).expect(200);
      expect((await http().get(`/families/${familyA}/care-recipients`).set(auth(cg)).expect(200)).body).toHaveLength(1);
      await http().patch(`/care-recipients/${recipientA}`).set(auth(cg)).send({ notes: 'nein' }).expect(403);
      await http().post(`/families/${familyA}/care-recipients`).set(auth(cg)).send({ displayName: 'nein' }).expect(403);
      // readonly ohne Freigabe bleibt ausgesperrt
      await http().get(`/care-recipients/${recipientA}`).set(auth(ro)).expect(404);
      // Freigabe entziehen wirkt sofort
      await http().delete(`/care-recipients/${recipientA}/permissions/${cgId}`).set(auth(anna)).expect(204);
      await http().get(`/care-recipients/${recipientA}`).set(auth(cg)).expect(404);
    });

    it('nur Administratoren vergeben Freigaben', async () => {
      const cgId = await userId(pool, 'cg@example.test');
      await http().put(`/care-recipients/${recipientA}/permissions/${cgId}`).set(auth(ben)).expect(403);
    });

    it('Freigabe nur für Mitglieder derselben Familie', async () => {
      const eveId = await userId(pool, 'eve@example.test');
      await http().put(`/care-recipients/${recipientA}/permissions/${eveId}`).set(auth(anna)).expect(404);
    });

    it('der letzte Administrator kann nicht entfernt oder herabgestuft werden', async () => {
      const annaId = await userId(pool, 'anna@example.test');
      await http().put(`/families/${familyA}/members/${annaId}/role`).set(auth(anna)).send({ role: 'member' }).expect(409);
      await http().delete(`/families/${familyA}/members/${annaId}`).set(auth(anna)).expect(409);
    });

    it('Rollenänderung wirkt sofort und wird protokolliert', async () => {
      const benId = await userId(pool, 'ben@example.test');
      await http().put(`/families/${familyA}/members/${benId}/role`).set(auth(anna)).send({ role: 'admin' }).expect(200);
      await http().post(`/families/${familyA}/invitations`).set(auth(ben)).send({ email: 'neu@example.test', role: 'member' }).expect(201);
      await http().put(`/families/${familyA}/members/${benId}/role`).set(auth(anna)).send({ role: 'member' }).expect(200);
      await http().post(`/families/${familyA}/invitations`).set(auth(ben)).send({ email: 'neu2@example.test', role: 'member' }).expect(403);
      const ev = await pool.query("SELECT changes FROM activity_events WHERE action='membership.role_changed' ORDER BY occurred_at");
      expect(ev.rows.map((r) => r.changes.to)).toEqual(['admin', 'member']);
    });
  });

  describe('Entzug', () => {
    it('entfernte Mitglieder verlieren sofort den Zugriff mit demselben Token', async () => {
      const tmp = await inviteAndJoin(app, anna, familyA, 'tmp@example.test', 'member');
      await http().get(`/care-recipients/${recipientA}`).set(auth(tmp)).expect(200);
      await http().delete(`/families/${familyA}/members/${await userId(pool, 'tmp@example.test')}`).set(auth(anna)).expect(204);
      await http().get(`/care-recipients/${recipientA}`).set(auth(tmp)).expect(404);
      await http().get(`/families/${familyA}/members`).set(auth(tmp)).expect(404);
    });
  });

  describe('Einladungen', () => {
    it('Token ist nur einmal verwendbar und wird nur als Hash gespeichert', async () => {
      const inv = await http().post(`/families/${familyA}/invitations`).set(auth(anna)).send({ email: 'once@example.test', role: 'member' }).expect(201);
      const stored = await pool.query("SELECT token_hash FROM invitations WHERE email='once@example.test'");
      expect(stored.rows[0].token_hash).not.toContain(inv.body.token);
      const body = { token: inv.body.token, password: 'noch-ein-sicheres-passwort', displayName: 'Once' };
      await http().post('/auth/accept-invite').send(body).expect(201);
      await http().post('/auth/accept-invite').send(body).expect(404);
    });

    it('abgelaufene Einladungen werden abgelehnt', async () => {
      const inv = await http().post(`/families/${familyA}/invitations`).set(auth(anna)).send({ email: 'late@example.test', role: 'member' }).expect(201);
      await pool.query("UPDATE invitations SET expires_at = now() - interval '1 minute' WHERE email='late@example.test'");
      await http().post('/auth/accept-invite').send({ token: inv.body.token, password: 'noch-ein-sicheres-passwort', displayName: 'Late' }).expect(404);
    });

    it('bestehendes Konto kann nur eine Einladung für die eigene Adresse annehmen', async () => {
      const inv = await http().post(`/families/${familyA}/invitations`).set(auth(anna)).send({ email: 'eve@example.test', role: 'readonly' }).expect(201);
      const mallory = await register(app, 'mallory@example.test', 'Mallory', 'Familie M');
      await http().post('/auth/accept-invite/existing').set(auth(mallory)).send({ token: inv.body.token }).expect(403);
    });

    it('bestehendes Konto nimmt Einladung per Anmeldung an', async () => {
      const inv = await http().post(`/families/${familyA}/invitations`).set(auth(anna)).send({ email: 'eve@example.test', role: 'member' }).expect(201);
      // der Token aus dem obigen Test wurde durch den Fehlversuch nicht verbraucht? (Rollback), dieser hier ist frisch
      await http().post('/auth/accept-invite/existing').set(auth(eve)).send({ token: inv.body.token }).expect(200);
      const fams = await http().get('/families').set(auth(eve)).expect(200);
      expect(fams.body).toHaveLength(2);
      await http().get(`/care-recipients/${recipientA}`).set(auth(eve)).expect(200);
    });
  });

  describe('Aktivitätsprotokoll', () => {
    it('ist append-only: Ändern, Löschen und Leeren sind gesperrt', async () => {
      await expect(pool.query("UPDATE activity_events SET action='x'")).rejects.toThrow(/append-only/);
      await expect(pool.query('DELETE FROM activity_events')).rejects.toThrow(/append-only/);
      await expect(pool.query('TRUNCATE activity_events')).rejects.toThrow(/append-only/);
    });

    it('enthält keine Passwörter oder Tokens', async () => {
      const all = JSON.stringify((await pool.query('SELECT * FROM activity_events')).rows);
      expect(all).not.toMatch(/argon2|passwort|refresh|accessToken/i);
    });
  });
});
