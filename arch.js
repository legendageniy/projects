// «Линия» — projects, generated facade drawings (sketch and render), filter, before/after slider.
const PROJECTS = [
  { id: "riverside", name: "Дом у реки", type: "Жилые", city: "Тверь", year: 2025, area: "1 840 м²", floors: 5, bays: 6, roof: "flat", c: ["#c9b79c", "#8b6f4e"], text: "Пятиэтажный клубный дом с террасами, обращёнными к реке. Фасад из термообработанной сосны и светлого кирпича." },
  { id: "library", name: "Библиотека-лофт", type: "Общественные", city: "Пермь", year: 2024, area: "3 200 м²", floors: 3, bays: 8, roof: "saw", c: ["#d6d2c8", "#5e6b73"], text: "Реконструкция цеха 1930-х годов: пилообразная кровля даёт рассеянный северный свет в читальные залы." },
  { id: "pavilion", name: "Павильон в парке", type: "Общественные", city: "Казань", year: 2026, area: "420 м²", floors: 1, bays: 5, roof: "arch", c: ["#e8e2d4", "#b85c38"], text: "Лёгкий павильон с кафе и прокатом. Сводчатая кровля из клеёного бруса и полностью остеклённые торцы." },
  { id: "townhouse", name: "Таунхаусы «Сад»", type: "Жилые", city: "Подмосковье", year: 2023, area: "2 400 м²", floors: 3, bays: 5, roof: "gable", c: ["#efe6d6", "#3e4a3d"], text: "Восемь секций с собственными садами. Двускатные кровли повторяют силуэт старой дачной застройки." },
  { id: "office", name: "Офис технопарка", type: "Общественные", city: "Новосибирск", year: 2025, area: "6 100 м²", floors: 6, bays: 9, roof: "flat", c: ["#cfd6db", "#2f3b45"], text: "Офисное здание с вертикальными ламелями, которые защищают от солнца и формируют ритм фасада." },
  { id: "loft", name: "Квартира-мастерская", type: "Интерьеры", city: "Санкт-Петербург", year: 2026, area: "140 м²", floors: 2, bays: 3, roof: "gable", c: ["#f1ece2", "#7a8b6f"], text: "Интерьер в мансарде дома 1905 года: открытые балки, антресоль-библиотека и мастерская у окна." },
];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function facade(p, mode) {
  const W = 600, H = 400, ground = 350, fh = Math.min(48, 230 / p.floors), w = Math.min(470, p.bays * 62), x0 = (W - w) / 2, top = ground - p.floors * fh, bw = w / p.bays;
  const line = mode === "sketch";
  const stroke = line ? `stroke="#1a1a1a" stroke-width="1.6" fill="none"` : "";
  let s = `<rect width="${W}" height="${H}" fill="${line ? "#fbfbf8" : "#e9ecee"}"/>`;
  if (!line) s += `<rect y="${ground}" width="${W}" height="${H - ground}" fill="#cfcabd"/><circle cx="500" cy="80" r="34" fill="#f6efe1"/>`;
  s += `<rect x="${x0}" y="${top}" width="${w}" height="${ground - top}" ${line ? stroke : `fill="${p.c[0]}"`}/>`;
  // roof
  const roofs = {
    flat: `<rect x="${x0 - 8}" y="${top - 8}" width="${w + 16}" height="8"`,
    gable: `<path d="M${x0 - 10} ${top} L${x0 + w / 2} ${top - 70} L${x0 + w + 10} ${top}Z"`,
    saw: `<path d="M${x0} ${top}` + Array.from({ length: 4 }, (_, i) => ` L${x0 + (i + 1) * (w / 4) - 10} ${top - 40} L${x0 + (i + 1) * (w / 4)} ${top}`).join("") + `Z"`,
    arch: `<path d="M${x0} ${top} Q${x0 + w / 2} ${top - 110} ${x0 + w} ${top}Z"`,
  };
  s += roofs[p.roof] + (line ? ` ${stroke}/>` : ` fill="${p.c[1]}"/>`);
  for (let f = 0; f < p.floors; f++) for (let b = 0; b < p.bays; b++) {
    const wx = x0 + b * bw + bw * 0.2, wy = top + f * fh + fh * 0.2, ww = bw * 0.6, wh = fh * 0.62;
    if (f === p.floors - 1 && b === Math.floor(p.bays / 2)) { s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${ground - wy}" ${line ? stroke : `fill="${p.c[1]}"`}/>`; continue; }
    s += line ? `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" ${stroke}/><path d="M${wx + ww / 2} ${wy}v${wh}" stroke="#1a1a1a" stroke-width=".8"/>` : `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#9fb2bd"/><rect x="${wx}" y="${wy}" width="${ww}" height="${wh * 0.35}" fill="#fff" opacity=".25"/>`;
  }
  if (line) { s += `<path d="M20 ${ground}H580" stroke="#1a1a1a" stroke-width="2"/><g stroke="#d7372f" stroke-width="1"><path d="M${x0} ${ground + 20}H${x0 + w}M${x0} ${ground + 14}v12M${x0 + w} ${ground + 14}v12"/></g><text x="${W / 2}" y="${ground + 38}" font-size="12" text-anchor="middle" fill="#d7372f" font-family="Fira Sans">${Math.round(w / 10)} м</text>`; }
  else s += `<g fill="#6f8a63"><circle cx="${x0 - 40}" cy="${ground - 30}" r="30"/><circle cx="${x0 + w + 46}" cy="${ground - 24}" r="24"/></g><rect x="${x0 - 42}" y="${ground - 10}" width="4" height="10" fill="#5b4a3a"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${s}</svg>`;
}

const burger = $(".burger"), nav = $("#nav");
burger?.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* Index: filterable grid */
const grid = $("#grid");
if (grid) {
  const render = (type) => {
    const list = PROJECTS.filter((p) => type === "all" || p.type === type);
    const wide = list.map((_, i) => i % 3 === 0);
    // Fill the last row of the 3-column grid: stretch the last card if one cell would stay empty.
    if ((list.length + wide.filter(Boolean).length) % 3 === 2 && !wide.at(-1)) wide[wide.length - 1] = true;
    grid.innerHTML = list.map((p, i) => `<a class="card${wide[i] ? " card--wide" : ""}" href="project.html?id=${p.id}"><div class="card__img">${facade(p, "render")}</div><div class="card__cap"><h3>${p.name}</h3><span>${p.city}, ${p.year}</span></div></a>`).join("");
  };
  $$(".filter button").forEach((b) => b.addEventListener("click", () => { $$(".filter button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); render(b.dataset.t); }));
  render("all");
}

/* Project page */
const page = $("#project");
if (page) {
  const i = Math.max(0, PROJECTS.findIndex((p) => p.id === new URLSearchParams(location.search).get("id")));
  const p = PROJECTS[i];
  document.title = `${p.name} — Линия`;
  $("#p-name").textContent = p.name; $("#p-text").textContent = p.text;
  $("#p-specs").innerHTML = [["Тип", p.type], ["Город", p.city], ["Год", p.year], ["Площадь", p.area], ["Этажность", p.floors]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  $("#cmp-a").innerHTML = facade(p, "sketch"); $("#cmp-b").innerHTML = facade(p, "render");
  const range = $("#cmp-range"), cmp = $("#cmp");
  const set = (v) => { cmp.style.setProperty("--x", v + "%"); range.value = v; };
  range.addEventListener("input", () => set(range.value));
  let drag = false;
  const move = (e) => { if (!drag) return; const r = cmp.getBoundingClientRect(); set(Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))); };
  cmp.addEventListener("pointerdown", (e) => { drag = true; cmp.setPointerCapture(e.pointerId); move(e); });
  cmp.addEventListener("pointermove", move);
  cmp.addEventListener("pointerup", () => (drag = false));
  set(50);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(i + 1) % PROJECTS.length];
  $("#p-nav").innerHTML = `<a href="project.html?id=${prev.id}"><small>← Предыдущий</small>${prev.name}</a><a class="r" href="project.html?id=${next.id}"><small>Следующий →</small>${next.name}</a>`;
}
