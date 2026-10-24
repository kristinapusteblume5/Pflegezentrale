# Umsetzungsplan

Legende: ✅ umgesetzt und geprüft · 🟡 teilweise · ⬜ nicht begonnen

## Phase 1 – Konzept und Dokumentation
- ✅ README, Architektur, Datenmodell, Sicherheit, Datenschutz, Plan (Entwurf)
- ⬜ Entscheidung E2 (NestJS vs. Supabase) und E8 (Hoster) bestätigen

- ✅ Klickbarer Prototyp (`prototype/`) zur Abstimmung von Aufbau und Bedienung. Er ersetzt keine Umsetzung.

## Phase 2 – Fundament
| Paket | Inhalt | Stand |
|---|---|---|
| 2.1 | Monorepo, TypeScript-Konfiguration, Typecheck, Build | 🟡 (Lint fehlt, `packages/shared` leer, keine CI) |
| 2.2 | Datenbank, Migration 001 für Basistabellen (users, sessions, families, memberships, invitations, care_recipients, permissions, activity_events) | ✅ |
| 2.3 | Registrierung (abschaltbar), Login, Refresh-Rotation mit Wiederverwendungserkennung, Logout, Sitzungswiderruf, Rate-Limit | ✅ getestet |
| 2.4 | Familie, Einladung, Rollen, kontextgebundener Zugriffsschutz, Freigaben für Pflegepersonen | ✅ getestet |
| 2.5 | Aktivitätsprotokoll (append-only per Datenbank-Trigger) | ✅ getestet |
| 2.6 | Dateiablage: Upload, Versionen, geschützter Download | ⬜ |
| 2.7 | Mobile-Grundgerüst: Navigation, Login, Designsystem | ⬜ |
| 2.8 | Sicherheitstests für 2.3–2.5 | ✅ (für 2.6 noch offen) |

Nicht in 2.3 umgesetzt: Passwort-Zurücksetzen, optionale Zwei-Faktor-Anmeldung. Einladungslinks werden nicht per E-Mail versendet, der Administrator teilt den Token selbst.

Teststand (lokal, PostgreSQL 16): 42 Tests in 3 Suites bestanden, Typecheck und Build ohne Fehler. Die Mobile-App und die Dateiablage sind noch nicht vorhanden.

Abnahme Phase 2: Zwei Nutzer melden sich getrennt an, sehen gemeinsame Daten, Fremdzugriffe werden abgewiesen, Tests laufen grün.

## Phase 3 – Kernfunktionen (danach bereits nutzbar)
- Ärzte und Kontakte, Termine
- Diagnosen, Dokumente mit Verknüpfungen, Wiedervorlagen
- Pflegegrad, Pflegekasse, Anträge
- Pflegedienste, Leistungen, Verträge
- Aufgaben, Kanban, Kommentare, Verlauf
- Dashboard, Erinnerungen

## Phase 4 – Medikamente und Urlaub
- Medikamente, Bestand, Bedarfsberechnung (mit Warnungen bei fehlenden Daten)
- Reiseplanung, Urlaubsassistent
- E-Mail-Vorlagen und Entwürfe zum Kopieren, manueller Status
- Automatisch erzeugte Aufgaben

## Phase 5 – Qualität
- End-to-End-Test des Gesamtablaufs, Barrierefreiheit, Datenexport, Backup-Wiederherstellungstest

## Phase 6 – Bereitstellung
- Hosting verifizieren, Deployment dokumentieren, iOS- und Android-Builds, Prüfung offener Datenschutzpunkte

## Offene Entscheidungen
1. Backend: NestJS (Empfehlung) oder Supabase
2. Hoster
3. Dateigrößenlimit und Aufbewahrungsfristen
4. Klärung der Vollmacht und der Rechtsgrundlage (siehe `privacy.md`)
