/* ============================================================
   FAKTOR — логіка головної сторінки
   Генерація карток + інтерактив: слайдери, карусель, фільтри, обране
   ============================================================ */

/* ---------------- іконки (з img/icons) ---------------- */
const chevL   = '<img src="img/icons/arrow-right-14.svg" width="14" height="14" alt="">';
const chevR   = '<img src="img/icons/arrow-right-14.svg" width="14" height="14" alt="">';
const arrows  = `<span class="arrow-circle l">${chevL}</span><span class="arrow-circle r filled">${chevR}</span>`;

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
// стат-рядок ексклюзивної каруселі через ЕТАЛОН FCard (золоті іконки)
function specsRow(land){
  const stats = [{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}];
  if(land) stats.push({k:'plot',text:land});
  return FCard.statsHTML(stats);
}

/* ---------------- дані + рендер карток (ЕТАЛОН .card через FCard) ----------------
   Картки об'єктів на головній — той самий компонент, що на сторінці «Обране».
   Серце контурне ('out'); fav:true → залите. */
const addr = 'Одеса, Приморський р-н, Шевченко-Французький, вул. Віце-Адмірала Азарова';

const gefest = {icon:'img/icons/dev-portico.svg', name:'Гефест'};   // лого/назва забудовника (коло на фото)
document.getElementById('grid-nb').innerHTML = [
  {kind:'newbuild', year:'2026', dev:gefest, title:'ЖК Перший Французький',            addr, price:'від 2.4 млн. грн.', priceM:'від 42 000 грн / м²', installment:'Перший внесок від 20%'},
  {kind:'newbuild', year:'2026', dev:gefest, title:'ЖК Перлинний квартал на Сахарова', addr, price:'від 2.4 млн. грн.', priceM:'від 38 000 грн / м²', installment:'Перший внесок від 20%'},
  {kind:'newbuild', year:'2026', dev:gefest, title:'ЖК Модерн',                        addr, price:'від 2.4 млн. грн.', priceM:'від 45 000 грн / м²', installment:'Перший внесок від 20%'},
  {kind:'newbuild', year:'2026', dev:gefest, title:'Арт-резиденція Garden City',       addr, price:'від 2.4 млн. грн.', priceM:'від 52 000 грн / м²', installment:'Перший внесок від 20%'},
].map(d => FCard.html(d, {heart:'out'})).join('');

// Квартири в новобудовах — той самий ЕТАЛОН (звичайна картка), об'єкти з ЖК.
document.getElementById('grid-flats-nb').innerHTML = [
  {kind:'apartment', badge:'Квартира', price:'$ 96 000',  title:'ЖК Перший Французький',      addr, stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}]},
  {kind:'apartment', badge:'Квартира', price:'$ 132 000', title:'ЖК Перлинний квартал',       addr, stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}]},
  {kind:'apartment', badge:'Квартира', price:'$ 88 000',  title:'ЖК Модерн',                  addr, stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}]},
  {kind:'apartment', badge:'Квартира', price:'$ 154 000', title:'Арт-резиденція Garden City', addr, stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}]},
].map((d, i) => FCard.html(d, {heart: i === 1 ? 'fav' : 'out'})).join('');

document.getElementById('grid-flats').innerHTML = [
  {kind:'apartment', badge:'Квартира', price:'$ 124 000', title:'ЖК OZONE', addr, stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}]},
  {kind:'apartment', badge:'Квартира', price:'$ 74 000',  title:'ЖК OZONE', addr, stats:[{k:'rooms',text:'1 кімн.'},{k:'floor',text:'4/9'},{k:'area',text:'46 м²'}]},
  {kind:'apartment', badge:'Квартира', price:'$ 210 000', title:'ЖК OZONE', addr, stats:[{k:'rooms',text:'4 кімн.'},{k:'floor',text:'6/12'},{k:'area',text:'180 м²'}]},
  {kind:'apartment', badge:'Квартира', price:'$ 170 000', title:'ЖК OZONE', addr, stats:[{k:'rooms',text:'2 кімн.'},{k:'floor',text:'3/16'},{k:'area',text:'88 м²'}]},
].map((d, i) => FCard.html(d, {heart: i === 1 ? 'fav' : 'out'})).join('');

document.getElementById('grid-houses').innerHTML = [
  {kind:'house', badge:'Будинок', price:'$ 124 000', title:'Будинок',  addr, stats:[{k:'rooms',text:'3 кімн.'},{k:'area',text:'140 м²'},{k:'plot',text:'6 сот.'}]},
  {kind:'house', badge:'Котедж',  price:'$ 300 000', title:'Котедж',   addr, stats:[{k:'rooms',text:'5 кімн.'},{k:'area',text:'240 м²'},{k:'plot',text:'8 сот.'}]},
  {kind:'house', badge:'Будинок', price:'$ 210 000', title:'Будинок',  addr, stats:[{k:'rooms',text:'4 кімн.'},{k:'area',text:'180 м²'},{k:'plot',text:'4 сот.'}]},
  {kind:'house', badge:'Таунхаус',price:'$ 170 000', title:'Таунхаус', addr, stats:[{k:'rooms',text:'3 кімн.'},{k:'area',text:'120 м²'},{k:'plot',text:'2 сот.'}]},
].map(d => FCard.html(d, {heart:'out'})).join('');

document.getElementById('excl-specs').innerHTML = specsRow();

/* ---------------- картки забудовників (ЕТАЛОН .card, kind:'developer') ----------------
   Той самий компонент-картка, але без серця/ціни/статів: назва + інфо-рядки
   (на ринку з року, місто, N комплексів) + підвал «Детальніше ›».
   Лого забудовника — коло на фото (.card__dev). */
document.getElementById('grid-dev').innerHTML = [
  {kind:'developer', dev:gefest, title:'Гефест',       founded:'2002', city:'Одеса', count:'134', countWord:'комплекси',  href:'novobudovy.html'},
  {kind:'developer', dev:gefest, title:'KADORR Group', founded:'2008', city:'Одеса', count:'87',  countWord:'комплексів', href:'novobudovy.html'},
  {kind:'developer', dev:gefest, title:'Stikon',       founded:'2011', city:'Одеса', count:'52',  countWord:'комплекси',  href:'novobudovy.html'},
  {kind:'developer', dev:gefest, title:'Будова',       founded:'2005', city:'Одеса', count:'68',  countWord:'комплексів', href:'novobudovy.html'},
].map(d => FCard.html(d)).join('');

/* ---------------- тост ---------------- */
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ---------------- слайдер у картках забудовників (.card-solid) ----------------
   Картки об'єктів тепер ЕТАЛОН .card з одним фото (без слайдера). Слайдер
   лишається тільки для багатофото-карток .card-solid (наразі одне фото — no-op). */
document.querySelectorAll('.card-solid .img').forEach(img => {
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

/* ---------------- обране: перемикання серця (ЕТАЛОН .card) ---------------- */
document.addEventListener('click', e => {
  const h = e.target.closest('.card__heart');
  if(!h) return;
  e.preventDefault();   // не переходити на сторінку об'єкта при кліку по сердечку
  const img = h.querySelector('img');
  if(!img) return;
  const isFav = img.src.includes('fav.svg');   // зараз контур → стане залите
  img.src = isFav ? FCard.HEART_FAV : FCard.HEART_OUT;
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

/* ---------------- рядок пошуку (hero): локація · тип · ціна · кнопка ----------------
   Порт дизайн-референсу (design_handoff_home) у ванільний JS. Пікер локацій має
   два режими — geo (країна→регіон→місто, drill-down) і local (категорії: райони,
   вулиці, ЖК…), із живим пошуком, мультивибором у чипи та згортанням «+N».
   Дані локацій захардкоджені (як у референсі) — згодом замінити на API. */
(function initSearchbar(){
  const root = document.querySelector('.searchbar');
  if(!root) return;

  /* --- дані --- */
  const DEAL = [
    'Новобудови',
    'Продаж квартир','Продаж кімнат','Продаж будинків','Продаж землі','Продаж комерції','Продаж паркінг/гараж',
    'Оренда квартир','Оренда кімнат','Оренда будинків','Оренда землі','Оренда комерції','Оренда паркінг/гараж',
  ];
  const CURRENCIES = ['USD','EUR','UAH'];
  const LOC_CATS = [['all','Усі'],['district','Райони'],['street','Вулиці'],['micro','Мікрорайони'],['complex','ЖК'],['developer','Забудовники']];
  const KIND = { district:'район', street:'вулиця', micro:'мікрорайон', complex:'жк', developer:'забудовник', city:'місто', region:'регіон', country:'країна' };
  const COUNTRIES = [['Україна',5329],['Польща',0],['Німеччина',0],['Іспанія',0],['Туреччина',0],['ОАЕ',0],['Кіпр',0]];
  const REGIONS = { 'Україна':[['Одеська область',90],['Київська область',0],['Львівська область',0],['Миколаївська область',0],['Харківська область',0]] };
  const CITIES = { 'Одеська область':[['Одеса','',5329],['Фонтанка','',132],['Лиманка','',375],['Авангард','',92],['Чорноморськ','',19],['Теплодар','',3],['Таїрово, смт','',64]] };
  const LOCDATA = {
    district: [['Приморський','Одеса',2173],['Хаджибейський','Одеса',1336],['Київський','Одеса',1241],['Пересипський','Одеса',578],['Лиманський','Фонтанка',113],['Овідіопольський','Лиманка',346]],
    street: [['Французький бульвар','Приморський',420],['вул. Генуезька','Приморський',311],['вул. Канатна','Приморський',208],['Гагарінське плато','Приморський',176],['Люстдорфська дорога','Київський',289],['вул. Пушкінська','Приморський',142],['вул. Дерибасівська','Приморський',64],['вул. Рішельєвська','Приморський',98],['вул. Преображенська','Приморський',151],['вул. Велика Арнаутська','Приморський',173],['вул. Фонтанська дорога','Приморський',262],['проспект Шевченка','Приморський',119]],
    micro: [['Аркадія','Приморський',512],['Фонтан','Приморський',604],['Таїрова','Київський',433],['Черемушки','Малиновський',221],['Котовського','Пересипський',318],['Молдаванка','Малиновський',176],['Сьоме Небо','Київський',92],['Совіньйон','Овідіопольський',64]],
    complex: [['ЖК OZONE','Приморський',64],['ЖК Аркадія Сіті','Приморський',88],['ЖК Перлина','Київський',52],['ЖК More','Приморський',41],['ЖК Sea Town','Приморський',37],['ЖК Гранд Парк','Київський',58],['ЖК Французький квартал','Приморський',46],['ЖК Sky Garden','Київський',29],['ЖК Bunin','Приморський',24],['ЖК 56 Перлина','Київський',71]],
    developer: [['KADORR Group','',312],['Гефест','',128],['Stikon','',97],['Будова','',54],['Інкор Груп','',83],['Альтаїр','',46],['Рідна Оселя','',38]],
  };

  /* --- стан --- */
  const st = {
    dealType:'Продаж квартир', currency:'USD', priceFrom:'', priceTo:'',
    locOpen:false, locMode:'local', locCat:'all', locSel:[], locPath:[], location:'', chipVisible:99,
  };

  /* --- посилання на DOM --- */
  const $ = s => root.querySelector(s);
  const locWrap   = $('.fk-loc');
  const locField  = $('.fk-loc__field');
  const locInput  = $('.fk-loc__in');
  const chipsBox  = $('.fk-chips');
  const pop       = $('.fk-loc__pop');
  const tabsBox   = $('.fk-tabs');
  const catsBox   = $('.fk-cats');
  const crumbsBox = $('.fk-crumbs');
  const listBox   = $('.fk-list');
  const typeSel   = $('.fk-type');
  const curSel    = $('.fk-cur');
  const fromInput = $('.fk-price__from');
  const toInput   = $('.fk-price__to');
  const searchBtn = $('.fk-search');

  /* --- хелпери --- */
  const fmtNum = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function kindOf(label){
    for(const k of Object.keys(LOCDATA)) if(LOCDATA[k].some(r => r[0] === label)) return k;
    for(const c of COUNTRIES) if(c[0] === label) return 'country';
    for(const rk of Object.keys(REGIONS)) if(REGIONS[rk].some(r => r[0] === label)) return 'region';
    for(const ck of Object.keys(CITIES)) if(CITIES[ck].some(r => r[0] === label)) return 'city';
    return 'district';
  }

  /* --- індекс для живого пошуку --- */
  function searchIndex(){
    const out = [];
    COUNTRIES.forEach(c => out.push({label:c[0],sub:'Країна',count:c[1],group:'Країни',gorder:0,kind:'country'}));
    Object.keys(REGIONS).forEach(k => REGIONS[k].forEach(r => out.push({label:r[0],sub:'Регіон',count:r[1],group:'Регіони',gorder:1,kind:'region'})));
    Object.keys(CITIES).forEach(k => CITIES[k].forEach(c => out.push({label:c[0],sub:'Місто, '+k,count:c[2],group:'Міста',gorder:2,kind:'city'})));
    const T = {district:['Район','Райони',3],street:['Вулиця','Вулиці',4],micro:['Мікрорайон','Мікрорайони',5],complex:['ЖК','Комплекси',6],developer:['Забудовник','Девелопери',7]};
    Object.keys(T).forEach(k => LOCDATA[k].forEach(r => out.push({label:r[0],sub:r[1]?T[k][0]+', '+r[1]:T[k][0],count:r[2],group:T[k][1],gorder:T[k][2],kind:k})));
    return out;
  }
  function hl(label, q){
    const i = label.toLowerCase().indexOf(q);
    if(i < 0 || !q) return {pre:label, mid:'', post:''};
    return {pre:label.slice(0,i), mid:label.slice(i,i+q.length), post:label.slice(i+q.length)};
  }
  function locRows(){
    const q = (st.location || '').trim().toLowerCase();
    if(q){
      const hits = searchIndex().filter(r => r.label.toLowerCase().includes(q));
      hits.sort((a,b) => a.gorder-b.gorder || a.label.toLowerCase().indexOf(q)-b.label.toLowerCase().indexOf(q) || b.count-a.count);
      const rows = []; let lastG = null;
      hits.forEach(r => { if(r.group !== lastG){ rows.push({header:true,label:r.group}); lastG = r.group; } rows.push({...r, selectable:true, ...hl(r.label,q)}); });
      return rows;
    }
    if(st.locMode === 'geo'){
      const p = st.locPath || [];
      if(p.length === 0) return COUNTRIES.map(c => ({label:c[0],sub:'',count:c[1],selectable:!REGIONS[c[0]],kind:'country'}));
      if(p.length === 1) return (REGIONS[p[0]] || []).map(r => ({label:r[0],sub:'',count:r[1],selectable:!CITIES[r[0]],kind:'region'}));
      return (CITIES[p[1]] || []).map(c => ({label:c[0],sub:'',count:c[2],selectable:true,kind:'city'}));
    }
    const list = st.locCat === 'all' ? [].concat(LOCDATA.district, LOCDATA.complex) : (LOCDATA[st.locCat] || []);
    const kindFor = st.locCat === 'all' ? null : st.locCat;
    return list.map(r => ({label:r[0],sub:r[1],count:r[2],selectable:true,kind: kindFor || (r[0].startsWith('ЖК')?'complex':'district')}));
  }
  function onLocRow(row){
    if(row.selectable){ toggleLocItem(row.label); return; }
    st.locPath = [...(st.locPath||[]), row.label];
    render();
  }
  function toggleLocItem(label){
    st.locSel = st.locSel.includes(label) ? st.locSel.filter(x => x !== label) : [...st.locSel, label];
    st.location = ''; st.chipVisible = 99; locInput.value = '';
    render();
  }
  function removeLocChip(label){
    st.locSel = st.locSel.filter(x => x !== label);
    st.chipVisible = 99;
    render();
  }

  /* --- рендер --- */
  function render(){
    // селекти (один раз заповнюємо опції, далі лише синхронізуємо value)
    if(!typeSel.options.length) typeSel.innerHTML = DEAL.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
    if(!curSel.options.length) curSel.innerHTML = CURRENCIES.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
    typeSel.value = st.dealType;
    curSel.value = st.currency;

    locField.classList.toggle('is-open', st.locOpen);
    pop.hidden = !st.locOpen;

    // чипи + згортання «+N»
    const vis = Math.min(st.chipVisible, st.locSel.length);
    const hidden = st.locSel.length - vis;
    chipsBox.innerHTML =
      st.locSel.slice(0, vis).map((l,i) =>
        `<span class="fk-chip" data-i="${i}">
          <span class="fk-chip__kind">${esc(KIND[kindOf(l)] || '')}</span>
          <span class="fk-chip__label">${esc(l)}</span>
          <button type="button" class="fk-chip__x" data-rm="${esc(l)}" aria-label="Прибрати"><img src="img/icons/chip-x.svg" width="9" height="9" alt=""></button>
        </span>`).join('') +
      (hidden > 0 ? `<span class="fk-chip-more" data-more="1">+${hidden}</span>` : '');

    locInput.placeholder = st.locSel.length ? (vis < st.locSel.length ? '' : 'Додати ще…') : 'Місто, район, вулиця або ЖК…';

    if(st.locOpen) renderPop();
    queueFit();
  }
  function renderPop(){
    const q = (st.location || '').trim();
    // вкладки
    tabsBox.querySelectorAll('.fk-tab').forEach(t => t.classList.toggle('is-on', t.dataset.mode === st.locMode));

    // категорії (тільки local, без активного пошуку)
    const showCats = st.locMode !== 'geo' && !q;
    catsBox.hidden = !showCats;
    if(showCats) catsBox.innerHTML = LOC_CATS.map(c =>
      `<button type="button" class="fk-cat${st.locCat===c[0]?' is-on':''}" data-cat="${c[0]}">${esc(c[1])}</button>`).join('');

    // хлібні крихти (тільки geo, без активного пошуку)
    const showCrumbs = st.locMode === 'geo' && !q;
    crumbsBox.hidden = !showCrumbs;
    if(showCrumbs){
      const crumbs = [{label:'Усі країни', idx:0}].concat((st.locPath||[]).map((seg,i) => ({label:seg, idx:i+1})));
      crumbsBox.innerHTML = crumbs.map(c =>
        `<span class="fk-crumb" data-crumb="${c.idx}">${esc(c.label)}</span><span class="fk-crumb-sep">›</span>`).join('');
    }

    // список
    listBox.innerHTML = locRows().map(r => {
      if(r.header) return `<div class="fk-loc-head">${esc(r.label)}</div>`;
      const checked = st.locSel.includes(r.label);
      const box = r.selectable
        ? `<span class="fk-box${checked?' is-checked':''}">${checked?'<img src="img/icons/check-white.svg" width="12" height="12" alt="">':''}</span>`
        : '';
      const pre = r.pre !== undefined ? r.pre : r.label;
      const label = `<span class="fk-locrow__label"><span>${esc(pre)}</span>${r.mid?`<span class="hl">${esc(r.mid)}</span>`:''}${r.post?`<span>${esc(r.post)}</span>`:''}${r.sub?`<span class="sub">, ${esc(r.sub)}</span>`:''}</span>`;
      const count = `<span class="fk-locrow__count">${fmtNum(r.count)}</span>`;
      const drill = (!r.selectable) ? `<img class="fk-locrow__drill" src="img/icons/arrow-right.svg" width="15" height="15" alt="">` : '';
      return `<label class="fk-locrow" data-row="${esc(r.label)}">${box}${label}${count}${drill}</label>`;
    }).join('');
  }

  /* --- згортання чипів за шириною поля (MutationObserver → _fit) --- */
  let fitQueued = false;
  function queueFit(){ if(fitQueued) return; fitQueued = true; requestAnimationFrame(() => { fitQueued = false; fit(); }); }
  function fit(){
    const vis = Math.min(st.chipVisible, st.locSel.length);
    if(locField.scrollWidth > locField.clientWidth + 1 && vis > 1){
      st.chipVisible = Math.max(1, vis - 1);
      render();
    }
  }

  /* --- перехід у каталог --- */
  function go(){
    const isNb = st.dealType === 'Новобудови';
    const params = new URLSearchParams();
    if(isNb) params.set('filter','novobud');
    const locs = st.locSel.length ? st.locSel.join('|') : (st.location || '').trim();
    if(locs) params.set('loc', locs);
    if(st.dealType) params.set('type', st.dealType);
    const f = String(st.priceFrom).replace(/\s/g,''), t = String(st.priceTo).replace(/\s/g,'');
    if(f) params.set('from', f);
    if(t) params.set('to', t);
    if(st.currency) params.set('cur', st.currency);
    const qs = params.toString();
    window.location.href = 'catalog.html' + (qs ? ('?' + qs) : '');
  }

  /* --- події --- */
  locField.addEventListener('click', e => {
    if(e.target.closest('.fk-chip__x') || e.target.closest('.fk-chip-more')) return;
    st.locOpen = true; render(); locInput.focus();
  });
  locInput.addEventListener('input', () => { st.location = locInput.value; st.locOpen = true; render(); });
  locInput.addEventListener('focus', () => { if(!st.locOpen){ st.locOpen = true; render(); } });

  chipsBox.addEventListener('click', e => {
    const x = e.target.closest('.fk-chip__x');
    if(x){ e.stopPropagation(); removeLocChip(x.dataset.rm); return; }
    const more = e.target.closest('.fk-chip-more');
    if(more){ e.stopPropagation(); st.locOpen = true; render(); }
  });

  tabsBox.addEventListener('click', e => {
    const tab = e.target.closest('.fk-tab');
    if(!tab) return;
    st.locMode = tab.dataset.mode; st.locPath = []; st.location = ''; locInput.value = '';
    render();
  });
  catsBox.addEventListener('click', e => {
    const cat = e.target.closest('.fk-cat');
    if(!cat) return;
    st.locCat = cat.dataset.cat; render();
  });
  crumbsBox.addEventListener('click', e => {
    const c = e.target.closest('.fk-crumb');
    if(!c) return;
    st.locPath = st.locPath.slice(0, Number(c.dataset.crumb));
    render();
  });
  listBox.addEventListener('click', e => {
    const row = e.target.closest('.fk-locrow');
    if(!row) return;
    const label = row.dataset.row;
    const data = locRows().find(r => !r.header && r.label === label);
    if(data) onLocRow(data);
  });

  typeSel.addEventListener('change', () => { st.dealType = typeSel.value; });
  curSel.addEventListener('change', () => { st.currency = curSel.value; });
  fromInput.addEventListener('input', () => { const d = fromInput.value.replace(/\D/g,''); st.priceFrom = d ? fmtNum(d) : ''; fromInput.value = st.priceFrom; });
  toInput.addEventListener('input', () => { const d = toInput.value.replace(/\D/g,''); st.priceTo = d ? fmtNum(d) : ''; toInput.value = st.priceTo; });

  searchBtn.addEventListener('click', go);

  // закриття дропдауна по кліку поза .fk-loc
  document.addEventListener('mousedown', e => {
    if(st.locOpen && !e.target.closest('.fk-loc')){ st.locOpen = false; render(); }
  });
  // на ресайз скидаємо лічильник видимих чипів — _fit() перерахує заново
  window.addEventListener('resize', () => { st.chipVisible = 99; render(); });

  render();
})();

/* ---------------- дрібний інтерактив ---------------- */
const phone = document.querySelector('.nav__icon[title="Подзвонити"]');
if(phone) phone.addEventListener('click', () => toast('☎  +38 (073) 355 98 54'));

// «Дивитись усі» тепер веде на сторінку каталогу (catalog.html) — без перехоплення кліку.
