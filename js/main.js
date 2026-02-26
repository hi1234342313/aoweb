/* ============================================================
   AO WEB SOLUTIONS — MAIN JAVASCRIPT
   ============================================================ */

/* === NAV SCROLL === */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* === SCROLL PROGRESS === */
let rafId = null;
function updateProgress() {
  rafId = null;
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  const p = Math.min(1, Math.max(0, window.scrollY / max));
  doc.style.setProperty('--progress', p.toFixed(4));
}
window.addEventListener('scroll', () => { if (!rafId) rafId = requestAnimationFrame(updateProgress); }, { passive: true });
updateProgress();

/* === REVEAL ANIMATIONS === */
const reveals = document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
if (reveals.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.0, rootMargin: '0px 0px 0px 0px' });
  reveals.forEach(el => io.observe(el));
  setTimeout(() => {
    reveals.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
  }, 50);
}

/* === MOBILE NAV === */
const menuBtn = document.getElementById('menuBtn');
const sheet = document.getElementById('sheet');
const sheetClose = document.getElementById('sheetClose');
function closeSheet() { if (sheet) { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); } }
if (menuBtn) menuBtn.addEventListener('click', e => { e.stopPropagation(); const open = !sheet.classList.contains('open'); sheet.classList.toggle('open', open); sheet.setAttribute('aria-hidden', String(!open)); });
if (sheetClose) sheetClose.addEventListener('click', closeSheet);
if (sheet) sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

/* === CAPABILITIES SCROLL ACTIVATION === */
const capItems = document.querySelectorAll('.cap-item');
if (capItems.length) {
  const capIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        capItems.forEach(item => item.classList.remove('active'));
        e.target.classList.add('active');
      }
    });
  }, { threshold: 0.5, rootMargin: '-20% 0px -40% 0px' });
  capItems.forEach(item => capIO.observe(item));
  capItems[0].classList.add('active');
}

/* === CONTACT FORM === */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.textContent = 'Message Sent ✓';
    btn.style.background = '#2d6b50';
    btn.style.borderColor = '#2d6b50';
    setTimeout(() => { btn.textContent = 'Send Message →'; btn.style.background = ''; btn.style.borderColor = ''; form.reset(); }, 3000);
  });
}

/* === PARALLAX HERO ORB === */
window.addEventListener('scroll', () => {
  const orb = document.querySelector('.hero-bg-orb1');
  if (orb) orb.style.transform = `translateX(-50%) translateY(${window.scrollY * 0.3}px)`;
}, { passive: true });

/* ============================================================
   CART SYSTEM
   - Cart data is stored as a JSON string in localStorage
   - When navigating between pages as local files (file://),
     localStorage may not persist, so we ALSO pass the cart
     as a ?cart= URL param on every navigation.
   ============================================================ */

const CART_KEY = 'ao_cart';

function readCartFromStorage() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || { plan: null, addons: [] }; }
  catch(e) { return { plan: null, addons: [] }; }
}

function writeCartToStorage(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e) {}
}

function updateCartNavBadge() {
  const cart = readCartFromStorage();
  const count = (cart.plan ? 1 : 0) + (cart.addons ? cart.addons.length : 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('has-items', count > 0);
  });
}

window.addToCart = function(planId, planName, planPrice) {
  const cart = { plan: { id: planId, name: planName, price: planPrice }, addons: [] };
  writeCartToStorage(cart);
  showCartToast(planName);

  // Encode the cart in the URL so cart.html can read it
  // even if localStorage doesn't persist across file:// pages
  const encoded = encodeURIComponent(JSON.stringify(cart));
  // Small delay so toast is visible, then navigate
  setTimeout(() => {
    window.location.href = 'pages/cart.html?cart=' + encoded;
  }, 600);
};

function showCartToast(name) {
  // Remove any existing toast
  const existing = document.getElementById('cartToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cartToast';
  toast.style.cssText = [
    'position:fixed', 'bottom:24px', 'right:24px',
    'background:#111113', 'border:1px solid rgba(255,255,255,0.15)',
    'padding:16px 20px', 'z-index:9999',
    "font-family:'DM Sans',sans-serif", 'font-size:14px',
    'color:#e4e0d8', 'animation:toastIn .3s ease both',
    'min-width:220px'
  ].join(';');
  toast.innerHTML = `
    <div style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#c8440a;margin-bottom:4px;">Added to cart</div>
    <div>${name}</div>
    <div style="margin-top:6px;font-size:11px;color:rgba(255,255,255,0.3);">Redirecting to cart…</div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

// Update badge on page load
updateCartNavBadge();

/* === WHY TABS === */
const whyData = [
  { num:'01 — Performance', title:'Sites that score 90+, guaranteed.', desc:'We optimize every build for Google Core Web Vitals — real metrics that affect your search ranking and your bounce rate.', bullets:['Sub-2s load times','Compressed images & fonts','Minimal JS footprint','Server-side caching ready'] },
  { num:'02 — Design Effects', title:'Interactions that feel alive.', desc:"Hover over each tile to see effects we routinely build into client sites — these aren't extras, they're standard.", bullets:['Gradient overlays','Reveal animations','Glowing borders','Magnetic cursor effects'] },
  { num:'03 — Fast Delivery', title:'From call to live in 7–21 days.', desc:"We run a tight, proven workflow. No weeks of silence, no endless back-and-forth. You always know where things stand.", bullets:['Day 1 kickoff call','Figma mockups in 48hrs','Daily progress updates','Launch checklist included'] },
  { num:'04 — 100% Custom', title:'Built for you. Not for everyone.', desc:"Every pixel is designed around your brand. No Squarespace templates, no recycled layouts, no recognizable patterns.", bullets:['Original Figma design','No template fingerprints','Brand-matched typography','Unique layout per project'] },
  { num:'05 — You Own It', title:'No lock-in. No subscriptions. Yours.', desc:'When we hand off your site, you get everything — domain, hosting control, source code. Zero ongoing dependency on us.', bullets:['Full source code delivery','Your hosting account','Domain in your name','No monthly fees required'] },
  { num:'06 — Local Studio', title:'Based in Texas. Available everywhere.', desc:"We're a small, focused studio in Pearland, TX — not an agency churning out dozens of sites. You're not a ticket number.", bullets:['Central timezone comms','Video calls on your schedule','Direct access to your builder','US-based, no outsourcing'] }
];

const tabs = document.querySelectorAll('.why-tab');
const panels = document.querySelectorAll('.why-panel');
const infoEl = document.getElementById('whyInfo');

if (tabs.length && infoEl) {
  function setWhyTab(idx) {
    tabs.forEach(t => t.classList.toggle('active', +t.dataset.tab === idx));
    panels.forEach(p => p.classList.toggle('active', +p.dataset.panel === idx));
    const d = whyData[idx];
    infoEl.innerHTML = `
      <div class="why-stage-num">${d.num}</div>
      <h3>${d.title}</h3>
      <p>${d.desc}</p>
      <div class="why-stage-bullets">
        ${d.bullets.map(b => `<div class="why-stage-bullet">${b}</div>`).join('')}
      </div>
    `;
  }
  setWhyTab(0);
  tabs.forEach(t => t.addEventListener('click', () => setWhyTab(+t.dataset.tab)));
}

/* Magnetic dot effect */
const magTile = document.getElementById('magTile');
const magDot = document.getElementById('magDot');
if (magTile && magDot) {
  magDot.style.position = 'absolute';
  magDot.style.top = '50%'; magDot.style.left = '50%';
  magDot.style.transform = 'translate(-50%,-50%)';
  magDot.style.transition = 'transform .25s';
  magTile.addEventListener('mousemove', e => {
    const r = magTile.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top - r.height/2;
    magDot.style.transform = `translate(calc(-50% + ${x*.3}px), calc(-50% + ${y*.3}px))`;
  });
  magTile.addEventListener('mouseleave', () => { magDot.style.transform = 'translate(-50%,-50%)'; });
}

/* Toast animation keyframe */
const toastStyle = document.createElement('style');
toastStyle.textContent = '@keyframes toastIn { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;} }';
document.head.appendChild(toastStyle);
