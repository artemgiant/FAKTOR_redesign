/* ============================================================
   FAKTOR — логіка сторінки каталогу (лістинг)
   Картки + інтерактив: обране, сортування, пагінація.
   Панель фільтрів (селекти, діапазони, кімнати, чипи, скидання) —
   окремий самодостатній компонент js/catalog-filters.js.
   ============================================================ */

/* ---------------- іконки ---------------- */
const heartOut = '<img src="img/icons/fav.svg" width="32" height="32" alt="">';
const heartFill = '<img src="img/icons/like.svg" width="32" height="32" alt="">';
const icBed  = '<img src="img/icons/bedrooms-icon-black.svg" width="20" height="20" alt="">';
const icBath = '<img src="img/icons/bathroom-icon.svg" width="20" height="20" alt="">';
const icArea = '<img src="img/icons/area-icon.svg" width="20" height="20" alt="">';
const specsHTML = `<span class="spec">3 ${icBed}</span><span class="spec">2/5 ${icBath}</span><span class="spec">147 м² ${icArea}</span>`;

const ADDR = 'Одесса, Приморский р-н, Шевченко-Французский, ул. Вице-Адмирала Азарова';

/* ---------------- тост ---------------- */
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------- картки ---------------- */
// базовий набір (12 шт.) — ціни як у макеті, повторюються по рядах
const BASE = [124000, 300000, 210000, 170000];
let CARDS = Array.from({length: 12}, (_, i) => ({ price: BASE[i % 4], n: 'ЖК OZONE', order: i }));

const fmtUsd = v => '$ ' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function cardHTML(d){
  return `<a class="card-list" href="property.html">
    <div class="img"></div>
    <div class="card-row"><div class="price t24">${fmtUsd(d.price)}</div><span class="heart">${heartOut}</span></div>
    <div class="name t18">${d.n}</div>
    <div class="addr t15">${ADDR}</div>
    <div class="specs">${specsHTML}</div>
  </a>`;
}
function renderCards(){
  document.getElementById('cat-grid').innerHTML = CARDS.map(cardHTML).join('');
}
renderCards();

/* ---------------- обране (делегування) ---------------- */
document.addEventListener('click', e => {
  const h = e.target.closest('.heart');
  if(!h) return;
  e.preventDefault();   // не переходити на сторінку об'єкта при кліку по сердечку
  const img = h.querySelector('img');
  if(!img) return;
  const isFav = img.src.includes('fav.svg');
  img.src = isFav ? 'img/icons/like.svg' : 'img/icons/fav.svg';
  toast(isFav ? 'Додано до обраного' : 'Видалено з обраного');
});

/* ---------------- сортування ---------------- */
(function initSort(){
  const wrap = document.querySelector('.sort-wrap');
  const menu = document.getElementById('sort-menu');
  document.getElementById('sort-btn').addEventListener('click', e => {
    e.stopPropagation();
    wrap.classList.toggle('open');
  });
  menu.addEventListener('click', e => {
    const li = e.target.closest('li');
    if(!li) return;
    const mode = li.dataset.sort;
    if(mode === 'cheap')      CARDS.sort((a, b) => a.price - b.price);
    else if(mode === 'expensive') CARDS.sort((a, b) => b.price - a.price);
    else                      CARDS.sort((a, b) => a.order - b.order);
    menu.querySelectorAll('li').forEach(x => x.classList.toggle('sel', x === li));
    renderCards();
    wrap.classList.remove('open');
    toast('Сортування: ' + li.textContent.toLowerCase());
  });
  document.addEventListener('click', e => { if(!e.target.closest('.sort-wrap')) wrap.classList.remove('open'); });
})();

/* ---------------- пагінація ---------------- */
(function initPagination(){
  const pages = document.getElementById('pages');
  const nums = () => [...pages.querySelectorAll('.pg:not(.arrow)')];
  const active = () => pages.querySelector('.pg.on');

  pages.addEventListener('click', e => {
    const btn = e.target.closest('.pg');
    if(!btn) return;
    const list = nums();
    if(btn.classList.contains('arrow')){
      let i = list.indexOf(active());
      i = btn.classList.contains('next') ? Math.min(list.length - 1, i + 1) : Math.max(0, i - 1);
      list.forEach((b, x) => b.classList.toggle('on', x === i));
    } else {
      list.forEach(b => b.classList.toggle('on', b === btn));
    }
    window.scrollTo({ top: document.querySelector('.cat-grid').offsetTop - 120, behavior: 'smooth' });
  });

  // показати ще 12 пропозицій
  document.getElementById('show-more').addEventListener('click', () => {
    const start = CARDS.length;
    for(let i = 0; i < 12; i++) CARDS.push({ price: BASE[i % 4], n: 'ЖК OZONE', order: start + i });
    renderCards();
    toast('Завантажено ще 12 пропозицій');
  });
})();
