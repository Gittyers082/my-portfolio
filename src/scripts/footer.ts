/**
 * Footer life:
 * - the big name fills with ink when it scrolls in; hovering (or tapping) it
 *   lifts the letters one after another;
 * - the mini screen: Steven runs and auto-jumps over errors, and jumps when you
 *   click; it only runs while it's on screen.
 * Reduced motion: the name is simply filled, and the screen shows one still frame.
 */
const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVGNS = 'http://www.w3.org/2000/svg';

function initName(): void {
  const name = document.querySelector<HTMLElement>('[data-footer-name]');
  if (!name) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) { name.classList.add('is-inked'); return; }
  name.classList.add('is-outline');
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    name.classList.add('is-inked');
  }, { threshold: 0.5 });
  io.observe(name);

  const count = name.querySelectorAll('.fl').length;
  let busy = false;
  const wave = (): void => {
    if (busy) return;
    busy = true;
    name.classList.add('is-waving');
    window.setTimeout(() => { name.classList.remove('is-waving'); busy = false; }, count * 35 + 650);
  };
  name.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') wave(); });
  name.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') wave(); });
}

type Obstacle = { x: number; w: number; g: SVGGElement; passed: boolean };
const LABELS = ['ERR', '404', 'NaN', 'null', '}', 'TODO', '!']; // short, so every one can be cleared in a single jump

function makeObstacle(label: string): { g: SVGGElement; w: number } {
  const g = document.createElementNS(SVGNS, 'g');
  if (label === '!') {
    // a warning triangle
    const w = 26;
    g.innerHTML = `<path d="M13 0 L26 24 L0 24 Z" fill="var(--paper)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M13 8 V15" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="13" cy="19.5" r="1.6" fill="currentColor"/>`;
    return { g, w };
  }
  const w = Math.max(26, label.length * 8 + 14);
  g.innerHTML = `<rect x="0" y="0" width="${w}" height="24" rx="3" fill="var(--paper)" stroke="currentColor" stroke-width="2.5"/><text x="${w / 2}" y="16.5" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800" font-size="11" fill="currentColor">${label}</text>`;
  return { g, w };
}

function initRunner(): void {
  const root = document.querySelector<HTMLElement>('[data-runner]');
  const screen = root?.querySelector<HTMLButtonElement>('[data-runner-screen]');
  const layer = root?.querySelector<SVGGElement>('[data-runner-obstacles]');
  const guy = root?.querySelector<SVGGElement>('[data-runner-guy]');
  const ground = root?.querySelector<SVGGElement>('[data-runner-ground]');
  const clouds = root?.querySelector<SVGGElement>('[data-runner-clouds]');
  const scoreEl = root?.querySelector<HTMLElement>('[data-runner-score]');
  if (!root || !screen || !layer || !guy || !ground || !clouds || !scoreEl) return;

  const GUY_X = 52, GUY_W = 42, GROUND_Y = 128, OB_H = 24;
  const SPEED = 170; // svg units per second
  const GRAVITY = 1000, JUMP_V = 360; // airborne (over 24 units) for ~0.58 s
  let y = 0, vy = 0;
  let score = 0, spawnIn = 0.6, groundX = 0, cloudX = 0, legT = 0, legA = true;
  let obstacles: Obstacle[] = [];
  let running = false, last = 0, raf = 0;

  const setScore = (): void => { scoreEl.textContent = String(score).padStart(3, '0'); };
  const jump = (): void => { if (y === 0) vy = -JUMP_V; };

  if (reduceMotion()) {
    // one still frame: mid-jump over an error
    const { g } = makeObstacle('ERR');
    g.setAttribute('transform', `translate(${GUY_X + 6} ${GROUND_Y - OB_H})`);
    layer.appendChild(g);
    guy.setAttribute('transform', 'translate(0 -40)');
    score = 42; setScore();
    root.classList.add('is-still');
    return;
  }

  const spawn = (): void => {
    const label = LABELS[Math.floor(Math.random() * LABELS.length)];
    const { g, w } = makeObstacle(label);
    layer.appendChild(g);
    obstacles.push({ x: 410, w, g, passed: false });
  };

  const frame = (now: number): void => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // spawn
    spawnIn -= dt;
    if (spawnIn <= 0) { spawn(); spawnIn = 1.1 + Math.random() * 1.2; }

    // move obstacles, score, auto-jump
    for (const o of obstacles) {
      o.x -= SPEED * dt;
      o.g.setAttribute('transform', `translate(${o.x.toFixed(1)} ${GROUND_Y - OB_H})`);
      if (!o.passed && o.x + o.w < GUY_X) { o.passed = true; score += 1; setScore(); }
      const gap = o.x - (GUY_X + GUY_W);
      // jump when the error is ~20 units away: high enough before it arrives, still up as it leaves
      if (y === 0 && gap > 0 && gap < 20) jump();
    }
    obstacles = obstacles.filter((o) => {
      if (o.x + o.w < -10) { o.g.remove(); return false; }
      return true;
    });

    // physics
    if (vy !== 0 || y < 0) {
      vy += GRAVITY * dt;
      y += vy * dt;
      if (y >= 0) { y = 0; vy = 0; }
    }
    guy.setAttribute('transform', `translate(0 ${y.toFixed(1)})`);

    // legs: alternate while running, tucked while airborne
    legT += dt;
    if (y < 0) { root.classList.add('is-air'); }
    else {
      root.classList.remove('is-air');
      if (legT > 0.11) { legT = 0; legA = !legA; root.classList.toggle('is-step', legA); }
    }

    // scenery
    groundX = (groundX - SPEED * dt) % 60;
    ground.setAttribute('transform', `translate(${groundX.toFixed(1)} 0)`);
    cloudX = (cloudX - SPEED * 0.15 * dt) % 400;
    clouds.setAttribute('transform', `translate(${cloudX.toFixed(1)} 0)`);

    raf = requestAnimationFrame(frame);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = (): void => { running = false; cancelAnimationFrame(raf); };

  screen.addEventListener('click', () => { start(); jump(); });

  let visible = false;
  const sync = (): void => { if (visible && !document.hidden) start(); else stop(); };
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.2 }).observe(root);
  } else {
    visible = true; sync();
  }
}

export function initFooter(): void {
  initName();
  initRunner();
}
