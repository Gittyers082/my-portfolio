/**
 * Logos for tools and languages, from the open-source Simple Icons set (npm package
 * `simple-icons`). Shared by the components that show logos.
 */
import * as si from 'simple-icons';

// display name → Simple Icons slug (null = no logo available, use a lettered tile)
const SLUG: Record<string, string | null> = {
  Java: 'openjdk', SQL: null, Python: 'python', JavaScript: 'javascript', TypeScript: 'typescript',
  Kotlin: 'kotlin', Elixir: 'elixir', Rust: 'rust', C: 'c', 'C++': 'cplusplus', 'C#': null, Go: 'go',
  Ruby: 'ruby', Dart: 'dart', PHP: 'php', Bash: 'gnubash',
  Astro: 'astro', React: 'react', 'Next.js': 'nextdotjs', HTML: 'html5', CSS: 'css',
  Tailwind: 'tailwindcss', Bootstrap: 'bootstrap',
  'Node.js': 'nodedotjs', Express: 'express', 'Spring Boot': 'springboot', FastAPI: 'fastapi', Phoenix: 'phoenixframework',
  MySQL: 'mysql', PostgreSQL: 'postgresql', MongoDB: 'mongodb', Firebase: 'firebase', Supabase: 'supabase',
  Git: 'git', 'VS Code': null, 'IntelliJ IDEA': 'intellijidea', Antigravity: null,
  Docker: 'docker', npm: 'npm', Maven: 'apachemaven', Gradle: 'gradle', Ant: 'apacheant', Mix: null,
  Vercel: 'vercel', AWS: null, GitHub: 'github',
  Figma: 'figma', Canva: null, Obsidian: 'obsidian', 'Claude Code': 'claude',
  // contact links
  Gmail: 'gmail', Fiverr: null, LinkedIn: null, Résumé: null, // Fiverr's logo is a wordmark, unreadable this small
};
const TILE: Record<string, string> = { SQL: 'SQL', 'C#': 'C#', 'VS Code': 'VS', Antigravity: 'AG', Mix: 'mix', AWS: 'AWS', Canva: 'Ca', LinkedIn: 'in', Fiverr: 'fi', Résumé: 'CV' };

const icons = si as unknown as Record<string, { path: string } | undefined>;

/** A logo path (24×24 viewBox), a short tile label when there is no logo, or null for unknown names. */
export function techIcon(name: string): { path: string } | { tile: string } | null {
  if (!(name in SLUG)) return null;
  const slug = SLUG[name];
  const icon = slug ? icons['si' + slug[0].toUpperCase() + slug.slice(1)] : undefined;
  return icon ? { path: icon.path } : { tile: TILE[name] ?? name.slice(0, 2) };
}

export const techNames = Object.keys(SLUG);
