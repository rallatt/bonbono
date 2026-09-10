import { redirect, useLoaderData, useRouteLoaderData, Link } from 'react-router';
import { getPaginationVariables, Analytics } from '@shopify/hydrogen';
import { PaginatedResourceSection } from '../components/PaginatedResourceSection';
import { redirectIfHandleIsLocalized } from '../lib/redirect';
import { filterVisibleProducts } from '../lib/productAvailability';
import { ProductItem } from '../components/ProductItem';
import { CATEGORY_ICONS } from '../components/CandyIcons';
import { t } from '../i18n/index.js';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ data }) => {
  return [{ title: t('meta.collection', { name: data?.collection.title ?? '' }) }];
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
async function loadCriticalData({ context, params, request }) {
  const { handle } = params;
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{ collection }] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: { handle, ...paginationVariables },
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: collection });

  return {
    collection: {
      ...collection,
      products: filterVisibleProducts(collection.products),
    },
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

function resolveMenuUrl(url) {
  if (!url) return null;
  try { return new URL(url).pathname; }
  catch { return url; }
}

/** Recursively searches the header menu (up to 3 levels deep) for the item
 * matching this collection, so its sub-collections can be shown as cards. */
function findMenuItemByPath(items, targetPath) {
  for (const item of items ?? []) {
    if (resolveMenuUrl(item.url) === targetPath) return item;
    const nested = findMenuItemByPath(item.items, targetPath);
    if (nested) return nested;
  }
  return null;
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const { collection } = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const menuItems = rootData?.header?.menu?.items ?? [];
  const menuEntry = findMenuItemByPath(menuItems, `/collections/${collection.handle}`);
  const subCollections = (menuEntry?.items ?? [])
    .map((item) => ({ id: item.id, title: item.title, url: resolveMenuUrl(item.url) }))
    .filter((item) => item.url);

  return (
    <div className="collection">
      <div className="page-title-band">
        <span className="hero-tag">{t('nav.collections')}</span>
        <h1>{collection.title}</h1>
        {collection.description && <p>{collection.description}</p>}
      </div>
      {subCollections.length > 0 && (
        <div className="cat-grid collection-subnav">
          {subCollections.map((item, i) => {
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
      )}
      <PaginatedResourceSection
        connection={collection.products}
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
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
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

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
