/**
 * The interactive pieces added in the "mountain" redesign:
 *  - trust value meter (earned by exploring; stored for the visit only)
 *  - Ka-dugo demo loop (auto-plays on screen, pauses offscreen / on hover)
 *  - episode picker (the picked project pops out) + art-style snap
 *  - copy-the-email button
 * Each one is progressive: the page reads fine without JavaScript.
 */

const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- trust value ---------------- */

const POINTS: Record<string, number> = {
  chapter: 10, // per chapter opened
  episode: 6, // per episode picked
  demo: 10,
  snap: 6,
  portrait: 10,
  copy: 20,
  book: 4, // flipping the About me notebook
  coffee: 2,
  pencil: 2,
};
const BASE = 6;
const KEY = 'trust-earned';

function initTrust(): void {
  const meter = document.querySelector<HTMLElement>('[data-trust]');
  const value = document.querySelector<HTMLElement>('[data-trust-value]');
  const rank = document.querySelector<HTMLElement>('[data-trust-rank]');
  const segs = Array.from(document.querySelectorAll<HTMLElement>('.trust__seg'));
  const finale = document.querySelector<HTMLElement>('[data-trust-final]');
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!meter || !value || !rank) return;

  let earned = new Set<string>();
  try {
    earned = new Set(JSON.parse(sessionStorage.getItem(KEY) || '[]') as string[]);
  } catch {
    /* storage unavailable: the meter still works for this page view */
  }

  const score = (): number => {
    let total = BASE;
    for (const key of earned) total += POINTS[key.split(':')[0]] ?? 0;
    return Math.min(100, total);
  };
  const rankFor = (n: number): string =>
    n >= 100 ? 'Rank X: you read the whole file' : n >= 60 ? 'Top ten: keep going' : 'Rookie: open a chapter, play the demo';

  const render = (bump = false): void => {
    const n = score();
    value.textContent = String(n);
    rank.textContent = rankFor(n);
    segs.forEach((s, i) => s.classList.toggle('is-on', i < Math.round(n / 10)));
    meter.classList.toggle('is-max', n >= 100);
    if (finale) {
      finale.hidden = false;
      finale.textContent = `Your trust value: ${n} · ${rankFor(n)}`;
    }
    if (bump && !reduceMotion()) {
      meter.classList.remove('is-bump');
      void meter.offsetWidth; // restart the animation
      meter.classList.add('is-bump');
    }
  };

  document.addEventListener('trust:earn', (e) => {
    const key = String((e as CustomEvent).detail);
    if (earned.has(key)) return;
    earned.add(key);
    try {
      sessionStorage.setItem(KEY, JSON.stringify([...earned]));
    } catch {
      /* ignore */
    }
    render(true);
  });

  // Every chapter opened counts (the one open on load does not: nobody opened it).
  document.querySelectorAll<HTMLDetailsElement>('.cf__item').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open && d.dataset.chapter) earn(`chapter:${d.dataset.chapter}`);
    });
  });

  // Show the meter only once the hero has scrolled away.
  meter.hidden = false;
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => meter.classList.toggle('is-shown', !entry.isIntersecting), {
      threshold: 0.15,
    }).observe(hero);
  } else {
    meter.classList.add('is-shown');
  }
  render();
}

const earn = (key: string): void => {
  document.dispatchEvent(new CustomEvent('trust:earn', { detail: key }));
};

/* ---------------- Ka-dugo demo loop ---------------- */

const STEP_MS = 2600;

function initDemo(): void {
  const demo = document.querySelector<HTMLElement>('[data-demo]');
  if (!demo) return;
  const controls = demo.querySelector<HTMLElement>('.demo__controls');
  const playBtn = demo.querySelector<HTMLButtonElement>('[data-demo-play]');
  const stepBtns = Array.from(demo.querySelectorAll<HTMLButtonElement>('[data-demo-step]'));
  const status = demo.querySelector<HTMLElement>('.demo__status-text');
  if (!controls || !playBtn) return;
  controls.hidden = false;
  demo.classList.add('is-live');

  let step = 0;
  let userPaused = reduceMotion(); // reduced motion: never auto-advance
  let hovered = false;
  let onScreen = false;
  let timer = 0;

  const playing = (): boolean => !userPaused && !hovered && onScreen && !document.hidden;

  const show = (n: number): void => {
    step = n;
    demo.dataset.step = String(n);
    stepBtns.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(i === n));
      b.classList.toggle('is-done', i < n);
    });
  };

  const sync = (): void => {
    window.clearTimeout(timer);
    const on = playing();
    demo.classList.toggle('is-playing', on);
    playBtn.setAttribute('aria-label', userPaused ? 'Play demo' : 'Pause demo');
    playBtn.classList.toggle('is-paused', userPaused);
    if (status) status.textContent = userPaused ? 'Demo loop · paused' : 'Demo loop';
    if (on) {
      timer = window.setTimeout(() => {
        show((step + 1) % stepBtns.length);
        sync();
      }, STEP_MS);
    }
  };

  playBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    earn('demo');
    sync();
  });
  stepBtns.forEach((b, i) =>
    b.addEventListener('click', () => {
      userPaused = true;
      show(i);
      earn('demo');
      sync();
    }),
  );
  const frame = demo.querySelector<HTMLElement>('.demo__frame');
  frame?.addEventListener('pointerenter', () => {
    hovered = true;
    sync();
  });
  frame?.addEventListener('pointerleave', () => {
    hovered = false;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    }, { threshold: 0.4 }).observe(demo);
  } else {
    onScreen = true;
  }
  show(0);
  sync();
}

/* ---------------- episodes: pick one, it pops out ---------------- */

function initEpisodes(): void {
  const root = document.querySelector<HTMLElement>('[data-episodes]');
  if (!root) return;
  const picker = root.querySelector<HTMLElement>('.picker');
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-pick]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-episode]'));
  if (!picker || !buttons.length) return;
  picker.hidden = false;
  root.classList.add('is-live');

  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.pick;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.episode === id));
      earn(`episode:${id}`);
    }),
  );

  root.querySelectorAll<HTMLButtonElement>('[data-snap]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const frame = btn.closest('.pop__art')?.querySelector<HTMLElement>('[data-snap-target]');
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      frame?.classList.toggle('is-snapped', on);
      earn('snap');
    }),
  );
}

/* ---------------- copy the email ---------------- */

function initCopy(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-copy]').forEach((link) => {
    const label = link.querySelector<HTMLElement>('[data-copy-label]');
    link.addEventListener('click', async (e) => {
      const text = link.dataset.copy;
      if (!text || !navigator.clipboard) return; // falls back to the mailto link
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(text);
        if (label) label.textContent = 'Copied to your clipboard';
        earn('copy');
      } catch {
        window.location.href = link.href;
      }
    });
  });
}

/* ---------------- trust history: start at the most recent weeks ---------------- */

function initHistory(): void {
  const scroller = document.querySelector<HTMLElement>('.th__scroll');
  if (scroller) scroller.scrollLeft = scroller.scrollWidth;
}

export function initFeatures(): void {
  initHistory();
  initTrust();
  initDemo();
  initEpisodes();
  initCopy();
}
