/* ============================================================
   FAKTOR — логіка сторінки «Обране» (Favorites)
   Порт прототипу design_handoff_favorites/ у ванільний JS сайту.

   Стан: { filter, items, recent, recommend, shared, formSent }.
   - Фільтр-чипи миттєво звужують сітку за kind; лічильники — з items.
   - Серце в рядку ціни ПРИБИРАЄ об'єкт з обраного (анімація + перерахунок).
   - «Поділитися добіркою» → копіює лінк, стан «Скопійовано» ~1.9с.
   - «Очистити все» → підтвердження → порожній стан.
   - Форма «Замовити перегляд» → демо-сабміт, «Заявку надіслано ✓» ~2.4с.
   - Стрічка внизу: порожнє обране → «Дивіться також» (рекомендації),
     є обране → «Повернутись до переглянутих» (історія). Одна стрічка.

   ⚠️ На проді: зберігати обране в localStorage (читати на маунті,
      писати на кожне додавання/видалення). Тут стан — лише в пам'яті.
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

/* Картки рендеряться спільним білдером FCard (js/card.js) — ЕТАЛОН. */

/* ---------------- дані (плейсхолдери; у проді — з CRM/обраного користувача) ---------------- */
function seed(){
  return [
    { id:'a1', kind:'apartment', badge:'Квартира', price:'$ 96 000',  title:'ЖК Перший Французький', addr:'Одеса, Приморський р-н, вул. Віце-Адмірала Азарова', stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}] },
    { id:'a2', kind:'apartment', badge:'Квартира', price:'$ 132 000', title:'ЖК Перлинний квартал',   addr:'Одеса, Приморський р-н, вул. Віце-Адмірала Азарова', stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}] },
    { id:'a3', kind:'apartment', badge:'Квартира', price:'$ 88 000',  title:'ЖК Модерн',              addr:'Одеса, Приморський р-н, вул. Віце-Адмірала Азарова', stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}] },
    { id:'a4', kind:'apartment', badge:'Квартира', price:'$ 154 000', title:'Арт-резиденція Garden City', addr:'Одеса, Приморський р-н, вул. Віце-Адмірала Азарова', stats:[{k:'rooms',text:'3 кімн.'},{k:'floor',text:'2/5'},{k:'area',text:'147 м²'}] },
    { id:'c1', kind:'commercial', badge:'Офіс', price:'$ 210 000', title:'Офісне приміщення', addr:'Одеса, Приморський р-н, Гагарінське плато', stats:[{k:'area',text:'120 м²'},{k:'floor',text:'3/16'}] },
    { id:'a5', kind:'apartment', badge:'Пентхаус', price:'$ 415 000', title:'ЖК More', addr:'Одеса, вул. Гагарінське плато', stats:[{k:'rooms',text:'4 кімн.'},{k:'floor',text:'12/12'},{k:'area',text:'180 м²'}] },
    { id:'n1', kind:'newbuild', badge:'Новобудова', price:'від $ 61 000', title:'ЖК Перлина', addr:'Одеса, Приморський р-н, вул. Генуезька', installment:'Перший внесок від 20%' },
    { id:'h1', kind:'house', badge:'Будинок', price:'$ 189 000', title:'Будинок', addr:'Одеса, Лиманський р-н, вул. Лиманна', stats:[{k:'rooms',text:'3 кімн.'},{k:'area',text:'140 м²'},{k:'plot',text:'6 сот.'}] },
  ];
}
function recentSeed(){
  return [
    { id:'r1', kind:'apartment',  badge:'Квартира',   price:'$ 78 000',  title:'ЖК Sea Town', addr:'Одеса, вул. Армійська', stats:[{k:'rooms',text:'1 кімн.'},{k:'floor',text:'7/24'},{k:'area',text:'42 м²'}] },
    { id:'r2', kind:'newbuild',   badge:'Новобудова', price:'від $ 52 000', title:'ЖК Аркадія Сіті', addr:'Одеса, Приморський р-н, Французький бульвар', installment:'Перший внесок від 20%' },
    { id:'r3', kind:'commercial', badge:'Магазин',    price:'$ 145 000', title:'Торгове приміщення', addr:'Одеса, вул. Дерибасівська', stats:[{k:'area',text:'64 м²'},{k:'floor',text:'1/9'}] },
    { id:'r4', kind:'land',       badge:'Ділянка',    price:'$ 96 000',  title:'Земельна ділянка', addr:'Одеса, Лиманський р-н, Фонтанка', stats:[{k:'plot',text:'10 сот.'}] },
    { id:'r5', kind:'house',      badge:'Будинок',    price:'$ 240 000', title:'Будинок', addr:'Совіньйон, масив 2', stats:[{k:'rooms',text:'5 кімн.'},{k:'area',text:'260 м²'},{k:'plot',text:'8 сот.'}] },
  ];
}
function recommendSeed(){
  return [
    { id:'p1', kind:'newbuild',   badge:'Новобудова',    price:'від $ 47 000', title:'ЖК Sky Garden', addr:'Одеса, Київський р-н, вул. Люстдорфська дорога', installment:'Перший внесок від 20%' },
    { id:'p2', kind:'apartment',  badge:'Квартира',      price:'$ 89 000',  title:'ЖК Bunin', addr:'Одеса, вул. Буніна', stats:[{k:'rooms',text:'2 кімн.'},{k:'floor',text:'5/16'},{k:'area',text:'63 м²'}] },
    { id:'p3', kind:'house',      badge:'Котедж',        price:'$ 270 000', title:'Котедж', addr:'Фонтанка, біля моря', stats:[{k:'rooms',text:'5 кімн.'},{k:'area',text:'240 м²'},{k:'plot',text:'8 сот.'}] },
    { id:'p4', kind:'commercial', badge:'Готовий бізнес', price:'$ 320 000', title:'Готовий бізнес', addr:'Одеса, центр міста', stats:[{k:'area',text:'180 м²'},{k:'floor',text:'1/5'},{k:'plot',text:'10 сот.'}] },
    { id:'p5', kind:'land',       badge:'Ділянка',       price:'$ 64 000',  title:'Земельна ділянка', addr:'Совіньйон, 1-ша лінія', stats:[{k:'plot',text:'12 сот.'}] },
  ];
}

/* ---------------- стан ---------------- */
const state = {
  filter: 'all',
  shared: false,
  formSent: false,
  items: seed(),
  recent: recentSeed(),
  recommend: recommendSeed(),
};

const TYPES = [
  { key:'all',        label:'Усі' },
  { key:'apartment',  label:'Квартири' },
  { key:'house',      label:'Будинки' },
  { key:'land',       label:'Ділянки' },
  { key:'commercial', label:'Комерція' },
  { key:'newbuild',   label:'Новобудови' },
];

/* ---------------- DOM-вузли ---------------- */
const elCount   = document.getElementById('fav-count');
const elActions = document.getElementById('fav-actions');
const elShare   = document.getElementById('fav-share');
const elChips   = document.getElementById('fav-chiprow');
const elGrid    = document.getElementById('fav-grid');
const elEmptyF  = document.getElementById('fav-empty-filter');
const elEmptyA  = document.getElementById('fav-empty-all');
const elStripT  = document.getElementById('fav-strip-title');
const elStrip   = document.getElementById('fav-strip-track');

/* ---------------- хелпери ---------------- */
function plural(n, forms){
  const a = n % 10, b = n % 100;
  if(a === 1 && b !== 11) return forms[0];
  if(a >= 2 && a <= 4 && (b < 10 || b >= 20)) return forms[1];
  return forms[2];
}
function countFor(key){
  return key === 'all' ? state.items.length : state.items.filter(i => i.kind === key).length;
}

/* ---------------- розмітка картки (через спільний ЕТАЛОН FCard) ----------------
   Сітка обраного: tag=article (не лінк, щоб серце прибирало без переходу),
   залите серце 'fav'. Стрічка: лінк + контурне серце 'out' + модиф. .card--strip. */
function gridCardHTML(it){ return FCard.html(it, { tag:'article', heart:'fav' }); }
function stripCardHTML(it){ return FCard.html(it, { heart:'out', strip:true }); }

/* ---------------- рендер ---------------- */
function renderChips(){
  elChips.innerHTML = TYPES.map(t => {
    const active = state.filter === t.key;
    return `<button class="fav-chip${active ? ' on' : ''}" type="button" data-key="${t.key}">${t.label}<span class="fav-chip__n">${countFor(t.key)}</span></button>`;
  }).join('');
}

function renderStrip(){
  const empty = state.items.length === 0;
  elStripT.textContent = empty ? 'Дивіться також' : 'Повернутись до переглянутих';
  const list = empty ? state.recommend : state.recent;
  elStrip.innerHTML = list.map(stripCardHTML).join('');
}

function render(){
  const total = state.items.length;
  const visible = state.filter === 'all' ? state.items : state.items.filter(i => i.kind === state.filter);

  // лічильник + дії
  elCount.textContent = total === 0
    ? 'Збережені об’єкти: 0'
    : `Збережені об’єкти: ${total} ${plural(total, ['об’єкт','об’єкти','об’єктів'])}`;
  elActions.hidden = total === 0;

  // чипи
  renderChips();

  // сітка / порожні стани
  const showGrid = total > 0 && visible.length > 0;
  elGrid.hidden    = !showGrid;
  elEmptyF.hidden  = !(total > 0 && visible.length === 0);
  elEmptyA.hidden  = total !== 0;
  if(showGrid) elGrid.innerHTML = visible.map(gridCardHTML).join('');

  // стрічка
  renderStrip();
}

/* ---------------- прибирання об'єкта (серце) ---------------- */
function remove(id){
  const card = elGrid.querySelector(`.card[data-id="${id}"]`);
  const done = () => {
    state.items = state.items.filter(i => i.id !== id);
    render();
    toast('Видалено з обраного');
  };
  if(card){
    card.classList.add('is-removing');
    setTimeout(done, 320);
  } else {
    done();
  }
}

/* ---------------- події ---------------- */
// фільтр-чипи
elChips.addEventListener('click', e => {
  const b = e.target.closest('.fav-chip');
  if(!b) return;
  state.filter = b.dataset.key;
  render();
});

// серце (делегування по сітці)
elGrid.addEventListener('click', e => {
  const h = e.target.closest('.card__heart');
  if(!h) return;
  remove(h.dataset.id);
});

// скидання фільтра з порожнього стану
elEmptyF.querySelector('.fav-empty__reset').addEventListener('click', () => {
  state.filter = 'all';
  render();
});

// поділитися добіркою
elShare.addEventListener('click', () => {
  const link = window.location.href;
  const restore = () => {
    elShare.querySelector('.fav-act__lbl').textContent = 'Поділитися добіркою';
  };
  const flash = () => {
    elShare.querySelector('.fav-act__lbl').textContent = 'Посилання скопійовано ✓';
    setTimeout(restore, 1900);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(flash, flash);
  } else {
    flash();
  }
});

// очистити все
document.getElementById('fav-clear').addEventListener('click', () => {
  if(!state.items.length) return;
  if(!window.confirm('Прибрати всі збережені об’єкти з обраного?')) return;
  state.items = [];
  state.filter = 'all';
  render();
  toast('Обране очищено');
});

// форма «Замовити перегляд»
document.getElementById('fav-form').addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  const btn = document.getElementById('fav-submit');
  btn.textContent = 'Заявку надіслано ✓';
  setTimeout(() => { btn.textContent = 'Надіслати запит'; }, 2400);
});

/* ---------------- старт ---------------- */
render();
