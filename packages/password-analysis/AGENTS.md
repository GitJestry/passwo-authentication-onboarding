# AGENTS.md — password-analysis

- Dieses Package analysiert ausschließlich fiktive Eingaben im Arbeitsspeicher.
- Keine Netzwerk-, Storage-, Telemetrie- oder UI-Abhängigkeiten.
- Eingaben und Ergebnisse bleiben flüchtiger Trainingszustand im Browser und verlassen die
  Package-Grenze nicht zur Persistenz oder Übertragung.
- Ergebnisse sind begrenzte Simulationsbefunde, keine Produktionsstärke oder Sicherheitsgarantie.
- Heuristiken sind rein, vollständig lokal, deterministisch und erklären konkrete erkannte Wege
  statt eines pseudo-genauen Scores.
- S05-Befunde sind auf naheliegende Bestandteile, vorhersehbaren Aufbau und freies Ausprobieren
  begrenzt.
- S06-Beziehungen unterscheiden ausschließlich gleich, ähnlich oder keinen erkannten
  abgeleiteten Weg.
- Ergebnisse benennen Unsicherheit ausdrücklich; fachliche Fixtures und Grenzfälle werden
  einzeln geprüft.
- Reale Breach-Corpora oder externe Passwortdienste sind nicht zulässig.
