/**
 * Site behaviour. Everything here is progressive: the page reads fine without it.
 * - reveals: sections' parts rise in once as they enter
 * - tagline: words light up one at a time as they cross a trigger line
 * - card drift: the hero's breakout card drifts with the scroll
 * - menu: full-height mobile menu
 * - character file: only one chapter open at a time (native <details name> does
 *   this in modern browsers; this covers the rest)
 */

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

function initCharacterFile(): void {
  const items = Array.from(document.querySelectorAll<HTMLDetailsElement>('.cf__item'));
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item && other.open) other.open = false;
      });
    });
  });
}

function initThemeToggle(): void {
  // Placeholder until dark mode ships: say so instead of doing nothing silently.
  const btn = document.querySelector<HTMLButtonElement>('.theme-toggle');
  const note = document.getElementById('theme-note');
  if (!btn || !note) return;
  btn.addEventListener('click', () => {
    note.textContent = 'Dark mode is coming soon.';
    window.setTimeout(() => (note.textContent = ''), 2400);
  });
}

export function initSite(): void {
  initReveals();
  initTagline();
  initCardDrift();
  initMenu();
  initCharacterFile();
  initThemeToggle();
}
