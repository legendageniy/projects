// Age filter for programs and schedule, subscription prices, memory game, trial lesson dialog.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const AGES = [["1-3", "1–3 года"], ["3-5", "3–5 лет"], ["5-7", "5–7 лет"], ["7-10", "7–10 лет"]];
const PROGRAMS = [
  { id: "baby", n: "Мама и малыш", ages: ["1-3"], color: "#ff9fb2", price: 650, d: "Пальчиковые игры, сенсорные коробки и песенки вместе с родителем.", icon: "M30 60a20 20 0 1 1 40 0a20 20 0 1 1-40 0M45 40a5 5 0 1 1 10 0" },
  { id: "senso", n: "Сенсорика", ages: ["1-3", "3-5"], color: "#6cc3f5", price: 700, d: "Цвета, формы, фактуры. Развиваем мелкую моторику и внимание.", icon: "M25 75h50L50 25z" },
  { id: "art", n: "Рисование", ages: ["3-5", "5-7", "7-10"], color: "#ffcf4a", price: 750, d: "Гуашь, пастель, глина. Каждый месяц — маленькая выставка работ.", icon: "M30 70q20-50 40 0M50 30v10" },
  { id: "eng", n: "Английский", ages: ["3-5", "5-7", "7-10"], color: "#7bc96f", price: 800, d: "Игровой метод, песни и сценки. Говорим с первого занятия.", icon: "M30 35h40v30H45l-10 10V65h-5z" },
  { id: "school", n: "Подготовка к школе", ages: ["5-7"], color: "#ff8a3d", price: 850, d: "Чтение по слогам, счёт до 20, письмо по клеточкам и усидчивость.", icon: "M28 30h44v42H28zM28 44h44M42 30v42" },
  { id: "robo", n: "Робототехника", ages: ["5-7", "7-10"], color: "#8a6bd1", price: 950, d: "Собираем и программируем роботов из конструктора. Первые алгоритмы.", icon: "M32 40h36v30H32zM42 52h2M56 52h2M50 28v12M44 62h12" },
  { id: "dance", n: "Танцы", ages: ["3-5", "5-7", "7-10"], color: "#ff6f91", price: 700, d: "Ритмика, растяжка и постановка номеров к праздникам.", icon: "M50 25a6 6 0 1 1 0 .1M50 37v20l-12 18M50 57l12 18M36 45h28" },
];
// [programId, day 0-6, time, age group]
const SLOTS = [["baby", 0, "10:00", "1-3"], ["senso", 0, "11:00", "1-3"], ["art", 0, "17:00", "5-7"], ["eng", 0, "18:00", "7-10"], ["school", 1, "16:00", "5-7"], ["senso", 1, "10:00", "3-5"], ["robo", 1, "17:30", "7-10"], ["dance", 1, "18:30", "3-5"], ["baby", 2, "10:00", "1-3"], ["eng", 2, "16:30", "3-5"], ["art", 2, "17:30", "7-10"], ["school", 3, "16:00", "5-7"], ["robo", 3, "17:00", "5-7"], ["dance", 3, "18:00", "5-7"], ["senso", 4, "11:00", "1-3"], ["eng", 4, "17:00", "5-7"], ["art", 4, "18:00", "3-5"], ["dance", 5, "11:00", "7-10"], ["baby", 5, "10:00", "1-3"], ["robo", 5, "12:00", "5-7"], ["school", 5, "13:00", "5-7"]];
const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const prog = (id) => PROGRAMS.find((p) => p.id === id);
let age = null;

$("#ages").innerHTML = `<button type="button" aria-pressed="true" data-age="">Все</button>` + AGES.map(([k, l]) => `<button type="button" aria-pressed="false" data-age="${k}">${l}</button>`).join("");
function renderPrograms() {
  const list = PROGRAMS.filter((p) => !age || p.ages.includes(age));
  $("#program-list").innerHTML = list.map((p) => `<article class="prog" style="--c:${p.color}">
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="var(--c)"/><path d="${p.icon}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h3>${p.n}</h3><p>${p.d}</p>
    <p class="prog__meta"><span>${p.ages.map((a) => AGES.find((x) => x[0] === a)[1]).join(", ")}</span><b>${rub(p.price)}</b></p>
    <button type="button" class="link" data-trial="${p.id}">Попробовать бесплатно →</button></article>`).join("");
}
function renderSchedule() {
  const times = [...new Set(SLOTS.map((s) => s[2]))].sort();
  $("#sched").innerHTML = `<caption class="sr">Расписание групп по дням недели</caption><thead><tr><th scope="col">Время</th>${DAYS.map((d) => `<th scope="col">${d}</th>`).join("")}</tr></thead><tbody>${times.map((t) => `<tr><th scope="row">${t}</th>${DAYS.map((_, d) => {
    const s = SLOTS.filter((x) => x[1] === d && x[2] === t);
    return `<td>${s.map(([id, , , a]) => `<span class="cell ${age && a !== age ? "dim" : ""}" style="--c:${prog(id).color}"><b>${prog(id).n}</b><small>${AGES.find((x) => x[0] === a)[1]}</small></span>`).join("")}</td>`;
  }).join("")}</tr>`).join("")}</tbody>`;
  $("#sched-note").textContent = age ? `Подсвечены группы для возраста ${AGES.find((x) => x[0] === age)[1]}.` : "Показаны все группы. Выберите возраст выше, чтобы подсветить подходящие.";
}
$("#ages").addEventListener("click", (e) => {
  const b = e.target.closest("[data-age]"); if (!b) return;
  age = b.dataset.age || null;
  $$("[data-age]").forEach((x) => x.setAttribute("aria-pressed", x === b));
  renderPrograms(); renderSchedule();
});
renderPrograms(); renderSchedule();

// Plans
const PLANS = [{ n: "Одно направление", k: 1, note: "Любое занятие из расписания" }, { n: "Два направления", k: 1.8, note: "Например, английский + рисование", hit: true }, { n: "Полный день", k: 2.6, note: "Три занятия подряд и обед" }];
let lessons = 8;
function renderPlans() {
  const per = { 4: 800, 8: 720, 12: 660 }[lessons];
  $("#plans").innerHTML = PLANS.map((p) => { const total = Math.round((per * lessons * p.k) / 10) * 10; return `<article class="plan ${p.hit ? "plan--hit" : ""}">${p.hit ? '<span class="badge">Выбирают чаще</span>' : ""}<h3>${p.n}</h3><p class="plan__price">${rub(total)}<small>/мес</small></p><p class="muted">${p.note}</p><p class="muted">${rub(Math.round(total / lessons / p.k))} за занятие</p><button class="btn ${p.hit ? "" : "btn--ghost"}" type="button" data-trial>Начать с пробного</button></article>`; }).join("");
}
$(".switch").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (!b) return; lessons = Number(b.dataset.n); $$(".switch [data-n]").forEach((x) => x.setAttribute("aria-pressed", x === b)); renderPlans(); });
renderPlans();

// Memory game
const ANIMALS = [
  ["Котёнок", "#ffcf4a", '<path d="M30 40l8-18 10 14h4l10-14 8 18v22a20 18 0 0 1-40 0z" fill="#ffcf4a"/><circle cx="42" cy="50" r="3"/><circle cx="58" cy="50" r="3"/><path d="M47 58h6l-3 3z" fill="#ff6f91"/>'],
  ["Лягушка", "#7bc96f", '<ellipse cx="50" cy="58" rx="24" ry="18" fill="#7bc96f"/><circle cx="38" cy="38" r="9" fill="#7bc96f"/><circle cx="62" cy="38" r="9" fill="#7bc96f"/><circle cx="38" cy="38" r="4"/><circle cx="62" cy="38" r="4"/><path d="M40 62q10 8 20 0" stroke="#24325f" stroke-width="3" fill="none"/>'],
  ["Рыбка", "#6cc3f5", '<path d="M24 50q20-24 44 0q-24 24-44 0z" fill="#6cc3f5"/><path d="M66 50l14-12v24z" fill="#6cc3f5"/><circle cx="36" cy="47" r="3"/>'],
  ["Свинка", "#ff9fb2", '<circle cx="50" cy="52" r="22" fill="#ff9fb2"/><path d="M32 34l-4-10 12 6zM68 34l4-10-12 6z" fill="#ff9fb2"/><ellipse cx="50" cy="58" rx="9" ry="6" fill="#ff6f91"/><circle cx="47" cy="58" r="1.6"/><circle cx="53" cy="58" r="1.6"/><circle cx="42" cy="46" r="2.6"/><circle cx="58" cy="46" r="2.6"/>'],
  ["Лиса", "#ff8a3d", '<path d="M26 30l12 10h24l12-10-4 26-20 16-20-16z" fill="#ff8a3d"/><path d="M38 58l12 14 12-14-12 4z" fill="#fff"/><circle cx="42" cy="48" r="3"/><circle cx="58" cy="48" r="3"/><circle cx="50" cy="70" r="2.6"/>'],
  ["Совёнок", "#8a6bd1", '<use href="#owl" x="20" y="18" width="60" height="64"/>'],
];
const board = $("#board");
let open = [], moves = 0, pairs = 0, lock = false;
function newGame() {
  const deck = [...ANIMALS.keys(), ...ANIMALS.keys()].sort(() => Math.random() - 0.5);
  moves = 0; pairs = 0; open = []; lock = false;
  $("#moves").textContent = 0; $("#pairs").textContent = 0;
  board.innerHTML = deck.map((a, i) => `<button type="button" class="card" data-a="${a}" aria-label="Карточка ${i + 1}, закрыта"><span class="card__in"><span class="card__back"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#owl" x="25" y="22" width="50" height="56" opacity=".35"/></svg></span><span class="card__face" style="--c:${ANIMALS[a][1]}"><svg viewBox="0 0 100 100" aria-hidden="true">${ANIMALS[a][2]}</svg></span></span></button>`).join("");
}
board.addEventListener("click", (e) => {
  const c = e.target.closest(".card");
  if (!c || lock || c.classList.contains("is-open")) return;
  c.classList.add("is-open"); c.setAttribute("aria-label", ANIMALS[c.dataset.a][0]);
  open.push(c);
  if (open.length < 2) return;
  moves++; $("#moves").textContent = moves;
  const [a, b] = open;
  if (a.dataset.a === b.dataset.a) {
    a.classList.add("is-done"); b.classList.add("is-done"); a.disabled = b.disabled = true; open = [];
    pairs++; $("#pairs").textContent = pairs;
    if (pairs === ANIMALS.length) setTimeout(() => { $(".score").insertAdjacentHTML("beforeend", `<span class="win">Ура! Все пары за ${moves} ходов 🎉</span>`); }, 300);
  } else {
    lock = true;
    setTimeout(() => { [a, b].forEach((x, i) => { x.classList.remove("is-open"); x.setAttribute("aria-label", `Карточка ${$$(".card").indexOf(x) + 1}, закрыта`); }); open = []; lock = false; }, 800);
  }
});
$("#restart").addEventListener("click", () => { $(".win")?.remove(); newGame(); });
newGame();

// Trial dialog
const dlg = $("#trial"), tf = $("#trial-form"), formHTML = tf.innerHTML;
const resetForm = () => { tf.innerHTML = formHTML; tf.age.innerHTML = AGES.map(([k, l]) => `<option value="${k}">${l}</option>`).join(""); };
resetForm();
function fillProgs() {
  const list = PROGRAMS.filter((p) => p.ages.includes(tf.age.value));
  const cur = tf.prog.value;
  tf.prog.innerHTML = list.map((p) => `<option value="${p.id}">${p.n}</option>`).join("");
  if (list.some((p) => p.id === cur)) tf.prog.value = cur;
  fillSlots();
}
function fillSlots() {
  const s = SLOTS.filter((x) => x[0] === tf.prog.value && x[3] === tf.age.value);
  tf.slot.innerHTML = s.length ? s.map((x) => `<option>${DAYS[x[1]]}, ${x[2]}</option>`).join("") : `<option value="">Нет группы — администратор подберёт время</option>`;
}
tf.age.addEventListener("change", fillProgs); tf.prog.addEventListener("change", fillSlots);
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-trial]"); if (!t) return;
  if (!tf.age) resetForm();
  const p = t.dataset.trial;
  if (p) { const a = age && prog(p).ages.includes(age) ? age : prog(p).ages[0]; tf.age.value = a; fillProgs(); tf.prog.value = p; fillSlots(); }
  else { tf.age.value = age || "3-5"; fillProgs(); }
  dlg.showModal(); tf.child.focus();
});
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
tf.addEventListener("submit", (e) => {
  e.preventDefault();
  const errs = [];
  const bad = (el, cond, name) => { el.setAttribute("aria-invalid", cond); if (cond) errs.push(name); };
  bad(tf.child, tf.child.value.trim().length < 2, "имя ребёнка");
  bad(tf.phone, tf.phone.value.replace(/\D/g, "").length < 10, "телефон");
  $(".err", tf).textContent = errs.length ? "Заполните: " + errs.join(", ") + "." : "";
  if (errs.length) return;
  const slot = tf.slot.value ? ` в ${tf.slot.value}` : "";
  tf.innerHTML = `<div class="done"><svg aria-hidden="true"><use href="#owl"/></svg><h2 tabindex="-1">Ждём в гости!</h2><p>${tf.child.value.trim()}, «${prog(tf.prog.value).n}»${slot}. Администратор позвонит, чтобы подтвердить. Это демо — запись не создана.</p></div>`;
  $(".done h2").focus();
});
