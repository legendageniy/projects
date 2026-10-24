// Interactive floor plan with deterministic occupancy per date/slot, meeting-room hourly booking.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = "http://www.w3.org/2000/svg";
const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const dateIn = $("#m-date"); dateIn.min = iso(new Date()); dateIn.value = iso(new Date());
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// Desks: open space grid (left) and quiet zone (right)
const DESKS = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) DESKS.push({ id: `A${r * 7 + c + 1}`, x: 40 + c * 66, y: 70 + r * 60, zone: "Open space", mon: c % 3 === 0 });
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) DESKS.push({ id: `T${r * 4 + c + 1}`, x: 560 + c * 76, y: 70 + r * 60, zone: "Тихая зона", mon: true });
const ROOMS = { r1: { name: "«Соты»", cap: 6 }, r2: { name: "«Пасека»", cap: 10 }, r3: { name: "«Рой»", cap: 4 } };
const g = $("#desks");
g.innerHTML = "";
DESKS.forEach((d) => {
  const el = document.createElementNS(NS, "g");
  el.setAttribute("class", "desk"); el.dataset.id = d.id; el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
  el.innerHTML = `<rect x="${d.x}" y="${d.y}" width="54" height="40" rx="8"/><text x="${d.x + 27}" y="${d.y + 25}">${d.id}</text>`;
  g.append(el);
});
$$(".room").forEach((r) => { r.setAttribute("tabindex", "0"); r.setAttribute("role", "button"); });
let selected = null;
const SLOT_HOURS = { am: [9, 10, 11, 12, 13], pm: [14, 15, 16, 17, 18, 19], day: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] };
const hourBusy = (room, h) => hash(room + dateIn.value + h) % 10 < 3;
// A desk is busy by a stable pseudo-random rule; a meeting room counts as busy when fewer than 2 hours are free in the slot.
const busy = (id) => ROOMS[id] ? SLOT_HOURS[$("#m-slot").value].filter((h) => !hourBusy(id, h)).length < 2 : hash(id + dateIn.value + $("#m-slot").value) % 10 < ($("#m-slot").value === "day" ? 5 : 3);
function paint() {
  $$(".desk, .room").forEach((el) => {
    const id = el.dataset.id ?? el.dataset.room, b = busy(id);
    el.classList.toggle("is-busy", b); el.classList.toggle("is-sel", id === selected && !b);
    const label = el.dataset.id ? `Место ${id}` : `Переговорная ${ROOMS[id].name}`;
    el.setAttribute("aria-label", `${label}: ${b ? "занято" : id === selected ? "выбрано" : "свободно"}`);
    el.setAttribute("aria-disabled", String(b));
  });
  if (selected && busy(selected)) selected = null;
  const free = DESKS.filter((d) => !busy(d.id)).length;
  info(free);
}
function info(free) {
  const box = $("#pick-info");
  if (!selected) { box.innerHTML = `<p class="muted">Свободно мест: <b>${free}</b> из ${DESKS.length}. Нажмите на место или переговорную на схеме.</p>`; return; }
  const d = DESKS.find((x) => x.id === selected), room = ROOMS[selected];
  const slot = $("#m-slot").selectedOptions[0].textContent, date = new Date(dateIn.value + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  box.innerHTML = d
    ? `<h3>Место ${d.id}</h3><p>${d.zone}${d.mon ? " · с монитором 27″" : ""}</p><p>${date}, ${slot}</p><p class="price">${$("#m-slot").value === "day" ? "590 ₽" : "390 ₽"}</p><button class="btn btn--wide" type="button" id="book-desk">Забронировать</button><p class="ok" role="status"></p>`
    : `<h3>Переговорная ${room.name}</h3><p>До ${room.cap} человек · экран и камера</p><p>${date}, ${slot}</p><a class="btn btn--wide" href="#rooms">Выбрать часы</a>`;
  $("#book-desk")?.addEventListener("click", (e) => { e.target.disabled = true; $(".pick .ok").textContent = `Место ${d.id} забронировано (демо — без оплаты).`; });
  if (room) $("#r-room").value = selected, renderHours();
}
function choose(el) {
  const id = el.dataset.id ?? el.dataset.room;
  if (busy(id)) return;
  selected = selected === id ? null : id; paint();
}
$("#plan").addEventListener("click", (e) => { const el = e.target.closest(".desk, .room"); if (el) choose(el); });
$("#plan").addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".desk, .room")) { e.preventDefault(); choose(e.target); } });
dateIn.addEventListener("change", () => { paint(); renderHours(); }); $("#m-slot").addEventListener("change", paint);
paint();

// Meeting room hours
const picked = new Set();
function renderHours() {
  picked.clear();
  const room = $("#r-room").value;
  $("#hours").innerHTML = Array.from({ length: 12 }, (_, i) => 9 + i).map((h) => { const b = hourBusy(room, h); return `<button type="button" class="hour" data-h="${h}" ${b ? "disabled" : ""} aria-pressed="false">${h}:00${b ? "<small>занято</small>" : ""}</button>`; }).join("");
  sum();
}
function sum() {
  const hs = [...picked].sort((a, b) => a - b);
  const contiguous = hs.every((h, i) => !i || h === hs[i - 1] + 1);
  $("#r-book").disabled = !hs.length || !contiguous;
  $("#r-sum").textContent = !hs.length ? "" : contiguous ? `${hs[0]}:00–${hs.at(-1) + 1}:00 · ${hs.length} ч · ${(hs.length * 1500).toLocaleString("ru-RU")} ₽` : "Выберите часы подряд, без разрывов";
}
$("#hours").addEventListener("click", (e) => { const b = e.target.closest(".hour"); if (!b || b.disabled) return; const h = Number(b.dataset.h); picked.has(h) ? picked.delete(h) : picked.add(h); b.setAttribute("aria-pressed", String(picked.has(h))); $("#r-msg").textContent = ""; sum(); });
$("#r-room").addEventListener("change", renderHours);
$("#r-book").addEventListener("click", () => { $("#r-msg").textContent = `Переговорная ${ROOMS[$("#r-room").value].name} забронирована: ${$("#r-sum").textContent}. Демо — без оплаты.`; });
renderHours();
