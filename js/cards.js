// The three gift cards – single source for internal ID, code identifier, display name and image
// (DECISION_REGISTER R3, R22). Order = order on the page.

export const CARDS = Object.freeze([
  Object.freeze({ giftcardId: 'amazon', cardCode: 'AMZ', name: 'Amazon', image: 'assets/giftcard-amazon.svg' }),
  Object.freeze({ giftcardId: 'mediamarkt', cardCode: 'MM', name: 'MediaMarkt', image: 'assets/giftcard-mediamarkt.svg' }),
  Object.freeze({ giftcardId: 'el-corte-ingles', cardCode: 'ECI', name: 'El Corte Inglés', image: 'assets/giftcard-el-corte-ingles.svg' }),
]);

export function findCard(giftcardId) {
  return CARDS.find((card) => card.giftcardId === giftcardId) ?? null;
}
