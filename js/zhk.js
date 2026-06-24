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

/* Картки стрічок — ЕТАЛОН .card через спільний білдер FCard (js/card.js).
   Звичайні квартири → kind:apartment (стат-рядок); «схожі новобудови»
   (ціна «від …») → kind:newbuild (підвал «Перший внесок» + «Детальніше»). */
function fcardHTML(item, i){
  const nb = item.kind === 'newbuild';
  return FCard.html({
    kind: nb ? 'newbuild' : 'apartment',
    badge: nb ? 'Новобудова' : 'Квартира',
    price: item.price,
    title: item.complex,
    addr: item.addr,
    img: FEED_PHOTOS[i % FEED_PHOTOS.length],
    href: 'property.html',
    installment: item.installment,
    stats: nb ? null : [{ k:'rooms', text:item.rooms }, { k:'floor', text:item.floor }, { k:'area', text:item.area }]
  }, { heart: 'out' });
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
  { kind: 'newbuild', price: 'від $ 48 000', installment: 'Перший внесок від 20%' },
  { kind: 'newbuild', price: 'від $ 61 000', installment: 'Перший внесок від 20%' },
  { kind: 'newbuild', price: 'від $ 73 000', installment: 'Перший внесок від 30%' },
  { kind: 'newbuild', price: 'від $ 92 000', installment: 'Перший внесок від 25%' },
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

/* серце на картках стрічок (ЕТАЛОН .card) — системні fav.svg/like.svg */
document.addEventListener('click', e => {
  const h = e.target.closest('.card__heart');
  if(!h) return;
  e.preventDefault();
  const img = h.querySelector('img');
  const on = img && img.src.includes('fav.svg');   // зараз контур → стане залите
  if(img) img.src = on ? FCard.HEART_FAV : FCard.HEART_OUT;
  toast(on ? 'Додано до обраного' : 'Видалено з обраного');
});

/* ---------------- форма «Призначити огляд об'єкту» ---------------- */
document.getElementById('zhk-form').addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  toast('Запит надіслано — менеджер зв’яжеться з вами найближчим часом');
});
