/**
 * Character card:
 * - tilt: the set of tiles leans toward the cursor, and each tile catches a
 *   sheen where the cursor is relative to it (mouse only);
 * - flip: click a fact to turn it over; the hidden side is made inert so
 *   keyboard and screen readers only meet the side you can see;
 * - jump: a back side's link opens the right chapter (and the quest board, if
 *   asked) and scrolls to it.
 * Reduced motion: no tilt, and the flip is instant.
 */
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
    });
  });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf);
    card.classList.remove('is-tilting');
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
    const set = (flipped: boolean): void => {
      fact.classList.toggle('is-flipped', flipped);
      front.inert = flipped;
      back.inert = !flipped;
      // move focus to the side that's now showing (after the turn starts)
      window.setTimeout(() => (flipped ? unflip : front).focus({ preventScroll: true }), reduceMotion() ? 0 : 280);
    };
    front.addEventListener('click', () => { set(true); earn('card'); });
    unflip.addEventListener('click', () => set(false));
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

export function initCard(): void {
  const card = document.querySelector<HTMLElement>('[data-card]');
  if (!card) return;
  initTilt(card);
  initFlip(card);
  initJumps(card);
}
