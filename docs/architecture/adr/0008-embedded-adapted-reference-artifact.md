# ADR 0008 — Eingebettetes, studienadaptiertes Referenzartefakt

- **Status:** Accepted
- **Datum:** 2026-07-26
- **Citation label:** `ADR 0008-Reference`
- **Ersetzt:** ADR 0006 für die Study Runtime
- **Ergänzt durch:** ADR 0009 für Desktop Runtime und Zusatznavigation

## Kontext

Der eingefrorene lokale SecAware-Snapshot enthält drei Unterrichtslektionen sowie einen
anbieter-eigenen Quiz und nicht teilnehmerrelevante Kursmetadaten. Ein separater Tab mit manueller
Rückkehrbestätigung kann den tatsächlichen Kursabschluss nicht validieren und unterbricht den
einheitlichen Studienablauf.

## Entscheidung

Der private Originalsnapshot bleibt bytegenau unverändert und wird niemals direkt ausgeliefert.
Ein deterministischer Build-Prozess erzeugt daraus einen studienadaptierten Build. Jede
Transformation ist mit stabiler Ziel-ID, Begründung und Hash dokumentiert und wird gegen den
eingefrorenen Quellhash geprüft.

Der Build wird ausschließlich lokal, same-origin und viewportfüllend in einem sandboxed iframe im
selben Studienfenster eingebettet. Diese Ausnahme gilt nur für den eingefrorenen lokalen
SecAware-Snapshot; sie erlaubt keine Einbettung anderer externer Inhalte.

Aus dem Teilnehmerpfad werden entfernt:

- der ursprüngliche SecAware-Quiz einschließlich seiner Quiz-labelSet-Daten;
- Veröffentlichungs- und Nutzungshinweise;
- nicht-instruktionale externe Kursmetadaten und Navigationsziele.

Die fachlichen Aussagen der drei Unterrichtslektionen bleiben unverändert. Sichtbarer Text der
zwölf supplementären Links und ihre eingefrorenen Ziele bleiben erhalten. Vier leere
Duplikat-Anker werden entfernt. Ihre Navigation ist ausschließlich über die in ADR 0009
definierte Desktop-Bridge zulässig. Externe Medienreferenzen werden nur auf eindeutig vorhandene
lokale Snapshot-Dateien umgeschrieben; andernfalls schlägt der Build fehl.

Der erfolgreiche SCORM-Kursabschluss sendet genau ein minimales Completion-Ereignis mit Typ und
eingefrorener Snapshot-ID. Der Studienwrapper akzeptiert es ausschließlich von der konfigurierten
iframe-Window-Referenz und der lokalen Study-Origin und wechselt unmittelbar in den gemeinsamen
Post-Flow. Quizantworten, SCORM-Interaktionen, Lernfortschritt oder andere Kursdaten werden weder
übernommen noch persistiert oder exportiert.

Nach beiden Bedingungen folgen derselbe Study-Post-Fragebogen und derselbe methodisch getrennte
Study-Guardrail. Für die Referenzbedingung wird ausschließlich die globale Artefaktzeit erfasst.

## Konsequenzen

- Source-, Transformations- und Buildhash sind vor einer Reference Study verbindlich zu prüfen.
- Popups, Top-Level-Navigation, Downloads, Formübertragungen und externe Laufzeitverbindungen des
  SecAware-iframes sind durch Dataset-Transformation, iframe-Sandbox, CSP und Verifier mehrfach
  begrenzt. Die schmale Ausnahme für Zusatzinformationen liegt außerhalb dieses iframes und ist
  in ADR 0009 definiert.
- Der private Completion-Integrationstest muss den echten `SetReachedEnd`-Pfad des generierten
  Builds ausführen.
- Änderungen an Auswahl, Transformation, Hashes oder Completion-Bridge erfordern eine neue
  dokumentierte Artefaktrevision; die kanonische Version bleibt für diese Härtung unverändert.
