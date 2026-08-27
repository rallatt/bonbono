import { useLoaderData } from 'react-router';
import { redirectIfHandleIsLocalized } from '../lib/redirect';
import { t } from '../i18n/index.js';
import {
  IconLollipop,
  IconStar,
  IconHeart,
  IconDonut,
  IconRainbow,
  IconBear,
  IconPin,
  IconMail,
} from '../components/CandyIcons';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ data }) => {
  return [{ title: t('meta.page', { name: data?.page.title ?? '' }) }];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({ context, request, params }) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{ page }] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', { status: 404 });
  }

  redirectIfHandleIsLocalized(request, { handle: params.handle, data: page });

  return {
    page,
    googleMapsApiKey: context.env.PUBLIC_GOOGLE_MAPS_API_KEY,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({ context }) {
  return {};
}

// These pages carry their own full-bleed hero/title (in page.body, or —
// for contact — in the StoreMap component below), so the generic title
// header would just duplicate it.
const HANDLES_WITHOUT_GENERIC_HEADER = new Set(['le-patch-bar', 'cadeaux-corpo', 'contact']);

export default function Page() {
  /** @type {LoaderReturnData} */
  const { page, googleMapsApiKey } = useLoaderData();

  return (
    <div className="page">
      {!HANDLES_WITHOUT_GENERIC_HEADER.has(page.handle) && (
        <header>
          <h1>{page.title}</h1>
        </header>
      )}
      {page.handle !== 'contact' && (
        <main dangerouslySetInnerHTML={{ __html: page.body }} />
      )}
      {page.handle === 'contact' && <StoreMap apiKey={googleMapsApiKey} />}
    </div>
  );
}

const CONTACT_HERO_CHIPS = [
  { Icon: IconLollipop, fill: '#fff', bg: 'guimauve' },
  { Icon: IconStar, fill: '#E55A7E', bg: 'melon' },
  { Icon: IconHeart, fill: '#C8F4AE', bg: 'pink' },
  { Icon: IconDonut, fill: '#F8DAE7', bg: 'paper' },
  { Icon: IconRainbow, fill: '#E55A7E', bg: 'melon' },
  { Icon: IconBear, fill: '#41A500', bg: 'guimauve' },
];

function StoreMap({ apiKey }) {
  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=366+rue+de+Castelnau+Est,+Montréal,+QC&zoom=16&language=fr`
    : null;
  const gmapsHref = 'https://www.google.com/maps?q=366+rue+de+Castelnau+Est,+Montréal,+QC';

  return (
    <div className="contact-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-tag">{t('contact.hero.tag')}</span>
          <h1 className="hero-title">
            {t('contact.hero.title_line1')}
            <br />
            <span className="hero-accent">{t('contact.hero.title_accent')}</span>{' '}
            {t('contact.hero.title_suffix')}
          </h1>
          <p className="hero-paragraph">{t('contact.hero.paragraph')}</p>
          <div className="hero-ctas">
            <a href={gmapsHref} target="_blank" rel="noopener noreferrer" className="btn-bold btn-bold--primary">
              {t('store.map.view_gmaps')}
            </a>
            <a href="mailto:info@bonbono.ca" className="btn-bold btn-bold--ghost">
              info@bonbono.ca
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="chip-grid">
            {CONTACT_HERO_CHIPS.map(({ Icon, fill, bg }, i) => (
              <div className={`chip chip--${bg}`} key={i}>
                <Icon fill={fill} size={42} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bold-section">
        <div className="cat-grid contact-info-grid">
          <div className="cat-card">
            <div className="cat-icon"><IconPin size={30} /></div>
            <span className="cat-card-title">{t('contact.info.address_title')}</span>
            <address className="contact-info-detail">366 rue de Castelnau Est<br />Montréal, QC</address>
          </div>
          <div className="cat-card">
            <div className="cat-icon"><IconMail size={30} /></div>
            <span className="cat-card-title">{t('contact.info.email_title')}</span>
            <a href="mailto:info@bonbono.ca" className="contact-info-detail contact-info-link">info@bonbono.ca</a>
          </div>
          <div className="cat-card">
            <div className="cat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#176131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="#176131" stroke="none" />
              </svg>
            </div>
            <span className="cat-card-title">{t('contact.info.social_title')}</span>
            <a
              href="https://www.instagram.com/bonbono.ca/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-info-detail contact-info-link"
            >
              {t('contact.info.social_handle')}
            </a>
          </div>
        </div>

        <div className="contact-map-card">
          {mapSrc ? (
            <iframe
              title={t('store.map.iframe_title')}
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <p className="store-map-missing">
              {t('store.map.unavailable')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
