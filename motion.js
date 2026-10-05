const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = () => matchMedia("(max-width: 820px)").matches;

window.addEventListener("load", () => document.getElementById("boot")?.classList.add("hide"));
setTimeout(() => document.getElementById("boot")?.classList.add("hide"), 1400);

const progress = document.getElementById("progress");
const hero = document.getElementById("hero-img");
const pin = document.querySelector(".pin");
const track = document.getElementById("track");
const sticky = pin?.querySelector(".sticky");
const dots = [...document.querySelectorAll("#dots i")];
const hint = document.querySelector(".hint");

function maxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - innerHeight);
}

function pinProgress() {
  if (!pin || !sticky) return 0;
  const start = pin.offsetTop;
  const travel = Math.max(1, pin.offsetHeight - innerHeight);
  return Math.min(1, Math.max(0, (scrollY - start) / travel));
}

function sizeSlides() {
  if (!track || !sticky || narrow()) return;
  const w = sticky.clientWidth;
  [...track.children].forEach((s) => {
    s.style.flex = `0 0 ${w}px`;
    s.style.width = `${w}px`;
  });
}

function frame() {
  const y = scrollY;
  if (progress) progress.style.width = `${(y / maxScroll()) * 100}%`;
  if (hero && !reduce) hero.style.transform = `translate3d(0, ${Math.min(y, innerHeight) * 0.18}px, 0)`;

  if (pin && track && sticky && !narrow() && !reduce) {
    sizeSlides();
    const p = pinProgress();
    const slides = track.children.length || 1;
    const w = sticky.clientWidth;
    const maxX = Math.max(0, (slides - 1) * w);
    track.style.transform = `translate3d(${-p * maxX}px,0,0)`;
    const slide = Math.min(dots.length - 1, Math.round(p * (slides - 1)));
    dots.forEach((d, i) => d.classList.toggle("on", i === slide));
    if (hint) hint.style.opacity = p < 0.06 ? "1" : "0";
  }
}

let raf = 0;
addEventListener(
  "scroll",
  () => {
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0;
      frame();
    });
  },
  { passive: true }
);
addEventListener("resize", frame);
frame();

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
