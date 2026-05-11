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
      '  <h2 id="cookie-banner-title">We value your privacy</h2>' +
      '  <p id="cookie-banner-desc">We use cookies to make our site work, analyse traffic, and improve your experience. You can accept all, reject non-essential, or customize your choices. See our <a href="cookie-policy.html">Cookie Policy</a>.</p>' +
      '  <div class="cookie-banner-actions">' +
      '    <button type="button" class="btn btn--primary btn--small js-cookie-accept">Accept all</button>' +
      '    <button type="button" class="btn btn--ghost btn--small js-cookie-reject">Reject all</button>' +
      '    <button type="button" class="btn btn--ghost btn--small js-cookie-customize">Customize</button>' +
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
      '      <h2 id="cookie-modal-title">Cookie preferences</h2>' +
      '      <button type="button" class="cookie-modal-close js-cookie-modal-close" aria-label="Close">' +
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '      </button>' +
      '    </div>' +
      '    <p>Choose which categories of cookies we can use. Strictly necessary cookies are always on because the site cannot work without them. See our <a href="cookie-policy.html">Cookie Policy</a> for full details.</p>' +
      '    <div class="cookie-categories">' +
      '      <div class="cookie-category">' +
      '        <div class="cookie-category-head">' +
      '          <h3>Strictly necessary</h3>' +
      '          <label class="cookie-toggle"><input type="checkbox" checked disabled data-category="necessary"><span class="cookie-toggle-slider"></span></label>' +
      '        </div>' +
      '        <p>Required for core site functionality such as navigation, language preference, and security. Cannot be disabled.</p>' +
      '      </div>' +
      '      <div class="cookie-category">' +
      '        <div class="cookie-category-head">' +
      '          <h3>Analytics</h3>' +
      '          <label class="cookie-toggle"><input type="checkbox" ' + chk(c.analytics) + ' data-category="analytics"><span class="cookie-toggle-slider"></span></label>' +
      '        </div>' +
      '        <p>Help us understand how visitors use the site so we can improve it (e.g. Google Analytics). Aggregated and anonymised.</p>' +
      '      </div>' +
      '      <div class="cookie-category">' +
      '        <div class="cookie-category-head">' +
      '          <h3>Marketing</h3>' +
      '          <label class="cookie-toggle"><input type="checkbox" ' + chk(c.marketing) + ' data-category="marketing"><span class="cookie-toggle-slider"></span></label>' +
      '        </div>' +
      '        <p>Used to measure the performance of our campaigns and to show you relevant content.</p>' +
      '      </div>' +
      '      <div class="cookie-category">' +
      '        <div class="cookie-category-head">' +
      '          <h3>Third-party content</h3>' +
      '          <label class="cookie-toggle"><input type="checkbox" ' + chk(c.thirdparty) + ' data-category="thirdparty"><span class="cookie-toggle-slider"></span></label>' +
      '        </div>' +
      '        <p>Enables embedded content from third parties (e.g. YouTube videos, maps). These providers may set their own cookies.</p>' +
      '      </div>' +
      '    </div>' +
      '    <div class="cookie-modal-actions">' +
      '      <button type="button" class="btn btn--ghost btn--small js-cookie-reject">Reject all</button>' +
      '      <button type="button" class="btn btn--primary btn--small js-cookie-save">Save preferences</button>' +
      '      <button type="button" class="btn btn--primary btn--small js-cookie-accept">Accept all</button>' +
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
