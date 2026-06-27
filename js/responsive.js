/* ============================================================
   FAKTOR — підгонка макета під вузькі екрани (13" і менше)

   Макет зафіксований на 1440px (експорт із Figma): hero побудований
   на абсолютних координатах, навбар — position:fixed. Замість того
   щоб ламати композицію брейкпоінтами, пропорційно зменшуємо .frame
   під ширину вікна через CSS zoom — картинка лишається 1:1, просто
   трохи дрібніша і повністю влазить без горизонтального скролу.

   CSS у style.css дає миттєвий (без стрибка) ступінчастий фолбек;
   цей скрипт уточнює масштаб до точного заповнення ширини і стежить
   за зміною розміру вікна.
   ============================================================ */
(function () {
  var DESIGN_WIDTH = 1440;

  function fit() {
    var frame = document.querySelector('.frame');
    if (!frame) return;
    // міряємо доступну ширину БЕЗ інлайнового zoom (лишається ступінь із CSS),
    // clientWidth уже без вертикального скролбара — тож зворотного зв'язку немає
    frame.style.zoom = '';
    var avail = document.documentElement.clientWidth;
    var z = Math.min(1, avail / DESIGN_WIDTH);
    frame.style.zoom = z;
    // навбар не масштабуємо разом із фреймом — він тримає реальні 890px і
    // починає звужуватись лише коли вікно само впритул (див. .nav у style.css).
    // віддаємо CSS обернений коефіцієнт, щоб контр-масштабувати навбар 1:1
    // (transform:scale всередині zoom-фрейма = z × s, тож s = 1/z → рендер 1:1).
    document.documentElement.style.setProperty('--nav-counter', 1 / z);
  }

  if (document.readyState !== 'loading') fit();
  document.addEventListener('DOMContentLoaded', fit);
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
})();
