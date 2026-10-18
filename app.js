// ---- Edit here ----
const WHOP_URL = 'https://whop.com/for-the-love-studio/';
const SKILL_URL = 'https://whop.com/joined/for-the-love-studio/courses-O8PvF68SjATrHJ/app/courses/cors_UnneQR3dB6jg8/lessons/lesn_xovOZA1YxGDb9/';
const EMAIL = 'forthelovestudio2025@gmail.com';

// sale: 0.5 = -50%. limited: shows LIMITED badge. soon: placeholder card, not orderable. New drop = new line here.
const PRODUCTS = [
  { id: 'crewneck', line: 'DROP 01 — FOR THE LOVE', name: 'Red Crewneck', price: 95, sale: null, limited: true, sizes: ['S', 'M', 'L', 'XL'], img: 'assets/p8057.jpg' },
  // TODO: new pants — add photo, name, price, sizes and remove `soon`
  { id: 'new-pants', line: 'NEW CLOTHING IS OUT NOW', name: 'New Pants', soon: true },
];

// Media page. yt = YouTube video ID (the part after watch?v= or /shorts/). short: true for vertical Shorts.
// TODO: fill yt IDs once the YouTube channel link is known. Empty yt shows COMING SOON.
const MEDIA = [
  { cat: 'About the Studio', title: 'What is For The Love Studio', yt: '' },
  { cat: 'Philosophy', title: 'Be Authentic, Be Yourself', yt: '' },
  { cat: 'Podcasts', title: 'Podcast 01', yt: '' },
  { cat: 'Podcasts', title: 'Podcast 02', yt: '' },
  { cat: 'Reels', title: 'Reel 01', yt: '', short: true },
  { cat: 'Reels', title: 'Reel 02', yt: '', short: true },
];

// Approved guestbook entries (signatures arrive by email; paste the good ones here).
const GUESTBOOK = [
  { name: 'Shof', city: 'Founder', ig: 'tagshof0', msg: 'For the love, always' },
];
// -------------------

const $ = id => document.getElementById(id);
const eur = n => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
const finalPrice = p => p.sale ? Math.round(p.price * (1 - p.sale) * 100) / 100 : p.price;
const priceHTML = p => p.sale ? `<s>${eur(p.price)}</s>${eur(finalPrice(p))}` : eur(p.price);
const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
console.assert(finalPrice({ price: 95, sale: 0.5 }) === 47.5 && finalPrice({ price: 120, sale: null }) === 120, 'sale math');

const ext = (sel, url) => document.querySelectorAll(sel).forEach(a => { a.href = url; a.target = '_blank'; a.rel = 'noopener'; });
ext('.whop', WHOP_URL);
ext('.skill', SKILL_URL);

// Shop: group by line
if ($('lines')) {
  const lines = [...new Set(PRODUCTS.map(p => p.line))];
  $('lines').innerHTML = lines.map(line => `
    <div class="line-head">${line}</div>
    <div class="products">${PRODUCTS.filter(p => p.line === line).map(p => p.soon ? `
      <div class="card soon"><div class="ph"><span>COMING SOON</span></div><div class="meta"><span>${p.name}</span></div></div>` : `
      <button class="card" data-product="${p.id}">
        <div class="ph"><img src="${p.img}" alt="${p.name}" loading="lazy">
          ${p.sale ? `<span class="badge">-${Math.round(p.sale * 100)}%</span>` : p.limited ? '<span class="badge">LIMITED</span>' : ''}</div>
        <div class="meta"><span>${p.name}</span><span>${priceHTML(p)}</span></div>
      </button>`).join('')}</div>`).join('');
}

// Reel tags
document.querySelectorAll('.tags button[data-product]').forEach(b => {
  const p = PRODUCTS.find(x => x.id === b.dataset.product);
  b.innerHTML = `+ ${p.name.toUpperCase()} — ${priceHTML(p)}`;
});

// Product dialog
const dlg = $('pdp');
if (dlg) {
  const order = dlg.querySelector('.order');
  let current;
  const setOrderLink = () => {
    const size = dlg.querySelector('input[name=size]:checked').value;
    const subject = `Order: ${current.name} / ${size}`;
    const body = `Hi! I'd like to order:\n\n${current.name} — size ${size} — ${eur(finalPrice(current))}\n\nName:\nShipping address:\n`;
    order.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-product]');
    if (!t) return;
    current = PRODUCTS.find(p => p.id === t.dataset.product);
    dlg.querySelector('img').src = current.img;
    dlg.querySelector('img').alt = current.name;
    dlg.querySelector('.line').textContent = current.line + (current.limited ? ' · LIMITED' : '');
    dlg.querySelector('.name').textContent = current.name;
    dlg.querySelector('.price').innerHTML = priceHTML(current);
    dlg.querySelector('.sizes').innerHTML = current.sizes.map((s, i) =>
      `<label><input type="radio" name="size" value="${s}" ${i === 1 ? 'checked' : ''}><span>${s}</span></label>`).join('');
    setOrderLink();
    dlg.showModal();
  });
  dlg.addEventListener('change', setOrderLink);
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
}

// Media page: one block per category, YouTube embeds or COMING SOON slots
if ($('media-list')) {
  const cats = [...new Set(MEDIA.map(m => m.cat))];
  $('media-list').innerHTML = cats.map(cat => `
    <div class="line-head">${cat}</div>
    <div class="media-grid">${MEDIA.filter(m => m.cat === cat).map(m => `
      <figure>
        <div class="yt${m.short ? ' short' : ''}">${m.yt
          ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(m.yt)}" title="${esc(m.title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
          : '<span>COMING SOON</span>'}</div>
        <figcaption>${esc(m.title)}</figcaption>
      </figure>`).join('')}</div>`).join('');
}

// Autoplay only what's on screen
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver(entries => entries.forEach(({ target: v, isIntersecting }) => {
  if (isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
}), { threshold: 0.6 });
document.querySelectorAll('video[data-auto]').forEach(v => io.observe(v));

// Sound toggle on reels
document.querySelectorAll('.sound').forEach(b => b.addEventListener('click', () => {
  const v = b.parentElement.querySelector('video');
  v.muted = !v.muted;
  b.textContent = v.muted ? 'SOUND OFF' : 'SOUND ON';
}));

// Mobile menu
const menu = document.querySelector('.menu'), burger = menu.querySelector('.burger');
const toggleMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.textContent = open ? 'CLOSE' : 'MENU'; };
burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
menu.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

// Guestbook
if ($('wall')) {
  $('wall').innerHTML = GUESTBOOK.map(g => `
    <div class="note"><p>“${esc(g.msg)}”</p><small>${esc(g.name)}${g.city ? ' · ' + esc(g.city) : ''}${g.ig ? ' · @' + esc(g.ig) : ''}</small></div>`).join('');
  $('sign').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `Name: ${f.get('name')}\nCity: ${f.get('city')}\nInstagram: ${f.get('ig')}\n\n${f.get('msg')}`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Guestbook — ' + f.get('name'))}&body=${encodeURIComponent(body)}`;
  });
}
