/**
 * Certifications: the trophy wall in the Character file (CertWall.astro).
 *
 * To add one:
 *  1. Put a picture of the certificate in src/assets/certs/ (PNG, JPG or WebP, any size:
 *     Astro resizes and converts it at build time). From a PDF, export or screenshot page one.
 *  2. If you have the PDF, put it in public/certs/ so "View certificate" can open it.
 *  3. Add a line at the END of the list below (oldest first). The wall shows the newest first,
 *     marks it NEW, numbers every cert, and updates the "earned" count on its own.
 *
 * `link` is where the ↗ goes: the issuer's verification or share page if there is one,
 * otherwise the PDF you put in public/certs/.
 */
import type { ImageMetadata } from 'astro';
import claude101 from '../assets/certs/claude-101.png';
import claudeCode101 from '../assets/certs/claude-code-101.png';
import claudePlatform101 from '../assets/certs/claude-platform-101.png';
import introToClaudeCowork from '../assets/certs/intro-to-claude-cowork.png';
import claudeCodeInAction from '../assets/certs/claude-code-in-action.png';

export type Cert = {
  /** used in the link straight to it: /#cert-<slug> */
  slug: string;
  title: string;
  issuer: string;
  /** as shown, e.g. "Nov 2026" */
  date: string;
  image: ImageMetadata;
  link: string;
};

export const certs: Cert[] = [
  { slug: 'claude-101', title: 'Claude 101', issuer: 'Anthropic Academy', date: 'Nov 2026', image: claude101, link: '/certs/claude-101.pdf' },
  { slug: 'claude-code-101', title: 'Claude Code 101', issuer: 'Anthropic Academy', date: 'Nov 2026', image: claudeCode101, link: '/certs/claude-code-101.pdf' },
  { slug: 'claude-platform-101', title: 'Claude Platform 101', issuer: 'Anthropic Academy', date: 'Nov 2026', image: claudePlatform101, link: '/certs/claude-platform-101.pdf' },
  { slug: 'intro-to-claude-cowork', title: 'Introduction to Claude Cowork', issuer: 'Anthropic Academy', date: 'Nov 2026', image: introToClaudeCowork, link: '/certs/intro-to-claude-cowork.pdf' },
  { slug: 'claude-code-in-action', title: 'Claude Code in Action', issuer: 'Anthropic Academy', date: 'Nov 2026', image: claudeCodeInAction, link: '/certs/claude-code-in-action.pdf' },
];
