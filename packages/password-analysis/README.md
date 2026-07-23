# Password Analysis Boundary

Dieses Package reserviert die reine Domänengrenze für die simulationsspezifische Auswertung
fiktiver Passwörter. Es enthält absichtlich noch keine Heuristik.

## Anforderungen an eine spätere Implementierung

- rein, deterministisch und vollständig lokal;
- keine Netzwerk-, Log-, Storage- oder Serverabhängigkeit;
- Ergebnisse erklären konkrete Wege statt eines pseudo-genauen „Security Scores“;
- Befunde aus S05: naheliegende Bestandteile, vorhersehbarer Aufbau, freies Ausprobieren;
- Beziehungen aus S06: gleich, ähnlich oder kein abgeleiteter Weg erkannt;
- explizite Unsicherheit und keine absolute Sicherheitszusage;
- fachlich geprüfte Fixtures und Grenzfälle;
- nie als Produktions-Passwortmeter bezeichnen.

Die eingegebenen Strings und Ergebnisse dürfen dieses Package nicht verlassen, außer als
flüchtiger Trainingszustand im Browser.
