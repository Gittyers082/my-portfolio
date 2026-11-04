/**
 * Light / dark. The <head> script (Base.astro) already set data-theme before the
 * first paint (saved choice, else the system setting); this wires the nav toggle:
 * - click: switch, remember it, and let the new theme spread in a circle from the
 *   button (View Transitions, where supported; a short cross-fade otherwise);
 * - follows system changes until the visitor picks one themselves.
 * Reduced motion: instant.
 */
import { lamp } from './sfx';

type Theme = 'light' | 'dark';
type VTDocument = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
const KEY = 'theme';

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function initTheme(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  const label = btn?.querySelector<HTMLElement>('[data-theme-label]');
  const note = document.getElementById('theme-note');
  const meta = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

  const render = (): void => {
    const dark = current() === 'dark';
    btn?.setAttribute('aria-pressed', String(dark));
    if (label) label.textContent = dark ? 'Dark' : 'Light';
    meta.forEach((m) => { m.content = dark ? '#12110E' : '#F4EFE4'; });
  };
  const apply = (t: Theme): void => { document.documentElement.dataset.theme = t; render(); };
  render();

  const reduce = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const switchTo = (t: Theme, from?: { x: number; y: number }): void => {
    const doc = document as VTDocument;
    if (reduce()) { apply(t); return; }
    if (doc.startViewTransition && from) {
      const r = Math.hypot(Math.max(from.x, innerWidth - from.x), Math.max(from.y, innerHeight - from.y));
      doc.startViewTransition(() => apply(t)).ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${from.x}px ${from.y}px)`, `circle(${r}px at ${from.x}px ${from.y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
        );
      }).catch(() => { /* fine: the theme already switched */ });
      return;
    }
    document.documentElement.classList.add('theme-fading');
    apply(t);
    window.setTimeout(() => document.documentElement.classList.remove('theme-fading'), 450);
  };

  btn?.addEventListener('click', () => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    const r = btn.getBoundingClientRect();
    try { localStorage.setItem(KEY, next); } catch { /* the choice lasts for this page view */ }
    lamp();
    switchTo(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    if (note) { note.textContent = next === 'dark' ? 'Dark mode on' : 'Light mode on'; window.setTimeout(() => { note.textContent = ''; }, 1500); }
  });

  // follow the system until the visitor chooses
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch { /* none */ }
    if (!saved) apply(e.matches ? 'dark' : 'light');
  });
}
