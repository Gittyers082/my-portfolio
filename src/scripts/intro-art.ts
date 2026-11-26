/**
 * The grand opening's art: El charging with his colossal greatsword, side on, and Merlin floating ahead.
 * Everything is an SVG string drawn for a moment in time, so the intro can redraw it every frame.
 * Colours are the site's drawing hex values, so the dark theme remaps them like every other drawing
 * (global.css: html[data-theme="dark"] [fill="#15130F"] ...); FAR has no remap, so it is passed in per theme.
 */
type Pt = [number, number];

const INK = '#15130F';
const LIGHT = '#F4EFE4'; // the cream halo between limbs and body
const PAPER = '#FBF8F1';
const CYAN = '#00789A';
const CYAN2 = '#2BA5C6';

const P = (p: Pt): string => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const smooth = (t: number): number => t * t * (3 - 2 * t);
const path3 = (a: Pt, b: Pt, c: Pt, w: number, col: string): string =>
  `<path d="M${P(a)} L${P(b)} L${P(c)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const halo = (a: Pt, b: Pt, c: Pt, w: number): string => path3(a, b, c, w + 5, LIGHT);
const shoe = (f: Pt, col: string): string =>
  `<path d="M${(f[0] - 6).toFixed(1)} ${f[1].toFixed(1)} L${(f[0] + 16).toFixed(1)} ${(f[1] + 1).toFixed(1)}" stroke="${col}" stroke-width="15" stroke-linecap="round"/>`;

/** El's 8th weapon: an original colossal greatsword, grip along -x, the blade along +x. */
const COLOSSAL = `<g>
  <path d="M-70 -7 L-64 -11 L-58 -11 L-58 11 L-64 11 L-70 7 Z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M-58 -5.5 L-14 -5.5 L-14 5.5 L-58 5.5 Z" fill="${INK}"/>
  ${[-54, -46, -38, -30, -22].map((x) => `<path d="M${x} -5.5 L${x + 5} 5.5" stroke="${LIGHT}" stroke-width="1.6"/>`).join('')}
  <path d="M-14 -24 L-4 -29 L8 -29 L8 35 L-4 35 L-14 30 Z" fill="${LIGHT}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M-8 -21 L3 -21 L3 27 L-8 27 Z" fill="${INK}"/>
  <path d="M-4 -15 L-1 -15 L-1 21 L-4 21 Z" fill="${CYAN}"/>
  <path d="M8 -24 L262 -24 L288 -24 L252 30 L8 30 Z" fill="${LIGHT}" stroke="${INK}" stroke-width="3.8" stroke-linejoin="round"/>
  <path d="M14 -19 L268 -19 L254 2 L14 2 Z" fill="${INK}"/>
  <path d="M14 2 L254 2 L248 11 L14 11 Z" fill="#5A554D"/>
  <path d="M14 11 L248 11 L242 19 L14 19 Z" fill="#B7AE9E"/>
  <path d="M14 19 L242 19 L236 26 L14 26 Z" fill="#ECE5D6"/>
  <path d="M14 2 L254 2 M14 11 L248 11 M14 19 L242 19" stroke="${INK}" stroke-width="1.3"/>
  <path d="M14 26.5 L236 26.5" stroke="${CYAN}" stroke-width="2.6"/>
  <path d="M20 -14 L258 -14" stroke="${LIGHT}" stroke-width="1.2" opacity=".5"/>
  <path d="M26 -24 L35 -17 L44 -24" fill="${LIGHT}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M62 -8 L150 -8 L145 -4 L62 -4 Z" fill="${CYAN}"/>
</g>`;

// The stride, low and bent (he's charging): [nearKnee, nearFoot, farKnee, farFoot], hips at (0,0), feet on y = 96
const LEGS: [Pt, Pt, Pt, Pt][] = [
  [[46, 22], [58, 90], [-32, 36], [-76, 52]], // near leg reaching, far leg kicked up behind
  [[30, 42], [14, 92], [46, 10], [32, 50]], // passing: near planted, far knee driving
  [[-32, 36], [-76, 52], [46, 22], [58, 90]],
  [[46, 10], [32, 50], [30, 42], [14, 92]],
];
const BOB = [-8, 2, -8, 2];
// the far (left) arm pumps: [elbow, hand] from the shoulder
const ARM: [Pt, Pt][] = [[[-30, 18], [-52, 0]], [[0, 34], [10, 52]], [[28, 20], [52, 4]], [[0, 34], [-16, 50]]];
export const STRIDE_S = 0.4;
export const EL_LEAN = 40;

/** El's height in his own units, feet to the tip of his hair, for sizing him to the screen. */
export const EL_HEIGHT = 210;

/**
 * El charging, feet on y = ground, at x, at time t (seconds).
 * far: the colour of his far limbs (no theme remap for it).
 */
export function el(x: number, ground: number, t: number, far: string): string {
  const ph = (Math.max(0, t) / STRIDE_S) % 1, f = ph * 4, i = Math.floor(f) % 4, e = smooth(f - Math.floor(f)), j = (i + 1) % 4;
  const [nk, nf, fk, ff] = LEGS[i].map((p, n) => lerpPt(p, LEGS[j][n], e)) as [Pt, Pt, Pt, Pt];
  const bob = lerp(BOB[i], BOB[j], e);
  const arm = [lerpPt(ARM[i][0], ARM[j][0], e), lerpPt(ARM[i][1], ARM[j][1], e)];
  const a = (EL_LEAN * Math.PI) / 180;
  const neck: Pt = [Math.sin(a) * 74, -Math.cos(a) * 74];
  const sh: Pt = [neck[0] - 4, neck[1] + 10];
  const head: Pt = [neck[0] + Math.sin(a + 0.2) * 36, neck[1] - Math.cos(a + 0.2) * 36];
  const w = (k: number): number => Math.sin(t * 20 + k) * 6;

  // the cape, as on the rock: smooth, one fold, a pointed tail; it wraps his back and lifts in the wind
  const cape = `<path d="M${P([neck[0] + 14, neck[1] - 2])}
      C${neck[0] - 14} ${neck[1] - 16} ${neck[0] - 70} ${neck[1] - 14 + w(0) * 0.5} ${neck[0] - 128} ${neck[1] - 2 + w(1) * 0.6}
      Q${neck[0] - 150} ${neck[1] + 4 + w(2) * 0.6} ${neck[0] - 170} ${neck[1] + 16 + w(3) * 0.7}
      C${neck[0] - 128} ${neck[1] + 46 + w(4) * 0.6} ${neck[0] - 74} ${neck[1] + 70 + w(5) * 0.5} -16 10
      L8 -2 C${neck[0] - 6} ${neck[1] + 46} ${neck[0] + 4} ${neck[1] + 22} ${P([neck[0] + 14, neck[1] + 8])} Z"
      fill="${CYAN}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M${P([neck[0] - 4, neck[1] + 2])} C${neck[0] - 30} ${neck[1] + 20} ${neck[0] - 60} ${neck[1] + 36 + w(3) * 0.4} ${neck[0] - 92} ${neck[1] + 50 + w(4) * 0.5}" fill="none" stroke="#0B4A5C" stroke-width="3" stroke-linecap="round"/>`;

  // the greatsword sits on top of his near shoulder, in front of him, his right hand low on the grip
  const hand: Pt = [sh[0] + 32, sh[1] + 34];
  const rest: Pt = [sh[0] - 10, sh[1] - 30];
  const dir = Math.atan2(rest[1] - hand[1], rest[0] - hand[0]);
  const sword = `<g transform="translate(${P(hand)}) rotate(${((dir * 180) / Math.PI).toFixed(1)}) scale(.74) translate(36 -3)">${COLOSSAL}</g>`;
  const shoulder = `<circle cx="${sh[0] - 2}" cy="${sh[1] - 4}" r="16" fill="${INK}"/>`;
  const fe: Pt = [sh[0] + arm[0][0], sh[1] + arm[0][1]], fh: Pt = [sh[0] + arm[1][0], sh[1] + arm[1][1]];
  const farArm = halo([sh[0] + 4, sh[1] + 10], fe, fh, 15) + path3(sh, fe, fh, 15, far) + `<circle cx="${fh[0].toFixed(1)}" cy="${fh[1].toFixed(1)}" r="8" fill="${far}"/>`;
  const elbow: Pt = [sh[0] + 6, sh[1] + 36];
  const nearArm = halo([sh[0] + 8, sh[1] + 12], elbow, hand, 17) + path3([sh[0] + 4, sh[1] + 4], elbow, hand, 17, INK);
  const fist = `<circle cx="${hand[0].toFixed(1)}" cy="${hand[1].toFixed(1)}" r="9.5" fill="${INK}" stroke="${LIGHT}" stroke-width="2.5"/>`;
  const torso = `<path d="M-2 4 L${P(neck)}" stroke="${INK}" stroke-width="46" stroke-linecap="round"/>`;
  // the head, as on the site: an egg with tall spikes; the headphones are a black band outside the back of
  // the head with a white line inside it and a small white ear cup. No face.
  const hs = `<g transform="translate(${P(head)}) rotate(${(EL_LEAN * 0.15).toFixed(1)})">
      <path d="M-20 -14 L-23 -45 L-10 -30 L0 -58 L7 -33 L15 -50 L16 -30 L26 -38 L22 -10 Z" fill="${INK}"/>
      <path d="M0 -32 C14 -32 24 -16 24 2 C24 19 14 30 0 30 C-14 30 -24 19 -24 2 C-24 -16 -14 -32 0 -32 Z" fill="${INK}"/>
      <path d="M-13 -24 C-24 -18 -29 -6 -28 8 L-27 18" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path d="M-11 -22 C-20 -16 -23 -5 -22 8 L-22 17" fill="none" stroke="${PAPER}" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="-27.5" cy="12" rx="2.8" ry="4.6" fill="${PAPER}"/></g>`;
  const legsFar = path3([0, 0], fk, ff, 22, far) + shoe(ff, far);
  const legsNear = path3([0, 0], nk, nf, 24, INK) + shoe(nf, INK);

  // charging an attack, just a touch: a few tiny zaps that pop near the blade and round him, a couple of motes
  const frame = Math.floor(t * 24);
  const rnd = (n: number): number => { const v = Math.sin(frame * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
  const bolt = (x0: number, y0: number, x1: number, y1: number, seed: number): string => {
    let d = `M${x0.toFixed(1)} ${y0.toFixed(1)}`;
    for (let k = 1; k < 3; k++) d += ` L${(x0 + ((x1 - x0) * k) / 3 + (rnd(seed + k) - 0.5) * 16).toFixed(1)} ${(y0 + ((y1 - y0) * k) / 3 + (rnd(seed + k + 50) - 0.5) * 16).toFixed(1)}`;
    return `${d} L${x1.toFixed(1)} ${y1.toFixed(1)}`;
  };
  const cx0 = neck[0] * 0.5, cy0 = neck[1] * 0.5 - 10;
  const along = (d: number): Pt => [hand[0] + Math.cos(dir) * d, hand[1] + Math.sin(dir) * d];
  let zap = '';
  for (let k = 0; k < 4; k++) {
    if (rnd(40 + k) > 0.6) continue;
    const onBlade = k < 2, b = along(60 + rnd(60 + k) * 140);
    const x0 = onBlade ? b[0] + (k ? 12 : -12) : cx0 + (rnd(70 + k) - 0.5) * 120;
    const y0 = onBlade ? b[1] : cy0 + (rnd(80 + k) - 0.5) * 140;
    const d = bolt(x0, y0, x0 + (rnd(90 + k) - 0.5) * 34, y0 - 14 - rnd(95 + k) * 16, 100 + k * 7);
    zap += `<path d="${d}" fill="none" stroke="${PAPER}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${CYAN2}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  let motes = '';
  for (let k = 0; k < 4; k++) {
    const q = (t * 1.1 + k / 4) % 1, ang = k * 2.4, r = 110 * (1 - q) + 30;
    motes += `<circle cx="${(cx0 + Math.cos(ang) * r).toFixed(1)}" cy="${(cy0 + Math.sin(ang) * r * 0.9).toFixed(1)}" r="${(1.2 + q * 1.6).toFixed(2)}" fill="${CYAN2}" opacity="${(Math.min(1, q * 2) * 0.8).toFixed(2)}"/>`;
  }
  const body = `<g transform="translate(${x.toFixed(1)} ${(ground - 92 + bob).toFixed(1)})">${motes}${legsFar}${farArm}${torso}${legsNear}${cape}${hs}${shoulder}${nearArm}${sword}${fist}${zap}</g>`;

  // speed lines and dust behind him
  let fx = '';
  for (let k = 0; k < 6; k++) { const s = (t * 5 + k * 0.17) % 1; fx += `<rect x="${(x - 150 - s * 200).toFixed(1)}" y="${ground - 200 + k * 30}" width="${90 - k * 9}" height="5" rx="2.5" fill="${INK}" opacity="${(0.75 * (1 - s)).toFixed(2)}"/>`; }
  for (let k = 0; k < 3; k++) { const s = (t * 4 + k / 3) % 1; fx += `<circle cx="${(x - 10 - s * 80).toFixed(1)}" cy="${(ground - 8 - s * 14).toFixed(1)}" r="${(5 + s * 15).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="3" opacity="${(1 - s).toFixed(2)}"/>`; }
  return fx + body;
}

/**
 * Merlin's fire, alive: his flow filter's noise reseeds every frame so the edges boil, and the outer and
 * inner flames stretch and sway out of step. svg is his drawing's inner markup.
 */
function liveFire(svg: string, t: number): string {
  let i = 0;
  const flick = (ph: number): string => {
    const sy = 1 + Math.sin(t * 17 + ph) * 0.1 + Math.sin(t * 29 + ph * 2) * 0.05;
    const sx = 1 + Math.sin(t * 13 + ph) * 0.05, sk = Math.sin(t * 11 + ph) * 6;
    return ` transform="translate(100 118) skewX(${sk.toFixed(1)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-100 -118)"`;
  };
  return svg
    .replace(/seed="\d+"/, `seed="${Math.floor(t * 14) % 60}"`)
    .replace(/<g filter="url\(#[\w-]*flow\)">/g, (m) => `${m.slice(0, -1)}${flick(i++ * 1.7)}>`);
}

/**
 * Merlin floating on his own just ahead of El, about level with his head and about its size: his own slow
 * bob, a few speed lines, a soft glow, embers drifting back. elX: El's x; merlin: his drawing's inner markup.
 */
export function merlin(elX: number, ground: number, t: number, svg: string): string {
  const a = (EL_LEAN * Math.PI) / 180;
  const neckX = Math.sin(a) * 74, neckY = -Math.cos(a) * 74;
  const headY = ground - 92 + neckY - Math.cos(a + 0.2) * 36;
  const k = 0.5, cx = elX + neckX + Math.sin(a + 0.2) * 36 + 118, cy = headY - 14 + Math.sin(t * 5.5) * 7;
  let s = '';
  for (let n = 0; n < 3; n++) { const q = (t * 3.2 + n / 3) % 1; s += `<rect x="${(cx - 52 - q * 70).toFixed(1)}" y="${(cy - 14 + n * 14).toFixed(1)}" width="${26 - n * 4}" height="3.5" rx="1.75" fill="${INK}" opacity="${(0.6 * (1 - q)).toFixed(2)}"/>`; }
  s += `<circle cx="${cx.toFixed(1)}" cy="${(cy - 18).toFixed(1)}" r="58" fill="url(#intro-glow)"/>`;
  for (let n = 0; n < 7; n++) {
    const q = (t * 1.6 + n / 7) % 1, ex = cx - 10 - q * 110, ey = cy - 52 + (n % 3) * 12 - q * 18 + Math.sin(q * 9 + n) * 5;
    s += `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${(2.6 * (1 - q) + 0.6).toFixed(2)}" fill="${n % 2 ? CYAN2 : '#8BE9F3'}" opacity="${(1 - q).toFixed(2)}"/>`;
  }
  s += `<g class="intro__merlin" transform="rotate(-8 ${cx.toFixed(1)} ${cy.toFixed(1)})"><svg x="${(cx - 130 * k).toFixed(1)}" y="${(cy - 180 * k).toFixed(1)}" width="${260 * k}" height="${294 * k}" viewBox="-30 -70 260 294" style="overflow:visible">${liveFire(svg, t)}</svg></g>`;
  return s;
}

export const GLOW_DEFS = `<radialGradient id="intro-glow"><stop offset="0" stop-color="${CYAN2}" stop-opacity=".28"/><stop offset="1" stop-color="${CYAN2}" stop-opacity="0"/></radialGradient>`;
