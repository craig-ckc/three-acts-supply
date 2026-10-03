# Three Acts — The Vault

A members' vault of web interactions (HTML, CSS and JS). Every resource opens in a full-bleed live preview with a floating editor: tweak values with dials, edit the code, and download the files.

## Stack

React 18 · Base Web · Base UI (ScrollArea) · Tailwind CSS v4 · CodeMirror 6 · Vite

## Develop

```bash
npm install
npm run dev
```

## Gallery previews

Cards use pre-recorded videos, never live interaction iframes. Each resource's
`meta.json` has a `preview` field with `video` and `poster` URLs. The gallery only
loads and plays videos inside the viewport; scrolling away, hiding the tab, or
enabling reduced motion releases playback. Posters remain as the static fallback.

Generate recordings after adding or changing a resource:

```bash
npm run previews:generate                    # all resources
npm run previews:generate -- magnetic-button # one resource
```

Requires Node 22.13+ (Node 24 recommended), FFmpeg with libx264 and WebP support,
and Google Chrome. Alternatively, run `npx playwright install chromium` and set
`PLAYWRIGHT_CHANNEL=chromium`. Recording needs access to the font and GSAP CDNs.
This runs locally during authoring, not during app startup or production builds.

The generator demonstrates pointer, click, drag, and scroll interactions and
exports six-second, silent 640 × 440 H.264 MP4 loops at 30 fps with CRF 23, slow
compression, fast-start metadata, and WebP posters. Generated media lives in
`public/previews`; commit it alongside the resource metadata.

With the dev server running, `SUPPLY_URL=http://127.0.0.1:5174 npm run verify:gallery`
checks playback and cleanup, accessibility preferences, fallbacks, card actions,
and a simulated 500-card catalogue.

## Shortcuts

| Key | Action |
| --- | --- |
| ⌘K | Search |
| ⌘B | Collapse sidebar |
| E | Minimize the editor panel |
| F | Immersive preview (Esc to exit) |
| [ / ] | Previous / next resource |
