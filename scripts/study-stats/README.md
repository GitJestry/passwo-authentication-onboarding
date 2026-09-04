# Studienstatistik

`pnpm study:stats` liest die Produktionsdatenbank per SSH und SQLite read-only. Der Standardmodus
zeigt einen kompakten Studienüberblick, die Rekrutierungsquellen mit ihrer jeweiligen
Session-Anzahl, den Vergleich der Lernangebote und die Trainingsdauer. Session-IDs,
Forschungskennungen, einzelne Antworten und Kontaktdaten werden nicht ausgegeben.

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
zählt nicht mit. Der angezeigte Durchschnitt schließt je Lernangebot Werte außerhalb der
1,5-IQR-Grenzen aus und nennt die Zahl der entfernten Werte. Bei weniger als vier Abschlüssen
wird nichts ausgeschlossen; die gespeicherten Daten bleiben immer unverändert. Die Dauerpassung
gibt unabhängig davon die tatsächlichen Anteile der Antworten `genau richtig`, `zu kurz`
(Skalenwerte 1–3) und `zu lang` (Skalenwerte 5–7) wieder. Ein gerundeter Mittelwert wird nicht als
Antworttext ausgegeben, weil sich gegensätzliche Urteile darin gegenseitig aufheben könnten.
`completed` bedeutet, dass Artefakt sowie alle erforderlichen Instrumentblöcke gespeichert sind.

Voraussetzungen sind lokaler OpenSSH-Zugriff und `sqlite3` auf dem Zielhost. Das Skript verändert
keine Produktivdaten.
