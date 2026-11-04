/**
 * Contact section life:
 * - the heading's last word rotates (something. → a web app. → a world. → an AI tool.)
 *   with the glitch, only while the heading is on screen;
 * - your local time, live, next to the status chip;
 * - the character waves when the section scrolls in, and when clicked;
 * - copying the email: a "Copied!" burst, a checkmark, and a paper plane flying off;
 * - finding everything (100% explored): a stamp lands on the section.
 * Reduced motion: no rotation, no plane, no arm swing; the rest just fades.
 */
import { stamp as stampSound } from './sfx';

const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const earn = (key: string): void => { document.dispatchEvent(new CustomEvent('trust:earn', { detail: key })); };

function initRotator(): void {
  const h = document.querySelector<HTMLElement>('[data-rotate]');
  const word = h?.querySelector<HTMLElement>('[data-word]');
  if (!h || !word || reduceMotion()) return;
  const words = ['something.', 'a web app.', 'a world.', 'an AI tool.'];
  let i = 0;
  let onScreen = false;
  const next = (): void => {
    if (!onScreen || document.hidden) return;
    i = (i + 1) % words.length;
    word.textContent = words[i];
    h.dataset.text = `Let’s build\n${words[i]}`;
    h.classList.remove('is-glitching');
    void h.offsetWidth; // restart the glitch
    h.classList.add('is-glitching');
    window.setTimeout(() => h.classList.remove('is-glitching'), 450);
  };
  window.setInterval(next, 2600);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.4 }).observe(h);
  } else {
    onScreen = true;
  }
}

function initLocalTime(): void {
  const el = document.querySelector<HTMLElement>('[data-localtime]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
  const tick = (): void => { el.textContent = `It’s ${fmt.format(new Date())} in Baguio, Philippines`; };
  tick();
  window.setInterval(tick, 30_000);
}

function initWave(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-wave]');
  const wrap = btn?.closest<HTMLElement>('.waver-wrap');
  if (!btn || !wrap) return;
  let last = -Infinity; // so the very first wave always plays
  const wave = (): void => {
    const now = performance.now();
    if (now - last < 1500) return;
    last = now;
    wrap.classList.remove('is-waving');
    void wrap.offsetWidth;
    wrap.classList.add('is-waving');
    window.setTimeout(() => wrap.classList.remove('is-waving'), 1500);
  };
  btn.addEventListener('click', () => { wave(); earn('wave'); });
  btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') wave(); });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      window.setTimeout(wave, 500);
    }, { threshold: 0.6 });
    io.observe(btn);
  }
}

const PLANE = '<svg viewBox="0 0 40 40" fill="var(--paper)" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M3 21 L37 5 L25 36 L18 24 Z"/><path d="M18 24 L37 5" fill="none"/><path d="M18 24 L19 32 L23 29" fill="none"/></svg>';

function initCopyFlair(): void {
  document.addEventListener('email:copied', (e) => {
    const link = (e as CustomEvent<HTMLElement>).detail;
    const icon = link.querySelector<HTMLElement>('.contact__icon');
    link.classList.remove('is-copied');
    void link.offsetWidth;
    link.classList.add('is-copied');
    window.setTimeout(() => link.classList.remove('is-copied'), 1900);
    if (!icon || reduceMotion()) return;
    // a paper plane takes off from the icon and flies away up and to the right
    const r = icon.getBoundingClientRect();
    const plane = document.createElement('span');
    plane.className = 'paper-plane';
    plane.innerHTML = PLANE;
    plane.style.left = `${r.left + r.width / 2 - 20}px`;
    plane.style.top = `${r.top + r.height / 2 - 20}px`;
    document.body.appendChild(plane);
    const far = Math.max(360, window.innerWidth - r.left);
    plane.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg) scale(0.6)', opacity: 0 },
        { transform: 'translate(40px, -30px) rotate(-8deg) scale(1)', opacity: 1, offset: 0.15 },
        { transform: `translate(${far * 0.45}px, -90px) rotate(-16deg) scale(1)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${far * 0.6}px, -40px) rotate(8deg) scale(0.95)`, opacity: 1, offset: 0.75 },
        { transform: `translate(${far}px, -200px) rotate(-24deg) scale(0.8)`, opacity: 0 },
      ],
      { duration: 1500, easing: 'cubic-bezier(0.33, 0, 0.2, 1)' },
    ).addEventListener('finish', () => plane.remove());
  });
}

function initStamp(): void {
  const stamp = document.querySelector<HTMLElement>('[data-explore-stamp]');
  const section = document.querySelector<HTMLElement>('#contact');
  if (!stamp || !section) return;
  const KEY = 'explore-stamp';
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
  let armed = false;

  const land = (): void => {
    stamp.hidden = false;
    if (seen || reduceMotion()) return; // already landed this visit: just show it
    seen = true;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    stamp.classList.add('is-landing');
    window.setTimeout(stampSound, 260);
  };

  document.addEventListener('explore:complete', () => {
    if (armed) return;
    armed = true;
    if (seen) { stamp.hidden = false; return; }
    if (!('IntersectionObserver' in window)) { land(); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      window.setTimeout(land, 300);
    }, { threshold: 0.35 });
    io.observe(section);
  });
  // already at 100% when the page loaded (the meter renders before this runs)
  if (document.querySelector('[data-trust-value]')?.textContent === '100%') {
    document.dispatchEvent(new CustomEvent('explore:complete'));
  }
}

export function initContact(): void {
  initRotator();
  initLocalTime();
  initWave();
  initCopyFlair();
  initStamp();
}
