const INK = '#176131';

/**
 * Small stroke-based candy/patch glyphs used on the homepage hero chips,
 * category cards, and the Patch Bar page. Kept as plain inline SVG (no
 * emoji) so they scale and recolor cleanly at any size.
 * @param {{ fill?: string, size?: number, className?: string }} props
 */
function base(viewBox, children) {
  return function Icon({ fill = 'none', size = 40, className }) {
    return (
      <svg
        viewBox={viewBox}
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
      >
        {children(fill)}
      </svg>
    );
  };
}

export const IconLollipop = base('0 0 48 48', (fill) => (
  <>
    <circle cx="24" cy="18" r="14" fill={fill === 'none' ? '#fff' : fill} stroke={INK} strokeWidth="2.5" />
    <path d="M24 6 A9 9 0 0 1 33 15" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="32" x2="24" y2="44" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  </>
));

export const IconStar = base('0 0 48 48', (fill) => (
  <path
    d="M24 4 L29 18 L44 18 L32 27 L37 42 L24 33 L11 42 L16 27 L4 18 L19 18 Z"
    fill={fill}
    stroke={INK}
    strokeWidth="2.5"
    strokeLinejoin="round"
  />
));

export const IconHeart = base('0 0 48 48', (fill) => (
  <path
    d="M24 40 C10 30 4 22 4 14.5 C4 8 9 4 14.5 4 C19 4 22 6.5 24 10 C26 6.5 29 4 33.5 4 C39 4 44 8 44 14.5 C44 22 38 30 24 40 Z"
    fill={fill}
    stroke={INK}
    strokeWidth="2.5"
    strokeLinejoin="round"
  />
));

export const IconDonut = base('0 0 48 48', (fill) => (
  <>
    <circle cx="24" cy="24" r="17" fill={fill} stroke={INK} strokeWidth="2.5" />
    <circle cx="24" cy="24" r="6" fill={fill === 'none' ? 'none' : '#FFFBF3'} stroke={INK} strokeWidth="2.2" />
    <line x1="16" y1="14" x2="19" y2="17" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="30" y1="12" x2="27" y2="16" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="34" y1="22" x2="30" y2="24" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </>
));

export const IconRainbow = base('0 0 48 40', (fill) => (
  <>
    <path d="M4 38 A20 20 0 0 1 44 38" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <path d="M10 38 A14 14 0 0 1 38 38" fill="none" stroke={fill === 'none' ? '#E55A7E' : fill} strokeWidth="4.5" strokeLinecap="round" />
    <path d="M16 38 A8 8 0 0 1 32 38" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
  </>
));

export const IconBear = base('0 0 48 48', (fill) => (
  <>
    <circle cx="16" cy="12" r="5" fill={fill} stroke={INK} strokeWidth="2.2" />
    <circle cx="32" cy="12" r="5" fill={fill} stroke={INK} strokeWidth="2.2" />
    <rect x="12" y="14" width="24" height="26" rx="12" fill={fill} stroke={INK} strokeWidth="2.5" />
    {fill !== 'none' && (
      <>
        <circle cx="19" cy="26" r="1.6" fill={INK} />
        <circle cx="29" cy="26" r="1.6" fill={INK} />
      </>
    )}
  </>
));

export const IconFlower = base('0 0 48 48', (fill) => (
  <>
    <circle cx="24" cy="14" r="8" fill={fill} stroke={INK} strokeWidth="2" />
    <circle cx="34" cy="24" r="8" fill={fill} stroke={INK} strokeWidth="2" />
    <circle cx="24" cy="34" r="8" fill={fill} stroke={INK} strokeWidth="2" />
    <circle cx="14" cy="24" r="8" fill={fill} stroke={INK} strokeWidth="2" />
    <circle cx="24" cy="24" r="7" fill={fill === 'none' ? 'none' : '#E55A7E'} stroke={INK} strokeWidth="2" />
  </>
));

export const IconFlame = base('0 0 48 48', (fill) => (
  <path
    d="M24 4 C14 14 10 20 10 28 A14 14 0 0 0 38 28 C38 22 34 18 30 14 C32 20 28 22 26 20 C24 17 26 12 24 4 Z"
    fill={fill}
    stroke={INK}
    strokeWidth="2.5"
    strokeLinejoin="round"
  />
));

export const IconCherries = base('0 0 48 48', (fill) => (
  <>
    <circle cx="16" cy="34" r="8" fill={fill} stroke={INK} strokeWidth="2.2" />
    <circle cx="32" cy="34" r="8" fill={fill} stroke={INK} strokeWidth="2.2" />
    <path d="M16 26 C16 10 24 8 30 6" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M32 26 C32 16 30 10 30 6" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
  </>
));

export const IconRibbon = base('0 0 48 48', (fill) => (
  <>
    <path d="M14 24 L4 16 L4 32 Z" fill={fill} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M34 24 L44 16 L44 32 Z" fill={fill} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <rect x="13" y="15" width="22" height="18" rx="9" fill={fill} stroke={INK} strokeWidth="2.5" />
  </>
));

export const IconMoon = base('0 0 48 48', (fill) => (
  <path
    d="M30 6 A18 18 0 1 0 30 42 A14 14 0 1 1 30 6 Z"
    fill={fill}
    stroke={INK}
    strokeWidth="2.5"
    strokeLinejoin="round"
  />
));

export const IconCaterpillar = base('0 0 48 24', (fill) => (
  <>
    <circle cx="8" cy="14" r="7" fill={fill} stroke={INK} strokeWidth="2.2" />
    <circle cx="20" cy="10" r="7" fill={fill} stroke={INK} strokeWidth="2.2" />
    <circle cx="32" cy="14" r="7" fill={fill} stroke={INK} strokeWidth="2.2" />
    <circle cx="42" cy="10" r="6" fill={fill} stroke={INK} strokeWidth="2.2" />
  </>
));

export const IconPatchSquare = base('0 0 48 48', (fill) => (
  <>
    <rect x="10" y="10" width="28" height="28" rx="10" fill={fill} stroke={INK} strokeWidth="2.5" />
    <path d="M18 24 h12 M24 18 v12" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
  </>
));

export const IconTShirt = base('0 0 24 24', () => (
  <path
    d="M8 3 L4 7 L7 10 L7 21 H17 V10 L20 7 L16 3 M8 3 C8 3 9 5 12 5 C15 5 16 3 16 3"
    fill="none"
    stroke={INK}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const IconCap = base('0 0 24 24', () => (
  <path
    d="M3 13 A9 9 0 0 1 21 13 M3 13 H21 M3 13 V16 A2 2 0 0 0 5 18 H8 V13"
    fill="none"
    stroke={INK}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const IconSocks = base('0 0 24 24', () => (
  <>
    <path
      d="M8 3 H16 V15 A4 4 0 0 1 12 21 A4 4 0 0 1 8 15 Z"
      fill="none"
      stroke={INK}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="8" y1="9" x2="16" y2="9" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </>
));

export const IconBag = base('0 0 24 24', () => (
  <>
    <path d="M6 8 H18 L19 21 H5 Z" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 8 V6 A3 3 0 0 1 15 6 V8" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </>
));

export const IconLightbulb = base('0 0 24 24', () => (
  <path
    d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11c.6.5 1 1.3 1 2h4c0-.7.4-1.5 1-2a6 6 0 0 0-3-11z"
    fill="none"
    stroke={INK}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

/** Icons cycled through for dynamic, data-driven cards (e.g. Shopify menu categories). */
export const CATEGORY_ICONS = [IconLollipop, IconStar, IconBear, IconPatchSquare, IconHeart];
