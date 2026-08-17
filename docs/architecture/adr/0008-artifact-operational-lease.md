# ADR 0008 — Operative Artefakt-Lease

- **Status:** Für neue Hauptstudien-Websitzungen durch ADR 0016 ersetzt; lokal als Legacy erhalten
- **Datum:** 2026-07-25
- **Citation label:** `ADR 0008-Lease`
- **Aktueller Geltungsbereich:** historische und derzeitige lokale Electron-Runtime

## Aktuelle Einordnung

Für neue Hauptstudien-Websitzungen ist Schließen oder Neuladen des Browsers eine Unterbrechung und
kein `incomplete-reload`. Wiederaufnahme und aktive Zeitintervalle richten sich nach
`ADR 0016-Web-Resume-Lifecycle`. Die nachfolgende Lease bleibt nur dokumentiert, weil sie in der
lokalen Runtime implementiert ist und historische Sitzungen interpretierbar bleiben müssen.

## Historische Entscheidung

Eine laufende Artefaktsitzung erhält zusätzlich zu den Forschungstimingevents eine getrennte
operative Lease. Sie enthält nur die pseudonyme Session-ID, den letzten Heartbeat und einen
Schließzeitpunkt. Die Lease wird vor dem Timing-Start aktiviert, damit ein Reload auch während
`starting` oder nach einem fehlgeschlagenen Start-Timingwrite als `incomplete-reload` erfasst
werden kann.

Der Browser sendet während einer aktiven Artefaktsitzung alle 60 Sekunden einen Heartbeat sowie
unmittelbar nach `visibility-visible`. Eine Lease läuft nach fünf Minuten ohne Heartbeat ab. Der
Cleanup markiert ausschließlich eine noch offene, tatsächlich abgelaufene Lease einmalig als
`incomplete-reload` und schließt sie dabei. Artefaktende, expliziter Reload-Abbruch und
Studienabschluss schließen die Lease ebenfalls. Ein Heartbeat kann eine geschlossene Lease oder
eine nicht mehr laufende Sitzung nicht reaktivieren.

## Datenstatus und Fehlerverhalten

Leases sind Betriebsmetadaten, keine Forschungstimingevents: Sie beeinflussen weder
`artifactWallClockMs` noch Sequenzen und erscheinen nicht in Timing-, Sessions- oder
Responses-Exporten. Ein fehlgeschlagener Heartbeat erzeugt deshalb keinen Forschungsschreibfehler
und blockiert keinen Studienübergang; der nächste reguläre Heartbeat kann erneut versucht werden.
Bleiben Heartbeats aus, dokumentiert der serverseitige Ablauf nach fünf Minuten den technischen
unvollständigen Status. Dadurch bleibt ein Durchlauf über 30 Minuten mit fortlaufenden Heartbeats
aktiv, ohne dass Timingevents als Aktivitätsbeleg missbraucht werden.

## Konsequenzen

- Reload-Markierung hängt nicht von einem persistierten `artifact.start` ab.
- Operative Lease-Daten brauchen eine eigene SQLite-Tabelle und ein eigenes API-Paar.
- Forschungsexporte und ihr Manifest bleiben frei von Heartbeat-Zeitpunkten.
- Die Fristen sind als Laufzeitkonfiguration im Code zentral festgelegt und durch Tests abgesichert.
