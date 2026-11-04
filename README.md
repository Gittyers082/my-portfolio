# my-portfolio

The personal portfolio of **El. Steven D. Cruz**, a student full-stack developer at Saint Louis University.
The homepage opens like a character introduction: one paused frame, the name as a title card, one diagonal cut.

Built with **Astro**, plain **CSS** and **TypeScript**. No UI framework, no CSS framework.

## Logos in Stack

The small logos come from the open-source Simple Icons set. Install it once:

```
npm install simple-icons
```

To add a logo for a new item, add its name and Simple Icons slug to the `SLUG` table in `src/components/TechIcon.astro` (find slugs at simpleicons.org). Anything without a logo gets a lettered tile.

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
| `src/data/profile.ts` | **Your content.** Name, links, Character card facts, Stack areas and levels, project episodes, Field log. Start here. |
| `src/data/contributions.ts` | Trust history: pulls your GitHub contribution calendar at build time (set `github` in profile.ts). |
| `src/pages/index.astro` | The homepage, climbing like a story: Hero → Character card → Character file (Projects is the peak) → Tagline → About → Trust history → Field log → Contact |
| `src/pages/work/ka-dugo.astro` | Ka-dugo case study (stub, fill it in) |
| `src/pages/404.astro` | Custom 404 |
| `src/components/` | One file per section. `DeskScene`, `SketchbookArt` and `EpisodeArt` are the drawings; `KadugoDemo` is the demo loop. |
| `src/styles/global.css` | All styles. Design tokens (colours, spacing, motion) are at the top. |
| `src/scripts/site.ts` | Reveals, tagline, card drift, menu, chapters, hero background |
| `src/scripts/features.ts` | Trust value meter, demo loop, episode picker + Snap, copy-the-email |
| `src/scripts/portrait-reveal.ts` | Hero Ink / Photo reveal |
| `public/fonts/` | Archivo variable font, self-hosted (SIL Open Font License) |

## Design system, in short

- **Colours:** ivory `#F4EFE4` page, ink `#15130F` text and drawings, cyan `#00789A` accent.
  The accent is used only on the arrows and on the "active" detail (the booked row on the monitor, the open chapter).
- **Type:** Archivo, one family. Display text uses the condensed width (`font-stretch: 72%`).
- **Spacing:** fixed scale (4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96 px) as `--s-*` tokens.
- **Motion:** one curve, `cubic-bezier(0.22, 1, 0.36, 1)`; transform and opacity only; everything respects
  `prefers-reduced-motion`. Content is visible without JavaScript.
- **Dark mode:** the toggle in the nav is a placeholder. Dark tokens go under `[data-theme="dark"]` in `global.css`.

## Hero portrait reveal

The hero art has a second frame: your portrait under the illustration. Hover to peek, click (or tap,
or press the "Reveal portrait" button) to wipe the whole panel over to the photo, click again to go back.

1. Save a head-and-shoulders photo, at least 1200 px tall, as **`public/portrait/steven.jpg`**
   (`.webp`, `.avif` or `.png` also work).
2. If the crop cuts your face, adjust `portrait.focus` in `src/data/profile.ts`
   (a CSS `object-position`, default `50% 28%`: horizontal, then vertical position of your face).
3. Check it at phone and desktop widths with `npm run dev`.

Until that file exists, the reveal is **off in the public build** (`npm run build`). In `npm run dev`
a clearly labelled development placeholder (not a face) stands in so the interaction can be tested.

## Before launch: placeholders to replace

Search the code for `[` brackets or `TODO`:

- [x] `profile.ts`: email, GitHub, LinkedIn, Fiverr
- [ ] `profile.ts`: deployed site URL, real skill levels, fun fact, third project, Field log entries
- [ ] `public/resume.pdf`: your résumé (the Contact link appears once the file exists)
- [ ] A real Ka-dugo screen recording to replace the HTML demo loop (`KadugoDemo.astro`)
- [ ] `astro.config.mjs`: `site` URL
- [ ] Ka-dugo: who it helps, what you built, stack, app URL, case study text, **real screenshots**
- [ ] About: your story (built / problem / learned)
- [ ] Character file: Writing chapter (keep or remove), training details
- [ ] `public/portrait/steven.jpg`: your photo for the hero reveal (see above)
- [ ] `public/og.png` (1200×630 social card)
- [ ] Swap the sketchbook drawing for a real page from your sketchbook, if you have one

The interface on the monitor and in Selected work is drawn in HTML from sample data
(the drive dates and places are invented). Replace it with real Ka-dugo screenshots when you have them.
