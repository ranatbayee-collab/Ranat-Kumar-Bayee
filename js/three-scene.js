/**
 * ============================================================================
 * THREE.JS 3D HERO SHATTERED GLASS SHARD MIRROR & COSMIC WARP STARFIELD
 * (Exact Abisheak Portfolio Signature 3D Architecture)
 * 
 * Features:
 * 1. 3D Beveled Extruded Glass Shards UV-mapped with hero portrait
 * 2. Real-time Raycasting Shard Dragging with Spring Physics (stiffness: 85, damping: 14)
 * 3. 3D Perspective Tilt on Mouse Movement (shards + hero typography parallax)
 * 4. Cursor Hover Lift & Red Specular Point Light Tracking
 * 5. Scroll Explosive Shard Dispersal & Disintegration
 * 6. Background Cosmic Warp Crimson Starfield Shader
 * ============================================================================
 */

(function () {
  'use strict';

  const canvasMount = document.getElementById('hero-3d-mount');
  const heroCopyWrap = document.getElementById('hero-copy-wrap');
  const heroSection = document.querySelector('.hero-section');

  if (!canvasMount) return;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. Skipping 3D Hero scene.');
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // --- Canvas Setup ---
  let canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'hero-3d-canvas';
    canvasMount.appendChild(canvas);
  }

  // --- Colors & Tokens ---
  const glassReflectionColor = new THREE.Color(0x8b1118);
  const glassHighlightColor = new THREE.Color(0xd94a52);

  // --- Shard Polygon Geometry Coordinates (Yg, Vg, Hg, Ug, Wg, Gg, Kg, qg, Jg) ---
  const Vg = [0.22, 0];
  const Hg = [0.515, 0];
  const Ug = [0.84, 0];
  const Wg = [0.34, 1];
  const Gg = [0.865, 1];
  const Kg = [0.385, 0.72];
  const qg = [0.48, 0.62];
  const Jg = [0.716, 0.49];

  const Yg = [
    [[0, 0], Vg, qg, Kg, Wg, [0, 1]],
    [Vg, Hg, Jg, qg],
    [Hg, Ug, Jg],
    [Ug, [1, 0], [1, 1], Gg, Jg],
    [Kg, qg, Jg, Gg, Wg]
  ];

  const Xg = [Kg, qg, Jg];

  // Shard Spring Physics Parameters (Ed)
  const Ed = {
    stiffness: 85,
    damping: 14,
    maxOffsetRatio: 0.14
  };

  function updateSpring(state, target, dt) {
    if (target === 0 && Math.abs(state.position) < 0.0001 && Math.abs(state.velocity) < 0.0001) {
      state.position = 0;
      state.velocity = 0;
      return;
    }
    let r = Math.min(Math.max(dt, 0), 0.05);
    while (r > 0) {
      const step = Math.min(r, 1 / 120);
      state.velocity += ((target - state.position) * Ed.stiffness - state.velocity * Ed.damping) * step;
      state.position += state.velocity * step;
      r -= step;
    }
  }

  function clampOffset(val, max) {
    const limit = max * Ed.maxOffsetRatio;
    return Math.max(-limit, Math.min(limit, val));
  }

  // Layout Framing Function (Zg)
  function getLayoutFrame(w, h) {
    const isMobile = w < 768;
    if (isMobile) {
      const left = Math.min(Math.max(w * 0.04, 16), 24);
      const top = 76;
      const height = Math.min(h * 0.42, 350);
      const width = w - left * 2;
      return { left, top, width, height, mobile: true };
    } else {
      const left = w * 0.055;
      const top = Math.max(h * 0.085, 96);
      const height = h - top - h * 0.085;
      const width = w - left * 2;
      return { left, top, width, height, mobile: false };
    }
  }

  // Polygon Inset Function (Qg)
  function insetPolygon(pts, inset) {
    const n = pts.length;
    const isClockwise = pts.reduce((sum, curr, idx) => {
      const next = pts[(idx + 1) % n];
      return sum + (curr[0] * next[1] - next[0] * curr[1]);
    }, 0) > 0 ? 1 : -1;

    const segments = pts.map((curr, idx) => {
      const next = pts[(idx + 1) % n];
      let normX = -(next[1] - curr[1]);
      let normY = next[0] - curr[0];
      const len = Math.hypot(normX, normY) || 1;
      normX = (normX / len) * isClockwise * inset;
      normY = (normY / len) * isClockwise * inset;
      return [
        [curr[0] + normX, curr[1] + normY],
        [next[0] + normX, next[1] + normY]
      ];
    });

    return segments.map((seg, idx) => {
      const prevSeg = segments[(idx - 1 + n) % n];
      const [r, a] = prevSeg;
      const [o, s] = seg;
      const dx1 = a[0] - r[0];
      const dy1 = a[1] - r[1];
      const dx2 = s[0] - o[0];
      const dy2 = s[1] - o[1];
      const denom = dx1 * dy2 - dy1 * dx2;
      if (Math.abs(denom) < 1e-9) return o;
      const t = ((o[0] - r[0]) * dy2 - (o[1] - r[1]) * dx2) / denom;
      return [r[0] + dx1 * t, r[1] + dy1 * t];
    });
  }

  // Rounded Corner Beveled Shape Builder ($g)
  function createRoundedShape(pts, radius) {
    const shape = new THREE.Shape();
    const len = pts.length;
    for (let i = 0; i < len; i++) {
      const curr = pts[i];
      const prev = pts[(i - 1 + len) % len];
      const next = pts[(i + 1) % len];
      const v1 = [prev[0] - curr[0], prev[1] - curr[1]];
      const v2 = [next[0] - curr[0], next[1] - curr[1]];
      const d1 = Math.hypot(v1[0], v1[1]);
      const d2 = Math.hypot(v2[0], v2[1]);
      const r = Math.min(radius, d1 * 0.4, d2 * 0.4);
      const p1 = [curr[0] + (v1[0] / d1) * r, curr[1] + (v1[1] / d1) * r];
      const p2 = [curr[0] + (v2[0] / d2) * r, curr[1] + (v2[1] / d2) * r];

      if (i === 0) shape.moveTo(p1[0], p1[1]);
      else shape.lineTo(p1[0], p1[1]);
      shape.quadraticCurveTo(curr[0], curr[1], p2[0], p2[1]);
    }
    shape.closePath();
    return shape;
  }

  // --- Three.js Scene, Camera, Renderer ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.25 : 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  } catch (err) {
    console.error('WebGL init error:', err);
    return;
  }

  // --- 1. Cosmic Starfield Background Particle Nebula ---
  const PARTICLE_COUNT = isCoarsePointer ? 800 : 1600;
  const DEPTH = 65.0;
  const starPos = new Float32Array(PARTICLE_COUNT * 3);
  const starSize = new Float32Array(PARTICLE_COUNT);
  const starSeed = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const rad = Math.pow(Math.random(), 0.7) * 24.0;
    const ang = Math.random() * Math.PI * 2;
    starPos[i * 3] = Math.cos(ang) * rad * 1.4 + (Math.random() - 0.5) * 4.0;
    starPos[i * 3 + 1] = Math.sin(ang) * rad * 0.9 + (Math.random() - 0.5) * 4.0;
    starPos[i * 3 + 2] = -Math.random() * DEPTH;
    starSize[i] = Math.random() < 0.08 ? 7.0 + Math.random() * 9.0 : 1.2 + Math.random() * 3.0;
    starSeed[i] = Math.random();
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSize, 1));
  starGeo.setAttribute('aSeed', new THREE.BufferAttribute(starSeed, 1));

  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTravel: { value: 0 },
      uDepth: { value: DEPTH },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSpeed: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uClock: { value: 0 }
    },
    vertexShader: `
      attribute float aSize;
      attribute float aSeed;
      uniform float uTime;
      uniform float uTravel;
      uniform float uDepth;
      uniform vec2 uMouse;
      uniform float uSpeed;
      uniform float uPixelRatio;
      uniform float uClock;

      varying float vAlpha;
      varying float vSize;
      varying float vSeed;

      void main() {
        vSeed = aSeed;
        vSize = aSize;
        vec3 pos = position;

        float z = mod(pos.z + uTravel * 25.0, uDepth) - uDepth;
        pos.z = z;

        float wave = sin(uClock * 1.3 + pos.z * 0.07) * 0.4;
        pos.x += wave + uMouse.x * (pos.z * -0.03);
        pos.y += cos(uClock * 1.1 + pos.z * 0.07) * 0.4 + uMouse.y * (pos.z * -0.03);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float dist = max(0.5, -mvPosition.z);
        gl_PointSize = (aSize * (1.0 + uSpeed * 1.3) * (160.0 / dist)) * uPixelRatio;

        vAlpha = smoothstep(-uDepth, -5.0, pos.z) * smoothstep(0.0, -8.0, pos.z);
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vSize;
      varying float vSeed;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float d = length(coord);
        if (d > 0.5) discard;

        float core = exp(-d * d * 60.0);
        float halo = exp(-d * d * 7.0) * (0.35 + vSize * 0.04);
        float a = (core + halo) * vAlpha;
        if (a < 0.003) discard;

        vec3 col = mix(vec3(0.85, 0.04, 0.09), vec3(1.0, 0.28, 0.26), core * (0.4 + vSeed * 0.6));
        gl_FragColor = vec4(col * a, a);
      }
    `
  });

  const starfield = new THREE.Points(starGeo, starMat);
  starfield.frustumCulled = false;
  scene.add(starfield);

  // --- 2. Shards 3D Group & Hierarchy ---
  const shardGroup = new THREE.Group();
  scene.add(shardGroup);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const dirLight1 = new THREE.DirectionalLight(0xffeedd, 0.85);
  dirLight1.position.set(-4, 5, 6);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(glassHighlightColor, 0.5);
  dirLight2.position.set(5, -3, 2);
  scene.add(dirLight2);

  // Cursor Specular Point Light (follows mouse over shards)
  const hoverPointLight = new THREE.PointLight(glassReflectionColor, 0, 6, 1.6);
  hoverPointLight.position.set(0, 0, 1.5);
  scene.add(hoverPointLight);

  // Load Hero Texture (assets/hero-red-bg.jpg - Red & Black Cyberpunk Signature)
  let isTextureLoaded = false;
  const textureLoader = new THREE.TextureLoader();
  const heroTexture = textureLoader.load('assets/hero1.png', () => {
    isTextureLoaded = true;
    if (baseMaterial) {
      baseMaterial.emissiveMap = heroTexture;
      baseMaterial.needsUpdate = true;
    }
    rebuildShards();
  });
  heroTexture.anisotropy = 8;

  // Base Physical Material with Red Iridescence Reflections
  const baseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x17171b,
    roughness: 0.36,
    metalness: 0.0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    iridescence: 0.55,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [100, 400],
    emissive: 0xffffff,
    emissiveMap: heroTexture,
    emissiveIntensity: 0.95
  });

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: glassHighlightColor,
    transparent: true,
    opacity: 0.28
  });

  let shards = [];
  let shardMeshes = [];
  let frameWidth = 1;
  let frameHeight = 1;
  let isMobileLayout = false;

  // Build / Rebuild 3D Shards
  function rebuildShards() {
    shards.forEach(s => {
      shardGroup.remove(s.mesh);
      s.mesh.geometry.dispose();
      s.edge.geometry.dispose();
      s.mat.dispose();
    });
    shards = [];

    const now = performance.now() / 1000;

    Yg.forEach((poly, idx) => {
      const pts = poly.map(pt => {
        let [px, py] = pt;
        const xIdx = Xg.indexOf(pt);
        if (xIdx >= 0 && !prefersReducedMotion) {
          px += Math.sin(now * 0.5 + xIdx * 2.1) * 0.005;
          py += Math.cos(now * 0.4 + xIdx * 1.3) * 0.005;
        }
        return [(px - 0.5) * frameWidth, (0.5 - py) * frameHeight];
      });

      const insetPts = insetPolygon(pts, Math.min(frameWidth, frameHeight) * 0.012);
      const roundedShape = createRoundedShape(insetPts, Math.min(frameWidth, frameHeight) * 0.035);
      const depth = Math.min(frameWidth, frameHeight) * 0.045;

      const geometry = new THREE.ExtrudeGeometry(roundedShape, {
        depth: depth,
        bevelEnabled: true,
        bevelThickness: depth * 0.35,
        bevelSize: depth * 0.3,
        bevelSegments: 3,
        curveSegments: 8
      });
      geometry.translate(0, 0, -depth);

      // UV Mapping so the portrait displays seamlessly across the full mirror
      const posAttr = geometry.attributes.position;
      const uvAttr = geometry.attributes.uv;
      const targetAspect = 16 / 9;
      const currentAspect = frameWidth / frameHeight;
      let scaleX = 1;
      let scaleY = 1;
      if (currentAspect > targetAspect) {
        scaleY = targetAspect / currentAspect;
      } else {
        scaleX = currentAspect / targetAspect;
      }

      // On mobile (narrow aspect ratio), center directly on Ranat's face and glowing red visor (energy center X ~ 0.74)
      const centerU = isMobileLayout ? 0.74 : 0.62;
      for (let i = 0; i < posAttr.count; i++) {
        const normX = (posAttr.getX(i) / frameWidth) + 0.5;
        const normY = (posAttr.getY(i) / frameHeight) + 0.5;
        const u = (normX - 0.5) * scaleX + centerU;
        const v = (normY - 0.5) * scaleY + 0.5;
        uvAttr.setXY(i, Math.min(1, Math.max(0, u)), Math.min(1, Math.max(0, v)));
      }
      uvAttr.needsUpdate = true;

      const mat = baseMaterial.clone();
      const mesh = new THREE.Mesh(geometry, mat);

      // Red Wireframe Edges
      const edgeGeo = new THREE.EdgesGeometry(geometry, 25);
      const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMaterial);
      mesh.add(edgeMesh);

      // Centroid & Direction for explosive dispersal
      const center = pts.reduce((acc, p) => [acc[0] + p[0] / pts.length, acc[1] + p[1] / pts.length], [0, 0]);
      const dir = new THREE.Vector3(center[0] / frameWidth, center[1] / frameHeight, 0.4 + (idx % 3) * 0.25).normalize();
      const spin = new THREE.Vector3((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.8);

      mesh.userData.idx = idx;
      shardGroup.add(mesh);

      shards.push({
        mesh: mesh,
        edge: edgeMesh,
        mat: mat,
        center: new THREE.Vector2(center[0], center[1]),
        dir: dir,
        spin: spin,
        lift: 0,
        phase: idx * 1.37,
        x: { position: 0, velocity: 0 },
        y: { position: 0, velocity: 0 },
        targetX: 0,
        targetY: 0
      });
    });
    shardMeshes = shards.map(s => s.mesh);
  }

  // --- Layout Resize Handler ---
  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;

    const frame = getLayoutFrame(width, height);
    const vFovRad = THREE.MathUtils.degToRad(camera.fov / 2);
    const visibleHeightAtZ0 = 2 * camera.position.z * Math.tan(vFovRad);
    const scaleFactor = visibleHeightAtZ0 / height;

    frameWidth = frame.width * scaleFactor;
    frameHeight = frame.height * scaleFactor;

    const centerYOffset = (frame.top - (height - frame.top - frame.height)) / 2;
    shardGroup.position.set(0, -centerYOffset * scaleFactor, 0);

    isMobileLayout = frame.mobile;
    camera.updateProjectionMatrix();

    rebuildShards();

    // Position Hero Typography Copy Wrap
    if (heroCopyWrap) {
      if (frame.mobile) {
        Object.assign(heroCopyWrap.style, {
          left: '0px',
          top: '0px',
          width: '100%',
          height: 'auto'
        });
      } else {
        Object.assign(heroCopyWrap.style, {
          left: `${frame.left}px`,
          top: `${frame.top}px`,
          width: `${frame.width}px`,
          height: `${frame.height}px`
        });
      }
    }
  }

  window.addEventListener('resize', onResize, { passive: true });
  onResize();

  // --- Pointer & Drag Interaction (Raycasting & Spring Dragging) ---
  const mouseNorm = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  const dragPlane = new THREE.Plane();
  const intersectPoint = new THREE.Vector3();
  const localPoint = new THREE.Vector3();

  let draggedIdx = -1;
  let activePointerId = null;
  let dragStartInitialZ = 0;
  const dragAnchorOffset = new THREE.Vector2();
  let isPointerActive = false;

  function onPointerMove(e) {
    mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;
    isPointerActive = true;

    // If dragging a shard
    if (draggedIdx >= 0 && e.pointerId === activePointerId) {
      raycaster.setFromCamera(mouseNorm, camera);
      if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
        const local = shardGroup.worldToLocal(intersectPoint.clone());
        const s = shards[draggedIdx];
        s.targetX = clampOffset(dragAnchorOffset.x + local.x - localPoint.x, frameWidth);
        s.targetY = clampOffset(dragAnchorOffset.y + local.y - localPoint.y, frameHeight);
      }
    }
  }

  function onPointerDown(e) {
    if (
      window.scrollY > window.innerHeight * 0.85 ||
      draggedIdx >= 0 ||
      (e.pointerType === 'mouse' && e.button !== 0) ||
      e.target.closest('a, button, input, textarea, nav, select, [role="button"]')
    ) {
      return;
    }

    onPointerMove(e);
    scene.updateMatrixWorld(true);
    raycaster.setFromCamera(mouseNorm, camera);

    const hits = raycaster.intersectObjects(shardMeshes, false);
    if (!hits.length) return;

    draggedIdx = hits[0].object.userData.idx;
    activePointerId = e.pointerId;

    const s = shards[draggedIdx];
    dragStartInitialZ = s.mesh.position.z;
    dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), hits[0].point);
    localPoint.copy(shardGroup.worldToLocal(hits[0].point.clone()));
    dragAnchorOffset.set(s.x.position, s.y.position);

    document.body.classList.add('shard-dragging');
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onPointerUp(e) {
    if (draggedIdx < 0) return;
    const s = shards[draggedIdx];
    s.targetX = 0;
    s.targetY = 0;
    draggedIdx = -1;

    document.body.classList.remove('shard-dragging');
    document.body.style.cursor = '';
    activePointerId = null;
  }

  function onPointerLeave() {
    isPointerActive = false;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('pointercancel', onPointerUp, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('blur', onPointerUp, { passive: true });

  // --- Animation & Render Loop ---
  const groupTilt = { x: 0, y: 0 };
  let hoveredIdx = -1;
  let scrollProgress = 0;
  let lastTime = performance.now();
  let scrollY = window.scrollY;
  let travelDistance = 0;

  function updateCanvasPointerEvents() {
    if (!canvas) return;
    if (window.scrollY < window.innerHeight * 0.85) {
      canvas.style.pointerEvents = 'auto';
    } else {
      canvas.style.pointerEvents = 'none';
    }
  }

  let scrollRAF = null;
  function onScroll() {
    const curScrollY = window.scrollY;
    travelDistance += (curScrollY - scrollY) * 0.02;
    scrollY = curScrollY;
    if (!scrollRAF) {
      scrollRAF = requestAnimationFrame(() => {
        updateCanvasPointerEvents();
        scrollRAF = null;
      });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateCanvasPointerEvents();

  function animate(now) {
    requestAnimationFrame(animate);

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const time = now / 1000;
    const damp = factor => 1 - Math.exp(-factor * dt);

    // 1. Mouse Tilt on Shard Group (only active when near hero section)
    const inHero = window.scrollY < window.innerHeight * 0.85;
    const targetTiltX = draggedIdx >= 0 ? groupTilt.x : inHero && isPointerActive && !prefersReducedMotion ? -mouseNorm.y * THREE.MathUtils.degToRad(5.5) : 0;
    const targetTiltY = draggedIdx >= 0 ? groupTilt.y : inHero && isPointerActive && !prefersReducedMotion ? mouseNorm.x * THREE.MathUtils.degToRad(7.0) : 0;

    groupTilt.x += (targetTiltX - groupTilt.x) * damp(5);
    groupTilt.y += (targetTiltY - groupTilt.y) * damp(5);

    shardGroup.rotation.set(groupTilt.x, groupTilt.y, 0);
    shardGroup.updateMatrixWorld(true);

    // 2. Scroll-Linked Explosive Dispersal
    const heroH = Math.max(window.innerHeight * 0.75, 400);
    const rawScroll = THREE.MathUtils.clamp(window.scrollY / heroH, 0, 1);
    scrollProgress += (rawScroll - scrollProgress) * damp(8);
    // Smooth cubic easing for explosion curve
    const explosionFactor = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);

    // Only render shard meshes when near hero section for peak framerate
    shardGroup.visible = window.scrollY < window.innerHeight * 1.35;

    // 3. Hover Raycast & Specular Point Light Follower
    hoveredIdx = -1;
    if (inHero && isPointerActive && !isCoarsePointer && explosionFactor < 0.05) {
      raycaster.setFromCamera(mouseNorm, camera);
      const hits = raycaster.intersectObjects(shardMeshes, false);
      if (hits.length) {
        hoveredIdx = hits[0].object.userData.idx;
        const pt = hits[0].point;
        hoverPointLight.position.set(pt.x, pt.y, pt.z + 1.2);
      }
    }

    const targetLightIntensity = hoveredIdx >= 0 || draggedIdx >= 0 ? 1.5 : 0;
    hoverPointLight.intensity += (targetLightIntensity - hoverPointLight.intensity) * damp(6);

    // 4. Update Each Shard
    if (shardGroup.visible) {
      shards.forEach((s, idx) => {
        const isInteracting = draggedIdx === idx || s.x.position !== 0 || s.y.position !== 0;
        const targetLift = (!isInteracting && hoveredIdx === idx) ? 1 : 0;
        s.lift += (targetLift - s.lift) * damp(7);

        // Spring physics updates
        updateSpring(s.x, s.targetX, dt);
        updateSpring(s.y, s.targetY, dt);

        const floatWave = (prefersReducedMotion || isInteracting) ? 0 : Math.sin(time * 0.8 + s.phase) * 0.03;
        const explosionLen = explosionFactor * Math.max(frameWidth, frameHeight) * 0.95;

        const posX = s.dir.x * explosionLen + s.x.position;
        const posY = s.dir.y * explosionLen + s.y.position;
        const posZ = (draggedIdx === idx ? dragStartInitialZ : floatWave + s.lift * 0.38) + s.dir.z * explosionLen * 0.6;

        s.mesh.position.set(posX, posY, posZ);

        // Rotational tilt on spin & mouse
        const rotX = s.spin.x * explosionFactor - s.lift * 0.05 * mouseNorm.y - s.y.position * 0.06;
        const rotY = s.spin.y * explosionFactor + s.lift * 0.06 * mouseNorm.x + s.x.position * 0.06;
        const rotZ = s.spin.z * explosionFactor + s.x.position * 0.025;

        s.mesh.rotation.set(rotX, rotY, rotZ);
        s.mat.emissiveIntensity = (isTextureLoaded ? 0.95 : 0) * (1 - explosionFactor * 0.5) + s.lift * 0.1;
      });
    }

    // 5. Parallax Hero Copy Typography in 3D Perspective (Desktop only)
    if (heroCopyWrap && !prefersReducedMotion && !isMobileLayout) {
      const copyRotX = (-groupTilt.x * 180) / Math.PI;
      const copyRotY = (groupTilt.y * 180) / Math.PI;
      const copyTransX = -explosionFactor * 140;
      const copyTransY = -explosionFactor * 60;
      const copyTransZ = explosionFactor * 80;

      heroCopyWrap.style.transform = `perspective(1400px) rotateX(${copyRotX}deg) rotateY(${copyRotY}deg) translate3d(${copyTransX}px, ${copyTransY}px, ${copyTransZ}px)`;
      heroCopyWrap.style.opacity = String(Math.max(0, 1 - explosionFactor * 1.3));
    } else if (heroCopyWrap && isMobileLayout) {
      heroCopyWrap.style.transform = 'none';
      heroCopyWrap.style.opacity = '1';
    }

    // 6. Update Starfield Nebula (Persistent Across All Sections!)
    const starUniforms = starMat.uniforms;
    starUniforms.uTime.value = time;
    starUniforms.uClock.value = time;
    starUniforms.uTravel.value = travelDistance;
    starUniforms.uMouse.value.set(mouseNorm.x, mouseNorm.y);

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

})();
