/* ============================================================
   FAKTOR — логіка головної сторінки
   Генерація карток + інтерактив: слайдери, карусель, фільтри, обране
   ============================================================ */

/* ---------------- іконки (з img/icons) ---------------- */
const heartFill = '<img src="img/icons/like.svg" width="32" height="32" alt="">';
const heartOut  = '<img src="img/icons/fav.svg" width="32" height="32" alt="">';
const icBed   = '<img src="img/icons/bedrooms-icon-black.svg" width="20" height="20" alt="">';
const icFloor = '<img src="img/icons/bathroom-icon.svg" width="20" height="20" alt="">';
const icArea  = '<img src="img/icons/area-icon.svg" width="20" height="20" alt="">';
const chevL   = '<img src="img/icons/arrow-right-14.svg" width="14" height="14" alt="">';
const chevR   = '<img src="img/icons/arrow-right-14.svg" width="14" height="14" alt="">';
const arrows  = `<span class="arrow-circle l">${chevL}</span><span class="arrow-circle r filled">${chevR}</span>`;
const icWallet  = '<img src="img/icons/wallet.svg" width="18" height="18" alt="">';      // пігулка «Перший внесок»
const detailArr = '<img src="img/icons/arrow-right-14.svg" width="16" height="16" alt="">'; // стрілка біля «Детальніше»

/* ---------------- хелпери ---------------- */
// слайди прозорі — крізь них видно картинку-заглушку контейнера .img (.card-* .img)
function slides(n){
  let s = '';
  for(let k = 0; k < n; k++){
    s += '<div class="slide"></div>';
  }
  return `<div class="slides">${s}</div>`;
}
function dotsHTML(n){
  let s = '';
  for(let k = 0; k < n; k++) s += `<i${k === 0 ? ' class="on"' : ''}></i>`;
  return `<span class="dots img-dots">${s}</span>`;
}
function specsRow(land){
  return `<span class="spec">3 ${icBed}</span><span class="spec">2/5 ${icFloor}</span><span class="spec">147 м² ${icArea}</span>` +
         (land ? `<span class="spec">${land} ${icArea}</span>` : '');
}

/* ---------------- дані + рендер карток ---------------- */
const addr = 'Одесса, Приморский р-н, Шевченко-Французский, ул. Вице-Адмирала Азарова';

function solidCard(d, i){
  const n = d.n || 4;
  const heart = d.heart === false ? '' : `<span class="heart">${heartFill}</span>`;
  // одна картинка — без слайдера (без стрілок і крапок)
  const media = n > 1 ? `${slides(n, i)}${arrows}${dotsHTML(n)}` : slides(1, i);
  // оверлеї на фото: рік (ліворуч) і лого забудовника (праворуч) — лише для новобудов
  const year = d.year ? `<span class="nb-year">${d.year}</span>` : '';
  const dev  = d.dev  ? `<span class="nb-dev"><img src="${d.dev.icon}" width="26" height="26" alt=""><b>${d.dev.name}</b></span>` : '';
  // картка новобудови (є firstPay): «підвал» у два стовпці з вертикальним
  // розділювачем — ліворуч ціна + «грн/м²», праворуч «Перший внесок» над «Детальніше».
  const isNb = !!d.firstPay;
  const foot = isNb
    ? `<div class="nb-foot">
        <div class="nb-price-block">
          <p class="nb-price">${d.price}</p>
          ${d.perMeter ? `<p class="nb-permeter">${d.perMeter}</p>` : ''}
        </div>
        <span class="nb-div" aria-hidden="true"></span>
        <div class="nb-act">
          <span class="nb-pay">${icWallet}<span>Перший внесок ${d.firstPay}</span></span>
          <a class="nb-detail" href="${d.href || 'property.html'}">Детальніше ${detailArr}</a>
        </div>
      </div>`
    : `<p class="t18 card-price">${d.price}</p>`;
  return `<article class="card-solid${isNb ? ' card-solid--nb' : ''}">
    <div class="img">${media}${year}${dev}</div>
    <div class="body">
      <div class="card-titlerow"><h3 class="t24 card-title">${d.title}</h3>${heart}</div>
      <p class="t15 card-sub">${d.sub}</p>
      ${foot}
    </div>
  </article>`;
}
function listingCard(d, i){
  const n = d.n || 4;
  return `<article class="card-list">
    <div class="img">${slides(n, i + 2)}${arrows}${dotsHTML(n)}</div>
    <div class="card-row"><div class="price t24">${d.price}</div><span class="heart">${d.fav ? heartFill : heartOut}</span></div>
    <div class="name t18">${d.name}</div>
    <div class="addr t15">${d.addr}</div>
    <div class="specs">${specsRow(d.land)}</div>
  </article>`;
}

const gefest = {icon:'img/icons/dev-portico.svg', name:'Гефест'};
document.getElementById('grid-nb').innerHTML = [
  {title:'ЖК Перший Французький',            sub:'Київський район', price:'від 2.4 млн. грн.', perMeter:'від 32 000 грн/м²', firstPay:'від 20%', year:'2026', dev:gefest, n:4},
  {title:'ЖК Перлинний квартал на Сахарова', sub:'Київський район', price:'від 2.4 млн. грн.', perMeter:'від 32 000 грн/м²', firstPay:'від 20%', year:'2026', dev:gefest, n:3},
  {title:'ЖК Модерн',                        sub:'Київський район', price:'від 2.4 млн. грн.', perMeter:'від 32 000 грн/м²', firstPay:'від 20%', year:'2026', dev:gefest, n:5},
  {title:'Арт-резиденція Garden City',       sub:'Київський район', price:'від 2.4 млн. грн.', perMeter:'від 32 000 грн/м²', firstPay:'від 20%', year:'2026', dev:gefest, n:4},
].map(solidCard).join('');

// Квартири в новобудовах — та сама картка лістингу, що й у блоці «Квартири»,
// тільки об'єкти з новобудов (ЖК зі списку «Новобудови»).
document.getElementById('grid-flats-nb').innerHTML = [
  {price:'$ 96 000',  name:'ЖК Перший Французький',      addr, n:4},
  {price:'$ 132 000', name:'ЖК Перлинний квартал',       addr, fav:true, n:3},
  {price:'$ 88 000',  name:'ЖК Модерн',                  addr, n:5},
  {price:'$ 154 000', name:'Арт-резиденція Garden City', addr, n:4},
].map(listingCard).join('');

document.getElementById('grid-dev').innerHTML = [0,1,2,3].map((_, i) =>
  solidCard({title:'Назва забудовника', sub:'2002 рік заснування', price:'134 комплекси', heart:false, n:1}, i)
).join('');

document.getElementById('grid-flats').innerHTML = [
  {price:'$ 124 000', name:'ЖК OZONE', addr, n:4},
  {price:'$ 74 000',  name:'ЖК OZONE', addr, fav:true, n:5},
  {price:'$ 210 000', name:'ЖК OZONE', addr, n:3},
  {price:'$ 170 000', name:'ЖК OZONE', addr, n:4},
].map(listingCard).join('');

document.getElementById('grid-houses').innerHTML = [
  {price:'$ 124 000', name:'ЖК OZONE', addr, n:4},
  {price:'$ 300 000', name:'ЖК OZONE', addr, n:3},
  {price:'$ 210 000', name:'ЖК OZONE', addr, land:'4 сот.', n:5},
  {price:'$ 170 000', name:'ЖК OZONE', addr, n:4},
].map(listingCard).join('');

document.getElementById('excl-specs').innerHTML = specsRow();

/* ---------------- тост ---------------- */
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ---------------- слайдер у кожній картці ---------------- */
document.querySelectorAll('.card-solid .img, .card-list .img').forEach(img => {
  const track = img.querySelector('.slides');
  if(!track) return;
  const total = track.children.length;
  if(total <= 1) return; // одна картинка — слайдер не потрібен
  const dots = img.querySelectorAll('.img-dots i');
  let i = 0;
  const go = k => {
    i = (k + total) % total;
    track.style.transform = `translateX(${-i * 100}%)`;
    dots.forEach((d, x) => d.classList.toggle('on', x === i));
  };
  img.querySelector('.arrow-circle.l').addEventListener('click', () => go(i - 1));
  img.querySelector('.arrow-circle.r').addEventListener('click', () => go(i + 1));
  dots.forEach((d, x) => d.addEventListener('click', () => go(x)));
});

/* ---------------- обране: перемикання серця ---------------- */
document.addEventListener('click', e => {
  const h = e.target.closest('.heart');
  if(!h) return;
  const img = h.querySelector('img');
  if(!img) return;
  const isFav = img.src.includes('fav.svg');
  img.src = isFav ? 'img/icons/like.svg' : 'img/icons/fav.svg';
  toast(isFav ? 'Додано до обраного' : 'Видалено з обраного');
});

/* Відгуки тепер у самодостатньому блоці .fr-reviews (css/reviews.css +
   інлайновий <script> у index.html). Старий слайдер #grid-rev видалено. */

/* ---------------- ексклюзивні: карусель + автоплей ---------------- */
const EXCL = [
  {price:'$ 515 000', name:'ЖК OZONE',         addr:'Одесса, Приморский р-н, Шевченко-Французский, ул. Вице-Адмирала Азарова', tags:['Продаж','Квартира'],  g:['#c9c4bd','#b6b0a7'], img:'img/photos/interior-marble-bathroom.jpg'},
  {price:'$ 348 000', name:'ЖК Sea View',      addr:'Одеса, Аркадія, Гагарінське плато, 5б',                                   tags:['Продаж','Квартира'],  g:['#cdbfae','#b3a594'], img:'img/photos/house-modern-exterior.jpg'},
  {price:'$ 612 000', name:'ЖК Premier Tower', addr:'Одеса, Фонтан, Французький бульвар, 22',                                  tags:['Продаж','Пентхаус'],  g:['#bcc4c7','#a4adb1'], img:'img/photos/residential-complex-dusk.jpg'},
  {price:'$ 274 000', name:'ЖК Modern',        addr:'Одеса, Центр, вул. Рішельєвська, 14',                                     tags:['Продаж','Квартира'],  g:['#c8c2bb','#afa89e'], img:'img/photos/interior-marble-bathroom.jpg'},
];
(function initExclusive(){
  const el = s => document.querySelector(s);
  const grad = g => `linear-gradient(135deg,${g[0]},${g[1]})`;
  const bg = o => o.img ? `center/cover no-repeat url("${o.img}")` : grad(o.g);
  const dotsBox = el('.excl__dots');
  dotsBox.innerHTML = EXCL.map((_, k) => `<i${k === 0 ? ' class="on"' : ''}></i>`).join('');
  const dots = dotsBox.querySelectorAll('i');
  let e = 0, timer;
  function render(){
    const o = EXCL[e],
          p = EXCL[(e - 1 + EXCL.length) % EXCL.length],
          n = EXCL[(e + 1) % EXCL.length];
    el('.excl .price-xl').textContent = o.price;
    el('.excl__name').textContent     = o.name;
    el('.excl__addr').textContent     = o.addr;
    el('.excl__img').style.background      = bg(o);
    el('.excl__thumb--l').style.background = bg(p);
    el('.excl__thumb--r').style.background = bg(n);
    const tg = document.querySelectorAll('.excl__tags .pill-tag');
    o.tags.forEach((t, k) => { if(tg[k]) tg[k].textContent = t; });
    dots.forEach((d, k) => d.classList.toggle('on', k === e));
  }
  const go = k => { e = (k + EXCL.length) % EXCL.length; render(); };
  const restart = () => { clearInterval(timer); timer = setInterval(() => go(e + 1), 5000); };
  el('.excl__arrow--l').addEventListener('click', () => { go(e - 1); restart(); });
  el('.excl__arrow--r').addEventListener('click', () => { go(e + 1); restart(); });
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); restart(); }));
  render();
  restart();
})();

/* ---------------- випадаючі фільтри пошуку ---------------- */
(function initFilters(){
  const OPTS = [
    ['Приморський район','Київський район','Малиновський район','Суворовський район','Аркадія','Фонтан','Таїрова','Центр','Черемушки'],
    ['Продаж квартир','Оренда квартир','Продаж будинків','Комерційна нерухомість','Земельні ділянки'],
    ['до $50 000','$50 000 – $100 000','$100 000 – $200 000','$200 000 – $500 000','від $500 000'],
  ];
  const flds = [...document.querySelectorAll('.searchbar .fld')];
  const closeAll = except => flds.forEach(f => { if(f !== except) f.classList.remove('open'); });

  flds.forEach((fld, i) => {
    const span = fld.querySelector('span');
    const ul = document.createElement('ul');
    ul.className = 'fld-menu';
    ul.innerHTML = OPTS[i].map(o => `<li>${o}</li>`).join('');
    fld.appendChild(ul);

    fld.addEventListener('click', e => {
      if(e.target.closest('.fld-menu')) return;
      const open = fld.classList.contains('open');
      closeAll();
      if(!open) fld.classList.add('open');
    });
    ul.addEventListener('click', e => {
      const li = e.target.closest('li');
      if(!li) return;
      span.textContent = li.textContent;
      fld.classList.add('has-val');
      fld.dataset.value = li.textContent;
      ul.querySelectorAll('li').forEach(x => x.classList.toggle('sel', x === li));
      fld.classList.remove('open');
    });
  });

  document.addEventListener('click', e => { if(!e.target.closest('.fld')) closeAll(); });

  const btn = document.querySelector('.searchbar .btn');
  if(btn) btn.addEventListener('click', () => {
    const vals = flds.map(f => f.dataset.value).filter(Boolean);
    toast(vals.length ? 'Пошук: ' + vals.join('  ·  ') : 'Оберіть параметри для пошуку');
  });
})();

/* ---------------- дрібний інтерактив ---------------- */
const phone = document.querySelector('.nav__icon[title="Подзвонити"]');
if(phone) phone.addEventListener('click', () => toast('☎  +38 (073) 355 98 54'));

// «Дивитись усі» тепер веде на сторінку каталогу (catalog.html) — без перехоплення кліку.
