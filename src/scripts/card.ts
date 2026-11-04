/**
 * Character card:
 * - tilt: the set of tiles leans toward the cursor, each tile catches a sheen
 *   where the cursor is, and the tile under it leans in on its own (mouse only);
 * - flip: click a fact to turn it over; the hidden side is made inert so
 *   keyboard and screen readers only meet the side you can see;
 * - jump: a back side's link opens the right chapter (and the quest board, if
 *   asked) and scrolls to it.
 * Reduced motion: no tilt, and the flip is instant.
 */
import { flip as flipSound } from './sfx';

const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const earn = (key: string): void => { document.dispatchEvent(new CustomEvent('trust:earn', { detail: key })); };

function initTilt(card: HTMLElement): void {
  if (reduceMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let raf = 0;
  const tiles = Array.from(card.querySelectorAll<HTMLElement>('[data-fact]'));
  card.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 .. 0.5
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
      // each tile gets its own highlight position, so the light reads across the gaps
      tiles.forEach((tile) => {
        const t = tile.getBoundingClientRect();
        tile.style.setProperty('--sx', `${(((e.clientX - t.left) / t.width) * 100).toFixed(1)}%`);
        tile.style.setProperty('--sy', `${(((e.clientY - t.top) / t.height) * 100).toFixed(1)}%`);
      });
      card.classList.add('is-tilting');
      // the tile under the cursor leans toward it on its own
      const over = (e.target as Element | null)?.closest<HTMLElement>('[data-fact]');
      tiles.forEach((tile) => {
        if (tile !== over) { tile.classList.remove('is-leaning'); tile.style.removeProperty('--tx'); tile.style.removeProperty('--ty'); return; }
        const t = tile.getBoundingClientRect();
        const lx = (e.clientX - t.left) / t.width - 0.5;
        const ly = (e.clientY - t.top) / t.height - 0.5;
        const flipped = tile.classList.contains('is-flipped') ? -1 : 1;
        tile.style.setProperty('--ty', `${(lx * 12 * flipped).toFixed(2)}deg`);
        tile.style.setProperty('--tx', `${(-ly * 10).toFixed(2)}deg`);
        tile.classList.add('is-leaning');
      });
    });
  });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf);
    card.classList.remove('is-tilting');
    tiles.forEach((tile) => { tile.classList.remove('is-leaning'); tile.style.removeProperty('--tx'); tile.style.removeProperty('--ty'); });
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
}

function initFlip(card: HTMLElement): void {
  card.querySelectorAll<HTMLElement>('[data-fact]').forEach((fact) => {
    const front = fact.querySelector<HTMLButtonElement>('[data-flip]');
    const back = fact.querySelector<HTMLElement>('.card__face--back');
    const unflip = fact.querySelector<HTMLButtonElement>('[data-unflip]');
    if (!front || !back || !unflip) return;
    back.inert = true;
    let turning = 0;
    const set = (flipped: boolean): void => {
      // a full-speed turn, even if the tile is leaning toward the cursor
      fact.classList.add('is-turning');
      window.clearTimeout(turning);
      turning = window.setTimeout(() => fact.classList.remove('is-turning'), 660);
      fact.style.setProperty('--ty', `${-(parseFloat(fact.style.getPropertyValue('--ty')) || 0)}deg`);
      flipSound();
      fact.classList.toggle('is-flipped', flipped);
      front.inert = flipped;
      back.inert = !flipped;
      // move focus to the side that's now showing (after the turn starts)
      window.setTimeout(() => (flipped ? unflip : front).focus({ preventScroll: true }), reduceMotion() ? 0 : 280);
    };
    front.addEventListener('click', () => { set(true); earn('card'); });
    unflip.addEventListener('click', (e) => { e.stopPropagation(); set(false); });
    // anywhere on the back flips it again, except the jump link
    back.addEventListener('click', (e) => {
      if ((e.target as Element | null)?.closest('a')) return;
      if (fact.classList.contains('is-flipped')) set(false);
    });
    fact.addEventListener('keydown', (e) => { if (e.key === 'Escape' && fact.classList.contains('is-flipped')) set(false); });
  });
}

function initJumps(card: HTMLElement): void {
  card.querySelectorAll<HTMLAnchorElement>('[data-jump]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const chapter = document.querySelector<HTMLDetailsElement>(`details[data-chapter="${link.dataset.jump}"]`);
      if (!chapter) return;
      e.preventDefault();
      const summary = chapter.querySelector<HTMLElement>(':scope > summary');
      const wasOpen = chapter.open && !chapter.classList.contains('is-closing');
      const behavior: ScrollBehavior = reduceMotion() ? 'auto' : 'smooth';
      // bring the chapter header into view first, then open it (site.ts glides it)
      summary?.scrollIntoView({ block: 'start', behavior });
      window.setTimeout(() => {
        if (!wasOpen) summary?.click();
        window.setTimeout(() => {
          const open = link.dataset.jumpOpen ? chapter.querySelector<HTMLDetailsElement>(link.dataset.jumpOpen) : null;
          if (open && !open.open) open.querySelector<HTMLElement>(':scope > summary')?.click();
          const target = link.dataset.jumpTarget ? chapter.querySelector<HTMLElement>(link.dataset.jumpTarget) : null;
          (target ?? summary)?.scrollIntoView({ block: 'start', behavior });
        }, wasOpen ? 0 : 700);
      }, reduceMotion() ? 0 : 520);
    });
  });
}

/** True once the Explored meter has hit 100% (this visit or earlier in the session). */
export const exploredAll = (): boolean => document.querySelector('[data-trust-value]')?.textContent?.trim() === '100%';

/** The secret 7th card: revealed at 100% explored (drops in), and on later page loads (already there). */
function initSecret(card: HTMLElement): void {
  const secret = card.querySelector<HTMLElement>('[data-secret]');
  if (!secret) return;
  const reveal = (animate: boolean): void => {
    if (!secret.hidden) return;
    secret.hidden = false;
    if (!animate || reduceMotion()) return;
    secret.classList.add('is-arriving');
    window.setTimeout(() => secret.classList.remove('is-arriving'), 900);
  };
  if (exploredAll()) reveal(false);
  document.addEventListener('explore:complete', () => reveal(true));
}

export function initCard(): void {
  const card = document.querySelector<HTMLElement>('[data-card]');
  if (!card) return;
  initTilt(card);
  initFlip(card);
  initJumps(card);
  initSecret(card);
}
