import {Money} from '@shopify/hydrogen';
import { useT } from '../i18n/index.js';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  const t = useT();
  const isOnSale =
    compareAtPrice &&
    price &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div aria-label={t('product.price.aria')} className="product-price" role="group">
      {isOnSale ? (
        <div className="product-price-on-sale">
          <Money data={price} />
          <s>
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <Money data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
