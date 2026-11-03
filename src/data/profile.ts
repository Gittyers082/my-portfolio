/**
 * Everything personal lives here. Swap the [bracketed] placeholders for the
 * real thing; the components read from this file.
 */

export const profile = {
  name: 'El. Steven D. Cruz',
  title: 'Student full-stack developer',
  intro: 'I build web apps and I’m exploring AI engineering.',
  school: 'Saint Louis University',
  year: '3rd-year IT student',
  // TODO: real links
  email: '[you@email.com]',
  github: '[username]',
  site: 'https://example.com', // TODO: your deployed URL (used for canonical + social tags)
} as const;

export const githubUrl = `https://github.com/${profile.github}`;
export const isPlaceholder = (value: string): boolean => /^\[.*\]$/.test(value);

/** Power levels: placeholders, set your own (0–10). */
export type Skill = { name: string; level: number; note: string; placeholderNote?: boolean };
export const skills: Skill[] = [
  { name: 'Java', level: 8, note: 'First language I learned, still my strongest' },
  { name: 'Python', level: 6, note: 'Scripts now, AI work next' },
  { name: 'JavaScript', level: 6, note: 'And TypeScript, for the web' },
  { name: 'Rust', level: 3, note: '[What you use it for]', placeholderNote: true },
  { name: 'Git', level: 7, note: 'Daily, solo and in teams' },
];

export const kit: { label: string; known: string; todo?: string }[] = [
  { label: 'Web', known: 'Astro, TypeScript, HTML, CSS,', todo: '[framework]' },
  { label: 'Tools', known: 'Git,', todo: '[editor], [database]' },
  { label: 'Next arc', known: 'AI engineering:', todo: '[what you’re learning now]' },
];

export type Project = { name: string; line: string; href?: string; placeholder?: boolean };
export const projects: Project[] = [
  { name: 'Ka-dugo', line: 'Blood donation web app · team project, IT312 · 2026', href: '/work/ka-dugo/' },
  { name: 'Team 5 build system', line: 'Java project built with Apache Ant · I was the codebase architect · ITCS 311L' },
  { name: '[Project three]', line: '[One line on what it does] · [stack] · [year]', placeholder: true },
];
