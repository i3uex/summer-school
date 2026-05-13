/* ==========================================================================
   LLMA4SE 2025 — Gradient SaaS Redesign · Interactions
   ========================================================================== */

(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const reduceMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slugify = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  /* -------------------------------------------------------
     1. Scroll progress bar
     ------------------------------------------------------- */
  const progress = $('#scrollProgress');
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    if (progress) progress.style.width = `${Math.max(0, Math.min(100, scrolled))}%`;
  };

  /* -------------------------------------------------------
     2. Navbar scroll state + mobile menu + active link
     ------------------------------------------------------- */
  const nav = $('#nav');
  const navLinksEl = $('#navLinks');
  const navToggle = $('#navToggle');

  const updateNav = () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };

  if (navToggle && navLinksEl) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinksEl.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navLinksEl.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinksEl.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const sectionsForNav = $$('section[id]');
  const navAnchors = $$('#navLinks a');
  const updateActiveNav = () => {
    const y = window.scrollY + 120;
    let activeId = null;
    sectionsForNav.forEach((sec) => {
      if (sec.offsetTop <= y) activeId = sec.id;
    });
    navAnchors.forEach((a) =>
      a.classList.toggle('is-active', a.getAttribute('href') === `#${activeId}`)
    );
  };

  /* -------------------------------------------------------
     3. Reveal on scroll
     ------------------------------------------------------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion()) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* -------------------------------------------------------
     4. Parallax blobs on hero
     ------------------------------------------------------- */
  const blobs = $$('.hero .blob');
  let parallaxTicking = false;
  const onParallax = () => {
    if (reduceMotion()) return;
    const y = window.scrollY;
    blobs.forEach((b, i) => {
      const factor = (i + 1) * 0.08;
      b.style.transform = `translate3d(0, ${y * factor}px, 0)`;
    });
    parallaxTicking = false;
  };

  /* -------------------------------------------------------
     5. Counter up animation for stats
     ------------------------------------------------------- */
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (reduceMotion()) {
      el.textContent = `${prefix}${target}${suffix}`;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const value = Math.round(target * ease(p));
      el.textContent = `${prefix}${value}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => counterIO.observe(c));
  } else {
    counters.forEach((c) => animateCount(c));
  }

  /* -------------------------------------------------------
     6. Agenda tabs
     ------------------------------------------------------- */
  const tabs = $$('.agenda-tab');
  const panels = $$('.agenda-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const day = tab.dataset.day;
      tabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', String(isActive));
      });
      panels.forEach((p) =>
        p.classList.toggle('is-active', p.dataset.panel === day)
      );
    });
  });

  /* -------------------------------------------------------
     7. Speaker modal (with deep link)
     ------------------------------------------------------- */
  const speakerTriggers = $$('.speaker-card-trigger');
  const speakerChips = $$('.speaker-chip');
  const modal = $('#speakerModal');
  const backdrop = $('#modalBackdrop');
  const modalContent = $('#modalContent');
  const modalClose = $('#modalClose');

  const nameToCard = new Map();
  speakerTriggers.forEach((card) => {
    const name = card.dataset.nombre;
    if (name) nameToCard.set(name, card);
  });

  const openSpeakerByCard = (card) => {
    if (!card || !modal) return;
    const name = card.dataset.nombre || '';
    const aff = card.dataset.institution || '';
    const topic = card.dataset.tema || '';
    const bio = card.dataset.shortbio || '';
    const photo = card.dataset.foto || '';
    const contact = card.dataset.contacto || '';
    const abstract = card.dataset.abstract || '';

    $('#modalName').textContent = name;
    $('#modalAff').textContent = aff;
    const photoEl = $('#modalPhoto');
    photoEl.src = photo;
    photoEl.alt = name;

    const meta = $('#modalMeta');
    meta.innerHTML = '';
    if (topic) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `<i class="fas fa-lightbulb"></i> ${topic}`;
      meta.appendChild(chip);
    }

    const abstractSection = $('#modalAbstractSection');
    if (abstract) {
      $('#modalAbstract').textContent = abstract;
      abstractSection.hidden = false;
    } else {
      abstractSection.hidden = true;
    }

    $('#modalBio').textContent = bio;

    const contactSection = $('#modalContactSection');
    const contactLink = $('#modalContact');
    if (contact && contact.includes('@') && !contact.includes('example.com')) {
      contactLink.textContent = contact;
      contactLink.href = `mailto:${contact}`;
      contactSection.hidden = false;
    } else {
      contactSection.hidden = true;
    }

    modal.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    const slug = slugify(name);
    if (history && slug) {
      history.replaceState(null, '', `#speaker=${slug}`);
    }
  };

  const closeSpeaker = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    if (location.hash.startsWith('#speaker=')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  };

  speakerTriggers.forEach((card) => {
    card.addEventListener('click', () => openSpeakerByCard(card));
    card.tabIndex = 0;
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSpeakerByCard(card);
      }
    });
  });

  speakerChips.forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = chip.dataset.speaker;
      const card = nameToCard.get(name);
      if (card) openSpeakerByCard(card);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeSpeaker);
  if (backdrop) backdrop.addEventListener('click', closeSpeaker);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSpeaker();
      closeLightbox();
    }
  });

  // Initial deep link
  const openFromHash = () => {
    const hash = location.hash || '';
    if (hash.startsWith('#speaker=')) {
      const slug = hash.slice('#speaker='.length);
      for (const [name, card] of nameToCard.entries()) {
        if (slugify(name) === slug) {
          openSpeakerByCard(card);
          break;
        }
      }
    }
  };

  /* -------------------------------------------------------
     8. Lightbox for Cáceres gallery
     ------------------------------------------------------- */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('#lightboxClose');
  const lightboxTriggers = $$('.lightbox-trigger');

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    if (!modal || !modal.classList.contains('is-open')) {
      document.body.style.overflow = '';
    }
  };

  lightboxTriggers.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const src = a.dataset.img || a.getAttribute('href');
      const img = a.querySelector('img');
      const alt = img ? img.alt : '';
      openLightbox(src, alt);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* -------------------------------------------------------
     9. Cursor spotlight on speakers grid
     ------------------------------------------------------- */
  const grid = $('#speakersGrid');
  if (grid && !reduceMotion() && window.matchMedia('(pointer: fine)').matches) {
    grid.addEventListener('mousemove', (e) => {
      const rect = grid.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      grid.style.setProperty('--mx', `${x}%`);
      grid.style.setProperty('--my', `${y}%`);
    });
  }

  /* -------------------------------------------------------
    10. Magnetic CTA buttons
     ------------------------------------------------------- */
  const magnets = $$('[data-magnetic]');
  if (!reduceMotion() && window.matchMedia('(pointer: fine)').matches) {
    magnets.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* -------------------------------------------------------
    11. Back to top
     ------------------------------------------------------- */
  const toTop = $('#toTop');
  const updateToTop = () => {
    if (!toTop) return;
    toTop.classList.toggle('is-visible', window.scrollY > 600);
  };
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    });
  }

  /* -------------------------------------------------------
    12. Smooth scroll with nav offset for in-page anchors
     ------------------------------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#speaker=')) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduceMotion() ? 'auto' : 'smooth',
      });
    });
  });

  /* -------------------------------------------------------
    13. Scroll listener orchestrator
     ------------------------------------------------------- */
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateNav();
      updateActiveNav();
      updateToTop();
      if (!parallaxTicking) {
        parallaxTicking = true;
        onParallax();
      }
      scrollTicking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  /* -------------------------------------------------------
    14. Init
     ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    updateNav();
    updateActiveNav();
    updateToTop();
    openFromHash();
  });

  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#speaker=')) openFromHash();
  });
})();
