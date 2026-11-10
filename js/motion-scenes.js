// The workshop sequences (DESIGN_GUIDELINE 6.2-6.6; MOTION_ADDENDUM §1; AB#254): page 1 entrance, card selection,
// the motif flying into the summary, envelope / light trail / seal on page 2, the result finale and the copy stamp.
// Every function only adds scene classes or decorative, aria-hidden pieces and returns at once: app.js sets focus,
// status and code before or without them, and nothing here is awaited. With motion off they do nothing.

import { between, isMotionOn, play, stop } from './motion.js';

const CONFETTI_PIECES = 18;
const CONFETTI_COLOURS = ['--cranberry-700', '--gold-500', '--pine-700', '--ivory-50'];

const px = (value) => `${Math.round(value * 10) / 10}px`;

// Elements: panel, decor, santa (img), summary, summaryImage, form, envelope (svg), trail (svg), trailPath,
// codebox, copyIcon, confetti. All exist in index.html; a missing one only drops its part of a sequence.
export function createScenes(elements) {
  const { panel, decor, santa, summary, summaryImage, form, envelope, trail, trailPath, codebox, copyIcon, confetti } =
    elements;
  const doc = panel.ownerDocument;
  let arrived = false;
  let transfer = null;
  let cards = []; // the cards of the last selection, so leaving page 1 can end their reactions

  // Without Santa (image did not load) the envelope takes its fallback place (workshop.css)
  const noSanta = () => decor?.classList.add('has-no-santa');
  santa?.addEventListener('error', noSanta);
  if (santa?.complete && santa.naturalWidth === 0) noSanta();

  const art = (card) => card?.querySelector('.gift-card__art') ?? null;
  const check = (card) => card?.querySelector('.gift-card__check') ?? null;

  function removeTransfer() {
    transfer?.remove();
    transfer = null;
  }

  function clearConfetti() {
    confetti?.replaceChildren();
  }

  function stopCard(card) {
    stop(art(card));
    stop(check(card));
  }

  // Ends every page-2 / result piece and the card reactions (state change, motion off). Santa's idle keeps running.
  // The card reactions matter below 1024 px: page 1 is display: none there, which cancels a reaction without
  // animationend, so its class would stay and replay on the way back (AUD6-01).
  function reset() {
    cards.forEach(stopCard);
    removeTransfer();
    clearConfetti();
    stop(decor);
    stop(santa);
    stop(codebox);
  }

  // 6.2 Entrance, once per page load: also not when motion is switched on later.
  function arrive() {
    if (arrived) return;
    arrived = true;
    play(panel, 'is-arriving');
  }

  // 6.2 Selection: the chosen card reacts, the previous card's reaction ends at once.
  function select(card, allCards = []) {
    cards = allCards.includes(card) ? allCards : [...allCards, card].filter(Boolean);
    for (const other of allCards) {
      if (other !== card) stopCard(other);
    }
    play(art(card), 'is-wiggling');
    play(check(card), 'is-stamped');
    // During the entrance Santa is still greeting: a hop there would replace his arrival and replay it when it ends.
    if (!panel.classList.contains('is-arriving')) play(santa, 'is-hopping');
  }

  // 6.3 The chosen card's image position, measured before page 1 is hidden (null with motion off).
  function measure(card) {
    const image = art(card);
    if (!image || !isMotionOn(doc)) return null;
    const { left, top, width } = image.getBoundingClientRect();
    return width > 0 ? { left, top, width } : null;
  }

  // Rectangle of an element inside the page-2 section as it will rest: the section starts its fade shifted down by
  // --shift-state (motion.css), so its current vertical offset is taken back out.
  function settledRect(element) {
    const rect = element.getBoundingClientRect();
    const moving = element.closest?.('.is-entering');
    const view = doc.defaultView;
    if (!moving || !view?.getComputedStyle || !view.DOMMatrixReadOnly) return rect;
    const { transform } = view.getComputedStyle(moving);
    if (!transform || transform === 'none') return rect;
    const shift = new view.DOMMatrixReadOnly(transform).m42;
    return { left: rect.left, top: rect.top - shift, width: rect.width, height: rect.height };
  }

  // 6.3 FLIP copy of the motif from the card to the summary image. It starts above the form (clamped) and is a
  // child of the panel, so it never covers the field or the buttons; "Change" is drawn above it (motion.css).
  function flyTransfer(from) {
    const to = settledRect(summaryImage);
    if (!to.width) return;
    const box = panel.getBoundingClientRect();
    const scale = from.width / to.width;
    const startHeight = to.height * scale;
    const formTop = form ? settledRect(form).top : Infinity;
    const startTop = Math.min(from.top, formTop - startHeight);

    const copy = doc.createElement('img');
    copy.className = 'transfer';
    copy.alt = '';
    copy.setAttribute('aria-hidden', 'true');
    copy.src = summaryImage.getAttribute('src');
    copy.style.setProperty('--transfer-x', px(to.left - box.left - (panel.clientLeft || 0)));
    copy.style.setProperty('--transfer-y', px(to.top - box.top - (panel.clientTop || 0)));
    copy.style.setProperty('--transfer-w', px(to.width));
    copy.style.setProperty('--transfer-dx', px(from.left - to.left));
    copy.style.setProperty('--transfer-dy', px(startTop - to.top));
    copy.style.setProperty('--transfer-scale', String(Math.round(scale * 1000) / 1000));
    copy.addEventListener('animationend', () => {
      if (transfer === copy) removeTransfer();
    }, { once: true });
    removeTransfer();
    transfer = copy;
    panel.append(copy);
  }

  // 6.4 Geometry of the light trail: from the column's left edge at the summary's centre in a gentle curve to the
  // envelope's left edge. Also gives the envelope's fallback place without Santa (--summary-y).
  function drawTrail() {
    const box = decor.getBoundingClientRect();
    if (!box.width || !box.height || !summary) return;
    const row = settledRect(summary);
    const startY = row.top + row.height / 2 - box.top;
    decor.style.setProperty('--summary-y', px(Math.max(0, startY)));
    if (!envelope || !trail || !trailPath) return;
    const target = envelope.getBoundingClientRect();
    const endX = target.left - box.left;
    const endY = target.top + target.height / 2 - box.top;
    trail.setAttribute('viewBox', `0 0 ${Math.round(box.width)} ${Math.round(box.height)}`);
    if (endX <= 0) {
      trailPath.setAttribute('d', 'M0 0');
      return;
    }
    const r = (value) => Math.round(value * 10) / 10;
    const bend = r(endX / 2);
    trailPath.setAttribute('d', `M0 ${r(startY)}C${bend} ${r(startY)} ${bend} ${r(endY)} ${r(endX)} ${r(endY)}`);
  }

  // 6.3 + 6.4 Page 2, every entry: transfer, envelope, trail and seal in one timeline (cap --dur-email-entry).
  function enterEmail(from) {
    reset();
    if (!isMotionOn(doc)) return;
    drawTrail();
    play(decor, 'is-presenting');
    if (from) flyTransfer(from);
  }

  // 6.5 Confetti from the opening of the gift, inside the decoration column only.
  function burst() {
    if (!confetti) return;
    for (let i = 0; i < CONFETTI_PIECES; i += 1) {
      const piece = doc.createElement('span');
      piece.className = 'confetti__piece';
      piece.style.setProperty('--piece-colour', `var(${CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]})`);
      // Travel in units of --space-10: sideways up to 3, upwards 1-5, a few turns.
      piece.style.setProperty('--dx', String(between(-3, 3)));
      piece.style.setProperty('--dy', String(between(-5, -1)));
      piece.style.setProperty('--turn', `${between(-2, 2)}turn`);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
      confetti.append(piece);
    }
  }

  // 6.5 Result, once per result: code box opens, envelope gives way to the gift, lid opens, confetti (cap --dur-finale).
  function finale() {
    reset();
    if (!isMotionOn(doc)) return;
    play(decor, 'is-finale');
    play(codebox, 'is-revealing');
    burst();
  }

  // 6.6 After a successful copy only: the check is stamped, the code box border flashes once.
  function copied() {
    play(copyIcon, 'is-stamped');
    play(codebox, 'is-flashing');
  }

  return { arrive, select, measure, enterEmail, finale, copied, reset };
}
