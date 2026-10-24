// Live phone demo (steps & goal sliders), feature tabs switching the phone screen.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const n = (x) => Math.round(x).toLocaleString("ru-RU");
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const WEEK = [7200, 9100, 5400, 11200, 8300, 12600];
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
function update() {
  const s = Number($("#steps").value), g = Number($("#goal").value);
  $("#steps-out").textContent = n(s); $("#goal-out").textContent = n(g);
  $("#ring").style.setProperty("--p", Math.min(1, s / g));
  $("#ring").classList.toggle("ring--done", s >= g);
  $("#ring-steps").textContent = n(s); $("#ring-goal").textContent = `из ${n(g)}`;
  const km = s * 0.00072; // ~72 cm per step
  $("#km").textContent = km.toFixed(1).replace(".", ","); $("#kcal").textContent = n(km * 58); $("#min").textContent = n(s / 118);
  const all = [...WEEK, s], max = Math.max(g, ...all);
  $("#week").innerHTML = all.map((v, i) => `<div class="bar${v >= g ? " bar--ok" : ""}${i === 6 ? " bar--today" : ""}" style="--h:${(v / max) * 100}%"><i></i><span>${days[i]}</span></div>`).join("") + `<div class="goal-line" style="--g:${(g / max) * 100}%"></div>`;
  const left = g - s;
  $("#tip").textContent = s >= g ? `Цель выполнена! Это ${km.toFixed(1).replace(".", ",")} км — как прогулка вдоль набережной туда и обратно.` : left < 1500 ? `Осталось ${n(left)} шагов — это примерно ${Math.ceil(left / 118)} минут спокойным шагом.` : `Осталось ${n(left)} шагов. Приложение предложит короткую прогулку после обеда.`;
}
$("#steps").addEventListener("input", update); $("#goal").addEventListener("input", update); update();

const SCREENS = {
  goals: `<p class="s-hello">Цель на неделю</p><div class="s-goal"><b>10 500</b><span>шагов в день</span><p>+500 к прошлой неделе. Вы выполнили цель 5 дней из 7 — можно чуть больше.</p></div><div class="s-btns"><span>Оставить 10 000</span><span class="on">Принять 10 500</span></div>`,
  friends: `<p class="s-hello">Челлендж «Октябрь»</p><ol class="s-board"><li><i style="--c:#11c08f">М</i>Маша<b>82 400</b></li><li><i style="--c:#7c5cff">Д</i>Дима<b>79 100</b></li><li><i style="--c:#ff8a5c">А</i>Аня<b>65 300</b></li><li><i style="--c:#2db7f5">С</i>Саша<b>51 900</b></li></ol><p class="s-note">Команда прошла 278 км — это Москва → Тверь</p>`,
  nudges: `<p class="s-hello">Уведомления</p><div class="s-push"><b>Шаги · сейчас</b><p>Вы сидите уже час. Пройдёмся 5 минут? До цели 1 200 шагов.</p></div><div class="s-push s-push--muted"><b>Тихие часы</b><p>С 22:00 до 8:00 — без напоминаний</p></div><div class="s-toggle"><span>Не беспокоить на встречах</span><i></i></div>`,
};
const tabs = $$(".tabs [role=tab]");
function show(tab) { tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab))); $("#f-screen").innerHTML = SCREENS[tab.dataset.f]; }
tabs.forEach((t, i) => {
  t.addEventListener("click", () => show(t));
  t.addEventListener("keydown", (e) => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); const nx = tabs[(i + d + tabs.length) % tabs.length]; show(nx); nx.focus(); } });
});
show(tabs[0]);
