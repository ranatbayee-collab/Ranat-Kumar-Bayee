/**
 * Three.js 3D Hero Scene
 * Interactive Cyber-Crystal, Orbiting Gimbal Rings & Responsive Particle Galaxy
 * Features: Mouse tracking, dynamic specular lighting, and scroll-linked 3D parallax
 */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  // Verify Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. Falling back to 2D background.');
    init2DFallback(canvas);
    return;
  }

  // --- Scene, Camera, Renderer Setup ---
  const scene = new THREE.Scene();
  const heroSection = document.querySelector('.hero-section');
  
  let width = heroSection ? heroSection.clientWidth : window.innerWidth;
  let height = heroSection ? heroSection.clientHeight : window.innerHeight;

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 12;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
  } catch (e) {
    console.error('WebGL error, initializing 2D fallback', e);
    init2DFallback(canvas);
    return;
  }

  // --- 3D Objects Container (Hero Pivot) ---
  const heroPivot = new THREE.Group();
  scene.add(heroPivot);

  // Responsive position and scale for hero 3D scene
  function updateHeroPivot() {
    if (window.innerWidth > 1024) {
      heroPivot.position.x = 2.4;
      heroPivot.scale.set(1, 1, 1);
    } else if (window.innerWidth <= 768) {
      heroPivot.position.x = 0;
      heroPivot.scale.set(0.72, 0.72, 0.72);
    } else {
      heroPivot.position.x = 0;
      heroPivot.scale.set(0.85, 0.85, 0.85);
    }
  }
  updateHeroPivot();

  // 1. Central Faceted Crystal Core (Optimized Standard Material for 120 FPS)
  const coreGeometry = new THREE.IcosahedronGeometry(2.2, 1);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x081226,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.24,
    roughness: 0.18,
    metalness: 0.82,
    flatShading: true,
    transparent: true,
    opacity: 0.92
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  heroPivot.add(coreMesh);

  // 2. Wireframe Cage Surrounding the Crystal
  const cageGeometry = new THREE.IcosahedronGeometry(2.65, 1);
  const cageWireframe = new THREE.WireframeGeometry(cageGeometry);
  const cageLine = new THREE.LineSegments(
    cageWireframe,
    new THREE.LineBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    })
  );
  heroPivot.add(cageLine);

  // 3. Orbiting Gyro Rings
  const ringMaterial1 = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x8b5cf6,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.7,
    wireframe: true
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.035, 16, 90), ringMaterial1);
  ring1.rotation.x = Math.PI / 3;
  heroPivot.add(ring1);

  const ringMaterial2 = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.8,
    wireframe: true
  });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.03, 16, 100), ringMaterial2);
  ring2.rotation.y = Math.PI / 4;
  heroPivot.add(ring2);

  // Satellite Nodes on Rings
  const satelliteGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const satMat1 = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  const satellite1 = new THREE.Mesh(satelliteGeo, satMat1);
  satellite1.position.set(3.6, 0, 0);
  ring1.add(satellite1);

  const satMat2 = new THREE.MeshBasicMaterial({ color: 0xec4899 });
  const satellite2 = new THREE.Mesh(satelliteGeo, satMat2);
  satellite2.position.set(0, 4.2, 0);
  ring2.add(satellite2);

  // 4. Stardust Particle Cloud (Optimized for 120 FPS)
  const particleCount = 450;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  const colorCyan = new THREE.Color(0x00f2fe);
  const colorPurple = new THREE.Color(0x8b5cf6);
  const colorPink = new THREE.Color(0xec4899);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 6 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i3 + 2] = radius * Math.cos(phi) - 3;

    // Pick random accent color
    const rand = Math.random();
    const chosenColor = rand < 0.5 ? colorCyan : (rand < 0.8 ? colorPurple : colorPink);
    particleColors[i3] = chosenColor.r;
    particleColors[i3 + 1] = chosenColor.g;
    particleColors[i3 + 2] = chosenColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  // Circular soft particle texture
  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = 32;
  particleCanvas.height = 32;
  const pCtx = particleCanvas.getContext('2d');
  const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(0,242,254,0.8)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  pCtx.fillStyle = gradient;
  pCtx.fillRect(0, 0, 32, 32);

  const pTexture = new THREE.CanvasTexture(particleCanvas);

  const particleMat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    map: pTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleCloud = new THREE.Points(particleGeo, particleMat);
  scene.add(particleCloud);

  // --- Lighting Setup ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Interactive Cursor Point Light (Moves with user pointer)
  const cursorLight = new THREE.PointLight(0x00f2fe, 3.5, 30);
  cursorLight.position.set(0, 0, 8);
  scene.add(cursorLight);

  // Secondary Complementary Violet Light
  const violetLight = new THREE.PointLight(0x8b5cf6, 2.8, 30);
  violetLight.position.set(-6, -4, 4);
  scene.add(violetLight);

  // Directional Rim Light
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
  rimLight.position.set(5, 8, 5);
  scene.add(rimLight);

  // --- Mouse & Motion Coordinates ---
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let scrollY = 0;
  let isVisible = true;

  // Track Mouse Movement (decoupled from render for 120 FPS smoothness)
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = mouseX * 0.7;
    targetRotationX = -mouseY * 0.5;
  }, { passive: true });

  // Track Touch Movement on Mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = mouseX * 0.7;
      targetRotationX = -mouseY * 0.5;
    }
  }, { passive: true });

  // Track Scroll for Parallax
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // Handle Resize
  window.addEventListener('resize', () => {
    if (!heroSection) return;
    width = heroSection.clientWidth;
    height = heroSection.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Responsive pivot adjustment
    updateHeroPivot();
  });

  // Pause rendering when hero is scrolled out of viewport
  if ('IntersectionObserver' in window && heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(heroSection);
  }

  // --- Main Animation Loop (High-Refresh Rate 120 FPS delta timing) ---
  let lastTime = performance.now();
  const startTime = lastTime;

  function animate(currentTime) {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const now = currentTime || performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const elapsedTime = (now - startTime) / 1000;

    // Frame-rate independent rotation of rings
    ring1.rotation.z += 0.42 * delta;
    ring1.rotation.x += 0.24 * delta;

    ring2.rotation.z -= 0.36 * delta;
    ring2.rotation.y += 0.3 * delta;

    // Core crystal self-rotation
    coreMesh.rotation.y = elapsedTime * 0.22;
    coreMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;
    cageLine.rotation.y = coreMesh.rotation.y;
    cageLine.rotation.x = coreMesh.rotation.x;

    // Particles slow galaxy rotation
    particleCloud.rotation.y = elapsedTime * 0.03;
    particleCloud.rotation.x = Math.cos(elapsedTime * 0.02) * 0.05;

    // Smooth frame-rate independent exponential damping (smooth on 60Hz and 120Hz)
    const lerpFactor = 1 - Math.exp(-8 * delta);
    heroPivot.rotation.y += (targetRotationY - heroPivot.rotation.y) * lerpFactor;
    heroPivot.rotation.x += (targetRotationX - heroPivot.rotation.x) * lerpFactor;

    cursorLight.position.x += (mouseX * 7 - cursorLight.position.x) * lerpFactor;
    cursorLight.position.y += (mouseY * 5 - cursorLight.position.y) * lerpFactor;

    // Scroll Linked 3D Depth
    const scrollFactor = scrollY * 0.002;
    heroPivot.position.y = -scrollFactor * 3.5;
    heroPivot.rotation.z = scrollFactor * 0.8;
    camera.position.z = 12 + scrollFactor * 2;

    renderer.render(scene, camera);
  }

  animate();

  // --- Fallback 2D Canvas for non-WebGL devices ---
  function init2DFallback(cvs) {
    const ctx = cvs.getContext('2d');
    let cw = (cvs.width = window.innerWidth);
    let ch = (cvs.height = window.innerHeight);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * cw,
      y: Math.random() * ch,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.4 + 0.1
    }));

    function draw() {
      ctx.clearRect(0, 0, cw, ch);
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < 0) s.y = ch;
        ctx.fillStyle = `rgba(0, 242, 254, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
})();

