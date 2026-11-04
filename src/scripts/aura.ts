/**
 * The aura farmer on the rock (Tagline section):
 * - the cape's SMIL animation only runs while the section is on screen;
 * - comments pop up out of nowhere around him, like a live chat reacting,
 *   in a few spots that never cover the headline or arete;
 * - pressing him sends a gust: the cape snaps, "+100 aura" floats up, a whoosh plays.
 * Reduced motion: the cape stays still and one comment just sits there.
 */
import { gust } from "./sfx";

const COMMENTS: [string, string][] = [
  ["@visitor", "Yes El, we see the fit (¬_¬)"],
  ["@aura_check", "+1000 aura"],
  ["@just_scrolling", "Bro has been standing there all day"],
  ["@the_wind", "I only blow for him (•_•)"],
  ["@recruiter", "Ok but is he open to internships"],
];
const SLOTS = 3; // .farmer__comment--0..2 in global.css
const LIFE = 3600;

export function initAura(): void {
  const farmer = document.querySelector<HTMLElement>("[data-aura]");
  const svg = farmer?.querySelector<SVGSVGElement>("[data-aura-svg]");
  const layer = farmer?.querySelector<HTMLElement>("[data-aura-comments]");
  const btn = farmer?.querySelector<HTMLButtonElement>("[data-aura-btn]");
  if (!farmer || !svg || !layer || !btn) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const make = (n: number, slot: number): HTMLElement => {
    const [who, text] = COMMENTS[n % COMMENTS.length];
    const el = document.createElement("span");
    el.className = `farmer__comment farmer__comment--${slot}`;
    el.style.setProperty("--tilt", `${(Math.random() * 6 - 3).toFixed(1)}deg`);
    const name = document.createElement("span");
    name.className = "farmer__who";
    name.textContent = who;
    el.append(name, document.createTextNode(text));
    return el;
  };

  if (reduce) {
    svg.pauseAnimations();
    layer.appendChild(make(0, 0)).classList.add("is-still");
  }

  let n = 0;
  let lastSlot = -1;
  let timer = 0;
  const busy = new Set<number>();
  const pop = (): void => {
    const free = [...Array(SLOTS).keys()].filter(
      (s) => !busy.has(s) && s !== lastSlot,
    );
    if (!free.length) return;
    const slot = free[Math.floor(Math.random() * free.length)];
    lastSlot = slot;
    busy.add(slot);
    const el = layer.appendChild(make(n, slot));
    n += 1;
    window.setTimeout(() => {
      el.remove();
      busy.delete(slot);
    }, LIFE);
  };
  const start = (): void => {
    if (reduce) return;
    svg.unpauseAnimations();
    window.clearInterval(timer);
    window.setTimeout(pop, n === 0 ? 900 : 200);
    timer = window.setInterval(pop, 2300);
  };
  const stop = (): void => {
    if (!reduce) svg.pauseAnimations();
    window.clearInterval(timer);
  };

  const section = farmer.closest<HTMLElement>("[data-wind]") ?? farmer;
  if ("IntersectionObserver" in window) {
    stop();
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      threshold: 0.25,
    }).observe(section);
  } else {
    start();
  }

  // typing "arete" anywhere (keys.ts) powers him up: aura, wild cape, a burst of leaves
  let powerTimer = 0;
  document.addEventListener("aura:power", () => {
    farmer.classList.remove("is-powered");
    void farmer.offsetWidth;
    farmer.classList.add("is-powered");
    gust();
    window.clearTimeout(powerTimer);
    powerTimer = window.setTimeout(() => farmer.classList.remove("is-powered"), 4200);
    // the special comment takes the top spot
    layer.querySelectorAll(".farmer__comment--0").forEach((c) => c.remove());
    busy.add(0);
    const el = layer.appendChild(make(0, 0));
    el.lastChild!.textContent = "OK, he's actually farming aura now.";
    (el.firstChild as HTMLElement).textContent = "@the_internet";
    if (reduce) el.classList.add("is-still");
    window.setTimeout(() => {
      el.remove();
      busy.delete(0);
    }, reduce ? 4200 : LIFE);
    if (!reduce) burst(section);
  });

  let gustTimer = 0;
  btn.addEventListener("click", () => {
    farmer.classList.remove("is-gusting");
    void farmer.offsetWidth;
    farmer.classList.add("is-gusting");
    gust();
    window.clearTimeout(gustTimer);
    gustTimer = window.setTimeout(
      () => farmer.classList.remove("is-gusting"),
      1200,
    );
  });
}

/** A burst of the Tagline's logo leaves, blown fast across the section. */
function burst(section: HTMLElement): void {
  const wind = section.querySelector<HTMLElement>(".wind");
  const icons = Array.from(section.querySelectorAll<HTMLElement>(".leaf .tech-icon"));
  if (!wind || !icons.length) return;
  for (let i = 0; i < 16; i += 1) {
    const leaf = document.createElement("span");
    leaf.className = "leaf-burst";
    leaf.style.setProperty("--top", `${Math.round(5 + Math.random() * 85)}%`);
    leaf.style.setProperty("--delay", `${Math.round(Math.random() * 500)}ms`);
    leaf.style.setProperty("--spin", `${Math.round((Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 360))}deg`);
    leaf.style.setProperty("--size", `${Math.round(22 + Math.random() * 22)}px`);
    leaf.appendChild(icons[i % icons.length].cloneNode(true));
    wind.appendChild(leaf);
    window.setTimeout(() => leaf.remove(), 2400);
  }
}
