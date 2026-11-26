/**
 * dodge.exe: a Game Boy style runner in the site's four cyans (Runner.astro, in the footer and on the 404 page).
 * - DEMO: El runs and jumps by himself ("CLICK TO PLAY").
 * - Click or tap the screen to take over; then tap, click, Space or Up jumps (a short tap is a short hop).
 * - Hit a bug: GAME OVER. Click to retry and El poofs back in; leave it 6 s and it goes back to the demo.
 * Four bugs walk; after three dodges two fly too: the moth low (jump it), the fly just over El's head (run under it).
 * The best score is kept in localStorage. It only runs while on screen; reduced motion gets one still frame.
 */
import { BUGS, CAPE, CATERPILLAR_HEAD, CATERPILLAR_SEG, EL_HIT, EL_LEGS, EL_TOP, FONT, SNAIL_BODY, SNAIL_SHELL, WALKERS, type BugKind } from './dodge-sprites';

const W = 256, H = 96, GROUND = 80, EL_X = 30;
const GRAVITY = 620, JUMP_V = 222, CUT = 0.45; // a released jump keeps CUT of its rise
const SPEED = 92, MAX_SPEED = 165, RAMP = 2.2; // units per second; +RAMP every second you play
const RESPAWN = 0.7; // the poof, in seconds
const IDLE_TO_DEMO = 6; // seconds on GAME OVER before the demo comes back
const FLYERS_AFTER = 3; // dodges before the flyers join in
const BEST_KEY = 'dodge-best';

/* lightest, light, mid, darkest; the dark theme flips the ramp so the screen glows */
const LIGHT = ['#E2F0EE', '#9CCBD1', '#2F7F92', '#0F2E36'];
const DARK = ['#0F2328', '#1F4852', '#4FA4B9', '#D6EEF2'];

type State = 'demo' | 'play' | 'over';
type Bug = { kind: BugKind; x: number; passed: boolean };
type Ctx = CanvasRenderingContext2D;

const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const palette = (): string[] => (document.documentElement.dataset.theme === 'dark' ? DARK : LIGHT);

/* ---------- drawing helpers ---------- */

function sprite(c: Ctx, rows: string[], x: number, y: number, pal: Record<string, string>): void {
  for (let r = 0; r < rows.length; r++) {
    for (let q = 0; q < rows[r].length; q++) {
      const col = pal[rows[r][q]];
      if (!col) continue;
      c.fillStyle = col;
      c.fillRect(x + q, y + r, 1, 1);
    }
  }
}
const textW = (s: string, k = 1): number => s.length * 4 * k - k;
function text(c: Ctx, s: string, x: number, y: number, col: string, k = 1): void {
  c.fillStyle = col;
  for (let i = 0; i < s.length; i++) {
    const g = FONT[s[i]] ?? FONT[' '];
    for (let p = 0; p < 15; p++) if (g[p] === '1') c.fillRect(x + (i * 4 + (p % 3)) * k, y + Math.floor(p / 3) * k, k, k);
  }
}
const centre = (c: Ctx, s: string, y: number, col: string, k = 1): void => text(c, s, Math.round((W - textW(s, k)) / 2), y, col, k);

/** A bug's hit box, a pixel inside its drawing: [left, top, right, bottom] */
function bugBox(kind: BugKind, x: number): [number, number, number, number] {
  const b = BUGS[kind], bottom = GROUND - b.lift;
  return [x + 1, bottom - b.h + 1, x + b.w - 1, bottom];
}

function drawBug(c: Ctx, bug: Bug, t: number, P: string[]): void {
  const b = BUGS[bug.kind], map: Record<string, string> = { w: P[0], l: P[1], m: P[2], '#': P[3] };
  const x = Math.round(bug.x), bottom = GROUND - b.lift;
  if (bug.kind === 'caterpillar') {
    // the segments ripple, each a pixel out of step with its neighbour; tiny feet shuffle under them
    const f = Math.floor(t * 6);
    for (let i = 2; i >= 0; i--) {
      const sx = x + 8 + i * 8, up = (f + i) % 2;
      sprite(c, CATERPILLAR_SEG, sx, bottom - 9 - up, map);
      text(c, '404'[i], sx + 3, bottom - 7 - up, P[3]);
      c.fillStyle = P[3];
      c.fillRect(sx + 2 + up * 2, bottom - 1, 1, 1);
      c.fillRect(sx + 6 - up * 2, bottom - 1, 1, 1);
    }
    sprite(c, CATERPILLAR_HEAD, x, bottom - 10 - (f % 2), map);
    return;
  }
  if (bug.kind === 'snail') {
    sprite(c, SNAIL_BODY, x, bottom - b.h, map);
    const sx = x + 6, sy = bottom - b.h - 1;
    sprite(c, SNAIL_SHELL, sx, sy, map);
    // the shell is a loading spinner: a dotted ring with a dark head and a mid tail going round
    const head = Math.floor(t * 10) % 8;
    for (let k = 0; k < 8; k++) {
      const back = (head - k + 8) % 8;
      if (back >= 3 && k % 2) continue;
      const a = (k / 8) * Math.PI * 2;
      c.fillStyle = back === 0 ? P[3] : P[2];
      c.fillRect(Math.round(sx + 5 + Math.cos(a) * 3.2), Math.round(sy + 5 + Math.sin(a) * 3.2), 1, 1);
    }
    return;
  }
  const frames = b.frames ?? [];
  const fps = bug.kind === 'fly' ? 16 : bug.kind === 'moth' ? 7 : bug.kind === 'slime' ? 3 : 8;
  const bob = bug.kind === 'moth' ? Math.round(Math.sin(t * 5) * 1.5) : bug.kind === 'fly' ? Math.round(Math.sin(t * 9)) : 0;
  sprite(c, frames[Math.floor(t * fps) % frames.length], x, bottom - b.h + bob, map);
  if (b.label) text(c, b.label, x + 2, bottom - b.h + 5, P[0]);
}

/* ---------- the game ---------- */

export function initDodge(root: HTMLElement): void {
  const screen = root.querySelector<HTMLButtonElement>('[data-runner-screen]');
  const canvas = root.querySelector<HTMLCanvasElement>('[data-runner-canvas]');
  const scoreEl = root.querySelector<HTMLElement>('[data-runner-score]');
  const c = canvas?.getContext('2d');
  if (!screen || !canvas || !scoreEl || !c) return;
  c.imageSmoothingEnabled = false;

  let state: State = 'demo', stateT = 0, t = 0;
  let y = 0, vy = 0, leg = 0, legT = 0;
  let speed = SPEED, dist = 0, nextAt = 120, lastAt = -999;
  let score = 0, best = 0, newBest = false, retried = false, respawn = 0, flash = 0;
  let bugs: Bug[] = [];
  try { best = Number(localStorage.getItem(BEST_KEY)) || 0; } catch { /* storage blocked: best lasts the visit */ }

  const reset = (to: State): void => {
    state = to; stateT = 0; bugs = []; dist = 0; nextAt = to === 'demo' ? 120 : 150; lastAt = -999;
    score = 0; y = 0; vy = 0; speed = SPEED;
  };
  const jump = (): void => { if (y === 0) vy = -JUMP_V; };
  /** a fly about to pass overhead: the demo stays down */
  const flyNear = (): boolean => bugs.some((b) => b.kind === 'fly' && b.x - (EL_X + 10) < 80 && b.x + BUGS.fly.w > EL_X - 4);

  const press = (): void => {
    if (state === 'demo') {
      // take over: clear anything too close, count from zero
      state = 'play'; stateT = 0; score = 0; speed = SPEED; retried = false;
      bugs = bugs.filter((b) => b.x > EL_X + 90);
      nextAt = Math.max(nextAt, dist + 60);
    } else if (state === 'play') {
      jump();
    } else if (stateT > 0.6) {
      reset('play'); respawn = RESPAWN; retried = true;
    }
  };
  const release = (): void => { if (vy < 0) vy *= CUT; };

  const spawn = (): BugKind => {
    // walkers from the start; flyers once you've dodged a few (always in the demo), never crowding another bug
    const flyOk = (state === 'demo' || score >= FLYERS_AFTER) && dist - lastAt > 120;
    const r = Math.random();
    const kind: BugKind = flyOk && r < 0.16 ? 'fly' : flyOk && r < 0.32 ? 'moth' : WALKERS[Math.floor(Math.random() * WALKERS.length)];
    bugs.push({ kind, x: W + 8, passed: false });
    lastAt = dist;
    return kind;
  };

  const step = (dt: number): void => {
    t += dt; stateT += dt; flash = Math.max(0, flash - dt); respawn = Math.max(0, respawn - dt);
    if (state === 'over') { if (stateT > IDLE_TO_DEMO) reset('demo'); return; }
    if (state === 'play') speed = Math.min(MAX_SPEED, speed + RAMP * dt);
    const dx = speed * dt;
    dist += dx;
    if (respawn) nextAt = Math.max(nextAt, dist + 40);
    if (dist >= nextAt) {
      const k = spawn();
      nextAt = dist + 95 + Math.random() * 90 + (speed - SPEED) * 0.4 + (k === 'fly' ? 40 : 0);
    }
    for (const b of bugs) {
      b.x -= dx;
      if (!b.passed && b.x + BUGS[b.kind].w < EL_X + 2) { b.passed = true; score++; }
      if (state === 'demo' && y === 0 && b.kind !== 'fly' && !flyNear()) {
        const gap = b.x - (EL_X + 10);
        if (gap > 0 && gap < 12 + speed * 0.05) jump();
      }
    }
    bugs = bugs.filter((b) => b.x + BUGS[b.kind].w > -20);
    if (vy !== 0 || y < 0) {
      vy += GRAVITY * dt; y += vy * dt;
      if (y >= 0) { y = 0; vy = 0; }
    }
    legT += dt;
    if (y === 0 && legT > 0.1) { legT = 0; leg = 1 - leg; }
    if (state === 'play' && !respawn) {
      // El's body (not his hair spikes) against each bug's box
      const ex0 = EL_X + 3, ex1 = EL_X + 9, ey1 = GROUND + y, ey0 = ey1 - 16;
      for (const b of bugs) {
        const [bx0, by0, bx1, by1] = bugBox(b.kind, b.x);
        if (ex1 > bx0 && ex0 < bx1 && ey1 > by0 && ey0 < by1) {
          state = 'over'; stateT = 0; flash = 0.25;
          newBest = score > best;
          if (newBest) { best = score; try { localStorage.setItem(BEST_KEY, String(best)); } catch { /* fine */ } }
          break;
        }
      }
    }
  };

  /* ---------- drawing ---------- */

  const drawEl = (P: string[]): void => {
    const top = Math.round(GROUND + y - 18);
    c.fillStyle = P[2];
    const sw = y < -10 ? 6 : 10;
    c.fillRect(EL_X + 6 - sw / 2, GROUND + 1, sw, 1); // his shadow
    if (respawn) {
      // hidden inside the puff, then blinking back in
      const p = 1 - respawn / RESPAWN;
      if (p < 0.4 || Math.floor(t * 16) % 2) return;
    }
    const pal = { '#': P[3], o: P[0], x: P[0], h: P[2], b: P[1], c: P[2] };
    const fr = y < 0 ? 2 : state === 'over' ? 1 : leg;
    sprite(c, CAPE[fr], EL_X - 4, top + (fr === 2 ? 8 : 9), pal);
    sprite(c, state === 'over' ? EL_HIT : EL_TOP, EL_X, top, pal);
    sprite(c, EL_LEGS[fr], EL_X, top + 14, pal);
  };

  const drawPoof = (P: string[]): void => {
    // pixel clouds rolling out from where El stands, then sparks as he blinks back
    const p = 1 - respawn / RESPAWN, cx = EL_X + 6, cy = GROUND - 9;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3, d = 3 + p * 13, r = Math.max(0, Math.round(5 * (1 - p) + 1));
      const x = Math.round(cx + Math.cos(a) * d * 1.2), yy = Math.round(cy + Math.sin(a) * d * 0.8);
      c.fillStyle = P[3]; c.fillRect(x - r - 1, yy - r, 2 * r + 2, 2 * r); c.fillRect(x - r, yy - r - 1, 2 * r, 2 * r + 2);
      c.fillStyle = P[1]; c.fillRect(x - r, yy - r, 2 * r, 2 * r);
      c.fillStyle = P[0]; c.fillRect(x - r + 1, yy - r + 1, 1, 1);
    }
    if (p < 0.5) {
      const r = Math.round(7 * (1 - p * 2)) + 2;
      c.fillStyle = P[0]; c.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      c.fillStyle = P[1]; c.fillRect(cx - r + 1, cy - r + 1, 2 * r - 2, 2 * r - 2);
    }
    if (p > 0.55) {
      const s = Math.round((p - 0.55) * 30);
      c.fillStyle = P[3];
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) c.fillRect(cx + dx * (8 + s), cy + dy * (6 + s), 1, 1);
    }
    if (p < 0.7) text(c, 'POOF!', cx - 2, cy - 22 - Math.round(p * 6), P[3]);
  };

  const drawHud = (P: string[]): void => {
    const small = canvas.clientWidth < 600; // the 3x5 font needs doubling on phones
    const k = small ? 2 : 1, fg = P[3], blink = Math.floor(t * 2) % 2 === 0;
    const sc = String(score).padStart(3, '0'), hi = `HI ${String(best).padStart(3, '0')}`;
    text(c, hi, W - textW(hi, k) - 6, 5, fg, k);
    if (state === 'demo') {
      if (blink) text(c, 'DEMO', 6, 5, fg, k);
      centre(c, small ? 'TAP TO PLAY' : 'CLICK TO PLAY', 30, fg, 2);
      return;
    }
    text(c, sc, 6, 5, fg, k);
    if (state === 'play') {
      const from = retried ? RESPAWN : 0;
      if (respawn) return;
      if (stateT < from + 0.8) centre(c, 'GO!', 26, fg, 3);
      else if (stateT < from + 3) centre(c, small ? 'TAP TO JUMP' : 'TAP OR SPACE TO JUMP', 30, fg, k);
      return;
    }
    // game over: a framed box
    const bw = small ? 128 : 104, bh = small ? 48 : 36, bx = (W - bw) / 2, by = 16;
    c.fillStyle = P[0]; c.fillRect(bx, by, bw, bh);
    c.fillStyle = fg; c.fillRect(bx, by, bw, 2); c.fillRect(bx, by + bh - 2, bw, 2); c.fillRect(bx, by, 2, bh); c.fillRect(bx + bw - 2, by, 2, bh);
    centre(c, 'GAME OVER', by + 6, fg, 2);
    centre(c, newBest ? `NEW BEST! ${sc}` : `BUGS ${sc}`, by + 19, P[2], k);
    if (stateT > 0.6 && blink) centre(c, small ? 'TAP TO RETRY' : 'CLICK TO RETRY', by + (small ? 32 : 27), fg, k);
  };

  const draw = (): void => {
    const P = palette();
    c.fillStyle = P[0]; c.fillRect(0, 0, W, H);
    // far hills, then clouds, both slower than the ground
    c.fillStyle = P[1];
    const hill = (dist * 0.15) % 64;
    for (let x = -64; x < W + 64; x += 64) {
      const h0 = x - hill;
      c.beginPath(); c.moveTo(h0, GROUND); c.lineTo(h0 + 22, GROUND - 22); c.lineTo(h0 + 30, GROUND - 16); c.lineTo(h0 + 44, GROUND - 28); c.lineTo(h0 + 70, GROUND); c.fill();
    }
    const cloud = (dist * 0.08) % 160;
    for (let x = 20; x < W + 160; x += 160) {
      const cx = Math.round(x - cloud);
      c.fillRect(cx, 16, 18, 4); c.fillRect(cx + 4, 12, 8, 4); c.fillRect(cx + 50, 28, 14, 3); c.fillRect(cx + 53, 25, 6, 3);
    }
    // the ground and its specks
    c.fillStyle = P[3]; c.fillRect(0, GROUND, W, 2);
    c.fillStyle = P[2];
    const g = dist % 24;
    for (let x = -24; x < W + 24; x += 24) { c.fillRect(Math.round(x - g), GROUND + 5, 4, 1); c.fillRect(Math.round(x - g + 13), GROUND + 9, 2, 1); }
    for (const b of bugs) drawBug(c, b, t, P);
    drawEl(P);
    if (respawn) drawPoof(P);
    drawHud(P);
    if (flash > 0) { c.fillStyle = P[0]; c.globalAlpha = Math.min(1, flash * 3); c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    scoreEl.textContent = String(score).padStart(3, '0');
  };

  if (reduceMotion()) {
    // one still frame: El mid-jump over a slime
    bugs = [{ kind: 'slime', x: EL_X + 4, passed: false }];
    y = -26; score = 42; state = 'play'; stateT = 10; // just the score, no prompts: there's nothing to click
    root.classList.add('is-still');
    draw();
    new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return;
  }


  /* ---------- input ---------- */

  const isJumpKey = (e: KeyboardEvent): boolean => e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter';
  screen.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault(); // keep a tap from selecting or scrolling, and keep focus for Space
    screen.focus({ preventScroll: true, focusVisible: false } as FocusOptions); // focus for Space, without the keyboard ring
    press();
  });
  screen.addEventListener('pointerup', release);
  screen.addEventListener('pointercancel', release);
  screen.addEventListener('keydown', (e) => {
    if (!isJumpKey(e)) return;
    e.preventDefault();
    if (!e.repeat) press();
  });
  screen.addEventListener('keyup', (e) => { if (isJumpKey(e)) release(); });

  /* ---------- the loop: only while on screen and the tab is visible ---------- */

  let raf = 0, last = 0, visible = false;
  const frame = (now: number): void => {
    step(Math.min(0.05, (now - last) / 1000));
    last = now;
    draw();
    raf = requestAnimationFrame(frame);
  };
  const sync = (): void => {
    cancelAnimationFrame(raf);
    if (visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
  };
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.2 }).observe(root);
  } else {
    visible = true; sync();
  }
  draw();
}
