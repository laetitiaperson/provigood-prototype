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
})();
