// ================= SETTINGS — fill these in =================
const CONFIG = {
  INSTAGRAM_DM: 'https://ig.me/m/forthelovestudio',
  INSTAGRAM: 'https://instagram.com/forthelovestudio',
  YOUTUBE: '',          // channel link; empty = YouTube icon hidden
  COURSE_URL: 'https://whop.com/joined/for-the-love-studio/courses-O8PvF68SjATrHJ/app/courses/cors_UnneQR3dB6jg8/lessons/lesn_xovOZA1YxGDb9/', // empty = button hidden
  WHOP_URL: 'https://whop.com/biz_onI9jbO3hUpNfg?a=saltysofa', // empty = button hidden
  MEMBERS_URL: '',      // "Become a member →"; empty = button hidden

  // Shopify: put your store domain (e.g. 'forthelovestudio.myshopify.com') and the variant IDs
  // in PRODUCTS[].shopify. Then the bag button becomes "Checkout →" and sends the bag to Shopify.
  SHOPIFY_STORE_DOMAIN: '',

  // Prices are set in EUR; other currencies are converted with these rates.
  RATES: { EUR: 1, USD: 1.08, GBP: 0.85 },

  // Firebase → Project settings → Your apps → Web app → firebaseConfig. Paste the object here.
  // Turn on Authentication (Email/Password + Google) and Firestore. Firestore rules:
  //   match /users/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid; }
  FIREBASE: null,
};

// sale: 0.5 = -50%. imgs: [front, back]. cat: sweatshirts | pants.
const PRODUCTS = [
  {
    id: 'crewneck', cat: 'sweatshirts', name: 'For The Love Studio Crewneck', price: 95, sale: 0.5,
    sizes: ['S', 'M', 'L', 'XL'], imgs: ['assets/p8057.jpg', 'assets/p8593.jpg'], details: 'details.crewneck',
    shopify: { S: '', M: '', L: '', XL: '' }, // Shopify variant IDs per size
  },
];
const CATEGORIES = ['sweatshirts', 'pants'];

// Media page. Each video: title + caption in three languages. vertical: true for 9:16 clips.
const MEDIA = [
  { cat: 'reels', src: 'closeup', vertical: true, title: 'Close Up',
    cap: { en: 'The red crewneck up close', ru: 'Красный свитшот крупным планом', es: 'La sudadera roja de cerca' } },
  { cat: 'reels', src: 'street', vertical: true, title: 'Wear It Loud',
    cap: { en: 'Out in the city', ru: 'Прогулка по городу', es: 'Por la ciudad' } },
  { cat: 'reels', src: 'dance', vertical: true, title: 'Move Together',
    cap: { en: 'The dance crew in For The Love', ru: 'Танцевальная команда в For The Love', es: 'El crew de baile con For The Love' } },
  { cat: 'podcasts', src: 'pod1', title: 'What Is For The Love',
    cap: { en: 'The brand concept and an open call for artists and designers (RU)', ru: 'Концепт бренда и открытый набор артистов и дизайнеров', es: 'El concepto de la marca y una convocatoria para artistas y diseñadores (RU)' } },
  { cat: 'podcasts', src: 'pod2', title: 'References',
    cap: { en: 'Joey Bada$$, Kanye and the people behind the vision', ru: 'Joey Bada$$, Канье и люди, которые повлияли на идею (EN)', es: 'Joey Bada$$, Kanye y la gente detrás de la visión (EN)' } },
  { cat: 'podcasts', src: 'talk', vertical: true, title: 'Why Kanye',
    cap: { en: 'On drive and never stopping (RU)', ru: 'О стремлении и о том, чтобы не останавливаться', es: 'Sobre la ambición y no detenerse (RU)' } },
];
// =============================================================

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('ftl.' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ftl.' + k, JSON.stringify(v)); } catch {} },
};
const LANGS = Object.keys(I18N);
let lang = 'en';
const t = key => I18N[lang][key] ?? I18N.en[key] ?? key;

// Money: base prices in EUR
const CURRENCIES = { EUR: 'EUR', USD: 'USD', GBP: 'GBP' };
let currency = store.get('currency', 'EUR');
const finalPrice = p => p.sale ? Math.round(p.price * (1 - p.sale) * 100) / 100 : p.price;
const conv = eur => Math.round(eur * CONFIG.RATES[currency] * 100) / 100; // unit price in the chosen currency
const fmt = v => new Intl.NumberFormat(lang === 'en' ? 'en-IE' : lang, { style: 'currency', currency }).format(v);
const money = eur => fmt(conv(eur));
const priceHTML = p => p.sale ? `<s>${money(p.price)}</s> ${money(finalPrice(p))}` : money(p.price);
console.assert(finalPrice({ price: 95, sale: 0.5 }) === 47.5, 'sale math');
console.assert(LANGS.every(l => Object.keys(I18N.en).every(k => k in I18N[l])), 'missing translation');

// Country → currency for the welcome popup
const COUNTRIES = ['ES', 'GB', 'US', 'RU', 'DE', 'FR', 'IT', 'PT', 'NL', 'LT', 'PL', 'UA', 'KZ', 'AE'];
const currencyFor = c => c === 'US' ? 'USD' : c === 'GB' ? 'GBP' : 'EUR';
const countryName = c => { try { return new Intl.DisplayNames([lang], { type: 'region' }).of(c); } catch { return c; } };

// Links from CONFIG: empty link = element hidden
document.querySelectorAll('[data-link]').forEach(a => {
  const url = CONFIG[a.dataset.link];
  if (!url) { a.hidden = true; return; }
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
});

// ---------- Shared dialogs (same on every page) ----------
const CLOSE = `<form method="dialog" class="close"><button class="x" data-i18n-aria="close" aria-label="Close">✕</button></form>`;
document.body.insertAdjacentHTML('beforeend', `
<dialog id="pdp" class="modal pdp">${CLOSE}<div class="pdp-imgs"></div><div class="pdp-body"></div></dialog>
<dialog id="bag" class="drawer">${CLOSE}<div class="drawer-body"></div></dialog>
<dialog id="auth" class="modal small">${CLOSE}<div class="auth-body"></div></dialog>
<dialog id="faq" class="modal small">${CLOSE}<div class="faq-body"></div></dialog>
<dialog id="track" class="modal small">${CLOSE}
  <form class="form" id="track-form"><h3 data-i18n="foot.tracking"></h3>
    <label><span data-i18n="track.label"></span><input name="n" required autocomplete="off"></label>
    <button class="btn red" data-i18n="track.go"></button><small data-i18n="track.note"></small></form></dialog>
<dialog id="welcome" class="modal small"><form class="form" id="welcome-form"><h3 data-i18n="welcome.title"></h3>
  <label><span data-i18n="welcome.country"></span><select name="country"></select></label>
  <label><span data-i18n="welcome.lang"></span><select name="lang"><option value="ru">Русский</option><option value="es">Español</option><option value="en">English</option></select></label>
  <button class="btn red" data-i18n="welcome.go"></button></form></dialog>
<dialog id="cookies" class="modal small">${CLOSE}<form class="form" id="cookie-form"><h3 data-i18n="foot.cookies"></h3>
  <label class="check"><input type="checkbox" checked disabled><span><b data-i18n="cookie.necessary"></b> · <span data-i18n="cookie.always"></span></span></label>
  <label class="check"><input type="checkbox" name="analytics"><span><b data-i18n="cookie.analytics"></b></span></label>
  <button class="btn red" data-i18n="cookie.save"></button></form></dialog>
<div id="cookiebar" class="cookiebar" hidden><p data-i18n="cookie.text"></p>
  <div class="ctas"><button class="btn red" data-cookie="all" data-i18n="cookie.accept"></button><button class="btn" data-open="cookies" data-i18n="cookie.prefs"></button></div></div>
<div id="toast" class="toast" role="status" hidden></div>`);

const toast = msg => { const el = $('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 3500); };
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d && d.id !== 'welcome') d.close(); }));

// ---------- Rendering (redrawn on language / currency change) ----------
let filter = 'all';
function render() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
  document.querySelectorAll('.sound').forEach(b => { b.textContent = t(b.parentElement.querySelector('video').muted ? 'sound.off' : 'sound.on'); });
  burger.textContent = t(menu.classList.contains('open') ? 'menu.close' : 'menu.open');

  if ($('grid')) {
    const items = PRODUCTS.filter(p => filter === 'all' || p.cat === filter);
    const empty = CATEGORIES.filter(c => (filter === 'all' || c === filter) && !PRODUCTS.some(p => p.cat === c));
    $('grid').innerHTML = items.map(p => `
      <button class="card" data-product="${p.id}">
        <div class="ph">${p.imgs.map(src => `<img src="${src}" alt="" loading="lazy">`).join('')}<i class="mark"></i>
          ${p.sale ? `<span class="badge">-${Math.round(p.sale * 100)}%</span>` : ''}</div>
        <div class="meta"><span>${esc(p.name)}</span><span>${priceHTML(p)}</span></div>
      </button>`).join('') + empty.map(c => `
      <div class="card soon"><div class="ph"><span>${t('col.soon')}</span><i class="mark"></i></div><div class="meta"><span>${t('col.' + c)}</span></div></div>`).join('');
    document.querySelectorAll('[data-cat]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === filter));
  }

  const video = (m, controls) => `<video src="assets/${m.src}.mp4" poster="assets/${m.src}.jpg" ${controls ? 'controls' : ''} playsinline preload="none"></video>`;
  if ($('media-preview')) {
    $('media-preview').innerHTML = MEDIA.filter(m => m.cat === 'podcasts').map(m => `
      <a href="media.html"><img src="assets/${m.src}.jpg" alt="" loading="lazy"><span>${esc(m.title)}</span></a>`).join('');
  }
  if ($('media-list')) {
    $('media-list').innerHTML = ['reels', 'podcasts'].map(cat => `
      <div class="line-head">${t('media.' + cat)}</div>
      <div class="media-grid ${cat}">${MEDIA.filter(m => m.cat === cat).map(m => `
        <figure class="${m.vertical ? 'v' : ''}">${video(m, true)}
          <figcaption><b>${esc(m.title)}</b><span>${esc(m.cap[lang] || m.cap.en)}</span></figcaption></figure>`).join('')}</div>`).join('');
  }

  $('faq').querySelector('.faq-body').innerHTML = `<h3>${t('foot.faq')}</h3>` +
    t('faq').map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  const sel = $('welcome-form').country;
  const picked = sel.value || store.get('country', 'ES');
  sel.innerHTML = COUNTRIES.map(c => `<option value="${c}">${countryName(c)}</option>`).join('');
  sel.value = picked;

  renderBag();
  if ($('pdp').open) fillProduct();
  renderAuth();
}

function setLang(l, remember) {
  lang = LANGS.includes(l) ? l : 'en';
  if (remember) store.set('lang', lang);
  render();
}
document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang, true)));
document.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.cat; render(); }));

// ---------- Product dialog ----------
let current, size;
function fillProduct() {
  const d = $('pdp');
  d.querySelector('.pdp-imgs').innerHTML = current.imgs.map(src => `<div class="ph"><img src="${src}" alt="${esc(current.name)}"><i class="mark"></i></div>`).join('');
  d.querySelector('.pdp-body').innerHTML = `
    ${current.sale ? `<span class="badge static">-${Math.round(current.sale * 100)}%</span>` : ''}
    <h3>${esc(current.name)}</h3>
    <div class="price">${priceHTML(current)}</div>
    <div class="sizes" role="radiogroup" aria-label="${t('pdp.size')}">${current.sizes.map(s =>
      `<label><input type="radio" name="size" value="${s}" ${s === size ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div>
    <button class="btn red" data-add>${t('pdp.add')}</button>
    <small>${t('final')}</small>
    <ul class="details">${t(current.details).map(l => `<li>${esc(l)}</li>`).join('')}</ul>`;
}
document.addEventListener('click', e => {
  const card = e.target.closest('[data-product]');
  if (card) {
    current = PRODUCTS.find(p => p.id === card.dataset.product);
    size = current.sizes[1];
    fillProduct();
    $('pdp').showModal();
  }
  if (e.target.closest('[data-add]')) {
    addToBag(current.id, size);
    $('pdp').close();
    toast(t('pdp.added'));
  }
});
$('pdp').addEventListener('change', e => { if (e.target.name === 'size') size = e.target.value; });

// ---------- Bag ----------
let bag = store.get('bag', []).filter(i => PRODUCTS.some(p => p.id === i.id));
const saveBag = () => { store.set('bag', bag); renderBag(); };
function addToBag(id, sz) {
  const line = bag.find(i => i.id === id && i.size === sz);
  if (line) line.qty++; else bag.push({ id, size: sz, qty: 1 });
  saveBag();
}
const product = id => PRODUCTS.find(p => p.id === id);
const lineTotal = i => conv(finalPrice(product(i.id))) * i.qty;
const bagTotal = () => Math.round(bag.reduce((s, i) => s + lineTotal(i), 0) * 100) / 100;
const shopifyUrl = () => {
  if (!CONFIG.SHOPIFY_STORE_DOMAIN) return '';
  const parts = bag.map(i => product(i.id).shopify?.[i.size] && `${product(i.id).shopify[i.size]}:${i.qty}`);
  return parts.every(Boolean) ? `https://${CONFIG.SHOPIFY_STORE_DOMAIN}/cart/${parts.join(',')}` : '';
};
console.assert((() => { const b = bag, d = CONFIG.SHOPIFY_STORE_DOMAIN; bag = [{ id: 'crewneck', size: 'M', qty: 2 }]; CONFIG.SHOPIFY_STORE_DOMAIN = 'x.myshopify.com';
  PRODUCTS[0].shopify.M = '123'; const ok = shopifyUrl() === 'https://x.myshopify.com/cart/123:2'; PRODUCTS[0].shopify.M = ''; bag = b; CONFIG.SHOPIFY_STORE_DOMAIN = d; return ok; })(), 'shopify url');

function renderBag() {
  const n = bag.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('[data-bag-count]').forEach(el => { el.textContent = n; el.hidden = !n; });
  const checkout = shopifyUrl();
  $('bag').querySelector('.drawer-body').innerHTML = `
    <h3>${t('bag.title')}</h3>
    <div class="cur">${Object.keys(CURRENCIES).map(c => `<button data-currency="${c}" aria-pressed="${c === currency}">${c}</button>`).join('')}</div>
    ${bag.length ? `<ul class="lines">${bag.map((i, k) => { const p = product(i.id); return `
      <li><img src="${p.imgs[0]}" alt=""><div><b>${esc(p.name)}</b><span>${i.size} · ×${i.qty}</span>
        <button class="link" data-remove="${k}">${t('bag.remove')}</button></div><span>${fmt(lineTotal(i))}</span></li>`; }).join('')}</ul>
      <div class="total"><span>${t('bag.total')}</span><span>${fmt(bagTotal())}</span></div>
      <small>${t('final')}</small>
      ${checkout ? `<a class="btn red" href="${checkout}">${t('bag.checkout')}</a>` : `<button class="btn red" data-dm>${t('bag.dm')}</button>`}`
    : `<p class="empty">${t('bag.empty')}</p>`}`;
}
$('bag').addEventListener('click', async e => {
  const cur = e.target.closest('[data-currency]');
  if (cur) { currency = cur.dataset.currency; store.set('currency', currency); render(); return; }
  const rm = e.target.closest('[data-remove]');
  if (rm) { bag.splice(+rm.dataset.remove, 1); saveBag(); return; }
  if (e.target.closest('[data-dm]')) {
    const text = `${t('bag.order')}:\n` + bag.map(i => `${product(i.id).name} — ${t('bag.size')} ${i.size} ×${i.qty} — ${fmt(lineTotal(i))}`).join('\n')
      + `\n${t('bag.total')}: ${fmt(bagTotal())}`;
    try { await navigator.clipboard.writeText(text); } catch {}
    window.open(CONFIG.INSTAGRAM_DM, '_blank', 'noopener');
    $('bag').close();
    toast(t('bag.copied'));
  }
});

// ---------- Dialog openers ----------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-open]');
  if (!b) return;
  const id = b.dataset.open;
  if (id === 'auth' && user) { location.href = 'account.html'; return; }
  if (id === 'cookies') $('cookie-form').analytics.checked = !!store.get('consent', {}).analytics;
  if (id === 'auth') { authMode = 'signin'; authError = ''; renderAuth(); }
  $(id).showModal();
});

// ---------- Order tracking ----------
$('track-form').addEventListener('submit', e => {
  e.preventDefault();
  window.open(`https://t.17track.net/en#nums=${encodeURIComponent(e.target.n.value.trim())}`, '_blank', 'noopener');
});

// ---------- First visit: country + language, then cookies ----------
const showCookiebar = () => { if (!store.get('consent')) $('cookiebar').hidden = false; };
$('welcome').addEventListener('cancel', e => e.preventDefault()); // first-visit choice is required
$('welcome-form').addEventListener('change', e => { if (e.target.name === 'lang') setLang(e.target.value); });
$('welcome-form').addEventListener('submit', e => {
  e.preventDefault();
  const c = e.target.country.value;
  store.set('country', c);
  currency = currencyFor(c); store.set('currency', currency);
  setLang(e.target.lang.value, true);
  $('welcome').close();
  showCookiebar();
});
const saveConsent = analytics => { store.set('consent', { analytics, at: Date.now() }); $('cookiebar').hidden = true; };
$('cookiebar').addEventListener('click', e => { if (e.target.closest('[data-cookie="all"]')) saveConsent(true); });
$('cookie-form').addEventListener('submit', e => { e.preventDefault(); saveConsent(e.target.analytics.checked); $('cookies').close(); });

// ---------- Sign in (Firebase, loaded only when configured) ----------
let user = null, role = null, authMode = 'signin', authError = '', authApi = null;
const ERRORS = { 'auth/invalid-credential': 'auth.errLogin', 'auth/wrong-password': 'auth.errLogin', 'auth/user-not-found': 'auth.errLogin',
  'auth/weak-password': 'auth.errWeak', 'auth/email-already-in-use': 'auth.errExists' };
function renderAuth() {
  const body = $('auth').querySelector('.auth-body');
  if (!CONFIG.FIREBASE) body.innerHTML = `<h3>${t('auth.signin')}</h3><p>${t('auth.soon')}</p>`;
  else body.innerHTML = `
    <div class="tabs"><button data-mode="signin" aria-pressed="${authMode === 'signin'}">${t('auth.signin')}</button>
      <button data-mode="signup" aria-pressed="${authMode === 'signup'}">${t('auth.create')}</button></div>
    <form class="form" id="auth-form">
      <label><span>${t('auth.email')}</span><input name="email" type="email" required autocomplete="email"></label>
      <label><span>${t('auth.password')}</span><input name="password" type="password" required minlength="6"
        autocomplete="${authMode === 'signup' ? 'new-password' : 'current-password'}"></label>
      ${authMode === 'signup' ? `<div class="roles">
        <label class="check"><input type="radio" name="role" value="customer" checked><span>${t('auth.customer')}</span></label>
        <label class="check"><input type="radio" name="role" value="artist"><span>${t('auth.artist')}</span></label></div>` : ''}
      ${authError ? `<p class="error" role="alert">${t(authError)}</p>` : ''}
      <button class="btn red">${t(authMode === 'signup' ? 'auth.create' : 'auth.signin')} →</button>
      <button type="button" class="btn" data-google>${t('auth.google')}</button>
    </form>`;

  const acc = $('account');
  if (acc) acc.innerHTML = !CONFIG.FIREBASE ? `<p class="big">${t('auth.soon')}</p>`
    : user ? `<dl class="acct"><dt>${t('auth.email')}</dt><dd>${esc(user.email || '')}</dd>
        <dt>${t('auth.role')}</dt><dd>${role ? t('role.' + role) : '—'}</dd></dl>
        <button class="btn red" data-signout>${t('auth.signout')}</button>`
    : `<button class="btn red" data-open="auth">${t('auth.signin')} →</button>`;
}
$('auth').addEventListener('click', async e => {
  const m = e.target.closest('[data-mode]');
  if (m) { authMode = m.dataset.mode; authError = ''; renderAuth(); return; }
  if (e.target.closest('[data-google]')) {
    const r = $('auth-form').role?.value || 'customer';
    try { await authApi.google(r); $('auth').close(); } catch (err) { authError = ERRORS[err.code] || 'auth.err'; renderAuth(); }
  }
});
$('auth').addEventListener('submit', async e => {
  if (e.target.id !== 'auth-form') return;
  e.preventDefault();
  const f = e.target;
  try {
    if (authMode === 'signup') await authApi.signUp(f.email.value, f.password.value, f.role.value);
    else await authApi.signIn(f.email.value, f.password.value);
    $('auth').close();
  } catch (err) { authError = ERRORS[err.code] || 'auth.err'; renderAuth(); }
});
document.addEventListener('click', async e => {
  if (e.target.closest('[data-signout]')) await authApi?.signOut();
});
if (CONFIG.FIREBASE) {
  import('./auth.js').then(async api => {
    authApi = api;
    await api.init(CONFIG.FIREBASE, (u, r) => { user = u; role = r; renderAuth(); });
  }).catch(() => {});
}

// ---------- Video: autoplay previews on screen, sound toggle ----------
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver(entries => entries.forEach(({ target: v, isIntersecting }) => {
  if (isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
}), { threshold: 0.6 });
document.querySelectorAll('video[data-auto]').forEach(v => io.observe(v));
document.querySelectorAll('.sound').forEach(b => b.addEventListener('click', () => {
  const v = b.parentElement.querySelector('video');
  v.muted = !v.muted;
  if (!v.muted) v.play().catch(() => {});
  b.textContent = t(v.muted ? 'sound.off' : 'sound.on');
}));
// Only one media video plays at a time
document.addEventListener('play', e => document.querySelectorAll('video[controls]').forEach(v => { if (v !== e.target) v.pause(); }), true);

// ---------- Mobile menu ----------
const menu = document.querySelector('.menu'), burger = menu.querySelector('.burger');
const toggleMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.textContent = t(open ? 'menu.close' : 'menu.open'); };
burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
menu.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

// ---------- Start ----------
const browserLang = (navigator.languages || [navigator.language]).map(l => l.slice(0, 2)).find(l => LANGS.includes(l));
setLang(store.get('lang') || browserLang);
if (!store.get('country')) { $('welcome-form').lang.value = lang; $('welcome').showModal(); }
else showCookiebar();
