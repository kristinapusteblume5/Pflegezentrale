# Sicherheitskonzept

Status: Entwurf. Die Maßnahmen sind **geplant**, nicht umgesetzt oder geprüft. Der Umsetzungsstand wird in `docs/implementation-plan.md` geführt.

Schutzniveau: sensibel (Gesundheitsdaten), pragmatisch für eine kleine Familienanwendung.

## 1. Berechtigungsmodell

- Rollen je Familie: `admin`, `member`, `caregiver` (nur ausdrücklich freigegebene Bereiche), `readonly`.
- Zugriff auf Fachdaten nur über Mitgliedschaft in der Familie der betreuten Person.
- **Kernregel gegen IDOR:** Kein Repository liefert Fachdaten anhand einer ID allein. Jede Abfrage enthält zusätzlich `care_recipient_id` des geprüften Kontexts. Ein Datensatz eines anderen Kontexts verhält sich wie „nicht gefunden“ (404).
- Rollenänderungen und Einladungen nur durch `admin`. Der letzte Admin kann sich nicht selbst entfernen.
- Entzug eines Nutzers widerruft alle Sitzungen und Refresh-Tokens sofort.

## 2. Authentifizierung und Sitzungen

- Argon2id für Passwörter, Mindestlänge, Prüfung auf häufige Passwörter.
- Kurzlebiges Access-Token (Minuten), rotierendes Refresh-Token mit Widerruf, Speicherung als Hash.
- Wiederverwendung eines alten Refresh-Tokens widerruft die ganze Sitzungskette.
- Optional TOTP, für Admins dringend empfohlen.
- Passwort-Zurücksetzen mit einmaligem Token und kurzer Gültigkeit. Antwort verrät nicht, ob eine E-Mail existiert.
- Rate-Limiting auf Login, Passwort-Reset und Einladungen.

## 3. Dateien

- Privater Speicher, keine öffentlichen URLs.
- Downloads nur nach Rechteprüfung, über kurzlebige signierte URLs oder per Streaming durch die API.
- Upload: Allowlist (PDF, JPEG, PNG, HEIC), Größenlimit, Prüfung der Dateiinhalte statt nur der Endung, zufällige Speicherschlüssel (keine Originaldateinamen im Pfad).
- Kein Malware-Scan in der ersten Version (bekannte Einschränkung).

## 4. Daten und Übertragung

- TLS für alle Verbindungen. Verschlüsselung im Ruhezustand bei Datenbank, Objektspeicher und Backups (Nachweis beim Anbieter zu prüfen).
- Secrets nur in Umgebungsvariablen/Secret-Store. Keine Zugangsdaten in der App.
- Sitzungstoken in Expo SecureStore. Keine Gesundheitsdaten in lokalem Speicher, Dokumente nicht dauerhaft auf dem Gerät.
- Push-Nachrichten ohne medizinische Inhalte.

## 5. Protokollierung

- `activity_events` (fachlich, append-only, für Nutzer sichtbar) und technisches Log (ohne Passwörter, Tokens, Dokumentinhalte, ohne unnötige Gesundheitsdaten).
- Sicherheitsereignisse: Login-Fehlschläge, Rollenänderungen, Einladungen, Sitzungswiderruf.

## 6. Bedrohungen und Gegenmaßnahmen

| Bedrohung | Maßnahme |
|---|---|
| Zugriff auf fremde Datensätze per ID | Kontextgebundene Abfragen, Tests |
| Gestohlenes Gerät | Kurzlebige Tokens, Sitzungswiderruf, geräteeigene Sperre |
| Passwortdiebstahl | Argon2id, Rate-Limiting, optional TOTP |
| Manipulierte Uploads | Allowlist, Inhaltsprüfung, Größenlimit |
| Ausgeschiedene Person behält Zugriff | Sofortiger Entzug inkl. Sitzungen |
| Verlust der Daten | Automatische Backups, dokumentierte Wiederherstellung |
| Versehentliches Überschreiben | Versionierung, Soft-Delete, Protokoll |

## 7. Sicherheitstests (Pflicht ab Phase 2)

- Nutzer aus Familie B greift auf Daten von Familie A zu (alle Endpunkte).
- Manipulierte IDs in Pfad und Body.
- Dateizugriff ohne Recht, mit abgelaufenem Link.
- Rollenerhöhung durch Nicht-Admin.
- Zugriff mit entzogener Sitzung.
- Ungültige und manipulierte Uploads.

## 8. Backups

Automatische, verschlüsselte Datenbank- und Dateisicherung beim Hoster. Wiederherstellung wird einmal real getestet und das Ergebnis dokumentiert, bevor echte Daten verwendet werden. Bis dahin gilt: **nicht als nachgewiesen**.
