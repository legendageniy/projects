// Cursor blob, case filter with generated covers, services accordion, multi-step brief.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Soft blob that follows the pointer (desktop only, respects reduced motion)
const blob = $(".blob");
if (!reduce && matchMedia("(pointer: fine)").matches) {
  let x = innerWidth / 2, y = innerHeight / 3, tx = x, ty = y;
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
  const loop = () => { x += (tx - x) * 0.08; y += (ty - y) * 0.08; blob.style.transform = `translate(${x - 160}px, ${y - 160}px)`; requestAnimationFrame(loop); };
  loop();
} else blob.hidden = true;

// Cases with generative SVG covers
const CASES = [
  { t: "Ребрендинг сети кофеен «Зёрна»", tag: "brand", res: "+38% узнаваемости за полгода", c: ["#ff4d00", "#ffd2bd"], shape: "circles" },
  { t: "Запуск приложения для бега", tag: "digital", res: "250 000 установок за 3 месяца", c: ["#8f5cff", "#e1d4ff"], shape: "waves" },
  { t: "TikTok для фермерского рынка", tag: "smm", res: "12 млн просмотров органически", c: ["#00b38f", "#c4f2e6"], shape: "grid" },
  { t: "Айдентика фестиваля «Шорох»", tag: "brand", res: "Шорт-лист премии дизайна", c: ["#111111", "#ff4d00"], shape: "stripes" },
  { t: "Кампания банка для студентов", tag: "digital", res: "CTR баннеров ×2,3 к бенчмарку", c: ["#2a5cff", "#cfdcff"], shape: "circles" },
  { t: "Сообщество книжного магазина", tag: "smm", res: "От 0 до 40 000 подписчиков", c: ["#ffbf00", "#fff1c2"], shape: "waves" },
];
function cover({ c: [a, b], shape }, i) {
  const s = { circles: `<circle cx="70" cy="60" r="44" fill="${b}"/><circle cx="130" cy="90" r="58" fill="${a}" style="mix-blend-mode:multiply"/>`,
    waves: [0, 1, 2, 3].map((k) => `<path d="M0 ${40 + k * 26} Q50 ${20 + k * 26} 100 ${40 + k * 26} T200 ${40 + k * 26}" stroke="${k % 2 ? a : b}" stroke-width="14" fill="none"/>`).join(""),
    grid: Array.from({ length: 24 }, (_, k) => `<rect x="${(k % 6) * 34 + 2}" y="${Math.floor(k / 6) * 34 + 2}" width="30" height="30" rx="${(k * 7) % 15}" fill="${(k * 5 + i) % 3 ? b : a}"/>`).join(""),
    stripes: Array.from({ length: 8 }, (_, k) => `<rect x="${k * 26}" y="0" width="13" height="140" fill="${b}" transform="skewX(-20)"/>`).join("") };
  return `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="${shape === "stripes" ? a : "#fff"}"/>${s[shape]}</svg>`;
}
const TAGS = { brand: "Брендинг", digital: "Digital", smm: "SMM" };
const render = (f) => ($("#cases").innerHTML = CASES.map((k, i) => ({ k, i })).filter(({ k }) => f === "all" || k.tag === f).map(({ k, i }) => `<article class="case">${cover(k, i)}<div><span class="t">${TAGS[k.tag]}</span><h3>${k.t}</h3><p>${k.res}</p></div></article>`).join(""));
$$(".filter button").forEach((b) => b.addEventListener("click", () => { $$(".filter button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); render(b.dataset.f); }));
render("all");

// Services accordion
$$(".services button").forEach((b) => b.addEventListener("click", () => {
  const open = b.getAttribute("aria-expanded") !== "true";
  b.setAttribute("aria-expanded", String(open)); b.nextElementSibling.hidden = !open;
}));

// Multi-step brief
const form = $("#steps"), steps = $$("fieldset", form), dots = $$(".dots li"), next = $("#next"), prev = $("#prev"), hint = $("#hint");
let i = 0;
const fmt = (k) => (Number(k) * 1000).toLocaleString("ru-RU") + " ₽";
form.budget.addEventListener("input", () => ($("#budget-out").textContent = Number(form.budget.value) >= 5000 ? "от 5 000 000 ₽" : fmt(form.budget.value)));
const valid = () => {
  if (i === 0) return $$("[name=need]:checked").length > 0 || "Выберите хотя бы одну услугу";
  if (i === 2) return Boolean($("[name=when]:checked")) || "Выберите срок";
  if (i === 3) return (form.name.value.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim())) || "Укажите имя и рабочий email";
  return true;
};
const show = () => {
  steps.forEach((s, k) => (s.hidden = k !== i));
  dots.forEach((d, k) => d.classList.toggle("on", k <= i));
  prev.hidden = i === 0; next.textContent = i === 3 ? "Отправить" : "Дальше →"; hint.textContent = "";
  steps[i].querySelector("input")?.focus({ preventScroll: true });
};
next.addEventListener("click", () => {
  const v = valid();
  if (v !== true) { hint.textContent = v; return; }
  if (i < 3) { i++; return show(); }
  const needs = $$("[name=need]:checked").map((x) => x.value).join(", ");
  steps.forEach((s) => (s.hidden = true)); next.hidden = prev.hidden = true; $(".dots").hidden = true;
  const sum = $("#summary"); sum.hidden = false;
  sum.innerHTML = `<h3>Спасибо, ${form.name.value.trim().replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)}!</h3><p><b>Задача:</b> ${needs}<br><b>Бюджет:</b> ${$("#budget-out").textContent}<br><b>Запуск:</b> ${$("[name=when]:checked").value}</p><p>Это демо-сайт — бриф никуда не отправлен.</p>`;
  sum.focus();
});
prev.addEventListener("click", () => { i = Math.max(0, i - 1); show(); });
