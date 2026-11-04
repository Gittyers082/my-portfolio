/**
 * Quiet sound effects, synthesized with Web Audio: the heading glitch's electric
 * "zzt", and the About desk's page flip, coffee splash, pencil scratch, and the Contact stamp
 * (no audio file to download).
 *
 * - Browsers only allow sound after the visitor has clicked, tapped or typed
 *   once, so nothing can play on page load; the audio engine wakes on that
 *   first gesture.
 * - The nav's sound button mutes it; the choice is remembered.
 * - Plays only on hover or tap, never on scroll (see site.ts).
 */

const KEY = 'sound';
const VOLUME = 0.05; // deliberately quiet

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let muted = false;

function engine(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  // a short buffer of white noise, reused for every crackle
  noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

/** One crackle: band-passed noise sweeping down, with a faint low buzz under it. */
export function zzt(): void {
  if (muted || !ctx || ctx.state !== 'running' || !noise) return;
  const t = ctx.currentTime;

  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.9 + Math.random() * 0.3;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 6;
  band.frequency.setValueAtTime(3200 + Math.random() * 800, t);
  band.frequency.exponentialRampToValueAtTime(700, t + 0.14);
  const crackle = ctx.createGain();
  // stuttering envelope: three quick bursts, like an arc catching
  crackle.gain.setValueAtTime(0, t);
  crackle.gain.linearRampToValueAtTime(VOLUME, t + 0.005);
  crackle.gain.linearRampToValueAtTime(VOLUME * 0.15, t + 0.035);
  crackle.gain.linearRampToValueAtTime(VOLUME * 0.8, t + 0.05);
  crackle.gain.linearRampToValueAtTime(VOLUME * 0.1, t + 0.09);
  crackle.gain.linearRampToValueAtTime(VOLUME * 0.5, t + 0.1);
  crackle.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  src.connect(band).connect(crackle).connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.17);

  const buzz = ctx.createOscillator();
  buzz.type = 'square';
  buzz.frequency.setValueAtTime(110, t);
  buzz.frequency.exponentialRampToValueAtTime(55, t + 0.12);
  const hum = ctx.createGain();
  hum.gain.setValueAtTime(0, t);
  hum.gain.linearRampToValueAtTime(VOLUME * 0.25, t + 0.01);
  hum.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  const soft = ctx.createBiquadFilter();
  soft.type = 'lowpass';
  soft.frequency.value = 900;
  buzz.connect(soft).connect(hum).connect(ctx.destination);
  buzz.start(t);
  buzz.stop(t + 0.13);
}

/** A soft paper page-turn: a swish of filtered noise rising, then a tiny settle. */
export function flip(): void {
  if (muted || !ctx || ctx.state !== 'running' || !noise) return;
  const t = ctx.currentTime;
  const v = VOLUME * 1.4;

  const swish = ctx.createBufferSource();
  swish.buffer = noise;
  swish.playbackRate.value = 0.55 + Math.random() * 0.15;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(900, t);
  band.frequency.exponentialRampToValueAtTime(3800, t + 0.22);
  const air = ctx.createGain();
  air.gain.setValueAtTime(0, t);
  air.gain.linearRampToValueAtTime(v * 0.5, t + 0.06);
  air.gain.linearRampToValueAtTime(v, t + 0.16);
  air.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  swish.connect(band).connect(air).connect(ctx.destination);
  swish.start(t);
  swish.stop(t + 0.31);

  // the page landing: a short, soft tap
  const tap = ctx.createBufferSource();
  tap.buffer = noise;
  const low = ctx.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = 700;
  const thud = ctx.createGain();
  const t2 = t + 0.3;
  thud.gain.setValueAtTime(0, t2);
  thud.gain.linearRampToValueAtTime(v * 0.9, t2 + 0.005);
  thud.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.07);
  tap.connect(low).connect(thud).connect(ctx.destination);
  tap.start(t2);
  tap.stop(t2 + 0.08);
}

/** A gust of wind: a long, rising rush of air, for the aura farmer. */
export function gust(): void {
  if (muted || !ctx || ctx.state !== 'running' || !noise) return;
  const t = ctx.currentTime;
  const v = VOLUME * 1.3;
  const rush = ctx.createBufferSource();
  rush.buffer = noise;
  rush.loop = true;
  rush.playbackRate.value = 0.4;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 0.7;
  band.frequency.setValueAtTime(400, t);
  band.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
  band.frequency.exponentialRampToValueAtTime(600, t + 0.8);
  const air = ctx.createGain();
  air.gain.setValueAtTime(0, t);
  air.gain.linearRampToValueAtTime(v, t + 0.25);
  air.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
  rush.connect(band).connect(air).connect(ctx.destination);
  rush.start(t);
  rush.stop(t + 0.9);
}

/** A short liquid splash: a low swoosh, then a few droplets. */
export function splash(): void {
  if (muted || !ctx || ctx.state !== 'running' || !noise) return;
  const t = ctx.currentTime;
  const v = VOLUME * 1.6;
  const wash = ctx.createBufferSource();
  wash.buffer = noise;
  wash.playbackRate.value = 0.5;
  const low = ctx.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.setValueAtTime(2400, t);
  low.frequency.exponentialRampToValueAtTime(320, t + 0.35);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
  wash.connect(low).connect(g).connect(ctx.destination);
  wash.start(t);
  wash.stop(t + 0.4);
  // droplets
  [0.16, 0.24, 0.33].forEach((d, i) => {
    const o = ctx!.createOscillator();
    o.type = 'sine';
    const f = 900 + i * 260 + Math.random() * 120;
    o.frequency.setValueAtTime(f, t + d);
    o.frequency.exponentialRampToValueAtTime(f * 1.8, t + d + 0.05);
    const dg = ctx!.createGain();
    dg.gain.setValueAtTime(0, t + d);
    dg.gain.linearRampToValueAtTime(v * 0.35, t + d + 0.004);
    dg.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.06);
    o.connect(dg).connect(ctx!.destination);
    o.start(t + d);
    o.stop(t + d + 0.07);
  });
}

/** Pencil on paper for `ms`: soft, high, scratchy noise that wavers. */
export function scribble(ms: number): void {
  if (muted || !ctx || ctx.state !== 'running' || !noise) return;
  const t = ctx.currentTime + 0.26;
  const dur = ms / 1000;
  const v = VOLUME * 0.7;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const high = ctx.createBiquadFilter();
  high.type = 'bandpass';
  high.frequency.value = 5200;
  high.Q.value = 1.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  // little strokes: the scratch rises and dips as the pencil moves
  const steps = Math.max(4, Math.round(dur / 0.09));
  for (let i = 0; i <= steps; i++) {
    const at = t + (dur * i) / steps;
    g.gain.linearRampToValueAtTime(i % 2 ? v * 0.35 : v, at);
  }
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05);
  src.connect(high).connect(g).connect(ctx.destination);
  src.start(t);
  src.stop(t + dur + 0.08);
}

/** A rubber stamp landing: a low, short thud. */
export function stamp(): void {
  if (muted || !ctx || ctx.state !== 'running' || !noise) return;
  const t = ctx.currentTime;
  const v = VOLUME * 2;
  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(140, t);
  body.frequency.exponentialRampToValueAtTime(55, t + 0.16);
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0, t);
  bg.gain.linearRampToValueAtTime(v, t + 0.006);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  body.connect(bg).connect(ctx.destination);
  body.start(t);
  body.stop(t + 0.21);
  const hit = ctx.createBufferSource();
  hit.buffer = noise;
  const low = ctx.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = 1200;
  const hg = ctx.createGain();
  hg.gain.setValueAtTime(0, t);
  hg.gain.linearRampToValueAtTime(v * 0.6, t + 0.004);
  hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  hit.connect(low).connect(hg).connect(ctx.destination);
  hit.start(t);
  hit.stop(t + 0.09);
}

export function initSound(): void {
  try {
    muted = localStorage.getItem(KEY) === 'off';
  } catch {
    /* storage unavailable: default on */
  }
  const btn = document.querySelector<HTMLButtonElement>('[data-sound]');
  const label = btn?.querySelector<HTMLElement>('.sound-toggle__label');
  const render = (): void => {
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(!muted));
    btn.classList.toggle('is-muted', muted);
    if (label) label.textContent = muted ? 'Sound off' : 'Sound on';
  };

  // wake the audio engine on the first real gesture anywhere on the page
  const wake = (): void => {
    const c = engine();
    if (c && c.state !== 'running') void c.resume();
  };
  window.addEventListener('pointerdown', wake, { once: true, capture: true });
  window.addEventListener('keydown', wake, { once: true, capture: true });

  btn?.addEventListener('click', () => {
    muted = !muted;
    try {
      localStorage.setItem(KEY, muted ? 'off' : 'on');
    } catch {
      /* ignore */
    }
    render();
    if (!muted) {
      wake();
      window.setTimeout(zzt, 40); // a sample, so you hear what you turned on
    }
  });
  render();
}
