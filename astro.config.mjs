// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // The live address, for canonical links and social cards. On Vercel this is the
  // project's production domain (your custom domain if you add one, else *.vercel.app),
  // set automatically at build time. Locally it falls back to the dev server.
  site: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321',
  trailingSlash: 'ignore',
  // Astro 7 defaults to JSX-style whitespace, which can glue inline words together.
  // Keep normal HTML whitespace rules for this hand-written markup.
  compressHTML: true,
  // Writes sitemap-index.xml (linked from /robots.txt) on every build. The 404 page isn't a page
  // anyone should land on from a search, so it's left out; data endpoints like /stack.json never go in.
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(new URL(page).pathname) })],
});
