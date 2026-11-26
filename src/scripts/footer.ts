/**
 * Footer life:
 * - the big name fills with ink when it scrolls in; hovering (or tapping) it
 *   lifts the letters one after another;
 * - the mini screen, dodge.exe (dodge.ts).
 * Reduced motion: the name is simply filled.
 */
import { initDodge } from './dodge';
const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initName(): void {
  const name = document.querySelector<HTMLElement>('[data-footer-name]');
  if (!name) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) { name.classList.add('is-inked'); return; }
  name.classList.add('is-outline');
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    name.classList.add('is-inked');
  }, { threshold: 0.5 });
  io.observe(name);

  const count = name.querySelectorAll('.fl').length;
  let busy = false;
  const wave = (): void => {
    if (busy) return;
    busy = true;
    name.classList.add('is-waving');
    window.setTimeout(() => { name.classList.remove('is-waving'); busy = false; }, count * 35 + 650);
  };
  name.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') wave(); });
  name.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') wave(); });
}

export function initFooter(): void {
  initName();
  document.querySelectorAll<HTMLElement>('[data-runner]').forEach(initDodge);
}
