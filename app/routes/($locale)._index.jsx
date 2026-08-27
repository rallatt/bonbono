import { useLoaderData, useRouteLoaderData, Link } from 'react-router';
import { MockShopNotice } from '../components/MockShopNotice';
import { t } from '../i18n/index.js';
import {
  IconLollipop,
  IconStar,
  IconHeart,
  IconDonut,
  IconRainbow,
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
      <CtaStrip />
    </div>
  );
}

const HERO_CHIPS = [
  { Icon: IconLollipop, fill: '#fff', bg: 'guimauve' },
  { Icon: IconStar, fill: '#E55A7E', bg: 'melon' },
  { Icon: IconHeart, fill: '#C8F4AE', bg: 'pink' },
  { Icon: IconDonut, fill: '#F8DAE7', bg: 'paper' },
  { Icon: IconRainbow, fill: '#E55A7E', bg: 'melon' },
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
        <div className="hero-ctas">
          <Link to="/collections/all" className="btn-bold btn-bold--primary">
            {t('home.hero.cta_shop')}
          </Link>
          <Link to="/pages/le-patch-bar" className="btn-bold btn-bold--ghost">
            {t('home.hero.cta_patchbar')}
          </Link>
        </div>
      </div>
      <div className="hero-visual">
        <div className="chip-grid">
          {HERO_CHIPS.map(({ Icon, fill, bg }, i) => (
            <div className={`chip chip--${bg}`} key={i}>
              <Icon fill={fill} size={42} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [1, 2, 3, 4];
  return (
    <section className="bold-section">
      <div className="bold-section-head">
        <span className="eyebrow">{t('home.steps.eyebrow')}</span>
        <h2>{t('home.steps.title')}</h2>
        <p>{t('home.steps.subtitle')}</p>
      </div>
      <div className="steps-grid">
        {steps.map((n) => (
          <div className="step-card" key={n}>
            <div className="step-num">{n}</div>
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

function CtaStrip() {
  return (
    <div className="cta-strip">
      <div>
        <h2>{t('home.cta_strip.title')}</h2>
        <p>{t('home.cta_strip.body')}</p>
      </div>
      <Link to="/collections/all" className="btn-bold btn-bold--strip">
        {t('home.cta_strip.button')}
      </Link>
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
