# S15–S17 Copy-Audit

## MFA-Ergebnis, Ausweitung und Trainingsabschluss, 26. August 2026

### Umfang und Quelle

Der ausdrückliche Nutzerauftrag vom 26. August 2026 ist die Inhalts-, Reihenfolge- und
Darstellungsentscheidung für den Abschluss nach der S14-Anmeldung. Er ersetzt den bisher nicht
implementierten Rest von S15 bis S17 durch die sichtbare 2FA-Schutzwirkung, die priorisierte
Ausweitung und die integrierte Zusammenfassung. Das bereitgestellte Bild `ketten.png` ist die
verbindliche Quelle für die lilafarbenen Ketten.

Die neue Contentquelle liegt unter `packages/training-content/src/s15-s17.ts` und beginnt mit der
Version `1.0.0`. Die Supportive-Artifact-Version steigt von `supportive-s00-s14-1.19.0` auf
`supportive-s00-s17-1.20.0`. Geschützter Wortlaut aus `TRAINING-COPY.md` bleibt unverändert.

### Copy-Delta

| Text-ID | Quelle / bisher | Implementierter Wortlaut | Primäre Rolle | Interaktionsziel | Hervorhebung | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|---|
| `S15.status.activated` | Nutzerauftrag; nicht vorhanden | `✓ 2FA aktiviert` | Ergebnisfeedback | kein | Häkchen, Text und blaues Schutzschild | bestätigt die sichtbare Einrichtung; freigegeben |
| `S15.guide.outcome` | Nutzerauftrag; nicht vorhanden | `Jetzt reicht das Passwort allein nicht mehr für die Anmeldung.` / `Selbst wenn es bekannt wird, müsste der Angreifer zusätzlich an deinen zweiten Faktor gelangen.` | Mechanismuserklärung | `Weiter` | keine | erklärt die Wirkung des soeben sichtbaren zweiten Faktors ohne Sicherheitsgarantie; freigegeben |
| `S16.guide.prioritize` | Nutzerauftrag; nicht vorhanden | `Es kann sich zuerst nach viel anfühlen, 2FA für viele Konten einzurichten. Das ist völlig normal.` / `Fang deshalb auch hier zuerst bei deinen wichtigen Konten an.` | Orientierung und Kerngedanke | `Schutz auf weitere Konten ausweiten` | keine | normalisiert den Aufwand und gibt die ausdrücklich gewünschte Priorisierung vor; freigegeben |
| `S16.action.expand` | Nutzerauftrag; nicht vorhanden | `Schutz auf weitere Konten ausweiten` | Navigation | Ketten auf bekannten und ausgewählten weiteren Konten | keine | handlungsspezifische Primäraktion löst exakt den sichtbaren Effekt aus; freigegeben |
| `S17.guide.expanded` | Nutzerauftrag; nicht vorhanden | `Bei anderen Konten kannst du genauso vorgehen: Prüfe, ob 2FA angeboten wird, und suche in den Sicherheits- oder Kontoeinstellungen nach der Aktivierung.` / `Unsere Konten haben jetzt eigene starke Passwörter. Und bei wichtigen Konten reicht das Passwort für den Angreifer allein nicht mehr aus.` | Navigation und integrierter Kerngedanke | `Training abschließen` | `eigene` · positiv; `starke` · blau; `reicht das Passwort für den Angreifer allein nicht mehr aus.` · lila | ausdrücklich vorgegebene Zusammenführung und Farbcodierung; drei gruppierte Hervorhebungen sind für diesen freigegebenen Abschluss die dokumentierte Ausnahme; freigegeben |
| `S17.action.complete` | Nutzerauftrag; nicht vorhanden | `Training abschließen` | Navigation | Abschluss des Supportive Artefakts und Übergang zum Post-Fragebogen | keine | benennt den tatsächlichen Trainingsabschluss; freigegeben |

Die S17-Sprechblase überschreitet das normale Zielbudget, weil die beiden ausdrücklich
vorgegebenen Gedanken gemeinsam den letzten sichtbaren Trainingszustand erklären. Sie bleiben als
zwei getrennte Absätze lesbar und werden nicht durch kleinere Schrift oder zusätzliche Flächen
kompensiert.

### Interaktions- und Darstellungsdelta

- Nur die sichtbare Browser-Schließen-Steuerung beendet S14. Danach wird Master Campus blau und
  erhält den vorhandenen Schutzschild; die grünen Vorschauverbindungen werden aus dem Snapshot
  entfernt.
- `✓ 2FA aktiviert` und das Konfetti erscheinen gemeinsam. Nach Ende der Bewegungssequenz erhält
  zunächst ausschließlich Master Campus die lilafarbenen Ketten aus dem bereitgestellten PNG.
- `Schutz auf weitere Konten ausweiten` ergänzt die Ketten auf allen bekannten Trainingskonten und
  deterministisch auf jedem vierten anonymen Zusatzkonto. Die Auswahl ist reine Darstellung,
  enthält keine Teilnehmerentscheidung und wird weder gesendet noch persistiert.
- `Training abschließen` erreicht den bereits vorhandenen Supportive-Completion-Port. Erst nach
  serverseitig bestätigtem `supportive:complete` beginnt der gemeinsame Post-Fragebogen.
- S15, S16 und S17 besitzen eigene lokale Design-Lab-QA-Einstiege. Die produktive Wiederaufnahme
  öffnet gemäß ADR 0016 ab S08 den Einstieg des zuletzt bestätigten Segments und rekonstruiert
  ausschließlich den erlaubten minimalen Resume-Zustand.
- Reduced Motion zeigt dieselben Endzustände ohne Konfetti- beziehungsweise Kettenankunftsbewegung.
  Häkchen, Text, Schutzschild und Ketten stellen die Bedeutung nicht allein über Farbe dar.

### Review-Gate

- Alle sichtbaren Texte stammen wortgleich aus dem ausdrücklichen Nutzerauftrag.
- Die beiden fachlichen Aktionen lösen jeweils exakt den bezeichneten Zustand aus.
- Der Abschluss behauptet weder absoluten Schutz noch die Sicherheit eines realen Kontos.
- Es entstehen keine neue Inhaltsdatenklasse und kein Browser Storage. Die später ergänzten
  Segment-Checkpoints führen ausschließlich inhaltsfreie IDs.

## Folgekorrektur: einzelne Sprechblasen und Knotenfeedback, 26. August 2026

Der präzisierende Nutzerauftrag vom 26. August 2026 ändert keinen Wortlaut und keine Textrolle.
Er ersetzt ausschließlich die Gruppierung und Platzierung. Die Contentversion steigt deshalb auf
`1.1.0`, die Supportive-Artifact-Version auf `supportive-s00-s17-1.21.0`.

### Darstellungsdelta

- Die beiden S15-Aussagen, die beiden S16-Aussagen und die beiden S17-Aussagen werden jeweils in
  aufeinanderfolgenden eigenen PassWo-Sprechblasen gezeigt.
- Bereits während `✓ 2FA aktiviert` trägt Master Campus die lilafarbenen Ketten. Ein kleines
  knotenbezogenes `2FA aktiviert`-Feedback und Mini-Konfetti begleiten die Kettenankunft.
- Beim Ausweiten erhalten ausschließlich die neu ergänzten Kettenknoten dasselbe kleine
  Textfeedback und Mini-Konfetti; Master Campus wird nicht erneut bestätigt.
- Die S17-Zusammenfassung bleibt als letzte PassWo-Sprechblase sichtbar. Die Aktion
  `Training abschließen` liegt nicht in der Sprechblase, sondern als große gläserne Primäraktion
  in der Bildschirmmitte.
- Reduced Motion erhält Schild, Ketten und Textfeedback als nichtfarbliche Bedeutungsträger,
  unterdrückt aber die Mini-Konfetti- und Ankunftsbewegung.

## Folgekorrektur: MFA-Kerngedanken und Knotenpuls, 26. August 2026

Der erneute Nutzerauftrag verändert keinen Wortlaut. Er präzisiert die Carry-forward-Markierung
zweier bereits getrennter Sprechschritte und die dazugehörige Netzwerkbewegung. Die Contentversion
steigt auf `1.2.0`, die Supportive-Artifact-Version auf `supportive-s00-s17-1.22.0`.

| Text-ID | Wortlaut | Primäre Rolle | Interaktionsziel | Hervorhebung | Grund und Bedeutungsänderung |
|---|---|---|---|---|---|
| `S15.guide.outcome.secondFactor` | `Selbst wenn es bekannt wird, müsste der Angreifer zusätzlich an deinen zweiten Faktor gelangen.` | Mechanismuserklärung | `Weiter` | `zweiten Faktor` · lila MFA-Ton | trägt die zusätzliche Hürde als Kerngedanken weiter; keine Bedeutungsänderung |
| `S17.guide.expanded.howTo` | `Bei anderen Konten kannst du genauso vorgehen: Prüfe, ob 2FA angeboten wird, und suche in den Sicherheits- oder Kontoeinstellungen nach der Aktivierung.` | Mechanismuserklärung | `Weiter` | `Bei anderen Konten kannst du genauso vorgehen:` · blauer Akzent | markiert die Übertragbarkeit auf weitere Konten; keine Bedeutungsänderung |

Während des zweiten S15-Sprechschritts pulsiert der bereits verkettete Master-Campus-Knoten einmal
kurz auf. Die Bewegung ergänzt die Textmarkierung, trägt aber keine alleinige Bedeutung und wird
bei Reduced Motion unterdrückt.

Der Abschlussweg bleibt unverändert: Die zentrale Aktion bestätigt zuerst serverseitig
`supportive:complete`; erst nach erfolgreichem Artefaktende wird der gemeinsame Post-Fragebogen
geöffnet. Der minimale `supportive-s08-resume-v1`-Zustand wird dabei gelöscht.

## Laufzeitkorrektur: segmentgenaue Wiederaufnahme, 26. August 2026

Der präzisierende Nutzerauftrag verändert keinen Teilnehmerwortlaut und keine Textrolle. Ab dem
bestätigten S08-Übergang öffnet eine Wiederaufnahme den Einstieg des zuletzt bestätigten Segments
S08 bis S17. Der minimale `supportive-s08-resume-v1`-Zustand bleibt die einzige persistierte
Trainingszustandsklasse; zusätzlich wird im bereits autorisierten inhaltsfreien
Fortschritts-Checkpoint ausschließlich die Segment-ID geführt. Passwortstrings, Teilstrings und
lokale Detailbefunde bleiben vollständig flüchtig. Die Supportive-Artifact-Version steigt auf
`supportive-s00-s17-1.23.0`.
