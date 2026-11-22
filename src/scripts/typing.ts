/**
 * Latest pushes: each repo's description types itself out like a terminal the
 * first time the row scrolls into view (one card after another), and retypes,
 * faster, when you hover a card. Screen readers get the full text (sr-only copy).
 * Reduced motion: the text just shows.
 */
export function initTyping(): void {
  const row = document.querySelector<HTMLElement>('.gh-repos');
  const typed = Array.from(document.querySelectorAll<HTMLElement>('[data-type]'));
  if (!row || !typed.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const runs = new WeakMap<HTMLElement, number>();
  const type = (el: HTMLElement, speed: number, delay = 0): void => {
    window.clearTimeout(runs.get(el));
    const text = el.dataset.type ?? '';
    let i = 0;
    el.textContent = '';
    el.classList.add('is-typing');
    const tick = (): void => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) runs.set(el, window.setTimeout(tick, speed + Math.random() * speed * 0.6));
      else runs.set(el, window.setTimeout(() => el.classList.remove('is-typing'), 1200));
    };
    runs.set(el, window.setTimeout(tick, delay));
  };

  typed.forEach((el) => { el.textContent = ''; });
  const start = (): void => typed.forEach((el, i) => type(el, 28, 300 + i * 450));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      start();
    }, { threshold: 0.4 });
    io.observe(row);
  } else {
    start();
  }
  typed.forEach((el) => {
    el.closest('.gh-repo')?.addEventListener('pointerenter', (e) => {
      if ((e as PointerEvent).pointerType === 'mouse' && !el.classList.contains('is-typing')) type(el, 14);
    });
  });
}
