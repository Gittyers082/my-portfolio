/**
 * The GitHub activity section: your contribution calendar for the last year,
 * plus your most recently pushed repos.
 *
 * At build time this reads the public contribution calendar from
 * github.com/users/<username>/contributions (no token needed). If the username
 * is still a placeholder, or GitHub can't be reached, it returns a clearly
 * labelled SAMPLE so the design can still be seen.
 */
import { profile, isPlaceholder } from './profile';

export type Level = 0 | 1 | 2 | 3 | 4;
export type Day = { date: string; level: Level; count?: number }; // count: read from GitHub's day tooltips, when present
export type Calendar = {
  days: Day[];
  sample: boolean;
  total: number | null;
  longestStreak: number;
  streak: [string, string] | null; // first and last ISO dates of the longest streak
  busiest: string | null; // ISO date of the busiest day
};

const ISO = (d: Date): string => d.toISOString().slice(0, 10);

function stats(days: Day[]): Pick<Calendar, 'longestStreak' | 'streak' | 'busiest'> {
  let run = 0;
  let runStart = 0;
  let longestStreak = 0;
  let streak: [string, string] | null = null;
  let busiest: Day | null = null;
  const weight = (d: Day): number => d.count ?? d.level; // real counts when we have them
  days.forEach((d, i) => {
    if (d.level > 0) {
      if (run === 0) runStart = i;
      run += 1;
      if (run > longestStreak) { longestStreak = run; streak = [days[runStart].date, d.date]; }
    } else {
      run = 0;
    }
    if (!busiest || weight(d) > weight(busiest)) busiest = d;
  });
  const best = busiest as Day | null;
  return { longestStreak, streak, busiest: best && best.level > 0 ? best.date : null };
}

/** A deterministic, sparse sample year with a busy stretch near the end. */
function sample(): Calendar {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 364);
  let seed = 7;
  const rnd = (): number => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const days: Day[] = [];
  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const week = Math.floor(i / 7);
    const busy = week >= 43 ? 0.55 : week >= 18 && week <= 22 ? 0.3 : 0.12;
    let level = rnd() < busy ? 1 + Math.floor(rnd() * (week >= 43 ? 4 : 2)) : 0;
    if (d.getDay() === 0 || d.getDay() === 6) level = Math.max(0, level - 1);
    days.push({ date: ISO(d), level: level as Level });
  }
  return { days, sample: true, total: null, ...stats(days) };
}

export async function getCalendar(): Promise<Calendar> {
  if (isPlaceholder(profile.github)) return sample();
  try {
    const res = await fetch(`https://github.com/users/${profile.github}/contributions`, {
      headers: { 'User-Agent': 'portfolio-build' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const html = await res.text();
    const days: Day[] = [];
    // Each day's exact count lives in a <tool-tip for="<td id>">, e.g. "3 contributions on October 12th."
    const counts = new Map<string, number>();
    for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const text = m[2].trim();
      const n = text.match(/^(\d[\d,]*)\s+contributions?\b/i);
      if (n) counts.set(m[1], Number(n[1].replace(/,/g, '')));
      else if (/^no contributions\b/i.test(text)) counts.set(m[1], 0);
    }
    // Each day is a <td> with data-date and data-level (in either order).
    for (const tag of html.match(/<td[^>]*data-date="[^"]+"[^>]*>/g) ?? []) {
      const date = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
      const level = tag.match(/data-level="([0-4])"/)?.[1];
      const id = tag.match(/\bid="([^"]+)"/)?.[1];
      if (date && level) days.push({ date, level: Number(level) as Level, count: id ? counts.get(id) : undefined });
    }
    if (days.length < 300) throw new Error('calendar markup not recognised');
    days.sort((a, b) => a.date.localeCompare(b.date));
    const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in the last year/);
    const total = totalMatch ? Number(totalMatch[1].replace(/,/g, '')) : null;
    return { days, sample: false, total, ...stats(days) };
  } catch (err) {
    console.warn(`[github activity] using the sample calendar: ${(err as Error).message}`);
    return sample();
  }
}

/* ---------- Latest pushes: your most recently updated public repos ---------- */
export type Repo = { name: string; url: string; description: string | null; language: string | null; pushed: string };

/**
 * Reads your public repos from the GitHub API at build time (no token needed),
 * newest push first, skipping forks and archived repos. If GitHub can't be
 * reached it returns an empty list and the row simply doesn't show.
 */
export async function getRecentRepos(limit = 3): Promise<Repo[]> {
  if (isPlaceholder(profile.github)) return [];
  try {
    const res = await fetch(`https://api.github.com/users/${profile.github}/repos?sort=pushed&per_page=30`, {
      headers: { 'User-Agent': 'portfolio-build', Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const data = (await res.json()) as {
      name: string; html_url: string; description: string | null; language: string | null;
      pushed_at: string; fork: boolean; archived: boolean;
    }[];
    return data
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
      .slice(0, limit)
      .map((r) => ({ name: r.name, url: r.html_url, description: r.description, language: r.language, pushed: r.pushed_at.slice(0, 10) }));
  } catch (err) {
    console.warn(`[github activity] latest pushes hidden: ${(err as Error).message}`);
    return [];
  }
}
