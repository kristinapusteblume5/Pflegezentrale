# Datenschutz

Status: Entwurf. Dies ist **keine Rechtsberatung** und keine Bestätigung der DSGVO-Konformität. Die technische Umsetzung allein garantiert diese nicht. Offene Punkte stehen unten und müssen vor dem Einsatz mit echten Daten geklärt werden.

## 1. Verarbeitete Daten

Gesundheitsdaten (Diagnosen, Befunde, Medikamente), Kontaktdaten von Ärzten und Diensten, Verträge und Abrechnungen, Pflegegrad, Konto- und Nutzungsdaten der beiden Nutzer.
Betroffene Personen: der Vater (betreute Person), die Nutzer, Kontaktpersonen bei Ärzten und Diensten.

## 2. Zweck

Organisation der Pflege und Versorgung innerhalb der Familie. Keine Weitergabe zu anderen Zwecken, keine Werbung, kein Tracking.

## 3. Offene rechtliche Prüfungen (vor Produktivstart)

| # | Frage | Status |
|---|---|---|
| 1 | Reicht die vorhandene Vollmacht aus? Umfang prüfen: Gesundheitssorge, Vermögens- und Behördenangelegenheiten, Datenverarbeitung. Wann ist sie wirksam (Vorsorgevollmacht)? | offen |
| 2 | Rechtsgrundlage nach Art. 6 und Art. 9 DSGVO für die Gesundheitsdaten. Prüfen, ob die Ausnahme für rein persönliche oder familiäre Tätigkeiten greift, und wie sich die Nutzung eines Hosters auswirkt. | offen |
| 3 | Auftragsverarbeitungsvertrag (Art. 28) mit Hosting-Anbieter (und ggf. Push-Dienst). | offen |
| 4 | Sitzt der Anbieter in der EU und gibt es Drittlandübermittlungen (Apple/Google Push)? | offen |
| 5 | Ist eine Datenschutz-Folgenabschätzung nötig? | offen |
| 6 | Informations- und Auskunftspflichten gegenüber dem Vater, soweit zumutbar und relevant. | offen |
| 7 | Verarbeitungsverzeichnis, sofern erforderlich. | offen |
| 8 | Umgang mit Datenpannen (Meldewege, Verantwortliche). | offen |
| 9 | Versand von Gesundheitsdaten per E-Mail (Risiko). | im ersten Schritt entschärft: kein Versand aus der App, Texte nur mit notwendigen Angaben |

Empfehlung: Punkte 1 und 2 mit einer fachkundigen Stelle klären (z. B. Rechtsanwalt oder Notar für die Vollmacht, Datenschutzberatung).

## 4. Datensparsamkeit

- E-Mail-Entwürfe enthalten nur notwendige Angaben. Keine Gesundheitsdetails in Betreffzeilen.
- Push-Nachrichten ohne medizinische Inhalte.
- Keine Gesundheitsdaten in technischen Logs.
- Medizinische Angaben nur, wenn sie aus einer nachvollziehbaren Quelle stammen. Unbestätigtes wird als „unbestätigt“ gekennzeichnet.

## 5. Löschkonzept (Vorschlag, zu bestätigen)

- Fachdaten: Soft-Delete, endgültige Löschung auf Wunsch der Berechtigten.
- Aktivitätsprotokoll: Aufbewahrung, solange der Betreuungskontext besteht.
- Konto-Löschung: Entzug aller Sitzungen, Anonymisierung der Nutzerangaben im Protokoll.
- Backups: Aufbewahrungsdauer festlegen, Daten laufen danach aus.
- Ende der Betreuung: Export aller Daten, danach sichere Löschung.
- Gesetzliche Aufbewahrungspflichten für Verträge und Abrechnungen sind gesondert zu prüfen.

## 6. Betroffenenrechte

Auskunft, Berichtigung, Löschung, Datenexport: Ein Export aller Daten eines Betreuungskontexts wird als Funktion eingeplant (Phase 5).

## 7. Testdaten

Ausschließlich synthetische Daten. Keine echten Gesundheitsdaten in Tests, Screenshots, Demos oder Logs.
