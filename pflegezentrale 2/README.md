# Pflegezentrale

Gemeinsame Organisations-App für zwei (später mehr) Angehörige, um Arztkontakte, Dokumente, Pflegeorganisation, Medikamente, Reisen und Aufgaben rund um eine betreute Person zentral zu verwalten.

## Status

- **Phase 1** (Konzept und Dokumentation): als Entwurf abgeschlossen.
- **Phase 2** (Fundament): **teilweise.** Das Backend (`apps/api`) hat Login, Sitzungen, Familien, Einladungen, Rollen, Freigaben und ein Aktivitätsprotokoll. Dafür laufen 42 automatisierte Tests lokal erfolgreich.
- **Noch nicht vorhanden:** Mobile-App, Dateiablage, alle Fachbereiche (Ärzte, Diagnosen, Aufgaben, Medikamente, Urlaubsassistent), Passwort-Zurücksetzen, Zwei-Faktor-Anmeldung, Deployment.

Nichts davon ist produktionsbereit oder mit echten Daten erprobt. Es gab zu Beginn kein bestehendes Repository (Greenfield).

## Klickbarer Prototyp

`prototype/pflegezentrale-prototyp.html` ist eine einzelne HTML-Datei, die du im Browser öffnest. Sie zeigt Aufbau und Bedienung mit **Beispieldaten**, ist nicht mit dem Backend verbunden und speichert nichts (Neuladen setzt alles zurück). Enthalten sind Start, Aufgaben, Termine mit Turnus und Erinnerungen, Kontakte, Diagnosen, Urlaubsassistent mit E-Mail-Entwürfen und Einstellungen.

## Festgelegte Rahmenbedingungen

| Thema | Entscheidung |
|---|---|
| Nutzer | Zwei gleichberechtigte Nutzer, Erweiterung auf weitere Personen vorgesehen |
| Betreute Personen | Oberfläche zunächst für eine Person, Datenmodell von Anfang an mandantenfähig |
| Schutzniveau | Sensibel (Gesundheitsdaten), aber kein Krankenhaus-Standard |
| Rechtliche Befugnis | Vollmacht liegt laut Auftraggeber vor (Umfang noch zu dokumentieren, siehe `docs/privacy.md`) |
| E-Mail | Im ersten Schritt nur als kopierbarer Text bzw. Öffnen im Mail-Programm. Kein serverseitiger Versand |
| Plattformen | iOS und Android |

## Dokumente

| Datei | Inhalt |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Technologie- und Hosting-Entscheidungen, Systemübersicht |
| [docs/data-model.md](docs/data-model.md) | Datenmodell mit ER-Diagramm (Mermaid) und Regeln |
| [docs/security.md](docs/security.md) | Sicherheitskonzept, Berechtigungen, Bedrohungen, Teststrategie |
| [docs/privacy.md](docs/privacy.md) | Datenschutz, offene rechtliche Prüfungen, Löschkonzept |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Phasen, Arbeitspakete, Abnahmekriterien |

## Geplante Projektstruktur (noch nicht angelegt)

```
pflegezentrale/
├── apps/
│   ├── mobile/        # Expo / React Native / TypeScript
│   └── api/           # NestJS / TypeScript
├── packages/
│   └── shared/        # gemeinsame Typen und Validierungsschemas
├── docs/
├── infra/             # Deployment- und Backup-Konfiguration
└── package.json       # Workspaces
```

## Lokal starten (Backend)

Voraussetzungen: Node.js 22, PostgreSQL 16.

```bash
npm install
cp apps/api/.env.example apps/api/.env   # DATABASE_URL und JWT_SECRET eintragen
export $(grep -v '^#' apps/api/.env | xargs)
npm run db:migrate
ALLOW_REGISTRATION=true npm run dev:api   # nur für die Ersteinrichtung
```

Tests (benötigen eine leere Test-Datenbank, **die Tests löschen deren Schema**):

```bash
DATABASE_URL=postgres://USER:PASSWORT@localhost:5432/pflege_test npm test
npm run typecheck
```

Eine mobile App gibt es noch nicht, daher entfällt `dev:mobile`.

## API-Überblick (Stand jetzt)

| Bereich | Endpunkte |
|---|---|
| Anmeldung | `POST /auth/register` (abschaltbar), `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/accept-invite`, `/auth/accept-invite/existing` |
| Familie | `GET /families`, `GET /families/:id/members`, `POST /families/:id/invitations`, `PUT /families/:id/members/:userId/role`, `DELETE /families/:id/members/:userId` |
| Betreute Person | `POST/GET /families/:id/care-recipients`, `GET/PATCH /care-recipients/:id`, `PUT/DELETE /care-recipients/:id/permissions/:userId`, `GET /care-recipients/:id/activity` |

## Grundregeln

- Ausschließlich synthetische Testdaten, keine echten Gesundheitsdaten in Tests, Screenshots oder Logs.
- Keine Versand- oder Bestellaktion ohne ausdrückliche Bestätigung durch einen Nutzer.
- Die App ist eine Organisationshilfe und ersetzt keine ärztliche Verordnung oder pharmazeutische Prüfung.
