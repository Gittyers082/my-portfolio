/**
 * Shooting stars: every few seconds a thin ink streak (now and then a cyan one)
 * shoots diagonally across a section's background and fades. Used in the
 * Character card, GitHub activity and Contact sections ([data-stars] layers).
 * Only runs while that section is on screen; off with reduced motion.
 */
export function initStars(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window) || !('animate' in HTMLElement.prototype)) return;

  document.querySelectorAll<HTMLElement>('[data-stars]').forEach((layer) => {
    let timer = 0;
    let visible = false;

    const shoot = (): void => {
      const star = document.createElement('span');
      star.className = Math.random() < 0.25 ? 'star star--accent' : 'star';
      const len = 90 + Math.random() * 140;
      const angle = 18 + Math.random() * 14;         // degrees below horizontal, heading down-left
      const travel = 260 + Math.random() * 320;
      star.style.width = `${len}px`;
      star.style.left = `${15 + Math.random() * 80}%`;
      star.style.top = `${Math.random() * 55}%`;
      star.style.setProperty('--a', `${angle}deg`);
      layer.appendChild(star);
      const dx = -Math.cos((angle * Math.PI) / 180) * travel;
      const dy = Math.sin((angle * Math.PI) / 180) * travel;
      star.animate(
        [
          { transform: `rotate(${-angle}deg) scaleX(0)`, opacity: 0, translate: '0 0' },
          { transform: `rotate(${-angle}deg) scaleX(1)`, opacity: 1, translate: `${dx * 0.35}px ${dy * 0.35}px`, offset: 0.3 },
          { transform: `rotate(${-angle}deg) scaleX(0.2)`, opacity: 0, translate: `${dx}px ${dy}px` },
        ],
        { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' },
      ).addEventListener('finish', () => star.remove());
    };

    const loop = (): void => {
      if (!visible || document.hidden) return;
      shoot();
      timer = window.setTimeout(loop, 1800 + Math.random() * 2200);
    };
    const sync = (): void => {
      window.clearTimeout(timer);
      if (visible && !document.hidden) timer = window.setTimeout(loop, 600 + Math.random() * 900);
    };
    document.addEventListener('visibilitychange', sync);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.1 }).observe(layer.parentElement ?? layer);
  });
}
