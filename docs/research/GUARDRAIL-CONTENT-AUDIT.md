# Shared-Content-Audit des Understanding Guardrails

Status: **implementierte Fassung `guardrail-v6-pilot`.** Referenz ist der administrierte
SecAware.NRW-V9-Instruktionspfad ohne terminales Quiz und optionale Zusatzlinks.

## Gemeinsame Claims

| Claim | Evidenz |
|---|---|
| eigenes starkes Passwort pro Konto/Dienst | `SC_DISTINCT_PASSWORDS`, `MR_DISTINCT_PASSWORDS` |
| Passwortmanager erzeugt starke Passwörter | `SC_PM_MANY_ACCOUNTS`, `MR_PASSWORD_MANAGER` |
| Passwortmanager speichert und organisiert Passwörter | `SC_PM_MANY_ACCOUNTS`, `MR_PASSWORD_MANAGER` |
| MFA ergänzt das Passwort um einen Faktor anderer Kategorie | `MR_MFA` |
| eigene starke Passwörter und MFA werden kombiniert | `SC_LAYERED_PROTECTION` |

Credential Stuffing, Wiederherstellung der Passwortgeheimhaltung und detaillierte
Passwortstärkemechanik sind kein separater gemeinsamer Outcome-Claim, weil sie nicht auf derselben
obligatorischen Abstraktionsebene in beiden Artefakten liegen.

## A-priori-Klassifikation

| Item | angemessen | unvollständig oder unsicher |
|---|---|---|
| `SC_DISTINCT_PASSWORDS` | eigenes starkes Passwort je Konto | Wiederverwendung oder nur ein getrenntes Konto |
| `SC_PM_MANY_ACCOUNTS` | erzeugen, speichern und organisieren | nur wichtige Konten trennen oder ein Passwort für alle |
| `SC_LAYERED_PROTECTION` | eigenes Passwort je Konto plus MFA | MFA ausgelassen oder gemeinsames Passwort trotz MFA |
| `MR_DISTINCT_PASSWORDS` | eigenes starkes Passwort pro Konto | andere Optionen |
| `MR_PASSWORD_MANAGER` | erzeugen, speichern und organisieren | andere Optionen |
| `MR_MFA` | Passwort plus Faktor anderer Kategorie | andere Optionen |

`Weiß ich nicht` bleibt eine eigene Unsicherheitskategorie. Es gibt kein Pass/Fail, keinen
Gesamtscore und kein Correctness Feedback vor Abschluss der In-Session-Outcomes.

## Formbalancierung

`F1` bis `F6` verwenden alle sechs Szenarioreihenfolgen. Je Item erscheinen die drei
inhaltlichen Optionen genau zweimal an jeder Position; `Weiß ich nicht` bleibt zuletzt. Form und
tatsächlich gezeigte Optionfolge werden serverseitig zugewiesen und persistiert.

Die genaue Item-, Text-, Artefakt- und Screen-Zuordnung gehört zur versionierten Research-QA und
wird bei Inhaltsrevisionen gemeinsam geprüft. Diese Prüfung ist Content Review, keine
psychometrische Validierung oder zusätzliche Softwarefunktion.
