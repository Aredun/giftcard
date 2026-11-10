// Control only: state machine choose -> email -> result, wiring of the modules, focus management
// (concept/ARCHITECTURE.md 3, DESIGN_SPEC 3, 10, 11). State lives only in variables and the DOM of this page:
// no storage, no URL, no history state; a reload starts fresh. Texts come from js/i18n.js (DE / EN / ES, R57).

import { findCard } from './cards.js';
import { computeCode, isWebCryptoAvailable, CodeError, ERROR_REASONS } from './code.js';
import { createRadioGroup } from './radio-group.js';
import { checkEmail, createEmailField, EMAIL_PROBLEMS } from './email.js';
import { createCopyControl } from './clipboard.js';
import { applyLanguage, detectLanguage, translate } from './i18n.js';
import { enterState, initMotion } from './motion.js';
import { createScenes } from './motion-scenes.js';

const browserLanguages = globalThis.navigator?.languages;
let language = detectLanguage(browserLanguages?.length ? browserLanguages : [globalThis.navigator?.language]);
const t = (key) => translate(language, key);

const STATES = ['choose', 'email', 'result'];
const byId = (id) => document.getElementById(id);

const sections = {
  choose: byId('state-choose'),
  email: byId('state-email'),
  result: byId('state-result'),
};
const headings = {
  choose: byId('choose-heading'),
  email: byId('email-heading'),
  result: byId('result-heading'),
};
const steps = Array.from(document.querySelectorAll('.progress__step'));
const panel = document.querySelector('.panel');
const continueButton = byId('continue');
const form = byId('email-form');
const input = byId('email');
const generateButton = byId('generate');
const cryptoError = byId('crypto-error');
const codeElement = byId('code-value');

// Workshop motion (DESIGN_GUIDELINE 6): decorative only, never awaited – focus, status and code never wait for it.
const scenes = createScenes({
  panel,
  decor: document.querySelector('.decor'),
  santa: document.querySelector('.decor__santa'),
  summary: document.querySelector('.summary'),
  summaryImage: byId('summary-img'),
  form,
  envelope: document.querySelector('.envelope'),
  trail: document.querySelector('.trail'),
  trailPath: document.querySelector('.trail__path'),
  codebox: document.querySelector('.codebox'),
  copyIcon: document.querySelector('#copy-ok .icon'),
  confetti: document.querySelector('.confetti'),
});
// Sets <html data-motion> at once from the switch and the system setting; the choice is kept only in memory.
initMotion({ toggle: byId('motion-toggle'), help: byId('motion-help'), onStop: () => scenes.reset() });

const radioGroup = createRadioGroup(
  document.querySelector('.cards[role="radiogroup"]'),
  () => {
    continueButton.disabled = false;
  },
  (card, cards) => scenes.select(card, cards),
);

const emailField = createEmailField({
  input,
  helpId: 'email-help',
  error: byId('email-error'),
  errorText: byId('email-error-text'),
});

const copyControl = createCopyControl({
  button: byId('copy'),
  label: byId('copy-label'),
  codeElement,
  okLine: byId('copy-ok'),
  manualLine: byId('copy-manual'),
  onCopied: () => scenes.copied(),
  texts: {
    get copy() {
      return t('copy');
    },
    get copied() {
      return t('copied');
    },
  },
});

// Key of the e-mail error currently shown (or null), so a language switch can show it in the new language.
let emailErrorKey = null;

function showEmailError(key) {
  emailErrorKey = key;
  emailField.showError(t(key));
}

function clearEmailError() {
  emailErrorKey = null;
  emailField.clearError();
}

// Language switch (DESIGN_GUIDELINE 3.2): only texts change – e-mail value, chosen card, code and focus stay.
function setLanguage(next) {
  language = applyLanguage(document, next);
  if (emailErrorKey) emailField.showError(t(emailErrorKey));
  copyControl.relabel();
}

let busy = false;
let currentState = 'choose';

function showState(name, { focus = true } = {}) {
  const changed = name !== currentState;
  currentState = name;
  for (const state of STATES) sections[state].hidden = state !== name;
  // The decoration column follows the state (layout.css): Santa in choose / e-mail, gift cluster in the result.
  panel.dataset.state = name;
  const active = STATES.indexOf(name);
  steps.forEach((step, index) => {
    step.classList.toggle('is-active', index === active);
    step.classList.toggle('is-done', index < active);
    if (index === active) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
    step.querySelector('.progress__status').hidden = index >= active;
  });
  if (focus) headings[name].focus();
  if (!changed) return;
  enterState(sections[name]);
  // Page 2 starts its own sequence in goToEmail (it needs the card's position measured before page 1 is hidden).
  if (name === 'result') scenes.finale();
  else if (name === 'choose') scenes.reset();
}

function showSummary(card) {
  byId('summary-name').textContent = card.name;
  byId('summary-img').src = card.image;
}

function goToEmail() {
  const card = findCard(radioGroup.value());
  if (!card) return;
  showSummary(card);
  cryptoError.hidden = isWebCryptoAvailable();
  const from = scenes.measure(document.querySelector('.gift-card[aria-checked="true"]'));
  showState('email');
  scenes.enterEmail(from);
}

function setBusy(value) {
  busy = value;
  if (value) generateButton.setAttribute('aria-disabled', 'true');
  else generateButton.removeAttribute('aria-disabled');
}

async function generate(event) {
  event.preventDefault();
  if (busy) return;
  const card = findCard(radioGroup.value());
  if (!card) {
    showState('choose');
    return;
  }

  const problem = checkEmail(input.value);
  if (problem) {
    showEmailError(problem === EMAIL_PROBLEMS.EMPTY ? 'email_empty' : 'email_implausible');
    input.focus();
    return;
  }
  clearEmailError();

  if (!isWebCryptoAvailable()) {
    cryptoError.hidden = false;
    return;
  }

  const email = input.value;
  let code;
  setBusy(true);
  // Only the hash computation is guarded: an error in the result rendering below must surface in the console,
  // not be shown as the browser notice.
  try {
    code = await computeCode(email, card.giftcardId);
  } catch (error) {
    // Any unexpected failure of the hash computation (e.g. subtle.digest rejecting) gets the same browser notice,
    // so the person is never left on step 2 without feedback.
    const unexpected = !(error instanceof CodeError);
    if (unexpected || error.reason === ERROR_REASONS.WEB_CRYPTO_UNAVAILABLE) cryptoError.hidden = false;
    else if (error.reason === ERROR_REASONS.EMPTY_EMAIL) showEmailError('email_empty');
    else showState('choose');
    return;
  } finally {
    setBusy(false);
  }

  // The person may have gone back, changed the card or edited the e-mail while hashing: show no stale result.
  if (currentState !== 'email' || radioGroup.value() !== card.giftcardId || input.value !== email) return;
  copyControl.reset();
  codeElement.textContent = code;
  byId('result-name').textContent = card.name;
  showState('result');
}

// Fresh start: no selection, no e-mail, no code (also after back/forward cache or browser form restore).
function resetAll({ focus = true } = {}) {
  radioGroup.clear();
  continueButton.disabled = true;
  emailField.reset();
  emailErrorKey = null;
  copyControl.reset();
  codeElement.textContent = '';
  byId('result-name').textContent = '';
  cryptoError.hidden = true;
  showState('choose', { focus });
}

continueButton.addEventListener('click', goToEmail);
byId('change').addEventListener('click', () => showState('choose'));
byId('back').addEventListener('click', () => showState('choose'));
byId('reset').addEventListener('click', () => resetAll());
form.addEventListener('submit', generate);
input.addEventListener('input', () => {
  if (input.getAttribute('aria-invalid') === 'true') clearEmailError();
});
for (const button of document.querySelectorAll('.lang__btn[lang]')) {
  button.addEventListener('click', () => setLanguage(button.getAttribute('lang')));
}
// Only a page restored from the back/forward cache needs a reset here; a normal load is covered by the reset below
// (pageshow fires after the images have loaded, by then the person may already be typing).
window.addEventListener('pageshow', (event) => {
  if (event.persisted) resetAll({ focus: false });
});

setLanguage(language);
resetAll({ focus: false });
scenes.arrive();
