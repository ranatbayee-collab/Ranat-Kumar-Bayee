/**
 * Main Application Logic
 * Typewriter, Scroll Reveals, 3D Tilt, Skills & Projects Filter, Live Clock, and Contact
 */

(function () {
  'use strict';

  // --- Dynamic Current Year ---
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Scroll State Variables & Elements ---
  const progressBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  // Unified High-Performance 120Hz/V-Sync Scroll Engine
  let scrollTicking = false;

  function updateScrollState() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const totalHeight = docHeight - windowHeight;

    // Progress Bar
    const progress = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    // Back to top visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Active Nav Link on Scroll (Scrollspy)
    let currentId = '';
    const scrollPos = scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    // Check if bottom of page is reached
    if ((windowHeight + Math.round(scrollY)) >= docHeight - 60) {
      currentId = 'contact';
    }

    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateScrollState();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Initial call on load
  updateScrollState();

  // --- Back to Top Action ---
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Mobile Navigation Menu ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  function setMobileMenuState(isOpen) {
    if (!mobileToggle || !navMenu) return;
    if (isOpen) {
      navMenu.classList.add('open');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileToggle.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`;
    } else {
      navMenu.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>`;
    }
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      setMobileMenuState(!isOpen);
    });

    // Close menu when clicking any nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        setMobileMenuState(false);
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        setMobileMenuState(false);
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        setMobileMenuState(false);
      }
    });
  }


  // --- Scroll Reveal Animations (Intersection Observer) ---
  const revealElements = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');

          // If element contains stat numbers, trigger count-up
          const statNumber = entry.target.querySelector('.stat-number');
          if (statNumber && !statNumber.dataset.counted) {
            statNumber.dataset.counted = 'true';
            animateNumberCounter(statNumber);
          }

          // If element is a skill card, animate bar width
          const barFill = entry.target.querySelector('.skill-bar-fill');
          if (barFill && !barFill.dataset.filled) {
            barFill.dataset.filled = 'true';
            const targetWidth = barFill.dataset.width || '80%';
            setTimeout(() => {
              barFill.style.width = targetWidth;
            }, 150);
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // --- Number Counter Animation ---
  function animateNumberCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // --- Interactive Typewriter Effect ---
  const typedSpan = document.getElementById('typewriter');
  if (typedSpan) {
    const phrases = [
      'Full-Stack Developer',
      'AI Engineer',
      'Problem Solver',
      'MERN & Python Specialist'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 120;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typedSpan.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 60;
      } else {
        typedSpan.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 120;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at completion
        typeDelay = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeDelay = 500;
      }

      setTimeout(typeLoop, typeDelay);
    }

    typeLoop();
  }

  // --- 3D Card Tilt Effect on Mouse Move (rAF & Rect-cached) ---
  const tiltCards = document.querySelectorAll('.hero-3d-card, .project-card, .about-main-card');
  tiltCards.forEach(card => {
    let cardRect = null;
    let tiltTicking = false;
    let targetX = 0;
    let targetY = 0;

    card.addEventListener('mouseenter', () => {
      cardRect = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener('mousemove', (e) => {
      if (!cardRect) cardRect = card.getBoundingClientRect();
      targetX = e.clientX - cardRect.left;
      targetY = e.clientY - cardRect.top;

      if (!tiltTicking) {
        requestAnimationFrame(() => {
          if (!cardRect) return;
          // Update CSS variables for radial hover sheen
          card.style.setProperty('--mouse-x', `${targetX}px`);
          card.style.setProperty('--mouse-y', `${targetY}px`);

          const centerX = cardRect.width / 2;
          const centerY = cardRect.height / 2;

          const rotateX = ((targetY - centerY) / centerY) * -7;
          const rotateY = ((targetX - centerX) / centerX) * 7;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
          tiltTicking = false;
        });
        tiltTicking = true;
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      cardRect = null;
    });
  });

  // --- Skills Filter Functionality ---
  const skillTabs = document.querySelectorAll('.filter-tab[data-skill-filter]');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.skillFilter;

      skillCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.classList.add('revealed');
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          
          // Re-trigger bar fill
          const bar = card.querySelector('.skill-bar-fill');
          if (bar) {
            bar.style.width = bar.dataset.width || '80%';
          }
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- Projects Filter Functionality ---
  const projTabs = document.querySelectorAll('.filter-tab[data-proj-filter]');
  const projCards = document.querySelectorAll('.project-card');

  projTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      projTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.projFilter;

      projCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.style.display = card.classList.contains('featured') ? 'grid' : 'flex';
          card.classList.add('revealed');
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- Live Bhubaneswar World Clock (Asia/Kolkata UTC+5:30) ---
  const clockElement = document.getElementById('live-clock');
  function updateLiveClock() {
    if (!clockElement) return;
    try {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat([], options);
      clockElement.textContent = formatter.format(new Date());
    } catch (e) {
      clockElement.textContent = new Date().toLocaleTimeString();
    }
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // --- Contact Form Submission & Validation ---
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const msgInput = document.getElementById('contact-msg');

    // Real-time error clearing on input
    [nameInput, emailInput, msgInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => clearError(inp));
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Validate Name
      if (!nameInput.value.trim()) {
        showError(nameInput, 'Please enter your name');
        isValid = false;
      } else {
        clearError(nameInput);
      }

      // Validate Email
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, 'Please provide a valid email address');
        isValid = false;
      } else {
        clearError(emailInput);
      }

      // Validate Message
      if (!msgInput.value.trim()) {
        showError(msgInput, 'Please enter your message');
        isValid = false;
      } else {
        clearError(msgInput);
      }

      if (!isValid) return;

      // Submit feedback simulation & mailto trigger
      if (formStatus) {
        formStatus.textContent = 'Thank you! Opening your email client to deliver your message...';
        formStatus.className = 'form-status success';
        formStatus.style.display = 'block';
      }

      const mailtoLink = `mailto:souravkumarswain3333@gmail.com?subject=${encodeURIComponent(
        'Portfolio Contact from ' + nameInput.value.trim()
      )}&body=${encodeURIComponent(msgInput.value.trim() + '\n\nSender Email: ' + emailInput.value.trim())}`;

      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 700);

      contactForm.reset();
    });
  }

  function showError(input, message) {
    const errorBox = input.parentElement.querySelector('.form-error');
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
    }
    input.style.borderColor = '#f87171';
  }

  function clearError(input) {
    const errorBox = input.parentElement.querySelector('.form-error');
    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.textContent = '';
    }
    input.style.borderColor = '';
  }

  // --- Resume Print Action ---
  const printResumeBtn = document.getElementById('print-resume-btn');
  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // --- Theme Toggle Logic ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('sourava_portfolio_theme') || 'dark';

  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcon(true);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isCurrentlyLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('sourava_portfolio_theme', 'dark');
        updateThemeIcon(false);
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('sourava_portfolio_theme', 'light');
        updateThemeIcon(true);
      }
    });
  }

  function updateThemeIcon(isLight) {
    if (!themeToggleBtn) return;
    if (isLight) {
      themeToggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Theme');
    } else {
      themeToggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      themeToggleBtn.setAttribute('aria-label', 'Switch to Light Theme');
    }
  }
})();

