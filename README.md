# Pflegezentrale (Version 1)

Eine einfache gemeinsame Web-App für Aufgaben, Termine, Kontakte und E-Mail-Entwürfe rund um die Pflege von Dieter. Läuft im Handy-Browser und lässt sich wie eine App auf den Home-Bildschirm legen.

**Reiter:** Aufgaben (Startbildschirm, mit Foto, Themen, Person, Zuordnung zu Nutzern und Wohnobjekten), Termine (mit Kontakt, Turnus, Erinnerung und Kalender-Export), Kontakte (Ärzte, Organisatorisch, Demenzwohnen, Immobilie Nürnberg, Mieter, Handwerker; suchbar, anrufbar, mit Notizen), Urlaub (Reisedaten, Grund, E-Mail-Entwürfe zum Kopieren), Wohnen (Demenzwohnen: mehrere Objekte, Status mit Verlauf, Aufgaben, Kontakte, Übersicht „Aktueller Stand“), Immobilie (Nürnberg: Nutzer/Wohnungen mit Notizen, verknüpften Kontakten und Aufgaben, allgemeine Notizen). Einstellungen (⚙️): E-Mail-Vorlagen, Kalender, Person, Protokoll.

**Bewusst nicht drin:** Diagnosen, Befunde, Medikamente, Dokumenten-Upload. **Bitte auch in Notizen und Terminbeschreibungen keine Diagnosen oder Befunde eintragen.**

Alle sehen dieselben Daten. Wer man ist, wählt man in der App („Wer bist du?“). Geschützt ist die App durch einen gemeinsamen **Familiencode**.

---

## Einrichten (ca. 30 Minuten, ohne Programmierkenntnisse)

### 1. GitHub: Dateien ablegen
1. Konto auf github.com anlegen und oben rechts **New repository** wählen.
2. Name z. B. `pflegezentrale`, **Private** auswählen (wichtig, im Projekt liegt das Foto), **Create repository**.
3. Dieses ZIP auf dem Computer entpacken. Im neuen Repository auf **uploading an existing file** klicken und den **Inhalt** des entpackten Ordners hineinziehen (nicht den Ordner selbst). Unten **Commit changes**.

### 2. Vercel: die App veröffentlichen
1. Auf vercel.com mit **Continue with GitHub** anmelden.
2. **Add New → Project**, das Repository `pflegezentrale` auswählen, **Import**.
3. Bei „Framework Preset“ **Other** lassen. **Deploy** klicken. Die Seite zeigt zunächst „Server nicht fertig eingerichtet“, das ist normal.

### 3. Datenbank anlegen
1. Im Vercel-Projekt den Reiter **Storage** (oder **Marketplace**) öffnen und **Neon** (Postgres) hinzufügen. Den kostenlosen Plan wählen.
2. Beim Anlegen eine **Region in der EU** auswählen (z. B. Frankfurt), falls angeboten. Die Region lässt sich später nicht einfach ändern.
3. Mit dem Projekt verbinden. Danach unter **Settings → Environment Variables** prüfen, dass `DATABASE_URL` (oder `POSTGRES_URL`) vorhanden ist.

### 4. Geheimnisse eintragen
Unter **Settings → Environment Variables** zwei Einträge hinzufügen (für „Production“):

| Name | Wert |
|---|---|
| `FAMILY_CODE` | Euer gemeinsamer Code, mindestens 10 Zeichen, lang und nicht erratbar (z. B. drei zufällige Wörter plus Zahl) |
| `SESSION_SECRET` | 40 oder mehr zufällige Zeichen (z. B. mit dem Passwortmanager erzeugen) |

Optional: `PEOPLE` (Standard `Kristina,Stefan`), `CARE_NAME` (Standard `Papa`; bei euch `Dieter`).

### 5. Neu veröffentlichen
Variablen wirken erst nach einem neuen Deployment: **Deployments → die oberste → ⋯ → Redeploy**.

### 6. Benutzen
1. Die Adresse (`…vercel.app`) öffnen, Familiencode eingeben, „Wer bist du?“ wählen.
2. Aufs Handy: iPhone Safari **Teilen → Zum Home-Bildschirm**; Android Chrome **Menü → App installieren / Zum Startbildschirm**.
3. Die Adresse und den Code an die andere Person schicken (getrennt voneinander).

### 7. Termine in den Apple-Kalender
- **Einzelner Termin:** Beim Termin auf „📅 Zum Kalender“ tippen. Der Kalender öffnet sich mit dem Termin (inklusive Turnus und Erinnerung), dort „Hinzufügen“.
- **Alle Termine laufend:** ⚙️ → **Kalender** → „📅 Kalender abonnieren“ tippen und bestätigen. Neue und geänderte Termine erscheinen danach automatisch (Apple aktualisiert Abos in Abständen, nicht sofort). Wer die Abo-Adresse kennt, sieht alle Termine, also nicht weitergeben. Zum Sperren der Adresse `SESSION_SECRET` ändern und neu veröffentlichen.

---

## Gut zu wissen

- **Foto ändern:** Die Datei `private/dieter.jpg` im GitHub-Repository ersetzen. In der App selbst lässt sich das Foto nicht ändern. Es wird nur nach Eingabe des Familiencodes ausgeliefert, steht aber im Repository (daher **privat** lassen).
- **Löschen:** Gelöschte Einträge verschwinden aus der App, bleiben aber zunächst in der Datenbank. Endgültig entfernen: in Neon die SQL-Konsole öffnen und `DELETE FROM items WHERE deleted_at IS NOT NULL;` ausführen.
- **Code ändern oder sperren:** `FAMILY_CODE` ändern und neu veröffentlichen. Geräte, die schon angemeldet sind, bleiben bis zu 30 Tage angemeldet. Um alle sofort abzumelden, zusätzlich `SESSION_SECRET` ändern.
- **Mehrere Personen gleichzeitig:** Wird derselbe Eintrag gleichzeitig geändert, zeigt die App einen Hinweis und lädt den aktuellen Stand. Nichts wird stillschweigend überschrieben.
- **Protokoll:** Wer was angelegt oder geändert hat, steht unter „Letzte Aktivität“ auf dem Start und lässt sich nachträglich nicht ändern.
- **Region der Funktionen:** `vercel.json` legt Frankfurt (`fra1`) fest. Zeigt Vercel dazu eine Warnung, den Eintrag `"regions"` in `vercel.json` löschen.
- **Kosten/Tarif:** Der kostenlose Vercel-Tarif ist laut Vercel für private, nicht kommerzielle Nutzung gedacht. Aktuelle Bedingungen und Grenzen von Vercel und Neon bitte selbst prüfen.

## Datenschutz (bitte lesen)

- Der Familiencode ist ein **einfacher** Schutz. Wer ihn kennt, sieht alles. Deshalb gilt: keine Diagnosen, Befunde, Medikamente, Ausweis- oder Kontodaten eintragen.
- Auch Termine („Anlass“) und Notizen können auf Gesundheit schließen lassen. Möglichst neutral formulieren („Kontrolle“, „Check-up“).
- Die Daten liegen bei **Vercel** (Funktionen) und **Neon** (Datenbank). Vor dem Einsatz prüfen: Standort der Datenbank, Auftragsverarbeitungsvertrag, und ob die Vollmacht die Verwaltung dieser Daten abdeckt. Das ersetzt keine Rechtsberatung.
- Backups: Prüft im Neon-Tarif, welche Wiederherstellung enthalten ist. Eine eigene Sicherung ist nicht eingebaut.
- Es werden keine E-Mails versendet und keine Nachrichten aufs Handy geschickt. Entwürfe kopiert ihr selbst.

## Für Entwickler

```bash
npm install
cp .env.example .env     # Werte eintragen, DATABASE_URL auf eine lokale Postgres-Datenbank
npm run dev              # http://localhost:3000
npm test                 # braucht eine leere Test-Datenbank (TEST_DATABASE_URL); die Tests löschen deren Schema
```

Aufbau: `public/` (Oberfläche), `api/` (Vercel-Funktionen: login, logout, state, item, log, photo), `db/schema.sql` (wird beim ersten Aufruf automatisch angelegt), `dev/server.js` (lokaler Server), `test/` (Tests).
Daten liegen als JSON je Eintrag in der Tabelle `items` (Sammlungen: tasks, contacts, appts, tpls, drafts, trip). Das ist bewusst einfach gehalten und kein ausgebautes Datenmodell.
