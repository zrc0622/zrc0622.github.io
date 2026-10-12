(function () {
  'use strict';

  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  var hideTimer;
  var dragging = false;

  function hide() {
    window.clearTimeout(hideTimer);
    sidebar.classList.remove('is-scrollbar-visible');
  }

  function show() {
    window.clearTimeout(hideTimer);
    sidebar.classList.add('is-scrollbar-visible');
    if (!dragging) hideTimer = window.setTimeout(hide, 1000);
  }

  sidebar.addEventListener('scroll', show, { passive: true });
  sidebar.addEventListener('pointerenter', show);
  sidebar.addEventListener('pointermove', show, { passive: true });
  sidebar.addEventListener('pointerleave', function () {
    if (!dragging) hide();
  });
  sidebar.addEventListener('pointerdown', function (event) {
    // Hold visibility while the pointer is dragging in the scroll-track space.
    dragging = event.target === sidebar &&
      event.clientX >= sidebar.getBoundingClientRect().right - 24;
    show();
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    show();
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', function () {
    dragging = false;
    hide();
  });
  sidebar.addEventListener('focusin', show);
  sidebar.addEventListener('keydown', show);
  sidebar.classList.add('sidebar-scrollbar-auto-hide');
}());
