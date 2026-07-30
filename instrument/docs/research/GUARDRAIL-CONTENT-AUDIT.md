# Guardrail Content and Fairness Audit

Status: **nicht eingefroren**. Vor Cognitive Pretest und erneut beim Study Freeze auszufüllen.

## Zweck

Der externe Guardrail darf weder PassWo noch SecAware durch artefaktspezifische Begriffe,
Detailtiefe oder unmittelbar wiederholte Quizfragen bevorzugen. Für jedes Item wird vorab eine
Claim--Evidence--Task-Kette dokumentiert:

1. **Claim:** Welche eng begrenzte Aussage soll die Antwort stützen?
2. **Evidence:** Wo wird sie in beiden finalen Artefakten explizit vermittelt oder angewandt?
3. **Task:** Welche neue, produktneutrale Aufgabe prüft sie ohne Wortlaut oder Antwortmuster eines
   Artefakts zu kopieren?

## Gemeinsamer primärer Mechanismenkern

| Claim-ID | Gemeinsamer Claim | Vorläufige PassWo-Evidence | SecAware-Evidence beim Freeze | Entscheidung |
|---|---|---|---|---|
| `CORE_REUSE` | Bekannt gewordene wiederverwendete Passwörter können bei weiteren Konten ausprobiert werden; Einzigartigkeit begrenzt diesen Weg. | Trainingsskript, Segmente 6 und 17 | `TODO`: exakte Snapshot-Sequenz und Wortlaut | pending |
| `CORE_PM` | Passwortmanager unterstützen unterschiedliche Passwörter durch Erzeugen/Speichern/Abrufen/Ausfüllen. | Segmente 11--13 | `TODO` | pending |
| `CORE_MFA` | MFA bildet eine zusätzliche Anmeldebarriere; sie macht Wiederverwendung nicht sicher. | Segmente 14--17 | `TODO` | pending |

Bewusst ausgeschlossen bleiben konkrete Mindestlängen, Zeichenraummodelle, die Sechs-Wort-Methode,
PassWo-Kategorien und -Metaphern, produktspezifische Einrichtung, Qualitätsrangfolgen zwischen
Passwortmanagerarten und detaillierte Recovery-/Incident-Response-Schritte.

## Item-Audit

| Item-ID | Claim | PassWo | SecAware | Native-Quiz-/Vorübungs-Overlap | Distraktoren | Status |
|---|---|---|---|---|---|---|
| `MR_REUSE` | `CORE_REUSE` | vorläufig | `TODO` | `TODO` | lokales Risiko; gleicher Benutzername nötig | pending |
| `MR_PASSWORD_MANAGER` | `CORE_PM` | vorläufig | `TODO` | `TODO` | ein starkes Passwort wiederverwenden; ähnliche nur speichern | pending |
| `MR_MFA` | `CORE_MFA` | vorläufig | `TODO` | `TODO` | verhindert Offenlegung; macht Wiederverwendung sicher | pending |
| `SCENARIO_LEAK_REUSE_MFA` | reuse + MFA | vorläufig | `TODO` | `TODO` | nur Leak-Konto ändern; gemeinsamen Kern behalten | pending |
| `SCENARIO_PM_REDUCE_REUSE` | reuse + PM | vorläufig | `TODO` | `TODO` | gemeinsames Passwort speichern; nur wichtige Konten trennen | pending |
| `SCENARIO_UNIQUE_PLUS_MFA` | reuse + MFA | vorläufig | `TODO` | `TODO` | Wiederverwendung + MFA; einzigartig ohne MFA | pending |

## Cognitive-Pretest-Kriterien

- Stem wird wie beabsichtigt verstanden.
- Richtige Option ist nicht nur durch Länge oder Sprachstil erkennbar.
- Distraktoren werden aus dem vorgesehenen Fehlmodell gewählt und sind nicht absurd.
- `unvollständig` und `unsafe` sind eindeutig trennbar.
- Keine Aufgabe verlangt Wissen außerhalb des gemeinsamen Scope.
- Keine externe Aufgabe ist wortgleich oder strukturell nahezu identisch zu einer nativen Frage,
  insbesondere nicht zur PassWo-Abschlussfrage in S17 oder zum SecAware-Quiz.

Nach Beginn der Hauptstudie wird der Guardrail nicht anhand sichtbarer Gruppenunterschiede
erschwert oder umklassifiziert.
