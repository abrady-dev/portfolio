/**
 * Three.js 3D background scene: perspective grid, floating nodes, particle field.
 * Mouse movement parallaxes the camera for a depth effect. Only renders in dark mode.
 */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0d0f14, 0.038);

  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 80);
  camera.position.set(0, 2.5, 9);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  // Perspective grid floor — recedes to the horizon
  const grid1 = new THREE.GridHelper(80, 60, 0x1a3a6c, 0x0e1f38);
  grid1.position.y = -2;
  scene.add(grid1);

  const grid2 = new THREE.GridHelper(80, 20, 0x0e2040, 0x091828);
  grid2.position.y = -2.05;
  scene.add(grid2);

  // Floating particle field
  const PART_COUNT = 700;
  const pPos = new Float32Array(PART_COUNT * 3);
  for (let i = 0; i < PART_COUNT; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 44;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 32;
  }
  const pGeom = new THREE.BufferGeometry();
  pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x3b82f6, size: 0.055, transparent: true, opacity: 0.50, sizeAttenuation: true,
  });
  const particleSystem = new THREE.Points(pGeom, pMat);
  scene.add(particleSystem);

  // Wireframe icosahedra nodes
  const NODE_DEFS = [
    { pos: [-4.5,  0.4, -2.0], color: 0x3b82f6, size: 0.28, rx:  0.011, ry:  0.016 },
    { pos: [ 3.8, -0.6, -1.5], color: 0x6366f1, size: 0.22, rx: -0.009, ry:  0.013 },
    { pos: [-1.2,  1.4, -4.5], color: 0x8b5cf6, size: 0.32, rx:  0.014, ry: -0.011 },
    { pos: [ 5.2,  0.8, -6.0], color: 0x60a5fa, size: 0.20, rx: -0.012, ry:  0.019 },
    { pos: [-5.2, -0.8, -5.5], color: 0x4f46e5, size: 0.26, rx:  0.010, ry: -0.015 },
    { pos: [ 1.2, -1.2, -2.5], color: 0x7c3aed, size: 0.18, rx: -0.016, ry:  0.012 },
    { pos: [-3.0,  1.8, -8.0], color: 0x3b82f6, size: 0.35, rx:  0.008, ry:  0.014 },
    { pos: [ 4.0, -1.8, -8.5], color: 0x6366f1, size: 0.24, rx:  0.013, ry: -0.010 },
    { pos: [ 0.5,  0.8, -3.5], color: 0x8b5cf6, size: 0.21, rx: -0.011, ry:  0.017 },
    { pos: [-2.5, -1.5, -1.2], color: 0x60a5fa, size: 0.19, rx:  0.015, ry: -0.013 },
  ];

  const nodes = NODE_DEFS.map(def => {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(def.size, 0),
      new THREE.MeshBasicMaterial({ color: def.color, wireframe: true, transparent: true, opacity: 0.40 })
    );
    mesh.position.set(...def.pos);
    mesh.userData.rx = def.rx;
    mesh.userData.ry = def.ry;
    scene.add(mesh);
    return mesh;
  });

  // Connection lines between nearby nodes
  const lineMat = new THREE.LineBasicMaterial({ color: 0x2a4a8c, transparent: true, opacity: 0.22 });
  const LINK_DIST = 4.8;
  for (let i = 0; i < NODE_DEFS.length; i++) {
    for (let j = i + 1; j < NODE_DEFS.length; j++) {
      const a = new THREE.Vector3(...NODE_DEFS[i].pos);
      const b = new THREE.Vector3(...NODE_DEFS[j].pos);
      if (a.distanceTo(b) < LINK_DIST) {
        scene.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([a, b]),
          lineMat
        ));
      }
    }
  }

  // Soft ambient glow blobs
  [
    { pos: [-4,  2,  -3], color: 0x1d4ed8, opacity: 0.07, r: 5 },
    { pos: [ 5, -1,  -6], color: 0x4c1d95, opacity: 0.05, r: 6 },
    { pos: [ 0,  4, -12], color: 0x1e3a8a, opacity: 0.04, r: 8 },
  ].forEach(b => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(b.r, 10, 10),
      new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: b.opacity })
    );
    m.position.set(...b.pos);
    scene.add(m);
  });

  // Mouse parallax
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth  - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  // Scroll depth — push camera forward as user scrolls down
  let scrollProgress = 0;
  const mainEl = document.querySelector('.op2-main');
  function onScroll() {
    const el = mainEl || document.documentElement;
    const max = (el.scrollHeight || document.body.scrollHeight) - innerHeight;
    scrollProgress = Math.min((el.scrollTop || window.scrollY) / Math.max(max, 1), 1);
  }
  if (mainEl) {
    mainEl.addEventListener('scroll', onScroll, { passive: true });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  let lastTs = null;
  let raf = null;

  function animate(ts) {
    raf = requestAnimationFrame(animate);

    // Skip rendering in light mode to save GPU
    if (!isDark()) {
      lastTs = null;
      return;
    }

    const dt = lastTs === null ? 1 : Math.min((ts - lastTs) / 16.67, 3);
    lastTs = ts;

    nodes.forEach(n => {
      n.rotation.x += n.userData.rx * dt;
      n.rotation.y += n.userData.ry * dt;
    });

    particleSystem.rotation.y += 0.00015 * dt;

    // Camera parallax — gently follows the mouse with lerp
    camera.position.x += (mx * 1.6 - camera.position.x) * 0.022;
    camera.position.y += (-my * 0.8 + 2.5 - camera.position.y) * 0.022;
    camera.position.z  = 9 - scrollProgress * 3;
    camera.lookAt(mx * 0.25, my * -0.15, 0);

    renderer.render(scene, camera);
  }

  raf = requestAnimationFrame(animate);

  document.addEventListener('visibilitychange', () => {
    lastTs = null;
  });

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();
