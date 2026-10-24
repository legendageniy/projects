// Countdown, schedule (days, tracks, personal favourites), speakers modal, tickets with early-bird pricing.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const EVENT = new Date("2027-04-22T10:00:00+03:00");
const EARLY_UNTIL = new Date("2027-01-31T23:59:59+03:00");

const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Countdown
const pad = (n) => String(n).padStart(2, "0");
function tick() {
  let s = Math.max(0, Math.floor((EVENT - Date.now()) / 1000));
  const d = Math.floor(s / 86400); s %= 86400;
  $("#cd-d").textContent = d; $("#cd-h").textContent = pad(Math.floor(s / 3600)); $("#cd-m").textContent = pad(Math.floor((s % 3600) / 60)); $("#cd-s").textContent = pad(s % 60);
}
tick(); setInterval(tick, 1000);

// Speakers and talks
const SPEAKERS = [
  { id: "ak", name: "Алина Крылова", role: "Staff Engineer, финтех", bio: "Девять лет строит интерфейсы банковских продуктов. Отвечает за архитектуру фронтенда в команде из 60 разработчиков.", c: ["#2541ff", "#7f93ff"] },
  { id: "ds", name: "Денис Савин", role: "Руководитель фронтенда, e-commerce", bio: "Ускорил загрузку каталога в 3 раза и рассказывает, какие оптимизации реально влияют на продажи.", c: ["#ff3c78", "#ffa0bd"] },
  { id: "mv", name: "Мария Волкова", role: "Дизайнер интерфейсов", bio: "Ведёт дизайн-систему на 400 компонентов и учит дизайнеров и разработчиков говорить на одном языке.", c: ["#00b37e", "#7fe0c1"] },
  { id: "rt", name: "Роман Тихонов", role: "Эксперт по доступности", bio: "Аудит доступности для госсервисов и банков. Сам пользуется скринридером в работе каждый день.", c: ["#ff8a00", "#ffc580"] },
  { id: "eg", name: "Екатерина Гусева", role: "Tech Lead, медиа", bio: "Переводила крупный медиасайт на серверный рендеринг без падения трафика.", c: ["#8b3dff", "#c6a0ff"] },
  { id: "pn", name: "Павел Новиков", role: "Инженер производительности", bio: "Профилирует JavaScript в браузерах и пишет инструменты для поиска утечек памяти.", c: ["#111", "#666"] },
  { id: "ib", name: "Ирина Белова", role: "QA Lead", bio: "Строила визуальное и e2e-тестирование для приложения с миллионом пользователей в день.", c: ["#00a3c4", "#7fdcef"] },
  { id: "ag", name: "Артём Голубев", role: "Frontend Developer, SaaS", bio: "Разрабатывает редактор документов в реальном времени. Любит CRDT и не любит конфликты слияния.", c: ["#e0407b", "#2541ff"] },
];
const T = (day, time, track, title, sp) => ({ id: `${day}-${time}-${track}`, day, time, track, title, sp });
const TALKS = [
  T(1, "10:00", "all", "Открытие конференции", null),
  T(1, "10:30", "arch", "Микрофронтенды: два года спустя", "ak"), T(1, "10:30", "perf", "Каталог за 1 секунду: что сработало", "ds"), T(1, "10:30", "ux", "Дизайн-система, которой пользуются", "mv"),
  T(1, "12:00", "arch", "Серверные компоненты в продакшене", "eg"), T(1, "12:00", "perf", "Утечки памяти в SPA", "pn"), T(1, "12:00", "ux", "Скринридер для разработчика: практикум", "rt"),
  T(1, "13:30", "all", "Обед", null),
  T(1, "14:30", "arch", "CRDT и совместное редактирование", "ag"), T(1, "14:30", "perf", "INP: чиним медленные клики", "pn"), T(1, "14:30", "ux", "Тёмная тема без боли", "mv"),
  T(2, "10:00", "arch", "Монорепозиторий на 200 пакетов", "ak"), T(2, "10:00", "perf", "Изображения: AVIF, размеры и приоритет", "ds"), T(2, "10:00", "ux", "Формы, которые заполняют", "rt"),
  T(2, "11:30", "arch", "Типобезопасный API от базы до кнопки", "ag"), T(2, "11:30", "perf", "SSR и стриминг: замеры", "eg"), T(2, "11:30", "ux", "Визуальные тесты интерфейса", "ib"),
  T(2, "13:00", "all", "Обед", null),
  T(2, "14:00", "all", "Круглый стол: куда идёт фронтенд", null),
  T(2, "16:00", "all", "Закрытие и afterparty", null),
];
const TRACKS = { arch: "Архитектура", perf: "Производительность", ux: "UX и доступность", all: "Общий зал" };
const store = { get() { try { return new Set(JSON.parse(localStorage.getItem("fd27-mine")) ?? []); } catch { return new Set(); } }, set(s) { try { localStorage.setItem("fd27-mine", JSON.stringify([...s])); } catch {} } };
let day = 1;
const renderTalks = () => {
  const mine = store.get(), track = $("#track").value, only = $("#only-mine").checked;
  const list = TALKS.filter((t) => t.day === day && (!track || t.track === track || t.track === "all") && (!only || mine.has(t.id)));
  $("#talks").innerHTML = list.map((t) => {
    const s = SPEAKERS.find((x) => x.id === t.sp);
    return `<li class="talk talk--${t.track}${s ? "" : " talk--break"}"><time>${t.time}</time><span class="track">${TRACKS[t.track]}</span><div class="talk__body"><h3>${t.title}</h3>${s ? `<button type="button" class="who" data-speaker="${s.id}">${s.name}<small>${s.role}</small></button>` : ""}</div>${s ? `<button type="button" class="star" data-fav="${t.id}" aria-pressed="${mine.has(t.id)}" aria-label="${mine.has(t.id) ? "Убрать из моего расписания" : "Добавить в моё расписание"}: ${t.title}">★</button>` : ""}</li>`;
  }).join("") || `<li class="none">В вашем расписании на этот день пока пусто — отметьте доклады звёздочкой.</li>`;
  $("#mine-count").textContent = mine.size;
};
$$(".tabs [role=tab]").forEach((tab) => tab.addEventListener("click", () => { day = Number(tab.dataset.day); $$(".tabs [role=tab]").forEach((t) => t.setAttribute("aria-selected", String(t === tab))); renderTalks(); }));
$("#track").addEventListener("change", renderTalks);
$("#only-mine").addEventListener("change", renderTalks);
$("#talks").addEventListener("click", (e) => {
  const fav = e.target.closest("[data-fav]");
  if (fav) { const s = store.get(); s.has(fav.dataset.fav) ? s.delete(fav.dataset.fav) : s.add(fav.dataset.fav); store.set(s); renderTalks(); }
});
renderTalks();

const initials = (n) => n.split(" ").map((w) => w[0]).join("");
$("#speaker-list").innerHTML = SPEAKERS.map((s) => `<li><button type="button" class="speaker" data-speaker="${s.id}"><span class="ava" style="--a:${s.c[0]};--b:${s.c[1]}" aria-hidden="true">${initials(s.name)}</span><b>${s.name}</b><small>${s.role}</small></button></li>`).join("");
const modal = $("#modal");
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-speaker]");
  if (b) {
    const s = SPEAKERS.find((x) => x.id === b.dataset.speaker);
    const talks = TALKS.filter((t) => t.sp === s.id).map((t) => `«${t.title}» — ${t.day === 1 ? "22" : "23"} апреля, ${t.time}`).join("; ");
    $("#m-ava").textContent = initials(s.name); $("#m-ava").style.background = `linear-gradient(135deg, ${s.c[0]}, ${s.c[1]})`;
    $("#m-name").textContent = s.name; $("#m-role").textContent = s.role; $("#m-talk").textContent = talks; $("#m-bio").textContent = s.bio;
    modal.showModal();
  }
  if (e.target === modal || e.target.closest("[data-close]")) modal.close();
});

// Tickets
const early = Date.now() < EARLY_UNTIL;
const price = (base) => (early ? Math.round(base * 0.8 / 100) * 100 : base);
$("#price-note").textContent = early ? "Ранняя цена −20% действует до 31 января 2027." : "Цены финальные. Скидки для групп от 5 человек — по запросу.";
$$("[data-base]").forEach((b) => { const base = Number(b.dataset.base); b.innerHTML = `${rub(price(base))}${early ? ` <s>${rub(base)}</s>` : ""}`; });
const order = $("#order");
const NAMES = { online: "Онлайн", offline: "Офлайн", pro: "Офлайн + воркшоп" };
let pick = "offline", qty = 1;
const calc = () => {
  const base = price(Number($(`[data-ticket=${pick}] [data-base]`).dataset.base));
  let total = base * qty;
  const promo = order.promo.value.trim().toUpperCase() === "FRONT10";
  const group = qty >= 5;
  if (promo) total = Math.round(total * 0.9); else if (group) total = Math.round(total * 0.9);
  $("#o-type").textContent = `· ${NAMES[pick]}`; $("#qty").value = qty;
  $("#o-total").textContent = rub(total);
  $("#o-note").textContent = promo ? "Промокод −10% применён" : group ? "Групповая скидка −10%" : `${qty} × ${rub(base)}`;
  $$(".ticket").forEach((t) => t.classList.toggle("ticket--picked", t.dataset.ticket === pick));
};
$$("[data-pick]").forEach((b) => b.addEventListener("click", () => { pick = b.dataset.pick; calc(); order.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); }));
$$("[data-q]").forEach((b) => b.addEventListener("click", () => { qty = Math.min(20, Math.max(1, qty + Number(b.dataset.q))); calc(); }));
order.promo.addEventListener("input", calc);
order.addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(order.email.value.trim());
  order.email.setAttribute("aria-invalid", String(!ok));
  $(".o-msg").textContent = ok ? `Готово: ${qty} × «${NAMES[pick]}» на сумму ${$("#o-total").textContent}. Это демо — оплата не проводится.` : "Укажите email — на него придут билеты.";
  if (!ok) order.email.focus();
});
calc();
