# Training Segment Index

Der Index beschreibt den vollständig implementierten Trainingslauf. Kanonische Texte, Reihenfolge
und Mechaniken liegen in den versionierten Dateien unter `packages/training-content/src/`.

| ID | Funktion | Kernmechanik | Implementierung |
|---|---|---|---|
| S00 | Einstieg und Safety Boundary | fiktiver Anzeigename, Bestätigung, PassWo-Einstieg | `s00.ts` |
| S01 | Konten einrichten | drei fiktive Passwörter, freie Tabreihenfolge | `s01.ts` |
| S02 | Konten kennenlernen | freie Kontowahl, geführte Netzwerkvorschauen | `s02.ts` |
| S03 | Wieder anmelden | Abrufbarkeit, optionale Hilfe, Skip | `s03.ts` |
| S04 | Campusgram-Datenleck | Warnung und Angreiferperspektive | `s04.ts` |
| S05 | Einzelpasswort betrachten | Bestandteile, Aufbau, Kandidatenwege, Länge | `s05.ts` |
| S06 | Wiederverwendung und Ähnlichkeit | lokale Konto- und Paarvergleiche | `s06.ts` |
| S07 | Passphrase erstellen | lokaler Generator und Campusgram-Wechsel | `s07.ts` |
| S08 | Passwörter überarbeiten | offene Befunde und Beziehungen auflösen | `s08.ts` |
| S09 | Passwortprinzipien | Zusammenfassung und Skalierungsübergang | `s09.ts` |
| S10 | Passwortzusammenfassung | stark, einzigartig, abrufbar | `manifest.ts`, integrierter Lauf |
| S11 | Viele Konten | Skalierungsproblem und Passwortmanager-Einstieg | `manifest.ts`, integrierter Lauf |
| S12 | Passwortmanager | Generator, Save, Autofill, Vault, Recovery | `s12.ts` |
| S13 | Kontopraxis | Registrierung, Passwortwechsel und Autofill | `s13.ts` |
| S14 | Faktoren | Wissen, Besitz, Inhärenz und Aktivierung | `s14.ts` |
| S15 | Wirkung von MFA | zusätzliche Hürde sichtbar machen | `s15-s17.ts` |
| S16 | Priorisierung | wichtige Konten zuerst | `s15-s17.ts` |
| S17 | Abschluss | Passwortmanager, eigene Passwörter und MFA verbinden | `s15-s17.ts` |

## Abschnitte

- `passwords`: S00–S11
- `password-manager`: S12–S13
- `mfa`: S14–S17

## Globale Grenzen

- Study- und Training-Statechart bleiben getrennt.
- Anzeigename, fiktive Passwörter und lokale Analysen bleiben flüchtig.
- Der tab-lokale S01–S07-Reload-Checkpoint und der minimale S08-Resume-Zustand folgen ADR 0016.
- Ein Lernschritt verbindet einen kurzen Gedanken, eine zentrale sichtbare Änderung und eine
  eindeutige Handlung.
- Reduced Motion und Tastaturbedienung führen zum selben fachlichen Endzustand.
