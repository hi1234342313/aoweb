/* ============================================================
   AO WEB SOLUTIONS — CHECKOUT (redirects to PayPal)
   ============================================================ */

const PAYPAL_LINKS = {
  beginner:     'https://www.paypal.com/ncp/payment/B75SV3Y8LPNY8',
  intermediate: 'https://www.paypal.com/ncp/payment/G97WQUFJECERE',
  premium:      'https://www.paypal.com/ncp/payment/5DWB2MTC7AEVW',
};

const CART_KEY = 'ao_cart';

let _cart = null;

function initCart() {
  const params  = new URLSearchParams(window.location.search);
  const urlCart = params.get('cart');
  if (urlCart) {
    try {
      _cart = JSON.parse(decodeURIComponent(urlCart));
      try { localStorage.setItem(CART_KEY, JSON.stringify(_cart)); } catch(e) {}
      if (window.history && window.history.replaceState) {
        history.replaceState(null, '', window.location.pathname);
      }
      return;
    } catch(e) {}
  }
  try { _cart = JSON.parse(localStorage.getItem(CART_KEY)) || { plan: null, addons: [] }; }
  catch(e) { _cart = { plan: null, addons: [] }; }
}

function getCart() {
  if (!_cart) initCart();
  return _cart;
}

// If someone lands on checkout.html, redirect them to PayPal immediately
initCart();
const cart = getCart();
if (cart && cart.plan && PAYPAL_LINKS[cart.plan.id]) {
  try { localStorage.removeItem(CART_KEY); } catch(e) {}
  window.location.href = PAYPAL_LINKS[cart.plan.id];
} else {
  // No cart — send back to pricing
  window.location.href = '../index.html#pricing';
}
