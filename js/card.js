/* ============================================================
   FAKTOR — ЕТАЛОННА картка об'єкта (спільний білдер для всього сайту)
   Рендерить однакову розмітку .card на всіх сторінках: favorites,
   catalog, property/zhk-стрічки. Стилі — css/card.css. Глобал FCard.

   FCard.html(item, opts) -> рядок HTML картки.

   item:
     kind        'apartment'|'house'|'land'|'commercial'|'newbuild'|'developer'
     badge       текст бейджа типу (напр. «Квартира»); для newbuild — рік
     price       ціна ('$ 96 000'); для newbuild — «від $ 61 000» або сума
     title       назва (ЖК / тип / забудовник)
     addr        адреса
     img         URL фото (необов'язк.; інакше bg-заглушка)
     stats       [{k:'rooms'|'floor'|'area'|'plot', text:'…'}]  (звичайні)
     installment «Перший внесок …» (newbuild)
     founded     рік заснування (developer) — «На ринку з …»
     city        місто діяльності (developer)
     count       к-сть комплексів (developer); countWord — словоформа
     href        куди веде картка (за замовч. 'property.html')
     id          ідентифікатор (для делегування подій)

   opts:
     heart    false | 'out' | 'fav'   серце: немає / контур / залите
     strip    true → модифікатор .card--strip (фіксована ширина)
     tag      'a' | 'article'         елемент-обгортка (за замовч. 'a')
   ============================================================ */
(function (global) {
  // Іконки статів: де є системна іконка (img/icons/) — беремо її як <img>;
  // де немає (поверх, ділянка) — лишаємо inline-гліф, золотистий (--gold).
  //   кімнати → bedrooms-icon-black.svg   площа → area-icon.svg (вже золота)
  //   поверх → inline (сходи)             ділянка → inline (мапа-парцель)
  const IC = {
    rooms: '<img class="card__ic-img" src="img/icons/bedrooms-icon-black.svg" width="18" height="18" alt="">',
    area:  '<img class="card__ic-img" src="img/icons/area-icon.svg" width="18" height="18" alt="">',
    floor: '<img class="card__ic" src="img/icons/floor.svg" width="16" height="16" alt="">',
    plot:  '<img class="card__ic" src="img/icons/plot.svg" width="16" height="16" alt="">',
  };
  // серце — системні іконки: fav.svg (контур) / like.svg (залите, в обраному)
  const HEART_OUT = 'img/icons/fav.svg';
  const HEART_FAV = 'img/icons/like.svg';
  // «Детальніше ›» — системна стрілка
  const DETAIL = '<img class="card__detail-arr" src="img/icons/arrow-right-14.svg" width="14" height="14" alt="">';

  function statsHTML(stats) {
    return (stats || []).map(s =>
      `<span class="card__stat">${IC[s.k] || ''}${s.text}</span>`
    ).join('');
  }

  function html(item, opts) {
    opts = opts || {};
    const id = item.id != null ? ` data-id="${item.id}"` : '';
    const tag = opts.tag || 'a';
    const href = tag === 'a' ? ` href="${item.href || 'property.html'}"` : '';
    const cls = 'card' + (opts.strip ? ' card--strip' : '');
    const nb = item.kind === 'newbuild';
    const isDev = item.kind === 'developer';

    // оверлеї на фото:
    //   новобудова з роком/забудовником → рік (білий бейдж зліва) + коло
    //     забудовника (праворуч), як у прототипі/на головній;
    //   рік-як-бейдж (4 цифри) → білий бейдж року зліва;
    //   інакше → бейдж типу (navy 82%) зліва.
    let badge = '';
    if (nb && item.year) {
      badge = `<span class="card__year">${item.year}</span>`;
    } else if (nb && /^\d{4}$/.test(String(item.badge || ''))) {
      badge = `<span class="card__year">${item.badge}</span>`;
    } else if (item.badge) {
      badge = `<span class="card__badge">${item.badge}</span>`;
    }
    // оверлей забудовника на фото — лише для об'єктів (новобудови тощо);
    // на самій картці забудовника його немає (назва вже в тілі картки).
    const dev = item.dev && !isDev
      ? `<span class="card__dev"><img src="${item.dev.icon}" width="24" height="24" alt=""><b>${item.dev.name}</b></span>`
      : '';
    const img = item.img ? `<img src="${item.img}" alt="${(item.title || '') + ' — ' + (item.addr || '')}" loading="lazy">` : '';
    const media = `<div class="card__media">${badge}${dev}${img}</div>`;

    // серце — системна іконка <img>; стан в обраному = like.svg
    let heart = '';
    if (opts.heart) {
      const src = opts.heart === 'fav' ? HEART_FAV : HEART_OUT;
      heart = `<button class="card__heart" type="button" aria-label="Обране"${id}><img src="${src}" width="32" height="32" alt=""></button>`;
    }

    // тіло
    let body;
    if (isDev) {
      // картка забудовника: назва → інфо-рядки (на ринку з року, місто,
      // N комплексів — золоті іконки, підпис muted / значення navy) →
      // роздільник → «Детальніше ›». Без серця/ціни/статів — це не об'єкт.
      const ROW_CAL  = '<img class="card__dic" src="img/icons/calendar-gold.svg" width="16" height="16" alt="">';
      const ROW_PIN  = '<img class="card__dic" src="img/icons/pin-gold.svg" width="16" height="16" alt="">';
      const ROW_BLD  = '<img class="card__dic" src="img/icons/building-gold.svg" width="16" height="16" alt="">';
      const rows = [];
      if (item.founded) rows.push(`<span class="card__drow">${ROW_CAL}<span>На ринку з <b>${item.founded}</b></span></span>`);
      if (item.city)    rows.push(`<span class="card__drow">${ROW_PIN}<span class="card__dval">${item.city}</span></span>`);
      // останній рядок (кількість комплексів) несе праворуч «Детальніше ›»
      // — той самий рядок, тож окремого .card__devfoot із роздільником немає.
      if (item.count)   rows.push(`<span class="card__drow card__drow--foot"><span class="card__drow-main">${ROW_BLD}<span><b>${item.count}</b> ${item.countWord || ''}</span></span><span class="card__detail">Детальніше ${DETAIL}</span></span>`);
      body = `<div class="card__body">
        <div class="card__title">${item.title || ''}</div>
        <div class="card__drows">${rows.join('')}</div>
      </div>`;
    } else if (nb) {
      const price = String(item.price || '').replace(/^\s*від\s*/i, '');
      body = `<div class="card__body">
        <div class="card__top"><span class="card__from"><span class="card__from-lbl">від</span><span class="card__price">${price}</span></span>${heart}</div>
        <div class="card__title">${item.title || ''}</div>
        <div class="card__addr">${item.addr || ''}</div>
        <div class="card__nbfoot"><span class="card__pay">${item.installment || 'Перший внесок від 20%'}</span><span class="card__detail">Детальніше ${DETAIL}</span></div>
      </div>`;
    } else {
      body = `<div class="card__body">
        <div class="card__top"><span class="card__price">${item.price || ''}</span>${heart}</div>
        <div class="card__title">${item.title || ''}</div>
        <div class="card__addr">${item.addr || ''}</div>
        <div class="card__stats">${statsHTML(item.stats)}</div>
      </div>`;
    }

    return `<${tag} class="${cls}"${href}${id}>${media}${body}</${tag}>`;
  }

  global.FCard = { html, statsHTML, ICONS: IC, HEART_OUT: HEART_OUT, HEART_FAV: HEART_FAV };
})(window);
