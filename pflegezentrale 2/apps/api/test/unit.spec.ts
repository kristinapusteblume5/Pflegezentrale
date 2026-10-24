import { isAllowed, seesAllRecipients } from '../src/common/roles';
import { isUuid, normalizeEmail, safeEqualHex, sha256, uuidOr404 } from '../src/common/util';
import { RateLimiter } from '../src/auth/rate-limiter';
import { loadConfig } from '../src/config';

describe('Berechtigungslogik', () => {
  it('admin darf alles', () => {
    for (const a of ['read', 'write', 'admin'] as const) expect(isAllowed('admin', false, a)).toBe(true);
  });
  it('member darf lesen und schreiben, aber nicht verwalten', () => {
    expect(isAllowed('member', false, 'read')).toBe(true);
    expect(isAllowed('member', false, 'write')).toBe(true);
    expect(isAllowed('member', false, 'admin')).toBe(false);
  });
  it('readonly und caregiver nur mit Freigabe und nur lesend', () => {
    for (const role of ['readonly', 'caregiver'] as const) {
      expect(isAllowed(role, false, 'read')).toBe(false);
      expect(isAllowed(role, true, 'read')).toBe(true);
      expect(isAllowed(role, true, 'write')).toBe(false);
      expect(isAllowed(role, true, 'admin')).toBe(false);
    }
  });
  it('nur admin und member sehen alle Betreuten', () => {
    expect(seesAllRecipients('admin')).toBe(true);
    expect(seesAllRecipients('member')).toBe(true);
    expect(seesAllRecipients('caregiver')).toBe(false);
    expect(seesAllRecipients('readonly')).toBe(false);
  });
});

describe('Hilfsfunktionen', () => {
  it('erkennt UUIDs', () => {
    expect(isUuid('3f2b8c1e-9a4d-4b7e-8c1d-2a3b4c5d6e7f')).toBe(true);
    expect(isUuid('1; DROP TABLE users')).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
  it('uuidOr404 wirft bei ungültiger ID', () => {
    expect(() => uuidOr404('abc')).toThrow();
  });
  it('normalisiert E-Mail', () => {
    expect(normalizeEmail('  Max@Example.DE ')).toBe('max@example.de');
  });
  it('vergleicht Hashes konstant und korrekt', () => {
    expect(safeEqualHex(sha256('a'), sha256('a'))).toBe(true);
    expect(safeEqualHex(sha256('a'), sha256('b'))).toBe(false);
    expect(safeEqualHex('zz', sha256('a'))).toBe(false);
  });
});

describe('RateLimiter', () => {
  it('sperrt nach max Versuchen und gibt nach Ablauf des Fensters frei', () => {
    const l = new RateLimiter();
    for (let i = 0; i < 3; i++) l.record('k', 1000);
    expect(l.tooMany('k', 3, 60_000, 2000)).toBe(true);
    expect(l.tooMany('k', 3, 60_000, 1000 + 60_001)).toBe(false);
  });
  it('reset hebt die Sperre auf', () => {
    const l = new RateLimiter();
    l.record('k'); l.record('k');
    l.reset('k');
    expect(l.tooMany('k', 2, 60_000)).toBe(false);
  });
});

describe('Konfiguration', () => {
  it('verlangt ein ausreichend langes JWT_SECRET', () => {
    expect(() => loadConfig({ DATABASE_URL: 'x', JWT_SECRET: 'kurz' })).toThrow(/JWT_SECRET/);
  });
  it('verlangt DATABASE_URL', () => {
    expect(() => loadConfig({ JWT_SECRET: 'x'.repeat(40) })).toThrow(/DATABASE_URL/);
  });
  it('Registrierung ist standardmäßig aus', () => {
    expect(loadConfig({ DATABASE_URL: 'x', JWT_SECRET: 'x'.repeat(40) }).allowRegistration).toBe(false);
  });
});
