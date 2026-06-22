import { useLoaderData, useRouteLoaderData, Link } from 'react-router';
import { MockShopNotice } from '../components/MockShopNotice';
import logoOvaleImg from '../assets/cleanLogo.png';
import { t } from '../i18n/index.js';

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
      <FeaturedCategories navItems={navItems} />
    </div>
  );
}

function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-banner-content">
        <img src={logoOvaleImg} alt="Bonbono" className="hero-banner-logo-main" />
        <p className="hero-banner-tagline">{t('home.tagline')}</p>
      </div>
      <Link to="/collections/all" className="hero-banner-cta">
        {t('home.cta')}
      </Link>
    </div>
  );
}

const CATEGORY_COLORS = ['#F8DAE7', '#C8F4AE', '#C8F4AE', '#F8DAE7'];

function FeaturedCategories({ navItems }) {
  if (!navItems?.length) return null;
  return (
    <section className="featured-categories">
      <h2 className="featured-categories-title">{t('home.categories')}</h2>
      <div className="featured-categories-grid">
        {navItems.map((item, i) => (
          <Link
            key={item.id}
            to={item.url}
            className="featured-category-card"
            style={{ '--card-bg': CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
          >
            <div className="featured-category-image" />
            <span className="featured-category-title">{item.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
