# ADR 0011 — Lokaler PDF-Viewer für SecAware-Zusatzinformationen

- **Status:** Accepted
- **Datum:** 2026-07-30
- **Ergänzt:** ADR 0009 (Desktop Runtime und SecAware-Zusatznavigation)

## Kontext

Der native Chromium-PDF-Viewer zeigt das eingefrorene BSI-Faktenblatt in Electron 43 innerhalb
eines `WebContentsView` nur als schwarze Fläche. Die Freigabe des PDF-Plugins und der internen
Chromium-Viewer-Extension behebt die Darstellung nicht zuverlässig. Ein externer Systemviewer
würde den kontrollierten Rückweg in den unveränderten SecAware-Kurs verlassen.

## Entscheidung

Kanonische Zusatzlinks tragen neben ID und URL die Darstellungsart `web` oder `pdf`. Webseiten
bleiben im nicht persistenten, sandboxed externen `WebContentsView`. PDFs werden durch das lokal
gebündelte `pdfjs-dist` in einer separaten same-origin Viewer-Seite innerhalb eines ebenfalls
sandboxed `WebContentsView` dargestellt.

Der Main-Prozess lädt PDF-Daten ausschließlich für eine kanonische PDF-ID über einen
cookie-freien, abbrechbaren HTTP(S)-Stream. Er akzeptiert nur erfolgreiche Antworten mit
`application/pdf`, höchstens 10 MiB und gültiger PDF-Signatur. Höchstens fünf ebenfalls auf
HTTP(S) begrenzte Weiterleitungen sind zulässig. Der Abruf endet nach 15 Sekunden.
Die Bytes bleiben flüchtig im Speicher und gelangen über ein ausschließlich empfangendes Preload
an den lokalen Viewer. Link-ID und URL werden nicht an die Viewer-Seite weitergegeben.

PDF.js und sein Worker werden mit dem Study-Web-Build ausgeliefert. Die Viewer-Seite erlaubt
keine externe Navigation, Downloads, Popups, Formulare oder Berechtigungen. Ein Schließen des
Viewers bricht einen laufenden Abruf ab und verwirft alle Dokumentbytes. Timing, Operational Lease,
Kurszustand und Forschungsdaten bleiben unverändert.

## Konsequenzen

- `pdfjs-dist` ist eine fest gesetzte lokale Renderer-Abhängigkeit.
- Die öffentliche Desktop-Bridge bleibt auf kanonische Link-IDs und Öffnen/Schließen begrenzt.
- Fehler werden ohne URL, Antwortinhalt oder Eingabewerte als neutrale lokale Meldung angezeigt.
- Der native Chromium-PDF-Viewer und seine Extension-Origin sind nicht mehr Teil der erlaubten
  Navigation.
