// Single source of truth for the shop's social accounts.
//
// These used to be hardcoded in three places, which is how the site shipped
// pointing at the wrong Instagram account: the corrections doc listed
// @bonbono.ca for both networks, but Instagram is actually @bonbono.mtl.
// Change a handle here and the footer, the contact page and the homepage
// feed all follow.
//
// NOTE: the TikTok handle is still the unverified one from that same doc.

export const INSTAGRAM_HANDLE = 'bonbono.mtl';
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export const TIKTOK_HANDLE = 'bonbono.ca';
export const TIKTOK_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;
