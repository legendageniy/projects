// Weekly schedule with filters and booking dialog, box-breathing exercise, plan advisor.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const C = (d, t, style, lvl, who, mins = 75) => ({ d, t, style, lvl, who, mins });
const CLASSES = [
  C(0, "08:00", "Хатха", 1, "Ева"), C(0, "19:30", "Виньяса", 2, "Кирилл"), C(0, "21:00", "Инь-йога", 1, "Лада", 60),
  C(1, "09:00", "Для спины", 1, "Ева"), C(1, "19:00", "Хатха", 1, "Ева"), C(1, "20:30", "Медитация", 1, "Лада", 45),
  C(2, "08:00", "Виньяса", 2, "Кирилл", 60), C(2, "19:30", "Для спины", 1, "Ева"),
  C(3, "09:00", "Хатха", 1, "Ева"), C(3, "19:00", "Виньяса", 2, "Кирилл"), C(3, "21:00", "Инь-йога", 1, "Лада", 60),
  C(4, "08:00", "Для спины", 1, "Ева"), C(4, "19:30", "Хатха", 2, "Кирилл"),
  C(5, "10:00", "Виньяса", 1, "Кирилл", 90), C(5, "12:00", "Медитация", 1, "Лада", 45),
  C(6, "11:00", "Хатха", 1, "Ева", 90), C(6, "18:00", "Инь-йога", 1, "Лада"),
];
const today = (new Date().getDay() + 6) % 7;
function renderWeek() {
  const style = $("#f-style").value, lvl = $("#f-level").value;
  $("#week").innerHTML = DAYS.map((d, i) => {
    const list = CLASSES.filter((c) => c.d === i && (!style || c.style === style) && (!lvl || String(c.lvl) === lvl));
    return `<div class="day${i === today ? " day--today" : ""}" role="listitem"><h3>${d}${i === today ? " <small>сегодня</small>" : ""}</h3>${list.map((c) => `<button type="button" class="cls lv${c.lvl}" data-c="${CLASSES.indexOf(c)}"><time>${c.t}</time><b>${c.style}</b><span>${c.who} · ${c.mins} мин</span></button>`).join("") || '<p class="none">—</p>'}</div>`;
  }).join("");
}
$("#f-style").addEventListener("change", renderWeek); $("#f-level").addEventListener("change", renderWeek);
renderWeek();

const modal = $("#modal"), mform = $("#m-form");
let chosen = null;
$("#week").addEventListener("click", (e) => {
  const b = e.target.closest("[data-c]"); if (!b) return;
  chosen = CLASSES[b.dataset.c];
  $("#m-title").textContent = chosen.style;
  $("#m-meta").textContent = `${["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"][chosen.d]}, ${chosen.t} · ${chosen.mins} минут · ведёт ${chosen.who}`;
  $(".m-msg").textContent = ""; mform.hidden = false; modal.showModal();
});
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
mform.addEventListener("submit", (e) => {
  e.preventDefault();
  const okN = mform.name.value.trim().length > 1, okP = mform.phone.value.replace(/\D/g, "").length >= 10;
  mform.name.setAttribute("aria-invalid", String(!okN)); mform.phone.setAttribute("aria-invalid", String(!okP));
  if (!okN || !okP) { $(".m-msg").textContent = "Укажите имя и телефон — пришлём напоминание."; return; }
  $(".m-msg").textContent = `Вы записаны: ${chosen.style}, ${chosen.t}${mform.first.checked ? ", первое занятие — 500 ₽" : ""}. Это демо — запись не создана.`;
  mform.reset();
});

// Box breathing: 4 phases x 4 s, 4 rounds
const PHASES = [["Вдох", "in"], ["Задержка", "hold"], ["Выдох", "out"], ["Пауза", "rest"]];
let timer = null;
$("#b-start").addEventListener("click", () => {
  const circle = $("#circle"), txt = $("#b-text"), btn = $("#b-start");
  if (timer) { clearTimeout(timer); timer = null; circle.className = "circle"; txt.textContent = "Остановлено"; btn.textContent = "Начать"; $("#b-rounds").textContent = ""; return; }
  btn.textContent = "Стоп";
  let step = 0;
  const run = () => {
    if (step >= 16) { circle.className = "circle"; txt.textContent = "Готово. Как вы?"; btn.textContent = "Ещё раз"; timer = null; $("#b-rounds").textContent = ""; return; }
    const [label, cls] = PHASES[step % 4];
    circle.className = `circle circle--${cls}`; txt.textContent = label;
    $("#b-rounds").textContent = `Круг ${Math.floor(step / 4) + 1} из 4`;
    step++; timer = setTimeout(run, 4000);
  };
  run();
});

// Plans and advice
const PLANS = [
  { id: "one", name: "Разовое", price: 1400, classes: 1, days: 1, note: "Одно занятие любого направления" },
  { id: "eight", name: "8 занятий", price: 8800, classes: 8, days: 30, note: "1 100 ₽ за занятие, 30 дней" },
  { id: "twelve", name: "12 занятий", price: 11400, classes: 12, days: 45, note: "950 ₽ за занятие, 45 дней" },
  { id: "unlim", name: "Безлимит", price: 13900, classes: Infinity, days: 30, note: "Любые занятия, 30 дней, заморозка 7 дней" },
];
function advise() {
  const pw = Number($("#per-week").value); $("#pw-out").textContent = pw;
  const month = Math.round(pw * 4.3);
  // Monthly spend: enough packs to cover the classes, but a pack also expires after `days`.
  const cost = (p) => (p.classes === 1 ? p.price * month : p.price * Math.max(p.classes === Infinity ? 0 : month / p.classes, 30 / p.days));
  const best = PLANS.reduce((a, b) => (cost(b) < cost(a) ? b : a));
  const word = month % 10 === 1 && month % 100 !== 11 ? "занятие" : month % 10 >= 2 && month % 10 <= 4 && (month % 100 < 12 || month % 100 > 14) ? "занятия" : "занятий";
  $("#advice").innerHTML = `≈ ${month} ${word} в месяц. Выгоднее всего — <b>${best.name}</b>: около ${rub(Math.round(cost(best) / month))} за занятие.`;
  $("#plans").innerHTML = PLANS.map((p) => `<article class="plan${p === best ? " plan--best" : ""}">${p === best ? '<p class="flag">Подходит вам</p>' : ""}<h3>${p.name}</h3><p class="price">${rub(p.price)}</p><p>${p.note}</p></article>`).join("");
}
$("#per-week").addEventListener("input", advise); advise();
