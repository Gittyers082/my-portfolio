/**
 * The aura farmer on the rock (Tagline section):
 * - the cape's SMIL animation only runs while the section is on screen;
 * - comments pop up out of nowhere around him, like a live chat reacting,
 *   in a few spots that never cover the headline or arete;
 * - pressing him sends a gust: the cape snaps, "+100 aura" floats up, a whoosh plays,
 *   and the aura meter fills a step;
 * - the tenth gust (or typing "arete", from keys.ts) powers him up: a living aura,
 *   a leap off the rock, lightning, a random weapon, one hit that splits the rock,
 *   then back up. Narrow screens get a shorter run on the rock; reduced motion gets
 *   one still frame of the result.
 * Each weapon rolled is collected (kept in this browser), and the first power-up
 * counts toward the Explored meter.
 */
import { gust, whoosh, boom, strike, crunch } from './sfx';

const COMMENTS: [string, string][] = [
  ['@visitor', 'Yes El, we see the fit (¬_¬)'],
  ['@aura_check', '+1000 aura'],
  ['@just_scrolling', 'Bro has been standing there all day'],
  ['@the_wind', 'I only blow for him (•_•)'],
  ['@recruiter', 'Ok but is he open to internships'],
];
const SLOTS = 3; // .farmer__comment--0..2 in global.css
const LIFE = 3600;

const GUSTS = 10; // gusts it takes to power him up
const FULL_MS = 6000; // the run's length: keep in step with global.css
const SHORT_MS = 3600;
const STILL_MS = 4200;
const WEAPONS = ['sword', 'axe', 'hammer', 'halberd', 'keyboard'] as const;
type Weapon = (typeof WEAPONS)[number];
const NAMES: Record<Weapon, string> = { sword: 'a sword', axe: 'an axe', hammer: 'a hammer', halberd: 'a halberd', keyboard: 'a keyboard' };
const COLLECTED = 'aura-weapons';
// when each sound lands in the run, in ms (global.css has the matching keyframes)
const CUES_FULL: [number, () => void][] = [[500, whoosh], [1500, boom], [2070, strike], [3480, crunch], [4400, whoosh]];
const CUES_SHORT: [number, () => void][] = [[760, strike], [1860, crunch]];

/** The keyboard is the rare one: about 1 roll in 10. */
const roll = (): Weapon => (Math.random() < 0.1 ? 'keyboard' : WEAPONS[Math.floor(Math.random() * 4)]);

export function initAura(): void {
  const farmer = document.querySelector<HTMLElement>('[data-aura]');
  const svg = farmer?.querySelector<SVGSVGElement>('[data-aura-svg]');
  const layer = farmer?.querySelector<HTMLElement>('[data-aura-comments]');
  const btn = farmer?.querySelector<HTMLButtonElement>('[data-aura-btn]');
  if (!farmer || !svg || !layer || !btn) return;
  const fill = farmer.querySelector<HTMLElement>('[data-aura-fill]');
  const count = farmer.querySelector<HTMLElement>('[data-aura-count]');
  const weaponsLine = farmer.querySelector<HTMLElement>('[data-aura-weapons]');
  const live = farmer.querySelector<HTMLElement>('[data-aura-live]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 959px)'); // where .farmer stops floating at the right

  const make = (n: number, slot: number): HTMLElement => {
    const [who, text] = COMMENTS[n % COMMENTS.length];
    return comment(who, text, slot);
  };
  const comment = (who: string, text: string, slot: number): HTMLElement => {
    const el = document.createElement('span');
    el.className = `farmer__comment farmer__comment--${slot}`;
    el.style.setProperty('--tilt', `${(Math.random() * 6 - 3).toFixed(1)}deg`);
    const name = document.createElement('span');
    name.className = 'farmer__who';
    name.textContent = who;
    el.append(name, document.createTextNode(text));
    return el;
  };

  if (reduce) {
    svg.pauseAnimations();
    layer.appendChild(make(0, 0)).classList.add('is-still');
  }

  let n = 0;
  let lastSlot = -1;
  let timer = 0;
  const busy = new Set<number>();
  const pop = (): void => {
    const free = [...Array(SLOTS).keys()].filter((s) => !busy.has(s) && s !== lastSlot);
    if (!free.length) return;
    const slot = free[Math.floor(Math.random() * free.length)];
    lastSlot = slot;
    busy.add(slot);
    const el = layer.appendChild(make(n, slot));
    n += 1;
    window.setTimeout(() => {
      el.remove();
      busy.delete(slot);
    }, LIFE);
  };
  /** A reaction pinned to one spot, replacing whatever sat there. */
  const react = (slot: number, who: string, text: string, delay = 0): void => {
    window.setTimeout(() => {
      layer.querySelectorAll(`.farmer__comment--${slot}`).forEach((c) => c.remove());
      busy.add(slot);
      const el = layer.appendChild(comment(who, text, slot));
      if (reduce) el.classList.add('is-still');
      window.setTimeout(() => {
        el.remove();
        busy.delete(slot);
      }, reduce ? STILL_MS : LIFE);
    }, delay);
  };

  let onScreen = false;
  const start = (): void => {
    onScreen = true;
    if (reduce) return;
    svg.unpauseAnimations();
    window.clearInterval(timer);
    window.setTimeout(pop, n === 0 ? 900 : 200);
    timer = window.setInterval(pop, 2300);
  };
  const stop = (): void => {
    onScreen = false;
    // the cape morph and the aura's boiling flames are SMIL: pause them off screen
    if (!reduce) svg.pauseAnimations();
    window.clearInterval(timer);
  };

  const section = farmer.closest<HTMLElement>('[data-wind]') ?? farmer;
  if ('IntersectionObserver' in window) {
    stop();
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.25 }).observe(section);
  } else {
    start();
  }

  /* ---------- the meter and the weapon collection ---------- */
  let gusts = 0;
  const renderMeter = (): void => {
    if (fill) fill.style.width = `${(gusts / GUSTS) * 100}%`;
    if (count) count.textContent = `${gusts}/${GUSTS}`;
  };
  let collected = new Set<Weapon>();
  try {
    const saved = JSON.parse(localStorage.getItem(COLLECTED) || '[]') as string[];
    collected = new Set(saved.filter((w): w is Weapon => (WEAPONS as readonly string[]).includes(w)));
  } catch {
    /* storage unavailable: the collection lasts for this page view */
  }
  const renderWeapons = (): void => {
    if (!weaponsLine || !collected.size) return;
    weaponsLine.hidden = false;
    weaponsLine.textContent = `Weapons ${collected.size}/${WEAPONS.length}`;
  };
  renderMeter();
  renderWeapons();

  /* ---------- the power-up ---------- */
  let runUntil = 0;
  let endTimer = 0;
  let cueTimers: number[] = [];
  const powerUp = (): void => {
    const now = Date.now();
    if (now < runUntil) return;
    const compact = narrow.matches;
    const ms = reduce ? STILL_MS : compact ? SHORT_MS : FULL_MS;
    runUntil = now + ms;
    gusts = 0;
    renderMeter();

    const weapon = roll();
    const isNew = !collected.has(weapon);
    collected.add(weapon);
    try {
      localStorage.setItem(COLLECTED, JSON.stringify([...collected]));
    } catch {
      /* ignore */
    }

    // restart the run from the top: drop the classes, force a reflow, add them back
    farmer.classList.remove('is-powering', 'is-still-power', 'is-compact', 'is-gusting');
    farmer.dataset.weapon = weapon;
    void farmer.offsetWidth;
    farmer.classList.toggle('is-compact', compact);
    farmer.classList.add(reduce ? 'is-still-power' : 'is-powering');
    if (!onScreen && !reduce) svg.unpauseAnimations();

    cueTimers.forEach((t) => window.clearTimeout(t));
    cueTimers = reduce ? [] : (compact ? CUES_SHORT : CUES_FULL).map(([at, play]) => window.setTimeout(play, at));
    if (reduce) gust();

    // the chat reacts to the hit, and to a new weapon
    const hitAt = reduce ? 0 : compact ? 1860 : 3480;
    react(0, '@the_rock', 'bro what did I do', hitAt + 200);
    if (weapon === 'keyboard') react(1, '@recruiter', 'ok he’s hired', hitAt + 700);
    else if (isNew) react(1, '@collector', `new weapon: ${weapon} (${collected.size}/${WEAPONS.length})`, hitAt + 700);
    window.setTimeout(renderWeapons, hitAt + 700);

    if (live) live.textContent = `Powered up: El summoned ${NAMES[weapon]} and split the rock. +1000 aura.`;
    document.dispatchEvent(new CustomEvent('trust:earn', { detail: 'powerup' }));
    if (!reduce && !compact) burst(section, hitAt);

    window.clearTimeout(endTimer);
    endTimer = window.setTimeout(() => {
      farmer.classList.remove('is-powering', 'is-still-power');
      if (!onScreen && !reduce) svg.pauseAnimations();
    }, ms);
  };

  // typing "arete" anywhere (keys.ts) skips the gusts and powers him up
  document.addEventListener('aura:power', powerUp);

  let gustTimer = 0;
  btn.addEventListener('click', () => {
    if (Date.now() < runUntil) return; // mid-run: clicks don't count
    gusts += 1;
    if (gusts >= GUSTS) {
      powerUp();
      return;
    }
    renderMeter();
    farmer.classList.remove('is-gusting');
    void farmer.offsetWidth;
    farmer.classList.add('is-gusting');
    gust();
    window.clearTimeout(gustTimer);
    gustTimer = window.setTimeout(() => farmer.classList.remove('is-gusting'), 1200);
  });
}

/** A burst of the Tagline's logo leaves, blown fast across the section by the hit. */
function burst(section: HTMLElement, delay: number): void {
  const wind = section.querySelector<HTMLElement>('.wind');
  const icons = Array.from(section.querySelectorAll<HTMLElement>('.leaf .tech-icon'));
  if (!wind || !icons.length) return;
  for (let i = 0; i < 16; i += 1) {
    const leaf = document.createElement('span');
    leaf.className = 'leaf-burst';
    leaf.style.setProperty('--top', `${Math.round(5 + Math.random() * 85)}%`);
    leaf.style.setProperty('--delay', `${delay + Math.round(Math.random() * 500)}ms`);
    leaf.style.setProperty('--spin', `${Math.round((Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 360))}deg`);
    leaf.style.setProperty('--size', `${Math.round(22 + Math.random() * 22)}px`);
    leaf.appendChild(icons[i % icons.length].cloneNode(true));
    wind.appendChild(leaf);
    window.setTimeout(() => leaf.remove(), delay + 2400);
  }
}
