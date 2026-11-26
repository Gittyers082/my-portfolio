/**
 * The post-credits scene: a button on the left of the footer's last row, across from Back to the top, opens a
 * four-panel strip under it. Meanwhile, back at the intro: Dot is crying, Merlin blames El.
 * - The strip is built on the first open; Dot and Merlin are clones of their drawings already on the page,
 *   as in the grand opening. Pages without them (the 404) don't get the button.
 * - While open and on screen the panels are redrawn every frame (capes, flames, tears); paused otherwise.
 * - Reduced motion: it opens without the slide or the pop, and the panels hold still.
 */
import { panels, PANEL_LABELS, type Cast } from './postcredits-art';

export function initPostCredits(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-pc-btn]');
  const box = document.querySelector<HTMLElement>('[data-pc]');
  if (!btn || !box) return;
  const dotSrc = document.querySelector<SVGGElement>('[data-dot="ledge"]');
  const merlinSrc = document.querySelector<SVGSVGElement>('.demo--merlin svg[viewBox="-30 -70 260 294"]');
  if (!dotSrc || !merlinSrc) { btn.hidden = true; return; }
  btn.hidden = false;

  const root = document.documentElement;
  const still = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cast: Cast | null = null, svgs: SVGSVGElement[] = [];
  let raf = 0, onScreen = false, t0 = 0;

  const build = (): void => {
    const dot = dotSrc.cloneNode(true) as SVGGElement;
    dot.setAttribute('transform', '');
    dot.querySelector('.dot__open')?.remove();
    dot.querySelectorAll('.dot__face path').forEach((p) => p.remove()); // his smile; he's crying now
    const m = merlinSrc.cloneNode(true) as SVGSVGElement;
    m.querySelectorAll('.mer__beam, .mer__shadow').forEach((n) => n.remove());
    m.querySelector('.mer__circle')?.closest('g[transform]')?.remove();
    const mer = (k: number): string => m.innerHTML.replace(/id="mer-/g, `id="pc${k}-mer-`).replace(/url\(#mer-/g, `url(#pc${k}-mer-`);
    cast = { dot: dot.outerHTML, merlin: [mer(2), mer(4)], far: '' };
    svgs = [...box.querySelectorAll<SVGSVGElement>('.pc__panel svg')];
    svgs.forEach((s, i) => s.setAttribute('aria-label', PANEL_LABELS[i]));
  };

  const draw = (t: number): void => {
    if (!cast) return;
    cast.far = root.dataset.theme === 'dark' ? '#B9B1A3' : '#34312C';
    try {
      panels(cast, t).forEach((s, i) => { if (svgs[i]) svgs[i].innerHTML = s; });
    } catch { /* a bad frame shouldn't break the footer; the next one tries again */ }
  };

  const loop = (now: number): void => {
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
  const play = (): void => {
    cancelAnimationFrame(raf); raf = 0;
    if (still()) { draw(0.6); return; }
    if (btn.getAttribute('aria-expanded') === 'true' && onScreen) raf = requestAnimationFrame(loop);
  };

  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; play(); }).observe(box);

  const open = (yes: boolean): void => {
    btn.setAttribute('aria-expanded', String(yes));
    box.classList.toggle('is-open', yes);
    box.inert = !yes;
    if (yes) {
      if (!cast) build();
      t0 = performance.now();
      draw(0);
      // bring the strip into view once it has slid open
      window.setTimeout(() => box.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'nearest' }), still() ? 0 : 600);
    }
    play();
  };

  btn.addEventListener('click', () => {
    const go = (): void => open(btn.getAttribute('aria-expanded') !== 'true');
    // the bubbles are sized to their text, so wait for the font the first time
    if (!cast && document.fonts?.ready) void document.fonts.ready.then(go); else go();
  });
  box.inert = true;
}
