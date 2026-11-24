/**
 * The lore archive starts "classified": black bars over each file's text.
 * Hovering (mouse), focusing (keyboard) or tapping a file wipes them away and
 * the stamp turns to "Declassified". Revealed files stay revealed, and the
 * archive's Declassified count goes up. A character's quote types itself out.
 * Sealed files never open: they shake and stay shut.
 */
const reduce = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Types a line out letter by letter, with a caret that blinks a moment, then goes.
 * The whole line stays laid out the whole time (the untyped rest is just invisible),
 * so the card never grows or shifts while it types.
 */
function typeOut(el: HTMLElement): void {
  const text = el.textContent ?? '';
  if (reduce() || !text) return;
  const typed = document.createElement('span');
  const caret = document.createElement('span');
  const rest = document.createElement('span');
  caret.className = 'type-caret';
  rest.className = 'type-rest';
  rest.textContent = text;
  el.replaceChildren(typed, caret, rest);
  let i = 0;
  const step = (): void => {
    i += 1;
    typed.textContent = text.slice(0, i);
    rest.textContent = text.slice(i);
    if (i < text.length) window.setTimeout(step, text[i - 1] === ',' ? 160 : 34);
    else window.setTimeout(() => { caret.remove(); el.textContent = text; }, 1600);
  };
  // wait until the line is actually on screen, so a file declassified in passing still talks when you get to it
  const start = (): void => { window.setTimeout(step, 320); }; // after the bars start to wipe
  if (!('IntersectionObserver' in window)) { start(); return; }
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { io.disconnect(); start(); }
  }, { threshold: 1 });
  io.observe(el);
}

export function initLore(): void {
  const count = document.querySelector<HTMLElement>('[data-lore-count]');
  const files = document.querySelectorAll<HTMLElement>('[data-dossier]');
  if (count) count.textContent = '0';

  files.forEach((file) => {
    const reveal = (): void => {
      if (file.classList.contains('is-revealed')) return;
      file.classList.add('is-revealed');
      if (count) count.textContent = String(document.querySelectorAll('[data-dossier].is-revealed').length);
      file.querySelectorAll<HTMLElement>('[data-type]').forEach(typeOut);
      document.dispatchEvent(new CustomEvent('trust:earn', { detail: 'lore' }));
    };
    file.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') reveal(); });
    file.addEventListener('focusin', reveal);
    file.addEventListener('click', reveal);
  });

  document.querySelectorAll<HTMLElement>('[data-sealed]').forEach((file) => {
    const deny = (): void => {
      if (reduce()) return;
      file.classList.remove('is-denied');
      void file.offsetWidth; // restart the shake
      file.classList.add('is-denied');
    };
    file.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') deny(); });
    file.addEventListener('click', deny);
    file.addEventListener('animationend', () => file.classList.remove('is-denied'));
  });
}
