const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = () => matchMedia("(max-width: 820px)").matches;

window.addEventListener("load", () => document.getElementById("boot")?.classList.add("hide"));
setTimeout(() => document.getElementById("boot")?.classList.add("hide"), 1400);

const progress = document.getElementById("progress");
const hero = document.getElementById("hero-img");
const pin = document.querySelector(".pin");
const hall = document.getElementById("track");
const sticky = pin?.querySelector(".sticky");
const dots = [...document.querySelectorAll("#dots i")];
const copyBox = document.getElementById("hall-copy");
const scenes = [
  ["petavu.ir", "درِ صنعت", "ورود به همان سالن. سگ کنار در؛ شبکه از اینجا شروع می‌شود."],
  ["panel.petavu.ir", "میز کار", "چند قدم داخل. میز عضو و گربه؛ کسب‌وکار زیر نظر خودتان."],
  ["adminpanel.petavu.ir", "ادارهٔ شبکه", "همان راهرو، پشت شیشه اسب. کل صنعت از این زاویه دیده می‌شود."],
  ["shop · adminshop", "بازار", "انتهای سالن: گونی و زین. معامله و اداره‌اش در ادامهٔ همین فضا."],
];

function maxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - innerHeight);
}

function pinProgress() {
  if (!pin || !sticky) return 0;
  const start = pin.offsetTop;
  const travel = Math.max(1, pin.offsetHeight - innerHeight);
  return Math.min(1, Math.max(0, (scrollY - start) / travel));
}

function frame() {
  const y = scrollY;
  if (progress) progress.style.width = `${(y / maxScroll()) * 100}%`;
  if (hero && !reduce) hero.style.transform = `translate3d(0, ${Math.min(y, innerHeight) * 0.18}px, 0)`;

  if (pin && hall && sticky && !narrow() && !reduce) {
    const p = pinProgress();
    const maxX = Math.max(0, hall.scrollWidth - sticky.clientWidth);
    hall.style.transform = `translate3d(${-p * maxX}px,0,0)`;
    const n = scenes.length;
    const idx = Math.min(n - 1, Math.round(p * (n - 1)));
    const s = scenes[idx];
    if (copyBox && copyBox.dataset.i !== String(idx)) {
      copyBox.dataset.i = String(idx);
      copyBox.innerHTML = `<p class="host">${s[0]}</p><h3>${s[1]}</h3><p class="lead">${s[2]}</p>`;
    }
    dots.forEach((d, i) => d.classList.toggle("on", i === idx));
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
hall?.querySelector("img:last-child")?.addEventListener("load", frame);
frame();

(async function () {
  const box = document.getElementById("biz");
  if (!box || !window.petavuData) return;
  try {
    const { data, error } = await petavuData.businesses.published();
    if (error) throw error;
    if (!data?.length) {
      box.innerHTML = `<p class="lead">هنوز کسب‌وکار منتشرشده‌ای در شبکهٔ پت و اسب نیست. اولین معرفی می‌تواند از آن شما باشد.</p>`;
      return;
    }
    box.innerHTML = data
      .map(
        (b, i) =>
          `<a href="https://panel.petavu.ir/"><span class="n">${String(i + 1).padStart(2, "0")}</span><strong>${b.name}</strong><span>${b.city || b.kind}</span></a>`
      )
      .join("");
  } catch {
    box.innerHTML = `<p class="lead">فهرست کسب‌وکارها الان در دسترس نیست. کمی بعد دوباره سر بزنید.</p>`;
  }
})();
