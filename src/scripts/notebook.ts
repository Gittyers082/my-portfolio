/**
 * The About me grimoire (components/Notebook.astro). Three spreads, each with a problem:
 * - turning to a page (click the book) makes its problem burst out: errors, flying to-dos,
 *   a broken chart, and a red stamp;
 * - clicking the quill makes it write the fix: it follows the line it's writing, each
 *   problem clears as its part is fixed, and the stamp turns green;
 * - clicking the mug tips it over the notebook; the coffee spreads, soaks in, and the mug
 *   rights itself.
 * One thing at a time: while the quill writes, the page turns or the coffee spills, the
 * other two wait. Everything is drawn from a little state (what page, when each thing
 * started) by one animation loop that only runs while the desk is on screen.
 * Sounds follow the nav's sound button (sfx.ts). Reduced motion: changes happen in place.
 */
import { flip as flipSound, splash, scribble, zzt, whoosh, stamp, chime } from './sfx';
import {
  codeLeft, codeRight, planLeft, planRight, ocLeft, sysRight,
  FIX_CHARS, CODE_SOLVED, TODO, TODO_CHARS, ROW, RULE, type Page,
} from './grimoire-pages';

const W = 760; // the scene's own width, before it's scaled to the column
const TURN_MS = 800;
const BURST_MS = 1400;
const FIX_MS = 2400;
const SPILL_MS = 3200;

const clamp = (x: number, a = 0, b = 1): number => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
const ease = (p: number): number => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const out = (p: number): number => 1 - Math.pow(1 - p, 3);
const back = (p: number): number => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const earn = (key: string): void => { document.dispatchEvent(new CustomEvent('trust:earn', { detail: key })); };

type Flyer = { el: HTMLElement; to: [number, number]; gone: number; stamp?: boolean };

export function initNotebook(): void {
  const root = document.querySelector<HTMLElement>('[data-notebook]');
  const stage = root?.querySelector<HTMLElement>('[data-stage]');
  const book = root?.querySelector<HTMLButtonElement>('[data-book]');
  const L = root?.querySelector<HTMLElement>('[data-page-l]');
  const R = root?.querySelector<HTMLElement>('[data-page-r]');
  const leaf = root?.querySelector<HTMLElement>('[data-leaf]');
  const front = root?.querySelector<HTMLElement>('[data-face-front]');
  const backFace = root?.querySelector<HTMLElement>('[data-face-back]');
  const shade = root?.querySelector<HTMLElement>('[data-leaf-shade]');
  const fx = root?.querySelector<HTMLElement>('[data-fx]');
  const puddle = root?.querySelector<SVGSVGElement>('[data-puddle]');
  const mug = root?.querySelector<HTMLButtonElement>('[data-mug]');
  const quill = root?.querySelector<HTMLButtonElement>('[data-quill]');
  const live = root?.querySelector<HTMLElement>('[data-gm-live]');
  if (!root || !stage || !book || !L || !R || !leaf || !front || !backFace || !shade || !fx || !puddle || !mug || !quill) return;
  const mugSvg = mug.querySelector<SVGSVGElement>('svg');
  const coffee = Array.from(mug.querySelectorAll<SVGElement>('.gm-mug__coffee'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- scale the 760×520 scene to the column ---------- */
  let scale = 1;
  const fit = (): void => { scale = root.clientWidth / W || 1; root.style.setProperty('--s', scale.toFixed(4)); };
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(root);

  /* ---------- the things that burst out ---------- */
  const fly = (cls: string, html: string): HTMLElement => {
    const el = document.createElement('span');
    el.className = `gm-fly gm-fly--${cls}`;
    el.innerHTML = html;
    fx.appendChild(el);
    return el;
  };
  const err = (mark: string, text: string): HTMLElement => fly('err', `<b>${mark}</b> ${text}`);
  const FLYERS: Flyer[][] = [
    [
      { el: err('✕', 'LogicError: summons dry ink'), to: [250, 40], gone: CODE_SOLVED[0] },
      { el: err('✕', 'ReferenceError: inc is not defined'), to: [470, 74], gone: CODE_SOLVED[1] },
      { el: err('✕', 'SyntaxError: missing }'), to: [650, 300], gone: CODE_SOLVED[2] },
      { el: fly('stamp', '3 PROBLEMS'), to: [190, 480], gone: 2, stamp: true },
    ],
    [
      ...TODO.map((t, i): Flyer => ({ el: fly('slip', t), to: ([[170, 44], [650, 290], [210, 484], [440, 492]] as [number, number][])[i], gone: 2 })),
      { el: fly('stamp', 'OVERDUE'), to: [470, 52], gone: 2, stamp: true },
    ],
    [
      { el: err('!', 'too OP'), to: [650, 300], gone: 0.75 },
      { el: err('!', 'no cost?'), to: [240, 44], gone: 0.4 },
      { el: fly('stamp', 'UNBALANCED'), to: [200, 482], gone: 2, stamp: true },
    ],
  ];
  const ORIGIN: [number, number] = [330, 250];

  /* ---------- state ---------- */
  let k = 0; // the open spread
  let turn: { from: number; to: number; t0: number } | null = null;
  let burstT0: number | null = null; // when this page's problem burst out
  let fixT0: number | null = null; // when the quill started writing
  let spillT0: number | null = null;
  const lastLabel = ['', '', ''];
  const fixP = (now: number): number => (fixT0 === null ? 0 : clamp((now - fixT0) / FIX_MS));
  const fixing = (now: number): boolean => fixT0 !== null && now - fixT0 < FIX_MS;
  const spilling = (now: number): boolean => spillT0 !== null && now - spillT0 < SPILL_MS;
  const busy = (now: number): boolean => !!turn || fixing(now) || spilling(now);
  const say = (s: string): void => { if (live) live.textContent = s; };

  /* ---------- the pages, at any point of the fix ---------- */
  const left = (page: number, p: number): string => {
    if (page === 0) return codeLeft(CODE_SOLVED.filter((v) => p >= v).length, p < 1);
    return page === 1 ? planLeft() : ocLeft();
  };
  const right = (page: number, p: number): Page => {
    if (page === 0) return codeRight(Math.floor(clamp(p / 0.92) * FIX_CHARS));
    if (page === 1) return planRight(Math.floor(clamp(p / 0.7) * TODO_CHARS), clamp((p - 0.72) / 0.24) * 2);
    return sysRight(Math.floor(clamp(p / 0.6) * RULE.length), clamp((p - 0.6) / 0.4), p < 0.9);
  };
  const put = (el: HTMLElement, html: string): void => {
    if ((el as HTMLElement & { _h?: string })._h === html) return;
    el.querySelector(':scope > svg')?.remove();
    el.insertAdjacentHTML('afterbegin', html);
    (el as HTMLElement & { _h?: string })._h = html;
  };
  /** A point on the right page (in its 300×400 units), in the scene's own pixels. */
  const onPage = (x: number, y: number): [number, number] => {
    const m = R.querySelector<SVGCircleElement>('[data-tip]');
    if (!m) return [x, y];
    m.setAttribute('cx', `${x}`);
    m.setAttribute('cy', `${y}`);
    const r = m.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return [(r.left + r.width / 2 - s.left) / scale, (r.top + r.height / 2 - s.top) / scale];
  };

  /* ---------- the stamp: counts down, then turns green ---------- */
  const stampFor = (page: number, p: number): { label: string; good: boolean } => {
    if (page === 0) {
      const n = 3 - CODE_SOLVED.filter((v) => p >= v).length;
      return n ? { label: `${n} PROBLEM${n === 1 ? '' : 'S'}`, good: false } : { label: '0 PROBLEMS ✓', good: true };
    }
    if (page === 1) return p >= 0.96 ? { label: 'ON TRACK ✓', good: true } : { label: 'OVERDUE', good: false };
    return p >= 0.95 ? { label: 'BALANCED ✓', good: true } : { label: 'UNBALANCED', good: false };
  };
  const CHANGE_AT = [[...CODE_SOLVED], [0.96], [0.95]];

  /* ---------- one frame ---------- */
  let quillWas: [number, number] | null = null;
  const frame = (now: number): void => {
    // the page turn
    if (turn) {
      const p = clamp((now - turn.t0) / TURN_MS);
      const e = ease(p);
      const was = fixP(now);
      put(L, left(turn.from, was));
      put(front, right(turn.from, was).html);
      put(backFace, left(turn.to, 0));
      put(R, right(turn.to, 0).html);
      leaf.classList.add('is-turning');
      leaf.style.transform = `rotateY(${-180 * e}deg) translateZ(${(Math.sin(e * Math.PI) * 14).toFixed(1)}px)`;
      shade.style.opacity = (Math.sin(e * Math.PI) * 0.28).toFixed(3);
      FLYERS.flat().forEach((f) => { f.el.style.opacity = '0'; });
      if (p >= 1) {
        leaf.classList.remove('is-turning');
        k = turn.to;
        turn = null;
        burst(now);
      } else return;
    }
    const p = fixP(now);
    put(L, left(k, p));
    const page = right(k, p);
    put(R, page.html);
    quill.classList.toggle('is-ready', p < 1 && burstT0 !== null);

    // the things that burst out of the page
    const bt = burstT0 === null ? -1 : clamp((now - burstT0) / BURST_MS);
    FLYERS.forEach((set, page2) => set.forEach((f, i) => {
      if (page2 !== k || bt < 0) { f.el.style.opacity = '0'; return; }
      const u = reduce.matches ? 1 : back(clamp((bt - i * 0.08) / 0.55));
      let x = lerp(ORIGIN[0], f.to[0], u) + (reduce.matches ? 0 : Math.sin(now * 0.022 + i * 2) * 1.6);
      let y = lerp(ORIGIN[1], f.to[1], u);
      let sc = lerp(0.3, 1, clamp(u));
      let o = reduce.matches ? 1 : clamp((bt - i * 0.08) / 0.15);
      const rot = (i % 2 ? -1 : 1) * (4 + i * 2);
      if (k === 1 && !f.stamp && p > 0) {
        // a to-do flies home into its row as the quill writes it
        const a = (i / 4) * 0.7, b = ((i + 1) / 4) * 0.7;
        const v = ease(clamp((p - a) / (b - a)));
        if (v > 0) { const [sx, sy] = onPage(...ROW(i)); x = lerp(x, sx, v); y = lerp(y, sy, v); sc = lerp(1, 0.6, v); o = 1 - clamp((v - 0.7) / 0.3); }
      } else if (f.stamp) {
        const { label, good } = stampFor(k, p);
        if (f.el.textContent !== label) f.el.textContent = label;
        f.el.classList.toggle('is-good', good);
        const bump = Math.max(0, ...CHANGE_AT[k].map((v) => (p >= v && p - v < 0.06 ? 1 - (p - v) / 0.06 : 0)));
        sc *= 1 + bump * 0.3;
        if (lastLabel[k] && lastLabel[k] !== label && fixT0 !== null) (good ? chime : stamp)();
        lastLabel[k] = label;
      } else if (p >= f.gone) {
        const v = clamp((p - f.gone) / 0.08);
        sc *= 1 + v * 0.4;
        o *= 1 - v;
      }
      f.el.style.opacity = o.toFixed(2);
      f.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) rotate(${rot}deg) scale(${sc.toFixed(3)})`;
    }));

    // the quill: lifts, follows the line it's writing, lays back down
    if (fixing(now) && !reduce.matches) {
      let tip = quillWas;
      if (page.tip) {
        let x = page.tip.x;
        if (page.tip.measure) {
          const t = R.querySelector<SVGTextContentElement>('[data-writing]');
          if (t) x += t.getComputedTextLength();
        }
        tip = onPage(x, page.tip.y);
      }
      if (tip) quillWas = tip;
      const rest: [number, number] = [442, 498]; // the nib, at rest
      const [tx, ty] = tip ?? rest;
      const target = { x: tx - rest[0], y: ty - rest[1] + Math.sin(now * 0.04) * 1.2, r: -38 + Math.sin(now * 0.03) * 2 };
      const lift = ease(clamp(p / 0.08)), down = ease(clamp((p - 0.93) / 0.07));
      const m = p < 0.08 ? lift : p > 0.93 ? 1 - down : 1;
      quill.classList.add('is-writing');
      quill.style.transform = `translate(${(target.x * m).toFixed(1)}px, ${(target.y * m).toFixed(1)}px) rotate(${lerp(-18, target.r, m).toFixed(2)}deg)`;
    } else if (quill.classList.contains('is-writing')) {
      quill.classList.remove('is-writing');
      quill.style.transform = '';
      quillWas = null;
    }

    // the spill
    if (spillT0 !== null) {
      const t = now - spillT0;
      if (t >= SPILL_MS || (reduce.matches && t >= 1800)) {
        spillT0 = null;
        mug.classList.remove('is-spilling');
        if (mugSvg) mugSvg.style.transform = '';
        coffee.forEach((c) => { c.style.fill = ''; });
        puddle.style.opacity = '0';
        mug.setAttribute('aria-label', 'Knock the coffee over');
      } else if (reduce.matches) {
        coffee.forEach((c) => { c.style.fill = '#2A1D14'; });
        puddle.style.opacity = '0.88';
        puddle.style.transform = 'none';
      } else {
        // the original tip: rocks back, swings over past it, settles; later it stands back up with a wobble
        let r = 0;
        if (t < 560) { const a = t / 560; r = a < 0.28 ? lerp(0, 9, out(a / 0.28)) : a < 0.72 ? lerp(9, -92, out((a - 0.28) / 0.44)) : lerp(-92, -84, out((a - 0.72) / 0.28)); }
        else if (t < 2500) r = -84;
        else if (t < 2900) r = lerp(-84, 0, ease((t - 2500) / 400));
        else r = Math.sin((t - 2900) * 0.05) * 3 * (1 - (t - 2900) / 300);
        if (mugSvg) mugSvg.style.transform = `rotate(${r.toFixed(2)}deg)`;
        const tipped = t > 150 && t < 2900;
        coffee.forEach((c) => { c.style.fill = tipped ? '#2A1D14' : ''; });
        // the original puddle: in over 680ms once the mug is over, out over 560ms as it rights itself
        const pin = clamp((t - 400) / 680), pout = clamp((t - 2500) / 560);
        if (pin <= 0) puddle.style.opacity = '0';
        else if (pout <= 0) { const e = out(pin); puddle.style.opacity = lerp(0.95, 0.88, e).toFixed(2); puddle.style.transform = `scale(${lerp(0.04, 1, e).toFixed(3)}, ${lerp(0.2, 1, e).toFixed(3)})`; }
        else { puddle.style.opacity = (0.88 * (1 - pout)).toFixed(2); puddle.style.transform = `scale(${lerp(1, 0.97, pout).toFixed(3)})`; }
      }
    }
  };

  /* ---------- what starts things ---------- */
  const SAY = ['summon.ts: 3 problems', 'Today’s to-dos flew off the page: overdue', 'The power system is unbalanced'];
  const FIXED = ['Fixed: 0 problems', 'Back in order: on track', 'Balanced: every tier costs a memory'];
  const burst = (now: number): void => {
    burstT0 = reduce.matches ? now - BURST_MS : now;
    fixT0 = null;
    lastLabel[k] = '';
    say(SAY[k]);
    if (k === 0) { zzt(); window.setTimeout(zzt, 180); window.setTimeout(zzt, 340); }
    else if (k === 1) whoosh();
    else { zzt(); window.setTimeout(zzt, 220); }
    window.setTimeout(stamp, reduce.matches ? 0 : 520);
    kick();
  };

  book.addEventListener('click', () => {
    const now = performance.now();
    if (busy(now)) return;
    const to = (k + 1) % 3;
    flipSound();
    earn('book');
    if (reduce.matches) { k = to; burst(now); return; }
    turn = { from: k, to, t0: now };
    kick();
  });

  quill.addEventListener('click', () => {
    const now = performance.now();
    if (busy(now) || fixP(now) >= 1) return;
    if (burstT0 === null) burstT0 = now - BURST_MS; // clicked before the problem burst: show it at once
    earn('quill');
    fixT0 = reduce.matches ? now - FIX_MS : now;
    if (!reduce.matches) scribble(FIX_MS * 0.85);
    window.setTimeout(() => say(FIXED[k]), reduce.matches ? 0 : FIX_MS);
    kick();
  });

  mug.addEventListener('click', () => {
    const now = performance.now();
    if (busy(now)) return;
    earn('coffee');
    spillT0 = now;
    mug.classList.add('is-spilling');
    mug.setAttribute('aria-label', 'Coffee spilled. It refills in a moment');
    window.setTimeout(splash, reduce.matches ? 0 : 300);
    kick();
  });

  /* ---------- the loop: only while the desk is on screen ---------- */
  let onScreen = false;
  let raf = 0;
  const loop = (now: number): void => {
    frame(now);
    raf = onScreen ? requestAnimationFrame(loop) : 0;
  };
  function kick(): void { if (!raf) raf = requestAnimationFrame(loop); }

  // the first page shows its bugs right away; the errors burst out once you can see the desk
  frame(performance.now());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && burstT0 === null && e.intersectionRatio >= 0.4) burst(performance.now());
      if (onScreen) kick();
    }, { threshold: [0, 0.4] }).observe(root);
  } else {
    onScreen = true;
    burst(performance.now());
  }
}
