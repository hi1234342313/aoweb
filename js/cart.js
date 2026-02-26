/* ============================================================
   AO WEB SOLUTIONS — CART JAVASCRIPT
   PayPal payment plan integration
   ============================================================ */

// PayPal payment links keyed by plan ID
const PAYPAL_LINKS = {
  beginner:     'https://www.paypal.com/ncp/payment/B75SV3Y8LPNY8',
  intermediate: 'https://www.paypal.com/ncp/payment/G97WQUFJECERE',
  premium:      'https://www.paypal.com/ncp/payment/5DWB2MTC7AEVW',
};

const CART_KEY = 'ao_cart';

const ADDONS = [
  { id: 'logo',  name: 'Logo Design',          desc: 'Custom logo + brand identity package',                    price: 299 },
  { id: 'seo',   name: 'SEO Launch Pack',       desc: 'Keyword research, meta setup, and Google Search Console', price: 199 },
  { id: 'copy',  name: 'Copywriting',           desc: 'Professional page copy written by our team',             price: 349 },
  { id: 'maint', name: '3-Month Maintenance',   desc: 'Monthly updates, support, and security monitoring',      price: 249 },
  { id: 'speed', name: 'Speed Optimization',    desc: 'Core Web Vitals deep-dive + performance audit',          price: 149 },
];

let _cart = null;

function normalizeCart(input) {
  const safe = { plan: null, addons: [] };
  if (!input || typeof input !== 'object') return safe;
  if (Array.isArray(input.addons)) {
    safe.addons = input.addons.filter(a => typeof a === 'string');
  }
  const p = input.plan;
  if (p && typeof p === 'object') {
    const id    = typeof p.id    === 'string' ? p.id    : null;
    const name  = typeof p.name  === 'string' ? p.name  : null;
    const price = typeof p.price === 'number' ? p.price
                : (typeof p.price === 'string' ? Number(p.price) : NaN);
    if (id && name && Number.isFinite(price)) {
      safe.plan = { id, name, price };
    }
  }
  return safe;
}

function initCart() {
  const params  = new URLSearchParams(window.location.search);
  const urlCart = params.get('cart');
  if (urlCart) {
    try {
      const c = JSON.parse(decodeURIComponent(urlCart));
      _cart = normalizeCart(c);
      try { localStorage.setItem(CART_KEY, JSON.stringify(_cart)); } catch(e) {}
      if (window.history && window.history.replaceState) {
        history.replaceState(null, '', window.location.pathname);
      }
      return;
    } catch(e) {}
  }
  try {
    _cart = normalizeCart(JSON.parse(localStorage.getItem(CART_KEY)));
  } catch(e) {
    _cart = { plan: null, addons: [] };
  }
}

function getCart() {
  if (!_cart) initCart();
  _cart = normalizeCart(_cart);
  return _cart;
}

function saveCart(cart) {
  _cart = normalizeCart(cart);
  try { localStorage.setItem(CART_KEY, JSON.stringify(_cart)); } catch(e) {}
  render();
  updateNavCount();
}

function getTotal(cart) {
  let t = cart.plan ? cart.plan.price : 0;
  if (cart.addons) cart.addons.forEach(a => {
    const ad = ADDONS.find(x => x.id === a);
    if (ad) t += ad.price;
  });
  return t;
}

function updateNavCount() {
  const cart  = getCart();
  const count = (cart.plan ? 1 : 0) + (cart.addons ? cart.addons.length : 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('has-items', count > 0);
  });
}

function fmt(n) {
  return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---- PayPal redirect ---- */
function goToPayPal() {
  const cart = getCart();
  if (!cart.plan) return;
  const url = PAYPAL_LINKS[cart.plan.id];
  if (!url) {
    alert('Payment link not found. Please contact us at hello@aowebsolutions.com');
    return;
  }
  try { localStorage.removeItem(CART_KEY); } catch(e) {}
  window.location.href = url;
}

function render() {
  const cart       = getCart();
  const main       = document.getElementById('cartMain');
  const summaryCol = document.getElementById('summaryCol');
  if (!main) return;

  if (!cart.plan || !cart.plan.id || !cart.plan.name || !Number.isFinite(cart.plan.price)) {
    main.innerHTML = `
      <div class="empty-cart">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <h2>Your cart is empty</h2>
        <p>Choose a package to get started with your new website.</p>
        <a href="../index.html#pricing" class="btn primary big">View Packages</a>
      </div>
    `;
    if (summaryCol) summaryCol.innerHTML = '';
    return;
  }

  const selectedAddons = cart.addons || [];

  main.innerHTML = `
    <div class="cart-items-col">
      <h2>Your Order</h2>
      <div class="cart-item">
        <div class="cart-item-thumb">
          <div class="thumb-inner"><div class="thumb-mark">AO</div></div>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-badge">${cart.plan.id.charAt(0).toUpperCase() + cart.plan.id.slice(1)} Package</div>
          <div class="cart-item-name">${cart.plan.name}</div>
          <div class="cart-item-desc">${getPlanDesc(cart.plan.id)}</div>
          <div class="cart-item-meta">${getPlanMeta(cart.plan.id)}</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-item-price">${fmt(cart.plan.price)}</div>
          <button class="cart-remove" onclick="removePlan()">Remove</button>
        </div>
      </div>

      <div class="cart-addons">
        <h3>Enhance Your Package — Optional Add-Ons</h3>
        <div class="addon-list">
          ${ADDONS.map(a => `
            <div class="addon-toggle ${selectedAddons.includes(a.id) ? 'selected' : ''}" onclick="toggleAddon('${a.id}')">
              <div class="addon-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="addon-toggle-info">
                <div class="addon-toggle-name">${a.name}</div>
                <div class="addon-toggle-desc">${a.desc}</div>
              </div>
              <div class="addon-toggle-price">${fmt(a.price)}</div>
            </div>
          `).join('')}
        </div>
        <p style="margin-top:16px;font-size:13px;color:var(--ink3);">Add-on invoices are sent separately after PayPal payment is confirmed.</p>
      </div>
    </div>
  `;

  const total        = getTotal(cart);
  const summaryLines = selectedAddons.map(id => {
    const a = ADDONS.find(x => x.id === id);
    return a ? `<div class="summary-line addon"><span class="label">+ ${a.name}</span><span class="value">${fmt(a.price)}</span></div>` : '';
  }).join('');

  if (summaryCol) summaryCol.innerHTML = `
    <div class="order-summary">
      <h2>Order Summary</h2>
      <div class="summary-lines">
        <div class="summary-line"><span class="label">${cart.plan.name}</span><span class="value">${fmt(cart.plan.price)}</span></div>
        ${summaryLines}
      </div>
      <div class="summary-divider"></div>
      <div class="summary-total">
        <span class="label">Total</span>
        <span class="value">${fmt(total)}</span>
      </div>
      <button class="btn primary big full" onclick="goToPayPal()" style="margin-top:20px;">Pay with PayPal →</button>
      <div class="summary-note" style="margin-top:12px;">You'll be securely redirected to PayPal to complete your ${cart.plan.id} plan payment.</div>
      <div class="summary-guarantees">
        <div class="guarantee-item">
          <div class="guarantee-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          Secure PayPal payment
        </div>
        <div class="guarantee-item">
          <div class="guarantee-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          Revision rounds included
        </div>
        <div class="guarantee-item">
          <div class="guarantee-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          Full source code delivery
        </div>
      </div>
    </div>
  `;
}

function getPlanDesc(id) {
  const descs = {
    beginner:     'Professional 5-page website, mobile-responsive, contact form, basic SEO. Perfect for new businesses.',
    intermediate: 'Up to 10 pages, blog/CMS, Google Analytics, advanced SEO. Great for growing brands.',
    premium:      'Unlimited pages, e-commerce, custom animations, priority support. The complete package.'
  };
  return descs[id] || '';
}

function getPlanMeta(id) {
  const metas = {
    beginner:     '14-day delivery · 2 revision rounds',
    intermediate: '21-day delivery · 3 revision rounds',
    premium:      '30-day delivery · Unlimited revisions'
  };
  return metas[id] || '';
}

window.removePlan = function() {
  const cart = getCart();
  cart.plan   = null;
  cart.addons = [];
  saveCart(cart);
};

window.toggleAddon = function(id) {
  const cart = getCart();
  if (!cart.addons) cart.addons = [];
  const idx = cart.addons.indexOf(id);
  if (idx > -1) cart.addons.splice(idx, 1);
  else          cart.addons.push(id);
  saveCart(cart);
};

// ---- Init ----
initCart();
render();
updateNavCount();
