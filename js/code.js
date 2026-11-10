// Selection code algorithm (concept/requirements/CODE_ALGORITHM.md, normative). No DOM, no storage, no logging.
// UGC1-<cardCode>-XXXX-XXXX-XXXX-XXXX = first 10 bytes of SHA-256(payload), RFC 4648 Base32 without padding.

import { findCard } from './cards.js';

export const CODE_VERSION = 'UGC1';
export const PAYLOAD_PREFIX = 'ULTEBRA-XMAS-GIFTCARD|v1|';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOKEN_BYTES = 10;

// Reasons the page can map to a translated message.
export const ERROR_REASONS = Object.freeze({
  WEB_CRYPTO_UNAVAILABLE: 'web-crypto-unavailable',
  UNKNOWN_GIFTCARD: 'unknown-giftcard',
  EMPTY_EMAIL: 'empty-email',
});

export class CodeError extends Error {
  constructor(reason) {
    super(`Selection code cannot be computed: ${reason}`);
    this.name = 'CodeError';
    this.reason = reason;
  }
}

// trim -> NFKC -> toLowerCase (R26); plus tags, dots and providers stay untouched (R27-R29).
export function normalizeEmail(rawEmail) {
  return String(rawEmail ?? '').trim().normalize('NFKC').toLowerCase();
}

export function buildPayload(normalizedEmail, giftcardId) {
  return `${PAYLOAD_PREFIX}${normalizedEmail}|${giftcardId}`;
}

// RFC 4648 Base32, no padding.
export function base32(bytes) {
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += BASE32_ALPHABET[(buffer >>> bits) & 31];
    }
    buffer &= (1 << bits) - 1;
  }
  if (bits > 0) out += BASE32_ALPHABET[(buffer << (5 - bits)) & 31];
  return out;
}

function hasDigest(subtle) {
  return typeof subtle?.digest === 'function';
}

export function isWebCryptoAvailable() {
  return hasDigest(globalThis.crypto?.subtle);
}

// Returns the selection code for a raw e-mail and a giftcardId.
// `options.subtle` replaces Web Crypto (tests only); without Web Crypto there is no fallback hash.
export async function computeCode(rawEmail, giftcardId, options = {}) {
  const subtle = 'subtle' in options ? options.subtle : globalThis.crypto?.subtle;
  if (!hasDigest(subtle)) throw new CodeError(ERROR_REASONS.WEB_CRYPTO_UNAVAILABLE);

  const card = findCard(giftcardId);
  if (!card) throw new CodeError(ERROR_REASONS.UNKNOWN_GIFTCARD);

  const email = normalizeEmail(rawEmail);
  if (email === '') throw new CodeError(ERROR_REASONS.EMPTY_EMAIL);

  const data = new TextEncoder().encode(buildPayload(email, card.giftcardId));
  const digest = new Uint8Array(await subtle.digest('SHA-256', data));
  const token = base32(digest.subarray(0, TOKEN_BYTES));
  const groups = token.match(/.{4}/g).join('-');
  return `${CODE_VERSION}-${card.cardCode}-${groups}`;
}
