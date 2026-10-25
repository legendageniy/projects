// Cleaning cost calculator, room checklist tabs, before/after slider, booking slots.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => Math.round(n).toLocaleString("ru-RU") + " ₽";
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Calculator
const KIND = { support: { n: "Поддерживающая", m2: 55, min: 2900, h: 0.045 }, general: { n: "Генеральная", m2: 110, min: 5900, h: 0.085 }, repair: { n: "После ремонта", m2: 160, min: 8900, h: 0.11 } };
const EXTRAS = [
  { id: "win", n: "Мытьё окон", unit: "окно", price: 450, max: 10, h: 0.4 },
  { id: "fridge", n: "Холодильник внутри", price: 700, h: 0.5 },
  { id: "oven", n: "Духовка внутри", price: 800, h: 0.6 },
  { id: "balcony", n: "Балкон", price: 1200, h: 0.8 },
  { id: "iron", n: "Глажка, 1 час", unit: "час", price: 600, max: 5, h: 1 },
  { id: "dishes", n: "Мытьё посуды", price: 400, h: 0.4 },
];
const ex = Object.fromEntries(EXTRAS.map((e) => [e.id, 0]));
let baths = 1;
$("#extras").innerHTML = EXTRAS.map((e) => e.max
  ? `<div class="ex"><span><b>${e.n}</b><small>${rub(e.price)} / ${e.unit}</small></span><span class="step" role="group" aria-label="${e.n}"><button type="button" data-ex="${e.id}" data-d="-1" aria-label="Меньше">−</button><output id="ex-${e.id}">0</output><button type="button" data-ex="${e.id}" data-d="1" aria-label="Больше">+</button></span></div>`
  : `<label class="ex ex--check"><span><b>${e.n}</b><small>${rub(e.price)}</small></span><input type="checkbox" data-ex="${e.id}"></label>`).join("");
const cf = $("#calc-form");
let quote = null;
function calc() {
  const k = KIND[cf.kind.value], area = Number(cf.area.value), freq = Number(cf.freq.value);
  $("#area-out").value = area; $("#bath").value = baths;
  const base = Math.max(k.min, area * k.m2) + (baths - 1) * (cf.kind.value === "support" ? 600 : 1100);
  const lines = [[`${k.n}, ${area} м²${baths > 1 ? `, санузлов: ${baths}` : ""}`, base]];
  let hours = 1 + area * k.h + (baths - 1) * 0.6;
  EXTRAS.forEach((e) => { if (ex[e.id]) { lines.push([e.max ? `${e.n} × ${ex[e.id]}` : e.n, e.price * ex[e.id]]); hours += e.h * ex[e.id]; } });
  const full = lines.reduce((s, l) => s + l[1], 0), total = full * (1 - freq / 100);
  const cleaners = hours > 6 ? (hours > 10 ? 3 : 2) : 1;
  $("#lines").innerHTML = lines.map(([n, p]) => `<li><span>${n}</span><span>${rub(p)}</span></li>`).join("") + (freq ? `<li class="disc"><span>Скидка за регулярность ${freq}%</span><span>−${rub(full - total)}</span></li>` : "");
  $("#price").textContent = rub(total);
  $("#old").textContent = freq ? rub(full) : "";
  $("#meta").textContent = `${cleaners} ${cleaners === 1 ? "клинер" : "клинера"} · около ${Math.ceil(hours / cleaners * 2) / 2} ч`.replace(".", ",");
  quote = { text: `${k.n} уборка, ${area} м²`, total, hours: Math.ceil(hours / cleaners) };
  return quote;
}
cf.addEventListener("input", calc);
cf.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-d]"); if (!b) return;
  const d = Number(b.dataset.d);
  if (b.dataset.ex) { const it = EXTRAS.find((x) => x.id === b.dataset.ex); ex[it.id] = Math.max(0, Math.min(it.max, ex[it.id] + d)); $(`#ex-${it.id}`).value = ex[it.id]; }
  else baths = Math.max(1, Math.min(4, baths + d));
  calc();
});
cf.addEventListener("change", (e) => { if (e.target.matches("input[type=checkbox][data-ex]")) { ex[e.target.dataset.ex] = e.target.checked ? 1 : 0; calc(); } });
calc();

// Checklist tabs
const ROOMS = {
  "Кухня": { support: ["Моем плиту и фартук", "Протираем фасады снаружи", "Моем раковину и смеситель", "Выносим мусор", "Моем пол"], general: ["Отмываем вытяжку и фильтр", "Протираем шкафы внутри", "Чистим швы плитки"], repair: ["Убираем строительную пыль со всех поверхностей", "Отмываем затирку и следы краски"] },
  "Комнаты": { support: ["Протираем пыль на доступных поверхностях", "Пылесосим ковры и мебель", "Заправляем кровать", "Моем пол"], general: ["Моем двери, плинтусы, выключатели", "Протираем люстры и карнизы", "Чистим радиаторы"], repair: ["Удаляем скотч и защитную плёнку", "Моем стены от пыли"] },
  "Санузел": { support: ["Моем ванну/душ и унитаз", "Чистим зеркала и смесители", "Моем пол"], general: ["Удаляем известковый налёт", "Отмываем швы плитки", "Моем стиральную машину снаружи"], repair: ["Отмываем сантехнику от строительных смесей"] },
  "Прихожая": { support: ["Протираем обувную полку", "Моем входную дверь", "Моем пол"], general: ["Протираем шкафы внутри", "Чистим зеркала и светильники"], repair: ["Удаляем строительный мусор"] },
};
const tabs = $("#room-tabs"), panel = $("#room-panel");
tabs.innerHTML = Object.keys(ROOMS).map((r, i) => `<button role="tab" id="t-${i}" aria-controls="room-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${r}</button>`).join("");
function showRoom(i) {
  $$("[role=tab]", tabs).forEach((t, j) => { t.setAttribute("aria-selected", i === j); t.tabIndex = i === j ? 0 : -1; });
  const room = ROOMS[Object.keys(ROOMS)[i]];
  panel.setAttribute("aria-labelledby", `t-${i}`);
  const col = (key, title) => `<div class="col"><h3>${title}</h3><ul>${(key === "support" ? room.support : key === "general" ? [...room.support, ...room.general] : [...room.support, ...room.general, ...room.repair]).map((x, n) => `<li class="${(key === "general" && n >= room.support.length) || (key === "repair" && n >= room.support.length + room.general.length) ? "new" : ""}">${x}</li>`).join("")}</ul></div>`;
  panel.innerHTML = col("support", "Поддерживающая") + col("general", "Генеральная") + col("repair", "После ремонта");
}
tabs.addEventListener("click", (e) => { const t = e.target.closest("[role=tab]"); if (t) showRoom($$("[role=tab]", tabs).indexOf(t)); });
tabs.addEventListener("keydown", (e) => {
  const all = $$("[role=tab]", tabs), i = all.indexOf(document.activeElement);
  const n = e.key === "ArrowRight" ? (i + 1) % all.length : e.key === "ArrowLeft" ? (i - 1 + all.length) % all.length : null;
  if (n !== null) { e.preventDefault(); showRoom(n); all[n].focus(); }
});
showRoom(0);

// Before / after: one kitchen drawn twice
const kitchen = (dirty) => `<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="600" height="400" fill="${dirty ? "#d8cfb8" : "#eef8f6"}"/>
  <g stroke="${dirty ? "#b5a98a" : "#d6ebe7"}" stroke-width="2">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 50} 130v110"/>`).join("")}<path d="M0 185h600"/></g>
  <rect y="240" width="600" height="160" fill="${dirty ? "#9d8a66" : "#c9e4dd"}"/>
  <rect x="40" y="30" width="520" height="100" rx="6" fill="${dirty ? "#c4b48f" : "#ffffff"}"/>
  <g stroke="${dirty ? "#a7956d" : "#d5e7e3"}" stroke-width="3">${[170, 300, 430].map((x) => `<path d="M${x} 30v100"/>`).join("")}</g>
  <rect x="40" y="240" width="520" height="130" rx="6" fill="${dirty ? "#bba67d" : "#ffffff"}"/>
  <rect x="230" y="236" width="140" height="10" fill="${dirty ? "#6f6458" : "#2b3a3a"}"/>
  ${[250, 280, 320, 350].map((x) => `<ellipse cx="${x}" cy="241" rx="11" ry="4" fill="${dirty ? "#3f362c" : "#55625f"}"/>`).join("")}
  <rect x="420" y="180" width="80" height="60" rx="4" fill="${dirty ? "#a69673" : "#dff0ec"}"/><path d="M455 200q5-15 10 0" stroke="${dirty ? "#7a6d55" : "#0e7c7b"}" stroke-width="5" fill="none"/>
  ${dirty ? `<g fill="#6e5f45" opacity=".55"><ellipse cx="120" cy="70" rx="40" ry="14"/><ellipse cx="260" cy="190" rx="50" ry="20"/><ellipse cx="300" cy="300" rx="30" ry="12"/><ellipse cx="480" cy="330" rx="45" ry="15"/><circle cx="90" cy="380" r="18"/><circle cx="520" cy="90" r="16"/></g><g stroke="#6e5f45" stroke-width="3" opacity=".5"><path d="M100 270l40 40M150 260l30 50"/></g>` : `<g fill="#fff"><path d="M120 60l6 14 14 6-14 6-6 14-6-14-14-6 14-6z"/><path d="M470 300l5 11 11 5-11 5-5 11-5-11-11-5 11-5z"/><path d="M300 170l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/></g>`}
</svg>`;
$("#before").innerHTML = kitchen(true); $("#after").innerHTML = kitchen(false);
const rng = $("#ba-range"), cmp = $("#compare");
const setBA = () => cmp.style.setProperty("--pos", rng.value + "%");
rng.addEventListener("input", setBA); setBA();

// Booking
const days = $("#days"), times = $("#times");
const base = new Date(); base.setHours(0, 0, 0, 0);
const DAYS = Array.from({ length: 7 }, (_, i) => new Date(base.getTime() + (i + 1) * 864e5));
// deterministic "busy" slots so the demo looks realistic
const busy = (d, t) => (d.getDate() * 7 + t) % 5 === 0;
let pick = { day: 0, time: null };
days.innerHTML = DAYS.map((d, i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-day="${i}"><small>${d.toLocaleDateString("ru-RU", { weekday: "short" })}</small><b>${d.getDate()}</b></button>`).join("");
function renderTimes() {
  const d = DAYS[pick.day];
  times.innerHTML = [8, 10, 12, 14, 16, 18].map((t) => `<button type="button" role="radio" aria-checked="${pick.time === t}" data-time="${t}" ${busy(d, t) ? "disabled" : ""}>${t}:00</button>`).join("");
}
days.addEventListener("click", (e) => { const b = e.target.closest("[data-day]"); if (!b) return; pick = { day: Number(b.dataset.day), time: null }; $$("[data-day]", days).forEach((x) => x.setAttribute("aria-checked", x === b)); renderTimes(); });
times.addEventListener("click", (e) => { const b = e.target.closest("[data-time]"); if (!b || b.disabled) return; pick.time = Number(b.dataset.time); $$("[data-time]", times).forEach((x) => x.setAttribute("aria-checked", x === b)); });
renderTimes();
const updateBookSum = () => { const q = calc(); $("#book-sum").innerHTML = `${q.text} — <b>${rub(q.total)}</b>, примерно ${q.hours} ч.`; };
$("#to-book").addEventListener("click", updateBookSum);
cf.addEventListener("input", updateBookSum); cf.addEventListener("click", updateBookSum); cf.addEventListener("change", updateBookSum);
const bf = $("#book-form");
bf.addEventListener("submit", (e) => {
  e.preventDefault();
  const errs = [];
  const mark = (el, bad) => { el.setAttribute("aria-invalid", bad); if (bad) errs.push(el.labels[0].textContent.toLowerCase()); };
  if (pick.time === null) errs.push("время начала");
  mark(bf.addr, bf.addr.value.trim().length < 6);
  mark(bf.name, bf.name.value.trim().length < 2);
  mark(bf.phone, bf.phone.value.replace(/\D/g, "").length < 10);
  $(".err", bf).textContent = errs.length ? "Укажите: " + errs.join(", ") + "." : "";
  if (errs.length) return;
  const d = DAYS[pick.day].toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  bf.innerHTML = `<div class="done" tabindex="-1"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#drop"/></svg><h3>Вы записаны</h3><p>${d}, ${pick.time}:00. ${quote.text}, ${rub(quote.total)}. Менеджер позвонит для подтверждения. Это демо — заявка никуда не отправлена.</p></div>`;
  $(".done").focus();
});
