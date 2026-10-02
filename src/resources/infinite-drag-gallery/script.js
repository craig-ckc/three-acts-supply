gsap.registerPlugin(Draggable, InertiaPlugin);

const gallery = document.querySelector(".gallery");
const track = gallery.querySelector(".gallery__track");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Clone the set until the row is wide enough to loop without gaps
const originals = [...track.children];
const tileW = originals[0].offsetWidth || 240;
for (let n = 0; n < 6 && track.children.length * tileW < Math.max(innerWidth, 1600) * 2.5; n++) {
  originals.forEach((t) => track.append(t.cloneNode(true)));
}
const tiles = [...track.children];

const proxy = document.createElement("div"); // Draggable moves this; tiles follow
let step, wrap, offset, lastX = 0, current;

function measure() {
  step = tiles[1].offsetLeft - tiles[0].offsetLeft;
  wrap = gsap.utils.wrap(-step, tiles.length * step - step);
  offset = (gallery.offsetWidth - tiles[0].offsetWidth) / 2; // centre a tile
}

// Each frame: wrap every tile into the loop and lean the row with its velocity
const lean = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
const maxSkew = parseFloat(getComputedStyle(gallery).getPropertyValue("--max-skew"));

function render() {
  const x = gsap.getProperty(proxy, "x");
  tiles.forEach((tile, i) => {
    gsap.set(tile, { x: wrap(i * step + x + offset) - i * step });
  });
  if (!reduce) lean(gsap.utils.clamp(-maxSkew, maxSkew, (lastX - x) * 0.12));
  lastX = x;

  const index = gsap.utils.wrap(0, tiles.length, Math.round(-x / step));
  if (index !== current) {
    tiles[current]?.classList.remove("is-current");
    tiles[index].classList.add("is-current");
    current = index;
  }
}

measure();
gsap.ticker.add(render);
addEventListener("resize", () => {
  const i = Math.round(-gsap.getProperty(proxy, "x") / step);
  measure();
  gsap.set(proxy, { x: -i * step });
});

const snap = (v) => Math.round(v / step) * step;

const [drag] = Draggable.create(proxy, {
  type: "x",
  trigger: gallery,
  inertia: !reduce,
  snap: { x: snap },
  onPress() {
    gsap.killTweensOf(proxy);
    gallery.classList.add("is-dragging");
  },
  onRelease() {
    gallery.classList.remove("is-dragging");
    if (reduce) gsap.set(proxy, { x: snap(this.x) });
  },
});

// Arrow keys glide one tile at a time
const duration = parseFloat(getComputedStyle(gallery).getPropertyValue("--step-duration"));
let target = 0;

gallery.addEventListener("keydown", (e) => {
  const dir = { ArrowRight: -1, ArrowLeft: 1 }[e.key];
  if (!dir) return;
  e.preventDefault();
  if (!gsap.isTweening(proxy)) target = snap(gsap.getProperty(proxy, "x"));
  target += dir * step;
  gsap.to(proxy, {
    x: target,
    duration: reduce ? 0 : duration,
    ease: "expo.out",
    overwrite: true,
    onUpdate: () => drag.update(),
  });
});
