/**
 * Hero portrait reveal: the illustration and the portrait are two frames of the
 * same character intro.
 *
 *  idle ──hover──▶ peek ──leave──▶ idle            (mouse/pen only)
 *  idle/peek ──click──▶ opening ──400ms──▶ open    (wipe from the click point)
 *  open/opening ──click──▶ closing ──▶ idle        (reverse; then a short settle
 *                                                    before hover can peek again)
 *
 * Every click flips the direction from wherever the wipe currently is, so rapid
 * clicks and pointer exits mid-transition always end in the right state.
 * Reduced motion: no peek, the click swaps the two images instantly.
 * Touch: no hover; a tap toggles (the browser sends no click for a scroll).
 */

type Mode = 'idle' | 'peek' | 'opening' | 'open' | 'closing';

const PEEK_RADIUS = 112; // px: size of the hover window
const FRAME = 7; // px: ink frame around the window
const WIPE_MS = 400;
const SETTLE_MS = 450; // after restoring, before hover may peek again
const FOLLOW = 0.2; // how quickly the window chases the pointer, per frame
const GROW = 0.22; // how quickly the window opens/closes while peeking

const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

export function initPortraitReveal(): void {
  const panel = document.querySelector<HTMLElement>('[data-portrait-reveal]');
  const inkBtn = document.querySelector<HTMLButtonElement>('[data-frame="ink"]');
  const photoBtn = document.querySelector<HTMLButtonElement>('[data-frame="photo"]');
  const portrait = document.getElementById('hero-portrait');
  if (!panel || !inkBtn || !photoBtn || !portrait) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let mode: Mode = 'idle';
  let cx = 0; // window centre, px inside the panel
  let cy = 0;
  let tx = 0; // pointer target
  let ty = 0;
  let r = 0; // current window radius
  let peekTarget = 0;
  let from = 0;
  let to = 0;
  let start = 0;
  let duration = WIPE_MS;
  let settleUntil = 0;
  let raf = 0;

  /** Radius at which the diamond centred on (x, y) covers the whole panel. */
  const coverRadius = (x: number, y: number): number => {
    const w = panel.clientWidth;
    const h = panel.clientHeight;
    return Math.max(x + y, w - x + y, x + h - y, w - x + h - y) + FRAME + 24;
  };

  const toLocal = (clientX: number, clientY: number): [number, number] => {
    const box = panel.getBoundingClientRect();
    return [clamp(clientX - box.left, 0, box.width), clamp(clientY - box.top, 0, box.height)];
  };

  const paint = (): void => {
    panel.style.setProperty('--rx', `${cx.toFixed(1)}px`);
    panel.style.setProperty('--ry', `${cy.toFixed(1)}px`);
    panel.style.setProperty('--rr', `${r.toFixed(1)}px`);
    panel.style.setProperty('--rf', r > 0.5 ? `${(r + FRAME).toFixed(1)}px` : '0px');
  };

  const setMode = (next: Mode): void => {
    mode = next;
    panel.dataset.portraitReveal = next;
    panel.classList.toggle('is-open', next === 'open');
  };

  const announce = (open: boolean): void => {
    inkBtn.setAttribute('aria-pressed', String(!open));
    photoBtn.setAttribute('aria-pressed', String(open));
    portrait.setAttribute('aria-hidden', String(!open));
    if (open) document.dispatchEvent(new CustomEvent('trust:earn', { detail: 'portrait' }));
  };
  const isOpen = (): boolean => mode === 'open' || mode === 'opening';

  const loop = (now: number): void => {
    raf = 0;
    if (mode === 'peek') {
      cx += (tx - cx) * FOLLOW;
      cy += (ty - cy) * FOLLOW;
      r += (peekTarget - r) * GROW;
      if (peekTarget === 0 && r < 0.75) {
        r = 0;
        setMode('idle');
        paint();
        return;
      }
    } else if (mode === 'opening' || mode === 'closing') {
      const p = Math.min(1, (now - start) / duration);
      r = from + (to - from) * easeInOut(p);
      if (p >= 1) {
        if (mode === 'opening') {
          setMode('open');
        } else {
          r = 0;
          settleUntil = now + SETTLE_MS;
          setMode('idle');
        }
        paint();
        return;
      }
    } else {
      paint();
      return;
    }
    paint();
    raf = requestAnimationFrame(loop);
  };

  const run = (): void => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const toggle = (x: number, y: number): void => {
    const opening = !(mode === 'open' || mode === 'opening');
    announce(opening);

    if (reduceMotion.matches) {
      cx = x;
      cy = y;
      r = opening ? coverRadius(x, y) : 0;
      if (!opening) settleUntil = performance.now() + SETTLE_MS;
      setMode(opening ? 'open' : 'idle');
      paint();
      return;
    }

    if (opening) {
      // Reversing a close keeps its centre so the wipe runs straight back;
      // otherwise the wipe grows from where the click landed.
      if (mode !== 'closing') {
        cx = x;
        cy = y;
      }
      from = r;
      to = coverRadius(cx, cy);
      duration = WIPE_MS * clamp((to - from) / to, 0.25, 1);
      setMode('opening');
    } else {
      if (mode === 'open') r = coverRadius(cx, cy); // measured now, so a resize while open is fine
      from = r;
      to = 0;
      duration = WIPE_MS * clamp(from / coverRadius(cx, cy), 0.25, 1);
      setMode('closing');
    }
    start = performance.now();
    paint();
    run();
  };

  panel.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || reduceMotion.matches) return;
    [tx, ty] = toLocal(e.clientX, e.clientY);
    if (mode === 'idle' && performance.now() >= settleUntil) {
      cx = tx;
      cy = ty;
      peekTarget = PEEK_RADIUS;
      setMode('peek');
      run();
    } else if (mode === 'peek') {
      peekTarget = PEEK_RADIUS;
      run();
    }
  });

  panel.addEventListener('pointerleave', () => {
    if (mode === 'peek') {
      peekTarget = 0;
      run();
    }
  });

  panel.addEventListener('click', (e) => {
    const [x, y] = toLocal(e.clientX, e.clientY);
    toggle(x, y);
  });

  // The Ink / Photo selector. Enter and Space work natively on <button>;
  // the wipe starts from the button that was pressed.
  const fromButton = (btn: HTMLButtonElement): void => {
    const b = btn.getBoundingClientRect();
    const [x, y] = toLocal(b.left + b.width / 2, b.top + b.height / 2);
    toggle(x, y);
  };
  photoBtn.addEventListener('click', () => {
    if (!isOpen()) fromButton(photoBtn);
  });
  inkBtn.addEventListener('click', () => {
    if (isOpen()) fromButton(inkBtn);
  });

  // If the reduced-motion setting changes mid-peek, settle immediately.
  reduceMotion.addEventListener('change', () => {
    if (mode === 'peek') {
      r = 0;
      setMode('idle');
      paint();
    }
  });
}
