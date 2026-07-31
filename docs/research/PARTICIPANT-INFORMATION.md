# Participant Information and Consent v1.0-draft

**Repository path:** `docs/research/PARTICIPANT-INFORMATION.md`

## Status and methodological decision

The common study introduction uses **authorized incomplete disclosure**. It truthfully describes the participant's procedure, duration, data processing, voluntariness, foreseeable burden, and optional follow-up, but does not disclose before the final study part that two artifacts are compared or that assignment is randomized. The omission must be documented in the ethics materials, justified as necessary to reduce demand characteristics, and followed by debriefing and a renewed opportunity to withdraw the participant's data.

The common introduction must not contain PassWo, SecAware, condition names, comparison language, or condition-specific task instructions. The fictional-password safety boundary is shown only in the supportive condition immediately before the first fictional password task.

## Screen 1: Welcome

**Eyebrow**

Studie zu digitalem Kontoschutz

**Heading**

Willkommen

**Body**

Vielen Dank, dass du dir Zeit für diese Studie nimmst. Du bearbeitest gleich ein digitales Lernangebot zum Schutz von Online-Konten. Davor und danach beantwortest du einige kurze Fragen.

Plane für die heutige Sitzung etwa 20 bis 30 Minuten ein. Die Teilnahme ist freiwillig und kann jederzeit ohne Nachteile beendet werden.

**Summary facts**

- Heutige Dauer: etwa 20–30 Minuten
- Auswertung: pseudonymisiert
- Nachbefragung: optional, etwa 1 Minute nach 10 Tagen

**Primary action**

Teilnahmeinformationen lesen

## Screen 2: Participant information

**Heading**

Informationen zu deiner Teilnahme

### Worum geht es?

Wir untersuchen, wie ein digitales Lernangebot zum Schutz von Online-Konten genutzt und wahrgenommen wird. Einige Einzelheiten dazu, was genau untersucht wird, erläutern wir erst nach deinem letzten Studienteil. Dadurch soll vermieden werden, dass Vorwissen über die genaue Fragestellung deine Bearbeitung beeinflusst.

### Was erwartet dich?

Zunächst beantwortest du kurze Fragen zu deiner Person und zu bisherigen Erfahrungen mit den behandelten Themen. Danach bearbeitest du ein digitales Lernangebot. Abschließend folgen Fragen zu deiner Wahrnehmung des Angebots und zu den vermittelten Inhalten. Die heutige Sitzung dauert voraussichtlich 20 bis 30 Minuten.

Optional kannst du etwa zehn Tage später per E-Mail an einer ungefähr einminütigen Nachbefragung teilnehmen. Die Hauptstudie kann vollständig bearbeitet werden, ohne dieser Kontaktaufnahme zuzustimmen.

### Welche Daten werden verarbeitet?

Gespeichert werden deine Fragebogenantworten, Bearbeitungszeiten, technische Abschlussinformationen und Angaben zum bearbeiteten Studienablauf. Die Forschungsdaten werden unter einem zufällig erzeugten Teilnehmercode pseudonymisiert gespeichert und ausgewertet. Sie enthalten weder deinen Namen noch deine E-Mail-Adresse.

Falls du der Nachbefragung zustimmst, wird deine E-Mail-Adresse getrennt von den Forschungsdaten gespeichert und ausschließlich für die Einladung sowie höchstens eine Erinnerung verwendet.

### Freiwilligkeit und Abbruch

Die Teilnahme ist freiwillig. Du kannst sie jederzeit ohne Begründung und ohne Nachteile beenden. Innerhalb der vor dem Study Freeze festgelegten Aufbewahrungs- und Löschfrist kannst du unter Angabe deines Teilnehmercodes die Löschung deiner Forschungsdaten verlangen.

### Mögliche Belastungen und Nutzen

Es sind keine besonderen Risiken zu erwarten, die über alltägliche Belastungen bei der Nutzung digitaler Lernangebote und Fragebögen hinausgehen. Ein unmittelbarer persönlicher Nutzen kann nicht zugesichert werden.

### Fragen und Kontakt

Bei Fragen zur Studie, zur Teilnahme oder zur Verarbeitung deiner Daten kannst du dich an folgende Stelle wenden:

- Studienleitung: Julian Meyer, s27jmeye@uni-bonn.de
- Betreuung: Dr. Christian Tiefenau, tiefenau@cs.uni-bonn.de
- Verantwortliche Stelle / Datenschutzkontakt: `[nach Vorgabe der Universität ergänzen]`

## Consent controls

### Required consent

Ich habe die Teilnahmeinformationen gelesen und verstanden. Ich weiß, dass einige Einzelheiten zur genauen Fragestellung erst nach meinem letzten Studienteil erläutert werden. Ich willige freiwillig in die Teilnahme und in die beschriebene pseudonymisierte Verarbeitung meiner Forschungsdaten ein.

### Optional recontact consent

Ich möchte etwa zehn Tage später per E-Mail zu einer kurzen Nachbefragung eingeladen werden. Meine E-Mail-Adresse wird getrennt von den Forschungsdaten gespeichert und nur für diese Kontaktaufnahme verwendet.

If the optional box is selected, an email field is displayed. The field must not be part of the research-response payload.

### Actions

- Primary: `Teilnahme beginnen`
- Secondary, equally visible: `Nicht teilnehmen`

Do not require scroll tracking as a proxy for comprehension. The full information must remain accessible throughout the study and be exportable or printable.

## Condition-specific just-in-time safety note

Display this only in the supportive condition immediately before the first fictional password entry. Do not show it in the common welcome or consent flow.

**Heading**

Fiktive Übung

**Text**

Für die folgenden Felder erfindest du neue Übungspasswörter. Verwende keine echten Passwörter und keine Abwandlungen davon. Die Eingaben werden nur auf diesem Gerät für die fiktive Übung verarbeitet und nicht als Forschungsantwort gespeichert.

**Required confirmation**

Ich verwende nur neu ausgedachte Übungspasswörter.

## Debriefing

Participants who do not join the delayed follow-up are debriefed after the main session. Participants who join it are debriefed immediately after their follow-up response. If they do not respond, the debrief is sent when the follow-up window closes. Early withdrawals receive the debrief at the withdrawal screen or through the available contact route.

**Heading**

Aufklärung zur Studie

**Text**

Zu Beginn wurden nicht alle Einzelheiten des Studiendesigns offengelegt. In der Studie werden zwei deutschsprachige Lernangebote zum Schutz von Online-Konten als vollständige Angebote miteinander verglichen. Die Zuweisung erfolgte zufällig. Diese Information wurde zunächst zurückgehalten, damit Erwartungen an einen Vergleich die Bearbeitung und Bewertung des jeweiligen Lernangebots möglichst wenig beeinflussen.

Untersucht werden insbesondere die Wahrnehmung des Lernangebots, die Bearbeitungsdauer sowie das unmittelbare Verständnis zentraler Aussagen zu Passwortwiederverwendung, Passwortmanagern und MFA/2FA. Die Studie prüft nicht, ob eine einzelne Gestaltungskomponente oder ein einzelnes psychologisches Prinzip die Ergebnisse verursacht hat.

Du kannst nach dieser Aufklärung innerhalb der vor dem Study Freeze festgelegten Aufbewahrungs- und Löschfrist weiterhin die Löschung deiner Forschungsdaten verlangen. Verwende dafür deinen Teilnehmercode und die oben angegebene Kontaktadresse.

## Implementation invariants

1. The shared shell uses no PassWo or SecAware branding.
2. The page title, recruitment copy, appointment email, facilitator script, and browser chrome must not mention two conditions, random assignment, a supportive hypothesis, psychotherapy, or SecAware before debriefing.
3. Do not state or imply that every participant will enter fictional passwords.
4. Do not reveal the condition in API errors, URLs, visible debug data, loading labels, or progress text.
5. If a participant directly asks whether multiple versions or random assignment exist, the researcher must not provide a false answer. Follow the approved ethics protocol and mark the session for sensitivity analysis if the design is revealed.
6. The optional follow-up consent is independent from main-study consent and must never block main-study participation.
7. The decline action must be clearly visible and must not be visually suppressed through deceptive design.
8. The exact debrief timing and the retention and deletion period must be frozen before recruitment.
9. The concrete retention and deletion period remains a Study Freeze blocker until approved.
