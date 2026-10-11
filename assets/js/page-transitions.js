(function () {
  'use strict';

  var routes = JSON.parse(document.getElementById('page-transition-routes').textContent);
  var selector = '#main > article.page';
  if (!document.querySelector(selector) || !window.fetch || !window.history.pushState) return;

  var cache = new Map();
  var currentURL = window.location.href;
  var revision = 0;
  var activeTransition = null;
  var activeAnimation = null;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function routeIndex(url) {
    var target = new URL(url, currentURL);
    return target.origin === window.location.origin ? routes.indexOf(target.pathname) : -1;
  }

  function pageKey(url) {
    var target = new URL(url, currentURL);
    return target.origin + target.pathname + target.search;
  }

  function loadPage(url) {
    var key = pageKey(url);
    if (!cache.has(key)) {
      var request = fetch(key, { credentials: 'same-origin' }).then(function (response) {
        if (!response.ok || pageKey(response.url) !== key) throw new Error('Page unavailable');
        return response.text();
      }).then(function (html) {
        var page = new DOMParser().parseFromString(html, 'text/html');
        if (!page.querySelector(selector)) throw new Error('Page content unavailable');
        return page;
      }).catch(function (error) {
        cache.delete(key);
        throw error;
      });
      cache.set(key, request);
    }
    return cache.get(key);
  }

  function scrollPosition() {
    return { x: window.scrollX, y: window.scrollY };
  }

  function saveScroll() {
    if (window.location.href !== currentURL) return;
    history.replaceState(Object.assign({}, history.state, {
      sitePage: true, scroll: scrollPosition()
    }), '', currentURL);
  }

  function updateNavigation(url) {
    document.querySelectorAll('.masthead a[href]').forEach(function (link) {
      if (pageKey(link.href) === pageKey(url)) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (window.updateNav) window.updateNav();
  }

  function updateMetadata(page) {
    document.title = page.title;
    var metadata = 'link[rel="canonical"], meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]';
    document.head.querySelectorAll(metadata).forEach(function (node) { node.remove(); });
    page.head.querySelectorAll(metadata).forEach(function (node) {
      document.head.appendChild(document.importNode(node, true));
    });
  }

  function initializeContent(article) {
    document.dispatchEvent(new CustomEvent('site:page-change', { detail: { root: article } }));
    var jq = window.jQuery;
    if (jq) {
      if (jq.fn.fitVids) jq(article).fitVids();
      if (jq.fn.smoothScroll) jq(article).find('a').smoothScroll({ offset: -65 });
      if (jq.fn.magnificPopup) {
        jq(article).find("a[href$='.jpg'],a[href$='.jpeg'],a[href$='.JPG'],a[href$='.png'],a[href$='.gif']")
          .addClass('image-popup').magnificPopup({
            type: 'image', gallery: { enabled: true }, closeOnContentClick: true, midClick: true
          });
      }
    }
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([article]).catch(function () {});
    }
  }

  function restoreScroll(url, saved) {
    window.scrollTo({ left: saved ? saved.x : 0, top: saved ? saved.y : 0, behavior: 'instant' });
    var hash = new URL(url).hash;
    if (hash && !saved) {
      var target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }

  async function navigate(url, options) {
    var ticket = ++revision;
    var main = document.getElementById('main');
    var previous = activeTransition;
    if (previous) previous.skipTransition();
    if (activeAnimation) activeAnimation.cancel();
    if (!options.history) saveScroll();
    main.setAttribute('aria-busy', 'true');
    try {
      var results = await Promise.all([
        loadPage(url), previous ? previous.finished.catch(function () {}) : Promise.resolve()
      ]);
      if (ticket !== revision) return;
      var page = results[0];
      var oldArticle = document.querySelector(selector);
      var newArticle = document.importNode(page.querySelector(selector), true);
      var forward = routeIndex(url) > routeIndex(currentURL);
      var nav = document.getElementById('site-nav');
      var button = nav && nav.querySelector('button');
      var collapsed = nav && (nav.dataset.compact === 'true' ||
        (button && !button.classList.contains('hidden')));
      var animate = !reducedMotion.matches && !collapsed;
      document.documentElement.dataset.transitionDirection = forward ? 'forward' : 'backward';
      var update = function () {
        if (ticket !== revision) return;
        oldArticle.replaceWith(newArticle);
        updateMetadata(page);
        if (!options.history) history.pushState({ sitePage: true, scroll: { x: 0, y: 0 } }, '', url);
        currentURL = url;
        updateNavigation(url);
        initializeContent(newArticle);
        newArticle.setAttribute('tabindex', '-1');
        newArticle.focus({ preventScroll: true });
        restoreScroll(url, options.scroll);
      };
      if (animate && document.startViewTransition) {
        var transition = document.startViewTransition(update);
        activeTransition = transition;
        // Rendering may skip an animation; the content update must still succeed.
        transition.ready.catch(function () {});
        await transition.updateCallbackDone;
        await transition.finished.catch(function () {});
        if (activeTransition === transition) activeTransition = null;
      } else if (animate && oldArticle.animate) {
        var oldContent = oldArticle.querySelector('.page__inner-wrap') || oldArticle;
        var oldOverflow = oldArticle.style.overflow;
        var oldClipPath = oldArticle.style.clipPath || '';
        oldArticle.style.overflow = 'clip';
        oldArticle.style.clipPath = 'inset(0 0 0 var(--page-slide-inset, 0px))';
        var outgoing = oldContent.animate([
          { transform: 'translateX(0)', opacity: 1 },
          { transform: 'translateX(' + (forward ? '-100%' : '100%') + ')', opacity: 0 }
        ], { duration: 140, easing: 'ease-in', fill: 'forwards' });
        activeAnimation = outgoing;
        try {
          await outgoing.finished;
          if (ticket !== revision) return;
          update();
        } finally {
          outgoing.cancel();
          oldArticle.style.overflow = oldOverflow;
          oldArticle.style.clipPath = oldClipPath;
        }
        var newContent = newArticle.querySelector('.page__inner-wrap') || newArticle;
        var newOverflow = newArticle.style.overflow;
        var newClipPath = newArticle.style.clipPath || '';
        newArticle.style.overflow = 'clip';
        newArticle.style.clipPath = 'inset(0 0 0 var(--page-slide-inset, 0px))';
        var incoming = newContent.animate([
          { transform: 'translateX(' + (forward ? '100%' : '-100%') + ')', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ], { duration: 180, easing: 'ease-out' });
        activeAnimation = incoming;
        try {
          await incoming.finished;
        } finally {
          newArticle.style.overflow = newOverflow;
          newArticle.style.clipPath = newClipPath;
          if (activeAnimation === incoming) activeAnimation = null;
        }
      } else {
        update();
      }
    } catch (error) {
      if (ticket === revision) window.location.assign(url);
    } finally {
      if (ticket === revision) main.removeAttribute('aria-busy');
    }
  }

  function navigationLink(event) {
    var link = event.target.closest('a[href]');
    if (!link || !link.closest('.masthead') || routeIndex(link.href) < 0 ||
        link.hasAttribute('download') || (link.target && link.target !== '_self')) return null;
    return link;
  }

  document.addEventListener('click', function (event) {
    var link = navigationLink(event);
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.href === currentURL && window.location.href === currentURL) {
      revision++;
      if (activeTransition) activeTransition.skipTransition();
      if (activeAnimation) activeAnimation.cancel();
      document.getElementById('main').removeAttribute('aria-busy');
      return;
    }
    navigate(link.href, { history: false });
  });

  function prefetch(event) {
    var link = navigationLink(event);
    if (link) loadPage(link.href).catch(function () {});
  }
  document.addEventListener('pointerover', prefetch);
  document.addEventListener('focusin', prefetch);

  window.addEventListener('popstate', function (event) {
    if (routeIndex(window.location.href) < 0) {
      window.location.reload();
      return;
    }
    navigate(window.location.href, { history: true, scroll: event.state && event.state.scroll });
  });
  window.addEventListener('scroll', saveScroll, { passive: true });
  window.addEventListener('pagehide', saveScroll);
  history.scrollRestoration = 'manual';
  saveScroll();

  // Seed the current page and warm the two other menu pages without reloading assets.
  cache.set(pageKey(currentURL), Promise.resolve(document.cloneNode(true)));
  window.setTimeout(function () {
    routes.forEach(function (route) { loadPage(new URL(route, currentURL).href).catch(function () {}); });
  }, 500);
}());
