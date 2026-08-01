# Training Segment Index

Seitenangaben beziehen sich auf die im Trainingsdokument ausgewiesene interne Paginierung.

| ID | Titel / Funktion | Quelle | Primäre Foci | Kernmechaniken |
|---|---|---:|---|---|
| S00 | Entry and safety boundary | 2 | TF1, TF2, TF6 | Display name, Safety Note, Pflichtbestätigung, PassWo-Flug |
| S01 | Ordinary account setup | 3 | TF2, TF3 | drei fiktive Passwörter, freie Tabreihenfolge |
| S02 | Konten verstehen | 4–7 | TF2, TF3, TF4 | Knotennetz, Unlock, Vorschaukarten, 0/3–3/3 |
| S03 | Wieder anmelden | 8–11 | TF1, TF3, TF6 | Abrufbarkeit, Skip ohne Beschämung, Status |
| S04 | Datenleck bei Campusgram | 12 | TF4 | Warnung im Browser-Tab, Offline-Prüfung, Übergang zur Analyse |
| S05 | Einzelstärke des Passworts | 12–35 | TF3, TF4, TF6 | Bestandteile, Aufbau, freies Ausprobieren, Zusammenführung |
| S06 | Passwortvergleich und Ausbreitungswege | 36–44 | TF3, TF4 | identisches Passwort / konkret ableitbare Variante / kein ableitbarer Weg erkannt, tatsächliche und hypothetische Pfade |
| S07 | Diagnose | 44–50 | TF1, TF4, TF6 | drei Kontokarten, priorisierte nächste Handlung |
| S08 | Passwörter überarbeiten | 50–53 | TF3, TF5, TF6 | sechs zufällige Wörter, adaptive Bearbeitung |
| S09 | Neue Wirkung ansehen | 53–55 | TF4, TF5 | beschleunigte Konsequenzsimulation |
| S10 | Zusammenfassung Passwort | 55–57 | TF6 | stark, einzigartig, abrufbar |
| S11 | Von drei zu vielen Konten | 57–60 | TF1, TF2, TF4, TF6 | Skalierungsproblem, Übergang Passwortmanager |
| S12 | Passwortmanager | 60–65 | TF2, TF3, TF4, TF6 | Generator, Save, Autofill, Vault, Recovery, Systemwahl |
| S13 | Passwort kann bekannt werden | 65–66 | TF4 | Brücke zu MFA |
| S14 | Mehrere Faktoren | 66–67 | TF2, TF3, TF6 | Wissen/Besitz/Inhärenz, Aktivierungssimulation |
| S15 | Recovery-Hinweis | 67–68 | TF6 | geschützter Wiederherstellungscode, Grenzen |
| S16 | Priorisierung/Ausweitung | 68 | TF1, TF6 | wichtige Konten zuerst, MFA wo verfügbar |
| S17 | Integrierte Zusammenfassung | 69–71 | TF4, TF6 | vier Schutzebenen, letzter Guardrail |

## Implementierte S05-Version

- S05.0 bis S05.4 verwenden die internen Seiten 12 bis 35 als Inhaltsquelle und sind im Design Lab
  sowie im realen Supportive-Training zwischen S04 und dem stabilen Zustand
  `awaiting-s06` vollständig durchspielbar. Beide Pfade verwenden dieselbe Komponente und denselben
  lokalen Controller.
- S05.2 zeigt Thema, Satzstruktur, Wiederholung und Passwortkontext nacheinander. Thema und
  Satzstruktur bleiben ausschließlich feste redaktionelle Demonstrationen.
- Die lokale Laufzeitanalyse benennt nur exakte Wiederholung, eine feste Konto-/Kontextbeziehung
  mit erkanntem Zahlenmarker oder Anhang sowie eine begrenzte Beziehung bereits erkannter
  Bestandteile. Andernfalls lautet der Befund ausschließlich „kein einfacher Zusammenhang
  erkannt“.
- S05.3 berechnet theoretische Suchräume ausschließlich für deklarierte Demonstrationen mit
  unabhängiger Zufallsauswahl, festem Zeichenvorrat, vollständigem Durchprobieren und einer
  Billion Versuchen pro Sekunde. Kandidatenzahlen bleiben exakte Ganzzahlen; für das fiktive
  Passwort werden keine Zeit, effektive Länge, Entropie oder Gesamtstärke berechnet.
- Die Simulationsdisposition benennt entweder eine konkrete erkannte Regel als schnelleren Weg
  oder ausschließlich: „Mit den begrenzten Wegen dieser Simulation wurde kein schnellerer Weg
  erkannt.“ Der zweite Befund bedeutet nicht stark, sicher, zufällig oder unangreifbar.
- Die sechs Beispielwörter sind ein festes Demonstrationsbeispiel. Wortliste und produktiver
  Generator bleiben ausschließlich S08 vorbehalten.

## Sections

- `passwords`: S00–S11
- `password-manager`: S12–S13
- `mfa`: S14–S17

## Globale Interaktionsregel

Bei erklärenden Simulationen gilt grundsätzlich:

1. PassWo erklärt einen kurzen Gedanken.
2. Eine zentrale visuelle Veränderung geschieht.
3. Der Nutzer kann die Animation wiederholen oder weitergehen.

## Globale Datenschutzregel

- Nur fiktive Passwörter.
- Standardmäßig maskiert; lokaler Reveal ist möglich.
- Eingaben und Analysen bleiben im Browser-Arbeitsspeicher.
- Keine Trainingsentscheidung wird in Study Responses codiert.
