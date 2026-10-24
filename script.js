// Donation form with impact hints, campaign progress bars, monthly report with donut chart, volunteer form.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => Math.round(n).toLocaleString("ru-RU") + " ₽";
const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Donation
const f = $("#donate");
const IMPACT = [[300, "оплатит месяц ежедневных звонков одному подопечному"], [500, "соберёт продуктовый набор на неделю"], [1000, "купит лекарства на месяц по рецепту"], [3000, "оплатит установку поручней в ванной"], [10000, "покроет ремонт проводки в квартире"]];
const amount = () => Number(f.custom.value.replace(/\D/g, "")) || Number(f.sum.value || 0);
function impact() {
  const a = amount();
  const best = [...IMPACT].reverse().find(([v]) => a >= v);
  $("#impact").innerHTML = a ? (best ? `<b>${rub(a)}</b>${f.type.value === "month" ? " в месяц" : ""} ${best[1]}` : "Любая сумма важна: мы объединяем небольшие пожертвования") : "";
  $("#d-btn").textContent = a ? `Помочь — ${rub(a)}${f.type.value === "month" ? " в месяц" : ""}` : "Помочь";
}
f.custom.addEventListener("input", () => { f.custom.value = f.custom.value.replace(/\D/g, "").slice(0, 7); $$("[name=sum]").forEach((r) => (r.checked = false)); impact(); });
f.addEventListener("change", (e) => { if (e.target.name === "sum") f.custom.value = ""; impact(); });
impact();
f.addEventListener("submit", (e) => {
  e.preventDefault();
  const err = $(".err"), a = amount();
  const bad = a < 50 ? "Минимальная сумма — 50 ₽" : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? "Укажите email — пришлём на него чек" : !f.offer.checked ? "Отметьте согласие с офертой" : "";
  err.textContent = bad;
  if (bad) return;
  err.textContent = "";
  f.innerHTML = `<div class="thanks" tabindex="-1"><p class="hand">Спасибо!</p><p>Ваши ${rub(a)} помогут нашим подопечным. Это демо-сайт — платёж не проводится.</p></div>`;
  $(".thanks").focus();
});

// Campaigns
const CAMPS = [
  { t: "Слуховой аппарат для Валентины Ивановны", goal: 64000, got: 51200, days: 9, c: "#e86a33" },
  { t: "Новогодние подарки для 400 подопечных", goal: 600000, got: 237000, days: 38, c: "#23395d" },
  { t: "Ремонт ванной для ветерана Ивана Сергеевича", goal: 120000, got: 118400, days: 3, c: "#5b8c5a" },
];
$("#camp-list").innerHTML = CAMPS.map((c) => { const p = Math.round((c.got / c.goal) * 100); return `<article class="camp"><h3>${c.t}</h3><div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="Собрано ${p}%"><i style="width:${p}%;background:${c.c}"></i></div><p class="camp__nums"><b>${rub(c.got)}</b> из ${rub(c.goal)} · ${p}%</p><p class="camp__left">Осталось ${rub(c.goal - c.got)} · ${c.days} дн.</p><a class="btn btn--line" href="#donate">Поддержать</a></article>`; }).join("");

// Reports
const MONTHS = { "2026-09": [["Продукты", 412000], ["Лекарства", 286000], ["Ремонт", 198000], ["Медицинские обследования", 104000], ["Транспорт волонтёров", 46000]], "2026-08": [["Продукты", 398000], ["Лекарства", 251000], ["Ремонт", 264000], ["Медицинские обследования", 78000], ["Транспорт волонтёров", 41000]], "2026-07": [["Продукты", 376000], ["Лекарства", 243000], ["Ремонт", 312000], ["Медицинские обследования", 92000], ["Транспорт волонтёров", 39000]] };
const COLORS = ["#e86a33", "#23395d", "#5b8c5a", "#f2b84b", "#9a8bb8"];
$("#month").innerHTML = Object.keys(MONTHS).map((m) => `<option value="${m}">${new Date(m + "-15").toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</option>`).join("");
function report() {
  const rows = MONTHS[$("#month").value], total = rows.reduce((s, r) => s + r[1], 0);
  let acc = 0;
  $("#donut").style.background = `conic-gradient(${rows.map(([, v], i) => { const from = acc; acc += (v / total) * 360; return `${COLORS[i]} ${from}deg ${acc}deg`; }).join(",")})`;
  $("#donut").innerHTML = `<div><b>${rub(total)}</b><span>за месяц</span></div>`;
  $("#rows").innerHTML = rows.map(([n, v], i) => `<tr><th scope="row"><i style="background:${COLORS[i]}"></i>${n}</th><td>${rub(v)}</td><td>${Math.round((v / total) * 100)}%</td></tr>`).join("");
  $("#total").textContent = rub(total);
}
$("#month").addEventListener("change", report); report();

// Volunteer
$("#vform").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = e.target, okN = v.name.value.trim().length > 1, okP = v.phone.value.replace(/\D/g, "").length >= 10, okH = $$("[name=how]:checked").length > 0;
  v.name.setAttribute("aria-invalid", String(!okN)); v.phone.setAttribute("aria-invalid", String(!okP));
  $(".vmsg").textContent = okN && okP && okH ? `Спасибо, ${v.name.value.trim()}! Координатор из города ${v.city.value} позвонит в течение недели (демо).` : "Заполните имя, телефон и выберите хотя бы один вариант помощи.";
  if (okN && okP && okH) v.reset();
});
