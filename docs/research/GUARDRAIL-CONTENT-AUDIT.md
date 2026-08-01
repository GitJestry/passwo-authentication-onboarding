# Guardrail Content and Fairness Audit

Status: **für den Cognitive Pretest dokumentiert, noch nicht eingefroren**. Beim Study Freeze erneut
zu prüfen.

## Zweck

Der externe Guardrail darf weder PassWo noch SecAware durch artefaktspezifische Begriffe,
Detailtiefe oder unmittelbar wiederholte Quizfragen bevorzugen. Für jedes Item wird vorab eine
Claim--Evidence--Task-Kette dokumentiert:

1. **Claim:** Welche eng begrenzte Aussage soll die Antwort stützen?
2. **Evidence:** Wo wird sie in beiden finalen Artefakten explizit vermittelt oder angewandt?
3. **Task:** Welche neue, produktneutrale Aufgabe prüft sie ohne Wortlaut oder Antwortmuster eines
   Artefakts zu kopieren?

## Gemeinsamer primärer Mechanismenkern

| Claim-ID | Gemeinsamer Claim | PassWo-Evidence | SecAware-Evidence aus dem eingefrorenen V9-Study-Build | Entscheidung |
|---|---|---|---|---|
| `CORE_REUSE` | Bekannt gewordene wiederverwendete Passwörter können bei weiteren Konten ausprobiert werden; Einzigartigkeit begrenzt diesen Weg. | Trainingsskript, Segmente 6 und 17 | Lektion `cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv`, Item `clcyqrhi30b8h1v5j7zqv53ip`: eigenes starkes Passwort für jedes IT-System und jeden IT-Dienst. Lektion `8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O`, Item `cld0fg028001v356ougo22jb1`: eigenes, einzigartiges Passwort für jedes Online-Konto. | gemeinsamer Kern belegt |
| `CORE_PM` | Passwortmanager unterstützen unterschiedliche Passwörter durch Erzeugen/Speichern/Abrufen/Ausfüllen. | Segmente 11--13 | Item `cld0fg028001v356ougo22jb1`: Passwortmanager speichern und organisieren Passwörter. Item `cld0fpnok002r356ofxxnq3hq`: Passwortmanager können starke Passwörter generieren. | gemeinsamer Kern belegt |
| `CORE_MFA` | MFA bildet eine zusätzliche Anmeldebarriere; sie macht Wiederverwendung nicht sicher. | Segmente 14--17 | Lektion `zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt`, Item `cld8n4a3c001v356o04q4t2ws`: starke Passwörter allein reichen nicht; MFA ergänzt weitere Faktoren. Item `cld8niho705jh1s5h4qe44nob`: unterschiedliche Faktoren kombinieren und freiwillige MFA nutzen. | gemeinsamer Kern belegt |

Bewusst ausgeschlossen bleiben konkrete Mindestlängen, Zeichenraummodelle, die Sechs-Wort-Methode,
PassWo-Kategorien und -Metaphern, produktspezifische Einrichtung, Qualitätsrangfolgen zwischen
Passwortmanagerarten und detaillierte Recovery-/Incident-Response-Schritte.

## Item-Audit

| Item-ID | Claim | PassWo | SecAware | PassWo-Lernfragen-Nähe | Distraktoren | Status |
|---|---|---|---|---|---|---|
| `MR_REUSE` | `CORE_REUSE` | belegt | belegt | produktneutraler neuer Stem; keine Übernahme einer PassWo-internen Lernfrage | langes Passwort wiederverwenden; Wiederverwendung nur bei wichtigen Konten mit MFA ergänzen | für Cognitive Pretest geeignet |
| `MR_PASSWORD_MANAGER` | `CORE_PM` | belegt | belegt | produktneutrale Funktionsfrage; keine Übernahme eines PassWo-Antwortmusters | ein starkes Passwort wiederverwenden; ähnliche Passwörter nur speichern | für Cognitive Pretest geeignet |
| `MR_MFA` | `CORE_MFA` | belegt | belegt | bestehender produktneutraler Wortlaut; gegen PassWo-interne Lernfragen weiter zu prüfen | verhindert Offenlegung; macht Wiederverwendung sicher | für Cognitive Pretest geeignet |
| `SCENARIO_DISTINCT_PASSWORDS` | `CORE_REUSE` | belegt | belegt | neue Zwei-Dienste-Transfersituation ohne PassWo-spezifische Begriffe | langes Passwort wiederverwenden; Passwortkern mit Dienstnamen variieren | für Cognitive Pretest geeignet |
| `SCENARIO_PM_MANY_ACCOUNTS` | `CORE_PM` | belegt | belegt | neue Mehrkonten-Transfersituation ohne produktspezifische Einrichtung | gemeinsames Passwort speichern; Einzigartigkeit nur für wichtige Konten | für Cognitive Pretest geeignet |
| `SCENARIO_UNIQUE_PLUS_MFA` | `CORE_REUSE` + `CORE_MFA` | belegt | belegt | Integration der expliziten Einzigartigkeits- und MFA-Aussagen; keine produktspezifische Einrichtung und keine Übernahme einer PassWo-internen Lernfrage | Wiederverwendung + MFA; einzigartig ohne MFA | für Cognitive Pretest geeignet |

Der gemessene SecAware-Pfad besitzt kein natives Abschlussquiz. Deshalb gibt es keine offene
SecAware-Quiz-Overlap-Annahme und keinen Quiz-/Skip-Pfad zu harmonisieren. Die PassWo-internen
Lernfragen bleiben Teil des PassWo-Artefakts; ihre Wortlaut- und Strukturähnlichkeit zum externen
Guardrail wird beim Cognitive Pretest und beim Study Freeze weiterhin geprüft.

## Cognitive-Pretest-Kriterien

- Stem wird wie beabsichtigt verstanden.
- Richtige Option ist nicht nur durch Länge oder Sprachstil erkennbar.
- Distraktoren werden aus dem vorgesehenen Fehlmodell gewählt und sind nicht absurd.
- `unvollständig` und `unsafe` sind eindeutig trennbar.
- Keine Aufgabe verlangt Wissen außerhalb des gemeinsamen Scope.
- Keine externe Aufgabe ist wortgleich oder strukturell nahezu identisch zu einer
  PassWo-internen Lernfrage, insbesondere nicht zur Abschlussfrage in S17.

Nach Beginn der Hauptstudie wird der Guardrail nicht anhand sichtbarer Gruppenunterschiede
erschwert oder umklassifiziert.
