/**
 * The climb (Climb.astro): El walks the trail as you scroll.
 * Each stop on the trail belongs to a section; between two sections, El's
 * place on the trail is interpolated from where the reading line (35% down the
 * screen) sits between their tops. So he reaches the summit exactly when
 * Projects comes into reading position, whatever height the open chapters are.
 * Hidden over the hero and the footer, like the Explored meter.
 */
export function initClimb(): void {
  const climb = document.querySelector<HTMLElement>('[data-climb]');
  const trail = climb?.querySelector<SVGPathElement>('[data-climb-trail]');
  const walked = climb?.querySelector<SVGPathElement>('[data-climb-walked]');
  const el = climb?.querySelector<SVGGElement>('[data-climb-el]');
  const now = climb?.querySelector<HTMLElement>('[data-climb-now]');
  if (!climb || !trail || !walked || !el || !now) return;

  const links = Array.from(climb.querySelectorAll<HTMLAnchorElement>('[data-climb-stop]'));
  const dots = Array.from(climb.querySelectorAll<SVGCircleElement>('[data-climb-dot]'));
  const stops = links
    .map((a) => ({ a, at: Number(a.dataset.climbStop), label: a.dataset.label ?? '', target: document.getElementById(a.hash.slice(1)) }))
    .filter((s): s is typeof s & { target: HTMLElement } => s.target !== null);
  if (stops.length < 2) return;

  // place the stops and their links on the trail
  const len = trail.getTotalLength();
  const at = (f: number): DOMPoint => trail.getPointAtLength(Math.max(0, Math.min(1, f)) * len);
  dots.forEach((d) => { const p = at(Number(d.dataset.climbDot)); d.setAttribute('cx', String(p.x)); d.setAttribute('cy', String(p.y)); });
  links.forEach((a) => {
    const p = at(Number(a.dataset.climbStop));
    a.style.left = `${(p.x / 240) * 100}%`;
    a.style.top = `${((p.y + 14) / 132) * 100}%`;
  });
  walked.style.strokeDasharray = `0 ${len}`;
  climb.hidden = false;

  let last = -1;
  let dir = 1;
  const progress = (): number => {
    const line = window.innerHeight * 0.35;
    const tops = stops.map((s) => s.target.getBoundingClientRect().top);
    if (line <= tops[0]) return 0;
    for (let i = 0; i < stops.length - 1; i += 1) {
      if (line < tops[i + 1]) {
        const span = Math.max(1, tops[i + 1] - tops[i]);
        return stops[i].at + (stops[i + 1].at - stops[i].at) * ((line - tops[i]) / span);
      }
    }
    return 1;
  };
  const render = (): void => {
    const f = Math.max(0, Math.min(1, progress()));
    if (last >= 0 && Math.abs(f - last) > 0.0005) dir = f > last ? 1 : -1;
    last = f;
    const p = at(f);
    el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${dir * 1.4} 1.4)`);
    walked.style.strokeDasharray = `${(f * len).toFixed(1)} ${len}`;
    let current = stops[0];
    for (const s of stops) if (s.at <= f + 0.012) current = s;
    stops.forEach((s) => {
      s.a.classList.toggle('is-reached', s.at <= f + 0.012);
      if (s === current) s.a.setAttribute('aria-current', 'location'); else s.a.removeAttribute('aria-current');
    });
    dots.forEach((d) => d.classList.toggle('is-reached', Number(d.dataset.climbDot) <= f + 0.012));
    now.textContent = current.label;
    climb.classList.toggle('is-summit', Math.abs(f - 0.5) < 0.03);
  };

  let ticking = false;
  let idle = 0;
  const onScroll = (): void => {
    climb.classList.add('is-moving');
    window.clearTimeout(idle);
    idle = window.setTimeout(() => climb.classList.remove('is-moving'), 1400);
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(render));
  render();

  // the tab slides the map off the edge and back; the choice is remembered
  const tab = climb.querySelector<HTMLButtonElement>('[data-climb-tab]');
  const card = climb.querySelector<HTMLElement>('[data-climb-card]');
  const KEY = 'climb-collapsed';
  const setCollapsed = (collapsed: boolean, save = true): void => {
    climb.classList.toggle('is-collapsed', collapsed);
    if (card) card.inert = collapsed;
    tab?.setAttribute('aria-expanded', String(!collapsed));
    tab?.setAttribute('aria-label', collapsed ? 'Show the trail map' : 'Hide the trail map');
    if (save) { try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch { /* fine */ } }
  };
  let startCollapsed = false;
  try { startCollapsed = localStorage.getItem(KEY) === '1'; } catch { /* fine */ }
  setCollapsed(startCollapsed, false);
  tab?.addEventListener('click', () => setCollapsed(!climb.classList.contains('is-collapsed')));

  // 100% explored: El plants a second flag at the end of the trail
  const complete = (animate: boolean): void => {
    if (climb.classList.contains('is-complete')) return;
    climb.classList.add('is-complete');
    if (!animate) return;
    climb.classList.add('is-planting');
    window.setTimeout(() => climb.classList.remove('is-planting'), 700);
  };
  if (document.querySelector('[data-trust-value]')?.textContent?.trim() === '100%') complete(false);
  document.addEventListener('explore:complete', () => complete(true));

  // shown only between the hero and the footer
  const hero = document.querySelector<HTMLElement>('.hero');
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  if (hero && 'IntersectionObserver' in window) {
    let heroIn = true;
    let footerIn = false;
    const sync = (): void => { climb.classList.toggle('is-shown', !heroIn && !footerIn); };
    new IntersectionObserver(([e]) => { heroIn = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(hero);
    if (footer) new IntersectionObserver(([e]) => { footerIn = e.isIntersecting; sync(); }, { threshold: 0.05 }).observe(footer);
  } else {
    climb.classList.add('is-shown');
  }
}
