/* Provigood — minimal vanilla JS */
(function () {
  'use strict';

  // ---------- Sticky header shadow on scroll ----------
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Mobile drawer ----------
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const openBtn = document.querySelector('.menu-toggle');
  const closeBtn = document.querySelector('.drawer-close');

  function openDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
    drawer.setAttribute('aria-hidden', 'false');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    const firstFocus = drawer.querySelector('a, button');
    if (firstFocus) firstFocus.focus();
  }

  function closeDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    drawer.setAttribute('aria-hidden', 'true');
    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    }
  }

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // Close drawer when a link inside is clicked
  if (drawer) {
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        // Allow nav, then close
        setTimeout(closeDrawer, 50);
      });
    });
  }

  // ---------- Desktop dropdown: keyboard accessibility ----------
  document.querySelectorAll('.has-dropdown').forEach((wrap) => {
    const toggle = wrap.querySelector('.dropdown-toggle');
    const menu = wrap.querySelector('.dropdown-menu');
    if (!toggle || !menu) return;

    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = menu.classList.contains('is-open');
      // Close all
      document.querySelectorAll('.dropdown-menu.is-open').forEach((m) => m.classList.remove('is-open'));
      document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
      if (!isOpen) {
        menu.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ---------- FAQ: ensure only one item open at a time (optional UX) ----------
  // Comment out to allow multiple open simultaneously.
  document.querySelectorAll('.faq-list').forEach((list) => {
    const items = list.querySelectorAll('.faq-item');
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach((other) => {
            if (other !== item) other.open = false;
          });
        }
      });
    });
  });

  // ---------- Contact form: type variants + URL param + submission ----------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const variants = document.querySelectorAll('.form-variant');
    const radios = document.querySelectorAll('input[name="contact-type"]');

    function showVariant(type) {
      variants.forEach((v) => {
        const match = v.dataset.variant === type;
        v.hidden = !match;
        // Disable hidden fields so they don't validate / submit
        v.querySelectorAll('input, select, textarea').forEach((el) => {
          el.disabled = !match;
        });
      });
    }

    // Initial: pick variant from ?type=... URL param
    const params = new URLSearchParams(window.location.search);
    const initialType = params.get('type');
    const validTypes = ['consulting', 'recruitment', 'training', 'olivo', 'coffee'];

    if (initialType && validTypes.includes(initialType)) {
      const matchedRadio = document.querySelector(`input[name="contact-type"][value="${initialType}"]`);
      if (matchedRadio) matchedRadio.checked = true;
      showVariant(initialType);
    } else {
      showVariant('consulting');
    }

    // Switch on radio change
    radios.forEach((r) => {
      r.addEventListener('change', (e) => {
        if (e.target.checked) showVariant(e.target.value);
      });
    });

    // Submit handler — fake submission, show success state
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Basic native validation already handled via `required` attrs
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // Hide everything except the success block
      contactForm.querySelectorAll(':scope > *:not(.form-success)').forEach((el) => {
        el.hidden = true;
      });
      // Also hide the type selector
      const selector = document.querySelector('.type-selector');
      if (selector) selector.hidden = true;

      const success = contactForm.querySelector('.form-success');
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ---------- Partner application form (partner.html) ----------
  const partnerForm = document.getElementById('partner-application-form');
  if (partnerForm) {
    partnerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!partnerForm.checkValidity()) {
        partnerForm.reportValidity();
        return;
      }
      // Hide all direct children except .form-success
      partnerForm.querySelectorAll(':scope > *:not(.form-success)').forEach((el) => {
        el.hidden = true;
      });
      const success = partnerForm.querySelector('.form-success');
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ---------- Testimonial form (testimonial.html) ----------
  const testimonialForm = document.getElementById('testimonial-form');
  if (testimonialForm) {
    testimonialForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!testimonialForm.checkValidity()) {
        testimonialForm.reportValidity();
        return;
      }
      testimonialForm.querySelectorAll(':scope > *:not(.form-success)').forEach((el) => {
        el.hidden = true;
      });
      const success = testimonialForm.querySelector('.form-success');
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ---------- YouTube IFrame API: enforce custom start/end times ----------
  // The native ?start= and ?end= URL parameters are unreliable; we use the
  // IFrame API to seek on ready and pause when the end time is reached.
  const ytFrames = document.querySelectorAll('iframe[data-end-time]');
  if (ytFrames.length > 0) {
    // Make sure each iframe has an id (the API attaches by id)
    ytFrames.forEach((frame, i) => {
      if (!frame.id) frame.id = 'yt-frame-' + i;
    });

    const initPlayers = () => {
      ytFrames.forEach((frame) => {
        const endTime = parseFloat(frame.dataset.endTime);
        if (!Number.isFinite(endTime)) return;

        let watchInterval = null;

        const watchEnd = (player) => {
          if (watchInterval) clearInterval(watchInterval);
          watchInterval = setInterval(() => {
            try {
              if (player.getCurrentTime() >= endTime) {
                player.pauseVideo();
                clearInterval(watchInterval);
                watchInterval = null;
              }
            } catch (err) {
              clearInterval(watchInterval);
              watchInterval = null;
            }
          }, 200);
        };

        // Note: start time is handled by the ?start= URL parameter alone.
        // Calling seekTo() on onReady was causing autoplay on some browsers.
        new YT.Player(frame.id, {
          events: {
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                watchEnd(event.target);
              } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                if (watchInterval) {
                  clearInterval(watchInterval);
                  watchInterval = null;
                }
              }
            },
          },
        });
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayers();
    } else {
      window.onYouTubeIframeAPIReady = initPlayers;
      if (!document.querySelector('script[src*="iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }
  }

  // ---------- Cookie consent banner + preferences modal ----------
  // Lightweight prototype implementation. On WordPress we'll swap this for a
  // proper plugin (e.g. CookieYes / Complianz). Preferences are stored in
  // localStorage under "provigood-cookie-consent".
  const CONSENT_KEY = 'provigood-cookie-consent';

  // Cookie banner & modal strings, localized per page language.
  // Detected via <html lang="..."> with 'en' as the safe fallback.
  const COOKIE_I18N = {
    en: {
      bannerTitle: 'We value your privacy',
      bannerDesc: 'We use cookies to make our site work, analyse traffic, and improve your experience. You can accept all, reject non-essential, or customize your choices. See our <a href="cookie-policy.html">Cookie Policy</a>.',
      acceptAll: 'Accept all',
      rejectAll: 'Reject all',
      customize: 'Customize',
      save: 'Save preferences',
      close: 'Close',
      modalTitle: 'Cookie preferences',
      modalDesc: 'Choose which categories of cookies we can use. Strictly necessary cookies are always on because the site cannot work without them. See our <a href="cookie-policy.html">Cookie Policy</a> for full details.',
      catNecessary: 'Strictly necessary',
      catNecessaryDesc: 'Required for core site functionality such as navigation, language preference, and security. Cannot be disabled.',
      catAnalytics: 'Analytics',
      catAnalyticsDesc: 'Help us understand how visitors use the site so we can improve it (e.g. Google Analytics). Aggregated and anonymised.',
      catMarketing: 'Marketing',
      catMarketingDesc: 'Used to measure the performance of our campaigns and to show you relevant content.',
      catThirdparty: 'Third-party content',
      catThirdpartyDesc: 'Enables embedded content from third parties (e.g. YouTube videos, maps). These providers may set their own cookies.',
    },
    fr: {
      bannerTitle: 'Votre vie privée nous importe',
      bannerDesc: 'Nous utilisons des cookies pour faire fonctionner le site, analyser le trafic et améliorer votre expérience. Vous pouvez tout accepter, refuser le non-essentiel ou personnaliser vos choix. Consultez notre <a href="cookie-policy.html">Politique relative aux cookies</a>.',
      acceptAll: 'Tout accepter',
      rejectAll: 'Tout refuser',
      customize: 'Personnaliser',
      save: 'Enregistrer mes préférences',
      close: 'Fermer',
      modalTitle: 'Préférences de cookies',
      modalDesc: 'Choisissez les catégories de cookies que nous pouvons utiliser. Les cookies strictement nécessaires sont toujours activés car le site ne peut pas fonctionner sans eux. Consultez notre <a href="cookie-policy.html">Politique relative aux cookies</a> pour plus de détails.',
      catNecessary: 'Strictement nécessaires',
      catNecessaryDesc: 'Requis pour le fonctionnement de base du site, comme la navigation, la préférence linguistique et la sécurité. Ne peuvent pas être désactivés.',
      catAnalytics: 'Analytiques',
      catAnalyticsDesc: "Nous aident à comprendre comment les visiteurs utilisent le site afin de l'améliorer (par exemple Google Analytics). Données agrégées et anonymisées.",
      catMarketing: 'Marketing',
      catMarketingDesc: 'Servent à mesurer la performance de nos campagnes et à vous proposer du contenu pertinent.',
      catThirdparty: 'Contenu tiers',
      catThirdpartyDesc: "Permettent d'afficher du contenu intégré provenant de tiers (vidéos YouTube, cartes, etc.). Ces fournisseurs peuvent déposer leurs propres cookies.",
    },
    vi: {
      bannerTitle: 'Chúng tôi tôn trọng quyền riêng tư của bạn',
      bannerDesc: 'Chúng tôi sử dụng cookie để vận hành trang web, phân tích lưu lượng và cải thiện trải nghiệm của bạn. Bạn có thể chấp nhận tất cả, từ chối phần không thiết yếu hoặc tùy chỉnh lựa chọn. Xem <a href="cookie-policy.html">Chính sách Cookie</a> của chúng tôi.',
      acceptAll: 'Chấp nhận tất cả',
      rejectAll: 'Từ chối tất cả',
      customize: 'Tùy chỉnh',
      save: 'Lưu tùy chọn',
      close: 'Đóng',
      modalTitle: 'Tùy chọn cookie',
      modalDesc: 'Chọn các loại cookie chúng tôi có thể sử dụng. Cookie thiết yếu luôn được bật vì trang web không thể hoạt động nếu thiếu. Xem <a href="cookie-policy.html">Chính sách Cookie</a> để biết chi tiết.',
      catNecessary: 'Cookie thiết yếu',
      catNecessaryDesc: 'Cần thiết cho hoạt động cốt lõi của trang web như điều hướng, ngôn ngữ ưu tiên và bảo mật. Không thể tắt.',
      catAnalytics: 'Phân tích',
      catAnalyticsDesc: 'Giúp chúng tôi hiểu cách người dùng tương tác với trang web để cải thiện trải nghiệm. Dữ liệu được tổng hợp và ẩn danh.',
      catMarketing: 'Tiếp thị',
      catMarketingDesc: 'Dùng để đo lường hiệu quả chiến dịch và đề xuất nội dung liên quan.',
      catThirdparty: 'Nội dung của bên thứ ba',
      catThirdpartyDesc: 'Cho phép hiển thị nội dung nhúng từ bên thứ ba (video YouTube, bản đồ, v.v.). Các nhà cung cấp này có thể đặt cookie riêng.',
    },
  };

  function cookieLang() {
    const raw = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
    return COOKIE_I18N[raw] ? raw : 'en';
  }
  function t(key) {
    return COOKIE_I18N[cookieLang()][key];
  }

  function readConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function writeConsent(prefs) {
    const payload = {
      necessary: true,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
      thirdparty: !!prefs.thirdparty,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    } catch (err) {
      /* ignore */
    }
    // Dispatch a custom event so other scripts could react if needed
    document.dispatchEvent(new CustomEvent('provigood:cookie-consent', { detail: payload }));
    return payload;
  }

  function buildBannerHTML() {
    return (
      '<aside class="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-desc">' +
      '  <h2 id="cookie-banner-title">' + t('bannerTitle') + '</h2>' +
      '  <p id="cookie-banner-desc">' + t('bannerDesc') + '</p>' +
      '  <div class="cookie-banner-actions">' +
      '    <button type="button" class="btn btn--primary btn--small js-cookie-accept">' + t('acceptAll') + '</button>' +
      '    <button type="button" class="btn btn--ghost btn--small js-cookie-reject">' + t('rejectAll') + '</button>' +
      '    <button type="button" class="btn btn--ghost btn--small js-cookie-customize">' + t('customize') + '</button>' +
      '  </div>' +
      '</aside>'
    );
  }

  function buildModalHTML(current) {
    const c = current || { analytics: true, marketing: true, thirdparty: true };
    const chk = (v) => (v ? 'checked' : '');
    return (
      '<div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">' +
      '  <div class="cookie-modal-dialog">' +
      '    <div class="cookie-modal-head">' +
      '      <h2 id="cookie-modal-title">' + t('modalTitle') + '</h2>' +
      '      <button type="button" class="cookie-modal-close js-cookie-modal-close" aria-label="' + t('close') + '">' +
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '      </button>' +
      '    </div>' +
      '    <p>' + t('modalDesc') + '</p>' +
      '    <div class="cookie-categories">' +
      '      <div class="cookie-category">' +
      '        <div class="cookie-category-head">' +
      '          <h3>' + t('catNecessary') + '</h3>' +
      '          <label class="cookie-toggle"><input type="checkbox" checked disabled data-category="necessary"><span class="cookie-toggle-slider"></span></label>' +
      '        </div>' +
      '        <p>' + t('catNecessaryDesc') + '</p>' +
      '      </div>' +
      '      <div class="cookie-category">' +
      '        <div class="cookie-category-head">' +
      '          <h3>' + t('catAnalytics') + '</h3>' +
      '          <label class="cookie-toggle"><input type="checkbox" ' + chk(c.analytics) + ' data-category="analytics"><span class="cookie-toggle-slider"></span></label>' +
      '        </div>' +
      '        <p>' + t('catAnalyticsDesc') + '</p>' +
      '      </div>' +
      '      <div class="cookie-category">' +
      '        <div class="cookie-category-head">' +
      '          <h3>' + t('catMarketing') + '</h3>' +
      '          <label class="cookie-toggle"><input type="checkbox" ' + chk(c.marketing) + ' data-category="marketing"><span class="cookie-toggle-slider"></span></label>' +
      '        </div>' +
      '        <p>' + t('catMarketingDesc') + '</p>' +
      '      </div>' +
      '      <div class="cookie-category">' +
      '        <div class="cookie-category-head">' +
      '          <h3>' + t('catThirdparty') + '</h3>' +
      '          <label class="cookie-toggle"><input type="checkbox" ' + chk(c.thirdparty) + ' data-category="thirdparty"><span class="cookie-toggle-slider"></span></label>' +
      '        </div>' +
      '        <p>' + t('catThirdpartyDesc') + '</p>' +
      '      </div>' +
      '    </div>' +
      '    <div class="cookie-modal-actions">' +
      '      <button type="button" class="btn btn--ghost btn--small js-cookie-reject">' + t('rejectAll') + '</button>' +
      '      <button type="button" class="btn btn--primary btn--small js-cookie-save">' + t('save') + '</button>' +
      '      <button type="button" class="btn btn--primary btn--small js-cookie-accept">' + t('acceptAll') + '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  function removeBanner() {
    const existing = document.querySelector('.cookie-banner');
    if (existing) existing.remove();
  }

  function removeModal() {
    const existing = document.querySelector('.cookie-modal');
    if (existing) existing.remove();
    document.body.classList.remove('no-scroll');
  }

  function showBanner() {
    if (document.querySelector('.cookie-banner')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = buildBannerHTML();
    document.body.appendChild(wrap.firstElementChild);
  }

  function showModal(prefill) {
    removeModal();
    const wrap = document.createElement('div');
    wrap.innerHTML = buildModalHTML(prefill);
    const modal = wrap.firstElementChild;
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    // Close on overlay click (only when clicking the backdrop, not the dialog)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) removeModal();
    });
  }

  function acceptAll() {
    writeConsent({ analytics: true, marketing: true, thirdparty: true });
    removeBanner();
    removeModal();
  }

  function rejectAll() {
    writeConsent({ analytics: false, marketing: false, thirdparty: false });
    removeBanner();
    removeModal();
  }

  function savePreferences() {
    const modal = document.querySelector('.cookie-modal');
    if (!modal) return;
    const prefs = {
      analytics: !!modal.querySelector('input[data-category="analytics"]')?.checked,
      marketing: !!modal.querySelector('input[data-category="marketing"]')?.checked,
      thirdparty: !!modal.querySelector('input[data-category="thirdparty"]')?.checked,
    };
    writeConsent(prefs);
    removeBanner();
    removeModal();
  }

  // Delegated click handler for all cookie-related actions
  document.addEventListener('click', (e) => {
    const target = e.target.closest(
      '.js-cookie-accept, .js-cookie-reject, .js-cookie-customize, .js-cookie-save, .js-cookie-modal-close, .js-cookie-settings'
    );
    if (!target) return;

    if (target.classList.contains('js-cookie-accept')) {
      e.preventDefault();
      acceptAll();
    } else if (target.classList.contains('js-cookie-reject')) {
      e.preventDefault();
      rejectAll();
    } else if (target.classList.contains('js-cookie-customize')) {
      e.preventDefault();
      showModal(readConsent());
    } else if (target.classList.contains('js-cookie-save')) {
      e.preventDefault();
      savePreferences();
    } else if (target.classList.contains('js-cookie-modal-close')) {
      e.preventDefault();
      removeModal();
    } else if (target.classList.contains('js-cookie-settings')) {
      e.preventDefault();
      showModal(readConsent());
    }
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.cookie-modal')) {
      removeModal();
    }
  });

  // Show banner on first visit
  if (!readConsent()) {
    // Defer slightly so it doesn't compete with the page paint
    setTimeout(showBanner, 300);
  }
})();
