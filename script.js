// Gallery data, series filter, lightbox with keyboard navigation, order form.
const WORKS = [{"slug": "altai-dawn", "title": "Алтай. Рассвет", "cat": "mountains", "w": 1600, "h": 1067}, {"slug": "baikal-ice", "title": "Байкал. Лёд", "cat": "mountains", "w": 1200, "h": 1500}, {"slug": "white-sea", "title": "Белое море", "cat": "sea", "w": 1600, "h": 1067}, {"slug": "teriberka", "title": "Териберка", "cat": "sea", "w": 1200, "h": 1500}, {"slug": "moscow-night", "title": "Москва. Ночь", "cat": "city", "w": 1600, "h": 1067}, {"slug": "piter-fog", "title": "Петербург. Туман", "cat": "city", "w": 1200, "h": 1500}, {"slug": "karelia", "title": "Карелия", "cat": "forest", "w": 1600, "h": 1067}, {"slug": "taiga-mist", "title": "Тайга", "cat": "forest", "w": 1200, "h": 1500}, {"slug": "sarykum", "title": "Сарыкум", "cat": "dunes", "w": 1600, "h": 1067}, {"slug": "elbrus", "title": "Эльбрус", "cat": "mountains", "w": 1600, "h": 1067}, {"slug": "kazan-arch", "title": "Казань. Аркада", "cat": "architecture", "w": 1200, "h": 1500}, {"slug": "vyborg-wall", "title": "Выборг. Стена", "cat": "architecture", "w": 1600, "h": 1067}, {"slug": "kamchatka", "title": "Камчатка", "cat": "mountains", "w": 1200, "h": 1500}, {"slug": "ladoga", "title": "Ладога. Штиль", "cat": "sea", "w": 1600, "h": 1067}];
const SERIES = { mountains: "Горы", sea: "Море", city: "Город", forest: "Лес", dunes: "Пустыня", architecture: "Архитектура" };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
addEventListener("scroll", () => $(".header").classList.toggle("solid", scrollY > 40), { passive: true });

const gallery = $("#gallery");
gallery.innerHTML = WORKS.map((w, i) => `<li data-cat="${w.cat}"><button type="button" data-open="${i}" aria-label="Открыть «${w.title}»">
  <img src="works/${w.slug}.svg" alt="«${w.title}», серия «${SERIES[w.cat]}»" width="${w.w}" height="${w.h}" loading="lazy">
  <span class="cap"><b>${w.title}</b><small>${SERIES[w.cat]}</small></span></button></li>`).join("");
$("#c-work").innerHTML = WORKS.map((w) => `<option>${w.title}</option>`).join("");

$$(".filters button").forEach((b) => b.addEventListener("click", () => {
  $$(".filters button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  $$("#gallery li").forEach((li) => (li.hidden = b.dataset.cat !== "all" && li.dataset.cat !== b.dataset.cat));
}));

// Lightbox over the currently visible works
const lb = $("#lightbox");
let current = 0, opener = null;
const visible = () => $$("#gallery li:not([hidden]) [data-open]").map((b) => Number(b.dataset.open));
function show(i) {
  current = i; const w = WORKS[i];
  $("#lb-img").src = `works/${w.slug}.svg`; $("#lb-img").alt = `«${w.title}»`;
  $("#lb-title").textContent = w.title;
  $("#lb-meta").textContent = `Серия «${SERIES[w.cat]}» · ${visible().indexOf(i) + 1} из ${visible().length}`;
}
gallery.addEventListener("click", (e) => { const b = e.target.closest("[data-open]"); if (!b) return; opener = b; show(Number(b.dataset.open)); lb.showModal(); });
function step(d) { const v = visible(); show(v[(v.indexOf(current) + d + v.length) % v.length]); }
lb.addEventListener("click", (e) => {
  if (e.target === lb || e.target.closest("[data-close]")) lb.close();
  const s = e.target.closest("[data-step]"); if (s) step(Number(s.dataset.step));
});
lb.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
lb.addEventListener("close", () => { opener?.focus({ preventScroll: true }); });
$(".lb__order").addEventListener("click", () => { $("#c-type").value = "print"; $("#work-field").hidden = false; $("#c-work").value = WORKS[current].title; });

// Order form
const form = $("#order");
form.type.addEventListener("change", () => ($("#work-field").hidden = form.type.value !== "print"));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const err = $(".form__err");
  const bad = [["name", form.name.value.trim().length < 2, "Укажите имя"], ["email", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim()), "Проверьте email"], ["message", form.message.value.trim().length < 5, "Напишите пару слов о заказе"]];
  bad.forEach(([n, b]) => form.elements[n].setAttribute("aria-invalid", String(b)));
  const first = bad.find((x) => x[1]);
  err.textContent = first ? first[2] : "";
  if (first) return form.elements[first[0]].focus();
  form.reset(); $("#work-field").hidden = false; $(".form__ok").hidden = false;
});
