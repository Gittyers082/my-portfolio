/**
 * The post-credits scene's art: meanwhile, back at the intro. Dot cries in a puddle of himself, Merlin blames El,
 * El scratches his head, then pats Dot. Four comic panels, each an SVG string drawn for a moment in time.
 * Colours are the site's drawing hex values, so the dark theme remaps them (global.css); FAR has no remap,
 * so it is passed in per theme, as in the grand opening.
 */
import { COLOSSAL } from './intro-art';

type Pt = [number, number];

const INK = '#15130F';
const LIGHT = '#F4EFE4';
const PAPER = '#FBF8F1';
const CYAN = '#00789A';
const CYAN2 = '#2BA5C6';

const P = (p: Pt): string => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const path3 = (a: Pt, b: Pt, c: Pt, w: number, col: string): string =>
  `<path d="M${P(a)} L${P(b)} L${P(c)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const halo = (a: Pt, b: Pt, c: Pt, w: number): string => path3(a, b, c, w + 5, LIGHT);

/** El's head, side on, facing +x: spiky hair, the black headband of his headphones with its white line and ear cup. */
const HEAD = (tilt: number): string => `<g transform="rotate(${tilt.toFixed(1)})">
  <path d="M-20 -14 L-23 -45 L-10 -30 L0 -58 L7 -33 L15 -50 L16 -30 L26 -38 L22 -10 Z" fill="${INK}"/>
  <path d="M0 -32 C14 -32 24 -16 24 2 C24 19 14 30 0 30 C-14 30 -24 19 -24 2 C-24 -16 -14 -32 0 -32 Z" fill="${INK}"/>
  <path d="M-13 -24 C-24 -18 -29 -6 -28 8 L-27 18" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <path d="M-11 -22 C-20 -16 -23 -5 -22 8 L-22 17" fill="none" stroke="${PAPER}" stroke-width="2.6" stroke-linecap="round"/>
  <ellipse cx="-27.5" cy="12" rx="2.8" ry="4.6" fill="${PAPER}"/></g>`;

/**
 * El standing, facing +x in his own units (hips at 0,0, feet on y = 96); facing = -1 flips him.
 * 'scratch': far hand at the back of his head, a sweat drop. 'pat': crouched a little, near hand patting.
 * id: unique per panel, for the clip that buries the sword's point in the ground.
 */
function elStand(id: string, x: number, ground: number, t: number, far: string, facing: 1 | -1, mode: 'scratch' | 'pat', scale: number): string {
  const sway = Math.sin(t * 2.2) * 1.5;
  const crouch = mode === 'pat' ? 10 : 0;
  const neck: Pt = [8, -72 + crouch], sh: Pt = [4, -60 + crouch];
  const head: Pt = [neck[0] + 12, neck[1] - 32];
  const kn = crouch * 0.8;
  const legs = path3([-4, 0], [-14 - kn, 48], [-20, 94], 21, far) + `<path d="M-27 94 L-9 95" stroke="${far}" stroke-width="14" stroke-linecap="round"/>`
    + path3([5, 0], [15 + kn, 48], [22, 94], 23, INK) + `<path d="M15 94 L35 95" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>`;
  // the cape as on the rock: over both shoulders, down past the hips, a wavy hem sweeping back into one tail in the wind
  const w = (k: number): number => Math.sin(t * 2.6 + k) * 3.5;
  const N = (dx: number, dy: number): string => P([neck[0] + dx, neck[1] + dy]);
  const cape = `<path d="M${N(14, 4)} C${N(4, -8)} ${neck[0] - 18} ${neck[1] - 6} ${neck[0] - 26} ${neck[1] + 8}
      C${(-42 + w(0) * 0.3).toFixed(1)} -36 ${(-54 + w(1) * 0.6).toFixed(1)} -20 ${(-72 + w(2)).toFixed(1)} ${(4 + w(3)).toFixed(1)}
      C${(-56 + w(4) * 0.6).toFixed(1)} ${(12 + w(0) * 0.5).toFixed(1)} -42 30 -28 32 C-18 33 -10 40 4 32
      C8 -6 ${neck[0] + 6} ${neck[1] + 30} ${N(16, 10)} Z" fill="${CYAN}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M${N(-6, 10)} C${neck[0] - 18} ${neck[1] + 34} -20 -14 -16 26" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <path d="M${N(16, 4)} C${N(8, -4)} ${N(-6, -4)} ${N(-16, 6)}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  const torso = `<path d="M0 -10 L${P(neck)}" stroke="${INK}" stroke-width="42" stroke-linecap="round"/><path d="M-14 -14 L15 -14 L19 6 L-13 6 Z" fill="${INK}"/>`;
  // the greatsword, driven point-first into the ground (clipped at the ground line, a crack and two chips);
  // when he pats Dot it stands behind him, so his hand reaches Dot and not the hilt
  const sx = mode === 'pat' ? -62 : 62, o = sx - 62;
  const sword = `<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><rect x="${sx - 42}" y="-200" width="120" height="296"/></clipPath>`
    + `<g clip-path="url(#${id})"><g transform="translate(${sx} -16) rotate(91) scale(.5)">${COLOSSAL}</g></g>`
    + `<g transform="translate(${o} 0)"><path d="M44 97 L52 92 M83 97 L76 91 M50 97 L80 97" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M40 92 l4 -4 l3 4 Z M86 91 l3 -5 l4 4 Z" fill="${INK}"/></g>`;
  let farArm: string, near: string, extra = '';
  if (mode === 'scratch') {
    const hand: Pt = [head[0] - 16, head[1] - 8 + Math.sin(t * 14) * 2.5], elbow: Pt = [sh[0] - 22, sh[1] - 44];
    farArm = path3(sh, elbow, hand, 15, far) + `<circle cx="${hand[0].toFixed(1)}" cy="${hand[1].toFixed(1)}" r="8" fill="${far}"/>`;
    const e: Pt = [sh[0] + 18, sh[1] + 30], h: Pt = [sh[0] + 26, sh[1] + 46];
    near = halo([sh[0] + 8, sh[1] + 12], e, h, 17) + path3([sh[0] + 4, sh[1] + 4], e, h, 17, INK) + `<circle cx="${h[0]}" cy="${h[1]}" r="9" fill="${INK}" stroke="${LIGHT}" stroke-width="2.5"/>`;
    const d = (t * 0.8) % 1;
    extra = `<path d="M${head[0] + 30} ${(head[1] - 30 + d * 18).toFixed(1)} q6 10 0 14 q-6 -4 0 -14 Z" fill="${CYAN2}" stroke="${INK}" stroke-width="1.5" opacity="${(1 - d * 0.6).toFixed(2)}"/>`;
  } else {
    farArm = halo([sh[0] - 2, sh[1] + 10], [-6, -26 + crouch], [-2, -2 + crouch], 15) + path3(sh, [-6, -26 + crouch], [-2, -2 + crouch], 15, far);
    const e: Pt = [sh[0] + 34, sh[1] + 30], h: Pt = [sh[0] + 62, sh[1] + 74 - Math.abs(Math.sin(t * 6)) * 5];
    near = halo([sh[0] + 6, sh[1] + 6], e, h, 17) + path3([sh[0] + 4, sh[1] + 4], e, h, 17, INK) + `<circle cx="${h[0]}" cy="${h[1].toFixed(1)}" r="9.5" fill="${INK}" stroke="${LIGHT}" stroke-width="2.5"/>`;
  }
  const hs = `<g transform="translate(${P(head)})">${HEAD(mode === 'pat' ? 18 : 10 + sway)}</g>`;
  return `<g transform="translate(${x} ${ground - 96 * scale}) scale(${facing * scale} ${scale})">${sword}${legs}${farArm}${torso}${cape}${hs}${near}${extra}</g>`;
}

/** Dot crying in a puddle of himself: shut eyes, a wailing mouth, ink tears, sobbing. body: his drawing, face removed. */
function dotCry(body: string, cx: number, ground: number, t: number, size: number): string {
  const sob = Math.abs(Math.sin(t * 7));
  const face = `<path d="M40 62 Q47 68 54 62 M66 62 Q73 68 80 62" fill="none" stroke="${LIGHT}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M37 58 L45 56 M83 58 L75 56" stroke="${LIGHT}" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="60" cy="${(80 + sob * 1.5).toFixed(1)}" rx="${(6 + sob * 2).toFixed(1)}" ry="${(4 + sob * 4).toFixed(1)}" fill="${LIGHT}"/>`;
  let tears = '';
  for (const [ex, dir] of [[42, -1], [78, 1]]) {
    tears += `<path d="M${ex} 68 Q${ex + dir * 10} 76 ${ex + dir * 14} 92" fill="none" stroke="${CYAN2}" stroke-width="4" stroke-linecap="round"/>`;
    for (let k = 0; k < 2; k++) {
      const q = (t * 1.6 + k / 2 + (dir > 0 ? 0.25 : 0)) % 1;
      tears += `<circle cx="${(ex + dir * (14 + q * 6)).toFixed(1)}" cy="${(92 + q * 18).toFixed(1)}" r="${(3 - q).toFixed(2)}" fill="${CYAN2}" opacity="${(1 - q * 0.7).toFixed(2)}"/>`;
    }
  }
  const s = size / 120;
  const puddle = `<ellipse cx="${cx}" cy="${ground}" rx="${(size * (0.75 + Math.sin(t * 1.3) * 0.03)).toFixed(1)}" ry="${size * 0.1}" fill="${INK}"/>`;
  return `${puddle}<g transform="translate(${cx - size / 2} ${(ground - size * 0.88 - sob * 3).toFixed(1)}) scale(${s.toFixed(4)} ${(s * (1 - sob * 0.03)).toFixed(4)})">${body}${face}${tears}</g>`;
}

/** Merlin scolding: flames flaring, angry brows, leaning in. svg: his drawing's inner markup, ids unique to the panel. */
function merlinScold(svg: string, cx: number, cy: number, t: number, size: number, lean: number): string {
  const k = size / 130, flare = 1.12 + Math.sin(t * 9) * 0.06;
  let i = 0;
  const live = svg.replace(/seed="\d+"/, `seed="${Math.floor(t * 14) % 60}"`)
    .replace(/<g filter="url\(#[\w-]*flow\)">/g, (m) => {
      const sx = flare * (1 + Math.sin(t * 13 + i) * 0.04), sy = flare * (1 + Math.sin(t * 17 + i * 1.7) * 0.1);
      i++;
      return `${m.slice(0, -1)} transform="translate(100 118) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-100 -118)">`;
    });
  const brows = `<path d="M58 80 L94 92 M142 80 L106 92" stroke="#14213D" stroke-width="6" stroke-linecap="round"/>`;
  const bob = Math.sin(t * 4) * 5;
  return `<circle cx="${cx}" cy="${(cy - 10 + bob).toFixed(1)}" r="${size * 0.62}" fill="url(#pc-glow)"/>
    <g transform="rotate(${lean * 10} ${cx} ${(cy + bob).toFixed(1)})"><svg x="${cx - 130 * k}" y="${(cy - 180 * k + bob).toFixed(1)}" width="${260 * k}" height="${294 * k}" viewBox="-30 -70 260 294" style="overflow:visible">${live}${brows}</svg></g>`;
}

// ---------- speech bubbles: measured text, a box in clear space, a tail from the side nearest the speaker
const measure = document.createElement('canvas').getContext('2d');
const textWidth = (s: string, font: string): number => {
  if (!measure) return s.length * 8;
  measure.font = font;
  return measure.measureText(s).width;
};
const f = (n: number): string => n.toFixed(1);

function bubble(x: number, y: number, lines: string[], tx: number, ty: number, size: number, shout = false): string {
  const font = `${shout ? 900 : 700} ${size}px Archivo, sans-serif`;
  const w = Math.max(...lines.map((l) => textWidth(l, font))) + (shout ? 34 : 26), lh = size * 1.22, h = lines.length * lh + (shout ? 20 : 14);
  const bx = x - w / 2, by = y - h / 2;
  let out = '';
  if (!shout) {
    const dx = tx - x, dy = ty - y, horiz = Math.abs(dx) / w > Math.abs(dy) / h;
    let a: Pt, b: Pt;
    if (horiz) {
      const sx = dx > 0 ? bx + w - 1 : bx + 1, sy = Math.max(by + 14, Math.min(by + h - 14, ty));
      a = [sx, sy - 7]; b = [sx, sy + 7];
    } else {
      const sy = dy > 0 ? by + h - 1 : by + 1, sx = Math.max(bx + 18, Math.min(bx + w - 18, x + dx * 0.25));
      a = [sx - 11, sy]; b = [sx + 11, sy];
    }
    out += `<path d="M${f(a[0])} ${f(a[1])} Q${f((a[0] + tx) / 2)} ${f((a[1] + ty) / 2 - 2)} ${tx} ${ty} Q${f((b[0] + tx) / 2 + 2)} ${f((b[1] + ty) / 2)} ${f(b[0])} ${f(b[1])} Z" fill="${PAPER}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`
      + `<rect x="${f(bx)}" y="${f(by)}" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(16, h / 2))}" fill="${PAPER}" stroke="${INK}" stroke-width="2.6"/>`
      + `<path d="M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}" stroke="${PAPER}" stroke-width="4.5"/>`;
  } else {
    // a burst: even spikes all round, one stretched toward the shouter off panel
    const n = 18, pts: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const an = (i / n) * Math.PI * 2;
      pts.push([x + Math.cos(an) * (w / 2) * (i % 2 ? 0.9 : 1.16), y + Math.sin(an) * (h / 2) * (i % 2 ? 0.86 : 1.32)]);
    }
    let k = Math.round((((Math.atan2(ty - y, tx - x) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * n) % n;
    if (k % 2) k = (k + 1) % n;
    pts[k] = [tx, ty];
    out += `<path d="M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L')} Z" fill="${PAPER}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
  }
  out += lines.map((l, i) => `<text x="${x}" y="${f(y - ((lines.length - 1) * lh) / 2 + size * 0.36 + i * lh)}" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="${shout ? 900 : 700}" font-size="${size}" fill="${INK}">${l}</text>`).join('');
  return out;
}

const caption = (text: string, w: number): string =>
  `<rect x="0" y="0" width="${w}" height="28" fill="${INK}"/><text x="11" y="19" font-family="Archivo, sans-serif" font-weight="800" font-size="13" letter-spacing="1" fill="${PAPER}">${text}</text>`;
const floor = (y: number): string => `<line x1="0" y1="${y}" x2="320" y2="${y}" stroke="${INK}" stroke-width="3"/>`;
const DEFS = `<defs><radialGradient id="pc-glow"><stop offset="0" stop-color="${CYAN2}" stop-opacity=".3"/><stop offset="1" stop-color="${CYAN2}" stop-opacity="0"/></radialGradient></defs>`;

/** What each panel says, for screen readers. */
export const PANEL_LABELS = [
  'Panel 1, splat: Dot sits in a puddle of ink, crying, speed lines where El and Merlin ran off.',
  'Panel 2: Merlin, flames flaring, to El: You ran right past him! El scratches the back of his head.',
  'Panel 3: El, his greatsword stuck in the ground: I was charging an attack. Merlin, off panel: At what?!',
  'Panel 4: El pats Dot on the head, Merlin sighs in the corner. Dot sniffles: Can I be in the next intro?',
];

export interface Cast {
  dot: string;          // Dot's drawing, face removed
  merlin: string[];     // Merlin's drawing for panels 2 and 4, ids made unique to each
  far: string;          // El's far limbs, per theme
}

/** The four panels at time t (seconds), each the inner markup of a 320 by 260 SVG. */
export function panels(c: Cast, t: number): string[] {
  const G = 232;
  return [
    DEFS + floor(G) + dotCry(c.dot, 150, G, t, 104) + caption('1 · SPLAT', 92)
      + `<g opacity=".55">${[0, 1, 2].map((i) => `<rect x="${226 + i * 12}" y="${70 + i * 24}" width="${70 - i * 14}" height="4" rx="2" fill="${INK}"/>`).join('')}</g>`,
    DEFS + floor(G) + merlinScold(c.merlin[0], 84, 166, t, 76, 1) + elStand('pc-sw2', 238, G, t, c.far, -1, 'scratch', 0.8)
      + bubble(100, 52, ['You ran right', 'past him!'], 88, 108, 14) + caption('2', 28),
    DEFS + floor(G) + elStand('pc-sw3', 176, G, t, c.far, 1, 'scratch', 0.8)
      + bubble(84, 52, ['I was charging', 'an attack.'], 156, 66, 14) + bubble(60, 194, ['AT WHAT?!'], -6, 168, 15, true) + caption('3', 28),
    DEFS + floor(G) + dotCry(c.dot, 150, G, t * 0.5, 80) + elStand('pc-sw4', 214, G, t, c.far, -1, 'pat', 0.8)
      + `<g transform="translate(252 22) scale(.5)">${merlinScold(c.merlin[1], 60, 60, t, 70, -1)}</g>`
      + bubble(92, 60, ['…can I be in', 'the next intro?'], 132, 150, 13) + caption('4', 28),
  ];
}
