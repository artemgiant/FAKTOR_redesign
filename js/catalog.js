/* ============================================================
   FAKTOR — логіка сторінки каталогу (лістинг)
   Картки + інтерактив: селекти, діапазонні слайдери, кіл-сть кімнат,
   валюта, чипи фільтрів, сортування, пагінація, обране.
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
  return `<article class="card-list">
    <div class="img"></div>
    <div class="card-row"><div class="price t24">${fmtUsd(d.price)}</div><span class="heart">${heartOut}</span></div>
    <div class="name t18">${d.n}</div>
    <div class="addr t15">${ADDR}</div>
    <div class="specs">${specsHTML}</div>
  </article>`;
}
function renderCards(){
  document.getElementById('cat-grid').innerHTML = CARDS.map(cardHTML).join('');
}
renderCards();

/* ---------------- обране (делегування) ---------------- */
document.addEventListener('click', e => {
  const h = e.target.closest('.heart');
  if(!h) return;
  const img = h.querySelector('img');
  if(!img) return;
  const isFav = img.src.includes('fav.svg');
  img.src = isFav ? 'img/icons/like.svg' : 'img/icons/fav.svg';
  toast(isFav ? 'Додано до обраного' : 'Видалено з обраного');
});

/* ---------------- селекти (Тип угоди / нерухомості) ---------------- */
(function initSelects(){
  document.querySelectorAll('.fld2.select').forEach(fld => {
    const val = fld.querySelector('.val');
    const opts = (fld.dataset.opts || '').split('|').filter(Boolean);
    const ul = document.createElement('ul');
    ul.className = 'fld-menu';
    ul.innerHTML = opts.map(o => `<li${o === val.textContent.trim() ? ' class="sel"' : ''}>${o}</li>`).join('');
    fld.appendChild(ul);

    fld.addEventListener('click', e => {
      if(e.target.closest('.fld-menu')) return;
      const open = fld.classList.contains('open');
      document.querySelectorAll('.fld2.open').forEach(f => f.classList.remove('open'));
      if(!open) fld.classList.add('open');
    });
    ul.addEventListener('click', e => {
      const li = e.target.closest('li');
      if(!li) return;
      val.textContent = li.textContent;
      ul.querySelectorAll('li').forEach(x => x.classList.toggle('sel', x === li));
      fld.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if(!e.target.closest('.fld2.select')) document.querySelectorAll('.fld2.open').forEach(f => f.classList.remove('open'));
  });
})();

/* ---------------- діапазонні слайдери ---------------- */
const fmtNum = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function initRange(field){
  const min = +field.dataset.min, max = +field.dataset.max;
  let from = +field.dataset.from, to = +field.dataset.to;
  const rng  = field.querySelector('.rng');
  const fill = field.querySelector('.rng-fill');
  const h1 = field.querySelector('.rng-h1'), h2 = field.querySelector('.rng-h2');
  const bFrom = field.querySelector('.rng-from b'), bTo = field.querySelector('.rng-to b');
  const span = max - min;
  const step = span > 1000000 ? 100000 : (span > 10000 ? 100 : 1);
  const pct = v => ((v - min) / span) * 100;

  function paint(){
    const a = pct(from), b = pct(to);
    h1.style.left = a + '%'; h2.style.left = b + '%';
    fill.style.left = a + '%'; fill.style.width = (b - a) + '%';
    bFrom.textContent = fmtNum(from); bTo.textContent = fmtNum(to);
  }
  function bind(handle, isFrom){
    handle.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { handle.setPointerCapture(e.pointerId); } catch(_){}
      const move = ev => {
        const r = rng.getBoundingClientRect();
        let p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
        let v = Math.round((min + p * span) / step) * step;
        if(isFrom) from = Math.min(v, to); else to = Math.max(v, from);
        paint();
      };
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  }
  bind(h1, true); bind(h2, false);
  paint();
}
document.querySelectorAll('.fld2--range').forEach(initRange);

/* ---------------- валюта (UAH / USD / EUR) ---------------- */
document.querySelectorAll('.cur-tabs').forEach(tabs => {
  tabs.addEventListener('click', e => {
    const s = e.target.closest('span');
    if(!s) return;
    tabs.querySelectorAll('span').forEach(x => x.classList.toggle('on', x === s));
  });
});

/* ---------------- кіл-сть кімнат ---------------- */
document.querySelectorAll('.beds button').forEach(b =>
  b.addEventListener('click', () => b.classList.toggle('on'))
);

/* ---------------- чипи обраних фільтрів ---------------- */
const chipsRow = document.getElementById('chips-row');
chipsRow.addEventListener('click', e => {
  const x = e.target.closest('.x');
  if(!x) return;
  x.closest('.chip').remove();
});

/* ---------------- скинути всі фільтри ---------------- */
document.getElementById('reset-filters').addEventListener('click', () => {
  chipsRow.querySelectorAll('.chip').forEach(c => c.remove());
  document.querySelectorAll('.beds button.on').forEach(b => b.classList.remove('on'));
  toast('Фільтри скинуто');
});

/* ---------------- знайти ---------------- */
document.querySelector('.find-btn').addEventListener('click', () => toast('Шукаємо пропозиції за фільтрами…'));

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
