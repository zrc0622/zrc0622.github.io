(function () {
  'use strict';

  document.addEventListener('click', function (event) {
    var navButton = document.querySelector('#site-nav button');
    var navMenu = document.querySelector('#site-nav .hidden-links');
    if (navButton && navMenu && !navButton.contains(event.target) && !navMenu.contains(event.target)) {
      navMenu.classList.add('hidden');
      navButton.classList.remove('close');
      navButton.setAttribute('aria-expanded', 'false');
    }

    var followButton = document.querySelector('.author__urls-wrapper button');
    var followMenu = document.querySelector('.author__urls-wrapper .author__urls');
    if (!followButton || !followMenu) return;
    if (followButton.contains(event.target)) {
      // The theme's button handler has already toggled the open class.
      followButton.setAttribute('aria-expanded', followButton.classList.contains('open') ? 'true' : 'false');
    } else if (!followMenu.contains(event.target) &&
        window.getComputedStyle(followButton).display !== 'none' &&
        (followButton.classList.contains('open') || window.getComputedStyle(followMenu).display !== 'none')) {
      // Finish any in-flight fade before hiding, so it cannot reopen the menu.
      if (window.jQuery) window.jQuery(followMenu).stop(true, true).hide();
      else followMenu.style.display = 'none';
      followButton.classList.remove('open');
      followButton.setAttribute('aria-expanded', 'false');
    }
  });
}());
