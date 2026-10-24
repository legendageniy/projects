// Typing code demo, course filter, course quiz, payment toggle, signup form.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Typing effect in the hero editor
const CODE = `tasks = ["код-ревью", "проект", "собеседование"]\n\nfor step, task in enumerate(tasks, 1):\n    print(f"Шаг {step}: {task} ✓")`;
const OUT = "Шаг 1: код-ревью ✓\nШаг 2: проект ✓\nШаг 3: собеседование ✓";
const typed = $("#typed"), out = $("#output");
const paint = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]).replace(/(".*?")/g, '<span class="s">$1</span>').replace(/\b(for|in|print|enumerate)\b/g, '<span class="k">$1</span>');
if (reduce) { typed.innerHTML = paint(CODE); out.textContent = OUT; }
else {
  let i = 0;
  const tick = () => {
    typed.innerHTML = paint(CODE.slice(0, ++i));
    if (i < CODE.length) setTimeout(tick, CODE[i - 1] === "\n" ? 220 : 38);
    else setTimeout(() => (out.textContent = OUT), 400);
  };
  setTimeout(tick, 500);
}

// Courses
const COURSES = [
  { t: "Веб-разработчик", dir: "web", level: "zero", months: 9, price: "от 4 444 ₽/мес", tags: ["HTML/CSS", "JavaScript", "React", "Node.js"], c: "#c6ff3d" },
  { t: "Frontend на React", dir: "web", level: "up", months: 5, price: "от 3 900 ₽/мес", tags: ["React", "TypeScript", "Next.js"], c: "#7cf7ff" },
  { t: "Python-разработчик", dir: "web", level: "zero", months: 10, price: "от 4 600 ₽/мес", tags: ["Python", "Django", "PostgreSQL"], c: "#ffd166" },
  { t: "Аналитик данных", dir: "data", level: "zero", months: 8, price: "от 4 100 ₽/мес", tags: ["SQL", "Python", "Power BI"], c: "#ff9bd2" },
  { t: "Data Scientist", dir: "data", level: "up", months: 12, price: "от 5 900 ₽/мес", tags: ["Pandas", "ML", "Статистика"], c: "#b69bff" },
  { t: "Тестировщик ПО", dir: "qa", level: "zero", months: 6, price: "от 2 900 ₽/мес", tags: ["Ручное тестирование", "SQL", "Postman"], c: "#8affc1" },
  { t: "Автотесты на Python", dir: "qa", level: "up", months: 5, price: "от 3 700 ₽/мес", tags: ["Pytest", "Selenium", "CI"], c: "#ffb38a" },
];
const state = { dir: "all", level: "all" };
const renderCourses = () => {
  const list = COURSES.filter((c) => (state.dir === "all" || c.dir === state.dir) && (state.level === "all" || c.level === state.level));
  $("#course-list").innerHTML = list.map((c) => `<article class="course" style="--c:${c.c}"><div class="course__top"><span class="badge">${c.level === "zero" ? "С нуля" : "Для практиков"}</span><span>${c.months} мес</span></div><h3>${c.t}</h3><ul>${c.tags.map((x) => `<li>${x}</li>`).join("")}</ul><div class="course__bottom"><b>${c.price}</b><a href="#signup" aria-label="Записаться на курс «${c.t}»">→</a></div></article>`).join("") || `<p class="empty">Такого сочетания пока нет — выберите другой фильтр.</p>`;
};
$$(".seg").forEach((seg) => seg.addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $$("button", seg).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  state[seg.dataset.key] = b.dataset.val; renderCourses();
}));
renderCourses();

// Quiz
let step = 0;
const qs = $$(".q"), next = $("#q-next"), back = $("#q-back");
const answer = (i) => $(`[name=q${i}]:checked`)?.value;
const showStep = () => {
  qs.forEach((q, i) => (q.hidden = i !== step));
  $("#q-step").textContent = step < 3 ? `Вопрос ${step + 1} из 3` : "Готово";
  $("#q-bar").style.width = `${(step / 3) * 100}%`;
  back.disabled = step === 0; next.disabled = step < 3 && !answer(step);
  next.textContent = step === 2 ? "Показать результат" : step === 3 ? "Пройти заново" : "Далее";
  $("#q-result").hidden = step !== 3;
};
$("#quiz-form").addEventListener("change", () => (next.disabled = !answer(step)));
back.addEventListener("click", () => { step = Math.max(0, step - 1); showStep(); });
next.addEventListener("click", () => {
  if (step === 3) { $("#quiz-form").reset(); step = 0; return showStep(); }
  step++;
  if (step === 3) {
    const dir = answer(0), exp = answer(2), hours = Number(answer(1));
    const pick = COURSES.find((c) => c.dir === dir && c.level === (exp === "up" ? "up" : "zero"));
    const pace = hours <= 5 ? "Учитесь в спокойном темпе: программу можно растянуть без доплаты." : hours >= 15 ? "С таким темпом можно закончить на 2 месяца раньше." : "Этого времени хватает, чтобы идти вместе с группой.";
    $("#q-result").innerHTML = `<p class="small">Вам подойдёт</p><h3>${pick.t}</h3><p>${pick.months} месяцев · ${pick.price}. ${pace}</p><a class="btn btn--lime" href="#signup">Записаться на бесплатный урок</a>`;
  }
  showStep();
});
showStep();

// Payment toggle
$$("[name=pay]").forEach((r) => r.addEventListener("change", () => {
  const month = r.value === "month";
  $$(".t-price").forEach((p) => (p.textContent = `${month ? p.dataset.month : p.dataset.full} ₽`));
  $$(".t-unit").forEach((u) => (u.textContent = month ? "в месяц, 18 платежей" : "единоразово"));
}));

// Signup
$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, msg = $(".form__msg");
  const errs = [];
  if (f.name.value.trim().length < 2) errs.push("укажите имя");
  if (!/^(\+?\d[\d\s()-]{9,}|@[\w]{4,})$/.test(f.contact.value.trim())) errs.push("телефон или @telegram");
  if (!f.consent.checked) errs.push("согласие на обработку данных");
  f.name.setAttribute("aria-invalid", String(errs.includes("укажите имя")));
  f.contact.setAttribute("aria-invalid", String(errs.includes("телефон или @telegram")));
  msg.textContent = errs.length ? "Проверьте: " + errs.join(", ") : "Готово! Доступ к уроку придёт в течение 5 минут (демо — не придёт).";
  if (!errs.length) f.reset();
});
