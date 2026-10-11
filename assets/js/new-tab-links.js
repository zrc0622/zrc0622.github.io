// Open content links in a new tab while keeping navigation and controls unchanged.
(function () {
  function updateLinks(root) {
    root.querySelectorAll('a[href]').forEach(function (link) {
      if (link.closest('.masthead')) return;
      var href = link.getAttribute('href').trim();
      if (!href || href.charAt(0) === '#' ||
          !/^https?:$/.test(link.protocol) || link.hasAttribute('download')) return;
      if (link.hash && link.origin === window.location.origin &&
          link.pathname === window.location.pathname &&
          link.search === window.location.search) return;
      link.target = '_blank';
      link.relList.add('noopener', 'noreferrer');
    });
  }
  updateLinks(document);
  document.addEventListener('site:page-change', function (event) {
    updateLinks(event.detail.root);
  });
}());
