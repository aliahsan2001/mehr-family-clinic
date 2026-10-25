/* Home hero: a translucent glass heart floating in soft teal light. It "breathes" on a slow
   in-4 / out-6 rhythm. Pastel shapes drift behind it so the glass has something to refract,
   and a soft coral core glows inside. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const BG = new THREE.Color('#f4faf9');

function heartGeometry() {
  // classic heart outline, extruded with a deep bevel so it reads as a soft, puffy solid
  const s = new THREE.Shape();
  s.moveTo(0, -1.05);
  s.bezierCurveTo(-0.35, -0.72, -1.25, -0.25, -1.25, 0.35);
  s.bezierCurveTo(-1.25, 0.9, -0.82, 1.18, -0.42, 1.18);
  s.bezierCurveTo(-0.15, 1.18, 0, 1.0, 0, 0.82);
  s.bezierCurveTo(0, 1.0, 0.15, 1.18, 0.42, 1.18);
  s.bezierCurveTo(0.82, 1.18, 1.25, 0.9, 1.25, 0.35);
  s.bezierCurveTo(1.25, -0.25, 0.35, -0.72, 0, -1.05);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.32, curveSegments: 48, bevelEnabled: true,
    bevelThickness: 0.42, bevelSize: 0.3, bevelSegments: 18,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

function backdrop() {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(30, 18),
    new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: { uBg: { value: BG }, uGlow: { value: new THREE.Color('#9fdcd6') }, uTime: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */ `
        uniform vec3 uBg, uGlow; uniform float uTime; varying vec2 vUv;
        void main(){
          vec2 p = vUv - vec2(0.62, 0.52);
          p.x *= 1.7;
          float g = exp(-dot(p, p) * 9.0) * (0.85 + 0.15 * sin(uTime * 0.6));
          gl_FragColor = vec4(mix(uBg, uGlow, g), 1.0);
        }`,
    })
  );
}

export function mountHeart(canvas) {
  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = BG;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 9);

  const bg = backdrop();
  bg.position.z = -6;
  scene.add(bg);

  // soft pastel shapes behind the glass
  const blobs = [
    ['#7fd1c7', 0.62, [-1.1, 0.9, -2.4]], ['#b9a7e0', 0.48, [1.3, -0.8, -2.0]], ['#f5b8a6', 0.36, [0.9, 1.25, -3]],
    ['#a8e6cf', 0.5, [-0.9, -1.2, -2.8]], ['#0f8b8d', 0.24, [1.7, 0.35, -1.6]],
  ].map(([c, r, p], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0 }));
    m.position.set(...p);
    m.userData = { base: new THREE.Vector3(...p), phase: i * 1.7 };
    scene.add(m);
    return m;
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.025, 16, 160), new THREE.MeshStandardMaterial({ color: '#0f8b8d', roughness: 0.3, metalness: 0.4 }));
  ring.position.z = -1.8;
  scene.add(ring);

  const heart = new THREE.Group();
  const glass = new THREE.Mesh(heartGeometry(), new THREE.MeshPhysicalMaterial({
    color: '#ffffff', transmission: 1, thickness: 1.4, roughness: 0.06, ior: 1.42,
    attenuationColor: new THREE.Color('#5cc6bd'), attenuationDistance: 2.2,
    clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.35, iridescenceIOR: 1.3,
    specularIntensity: 1, envMapIntensity: 1.3,
  }));
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 32), new THREE.MeshStandardMaterial({ color: '#ff8f7a', emissive: '#ff6f5c', emissiveIntensity: 0.9, roughness: 0.4 }));
  core.position.set(0, 0.12, 0);
  heart.add(core, glass);
  scene.add(heart);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfeeea, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0x9fe3dc, 1.6);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim);

  const mouse = new THREE.Vector2(), smooth = new THREE.Vector2();
  const onMove = (e) => mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  addEventListener('pointermove', onMove, { passive: true });

  let placeX = 0;
  function layout() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const small = w < 760;
    camera.fov = small ? 40 : 30;
    camera.updateProjectionMatrix();
    // heart sits to the right of the headline on wide screens, centred above it on phones
    placeX = small ? 0 : Math.min(2.7, (w / h) * 1.45);
    heart.position.set(placeX, small ? 0.15 : 0.05, 0);
    heart.scale.setScalar(small ? 0.72 : 0.8);
    ring.position.x = placeX;
    bg.position.x = placeX * 0.9;
    blobs.forEach((b) => (b.userData.offsetX = placeX));
  }
  const ro = new ResizeObserver(layout);
  ro.observe(wrap);
  layout();

  let visible = true, raf = 0, last = performance.now(), t = 0;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
  io.observe(wrap);

  // breath: 4s in, 6s out, eased like a real breath
  const breath = (time) => {
    const c = time % 10;
    return c < 4 ? 0.5 - 0.5 * Math.cos((c / 4) * Math.PI) : 0.5 + 0.5 * Math.cos(((c - 4) / 6) * Math.PI);
  };

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF time can predate last
    last = now;
    t += dt;
    smooth.lerp(mouse, 0.03);
    const b = breath(t);
    heart.scale.setScalar((innerWidth < 760 ? 0.72 : 0.8) * (0.97 + b * 0.06));
    heart.rotation.y = Math.sin(t * 0.25) * 0.35 + smooth.x * 0.25;
    heart.rotation.x = Math.sin(t * 0.2) * 0.08 - smooth.y * 0.12;
    heart.position.y += ((innerWidth < 760 ? 0.15 : 0.05) + Math.sin(t * 0.5) * 0.08 - heart.position.y) * 0.05;
    core.material.emissiveIntensity = 0.6 + b * 0.6;
    core.scale.setScalar(0.9 + b * 0.2);
    ring.scale.setScalar(1 + b * 0.04);
    ring.rotation.z = t * 0.05;
    blobs.forEach((m) => {
      const { base, phase, offsetX = 0 } = m.userData;
      m.position.set(base.x + offsetX + Math.sin(t * 0.3 + phase) * 0.25, base.y + Math.cos(t * 0.25 + phase) * 0.2, base.z);
    });
    bg.material.uniforms.uTime.value = t;
    // drift up and soften as the page scrolls away
    const scroll = Math.min(1, scrollY / Math.max(1, wrap.clientHeight));
    camera.position.y = -scroll * 1.2;
    camera.lookAt(placeX * 0.15, -scroll * 1.2, 0);
    renderer.render(scene, camera);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  const onVis = () => !document.hidden && kick();
  document.addEventListener('visibilitychange', onVis);
  frame(performance.now()); // draw once straight away, so the hero is never blank
  canvas.classList.add('is-ready');

  return {
    dispose() {
      cancelAnimationFrame(raf);
      raf = -1;
      visible = false;
      ro.disconnect();
      io.disconnect();
      removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => m.dispose?.()); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
