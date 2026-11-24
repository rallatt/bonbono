import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { t } from '../i18n/index.js';

/**
 * The Black Friday announcement. It stops showing itself the moment the sale
 * is over, so nobody has to remember to take it down.
 */
const SALE_ENDS = '2026-11-30T23:59:59-05:00';
const STORAGE_KEY = 'bonbono.promo.bf2026';
const SHOW_AFTER_MS = 1200;

export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (Date.now() > new Date(SALE_ENDS).getTime()) return undefined;

    // A blocked or empty localStorage must not stop the popup rendering,
    // and must not throw on the way past either.
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(STORAGE_KEY) === 'dismissed';
    } catch {
      dismissed = false;
    }
    if (dismissed) return undefined;

    const timer = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      // A viewer with storage blocked just sees it again next visit.
    }
  }

  if (!open) return null;

  return (
    <div className="promo-overlay">
      {/* A real button, so clicking outside closes without putting a handler
          on a div that the keyboard can never reach. Escape does the same. */}
      <button
        className="promo-backdrop"
        onClick={dismiss}
        tabIndex={-1}
        aria-hidden="true"
        type="button"
      />
      <div
        className="promo-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
      >
        <button
          className="promo-close"
          onClick={dismiss}
          ref={closeRef}
          aria-label={t('promo.bf.close')}
          type="button"
        >
          ×
        </button>
        <span className="promo-eyebrow">{t('promo.bf.eyebrow')}</span>
        <h2 id="promo-title">{t('promo.bf.title')}</h2>
        <p className="promo-dates">{t('promo.bf.dates')}</p>
        <p className="promo-where">{t('promo.bf.where')}</p>
        <Link
          className="btn-bold btn-bold--promo"
          to="/collections/calendriers-avent-bonbono"
          onClick={dismiss}
        >
          {t('promo.bf.cta')}
        </Link>
      </div>
    </div>
  );
}
