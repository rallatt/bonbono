import { fr } from './fr.js';

const LOCALE = 'fr';

const dictionaries = { fr };

/**
 * Translate a key to the current locale string.
 * Supports {{param}} interpolation.
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function t(key, params) {
  const dict = dictionaries[LOCALE];
  let value = dict[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{{${k}}}`, String(v));
    }
  }
  return value;
}
