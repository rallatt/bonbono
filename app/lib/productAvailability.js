// Books (LIVRES) stay listed even out of stock — the bookstore takes
// special orders. Everything else disappears once it can't be sold,
// since an out-of-stock non-book item led to a checkout error.
const ALWAYS_VISIBLE_PRODUCT_TYPE = 'LIVRES';

/**
 * @param {{productType?: string, variants?: {nodes?: {availableForSale?: boolean}[]}}} product
 */
export function isProductVisible(product) {
  if (product.productType === ALWAYS_VISIBLE_PRODUCT_TYPE) return true;
  return Boolean(product.variants?.nodes?.[0]?.availableForSale);
}

/**
 * @param {{nodes: object[]}} connection
 */
export function filterVisibleProducts(connection) {
  if (!connection?.nodes) return connection;
  return { ...connection, nodes: connection.nodes.filter(isProductVisible) };
}
