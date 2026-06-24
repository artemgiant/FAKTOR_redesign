/* ============================================================
   FAKTOR — логіка КАТАЛОГУ НОВОБУДОВ (лістинг ЖК)
   Картки житлових комплексів через ЕТАЛОН .card (FCard, js/card.js),
   kind:'newbuild' — рік (білий бейдж), коло забудовника, ціна «від …»,
   «Перший внесок», «Детальніше ›». Кожна картка веде на zhk.html.
   Інтерактив: обране, сортування, пагінація, лічильник результатів.
   Панель фільтрів (js/novobudovy-filters.js) дзвонить сюди через
   window.FaktorNovobudovy.refresh(state).
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

  /* ---------------- забудовники (коло на фото) ---------------- */
  // системна іконка девелопера є одна (dev-portico.svg) — спільна для кола
  var DEV_ICON = 'img/icons/dev-portico.svg';
  function dev(name) { return { icon: DEV_ICON, name: name }; }

  /* ---------------- дані ЖК (повторюваний набір, як у хендофі) ---------------- */
  // ціни «від» у $ (для сортування). order — стабільний індекс надходження.
  var COMPLEXES = [
    { name: 'ЖК Перший Французький',            district: 'Київський р-н',   addr: 'вул. Академіка Корольова',   devName: 'Гефест',      year: '2026', priceUsd: 61000,  installment: 'Перший внесок від 20%' },
    { name: 'ЖК Перлинний квартал на Сахарова', district: 'Київський р-н',   addr: 'вул. Сахарова',              devName: 'KADORR Group', year: '2026', priceUsd: 52000,  installment: 'Перший внесок від 15%' },
    { name: 'ЖК Модерн',                        district: 'Приморський р-н', addr: 'Французький бульвар',         devName: 'Stikon',       year: '2025', priceUsd: 73000,  installment: 'Перший внесок від 30%' },
    { name: 'Арт-резиденція Garden City',       district: 'Приморський р-н', addr: 'Гагарінське плато',           devName: 'Гефест',       year: '2027', priceUsd: 96000,  installment: 'Перший внесок від 20%' },
    { name: 'ЖК Морська перлина',               district: 'Приморський р-н', addr: 'вул. Генуезька',              devName: 'Будова',       year: '2026', priceUsd: 112000, installment: 'Перший внесок від 25%' },
    { name: 'ЖК Sky Garden',                    district: 'Малиновський р-н', addr: 'вул. Люстдорфська дорога',   devName: 'Інкор Груп',   year: '2025', priceUsd: 47000,  installment: 'Перший внесок від 10%' },
    { name: 'Клубний будинок Bunin',            district: 'Приморський р-н', addr: 'вул. Буніна',                 devName: 'Альтаїр',      year: '2026', priceUsd: 134000, installment: 'Перший внесок від 30%' },
    { name: 'ЖК Аркадія Сіті',                  district: 'Приморський р-н', addr: 'Французький бульвар',         devName: 'KADORR Group', year: '2027', priceUsd: 82000,  installment: 'Перший внесок від 20%' }
  ];

  /* ---------------- валюта ---------------- */
  var RATE = { USD: 1, EUR: 0.92, UAH: 41 };
  var SYMBOL = { USD: '$', EUR: '€', UAH: '₴' };
  function fmtNum(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function priceFromText(usd, cur) {
    cur = cur || 'USD';
    return 'від ' + SYMBOL[cur] + ' ' + fmtNum(usd * (RATE[cur] || 1));
  }
  function plural(n, forms) { var a = n % 10, b = n % 100; if (a === 1 && b !== 11) return forms[0]; if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return forms[1]; return forms[2]; }

  /* ---------------- стан ---------------- */
  var state = { currency: 'USD', cards: [], fav: {}, sort: 'new' };

  // побудувати масив карток (n штук, циклічно з COMPLEXES)
  function buildCards(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var c = COMPLEXES[i % COMPLEXES.length];
      out.push({ src: c, order: i });
    }
    return out;
  }

  /* ---------------- рендер (через ЕТАЛОН FCard, kind:newbuild) ----------------
     Серце з контуром ('out'); стан «в обраному» — клас на кнопці + like.svg. */
  function cardHTML(d, i) {
    var c = d.src;
    var item = {
      id: i,
      kind: 'newbuild',
      year: c.year,
      dev: dev(c.devName),
      price: priceFromText(c.priceUsd, state.currency),
      title: c.name,
      addr: 'Одеса, ' + c.district + ', ' + c.addr,
      installment: c.installment,
      href: 'zhk.html'
    };
    var fav = !!state.fav[i];
    return FCard.html(item, { heart: fav ? 'fav' : 'out' });
  }
  function renderCards() {
    var grid = document.getElementById('nb-grid');
    if (grid) grid.innerHTML = state.cards.map(cardHTML).join('');
  }
  function renderCount() {
    var el = document.getElementById('nb-count');
    if (!el) return;
    var n = 48;
    el.innerHTML = 'Знайдено <b>' + n + '</b> ' + plural(n, ['комплекс', 'комплекси', 'комплексів']);
  }

  function applySort() {
    var m = state.sort;
    if (m === 'cheap') state.cards.sort(function (a, b) { return a.src.priceUsd - b.src.priceUsd; });
    else if (m === 'expensive') state.cards.sort(function (a, b) { return b.src.priceUsd - a.src.priceUsd; });
    else if (m === 'soon') state.cards.sort(function (a, b) { return parseInt(a.src.year, 10) - parseInt(b.src.year, 10); });
    else state.cards.sort(function (a, b) { return a.order - b.order; });
  }

  /* ---------------- публічний API для панелі фільтрів ---------------- */
  // фільтри лише оновлюють валюту/лічильник у цьому демо-лістингу (як catalog.js)
  function refresh(fstate) {
    if (fstate && fstate.currency && fstate.currency !== state.currency) {
      state.currency = fstate.currency;
      renderCards();
    }
    renderCount();
  }

  /* ---------------- обране (делегування) ---------------- */
  document.addEventListener('click', function (e) {
    var h = e.target.closest('.card__heart');
    if (!h) return;
    e.preventDefault();   // не переходити на сторінку ЖК при кліку по сердечку
    var i = h.getAttribute('data-id');
    state.fav[i] = !state.fav[i];
    var img = h.querySelector('img');
    if (img) img.src = state.fav[i] ? FCard.HEART_FAV : FCard.HEART_OUT;
    window.toast(state.fav[i] ? 'ЖК додано до обраного' : 'Видалено з обраного');
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
      state.sort = li.dataset.sort;
      applySort();
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
        var grid = document.querySelector('.nb-grid');
        if (grid) window.scrollTo({ top: grid.offsetTop - 120, behavior: 'smooth' });
      });
    }
    var more = document.getElementById('show-more');
    if (more) more.addEventListener('click', function () {
      var start = state.cards.length;
      for (var i = 0; i < 8; i++) state.cards.push({ src: COMPLEXES[(start + i) % COMPLEXES.length], order: start + i });
      applySort();
      renderCards();
      window.toast('Завантажено ще 8 ЖК');
    });
  })();

  /* ---------------- публічний API ---------------- */
  window.FaktorNovobudovy = { refresh: refresh };

  // стартовий рендер
  state.cards = buildCards(8);
  renderCards();
  renderCount();
})();
