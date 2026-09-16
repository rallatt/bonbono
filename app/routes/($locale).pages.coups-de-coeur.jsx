import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { ProductItem } from '../components/ProductItem';
import { isProductVisible } from '../lib/productAvailability';
import { t } from '../i18n/index.js';
import { IconHeart } from '../components/CandyIcons';

/**
 * Team picks (P1-4). Each staff member tags their products
 * `coupdecoeur<prénom>` in Shopify — e.g. `coupdecoeurroxanne` — and this page
 * groups them by person. Adding or removing someone is a one-line change to
 * TEAM plus a `favourites.person.*` string in fr.js; no Shopify page needed.
 */
const TEAM = [
  { key: 'laurie' },
  { key: 'steph' },
  { key: 'roxanne' },
  { key: 'jessie' },
  { key: 'maria' },
  { key: 'yana' },
  // Laura-Lee's tag drops the hyphen; normalizeTag() makes the match forgiving
  // either way (coupdecoeurlauralee, coupdecoeur-laura-lee, …).
  { key: 'lauralee' },
];

const TAG_PREFIX = 'coupdecoeur';

// The explicit terms are what actually match. The Storefront API returns
// nothing for `tag:coupdecoeur*` (checked 2026-09-16), so a new person's tag
// only shows up once their name is added to TEAM. The wildcard is kept in
// case Shopify starts honouring it for tags.
const FAVOURITES_SEARCH = [
  `tag:${TAG_PREFIX}*`,
  ...TEAM.map((person) => `tag:${TAG_PREFIX}${person.key}`),
].join(' OR ');

/**
 * Tags get typed by hand in the admin, so match them forgivingly: case,
 * accents-free spacing, a leading `#` or stray punctuation shouldn't matter.
 * @param {string} tag
 */
function normalizeTag(tag) {
  return tag.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: t('favourites.meta') }];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({ context }) {
  const { products } = await context.storefront.query(FAVOURITES_QUERY, {
    variables: { query: FAVOURITES_SEARCH, first: 250 },
  });

  const visible = (products?.nodes ?? []).filter(isProductVisible);

  // A product can be several people's favourite, so each one carries the list
  // of who picked it rather than being repeated once per person.
  const items = visible
    .map((product) => ({
      ...product,
      owners: TEAM.map((person) => person.key).filter((key) =>
        (product.tags ?? []).some(
          (tag) => normalizeTag(tag) === `${TAG_PREFIX}${key}`,
        ),
      ),
    }))
    .filter((product) => product.owners.length > 0);

  const people = TEAM.map((person) => ({
    key: person.key,
    name: t(`favourites.person.${person.key}`),
    initial: t(`favourites.person.${person.key}`).slice(0, 1),
    count: items.filter((item) => item.owners.includes(person.key)).length,
  })).filter((person) => person.count > 0);

  return { items, people };
}

export default function Favourites() {
  /** @type {LoaderReturnData} */
  const { items, people } = useLoaderData();
  const [selected, setSelected] = useState('all');

  const shown =
    selected === 'all'
      ? items
      : items.filter((item) => item.owners.includes(selected));
  const person = people.find((p) => p.key === selected);

  const nameFor = (key) => people.find((p) => p.key === key)?.name ?? key;

  return (
    <div className="favourites">
      <div className="page-title-band">
        <span className="hero-tag">{t('favourites.eyebrow')}</span>
        <h1>{t('favourites.title')}</h1>
        <p>{t('favourites.intro')}</p>
      </div>

      {people.length === 0 ? (
        <p className="favourites-empty">{t('favourites.empty')}</p>
      ) : (
        <>
          <div
            className="fav-filters"
            role="group"
            aria-label={t('favourites.filter.aria')}
          >
            <FilterButton
              active={selected === 'all'}
              count={items.length}
              label={t('favourites.filter.all')}
              onSelect={() => setSelected('all')}
            />
            {people.map((p) => (
              <FilterButton
                active={selected === p.key}
                count={p.count}
                initial={p.initial}
                key={p.key}
                label={p.name}
                onSelect={() => setSelected(p.key)}
              />
            ))}
          </div>

          <section className="favourites-group">
            <h2 className="favourites-group-title">
              {person
                ? t('favourites.person_heading', { name: person.name })
                : t('favourites.all_heading')}
            </h2>
            <div className="products-grid">
              {shown.map((product, index) => (
                <div className="fav-cell" key={product.id}>
                  <ProductItem
                    product={product}
                    loading={index < 4 ? 'eager' : undefined}
                  />
                  {selected === 'all' && (
                    <p className="fav-owners">
                      {t('favourites.loved_by', {
                        names: formatNames(product.owners.map(nameFor)),
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/**
 * @param {{
 *   active: boolean,
 *   count: number,
 *   initial?: string,
 *   label: string,
 *   onSelect: () => void,
 * }}
 */
function FilterButton({ active, count, initial, label, onSelect }) {
  return (
    <button
      aria-pressed={active}
      className={`fav-filter${active ? ' is-active' : ''}`}
      onClick={onSelect}
      type="button"
    >
      <span className="fav-filter-circle" aria-hidden="true">
        {initial ?? <IconHeart fill="#fff" size={26} />}
      </span>
      <span className="fav-filter-label">{label}</span>
      <span className="fav-filter-count">{count}</span>
    </button>
  );
}

/**
 * "Jessie", "Jessie et Roxanne", "Jessie, Maria et Roxanne".
 * @param {string[]} names
 */
function formatNames(names) {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} ${t('favourites.and')} ${names[names.length - 1]}`;
}

const FAVOURITE_ITEM_FRAGMENT = `#graphql
  fragment FavouriteItem on Product {
    id
    handle
    title
    productType
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
`;

const FAVOURITES_QUERY = `#graphql
  query Favourites(
    $country: CountryCode
    $language: LanguageCode
    $query: String
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        ...FavouriteItem
      }
    }
  }
  ${FAVOURITE_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/pages.coups-de-coeur').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
