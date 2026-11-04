/**
 * Site behaviour. Everything here is progressive: the page reads fine without it.
 * - reveals: sections' parts rise in once as they enter
 * - tagline: words light up one at a time as they cross a trigger line
 * - card drift: the hero's breakout card drifts with the scroll
 * - hero background: faint cyan halftone drift, paused offscreen
 * - heading glitch + electric arcs (hover, scroll-in, tap) + a quiet zzt (sfx.ts)
 * - portrait reveal: see portrait-reveal.ts
 * - trust meter, demo loop, episodes, copy email: see features.ts
 * - menu: full-height mobile menu
 * - character file: only one chapter open at a time (native <details name> does
 *   this in modern browsers; this covers the rest)
 */

import { initPortraitReveal } from './portrait-reveal';
import { initFeatures } from './features';
import { initSound, zzt } from './sfx';
import { initNotebook, initCoffee, initPencil } from './notebook';
import { initContact } from './contact';
import { initFooter } from './footer';
import { initCard } from './card';
import { initStars } from './stars';

const reduceMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initReveals(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );
  items.forEach((el) => io.observe(el));
}

function initTagline(): void {
  // the breeze only blows while the section is on screen
  const wind = document.querySelector<HTMLElement>('[data-wind]');
  if (wind && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { wind.classList.toggle('is-windy', e.isIntersecting); }).observe(wind);
  } else {
    wind?.classList.add('is-windy');
  }
  const words = document.querySelectorAll<HTMLElement>('.tagline__w');
  if (!words.length) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    words.forEach((w) => w.classList.add('is-lit'));
    return;
  }
  // A thin trigger line 40% up from the bottom of the viewport.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-lit', entry.isIntersecting || entry.boundingClientRect.top < 0);
      }
    },
    { rootMargin: '0px 0px -40% 0px', threshold: 1 },
  );
  words.forEach((w) => io.observe(w));
}

function initCardDrift(): void {
  const card = document.querySelector<HTMLElement>('.hero__card');
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!card || !hero || reduceMotion()) return;
  let ticking = false;
  const update = (): void => {
    const y = Math.min(window.scrollY, hero.offsetHeight);
    card.style.setProperty('--drift', `${(-y * 0.12).toFixed(1)}px`);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
}

function initMenu(): void {
  const btn = document.querySelector<HTMLButtonElement>('.menu-btn');
  const panel = document.getElementById('menu-panel');
  if (!btn || !panel) return;
  const setOpen = (open: boolean): void => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) panel.querySelector<HTMLElement>('a')?.focus();
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      btn.focus();
    }
  });
}

/* ---------- glide: animate a <details> open/closed instead of snapping ---------- */
const GLIDE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const glideRuns = new WeakMap<HTMLDetailsElement, Animation>();

function closedHeight(item: HTMLDetailsElement): number {
  const summary = item.querySelector(':scope > summary') as HTMLElement | null;
  return (summary ? summary.offsetHeight : 0) + (item.offsetHeight - item.clientHeight);
}

/** Opens or closes a <details> with a height glide. Returns the duration in ms. */
/** closeDelay lets the content sink away before the panel starts folding. */
function glide(item: HTMLDetailsElement, open: boolean, openMs = 620, closeMs = 420, closeDelay = 0): number {
  glideRuns.get(item)?.cancel();
  const from = item.offsetHeight;
  let to: number;
  if (open) {
    item.classList.remove('is-closing');
    item.open = true;
    to = item.offsetHeight;
  } else {
    to = closedHeight(item);
    item.classList.add('is-closing');
  }
  const duration = open ? openMs : closeMs;
  const delay = open ? 0 : closeDelay;
  item.style.overflow = 'hidden';
  const anim = item.animate({ height: [`${from}px`, `${to}px`] }, { duration, delay, easing: GLIDE_EASE, fill: 'backwards' });
  glideRuns.set(item, anim);
  const done = (): void => {
    if (glideRuns.get(item) !== anim) return;
    glideRuns.delete(item);
    item.style.overflow = '';
    if (!open) {
      item.open = false;
      item.classList.remove('is-closing');
    }
  };
  anim.addEventListener('finish', done);
  anim.addEventListener('cancel', done);
  return duration + delay;
}

/** Any other <details data-glide> (like the course quest board) glides too. */
function initGlideDetails(): void {
  if (!('animate' in HTMLElement.prototype)) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll<HTMLDetailsElement>('details[data-glide]').forEach((item) => {
    const summary = item.querySelector(':scope > summary');
    summary?.addEventListener('click', (e) => {
      if (reduce.matches) return;
      e.preventDefault();
      glide(item, !item.open || item.classList.contains('is-closing'), 560, 380, 80);
    });
  });
}

function initCharacterFile(): void {
  const items = Array.from(document.querySelectorAll<HTMLDetailsElement>('.cf__item'));
  // Fallback for browsers without <details name>: one chapter open at a time.
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item && other.open && !other.classList.contains('is-closing')) other.open = false;
      });
    });
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('animate' in HTMLElement.prototype)) return;

  // From here JS runs the accordion, so the panel height can glide instead of snap.
  // (Native `name` would close the old chapter instantly, so it steps aside.)
  items.forEach((item) => item.removeAttribute('name'));
  // Keep the chapter you clicked still on screen while the others fold away.
  const holdStill = (el: HTMLElement, ms: number): void => {
    const top = el.getBoundingClientRect().top;
    const end = performance.now() + ms + 60;
    const step = (now: number): void => {
      const drift = el.getBoundingClientRect().top - top;
      // 'instant': the page uses smooth scrolling, which would make this lag and swing
      if (Math.abs(drift) > 0.5) window.scrollBy({ top: drift, behavior: 'instant' });
      if (now < end) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  items.forEach((item) => {
    const summary = item.querySelector<HTMLElement>(':scope > summary');
    if (!summary) return;
    summary.addEventListener('click', (e) => {
      if (reduce.matches) {
        // No glide: behave like the native accordion.
        if (!item.open) items.forEach((o) => { if (o !== item) o.open = false; });
        return;
      }
      e.preventDefault();
      const opening = !item.open || item.classList.contains('is-closing');
      let longest = 0;
      if (opening) {
        items.forEach((o) => { if (o !== item && o.open) longest = Math.max(longest, glide(o, false, 620, 480, 110)); });
      }
      longest = Math.max(longest, glide(item, opening, 620, 480, 110));
      holdStill(summary, longest);
    });
  });
}

function initThemeToggle(): void {
  // Placeholder until dark mode ships: say so instead of doing nothing silently.
  const btn = document.querySelector<HTMLButtonElement>('.theme-toggle:not(.sound-toggle)');
  const note = document.getElementById('theme-note');
  if (!btn || !note) return;
  btn.addEventListener('click', () => {
    note.textContent = 'Dark mode is coming soon.';
    window.setTimeout(() => (note.textContent = ''), 2400);
  });
}

function initHeroBackground(): void {
  // The halftone drift only runs while the hero is on screen.
  const hero = document.querySelector<HTMLElement>('.hero');
  const bg = document.querySelector<HTMLElement>('.hero__bg');
  if (!hero || !bg) return;
  if (!('IntersectionObserver' in window)) return;
  let onScreen = true;
  const sync = (): void => {
    bg.classList.toggle('is-paused', !onScreen || document.hidden);
  };
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  }).observe(hero);
  // Pause in a background tab too, and resume when the tab comes back.
  document.addEventListener('visibilitychange', sync);
}

/** A jagged lightning bolt from a to b (midpoint displacement), as SVG points. */
function bolt(ax: number, ay: number, bx: number, by: number): [number, number][] {
  let pts: [number, number][] = [[ax, ay], [bx, by]];
  let spread = 0.75; // how far each midpoint may jump, relative to its segment
  for (let pass = 0; pass < 3; pass++) {
    const next: [number, number][] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1];
      const [x2, y2] = pts[i];
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const off = (Math.random() - 0.5) * len * spread;
      next.push([(x1 + x2) / 2 - ((y2 - y1) / len) * off, (y1 + y2) / 2 + ((x2 - x1) / len) * off], pts[i]);
    }
    pts = next;
    spread *= 0.9;
  }
  return pts;
}
const toPoints = (pts: [number, number][]): string => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Where the letters actually are, relative to the heading box (headings are full-width blocks). */
function textBox(el: HTMLElement): { x: number; y: number; w: number; h: number } {
  const range = document.createRange();
  range.selectNodeContents(el);
  const t = range.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  if (!t.width) return { x: 0, y: 0, w: el.offsetWidth, h: el.offsetHeight };
  return { x: t.left - b.left, y: t.top - b.top, w: t.width, h: t.height };
}

/** Electric arcs that crackle off the letters for the length of the glitch: thin, cyan and neon pink. */
function zap(el: HTMLElement): void {
  const box = textBox(el);
  const { w, h } = box;
  if (!w || !h) return;
  const pad = 60;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'zap');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', `${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`);
  svg.style.left = `${box.x - pad}px`;
  svg.style.top = `${box.y - pad}px`;
  svg.style.width = `${w + pad * 2}px`;
  svg.style.height = `${h + pad * 2}px`;
  // crackles start on the letters' outline and leap outward or along it
  const edge = (): [number, number, number] => {
    const side = Math.floor(Math.random() * 4); // 0 top, 1 right, 2 bottom, 3 left
    if (side === 0) return [w * (0.1 + Math.random() * 0.8), h * 0.08, -Math.PI / 2];
    if (side === 1) return [w * 0.98, h * (0.2 + Math.random() * 0.6), 0];
    if (side === 2) return [w * (0.1 + Math.random() * 0.8), h * 0.92, Math.PI / 2];
    return [w * 0.02, h * (0.2 + Math.random() * 0.6), Math.PI];
  };
  // never past the page margins, so a crackle can't cause sideways scrolling
  const minX = -Math.min(pad - 4, box.x + 12);
  const maxX = el.offsetWidth - box.x + 12;
  const clampX = (pts: [number, number][]): [number, number][] =>
    pts.map(([x, y]) => [Math.min(maxX, Math.max(minX, x)), Math.min(h + pad - 4, Math.max(-pad + 4, y))]);
  for (let i = 0; i < 4; i++) {
    const [x, y, dir] = edge();
    const a = dir + (Math.random() - 0.5) * 1.4;
    const len = 50 + Math.random() * Math.min(110, w * 0.22);
    const ax = x - Math.cos(a) * len * 0.3;
    const ay = y - Math.sin(a) * len * 0.3;
    const bx = x + Math.cos(a) * len * 0.7;
    const by = y + Math.sin(a) * len * 0.7;
    const main = bolt(ax, ay, bx, by);
    const [fx, fy] = main[Math.floor(main.length * (0.3 + Math.random() * 0.4))];
    const fork = bolt(fx, fy, fx + (Math.random() - 0.5) * len * 0.6, fy + (Math.random() - 0.5) * len * 0.6);
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', `zap__arc zap__arc--${i} ${i % 2 ? 'zap__arc--pink' : 'zap__arc--cyan'}`);
    for (const pts of [clampX(main), clampX(fork)]) {
      const line = document.createElementNS(SVG_NS, 'polyline');
      line.setAttribute('points', toPoints(pts));
      line.setAttribute('class', 'zap__line');
      g.appendChild(line);
    }
    const [ex, ey] = clampX([[bx, by]])[0];
    const spark = document.createElementNS(SVG_NS, 'rect');
    spark.setAttribute('x', String(ex - 2.5));
    spark.setAttribute('y', String(ey - 2.5));
    spark.setAttribute('width', '5');
    spark.setAttribute('height', '5');
    spark.setAttribute('class', 'zap__spark');
    g.appendChild(spark);
    svg.appendChild(g);
  }
  el.appendChild(svg);
  window.setTimeout(() => svg.remove(), 520);
}

function initGlitch(): void {
  // Each heading glitches (with a crackle of electricity) on hover, once as it
  // scrolls into view, and again when tapped: phones have no hover.
  if (reduceMotion()) return;
  const heads = Array.from(document.querySelectorAll<HTMLElement>('.glitch'));
  const last = new WeakMap<HTMLElement, number>();
  const play = (el: HTMLElement, sound = false): void => {
    const now = performance.now();
    if (now - (last.get(el) ?? 0) < 600) return; // no spamming
    last.set(el, now);
    el.classList.remove('is-glitching');
    void el.offsetWidth; // restart the animation
    el.classList.add('is-glitching');
    zap(el);
    if (sound) zzt();
    window.setTimeout(() => el.classList.remove('is-glitching'), 450);
  };
  heads.forEach((el) => {
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') play(el, true);
    });
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') play(el, true);
    });
  });
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        window.setTimeout(() => play(el), 250); // after its reveal has started
      }
    },
    { threshold: 0.6 },
  );
  heads.forEach((el) => io.observe(el));
}

export function initSite(): void {
  initSound();
  initGlitch();
  initReveals();
  initTagline();
  initCardDrift();
  initMenu();
  initCharacterFile();
  initGlideDetails();
  initThemeToggle();
  initHeroBackground();
  initPortraitReveal();
  initFeatures();
  initNotebook();
  initCoffee();
  initPencil();
  initContact();
  initFooter();
  initCard();
  initStars();
}
