import { IconFleurDeLys, IconMapleLeaf } from './CandyIcons';
import { t } from '../i18n/index.js';

/**
 * The little origin flag Librairie Gourmande puts on Québec and Canadian
 * products. Two tags mean Québec in this catalogue and 55 products carry
 * both, so they're matched as one.
 */
const QUEBEC_TAGS = ['Made in Québec', 'Québec'];
const CANADA_TAGS = ['Canada'];

/**
 * @param {{ tags?: string[], size?: number }}
 */
export function OriginBadge({ tags, size = 20 }) {
  if (!tags?.length) return null;

  const carries = (wanted) => wanted.some((tag) => tags.includes(tag));

  // Québec wins outright: a Québec product is Canadian too, and two flags on
  // one card reads as clutter rather than provenance.
  const origin = carries(QUEBEC_TAGS)
    ? { Icon: IconFleurDeLys, label: t('product.origin.quebec') }
    : carries(CANADA_TAGS)
      ? { Icon: IconMapleLeaf, label: t('product.origin.canada') }
      : null;

  if (!origin) return null;

  return (
    <span className="origin-badge" role="img" aria-label={origin.label} title={origin.label}>
      <origin.Icon size={size} />
    </span>
  );
}
