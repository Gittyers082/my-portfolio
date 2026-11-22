/**
 * A hello for anyone who opens DevTools: El from behind (as always), a short
 * note, the email, and two hints (the shortcuts panel, and a secret word).
 * Printed once per page load.
 */
const EL = String.raw`
          /\    /\   /\
       /\/  \__/  \_/  \/\
       \                 /
        |               |
        |               |
         \_____________/
     ______/         \______
    /                       \
   /                         \
`;

export function initDevtools(): void {
  const email = document.querySelector<HTMLElement>('[data-copy]')?.dataset.copy ?? '';
  const bold = 'font-weight:700'; // no fixed color: readable in light and dark DevTools themes
  const cyan = 'color:#00789A;font-weight:700';
  const plain = 'color:inherit;font-weight:400';
  /* eslint-disable no-console */
  console.log(`%c${EL}`, 'color:#00789A;font-family:monospace;line-height:1.15'); // taste-skill-ignore: ASCII art needs monospace
  console.log("%cYou're reading the source. I like you already.", `${bold};font-size:15px`);
  console.log(
    "%cI'm El: a 3rd-year IT student who builds web apps and is learning AI engineering.\n%cOpen to internships → %c" + email,
    plain, plain, cyan,
  );
  console.log('%cPsst: press %c?%c on the page for shortcuts. And try typing a certain Greek word.', plain, cyan, plain);
  /* eslint-enable no-console */
}
