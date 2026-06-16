/* ---- іконки (з img/icons) ---- */
const heartFill = '<img src="img/icons/like.svg" width="32" height="32" alt="">';
const heartOut  = '<img src="img/icons/fav.svg" width="32" height="32" alt="">';
const icBed   = '<img src="img/icons/bedrooms-icon-black.svg" width="20" height="20" alt="">';
const icFloor = '<img src="img/icons/bathroom-icon.svg" width="20" height="20" alt="">';
const icArea  = '<img src="img/icons/area-icon.svg" width="20" height="20" alt="">';
const chevL = '<img src="img/icons/arrow-right-14.svg" width="14" height="14" alt="">';
const chevR = '<img src="img/icons/arrow-right-14.svg" width="14" height="14" alt="">';
const dots5 = '<span class="dots img-dots"><i></i><i></i><i class="on"></i><i></i><i></i></span>';

function specsRow(land){
  return `<span class="spec">3 ${icBed}</span><span class="spec">2/5 ${icFloor}</span><span class="spec">147 м² ${icArea}</span>${land?`<span class="spec">${land} ${icArea}</span>`:''}`;
}
document.getElementById('excl-specs').innerHTML = specsRow();

/* ---- суцільні картки (Новобудови / Забудовники) ---- */
function solidCard(d){
  const ctrls = d.active ? `<span class="arrow-circle l">${chevL}</span><span class="arrow-circle r">${chevR}</span>${dots5}` : '';
  const heart = d.heart===false ? '' : `<span class="heart heart-fill">${heartFill}</span>`;
  return `<article class="card-solid">
    <div class="img">${ctrls}</div>
    <div class="body">
      <div class="card-titlerow"><h3 class="t24 card-title">${d.title}</h3>${heart}</div>
      <p class="t15 card-sub">${d.sub}</p>
      <p class="t18 card-price">${d.price}</p>
    </div>
  </article>`;
}
const tc = 'Київський район, ТЦ “Аркадія Сіті”';
document.getElementById('grid-nb').innerHTML = [
  {title:'ЖК Перший Французький', sub:tc, price:'від 2.4 млн. грн.'},
  {title:'ЖК Перлинний квартал на Сахарова', sub:tc, price:'від 2.4 млн. грн.'},
  {title:'ЖК Модерн', sub:tc, price:'від 2.4 млн. грн.', active:true},
  {title:'Арт-резиденція Garden City', sub:tc, price:'від 2.4 млн. грн.'},
].map(solidCard).join('');
document.getElementById('grid-dev').innerHTML = [
  {title:'Назва забудовника', sub:'2002 рік заснування', price:'134 комплекси', heart:false},
  {title:'Назва забудовника', sub:'2002 рік заснування', price:'134 комплекси', heart:false},
  {title:'Назва забудовника', sub:'2002 рік заснування', price:'134 комплекси', heart:false, active:true},
  {title:'Назва забудовника', sub:'2002 рік заснування', price:'134 комплекси', heart:false},
].map(solidCard).join('');

/* ---- лістингові картки (Квартири / Будинки) ---- */
function listingCard(d){
  const ctrls = d.active ? `<span class="arrow-circle l">${chevL}</span><span class="arrow-circle r filled">${chevR}</span>${dots5}` : '';
  const heartCls = d.fav ? 'heart heart-fill' : 'heart heart-out';
  return `<article class="card-list">
    <div class="img">${ctrls}</div>
    <div class="card-row"><div class="price t24">${d.price}</div><span class="${heartCls}">${d.fav?heartFill:heartOut}</span></div>
    <div class="name t18">${d.name}</div>
    <div class="addr t15">${d.addr}</div>
    <div class="specs">${specsRow(d.land)}</div>
  </article>`;
}
const addr = 'Одесса, Приморский р-н, Шевченко-Французский, ул. Вице-Адмирала Азарова';
document.getElementById('grid-flats').innerHTML = [
  {price:'$ 124 000', name:'ЖК OZONE', addr},
  {price:'$ 74 000',  name:'ЖК OZONE', addr, active:true, fav:true},
  {price:'$ 210 000', name:'ЖК OZONE', addr},
  {price:'$ 170 000', name:'ЖК OZONE', addr},
].map(listingCard).join('');
document.getElementById('grid-houses').innerHTML = [
  {price:'$ 124 000', name:'ЖК OZONE', addr},
  {price:'$ 300 000', name:'ЖК OZONE', addr},
  {price:'$ 210 000', name:'ЖК OZONE', addr, land:'4 сот.'},
  {price:'$ 170 000', name:'ЖК OZONE', addr},
].map(listingCard).join('');

/* ---- відгуки ---- */
const google = '<img src="img/icons/rating-stars.svg" width="60" height="19" alt="Google">';
const revFull = 'We bought an apartment. Everything was very professional. Special thanks to Anna. She selected the best option for us and promptly organized on-line and live viewing. I did everything else myself. Very conscientious and punctual.';
const revShort= 'We bought an apartment. Everything was very professional. Special thanks to Anna. She selected the best option for us and promptly organized on-line and live viewing. I did everything else myself...';
function revCard(d){
  return `<article class="rev-card">
    <h4 class="t24">${d.name}</h4>
    <div class="rev-meta"><span class="t12">2 дні тому</span><span class="sep">•</span>${google}</div>
    <p class="t15">${d.text}</p>${d.more?'<a href="#" class="rev-readmore t15">Читати повністю</a>':''}
  </article>`;
}
document.getElementById('grid-rev').innerHTML = [
  {name:'Денис', text:revFull},
  {name:'Єкатерина', text:revFull},
  {name:'Валерія', text:revShort, more:true},
].map(revCard).join('');
