/**
 * 3D Immersive Preloader Controller
 * Handles 3D gyroscope tracking, progress animation, asset readiness, and cinematic exit transition.
 */

(function () {
  'use strict';

  // Prevent scroll during loading
  document.body.classList.add('is-loading');

  const preloader = document.getElementById('app-preloader');
  const barFill = document.getElementById('preloader-fill');
  const percentText = document.getElementById('preloader-percent');
  const statusText = document.getElementById('preloader-status');
  const pivot = document.getElementById('loader-pivot');

  if (!preloader) return;

  const statusMessages = [
    { threshold: 0, text: 'Initializing 3D runtime...' },
    { threshold: 25, text: 'Loading WebGL shaders & geometry...' },
    { threshold: 55, text: 'Hydrating glassmorphic layers...' },
    { threshold: 80, text: 'Calibrating neural experience...' },
    { threshold: 100, text: 'System ready' }
  ];

  let currentPercent = 0;
  let targetPercent = 15;
  let isWindowLoaded = false;
  let animationFrameId = null;
  const startTime = performance.now();
  const MIN_DISPLAY_TIME = 1200; // minimum 1.2s for pleasant 3D animation
  const MAX_DISPLAY_TIME = 2800; // max safety timeout 2.8s

  // --- 3D Mouse Tilt Parallax for the Loader (rAF throttled) ---
  let loaderTiltTicking = false;
  let loaderTiltX = 0;
  let loaderTiltY = 0;

  function onMouseMove(e) {
    if (!pivot || preloader.classList.contains('preloader-hidden')) return;
    const { innerWidth, innerHeight } = window;
    loaderTiltX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
    loaderTiltY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

    if (!loaderTiltTicking) {
      requestAnimationFrame(() => {
        if (pivot && !preloader.classList.contains('preloader-hidden')) {
          pivot.style.transform = `rotateX(${-loaderTiltY * 22}deg) rotateY(${loaderTiltX * 22}deg)`;
        }
        loaderTiltTicking = false;
      });
      loaderTiltTicking = true;
    }
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Update status message according to progress percentage
  function updateStatus(val) {
    let msg = statusMessages[0].text;
    for (let i = statusMessages.length - 1; i >= 0; i--) {
      if (val >= statusMessages[i].threshold) {
        msg = statusMessages[i].text;
        break;
      }
    }
    if (statusText && statusText.textContent !== msg) {
      statusText.textContent = msg;
    }
  }

  // Smooth progress ticker loop
  function tick() {
    const elapsed = performance.now() - startTime;

    if (isWindowLoaded) {
      // Accelerate to 100% once assets are fully loaded and min display time met
      if (elapsed >= MIN_DISPLAY_TIME) {
        targetPercent = 100;
      } else {
        // Smoothly approach 90% while waiting for minimum display time
        targetPercent = Math.min(90, Math.floor((elapsed / MIN_DISPLAY_TIME) * 90));
      }
    } else {
      // Natural progression while assets are fetching
      const timeProgress = Math.min(85, Math.floor((elapsed / MAX_DISPLAY_TIME) * 85));
      targetPercent = Math.max(targetPercent, timeProgress);
    }

    // Safety maximum timeout
    if (elapsed >= MAX_DISPLAY_TIME) {
      targetPercent = 100;
    }

    // Interpolate currentPercent towards targetPercent
    if (currentPercent < targetPercent) {
      currentPercent += Math.ceil((targetPercent - currentPercent) * 0.12);
      if (currentPercent > 100) currentPercent = 100;
    }

    // Update DOM indicators
    if (barFill) barFill.style.width = `${currentPercent}%`;
    if (percentText) percentText.textContent = `${currentPercent}%`;
    updateStatus(currentPercent);

    if (currentPercent >= 100) {
      finishLoading();
      return;
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  // Finalize loading and transition out
  function finishLoading() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Update final states
    if (barFill) barFill.style.width = '100%';
    if (percentText) percentText.textContent = '100%';
    if (statusText) statusText.textContent = 'System ready';

    // Delay slightly for user satisfaction
    setTimeout(() => {
      preloader.classList.add('preloader-hidden');
      document.body.classList.remove('is-loading');
      window.removeEventListener('mousemove', onMouseMove);

      // Clean up preloader from DOM after transition finishes
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.style.display = 'none';
        }
      }, 700);

      // Trigger custom loaded event for components if needed
      window.dispatchEvent(new CustomEvent('portfolioReady'));
    }, 280);
  }

  // Window load event listener
  if (document.readyState === 'complete') {
    isWindowLoaded = true;
  } else {
    window.addEventListener('load', () => {
      isWindowLoaded = true;
    });
  }

  // Start ticker
  animationFrameId = requestAnimationFrame(tick);
})();
