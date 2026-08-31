# Begrenzte Passwort-Kandidatenanalyse

Status: **implementierte lokale Simulationsregel für S05 und S06.** Die Architekturentscheidung
steht in ADR 0014; der Code liegt unter `packages/password-analysis`.

## Aussagegrenze

Die Analyse erklärt an fiktiven Werten konkrete frühe Kandidatenwege. Sie ist kein Password
Strength Meter, keine Blocklist, keine NIST-Konformitätsprüfung und keine Prognose realer
Angriffsdauer. Zulässige äußere Ergebnisse sind ausschließlich:

```text
whole-password-recognized
no-whole-password-recognized
```

Eine fehlende Erkennung bedeutet nicht stark, sicher, zufällig oder unangreifbar. Länge wird
getrennt als Orientierung berichtet und ändert die Disposition nicht.

## Eingefrorene Konfiguration

- Analyse: `passwo-bounded-whole-recognition-v21`
- gemeinsame Kandidatengrenze: `26^12 = 95_428_956_661_682_176`
- zxcvbn-ts Core/Common `4.1.2`, Deutsch/Englisch `4.1.1`
- lokale deutsche und englische Wörterbücher, Passwortlisten, Tastaturgraphen und authored
  Konto-/Dienstbegriffe
- S06: case-sensitive restricted Damerau-Levenshtein auf NFC-Graphemclustern

zxcvbn liefert nur Befundkandidaten. Score, `guesses`, `guessesLog10` und Crack-Zeiten werden nicht
verwendet, angezeigt oder exportiert.

## Verarbeitung

```text
fiktiver Wert
  → lokale Matcher und authored Quellen
  → belegte Kandidatenspans
  → deterministische nicht überlappende Evidenz
  → begrenzter Vollpasswortweg
  → kategoriale Disposition
```

### Befunde und Vorrang

Unterstützt sind vollständige Passwortlistenwerte, sprachgebundene Wörter, Namen,
Konto-/Dienstkontext, Jahre und Daten, Folgen, Tastaturmuster, typische Endungen sowie exakte oder
einmal veränderte Wiederholungen.

Die kanonische Projektion maximiert belegte Abdeckung, verwendet bei Gleichstand weniger Befunde
und anschließend die authored Priorität. Wichtige Vorrangregeln:

- vollständiger Konto-/Dienstkontext vor inneren Wörterbuchtreffern;
- vollständige Wörter und authored Komposita vor künstlichen Teilungen;
- Jahre und Tastaturmuster vor generischen Endungen;
- deutsche und englische Wortzerlegung bleiben getrennt;
- kurze Wörter nur an belegten Grenzen oder als vollständige Partition;
- kuratierte Abkürzungen nur exakt, ohne Leetspeak oder Edit-Distance.

Teilnehmermarkierungen, Gruppen und Satzstrukturen sind flüchtige Erklärdaten und beeinflussen die
Disposition nicht.

### Vollpasswortwege

Ein positiver Zustand besitzt genau einen priorisierten Weg:

1. **Direkter Vollwert:** ein zulässiger Befund deckt den vollständigen Wert.
2. **Generierte Kandidatenfamilie:** belegte Quellen, Reihenfolgen, Trennzeichen und begrenzte
   Oberflächenänderungen erzeugen den Zielwert innerhalb des Budgets.
3. **Genau ein Anker plus Rest:** Quellenfamilie, Restalphabet und mögliche Ankerpositionen bleiben
   gemeinsam innerhalb des Budgets. Bei mehreren Ankern ist dieser Sonderweg gesperrt.
4. **Vollständiger Suchraum:** die beobachteten Zeichenklassen ergeben höchstens `26^12`
   Zeichenfolgen.

Erkannte Teile kosten ihre vollständige eingefrorene Quellenfamilie; sie werden nicht als bereits
bekannt mit Faktor `1` gezählt. Die authored Größen sind:

| Quelle | Obergrenze |
|---|---:|
| kurze gewöhnliche Wörter | 350 |
| sonstige Wörter und Namen | 80.000 |
| häufige Passwortwerte | 100.000 |
| explizite Passwortanker | 32 |
| Konto-/Dienstkontext | 64 |
| Jahr | 200 |
| Datum | 36.600 |
| Tastaturmuster oder Folge | 10.000 |
| Wortfolge | 10.000 |
| Wiederholungsmuster | 100.000 |

Diese Zahlen sind didaktische Familiengrößen, keine empirischen Rang- oder Stärkeaussagen.

## S05- und S06-Integration

S05 und jeder lokale S06-Einzelcheck rufen dieselbe reine Dispositionsfunktion auf. React,
Statecharts und Szenenprojektionen berechnen keine zweite Trefferlogik. Nur das kategoriale Ergebnis
und kausale automatische Befund-IDs dürfen innerhalb des laufenden Trainings weitergegeben werden;
Werte und Spans bleiben flüchtig.

S06-Paarvergleiche sind davon getrennt:

```text
exact-match
derived-variant-match
no-derived-path-recognized
```

Ein allgemeiner positiver Pfad benötigt Distanz 1–3 und normalisierte Distanz höchstens `0,25`.
Zusätzlich ist genau ein authored Makroschritt zulässig, der einen vollständigen Identifier des
Quellkontos durch einen vollständigen Identifier des Zielkontos ersetzt. Außerhalb der Identifier
gelten höchstens zwei Operationen, Restdistanz höchstens `0,25` und ein unveränderter Lauf von
mindestens vier Graphemclustern.

Der Domain-Layer liefert geordnete `PasswordTransformationStep`-Objekte. Ihre Anwendung muss den
normalisierten Quellwert exakt in den Zielwert überführen. Oberflächenmuster wie Leetspeak, Jahr,
Endzeichen oder Großschreibung erklären nur einen bereits akzeptierten Pfad; sie erzeugen keinen
zweiten Ähnlichkeitsalgorithmus.

## Datenschutz und Reproduzierbarkeit

- ausschließlich neue fiktive Werte im Browser-RAM;
- keine Netzwerk-, Storage-, Telemetrie- oder Serverabhängigkeit;
- keine externe Breach-, Wörterbuch- oder KI-Abfrage;
- keine Persistenz oder Übertragung von Eingaben, Spans, Befunden, Distanzen oder Ergebnissen;
- deterministische Quellen, Prioritäten und Tie-Breaker;
- synthetische Policy- und End-to-End-Korpora schützen Disposition, Segmentierung, Unicode,
  Vorrangregeln, Wiederholungen und S06-Pfade.

Die Korpora belegen reproduzierbares authored Verhalten, nicht Sensitivität, Spezifität oder
Passwortstärke. Änderungen an Quellen, Budgets, Alphabeten, Distanzen oder Prioritäten benötigen
eine neue Analyseversion.
