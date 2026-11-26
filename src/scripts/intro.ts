/**
 * The grand opening (Intro.astro), the home page only, once per visit:
 * El, charging with his greatsword, and Merlin blast across the screen and out; Dot comes running far behind,
 * trips on a pebble and lands with his open top dead centre; the ink pools along the floor, rises over
 * everything, El. shows in it, then it drains away to the page.
 * - Base.astro's head script decides before the first paint (html.intro-on), so the page never flashes.
 * - Any click, tap, key or scroll skips it. Reduced motion never sees it.
 * - El and Merlin are drawn every frame (intro-art.ts); Dot and the ink are CSS (global.css, search "intro"),
 *   started in the same frame as the clock so they stay in step.
 * Dot and Merlin are clones of their drawings already on the page (Contact's Dot, the Merlin demo).
 */
import { el, merlin, EL_HEIGHT, GLOW_DEFS } from './intro-art';

const SEEN_KEY = 'intro-seen';
const CROSS_S = 1; // El and Merlin take this long to cross the screen; Dot's run starts after
const END_MS = 5000; // the drain is done by then
const LEAVE_MS = 300; // the fade when skipped

export function initIntro(): void {
  const root = document.documentElement;
  const box = document.querySelector<HTMLElement>('[data-intro]');
  if (!box || !root.classList.contains('intro-on')) { box?.remove(); return; }

  const dotSrc = document.querySelector<SVGGElement>('[data-dot="ledge"]');
  const merlinSrc = document.querySelector<SVGSVGElement>('.demo--merlin svg[viewBox="-30 -70 260 294"]');
  const finish = (): void => { root.classList.remove('intro-on'); box.remove(); };
  if (!dotSrc || !merlinSrc) { finish(); return; }
  try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* it just plays again next time */ }

  const W = window.innerWidth, H = window.innerHeight, phone = W < 700;
  const dark = root.dataset.theme === 'dark';

  // sizes come from El: about a third of the screen tall; Dot comes up to his knee
  const s = Math.min(H * 0.3, W * 0.52) / EL_HEIGHT;
  const dw = EL_HEIGHT * s * 0.42 * (120 / 112), dh = (dw * 112) / 120;
  // where Dot trips, solved so his open top lands dead centre once he has fallen forward 100 degrees
  const th = (100 * Math.PI) / 180, vx = -0.25 * dw, vy = -0.68 * dh;
  const rx = vx * Math.cos(th) - vy * Math.sin(th), ry = vx * Math.sin(th) + vy * Math.cos(th);
  const floorY = H / 2 - ry, stopX = W / 2 - (0.75 * dw + rx + 14);
  const ox = stopX + 0.75 * dw + rx + 14, oy = floorY + ry;

  // Merlin, cleaned up: no summon beam, shadow or magic circle; ids renamed so his filter is ours to animate
  const m = merlinSrc.cloneNode(true) as SVGSVGElement;
  m.querySelectorAll('.mer__beam, .mer__shadow').forEach((n) => n.remove());
  m.querySelector('.mer__circle')?.closest('g[transform]')?.remove();
  const merlinSvg = m.innerHTML.replace(/id="mer-/g, 'id="intro-mer-').replace(/url\(#mer-/g, 'url(#intro-mer-');

  const scene = document.createElement('div');
  scene.className = 'intro__scene';
  scene.style.setProperty('--dash', `${W * 0.6 + dw}px`);
  scene.style.setProperty('--drain', `${H + 120}px`);

  // the floor, and the pebble Dot catches his foot on
  const floor = `<div class="intro__floor" style="top:${floorY}px"></div><div class="intro__stone" style="left:${stopX + dw * 0.62}px;top:${floorY - 9}px"></div>`;
  // El and Merlin: one SVG, redrawn every frame
  const chars = '<svg class="intro__chars" aria-hidden="true"></svg>';
  // Dot: runs in, trips forward
  const dotBox = `<div class="intro__dot" style="left:${stopX}px;top:${floorY - dh * 0.95}px;width:${dw}px;height:${dh}px"><div class="intro__dot-fall"><svg viewBox="0 0 120 112" width="${dw}" height="${dh}"></svg></div></div>`;

  // the spill: lobes racing out along the floor at different speeds, a few drops flung ahead, a body that rises last
  const big = Math.hypot(W, H) * 1.25;
  let spill = `<i class="intro__body" style="left:${ox - big}px;top:${oy - big}px;width:${big * 2}px;height:${big * 2}px"></i>`;
  const N = 18;
  for (let k = 0; k < N; k++) {
    const dir = k % 2 ? 1 : -1, spread = (k >> 1) / (N / 2);
    const dx = dir * ((phone ? 30 : 60) + spread * (phone ? W * 0.55 : W * 0.5)) * (0.8 + ((k * 37) % 40) / 100);
    const dy = (((k * 53) % 30) - 15) * (phone ? 0.6 : 1);
    const r = (phone ? 40 : 70) + ((k * 41) % 60) + (1 - spread) * (phone ? 30 : 60);
    const cx = ox + dx, cy = oy + 6 + dy;
    spill += `<i class="intro__lobe" style="left:${cx - r}px;top:${cy - r * 0.42}px;width:${r * 2}px;height:${r * 0.84}px;--ox:${ox - cx}px;--oy:${oy - cy}px;--d:${Math.round(spread * 420 + ((k * 29) % 80))}ms"></i>`;
  }
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI * (0.15 + k * 0.1), d = (phone ? 70 : 140) + k * (phone ? 18 : 34), r = 5 + ((k * 7) % 8);
    spill += `<i class="intro__drop" style="left:${ox - r}px;top:${oy - r}px;width:${r * 2}px;height:${r * 2}px;--tx:${Math.cos(a) * d * (k % 2 ? 1 : -0.6)}px;--ty:${Math.sin(a) * d * 0.9}px;--d:${k * 25}ms"></i>`;
  }
  // the flood: El. in the ink, then it drains away with drips on its top edge
  let drips = '';
  for (let i = 0; i < 13; i++) {
    const x = ((i + 0.2 + ((i * 31) % 5) / 10) / 13) * 100, w = 1.4 + ((i * 37) % 4) * 0.5, h = 22 + ((i * 53) % 60);
    drips += `<i style="left:${x}%;width:${w}%;height:${h}px"></i>`;
  }
  const flood = `<div class="intro__flood"><div class="intro__drips">${drips}</div>
    <p class="intro__logo" style="top:${H / 2 - (phone ? 60 : 110)}px">El<span>.</span></p>
    <p class="intro__name" style="top:${H / 2 + (phone ? 70 : 125)}px">El. Steven D. Cruz</p></div>`;

  scene.innerHTML = `<div class="intro__paper">${floor}</div>${chars}${dotBox}<div class="intro__spill">${spill}</div>${flood}`;
  box.appendChild(scene);
  const dot = dotSrc.cloneNode(true) as SVGGElement;
  dot.setAttribute('transform', '');
  scene.querySelector('.intro__dot svg')?.appendChild(dot);
  const svg = scene.querySelector<SVGSVGElement>('.intro__chars');
  if (!svg) { finish(); return; }
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const far = dark ? '#B9B1A3' : '#34312C';
  const ground = floorY / s;

  // one clock: the CSS starts with it, El and Merlin are drawn from it
  let raf = 0, done = false;
  const start = performance.now();
  box.classList.add('is-playing');
  const frame = (now: number): void => {
    // a frame's timestamp can be a hair before start: clamp, or the stride maths sees negative time
    const t = Math.max(0, (now - start) / 1000);
    try {
      if (t <= CROSS_S + 0.05) {
        const x = -320 + (W / s + 640) * (t / CROSS_S);
        svg.innerHTML = `<defs>${GLOW_DEFS}</defs><g transform="scale(${s.toFixed(4)})">${el(x, ground, t, far)}${merlin(x, ground, t, merlinSvg)}</g>`;
      } else if (svg.firstChild) {
        svg.innerHTML = '';
      }
    } catch {
      end(false); // never leave the page covered
      return;
    }
    if (t * 1000 >= END_MS) { end(false); return; }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const end = (skipped: boolean): void => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach((ev) => window.removeEventListener(ev, skip, true));
    if (!skipped) { finish(); return; }
    box.classList.add('is-leaving');
    window.setTimeout(finish, LEAVE_MS);
  };
  const skip = (e: Event): void => {
    if (e instanceof KeyboardEvent && (e.key === 'Tab' || e.key === 'Shift')) return;
    end(true);
  };
  ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach((ev) => window.addEventListener(ev, skip, true));
}
