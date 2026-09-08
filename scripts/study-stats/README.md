# Studienstatistik

`pnpm study:stats` liest die Produktionsdatenbank per SSH und SQLite read-only. Der Standardmodus
zeigt einen kompakten Studienüberblick, die Rekrutierungsquellen mit ihrer jeweiligen
Session-Anzahl, den Vergleich der Lernangebote, die Trainingsdauer und die Nachbefragung nach
ungefähr zehn Tagen. Session-IDs,
Forschungskennungen, einzelne Antworten und Kontaktdaten werden nicht ausgegeben.

```bash
pnpm study:stats
```

Die kompakte Nachbefragungstabelle enthält je Lernangebot drei Zeilen: Ersetzen eines
wiederverwendeten oder leicht veränderten Passworts, Erzeugen und Speichern eines
kontospezifischen Passworts mit einem Passwortmanager sowie Aktivieren von MFA/2FA. Angezeigt
werden `n` vollständige Nachbefragungen und je Handlung die Anzahl und der gerundete Anteil von
`Ja`, `Nein` und `Unsicher`. Auch ohne Abgaben bleiben beide Lernangebote sichtbar (`n = 0`,
Antwortverteilungen `—`). Rundung kann zu einer Prozentsumme ungleich 100 führen.

Die Auswertung verwendet ausschließlich vollständige Submissions von `follow-up-v6-pilot` mit
passenden Antwortversionen aus abgeschlossenen Hauptsitzungen mit Follow-up-Einwilligung.
Nichtantwort geht nicht in die Antwortverteilungen ein und wird nicht als `Nein` codiert;
`Unsicher` bleibt separat. `n` ist keine Rücklaufquote unter bereits Eingeladenen. Es gibt keinen
Gesamtwert über die drei Handlungen. Die Angaben sind kurzfristige Selbstberichte unter freiwillig
Antwortenden und kein kausaler oder langfristiger Wirkungsnachweis. Optionale Gründe für `Nein`
bleiben außerhalb dieser kompakten Übersicht. Der Standardmodus liest weiterhin ausschließlich
`study.sqlite` und gibt nur Aggregate aus.

Nur der explizite Kontaktmodus liest `recontact.sqlite`:

```bash
pnpm study:stats -- --show-emails
```

Er zeigt E-Mail-Adresse sowie Follow-up-Beginn und -Ende. Die Spalte `Nachbefragung` zeigt
`abgeschlossen`, sobald die vollständige Follow-up-Submission gespeichert ist, andernfalls
`noch nicht abgegeben`. Dazu wird `study.sqlite` ebenfalls read-only geöffnet und nur die Existenz
der Submission (`follow-up-v1`, Abschnitt `actions`) je registrierter Sitzung herangezogen;
einzelne Antworten werden nicht gelesen. Gleichlautende E-Mail-Adressen bleiben getrennte
Registrierungen und werden nicht allein über die Adresse als abgeschlossen markiert.

In dieser ersten Liste ergänzt
`Einladungsstatus` den Versandstand: Im Terminal sind fällige, noch nicht als versendet bestätigte
Einladungen innerhalb ihres offenen Follow-up-Fensters gelb und bestätigte Versände grün.
Zukünftige, noch nicht terminierte und unbestätigte Einladungen mit geschlossenem Fenster bleiben
ungefärbt. Die Statusspalte bleibt auch ohne Farbe lesbar; bei umgeleiteter Ausgabe, `TERM=dumb`
oder gesetztem, nicht leerem `NO_COLOR` werden keine Farbcodes ausgegeben.

Eine separate Liste zeigt nach bestätigtem Erstversand für noch nicht abgeschlossene
Nachbefragungen zusätzlich den Einladungsversand, den frühesten Erinnerungszeitpunkt,
das Fensterende und einen gegebenenfalls bestätigten Erinnerungsversand. Die Erinnerung liegt
frühestens 48 Stunden nach bestätigtem Erstversand und nicht vor dem geplanten Erinnerungstermin;
das ursprüngliche Fensterende bleibt bestehen. Liegt der früheste Erinnerungszeitpunkt am oder
nach dem Fensterende, erscheint `kein Zeitfenster mehr`.

Der Abschlussstatus entspricht dem Zeitpunkt der Abfrage. Vor dem Einzelversand wird die Operation
wie in [WEB-DEPLOYMENT.md](../../docs/operations/WEB-DEPLOYMENT.md#follow-up) beschrieben mit
`followup:confirm-delivery` ohne `--confirm` geprüft.

Diese Ausgabe ist personenbezogen und darf nicht weitergegeben oder geloggt werden. Tokens und
Forschungskennungen bleiben verborgen.

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
