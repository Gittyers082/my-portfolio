/**
 * Line drawings that draw themselves in ([data-sketch]: PlanningSketch, OtherverseMap).
 * Each plays once, the first time it's properly on screen; CSS runs the draw (.is-drawn).
 * Reduced motion: no draw-in (CSS) and the SMIL motion inside is paused.
 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll<HTMLElement>('[data-sketch]').forEach((el) => {
  if (reduce) el.querySelector('svg')?.pauseAnimations();
  if (!('IntersectionObserver' in window)) { el.classList.add('is-drawn'); return; }
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { el.classList.add('is-drawn'); io.disconnect(); }
  }, { threshold: 0.4 });
  io.observe(el);
});
