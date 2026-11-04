/**
 * Stack skill bars: when the Stack chapter opens, each bar inks in (CSS) and
 * its number counts up in step with the ink, from 0 to the level.
 * Timing matches .stat__seg--on in global.css: area delay + 70ms per segment.
 * Reduced motion: the numbers just show the level.
 */
export function initStackBars(): void {
  const chapter = document.querySelector<HTMLDetailsElement>('details[data-chapter="stack"]');
  if (!chapter || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let timers: number[] = [];
  chapter.addEventListener('toggle', () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    if (!chapter.open) return;
    chapter.querySelectorAll<HTMLElement>('.area').forEach((area) => {
      const i = Number(getComputedStyle(area).getPropertyValue('--i')) || 0;
      area.querySelectorAll<HTMLElement>('[data-count]').forEach((num) => {
        const level = Number(num.dataset.count) || 0;
        num.textContent = '0';
        for (let n = 1; n <= level; n += 1) {
          timers.push(window.setTimeout(() => { num.textContent = String(n); }, i * 90 + 260 + n * 70));
        }
      });
    });
  });
}
