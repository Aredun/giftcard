// E-mail plausibility check and inline error (DESIGN_SPEC 8 "Validierung", 10, 11; DESIGN_GUIDELINE 3.7).
// Deliberately loose: exactly one "@", a non-empty local part, a domain of at least two labels of ASCII letters,
// digits and hyphens (no international domains), no whitespace or control characters. No RFC completeness, no domain whitelist, no network check. The value is never logged or stored.

import { normalizeEmail } from './code.js';

export const EMAIL_PROBLEMS = Object.freeze({
  EMPTY: 'empty',
  IMPLAUSIBLE: 'implausible',
});

// One domain label: ASCII letters, digits and hyphens, not empty, no hyphen at the start or end (DECISIONS S3).
const DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

// Returns null when the address is plausible, otherwise one of EMAIL_PROBLEMS.
// Checked on the normalised form (R26), so full-width characters that NFKC maps to ASCII are accepted.
export function checkEmail(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (email === '') return EMAIL_PROBLEMS.EMPTY;
  if (/[\s\p{C}]/u.test(email)) return EMAIL_PROBLEMS.IMPLAUSIBLE;
  const parts = email.split('@');
  if (parts.length !== 2) return EMAIL_PROBLEMS.IMPLAUSIBLE;
  const [local, domain] = parts;
  if (local === '') return EMAIL_PROBLEMS.IMPLAUSIBLE;
  const labels = domain.split('.');
  if (labels.length < 2 || !labels.every((label) => DOMAIN_LABEL.test(label))) return EMAIL_PROBLEMS.IMPLAUSIBLE;
  return null;
}

// Shows or clears the inline error under the field; the error is linked via aria-describedby.
export function createEmailField({ input, helpId, error, errorText }) {
  function showError(message) {
    errorText.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', `${helpId} ${error.id}`);
  }

  function clearError() {
    errorText.textContent = '';
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    input.setAttribute('aria-describedby', helpId);
  }

  return {
    showError,
    clearError,
    reset() {
      input.value = '';
      clearError();
    },
  };
}
