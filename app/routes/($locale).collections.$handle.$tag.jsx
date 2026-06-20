import { redirect, useLoaderData } from 'react-router';
import { getPaginationVariables, Analytics } from '@shopify/hydrogen';
import { PaginatedResourceSection } from '../components/PaginatedResourceSection';
import { ProductItem } from '../components/ProductItem';

export const meta = ({ data }) => {
  return [{ title: `Bonbono | ${data?.collection.title ?? ''}` }];
};

export async function loader({ context, params, request }) {
  const { handle, tag } = params;
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request, { pageBy: 24 });

  if (!handle) throw redirect('/collections');

  const decodedTag = decodeURIComponent(tag).replace(/-/g, ' ');

  const { collection } = await storefront.query(COLLECTION_TAG_QUERY, {
    variables: { handle, tag: decodedTag, ...paginationVariables },
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, { status: 404 });
  }

  return { collection, tag: decodedTag };
}

export default function CollectionTag() {
  const { collection, tag } = useLoaderData();

  return (
    <div className="collection">
      <div className="page-title-band">
        <h1>{collection.title}</h1>
        {tag && <p>{tag}</p>}
      </div>
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
        data={{ collection: { id: collection.id, handle: collection.handle } }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyTagItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment TagProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice { ...MoneyTagItem }
      maxVariantPrice { ...MoneyTagItem }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
`;

const COLLECTION_TAG_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CollectionTag(
    $handle: String!
    $tag: String!
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
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: [{ tag: $tag }]
      ) {
        nodes { ...TagProductItem }
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
