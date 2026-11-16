/**
 * ============================================================================
 * CYBER GLITCH PRELOADER CONTROLLER (Abisheak Portfolio Design)
 * Dual Rolling Digit Strips, Blur Dissolve Statement, Chromatic Glitch Slices,
 * and Polygon Veil Tear Reveal Transition
 * ============================================================================
 */

(function () {
  'use strict';

  // Prevent scroll during loading
  document.body.style.overflow = 'hidden';

  const loader = document.getElementById('glitch-loader');
  if (!loader) {
    document.body.style.overflow = '';
    return;
  }

  const tensStrip = document.getElementById('loader-tens');
  const onesStrip = document.getElementById('loader-ones');
  const finalCount = document.getElementById('loader-final');
  const digitsWrap = loader.querySelector('.glitch-loader__count');
  const statement = document.getElementById('loader-statement');
  const words = statement ? statement.querySelectorAll('.glitch-loader__word') : [];

  let currentPercent = 0;
  let targetPercent = 15;
  let isWindowLoaded = false;
  let isRevealing = false;
  let animationId = null;
  const startTime = performance.now();
  const MIN_DISPLAY_TIME = 1100;
  const MAX_SAFETY_TIME = 2600;

  // Window load state listener
  if (document.readyState === 'complete') {
    isWindowLoaded = true;
  } else {
    window.addEventListener('load', () => {
      isWindowLoaded = true;
    });
  }

  // Preloader step ticker
  let lastTime = performance.now();

  function tick(now) {
    const dt = Math.min(64, now - lastTime);
    lastTime = now;
    const elapsed = now - startTime;

    if (isWindowLoaded) {
      if (elapsed >= MIN_DISPLAY_TIME) {
        targetPercent = 100;
      } else {
        targetPercent = Math.min(95, Math.floor((elapsed / MIN_DISPLAY_TIME) * 95));
      }
    } else {
      const naturalProgress = Math.min(88, Math.floor((elapsed / MAX_SAFETY_TIME) * 88));
      targetPercent = Math.max(targetPercent, naturalProgress);
    }

    if (elapsed >= MAX_SAFETY_TIME) {
      targetPercent = 100;
    }

    // Smooth interpolation towards targetPercent
    currentPercent += Math.max(0.2, (targetPercent - currentPercent) * 0.08 * (dt / 16));
    if (currentPercent > 100) currentPercent = 100;

    const displayInt = Math.floor(currentPercent);
    const progressRatio = currentPercent / 100;

    // Update Rolling Counter Digit Strips
    const tens = Math.floor(displayInt / 10) % 10;
    const ones = displayInt % 10;

    if (tensStrip) {
      tensStrip.style.transform = `translateY(-${tens * 1}em)`;
    }
    if (onesStrip) {
      onesStrip.style.transform = `translateY(-${ones * 1}em)`;
    }

    // Update Statement Word Fade & Unblur
    if (statement) {
      statement.style.filter = `blur(${(1 - progressRatio) * 6}px)`;
      if (words.length) {
        words.forEach((w, idx) => {
          const wordOffset = idx / words.length;
          const wordAlpha = Math.max(0, Math.min(1, (progressRatio - wordOffset * 0.7) * 3));
          w.style.opacity = wordAlpha;
        });
      }
    }

    // Completion Trigger
    if (currentPercent >= 99.8 && !isRevealing) {
      isRevealing = true;
      currentPercent = 100;

      // Show final 100 display
      if (tensStrip && onesStrip) {
        tensStrip.style.transform = 'translateY(-10em)';
        onesStrip.style.transform = 'translateY(-10em)';
      }
      if (finalCount) {
        finalCount.style.display = 'block';
        if (tensStrip && tensStrip.parentElement) tensStrip.parentElement.style.display = 'none';
        if (onesStrip && onesStrip.parentElement) onesStrip.parentElement.style.display = 'none';
      }

      // Trigger Glitch Slices & Curtain Reveal
      loader.classList.add('is-revealing');

      setTimeout(() => {
        document.body.style.overflow = '';
        loader.style.pointerEvents = 'none';
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.4s ease';

        setTimeout(() => {
          loader.remove();
          window.dispatchEvent(new Event('resize'));
        }, 400);
      }, 1100);

      return;
    }

    animationId = requestAnimationFrame(tick);
  }

  animationId = requestAnimationFrame(tick);

})();
