# ADR 0002 — Forschungsdatengrenze

- **Status:** Accepted
- **Datum:** 2026-07-23

## Entscheidung

Persistiert werden nur pseudonyme Sessiondaten, Condition, Versionen, Einwilligungsstatus,
Fragebogen- und Guardrail-Antworten, Timingevents, Abschlussstatus und notwendige technische
Fehlercodes. Anzeigename, fiktive Passwörter, Passwortteile, Analysebefunde und
Trainingsentscheidungen verlassen den Browser nicht.

## Konsequenzen

- Der Server importiert nur `@passwo/contracts`, nicht Trainingscontent oder Passwortanalyse.
- Browser Storage und Request-Logging sind für Teilnehmerzustand untersagt.
- Neue persistierte Felder benötigen Forschungsprüfung und ein neues ADR.
