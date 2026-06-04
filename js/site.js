/* 404TABLE 官網 V2 — 共用互動 */
(function () {
  'use strict';

  /* ---- 行動版選單 ---- */
  function initDrawer() {
    var openBtn = document.getElementById('menu-open');
    var closeBtn = document.getElementById('menu-close');
    var drawer = document.getElementById('mobile-drawer');
    if (!drawer) return;
    function open() { drawer.classList.remove('closed'); document.body.style.overflow = 'hidden'; }
    function close() { drawer.classList.add('closed'); document.body.style.overflow = ''; }
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  }

  /* ---- 滾動進度條 ---- */
  function initProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    }
    document.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---- 進場淡入 ---- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Toast ---- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span class="material-symbols-outlined">check_circle</span><span>' + msg + '</span>';
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }
  window.tableToast = toast;

  /* ---- Modal ---- */
  function initModals() {
    // 任何帶 data-modal-open="id" 的元素 → 開啟對應 modal
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-modal-open]');
      if (opener) {
        var m = document.getElementById(opener.getAttribute('data-modal-open'));
        if (m) {
          m.classList.add('open');
          document.body.style.overflow = 'hidden';
          // 帶入課程/空間名稱
          var title = opener.getAttribute('data-title');
          if (title) {
            var slot = m.querySelector('[data-fill-title]');
            if (slot) slot.textContent = title;
            var hidden = m.querySelector('input[name="項目"]');
            if (hidden) hidden.value = title;
          }
        }
        return;
      }
      if (e.target.closest('[data-modal-close]') || e.target.classList.contains('modal-backdrop')) {
        var open = document.querySelector('.modal-backdrop.open');
        if (open) { open.classList.remove('open'); document.body.style.overflow = ''; }
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var open = document.querySelector('.modal-backdrop.open');
        if (open) { open.classList.remove('open'); document.body.style.overflow = ''; }
      }
    });
  }

  /* ---- 表單假送出 ---- */
  function initForms() {
    document.querySelectorAll('form[data-fake-submit]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = form.getAttribute('data-success') || '已收到你的資料，我們會盡快與你聯絡！';
        form.reset();
        var modal = form.closest('.modal-backdrop');
        if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
        toast(msg);
      });
    });
  }

  /* ---- 水平捲動箭頭（課程列） ---- */
  function initScrollers() {
    document.querySelectorAll('[data-scroller]').forEach(function (wrap) {
      var track = wrap.querySelector('[data-track]');
      if (!track) return;
      wrap.querySelectorAll('[data-scroll]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var dir = btn.getAttribute('data-scroll') === 'right' ? 1 : -1;
          track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: 'smooth' });
        });
      });
    });
  }

  /* ---- 課程分類篩選 ---- */
  function initFilter() {
    var chips = document.querySelectorAll('[data-filter]');
    if (!chips.length) return;
    var cards = document.querySelectorAll('[data-cat]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        var f = chip.getAttribute('data-filter');
        cards.forEach(function (card) {
          var show = f === 'all' || card.getAttribute('data-cat') === f;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer(); initProgress(); initReveal(); initModals();
    initForms(); initScrollers(); initFilter();
  });
})();
