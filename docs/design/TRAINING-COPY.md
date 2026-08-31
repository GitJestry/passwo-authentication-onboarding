# Training Copy and Interaction Language

Diese Datei enthält die stabilen Regeln für sichtbare Teilnehmertexte des supportive Trainings.
Der implementierte Wortlaut liegt ausschließlich in den versionierten Segmentdaten unter
`packages/training-content`. Segmentbezogene Audits dokumentieren nur fachliche Abweichungen und
wiederholen keine vollständigen Texte.

## Autorität und Änderung

1. Ein ausdrücklicher aktueller Auftrag kann Content ändern.
2. Andernfalls sind die versionierten Segmentdaten der kanonische Stand.
3. Bestehender Wortlaut bleibt erhalten, solange Interaktion, Fachgrenze und Barrierefreiheit
   stimmen.
4. Eine Inhaltsänderung erhöht die Segmentversion und aktualisiert die vorhandene Traceability.

Die folgende Begrüßung bleibt ohne ausdrückliche Freigabe wortgleich:

> Aloha! Ich bin PassWo und begleite dich heute durch das Training.

## Textrollen

Jede Textfläche erfüllt vorrangig genau eine Rolle:

| Rolle | Aufgabe |
|---|---|
| Orientierung | Ort und Zweck knapp erklären |
| Navigation | das tatsächlich bedienbare Ziel benennen |
| Mechanismus | einen Zusammenhang erklären |
| Ergebnis | Wirkung der letzten Handlung einordnen |
| Kerngedanke | eine übertragbare Aussage festhalten |
| Safety Boundary | Daten- oder Aussagegrenze vollständig nennen |
| Optionaler Hinweis | Hilfe ohne Workflow-Übergang anbieten |

Interne Begriffe wie Fixture, Runtime, Controller, Score, Design Lab oder Segment-ID sind kein
Teilnehmertext.

## PassWo und Ton

- Ein Sprechschritt enthält einen Hauptgedanken und normalerweise höchstens zwei kurze Sätze.
- Ergebnisfeedback bewertet die Handlung oder sichtbare Wirkung, niemals die Person.
- Kein Alarmismus, keine Beschämung und keine absolute Sicherheitszusage.
- PassWo wiederholt keine bereits eindeutige Vorschau.
- Reale Passwörter, Konten, Tokens, Recovery-Codes oder Sicherheitsvorfälle werden nie erfragt.
- Die Simulation wird nicht als Produktionsbewertung dargestellt.

## Handlungssprache

| Situation | Aktion |
|---|---|
| reiner Dialogfortschritt | `Weiter` |
| fachliche Aktion in der Sprechblase | konkrete Handlung, etwa `Passwort prüfen` |
| sichtbares Ziel in Browser oder Netzwerk | kein Ersatzbutton; das Ziel selbst löst aus |
| optionale Hilfe | `Schließen` ohne Zustandsfortschritt |
| wiederholbare Erklärung | `Animation wiederholen` |

Ein verpflichtendes externes Ziel ist fokussierbar, sichtbar markiert und die einzige Quelle des
Domain-Events. Buttontexte beschreiben exakt den ausgelösten Effekt.

## Hervorhebung

- Standardmäßig wird höchstens eine kurze Kernaussage hervorgehoben.
- Zwei Hervorhebungen sind nur für einen ausdrücklichen Kontrast zulässig.
- Kontofarben dürfen der Referenzauflösung dienen, zählen aber nicht als Lernhervorhebung.
- Farbe ist nie der einzige Bedeutungsträger.
- `warning`, `positive` und `action` werden nur für den sichtbaren aktuellen Zustand verwendet.

## Review

Vor einer Content-Änderung ist zu prüfen:

- Passt der Text zur aktuell sichtbaren Szene und Handlung?
- Ist die Daten- und Security-Claim-Grenze korrekt?
- Gibt es nur einen Hauptgedanken und eine eindeutige Aktion?
- Bleibt geschützter Wortlaut unverändert?
- Sind Tastaturbedienung, Fokus und Reduced Motion berücksichtigt?
- Wurden Segmentversion und bestehende Traceability aktualisiert?
