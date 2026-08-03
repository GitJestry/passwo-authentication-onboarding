# Guardrail Content and Fairness Audit

Status: **Inhalt für `guardrail-v4` festgelegt; vor dem ersten Hauptstudienfall ist nur noch die
Implementierungsparität mit den finalen Artefaktversionen zu bestätigen.**

## Gemeinsamer Mechanismenkern

| Claim-ID | Gemeinsamer Claim | PassWo-Evidence | SecAware-Evidence aus dem eingefrorenen Study-Build | Entscheidung |
|---|---|---|---|---|
| `CORE_REUSE` | Ein bekannt gewordenes wiederverwendetes Passwort kann bei weiteren Konten ausprobiert werden; kontospezifische Passwörter begrenzen diesen Weg. | Segmente 6 und 17 | Lektion `cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv`, Item `clcyqrhi30b8h1v5j7zqv53ip`; Lektion `8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O`, Item `cld0fg028001v356ougo22jb1` | gemeinsamer Kern belegt |
| `CORE_PM` | Passwortmanager unterstützen Erzeugen, Speichern, Organisieren und spätere Bereitstellung kontospezifischer Passwörter. | Segmente 11 bis 13 | Items `cld0fg028001v356ougo22jb1` und `cld0fpnok002r356ofxxnq3hq` | gemeinsamer Kern belegt |
| `CORE_MFA` | MFA bildet eine zusätzliche Anmeldebarriere; sie verhindert keine Passwortoffenlegung und macht Wiederverwendung nicht sicher. | Segmente 14 bis 17 | Lektion `zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt`, Items `cld8n4a3c001v356o04q4t2ws` und `cld8niho705jh1s5h4qe44nob` | gemeinsamer Kern belegt |

Bewusst ausgeschlossen sind konkrete Mindestlängen, Zeichenraummodelle, die Sechs-Wort-Methode,
PassWo-Metaphern, produktspezifische Einrichtung, Produktvergleiche und detaillierte Recovery-
oder Incident-Response-Schritte.

## Finaler Item-Audit

| Item-ID | Geprüfter Claim | Antwortlogik | Status |
|---|---|---|---|
| `SC_BREACH_REUSE` | `CORE_REUSE` | angemessen: beide kompromittierten Wiederverwendungsstellen durch neue unterschiedliche Passwörter ersetzen; unsicher: nur Quellkonto ändern oder gemeinsames Passwort mit MFA beibehalten | freigegeben |
| `SC_PM_MANY_ACCOUNTS` | `CORE_PM` | angemessen: kontospezifische Passwörter mit Passwortmanager erzeugen, speichern und verwenden; unsicher: Wiederverwendung bei Neben- oder allen Konten | freigegeben |
| `SC_LAYERED_PROTECTION` | `CORE_REUSE` + `CORE_MFA` | angemessen: kontospezifische starke Passwörter plus MFA; unvollständig: kontospezifisch ohne MFA; unsicher: Wiederverwendung wegen MFA | freigegeben |
| `MR_REUSE` | `CORE_REUSE` | erkennt kontoübergreifendes Ausprobieren; Distraktoren bilden automatische Leak- beziehungsweise E-Mail-Verknüpfungsmodelle | freigegeben |
| `MR_PASSWORD_MANAGER` | `CORE_PM` | erkennt kontospezifisches Speichern und passendes Einsetzen; Distraktoren bilden gemeinsames Passwort beziehungsweise automatische MFA-Aktivierung | freigegeben |
| `MR_MFA` | `CORE_MFA` | erkennt zusätzliche Anmeldebarriere; Distraktoren bilden rückwirkende Geheimhaltung beziehungsweise sichere Wiederverwendung | freigegeben |

Die korrekte Passwortmanager-Recognition-Antwort ist bewusst ähnlich lang wie die Distraktoren.
Szenarien stehen vor Recognition. Die drei Szenarien werden über sechs Formen in allen möglichen
Reihenfolgen gezeigt; die substantive Antwortposition wird ebenfalls vollständig balanciert.
`Weiß ich nicht` bleibt immer letzte Option.

## Klassifikationsgrenzen

- `SC_BREACH_REUSE`: eine angemessene und zwei unsichere Antworten.
- `SC_PM_MANY_ACCOUNTS`: eine angemessene und zwei unsichere Antworten.
- `SC_LAYERED_PROTECTION`: eine angemessene, eine unvollständige und eine unsichere Antwort.
- Recognition: korrekt, falscher Mechanismus oder unsichere Antwort; Unsicherheit bleibt eigene
  Kategorie.
- Es gibt keinen Gesamtscore, keine Pass/Fail-Grenze und keinen Unsafe-Summenwert.
- Eine Itemantwort wird nicht als stabiler persönlicher Glaube interpretiert.

## Letzte Freigabekontrolle

Vor dem ersten Hauptstudienfall werden einmalig geprüft:

1. die oben referenzierten Inhalte sind im tatsächlich ausgelieferten PassWo- und SecAware-Build
   weiterhin explizit vorhanden;
2. keine PassWo-interne Lernfrage kopiert Stem und Antwortmuster des externen Guardrails nahezu
   wortgleich;
3. Interface, Export und Runtime verwenden dieselben IDs, Optionen, Formzuweisungen und
   Klassifikationen;
4. der Cognitive Pretest zeigt keinen dominanten Längen-, Sprachstil- oder Absurdity-Cue.

Nach Studienbeginn werden Wortlaut und Klassifikation nicht anhand sichtbarer Gruppenunterschiede
verändert.
