/**
 * Custom Fluid Magnetic Cursor & Interactive Animation
 * Features: Dual-layer smooth trailing, magnetic button attraction, and click ripple effects
 */

(function () {
  'use strict';

  // Do not run on touch or coarse-pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  const cursorDot = document.getElementById('cursor-dot');
  const cursorCircle = document.getElementById('cursor-circle');

  if (!cursorDot || !cursorCircle) return;

  let mouseX = -100;
  let mouseY = -100;
  let circleX = -100;
  let circleY = -100;
  let isMoving = false;

  // Track cursor position smoothly without blocking UI thread
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isMoving) {
      circleX = mouseX;
      circleY = mouseY;
      isMoving = true;
      cursorDot.style.opacity = '1';
      cursorCircle.style.opacity = '1';
    }
  }, { passive: true });

  // Hide cursor elements when leaving window
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorCircle.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (isMoving) {
      cursorDot.style.opacity = '1';
      cursorCircle.style.opacity = '1';
    }
  });

  // High-performance 120Hz/V-Sync render loop with delta-time lerp
  let lastCursorTime = performance.now();
  function renderCursor(now) {
    if (isMoving) {
      const dt = Math.min((now - lastCursorTime) / 1000, 0.1);
      // Frame-rate independent exponential damping for ultra-smooth 120fps tracking
      const factor = 1 - Math.exp(-24 * dt);
      circleX += (mouseX - circleX) * factor;
      circleY += (mouseY - circleY) * factor;

      cursorCircle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0) translate(-50%, -50%)`;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }
    lastCursorTime = now;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Click Ripple Effect
  window.addEventListener('click', (e) => {
    createClickRipple(e.clientX, e.clientY);
  });

  function createClickRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Inject ripple keyframes style
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    .cursor-click-ripple {
      position: fixed;
      width: 8px;
      height: 8px;
      border: 2px solid var(--accent-cyan, #00f2fe);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9997;
      transform: translate(-50%, -50%);
      animation: rippleExpand 0.55s ease-out forwards;
    }
    @keyframes rippleExpand {
      0% {
        width: 8px;
        height: 8px;
        opacity: 1;
      }
      100% {
        width: 55px;
        height: 55px;
        opacity: 0;
        border-color: var(--accent-purple, #8b5cf6);
      }
    }
  `;
  document.head.appendChild(rippleStyle);

  // Magnetic & Hover States for Links & Buttons
  function setupHoverListeners() {
    const interactables = document.querySelectorAll(
      'a, button, input, textarea, select, .filter-tab, .social-pill, .chip-item, .info-card'
    );

    interactables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });

      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });

    // Magnetic pull on primary buttons and social pills (optimized with rect caching & rAF)
    const magneticElements = document.querySelectorAll('.btn, .social-pill, .theme-toggle-btn');
    magneticElements.forEach((btn) => {
      let btnRect = null;
      let magnetTicking = false;
      let targetDx = 0;
      let targetDy = 0;

      btn.addEventListener('mouseenter', () => {
        btnRect = btn.getBoundingClientRect();
      }, { passive: true });

      btn.addEventListener('mousemove', (e) => {
        if (!btnRect) {
          btnRect = btn.getBoundingClientRect();
        }
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;

        targetDx = (e.clientX - btnCenterX) * 0.28;
        targetDy = (e.clientY - btnCenterY) * 0.28;

        if (!magnetTicking) {
          requestAnimationFrame(() => {
            btn.style.transform = `translate3d(${targetDx}px, ${targetDy}px, 0)`;
            magnetTicking = false;
          });
          magnetTicking = true;
        }
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btnRect = null;
      }, { passive: true });
    });
  }

  // Initialize once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHoverListeners);
  } else {
    setupHoverListeners();
  }
})();

