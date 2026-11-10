// Control only: state machine choose -> email -> result, wiring of the modules, focus management
// (concept/ARCHITECTURE.md 3, DESIGN_SPEC 3, 10, 11). State lives only in variables and the DOM of this page:
// no storage, no URL, no history state; a reload starts fresh. Texts: German for now (i18n follows on its own card).

import { findCard } from './cards.js';
import { computeCode, isWebCryptoAvailable, CodeError, ERROR_REASONS } from './code.js';
import { createRadioGroup } from './radio-group.js';
import { checkEmail, createEmailField, EMAIL_PROBLEMS } from './email.js';
import { createCopyControl } from './clipboard.js';

const TEXTS = Object.freeze({
  emailEmpty: 'Bitte gib deine geschäftliche E-Mail-Adresse ein.',
  emailImplausible: 'Bitte prüfe die E-Mail-Adresse – sie braucht genau ein „@“ und eine Domain wie name@firma.com.',
  copy: 'Code kopieren',
  copied: 'Kopiert',
});

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
const continueButton = byId('continue');
const form = byId('email-form');
const input = byId('email');
const generateButton = byId('generate');
const cryptoError = byId('crypto-error');
const codeElement = byId('code-value');

const radioGroup = createRadioGroup(document.querySelector('.cards[role="radiogroup"]'), () => {
  continueButton.disabled = false;
});

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
  texts: TEXTS,
});

let busy = false;
let currentState = 'choose';

function showState(name, { focus = true } = {}) {
  currentState = name;
  for (const state of STATES) sections[state].hidden = state !== name;
  const active = STATES.indexOf(name);
  steps.forEach((step, index) => {
    step.classList.toggle('is-active', index === active);
    step.classList.toggle('is-done', index < active);
    if (index === active) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
    step.querySelector('.progress__status').hidden = index >= active;
  });
  if (focus) headings[name].focus();
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
  showState('email');
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
    emailField.showError(problem === EMAIL_PROBLEMS.EMPTY ? TEXTS.emailEmpty : TEXTS.emailImplausible);
    input.focus();
    return;
  }
  emailField.clearError();

  if (!isWebCryptoAvailable()) {
    cryptoError.hidden = false;
    return;
  }

  setBusy(true);
  try {
    const code = await computeCode(input.value, card.giftcardId);
    // The person may have gone back or changed the card while hashing: show no stale result.
    if (currentState !== 'email' || radioGroup.value() !== card.giftcardId) return;
    copyControl.reset();
    codeElement.textContent = code;
    byId('result-name').textContent = card.name;
    showState('result');
  } catch (error) {
    if (!(error instanceof CodeError)) throw error;
    if (error.reason === ERROR_REASONS.WEB_CRYPTO_UNAVAILABLE) cryptoError.hidden = false;
    else if (error.reason === ERROR_REASONS.EMPTY_EMAIL) emailField.showError(TEXTS.emailEmpty);
    else showState('choose');
  } finally {
    setBusy(false);
  }
}

// Fresh start: no selection, no e-mail, no code (also after back/forward cache or browser form restore).
function resetAll({ focus = true } = {}) {
  radioGroup.clear();
  continueButton.disabled = true;
  emailField.reset();
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
  if (input.getAttribute('aria-invalid') === 'true') emailField.clearError();
});
window.addEventListener('pageshow', () => resetAll({ focus: false }));

resetAll({ focus: false });
