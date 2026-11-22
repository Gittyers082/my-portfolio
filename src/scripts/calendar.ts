/**
 * GitHub activity calendar:
 * - hover (or tap) a dot: a small ink label with its count and date;
 * - hover, focus or tap "longest streak": those days light up in cyan.
 * With the sample calendar (GitHub unreachable at build time) the label says
 * "Sample" and there's no streak to trace.
 */
const LEVEL_WORDS = ['No contributions', 'A light day', 'A steady day', 'A busy day', 'A big day'];

const dateLabel = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

export function initCalendar(): void {
  const cal = document.querySelector<HTMLElement>('[data-cal]');
  const tip = cal?.querySelector<HTMLElement>('[data-cal-tip]');
  const grid = cal?.querySelector<HTMLElement>('.th__grid');
  if (!cal || !tip || !grid) return;
  const sample = cal.dataset.sample === 'true';

  const label = (dot: HTMLElement): string => {
    const date = dateLabel(dot.dataset.date ?? '');
    if (sample) return `Sample · ${date}`;
    const count = dot.dataset.count;
    if (count === undefined) return `${LEVEL_WORDS[Number(dot.dataset.level) || 0]} · ${date}`;
    const n = Number(count);
    return `${n === 0 ? 'No' : n} contribution${n === 1 ? '' : 's'} · ${date}`;
  };
  let current: HTMLElement | null = null;
  const show = (dot: HTMLElement): void => {
    if (current === dot) return;
    current?.classList.remove('is-hot');
    current = dot;
    dot.classList.add('is-hot');
    tip.textContent = label(dot);
    const c = cal.getBoundingClientRect();
    const d = dot.getBoundingClientRect();
    const half = tip.offsetWidth / 2;
    const x = Math.max(half + 8, Math.min(c.width - half - 8, d.left + d.width / 2 - c.left));
    tip.style.left = `${x}px`;
    tip.style.top = `${d.top - c.top}px`;
    tip.classList.add('is-on');
  };
  const hide = (): void => { current?.classList.remove('is-hot'); current = null; tip.classList.remove('is-on'); };
  grid.addEventListener('pointerover', (e) => {
    const dot = (e.target as Element | null)?.closest<HTMLElement>('.th__dot');
    if (dot) show(dot);
  });
  grid.addEventListener('pointerleave', hide);
  grid.addEventListener('click', (e) => {
    const dot = (e.target as Element | null)?.closest<HTMLElement>('.th__dot');
    if (dot) show(dot);
  });
  cal.querySelector('.th__scroll')?.addEventListener('scroll', hide, { passive: true });

  const trace = cal.querySelector<HTMLButtonElement>('[data-trace]');
  if (!trace) return;
  let pinned = false;
  const set = (on: boolean): void => { cal.classList.toggle('is-tracing', on); trace.setAttribute('aria-pressed', String(on)); };
  trace.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(true); });
  trace.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !pinned) set(false); });
  trace.addEventListener('focus', () => set(true));
  trace.addEventListener('blur', () => { if (!pinned) set(false); });
  trace.addEventListener('click', () => { pinned = !pinned; set(pinned); });
}
