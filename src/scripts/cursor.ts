/**
 * Click burst: a small ring of cyan action lines where the mouse clicks, like a
 * comic impact. The cursor itself is pure CSS (--cursor in global.css).
 * Mouse only; nothing for touch, pens or reduced motion.
 */
const NS = 'http://www.w3.org/2000/svg';

function makeBurst(x: number, y: number): void {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'burst');
  svg.setAttribute('viewBox', '-22 -22 44 44');
  svg.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', (Math.cos(a) * 8).toFixed(2));
    line.setAttribute('y1', (Math.sin(a) * 8).toFixed(2));
    line.setAttribute('x2', (Math.cos(a) * 20).toFixed(2));
    line.setAttribute('y2', (Math.sin(a) * 20).toFixed(2));
    svg.appendChild(line);
  }
  svg.style.left = `${x}px`;
  svg.style.top = `${y}px`;
  document.body.appendChild(svg);
  window.setTimeout(() => svg.remove(), 480);
}

export function initCursor(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    makeBurst(e.clientX, e.clientY);
  }, { passive: true });
}
