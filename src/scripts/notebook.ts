/**
 * The About me desk: three things to click.
 * - Notebook: the right page turns over the spine in 3D (a "leaf" with a front and
 *   back face), a paper sound plays, and a little symbol pops out.
 * - Mug: it tips over, coffee spills across the desk and stains the open page,
 *   then it refills itself.
 * - Pencil: it doodles hello, a heart or a star (its tip follows the line), then
 *   the doodle is erased.
 * Sounds follow the nav's sound button (sfx.ts). Reduced motion: things change
 * instantly or just fade.
 */
import { flip as flipSound, splash, scribble } from './sfx';

const SYMBOLS: { name: string; svg: string }[] = [
  { name: 'heart', svg: '<path d="M20 34 C8 25 3 18 3 12 A8 8 0 0 1 20 8 A8 8 0 0 1 37 12 C37 18 32 25 20 34 Z"/>' },
  { name: 'code', svg: '<path d="M13 11 L4 20 L13 29"/><path d="M27 11 L36 20 L27 29"/><path d="M23 7 L17 33"/>' },
  { name: 'pen', svg: '<path d="M8 32 L11 22 L27 6 L34 13 L18 29 Z"/><path d="M23 10 L30 17"/><path d="M8 32 L14 30"/>' },
  { name: 'star', svg: '<path d="M20 4 L24.7 14.5 L36 15.6 L27.4 23.1 L30 34.2 L20 28.4 L10 34.2 L12.6 23.1 L4 15.6 L15.3 14.5 Z"/>' },
  { name: 'bolt', svg: '<path d="M23 3 L8 22 L18 22 L16 37 L32 16 L22 16 Z"/>' },
  { name: 'braces', svg: '<path d="M14 6 Q8 6 8 12 L8 16 Q8 20 4 20 Q8 20 8 24 L8 28 Q8 34 14 34"/><path d="M26 6 Q32 6 32 12 L32 16 Q32 20 36 20 Q32 20 32 24 L32 28 Q32 34 26 34"/>' },
  { name: 'bulb', svg: '<path d="M14 27 Q14 22 10 18 A11 11 0 1 1 30 18 Q26 22 26 27 Z"/><path d="M15 31 L25 31"/><path d="M17 35 L23 35"/>' },
  { name: 'spark', svg: '<path d="M20 4 Q22 18 36 20 Q22 22 20 36 Q18 22 4 20 Q18 18 20 4 Z"/>' },
];

const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const earn = (key: string): void => { document.dispatchEvent(new CustomEvent('trust:earn', { detail: key })); };

/** A symbol floats up from (x%, y%) of the desk and fades. */
function popAt(layer: HTMLElement, x: number, y: number, svg: string, name: string): void {
  const el = document.createElement('span');
  el.className = `book-pop book-pop--${name}`;
  el.innerHTML = `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
  el.style.left = `calc(${x}% + ${Math.round((Math.random() - 0.5) * 50)}px)`;
  el.style.top = `${y}%`;
  layer.appendChild(el);
  const dx = Math.round((Math.random() - 0.5) * 110);
  const tilt = Math.round((Math.random() - 0.5) * 40);
  const frames: Keyframe[] = reduceMotion()
    ? [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }]
    : [
        { opacity: 0, transform: 'translate(-50%, 10px) scale(0.3) rotate(0deg)' },
        { opacity: 1, transform: `translate(calc(-50% + ${dx * 0.5}px), -70px) scale(1.15) rotate(${tilt}deg)`, offset: 0.35 },
        { opacity: 1, transform: `translate(calc(-50% + ${dx * 0.8}px), -110px) scale(1) rotate(${tilt * 1.4}deg)`, offset: 0.7 },
        { opacity: 0, transform: `translate(calc(-50% + ${dx}px), -150px) scale(0.9) rotate(${tilt * 1.8}deg)` },
      ];
  el.animate(frames, { duration: reduceMotion() ? 900 : 1150, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
    .addEventListener('finish', () => el.remove());
}

const DROP = '<path d="M20 5 Q9 20 9 26 A11 11 0 0 0 31 26 Q31 20 20 5 Z"/>';
const STAIN = '<svg class="page-stain" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="5" opacity="0.5"/><circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" stroke-width="2" opacity="0.35"/><path d="M84 30 Q92 22 96 30" fill="none" stroke="currentColor" stroke-width="4" opacity="0.45"/></svg>';

export function initNotebook(): void {
  const root = document.querySelector<HTMLElement>('[data-notebook]');
  const book = root?.querySelector<HTMLButtonElement>('[data-book]');
  const left = root?.querySelector<HTMLElement>('[data-book-left]');
  const right = root?.querySelector<HTMLElement>('[data-book-right]');
  const leaf = root?.querySelector<HTMLElement>('[data-book-leaf]');
  const front = root?.querySelector<HTMLElement>('[data-book-front]');
  const back = root?.querySelector<HTMLElement>('[data-book-back]');
  const pops = root?.querySelector<HTMLElement>('[data-desk-pops]');
  if (!root || !book || !left || !right || !leaf || !front || !back || !pops) return;

  const page = (i: number, side: 'l' | 'r'): string =>
    root.querySelector<HTMLTemplateElement>(`template[data-page="${i}-${side}"]`)?.innerHTML ?? '';
  const count = root.querySelectorAll('template[data-page$="-l"]').length;
  if (count < 2) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let spread = 0;
  let symbol = 0;
  let turning: Animation | null = null;

  const pop = (): void => {
    const sym = SYMBOLS[symbol % SYMBOLS.length];
    symbol += 1;
    popAt(pops, 39, 34, sym.svg, sym.name);
  };

  const turn = (): void => {
    const next = (spread + 1) % count;
    flipSound();
    pop();
    earn('book');

    if (reduce.matches || !('animate' in HTMLElement.prototype)) {
      left.innerHTML = page(next, 'l');
      right.innerHTML = page(next, 'r');
      spread = next;
      return;
    }
    // The leaf starts as the current right page; its back is the next left page.
    front.innerHTML = page(spread, 'r');
    back.innerHTML = page(next, 'l');
    right.innerHTML = page(next, 'r'); // revealed underneath as the leaf lifts
    leaf.classList.add('is-turning');
    turning = leaf.animate(
      [
        { transform: 'rotateY(0deg)' },
        { transform: 'rotateY(-95deg) translateZ(14px)', offset: 0.5 },
        { transform: 'rotateY(-180deg)' },
      ],
      { duration: 720, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' },
    );
    const settle = (): void => {
      left.innerHTML = page(next, 'l');
      leaf.classList.remove('is-turning');
      turning = null;
      spread = next;
    };
    turning.addEventListener('finish', settle);
  };

  book.addEventListener('click', () => {
    if (turning) {
      turning.finish(); // a quick double click finishes the current flip, then turns again
    }
    turn();
  });
}

/* ---------- the mug: spill, stain, refill ---------- */
export function initCoffee(): void {
  const root = document.querySelector<HTMLElement>('[data-notebook]');
  const mug = root?.querySelector<HTMLButtonElement>('[data-mug]');
  const puddle = root?.querySelector<SVGElement>('[data-puddle]');
  const right = root?.querySelector<HTMLElement>('[data-book-right]');
  const pops = root?.querySelector<HTMLElement>('[data-desk-pops]');
  if (!root || !mug || !puddle || !right || !pops) return;
  let busy = false;

  mug.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    earn('coffee');
    splash();
    root.classList.add('is-spilled');
    mug.setAttribute('aria-label', 'Coffee spilled. It refills in a moment');
    popAt(pops, 82, 20, DROP, 'drop');

    // the spill reaches the open page and leaves a ring (it stays until the page turns)
    window.setTimeout(() => {
      right.querySelector('.page-stain')?.remove();
      right.insertAdjacentHTML('beforeend', STAIN);
    }, reduceMotion() ? 0 : 520);

    // then it all cleans up and the mug stands back up, full
    window.setTimeout(() => {
      root.classList.add('is-refilling');
      root.classList.remove('is-spilled');
      window.setTimeout(() => {
        root.classList.remove('is-refilling');
        mug.setAttribute('aria-label', 'Knock the coffee over');
        busy = false;
      }, reduceMotion() ? 0 : 700);
    }, 3200);
  });
}

/* ---------- the pencil: doodle, then erase ---------- */
export function initPencil(): void {
  const root = document.querySelector<HTMLElement>('[data-notebook]');
  const btn = root?.querySelector<HTMLButtonElement>('[data-pencil]');
  const pencil = btn?.querySelector<SVGSVGElement>('.pencil');
  const board = root?.querySelector<SVGSVGElement>('[data-scribble]');
  if (!root || !btn || !pencil || !board) return;
  const doodles = Array.from(board.querySelectorAll<SVGPathElement>('[data-doodle]'));
  if (!doodles.length) return;
  let busy = false;
  let last = -1;

  // where the pencil's tip sits on screen at rest. The button rotates around the tip
  // (transform-origin 4.5% calc(65% - 4.2px): the tip is 65% down the drawing, which
  // has 14px of padding above and below), so the untransformed layout box gives it.
  const restTip = (): { x: number; y: number } => {
    const desk = root.getBoundingClientRect();
    return {
      x: desk.left + btn.offsetLeft + btn.offsetWidth * 0.045,
      y: desk.top + btn.offsetTop + btn.offsetHeight * 0.65 - 4.2,
    };
  };
  const screenPoint = (path: SVGPathElement, len: number): { x: number; y: number } => {
    const p = path.getPointAtLength(len);
    const m = path.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    return { x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f };
  };

  btn.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    earn('pencil');
    let pick = Math.floor(Math.random() * doodles.length);
    if (pick === last) pick = (pick + 1) % doodles.length;
    last = pick;
    const path = doodles[pick];
    const len = path.getTotalLength();
    const draw = path.dataset.doodle === 'hello' ? 1500 : 1100;
    path.style.strokeDasharray = `${len}`;
    path.style.opacity = '1';

    const erase = (): void => {
      const a = path.animate(
        reduceMotion()
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [{ opacity: 1, strokeDashoffset: '0' }, { opacity: 0, strokeDashoffset: `${-len}` }],
        { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
      );
      a.addEventListener('finish', () => {
        a.cancel();
        path.style.opacity = '0';
        path.style.strokeDashoffset = `${len}`;
        busy = false;
      });
    };

    if (reduceMotion()) {
      path.style.strokeDashoffset = '0';
      window.setTimeout(erase, 2500);
      return;
    }

    const rest = restTip();
    path.style.strokeDashoffset = `${len}`;
    const start = performance.now() + 280; // the pencil glides to the start first (CSS transition)
    scribble(draw);
    const move = (now: number): void => {
      if (now >= start) btn.classList.add('is-writing'); // from here it follows the line exactly
      const t = Math.min(1, Math.max(0, (now - start) / draw));
      const at = screenPoint(path, len * t);
      btn.style.transform = `translate(${at.x - rest.x}px, ${at.y - rest.y}px) rotate(-38deg)`;
      path.style.strokeDashoffset = `${len * (1 - t)}`;
      if (t < 1) {
        requestAnimationFrame(move);
      } else {
        btn.classList.remove('is-writing');
        btn.style.transform = ''; // glides home (CSS transition)
        window.setTimeout(erase, 2300);
      }
    };
    requestAnimationFrame(move);
  });
}
