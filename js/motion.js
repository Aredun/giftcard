// Gentle motion of the page (DESIGN_GUIDELINE 6, DESIGN_SPEC 7, R56): snow sparkle behind the panel, fade of a new
// state, finale confetti in the result state. Purely decorative: every element is aria-hidden, never focusable,
// never clickable, and nothing here delays focus, reading order or the copy status. With prefers-reduced-motion
// no particles are created at all; motion.css removes the remaining animations. Styles live in css/motion.css.

const SNOW_DOTS = 28;
const CONFETTI_PIECES = 18;
const CONFETTI_COLOURS = ['--cranberry-700', '--gold-500', '--pine-700', '--ivory-50'];

const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = () => Boolean(reducedMotion?.matches);

// Random number in [min, max), rounded to two decimals (CSS custom property values stay short).
function between(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function createSnow(doc) {
  const layer = doc.createElement('div');
  layer.className = 'snow';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < SNOW_DOTS; i += 1) {
    const dot = doc.createElement('span');
    dot.className = i % 4 === 0 ? 'snow__dot is-large' : 'snow__dot';
    dot.style.setProperty('--x', `${between(0, 100)}%`);
    dot.style.setProperty('--y', `${between(0, 100)}%`);
    // One twinkle lasts 4-9 x --dur-finale (3.6-8.1 s); the start is spread over the first 8 x --dur-finale.
    dot.style.setProperty('--slow', String(between(4, 9)));
    dot.style.setProperty('--wait', String(between(0, 8)));
    layer.append(dot);
  }
  doc.body.prepend(layer);
  return layer;
}

// Snow layer that follows the reduced-motion setting while the page is open.
export function initMotion(doc = document) {
  let snow = prefersReducedMotion() ? null : createSnow(doc);
  reducedMotion?.addEventListener?.('change', () => {
    if (prefersReducedMotion()) {
      snow?.remove();
      snow = null;
    } else if (!snow) {
      snow = createSnow(doc);
    }
  });
}

// Fade the newly shown state in (opacity and --shift-state); restarts if states change quickly.
export function enterState(section) {
  if (!section || prefersReducedMotion()) return;
  section.classList.remove('is-entering');
  // Reading offsetWidth restarts the CSS animation when the class is added again.
  void section.offsetWidth;
  section.classList.add('is-entering');
  // The same function reference is registered only once per section, however often the state is entered.
  section.addEventListener('animationend', endStateAnimation);
}

// Only the section's own animation ends the fade (the check badge's animationend bubbles up from inside).
function endStateAnimation(event) {
  if (event.target === event.currentTarget) event.currentTarget.classList.remove('is-entering');
}

// Finale: a short burst of confetti inside the given container (the decoration column), gone after --dur-finale.
export function celebrate(container) {
  if (!container) return;
  container.replaceChildren();
  if (prefersReducedMotion()) return;
  for (let i = 0; i < CONFETTI_PIECES; i += 1) {
    const piece = container.ownerDocument.createElement('span');
    piece.className = 'confetti__piece';
    piece.style.setProperty('--piece-colour', `var(${CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]})`);
    // Travel in units of --space-10: sideways up to 3, upwards 1-5, a few turns.
    piece.style.setProperty('--dx', String(between(-3, 3)));
    piece.style.setProperty('--dy', String(between(-5, -1)));
    piece.style.setProperty('--turn', `${between(-2, 2)}turn`);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
    container.append(piece);
  }
}

// Remove any confetti still flying (reset, leaving the result state).
export function clearCelebration(container) {
  container?.replaceChildren();
}
