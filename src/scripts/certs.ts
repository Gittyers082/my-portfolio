/**
 * The trophy wall (CertWall.astro):
 *  - clicking a frame takes the certificate off the wall: it flies to the middle folded in half
 *    (plain paper back showing), opens flat, and shows a small caption with a link to it.
 *    Clicking anywhere outside, or Esc, puts it back. A page-flip sound plays (sfx.ts).
 *  - a label's long name or line glides sideways on hover so it can be read whole.
 *  - on phones the wall is a row you swipe; the arrows and counter follow it, and the certificate
 *    in view glides its own long label (there's no hover on a phone).
 *  - /#cert-<slug> opens the Certifications chapter with that certificate unfolded.
 */
import { flip as flipSound } from './sfx';

const R = 792 / 612; // a certificate's shape (US letter, landscape)
const reduce = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

type Open = { btn: HTMLElement; dim: HTMLElement; fly: HTMLElement; bar: HTMLElement; flap: HTMLElement; start: string; closing?: boolean };
let open: Open | null = null;

/** Where the open certificate sits: centred, as big as the window allows, room below for the caption. */
function target(): { left: number; top: number; width: number; height: number } {
  const width = Math.min(860, innerWidth * 0.86, (innerHeight - 150) * R);
  const height = width / R;
  return { left: (innerWidth - width) / 2, top: Math.max(16, (innerHeight - height - 80) / 2), width, height };
}
function place(el: HTMLElement, r: { left: number; top: number; width: number; height: number }): void {
  Object.assign(el.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
}
function placeBar(bar: HTMLElement, r: { left: number; top: number; width: number; height: number }): void {
  Object.assign(bar.style, { left: `${r.left}px`, width: `${r.width}px`, top: `${r.top + r.height + 18}px` });
}
/** Builds an element and fills in its text safely (no markup from data). */
function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
}
function picture(src: string): HTMLElement {
  const inner = el('div', 'cw-fly__inner');
  const img = el('img');
  img.src = src;
  img.alt = '';
  inner.append(img);
  return inner;
}

function openCert(btn: HTMLElement): void {
  if (open) return;
  const { full = '', title = '', meta = '', link = '#', slug = '' } = btn.dataset;
  const mat = btn.querySelector<HTMLElement>('.cw__mat');
  if (!mat) return;
  const from = mat.getBoundingClientRect();
  const to = target();
  const still = reduce();

  const dim = el('div', 'cw-dim');
  const fly = el('div', 'cw-fly');
  const bot = el('div', 'cw-fly__half cw-fly__half--bot');
  bot.append(picture(full));
  const flap = el('div', 'cw-fly__flap');
  const front = el('div', 'cw-fly__half');
  front.append(picture(full));
  flap.append(front, el('div', 'cw-fly__back'));
  const shadow = el('div', 'cw-fly__shadow');
  const crease = el('div', 'cw-fly__crease');
  fly.append(shadow, bot, crease, flap);

  const bar = el('div', 'cw-bar');
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-modal', 'true');
  bar.setAttribute('aria-label', `${title} certificate`);
  const caption = el('div');
  caption.append(el('h2', undefined, title), el('p', undefined, meta));
  const a = el('a', undefined, 'View certificate ↗');
  a.href = link;
  a.target = '_blank';
  a.rel = 'noopener';
  bar.append(caption, a);

  place(fly, to);
  placeBar(bar, to);
  document.body.append(dim, fly, bar);

  // fly from the frame: start at the frame's place and size, tilted like the frame
  const sx = from.width / to.width;
  const sy = from.height / to.height;
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const start = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(${btn.style.getPropertyValue('--tilt') || '0deg'})`;
  btn.classList.add('is-empty');
  const T = still ? 150 : 780;
  dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: still ? 150 : 420, fill: 'forwards' });
  if (still) {
    fly.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T, fill: 'forwards' });
  } else {
    fly.animate([
      { transform: start, transformOrigin: '0 0' },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 40}px) scale(${0.55 + sx * 0.3}) rotate(-4deg)`, transformOrigin: '0 0', offset: 0.45 },
      { transform: 'none', transformOrigin: '0 0' },
    ], { duration: T, easing: 'cubic-bezier(.3,.1,.2,1)', fill: 'forwards' });
    // folded in half while it travels, then it opens flat
    flap.animate([
      { transform: 'rotateX(0deg)' }, { transform: 'rotateX(-165deg)', offset: 0.18 },
      { transform: 'rotateX(-165deg)', offset: 0.5 }, { transform: 'rotateX(-20deg)', offset: 0.86 }, { transform: 'rotateX(0deg)' },
    ], { duration: T, easing: 'ease-in-out', fill: 'forwards' });
    window.setTimeout(flipSound, T * 0.5);
  }
  flipSound();
  shadow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: still ? 0 : T - 120, fill: 'forwards' });
  crease.animate([{ opacity: 1 }, { opacity: 0.15 }], { duration: 400, delay: T, fill: 'forwards' });
  bar.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: still ? 0 : T - 60, fill: 'forwards' });

  open = { btn, dim, fly, bar, flap, start };
  dim.addEventListener('click', closeCert);
  if (slug) history.replaceState(null, '', `#cert-${slug}`);
  window.setTimeout(() => a.focus({ preventScroll: true }), T);
}

function closeCert(): void {
  if (!open || open.closing) return;
  const o = open;
  o.closing = true;
  const still = reduce();
  const T = still ? 150 : 560;
  flipSound();
  o.bar.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' });
  o.fly.querySelector('.cw-fly__shadow')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
  const back = still
    ? o.fly.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T, fill: 'forwards' })
    : o.fly.animate([{ transform: 'none', transformOrigin: '0 0' }, { transform: o.start, transformOrigin: '0 0' }], { duration: T, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
  if (!still) o.flap.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-150deg)', offset: 0.45 }, { transform: 'rotateX(0deg)' }], { duration: T, fill: 'forwards' });
  o.dim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T, fill: 'forwards' });
  if (location.hash.startsWith('#cert-')) history.replaceState(null, '', location.pathname + location.search);
  back.finished.then(() => {
    o.btn.classList.remove('is-empty');
    o.dim.remove();
    o.fly.remove();
    o.bar.remove();
    o.btn.focus({ preventScroll: true });
    open = null;
  });
}

/** Slides a label line to `to` at an easy reading pace. */
function glide(line: HTMLElement & { _glide?: number }, to: number): void {
  if (line._glide) cancelAnimationFrame(line._glide);
  const from = line.scrollLeft;
  const dist = to - from;
  if (!dist) return;
  const dur = Math.min(2600, Math.max(500, Math.abs(dist) * 14));
  const t0 = performance.now();
  const step = (t: number): void => {
    const k = Math.min(1, (t - t0) / dur);
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    line.scrollLeft = from + dist * e;
    if (k < 1) line._glide = requestAnimationFrame(step);
  };
  line._glide = requestAnimationFrame(step);
}

export function initCerts(): void {
  const root = document.querySelector<HTMLElement>('[data-certs]');
  if (!root) return;
  const wall = root.querySelector<HTMLElement>('[data-cw-wall]');
  if (!wall) return;

  wall.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-cw-frame]');
    if (btn) openCert(btn);
  });
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') closeCert();
    if (e.key === 'Tab') {
      e.preventDefault();
      open.bar.querySelector('a')?.focus();
    }
  });
  addEventListener('resize', () => {
    if (open && !open.closing) {
      const t = target();
      place(open.fly, t);
      placeBar(open.bar, t);
    }
  });

  // long label text: fade the edge that hides text, and glide it into view on hover
  for (const line of root.querySelectorAll<HTMLElement>('[data-cw-glide]')) {
    const plate = line.closest<HTMLElement>('.cw__plate');
    if (!plate) continue;
    const edges = (): void => {
      const max = line.scrollWidth - line.clientWidth;
      line.classList.toggle('more-l', line.scrollLeft > 1);
      line.classList.toggle('more-r', line.scrollLeft < max - 1);
    };
    line.addEventListener('scroll', edges, { passive: true });
    addEventListener('resize', edges);
    edges();
    const go = (): void => {
      if (reduce() || line.scrollWidth <= line.clientWidth) return;
      window.setTimeout(() => plate.matches(':hover, :focus-within') && glide(line, line.scrollWidth - line.clientWidth), 250);
    };
    const back = (): void => { if (!reduce()) glide(line, 0); };
    plate.addEventListener('mouseenter', go);
    plate.addEventListener('mouseleave', back);
    plate.addEventListener('focusin', go);
    plate.addEventListener('focusout', back);
  }

  // phones: swipe along the wall, or use the arrows
  const items = Array.from(wall.querySelectorAll<HTMLElement>('.cw__item'));
  const count = wall.querySelectorAll('[data-cw-frame]').length;
  const prev = root.querySelector<HTMLButtonElement>('[data-cw-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-cw-next]');
  const pos = root.querySelector<HTMLElement>('[data-cw-pos]');
  if (items.length && prev && next && pos) {
    const step = (): number => items[0].offsetWidth + (parseFloat(getComputedStyle(wall).columnGap) || 0);
    const current = (): number => Math.round(wall.scrollLeft / step());
    const show = (): void => {
      pos.textContent = `${Math.min(current() + 1, count)} of ${count}`;
      prev.disabled = wall.scrollLeft < 4;
      next.disabled = wall.scrollLeft > wall.scrollWidth - wall.clientWidth - 4;
    };
    const move = (d: number): void => {
      items[Math.max(0, Math.min(items.length - 1, current() + d))].scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    };
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    wall.addEventListener('scroll', show, { passive: true });
    addEventListener('resize', show);
    show();

    // no hover on a phone: the certificate in view glides its long label by itself,
    // out to the end, a pause, back, and again while it stays in view
    const long = (item: HTMLElement): HTMLElement[] =>
      Array.from(item.querySelectorAll<HTMLElement>('[data-cw-glide]')).filter((l) => l.scrollWidth > l.clientWidth);
    const swiping = (): boolean => wall.scrollWidth > wall.clientWidth + 4;
    let active = -1;
    let loop = 0;
    const stop = (): void => {
      window.clearTimeout(loop);
      if (active >= 0) long(items[active]).forEach((l) => glide(l, 0));
      active = -1;
    };
    const play = (i: number): void => {
      if (i === active || reduce() || !swiping()) return;
      stop();
      active = i;
      const lines = long(items[i] ?? items[0]);
      if (!lines.length) return;
      const out = (): void => {
        lines.forEach((l) => glide(l, l.scrollWidth - l.clientWidth));
        loop = window.setTimeout(home, 3600);
      };
      const home = (): void => {
        lines.forEach((l) => glide(l, 0));
        loop = window.setTimeout(out, 3600);
      };
      loop = window.setTimeout(out, 600);
    };
    let settle = 0;
    let inView = false;
    wall.addEventListener('scroll', () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => inView && play(current()), 160);
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView) play(current());
        else stop();
      }, { threshold: 0.5 }).observe(wall);
    }
  }

  // /#cert-<slug>: open the chapter, bring the certificate into view, unfold it
  const fromHash = (): void => {
    const slug = location.hash.startsWith('#cert-') ? location.hash.slice(6) : '';
    const btn = slug ? root.querySelector<HTMLElement>(`[data-cw-frame][data-slug="${CSS.escape(slug)}"]`) : null;
    if (!btn || open) return;
    const chapter = root.closest('details');
    if (chapter && !chapter.open) chapter.open = true;
    btn.scrollIntoView({ block: 'center', behavior: 'auto' });
    window.setTimeout(() => openCert(btn), 400);
  };
  fromHash();
  addEventListener('hashchange', fromHash);
}
