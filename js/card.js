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
  const IC = {
    rooms: '<svg class="card__ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 15h18M6 11V8h5v3"/></svg>',
    floor: '<svg class="card__ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h4v-4h4v-4h4V8h4"/></svg>',
    area:  '<svg class="card__ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plot:  '<svg class="card__ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke-linejoin="round"/></svg>',
  };
  const HEART = '<svg width="23" height="23" viewBox="0 0 24 24" stroke-width="1.7"><path d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5.5c2 0 3.2 1 4 2.2.8-1.2 2-2.2 4-2.2 3.5 0 5 3.5 3.5 7C19 16.65 12 21 12 21z"/></svg>';
  const DETAIL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

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

    // серце
    let heart = '';
    if (opts.heart) {
      const fav = opts.heart === 'fav' ? ' is-fav' : '';
      heart = `<button class="card__heart${fav}" type="button" aria-label="Обране"${id}>${HEART}</button>`;
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

  global.FCard = { html, statsHTML, ICONS: IC };
})(window);
