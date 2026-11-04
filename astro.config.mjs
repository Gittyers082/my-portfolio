// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // TODO: set to your deployed URL (used for canonical links and social cards)
  site: 'https://example.com',
  trailingSlash: 'ignore',
  // Astro 7 defaults to JSX-style whitespace, which can glue inline words together.
  // Keep normal HTML whitespace rules for this hand-written markup.
  compressHTML: true,
});
