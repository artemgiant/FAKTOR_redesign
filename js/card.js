/* ============================================================
   FAKTOR — ЕТАЛОННА картка об'єкта (спільний білдер для всього сайту)
   Рендерить однакову розмітку .card на всіх сторінках: favorites,
   catalog, property/zhk-стрічки. Стилі — css/card.css. Глобал FCard.

   FCard.html(item, opts) -> рядок HTML картки.

   item:
     kind        'apartment'|'house'|'land'|'commercial'|'newbuild'
     badge       текст бейджа типу (напр. «Квартира»); для newbuild — рік
     price       ціна ('$ 96 000'); для newbuild — «від $ 61 000» або сума
     title       назва (ЖК / тип)
     addr        адреса
     img         URL фото (необов'язк.; інакше bg-заглушка)
     stats       [{k:'rooms'|'floor'|'area'|'plot', text:'…'}]  (звичайні)
     installment «Перший внесок …» (newbuild)
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
    floor: '<svg class="card__ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h4v-4h4v-4h4V8h4"/></svg>',
    plot:  '<svg class="card__ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke-linejoin="round"/></svg>',
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

    // фото + бейдж/рік
    const badge = nb && /^\d{4}$/.test(String(item.badge || ''))
      ? `<span class="card__year">${item.badge}</span>`
      : (item.badge ? `<span class="card__badge">${item.badge}</span>` : '');
    const img = item.img ? `<img src="${item.img}" alt="${(item.title || '') + ' — ' + (item.addr || '')}" loading="lazy">` : '';
    const media = `<div class="card__media">${badge}${img}</div>`;

    // серце — системна іконка <img>; стан в обраному = like.svg
    let heart = '';
    if (opts.heart) {
      const src = opts.heart === 'fav' ? HEART_FAV : HEART_OUT;
      heart = `<button class="card__heart" type="button" aria-label="Обране"${id}><img src="${src}" width="32" height="32" alt=""></button>`;
    }

    // тіло
    let body;
    if (nb) {
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
