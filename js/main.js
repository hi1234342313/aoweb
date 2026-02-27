/* ============================================================
   AO WEB SOLUTIONS — MAIN JAVASCRIPT
   EmailJS: sends form data to aowebsolutionsofficial@gmail.com
   ============================================================ */

/* ============ EMAILJS CONFIG ============ */
// EmailJS is loaded via CDN in HTML. Configure your IDs here:
const EMAILJS_SERVICE_ID  = 'service_boucloh';      // Your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_c9hfs1f';    // Your EmailJS template ID
const EMAILJS_PUBLIC_KEY  = 'ULzb6_TxFIHEcHAPb'; // Your EmailJS public key

/* ============ NAV SCROLL ============ */
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============ SCROLL PROGRESS ============ */
let rafId = null;
function updateProgress() {
  rafId = null;
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  doc.style.setProperty('--progress', Math.min(1, window.scrollY / max).toFixed(4));
}
window.addEventListener('scroll', () => { if (!rafId) rafId = requestAnimationFrame(updateProgress); }, { passive: true });
updateProgress();

/* ============ REVEAL ANIMATIONS ============ */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
  setTimeout(() => {
    revealEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
  }, 60);
}

/* ============ MOBILE NAV ============ */
const menuBtn  = document.getElementById('menuBtn');
const sheet    = document.getElementById('sheet');
const sheetClose = document.getElementById('sheetClose');
let _scrollLockY = 0;
function lockScroll() {
  _scrollLockY = window.scrollY || 0;
  document.documentElement.classList.add('no-scroll');
  document.body.classList.add('no-scroll');
  // iOS-friendly lock
  document.body.style.position = 'fixed';
  document.body.style.top = `-${_scrollLockY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}
function unlockScroll() {
  document.documentElement.classList.remove('no-scroll');
  document.body.classList.remove('no-scroll');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, _scrollLockY || 0);
}

function openSheet() {
  if (!sheet) return;
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
  lockScroll();
}
function closeSheet() {
  if (!sheet) return;
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
  unlockScroll();
}

// Expose for inline onclick handlers in HTML
window.closeSheet = closeSheet;

if (menuBtn) {
  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sheet) return;
    sheet.classList.contains('open') ? closeSheet() : openSheet();
  });
}
if (sheetClose) sheetClose.addEventListener('click', (e) => { e.stopPropagation(); closeSheet(); });
if (sheet) sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

/* ============ CAPABILITIES SCROLL ACTIVATION ============ */
const capItems = document.querySelectorAll('.cap-item');
if (capItems.length) {
  const capIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        capItems.forEach(i => i.classList.remove('active'));
        e.target.classList.add('active');
      }
    });
  }, { threshold: 0.5, rootMargin: '-20% 0px -40% 0px' });
  capItems.forEach(i => capIO.observe(i));
  if (capItems[0]) capItems[0].classList.add('active');
}

/* ============ CONTACT FORM — EmailJS ============ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.submit-btn');
    const data = new FormData(contactForm);

    btn.textContent = 'Sending…';
    btn.disabled = true;

    const templateParams = {
      to_email: 'aowebsolutionsofficial@gmail.com',
      from_name:    data.get('name')     || '',
      from_email:   data.get('email')    || '',
      business:     data.get('business') || '',
      package:      data.get('package')  || 'Not specified',
      message:      data.get('message')  || '',
    };

    try {
      if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY_HERE') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      } else {
        // Fallback: open mail client
        const subject = encodeURIComponent(`New Project Inquiry — ${templateParams.from_name}`);
        const body = encodeURIComponent(
          `Name: ${templateParams.from_name}\n` +
          `Email: ${templateParams.from_email}\n` +
          `Business: ${templateParams.business}\n` +
          `Package: ${templateParams.package}\n\n` +
          `Message:\n${templateParams.message}`
        );
        window.location.href = `mailto:aowebsolutionsofficial@gmail.com?subject=${subject}&body=${body}`;
        await new Promise(r => setTimeout(r, 600));
      }
      // Success state
      contactForm.innerHTML = `
        <div class="form-success">
          <div class="form-success-check">✓</div>
          <h4>Message sent!</h4>
          <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
        </div>
      `;
    } catch (err) {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      alert('Something went wrong. Please email us directly at aowebsolutionsofficial@gmail.com');
    }
  });
}

/* ============ CART SYSTEM ============ */
const CART_STORAGE_KEY = 'ao_cart';

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || { plan: null }; }
  catch(e) { return { plan: null }; }
}
function writeCart(cart) {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch(e) {}
}
function updateCartBadge() {
  const cart  = readCart();
  const count = cart.plan ? 1 : 0;
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('has-items', count > 0);
  });
}

window.addToCart = function(planId, planName, planPrice) {
  const cart = { plan: { id: planId, name: planName, price: planPrice } };
  writeCart(cart);
  showToast(planName);
  const encoded = encodeURIComponent(JSON.stringify(cart));
  setTimeout(() => { window.location.href = 'pages/cart.html?cart=' + encoded; }, 600);
};

function showToast(name) {
  const existing = document.getElementById('cartToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'cartToast';
  toast.style.cssText = [
    'position:fixed','bottom:28px','right:28px',
    "background:var(--paper2)",'border:1px solid var(--border2)',
    'padding:18px 24px','z-index:9999',
    "font-family:'Jost',sans-serif",'font-size:14px','color:#1a1a1a',
    'animation:toastIn .3s ease both','min-width:220px',
    'box-shadow:0 8px 32px rgba(0,0,0,0.12)'
  ].join(';');
  toast.innerHTML = `
    <div style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#c8440a;margin-bottom:5px;">Added to cart</div>
    <div style="font-weight:400;">${name}</div>
    <div style="margin-top:6px;font-size:11px;color:#888;">Redirecting to cart…</div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
}

// Init badge
updateCartBadge();

/* ============ WHY TABS ============ */
const whyData = [
  { num:'01 — Performance', title:'Sites that score 90+, guaranteed.', desc:'We optimize every build for Google Core Web Vitals — real metrics that affect your search ranking and bounce rate.', bullets:['Sub-2s load times','Compressed images & fonts','Minimal JS footprint','Server-side caching ready'] },
  { num:'02 — Design', title:'Interactions that feel alive.', desc:"Hover each tile to see effects we build into client sites. These aren't extras — they're standard.", bullets:['Gradient overlays','Reveal animations','Glowing borders','Magnetic cursor effects'] },
  { num:'03 — Fast Delivery', title:'From call to live in 7–21 days.', desc:'A tight, proven workflow. No weeks of silence, no endless back-and-forth. You always know where things stand.', bullets:['Day 1 kickoff call','Figma mockups in 48hrs','Daily progress updates','Launch checklist included'] },
  { num:'04 — 100% Custom', title:'Built for you. Not for everyone.', desc:"Every pixel is designed around your brand. No Squarespace templates, no recycled layouts, no cookie-cutter patterns.", bullets:['Original Figma design','No template fingerprints','Brand-matched typography','Unique layout per project'] },
  { num:'05 — You Own It', title:'No lock-in. No subscriptions. Yours.', desc:'When we hand off your site, you get everything — domain, hosting control, source code. Zero ongoing dependency on us.', bullets:['Full source code delivery','Your hosting account','Domain in your name','No monthly fees required'] },
  { num:'06 — Local Studio', title:'Based in Texas. Available everywhere.', desc:"We're a small, focused studio in Pearland, TX. You're not a ticket number — you talk to the person building your site.", bullets:['Central timezone comms','Video calls on your schedule','Direct access to your builder','US-based, no outsourcing'] }
];

const tabs   = document.querySelectorAll('.why-tab');
const panels = document.querySelectorAll('.why-panel');
const infoEl = document.getElementById('whyInfo');

if (tabs.length && infoEl) {
  function setTab(idx) {
    tabs.forEach(t   => t.classList.toggle('active',   +t.dataset.tab   === idx));
    panels.forEach(p => p.classList.toggle('active',   +p.dataset.panel === idx));
    const d = whyData[idx];
    infoEl.innerHTML = `
      <div class="why-info-num">${d.num}</div>
      <h3>${d.title}</h3>
      <p>${d.desc}</p>
      <div class="why-bullets">${d.bullets.map(b => `<div class="why-bullet">${b}</div>`).join('')}</div>
    `;
  }
  setTab(0);
  tabs.forEach(t => t.addEventListener('click', () => setTab(+t.dataset.tab)));
}

/* Magnetic tile effect */
const magTile = document.getElementById('magTile');
const magDot  = document.getElementById('magDot');
if (magTile && magDot) {
  magDot.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transition:transform .25s;';
  magTile.addEventListener('mousemove', e => {
    const r = magTile.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top  - r.height/2;
    magDot.style.transform = `translate(calc(-50% + ${x*.3}px), calc(-50% + ${y*.3}px))`;
  });
  magTile.addEventListener('mouseleave', () => { magDot.style.transform = 'translate(-50%,-50%)'; });
}

/* Toast animation */
const toastStyle = document.createElement('style');
toastStyle.textContent = '@keyframes toastIn { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;} }';
document.head.appendChild(toastStyle);
