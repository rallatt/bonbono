/**
 * Helpers for the Shopify-authored header menu. The storefront renders its
 * nav from the `main-menu-bonbono` menu, which returns absolute URLs on the
 * shop's primary domain — so every link has to be reduced to a path first.
 */

/**
 * @param {string | null | undefined} url
 * @returns {string | null} the path portion, or the original value if unparseable
 */
export function resolveMenuUrl(url) {
  if (!url) return null;
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/**
 * Recursively searches the header menu (up to 3 levels deep) for the item
 * matching a path, so its sub-collections can be shown as cards.
 * @param {Array<object> | undefined} items
 * @param {string} targetPath
 */
export function findMenuItemByPath(items, targetPath) {
  for (const item of items ?? []) {
    if (resolveMenuUrl(item.url) === targetPath) return item;
    const nested = findMenuItemByPath(item.items, targetPath);
    if (nested) return nested;
  }
  return null;
}
