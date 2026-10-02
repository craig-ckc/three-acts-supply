gsap.registerPlugin(Observer);

document.querySelectorAll(".vmarquee").forEach((el) => {
  const track = el.querySelector(".vmarquee__track");
  const group = el.querySelector(".vmarquee__group");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Dials: base drift (px/s), seconds to settle back, max lean (deg)
  const base = parseFloat(el.dataset.speed) || 90;
  const settle = parseFloat(el.dataset.settle) || 1.4;
  const maxSkew = parseFloat(el.dataset.maxSkew) || 12;

  // Clone the group until the track covers two screen widths
  while (track.offsetWidth < innerWidth * 2.5) track.appendChild(group.cloneNode(true));
  if (reduce) return;

  const state = { x: 0, dir: 1, boost: 0 };
  const setX = gsap.quickSetter(track, "x", "px");
  const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
  const spin = gsap.quickSetter(track.querySelectorAll(".vmarquee__star"), "rotation", "deg");
  let decay;

  // Push: add velocity, adopt its direction, then glide back to base speed
  function push(amount) {
    if (!amount) return;
    state.boost = gsap.utils.clamp(-base * 30, base * 30, state.boost + amount);
    gsap.to(state, { dir: Math.sign(amount), duration: 0.6, ease: "power2.out", overwrite: "auto" });
    decay && decay.kill();
    decay = gsap.to(state, { boost: 0, duration: settle, ease: "power2.out" });
  }

  gsap.ticker.add((time, dt) => {
    const width = group.offsetWidth;
    const v = state.dir * base + state.boost;          // px per second, + is leftward
    state.x = gsap.utils.wrap(-width, 0, state.x - v * dt / 1000);
    setX(state.x);
    spin(state.x * 0.6);
    skewTo(gsap.utils.clamp(-maxSkew, maxSkew, -state.boost / (base * 2)));
  });

  Observer.create({
    target: window,
    type: "wheel,touch,pointer",
    wheelSpeed: 1,
    dragMinimum: 2,
    onChange(self) {
      const wheel = self.event.type === "wheel";
      const d = wheel ? self.deltaY + self.deltaX : -(self.deltaX + self.deltaY);
      push(d * (wheel ? 6 : 14));
    },
  });

  // Keyboard: arrows give it a shove either way
  el.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      push(e.key === "ArrowRight" ? base * 14 : -base * 14);
    }
  });
});
