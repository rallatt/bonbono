// Bonbono and Librairie Gourmande are two storefronts on the *same* Shopify
// store, so one gift card product serves both — which is also what makes the
// homepage promise ("valide aussi sur Librairiegourmande.ca") true.
// The handle still carries the bookstore's name for historical reasons; the
// product title does not.
export const GIFT_CARD_HANDLE = 'carte-cadeau-librairie-gourmande';

export const GIFT_CARD_URL = `/products/${GIFT_CARD_HANDLE}`;
