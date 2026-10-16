import { useLoaderData, data } from 'react-router';
import { CartForm } from '@shopify/hydrogen';
import { CartMain } from '../components/CartMain';
import { metaT, useT } from '../i18n/index.js';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ matches }) => {
  const t = metaT(matches);
  return [{ title: t('meta.cart') }];
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({ actionHeaders }) => actionHeaders;

// Bonbono and Librairie Gourmande are one Shopify store behind one checkout,
// so an order alone doesn't say which site it came from. Stamping the cart
// carries that through to the order, where Liquid can read it as
// `{{ order.attributes.storefront }}` — which is how the notification emails
// pick the right shop name and contact address.
const STOREFRONT_ATTRIBUTE = { key: 'storefront', value: 'bonbono' };

/**
 * @param {Route.ActionArgs}
 */
export async function action({ request, context }) {
  const { cart } = context;

  const formData = await request.formData();

  const { action, inputs } = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes;
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  // Stamp the cart once, as soon as it exists. A failure here must never cost
  // the customer their add to cart, so it is best-effort.
  const alreadyStamped = result?.cart?.attributes?.some(
    (attribute) => attribute.key === STOREFRONT_ATTRIBUTE.key,
  );
  if (result?.cart?.id && !alreadyStamped) {
    const stamped = await cart
      .updateAttributes([STOREFRONT_ATTRIBUTE])
      .catch(() => null);
    if (stamped?.cart) result = stamped;
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const { cart: cartResult, errors, warnings } = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    { status, headers },
  );
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({ context }) {
  const { cart } = context;
  return await cart.get();
}

export default function Cart() {
  const t = useT();
  /** @type {LoaderReturnData} */
  const cart = useLoaderData();

  return (
    <div className="cart">
      <h1>{t('cart.title')}</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}

/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @typedef {import('./+types/cart').Route} Route */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */
