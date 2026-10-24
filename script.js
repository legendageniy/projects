// Doctors directory with search/specialty filter, step-by-step booking with deterministic free slots, price list search.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const DOCTORS = [
  { id: 1, name: "Ирина Павлова", spec: "Терапевт", exp: 14, price: 2900, c: "#1e6fd9" },
  { id: 2, name: "Алексей Морозов", spec: "Терапевт", exp: 9, price: 2600, c: "#2ec4a6" },
  { id: 3, name: "Наталья Ким", spec: "Педиатр", exp: 18, price: 2900, c: "#f2994a" },
  { id: 4, name: "Сергей Лебедев", spec: "Кардиолог", exp: 21, price: 3900, c: "#eb5757" },
  { id: 5, name: "Ольга Захарова", spec: "Невролог", exp: 12, price: 3500, c: "#9b51e0" },
  { id: 6, name: "Марина Соловьёва", spec: "Гинеколог", exp: 16, price: 3400, c: "#d64f8c" },
  { id: 7, name: "Дмитрий Егоров", spec: "Эндокринолог", exp: 11, price: 3500, c: "#219653" },
  { id: 8, name: "Анна Белая", spec: "Дерматолог", exp: 8, price: 3200, c: "#2d9cdb" },
];
const SPECS = ["Все", ...new Set(DOCTORS.map((d) => d.spec))];
const initials = (n) => n.split(" ").map((w) => w[0]).join("");
let spec = "Все", query = "";
$("#specs").innerHTML = SPECS.map((s) => `<button type="button" aria-pressed="${s === "Все"}" data-s="${s}">${s}</button>`).join("");
function renderDoctors() {
  const q = query.toLowerCase();
  const list = DOCTORS.filter((d) => (spec === "Все" || d.spec === spec) && (!q || (d.name + " " + d.spec).toLowerCase().includes(q)));
  $$("#specs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === spec)));
  $("#found").textContent = q ? `По запросу «${query}» найдено врачей: ${list.length}` : "";
  $("#doctor-list").innerHTML = list.map((d) => `<article class="doc"><span class="ava" style="--c:${d.c}" aria-hidden="true">${initials(d.name)}</span><div><h3>${d.name}</h3><p>${d.spec} · стаж ${d.exp} лет</p><p class="price">Приём ${rub(d.price)}</p></div><button type="button" class="btn btn--line" data-book="${d.id}">Записаться</button></article>`).join("") || `<p class="empty">Не нашли такого врача. Попробуйте «терапевт» или позвоните нам — подскажем.</p>`;
}
$("#specs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { spec = b.dataset.s; renderDoctors(); } });
$$("[data-spec]").forEach((a) => a.addEventListener("click", () => { spec = a.dataset.spec; query = ""; renderDoctors(); }));
$("#find").addEventListener("submit", (e) => {
  e.preventDefault(); query = $("#q").value.trim(); spec = "Все";
  const isService = PRICES.some(([, items]) => items.some(([n]) => n.toLowerCase().includes(query.toLowerCase())));
  if (query && !DOCTORS.some((d) => (d.name + d.spec).toLowerCase().includes(query.toLowerCase())) && isService) {
    $("#psearch").value = query; renderPrices(); $("#prices").scrollIntoView(); return;
  }
  renderDoctors(); $("#doctors").scrollIntoView();
});
renderDoctors();

// Booking
const form = $("#booking-form");
$("#b-doc").innerHTML = DOCTORS.map((d) => `<option value="${d.id}">${d.name} — ${d.spec}, ${rub(d.price)}</option>`).join("");
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const DAYS = [];
for (let k = 1; DAYS.length < 7; k++) { const d = new Date(); d.setDate(d.getDate() + k); DAYS.push(d); }
let day = iso(DAYS[0]), slot = "";
const busy = (doc, date, t) => ((doc * 31 + Number(date.slice(-2)) * 7 + t.charCodeAt(1) * 3 + t.charCodeAt(3)) % 5) < 2; // stable pseudo-random
function renderDays() {
  $("#days").innerHTML = DAYS.map((d) => { const v = iso(d); return `<label class="day"><input type="radio" name="day" value="${v}" ${v === day ? "checked" : ""}><span><small>${d.toLocaleDateString("ru-RU", { weekday: "short" })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString("ru-RU", { month: "short" })}</small></span></label>`; }).join("");
}
function renderSlots() {
  const doc = Number(form.doctor.value), sunday = new Date(day + "T12:00").getDay() === 0;
  const times = []; for (let h = sunday ? 9 : 8; h < (sunday ? 18 : 21); h++) for (const m of ["00", "30"]) times.push(`${String(h).padStart(2, "0")}:${m}`);
  const free = times.filter((t) => !busy(doc, day, t));
  if (!free.includes(slot)) slot = "";
  $("#slots").innerHTML = free.map((t) => `<label class="slot"><input type="radio" name="slot" value="${t}" ${t === slot ? "checked" : ""}><span>${t}</span></label>`).join("");
  summary();
}
function summary() {
  const d = DOCTORS.find((x) => x.id === Number(form.doctor.value));
  const when = new Date(day + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" });
  $("#b-summary").innerHTML = slot ? `<b>${d.name}</b>, ${when}, ${slot} · ${rub(d.price)}` : "Выберите время приёма";
}
form.addEventListener("change", (e) => {
  if (e.target.name === "day") { day = e.target.value; renderSlots(); }
  if (e.target.name === "doctor") renderSlots();
  if (e.target.name === "slot") { slot = e.target.value; summary(); $("#e-slot").textContent = ""; }
});
document.addEventListener("click", (e) => { const b = e.target.closest("[data-book]"); if (b) { form.doctor.value = b.dataset.book; renderSlots(); $("#booking").scrollIntoView(); } });
renderDays(); renderSlots();
form.birth.max = iso(new Date());
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const checks = {
    slot: Boolean(slot) || "Выберите время",
    name: form.name.value.trim().split(/\s+/).length >= 2 || "Укажите фамилию и имя",
    phone: form.phone.value.replace(/\D/g, "").length >= 10 || "Укажите телефон для SMS",
    birth: (form.birth.value && form.birth.value <= form.birth.max) || "Укажите дату рождения",
    consent: form.consent.checked || "Без согласия мы не можем записать вас на приём",
  };
  let first = null;
  for (const [k, v] of Object.entries(checks)) { const bad = v !== true; $("#e-" + k).textContent = bad ? v : ""; const el = k === "slot" ? null : form.elements[k]; el?.setAttribute("aria-invalid", String(bad)); if (bad && !first) first = el ?? $("#slots input"); }
  if (first) return first.focus();
  const done = $("#done"); done.hidden = false;
  done.innerHTML = `<h3>Вы записаны</h3><p>${$("#b-summary").innerHTML}. Это демо-сайт: запись не создана и SMS не придёт.</p>`;
  done.focus();
});

// Prices
const PRICES = [
  ["Приёмы врачей", [["Приём терапевта", 2900], ["Приём педиатра", 2900], ["Приём кардиолога", 3900], ["Приём невролога", 3500], ["Повторный приём", 2200]]],
  ["Диагностика", [["УЗИ брюшной полости", 2800], ["УЗИ щитовидной железы", 1900], ["ЭКГ с расшифровкой", 1200], ["ЭхоКГ", 3900], ["Холтер (суточный)", 4500]]],
  ["Анализы", [["Общий анализ крови", 590], ["Биохимия, 12 показателей", 2400], ["Гормоны щитовидной железы", 1600], ["Витамин D", 2100]]],
];
function renderPrices() {
  const q = $("#psearch").value.trim().toLowerCase();
  const html = PRICES.map(([group, items]) => { const rows = items.filter(([n]) => !q || n.toLowerCase().includes(q)); return rows.length ? `<details ${q ? "open" : ""}><summary>${group}<span>${rows.length}</span></summary><table><caption class="sr">${group}</caption>${rows.map(([n, p]) => `<tr><th scope="row">${esc(n)}</th><td>${rub(p)}</td></tr>`).join("")}</table></details>` : ""; }).join("");
  $("#price-list").innerHTML = html || `<p class="empty">Ничего не нашли. Уточните у администратора: 8 800 000-00-00.</p>`;
}
$("#psearch").addEventListener("input", renderPrices);
renderPrices();
$("#price-list details")?.setAttribute("open", "");
