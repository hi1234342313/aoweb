/* ============================================================
   AO WEB SOLUTIONS — CART JAVASCRIPT
   Simplified: no add-ons, direct PayPal redirect
   ============================================================ */

const PAYPAL_LINKS = {
  beginner:     'https://www.paypal.com/ncp/payment/B75SV3Y8LPNY8',
  intermediate: 'https://www.paypal.com/ncp/payment/G97WQUFJECERE',
  premium:      'https://www.paypal.com/ncp/payment/5DWB2MTC7AEVW',
};

const CART_KEY = 'ao_cart';
let _cart = null;

function normalizeCart(input) {
  const safe = { plan: null };
  if (!input || typeof input !== 'object') return safe;
  const p = input.plan;
  if (p && typeof p === 'object') {
    const id    = typeof p.id    === 'string' ? p.id    : null;
    const name  = typeof p.name  === 'string' ? p.name  : null;
    const price = typeof p.price === 'number' ? p.price : (typeof p.price === 'string' ? Number(p.price) : NaN);
    if (id && name && Number.isFinite(price)) {
      safe.plan = { id, name, price };
    }
  }
  return safe;
}

function initCart() {
  const params = new URLSearchParams(window.location.search);
  const urlCart = params.get('cart');
  if (urlCart) {
    try {
      _cart = normalizeCart(JSON.parse(decodeURIComponent(urlCart)));
      try { localStorage.setItem(CART_KEY, JSON.stringify(_cart)); } catch(e) {}
      if (window.history?.replaceState) history.replaceState(null, '', window.location.pathname);
      return;
    } catch(e) {}
  }
  try { _cart = normalizeCart(JSON.parse(localStorage.getItem(CART_KEY))); }
  catch(e) { _cart = { plan: null }; }
}

function getCart()     { if (!_cart) initCart(); return normalizeCart(_cart); }
function saveCart(c)   { _cart = normalizeCart(c); try { localStorage.setItem(CART_KEY, JSON.stringify(_cart)); } catch(e) {} render(); updateBadge(); }
function fmt(n)        { return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function updateBadge() {
  const count = getCart().plan ? 1 : 0;
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('has-items', count > 0);
  });
}

/* ---- PayPal redirect ---- */
window.goToPayPal = function() {
  const cart = getCart();
  if (!cart.plan) return;
  const url = PAYPAL_LINKS[cart.plan.id];
  if (!url) { alert('Payment link not found. Please contact us at aowebsolutionsofficial@gmail.com'); return; }
  try { localStorage.removeItem(CART_KEY); } catch(e) {}
  window.location.href = url;
};

const planDesc = { beginner: 'Professional 5-page website, mobile-responsive, contact form, basic SEO setup.', intermediate: 'Up to 10 pages, blog/CMS, Google Analytics 4, advanced SEO & schema markup.', premium: 'Unlimited pages, full e-commerce store, custom animations, priority support.' };
const planMeta = { beginner: '14-day delivery · 2 revision rounds', intermediate: '21-day delivery · 3 revision rounds', premium: '30-day delivery · Unlimited revisions' };

function render() {
  const cart    = getCart();
  const main    = document.getElementById('cartMain');
  const summary = document.getElementById('summaryCol');
  if (!main) return;

  if (!cart.plan) {
    document.querySelector('.cart-layout')?.classList.add('is-empty');
    main.innerHTML = `
      <div class="empty-cart">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <h2>Your cart is empty</h2>
        <p>Choose a package to get started with your new website.</p>
        <a href="../index.html#pricing" class="btn primary big">View Packages</a>
      </div>
    `;
    if (summary) summary.innerHTML = '';
    return;
  }

  document.querySelector('.cart-layout')?.classList.remove('is-empty');

  const p = cart.plan;
  const id = p.id.charAt(0).toUpperCase() + p.id.slice(1);

  main.innerHTML = `
    <div class="cart-items-col">
      <h2>Your Order</h2>
      <div class="cart-item">
        <div class="cart-item-thumb">
          <div class="thumb-inner"><div class="thumb-mark">AO</div></div>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-badge">${id} Package</div>
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-desc">${planDesc[p.id] || ''}</div>
          <div class="cart-item-meta">${planMeta[p.id] || ''}</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-item-price">${fmt(p.price)}</div>
          <button class="cart-remove" onclick="removePlan()">Remove</button>
        </div>
      </div>
    </div>
  `;

  if (summary) summary.innerHTML = `
    <div class="order-summary">
      <h2>Order Summary</h2>
      <div class="summary-lines">
        <div class="summary-line">
          <span class="label">${p.name}</span>
          <span class="value">${fmt(p.price)}</span>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-total">
        <span class="label">Total</span>
        <span class="value">${fmt(p.price)}</span>
      </div>
      <button class="btn primary big full" onclick="goToPayPal()" style="margin-top:4px;">Continue to PayPal Checkout →</button>
      <div class="summary-note" style="margin-top:14px;">You'll be securely redirected to PayPal.com to complete payment for your ${id} plan.</div>
      <div class="summary-guarantees">
        <div class="guarantee-item">
          <div class="guarantee-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          Secure PayPal checkout
        </div>
        <div class="guarantee-item">
          <div class="guarantee-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          Revisions included
        </div>
        <div class="guarantee-item">
          <div class="guarantee-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          Full source code delivery
        </div>
      </div>
    </div>
  `;
}

window.removePlan = function() { saveCart({ plan: null }); };

initCart();
render();
updateBadge();
