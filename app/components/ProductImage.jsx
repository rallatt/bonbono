import {Image} from '@shopify/hydrogen';
import { useT } from '../i18n/index.js';
import {CandyImageWrapper, CandyPlaceholder} from './CandyLoader.jsx';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image}) {
  const t = useT();
  if (!image) {
    return (
      <div className="product-image">
        <CandyPlaceholder />
      </div>
    );
  }
  return (
    <div className="product-image">
      <CandyImageWrapper>
        <Image
          alt={image.altText || t('product.image.alt')}
          data={image}
          key={image.id}
          sizes="(min-width: 45em) 38vw, 90vw"
        />
      </CandyImageWrapper>
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
