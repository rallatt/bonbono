import { useLoaderData, Link } from 'react-router';
import { Image } from '@shopify/hydrogen';
import { MockShopNotice } from '../components/MockShopNotice';
import logoOvaleImg from '../assets/cleanLogo.png';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: 'Bonbono — Bonbons et cadeaux' }];
};

export async function loader({ context }) {
  const { storefront } = context;

  const [categoriesData] = await Promise.all([
    storefront.query(HOMEPAGE_CATEGORIES_QUERY),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    categories: [
      categoriesData.bonbons,
      categoriesData.cuisine,
      categoriesData.papeterie,
      categoriesData.nouveautes,
    ].filter(Boolean),
  };
}

export default function Homepage() {
  const data = useLoaderData();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <HeroBanner />
      <FeaturedCategories categories={data.categories} />
    </div>
  );
}

function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-banner-content">
        <img src={logoOvaleImg} alt="Bonbono" className="hero-banner-logo-main" />
        <p className="hero-banner-tagline">Des bonbons. Et d'autres mauvaises idées.</p>
      </div>
      <Link to="/collections/all" className="hero-banner-cta">
        Découvrir
      </Link>
    </div>
  );
}

const CATEGORY_COLORS = ['#F8DAE7', '#C8F4AE', '#C8F4AE', '#F8DAE7'];

function FeaturedCategories({ categories }) {
  if (!categories?.length) return null;
  return (
    <section className="featured-categories">
      <h2 className="featured-categories-title">Nos catégories</h2>
      <div className="featured-categories-grid">
        {categories.map((collection, i) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            className="featured-category-card"
            style={{ '--card-bg': CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
          >
            {collection.image && (
              <div className="featured-category-image">
                <Image
                  data={collection.image}
                  sizes="(min-width: 45em) 25vw, 50vw"
                  alt={collection.image.altText || collection.title}
                />
              </div>
            )}
            <span className="featured-category-title">{collection.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const HOMEPAGE_CATEGORIES_QUERY = `#graphql
  fragment CategoryCollection on Collection {
    id
    handle
    title
    image {
      id
      url
      altText
      width
      height
    }
  }
  query HomepageCategories($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    bonbons: collection(handle: "bonbons") { ...CategoryCollection }
    cuisine: collection(handle: "accessoires-de-cuisine") { ...CategoryCollection }
    papeterie: collection(handle: "papeterie-autres-trouvailles") { ...CategoryCollection }
    nouveautes: collection(handle: "nouveautes") { ...CategoryCollection }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
