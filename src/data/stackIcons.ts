/**
 * Hand-drawn line icons for the Stack areas (original, not brand logos): the inside of a
 * 32×32 SVG drawn with a 2.6px square-capped stroke. Shared by StackIcon.astro and /stack.json.
 */
import type { StackId } from './profile';

export const STACK_ICONS: Record<StackId, string> = {
  languages: '<path d="M10 9 L4 16 L10 23"/><path d="M22 9 L28 16 L22 23"/><path d="M18.5 6 L13.5 26"/>',
  web: '<rect x="3" y="6" width="26" height="20"/><path d="M3 11.5 H29"/><path d="M8 17 H17"/><path d="M8 21.5 H22"/>',
  tools: '<circle cx="9" cy="7" r="3"/><circle cx="9" cy="25" r="3"/><circle cx="23" cy="11" r="3"/><path d="M9 10 V22"/><path d="M23 14 C23 20 15 18.5 11 22.5"/>',
  backend: '<rect x="4" y="5" width="24" height="9"/><rect x="4" y="18" width="24" height="9"/><path d="M8.5 9.5 H10"/><path d="M8.5 22.5 H10"/><path d="M15 9.5 H23"/><path d="M15 22.5 H23"/>',
  data: '<ellipse cx="16" cy="7" rx="11" ry="3.5"/><path d="M5 7 V25 C5 27 10 28.5 16 28.5 C22 28.5 27 27 27 25 V7"/><path d="M5 16 C5 18 10 19.5 16 19.5 C22 19.5 27 18 27 16"/>',
  design: '<path d="M16 3 L25 14 L16 29 L7 14 Z"/><path d="M16 29 V17"/><circle cx="16" cy="14.5" r="2.4"/>',
  ai: '<circle cx="16" cy="16" r="3.2"/><circle cx="6" cy="7" r="2.6"/><circle cx="26" cy="7" r="2.6"/><circle cx="6" cy="25" r="2.6"/><circle cx="26" cy="25" r="2.6"/><path d="M8 9 L13.6 13.8"/><path d="M24 9 L18.4 13.8"/><path d="M8 23 L13.6 18.2"/><path d="M24 23 L18.4 18.2"/>',
};
