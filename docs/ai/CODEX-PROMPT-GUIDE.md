# Codex Prompt Guide

## Grundsatz

Codex erhält genau eine vertikale Aufgabe, wenige relevante Quellen und überprüfbare
Akzeptanzkriterien. Hintergrundwissen wird per Pfad referenziert statt in jedem Prompt wiederholt.

## Kompakte Promptstruktur

```text
Aufgabe:
[Verb + konkretes Ergebnis]

Lies zuerst:
- AGENTS.md
- [maximal 3–5 relevante Dateien]

Ändere nur:
- [erlaubte Pfade]

Akzeptanzkriterien:
- [beobachtbar/testbar]
- ...

Nicht-Ziele:
- [explizite Abgrenzung]

Checks:
- [Befehle]

Abschlussbericht:
- geänderte Dateien
- ausgeführte Checks
- offene Risiken/Entscheidungen, maximal 3
```

## Token sparen

- Segment über ID und Seitenbereich adressieren, nicht das gesamte Skript einfügen.
- `docs/ai/TASK-ROUTING.md` nutzen.
- Keine allgemeinen Aufforderungen wie „verbessere die Architektur“.
- Keine zweite Aufgabe als Nebensatz.
- Vorhandene Ports und ADRs benennen, statt Architektur neu erklären zu lassen.
- Bei reinem Content-Task keine Serverdokumente lesen lassen.
- Bei reinem Server-Task keine 71-seitige Trainingsquelle lesen lassen.

## Gute Akzeptanzkriterien

Gut:

- „Beim Verlassen von S02 wird genau ein `end`-Timingevent mit `segmentId=S02` gesendet.“
- „`displayName` kommt in keinem Fetch-Body und keinem Storage-Aufruf vor.“
- „Reduced Motion zeigt PassWo unmittelbar in der Endposition und aktiviert dieselben Controls.“

Schlecht:

- „Die Animation soll schön sein.“
- „Der Code soll sauber sein.“
- „Mach das Training fertig.“

## Wann zuerst ein Plan statt Code nötig ist

Nur wenn mindestens eines zutrifft:

- Persistenz-, Randomisierungs- oder Timinggrenze ändert sich;
- eine neue Kernbibliothek wird erwogen;
- ein Segment besitzt widersprüchliche fachliche Anforderungen;
- mehr als drei Packages müssen ihre öffentliche API ändern.

Dann lautet der Auftrag: Optionen vergleichen, ADR-Entwurf erstellen, noch keinen Produktcode
ändern.
