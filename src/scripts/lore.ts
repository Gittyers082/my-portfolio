/**
 * The lore archive starts "classified": black bars over each file's text.
 * Hovering (mouse), focusing (keyboard) or tapping a file wipes them away and
 * the stamp turns to "Declassified". Revealed files stay revealed.
 */
export function initLore(): void {
  document.querySelectorAll<HTMLElement>('[data-dossier]').forEach((file) => {
    const reveal = (): void => {
      if (file.classList.contains('is-revealed')) return;
      file.classList.add('is-revealed');
      document.dispatchEvent(new CustomEvent('trust:earn', { detail: 'lore' }));
    };
    file.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') reveal(); });
    file.addEventListener('focusin', reveal);
    file.addEventListener('click', reveal);
  });
}
