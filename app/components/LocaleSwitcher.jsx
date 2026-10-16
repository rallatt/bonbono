import { Link, useLocation } from 'react-router';
import { SUPPORTED_LOCALES, useLocale } from '../i18n/index.js';

// French is the default and has no prefix; every other locale lives under one.
const PREFIX_BY_LOCALE = { fr: '', en: '/en-ca' };
const LABELS = { fr: 'FR', en: 'EN' };

/** Strip any locale prefix so we can re-prefix for the target locale. */
function basePath(pathname) {
  const stripped = pathname.replace(/^\/(fr-ca|en-ca)(?=\/|$)/i, '');
  return stripped === '' ? '/' : stripped;
}

/**
 * FR / EN toggle. Keeps the visitor on the same page rather than dropping them
 * back on the homepage, which is the usual annoyance with language switchers.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const { pathname, search } = useLocation();
  const base = basePath(pathname);

  return (
    <div className="locale-switcher" role="group" aria-label="Language">
      {SUPPORTED_LOCALES.map((code) => {
        const prefix = PREFIX_BY_LOCALE[code] ?? '';
        const to = `${prefix}${base === '/' && prefix ? '' : base}${search}`;
        const isActive = code === locale;
        return (
          <Link
            aria-current={isActive ? 'true' : undefined}
            className={`locale-switcher-link${isActive ? ' is-active' : ''}`}
            key={code}
            lang={code}
            to={to || '/'}
          >
            {LABELS[code] ?? code.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
