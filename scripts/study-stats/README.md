# Studienstatistik

`pnpm study:stats` liest die Produktionsdatenbank per SSH und SQLite read-only. Der Standardmodus
zeigt aggregierte Sessions, Completion, Trainingsdauer, Instrumentstatus, Rekrutierungsquellen und
Konsistenzhinweise. Session-IDs, Forschungskennungen, Antworten und Kontaktdaten werden nicht
ausgegeben.

```bash
pnpm study:stats
```

Nur der explizite Kontaktmodus liest `recontact.sqlite`:

```bash
pnpm study:stats -- --show-emails
```

Er zeigt ausschließlich E-Mail-Adresse sowie Follow-up-Beginn und -Ende. Diese Ausgabe ist
personenbezogen und darf nicht weitergegeben oder geloggt werden. Tokens und Forschungskennungen
bleiben verborgen.

Abweichende Verbindungen:

```bash
pnpm study:stats -- \
  --host root@193.23.254.118 \
  --database /var/lib/passwo-study/study.sqlite \
  --identity-file /pfad/zum/ssh-key
```

Alternativ gelten `PASSWO_STATS_HOST`, `PASSWO_STATS_DATABASE`,
`PASSWO_STATS_RECONTACT_DATABASE` und `PASSWO_STATS_SSH_KEY`. Der SSH-Key bleibt außerhalb des
Repositorys.

Die Trainingsdauer summiert bestätigte Intervalle abgeschlossener Lernangebote; Offline-Zeit
zählt nicht mit. `completed` bedeutet, dass Artefakt sowie alle erforderlichen Instrumentblöcke
gespeichert sind. Der letzte Checkpoint ist Wiederaufnahmezustand, keine Live-Anzeige.

Voraussetzungen sind lokaler OpenSSH-Zugriff und `sqlite3` auf dem Zielhost. Das Skript verändert
keine Produktivdaten.
