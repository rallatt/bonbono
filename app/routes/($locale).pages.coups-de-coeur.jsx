import { useLoaderData } from 'react-router';
import { ProductItem } from '../components/ProductItem';
import { isProductVisible } from '../lib/productAvailability';
import { t } from '../i18n/index.js';

/**
 * Team picks (P1-4). Each staff member tags their products
 * `coupdecoeur<prénom>` in Shopify — e.g. `coupdecoeurroxanne` — and this page
 * groups them by person. Adding or removing someone is a one-line change to
 * TEAM plus a `favourites.person.*` string in fr.js; no Shopify page needed.
 */
const TEAM = [
  { key: 'laurie' },
  { key: 'steph' },
  { key: 'roxanne' },
  { key: 'jessie' },
  { key: 'maria' },
  { key: 'yana' },
  // Laura-Lee's tag drops the hyphen; normalizeTag() makes the match forgiving
  // either way (coupdecoeurlauralee, coupdecoeur-laura-lee, …).
  { key: 'lauralee' },
];

const TAG_PREFIX = 'coupdecoeur';

// The wildcard catches any `coupdecoeur…` tag even for a name that isn't in
// TEAM yet; the explicit terms keep the query working if wildcards are ever
// refused for this field.
const FAVOURITES_SEARCH = [
  `tag:${TAG_PREFIX}*`,
  ...TEAM.map((person) => `tag:${TAG_PREFIX}${person.key}`),
].join(' OR ');

/**
 * Tags get typed by hand in the admin, so match them forgivingly: case,
 * accents-free spacing, a leading `#` or stray punctuation shouldn't matter.
 * @param {string} tag
 */
function normalizeTag(tag) {
  return tag.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: t('favourites.meta') }];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({ context }) {
  const { products } = await context.storefront.query(FAVOURITES_QUERY, {
    variables: { query: FAVOURITES_SEARCH, first: 250 },
  });

  const visible = (products?.nodes ?? []).filter(isProductVisible);

  const groups = TEAM.map((person) => ({
    key: person.key,
    name: t(`favourites.person.${person.key}`),
    products: visible.filter((product) =>
      (product.tags ?? []).some(
        (tag) => normalizeTag(tag) === `${TAG_PREFIX}${person.key}`,
      ),
    ),
  })).filter((group) => group.products.length > 0);

  return { groups };
}

export default function Favourites() {
  /** @type {LoaderReturnData} */
  const { groups } = useLoaderData();

  return (
    <div className="favourites">
      <div className="page-title-band">
        <span className="hero-tag">{t('favourites.eyebrow')}</span>
        <h1>{t('favourites.title')}</h1>
        <p>{t('favourites.intro')}</p>
      </div>

      {groups.length === 0 ? (
        <p className="favourites-empty">{t('favourites.empty')}</p>
      ) : (
        groups.map((group) => (
          <section className="favourites-group" key={group.key}>
            <h2 className="favourites-group-title">
              {t('favourites.person_heading', { name: group.name })}
            </h2>
            <div className="products-grid">
              {group.products.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 4 ? 'eager' : undefined}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

const FAVOURITE_ITEM_FRAGMENT = `#graphql
  fragment FavouriteItem on Product {
    id
    handle
    title
    productType
    tags
    featuredImage {
      id
      altText
      url
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
`;

const FAVOURITES_QUERY = `#graphql
  query Favourites(
    $country: CountryCode
    $language: LanguageCode
    $query: String
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        ...FavouriteItem
      }
    }
  }
  ${FAVOURITE_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/pages.coups-de-coeur').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
