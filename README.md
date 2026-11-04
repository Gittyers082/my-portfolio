# my-portfolio

The personal portfolio of **El. Steven D. Cruz**, a student full-stack developer at Saint Louis University.
The homepage opens like a character introduction, then climbs like a story: up to Projects at the peak, then the way down.
The hero character, drawn from behind, is **El**.

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
| `src/data/profile.ts` | **Your content.** Name, links, Character card facts (and the secret 7th card), Stack areas and levels, training, lore, project episodes, hero portrait. Start here. |
| `src/data/contributions.ts` | GitHub activity: your contribution calendar (with per-day counts) and latest pushed repos, read at build time. |
| `src/pages/index.astro` | The homepage: Hero → Character card → Character file (Projects is the peak) → Tagline → About → GitHub activity → Contact, plus the mountain map and the shortcuts panel |
| `src/pages/work/ka-dugo.astro` | Ka-dugo case study (stub, fill it in) |
| `src/pages/404.astro` | 404: El lost with his map upside down, and dodge.exe |
| `src/layouts/Base.astro` | Page shell; sets light/dark before the first paint |
| `src/components/` | One file per section. Drawings: `DeskScene`, `EpisodeArt`, `AuraFarmer`, `Climb`; `Runner` is dodge.exe; `KadugoDemo` is the demo loop. |
| `src/styles/global.css` | All styles. Design tokens (colours, spacing, motion) and the dark palette are at the top. |
| `src/scripts/site.ts` | Wires everything up (reveals, menu, chapters, hero, Projects links…) and calls the scripts below |
| `src/scripts/features.ts` | Explored meter, demo loop, episode picker + Snap, copy-the-email |
| `src/scripts/theme.ts` | Light / dark toggle |
| `src/scripts/` (others) | One small file per feature: `card`, `climb`, `aura`, `calendar`, `keys`, `lore`, `stack`, `typing`, `cursor`, `stars`, `notebook`, `contact`, `footer`, `lost`, `devtools`, `sfx` (sounds), `portrait-reveal` |
| `public/fonts/` | Archivo variable font, self-hosted (SIL Open Font License) |

Some internal names are older than the sections they belong to: `TrustMeter` / `trust` is the Explored meter,
and `TrustHistory` is the GitHub activity section.

## Logos

The small logos come from the open-source Simple Icons set (`simple-icons` in package.json). To add a logo for a
new item, add its name and Simple Icons slug to the `SLUG` table in `src/components/TechIcon.astro`
(find slugs at simpleicons.org). Anything without a logo gets a lettered tile.

## Design system, in short

- **Colours:** ivory `#F4EFE4` page, ink `#15130F` text and drawings, cyan `#00789A` accent.
  Dark panels use `--panel-bg` / `--on-panel`, so they stay dark in both themes.
- **Dark mode:** `html[data-theme="dark"]` swaps the tokens (dark page, light ink, lifted panels, brighter cyan).
  Colours written straight into SVGs are mapped by attribute selectors next to the dark palette.
  The visitor's choice is saved; otherwise it follows the system setting.
- **Type:** Archivo, one family. Display text uses the condensed width (`font-stretch: 72%`).
- **Spacing:** fixed scale (4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96 px) as `--s-*` tokens.
- **Motion:** one curve, `cubic-bezier(0.22, 1, 0.36, 1)`; everything respects `prefers-reduced-motion`.
  Content is visible without JavaScript.

## Hidden things

- Press `?` for keyboard shortcuts (J/K sections, H top, P Projects, G GitHub, C Contact).
- Type `arete` anywhere.
- Explore 100% of the site for the secret card and El's second flag.
- Open DevTools.

## Hero portrait

The hero's second frame is your photo (Ink / Photo buttons). Put it at **`public/portrait/steven.webp`**
(`.jpg`, `.avif` or `.png` also work), and optionally a night version at **`public/portrait/steven-dark.webp`**,
which shows in dark mode. If the crop cuts your face, adjust `portrait.focus` in `src/data/profile.ts`.

## Before launch

Search the code for `[` brackets or `TODO`:

- [x] `profile.ts`: email, GitHub, LinkedIn, Fiverr
- [x] Hero photos (light and dark)
- [ ] Deployed site URL: `site` in `astro.config.mjs` and `profile.ts` (canonical links and social cards)
- [ ] `public/og.png` (1200×630 social card)
- [ ] `public/resume.pdf` (the Contact link appears once the file exists)
- [ ] Projects: real episodes, Ka-dugo details and case study, a real screen recording for the demo loop
