# Milky

Eine kleine Galaxie fuer jeden ausgefallenen Milchzahn.

Milky ist ein liebevolles Tagebuch fuer Kinder und Eltern: jeder Milchzahn wird zu einem Stern in einer wachsenden Konstellation. Foto vor dem Ausfall, Foto nachher, kurze Notiz, vielleicht ein Audio-Memo — und am Ende, wenn der letzte Milchzahn raus ist, ist die Galaxie komplett.

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

## by Fianuk Studio

Privates Studio-Projekt. Made with care.
