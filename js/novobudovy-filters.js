/* ============================================================
   FAKTOR — фільтри КАТАЛОГУ НОВОБУДОВ (ЖК)
   Самодостатній модуль, склонований із js/catalog-filters.js та
   спеціалізований під новобудови: головний рядок (тип угоди ·
   тип нерухомості · ЛОКАЦІЯ · ВАЛЮТА+ціна · «Фільтри» · «Знайти»),
   розкривна панель ЖК-фільтрів (Категорія комплексу, Клас житла,
   Стан, Рік здачі, Опалення, Стіни, Поверховість, Площа, Ціна за м²,
   Забудовник, Кількість кімнат, Особливості), обрані чипи та ЖК-підбірки.

   Рендериться повністю у #ff-novobudovy-filters. Стилі — спільні
   css/catalog-filters.css + css/style.css (.fk-loc) + кілька правил
   у css/novobudovy.css. Палітра — css/tokens.css.

   Колбеки onSearch/onChange/onReset зв'язані з лістингом
   (js/novobudovy.js) через window.FaktorNovobudovy.
   Окремий модуль (не чіпає catalog-filters.js), за рішенням замовника.
   ============================================================ */
(function () {
  'use strict';
  // Тип нерухомості в межах новобудов (а не категорія каталогу)
  var PTYPES = ['Усі типи', 'Квартири', 'Апартаменти', 'Будинки', 'Комерція'];
  var DEALS = ['Купити'];                          // новобудови — лише продаж від забудовника
  var CURRENCIES = ['USD', 'EUR', 'UAH'];
  var ROOM_OPTS = ['1', '2', '3', '4', '5+'];

  // довідники ЖК-фільтрів (із хендофу «Каталог новобудов FAKTOR»)
  var CATEGORY = ['Будь-яка', 'Житловий комплекс', 'Апарт-комплекс', 'Клубний будинок', 'Малоповерхова забудова', 'Таунхауси', 'Котеджне містечко', 'Вілли та резиденції', 'МФК', 'Апарт-готель', 'Курортний комплекс'];
  var HCLASS = ['Будь-який', 'Економ', 'Комфорт', 'Бізнес', 'Преміум / Люкс', 'Клас A', 'Клас B', 'Клас C', 'Курортний'];
  var CONDITION = ['Будь-який', 'Чорнова', 'Передчистова', 'З ремонтом', 'Під ключ'];
  var HEATING = ['Будь-яке', 'Централізоване', 'Автономне', 'Індивідуальне', 'Тепла підлога'];
  var WALLS = ['Будь-які', 'Цегла', 'Моноліт', 'Моноліт-цегла', 'Панель', 'Газоблок'];
  var STATUS = ['Будь-який', 'Будується', 'Здається', 'Зданий'];
  var DEVELOPERS = ['Будь-який', 'KADORR Group', 'Гефест', 'Stikon', 'Будова', 'Інкор Груп', 'Альтаїр', 'Рідна Оселя'];
  var YEAR_OPTS = ['2025', '2026', '2027', '2028', '2029+'];
  var FEATURES = ['Генератор', 'Резервне живлення', 'Укриття', 'єОселя (3%/7%)', 'єВідновлення', 'Розтермінування', 'Автономне опалення', 'Закрита територія', 'Підземний паркінг', 'Охорона / Відео', 'Консьєрж / Ресепшн', 'Зарядка електрокарів', 'Фітнес / Басейн', 'Дитячий майданчик', 'Панорамний вид', 'Перша лінія моря', 'Комерція в будинку', 'Двір без машин', 'Вид на море', 'Вид на парк', 'Біля школи', 'Біля дитсадка'];

  // підказки «від / до» (datalist) для діапазонних полів
  var DATALISTS = {
    price:     { from: ['30 000', '50 000', '70 000', '100 000'], to: ['120 000', '200 000', '350 000', '500 000'] },
    pricePerM: { from: ['600', '800', '1000', '1200'], to: ['1500', '2000', '2500', '3000'] },
    area:      { from: ['30', '40', '50', '60'], to: ['80', '100', '150', '200'] },
    floors:    { from: ['1', '5', '9'], to: ['16', '24', '30'] }
  };

  // набір ЖК-фільтрів у розкривній панелі (рік здачі — чипи-роки)
  var FIELDS = [
    { id: 'category',  kind: 'select', label: 'Категорія комплексу', options: CATEGORY },
    { id: 'ptype2',    kind: 'select', label: 'Тип об’єкта', options: ['Будь-який', 'Квартира', 'Пентхаус', 'Студія', 'Апартаменти', 'Дім', 'Таунхаус', 'Котедж', 'Вілла', 'Офісне', 'Торгове'] },
    { id: 'hclass',    kind: 'select', label: 'Клас житла', options: HCLASS },
    { id: 'condition', kind: 'select', label: 'Стан', options: CONDITION },
    { id: 'years',     kind: 'years',  label: 'Рік здачі' },
    { id: 'status',    kind: 'select', label: 'Статус будівництва', options: STATUS },
    { id: 'floors',    kind: 'range',  label: 'Поверховість' },
    { id: 'heating',   kind: 'select', label: 'Опалення', options: HEATING },
    { id: 'walls',     kind: 'select', label: 'Матеріал стін', options: WALLS },
    { id: 'area',      kind: 'range',  label: 'Площа, м²' },
    { id: 'pricePerM', kind: 'range',  label: 'Ціна за м², $' },
    { id: 'developer', kind: 'select', label: 'Забудовник', options: DEVELOPERS },
    { id: 'rooms',     kind: 'rooms',  label: 'Кількість кімнат' },
    { id: 'features',  kind: 'tags',   label: 'Особливості', tags: FEATURES }
  ];

  // ЖК-підбірки (популярні запити з хендофу). buy/rent однакові — є лише продаж.
  var INTERLINK_NB = ['Елітні ЖК', 'Біля моря', 'З ремонтом', 'Розтермінування', 'єОселя', 'З укриттям', 'Клубні будинки', 'Апартаменти', 'Здані ЖК', 'Однокімнатні'];

  // ── Дані пікера локацій (ідентичні головній / каталогу) ─────────────
  var LOC_CATS = [['all', 'Усі'], ['district', 'Райони'], ['street', 'Вулиці'], ['micro', 'Мікрорайони'], ['complex', 'ЖК'], ['developer', 'Забудовники']];
  var KIND = { district: 'район', street: 'вулиця', micro: 'мікрорайон', complex: 'жк', developer: 'забудовник', city: 'місто', region: 'регіон', country: 'країна' };
  var COUNTRIES = [['Україна', 482], ['Польща', 0], ['Німеччина', 0], ['Іспанія', 0], ['Туреччина', 0], ['ОАЕ', 0], ['Кіпр', 0]];
  var REGIONS = { 'Україна': [['Одеська область', 90], ['Київська область', 0], ['Львівська область', 0], ['Миколаївська область', 0], ['Харківська область', 0]] };
  var CITIES = { 'Одеська область': [['Одеса', '', 482], ['Фонтанка', '', 72], ['Лиманка', '', 205], ['Авангард', '', 58], ['Чорноморськ', '', 12], ['Теплодар', '', 3], ['Таїрово, смт', '', 41]] };
  var LOCDATA = {
    district: [['Приморський', 'Одеса', 142], ['Київський', 'Одеса', 96], ['Хаджибейський', 'Одеса', 51], ['Пересипський', 'Одеса', 28], ['Малиновський', 'Одеса', 19], ['Овідіопольський', 'Лиманка', 34]],
    street: [['Французький бульвар', 'Приморський', 28], ['вул. Генуезька', 'Приморський', 24], ['вул. Канатна', 'Приморський', 12], ['Гагарінське плато', 'Приморський', 18], ['Люстдорфська дорога', 'Київський', 22], ['вул. Фонтанська дорога', 'Приморський', 16], ['вул. Академіка Корольова', 'Київський', 9], ['вул. Архітекторська', 'Київський', 7], ['проспект Небесної Сотні', 'Київський', 8], ['вул. Сахарова', 'Київський', 13]],
    micro: [['Аркадія', 'Приморський', 38], ['Фонтан', 'Приморський', 44], ['Таїрова', 'Київський', 31], ['Совіньйон', 'Овідіопольський', 12], ['Сьоме Небо', 'Київський', 9]],
    complex: [['ЖК Перший Французький', 'Київський', 1], ['ЖК Аркадія Сіті', 'Приморський', 1], ['ЖК Морська перлина', 'Приморський', 1], ['ЖК Sky Garden', 'Малиновський', 1], ['Клубний будинок Bunin', 'Приморський', 1], ['ЖК Перлинний квартал', 'Київський', 1]],
    developer: [['KADORR Group', '', 18], ['Гефест', '', 12], ['Stikon', '', 7], ['Будова', '', 5], ['Інкор Груп', '', 6], ['Альтаїр', '', 4], ['Рідна Оселя', '', 3]]
  };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function cleanLabel(l){ return l.split(',')[0].trim(); }
  function unitFor(f){ if(/price/i.test(f.id)) return '$'; if(f.id==='floors') return ''; return 'м²'; }
  var ICONS = {
    chevron:'<svg class="ff-chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5b6470" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
    pin:'<svg class="fk-ic-pin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.35-7-10a7 7 0 0 1 14 0c0 5.65-7 10-7 10z"/><circle cx="12" cy="11" r="2.5"/></svg>',
    sliders:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    reset:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    x:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chipX:'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>',
    drill:'<svg class="fk-locrow__drill" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'
  };

  function mount(root, opts) {
    opts = opts || {};
    var state = Object.assign({
      deal:'Купити', ptype:'Усі типи', currency:'USD', priceFrom:'', priceTo:'',
      rooms:[], tags:[], years:[], ranges:{}, selects:{}, addOpen:false, page:1, openSel:null,
      // пікер локацій
      location:'', locOpen:false, locMode:'local', locCat:'all', locSel:[], locPath:[], chipVisible:99
    }, opts.initial || {});

    function snapshot(){ return JSON.parse(JSON.stringify(state)); }
    function notify(){ if(opts.onChange) opts.onChange(snapshot()); }
    function h1(){
      var base = state.locSel.length ? 'Новобудови в ' + state.locSel.map(cleanLabel).join(', ')
        : (state.location.trim() ? 'Новобудови в ' + state.location.trim() : 'Новобудови Одеси');
      return base + (state.page>1 ? ' — Сторінка ' + state.page : '');
    }
    function crumbs(){ var a=[{label:'Новобудови'}]; if(state.ptype && state.ptype!=='Усі типи') a.push({label:state.ptype}); return a; }
    function addCount(){ var n=state.rooms.length+state.tags.length+state.years.length; Object.keys(state.ranges).forEach(function(k){var r=state.ranges[k]; if(r&&(r.from||r.to)) n++;}); Object.keys(state.selects).forEach(function(k){ n+=(state.selects[k]||[]).length; }); return n; }

    // ── пікер локацій (логіка з каталогу) ──────────────────────────────
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
          '<svg class="fk-ic-cd" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'+
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
        var box = r.selectable ? '<span class="fk-box'+(checked?' is-checked':'')+'">'+(checked?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>':'')+'</span>' : '';
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

    function dlAttr(id, side){ return DATALISTS[id] ? ' list="dln-'+id+'-'+side+'" autocomplete="off"' : ' autocomplete="off"'; }
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
      else if(f.kind==='years') inner='<div class="ff-chips">'+YEAR_OPTS.map(function(y){ return '<button type="button" class="ff-chip'+(state.years.indexOf(y)>-1?' active':'')+'" data-action="year" data-val="'+y+'">'+y+'</button>'; }).join('')+'</div>';
      else if(f.kind==='tags') inner='<div class="ff-chips">'+f.tags.map(function(t){ return '<button type="button" class="ff-chip'+(state.tags.indexOf(t)>-1?' active':'')+'" data-action="tag" data-val="'+esc(t)+'">'+esc(t)+'</button>'; }).join('')+'</div>';
      else if(f.kind==='select') inner=multiSelect(f);
      else inner=rangeField(f);
      var full = (f.kind==='rooms'||f.kind==='years') ? ' ff-field-span2' : ((f.kind==='tags') ? ' ff-field-full' : '');
      return '<div class="ff-add-field'+full+'"><div class="ff-fieldlabel">'+esc(f.label)+'</div>'+inner+'</div>';
    }
    function datalists(){
      return Object.keys(DATALISTS).map(function(id){ return ['from','to'].map(function(side){ return '<datalist id="dln-'+id+'-'+side+'">'+DATALISTS[id][side].map(function(v){ return '<option value="'+v+'"></option>'; }).join('')+'</datalist>'; }).join(''); }).join('');
    }
    function selectedChips(){
      var out=[];
      if(state.ptype && state.ptype!=='Усі типи') out.push({label:state.ptype,rm:'ptype'});
      state.locSel.forEach(function(l){ out.push({label:l,rm:'loc:'+l}); });
      if(!state.locSel.length && state.location.trim()) out.push({label:state.location.trim(),rm:'location'});
      if(state.priceFrom||state.priceTo){ var cu=state.currency; var t=state.priceFrom&&state.priceTo?'Ціна '+state.priceFrom+'–'+state.priceTo+' '+cu:(state.priceFrom?'Ціна від '+state.priceFrom+' '+cu:'Ціна до '+state.priceTo+' '+cu); out.push({label:t,rm:'price'}); }
      state.years.forEach(function(y){ out.push({label:'Здача '+y,rm:'year:'+y}); });
      state.rooms.forEach(function(r){ out.push({label:r==='5+'?'5+ кімн.':r+' кімн.',rm:'room:'+r}); });
      FIELDS.forEach(function(f){
        if(f.kind==='range'){ var r=state.ranges[f.id]||{}, fr=(r.from||'').toString().trim(), to=(r.to||'').toString().trim(); if(fr||to){ var lbl=cleanLabel(f.label), u=unitFor(f), us=u?' '+u:''; out.push({label: fr&&to?lbl+' '+fr+'–'+to+us:(fr?lbl+' від '+fr+us:lbl+' до '+to+us), rm:'range:'+f.id}); } }
        else if(f.kind==='select'){ (state.selects[f.id]||[]).forEach(function(v){ out.push({label:v,rm:'select:'+f.id+':'+v}); }); }
      });
      state.tags.forEach(function(t){ out.push({label:t,rm:'tag:'+t}); });
      return out;
    }

    function render(){
      var cr=crumbs();
      var dealSel='<select data-action="deal">'+DEALS.map(function(d){return '<option'+(d===state.deal?' selected':'')+'>'+d+'</option>';}).join('')+'</select>';
      var ptSel='<select data-action="ptype">'+PTYPES.map(function(c){return '<option'+(c===state.ptype?' selected':'')+'>'+c+'</option>';}).join('')+'</select>';
      var curSel='<select data-action="currency">'+CURRENCIES.map(function(c){return '<option'+(c===state.currency?' selected':'')+'>'+c+'</option>';}).join('')+'</select>';
      var logo = opts.logoSrc ? '<a href="'+esc(opts.homeHref||'/')+'"><img src="'+esc(opts.logoSrc)+'" alt="FAKTOR — Головна"></a>' : '<a href="'+esc(opts.homeHref||'/')+'">Головна</a>';

      var html = datalists() +
        '<div class="ff-crumbs">'+logo+ cr.map(function(c,i){ return '<span class="sep">›</span><a href="#"'+(i===cr.length-1?' class="current"':'')+'>'+esc(c.label)+'</a>'; }).join('')+'</div>'+
        '<h1 class="ff-h1">'+esc(h1())+'</h1>'+
        '<div class="ff-mainrow">'+
          '<div class="ff-seg ff-seg--deal">'+dealSel+ICONS.chevron+'</div>'+
          '<div class="ff-seg ff-seg--cat">'+ptSel+ICONS.chevron+'</div>'+
          locField()+
          '<div class="ff-price">'+
            '<div class="ff-seg ff-seg--cur">'+curSel+ICONS.chevron+'</div>'+
            '<span class="ff-price-div"></span>'+
            '<input class="ff-in" data-focus="price-from" data-action="price-from" list="dln-price-from" autocomplete="off" value="'+esc(state.priceFrom)+'" placeholder="Ціна від" inputmode="numeric">'+
            '<span class="ff-price-div"></span>'+
            '<input class="ff-in" data-focus="price-to" data-action="price-to" list="dln-price-to" autocomplete="off" value="'+esc(state.priceTo)+'" placeholder="Ціна до" inputmode="numeric"></div>'+
          '<button class="ff-more" data-action="toggle-add">'+ICONS.sliders+'Фільтри'+(addCount()?'<span class="ff-badge">'+addCount()+'</span>':'')+'</button>'+
          '<button class="ff-search" data-action="search">Знайти</button>'+
        '</div>'+
        '<div class="ff-controls">'+
          '<button class="ff-reset" data-action="reset">'+ICONS.reset+'Скинути всі фільтри</button>'+
        '</div>'+
        '<div class="ff-add'+(state.addOpen?' open':'')+'"><div class="ff-add-inner"><div class="ff-addgrid">'+FIELDS.map(addField).join('')+'</div></div></div>'+
        (selectedChips().length?'<div class="ff-selected"><span class="ff-selected-label">Обрані фільтри:</span>'+selectedChips().map(function(c){ return '<span class="ff-selchip">'+esc(c.label)+'<button data-action="remove" data-rm="'+esc(c.rm)+'">'+ICONS.x+'</button></span>'; }).join('')+'</div>':'')+
        '<div class="ff-il-title">Популярні запити</div><div class="ff-il">'+INTERLINK_NB.map(function(t){ return '<a href="#" data-action="interlink" data-val="'+esc(t)+'">'+esc(t)+'</a>'; }).join('')+'</div>';

      var ae=document.activeElement, fk=ae&&ae.getAttribute&&ae.getAttribute('data-focus'), pos=fk?ae.selectionStart:null;
      root.innerHTML = html;
      if(fk){ var n=root.querySelector('[data-focus="'+fk+'"]'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }
      queueFit();
      notify();
    }

    function toggleSel(id,v){ var a=(state.selects[id]||[]).slice(), i=a.indexOf(v); if(i>-1) a.splice(i,1); else a.push(v); state.selects[id]=a; }

    // ЖК-підбірки: застосувати готовий набір фільтрів і пошукати
    function applyInterlink(label){
      var setSel=function(id,v){ var a=(state.selects[id]||[]).slice(); if(a.indexOf(v)<0) a.push(v); state.selects[id]=a; };
      var addTag=function(t){ if(state.tags.indexOf(t)<0) state.tags=state.tags.concat([t]); };
      if(label==='Елітні ЖК') setSel('hclass','Преміум / Люкс');
      else if(label==='Біля моря') addTag('Перша лінія моря');
      else if(label==='З ремонтом'){ setSel('condition','З ремонтом'); setSel('condition','Під ключ'); }
      else if(label==='Розтермінування') addTag('Розтермінування');
      else if(label==='єОселя') addTag('єОселя (3%/7%)');
      else if(label==='З укриттям') addTag('Укриття');
      else if(label==='Клубні будинки') setSel('category','Клубний будинок');
      else if(label==='Апартаменти'){ state.ptype='Апартаменти'; }
      else if(label==='Здані ЖК') setSel('status','Зданий');
      else if(label==='Однокімнатні'){ if(state.rooms.indexOf('1')<0) state.rooms=state.rooms.concat(['1']); }
      state.page=1; render();
      if(opts.onSearch) opts.onSearch(snapshot());
    }

    function removeChip(rm){
      if(rm==='ptype') state.ptype='Усі типи';
      else if(rm==='location') state.location='';
      else if(rm.indexOf('loc:')===0){ removeLocChip(rm.slice(4)); return; }
      else if(rm==='price'){ state.priceFrom=''; state.priceTo=''; }
      else if(rm.indexOf('year:')===0) state.years=state.years.filter(function(x){return x!==rm.slice(5);});
      else if(rm.indexOf('room:')===0) state.rooms=state.rooms.filter(function(x){return x!==rm.slice(5);});
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
      if(a==='search'){ e.preventDefault(); state.page=1; if(opts.onSearch) opts.onSearch(snapshot()); return; }
      if(a==='interlink'){ e.preventDefault(); applyInterlink(t.getAttribute('data-val')); return; }
      if(a==='toggle-add'){ state.addOpen=!state.addOpen; render(); }
      else if(a==='reset'){ Object.assign(state,{deal:'Купити',ptype:'Усі типи',currency:'USD',location:'',priceFrom:'',priceTo:'',rooms:[],tags:[],years:[],ranges:{},selects:{},openSel:null,page:1,locSel:[],locPath:[],locMode:'local',locCat:'all',chipVisible:99}); render(); if(opts.onReset) opts.onReset(snapshot()); }
      else if(a==='room'){ var r=t.getAttribute('data-val'); state.rooms=state.rooms.indexOf(r)>-1?state.rooms.filter(function(x){return x!==r;}):state.rooms.concat([r]); render(); }
      else if(a==='year'){ var y=t.getAttribute('data-val'); state.years=state.years.indexOf(y)>-1?state.years.filter(function(x){return x!==y;}):state.years.concat([y]); render(); }
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
      else if(a==='ptype'){ state.ptype=t.value; render(); }
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
    return { getState: snapshot, setState: function(s){ Object.assign(state,s); render(); } };
  }

  // ── Ініціалізація ──────────────────────────────────────────────────
  var root = document.getElementById('ff-novobudovy-filters');
  if (!root) return;
  // прихід із головної / каталогу: ?loc=..|.., ?type=.., ?from/to, ?cur
  var params = new URLSearchParams(window.location.search);
  var initial = {};
  var loc = params.get('loc');
  if (loc) initial.locSel = loc.split('|').filter(Boolean);
  var type = params.get('type');
  if (type) {
    if (/апартамент/i.test(type)) initial.ptype = 'Апартаменти';
    else if (/будинк/i.test(type)) initial.ptype = 'Будинки';
    else if (/комерц/i.test(type)) initial.ptype = 'Комерція';
    else if (/квартир/i.test(type)) initial.ptype = 'Квартири';
  }
  if (params.get('cur')) initial.currency = params.get('cur');
  var from = params.get('from'), to = params.get('to');
  if (from) initial.priceFrom = String(from).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (to) initial.priceTo = String(to).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  window.FaktorNovobudovyFilters = mount(root, {
    logoSrc: 'img/logos/Faktor Sign Navi.svg',
    homeHref: 'index.html',
    initial: initial,
    onChange: function (state) { /* тут можна оновлювати URL / прев'ю результатів */ },
    onSearch: function (state) { if (window.FaktorNovobudovy) window.FaktorNovobudovy.refresh(state); if (window.toast) window.toast('Шукаємо новобудови за фільтрами…'); },
    onReset:  function (state) { if (window.FaktorNovobudovy) window.FaktorNovobudovy.refresh(state); if (window.toast) window.toast('Фільтри скинуто'); }
  });
})();
