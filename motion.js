const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const touch = matchMedia("(pointer: coarse)").matches;

window.addEventListener("load", () => {
  document.getElementById("boot")?.classList.add("hide");
});
setTimeout(() => document.getElementById("boot")?.classList.add("hide"), 1600);

const progress = document.getElementById("progress");
const hero = document.getElementById("hero-img");
const pin = document.querySelector(".pin");
const track = document.getElementById("track");
const mobile = matchMedia("(max-width: 820px)").matches;

let target = 0, current = 0, ticking = false;
function maxY() {
  return document.documentElement.scrollHeight - innerHeight;
}
function onScroll() {
  target = scrollY;
  if (reduce || touch) apply(target);
  else if (!ticking) {
    ticking = true;
    requestAnimationFrame(tick);
  }
}
function tick() {
  current += (target - current) * 0.12;
  if (Math.abs(target - current) < 0.4) current = target;
  apply(current);
  if (current !== target) requestAnimationFrame(tick);
  else ticking = false;
}
function apply(y) {
  const m = maxY() || 1;
  if (progress) progress.style.width = `${Math.min(100, (y / m) * 100)}%`;
  if (hero && !reduce) hero.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
  if (pin && track && !mobile && !reduce) {
    const r = pin.getBoundingClientRect();
    const total = pin.offsetHeight - innerHeight;
    const gone = Math.min(Math.max(-r.top, 0), total);
    const p = total ? gone / total : 0;
    track.style.transform = `translate3d(${p * -80}%,0,0)`;
  }
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

(async function () {
  const box = document.getElementById("biz");
  if (!box || !window.petavuData) return;
  try {
    const { data, error } = await petavuData.businesses.published();
    if (error) throw error;
    if (!data?.length) {
      box.innerHTML = `<p class="lead">هنوز پروفایل منتشرشده‌ای نیست.</p>`;
      return;
    }
    box.innerHTML = data
      .map(
        (b, i) =>
          `<a href="https://panel.petavu.ir/"><span class="n">${String(i + 1).padStart(2, "0")}</span><strong>${b.name}</strong><span>${b.city || b.kind}</span></a>`
      )
      .join("");
  } catch {
    box.innerHTML = `<p class="lead">شبکه در دسترس نیست.</p>`;
  }
})();
