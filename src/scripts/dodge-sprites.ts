/**
 * dodge.exe's pixel art, one character per pixel, drawn by dodge.ts in four shades:
 * w lightest, l light, m mid, # darkest (the site's cyan ramp; dark mode flips it).
 * El faces right; the bugs face left, toward him.
 */

/* El: headphones (h band and cup, b the cup's shine), x his eye when he's hit */
export const EL_TOP = [
  '....#..#....',
  '....##.##.#.',
  '...hhhhhh##.',
  '..h#######..',
  '..hbh###o##.',
  '..hhh###o##.',
  '..hhh######.',
  '...#######..',
  '.....###....',
  '....#####...',
  '...#######..',
  '...######.#.',
  '...#####....',
  '....####....',
];
export const EL_HIT = EL_TOP.map((r, i) => (i === 4 ? '..hbh##x#x#.' : i === 5 ? '..hhh###x##.' : r));
/** legs: two running frames, then tucked for a jump */
export const EL_LEGS = [
  ['...##..##...', '..##....##..', '..#......#..', '.##......##.'],
  ['....####....', '.....##.....', '.....##.....', '....###.....'],
  ['...######...', '...##..##...', '....#...#...', '............'],
];
/** the cape, flowing back from his shoulders: two running frames, then streaming up for a jump */
export const CAPE = [
  ['.......c', '.....ccc', '...ccccc', '.cccccc.', 'ccccccc.', '.ccccc..', '...cc...'],
  ['.......c', '......cc', '....cccc', '..ccccc.', '.cccccc.', 'cccccc..', '.cc.cc..'],
  ['cccc....', '.ccccc.c', '...ccccc', '.....ccc', '........', '........', '........'],
];

export type BugKind = 'ladybug' | 'caterpillar' | 'slime' | 'snail' | 'moth' | 'fly';
export const WALKERS: BugKind[] = ['ladybug', 'caterpillar', 'slime', 'snail'];

type Bug = { w: number; h: number; lift: number; frames?: string[][]; label?: string };
export const BUGS: Record<BugKind, Bug> = {
  /** the literal bug */
  ladybug: {
    w: 15, h: 11, lift: 0,
    frames: [[
      '......#####....',
      '....##mmmmm##..',
      '...#mlmm#mmmm#.',
      '..##llmmmmm#mm#',
      '.#ww#mm#mmmmmm#',
      '#www#mmmmmm#mm#',
      '#w#w#mm#mmmmmm#',
      '#####mmmmm#mmm#',
      '.##############',
      '..#..#...#..#..',
      '.#..#...#..#...',
    ], [
      '......#####....',
      '....##mmmmm##..',
      '...#mlmm#mmmm#.',
      '..##llmmmmm#mm#',
      '.#ww#mm#mmmmmm#',
      '#www#mmmmmm#mm#',
      '#w#w#mm#mmmmmm#',
      '#####mmmmm#mmm#',
      '.##############',
      '..#..#...#..#..',
      '...#..#...#..#.',
    ]],
  },
  /** a head and three segments spelling 404 (CATERPILLAR_*) */
  caterpillar: { w: 34, h: 10, lift: 0 },
  /** an ERR */
  slime: {
    w: 15, h: 11, lift: 0, label: 'ERR',
    frames: [[
      '....#######....',
      '..##mmmmmmm##..',
      '.#mmwwmmmwwmm#.',
      '.#mmw#mmmw#mm#.',
      '#mmmmmmmmmmmmm#',
      '#mmmmmmmmmmmmm#',
      '#mmmmmmmmmmmmm#',
      '#mmmmmmmmmmmmm#',
      '#mmmmmmmmmmmmm#',
      '#lmmmmmmmmmmml#',
      '.#############.',
    ], [
      '...............',
      '...#########...',
      '.##mwwmmmwwm##.',
      '#mmmw#mmmw#mmm#',
      '#mmmmmmmmmmmmm#',
      '#mmmmmmmmmmmmm#',
      '#mmmmmmmmmmmmm#',
      '#mmmmmmmmmmmmm#',
      '#mmmmmmmmmmmmm#',
      '#lmmmmmmmmmmml#',
      '###############',
    ]],
  },
  /** its shell is a loading spinner (SNAIL_*) */
  snail: { w: 18, h: 13, lift: 0 },
  /** low flyer, jump it: a nod to the moth found in the Harvard Mark II in 1947, the first "bug" */
  moth: {
    w: 15, h: 10, lift: 6,
    frames: [[
      '.##.........##.',
      '#ll#..#.#..#ll#',
      '#lll#..#..#lll#',
      '#llml#.#.#lmll#',
      '#lmmll###llmml#',
      '#lllll#w#lllll#',
      '.#llll###llll#.',
      '..#lll###lll#..',
      '...###.#.###...',
      '.......#.......',
    ], [
      '...............',
      '......#.#......',
      '...##..#..##...',
      '..#ll#.#.#ll#..',
      '..#lml###lml#..',
      '..#lll#w#lll#..',
      '...#ll###ll#...',
      '....##.#.##....',
      '.......#.......',
      '...............',
    ]],
  },
  /** high flyer: it passes just over El's head, so run under it; jump into it and the run is over */
  fly: {
    w: 13, h: 9, lift: 21,
    frames: [[
      '.....mmm.mmm.',
      '....m...m...m',
      '.....mmm.mmm.',
      '...#######...',
      '..#ww#####m#.',
      '.#www######m#',
      '.#w#######mm#',
      '..#########..',
      '...#.#.#.#...',
    ], [
      '.............',
      '.............',
      '.....mmmmmm..',
      '...#######mmm',
      '..#ww#####mm.',
      '.#www######m#',
      '.#w#######mm#',
      '..#########..',
      '..#.#.#.#....',
    ]],
  },
};

export const CATERPILLAR_HEAD = [
  '.#...#...',
  '..#.#....',
  '..####...',
  '.#mmmm#..',
  '#wwmmmm#.',
  '#w#mmmm#.',
  '#mmmmmm#.',
  '#m##mmm#.',
  '.#mmmm#..',
  '..####...',
];
export const CATERPILLAR_SEG = [
  '...###...',
  '.##lll##.',
  '.#lllll#.',
  '#lllllll#',
  '#lllllll#',
  '#lllllll#',
  '.#lllll#.',
  '.##lll##.',
  '...###...',
];
export const SNAIL_BODY = [
  '.w..w.............',
  '#w#.#w#...........',
  '.#...#............',
  '.#...#............',
  '..#.#.............',
  '..###.............',
  '.#mmm#............',
  '#mwmmm#...........',
  '#m#mmmm#..........',
  '#mmmmmmmmmmmmmmmm#',
  '#mmmmmmmmmmmmmmmmm',
  '#lmmmmmmmmmmmmmmm#',
  '.#################',
];
export const SNAIL_SHELL = [
  '...#####...',
  '..#lllll#..',
  '.#lllllll#.',
  '#lllllllll#',
  '#lllllllll#',
  '#lllllllll#',
  '#lllllllll#',
  '#lllllllll#',
  '.#lllllll#.',
  '..#lllll#..',
  '...#####...',
];

/* a 3x5 pixel font: just the letters the game says */
export const FONT: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101',
  L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010',
  W: '101101111111101', Y: '101101010010010', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111',
  '3': '110001010001110', '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010',
  '8': '111101111101111', '9': '111101111001110', '!': '010010010000010', ' ': '000000000000000',
};
