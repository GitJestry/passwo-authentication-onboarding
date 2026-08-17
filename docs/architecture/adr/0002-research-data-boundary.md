# ADR 0002 — Forschungsdatengrenze

- **Status:** Accepted
- **Datum:** 2026-07-23
- **Revision:** 2026-08-17 gemäß ADR 0016

## Entscheidung

Persistiert werden nur die im kanonischen `DATA-CONTRACT.md` benannten Datenklassen. Dazu gehören
pseudonyme Session- und Forschungskennungen, Condition und Guardrail-Form, Versionen,
Einwilligungsstatus, Instrumentantworten, Timingintervalle, Abschlussstatus, notwendige technische
Fehlercodes sowie der Hash eines opaken Rückkehrschlüssels und ein stabiler inhaltsfreier
Fortschritts-Checkpoint. Anzeigename, fiktive Passwörter, Passwortteile, lokale Analysebefunde und
Trainingsentscheidungen verlassen den flüchtigen Rendererzustand nicht.

## Konsequenzen

- Der Server importiert nur `@passwo/contracts`, nicht Trainingscontent oder Passwortanalyse.
- JavaScript-lesbarer Browser Storage und Request-Logging sind für Teilnehmerzustand untersagt.
  Ausschließlich der in ADR 0016 festgelegte `Secure`- und `HttpOnly`-geschützte first-party
  Rückkehrschlüssel ist zulässig.
- Neue Datenklassen oder persistierte Inhalte benötigen Forschungsprüfung und ein neues ADR. Die in
  ADR 0016 autorisierten Resume-Felder gelten nicht als offene Entscheidung.
- Pseudonymisierte Arbeitsdaten werden erst nach der vollständigen Prozedur im Data Contract als
  anonym bezeichnet.
