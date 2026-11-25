/**
 * The grimoire's pages (About me), drawn as SVG strings on a 300×400 page so both the
 * component (the first spread, server-rendered) and notebook.ts (every frame after that)
 * can use them. Each page has a "problem" state and a "fixed" state, and everything in
 * between is a number: how far the quill has got.
 * Colours are the site's drawing hex values, so the dark theme remaps them; red marks
 * what's wrong.
 */
export const INK = '#15130F';
export const RED = '#C8462F';
const MONO = 'font-family="ui-monospace, Consolas, Menlo, monospace"';
const S = `fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x: number, y: number, s: string, size = 14, extra = ''): string =>
  `<text x="${x}" y="${y}" ${MONO} font-size="${size}" fill="${INK}" xml:space="preserve" ${extra}>${esc(s)}</text>`;
const note = (x: number, y: number, s: string): string => T(x, y, s, 13, 'opacity=".6"');
const num = (n: number): string => `<text x="150" y="384" text-anchor="middle" ${MONO} font-size="11" fill="${INK}" opacity=".55">— ${n} —</text>`;
const svg = (inner: string): string => `<svg viewBox="0 0 300 400" aria-hidden="true">${inner}<circle data-tip cx="-50" cy="-50" r="1" fill="none"></circle></svg>`;
/** A red wavy underline, the way an editor marks an error. */
const wiggle = (x1: number, x2: number, y: number): string => {
  let d = `M${x1} ${y}`;
  for (let x = x1; x < x2; x += 6) d += ' q1.5 -3 3 0 q1.5 3 3 0';
  return `<path d="${d}" fill="none" stroke="${RED}" stroke-width="1.6"></path>`;
};
/** The line the quill is writing right now: notebook.ts measures it to put the nib at its end. */
const writing = (x: number, y: number, s: string, size = 14): string => T(x, y, s, size, 'data-writing');
const clamp = (x: number, a = 0, b = 1): number => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
const back = (p: number): number => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };

/** Where the nib is: on a line being written (x is measured), or a fixed point (a tick). */
export type Tip = { x: number; y: number; measure: boolean } | null;
export type Page = { html: string; tip: Tip };

/* ---------- 1 · code: bugs on the left, the fix written on the right ---------- */
const BUG = ['fn summon(ink) {', '  if (ink.dry) {', '    return cast(inc)', '', '  retry(ink)', '  return null'];
export const FIX = ['fn summon(ink) {', '  if (!ink.dry) {', '    return cast(ink)', '  }', '  return retry(ink)', '}'];
export const FIX_CHARS = FIX.join('').length;
/** How far through the fix each error is solved (as a share of the writing): the logic, the typo, the brace. */
export const CODE_SOLVED = [0.45, 0.62, 0.75];

export function codeLeft(fixed: number, showErrors: boolean): string {
  let o = note(30, 58, '// summon.ts');
  BUG.forEach((l, i) => { o += T(30, 92 + i * 28, l); });
  const bad: [number, number, number][] = [[1, 46, 130], [2, 148, 182], [3, 30, 60]];
  bad.forEach(([line, x1, x2], k) => {
    const y = 92 + line * 28 + 5;
    if (fixed > k) o += `<path d="M${x1} ${y - 9} L${x2} ${y - 10}" ${S}></path>`;
    else if (showErrors) o += (line === 3 ? `<text x="46" y="${92 + line * 28}" ${MONO} font-size="14" fill="${RED}">?</text>` : '') + wiggle(x1, x2, y);
  });
  return svg(o + num(12));
}
export function codeRight(chars: number): Page {
  let o = note(30, 58, '// fixed');
  let left = chars;
  let tip: Tip = null;
  FIX.forEach((l, i) => {
    const c = clamp(left, 0, l.length);
    const y = 92 + i * 28;
    if (c > 0 && c < l.length) { o += writing(30, y, l.slice(0, c)); tip = { x: 30, y, measure: true }; }
    else if (c > 0) o += T(30, y, l);
    left -= l.length;
  });
  return { html: svg(o + num(13)), tip };
}

/* ---------- 2 · the plan: the to-dos fly off, the quill writes them back in order ---------- */
export const TODO = ['ship Dot', 'fix corner anim', 'about page', 'sleep'];
export const TODO_CHARS = TODO.join('').length;
export function planLeft(): string {
  const nodes: [string, string, boolean][] = [['wk1', 'RAG basics', true], ['wk2', 'Merlin memory', true], ['wk3', 'ThriftBite v2', false], ['wk4', 'rest (lol)', false]];
  let o = note(30, 58, 'plan // december') + `<path d="M52 86 L52 300" ${S}></path>`;
  nodes.forEach(([w, l, done], i) => {
    const y = 96 + i * 64;
    o += `<circle cx="52" cy="${y}" r="9" fill="${done ? INK : '#FBF8F1'}" stroke="${INK}" stroke-width="2.4"></circle>` + T(72, y - 2, w, 11, 'opacity=".6"') + T(72, y + 16, l);
  });
  return svg(o + num(20));
}
/** The row a to-do lands in, in page units: where its slip flies home to. */
export const ROW = (i: number): [number, number] => [64, 96 + i * 48 - 5];
export function planRight(chars: number, ticks: number): Page {
  let o = note(30, 58, 'today');
  let left = chars;
  let tip: Tip = null;
  TODO.forEach((l, i) => {
    const y = 96 + i * 48;
    o += `<rect x="30" y="${y - 14}" width="20" height="20" rx="3" ${S}></rect>`;
    const c = clamp(left, 0, l.length);
    if (c > 0 && c < l.length) { o += writing(64, y + 2, l.slice(0, c)); tip = { x: 64, y: y + 2, measure: true }; }
    else if (c > 0) o += T(64, y + 2, l);
    left -= l.length;
  });
  for (let i = 0; i < 2; i++) {
    const y = 96 + i * 48;
    const u = clamp(ticks - i);
    if (u <= 0) continue;
    o += `<path d="M34 ${y - 4} L40 ${y + 3} L50 ${y - 12}" ${S} stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - u).toFixed(3)}"></path>`;
    if (u < 1) tip = { x: u < 0.4 ? lerp(34, 40, u / 0.4) : lerp(40, 50, (u - 0.4) / 0.6), y: u < 0.4 ? lerp(y - 4, y + 3, u / 0.4) : lerp(y + 3, y - 12, (u - 0.4) / 0.6), measure: false };
  }
  return { html: svg(o + num(21)), tip };
}

/* ---------- 3 · the power system: broken, then the rule is written and it locks into balance ---------- */
export function ocLeft(): string {
  const o = note(30, 58, 'OC #07')
    + `<rect x="30" y="76" width="96" height="112" rx="4" ${S}></rect><circle cx="78" cy="132" r="30" ${S} stroke-dasharray="4 6"></circle>`
    + `<path d="M78 106 C90 120 92 134 84 150 L78 160 L72 150 C64 134 66 120 78 106 Z" ${S}></path><circle cx="78" cy="136" r="4" ${S}></circle><path d="M78 140 L78 156" ${S}></path>`
    + note(142, 98, 'name:').replace('font-size="13"', 'font-size="12"') + `<path d="M142 118 L270 116" ${S}></path>`
    + note(142, 148, 'fable:').replace('font-size="13"', 'font-size="12"') + T(142, 168, 'ink-bound')
    + note(30, 222, 'flaw:').replace('font-size="13"', 'font-size="12"') + T(30, 244, "can't stop writing")
    + note(30, 278, 'weak to:').replace('font-size="13"', 'font-size="12"') + T(30, 300, 'deadlines');
  return svg(o + num(33));
}
const PTS: [number, number][] = [...Array(5)].map((_, i) => [150 + 80 * Math.sin(i * 1.2566), 168 - 80 * Math.cos(i * 1.2566)]);
const OFF: [number, number][] = [[-30, -20], [34, -34], [40, 18], [-36, 20], [-50, -6]];
export const RULE = 'rule: every tier costs a memory';
export function sysRight(chars: number, snap: number, broken: boolean): Page {
  let o = note(30, 58, 'fable tiers');
  const pos = PTS.map(([x, y], i) => {
    const s = clamp(snap * 1.6 - i * 0.15);
    const k = s <= 0 ? 1 : 1 - back(s);
    return [x + OFF[i][0] * k, y + OFF[i][1] * k];
  });
  const lines = clamp(snap * 1.4 - 0.4);
  if (lines > 0) {
    o += `<g opacity="${lines.toFixed(2)}"><polygon points="${pos.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" ${S}></polygon>`
      + pos.map((p) => `<path d="M150 168 L${p[0].toFixed(1)} ${p[1].toFixed(1)}" ${S} opacity=".45"></path>`).join('')
      + `<circle cx="150" cy="168" r="34" ${S} stroke-dasharray="4 7"></circle></g>`;
  }
  if (lines < 1) {
    o += `<g opacity="${(1 - lines).toFixed(2)}"><path d="M120 104 L104 130 L112 136" ${S}></path><path d="M196 100 L214 120" ${S}></path>`
      + `<path d="M214 208 L194 222 L202 230" ${S}></path><path d="M96 208 L120 220" ${S}></path>`
      + `<path d="M150 146 L146 160 L156 168 L150 182" fill="none" stroke="${broken ? RED : INK}" stroke-width="2.4" stroke-linecap="round"></path></g>`;
  }
  o += `<circle cx="150" cy="168" r="14" fill="#FBF8F1" stroke="${INK}" stroke-width="2.4"></circle><circle cx="150" cy="168" r="5" fill="${broken && lines < 0.9 ? RED : INK}"></circle>`;
  ['I', 'II', 'III', 'IV', 'V'].forEach((l, i) => {
    const [x, y] = pos[i];
    o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="#FBF8F1" stroke="${INK}" stroke-width="2.4"></circle>`
      + `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" ${MONO} font-size="10" fill="${INK}">${l}</text>`;
  });
  o += `<path d="M22 300 L278 300" stroke="${INK}" stroke-width="1" opacity=".25"></path>`;
  const c = clamp(chars, 0, RULE.length);
  let tip: Tip = null;
  if (c > 0 && c < RULE.length) { o += writing(24, 324, RULE.slice(0, c), 12); tip = { x: 24, y: 324, measure: true }; }
  else if (c > 0) o += T(24, 324, RULE, 12);
  return { html: svg(o + num(34)), tip };
}
