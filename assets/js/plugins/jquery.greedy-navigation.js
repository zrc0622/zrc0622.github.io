/* Keep complete menu labels together instead of squeezing table cells. */
var siteNavigation = document.getElementById('site-nav');
var navigationButton = siteNavigation.querySelector('button');
var visibleNavigation = siteNavigation.querySelector('.visible-links');
var hiddenNavigation = siteNavigation.querySelector('.hidden-links');
var menuItems = Array.prototype.slice.call(visibleNavigation.children).filter(function (item) {
  return !item.classList.contains('masthead__menu-item--lg');
});

function updateNav() {
  // Measure the full, uncompressed row after restoring its original order.
  delete siteNavigation.dataset.compact;
  menuItems.forEach(function (item) { visibleNavigation.appendChild(item); });
  var collapsed = visibleNavigation.getBoundingClientRect().width > siteNavigation.clientWidth;
  siteNavigation.dataset.compact = collapsed ? 'true' : 'false';
  if (collapsed) menuItems.forEach(function (item) { hiddenNavigation.appendChild(item); });
  navigationButton.classList.toggle('hidden', !collapsed);
  navigationButton.setAttribute('count', collapsed ? menuItems.length : 0);
  if (!collapsed) {
    hiddenNavigation.classList.add('hidden');
    navigationButton.classList.remove('close');
    navigationButton.setAttribute('aria-expanded', 'false');
  }
}

window.addEventListener('resize', updateNav);
if (window.ResizeObserver) new ResizeObserver(updateNav).observe(siteNavigation);
if (document.fonts) document.fonts.ready.then(updateNav);
navigationButton.addEventListener('click', function () {
  var open = hiddenNavigation.classList.contains('hidden');
  hiddenNavigation.classList.toggle('hidden', !open);
  navigationButton.classList.toggle('close', open);
  navigationButton.setAttribute('aria-expanded', open ? 'true' : 'false');
});
updateNav();
