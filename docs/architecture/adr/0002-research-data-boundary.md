# ADR 0002 — Forschungsdatengrenze

- **Status:** Accepted
- **Datum:** 2026-07-23
- **Revision:** 2026-08-30 gemäß dem tab-lokalen S01–S07-Reload-Checkpoint in ADR 0016

## Entscheidung

Persistiert werden nur die im kanonischen `DATA-CONTRACT.md` benannten Datenklassen. Dazu gehören
pseudonyme Session- und Forschungskennungen, Condition und Guardrail-Form, Versionen,
Einwilligungsstatus, Instrumentantworten, Timingintervalle, Abschlussstatus, notwendige technische
Fehlercodes sowie der Hash eines opaken Rückkehrschlüssels und ein stabiler inhaltsfreier
Fortschritts-Checkpoint. Anzeigename, fiktive Passwörter, Passwortteile und semantische
Detailbefunde werden nie an den Server gesendet oder als Forschungsdaten persistiert. Für einen
unmittelbaren Reload darf ADR 0016 zusätzlich einen minimalen, mit zweistündiger TTL versehenen
S01–S07-Zustand im tab-lokalen `sessionStorage` halten. Die einzige serverseitige Ausnahme für eine
operative Trainingswiederaufnahme ist der in ADR 0016 definierte Zustand
`supportive-s08-resume-v1`: ausschließlich IDs vorgegebener Passphrasen sowie kanonische
Konten-/Relationsflags, niemals frei eingegebene Strings oder Teilstrings. Dieser Zustand wird
nach Artefaktabschluss entfernt und nicht exportiert. Nach dem S08-Write darf der bereits
autorisierte inhaltsfreie Fortschritts-Checkpoint ausschließlich die zuletzt bestätigte Segment-ID
S09 bis S17 ergänzen; dadurch entsteht keine weitere persistierte Inhaltsdatenklasse.

## Konsequenzen

- Der Server importiert nur `@passwo/contracts`, nicht Trainingscontent oder Passwortanalyse.
- JavaScript-lesbarer Browser Storage bleibt für Teilnehmerzustand grundsätzlich untersagt. Die
  einzige Ausnahme ist der in ADR 0016 eng definierte tab-lokale S01–S07-Reload-Checkpoint in
  `sessionStorage`; `localStorage`, IndexedDB und Service Worker bleiben unzulässig. Der
  langfristige Rückkehrschlüssel bleibt `Secure` und `HttpOnly` geschützt. Request-Logging von
  Trainingswerten bleibt untersagt.
- Neue Datenklassen oder persistierte Inhalte benötigen Forschungsprüfung und ein neues ADR. Die in
  ADR 0016 autorisierten Resume-Felder gelten nicht als offene Entscheidung.
- Pseudonymisierte Arbeitsdaten werden erst nach der vollständigen Prozedur im Data Contract als
  anonym bezeichnet.
