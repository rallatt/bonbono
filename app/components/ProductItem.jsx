import { Link } from 'react-router';
import { Image, Money, CartForm } from '@shopify/hydrogen';
import { useVariantUrl } from '../lib/variants';
import { t } from '../i18n/index.js';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({ product, loading }) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const firstVariant = product.variants?.nodes?.[0];

  return (
    <div className="product-item">
      <Link className="product-item-link" prefetch="intent" to={variantUrl}>
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}
        <div className="product-item-info">
          <h4>{product.title}</h4>
          <p className="product-item-price">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
        </div>
      </Link>
      {firstVariant?.availableForSale ? (
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={{ lines: [{ merchandiseId: firstVariant.id, quantity: 1 }] }}
        >
          <button type="submit" className="product-item-add-btn">
            {t('product.add_to_cart')}
          </button>
        </CartForm>
      ) : (
        <Link to={variantUrl} className="product-item-add-btn product-item-add-btn--unavailable">
          {t('product.view')}
        </Link>
      )}
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
