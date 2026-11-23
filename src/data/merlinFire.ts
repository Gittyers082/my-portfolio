/**
 * Merlin's fire, ported from merlin-desktop-companion (src/fire.ts) so the
 * portfolio draws the exact flame he has in the app. Each layer is one spiky
 * crown path; a few keyframe shapes lean and stretch every peak differently,
 * and SVG <animate> morphs between them. Used by MerlinDemo and EpisodeArt.
 */
type Point = [number, number];
export interface Flame {
  attrs: Record<string, string>;
  baseLeft: Point; baseRight: Point; peaks: Point[]; valleys: Point[];
  sway: number[][]; lift: number[][]; duration: number; bend: number;
}
export const HALO: Flame = {
  attrs: { fill: '#1597BE', opacity: '0.38' },
  baseLeft: [66, 118], baseRight: [134, 118],
  peaks: [[34, 40], [62, 6], [100, -18], [138, 0], [168, 36]],
  valleys: [[48, 72], [80, 42], [120, 36], [152, 64]],
  sway: [[-12, -3, -14, -5], [-6, 4, -8, 2], [5, -7, 8, -4], [6, -2, 9, 3], [12, 4, 14, 5]],
  lift: [[0, -8, 4, -4], [-6, 4, -10, 2], [4, -10, 0, -6], [-8, 2, -4, 4], [2, -6, -2, -8]],
  duration: 2.3, bend: 16,
};
export const MAIN: Flame = {
  attrs: { fill: 'url(#mer-fire)', stroke: '#14213D', 'stroke-width': '3.5', 'stroke-linejoin': 'round' },
  baseLeft: [64, 116], baseRight: [136, 116],
  peaks: [[44, 44], [72, 14], [100, -6], [130, 8], [158, 32]],
  valleys: [[60, 72], [86, 48], [116, 42], [144, 60]],
  sway: [[-10, -2, -12, -4], [-5, 6, -8, 3], [6, -8, 5, -5], [5, -3, 9, 2], [10, 3, 12, 5]],
  lift: [[0, -7, 3, -4], [-5, 3, -9, 2], [3, -8, 0, -5], [-7, 2, -4, 4], [2, -5, -1, -7]],
  duration: 1.7, bend: 13,
};
export const INNER: Flame = {
  attrs: { fill: 'url(#mer-inner)' },
  baseLeft: [72, 104], baseRight: [128, 104],
  peaks: [[68, 56], [88, 32], [110, 22], [132, 46]],
  valleys: [[78, 72], [98, 54], [122, 60]],
  sway: [[-6, 2, -8, 0], [4, -5, 3, -4], [-5, 6, -4, 5], [6, -2, 8, 1]],
  lift: [[-3, 3, -6, 0], [2, -6, 3, -3], [-4, 0, -6, 3], [0, -4, 2, -5]],
  duration: 1.25, bend: 9,
};
const fmt = (n: number): string => n.toFixed(1);
/** One keyframe of a flame layer: base → peak → valley → … → base, as curves. */
export function crown(f: Flame, frame: number): string {
  const peaks = f.peaks.map(([x, y], i): Point => [x + f.sway[i][frame], y + f.lift[i][frame]]);
  const steps: { kind: 'peak' | 'valley' | 'base'; pt: Point }[] = [];
  peaks.forEach((pt, i) => {
    steps.push({ kind: 'peak', pt });
    if (i < f.valleys.length) steps.push({ kind: 'valley', pt: f.valleys[i] });
  });
  steps.push({ kind: 'base', pt: f.baseRight });
  let d = `M${fmt(f.baseLeft[0])} ${fmt(f.baseLeft[1])}`;
  let prev = f.baseLeft;
  for (const { kind, pt } of steps) {
    const [ax, ay] = prev;
    const [bx, by] = pt;
    let c1: Point;
    let c2: Point;
    if (kind === 'peak') {
      const dy = ay - by;
      c1 = [prev === f.baseLeft ? ax - f.bend * 0.6 : ax + 2, ay - dy * 0.55];
      c2 = [bx - f.bend * 0.4, by + dy * 0.3];
    } else {
      const dy = by - ay;
      c1 = [ax + f.bend * 0.4, ay + dy * 0.35];
      c2 = [kind === 'valley' ? bx - f.bend * 0.2 : bx + f.bend * 0.8, by - dy * 0.45];
    }
    d += ` C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(bx)} ${fmt(by)}`;
    prev = pt;
  }
  return `${d} Z`;
}
/** A layer ready for markup: its first shape, plus what <animate> needs to morph it. */
export const layer = (f: Flame) => {
  const n = f.sway[0].length;
  const shapes = Array.from({ length: n }, (_, k) => crown(f, k));
  return {
    attrs: f.attrs,
    d: shapes[0],
    dur: `${f.duration}s`,
    keyTimes: Array.from({ length: n + 1 }, (_, i) => (i / n).toFixed(3)).join(';'),
    keySplines: Array(n).fill('0.45 0 0.55 1').join(';'),
    values: [...shapes, shapes[0]].join(';'),
  };
};
