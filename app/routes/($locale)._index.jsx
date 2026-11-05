import { Suspense } from 'react';
import { useLoaderData, useRouteLoaderData, Link, Await } from 'react-router';
import { Image, Money } from '@shopify/hydrogen';
import { MockShopNotice } from '../components/MockShopNotice';
import { t } from '../i18n/index.js';
import { GIFT_CARD_URL } from '../lib/giftCard.js';
import { fetchInstagramPosts } from '../lib/instagram.js';
import { filterVisibleProducts } from '../lib/productAvailability.js';
import { resolveMenuUrl } from '../lib/menu.js';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social.js';
import {
  IconSearch,
  IconStar,
  IconHeart,
  IconFirTree,
  IconLollipop,
  IconBear,
  CATEGORY_ICONS,
} from '../components/CandyIcons';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: t('home.meta') }];
};

// The seasonal band. Everything season-specific is gathered here, so the
// next swap is this block plus the home.season.* strings — nothing else.
const SEASON_COLLECTION = 'temps-des-fetes-bonbono';
// A handful, not the whole collection: the band is a doorway to the
// collection, not a second catalogue.
const SEASON_PICKS = 4;

// Hand-picked to lead the seasonal band; the rest follow in best-selling order.
const SEASON_PINNED = [
  'calendrier-de-lavent-gourmand-335-g-le-comptoir-de-mathilde',
  'calendrier-de-lavent-chocolat-biologique-equitable-180-g-galerie-au-chocolat',
];

/**
 * Pinned products first, then the rest. Anything without a photo is dropped —
 * the band is a shop window and a blank tile reads as broken.
 * @param {Array<{handle: string, featuredImage?: unknown}>} products
 */
function orderSeasonPicks(products) {
  const shown = products.filter((product) => product.featuredImage);
  const rank = (product) => {
    const pinned = SEASON_PINNED.indexOf(product.handle);
    return pinned === -1 ? SEASON_PINNED.length : pinned;
  };
  return shown.sort((a, b) => rank(a) - rank(b));
}

export async function loader({ context }) {
  // A seasonal band is nice-to-have, so a failure here must not take the
  // homepage down with it.
  const season = await context.storefront
    .query(SEASON_QUERY, {
      cache: context.storefront.CacheShort(),
      variables: { first: 50, handle: SEASON_COLLECTION },
    })
    .then((data) => filterVisibleProducts(data?.collection?.products)?.nodes ?? [])
    .then(orderSeasonPicks)
    .catch(() => []);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    seasonPicks: season.slice(0, SEASON_PICKS),
    // Deliberately not awaited. Instagram is a third party we don't control,
    // so it streams in after the page rather than holding up the first byte.
    instagramPosts: fetchInstagramPosts({
      env: context.env,
      withCache: context.withCache,
    }),
  };
}

export default function Homepage() {
  const data = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const menuItems = rootData?.header?.menu?.items ?? [];
  const navItems = menuItems
    .filter((item) => !item.title.toLowerCase().includes('contact'))
    .map((item) => ({ id: item.id, title: item.title, url: resolveMenuUrl(item.url) }))
    .filter((item) => item.url);

  return (
    <div className="home">
      <SeasonBand products={data.seasonPicks} />
      {data.isShopLinked ? null : <MockShopNotice />}
      <HeroBanner />
      <HowItWorks />
      <FeaturedCategories navItems={navItems} />
      <GiftCardPromo />
      <InstagramFeed posts={data.instagramPosts} />
    </div>
  );
}

// The labelled chips are the P0-5 copy; the labels came off once and the
// client asked for them back. Each labelled chip links to its destination
// (P1-3); the last one stays decorative and unlabelled (P3-3).
// The season chip leads the grid and is the only one in costume — the rest
// keep the house pastels. To retire the season, drop its `season` flag and
// move it out of first place.
const HERO_CHIPS = [
  { Icon: IconFirTree, fill: '#FFFBF3', bg: 'season', season: true, to: `/collections/${SEASON_COLLECTION}`, labelKey: 'home.hero_chip.season' },
  { Icon: IconSearch, fill: '#fff', bg: 'guimauve', to: '/search', labelKey: 'home.hero_chip.search' },
  { Icon: IconStar, fill: '#E55A7E', bg: 'melon', to: '/collections/all?sort=newest', labelKey: 'home.hero_chip.new' },
  { Icon: IconHeart, fill: '#C8F4AE', bg: 'pink', to: '/pages/coups-de-coeur', labelKey: 'home.hero_chip.favourites' },
  { Icon: IconBear, fill: '#E55A7E', bg: 'melon', to: '/collections/bonbons-swedish-candy', labelKey: 'home.hero_chip.swedish' },
  { Icon: IconLollipop, fill: '#41A500', bg: 'guimauve', to: '/collections/bonbons-sans-sucre', labelKey: 'home.hero_chip.no_sugar' },
];

function HeroBanner() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <span className="hero-tag">{t('home.hero.tag')}</span>
        <h1 className="hero-title">
          {t('home.hero.title_line1')}
          <br />
          {t('home.hero.title_prefix')}{' '}
          <span className="hero-accent">{t('home.hero.title_accent')}</span>{' '}
          {t('home.hero.title_suffix')}
        </h1>
        <p className="hero-paragraph">{t('home.hero.paragraph')}</p>
        <p className="hero-paragraph">{t('home.hero.paragraph2')}</p>
        <div className="hero-ctas">
          <Link to="/collections/all" className="btn-bold btn-bold--primary">
            {t('home.hero.cta_shop')}
          </Link>
          <Link to="/pages/le-patch-bar" className="btn-bold btn-bold--shine">
            {t('home.hero.cta_patchbar')}
          </Link>
        </div>
      </div>
      <div className="hero-visual">
        <div className="chip-grid">
          {HERO_CHIPS.map(({ Icon, fill, bg, to, labelKey, season }, i) => {
            const circle = (
              <span className={`chip chip--${bg}`}>
                <Icon fill={fill} size={54} />
              </span>
            );
            const cellClass = `chip-cell${season ? ' chip-cell--season' : ''}`;
            // The label sits inside the link, so the caption is clickable too
            // and screen readers announce the same words people can see.
            return to ? (
              <Link to={to} className={cellClass} key={i}>
                {circle}
                <span className="chip-label">{t(labelKey)}</span>
              </Link>
            ) : (
              <div className={cellClass} key={i}>
                {circle}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// "Ajoute une touche cadeau" (step 2) is temporarily dropped — gift wrapping
// isn't sourced yet — but kept out of the array (not deleted) so it's a
// one-line change to bring back. Displayed numbering (1-2-3) is the card's
// position, not its original slot, so removing/restoring a step doesn't
// require renumbering anything else.
const ACTIVE_STEPS = [1, 3, 4];

/**
 * Seasonal doorway to the current season's collection. Shows a few real
 * products rather than the full grid, and renders nothing at all once the
 * collection is empty — so it disappears by itself after the season.
 */
function SeasonBand({ products }) {
  if (!products?.length) return null;

  return (
    <section className="season-band-wrap" aria-labelledby="season-band-title">
      <div className="season-band">
        <div className="season-band-copy">
          <span className="season-band-eyebrow">{t('home.season.eyebrow')}</span>
          <h2 id="season-band-title">{t('home.season.title')}</h2>
          <p>{t('home.season.paragraph')}</p>
          <Link to={`/collections/${SEASON_COLLECTION}`} className="btn-bold btn-bold--season">
            {t('home.season.cta')}
          </Link>
        </div>
        <div className="season-band-grid">
          {products.map((product) => (
            <Link
              className="season-pick"
              key={product.id}
              prefetch="intent"
              to={`/products/${product.handle}`}
            >
              <div className="season-pick-photo">
                {product.featuredImage ? (
                  <Image
                    alt={product.featuredImage.altText || product.title}
                    aspectRatio="1/1"
                    data={product.featuredImage}
                    sizes="(min-width: 60em) 180px, 40vw"
                  />
                ) : null}
              </div>
              <h4>{product.title}</h4>
              <span><Money data={product.priceRange.minVariantPrice} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bold-section">
      <div className="bold-section-head">
        <span className="eyebrow">{t('home.steps.eyebrow')}</span>
        <h2>{t('home.steps.title')}</h2>
      </div>
      <div className="steps-grid">
        {ACTIVE_STEPS.map((n, i) => (
          <div className="step-card" key={n}>
            <div className="step-num">{i + 1}</div>
            <h3>{t(`home.steps.${n}.title`)}</h3>
            <p>{t(`home.steps.${n}.body`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedCategories({ navItems }) {
  if (!navItems?.length) return null;
  return (
    <section className="bold-section">
      <div className="bold-section-head">
        <span className="eyebrow">{t('home.categories.eyebrow')}</span>
        <h2>{t('home.categories')}</h2>
      </div>
      <div className="cat-grid">
        {navItems.map((item, i) => {
          const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
          return (
            <Link key={item.id} to={item.url} className="cat-card">
              <div className="cat-icon">
                <Icon size={34} />
              </div>
              <span className="cat-card-title">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function GiftCardPromo() {
  return (
    <section className="giftcard-promo">
      <div className="giftcard-promo-copy">
        <h2>{t('home.giftcard.title')}</h2>
        <p>
          {t('home.giftcard.body_before')}
          <a
            className="giftcard-promo-link"
            href="https://librairiegourmande.ca"
            target="_blank"
            rel="noreferrer"
            aria-label={t('home.giftcard.body_link_aria')}
          >
            {t('home.giftcard.body_link')}
          </a>
          {t('home.giftcard.body_after')}
        </p>
        <Link to={GIFT_CARD_URL} className="btn-bold btn-bold--primary">
          {t('home.giftcard.button')}
        </Link>
      </div>
      <div className="giftcard-promo-visual">
        <div className="giftcard-mini">
          <span className="giftcard-mini-word">{t('home.giftcard.card_label')}</span>
          <span className="giftcard-mini-amount">50 $</span>
        </div>
      </div>
    </section>
  );
}

function InstagramFeed({ posts }) {
  return (
    <Suspense fallback={null}>
      <Await resolve={posts} errorElement={null}>
        {(resolved) =>
          resolved?.length ? (
            <section className="insta-section">
              <div className="insta-head">
                <span className="eyebrow">{t('home.instagram.eyebrow')}</span>
                <h2>{t('home.instagram.title')}</h2>
              </div>
              <div className="insta-grid">
                {resolved.map((post) => (
                  <a
                    className="insta-card"
                    href={post.permalink}
                    key={post.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <img
                      alt={post.caption || t('home.instagram.image_alt')}
                      loading="lazy"
                      src={post.imageUrl}
                    />
                  </a>
                ))}
              </div>
              <a
                className="btn-bold btn-bold--primary insta-cta"
                href={INSTAGRAM_URL}
                rel="noreferrer"
                target="_blank"
              >
                {t('home.instagram.cta', { handle: INSTAGRAM_HANDLE })}
              </a>
            </section>
          ) : null
        }
      </Await>
    </Suspense>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */

const SEASON_QUERY = `#graphql
  query HomepageSeason(
    $language: LanguageCode,
    $country: CountryCode,
    $first: Int!,
    $handle: String!
  ) @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      products(first: $first, sortKey: BEST_SELLING) {
        nodes {
          id
          handle
          title
          productType
          featuredImage {
            id
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            nodes {
              id
              availableForSale
            }
          }
        }
      }
    }
  }
`;
