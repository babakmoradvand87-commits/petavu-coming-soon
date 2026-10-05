const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("on")),
    { threshold: 0.16 }
  );
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".rv").forEach((el) => el.classList.add("on"));
}

(async function () {
  const box = document.getElementById("biz");
  if (!box || !window.petavuData) {
    if (box) box.innerHTML = "";
    return;
  }
  try {
    const { data, error } = await petavuData.businesses.published();
    if (error) throw error;
    if (!data || !data.length) {
      box.innerHTML = `<p class="sub">هنوز پروفایل منتشرشده‌ای نیست.</p>`;
      return;
    }
    box.innerHTML = data
      .map(
        (b, i) =>
          `<a href="https://panel.petavu.ir/"><span class="num">${String(i + 1).padStart(2, "0")}</span><strong>${b.name}</strong><span class="sub">${b.city || b.kind}</span></a>`
      )
      .join("");
  } catch {
    box.innerHTML = `<p class="sub">شبکه در دسترس نیست.</p>`;
  }
})();
