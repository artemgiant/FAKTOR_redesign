/* ============================================================
   FAKTOR — логіка СТОРІНКИ ЗАБУДОВНИКА (developer.html)
   Джерело дизайну: design_handoff_developer/ («Забудовник FAKTOR»).

   Рендерить:
   - шапку-плашку (монограма, назва, мета, лічильник) із даних DEV;
   - сітку об'єктів забудовника через ЕТАЛОН .card (FCard, js/card.js),
     kind:'newbuild' — рік (білий бейдж), коло забудовника, ціна «від»,
     «Перший внесок», «Детальніше ›». Кожна картка веде на zhk.html.
   - обране (делегування, як у novobudovy.js), форму «Призначити огляд»
     (демо-сабміт), кнопку «Зателефонувати», JSON-LD (Organization +
     BreadcrumbList).

   Дані DEV/OBJECTS захардкоджені (як у хендофі) — підключіть CRM.
   slug береться з ?dev=... (для майбутнього маршруту /developers/{slug}).
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- тост (спільний із рештою сторінок) ---------------- */
  window.toast = window.toast || function (msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };

  /* ---------------- дані забудовника + його об'єктів ---------------- */
  // Системна іконка девелопера (коло на фото картки) — спільна для сайту.
  var DEV_ICON = 'img/icons/dev-portico.svg';

  // Довідник забудовників (slug → дані плашки). Slug-и збігаються з картками на
  // developers.js. Повна копія є лише для KADORR; решта — з полів DEVS[]
  // (name/founded/city/count/areas) + згенерований generic-опис.
  var DEVS = {
    'kadorr-group': { name: 'KADORR Group', mono: 'K', founded: 2010, areas: ['Приморський','Київський'], count: 18,
      web: 'kadorr.com', webHref: 'https://kadorr.com', salesPhone: '+380 48 705 05 05',
      about: "KADORR Group — один із найбільших девелоперів Одеси, на ринку з 2010 року. Компанія зводить житлові та апарт-комплекси бізнес- і преміумкласу переважно в Приморському районі та біля моря, з власною інфраструктурою, закритою територією й керуючою компанією. FAKTOR — офіційний партнер забудовника: квартири продаються за цінами девелопера, без комісії, з можливістю розтермінування." },
    'gefest':     { name: 'Гефест',               mono: 'Г', founded: 2004, areas: ['Київський','Приморський','Фонтан'], count: 12 },
    'stikon':     { name: 'Stikon',               mono: 'S', founded: 1994, areas: ['Приморський','Аркадія'],            count: 7 },
    'budova':     { name: 'Будова',               mono: 'Б', founded: 2008, areas: ['Приморський','Малиновський'],       count: 5 },
    'inkor-grup': { name: 'Інкор Груп',           mono: 'І', founded: 2006, areas: ['Малиновський','Київський','Таїрова'], count: 6 },
    'altair':     { name: 'Альтаїр',              mono: 'А', founded: 2011, areas: ['Приморський','Аркадія'],            count: 4 },
    'inter-bud':  { name: 'Інтер-Буд',            mono: 'І', founded: 2003, areas: ['Київський','Пересипський'],         count: 9 },
    'atlant':     { name: 'Атлант',               mono: 'А', founded: 2014, areas: ['Приморський','Фонтан'],             count: 5 },
    'rozmarin':   { name: 'Розмарин Девелопмент', mono: 'Р', founded: 2016, areas: ['Приморський','Аркадія','Совіньйон'], count: 3 },
    'prime-park': { name: 'Prime Park',           mono: 'P', founded: 2012, areas: ['Київський','Таїрова'],              count: 8 }
  };

  // Slug із ?dev=… (із developers.html). Невідомий/відсутній → KADORR як дефолт.
  var slug = (new URLSearchParams(window.location.search).get('dev') || 'kadorr-group');
  if (!DEVS[slug]) slug = 'kadorr-group';

  // Доповнюємо запис до повного вигляду плашки (locations/web/phone/about),
  // якщо в довіднику задані лише базові поля.
  var DEV = (function (base) {
    var d = {
      slug: slug, name: base.name, mono: base.mono, founded: base.founded, count: base.count,
      locations: 'Одеса · ' + (base.areas || []).slice(0, 2).join(', ') + ((base.areas || []).length ? ' р-ни' : ''),
      web: base.web || '', webHref: base.webHref || '',
      salesPhone: base.salesPhone || '+380 48 705 05 05',
      about: base.about || (base.name + ' — забудовник Одеси, на ринку з ' + base.founded + ' року. Зводить житлові комплекси в ' + (base.areas || []).join(', ') + ' районах міста. FAKTOR — офіційний партнер забудовника: квартири продаються за цінами девелопера, без комісії, з можливістю розтермінування.')
    };
    return d;
  })(DEVS[slug]);

  var OBJECTS = [
    { id: 'k1', name: 'ЖК Аркадія Сіті',          addr: 'Одеса, Приморський р-н, Аркадія',             year: '2027', price: '3.1 млн грн', priceM: '54 000 грн / м²', installment: 'Перший внесок від 20%' },
    { id: 'k2', name: 'ЖК Перлинний квартал',      addr: 'Одеса, Київський р-н, вул. Сахарова',         year: '2026', price: '1.9 млн грн', priceM: '44 000 грн / м²', installment: 'Перший внесок від 20%' },
    { id: 'k3', name: 'ЖК Sea View Resort',        addr: 'Одеса, Приморський р-н, Французький бульвар',  year: '2026', price: '4.5 млн грн', priceM: '62 000 грн / м²', installment: 'Перший внесок від 30%' },
    { id: 'k4', name: 'ЖК Французький Бульвар 60',  addr: 'Одеса, Приморський р-н, Французький бульвар',  year: '2025', price: '5.2 млн грн', priceM: '68 000 грн / м²', installment: 'Перший внесок від 30%' },
    { id: 'k5', name: 'ЖК Gagarin Plaza II',       addr: 'Одеса, Приморський р-н, Гагарінське плато',    year: '2027', price: '2.8 млн грн', priceM: '50 000 грн / м²', installment: 'Перший внесок від 20%' },
    { id: 'k6', name: 'ЖК Aqua Marine',            addr: 'Одеса, Приморський р-н, Аркадія',             year: '2026', price: '3.9 млн грн', priceM: '58 000 грн / м²', installment: 'Перший внесок від 25%' }
  ];

  /* ---------------- утиліти ---------------- */
  function plural(n, forms) { var a = n % 10, b = n % 100; if (a === 1 && b !== 11) return forms[0]; if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return forms[1]; return forms[2]; }
  function telHref(phone) { return 'tel:' + String(phone).replace(/[^\d+]/g, ''); }

  /* ---------------- стан обраного ---------------- */
  var state = { fav: {} };

  /* ---------------- рендер шапки-плашки ---------------- */
  function renderHead() {
    var mono = document.getElementById('dev-mono');
    var title = document.getElementById('dev-title');
    var founded = document.getElementById('dev-founded');
    var locations = document.getElementById('dev-locations');
    var countLbl = document.getElementById('dev-count');
    var about = document.getElementById('dev-about');
    if (mono) mono.textContent = DEV.mono;
    if (title) title.textContent = DEV.name;
    if (founded) founded.textContent = 'На ринку з ' + DEV.founded;
    if (locations) locations.textContent = DEV.locations;
    if (countLbl) countLbl.textContent = DEV.count + ' ' + plural(DEV.count, ['комплекс', 'комплекси', 'комплексів']);
    if (about) about.textContent = DEV.about;
  }

  /* ---------------- рендер сітки об'єктів (ЕТАЛОН FCard, kind:newbuild) ---------------- */
  function cardHTML(o) {
    var item = {
      id: o.id,
      kind: 'newbuild',
      year: o.year,
      dev: { icon: DEV_ICON, name: DEV.name },
      price: 'від ' + o.price,
      priceM: o.priceM ? 'від ' + o.priceM : '',
      title: o.name,
      addr: o.addr,
      installment: o.installment,
      href: 'zhk.html'
    };
    return FCard.html(item, { heart: state.fav[o.id] ? 'fav' : 'out' });
  }
  function renderObjects() {
    var grid = document.getElementById('dev-grid');
    if (grid) grid.innerHTML = OBJECTS.map(cardHTML).join('');
  }

  /* ---------------- лічильник + посилання «дивитись усі» + телефон ---------------- */
  function renderMeta() {
    document.querySelectorAll('[data-dev-objcount]').forEach(function (el) { el.textContent = DEV.count; });
    var all = document.getElementById('dev-all');
    if (all) all.href = 'novobudovy.html?developer=' + encodeURIComponent(DEV.slug);
    var attr = document.getElementById('dev-map-attr');
    if (attr) attr.textContent = 'Leaflet / OpenStreetMap · ' + DEV.count + ' ' + plural(DEV.count, ['об’єкт', 'об’єкти', 'об’єктів']) + ' ' + DEV.name + ' в Одесі';
    var call = document.getElementById('dev-call');
    if (call) call.href = telHref(DEV.salesPhone);
  }

  /* ---------------- обране (делегування, як у novobudovy.js) ---------------- */
  document.addEventListener('click', function (e) {
    var h = e.target.closest('.card__heart');
    if (!h) return;
    e.preventDefault();   // не переходити на zhk.html при кліку по сердечку
    var id = h.getAttribute('data-id');
    state.fav[id] = !state.fav[id];
    var img = h.querySelector('img');
    if (img) img.src = state.fav[id] ? FCard.HEART_FAV : FCard.HEART_OUT;
    window.toast(state.fav[id] ? 'Об’єкт додано до обраного' : 'Видалено з обраного');
  });

  /* ---------------- форма «Призначити огляд» (демо) ---------------- */
  (function initForm() {
    var btn = document.getElementById('dev-submit');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (btn.classList.contains('is-done')) return;
      btn.classList.add('is-done');
      btn.textContent = 'Заявку надіслано ✓';
      window.toast('Заявку на показ надіслано');
    });
  })();

  /* ---------------- JSON-LD: Organization + BreadcrumbList ---------------- */
  (function injectSchema() {
    var d = DEV;
    var data = [
      { '@context': 'https://schema.org', '@type': 'Organization', name: d.name, foundingDate: String(d.founded), url: d.webHref, areaServed: 'Одеса',
        address: { '@type': 'PostalAddress', addressLocality: 'Одеса', addressCountry: 'UA' } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://faktor24.com/' },
        { '@type': 'ListItem', position: 2, name: 'Забудовники', item: 'https://faktor24.com/developers' },
        { '@type': 'ListItem', position: 3, name: d.name, item: 'https://faktor24.com/developers/' + d.slug }
      ] }
    ];
    var el = document.getElementById('dev-ldjson');
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'dev-ldjson'; document.head.appendChild(el); }
    el.textContent = JSON.stringify(data);
    document.title = d.name + ' — забудовник Одеси, об’єкти й ціни | FAKTOR';
  })();

  /* ---------------- старт ---------------- */
  renderHead();
  renderObjects();
  renderMeta();
})();
