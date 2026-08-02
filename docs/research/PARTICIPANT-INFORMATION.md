# Participant Information and Consent v4-draft

Dieses Dokument ist die kanonische fachliche Quelle der gemeinsamen Teilnehmertexte. Die
ausführbare Projektion liegt im versionierten Instrument-Manifest.

## Status and methodological decision

The common study introduction uses **authorized incomplete disclosure**. It truthfully describes
the procedure, expected duration, data processing, voluntariness, foreseeable burden, and optional
follow-up, but does not disclose before the final study part that two artifacts are compared or
that assignment is randomized. This decision requires the approved ethics protocol and the
specified debriefing procedure.

The common introduction must not contain PassWo, SecAware, condition names, comparison language,
or condition-specific task instructions. The fictional-password safety boundary is shown only in
the supportive condition immediately before the first fictional password task.

## Visible welcome and essential information

**Eyebrow:** Studie zu digitalem Kontoschutz

**Heading:** Willkommen

**Welcome text:**

Vielen Dank, dass du dir Zeit für diese Studie nimmst. Du bearbeitest gleich ein digitales
Lernangebot zum Schutz von Online-Konten und beantwortest davor und danach einige Fragen.

**Summary facts:**

- Heutige Dauer: etwa 20--30 Minuten
- Auswertung: pseudonymisiert
- Nachbefragung: optional, etwa 1--2 Minuten nach 10 Tagen

The consent screen immediately shows the following essential information. It is not hidden behind
an accordion or a read-progress gate:

1. The current session is expected to take 20--30 minutes. Participation is voluntary and can be
   ended at any time without justification or disadvantage.
2. Stored research data include questionnaire responses, total and section timing, technical
   completion status, and required information about the completed learning artifact, versions,
   and presentation orders.
   The study does not request real passwords or account credentials.
3. The ten-day follow-up is optional. An email address is stored only after separate consent and in
   a registry separated from research responses. No direct personal benefit is promised.
4. Study and data-processing questions can be directed to the contacts in the detailed
   information.

## Detailed participant information

The following sections remain available as expandable details and through a persistent
`Teilnahmeinformationen` control throughout the session.

### Worum geht es?

Wir untersuchen, wie ein digitales Lernangebot zum Schutz von Online-Konten genutzt und
wahrgenommen wird. Einige Einzelheiten dazu, was genau untersucht wird, erläutern wir erst nach
deinem letzten Studienteil. Dadurch soll vermieden werden, dass Vorwissen über die genaue
Fragestellung deine Bearbeitung beeinflusst.

### Was erwartet dich?

Zunächst beantwortest du kurze Fragen zu deiner Person und zu bisherigen Erfahrungen mit den
behandelten Themen. Danach bearbeitest du ein digitales Lernangebot. Abschließend folgen Fragen
zu deiner Wahrnehmung des Angebots und zu den vermittelten Inhalten. Die heutige Sitzung dauert
voraussichtlich 20 bis 30 Minuten.

Optional kannst du etwa zehn Tage später per E-Mail an einer etwa ein- bis zweiminütigen
Nachbefragung teilnehmen. Die Hauptstudie kann vollständig bearbeitet werden, ohne dieser
Kontaktaufnahme zuzustimmen.

### Welche Daten werden verarbeitet?

Gespeichert werden deine Fragebogenantworten, Bearbeitungs- und Abschnittszeiten, der technische
Abschlussstatus sowie die für die Auswertung erforderlichen Angaben zum bearbeiteten Lernangebot,
zu Versionen und Darstellungsreihenfolgen. Die Forschungsdaten werden unter einem
zufällig erzeugten Teilnehmercode pseudonymisiert gespeichert und ausgewertet. Sie enthalten
weder deinen Namen noch deine E-Mail-Adresse.

Falls du der Nachbefragung zustimmst, wird deine E-Mail-Adresse getrennt von den Forschungsdaten
gespeichert und ausschließlich für die Einladung sowie höchstens eine Erinnerung verwendet.

### Freiwilligkeit und Abbruch

Die Teilnahme ist freiwillig. Du kannst sie jederzeit ohne Begründung und ohne Nachteile beenden.
Innerhalb der vor dem Study Freeze festgelegten Aufbewahrungs- und Löschfrist kannst du unter
Angabe deines Teilnehmercodes die Löschung deiner Forschungsdaten verlangen.

### Mögliche Belastungen und Nutzen

Es sind keine besonderen Risiken zu erwarten, die über alltägliche Belastungen bei der Nutzung
digitaler Lernangebote und Fragebögen hinausgehen. Ein unmittelbarer persönlicher Nutzen kann
nicht zugesichert werden.

### Fragen und Kontakt

- Studienleitung: Julian Meyer, s27jmeye@uni-bonn.de
- Betreuung: Dr. Christian Tiefenau, tiefenau@cs.uni-bonn.de
- Verantwortliche Stelle / Datenschutzkontakt: `[nach Vorgabe der Universität ergänzen]`

The official responsible entity, data-protection contact, legal basis, data-subject rights, and
concrete research/recontact retention and deletion periods remain Study Freeze blockers. They
must be supplied from the approved University of Bonn documentation and must not be invented by
the implementation.

## Consent controls

### Required consent

Ich habe die Teilnahmeinformationen gelesen und verstanden. Ich weiß, dass einige Einzelheiten
zur genauen Fragestellung erst nach meinem letzten Studienteil erläutert werden. Ich willige
freiwillig in die Teilnahme und in die beschriebene pseudonymisierte Verarbeitung meiner
Forschungsdaten ein.

### Optional recontact consent

Ich möchte etwa zehn Tage später per E-Mail zu einer kurzen Nachbefragung eingeladen werden. Meine
E-Mail-Adresse wird getrennt von den Forschungsdaten gespeichert und nur für diese
Kontaktaufnahme verwendet.

The optional decision is independent from main-study consent and never blocks main-study
participation. Eligibility errors are shown only after a submission attempt, not while the person
is still completing the three confirmations.

## Participant code and continuing access

The participant code is shown immediately after session creation and remains accessible through
the persistent participant-information control. The control is also available while an artifact
is running. The information can be printed. No condition or response data are exposed through
this control.

## Condition-specific just-in-time safety note

Display this only in the supportive condition immediately before the first fictional password
entry. Do not show it in the common welcome or consent flow.

**Heading:** Fiktive Übung

**Text:**

Für die folgenden Felder erfindest du neue Übungspasswörter. Verwende keine echten Passwörter und
keine Abwandlungen davon. Die Eingaben werden nur auf diesem Gerät für die fiktive Übung
verarbeitet und nicht als Forschungsantwort gespeichert.

**Required confirmation:** Ich verwende nur neu ausgedachte Übungspasswörter.

## Debriefing

Participants without follow-up consent are debriefed after the main session. Participants with
follow-up consent are debriefed after their response or when the follow-up window closes. Early
withdrawal handling follows the approved protocol.

The debrief explains the artifact-level comparison, random assignment, outcome families, and the
right to request deletion using the participant code. The exact debrief timing and all deletion
periods must be approved before recruitment.
