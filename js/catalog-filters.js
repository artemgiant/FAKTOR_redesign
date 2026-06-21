/* ============================================================
   FAKTOR — фільтри каталогу (динамічні, за категоріями)
   Самодостатній компонент: зміна категорії → набір доп. фільтрів,
   чипи, мультиселекти, обрані фільтри, скидання. Рендериться повністю
   у #ff-catalog-filters. Стилі — css/catalog-filters.css.
   Колбеки onSearch/onChange зв'язані з тостом каталогу (js/catalog.js).
   ============================================================ */
(function () {
  'use strict';
  var CATEGORIES = ['Квартири', 'Кімнати', 'Будинки', 'Земля', 'Комерція'];
  var DEALS = ['Купити', 'Оренда'];
  var ROOM_OPTS = ['1', '2', '3', '4', '5+'];
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

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function cleanLabel(l){ return l.split(',')[0].trim(); }
  function unitFor(f){ if(/price/i.test(f.id)) return '$'; if(f.id==='areaPlot') return 'сот.'; if(f.id==='floor'||f.id==='floors') return ''; return 'м²'; }
  var ICONS = {
    chevron:'<svg class="ff-chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5b6470" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
    chevronUp:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 15l-6-6-6 6"/></svg>',
    chevronDn:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>',
    search:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9aa1ad" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    sliders:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    reset:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    x:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>'
  };

  function mount(root, opts) {
    opts = opts || {};
    var state = Object.assign({
      deal:'Купити', category:'Квартири', location:'', priceFrom:'', priceTo:'',
      rooms:[], tags:[], ranges:{}, selects:{}, addOpen:false, page:1, openSel:null
    }, opts.initial || {});

    function snapshot(){ return JSON.parse(JSON.stringify(state)); }
    function notify(){ if(opts.onChange) opts.onChange(snapshot()); }
    function dealWord(){ return state.deal==='Купити' ? 'Продаж' : 'Оренда'; }
    function h1(){ return dealWord()+' '+CAT_GEN[state.category]+' в Одесі — Сторінка '+state.page; }
    function crumbs(){ var a=[{label:state.category}]; if(state.rooms.length===1 && (state.category==='Квартири'||state.category==='Будинки')) a.push({label: state.rooms[0]==='5+'?'5+ кімнат':state.rooms[0]+'-кімнатні'}); return a; }
    function addCount(){ var n=state.rooms.length+state.tags.length; Object.keys(state.ranges).forEach(function(k){var r=state.ranges[k]; if(r&&(r.from||r.to)) n++;}); Object.keys(state.selects).forEach(function(k){ n+=(state.selects[k]||[]).length; }); return n; }

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
      else if(f.kind==='tags') inner='<div class="ff-chips">'+f.tags.map(function(t){ return '<button type="button" class="ff-chip'+(state.tags.indexOf(t)>-1?' active':'')+'" data-action="tag" data-val="'+esc(t)+'">'+esc(t)+'</button>'; }).join('')+'</div>';
      else if(f.kind==='select') inner=multiSelect(f);
      else inner=rangeField(f);
      var full = (f.kind==='rooms'||f.kind==='tags') ? ' ff-field-full' : '';
      return '<div class="ff-add-field'+full+'"><div class="ff-fieldlabel">'+esc(f.label)+'</div>'+inner+'</div>';
    }
    function datalists(){
      return Object.keys(DATALISTS).map(function(id){ return ['from','to'].map(function(side){ return '<datalist id="dl-'+id+'-'+side+'">'+DATALISTS[id][side].map(function(v){ return '<option value="'+v+'"></option>'; }).join('')+'</datalist>'; }).join(''); }).join('');
    }
    function selectedChips(){
      var out=[{label:state.deal,rm:'deal'},{label:state.category,rm:'category'}];
      if(state.location.trim()) out.push({label:state.location.trim(),rm:'location'});
      if(state.priceFrom||state.priceTo){ var t=state.priceFrom&&state.priceTo?'Ціна '+state.priceFrom+'–'+state.priceTo+' $':(state.priceFrom?'Ціна від '+state.priceFrom+' $':'Ціна до '+state.priceTo+' $'); out.push({label:t,rm:'price'}); }
      state.rooms.forEach(function(r){ out.push({label:r==='5+'?'5+ кімн.':r+' кімн.',rm:'room:'+r}); });
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
      var logo = opts.logoSrc ? '<a href="'+esc(opts.homeHref||'/')+'"><img src="'+esc(opts.logoSrc)+'" alt="FAKTOR — Головна"></a>' : '<a href="'+esc(opts.homeHref||'/')+'">Головна</a>';

      var html = datalists() +
        '<div class="ff-crumbs">'+logo+ cr.map(function(c,i){ return '<span class="sep">›</span><a href="#"'+(i===cr.length-1?' class="current"':'')+'>'+esc(c.label)+'</a>'; }).join('')+'</div>'+
        '<h1 class="ff-h1">'+esc(h1())+'</h1>'+
        '<div class="ff-mainrow">'+
          '<div class="ff-col"><div class="ff-lbl">Локація</div><div class="ff-field">'+ICONS.search+'<input class="ff-in" data-focus="location" data-action="location" value="'+esc(state.location)+'" placeholder="Місто, район, вулиця або ЖК…"></div></div>'+
          '<div class="ff-col ff-col--deal"><div class="ff-lbl">Тип угоди / категорія</div><div class="ff-deal"><div class="ff-seg ff-seg--deal">'+dealSel+ICONS.chevron+'</div><div class="ff-seg-div"></div><div class="ff-seg">'+catSel+ICONS.chevron+'</div></div></div>'+
          '<div class="ff-col"><div class="ff-lbl">Ціна, $</div><div class="ff-num">'+
            '<input class="ff-in" data-focus="price-from" data-action="price-from" list="dl-price-from" autocomplete="off" value="'+esc(state.priceFrom)+'" placeholder="від" inputmode="numeric"><span class="ff-dash">–</span>'+
            '<input class="ff-in" style="text-align:right" data-focus="price-to" data-action="price-to" list="dl-price-to" autocomplete="off" value="'+esc(state.priceTo)+'" placeholder="до" inputmode="numeric"></div></div>'+
          '<button class="ff-search" data-action="search">Знайти</button>'+
        '</div>'+
        '<div class="ff-controls">'+
          '<button class="ff-more" data-action="toggle-add">'+ICONS.sliders+(state.addOpen?'Згорнути фільтри':'Ще фільтри')+(addCount()?'<span class="ff-badge">'+addCount()+'</span>':'')+(state.addOpen?ICONS.chevronUp:ICONS.chevronDn)+'</button>'+
          '<button class="ff-reset" data-action="reset">'+ICONS.reset+'Скинути всі фільтри</button>'+
        '</div>'+
        '<div class="ff-add'+(state.addOpen?' open':'')+'"><div class="ff-add-inner"><div class="ff-addgrid">'+fieldsFor(state.category).map(addField).join('')+'</div></div></div>'+
        (selectedChips().length?'<div class="ff-selected"><span class="ff-selected-label">Обрані фільтри:</span>'+selectedChips().map(function(c){ return '<span class="ff-selchip">'+esc(c.label)+'<button data-action="remove" data-rm="'+esc(c.rm)+'">'+ICONS.x+'</button></span>'; }).join('')+'</div>':'')+
        '<div class="ff-il-title">Популярні підбірки</div><div class="ff-il">'+((INTERLINKS[state.category]||{})[state.deal==='Купити'?'buy':'rent']||[]).map(function(t){ return '<a href="#">'+esc(t)+'</a>'; }).join('')+'</div>';

      var ae=document.activeElement, fk=ae&&ae.getAttribute&&ae.getAttribute('data-focus'), pos=fk?ae.selectionStart:null;
      root.innerHTML = html;
      if(fk){ var n=root.querySelector('[data-focus="'+fk+'"]'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }
      notify();
    }

    function setCategory(c){ state.category=c; state.rooms=[]; state.tags=[]; state.ranges={}; state.selects={}; state.openSel=null; state.page=1; render(); }
    function toggleSel(id,v){ var a=(state.selects[id]||[]).slice(), i=a.indexOf(v); if(i>-1) a.splice(i,1); else a.push(v); state.selects[id]=a; }
    function removeChip(rm){
      if(rm==='deal') state.deal='Купити';
      else if(rm==='category'){ setCategory('Квартири'); return; }
      else if(rm==='location') state.location='';
      else if(rm==='price'){ state.priceFrom=''; state.priceTo=''; }
      else if(rm.indexOf('room:')===0) state.rooms=state.rooms.filter(function(x){return x!==rm.slice(5);});
      else if(rm.indexOf('tag:')===0) state.tags=state.tags.filter(function(x){return x!==rm.slice(4);});
      else if(rm.indexOf('range:')===0) delete state.ranges[rm.slice(6)];
      else if(rm.indexOf('select:')===0){ var p=rm.slice(7), idx=p.indexOf(':'); toggleSel(p.slice(0,idx), p.slice(idx+1)); }
      render();
    }

    root.addEventListener('click', function(e){
      var t=e.target.closest('[data-action]'); if(!t) return;
      var a=t.getAttribute('data-action');
      if(a==='search'){ e.preventDefault(); if(opts.onSearch) opts.onSearch(snapshot()); return; }
      if(a==='toggle-add'){ state.addOpen=!state.addOpen; render(); }
      else if(a==='reset'){ Object.assign(state,{deal:'Купити',category:'Квартири',location:'',priceFrom:'',priceTo:'',rooms:[],tags:[],ranges:{},selects:{},openSel:null,page:1}); render(); if(opts.onReset) opts.onReset(snapshot()); }
      else if(a==='room'){ var r=t.getAttribute('data-val'); state.rooms=state.rooms.indexOf(r)>-1?state.rooms.filter(function(x){return x!==r;}):state.rooms.concat([r]); render(); }
      else if(a==='tag'){ var g=t.getAttribute('data-val'); state.tags=state.tags.indexOf(g)>-1?state.tags.filter(function(x){return x!==g;}):state.tags.concat([g]); render(); }
      else if(a==='sel-toggle'){ var id=t.getAttribute('data-sel'); state.openSel=state.openSel===id?null:id; render(); }
      else if(a==='opt'){ toggleSel(t.getAttribute('data-sel'), t.getAttribute('data-val')); render(); }
      else if(a==='remove'){ removeChip(t.getAttribute('data-rm')); }
    });
    root.addEventListener('input', function(e){
      var t=e.target, a=t.getAttribute('data-action'), rng=t.getAttribute('data-range');
      if(a==='location') state.location=t.value;
      else if(a==='price-from') state.priceFrom=t.value;
      else if(a==='price-to') state.priceTo=t.value;
      else if(rng){ var side=t.getAttribute('data-side'); state.ranges[rng]=Object.assign({},state.ranges[rng], side==='from'?{from:t.value}:{to:t.value}); }
      else return;
      render();
    });
    root.addEventListener('change', function(e){
      var t=e.target, a=t.getAttribute('data-action');
      if(a==='deal'){ state.deal=t.value; render(); }
      else if(a==='category') setCategory(t.value);
    });
    document.addEventListener('mousedown', function(e){ if(state.openSel && !(e.target.closest && e.target.closest('.ff-ms'))){ state.openSel=null; render(); } });

    render();
    return { getState: snapshot, setState: function(s){ Object.assign(state,s); render(); } };
  }

  // ── Ініціалізація ──────────────────────────────────────────────────
  var root = document.getElementById('ff-catalog-filters');
  if (!root) return;
  // прихід із блоку «Квартири в новобудовах» (index.html) → одразу застосувати фільтр
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('filter') === 'novobud' ? { tags: ['Квартири в новобудові'] } : {};
  window.FaktorCatalogFilters = mount(root, {
    logoSrc: 'img/icons/faktor-logo.svg',
    homeHref: 'index.html',
    initial: initial,
    onChange: function (state) { /* тут можна оновлювати URL / прев'ю результатів */ },
    onSearch: function (state) { if (window.toast) window.toast('Шукаємо пропозиції за фільтрами…'); },
    onReset:  function (state) { if (window.toast) window.toast('Фільтри скинуто'); }
  });
})();
