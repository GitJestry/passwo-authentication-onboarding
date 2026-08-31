# Study Runtime

Status: **kanonisches implementiertes Verhalten der Webstudie.** ADR 0016 entscheidet Resume und
Datenabschluss; `DATA-CONTRACT.md` entscheidet Datengrenze und Anonymisierung.

## Ablauf

```text
Eligibility lokal
→ Teilnahmeinformation und Hauptstudien-Einwilligung
→ optionales Follow-up-Opt-in mit getrennt registrierter E-Mail
→ Session, verdeckte Condition und Guardrail-Form
→ Pre sample → Pre experience
→ zugewiesenes Artefakt
→ PANAS → Zeiturteile → UEQ-S → UEQ+ Inhaltsseriosität
→ Design-Diagnostik → Risikoproportionalität → wahrgenommenes Verständnis
→ Guardrail-Szenarien → Recognition
→ Post-Guardrail-Self-Efficacy → retrospektive SecAware-Vorerfahrung
→ atomarer Datenabschluss
→ gemeinsames Debriefing und Abschlussbildschirm
```

Study- und Training-Statechart bleiben getrennt. Eligibility wird nicht persistiert. Die
E-Mail-Adresse ist optional und liegt ausschließlich im Kontaktregister. Jeder Instrumentblock
wird vollständig, atomar und idempotent gespeichert; ein abweichender Retry wird abgelehnt.

Die letzte erforderliche Submission setzt einen datenkompletten Run in derselben Transaktion auf
`completed`, invalidiert Resume und plant bei Opt-in das Follow-up. Debriefing und Abschlussbild
benötigen keinen weiteren Statusklick. Nur `completed` Runs gehen in die Analyse.

## Unterbrechung und Resume

Tab- oder Browser-Schließen unterbricht die Browser-Sitzung; der Run bleibt `in-progress`. Es gibt
keinen separaten vorzeitigen Abschlussbutton.

Ein zufälliger Rückkehrschlüssel liegt ausschließlich als `Secure`, `HttpOnly`, first-party Cookie
im Browser. Der Server speichert Hash und Ablaufzeit. Er gilt höchstens 30 Tage, wird an sicheren
Checkpoints erneuert und endet spätestens bei `resumeCloseAt`.

| Bereich | Wiederaufnahme |
|---|---|
| Instrumente | bereits atomar gespeicherte Blöcke überspringen |
| SecAware | letzter bestätigter Seiteneinstieg |
| PassWo S00 | einmaligen Einstieg wiederholen |
| PassWo S01–S07 | bestätigten Segmenteinstieg aus tab-lokalem Snapshot rekonstruieren; sonst S01 |
| PassWo S08–S17 | letztes bestätigtes Segment mit minimalem S08-Resume-Zustand öffnen |

Der S01–S07-Snapshot liegt nur in `sessionStorage`, gehört exakt zu Session und Segment, läuft nach
zwei Stunden ab, wird nie übertragen und nach bestätigtem S08-Checkpoint gelöscht. Ältere Sessions
vor `consent-v14-pilot` verwenden weiterhin S01 als Fallback.

Vor S08 verwirft der Client Passwortstrings, Teilstrings und semantische Detailbefunde. Der danach
zulässige `supportive-s08-resume-v1`-Zustand enthält nur drei vorgegebene Passphrasen-IDs,
kanonische Schwäche-/Relationsflags und die inhaltsfreie Segment-ID S08–S17. Er wird am
Artefaktabschluss gelöscht und nicht exportiert.

Geht das Cookie verloren, wird keine Sitzung über E-Mail, Forschungs-ID oder Antworten gesucht.
Bis zur Anonymisierung bleibt die individuelle lokale Löschung über den selbst gesicherten
Löschcode möglich.

## Timing und Fehler

Auswertbare Artefaktzeit ist die Summe bestätigter Webintervalle. Eine Unterbrechung schließt das
aktuelle Intervall; Offline-Zeit zählt nicht mit. Resume beginnt am sicheren Checkpoint ein neues
Intervall. Completed Runs mit Unterbrechung erhalten ein Qualitätsflag, bleiben aber für
nichtzeitliche Outcomes auswertbar.

Methodisch relevante Writes blockieren nur den betroffenen Übergang und sind mit derselben
Sequenz idempotent wiederholbar. Der lokale Lease-Mechanismus und `incomplete-reload` bleiben
ausschließlich als Legacy lesbar.

## Datengrenze

- Anzeigename, fiktive Passwörter, Teile, Markierungen und Befunde werden nicht an den Server
  übertragen oder als Forschungsdaten gespeichert.
- `localStorage`, IndexedDB und Service Worker sind für Teilnehmer- und Trainingszustand verboten.
- Langfristige Browserpersistenz ist ausschließlich das JavaScript-unlesbare Resume-Cookie.
- Serverseitig liegen nur erlaubte Session-, Zuweisungs-, Instrument-, Timing-, Checkpoint- und
  Abschlussdaten sowie der temporäre minimale S08-Zustand.
- E-Mail und Raw Follow-up-Token liegen ausschließlich in `recontact.sqlite`.
- Logs enthalten keine Request-Bodies, IP-Adressen, User-Agents, Trainingswerte oder Raw Tokens.

## Referenz und Follow-up

Der deterministische SecAware-V9-Study-Build läuft same-origin bis zum definierten Completion-
Event vor dem entfernten terminalen Quiz. Es werden keine SCORM-Interaktionen oder Segmentzeiten
übernommen.

Bei Follow-up-Opt-in gelten Einladung nach 240 Stunden, höchstens eine Erinnerung 48 Stunden nach
bestätigtem Erstversand und Fensterschluss nach 336 Stunden. Die Nachbefragung ist eine getrennte
tokenisierte same-origin Route. Der Versand erfolgt kontrolliert über das Universitätskonto; die
Runtime enthält keine Mail-Credentials. Kontaktkopien werden gemäß Data Contract gelöscht.

## Betrieb

Die Hauptstudie nutzt `permuted-block`; erzwungene Bedingungen sind ausschließlich QA- und
Pretest-Konfiguration. Der Client besitzt keinen Condition-Schalter. Webdeployment und Live-QA
stehen in `docs/operations/WEB-DEPLOYMENT.md`.

Versions-Freeze, `resumeCloseAt` und Datensatz-Freeze sind getrennte Zeitpunkte. Die verbindliche
Anonymisierungs- und Löschprozedur steht ausschließlich in `DATA-CONTRACT.md`.
