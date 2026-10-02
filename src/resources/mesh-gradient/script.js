// Blobs lean gently toward the pointer. One eased loop, idle when settled.
(function () {
  const mesh = document.querySelector('.mesh');
  if (!mesh || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ease = 0.06; // fraction of the remaining distance covered per frame
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;

  function tick() {
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    mesh.style.setProperty('--px', x.toFixed(4));
    mesh.style.setProperty('--py', y.toFixed(4));
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(tick) : 0;
  }

  function aim(nx, ny) {
    const s = (parseFloat(mesh.dataset.strength) || 8) / 8;
    tx = nx * s; ty = ny * s;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  mesh.addEventListener('pointermove', (e) => {
    const r = mesh.getBoundingClientRect();
    aim((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
  });
  mesh.addEventListener('pointerleave', () => aim(0, 0));
  mesh.addEventListener('pointercancel', () => aim(0, 0));
})();
