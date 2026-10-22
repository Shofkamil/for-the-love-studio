// ---- Edit here ----
const WHOP_URL = 'https://whop.com/biz_onI9jbO3hUpNfg?a=saltysofa';
const SKILL_URL = 'https://whop.com/joined/for-the-love-studio/courses-O8PvF68SjATrHJ/app/courses/cors_UnneQR3dB6jg8/lessons/lesn_xovOZA1YxGDb9/';
const EMAIL = 'forthelovestudio2025@gmail.com';

// line: key from i18n.js (line.*). note: optional i18n key shown under the name.
// sale: 0.5 = -50%. limited: LIMITED badge. Sizes are S–XL only.
const PRODUCTS = [
  { id: 'crewneck', line: 'newdrop', name: 'For The Love Studio Crewneck', price: 95, sale: null, limited: true, sizes: ['S', 'M', 'L', 'XL'], img: 'assets/p8057.jpg' },
  { id: 'baad-pants', line: 'baad', name: 'FTL Studio “BAAD” Pants', note: 'note.custom', price: 60, sale: null, limited: false, sizes: ['S', 'M', 'L', 'XL'], img: 'assets/baad-1.jpg' },
];

// Media page. cat: studio | philosophy | podcasts | reels.
// yt: YouTube video ID (the part after watch?v= or /shorts/). short: true for vertical Shorts.
// Add a new video = add one line. Empty yt shows a "coming soon" tile.
const MEDIA = [
  { cat: 'studio', title: 'What is For The Love Studio', yt: '' },
  { cat: 'philosophy', title: 'Be Authentic, Be Yourself', yt: '' },
  { cat: 'podcasts', title: 'Podcast 01', yt: '' },
  { cat: 'podcasts', title: 'Podcast 02', yt: '' },
  { cat: 'reels', title: 'Reel 01', yt: '', short: true },
  { cat: 'reels', title: 'Reel 02', yt: '', short: true },
];
// -------------------

const $ = id => document.getElementById(id);
const LANGS = Object.keys(I18N);
let lang = 'en';
const t = key => I18N[lang][key] ?? I18N.en[key] ?? key;
const eur = n => new Intl.NumberFormat(lang === 'en' ? 'en-IE' : lang, { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
const finalPrice = p => p.sale ? Math.round(p.price * (1 - p.sale) * 100) / 100 : p.price;
const priceHTML = p => p.sale ? `<s>${eur(p.price)}</s>${eur(finalPrice(p))}` : eur(p.price);
const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
console.assert(finalPrice({ price: 95, sale: 0.5 }) === 47.5 && finalPrice({ price: 60, sale: null }) === 60, 'sale math');
console.assert(LANGS.every(l => Object.keys(I18N.en).every(k => k in I18N[l])), 'missing translation');

const ext = (sel, url) => document.querySelectorAll(sel).forEach(a => { a.href = url; a.target = '_blank'; a.rel = 'noopener'; });
ext('.whop', WHOP_URL);
ext('.skill', SKILL_URL);

// Everything that depends on the language is drawn here and redrawn on switch
function render() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
  document.querySelectorAll('[data-ticker]').forEach(el => { el.textContent = `${t('ticker')} · `.repeat(6); });
  document.querySelectorAll('.sound').forEach(b => { b.textContent = t(b.parentElement.querySelector('video').muted ? 'sound.off' : 'sound.on'); });
  burger.textContent = t(menu.classList.contains('open') ? 'menu.close' : 'menu.open');

  if ($('lines')) {
    $('lines').innerHTML = `<div class="products">${PRODUCTS.map(p => `
      <button class="card" data-product="${p.id}">
        <div class="ph"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy">
          ${p.sale ? `<span class="badge">-${Math.round(p.sale * 100)}%</span>` : p.limited ? `<span class="badge">${t('badge.limited')}</span>` : ''}</div>
        <div class="meta"><span>${esc(p.name)}</span><span>${priceHTML(p)}</span></div>
        <div class="sub">${t('line.' + p.line)}${p.note ? ' · ' + t(p.note) : ''}</div>
      </button>`).join('')}</div>`;
  }

  document.querySelectorAll('.tags button[data-product]').forEach(b => {
    const p = PRODUCTS.find(x => x.id === b.dataset.product);
    b.innerHTML = `+ ${esc(p.name.toUpperCase())} — ${priceHTML(p)}`;
  });

  if ($('media-list')) {
    const cats = [...new Set(MEDIA.map(m => m.cat))];
    $('media-list').innerHTML = cats.map(cat => `
      <div class="line-head">${t('cat.' + cat)}</div>
      <div class="media-grid">${MEDIA.filter(m => m.cat === cat).map(m => `
        <figure>
          <div class="yt${m.short ? ' short' : ''}">${m.yt
            ? `<button class="yt-play" data-yt="${esc(m.yt)}" aria-label="${t('media.play')}: ${esc(m.title)}">
                 <img src="https://i.ytimg.com/vi/${encodeURIComponent(m.yt)}/hqdefault.jpg" alt="" loading="lazy"></button>`
            : `<span>${t('media.soon')}</span>`}</div>
          <figcaption>${esc(m.title)}</figcaption>
        </figure>`).join('')}</div>`).join('');
  }

  if (dlg?.open) fillDialog();
}

// Language: saved choice, else browser language, else English
function setLang(l, remember) {
  lang = LANGS.includes(l) ? l : 'en';
  if (remember) try { localStorage.setItem('lang', lang); } catch {}
  render();
}
document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang, true)));

// Product dialog
const dlg = $('pdp');
let current;
function setOrderLink() {
  const size = dlg.querySelector('input[name=size]:checked').value;
  const subject = `${t('mail.subject')}: ${current.name} / ${size}`;
  const body = `${t('mail.hi')}\n\n${current.name} — ${t('mail.size')} ${size} — ${eur(finalPrice(current))}\n\n${t('mail.name')}\n${t('mail.address')}\n`;
  dlg.querySelector('.order').href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function fillDialog() {
  const picked = dlg.querySelector('input[name=size]:checked')?.value;
  dlg.querySelector('img').src = current.img;
  dlg.querySelector('img').alt = current.name;
  dlg.querySelector('.line').textContent = t('line.' + current.line) + (current.limited ? ' · ' + t('badge.limited') : '');
  dlg.querySelector('.name').textContent = current.name;
  dlg.querySelector('.note').textContent = current.note ? t(current.note) : '';
  dlg.querySelector('.price').innerHTML = priceHTML(current);
  dlg.querySelector('.sizes').innerHTML = current.sizes.map((s, i) =>
    `<label><input type="radio" name="size" value="${s}" ${(picked ? s === picked : i === 1) ? 'checked' : ''}><span>${s}</span></label>`).join('');
  setOrderLink();
}
if (dlg) {
  document.addEventListener('click', e => {
    const card = e.target.closest('[data-product]');
    if (!card) return;
    current = PRODUCTS.find(p => p.id === card.dataset.product);
    dlg.querySelector('.sizes').innerHTML = '';
    fillDialog();
    dlg.showModal();
  });
  dlg.addEventListener('change', setOrderLink);
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
}

// Media: load the YouTube player only when a thumbnail is clicked
document.addEventListener('click', e => {
  const b = e.target.closest('.yt-play');
  if (!b) return;
  b.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.yt)}?autoplay=1" title="${esc(b.getAttribute('aria-label'))}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
});

// Autoplay only what's on screen
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver(entries => entries.forEach(({ target: v, isIntersecting }) => {
  if (isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
}), { threshold: 0.6 });
document.querySelectorAll('video[data-auto]').forEach(v => io.observe(v));

document.querySelectorAll('.sound').forEach(b => b.addEventListener('click', () => {
  const v = b.parentElement.querySelector('video');
  v.muted = !v.muted;
  b.textContent = t(v.muted ? 'sound.off' : 'sound.on');
}));

// Mobile menu
const menu = document.querySelector('.menu'), burger = menu.querySelector('.burger');
const toggleMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.textContent = t(open ? 'menu.close' : 'menu.open'); };
burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
menu.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

let saved = null;
try { saved = localStorage.getItem('lang'); } catch {}
setLang(saved || (navigator.languages || [navigator.language]).map(l => l.slice(0, 2)).find(l => LANGS.includes(l)));
