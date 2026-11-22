/**
 * Keyboard shortcuts (press ? for the panel) and the secret word:
 * - ?        show / hide the shortcuts panel (Shortcuts.astro)
 * - J / K    next / previous section
 * - H        back to the top
 * - P, G, C  Projects, GitHub activity, Contact
 * - typing "arete" anywhere scrolls to the Tagline and powers El up (aura.ts)
 * Ignored while a modifier key is held or while typing in a field.
 */
const SECTIONS = ['top', 'card', 'file', 'projects', 'about', 'github', 'contact'];
const WORD = 'arete';

const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const behavior = (): ScrollBehavior => (reduceMotion() ? 'auto' : 'smooth');

function goTo(id: string): void {
  if (id === 'projects') {
    // the Projects links already know how to open the chapter (site.ts)
    document.querySelector<HTMLAnchorElement>('a[href="#projects"], a[href="/#projects"]')?.click();
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: behavior(), block: 'start' });
}

function step(dir: 1 | -1): void {
  const tops = SECTIONS.map((id) => ({ id, top: document.getElementById(id)?.getBoundingClientRect().top ?? NaN }))
    .filter((s) => !Number.isNaN(s.top));
  const next = dir === 1
    ? tops.find((s) => s.top > 12)
    : [...tops].reverse().find((s) => s.top < -12);
  if (next) goTo(next.id);
}

export function initKeys(): void {
  const panel = document.querySelector<HTMLDialogElement>('[data-keys]');
  let typed = '';

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

    if (e.key === '?') {
      e.preventDefault();
      if (!panel) return;
      if (panel.open) panel.close(); else panel.showModal();
      return;
    }
    if (panel?.open) return; // the dialog handles Esc itself

    const key = e.key.length === 1 ? e.key.toLowerCase() : '';
    // the secret word
    if (key) {
      typed = (typed + key).slice(-WORD.length);
      if (typed === WORD) {
        typed = '';
        const tagline = document.querySelector<HTMLElement>('[data-wind]');
        tagline?.scrollIntoView({ behavior: behavior(), block: 'center' });
        window.setTimeout(() => {
          document.dispatchEvent(new CustomEvent('aura:power'));
          document.dispatchEvent(new CustomEvent('trust:earn', { detail: 'arete' }));
        }, reduceMotion() ? 50 : 700);
        return;
      }
    }
    if (key === 'j') step(1);
    else if (key === 'k') step(-1);
    else if (key === 'h') goTo('top');
    else if (key === 'p') goTo('projects');
    else if (key === 'g') goTo('github');
    else if (key === 'c') goTo('contact');
  });

  // clicking the dim area around the panel closes it
  panel?.addEventListener('click', (e) => { if (e.target === panel) panel.close(); });
}
