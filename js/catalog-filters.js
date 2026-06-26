/* ============================================================
   FAKTOR — фільтри каталогу (динамічні, за категоріями)
   Самодостатній компонент: зміна категорії → набір доп. фільтрів,
   чипи, мультиселекти, обрані фільтри, скидання. Рендериться повністю
   у #ff-catalog-filters. Стилі — css/catalog-filters.css.

   Головний рядок: тип угоди · категорія · ЛОКАЦІЯ (мультивибір-пікер
   geo/local із живим пошуком, як на головній) · ВАЛЮТА + ціна від/до ·
   «Фільтри» · «Знайти». Пікер локацій повторює дані й розмітку .fk-loc
   з головної (js/app.js + style.css), тож виглядає однаково на сайті.

   Колбеки onSearch/onChange/onCategory зв'язані з лістингом (js/catalog.js):
   зміна категорії перебудовує сітку карток і лічильник результатів.
   ============================================================ */
(function () {
  'use strict';
  var CATEGORIES = ['Квартири', 'Кімнати', 'Будинки', 'Земля', 'Комерція'];
  var DEALS = ['Купити', 'Оренда'];
  var CURRENCIES = ['USD', 'EUR', 'UAH'];
  var ROOM_OPTS = ['1', '2', '3', '4', '5+'];
  var BATH_OPTS = ['1', '2', '3', '4', '5+'];
  var CONDITION = ['Будь-який', 'Дизайнерський', 'Сучасний ремонт', 'Житловий', 'Без ремонту', 'Чорнова'];
  var TYPE_APT = ['Будь-який', 'Квартира', 'Апартаменти', 'Пентхаус', 'Студія', 'Багаторівнева'];
  var TYPE_HOUSE = ['Будь-який', 'Будинок', 'Котедж', 'Таунхаус', 'Дача', 'Частина будинку'];
  var TYPE_COMM = ['Будь-який', 'Офіс', 'Магазин', 'Склад', 'Кафе-бар', 'Готель', 'Виробничо-офісне', 'Паркінг', 'Готовий бізнес'];
  var PURPOSE = ['Будь-яке', 'Під забудову', 'Сільгосп', 'Комерційне'];
  var CAT_GEN = { 'Квартири': 'квартир', 'Кімнати': 'кімнат', 'Будинки': 'будинків', 'Земля': 'земельних ділянок', 'Комерція': 'комерційної нерухомості' };

  // підказки «від / до» (datalist). Площі та ціни. Поверх/поверховість — без підказок.
  var DATALISTS = {
    price:       { from: ['20 000', '30 000', '50 000', '70 000', '100 000'], to: ['80 000', '120 000', '200 000', '350 000', '500 000'] },
    pricePerM:   { from: ['500', '800', '1000', '1200'], to: ['1500', '2000', '2500', '3000'] },
    pricePerSot: { from: ['1000', '3000', '5000'], to: ['10 000', '20 000', '50 000'] },
    areaTotal:   { from: ['30', '40', '50', '60'], to: ['80', '100', '150', '200'] },
    areaLiving:  { from: ['15', '20', '30'], to: ['50', '70', '100'] },
    areaKitchen: { from: ['6', '8', '10', '12'], to: ['15', '20', '25'] },
    area:        { from: ['10', '12', '15'], to: ['20', '30', '40'] },
    areaPlot:    { from: ['4', '6', '8', '10'], to: ['15', '20', '30'] }
  };

  // МАТРИЦЯ доп. фільтрів за категоріями
  function fieldsFor(category) {
    var cond = { id: 'condition', kind: 'select', label: 'Стан', options: CONDITION };
    var map = {
      'Квартири': [
        { id: 'rooms', kind: 'rooms', label: 'Кількість кімнат' },
        { id: 'baths', kind: 'baths', label: 'Санвузли' },
        { id: 'areaTotal', kind: 'range', label: 'Площа загальна, м²' },
        { id: 'areaLiving', kind: 'range', label: 'Площа житлова, м²' },
        { id: 'areaKitchen', kind: 'range', label: 'Площа кухні, м²' },
        { id: 'floor', kind: 'range', label: 'Поверх' },
        { id: 'floors', kind: 'range', label: 'Поверховість' },
        cond,
        { id: 'ptype', kind: 'select', label: 'Тип нерухомості', options: TYPE_APT },
        { id: 'pricePerM', kind: 'range', label: 'Ціна за м², $' },
        { id: 'tags', kind: 'tags', label: 'Особливості', tags: ['Держпрограми', 'Вид на море', 'Тераса'] }
      ],
      'Кімнати': [
        { id: 'area', kind: 'range', label: 'Площа, м²' },
        { id: 'floor', kind: 'range', label: 'Поверх' },
        { id: 'floors', kind: 'range', label: 'Поверховість' },
        cond,
        { id: 'tags', kind: 'tags', label: 'Особливості', tags: ['Вид на море', 'Тераса'] }
      ],
      'Будинки': [
        { id: 'rooms', kind: 'rooms', label: 'Кількість кімнат' },
        { id: 'baths', kind: 'baths', label: 'Санвузли' },
        { id: 'areaTotal', kind: 'range', label: 'Площа загальна, м²' },
        { id: 'areaLiving', kind: 'range', label: 'Площа житлова, м²' },
        { id: 'areaKitchen', kind: 'range', label: 'Площа кухні, м²' },
        { id: 'areaPlot', kind: 'range', label: 'Площа ділянки, сот.' },
        { id: 'floors', kind: 'range', label: 'Поверховість будинку' },
        cond,
        { id: 'ptype', kind: 'select', label: 'Тип нерухомості', options: TYPE_HOUSE },
        { id: 'pricePerM', kind: 'range', label: 'Ціна за м², $' },
        { id: 'tags', kind: 'tags', label: 'Особливості', tags: ['Держпрограми', 'Вид на море', 'Басейн', 'Гараж'] }
      ],
      'Земля': [
        { id: 'purpose', kind: 'select', label: 'Призначення', options: PURPOSE },
        { id: 'areaPlot', kind: 'range', label: 'Площа ділянки, сот.' },
        { id: 'pricePerSot', kind: 'range', label: 'Ціна за сотку, $' },
        { id: 'tags', kind: 'tags', label: 'Особливості', tags: ['Вид на море'] }
      ],
      'Комерція': [
        { id: 'areaTotal', kind: 'range', label: 'Площа загальна, м²' },
        { id: 'areaPlot', kind: 'range', label: 'Площа ділянки, сот.' },
        { id: 'floor', kind: 'range', label: 'Поверх' },
        { id: 'floors', kind: 'range', label: 'Поверховість' },
        cond,
        { id: 'ptype', kind: 'select', label: 'Тип нерухомості', options: TYPE_COMM },
        { id: 'pricePerM', kind: 'range', label: 'Ціна за м², $' },
        { id: 'tags', kind: 'tags', label: 'Особливості', tags: ['Вид на море'] }
      ]
    };
    return map[category] || map['Квартири'];
  }

  // SEO теги-перелінковки — залежать від категорії + типу угоди
  var INTERLINKS = {
    'Квартири': {
      buy: ['1-кімнатні квартири', '2-кімнатні квартири', '3-кімнатні квартири', 'Недорогі квартири', 'Квартири в новобудові', 'На вторинному ринку', 'Квартири біля моря', 'Квартири в Аркадії', 'Квартири на Фонтані', 'Приморський район'],
      rent: ['Оренда 1-кімнатної квартири', 'Оренда 2-кімнатної квартири', 'Оренда 3-кімнатної квартири', 'Подобова оренда квартир', 'Недорога оренда квартир', 'Оренда квартири біля моря', 'Оренда в Аркадії', 'Приморський район', 'Київський район']
    },
    'Кімнати': {
      buy: ['Недорогі кімнати', 'Кімната в комуналці', 'Кімната в центрі', 'Приморський район', 'Київський район', 'Малиновський район'],
      rent: ['Оренда кімнати', 'Оренда кімнати студентам', 'Недорога оренда кімнат', 'Кімнати в центрі', 'Приморський район', 'Київський район']
    },
    'Будинки': {
      buy: ['Будинки в місті', 'Будинки за містом', 'Одноповерхові будинки', 'Недорогі будинки', 'Котеджі', 'Таунхауси', 'Дачі', 'Будинки біля моря', 'Совіньйон', 'Фонтанка'],
      rent: ['Оренда будинку', 'Оренда будинку біля моря', 'Оренда котеджу', 'Оренда вілли', 'Будинки за містом', 'Совіньйон', 'Фонтанка']
    },
    'Земля': {
      buy: ['Під житлову забудову', 'Під садівництво', 'Комерційного призначення', 'Ділянки біля моря', 'Совіньйон', 'Передмістя Одеси'],
      rent: ['Оренда землі', 'Сільгосп призначення', 'Комерційного призначення', 'Передмістя Одеси', 'Совіньйон']
    },
    'Комерція': {
      buy: ['Офіси', 'Магазини', 'Склади', 'Готовий бізнес', 'Ресторан / кафе', 'Готель', 'Приморський район'],
      rent: ['Оренда офісу', 'Приміщення під магазин', 'Оренда складу', 'Оренда під ресторан', 'Готовий бізнес', 'Приморський район', 'Київський район']
    }
  };

  // ── Дані пікера локацій (ідентичні головній — js/app.js) ────────────
  var LOC_CATS = [['all', 'Усі'], ['district', 'Райони'], ['street', 'Вулиці'], ['micro', 'Мікрорайони'], ['complex', 'ЖК'], ['developer', 'Забудовники']];
  var KIND = { district: 'район', street: 'вулиця', micro: 'мікрорайон', complex: 'жк', developer: 'забудовник', city: 'місто', region: 'регіон', country: 'країна' };
  var COUNTRIES = [['Україна', 5329], ['Польща', 0], ['Німеччина', 0], ['Іспанія', 0], ['Туреччина', 0], ['ОАЕ', 0], ['Кіпр', 0]];
  var REGIONS = { 'Україна': [['Одеська область', 90], ['Київська область', 0], ['Львівська область', 0], ['Миколаївська область', 0], ['Харківська область', 0]] };
  var CITIES = { 'Одеська область': [['Одеса', '', 5329], ['Фонтанка', '', 132], ['Лиманка', '', 375], ['Авангард', '', 92], ['Чорноморськ', '', 19], ['Теплодар', '', 3], ['Таїрово, смт', '', 64]] };
  var LOCDATA = {
    district: [['Приморський', 'Одеса', 2173], ['Хаджибейський', 'Одеса', 1336], ['Київський', 'Одеса', 1241], ['Пересипський', 'Одеса', 578], ['Лиманський', 'Фонтанка', 113], ['Овідіопольський', 'Лиманка', 346]],
    street: [['Французький бульвар', 'Приморський', 420], ['вул. Генуезька', 'Приморський', 311], ['вул. Канатна', 'Приморський', 208], ['Гагарінське плато', 'Приморський', 176], ['Люстдорфська дорога', 'Київський', 289], ['вул. Пушкінська', 'Приморський', 142], ['вул. Дерибасівська', 'Приморський', 64], ['вул. Рішельєвська', 'Приморський', 98], ['вул. Преображенська', 'Приморський', 151], ['вул. Велика Арнаутська', 'Приморський', 173], ['вул. Фонтанська дорога', 'Приморський', 262], ['проспект Шевченка', 'Приморський', 119]],
    micro: [['Аркадія', 'Приморський', 512], ['Фонтан', 'Приморський', 604], ['Таїрова', 'Київський', 433], ['Черемушки', 'Малиновський', 221], ['Котовського', 'Пересипський', 318], ['Молдаванка', 'Малиновський', 176], ['Сьоме Небо', 'Київський', 92], ['Совіньйон', 'Овідіопольський', 64]],
    complex: [['ЖК OZONE', 'Приморський', 64], ['ЖК Аркадія Сіті', 'Приморський', 88], ['ЖК Перлина', 'Київський', 52], ['ЖК More', 'Приморський', 41], ['ЖК Sea Town', 'Приморський', 37], ['ЖК Гранд Парк', 'Київський', 58], ['ЖК Французький квартал', 'Приморський', 46], ['ЖК Sky Garden', 'Київський', 29], ['ЖК Bunin', 'Приморський', 24], ['ЖК 56 Перлина', 'Київський', 71]],
    developer: [['KADORR Group', '', 312], ['Гефест', '', 128], ['Stikon', '', 97], ['Будова', '', 54], ['Інкор Груп', '', 83], ['Альтаїр', '', 46], ['Рідна Оселя', '', 38]]
  };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function cleanLabel(l){ return l.split(',')[0].trim(); }
  function unitFor(f){ if(/price/i.test(f.id)) return '$'; if(f.id==='areaPlot') return 'сот.'; if(f.id==='floor'||f.id==='floors') return ''; return 'м²'; }
  var ICONS = {
    chevron:'<img class="ff-chev" src="img/icons/chevron-down-gray.svg" width="13" height="13" alt="">',
    chevronUp:'<img src="img/icons/chevron-up.svg" width="13" height="13" alt="">',
    chevronDn:'<img src="img/icons/chevron-down.svg" width="13" height="13" alt="">',
    pin:'<img class="fk-ic-pin" src="img/icons/pin.svg" width="18" height="18" alt="">',
    sliders:'<img src="img/icons/sliders.svg" width="17" height="17" alt="">',
    reset:'<img src="img/icons/reset.svg" width="14" height="14" alt="">',
    x:'<img src="img/icons/close.svg" width="13" height="13" alt="">',
    chipX:'<img src="img/icons/chip-x.svg" width="9" height="9" alt="">',
    check:'<img src="img/icons/check-white.svg" width="11" height="11" alt="">',
    drill:'<img class="fk-locrow__drill" src="img/icons/arrow-right.svg" width="15" height="15" alt="">'
  };

  function mount(root, opts) {
    opts = opts || {};
    var state = Object.assign({
      deal:'Купити', category:'Квартири', currency:'USD', priceFrom:'', priceTo:'',
      rooms:[], baths:[], tags:[], ranges:{}, selects:{}, addOpen:false, page:1, openSel:null,
      // пікер локацій
      location:'', locOpen:false, locMode:'local', locCat:'all', locSel:[], locPath:[], chipVisible:99
    }, opts.initial || {});

    function snapshot(){ return JSON.parse(JSON.stringify(state)); }
    function notify(){ if(opts.onChange) opts.onChange(snapshot()); }
    function dealWord(){ return state.deal==='Купити' ? 'Продаж' : 'Оренда'; }
    function h1(){ return dealWord()+' '+CAT_GEN[state.category]+' в Одесі — Сторінка '+state.page; }
    function crumbs(){ var a=[{label:state.category}]; if(state.rooms.length===1 && (state.category==='Квартири'||state.category==='Будинки')) a.push({label: state.rooms[0]==='5+'?'5+ кімнат':state.rooms[0]+'-кімнатні'}); return a; }
    function addCount(){ var n=state.rooms.length+state.baths.length+state.tags.length; Object.keys(state.ranges).forEach(function(k){var r=state.ranges[k]; if(r&&(r.from||r.to)) n++;}); Object.keys(state.selects).forEach(function(k){ n+=(state.selects[k]||[]).length; }); return n; }

    // ── пікер локацій (логіка з головної) ──────────────────────────────
    function kindOf(label){
      for(var k in LOCDATA){ if(LOCDATA[k].some(function(r){return r[0]===label;})) return k; }
      for(var i=0;i<COUNTRIES.length;i++){ if(COUNTRIES[i][0]===label) return 'country'; }
      for(var rk in REGIONS){ if(REGIONS[rk].some(function(r){return r[0]===label;})) return 'region'; }
      for(var ck in CITIES){ if(CITIES[ck].some(function(r){return r[0]===label;})) return 'city'; }
      return 'district';
    }
    function searchIndex(){
      var out=[];
      COUNTRIES.forEach(function(c){ out.push({label:c[0],sub:'Країна',count:c[1],group:'Країни',gorder:0}); });
      Object.keys(REGIONS).forEach(function(k){ REGIONS[k].forEach(function(r){ out.push({label:r[0],sub:'Регіон',count:r[1],group:'Регіони',gorder:1}); }); });
      Object.keys(CITIES).forEach(function(k){ CITIES[k].forEach(function(c){ out.push({label:c[0],sub:'Місто, '+k,count:c[2],group:'Міста',gorder:2}); }); });
      var T={district:['Район','Райони',3],street:['Вулиця','Вулиці',4],micro:['Мікрорайон','Мікрорайони',5],complex:['ЖК','Комплекси',6],developer:['Забудовник','Девелопери',7]};
      Object.keys(T).forEach(function(k){ LOCDATA[k].forEach(function(r){ out.push({label:r[0],sub:r[1]?T[k][0]+', '+r[1]:T[k][0],count:r[2],group:T[k][1],gorder:T[k][2]}); }); });
      return out;
    }
    function hl(label,q){ var i=label.toLowerCase().indexOf(q); if(i<0||!q) return {pre:label,mid:'',post:''}; return {pre:label.slice(0,i),mid:label.slice(i,i+q.length),post:label.slice(i+q.length)}; }
    function locRows(){
      var q=(state.location||'').trim().toLowerCase();
      if(q){
        var hits=searchIndex().filter(function(r){ return r.label.toLowerCase().includes(q); });
        hits.sort(function(a,b){ return a.gorder-b.gorder || a.label.toLowerCase().indexOf(q)-b.label.toLowerCase().indexOf(q) || b.count-a.count; });
        var rows=[]; var lastG=null;
        hits.forEach(function(r){ if(r.group!==lastG){ rows.push({header:true,label:r.group}); lastG=r.group; } rows.push(Object.assign({},r,{selectable:true},hl(r.label,q))); });
        return rows;
      }
      if(state.locMode==='geo'){
        var p=state.locPath||[];
        if(p.length===0) return COUNTRIES.map(function(c){ return {label:c[0],sub:'',count:c[1],selectable:!REGIONS[c[0]]}; });
        if(p.length===1) return (REGIONS[p[0]]||[]).map(function(r){ return {label:r[0],sub:'',count:r[1],selectable:!CITIES[r[0]]}; });
        return (CITIES[p[1]]||[]).map(function(c){ return {label:c[0],sub:'',count:c[2],selectable:true}; });
      }
      var list = state.locCat==='all' ? [].concat(LOCDATA.district, LOCDATA.complex) : (LOCDATA[state.locCat]||[]);
      return list.map(function(r){ return {label:r[0],sub:r[1],count:r[2],selectable:true}; });
    }
    function onLocRow(row){ if(row.selectable){ toggleLocItem(row.label); return; } state.locPath=(state.locPath||[]).concat([row.label]); render(); }
    function toggleLocItem(label){ state.locSel = state.locSel.indexOf(label)>-1 ? state.locSel.filter(function(x){return x!==label;}) : state.locSel.concat([label]); state.location=''; state.chipVisible=99; render(); }
    function removeLocChip(label){ state.locSel = state.locSel.filter(function(x){return x!==label;}); state.chipVisible=99; render(); }

    function locChipsHTML(){
      var vis = Math.min(state.chipVisible, state.locSel.length);
      var hidden = state.locSel.length - vis;
      return state.locSel.slice(0, vis).map(function(l){
        return '<span class="fk-chip"><span class="fk-chip__kind">'+esc(KIND[kindOf(l)]||'')+'</span><span class="fk-chip__label">'+esc(l)+'</span>'+
          '<button type="button" class="fk-chip__x" data-action="loc-rm" data-val="'+esc(l)+'" aria-label="Прибрати">'+ICONS.chipX+'</button></span>';
      }).join('') + (hidden>0 ? '<span class="fk-chip-more" data-action="loc-more">+'+hidden+'</span>' : '');
    }
    function locField(){
      var vis = Math.min(state.chipVisible, state.locSel.length);
      var ph = state.locSel.length ? (vis < state.locSel.length ? '' : 'Додати ще…') : 'Місто, район, вулиця або ЖК…';
      return '<div class="fk-loc">'+
        '<div class="fk-field fk-loc__field'+(state.locOpen?' is-open':'')+'" data-action="loc-field">'+
          ICONS.pin+'<span class="fk-chips">'+locChipsHTML()+'</span>'+
          '<input class="fk-in fk-loc__in" data-focus="location" data-action="location" type="text" value="'+esc(state.location)+'" placeholder="'+esc(ph)+'" autocomplete="off">'+
          '<img class="fk-ic-cd" src="img/icons/chevron-down.svg" width="14" height="14" alt="">'+
        '</div>'+
        (state.locOpen ? locPop() : '')+
      '</div>';
    }
    function locPop(){
      var q=(state.location||'').trim();
      var tabs = '<div class="fk-tabs">'+
        '<button type="button" class="fk-tab'+(state.locMode==='geo'?' is-on':'')+'" data-action="loc-mode" data-val="geo">Країна / регіон / місто</button>'+
        '<button type="button" class="fk-tab'+(state.locMode!=='geo'?' is-on':'')+'" data-action="loc-mode" data-val="local">Локація</button></div>';
      var cats='';
      if(state.locMode!=='geo' && !q) cats='<div class="fk-cats">'+LOC_CATS.map(function(c){ return '<button type="button" class="fk-cat'+(state.locCat===c[0]?' is-on':'')+'" data-action="loc-cat" data-val="'+c[0]+'">'+esc(c[1])+'</button>'; }).join('')+'</div>';
      var crumbs='';
      if(state.locMode==='geo' && !q){
        var cr=[{label:'Усі країни',idx:0}].concat((state.locPath||[]).map(function(seg,i){ return {label:seg,idx:i+1}; }));
        crumbs='<div class="fk-crumbs">'+cr.map(function(c){ return '<span class="fk-crumb" data-action="loc-crumb" data-val="'+c.idx+'">'+esc(c.label)+'</span><span class="fk-crumb-sep">›</span>'; }).join('')+'</div>';
      }
      var list = '<div class="fk-list">'+locRows().map(function(r){
        if(r.header) return '<div class="fk-loc-head">'+esc(r.label)+'</div>';
        var checked = state.locSel.indexOf(r.label)>-1;
        var box = r.selectable ? '<span class="fk-box'+(checked?' is-checked':'')+'">'+(checked?'<img src="img/icons/check-white.svg" width="12" height="12" alt="">':'')+'</span>' : '';
        var pre = r.pre!==undefined ? r.pre : r.label;
        var lbl = '<span class="fk-locrow__label"><span>'+esc(pre)+'</span>'+(r.mid?'<span class="hl">'+esc(r.mid)+'</span>':'')+(r.post?'<span>'+esc(r.post)+'</span>':'')+(r.sub?'<span class="sub">, '+esc(r.sub)+'</span>':'')+'</span>';
        var cnt = '<span class="fk-locrow__count">'+fmtNum(r.count)+'</span>';
        var drill = (!r.selectable) ? ICONS.drill : '';
        return '<label class="fk-locrow" data-action="loc-row" data-val="'+esc(r.label)+'">'+box+lbl+cnt+drill+'</label>';
      }).join('')+'</div>';
      return '<div class="fk-pop fk-loc__pop">'+tabs+cats+crumbs+list+'</div>';
    }
    // згортання чипів локації за шириною поля
    var fitQueued=false;
    function queueFit(){ if(fitQueued) return; fitQueued=true; requestAnimationFrame(function(){ fitQueued=false; fit(); }); }
    function fit(){
      var fieldEl = root.querySelector('.fk-loc__field'); if(!fieldEl) return;
      var vis = Math.min(state.chipVisible, state.locSel.length);
      if(fieldEl.scrollWidth > fieldEl.clientWidth + 1 && vis > 1){ state.chipVisible = Math.max(1, vis - 1); render(); }
    }

    function dlAttr(id, side){ return DATALISTS[id] ? ' list="dl-'+id+'-'+side+'" autocomplete="off"' : ' autocomplete="off"'; }
    function rangeField(f){
      var r = state.ranges[f.id] || {};
      return '<div class="ff-num">'+
        '<input class="ff-in" data-focus="r:'+f.id+':from" data-range="'+f.id+'" data-side="from"'+dlAttr(f.id,'from')+' value="'+esc(r.from||'')+'" placeholder="від" inputmode="numeric">'+
        '<span class="ff-dash">–</span>'+
        '<input class="ff-in" style="text-align:right" data-focus="r:'+f.id+':to" data-range="'+f.id+'" data-side="to"'+dlAttr(f.id,'to')+' value="'+esc(r.to||'')+'" placeholder="до" inputmode="numeric"></div>';
    }
    function multiSelect(f){
      var arr = state.selects[f.id] || [], open = state.openSel===f.id;
      var summary = arr.length ? arr.join(', ') : f.options[0];
      var panel = '';
      if(open){ panel = '<div class="ff-ms-panel">'+f.options.slice(1).map(function(o){ var on=arr.indexOf(o)>-1; return '<div class="ff-ms-opt'+(on?' on':'')+'" data-action="opt" data-sel="'+f.id+'" data-val="'+esc(o)+'"><span class="ff-ms-box">'+(on?ICONS.check:'')+'</span>'+esc(o)+'</div>'; }).join('')+'</div>'; }
      return '<div class="ff-ms"><button type="button" class="ff-ms-btn'+(arr.length?' has-val':'')+'" data-action="sel-toggle" data-sel="'+f.id+'"><span>'+esc(summary)+'</span>'+ICONS.chevron+'</button>'+panel+'</div>';
    }
    function addField(f){
      var inner;
      if(f.kind==='rooms') inner='<div class="ff-chips">'+ROOM_OPTS.map(function(r){ return '<button type="button" class="ff-chip'+(state.rooms.indexOf(r)>-1?' active':'')+'" data-action="room" data-val="'+r+'">'+r+'</button>'; }).join('')+'</div>';
      else if(f.kind==='baths') inner='<div class="ff-chips">'+BATH_OPTS.map(function(b){ return '<button type="button" class="ff-chip'+(state.baths.indexOf(b)>-1?' active':'')+'" data-action="bath" data-val="'+b+'">'+b+'</button>'; }).join('')+'</div>';
      else if(f.kind==='tags') inner='<div class="ff-chips">'+f.tags.map(function(t){ return '<button type="button" class="ff-chip'+(state.tags.indexOf(t)>-1?' active':'')+'" data-action="tag" data-val="'+esc(t)+'">'+esc(t)+'</button>'; }).join('')+'</div>';
      else if(f.kind==='select') inner=multiSelect(f);
      else inner=rangeField(f);
      var full = (f.kind==='rooms'||f.kind==='baths') ? ' ff-field-span2' : ((f.kind==='tags') ? ' ff-field-full' : '');
      return '<div class="ff-add-field'+full+'"><div class="ff-fieldlabel">'+esc(f.label)+'</div>'+inner+'</div>';
    }
    function datalists(){
      return Object.keys(DATALISTS).map(function(id){ return ['from','to'].map(function(side){ return '<datalist id="dl-'+id+'-'+side+'">'+DATALISTS[id][side].map(function(v){ return '<option value="'+v+'"></option>'; }).join('')+'</datalist>'; }).join(''); }).join('');
    }
    function selectedChips(){
      var out=[{label:state.deal,rm:'deal'},{label:state.category,rm:'category'}];
      state.locSel.forEach(function(l){ out.push({label:l,rm:'loc:'+l}); });
      if(!state.locSel.length && state.location.trim()) out.push({label:state.location.trim(),rm:'location'});
      if(state.priceFrom||state.priceTo){ var cu=state.currency; var t=state.priceFrom&&state.priceTo?'Ціна '+state.priceFrom+'–'+state.priceTo+' '+cu:(state.priceFrom?'Ціна від '+state.priceFrom+' '+cu:'Ціна до '+state.priceTo+' '+cu); out.push({label:t,rm:'price'}); }
      state.rooms.forEach(function(r){ out.push({label:r==='5+'?'5+ кімн.':r+' кімн.',rm:'room:'+r}); });
      state.baths.forEach(function(b){ out.push({label:b==='5+'?'5+ санв.':b+' санв.',rm:'bath:'+b}); });
      fieldsFor(state.category).forEach(function(f){
        if(f.kind==='range'){ var r=state.ranges[f.id]||{}, fr=(r.from||'').toString().trim(), to=(r.to||'').toString().trim(); if(fr||to){ var lbl=cleanLabel(f.label), u=unitFor(f), us=u?' '+u:''; out.push({label: fr&&to?lbl+' '+fr+'–'+to+us:(fr?lbl+' від '+fr+us:lbl+' до '+to+us), rm:'range:'+f.id}); } }
        else if(f.kind==='select'){ (state.selects[f.id]||[]).forEach(function(v){ out.push({label:v,rm:'select:'+f.id+':'+v}); }); }
      });
      state.tags.forEach(function(t){ out.push({label:t,rm:'tag:'+t}); });
      return out;
    }

    function render(){
      var cr=crumbs();
      var dealSel='<select data-action="deal">'+DEALS.map(function(d){return '<option'+(d===state.deal?' selected':'')+'>'+d+'</option>';}).join('')+'</select>';
      var catSel='<select data-action="category">'+CATEGORIES.map(function(c){return '<option'+(c===state.category?' selected':'')+'>'+c+'</option>';}).join('')+'</select>';
      var curSel='<select data-action="currency">'+CURRENCIES.map(function(c){return '<option'+(c===state.currency?' selected':'')+'>'+c+'</option>';}).join('')+'</select>';
      var logo = opts.logoSrc ? '<a href="'+esc(opts.homeHref||'/')+'"><img src="'+esc(opts.logoSrc)+'" alt="FAKTOR — Головна"></a>' : '<a href="'+esc(opts.homeHref||'/')+'">Головна</a>';

      var html = datalists() +
        '<div class="ff-crumbs">'+logo+ cr.map(function(c,i){ return '<span class="sep">›</span><a href="#"'+(i===cr.length-1?' class="current"':'')+'>'+esc(c.label)+'</a>'; }).join('')+'</div>'+
        '<h1 class="ff-h1">'+esc(h1())+'</h1>'+
        '<div class="ff-mainrow">'+
          '<div class="ff-seg ff-seg--deal">'+dealSel+ICONS.chevron+'</div>'+
          '<div class="ff-seg ff-seg--cat">'+catSel+ICONS.chevron+'</div>'+
          locField()+
          '<div class="ff-price">'+
            '<div class="ff-seg ff-seg--cur">'+curSel+ICONS.chevron+'</div>'+
            '<span class="ff-price-div"></span>'+
            '<input class="ff-in" data-focus="price-from" data-action="price-from" list="dl-price-from" autocomplete="off" value="'+esc(state.priceFrom)+'" placeholder="Ціна від" inputmode="numeric">'+
            '<span class="ff-price-div"></span>'+
            '<input class="ff-in" data-focus="price-to" data-action="price-to" list="dl-price-to" autocomplete="off" value="'+esc(state.priceTo)+'" placeholder="Ціна до" inputmode="numeric"></div>'+
          '<button class="ff-more" data-action="toggle-add">'+ICONS.sliders+'Фільтри'+(addCount()?'<span class="ff-badge">'+addCount()+'</span>':'')+'</button>'+
          '<button class="ff-search" data-action="search">Знайти</button>'+
        '</div>'+
        '<div class="ff-controls">'+
          '<button class="ff-reset" data-action="reset">'+ICONS.reset+'Скинути всі фільтри</button>'+
        '</div>'+
        '<div class="ff-add'+(state.addOpen?' open':'')+'"><div class="ff-add-inner"><div class="ff-addgrid">'+fieldsFor(state.category).map(addField).join('')+'</div></div></div>'+
        (selectedChips().length?'<div class="ff-selected"><span class="ff-selected-label">Обрані фільтри:</span>'+selectedChips().map(function(c){ return '<span class="ff-selchip">'+esc(c.label)+'<button data-action="remove" data-rm="'+esc(c.rm)+'">'+ICONS.x+'</button></span>'; }).join('')+'</div>':'')+
        '<div class="ff-il-title">Популярні підбірки</div><div class="ff-il">'+((INTERLINKS[state.category]||{})[state.deal==='Купити'?'buy':'rent']||[]).map(function(t){ return '<a href="#" data-action="interlink" data-val="'+esc(t)+'">'+esc(t)+'</a>'; }).join('')+'</div>';

      var ae=document.activeElement, fk=ae&&ae.getAttribute&&ae.getAttribute('data-focus'), pos=fk?ae.selectionStart:null;
      root.innerHTML = html;
      if(fk){ var n=root.querySelector('[data-focus="'+fk+'"]'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }
      queueFit();
      notify();
    }

    function setCategory(c){ state.category=c; state.rooms=[]; state.baths=[]; state.tags=[]; state.ranges={}; state.selects={}; state.openSel=null; state.page=1; render(); if(opts.onCategory) opts.onCategory(snapshot()); }
    function toggleSel(id,v){ var a=(state.selects[id]||[]).slice(), i=a.indexOf(v); if(i>-1) a.splice(i,1); else a.push(v); state.selects[id]=a; }

    // SEO-перелінки: застосувати готовий набір фільтрів і пошукати
    function applyInterlink(label){
      var rm=label.match(/(\d)\s*-?\s*кімнат/);
      if(rm && state.rooms.indexOf(rm[1])<0) state.rooms=state.rooms.concat([rm[1]]);
      if(/Оренда|Подобова/.test(label)) state.deal='Оренда';
      if(/біля моря|Вид на море/.test(label) && state.tags.indexOf('Вид на море')<0){
        var hasTag = fieldsFor(state.category).some(function(f){ return f.kind==='tags' && f.tags.indexOf('Вид на море')>-1; });
        if(hasTag) state.tags=state.tags.concat(['Вид на море']);
      }
      var locMap={'Аркаді':'Аркадія','Фонтанка':'Фонтанка','Совіньйон':'Совіньйон','Приморський район':'Приморський','Київський район':'Київський','Малиновський район':'Молдаванка'};
      Object.keys(locMap).forEach(function(k){ if(label.indexOf(k)>-1 && state.locSel.indexOf(locMap[k])<0){ state.locSel=state.locSel.concat([locMap[k]]); state.chipVisible=99; } });
      state.page=1; render();
      if(opts.onSearch) opts.onSearch(snapshot());
    }

    function removeChip(rm){
      if(rm==='deal') state.deal='Купити';
      else if(rm==='category'){ setCategory('Квартири'); return; }
      else if(rm==='location') state.location='';
      else if(rm.indexOf('loc:')===0){ removeLocChip(rm.slice(4)); return; }
      else if(rm==='price'){ state.priceFrom=''; state.priceTo=''; }
      else if(rm.indexOf('room:')===0) state.rooms=state.rooms.filter(function(x){return x!==rm.slice(5);});
      else if(rm.indexOf('bath:')===0) state.baths=state.baths.filter(function(x){return x!==rm.slice(5);});
      else if(rm.indexOf('tag:')===0) state.tags=state.tags.filter(function(x){return x!==rm.slice(4);});
      else if(rm.indexOf('range:')===0) delete state.ranges[rm.slice(6)];
      else if(rm.indexOf('select:')===0){ var p=rm.slice(7), idx=p.indexOf(':'); toggleSel(p.slice(0,idx), p.slice(idx+1)); }
      render();
    }

    root.addEventListener('click', function(e){
      var t=e.target.closest('[data-action]'); if(!t) return;
      var a=t.getAttribute('data-action');
      // пікер локацій
      if(a==='loc-field'){ if(e.target.closest('.fk-chip__x')||e.target.closest('.fk-chip-more')) return; if(!state.locOpen){ state.locOpen=true; render(); var inp=root.querySelector('.fk-loc__in'); if(inp) inp.focus(); } return; }
      if(a==='loc-rm'){ e.stopPropagation(); removeLocChip(t.getAttribute('data-val')); return; }
      if(a==='loc-more'){ e.stopPropagation(); state.locOpen=true; render(); return; }
      if(a==='loc-mode'){ state.locMode=t.getAttribute('data-val'); state.locPath=[]; state.location=''; render(); return; }
      if(a==='loc-cat'){ state.locCat=t.getAttribute('data-val'); render(); return; }
      if(a==='loc-crumb'){ state.locPath=state.locPath.slice(0, Number(t.getAttribute('data-val'))); render(); return; }
      if(a==='loc-row'){ var lbl=t.getAttribute('data-val'); var data=locRows().filter(function(r){return !r.header;}).find(function(r){return r.label===lbl;}); if(data) onLocRow(data); return; }
      // решта
      if(a==='search'){ e.preventDefault(); if(opts.onSearch) opts.onSearch(snapshot()); return; }
      if(a==='interlink'){ e.preventDefault(); applyInterlink(t.getAttribute('data-val')); return; }
      if(a==='toggle-add'){ state.addOpen=!state.addOpen; render(); }
      else if(a==='reset'){ Object.assign(state,{deal:'Купити',category:'Квартири',currency:'USD',location:'',priceFrom:'',priceTo:'',rooms:[],baths:[],tags:[],ranges:{},selects:{},openSel:null,page:1,locSel:[],locPath:[],locMode:'local',locCat:'all',chipVisible:99}); render(); if(opts.onReset) opts.onReset(snapshot()); if(opts.onCategory) opts.onCategory(snapshot()); }
      else if(a==='room'){ var r=t.getAttribute('data-val'); state.rooms=state.rooms.indexOf(r)>-1?state.rooms.filter(function(x){return x!==r;}):state.rooms.concat([r]); render(); }
      else if(a==='bath'){ var bv=t.getAttribute('data-val'); state.baths=state.baths.indexOf(bv)>-1?state.baths.filter(function(x){return x!==bv;}):state.baths.concat([bv]); render(); }
      else if(a==='tag'){ var g=t.getAttribute('data-val'); state.tags=state.tags.indexOf(g)>-1?state.tags.filter(function(x){return x!==g;}):state.tags.concat([g]); render(); }
      else if(a==='sel-toggle'){ var id=t.getAttribute('data-sel'); state.openSel=state.openSel===id?null:id; render(); }
      else if(a==='opt'){ toggleSel(t.getAttribute('data-sel'), t.getAttribute('data-val')); render(); }
      else if(a==='remove'){ removeChip(t.getAttribute('data-rm')); }
    });
    root.addEventListener('input', function(e){
      var t=e.target, a=t.getAttribute('data-action'), rng=t.getAttribute('data-range');
      if(a==='location'){ state.location=t.value; state.locOpen=true; }
      else if(a==='price-from'){ var df=(t.value||'').replace(/\D/g,''); state.priceFrom=df?fmtNum(df):''; }
      else if(a==='price-to'){ var dt=(t.value||'').replace(/\D/g,''); state.priceTo=dt?fmtNum(dt):''; }
      else if(rng){ var side=t.getAttribute('data-side'); state.ranges[rng]=Object.assign({},state.ranges[rng], side==='from'?{from:t.value}:{to:t.value}); }
      else return;
      render();
    });
    root.addEventListener('focusin', function(e){
      if(e.target.getAttribute && e.target.getAttribute('data-action')==='location' && !state.locOpen){ state.locOpen=true; render(); }
    });
    root.addEventListener('change', function(e){
      var t=e.target, a=t.getAttribute('data-action');
      if(a==='deal'){ state.deal=t.value; render(); }
      else if(a==='category') setCategory(t.value);
      else if(a==='currency'){ state.currency=t.value; render(); }
    });
    document.addEventListener('mousedown', function(e){
      var changed=false;
      if(state.openSel && !(e.target.closest && e.target.closest('.ff-ms'))){ state.openSel=null; changed=true; }
      if(state.locOpen && !(e.target.closest && e.target.closest('.fk-loc'))){ state.locOpen=false; changed=true; }
      if(changed) render();
    });
    window.addEventListener('resize', function(){ state.chipVisible=99; render(); });

    render();
    if(opts.onCategory) opts.onCategory(snapshot());   // початкова синхронізація лістингу з категорією (можливо з URL)
    return { getState: snapshot, setState: function(s){ Object.assign(state,s); render(); } };
  }

  // ── Ініціалізація ──────────────────────────────────────────────────
  var root = document.getElementById('ff-catalog-filters');
  if (!root) return;
  // прихід із головної (index.html → app.js): ?loc=..|.., ?type=.., ?from/to, ?cur, ?filter=novobud
  var params = new URLSearchParams(window.location.search);
  var initial = {};
  var loc = params.get('loc');
  if (loc) initial.locSel = loc.split('|').filter(Boolean);
  var type = params.get('type');
  if (type) {
    if (/Оренда/.test(type)) initial.deal = 'Оренда';
    if (/кімнат/.test(type)) initial.category = 'Кімнати';
    else if (/будинк/.test(type)) initial.category = 'Будинки';
    else if (/земл/.test(type)) initial.category = 'Земля';
    else if (/комерц/.test(type)) initial.category = 'Комерція';
  }
  if (params.get('cur')) initial.currency = params.get('cur');
  var from = params.get('from'), to = params.get('to');
  if (from) initial.priceFrom = String(from).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (to) initial.priceTo = String(to).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (params.get('filter') === 'novobud') initial.tags = ['Квартири в новобудові'];

  window.FaktorCatalogFilters = mount(root, {
    logoSrc: 'img/logos/Faktor Sign Navi.svg',
    homeHref: 'index.html',
    initial: initial,
    onChange: function (state) { /* тут можна оновлювати URL / прев'ю результатів */ },
    onCategory: function (state) { if (window.FaktorCatalog) window.FaktorCatalog.setCategory(state.category); },
    onSearch: function (state) { if (window.FaktorCatalog) window.FaktorCatalog.setCategory(state.category); if (window.toast) window.toast('Шукаємо пропозиції за фільтрами…'); },
    onReset:  function (state) { if (window.toast) window.toast('Фільтри скинуто'); }
  });
})();
