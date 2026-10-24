export type Role = 'admin' | 'member' | 'caregiver' | 'readonly';
export type Action = 'read' | 'write' | 'admin';

/**
 * Reine Berechtigungslogik (ohne Datenbank, daher einfach testbar).
 * - admin: alles
 * - member: lesen und schreiben
 * - caregiver / readonly: nur lesen, und nur mit ausdrücklicher Freigabe
 */
export function isAllowed(role: Role, hasExplicitGrant: boolean, action: Action): boolean {
  switch (role) {
    case 'admin':
      return true;
    case 'member':
      return action !== 'admin';
    case 'caregiver':
    case 'readonly':
      return hasExplicitGrant && action === 'read';
  }
}

/** Gibt es ohne Freigabe überhaupt Sichtbarkeit? Admins und Mitglieder sehen alle Betreuten der Familie. */
export function seesAllRecipients(role: Role): boolean {
  return role === 'admin' || role === 'member';
}
