/* ============================================================
   FAKTOR — логіка сторінки новобудови (ЖК).
   Галерея ЖК (фото + генплан) з мініатюрами, лічильником і лейблом
   сцени; лайтбокс (галерея + плани відкриваються тут); обране;
   сітка планувань; вкладки «Схожі новобудови»; пропозиції в ЖК;
   нещодавно переглянуті; форма «Призначити огляд об'єкту».
   Дані-плейсхолдери — у проді приходять з CRM/бази новобудов.
   Той самий патерн, що js/property.js; класи стрічок/лайтбокса спільні (.pp-).
   ============================================================ */

/* ---------------- тост (як у каталозі / property) ---------------- */
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------- галерея ЖК (фото + генплан) ---------------- */
const SCENES = [
  { src: 'img/photos/residential-complex-dusk.jpg', label: 'Фасад' },
  { src: 'img/photos/house-modern-exterior.jpg',    label: 'Двір' },
  { src: 'img/photos/residential-complex-dusk.jpg', label: 'Вхідна група' },
  { src: 'img/photos/interior-marble-bathroom.jpg', label: 'Шоурум' },
  { src: 'img/photos/house-modern-exterior.jpg',    label: 'Інфраструктура' },
  { src: 'img/photos/interior-marble-bathroom.jpg', label: 'Вид з вікна' },
  { src: 'img/photos/residential-complex-dusk.jpg', label: 'Генплан' },
];
let activeImg = 0;
const total = SCENES.length;

const mainImg   = document.getElementById('zhk-main-img');
const mainLabel = document.getElementById('zhk-main-label');
const countCur  = document.getElementById('zhk-count-cur');
const thumbsBox = document.getElementById('zhk-thumbs');

// лайтбокс
const lb       = document.getElementById('zhk-lb');
const lbImg    = document.getElementById('zhk-lb-img');
const lbLabel  = document.getElementById('zhk-lb-label');
const lbCur    = document.getElementById('zhk-lb-cur');
const lbThumbs = document.getElementById('zhk-lb-thumbs');

document.getElementById('zhk-count-total').textContent = total;
document.getElementById('zhk-lb-total').textContent = total;

// рендер мініатюр (основна стрічка + у лайтбоксі)
thumbsBox.innerHTML = SCENES.map((p, i) =>
  `<button class="pp-thumb${i === activeImg ? ' on' : ''}" data-i="${i}" aria-label="${p.label}"><img src="${p.src}" alt=""></button>`
).join('');
lbThumbs.innerHTML = SCENES.map((p, i) =>
  `<button class="pp-lb__thumb${i === activeImg ? ' on' : ''}" data-i="${i}" aria-label="${p.label}"><img src="${p.src}" alt=""></button>`
).join('');

function setImg(i){
  activeImg = (i + total) % total;
  const p = SCENES[activeImg];
  mainImg.src = p.src;
  lbImg.src = p.src;
  mainLabel.textContent = p.label;
  countCur.textContent = activeImg + 1;
  lbCur.textContent = activeImg + 1;
  lbLabel.textContent = p.label;
  thumbsBox.querySelectorAll('.pp-thumb').forEach((b, x) => b.classList.toggle('on', x === activeImg));
  lbThumbs.querySelectorAll('.pp-lb__thumb').forEach((b, x) => b.classList.toggle('on', x === activeImg));
}
thumbsBox.addEventListener('click', e => { const b = e.target.closest('.pp-thumb'); if(b) setImg(+b.dataset.i); });
lbThumbs.addEventListener('click', e => { const b = e.target.closest('.pp-lb__thumb'); if(b) setImg(+b.dataset.i); });

/* ---------------- обране (сердечко на галереї) ---------------- */
const favBtn = document.getElementById('zhk-fav');
favBtn.addEventListener('click', () => {
  const img = favBtn.querySelector('img');
  const on = img.src.includes('like.svg');
  img.src = on ? 'img/icons/fav.svg' : 'img/icons/like.svg';
  toast(on ? 'Видалено з обраного' : 'Додано до обраного');
});

/* ---------------- лайтбокс ---------------- */
function openLb(){ lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeLb(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
document.getElementById('zhk-open-lb').addEventListener('click', openLb);
mainImg.addEventListener('click', openLb);
document.getElementById('zhk-lb-close').addEventListener('click', closeLb);
document.getElementById('zhk-lb-prev').addEventListener('click', () => setImg(activeImg - 1));
document.getElementById('zhk-lb-next').addEventListener('click', () => setImg(activeImg + 1));
lb.addEventListener('click', e => { if(e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if(!lb.classList.contains('open')) return;
  if(e.key === 'Escape') closeLb();
  else if(e.key === 'ArrowLeft') setImg(activeImg - 1);
  else if(e.key === 'ArrowRight') setImg(activeImg + 1);
});

/* ---------------- планування: сітка планів → лайтбокс (генплан) ---------------- */
const PLAN_INDEX = total - 1; // у лайтбоксі плани показуємо на сцені «Генплан»
const plansBox = document.getElementById('zhk-plans');
plansBox.innerHTML = [1,2,3,4,5,6].map(n =>
  `<button class="zhk-plan" data-plan="${n}" aria-label="План ${n}"><span>план ${n}</span></button>`
).join('');
plansBox.addEventListener('click', e => { if(e.target.closest('.zhk-plan')){ setImg(PLAN_INDEX); openLb(); } });

/* ---------------- акція (з CRM): ховаємо блок, якщо тексту немає ---------------- */
const PROMO_TEXT = 'При 100% оплаті — додатковий бонус: паркомісце за спеціальною ціною. Деталі акції — у відділі продажу.';
if(!PROMO_TEXT.trim()) document.getElementById('zhk-promo').classList.add('is-hidden');

/* ---------------- стрічки карток ---------------- */
const FEED_PHOTOS = ['img/photos/residential-complex-dusk.jpg', 'img/photos/house-modern-exterior.jpg', 'img/photos/interior-marble-bathroom.jpg', 'img/photos/residential-complex-dusk.jpg'];

const icRooms = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 15h18M6 11V8h5v3"/></svg>';
const icArea  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5"/></svg>';
const icFloor = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h4v-4h4v-4h4V8h4"/></svg>';
const heartSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5.5c2 0 3.2 1 4 2.2.8-1.2 2-2.2 4-2.2 3.5 0 5 3.5 3.5 7C19 16.65 12 21 12 21z"/></svg>';

function fcardHTML(item, i){
  return `<a class="pp-fcard" href="property.html">
    <div class="pp-fcard__img">
      <img src="${FEED_PHOTOS[i % FEED_PHOTOS.length]}" alt="">
      <span class="pp-fcard__heart">${heartSvg}</span>
    </div>
    <div class="pp-fcard__body">
      <div class="pp-fcard__price">${item.price}</div>
      <div class="pp-fcard__cx">${item.complex}</div>
      <div class="pp-fcard__ad">${item.addr}</div>
      <div class="pp-fcard__row">
        <span>${icRooms}${item.rooms}</span><span>${icArea}${item.area}</span><span>${icFloor}${item.floor}</span>
      </div>
    </div>
  </a>`;
}
function renderGrid(gridId, items){
  document.getElementById(gridId).innerHTML = items.map((it, i) => fcardHTML(it, i)).join('');
}

/* пропозиції в цьому ЖК */
const COMPLEX_ADDR = 'Приморський р-н, вул. Віце-Адмірала Азарова';
renderGrid('zhk-flats-grid', [
  { price: '$ 54 000',  complex: 'ЖК OZONE', rooms: '1 кімн.', area: '38 м²',  floor: '4/16',  addr: COMPLEX_ADDR },
  { price: '$ 82 000',  complex: 'ЖК OZONE', rooms: '2 кімн.', area: '58 м²',  floor: '7/16',  addr: COMPLEX_ADDR },
  { price: '$ 124 000', complex: 'ЖК OZONE', rooms: '3 кімн.', area: '88 м²',  floor: '9/16',  addr: COMPLEX_ADDR },
  { price: '$ 172 000', complex: 'ЖК OZONE', rooms: '4 кімн.', area: '120 м²', floor: '12/16', addr: COMPLEX_ADDR },
]);

/* схожі новобудови — вкладки «Від цієї компанії / На цій вулиці / У цьому ж районі» */
const FEED_TABS = [
  { label: 'Від цієї компанії',  complex: 'ЖК Arcadia Tower', addr: 'Приморський р-н, Французький бульвар' },
  { label: 'На цій вулиці',      complex: 'ЖК Marine',        addr: 'Приморський р-н, вул. Віце-Адмірала Азарова' },
  { label: 'У цьому ж районі',   complex: 'ЖК Перлина',       addr: 'Приморський р-н, вул. Генуезька' },
];
const FEED_BASE = [
  { price: 'від $ 48 000', rooms: '1–4 кімн.', area: 'від 36 м²', floor: '16 пов.' },
  { price: 'від $ 61 000', rooms: '1–3 кімн.', area: 'від 41 м²', floor: '24 пов.' },
  { price: 'від $ 73 000', rooms: '1–4 кімн.', area: 'від 44 м²', floor: '12 пов.' },
  { price: 'від $ 92 000', rooms: '2–5 кімн.', area: 'від 58 м²', floor: '9 пов.' },
];
function renderFeed(def){
  renderGrid('zhk-feed-grid', FEED_BASE.map(b => ({ ...b, complex: def.complex, addr: def.addr })));
}
const tabsBox = document.getElementById('zhk-feed-tabs');
tabsBox.innerHTML = FEED_TABS.map((f, i) =>
  `<button class="pp-feed__tab${i === 0 ? ' on' : ''}" data-i="${i}">${f.label}</button>`
).join('');
tabsBox.addEventListener('click', e => {
  const b = e.target.closest('.pp-feed__tab');
  if(!b) return;
  tabsBox.querySelectorAll('.pp-feed__tab').forEach(x => x.classList.toggle('on', x === b));
  renderFeed(FEED_TABS[+b.dataset.i]);
});
renderFeed(FEED_TABS[0]);

/* нещодавно переглянуті */
renderGrid('zhk-recent-grid', [
  { price: '$ 124 000', complex: 'ЖК OZONE',        rooms: '3 кімн.', area: '147 м²', floor: '2/5',  addr: 'Приморський р-н, Одеса' },
  { price: '$ 74 000',  complex: 'ЖК Marine',       rooms: '1 кімн.', area: '46 м²',  floor: '4/9',  addr: 'Приморський р-н, Одеса' },
  { price: '$ 210 000', complex: 'ЖК Arcadia Tower', rooms: '4 кімн.', area: '180 м²', floor: '6/12', addr: 'Приморський р-н, Одеса' },
  { price: '$ 170 000', complex: 'ЖК Перлина',      rooms: '2 кімн.', area: '88 м²',  floor: '3/16', addr: 'Приморський р-н, Одеса' },
]);

/* ---------------- форма «Призначити огляд об'єкту» ---------------- */
document.getElementById('zhk-form').addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  toast('Запит надіслано — менеджер зв’яжеться з вами найближчим часом');
});
