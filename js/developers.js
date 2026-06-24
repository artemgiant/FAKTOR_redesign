/* ============================================================
   FAKTOR — сторінка «Забудовники» (список девелоперів)
   Джерело дизайну: design_handoff_developers/ («Забудовники FAKTOR»).

   Самодостатній модуль. Рендерить у #dev-filters «шапку» блоку:
   breadcrumb → H1 (змінюється від обраного міста) → підзаголовок →
   пікер локацій (мультивибір, спільні .fk-* зі style.css). Пікер
   фільтрує список і керує лічильником та сіткою карток забудовників.

   Картки — через ЕТАЛОН FCard (js/card.js), kind:'developer':
   назва → «На ринку з …» / місто / «N комплексів» (золоті іконки) →
   роздільник → «Детальніше ›». Кожна веде на сторінку забудовника.

   Лічильник (#dev-count), сітка (#dev-grid), «Показати ще» (#dev-more)
   та порожній стан (#dev-empty) — у developers.html.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- тост (спільний з рештою сторінок) ---------------- */
  window.toast = window.toast || function (msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function plural(n, forms){ var a=n%10, b=n%100; if(a===1&&b!==11) return forms[0]; if(a>=2&&a<=4&&(b<10||b>=20)) return forms[1]; return forms[2]; }

  /* ---------------- дані забудовників (із хендофу DEVS[]) ----------------
     name — назва; founded — рік на ринку; city — місто; count — к-сть
     комплексів; areas — райони діяльності (для фільтра локацій). */
  var DEVS = [
    { slug:'kadorr-group', name:'KADORR Group',          founded:2010, city:'Одеса', count:18, areas:['Приморський','Київський','Аркадія','Фонтан'] },
    { slug:'gefest',       name:'Гефест',                founded:2004, city:'Одеса', count:12, areas:['Київський','Приморський','Фонтан'] },
    { slug:'stikon',       name:'Stikon',                founded:1994, city:'Одеса', count:7,  areas:['Приморський','Аркадія'] },
    { slug:'budova',       name:'Будова',                founded:2008, city:'Одеса', count:5,  areas:['Приморський','Малиновський'] },
    { slug:'inkor-grup',   name:'Інкор Груп',            founded:2006, city:'Одеса', count:6,  areas:['Малиновський','Київський','Таїрова'] },
    { slug:'altair',       name:'Альтаїр',               founded:2011, city:'Одеса', count:4,  areas:['Приморський','Аркадія'] },
    { slug:'inter-bud',    name:'Інтер-Буд',             founded:2003, city:'Одеса', count:9,  areas:['Київський','Пересипський'] },
    { slug:'atlant',       name:'Атлант',                founded:2014, city:'Одеса', count:5,  areas:['Приморський','Фонтан'] },
    { slug:'rozmarin',     name:'Розмарин Девелопмент',  founded:2016, city:'Одеса', count:3,  areas:['Приморський','Аркадія','Совіньйон'] },
    { slug:'prime-park',   name:'Prime Park',            founded:2012, city:'Одеса', count:8,  areas:['Київський','Таїрова'] }
  ];

  var PAGE = 8;  // скільки показувати спершу / додавати за «Показати ще»

  /* ---------------- довідник локацій (як на головній / каталозі) ---------------- */
  var LOC_CATS = [['all','Усі'],['developer','Забудовники'],['district','Райони'],['micro','Мікрорайони'],['street','Вулиці'],['complex','ЖК']];
  var KIND = { district:'район', street:'вулиця', micro:'мікрорайон', complex:'жк', developer:'забудовник', city:'місто', region:'регіон', country:'країна' };
  var COUNTRIES = [['Україна',96],['Польща',0],['Німеччина',0],['Іспанія',0],['Туреччина',0],['ОАЕ',0],['Кіпр',0]];
  var REGIONS = { 'Україна':[['Одеська область',96],['Київська область',0],['Львівська область',0],['Миколаївська область',0],['Харківська область',0]] };
  var CITIES = { 'Одеська область':[['Одеса','',92],['Чорноморськ','',2],['Авангард','',1],['Фонтанка','',1]] };
  var LOCDATA = {
    district:  [['Приморський','Одеса',7],['Київський','Одеса',6],['Малиновський','Одеса',3],['Пересипський','Одеса',2],['Хаджибейський','Одеса',1]],
    micro:     [['Аркадія','Приморський',5],['Фонтан','Приморський',4],['Таїрова','Київський',3],['Совіньйон','Овідіопольський',1]],
    street:    [['Французький бульвар','Приморський',4],['Гагарінське плато','Приморський',3],['Люстдорфська дорога','Київський',3],['вул. Сахарова','Київський',2]],
    complex:   [['ЖК Перший Французький','Київський',1],['ЖК Аркадія Сіті','Приморський',1],['ЖК Sky Garden','Малиновський',1]],
    developer: DEVS.map(function(d){ return [d.name,'',d.count]; })
  };

  var ICONS = {
    pin:'<svg class="fk-ic-pin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.35-7-10a7 7 0 0 1 14 0c0 5.65-7 10-7 10z"/><circle cx="12" cy="11" r="2.5"/></svg>',
    chipX:'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>',
    drill:'<svg class="fk-locrow__drill" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'
  };

  /* ---------------- стан ---------------- */
  var state = {
    location:'', locOpen:false, locMode:'local', locCat:'all', locSel:[], locPath:[],
    chipVisible:99, shownCount:PAGE
  };

  var filtersRoot = document.getElementById('dev-filters');

  /* ============================================================
     ПІКЕР ЛОКАЦІЙ (логіка спільна з js/novobudovy-filters.js)
     ============================================================ */
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
    var T={developer:['Забудовник','Забудовники',3],district:['Район','Райони',4],micro:['Мікрорайон','Мікрорайони',5],street:['Вулиця','Вулиці',6],complex:['ЖК','Комплекси',7]};
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
    var list = state.locCat==='all' ? [].concat(LOCDATA.developer, LOCDATA.district) : (LOCDATA[state.locCat]||[]);
    return list.map(function(r){ return {label:r[0],sub:r[1],count:r[2],selectable:true}; });
  }
  function onLocRow(row){ if(row.selectable){ toggleLocItem(row.label); return; } state.locPath=(state.locPath||[]).concat([row.label]); render(); }
  function toggleLocItem(label){ state.locSel = state.locSel.indexOf(label)>-1 ? state.locSel.filter(function(x){return x!==label;}) : state.locSel.concat([label]); state.location=''; state.chipVisible=99; state.shownCount=PAGE; render(); }
  function removeLocChip(label){ state.locSel = state.locSel.filter(function(x){return x!==label;}); state.chipVisible=99; state.shownCount=PAGE; render(); }

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
    var ph = state.locSel.length ? (vis < state.locSel.length ? '' : 'Додати ще…') : 'Локація або забудовник — район, місто, ЖК…';
    return '<div class="fk-loc dev-loc">'+
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
      '<button type="button" class="fk-tab'+(state.locMode!=='geo'?' is-on':'')+'" data-action="loc-mode" data-val="local">Локація / забудовник</button></div>';
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
      var box = r.selectable ? '<span class="fk-box'+(checked?' is-checked':'')+'">'+(checked?ICONS.check:'')+'</span>' : '';
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
    var fieldEl = filtersRoot && filtersRoot.querySelector('.fk-loc__field'); if(!fieldEl) return;
    var vis = Math.min(state.chipVisible, state.locSel.length);
    if(fieldEl.scrollWidth > fieldEl.clientWidth + 1 && vis > 1){ state.chipVisible = Math.max(1, vis - 1); render(); }
  }

  /* ---------------- H1 змінюється від обраного міста ---------------- */
  function cityFromSel(){
    var cityNames=[]; Object.keys(CITIES).forEach(function(k){ CITIES[k].forEach(function(c){ cityNames.push(c[0]); }); });
    return state.locSel.find(function(s){ return cityNames.indexOf(s)>-1; }) || null;
  }
  function h1(){ var c=cityFromSel(); return c && c!=='Одеса' ? 'Забудовники · '+c : 'Забудовники Одеси'; }

  /* ============================================================
     ФІЛЬТР + РЕНДЕР СПИСКУ
     ============================================================ */
  function passes(d){
    return state.locSel.every(function(s){
      return s===d.name || d.areas.indexOf(s)>-1 || ['Одеса','Одеська область','Україна'].indexOf(s)>-1;
    });
  }
  function devCardHTML(d){
    return FCard.html({
      kind:'developer',
      title:d.name,
      founded:d.founded,
      city:d.city,
      count:d.count,
      countWord:plural(d.count,['комплекс','комплекси','комплексів']),
      href:'developer.html?dev='+encodeURIComponent(d.slug)   // → сторінка забудовника
    }, { tag:'a' });
  }
  function renderList(){
    var all = DEVS.filter(passes);
    var total = all.length;
    var shown = all.slice(0, state.shownCount);

    var grid = document.getElementById('dev-grid');
    if(grid) grid.innerHTML = shown.map(devCardHTML).join('');

    var count = document.getElementById('dev-count');
    if(count) count.innerHTML = 'Знайдено <b>'+total+'</b> '+plural(total,['забудовник','забудовники','забудовників']);

    var more = document.getElementById('dev-more');
    if(more) more.style.display = state.shownCount < total ? '' : 'none';

    var empty = document.getElementById('dev-empty');
    if(empty) empty.style.display = total===0 ? '' : 'none';
    if(grid) grid.style.display = total===0 ? 'none' : '';
  }

  /* ============================================================
     РЕНДЕР «ШАПКИ» (breadcrumb → H1 → підзаголовок → пікер)
     ============================================================ */
  function render(){
    if(!filtersRoot) return;
    var logo = '<a href="index.html"><img src="img/logos/Faktor Sign Navi.svg" alt="FAKTOR — Головна"></a>';
    var html =
      '<div class="ff-crumbs dev-crumbs">'+logo+'<span class="sep">›</span><a href="#" class="current">Забудовники</a></div>'+
      '<h1 class="ff-h1 dev-h1">'+esc(h1())+'</h1>'+
      '<p class="dev-sub">Перевірені девелопери, з якими ми працюємо напряму. Купівля в новобудові — за ціною забудовника, без комісії.</p>'+
      '<div class="dev-search">'+locField()+'</div>';

    var ae=document.activeElement, fk=ae&&ae.getAttribute&&ae.getAttribute('data-focus'), pos=fk?ae.selectionStart:null;
    filtersRoot.innerHTML = html;
    if(fk){ var n=filtersRoot.querySelector('[data-focus="'+fk+'"]'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }
    queueFit();
    renderList();
    document.title = h1()+' — перевірені девелопери | FAKTOR';
  }

  /* ============================================================
     ПОДІЇ
     ============================================================ */
  if(filtersRoot){
    filtersRoot.addEventListener('click', function(e){
      var t=e.target.closest('[data-action]'); if(!t) return;
      var a=t.getAttribute('data-action');
      if(a==='loc-field'){ if(e.target.closest('.fk-chip__x')||e.target.closest('.fk-chip-more')) return; if(!state.locOpen){ state.locOpen=true; render(); var inp=filtersRoot.querySelector('.fk-loc__in'); if(inp) inp.focus(); } return; }
      if(a==='loc-rm'){ e.stopPropagation(); removeLocChip(t.getAttribute('data-val')); return; }
      if(a==='loc-more'){ e.stopPropagation(); state.locOpen=true; render(); return; }
      if(a==='loc-mode'){ state.locMode=t.getAttribute('data-val'); state.locPath=[]; state.location=''; render(); return; }
      if(a==='loc-cat'){ state.locCat=t.getAttribute('data-val'); render(); return; }
      if(a==='loc-crumb'){ state.locPath=state.locPath.slice(0, Number(t.getAttribute('data-val'))); render(); return; }
      if(a==='loc-row'){ var lbl=t.getAttribute('data-val'); var data=locRows().filter(function(r){return !r.header;}).find(function(r){return r.label===lbl;}); if(data) onLocRow(data); return; }
    });
    filtersRoot.addEventListener('input', function(e){
      var t=e.target; if(t.getAttribute('data-action')==='location'){ state.location=t.value; state.locOpen=true; render(); }
    });
    filtersRoot.addEventListener('focusin', function(e){
      if(e.target.getAttribute && e.target.getAttribute('data-action')==='location' && !state.locOpen){ state.locOpen=true; render(); }
    });
    document.addEventListener('mousedown', function(e){
      if(state.locOpen && !(e.target.closest && e.target.closest('.fk-loc'))){ state.locOpen=false; render(); }
    });
    window.addEventListener('resize', function(){ state.chipVisible=99; render(); });
  }

  /* ---------------- «Показати ще» / порожній стан ---------------- */
  var more = document.getElementById('dev-more');
  if(more) more.addEventListener('click', function(){
    state.shownCount += PAGE;
    renderList();
  });
  var resetBtn = document.getElementById('dev-reset');
  if(resetBtn) resetBtn.addEventListener('click', function(){
    state.locSel=[]; state.location=''; state.shownCount=PAGE; render();
  });

  /* ---------------- старт: прихід із головної/каталогу ?loc=..|.. ---------------- */
  var params = new URLSearchParams(window.location.search);
  var loc = params.get('loc');
  if(loc) state.locSel = loc.split('|').filter(Boolean);

  render();
})();
