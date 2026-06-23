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

const icRooms = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 15h18M6 11V8h5v3"/></svg>';
const icArea  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5"/></svg>';
const icFloor = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h4v-4h4v-4h4V8h4"/></svg>';
const heartSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5.5c2 0 3.2 1 4 2.2.8-1.2 2-2.2 4-2.2 3.5 0 5 3.5 3.5 7C19 16.65 12 21 12 21z"/></svg>';

function feedCardHTML(item, def, i){
  return `<a class="pp-fcard" href="property.html">
    <div class="pp-fcard__img">
      <img src="${FEED_PHOTOS[i % FEED_PHOTOS.length]}" alt="">
      <span class="pp-fcard__heart">${heartSvg}</span>
    </div>
    <div class="pp-fcard__body">
      <div class="pp-fcard__price">${item.price}</div>
      <div class="pp-fcard__cx">${def.complex}</div>
      <div class="pp-fcard__ad">${def.addr}</div>
      <div class="pp-fcard__row">
        <span>${icRooms}${item.rooms}</span><span>${icArea}${item.area}</span><span>${icFloor}${item.floor}</span>
      </div>
    </div>
  </a>`;
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

/* ---------------- форма «Замовити перегляд» ---------------- */
document.getElementById('pp-form').addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  toast('Запит надіслано — менеджер зв’яжеться з вами найближчим часом');
});
