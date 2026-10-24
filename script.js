// Repair cost calculator, order status lookup, booking form.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => Math.round(n).toLocaleString("ru-RU") + " ₽";
const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const WORKS = [
  ["oil", "Замена масла и фильтра", 1500, 0.5], ["to", "ТО по регламенту", 4900, 2], ["diag", "Компьютерная диагностика", 1800, 0.5],
  ["pads", "Замена передних колодок", 1600, 1], ["shocks", "Замена амортизаторов (2 шт.)", 4200, 2], ["align", "Развал-схождение", 2500, 1],
  ["timing", "Замена ремня ГРМ", 9800, 4], ["ac", "Заправка кондиционера", 3200, 1], ["tires", "Шиномонтаж 4 колёс", 2800, 1],
];
$("#works").innerHTML = WORKS.map(([id, n, p]) => `<label class="work"><input type="checkbox" name="w" value="${id}"><span>${n}</span><small>от ${rub(p)}</small></label>`).join("");
const form = $("#calc-form");
function calc() {
  const k = Number(form.cls.value);
  const sel = WORKS.filter(([id]) => form.querySelector(`[value=${id}]`).checked);
  const sum = sel.reduce((s, w) => s + w[2] * k, 0);
  const hours = sel.reduce((s, w) => s + w[3], 0);
  $("#r-lines").innerHTML = sel.length ? sel.map(([, n, p]) => `<li><span>${n}</span><b>${rub(p * k)}</b></li>`).join("") : `<li class="empty">Отметьте нужные работы</li>`;
  $("#r-total").textContent = rub(sum);
  $("#r-time").textContent = hours ? `Время работ: около ${hours < 1 ? "30 минут" : hours + " ч"}${hours >= 4 ? " — оставьте машину на день" : ", можно подождать в зоне отдыха"}` : "";
  $("#calc-note").textContent = sel.length ? `Ваш расчёт: ${sel.map((w) => w[1].toLowerCase()).join(", ")} — ${rub(sum)}.` : "";
}
form.addEventListener("change", calc); calc();

// Order status (demo orders)
const ORDERS = { "G24-1048": { car: "Kia Rio, 2018", step: 3, note: "Меняем амортизаторы. Готовность — сегодня до 18:00." }, "G24-2210": { car: "Toyota RAV4, 2020", step: 5, note: "Автомобиль готов. Ждём вас круглосуточно." }, "G24-0777": { car: "Skoda Octavia, 2016", step: 2, note: "Диагностика двигателя, позвоним до 14:00." } };
const track = $("#track");
function lookup(code) {
  const o = ORDERS[code.trim().toUpperCase()];
  const steps = $$("#progress li");
  steps.forEach((li, i) => { li.classList.toggle("done", Boolean(o) && i < o.step); li.classList.toggle("now", Boolean(o) && i === o.step - 1); });
  $("#track-msg").innerHTML = o ? `<b>${o.car}</b> — ${o.note}` : code.trim() ? "Заказ не найден. Проверьте номер в SMS или позвоните нам." : "Введите номер заказа.";
  $("#order").setAttribute("aria-invalid", String(!o));
}
track.addEventListener("submit", (e) => { e.preventDefault(); lookup($("#order").value); });
$$("[data-try]").forEach((b) => b.addEventListener("click", () => { $("#order").value = b.dataset.try; lookup(b.dataset.try); }));

// Booking
const bf = $("#book-form");
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
bf.date.min = iso(new Date()); bf.date.value = iso(new Date(Date.now() + 864e5));
bf.addEventListener("submit", (e) => {
  e.preventDefault();
  const y = Number(bf.year.value), now = new Date().getFullYear();
  const errs = [];
  const mark = (el, bad, msg) => { el.setAttribute("aria-invalid", String(bad)); if (bad) errs.push(msg); };
  mark(bf.car, bf.car.value.trim().length < 2, "марку и модель");
  mark(bf.year, !(y >= 1980 && y <= now + 1), "год выпуска");
  mark(bf.date, !bf.date.value || bf.date.value < bf.date.min, "дату");
  mark(bf.name, bf.name.value.trim().length < 2, "имя");
  mark(bf.phone, bf.phone.value.replace(/\D/g, "").length < 10, "телефон");
  const msg = $(".form__msg");
  if (errs.length) { msg.textContent = "Укажите: " + errs.join(", ") + "."; return bf.querySelector('[aria-invalid="true"]').focus(); }
  msg.textContent = `Записали: ${bf.car.value.trim()}, ${new Date(bf.date.value + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} в ${bf.time.value}. Это демо — звонка не будет.`;
  bf.reset(); bf.date.value = iso(new Date(Date.now() + 864e5));
});
