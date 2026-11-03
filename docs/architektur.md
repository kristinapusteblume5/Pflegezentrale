# Architektur Version 1

Bewusst klein gehalten, weil nur zwei Personen die App nutzen und keine Diagnosen oder Gesundheitsdokumente gespeichert werden.

- **Oberfläche:** eine statische Seite (`public/index.html`, `public/app.js`), ohne Build-Schritt. Als Web-App auf dem Handy nutzbar (Manifest und Symbol vorhanden).
- **Server:** kleine Funktionen in `api/` (Node, Vercel). Anmeldung per gemeinsamem Familiencode, Sitzung als signiertes HttpOnly-Cookie (30 Tage). Fehlversuche je Adresse begrenzt (Adresse nur als Hash gespeichert).
- **Daten:** Postgres (Neon über den Vercel Marketplace). Tabelle `items` mit JSON je Eintrag und Versionszähler. Änderungen prüfen die Version (kein stilles Überschreiben), Löschen blendet nur aus. Tabelle `activity` ist per Datenbank-Trigger nicht änderbar.
- **Abgleich:** Die App speichert Änderungen nach kurzer Pause automatisch und holt alle 15 Sekunden den neuen Stand.
- **Foto:** liegt in `private/`, wird nur nach Anmeldung ausgeliefert.
- **Kalender:** `api/ics.js` erzeugt Kalenderdateien (.ics) mit Turnus und Erinnerung, einzeln pro Termin (mit Anmeldung) oder als Abo über einen geheimen Link.
- **Sammlungen** (je Eintrag JSON in `items`): tasks, contacts, appts, tpls, drafts, homes (Wohnobjekte), units (Nutzer der Immobilie), trip und prop (je ein Eintrag).
- **Nicht enthalten:** einzelne Konten und Passwörter, Dokumenten-Upload, Diagnosen, Medikamente, E-Mail-Versand, Push-Mitteilungen.

Gegenüber den früheren Dokumenten (NestJS, Einzelkonten, ausgebautes Datenmodell) ist das eine bewusste Vereinfachung. Wenn später Dokumente oder Gesundheitsdaten dazukommen sollen, müssen Anmeldung, Datenmodell und Datenschutz neu bewertet werden.
