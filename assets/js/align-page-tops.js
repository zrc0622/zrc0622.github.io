(function () {
  'use strict';

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  if (!context) return;
  var pending = false;

  function firstLineText(element) {
    var range = document.createRange();
    if (!range.getBoundingClientRect) return element.textContent.trim();
    var walker = document.createTreeWalker(element, 4); // Text nodes only.
    var node, lineTop, text = '';
    while ((node = walker.nextNode())) {
      for (var i = 0; i < node.textContent.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        var rect = range.getBoundingClientRect();
        if (!rect.height) continue;
        if (lineTop === undefined) lineTop = rect.top;
        if (rect.top > lineTop + 1) return text.trim();
        text += node.textContent.charAt(i);
      }
    }
    return text.trim();
  }

  function alignTextTop() {
    var article = document.querySelector('#main > .page');
    if (!article) return;
    var wrap = article.querySelector('.page__inner-wrap');
    var firstText = article.querySelector('.page__title') ||
      (article.classList.contains('page--home') && article.querySelector('.page__content > p:first-child'));
    if (!wrap || !firstText) return;

    var style = window.getComputedStyle(firstText);
    context.font = style.fontStyle + ' ' + style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
    context.textBaseline = 'alphabetic';
    var ascent = context.measureText(firstLineText(firstText)).actualBoundingBoxAscent;
    if (!Number.isFinite(ascent) || ascent <= 0) return;

    // A zero-size inline block exposes the browser's actual first-line baseline,
    // including the font fallback and line height used for Chinese text.
    var baseline = document.createElement('span');
    baseline.setAttribute('aria-hidden', 'true');
    baseline.style.cssText = 'display:inline-block;width:0;height:0;margin:0;padding:0;border:0;vertical-align:baseline;';
    firstText.insertBefore(baseline, firstText.firstChild);
    var inset = baseline.getBoundingClientRect().top - wrap.getBoundingClientRect().top - ascent;
    baseline.remove();
    if (Number.isFinite(inset) && Math.abs(inset) <= parseFloat(style.fontSize)) {
      // Relative positioning moves the content without changing its internal spacing.
      wrap.style.setProperty('--page-first-line-inset', inset.toFixed(3) + 'px');
    }
  }

  function scheduleAlignment() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      alignTextTop();
    });
  }

  alignTextTop();
  // Run synchronously before the page-transition snapshot captures new content.
  document.addEventListener('site:page-change', alignTextTop);
  window.addEventListener('resize', scheduleAlignment);
  if (document.fonts) {
    document.fonts.ready.then(scheduleAlignment);
    document.fonts.addEventListener('loadingdone', scheduleAlignment);
  }
}());
