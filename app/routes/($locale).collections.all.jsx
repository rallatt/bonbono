import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import { getPaginationVariables } from '@shopify/hydrogen';
import { PaginatedResourceSection } from '../components/PaginatedResourceSection';
import { filterVisibleProducts } from '../lib/productAvailability';
import { ProductItem } from '../components/ProductItem';
import { CATEGORY_ICONS } from '../components/CandyIcons';
import { resolveMenuUrl } from '../lib/menu.js';
import { metaT, useT } from '../i18n/index.js';

// The shop front door used to be an unsorted wall of every product. These are
// the orderings offered instead; best sellers lead, since an arbitrary order
// is nobody's idea of a shop. `newest` keeps its name because the homepage
// "Nouveautés" chip has always linked to ?sort=newest.
const SORT_OPTIONS = [
  { key: 'popular', sortKey: 'BEST_SELLING', reverse: false, labelKey: 'collections.sort.popular' },
  { key: 'newest', sortKey: 'CREATED_AT', reverse: true, labelKey: 'collections.sort.newest' },
  { key: 'price-asc', sortKey: 'PRICE', reverse: false, labelKey: 'collections.sort.price_asc' },
  { key: 'price-desc', sortKey: 'PRICE', reverse: true, labelKey: 'collections.sort.price_desc' },
];
const DEFAULT_SORT = SORT_OPTIONS[0];

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ matches }) => {
  const t = metaT(matches);
  return [{ title: t('meta.products') }];
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
async function loadCriticalData({ context, request }) {
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });
  const requested = new URL(request.url).searchParams.get('sort');
  const sort = SORT_OPTIONS.find((option) => option.key === requested) ?? DEFAULT_SORT;

  const [{ products }] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        sortKey: sort.sortKey,
        reverse: sort.reverse,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return { products: filterVisibleProducts(products), sort: sort.key };
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

export default function Collection() {
  const t = useT();
  /** @type {LoaderReturnData} */
  const { products, sort } = useLoaderData();
  const rootData = useRouteLoaderData('root');
  // The top-level shop categories, straight from the Shopify menu. Each one
  // carries its own sub-navigation, so this page only needs the first level.
  const categories = (rootData?.header?.menu?.items ?? [])
    .map((item) => ({ id: item.id, title: item.title, url: resolveMenuUrl(item.url) }))
    .filter((item) => item.url?.startsWith('/collections/'));

  return (
    <div className="collection">
      <div className="page-title-band">
        <span className="hero-tag">{t('nav.collections')}</span>
        <h1>{sort === 'newest' ? t('collections.newest.title') : t('collections.all.title')}</h1>
      </div>

      {categories.length > 0 && (
        <div className="cat-grid collection-subnav">
          {categories.map((item, i) => {
            const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
            return (
              <Link className="cat-card" key={item.id} prefetch="intent" to={item.url}>
                <div className="cat-icon">
                  <Icon size={34} />
                </div>
                <span className="cat-card-title">{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="shop-sort">
        <span className="shop-sort-label">{t('collections.sort.label')}</span>
        <div className="tabs-row">
          {SORT_OPTIONS.map((option) => (
            <Link
              className={`tab-pill${option.key === sort ? ' is-active' : ''}`}
              key={option.key}
              preventScrollReset
              to={`?sort=${option.key}`}
            >
              {t(option.labelKey)}
            </Link>
          ))}
        </div>
      </div>

      <PaginatedResourceSection
        connection={products}
        resourcesClassName="products-grid"
      >
        {({ node: product, index }) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    productType
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        title
        image {
          __typename
          id
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        product {
          handle
          title
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
