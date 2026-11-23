/**
 * /stack.json: the Stack section as data, with every logo and area icon inlined.
 * The GitHub profile (malemanape/malemanape) reads this on each refresh, so the stack
 * is written once, in src/data/profile.ts, and both places stay in step.
 */
import type { APIRoute } from 'astro';
import { stack } from '../data/profile';
import { STACK_ICONS } from '../data/stackIcons';
import { techIcon, techNames } from '../data/techIcons';

export const GET: APIRoute = () => {
  const body = {
    areas: stack.map((a) => ({ ...a, icon: STACK_ICONS[a.id] })),
    // every logo by name, the stack's and GitHub's language names alike
    logos: Object.fromEntries(techNames.map((n) => [n, techIcon(n)])),
  };
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
};
