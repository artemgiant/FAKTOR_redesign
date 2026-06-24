/* ============================================================
   FAKTOR — логіка сторінки об'єкта (Property Page)
   Галерея (мініатюри + лічильник), лайтбокс, обране, вкладки
   стрічок «Дивіться також», форма «Замовити перегляд».
   Дані-плейсхолдери — у проді приходять з CRM/бази об'єктів.
   ============================================================ */

/* ---------------- тост (як у каталозі) ---------------- */
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------- галерея ---------------- */
const PHOTOS = [
  { src: 'img/photos/interior-marble-bathroom.jpg', label: 'Вітальня' },
  { src: 'img/photos/residential-complex-dusk.jpg', label: 'Вид з вікна' },
  { src: 'img/photos/house-modern-exterior.jpg',    label: 'Тераса' },
  { src: 'img/photos/interior-marble-bathroom.jpg', label: 'Санвузол' },
  { src: 'img/photos/residential-complex-dusk.jpg', label: 'Фасад ЖК' },
];
let activeImg = 0;
const total = PHOTOS.length;

const mainImg   = document.getElementById('pp-main-img');
const countCur  = document.getElementById('pp-count-cur');
const countTot  = document.getElementById('pp-count-total');
const thumbsBox = document.getElementById('pp-thumbs');

// лайтбокс
const lb        = document.getElementById('pp-lb');
const lbImg     = document.getElementById('pp-lb-img');
const lbLabel   = document.getElementById('pp-lb-label');
const lbCur     = document.getElementById('pp-lb-cur');
const lbThumbs  = document.getElementById('pp-lb-thumbs');

countTot.textContent = total;
document.getElementById('pp-lb-total').textContent = total;

// рендер мініатюр (основна стрічка + у лайтбоксі)
thumbsBox.innerHTML = PHOTOS.map((p, i) =>
  `<button class="pp-thumb${i === activeImg ? ' on' : ''}" data-i="${i}" aria-label="${p.label}"><img src="${p.src}" alt=""></button>`
).join('');
lbThumbs.innerHTML = PHOTOS.map((p, i) =>
  `<button class="pp-lb__thumb${i === activeImg ? ' on' : ''}" data-i="${i}" aria-label="${p.label}"><img src="${p.src}" alt=""></button>`
).join('');

function setImg(i){
  activeImg = (i + total) % total;
  const p = PHOTOS[activeImg];
  mainImg.src = p.src;
  lbImg.src = p.src;
  countCur.textContent = activeImg + 1;
  lbCur.textContent = activeImg + 1;
  lbLabel.textContent = p.label;
  thumbsBox.querySelectorAll('.pp-thumb').forEach((b, x) => b.classList.toggle('on', x === activeImg));
  lbThumbs.querySelectorAll('.pp-lb__thumb').forEach((b, x) => b.classList.toggle('on', x === activeImg));
}
thumbsBox.addEventListener('click', e => { const b = e.target.closest('.pp-thumb'); if(b) setImg(+b.dataset.i); });
lbThumbs.addEventListener('click', e => { const b = e.target.closest('.pp-lb__thumb'); if(b) setImg(+b.dataset.i); });

/* ---------------- обране (сердечко на галереї) ---------------- */
const favBtn = document.getElementById('pp-fav');
favBtn.addEventListener('click', () => {
  const img = favBtn.querySelector('img');
  const on = img.src.includes('like.svg');
  img.src = on ? 'img/icons/fav.svg' : 'img/icons/like.svg';
  toast(on ? 'Видалено з обраного' : 'Додано до обраного');
});

/* ---------------- лайтбокс ---------------- */
function openLb(){ lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeLb(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
document.getElementById('pp-open-lb').addEventListener('click', openLb);
mainImg.addEventListener('click', openLb);
document.getElementById('pp-lb-close').addEventListener('click', closeLb);
document.getElementById('pp-lb-prev').addEventListener('click', () => setImg(activeImg - 1));
document.getElementById('pp-lb-next').addEventListener('click', () => setImg(activeImg + 1));
lb.addEventListener('click', e => { if(e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if(!lb.classList.contains('open')) return;
  if(e.key === 'Escape') closeLb();
  else if(e.key === 'ArrowLeft') setImg(activeImg - 1);
  else if(e.key === 'ArrowRight') setImg(activeImg + 1);
});

/* ---------------- стрічки об'єктів ---------------- */
const FEED_PHOTOS = ['img/photos/interior-marble-bathroom.jpg', 'img/photos/house-modern-exterior.jpg', 'img/photos/residential-complex-dusk.jpg', 'img/photos/interior-marble-bathroom.jpg'];
const FEED_BASE = [
  { price: '$ 124 000', rooms: '3 кімн.', area: '147 м²', floor: '2/5' },
  { price: '$ 74 000',  rooms: '1 кімн.', area: '46 м²',  floor: '4/9' },
  { price: '$ 210 000', rooms: '4 кімн.', area: '180 м²', floor: '6/12' },
  { price: '$ 170 000', rooms: '2 кімн.', area: '88 м²',  floor: '3/16' },
];
const FEED_TABS = [
  { label: 'Схожі об’єкти',   complex: 'ЖК OZONE',        addr: 'Приморський р-н, вул. Віце-Адмірала Азарова' },
  { label: 'На цій вулиці',   complex: 'ЖК OZONE',        addr: 'Приморський р-н, вул. Віце-Адмірала Азарова' },
  { label: 'У цьому ж районі', complex: 'ЖК Аркадія Сіті', addr: 'Приморський р-н, Французький бульвар' },
  { label: 'Подібна ціна',    complex: 'ЖК Перлина',      addr: 'Київський р-н, вул. Генуезька' },
  { label: 'Схожа площа',     complex: 'ЖК More',         addr: 'Приморський р-н, вул. Гагарінське плато' },
];

/* Картки стрічок — ЕТАЛОН .card через спільний білдер FCard (js/card.js).
   Назва ЖК у назві картки, район/вулиця — в адресі; контурне серце. */
function feedCardHTML(item, def, i){
  return FCard.html({
    kind: 'apartment',
    badge: 'Квартира',
    price: item.price,
    title: def.complex,
    addr: def.addr,
    img: FEED_PHOTOS[i % FEED_PHOTOS.length],
    href: 'property.html',
    stats: [{ k:'rooms', text:item.rooms }, { k:'floor', text:item.floor }, { k:'area', text:item.area }]
  }, { heart: 'out' });
}
function renderFeed(gridId, def){
  document.getElementById(gridId).innerHTML = FEED_BASE.map((b, i) => feedCardHTML(b, def, i)).join('');
}

// вкладки «Дивіться також»
const tabsBox = document.getElementById('pp-feed-tabs');
tabsBox.innerHTML = FEED_TABS.map((f, i) =>
  `<button class="pp-feed__tab${i === 0 ? ' on' : ''}" data-i="${i}">${f.label}</button>`
).join('');
tabsBox.addEventListener('click', e => {
  const b = e.target.closest('.pp-feed__tab');
  if(!b) return;
  tabsBox.querySelectorAll('.pp-feed__tab').forEach(x => x.classList.toggle('on', x === b));
  renderFeed('pp-feed-grid', FEED_TABS[+b.dataset.i]);
});
renderFeed('pp-feed-grid', FEED_TABS[0]);
renderFeed('pp-recent-grid', { complex: 'ЖК More', addr: 'Приморський р-н, вул. Гагарінське плато' });

/* серце на картках стрічок (ЕТАЛОН .card) — додає/прибирає з обраного */
document.addEventListener('click', e => {
  const h = e.target.closest('.card__heart');
  if(!h) return;
  e.preventDefault();
  const on = h.classList.toggle('is-fav');
  toast(on ? 'Додано до обраного' : 'Видалено з обраного');
});

/* ---------------- форма «Замовити перегляд» ---------------- */
document.getElementById('pp-form').addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  toast('Запит надіслано — менеджер зв’яжеться з вами найближчим часом');
});
