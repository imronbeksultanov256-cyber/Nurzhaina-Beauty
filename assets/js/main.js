/* ============================================================
   NURZHANA BEAUTY — interactions
   ============================================================ */
(function () {
  'use strict';

  var NB = window.NB || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- WhatsApp links ---------------- */
  var WA_ICON =
    '<svg class="btn__ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.01a8.23 8.23 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 012.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>';

  function initWa() {
    if (!NB.wa) return;
    $$('[data-wa-ico]').forEach(function (el) {
      if (!el.querySelector('.btn__ico')) el.insertAdjacentHTML('afterbegin', WA_ICON);
    });
    $$('[data-wa]').forEach(function (el) {
      var key = el.getAttribute('data-wa');
      var custom = el.getAttribute('data-wa-text');
      var text = custom || (NB.WA_TEXT && NB.WA_TEXT[key]) || (NB.WA_TEXT && NB.WA_TEXT.default);
      el.setAttribute('href', NB.wa(text));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
  }

  /* ---------------- header ---------------- */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;
    var last = -1;
    var onScroll = function () {
      var y = window.pageYOffset;
      var stuck = y > 24;
      if (stuck !== last) { header.classList.toggle('is-stuck', stuck); last = stuck; }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* floating whatsapp appears after first screen */
    var fab = $('.fab');
    if (fab) {
      var onFab = function () { fab.classList.toggle('is-on', window.pageYOffset > 520); };
      onFab();
      window.addEventListener('scroll', onFab, { passive: true });
    }
  }

  /* ---------------- mobile drawer ---------------- */
  function initDrawer() {
    var burger = $('.burger');
    var drawer = $('.drawer');
    if (!burger || !drawer) return;

    $$('.drawer nav a').forEach(function (a, i) { a.style.setProperty('--i', i); });

    var open = function (state) {
      document.documentElement.classList.toggle('is-menu-open', state);
      document.body.style.overflow = state ? 'hidden' : '';
      burger.setAttribute('aria-expanded', state ? 'true' : 'false');
      drawer.setAttribute('aria-hidden', state ? 'false' : 'true');
      burger.setAttribute('aria-label', state ? 'Закрыть меню' : 'Открыть меню');
    };
    open(false);

    burger.addEventListener('click', function () {
      open(!document.documentElement.classList.contains('is-menu-open'));
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) open(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.documentElement.classList.contains('is-menu-open')) open(false);
    });
  }

  /* ---------------- scroll reveal ---------------- */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    items.forEach(function (el) {
      var d = el.getAttribute('data-d');
      if (d) el.style.setProperty('--d', d + 'ms');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });

    /* страховка: контент никогда не должен остаться невидимым, даже если
       IntersectionObserver не сработал (фоновая вкладка, нестандартный браузер).
       Реагируем и на скролл — так клип-анимация карты/фото гарантированно снимется. */
    var revealVisible = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var pending = 0;
      items.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh + 40 && r.bottom > -40) { el.classList.add('is-in'); io.unobserve(el); }
        else pending++;
      });
      if (!pending) {
        window.removeEventListener('scroll', onScrollReveal);
        window.removeEventListener('resize', onScrollReveal);
      }
    };
    var scrollTick = false;
    var onScrollReveal = function () {
      if (scrollTick) return;
      scrollTick = true;
      window.requestAnimationFrame(function () { scrollTick = false; revealVisible(); });
    };
    window.addEventListener('scroll', onScrollReveal, { passive: true });
    window.addEventListener('resize', onScrollReveal, { passive: true });
    window.setTimeout(revealVisible, 1200);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') window.setTimeout(revealVisible, 100);
    });
  }

  /* ---------------- soft parallax ---------------- */
  function initParallax() {
    var els = $$('[data-parallax]');
    if (!els.length || reduced || window.innerWidth < 900) return;
    var ticking = false;
    var run = function () {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var amt = parseFloat(el.getAttribute('data-parallax')) || 6;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = 'translate3d(0,' + (-p * amt).toFixed(2) + '%,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(run); }
    }, { passive: true });
    run();
  }

  /* ---------------- accordion ---------------- */
  function initAcc(scope) {
    $$('.acc__b', scope || document).forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      var item = btn.closest('.acc__i');
      var panel = item.querySelector('.acc__p');
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        var group = item.closest('.acc');
        if (group) {
          $$('.acc__i.is-open', group).forEach(function (o) {
            if (o === item) return;
            o.classList.remove('is-open');
            o.querySelector('.acc__p').style.height = '0px';
            o.querySelector('.acc__b').setAttribute('aria-expanded', 'false');
          });
        }
        item.classList.toggle('is-open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
        panel.style.height = isOpen ? '0px' : panel.scrollHeight + 'px';
      });
      panel.addEventListener('transitionend', function () {
        if (item.classList.contains('is-open')) panel.style.height = 'auto';
      });
    });
    window.addEventListener('resize', function () {
      $$('.acc__i.is-open .acc__p').forEach(function (p) { p.style.height = 'auto'; });
    });
  }

  /* ---------------- lightbox ---------------- */
  function initLightbox() {
    var triggers = $$('[data-lb]');
    if (!triggers.length) return;

    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Просмотр');
    lb.innerHTML =
      '<button class="lb__x" type="button" aria-label="Закрыть"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor"><path d="M1 1l13 13M14 1L1 14"/></svg></button>' +
      '<button class="lb__nav lb__nav--p" type="button" aria-label="Предыдущее"><svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor"><path d="M6 1L1 6l5 5M1 6h15"/></svg></button>' +
      '<button class="lb__nav lb__nav--n" type="button" aria-label="Следующее"><svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor"><path d="M10 1l5 5-5 5M15 6H0"/></svg></button>' +
      '<div class="lb__box"><div class="lb__frame"></div><p class="lb__cap"></p></div>';
    document.body.appendChild(lb);

    var frame = $('.lb__frame', lb);
    var cap = $('.lb__cap', lb);
    var idx = 0;
    var opener = null;

    function stopVideo() {
      var v = frame.querySelector('video');
      if (v) { try { v.pause(); } catch (e) {} }
    }
    function render(i) {
      var t = triggers[(i + triggers.length) % triggers.length];
      idx = triggers.indexOf(t);
      stopVideo();
      frame.innerHTML = '';
      var vsrc = t.getAttribute('data-lb-video');
      var vert = t.getAttribute('data-lb-ratio') === '9-16';
      if (vsrc) {
        var poster = t.getAttribute('data-lb-poster') || '';
        var vid = document.createElement('video');
        vid.src = vsrc;
        if (poster) vid.poster = poster;
        vid.controls = true;
        vid.autoplay = true;
        vid.playsInline = true;
        vid.setAttribute('playsinline', '');
        vid.style.cssText = 'width:100%;height:auto;max-height:' + (vert ? '80vh' : '78vh') + ';display:block;background:#000';
        frame.appendChild(vid);
        var p = vid.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        var src = t.querySelector('.ratio');
        if (src) frame.appendChild(src.cloneNode(true));
      }
      frame.classList.toggle('lb__frame--v', vert);
      cap.textContent = t.getAttribute('data-lb-cap') || '';
    }
    function open(t) {
      opener = t;
      render(triggers.indexOf(t));
      lb.classList.add('is-on');
      document.body.style.overflow = 'hidden';
      $('.lb__x', lb).focus();
    }
    function close() {
      stopVideo();
      lb.classList.remove('is-on');
      document.body.style.overflow = '';
      if (opener) opener.focus();
    }

    triggers.forEach(function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); open(t); });
    });
    $('.lb__x', lb).addEventListener('click', close);
    $('.lb__nav--p', lb).addEventListener('click', function () { render(idx - 1); });
    $('.lb__nav--n', lb).addEventListener('click', function () { render(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') render(idx - 1);
      if (e.key === 'ArrowRight') render(idx + 1);
    });
  }

  /* ---------------- filters ---------------- */
  function initFilters() {
    $$('[data-filter-group]').forEach(function (group) {
      var targetSel = group.getAttribute('data-filter-group');
      var buttons = $$('button', group);
      buttons.forEach(function (b) {
        b.addEventListener('click', function () {
          var val = b.getAttribute('data-filter');
          buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
          $$(targetSel + ' [data-cat]').forEach(function (item) {
            var show = val === 'all' || item.getAttribute('data-cat') === val;
            item.style.display = show ? '' : 'none';
          });
          $$(targetSel + ' [data-group-cat]').forEach(function (g) {
            var show = val === 'all' || g.getAttribute('data-group-cat') === val;
            g.style.display = show ? '' : 'none';
          });
        });
      });
    });
  }

  /* ---------------- form ---------------- */
  function initForms() {
    $$('form.form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        var name = (fd.get('name') || '').toString().trim();
        var phone = (fd.get('phone') || '').toString().trim();
        var proc = (fd.get('procedure') || '').toString().trim();
        var time = (fd.get('time') || '').toString().trim();
        var note = (fd.get('note') || '').toString().trim();

        var lines = ['Здравствуйте! Заявка с сайта NURZHANA BEAUTY.'];
        if (name) lines.push('Имя: ' + name);
        if (phone) lines.push('Телефон: ' + phone);
        if (proc) lines.push('Процедура: ' + proc);
        if (time) lines.push('Удобное время: ' + time);
        if (note) lines.push('Комментарий: ' + note);
        var msg = lines.join('\n');

        var done = function () {
          form.classList.add('is-sent');
          var ok = form.querySelector('.form__ok');
          if (ok) {
            ok.setAttribute('tabindex', '-1');
            ok.focus({ preventScroll: true });
            ok.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
          }
        };

        if (NB.FORM_ENDPOINT) {
          fetch(NB.FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, phone: phone, procedure: proc, time: time, note: note })
          }).then(done).catch(function () {
            window.open(NB.wa(msg), '_blank', 'noopener');
            done();
          });
        } else {
          window.open(NB.wa(msg), '_blank', 'noopener');
          done();
        }
      });
    });
  }

  /* ---------------- procedure detail page ---------------- */
  function initProcedurePage() {
    var root = $('[data-procedure-root]');
    if (!root || !NB.PROCEDURES) return;

    var id = new URLSearchParams(window.location.search).get('id');
    var p = NB.PROCEDURES.filter(function (x) { return x.id === id; })[0] || NB.PROCEDURES[0];
    var esc = function (s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    };

    document.title = p.title + ' — NURZHANA BEAUTY';
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', p.short);

    $$('[data-p-title]').forEach(function (el) { el.textContent = p.title; });
    $$('[data-p-cat]').forEach(function (el) { el.textContent = p.cat; });
    $$('[data-p-short]').forEach(function (el) { el.textContent = p.short; });
    $$('[data-p-intro]').forEach(function (el) { el.textContent = p.intro; });
    $$('[data-p-duration]').forEach(function (el) { el.textContent = p.duration || 'Уточняется'; });
    $$('[data-p-price]').forEach(function (el) { el.textContent = p.price || 'По запросу'; });

    var media = $('[data-p-media]');
    if (media && p.ph) media.classList.add(p.ph);

    var waText = NB.WA_TEXT.procedure(p.title);
    $$('[data-p-wa]').forEach(function (el) {
      el.setAttribute('href', NB.wa(waText));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });

    var listBlock = function (sel, arr) {
      var box = $(sel);
      if (!box) return;
      if (!arr || !arr.length) return; /* оставляем блок «информация уточняется» */
      box.innerHTML = arr.map(function (t) {
        return '<li class="check"><svg width="12" height="9" viewBox="0 0 12 9" fill="none" stroke="currentColor"><path d="M1 4.5L4.5 8 11 1"/></svg><span>' + esc(t) + '</span></li>';
      }).join('');
    };
    listBlock('[data-p-forwhom]', p.forWhom);
    listBlock('[data-p-steps]', p.steps);

    /* соседние направления */
    var others = NB.PROCEDURES.filter(function (x) { return x.id !== p.id; }).slice(0, 3);
    var rel = $('[data-p-related]');
    if (rel) {
      rel.innerHTML = others.map(function (o, i) {
        return '' +
          '<article class="card" data-reveal data-d="' + i * 90 + '">' +
          '<div class="card__media"><div class="ratio r-4-5"><div class="ph ' + (o.ph || '') + '"></div></div></div>' +
          '<h3 class="card__t">' + esc(o.title) + '</h3>' +
          '<p class="card__d">' + esc(o.short) + '</p>' +
          '<div class="card__f"><span>Подробнее</span>' +
          '<svg width="20" height="8" viewBox="0 0 20 8" fill="none" stroke="currentColor"><path d="M15 1l4 3-4 3M0 4h19"/></svg></div>' +
          '<a class="card__link" href="procedure.html?id=' + encodeURIComponent(o.id) + '" aria-label="' + esc(o.title) + '"></a>' +
          '</article>';
      }).join('');
      initReveal();
    }
  }

  /* ---------------- active nav + CTA anchor ---------------- */
  function initActiveNav() {
    var file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!file) file = 'index.html';
    $$('.nav a, .drawer nav a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
      if (href && href === file) a.setAttribute('aria-current', 'page');
    });
  }

  /* запись идёт напрямую в WhatsApp — все кнопки «Записаться» открывают чат */
  function initCtaAnchor() {
    if (!NB.wa) return;
    var href = NB.wa(NB.WA_TEXT && NB.WA_TEXT.default);
    $$('[data-cta-book]').forEach(function (a) {
      a.setAttribute('href', href);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  /* ---------------- reviews (слайд-шоу фото + видео) ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function initReviews() {
    /* ссылки «смотреть отзывы/результаты» → Instagram */
    var C = NB.CONTACTS || {};
    var wire = function (sel, url) {
      if (!url) return;
      $$(sel).forEach(function (a) {
        a.setAttribute('href', url);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      });
    };
    wire('[data-ig-reviews]', C.instagramReviews);
    wire('[data-ig-results]', C.instagramResults || C.instagram);

    /* слайдер отзывов: фото-скриншоты + видео-отзывы в одной ленте */
    $$('[data-reviews-slider]').forEach(function (track) {
      var limit = parseInt(track.getAttribute('data-limit'), 10) || 0;
      var slides = [];
      (NB.REVIEW_PHOTOS || []).forEach(function (r) {
        slides.push(
          '<button class="rev-slide" type="button" data-lb data-lb-cap="' + esc(r.cap) + '" aria-label="' + esc(r.cap) + '">' +
          '<div class="ratio r-3-4"><img src="' + esc(r.src) + '" alt="' + esc(r.cap) + '" loading="lazy" decoding="async"></div>' +
          '</button>'
        );
      });
      (NB.VIDEO_REVIEWS || []).forEach(function (v) {
        slides.push(
          '<button class="rev-slide rev-slide--video" type="button" data-lb data-lb-ratio="9-16"' +
          ' data-lb-video="' + esc(v.src) + '" data-lb-poster="' + esc(v.poster) + '"' +
          ' data-lb-cap="' + esc(v.title + ' · ' + v.note) + '" aria-label="' + esc(v.title) + '">' +
          '<div class="ratio r-3-4"><img src="' + esc(v.poster) + '" alt="' + esc(v.title) + '" loading="lazy" decoding="async"></div>' +
          '<span class="play" aria-hidden="true"><svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor"><path d="M0 0l16 9-16 9z"/></svg></span>' +
          '<span class="rev-slide__cap">' + esc(v.title) + ' · видео</span>' +
          '</button>'
        );
      });
      if (limit) slides = slides.slice(0, limit);
      track.innerHTML = slides.join('');
    });
  }

  /* карусель: стрелки, точки, свайп (нативный scroll-snap) */
  function initSliders() {
    $$('.rev-carousel').forEach(function (car) {
      var track = $('.rev-carousel__track', car);
      if (!track) return;
      var prev = $('.rev-carousel__nav--p', car);
      var next = $('.rev-carousel__nav--n', car);
      var dotsBox = $('.rev-carousel__dots', car);
      var slides = function () { return $$('.rev-slide', track); };

      var step = function () {
        var s = slides()[0];
        if (!s) return track.clientWidth;
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
        return s.getBoundingClientRect().width + gap;
      };
      var count = slides().length;
      if (dotsBox && count) {
        dotsBox.innerHTML = slides().map(function (_, i) {
          return '<button class="rev-carousel__dot" type="button" aria-label="Слайд ' + (i + 1) + '"></button>';
        }).join('');
      }
      var dots = dotsBox ? $$('.rev-carousel__dot', dotsBox) : [];

      var current = function () { return Math.round(track.scrollLeft / step()); };
      var goTo = function (i) {
        i = Math.max(0, Math.min(count - 1, i));
        track.scrollTo({ left: i * step(), behavior: reduced ? 'auto' : 'smooth' });
      };
      var update = function () {
        var i = current();
        dots.forEach(function (d, di) { d.setAttribute('aria-current', String(di === i)); });
        if (prev) prev.disabled = i <= 0;
        if (next) next.disabled = i >= count - 1;
      };
      if (prev) prev.addEventListener('click', function () { goTo(current() - 1); });
      if (next) next.addEventListener('click', function () { goTo(current() + 1); });
      dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });
      var t = false;
      track.addEventListener('scroll', function () {
        if (t) return; t = true;
        window.requestAnimationFrame(function () { t = false; update(); });
      }, { passive: true });
      update();
    });
  }

  /* ---------------- misc ---------------- */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* prefill procedure select from ?p= */
  function initPrefill() {
    var p = new URLSearchParams(window.location.search).get('p');
    if (!p) return;
    $$('select[name="procedure"]').forEach(function (sel) {
      Array.prototype.forEach.call(sel.options, function (o) {
        if (o.value === p) sel.value = p;
      });
    });
  }

  function boot() {
    initWa();
    initHeader();
    initDrawer();
    initProcedurePage();
    initReviews();
    initSliders();
    initReveal();
    initParallax();
    initAcc();
    initLightbox();
    initFilters();
    initForms();
    initYear();
    initPrefill();
    initActiveNav();
    initCtaAnchor();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
