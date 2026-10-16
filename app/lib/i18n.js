import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n/index.js';

// Only these URL prefixes are real. Anything else that looks like a locale
// (/xx-yy) falls through to the default, and ($locale).jsx then 404s it rather
// than quietly serving French under a made-up prefix.
const LOCALE_PREFIXES = {
  'FR-CA': { language: 'FR', country: 'CA' },
  'EN-CA': { language: 'EN', country: 'CA' },
};

/**
 * @param {Request} request
 */
export function getLocaleFromRequest(request) {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

  const match = LOCALE_PREFIXES[firstPathPart];
  if (!match) {
    return { language: 'FR', country: 'CA', pathPrefix: '' };
  }

  return { ...match, pathPrefix: '/' + firstPathPart.toLowerCase() };
}

/**
 * The app locale ('fr' | 'en') for a storefront i18n language code.
 * @param {string | undefined} language
 */
export function localeFromLanguage(language) {
  const locale = (language ?? '').toLowerCase();
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * @typedef {Object} I18nLocale
 * @property {string} pathPrefix
 */

/** @typedef {import('@shopify/hydrogen').I18nBase} I18nBase */
