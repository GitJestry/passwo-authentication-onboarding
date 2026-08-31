# ADR 0014 — Begrenzte lokale Passwort-Kandidatenanalyse

- **Status:** Accepted
- **Datum:** 2026-08-03
- **Analyseversion:** `passwo-bounded-whole-recognition-v21`
- **Citation label:** `ADR 0014-Bounded-Password-Guessing`

## Kontext

S05 und S06 benötigen eine nachvollziehbare Lehrsimulation für fiktive Werte. Sie entwickeln
keinen Password Strength Meter und treffen keine Aussage über reale Konten oder Angriffsdauer.

## Entscheidung

`@passwo/password-analysis` bleibt lokal, deterministisch und frameworkfrei. Die Verarbeitung
trennt:

1. authored und bibliotheksgestützte Befundkandidaten;
2. eine deterministische, nicht überlappende sichtbare Evidenz;
3. eine davon getrennte Vollpasswort-Disposition.

zxcvbn ist ausschließlich Hinweisquelle. Score, Guess-Zahlen und Crack-Zeiten werden weder
angezeigt noch als Schwelle verwendet. Konto-/Dienstkontext, vollständige Wörter, Tastaturmuster,
Jahre, Wiederholungen und Transformationen folgen den eingefrorenen v21-Prioritäten.

Die Disposition kennt nur:

```text
whole-password-recognized
no-whole-password-recognized
```

Ein positiver Zustand benötigt genau einen reproduzierbaren Weg: direkter Vollwert, begrenzte
quellengestützte Kandidatenfamilie, genau ein Anker mit begrenztem Rest oder vollständiger Suchraum.
Alle Wege teilen die authored Obergrenze `26^12`. Quellenfamilien werden vollständig gezählt;
erkannte Zielteile sind nicht kostenlos. Länge wird separat als `below-15` oder `at-least-15`
ausgegeben und erzeugt weder Treffer noch Sicherheitsfreigabe.

Teilnehmermarkierungen erklären die lokale Darstellung, beeinflussen die Disposition aber nicht.
S05 und S06 verwenden dieselbe reine Funktion; React und Controller enthalten keine zweite
Trefferlogik.

S06-Paarvergleiche sind getrennt und liefern nur `exact-match`, `derived-variant-match` oder
`no-derived-path-recognized`. Der begrenzte Abwandlungspfad verwendet NFC-normalisierte
Graphemcluster, restricted Damerau-Levenshtein mit Distanz 1–3 und höchstens `0,25` normalisierter
Distanz sowie genau den authored Kontobegriffs-Makropfad. Ein positiver Pfad muss den Quellwert
schrittweise exakt in den Zielwert überführen.

## Grenzen

- Ausschließlich fiktive Werte im Browser-RAM.
- Keine Netzwerk-, Storage-, Telemetrie- oder UI-Abhängigkeit.
- Keine externe Breach-, Blocklist- oder KI-Abfrage.
- Eingaben, Spans, Befunde, Distanzen und Dispositionen werden nicht übertragen oder exportiert.
- Fehlende Erkennung bedeutet nicht stark, sicher, zufällig oder unangreifbar.

Die vollständige, implementierungsnahe Regel steht in
`docs/research/PASSWORD-GUESSING-ANALYSIS.md`. Änderungen an Quellen, Budgets, Alphabeten,
Prioritäten oder Distanzen benötigen eine neue Analyseversion.
