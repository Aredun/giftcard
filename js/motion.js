// Motion state of the page (DESIGN_GUIDELINE 6.0, 6.1, 6.7; MOTION_ADDENDUM §2; DECISIONS V5, V6; AB#254).
// effectiveMotion = !systemReducedMotion && inPagePreference !== false, written to <html data-motion="on|off">; every
// decorative rule in css/motion.css is scoped to "on". The in-page choice lives only in a variable of this module:
// no cookie, no storage, no URL, no history entry – a reload starts again from the system setting and "on".
// Purely decorative: nothing here delays focus, input, status or the code. The sequences are in motion-scenes.js.

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SNOW_DOTS = 28;

// Random number in [min, max), rounded to two decimals (CSS custom property values stay short).
export function between(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

export function isMotionOn(doc = globalThis.document) {
  return doc?.documentElement?.dataset?.motion === 'on';
}

// Scene classes currently playing, one per element (6.0 rule 4: a repeat replaces, never adds).
const playing = new Map();

// Ends a scene on the end of the element's own animation (not one bubbling up from a child, not a pseudo-element's).
function endScene(event) {
  const element = event.currentTarget;
  if (event.target !== element || event.pseudoElement) return;
  stop(element);
}

// Removes the scene class of the element; the resting picture (= end state) appears at once.
export function stop(element) {
  const className = playing.get(element);
  if (!className) return;
  element.classList.remove(className);
  playing.delete(element);
}

export function stopAll() {
  for (const element of [...playing.keys()]) stop(element);
}

// Starts (or restarts) a scene class on the element; replaces whatever scene the element was playing.
// Returns false and leaves the resting picture when motion is off.
export function play(element, className) {
  if (!element) return false;
  stop(element);
  if (!isMotionOn(element.ownerDocument)) return false;
  // A forced layout read restarts the CSS animation when the same class is added again. getBoundingClientRect works for
  // HTML and SVG elements alike (an SVG element has no offsetWidth, so reading that would not flush).
  element.getBoundingClientRect();
  element.classList.add(className);
  playing.set(element, className);
  // The same function reference is registered only once per element, however often it plays.
  element.addEventListener('animationend', endScene);
  return true;
}

// Plain fade of a newly shown state (opacity and --shift-state); focus is set by app.js at once, not after it.
export function enterState(section) {
  play(section, 'is-entering');
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

// Switch, system setting and snow layer. Call once at start, before anything plays; data-motion is set synchronously.
//   toggle  the switch input (checkbox with role="switch"), help  the explanation shown under system reduction,
//   onStop  called whenever motion goes off, to remove transient pieces (transfer copy, confetti).
export function initMotion({
  doc = globalThis.document,
  media = globalThis.matchMedia?.(REDUCED_MOTION_QUERY) ?? null,
  toggle = null,
  help = null,
  onStop = () => {},
} = {}) {
  let preference = null; // in-page choice: null = none yet, true / false = the person's choice; memory only
  let snow = null;
  const systemReduced = () => Boolean(media?.matches);
  const effective = () => !systemReduced() && preference !== false;

  function apply() {
    const on = effective();
    const forced = systemReduced();
    doc.documentElement.dataset.motion = on ? 'on' : 'off';
    if (toggle) {
      toggle.checked = on;
      toggle.disabled = forced;
      if (forced && help?.id) toggle.setAttribute('aria-describedby', help.id);
      else toggle.removeAttribute('aria-describedby');
    }
    if (help) help.hidden = !forced;
    if (on) {
      // Switching on replays no entrance and no finale: only the background and the next reactions start.
      snow ??= createSnow(doc);
      return;
    }
    snow?.remove();
    snow = null;
    stopAll();
    onStop();
  }

  toggle?.addEventListener('change', () => {
    preference = Boolean(toggle.checked);
    apply();
  });
  media?.addEventListener?.('change', apply);
  apply();
  return { isOn: effective };
}
