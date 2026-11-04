/**
 * Everything personal lives here. Swap the [bracketed] placeholders for the
 * real thing; the components read from this file.
 */

export const profile = {
  name: 'El. Steven D. Cruz',
  title: 'Student full-stack developer',
  intro: 'I build web apps and I’m exploring AI engineering.',
  school: 'Saint Louis University',
  year: '3rd-year IT student',
  email: 'dcruzsteven1@gmail.com',
  github: 'Gittyers082', // also drives the GitHub activity section (pulled at build time)
  linkedin: 'https://www.linkedin.com/in/el-steven/',
  fiverr: 'https://www.fiverr.com/ryuniii', // public seller profile (not the dashboard, which needs a login)
  resume: '/resume.pdf', // TODO: put your résumé at public/resume.pdf
  site: 'https://example.com', // TODO: your deployed URL (used for canonical + social tags)
} as const;

/**
 * Hero portrait (the second frame of the character intro).
 * Put your photo at public/portrait/steven.jpg (.webp, .avif or .png also work),
 * and optionally a night version at public/portrait/steven-dark.webp for dark mode:
 * head and shoulders, at least 1200px tall. Until that file exists the public
 * site ships without the reveal; `npm run dev` shows a labelled placeholder.
 */
export const portrait = {
  basename: 'steven',
  alt: 'Portrait of El. Steven D. Cruz',
  /** Where your face sits in the photo (CSS object-position). Adjust if the crop cuts your face. */
  focus: '48% 24%',
};

export const githubUrl = `https://github.com/${profile.github}`;
export const isPlaceholder = (value: string): boolean => /^\[.*\]$/.test(value);

/* ---------- Character card: the quick version, right after the hero ---------- */
/* The character card. Each fact flips over (click it) to a back side with a
 * detail and, optionally, a jump to where that part of the story lives.
 * `back` can use {cleared} and {active}: the quest board counts. */
/** A back-side link: either a Character file chapter to open (chapter, optional target/open), or a plain href. */
export type FactJump = { label: string; chapter?: 'stack' | 'training' | 'writing' | 'projects'; target?: string; open?: string; href?: string };
export type Fact = {
  label: string; value: string; note: string;
  back: string; jump?: FactJump;
  highlight?: boolean; placeholder?: boolean;
};
export const facts: Fact[] = [
  // Order matters: on wide screens the grid is 3 × 2, so the 5th fact (Next arc) sits bottom middle.
  {
    label: 'Class', value: '3rd-year IT', note: 'BS Information Technology, Saint Louis University',
    back: '{cleared} major courses cleared, {active} still in training this semester.',
    jump: { label: 'Open my training', chapter: 'training', target: '#train-academy', open: '.course' },
  },
  {
    label: 'First language', value: 'Java', note: 'Still the one I’m strongest in',
    back: 'Java came first. Since then: SQL, JavaScript, TypeScript, Python, Kotlin, Elixir and Rust, plus a little C, C#, Go and PHP.',
    jump: { label: 'See all my languages', chapter: 'stack' },
  },
  {
    label: 'Main quest', value: 'Full-stack', note: 'Web apps, front to back',
    back: 'Astro, React and Next.js up front. Node, Spring Boot and FastAPI behind.',
    jump: { label: 'See my stack', chapter: 'stack' },
  },
  {
    label: 'Side quest', value: 'Lore writing', note: 'Worldbuilding and power systems, on Fiverr',
    back: 'Lore, OCs and power systems for clients, and my own universe: the Otherverse.',
    jump: { label: 'Read the lore', chapter: 'writing' },
  },
  {
    label: 'Next arc', value: 'AI engineering', note: 'Just starting out, learning it properly', highlight: true,
    back: 'Studying the core concepts first. A RAG app is my next build.',
    jump: { label: 'See self-training', chapter: 'training', target: '#train-self' },
  },
  {
    label: 'Fun fact', value: 'Ex tech boomer', note: 'Before college, tech and I were not friends',
    back: 'Before college I was a complete boomer with tech. Now I build web apps from front to back.',
  },
];

/** The secret 7th card: appears only once a visitor has explored 100% of the site. Swap in your own (a blooper works too). */
export const secretFact: Fact = {
  label: 'Secret card', value: '100% explorer', note: 'You found everything. Most visitors never see this one.',
  back: 'Since you made it all the way here, my inbox is open: an internship, a project, or just to say you found the secret card.',
  jump: { label: 'Say hi', href: '#contact' },
};

/* ---------- Character file → Stack: four areas, each with its own icon ---------- */
/** Power levels: placeholders, set your own (0–10). */
export type Skill = { name: string; level: number; note: string; placeholderNote?: boolean };
export type StackId = 'languages' | 'web' | 'backend' | 'data' | 'tools' | 'design' | 'ai';
export type StackArea = {
  id: StackId;
  title: string;
  line: string;
  skills?: Skill[];                          // bars, for the ones worth a level
  items?: { text: string; placeholder?: boolean }[];
  groups?: { label: string; items: string[]; iconsOnly?: boolean }[]; // labelled rows, e.g. "Hosting: Vercel · AWS"; iconsOnly shows just the logos
};
export const stack: StackArea[] = [
  {
    id: 'languages', title: 'Languages', line: 'What I write in',
    skills: [
      { name: 'Java', level: 8, note: 'First language I learned, still my strongest' },
      { name: 'SQL', level: 8, note: 'Schemas, joins and queries that stay fast' },
      { name: 'Python', level: 6, note: 'Scripts and APIs now, AI work next' },
      { name: 'JavaScript', level: 7, note: 'The web’s first language, front to back' },
      { name: 'TypeScript', level: 6, note: 'JavaScript with types, on every web project' },
      { name: 'Kotlin', level: 5, note: 'Java’s cleaner sibling' },
      { name: 'Elixir', level: 5, note: 'Functional, with Phoenix on the web' },
      { name: 'Rust', level: 4, note: 'Still climbing the borrow checker' },
    ],
    groups: [{ label: 'Others', items: ['C', 'C++', 'C#', 'Go', 'Ruby', 'Dart', 'PHP', 'Bash'], iconsOnly: true }],
  },
  {
    id: 'web', title: 'Frontend', line: 'What runs in the browser',
    items: [
      { text: 'Astro' }, { text: 'React' }, { text: 'Next.js' }, { text: 'HTML' }, { text: 'CSS' },
      { text: 'Tailwind' }, { text: 'Bootstrap' },
    ],
  },
  {
    id: 'backend', title: 'Backend', line: 'What runs behind it',
    items: [
      { text: 'Node.js' }, { text: 'Express' }, { text: 'Spring Boot' }, { text: 'FastAPI' }, { text: 'Phoenix' },
    ],
  },
  {
    id: 'data', title: 'Data', line: 'Where it all lives',
    items: [{ text: 'MySQL' }, { text: 'PostgreSQL' }, { text: 'MongoDB' }, { text: 'Firebase' }, { text: 'Supabase' }],
  },
  {
    id: 'tools', title: 'Tools', line: 'What keeps the work together',
    skills: [{ name: 'Git', level: 7, note: 'Daily, solo and in teams' }],
    groups: [
      { label: 'Editors', items: ['VS Code', 'IntelliJ IDEA', 'Antigravity'] },
      { label: 'Build', items: ['Docker', 'npm', 'Maven', 'Gradle', 'Ant', 'Mix'] },
      { label: 'Hosting', items: ['Vercel', 'AWS', 'GitHub'] },
    ],
  },
  {
    id: 'design', title: 'Design & notes', line: 'Where ideas start',
    items: [{ text: 'Figma' }, { text: 'Canva' }, { text: 'Obsidian' }],
  },
  {
    id: 'ai', title: 'Next arc', line: 'Where I’m heading',
    groups: [
      { label: 'Studying', items: ['AI engineering concepts'] },
      { label: 'Next build', items: ['A RAG app'] },
      { label: 'Daily', items: ['Claude Code', 'Prompt engineering'] },
    ],
  },
];

/* ---------- Character file → Training ----------
 * Academy: the BSIT course as a quest board. Major subjects only, by term.
 * status: 'cleared' (done) · 'active' (this semester) · 'locked' (not yet).
 * A quest can point at work it led to with `link`. */
export type QuestStatus = 'cleared' | 'active' | 'locked';
export type Quest = {
  name: string;
  learned?: string;                          // opens a short "what I learned" note
  tag?: string;                              // a small label, e.g. "Boss fight"
  link?: { href: string; label: string };    // work it led to
};
export type Term = { label: string; status: QuestStatus; quests: Quest[] };
export const course: { degree: string; school: string; year: string; terms: Term[] } = {
  degree: 'BS Information Technology',
  school: 'Saint Louis University',
  year: '3rd year',
  terms: [
    {
      label: '1st year · 1st sem', status: 'cleared', quests: [
        { name: 'Introduction to Computing', learned: 'Where it started: computer basics, how to research properly, and my first HTML and CSS.' },
        { name: 'Computer Programming 1', learned: 'My first real language, Java. Variables, loops, methods, and learning to think in code.' },
        { name: 'Discrete Mathematics', learned: 'The math under computing: logic, sets, relations, counting and graphs.' },
      ],
    },
    {
      label: '1st year · 2nd sem', status: 'cleared', quests: [
        { name: 'Information System Fundamentals', learned: 'How information systems work: the different kinds, the core concepts, and how they run an organization.' },
        { name: 'Computer Programming 2', learned: 'Java, levelled up. This is where I started building real Java apps with a GUI.' },
        { name: 'Platform Technologies', learned: 'Bash scripting and Linux, set up and run inside virtual machines.' },
      ],
    },
    {
      label: '1st year · Short term', status: 'cleared', quests: [
        { name: 'Computer Architecture', learned: 'How a computer is built on the inside, plus hands-on Arduino builds through Cisco NetAcad.' },
      ],
    },
    {
      label: '2nd year · 1st sem', status: 'cleared', quests: [
        { name: 'Requirements Analysis and Modeling', learned: 'How software gets planned: the SDLC, development models, and modeling requirements before writing code.' },
        { name: 'Data Structures', learned: 'Data structures and the algorithms that run on them: lists, stacks, queues, trees, sorting and searching.' },
        { name: 'Network Fundamentals', learned: 'Networking from the ground up. I liked setting up servers, and learned to read live traffic with Wireshark.' },
      ],
    },
    {
      label: '2nd year · 2nd sem', status: 'cleared', quests: [
        { name: 'Information Management', learned: 'Where I really learned to structure a project: database design, naming conventions, and the diagrams that hold it all together.' },
        { name: 'Integrative Technologies', tag: 'Boss fight', learned: 'Still the hardest course I’ve taken. Java across machines: socket programming, RMI, gRPC and more.' },
        { name: 'Human Computer Interaction', learned: 'Designing for people: usability heuristics, and how to spot and avoid dark patterns.' },
      ],
    },
    {
      label: '2nd year · Short term', status: 'cleared', quests: [
        { name: 'Social and Personal Development in the ICT Workplace', learned: 'How a real tech workplace runs, from job interviews to working professionally on a team.' },
        { name: 'Technology-Assisted Presentation and Communication', learned: 'How to deliver a presentation properly, with tech that helps the message instead of distracting from it.' },
      ],
    },
    {
      label: '3rd year · 1st sem', status: 'active', quests: [
        { name: 'Applications Development', learned: 'Where the Team 5 build system came from.', link: { href: '/#projects', label: 'See the Team 5 build system' } },
        { name: 'Web Technologies', learned: 'Where Ka-dugo was built.', link: { href: '/work/ka-dugo/', label: 'See Ka-dugo' } },
        { name: 'Software Engineering' },
        { name: 'Social and Professional Issues in IT' },
        { name: 'Technopreneurship' },
        { name: 'IT Security Management' },
      ],
    },
    { label: '3rd year · 2nd sem', status: 'locked', quests: [] },
  ],
};

/* Field missions: hands-on work outside class. Fill the [brackets] when you're ready. */
export type Mission = { kind: string; title: string; role: string; when: string; note: string; current?: boolean; placeholder?: boolean };
export const missions: Mission[] = [
  {
    kind: 'Club', title: 'AWS Learning Club SLU', role: 'Associate Operations Officer', when: 'Now', current: true,
    note: 'I help our operations head with the work behind our events: program flows, event letters, processing documents, and errands.',
  },
  {
    kind: 'Competition', title: 'Philippine Startup Challenge XI', role: 'Team TindaTech · CAR regional', when: 'Oct 2026',
    note: 'We pitched KitaKlaro, a solution built for MSMEs, with our concept note. We didn’t place, but the idea kept going.',
  },
  {
    kind: 'Hackathon', title: 'PinaSIKlab', role: 'Team parZval', when: 'Oct 2026',
    note: 'We carried KitaKlaro forward and built a working PWA prototype. No win this time, but it went from a pitch to a product.',
  },
];

/* Self-training: what you're teaching yourself. */
export const selfTraining: { title: string; note: string }[] = [
  { title: 'AI engineering', note: 'Studying the core concepts first. A RAG app is my next build.' },
  { title: 'DevOps and cloud', note: 'Containers, deploys and the cloud, with Docker and AWS, alongside the AWS Learning Club.' },
  { title: 'Hobbies into apps', note: 'I take the things I love doing and build apps around them that solve real-life problems.' },
];

/* ---------- Character file → Writing: the lore archive ----------
 * A few worlds, power systems and OCs you've made over the years.
 * Swap the placeholders for your own. Keep each hook to one line.
 * Add or remove entries freely; the grid adapts (best at 3 or 6).
 * `link` is optional (a doc, a post, a Fiverr gig sample). */
export type LoreKind = 'universe' | 'power' | 'oc';
export type LoreEntry = {
  kind: LoreKind;
  name: string;
  epithet?: string; // a title under the name
  year?: string;    // shown top right when set
  hook: string;
  quote?: string;   // a short line in the character's voice
  specs: { label: string; value: string }[];
  link?: string;
  placeholder?: boolean;
};
export const lore: LoreEntry[] = [
  {
    kind: 'universe', name: 'The Otherverse', epithet: 'My original universe', year: 'Since 2021',
    hook: 'A cosmos ruled by Aether that flows, Aura that burns and Divine Authority that speaks, and by the rare souls whose Fables refuse all three.',
    specs: [
      { label: 'Powers', value: 'Aether, Aura, Divine Authority, Fables' },
      { label: 'Threat', value: 'The Outers, beyond the Otherversal Barrier' },
      { label: 'Order', value: 'The Council of Transcendents' },
    ],
  },
  {
    kind: 'power', name: 'Fables', epithet: 'The Soul Chronicle', year: '2023',
    hook: 'A power shaped by a single soul, written by no god and no law. At its peak, it lets a mortal stand before a deity and simply say no.',
    specs: [
      { label: 'Born from', value: 'The bearer’s own identity' },
      { label: 'Grows', value: 'Common at first, unique as the soul evolves' },
      { label: 'Rule', value: 'Can’t be taught, granted or stolen' },
    ],
  },
  {
    kind: 'oc', name: 'Ryuoden', epithet: 'The Forging Legend', year: '2023',
    hook: 'Mocked as his house’s failure, he forged himself into the strongest being in the Otherverse.',
    quote: 'It remains outside because it knows I am waiting.',
    specs: [
      { label: 'From', value: 'Mythoria, the Otherverse' },
      { label: 'Power', value: 'Caelumbra’s Echo, a void-bending bloodline gift' },
      { label: 'Flaw', value: 'Believes he is never enough' },
    ],
  },
];

/* ---------- Character file → Projects: the episodes. The picked one pops out. ---------- */
export type Episode = {
  id: 'kadugo' | 'build' | 'lore' | 'three';
  title: string;
  style: string; // the art style its poster is drawn in
  meta: string;
  summary: string;
  todo?: string;
  href?: string;
  link?: { href: string; label: string }; // an outside link shown in the popped-out panel
  placeholder?: boolean;
};
export const episodes: Episode[] = [
  {
    id: 'kadugo', title: 'Ka-dugo', style: 'comic ink',
    meta: 'Team project for IT312 Web Technologies, 2026',
    summary: 'A blood donation web app that installs like a phone app.',
    href: '/work/ka-dugo/',
  },
  {
    id: 'build', title: 'Team 5 build system', style: 'blueprint',
    meta: 'Java · Apache Ant · ITCS 311L',
    summary: 'Team 5’s build pipeline. I was the codebase architect; teammates ran the build, compile, run, docs and packaging stages.',
    todo: '[What the build does, and a link to the repo]',
  },
  {
    id: 'lore', title: 'Power systems, on commission', style: 'sketchbook',
    meta: 'Lore · OCs · Worldbuilding',
    summary: 'Outside code, I write lore, original characters, worldbuilding and power systems for clients on Fiverr. My own universe, the Otherverse, is in the Writing chapter.',
    link: { href: 'https://www.fiverr.com/ryuniii', label: 'See my Fiverr profile' },
  },
  {
    id: 'three', title: '[Project three]', style: 'halftone pop',
    meta: '[Stack · year]',
    summary: '[One line on what it does and who it’s for]',
    todo: '[Your part · link]',
    placeholder: true,
  },
];
