import { createContext, createElement, useCallback, useContext } from 'react';
import { fr } from './fr.js';
import { en } from './en.js';

export const DEFAULT_LOCALE = 'fr';
export const SUPPORTED_LOCALES = ['fr', 'en'];

const dictionaries = { fr, en };

/**
 * Translate a key into a given locale, falling back to French for any key the
 * other dictionary hasn't caught up on — a missing translation shows the
 * French string rather than a raw key.
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 * @param {string} [locale]
 * @returns {string}
 */
export function translate(key, params, locale = DEFAULT_LOCALE) {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  let value = dict[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{{${k}}}`, String(v));
    }
  }
  return value;
}

/**
 * French translation, for the few places that run outside React and so cannot
 * read the locale from context — `meta()` exports, mainly. Components use
 * `useT()` instead, so they follow the visitor's locale.
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function t(key, params) {
  return translate(key, params, DEFAULT_LOCALE);
}

// The worker runtime has no AsyncLocalStorage — `node:async_hooks` fails to
// load on Oxygen — and a module-level "current locale" would be shared between
// overlapping requests under streaming SSR. React context is the only way to
// carry a per-request locale without that race.
const LocaleContext = createContext(DEFAULT_LOCALE);

/**
 * @param {{locale?: string, children: React.ReactNode}} props
 */
export function LocaleProvider({ locale, children }) {
  const value = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  return createElement(LocaleContext.Provider, { value }, children);
}

/** The visitor's locale, e.g. 'fr' or 'en'. */
export function useLocale() {
  return useContext(LocaleContext);
}

/**
 * The translate function bound to the visitor's locale. It is named `t` at the
 * call site, so the hundreds of existing `t('key')` calls read unchanged.
 */
export function useT() {
  const locale = useLocale();
  return useCallback(
    /**
     * @param {string} key
     * @param {Record<string, string | number>} [params]
     */
    (key, params) => translate(key, params, locale),
    [locale],
  );
}

/**
 * A translate function for `meta()` exports, which run outside React and so
 * cannot use the hook. React Router hands meta the matched routes; the root
 * match carries the locale its loader resolved from the URL.
 * @param {Array<{id?: string, data?: any}> | undefined} matches
 */
export function metaT(matches) {
  const root = matches?.find((match) => match?.id === 'root');
  const locale = root?.data?.locale ?? DEFAULT_LOCALE;
  return (/** @type {string} */ key, /** @type {Record<string, string|number>} */ params) =>
    translate(key, params, locale);
}
