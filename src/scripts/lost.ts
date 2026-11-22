/**
 * 404: press El and he turns his map the right way up; the question marks turn
 * into an "!" and the "Back to the start" link gets a nudge. Only on the 404 page.
 */
export function initLost(): void {
  const art = document.querySelector<HTMLButtonElement>('[data-lost]');
  const caption = document.querySelector<HTMLElement>('[data-lost-caption]');
  const home = document.querySelector<HTMLElement>('[data-lost-home]');
  if (!art || !caption) return;
  art.addEventListener('click', () => {
    const fixed = !art.classList.contains('is-found');
    art.classList.toggle('is-found', fixed);
    caption.textContent = fixed ? 'Oh. It was upside down. The way back is that link.' : 'Press El to help him out.';
    home?.classList.toggle('is-nudged', fixed);
  });
}
