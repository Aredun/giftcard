// The three gift cards – single source for internal ID, code identifier and display name
// (DECISION_REGISTER R3, R22). Order = order on the page.

export const CARDS = Object.freeze([
  Object.freeze({ giftcardId: 'amazon', cardCode: 'AMZ', name: 'Amazon' }),
  Object.freeze({ giftcardId: 'mediamarkt', cardCode: 'MM', name: 'MediaMarkt' }),
  Object.freeze({ giftcardId: 'el-corte-ingles', cardCode: 'ECI', name: 'El Corte Inglés' }),
]);

export function findCard(giftcardId) {
  return CARDS.find((card) => card.giftcardId === giftcardId) ?? null;
}
