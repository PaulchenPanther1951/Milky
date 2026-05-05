# Milky

Eine kleine Galaxie fuer jeden ausgefallenen Milchzahn.

Milky ist ein liebevolles Tagebuch fuer Kinder und Eltern: jeder Milchzahn wird zu einem Stern in einer wachsenden Konstellation. Foto vor dem Ausfall, Foto nachher, kurze Notiz, vielleicht ein Audio-Memo — und am Ende, wenn der letzte Milchzahn raus ist, ist die Galaxie komplett.

> **Privates Hobbyprojekt — keine kommerzielle Absicht.** Keine Werbung, keine
> Spenden, keine Datenverarbeitung auf Servern, keine Gewerbeanmeldung.
> „Fianuk Studio" ist ein privater Projektname, kein Unternehmen.
> Nutzung auf eigenes Risiko, ohne Gewährleistung. Quellcode unter
> [MIT-Lizenz](./LICENSE) — frei nutzbar.
>
> Verantwortlich (privat): Maximilian Otto Paul · maximilian.otto.paul@web.de

## Tech

Vite + React + TypeScript + IndexedDB (`idb`) + PWA (`vite-plugin-pwa`).

## Lokale Entwicklung

```bash
npm install
npm run dev          # http://localhost:5174 — testen am Desktop
npm run host         # gleiche App im LAN, z.B. http://192.168.x.x:5174 — testen am Handy
```

## Build

```bash
npm run build
npm run preview
```

## Icons regenerieren

App-Icons (192/512/180/maskable) werden aus einer Master-SVG via `sharp` erzeugt:

```bash
npm run build:icons
```

## Hosting (GitHub Pages)

Es liegt ein Workflow unter `.github/workflows/deploy.yml`. Aktivierung:
1. Repo auf public schalten (Pages auf privatem Repo braucht GitHub Pro).
2. Repo-Settings → Pages → Source = "GitHub Actions".
3. Push auf `main` triggert das Deployment automatisch.

## Projekt-Uebersicht

`docs/01-uebersicht.html` — komplette Roadmap, Vision, Entscheidungen, Meilensteine.

## Lizenz

[MIT](./LICENSE) — Copyright (c) 2026 Maximilian Otto Paul.
Die Software wird „as is" zur Verfügung gestellt, ohne jegliche Gewährleistung.

## by Fianuk Studio

Milky entsteht als **privates Hobbyprojekt** in der Freizeit — ohne Gewerbe,
ohne Gewinnerzielungsabsicht, ohne Werbung, ohne Datensammlung.
„Fianuk Studio" ist ein privater Projektname, kein Unternehmen, keine Marke,
keine juristische Person.

**Verantwortlich (privat):** Maximilian Otto Paul
**Kontakt:** maximilian.otto.paul@web.de

Made with care.
