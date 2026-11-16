/**
 * ============================================================================
 * SPARK CURSOR & INTERACTIVE ANIMATION ENGINE (Abisheak Portfolio Design)
 * High-performance 2D Canvas Sparks, Branching Lightning Arcs,
 * Dynamic Crimson Trailing Path, Expanding Click Shockwaves, and Magnetic Pull
 * ============================================================================
 */

(function () {
  'use strict';

  // Do not run on reduced motion or coarse pointer (touch devices)
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  ) {
    return;
  }

  // --- Initialize or Retrieve Canvas ---
  let canvas = document.getElementById('spark-cursor');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'spark-cursor';
    canvas.className = 'spark-cursor';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Configuration Constants
  const PARTICLE_COUNT = 160;  // bF
  const LIGHTNING_COUNT = 24;  // xF
  const TRAIL_HISTORY = 14;    // SF
  const COLOR_WHITE = '255,255,255'; // CF
  const COLOR_RED = '255,32,32';     // wF
  const COLOR_DEEP_RED = '160,0,18'; // TF

  // Particle & Lightning Object Pools
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    max: 1,
    size: 1,
    hot: false
  }));

  const lightnings = Array.from({ length: LIGHTNING_COUNT }, () => ({
    pts: [],
    life: 0,
    max: 1,
    width: 1,
    bright: false
  }));

  const trail = [];
  let particleIdx = 0;
  let lightningIdx = 0;

  let mouseX = -9999;
  let mouseY = -9999;
  let prevX = -9999;
  let prevY = -9999;

  let speed = 0;
  let glowIntensity = 0;
  let animId = 0;
  let isRunning = false;
  let lastTime = performance.now();
  let dpr = 1;

  // Resize Handler with DPR Scaling
  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Fractal Lightning Generator (EF Algorithm)
  function createLightningBranch(startX, startY, angle, length, ptsArray) {
    ptsArray.length = 0;
    const segments = 4 + Math.floor(Math.random() * 4);
    let currX = startX;
    let currY = startY;
    ptsArray.push(currX, currY);

    for (let i = 1; i <= segments; i++) {
      const segAngle = angle + (Math.random() - 0.5) * 1.1;
      const segLen = length / segments;
      currX += Math.cos(segAngle) * segLen;
      currY += Math.sin(segAngle) * segLen;
      ptsArray.push(currX, currY);
    }
  }

  // Spawn Particle Helper
  function spawnParticle(x, y, dx, dy, velScale) {
    const p = particles[particleIdx];
    particleIdx = (particleIdx + 1) % PARTICLE_COUNT;

    const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 2.6;
    const force = 0.05 + Math.random() * 0.25 * (0.5 + velScale);

    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle) * force + dx * 0.02;
    p.vy = Math.sin(angle) * force + dy * 0.02;
    p.max = p.life = 250 + Math.random() * 400;
    p.size = 0.6 + Math.random() * 1.6;
    p.hot = Math.random() < 0.15;
  }

  // Spawn Lightning Helper
  function spawnLightning(x, y, velScale, isBright) {
    const l = lightnings[lightningIdx];
    lightningIdx = (lightningIdx + 1) % LIGHTNING_COUNT;

    const angle = Math.random() * Math.PI * 2;
    const branchLen = (10 + Math.random() * 28) * (isBright ? 1.8 : 1) * (0.6 + velScale * 0.6);

    createLightningBranch(x, y, angle, branchLen, l.pts);
    l.max = l.life = isBright ? 160 : 70 + Math.random() * 80;
    l.width = isBright ? 1.6 : 0.6 + Math.random() * 0.8;
    l.bright = isBright;
  }

  // Pointer Move Handler
  function onPointerMove(e) {
    if (e.pointerType === 'touch') return;

    mouseX = e.clientX;
    mouseY = e.clientY;

    if (prevX < -999) {
      prevX = mouseX;
      prevY = mouseY;
    }

    const dx = mouseX - prevX;
    const dy = mouseY - prevY;
    const dist = Math.hypot(dx, dy);

    speed = Math.min(1.5, speed * 0.6 + dist / 40);
    const now = performance.now();

    trail.push({ x: mouseX, y: mouseY, t: now });
    if (trail.length > TRAIL_HISTORY) {
      trail.shift();
    }

    // Spawn sparks based on movement speed
    const spawnCount = Math.min(8, Math.floor(dist / 6) + (Math.random() < 0.4 ? 1 : 0));
    for (let i = 0; i < spawnCount; i++) {
      const frac = Math.random();
      spawnParticle(prevX + dx * frac, prevY + dy * frac, dx, dy, speed);
    }

    // Spawn lightning sparks on rapid flicks
    if (Math.random() < 0.15 + speed * 0.4) {
      spawnLightning(mouseX, mouseY, speed, false);
    }
    if (dist > 45 && Math.random() < 0.25) {
      spawnLightning(mouseX, mouseY, speed, true);
    }

    glowIntensity = Math.min(1, glowIntensity + dist / 120);
    prevX = mouseX;
    prevY = mouseY;

    if (!isRunning) {
      isRunning = true;
      lastTime = now;
      animId = requestAnimationFrame(render);
    }
  }

  // Render Loop
  function render(timestamp) {
    const dt = Math.min(48, timestamp - lastTime);
    lastTime = timestamp;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = 'lighter';

    let hasActiveParticles = false;

    // 1. Radial Cursor Crimson Glow
    glowIntensity *= Math.pow(0.992, dt);
    if (glowIntensity > 0.02) {
      hasActiveParticles = true;
      const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 70);
      grad.addColorStop(0, `rgba(255, 0, 30, ${0.15 * glowIntensity})`);
      grad.addColorStop(1, 'rgba(255, 0, 30, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(mouseX - 70, mouseY - 70, 140, 140);
    }

    // 2. Trailing Ribbon Path
    while (trail.length && timestamp - trail[0].t > 220) {
      trail.shift();
    }
    if (trail.length > 1) {
      hasActiveParticles = true;
      ctx.lineCap = 'round';
      for (let i = 1; i < trail.length; i++) {
        const ratio = 1 - (timestamp - trail[i].t) / 220;
        // Deep red outer core
        ctx.strokeStyle = `rgba(${COLOR_DEEP_RED}, ${ratio * 0.6})`;
        ctx.lineWidth = 3.2 * ratio;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();

        // Hot red / white highlight inner core
        ctx.strokeStyle = `rgba(${COLOR_RED}, ${ratio * 0.55})`;
        ctx.lineWidth = 0.9 * ratio;
        ctx.stroke();
      }
    }

    // 3. Lightning Arcs
    for (let i = 0; i < lightnings.length; i++) {
      const l = lightnings[i];
      if (l.life <= 0) continue;
      l.life -= dt;
      hasActiveParticles = true;

      const progress = Math.max(0, l.life / l.max) * (Math.random() < 0.25 ? 0.4 : 1);
      ctx.beginPath();
      ctx.moveTo(l.pts[0], l.pts[1]);
      for (let j = 2; j < l.pts.length; j += 2) {
        ctx.lineTo(l.pts[j], l.pts[j + 1]);
      }

      ctx.shadowBlur = l.bright ? 15 : 8;
      ctx.shadowColor = 'rgba(255, 0, 30, 0.45)';
      ctx.strokeStyle = `rgba(${COLOR_RED}, ${progress * 0.85})`;
      ctx.lineWidth = l.width * 2;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(${COLOR_WHITE}, ${progress * (l.bright ? 0.85 : 0.45)})`;
      ctx.lineWidth = l.width * 0.5;
      ctx.stroke();
    }

    // 4. Hot Sparks & Embers
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.life <= 0) continue;
      p.life -= dt;
      hasActiveParticles = true;

      const progress = Math.max(0, p.life / p.max);
      const oldX = p.x;
      const oldY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;

      ctx.strokeStyle = `rgba(${p.hot ? COLOR_WHITE : COLOR_RED}, ${progress * 0.9})`;
      ctx.lineWidth = p.size * progress;
      ctx.beginPath();
      ctx.moveTo(oldX - p.vx * 18, oldY - p.vy * 18);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    speed *= Math.pow(0.95, dt / 16);

    if (hasActiveParticles) {
      animId = requestAnimationFrame(render);
    } else {
      isRunning = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // --- Click Ripple Shockwave (pf-ripple) ---
  function spawnClickRipple(e) {
    const ripple = document.createElement('span');
    ripple.className = 'pf-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    }, { once: true });
  }
  window.addEventListener('pointerdown', spawnClickRipple, { passive: true });

  // --- Magnetic Pull & Micro-Interactions on Interactive Elements ---
  function initMagneticPull() {
    const magneticTargets = document.querySelectorAll(
      '.btn, .social-pill, .glass-chip, .filter-tab, [data-cursor="venom"]'
    );

    magneticTargets.forEach((el) => {
      let rect = null;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let isHovered = false;
      let rAF = null;

      function updateTransform() {
        if (!isHovered) {
          currentX += (0 - currentX) * 0.15;
          currentY += (0 - currentY) * 0.15;
          if (Math.abs(currentX) < 0.05 && Math.abs(currentY) < 0.05) {
            el.style.transform = '';
            return;
          }
        } else {
          currentX += (targetX - currentX) * 0.22;
          currentY += (targetY - currentY) * 0.22;
        }

        el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        rAF = requestAnimationFrame(updateTransform);
      }

      el.addEventListener('mouseenter', () => {
        rect = el.getBoundingClientRect();
        isHovered = true;
        cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(updateTransform);
      }, { passive: true });

      el.addEventListener('mousemove', (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        targetX = (e.clientX - centerX) * 0.32;
        targetY = (e.clientY - centerY) * 0.32;
      }, { passive: true });

      el.addEventListener('mouseleave', () => {
        isHovered = false;
        rect = null;
      }, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagneticPull);
  } else {
    initMagneticPull();
  }

})();
