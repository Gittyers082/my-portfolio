/**
 * A branching lightning bolt, drawn once at build time for the aura power-up (AuraFarmer.astro).
 * The main channel is jagged by midpoint displacement and ends exactly on El's raised hand; thinner
 * forks split off it and fork again. Seeded, so the bolt is the same on every build.
 */
type Pt = [number, number];

function rng(seed: number): () => number {
  // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Points from a to b, each segment split in two and its middle pushed sideways, depth times. */
function jag(a: Pt, b: Pt, rough: number, depth: number, rand: () => number): Pt[] {
  if (depth === 0) return [a, b];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy);
  const off = (rand() - 0.5) * len * rough;
  const mid: Pt = [(a[0] + b[0]) / 2 - (dy / len) * off, (a[1] + b[1]) / 2 + (dx / len) * off];
  return [...jag(a, mid, rough, depth - 1, rand).slice(0, -1), ...jag(mid, b, rough, depth - 1, rand)];
}

const d = (pts: Pt[]): string => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');

export type Bolt = { main: string; forks: string[]; twigs: string[] };

/** A bolt from `from` (off the top) to `to` (the hand). `forks` sets how busy it is. */
export function bolt(from: Pt, to: Pt, seed: number, forks = 7): Bolt {
  const rand = rng(seed);
  const main = jag(from, to, 0.32, 6, rand);
  const total = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const out: Bolt = { main: d(main), forks: [], twigs: [] };
  for (let k = 0; k < forks; k += 1) {
    // forks leave from the upper three quarters, so the strike on the hand stays clean
    const i = Math.floor(main.length * (0.08 + 0.7 * rand()));
    const [p, q] = [main[i], main[Math.min(i + 1, main.length - 1)]];
    const dir = Math.atan2(q[1] - p[1], q[0] - p[0]) + (rand() < 0.5 ? -1 : 1) * (0.45 + 0.5 * rand());
    const len = total * (1 - i / main.length) * (0.25 + 0.3 * rand());
    const end: Pt = [p[0] + Math.cos(dir) * len, p[1] + Math.sin(dir) * len];
    const fork = jag(p, end, 0.45, 4, rand);
    out.forks.push(d(fork));
    // a twig or two off each fork
    for (let t = 0; t < 1 + Math.floor(rand() * 2); t += 1) {
      const j = Math.floor(fork.length * (0.2 + 0.6 * rand()));
      const s = fork[j];
      const a = dir + (rand() < 0.5 ? -1 : 1) * (0.4 + 0.6 * rand());
      const l = len * (0.25 + 0.3 * rand());
      out.twigs.push(d(jag(s, [s[0] + Math.cos(a) * l, s[1] + Math.sin(a) * l], 0.5, 3, rand)));
    }
  }
  return out;
}
