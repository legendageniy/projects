// Menu tabs with a vegetarian filter, "open now" status, reservation form.
const MENU = {
  "Закуски": [
    ["Пхали ассорти", "Шпинат, свёкла и лобио с грецким орехом и зёрнами граната", 690, ["veg"]],
    ["Сациви из курицы", "Курица в густом ореховом соусе с имеретинским шафраном", 720, []],
    ["Баклажаны с орехами", "Рулетики с ореховой пастой, кинзой и гранатом", 590, ["veg"]],
    ["Сыры Грузии", "Сулугуни, имеретинский и копчёный сулугуни, зелень", 820, ["veg"]],
  ],
  "Хинкали": [
    ["Хинкали классические", "Говядина и свинина, зелень, перец. Цена за штуку", 95, []],
    ["Хинкали с бараниной", "Рубленая баранина, лук и кинза. Цена за штуку", 110, ["hot"]],
    ["Хинкали с сыром", "Сулугуни и имеретинский сыр. Цена за штуку", 90, ["veg"]],
    ["Хинкали с грибами", "Шампиньоны, лук и сливочное масло. Цена за штуку", 90, ["veg"]],
  ],
  "Горячее": [
    ["Чашушули", "Тушёная телятина с томатами и острым перцем", 980, ["hot"]],
    ["Шкмерули", "Цыплёнок, запечённый в сливочно-чесночном соусе", 1150, []],
    ["Мцвади из свинины", "Шашлык на виноградной лозе с луком и ткемали", 890, []],
    ["Аджапсандали", "Овощное рагу из баклажанов, перца и томатов", 620, ["veg"]],
  ],
  "Выпечка": [
    ["Хачапури по-аджарски", "Лодочка из теста с сыром, яйцом и сливочным маслом", 650, ["veg"]],
    ["Хачапури по-мегрельски", "Круглый, с сыром внутри и сверху", 720, ["veg"]],
    ["Лобиани", "Пирог с фасолью и специями", 520, ["veg"]],
    ["Кубдари", "Пирог с рубленой говядиной и свининой по-свански", 760, ["hot"]],
  ],
  "Десерты": [
    ["Пеламуши", "Кисель из виноградного сока с грецким орехом", 390, ["veg"]],
    ["Чурчхела", "Орехи в загущённом виноградном соке, 2 шт.", 290, ["veg"]],
    ["Медовик по-домашнему", "Восемь коржей и сметанный крем", 420, ["veg"]],
  ],
  "Вино": [
    ["Ркацители, квеври", "Белое сухое, янтарное. Кахетия. Бокал 150 мл", 650, ["veg"]],
    ["Саперави", "Красное сухое. Кахетия. Бокал 150 мл", 690, ["veg"]],
    ["Киндзмараули", "Красное полусладкое. Бокал 150 мл", 720, ["veg"]],
  ],
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";

const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Menu
const sections = Object.keys(MENU);
$("#tabs").innerHTML = sections.map((s, i) => `<button role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${s}</button>`).join("");
$("#panels").innerHTML = sections.map((s, i) => `<ul class="dishes" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" ${i ? "hidden" : ""}>${MENU[s].map(([n, d, p, t]) => `<li data-veg="${t.includes("veg")}"><div><h3>${n}${t.includes("veg") ? ' <span class="badge badge--veg" title="Без мяса">🌿</span>' : ""}${t.includes("hot") ? ' <span class="badge" title="Острое">🌶</span>' : ""}</h3><p>${d}</p></div><b>${rub(p)}</b></li>`).join("")}<li class="empty" hidden>В этом разделе нет блюд без мяса.</li></ul>`).join("");
const tabs = $$("#tabs [role=tab]");
function select(tab) {
  tabs.forEach((t) => { const on = t === tab; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; $("#" + t.getAttribute("aria-controls")).hidden = !on; });
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => select(t));
  t.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return; const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus(); });
});
$("#veg").addEventListener("change", (e) => {
  $$(".dishes").forEach((ul) => {
    let shown = 0;
    $$("li[data-veg]", ul).forEach((li) => { li.hidden = e.target.checked && li.dataset.veg !== "true"; if (!li.hidden) shown++; });
    $(".empty", ul).hidden = shown > 0;
  });
});

// Opening hours and live status
const HOURS = [[12, 23], [12, 23], [12, 23], [12, 23], [12, 24], [11, 24], [11, 23]]; // Mon..Sun
$("#hours").innerHTML = "Пн–Чт 12:00–23:00<br>Пт 12:00–00:00<br>Сб 11:00–00:00, Вс 11:00–23:00";
function status() {
  const now = new Date(), d = (now.getDay() + 6) % 7, h = now.getHours() + now.getMinutes() / 60;
  const [o, c] = HOURS[d];
  const open = h >= o && h < c;
  $("#status").textContent = open ? `Открыто до ${c === 24 ? "00:00" : c + ":00"}` : `Закрыто · откроемся в ${HOURS[h >= c ? (d + 1) % 7 : d][0]}:00`;
  $("#status").classList.toggle("open", open);
}
status(); setInterval(status, 60000);

// Reservation
const form = $("#form");
const today = new Date(); const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
form.date.min = iso(today); form.date.value = iso(today);
const max = new Date(today); max.setDate(max.getDate() + 60); form.date.max = iso(max);
function fillTimes() {
  const d = new Date(form.date.value + "T00:00"); const [o, c] = HOURS[(d.getDay() + 6) % 7];
  const isToday = form.date.value === iso(new Date()); const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const slots = [];
  for (let t = o; t <= c - 1.5; t += 0.5) if (!isToday || t > nowH + 0.5) slots.push(`${String(Math.floor(t)).padStart(2, "0")}:${t % 1 ? "30" : "00"}`);
  form.time.innerHTML = slots.length ? slots.map((s) => `<option>${s}</option>`).join("") : `<option value="">Сегодня мест нет — выберите другой день</option>`;
}
form.date.addEventListener("change", fillTimes); fillTimes();
let guests = 2;
$$("[data-g]").forEach((b) => b.addEventListener("click", () => { guests = Math.min(12, Math.max(1, guests + Number(b.dataset.g))); $("#guests").value = guests; }));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const checks = {
    date: (form.date.value >= form.date.min && form.date.value <= form.date.max) || "Выберите дату в ближайшие 60 дней",
    time: Boolean(form.time.value) || "Выберите время",
    name: form.name.value.trim().length >= 2 || "Как к вам обращаться?",
    phone: form.phone.value.replace(/\D/g, "").length >= 10 || "Укажите телефон для подтверждения",
  };
  let first = null;
  for (const [k, v] of Object.entries(checks)) { const bad = v !== true; form.elements[k].setAttribute("aria-invalid", String(bad)); $("#e-" + k).textContent = bad ? v : ""; if (bad && !first) first = form.elements[k]; }
  if (first) return first.focus();
  const zone = { main: "основной зал", wine: "винная комната", terrace: "веранда" }[form.zone.value];
  const date = new Date(form.date.value + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" });
  const ok = $(".ok");
  ok.innerHTML = `<b>Бронь принята!</b> ${date}, ${form.time.value}, гостей: ${guests}, ${zone}. Это демо-сайт — заявка никуда не отправлена.`;
  ok.hidden = false; ok.focus();
});
