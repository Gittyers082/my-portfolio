# my-portfolio

The personal portfolio of **El. Steven D. Cruz**, a student full-stack developer at Saint Louis University.
The homepage opens like a character introduction: one paused frame, the name as a title card, one diagonal cut.

Built with **Astro**, plain **CSS** and **TypeScript**. No UI framework, no CSS framework.

## Run it

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # type-checks with astro check, then builds to dist/
npm run preview   # serves the production build
```

## Where things live

| Path | What it is |
| --- | --- |
| `src/data/profile.ts` | **Your content.** Name, links, skill levels, project list. Start here. |
| `src/pages/index.astro` | The homepage: Hero → Selected work → Character file → Tagline → About → Contact |
| `src/pages/work/ka-dugo.astro` | Ka-dugo case study (stub, fill it in) |
| `src/pages/404.astro` | Custom 404 |
| `src/components/` | One file per section. `DeskScene` and `SketchbookArt` are the drawings. |
| `src/styles/global.css` | All styles. Design tokens (colours, spacing, motion) are at the top. |
| `src/scripts/site.ts` | Reveals, word-by-word tagline, card drift, mobile menu, chapter behaviour |
| `public/fonts/` | Archivo variable font, self-hosted (SIL Open Font License) |

## Design system, in short

- **Colours:** ivory `#F4EFE4` page, ink `#15130F` text and drawings, cyan `#00789A` accent.
  The accent is used only on the arrows and on the "active" detail (the booked row on the monitor, the open chapter).
- **Type:** Archivo, one family. Display text uses the condensed width (`font-stretch: 72%`).
- **Spacing:** fixed scale (4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96 px) as `--s-*` tokens.
- **Motion:** one curve, `cubic-bezier(0.22, 1, 0.36, 1)`; transform and opacity only; everything respects
  `prefers-reduced-motion`. Content is visible without JavaScript.
- **Dark mode:** the toggle in the nav is a placeholder. Dark tokens go under `[data-theme="dark"]` in `global.css`.

## Before launch: placeholders to replace

Search the code for `[` brackets or `TODO`:

- [ ] `profile.ts`: email, GitHub username, deployed site URL, real skill levels, third project
- [ ] `astro.config.mjs`: `site` URL
- [ ] Ka-dugo: who it helps, what you built, stack, app URL, case study text, **real screenshots**
- [ ] About: your story (built / problem / learned)
- [ ] Character file: Writing chapter (keep or remove), training details
- [ ] `public/og.png` (1200×630 social card)
- [ ] Swap the sketchbook drawing for a real page from your sketchbook, if you have one

The interface on the monitor and in Selected work is drawn in HTML from sample data
(the drive dates and places are invented). Replace it with real Ka-dugo screenshots when you have them.
