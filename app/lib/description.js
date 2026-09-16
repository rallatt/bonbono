// Product descriptions arrive as `descriptionHtml`, but about four in ten
// were typed into the admin as plain text: line breaks for paragraphs and
// `*` for bullets. Injected as HTML, those line breaks collapse and the
// asterisks stay visible, so the whole thing reads as one run-on line.
//
// Real HTML from the Shopify editor is passed through untouched. Anything
// without block-level markup is rebuilt into paragraphs and lists.

const BLOCK_TAG = /<(p|ul|ol|li|div|br|h[1-6]|section|table|blockquote)\b/i;
const BULLET = /^\s*[*\-•–]\s+/;

/**
 * @param {string | null | undefined} html
 * @returns {string} HTML ready to inject, or '' when there's nothing to show
 */
export function normalizeDescriptionHtml(html) {
  const source = (html ?? '').trim();
  if (!source) return '';
  if (BLOCK_TAG.test(source)) return source;

  return source
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map(blockToHtml)
    .filter(Boolean)
    .join('');
}

/**
 * One blank-line-separated chunk. It can mix prose lines and bullet lines,
 * since people often put a list straight under a sentence.
 * @param {string} block
 */
function blockToHtml(block) {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const out = [];
  let prose = [];
  let items = [];

  const flushProse = () => {
    if (prose.length) out.push(`<p>${prose.join('<br>')}</p>`);
    prose = [];
  };
  const flushItems = () => {
    if (items.length) {
      out.push(`<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`);
    }
    items = [];
  };

  for (const line of lines) {
    if (BULLET.test(line)) {
      flushProse();
      items.push(line.replace(BULLET, ''));
    } else {
      flushItems();
      prose.push(line);
    }
  }
  flushProse();
  flushItems();

  return out.join('');
}
