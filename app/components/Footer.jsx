import {Suspense} from 'react';
import { INSTAGRAM_URL, TIKTOK_URL } from '../lib/social.js';
import {Await, NavLink} from 'react-router';
import { useT } from '../i18n/index.js';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const t = useT();
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="footer">
            {footer?.menu && header.shop.primaryDomain?.url && (
              <FooterMenu
                menu={footer.menu}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            )}
            <p className="footer-copyright">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="footer-extra">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-instagram"
                aria-label={t('footer.instagram')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
                {t('footer.instagram')}
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-instagram"
                aria-label={t('footer.tiktok')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46"/>
                  <path d="M14 3c0 2.5 2 4.5 4.5 4.5"/>
                </svg>
                {t('footer.tiktok')}
              </a>
              <a
                href="https://www.librairiegourmande.ca/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-sister"
              >
                {t('footer.sister_boutique')} — Librairie Gourmande
              </a>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
// Overrides for menu entries whose Shopify title is not what we want to show.
// A function, not a constant: the strings depend on the visitor's locale, and a
// module-level object would freeze French at import time.
function footerTitle(t, url) {
  return {
  '/search': t('search.title'),
  '/collections': t('nav.collections'),
  '/blogs/journal': t('nav.blog'),
  '/policies': t('nav.policies'),
  '/pages/about': t('nav.about'),
  '/policies/privacy-policy': t('footer.privacy'),
  '/policies/refund-policy': t('footer.refund'),
  '/policies/shipping-policy': t('footer.shipping'),
  '/policies/terms-of-service': t('footer.terms'),
  }[url];
}

function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  const t = useT();
  return (
    <nav className="footer-menu" role="navigation">
      {(menu || fallbackFooterMenu(t)).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const title = footerTitle(t, url) ?? item.title;
        const isExternal = !url.startsWith('/');
        const isSearch = url === '/search';
        const label = isSearch ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" style={{display:'inline',verticalAlign:'middle',marginRight:'0.3rem'}}>
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" strokeLinecap="round" />
            </svg>
            {title}
          </>
        ) : title;
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {label}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}

// Only used if the Shopify menu fails to load. A function so its titles follow
// the visitor's locale instead of freezing French at import time.
function fallbackFooterMenu(t) {
  return {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: t('footer.privacy'),
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: t('footer.refund'),
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: t('footer.shipping'),
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: t('footer.terms'),
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
  };
}

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
