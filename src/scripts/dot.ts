/**
 * Dot, El's ink familiar (components/Dot.astro). The one at the desk is still, like the rest of the
 * drawing; clicking him makes him vanish (an ink splash, and a quick poof in global.css) until the page is loaded again.
 * The other two need no script: the rock follows aura.ts's run classes in CSS, the ledge just waves.
 */
import { splash } from './sfx';

export function initDot(): void {
  const desk = document.querySelector<SVGGElement>('[data-dot="desk"]');
  if (!desk) return;
  desk.addEventListener('click', () => {
    if (desk.classList.contains('is-gone')) return;
    desk.classList.add('is-gone');
    splash();
    const hide = (): void => desk.setAttribute('display', 'none');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) hide();
    else desk.addEventListener('animationend', hide, { once: true });
  });
}
