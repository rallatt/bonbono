import {Image} from '@shopify/hydrogen';
import {t} from '../i18n/index.js';
import {CandyImageWrapper} from './CandyLoader.jsx';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image}) {
  if (!image) {
    return <div className="product-image" />;
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
