/* ============================================================
   FAKTOR — логіка сторінки каталогу (лістинг)
   Картки за категорією + інтерактив: обране, сортування, пагінація,
   лічильник результатів. Категорію задає панель фільтрів
   (js/catalog-filters.js) через window.FaktorCatalog.setCategory().
   Картки — ЕТАЛОН .card через спільний білдер FCard (js/card.js).
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- тост ---------------- */
  window.toast = window.toast || function (msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };

  /* ---------------- дані карток за категорією ---------------- */
  var PRICES = [124000, 300000, 210000, 170000, 96000, 415000, 132000, 58000, 245000, 189000, 77000, 350000];
  var COMPLEX = [
    ['ЖК OZONE', 'Одеса, Приморський р-н, вул. Віце-Адмірала Азарова'],
    ['ЖК Аркадія Сіті', 'Одеса, Приморський р-н, Французький бульвар'],
    ['ЖК Перлина', 'Одеса, Київський р-н, вул. Генуезька'],
    ['ЖК More', 'Одеса, Приморський р-н, Гагарінське плато']
  ];
  var ROOMS = ['1', '2', '3', '4'];
  var FLOOR = ['2/5', '4/9', '6/12', '3/16'];
  var AREA = ['46 м²', '88 м²', '147 м²', '180 м²'];
  var PLOT = ['6 сот.', '10 сот.', '12 сот.', '4 сот.'];
  var COMM_TYPE = ['Офіс', 'Магазин', 'Склад', 'Готовий бізнес'];
  var HOUSE_TYPE = ['Будинок', 'Котедж', 'Таунхаус', 'Дача'];
  var APT_TYPE = ['Квартира', 'Апартаменти', 'Пентхаус', 'Студія'];
  var ROOM_AREA = ['12 м²', '18 м²', '24 м²', '15 м²'];
  var HOUSE_AREA = ['180 м²', '220 м²', '310 м²', '140 м²'];
  var COMM_AREA = ['120 м²', '320 м²', '540 м²', '85 м²'];
  var LAND_ADDR = ['Одеса, Київський р-н, Совіньйон', 'Одеса, Лиманський р-н, Фонтанка', 'Одеса, Приморський р-н, Дача Ковалевського', 'Одеса, Овідіопольський р-н, Чорноморка'];
  var HOUSE_ADDR = ['Одеса, Київський р-н, Совіньйон', 'Одеса, Лиманський р-н, Фонтанка', 'Одеса, Приморський р-н, Великий Фонтан', 'Одеса, Овідіопольський р-н, Авангард'];
  var COMM_ADDR = ['Одеса, Приморський р-н, вул. Грецька', 'Одеса, Київський р-н, Люстдорфська дорога', 'Одеса, Пересипський р-н, вул. Промислова', 'Одеса, Хаджибейський р-н, вул. Розкидайлівська'];

  // картка для категорії + індексу (повторюваний набір 12 шт., як у макеті)
  function makeCard(cat, i) {
    var k = i % 4, pl = COMPLEX[k], price = PRICES[i % 12], order = i;
    if (cat === 'Земля') {
      return { price: price, type: 'Ділянка', name: 'Земельна ділянка', addr: LAND_ADDR[k], order: order,
        stats: [{ icon: 'plot', text: PLOT[k] }] };
    }
    if (cat === 'Кімнати') {
      return { price: price, type: 'Кімната', name: pl[0], addr: pl[1], order: order,
        stats: [{ icon: 'area', text: ROOM_AREA[k] }, { icon: 'floor', text: FLOOR[k] }] };
    }
    if (cat === 'Будинки') {
      var ht = HOUSE_TYPE[k];
      return { price: price, type: ht, name: ht, addr: HOUSE_ADDR[k], order: order,
        stats: [{ icon: 'rooms', text: ROOMS[k] }, { icon: 'area', text: HOUSE_AREA[k] }, { icon: 'plot', text: PLOT[k] }] };
    }
    if (cat === 'Комерція') {
      var ct = COMM_TYPE[k];
      var stats = [{ icon: 'area', text: COMM_AREA[k] }, { icon: 'floor', text: FLOOR[k] }];
      if (k >= 2) stats.push({ icon: 'plot', text: PLOT[k] });   // склад / готовий бізнес — із землею
      return { price: price, type: ct, name: ct, addr: COMM_ADDR[k], order: order, stats: stats };
    }
    return { price: price, type: APT_TYPE[k], name: pl[0], addr: pl[1], order: order,
      stats: [{ icon: 'rooms', text: ROOMS[k] }, { icon: 'floor', text: FLOOR[k] }, { icon: 'area', text: AREA[k] }] };
  }

  var RESULT_COUNT = { 'Квартири': 248, 'Кімнати': 37, 'Будинки': 164, 'Земля': 92, 'Комерція': 118 };

  /* ---------------- стан ---------------- */
  var state = { category: 'Квартири', cards: [], fav: {} };
  function buildCards(cat, n) { var out = []; for (var i = 0; i < n; i++) out.push(makeCard(cat, i)); return out; }

  var fmtUsd = function (v) { return '$ ' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  function plural(n, forms) { var a = n % 10, b = n % 100; if (a === 1 && b !== 11) return forms[0]; if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return forms[1]; return forms[2]; }

  /* ---------------- рендер (через спільний ЕТАЛОН FCard) ----------------
     Картка каталогу — звичайний об'єкт (kind=apartment/house/land/commercial).
     stats каталогу мають ключ {icon} → нормалізуємо в {k} для FCard.
     Серце з контуром ('out'); стан «в обраному» — клас .is-fav на кнопці. */
  function cardHTML(d, i) {
    var item = {
      id: i,
      kind: 'apartment',
      badge: d.type,
      price: fmtUsd(d.price),
      title: d.name,
      addr: d.addr,
      href: 'property.html',
      stats: (d.stats || []).map(function (s) { return { k: s.icon, text: s.text }; })
    };
    var fav = !!state.fav[state.category + '-' + i];
    var out = FCard.html(item, { heart: fav ? 'fav' : 'out' });
    return out;
  }
  function renderCards() {
    var grid = document.getElementById('cat-grid');
    if (grid) grid.innerHTML = state.cards.map(cardHTML).join('');
  }
  function renderCount() {
    var el = document.getElementById('cat-count');
    if (!el) return;
    var n = RESULT_COUNT[state.category] || state.cards.length;
    el.innerHTML = 'Знайдено <b>' + n + '</b> ' + plural(n, ['пропозиція', 'пропозиції', 'пропозицій']);
  }

  function setCategory(cat) {
    if (cat === state.category && state.cards.length) return;
    state.category = cat;
    state.cards = buildCards(cat, 12);
    renderCards();
    renderCount();
  }

  /* ---------------- обране (делегування) ---------------- */
  document.addEventListener('click', function (e) {
    var h = e.target.closest('.card__heart');
    if (!h) return;
    e.preventDefault();   // не переходити на сторінку об'єкта при кліку по сердечку
    var i = h.getAttribute('data-id'), key = state.category + '-' + i;
    state.fav[key] = !state.fav[key];
    var img = h.querySelector('img');
    if (img) img.src = state.fav[key] ? FCard.HEART_FAV : FCard.HEART_OUT;
    window.toast(state.fav[key] ? 'Додано до обраного' : 'Видалено з обраного');
  });

  /* ---------------- сортування ---------------- */
  (function initSort() {
    var wrap = document.querySelector('.sort-wrap');
    var menu = document.getElementById('sort-menu');
    var btn = document.getElementById('sort-btn');
    if (!wrap || !menu || !btn) return;
    btn.addEventListener('click', function (e) { e.stopPropagation(); wrap.classList.toggle('open'); });
    menu.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      var mode = li.dataset.sort;
      if (mode === 'cheap') state.cards.sort(function (a, b) { return a.price - b.price; });
      else if (mode === 'expensive') state.cards.sort(function (a, b) { return b.price - a.price; });
      else state.cards.sort(function (a, b) { return a.order - b.order; });
      menu.querySelectorAll('li').forEach(function (x) { x.classList.toggle('sel', x === li); });
      renderCards();
      wrap.classList.remove('open');
      window.toast('Сортування: ' + li.textContent.toLowerCase());
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.sort-wrap')) wrap.classList.remove('open'); });
  })();

  /* ---------------- пагінація + «показати ще» ---------------- */
  (function initPagination() {
    var pages = document.getElementById('pages');
    if (pages) {
      var nums = function () { return Array.prototype.slice.call(pages.querySelectorAll('.pg:not(.arrow)')); };
      var active = function () { return pages.querySelector('.pg.on'); };
      pages.addEventListener('click', function (e) {
        var b = e.target.closest('.pg');
        if (!b) return;
        var list = nums();
        if (b.classList.contains('arrow')) {
          var i = list.indexOf(active());
          i = b.classList.contains('next') ? Math.min(list.length - 1, i + 1) : Math.max(0, i - 1);
          list.forEach(function (x, idx) { x.classList.toggle('on', idx === i); });
        } else {
          list.forEach(function (x) { x.classList.toggle('on', x === b); });
        }
        var grid = document.querySelector('.cat-grid');
        if (grid) window.scrollTo({ top: grid.offsetTop - 120, behavior: 'smooth' });
      });
    }
    var more = document.getElementById('show-more');
    if (more) more.addEventListener('click', function () {
      var start = state.cards.length;
      for (var i = 0; i < 12; i++) state.cards.push(makeCard(state.category, start + i));
      renderCards();
      window.toast('Завантажено ще 12 пропозицій');
    });
  })();

  /* ---------------- публічний API для панелі фільтрів ---------------- */
  window.FaktorCatalog = { setCategory: setCategory, getCategory: function () { return state.category; } };

  // стартовий рендер (категорія може прийти з URL — панель фільтрів викличе setCategory)
  setCategory('Квартири');
})();
