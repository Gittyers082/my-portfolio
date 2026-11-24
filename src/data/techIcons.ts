/**
 * Logos for tools and languages, from the open-source Simple Icons set (npm package
 * `simple-icons`). Shared by TechIcon.astro and /stack.json, which the GitHub profile reads.
 */
import * as si from 'simple-icons';

// display name → Simple Icons slug (null = no logo available, use a lettered tile)
const SLUG: Record<string, string | null> = {
  Java: 'openjdk', SQL: null, Python: 'python', JavaScript: 'javascript', TypeScript: 'typescript',
  Kotlin: 'kotlin', Elixir: 'elixir', Rust: 'rust', C: 'c', 'C++': 'cplusplus', 'C#': null, Go: 'go',
  Ruby: 'ruby', Dart: 'dart', PHP: 'php', Bash: 'gnubash',
  Astro: 'astro', React: 'react', 'Next.js': 'nextdotjs', HTML: 'html5', CSS: 'css',
  Tailwind: 'tailwindcss', Bootstrap: 'bootstrap', Vite: 'vite', Tauri: 'tauri',
  'Node.js': 'nodedotjs', Express: 'express', 'Spring Boot': 'springboot', FastAPI: 'fastapi', Phoenix: 'phoenixframework',
  MySQL: 'mysql', PostgreSQL: 'postgresql', MongoDB: 'mongodb', Firebase: 'firebase', Supabase: 'supabase', Redis: 'redis',
  Git: 'git', 'VS Code': null, 'IntelliJ IDEA': 'intellijidea', Zed: 'zedindustries', 'Sublime Text': 'sublimetext',
  Docker: 'docker', npm: 'npm', Maven: 'apachemaven', Gradle: 'gradle', Ant: 'apacheant', Mix: null, 'GitHub Actions': 'githubactions',
  Vercel: 'vercel', Render: 'render', GitHub: 'github',
  Figma: 'figma', Canva: null, Obsidian: 'obsidian', 'Google Docs': 'googledocs', 'Claude Code': 'claude', 'Claude Code & Cowork': 'claude', ChatGPT: null, Gemini: 'googlegemini', Ollama: 'ollama',
  'Prompt engineering': null, 'Online courses': null, 'AI and tech news': null, // drawn below
  // GitHub's names for languages, for the profile's language card
  Shell: 'gnubash', Vue: 'vuedotjs', Svelte: 'svelte', Lua: 'lua', 'Jupyter Notebook': 'jupyter',
  // contact links
  Gmail: 'gmail', Fiverr: null, LinkedIn: null, Résumé: null, // Fiverr's logo is a wordmark, unreadable this small
};
const TILE: Record<string, string> = { SQL: 'SQL', 'C#': 'C#', 'VS Code': 'VS', Mix: 'mix', Canva: 'Ca', LinkedIn: 'in', Fiverr: 'fi', Résumé: 'CV', ChatGPT: 'GPT' };
// a few with no brand to borrow, drawn here in the same 24×24 box: a terminal prompt, a graduation cap, a newspaper
const DRAWN: Record<string, string> = {
  'Prompt engineering': 'M2 4H22V20H2Z M4 6V18H20V6Z M6 9.4L7.4 8L11.4 12L7.4 16L6 14.6L8.6 12Z M12 14.5H17V16.5H12Z',
  'Online courses': 'M12 3L23 8.5L12 14L1 8.5Z M5.5 11.6L12 14.9L18.5 11.6V16C18.5 18.2 15.6 20 12 20C8.4 20 5.5 18.2 5.5 16Z M20.6 9.6H22.2V15.4H20.6Z',
  'AI and tech news': 'M5 3H22V18C22 19.7 20.7 21 19 21H5C3.3 21 2 19.7 2 18V8H5Z M7 5V18C7 18.4 6.9 18.7 6.8 19H19C19.6 19 20 18.6 20 18V5Z M9 7H18V11H9Z M9 13H18V14.6H9Z M9 16H15V17.6H9Z',
};

const icons = si as unknown as Record<string, { path: string } | undefined>;

/** A logo path (24×24 viewBox), a short tile label when there is no logo, or null for unknown names. */
export function techIcon(name: string): { path: string } | { tile: string } | null {
  if (!(name in SLUG)) return null;
  if (DRAWN[name]) return { path: DRAWN[name] };
  const slug = SLUG[name];
  const icon = slug ? icons['si' + slug[0].toUpperCase() + slug.slice(1)] : undefined;
  return icon ? { path: icon.path } : { tile: TILE[name] ?? name.slice(0, 2) };
}

export const techNames = Object.keys(SLUG);
