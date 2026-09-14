import { Suspense } from 'react';
import { useLoaderData, useRouteLoaderData, Link, Await } from 'react-router';
import { MockShopNotice } from '../components/MockShopNotice';
import { t } from '../i18n/index.js';
import { GIFT_CARD_URL } from '../lib/giftCard.js';
import { fetchInstagramPosts } from '../lib/instagram.js';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social.js';
import {
  IconSearch,
  IconStar,
  IconHeart,
  IconPumpkin,
  IconLunchbox,
  IconBear,
  CATEGORY_ICONS,
} from '../components/CandyIcons';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: t('home.meta') }];
};

export async function loader({ context }) {
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    // Deliberately not awaited. Instagram is a third party we don't control,
    // so it streams in after the page rather than holding up the first byte.
    instagramPosts: fetchInstagramPosts({
      env: context.env,
      withCache: context.withCache,
    }),
  };
}

function resolveMenuUrl(url) {
  if (!url) return null;
  try { return new URL(url).pathname; }
  catch { return url; }
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
      {data.isShopLinked ? null : <MockShopNotice />}
      <HeroBanner />
      <HowItWorks />
      <FeaturedCategories navItems={navItems} />
      <GiftCardPromo />
      <InstagramFeed posts={data.instagramPosts} />
    </div>
  );
}

// The four labelled chips are the P0-5 copy; the labels came off once and
// the client asked for them back. Halloween and La rentrée use icons that
// actually match the category (pumpkin, lunchbox) rather than reusing an
// unrelated candy icon. Each labelled chip links to its destination (P1-3);
// the remaining two stay decorative and unlabelled (P3-3).
const HERO_CHIPS = [
  { Icon: IconSearch, fill: '#fff', bg: 'guimauve', to: '/search', labelKey: 'home.hero_chip.search' },
  { Icon: IconStar, fill: '#E55A7E', bg: 'melon', to: '/collections/all?sort=newest', labelKey: 'home.hero_chip.new' },
  { Icon: IconHeart, fill: '#C8F4AE', bg: 'pink', to: '/pages/coups-de-coeur', labelKey: 'home.hero_chip.favourites' },
  { Icon: IconPumpkin, fill: '#F8DAE7', bg: 'paper', to: '/collections/halloween-bonbono', labelKey: 'home.hero_chip.halloween' },
  { Icon: IconLunchbox, fill: '#E55A7E', bg: 'melon', to: '/collections/la-rentree', labelKey: 'home.hero_chip.back_to_school' },
  { Icon: IconBear, fill: '#41A500', bg: 'guimauve' },
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
          {HERO_CHIPS.map(({ Icon, fill, bg, to, labelKey }, i) => {
            const circle = (
              <span className={`chip chip--${bg}`}>
                <Icon fill={fill} size={54} />
              </span>
            );
            // The label sits inside the link, so the caption is clickable too
            // and screen readers announce the same words people can see.
            return to ? (
              <Link to={to} className="chip-cell" key={i}>
                {circle}
                <span className="chip-label">{t(labelKey)}</span>
              </Link>
            ) : (
              <div className="chip-cell" key={i}>
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
