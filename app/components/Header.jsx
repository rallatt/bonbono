import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Await, NavLink, useAsyncValue } from 'react-router';
import { useAnalytics, useOptimisticCart } from '@shopify/hydrogen';
import { useAside } from './Aside';
import logoImg from '../assets/cleanLogo.png';
import { t } from '../i18n/index.js';

const HEADER_TITLE_BY_URL = {
  '/search': t('search.title'),
  '/collections': t('nav.collections'),
  '/blogs/journal': t('nav.blog'),
  '/policies': t('nav.policies'),
  '/pages/about': t('nav.about'),
};

/**
 * @param {HeaderProps}
 */
export function Header({ header, isLoggedIn, cart, publicStoreDomain }) {
  const { shop, menu } = header;
  const [mobileOpen, setMobileOpen] = useState(false);

  const primaryDomainUrl = shop.primaryDomain.url;

  const resolveUrl = useCallback(
    (url) => {
      if (!url) return null;
      return url.includes('myshopify.com') ||
        url.includes(publicStoreDomain) ||
        url.includes(primaryDomainUrl)
        ? new URL(url).pathname
        : url;
    },
    [publicStoreDomain, primaryDomainUrl],
  );

  const items = (menu || FALLBACK_HEADER_MENU).items;

  // Close mobile menu when viewport crosses desktop breakpoint
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 48em)');
    const handler = (e) => { if (e.matches) setMobileOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <header className="header">
        <NavLink prefetch="intent" to="/" className="header-logo" end>
          <img src={logoImg} alt="Bonbono" className="header-logo-img" />
        </NavLink>
        <OverflowNav items={items} resolveUrl={resolveUrl} />
        <HeaderCtas
          isLoggedIn={isLoggedIn}
          cart={cart}
          mobileOpen={mobileOpen}
          onMobileToggle={() => setMobileOpen((v) => !v)}
        />
      </header>
      <MobileMenuPanel
        items={items}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        resolveUrl={resolveUrl}
      />
    </>
  );
}

/**
 * Desktop nav with overflow detection.
 * Items that don't fit in the available space collapse into an animated "Plus" dropdown.
 */
function flipDropdowns(nav) {
  if (!nav) return;
  // Only flip top-level wrappers — nested ones inside the overflow menu are inline
  nav.querySelectorAll(':scope > .header-menu-item-wrapper').forEach((wrapper) => {
    const dropdown = wrapper.querySelector('.header-menu-dropdown');
    if (!dropdown) return;
    // Reset first so we measure the natural left-aligned position
    delete wrapper.dataset.flip;
    // position:absolute + visibility:hidden still produces a measurable rect
    const rect = dropdown.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) {
      wrapper.dataset.flip = 'right';
    }
  });
}

function OverflowNav({ items, resolveUrl }) {
  const navRef = useRef(null);
  const rulerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  const compute = useCallback(() => {
    const nav = navRef.current;
    const ruler = rulerRef.current;
    if (!nav || !ruler) return;

    const rulerChildren = Array.from(ruler.children);
    // Last child in ruler is the "more" button measurement
    if (rulerChildren.length < 2) return;

    const moreWidth =
      rulerChildren[rulerChildren.length - 1].getBoundingClientRect().width;
    const widths = rulerChildren
      .slice(0, -1)
      .map((el) => el.getBoundingClientRect().width);

    const navStyle = window.getComputedStyle(nav);
    const paddingRight = parseFloat(navStyle.paddingRight) || 0;
    const availWidth = nav.getBoundingClientRect().width - paddingRight;
    // Use columnGap for flex gap
    const gap = parseFloat(navStyle.columnGap) || 12;

    let total = 0;
    let count = 0;

    for (let i = 0; i < widths.length; i++) {
      const gapBefore = i > 0 ? gap : 0;
      const isLast = i === widths.length - 1;
      // Reserve space for "more" button only if there will be overflow items
      const reserveMore = !isLast;
      const needed =
        total + gapBefore + widths[i] + (reserveMore ? gap + moreWidth : 0);

      if (needed <= availWidth) {
        total += gapBefore + widths[i];
        count = i + 1;
      } else {
        break;
      }
    }

    setVisibleCount(count);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(compute);
    ro.observe(nav);
    compute();
    return () => ro.disconnect();
  }, [compute]);

  useEffect(() => {
    flipDropdowns(navRef.current);
  }, [visibleCount]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  return (
    <>
      {/* Off-screen ruler: measures natural item widths without affecting layout */}
      <div ref={rulerRef} className="header-menu-ruler" aria-hidden="true">
        {items.map((item) => {
          const url = resolveUrl(item.url);
          const hasChildren = item.items?.length > 0;
          return (
            <span
              key={item.id}
              className={`header-menu-item${hasChildren ? ' header-menu-item--parent' : ''}`}
            >
              {HEADER_TITLE_BY_URL[url] ?? item.title}
              {hasChildren && (
                <span className="header-menu-chevron" aria-hidden="true">
                  ▾
                </span>
              )}
            </span>
          );
        })}
        {/* Measure the overflow "more" button */}
        <span className="header-menu-item header-menu-item--parent">
          {t('nav.more')}{' '}
          <span className="header-menu-chevron" aria-hidden="true">
            ▾
          </span>
        </span>
      </div>

      <nav ref={navRef} className="header-menu-desktop" role="navigation">
        {visibleItems.map((item) => {
          const url = resolveUrl(item.url);
          if (!url) return null;
          const hasChildren = item.items?.length > 0;

          if (hasChildren) {
            return (
              <div key={item.id} className="header-menu-item-wrapper">
                <NavLink
                  className="header-menu-item header-menu-item--parent"
                  end
                  prefetch="intent"
                  style={activeLinkStyle}
                  to={url}
                >
                  {HEADER_TITLE_BY_URL[url] ?? item.title}
                  <span className="header-menu-chevron" aria-hidden="true">
                    ▾
                  </span>
                </NavLink>
                <ul className="header-menu-dropdown">
                  {item.items.map((child) => {
                    const childUrl = resolveUrl(child.url);
                    if (!childUrl) return null;
                    return (
                      <li key={child.id}>
                        <NavLink
                          className="header-menu-dropdown-item"
                          prefetch="intent"
                          style={activeLinkStyle}
                          to={childUrl}
                        >
                          {HEADER_TITLE_BY_URL[childUrl] ?? child.title}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }

          return (
            <NavLink
              className="header-menu-item"
              end
              key={item.id}
              prefetch="intent"
              style={activeLinkStyle}
              to={url}
            >
              {HEADER_TITLE_BY_URL[url] ?? item.title}
            </NavLink>
          );
        })}

        {overflowItems.length > 0 && (
          <div className="header-menu-more-wrapper">
            <button className="header-menu-item header-menu-more-btn reset">
              {t('nav.more')}
              <span className="header-menu-chevron" aria-hidden="true">▾</span>
            </button>
            <ul className="header-menu-overflow-dropdown">
              {overflowItems.map((item) => {
                const url = resolveUrl(item.url);
                if (!url) return null;
                const hasChildren = item.items?.length > 0;

                if (hasChildren) {
                  return (
                    <li key={item.id} className="header-menu-item-wrapper">
                      <NavLink
                        className="header-menu-dropdown-item header-menu-item--parent"
                        to={url}
                        prefetch="intent"
                        style={activeLinkStyle}
                      >
                        {HEADER_TITLE_BY_URL[url] ?? item.title}
                        <span className="header-menu-chevron" aria-hidden="true">▾</span>
                      </NavLink>
                      <ul className="header-menu-dropdown">
                        {item.items.map((child) => {
                          const childUrl = resolveUrl(child.url);
                          if (!childUrl) return null;
                          return (
                            <li key={child.id}>
                              <NavLink
                                className="header-menu-dropdown-item"
                                to={childUrl}
                                prefetch="intent"
                                style={activeLinkStyle}
                              >
                                {HEADER_TITLE_BY_URL[childUrl] ?? child.title}
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <NavLink
                      className="header-menu-dropdown-item"
                      to={url}
                      prefetch="intent"
                      style={activeLinkStyle}
                    >
                      {HEADER_TITLE_BY_URL[url] ?? item.title}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}

/**
 * Animated full-width mobile menu panel that slides down from the header.
 */
function MobileMenuPanel({ items, open, onClose, resolveUrl }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setClosing(false);
      setVisible(true);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const panel = document.querySelector('.mobile-menu-panel');
      const header = document.querySelector('.header');
      if (!panel?.contains(e.target) && !header?.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!visible) return null;

  return (
    <>
      <div
        className={`mobile-menu-backdrop${closing ? ' closing' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`mobile-menu-panel${closing ? ' closing' : ''}`}
        role="dialog"
        aria-label={t('aside.mobile.heading')}
      >
        <nav className="mobile-menu-nav">
          {items.map((item, i) => {
            const url = resolveUrl(item.url);
            if (!url) return null;
            return (
              <NavLink
                key={item.id}
                to={url}
                className="mobile-menu-item"
                onClick={onClose}
                prefetch="intent"
                style={({ isActive, isPending }) => ({
                  '--i': i,
                  fontWeight: isActive ? 'bold' : undefined,
                  opacity: isPending ? 0.6 : undefined,
                })}
              >
                {HEADER_TITLE_BY_URL[url] ?? item.title}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({ isLoggedIn, cart, mobileOpen, onMobileToggle }) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle mobileOpen={mobileOpen} onToggle={onMobileToggle} />
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle({ mobileOpen, onToggle }) {
  return (
    <button
      className={`header-menu-mobile-toggle reset${mobileOpen ? ' is-open' : ''}`}
      onClick={onToggle}
      aria-expanded={mobileOpen}
      aria-label={mobileOpen ? t('aside.close') : t('nav.mobile_menu')}
    >
      <span className="toggle-icon" aria-hidden="true">
        <span className="icon-hamburger">☰</span>
        <span className="icon-close">✕</span>
      </span>
    </button>
  );
}

function SearchToggle() {
  const { open } = useAside();
  return (
    <button className="reset" onClick={() => open('search')} aria-label={t('aside.search.heading')}>
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({ count }) {
  const { open } = useAside();
  const { publish, shop, cart, prevCart } = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      Panier <span aria-label={t('header.cart.aria', { count })}>{count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({ cart }) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/**
 * Kept for backward compatibility — used by existing mobile Aside in PageLayout if needed.
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const { close } = useAside();

  const resolveUrl = (url) => {
    if (!url) return null;
    return url.includes('myshopify.com') ||
      url.includes(publicStoreDomain) ||
      url.includes(primaryDomainUrl)
      ? new URL(url).pathname
      : url;
  };

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink end onClick={close} prefetch="intent" style={activeLinkStyle} to="/">
          Accueil
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        const url = resolveUrl(item.url);
        if (!url) return null;
        const hasChildren = item.items?.length > 0;

        if (hasChildren) {
          return (
            <div key={item.id} className="header-menu-item-wrapper">
              <NavLink
                className="header-menu-item header-menu-item--parent"
                end
                onClick={close}
                prefetch="intent"
                style={activeLinkStyle}
                to={url}
              >
                {HEADER_TITLE_BY_URL[url] ?? item.title}
                <span className="header-menu-chevron" aria-hidden="true">▾</span>
              </NavLink>
              <ul className="header-menu-dropdown">
                {item.items.map((child) => {
                  const childUrl = resolveUrl(child.url);
                  if (!childUrl) return null;
                  return (
                    <li key={child.id}>
                      <NavLink
                        className="header-menu-dropdown-item"
                        onClick={close}
                        prefetch="intent"
                        style={activeLinkStyle}
                        to={childUrl}
                      >
                        {HEADER_TITLE_BY_URL[childUrl] ?? child.title}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }

        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {HEADER_TITLE_BY_URL[url] ?? item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: t('nav.collections'),
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: t('nav.blog'),
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: t('nav.policies'),
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: t('nav.about'),
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({ isActive, isPending }) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    opacity: isPending ? 0.6 : undefined,
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
