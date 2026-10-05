const who = [
  ["پت‌شاپ", "خرده‌فروشی تخصصی"],
  ["کلینیک دامپزشکی", "خدمات درمان"],
  ["باشگاه و اسب", "نگهداری و آموزش"],
  ["تولیدکننده", "ساخت خوراک و کالا"],
  ["واردکننده / عمده", "تأمین زنجیره"],
  ["برند و خدمات", "عرضهٔ تخصصی"],
];
document.getElementById("who").innerHTML = who
  .map(([t, s]) => `<article class="card"><h3>${t}</h3><p class="muted">${s}</p></article>`)
  .join("");
document.getElementById("cats-grid").innerHTML = who
  .map(([t]) => `<article class="card"><h3>${t}</h3></article>`)
  .join("");

(async function load() {
  const box = document.getElementById("biz");
  try {
    const { data, error } = await petavuData.businesses.published();
    if (error) throw error;
    if (!data || !data.length) {
      box.innerHTML = `<p class="muted">هنوز پروفایل منتشرشده‌ای نیست.</p>`;
      return;
    }
    box.innerHTML = data
      .map(
        (b) => `<a class="card" href="#b-${b.slug}"><h3>${b.name}</h3><p class="muted">${b.city || ""} — ${b.kind}</p><p class="muted">${b.description || ""}</p></a>`
      )
      .join("");
  } catch (e) {
    box.innerHTML = `<p class="err">خواندن شبکه ممکن نشد.</p>`;
  }
})();
