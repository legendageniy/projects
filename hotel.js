// «Сосны» — rooms data, SVG room art, search widget, rooms filter and booking calculator.
const ROOMS = [
  { id: "standard", name: "Стандарт с видом на лес", size: 24, guests: 2, beds: "Двуспальная кровать", price: 7900, weekend: 9400, wall: "#e9dfcf", accent: "#6b8f5e", features: ["Панорамное окно", "Душ", "Кофемашина"] },
  { id: "family", name: "Семейный", size: 36, guests: 4, beds: "Двуспальная + диван", price: 11900, weekend: 13900, wall: "#efe3d0", accent: "#c46a3a", features: ["Две зоны", "Детская кроватка по запросу", "Ванна"] },
  { id: "chalet", name: "Шале у озера", size: 48, guests: 4, beds: "Две спальни", price: 18900, weekend: 22900, wall: "#e2d5c0", accent: "#1f3a2e", features: ["Отдельный домик", "Камин", "Терраса с видом на озеро"] },
  { id: "barn", name: "Барнхаус с сауной", size: 60, guests: 6, beds: "Три спальни", price: 26900, weekend: 31900, wall: "#ecdcc4", accent: "#8a5a3b", features: ["Своя сауна", "Кухня", "Мангальная зона"] },
  { id: "loft", name: "Мансарда для двоих", size: 28, guests: 2, beds: "Кровать king size", price: 9900, weekend: 11900, wall: "#f0e6d6", accent: "#a14a5b", features: ["Окно в крыше над кроватью", "Ванна у окна", "Проектор"] },
];
const BREAKFAST = 1200; // per guest per night
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(s + "T12:00"); d.setDate(d.getDate() + n); return iso(d); };
const nightsList = (from, to) => { const out = []; for (let d = from; d < to; d = addDays(d, 1)) out.push(d); return out; };
const isWeekend = (s) => [5, 6].includes(new Date(s + "T12:00").getDay()); // Fri, Sat nights
const plural = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? b : c);
const fmt = (s) => new Date(s + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

function roomArt(r) {
  return `<svg viewBox="0 0 320 200" class="room-art" role="img" aria-label="Интерьер: ${r.name}">
    <rect width="320" height="200" fill="${r.wall}"/>
    <rect x="170" y="26" width="120" height="96" rx="4" fill="#cfe0d6"/>
    <path d="M170 122 L190 70 L206 122Z M200 122 L222 56 L246 122Z M238 122 L258 76 L278 122Z" fill="#3e6a52"/>
    <rect x="170" y="26" width="120" height="96" rx="4" fill="none" stroke="#fff" stroke-width="6"/>
    <path d="M230 26v96" stroke="#fff" stroke-width="4"/>
    <rect x="0" y="160" width="320" height="40" fill="#b88e63"/>
    <rect x="22" y="104" width="150" height="56" rx="8" fill="#fff"/>
    <rect x="22" y="128" width="150" height="32" rx="6" fill="${r.accent}"/>
    <rect x="18" y="80" width="12" height="80" rx="4" fill="#7d5a3c"/>
    <rect x="32" y="96" width="44" height="18" rx="8" fill="#f6f1ea"/><rect x="82" y="96" width="44" height="18" rx="8" fill="#f6f1ea"/>
    <circle cx="300" cy="150" r="10" fill="${r.accent}" opacity=".6"/><rect x="296" y="150" width="8" height="12" fill="#7d5a3c"/>
  </svg>`;
}

const burger = $(".burger"), nav = $("#nav");
burger?.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* Search widget (home): dates + guests → rooms page with query */
const search = $("#search");
if (search) {
  const today = iso(new Date());
  search.from.min = today; search.from.value = addDays(today, 7);
  search.to.min = addDays(today, 1); search.to.value = addDays(today, 9);
  search.from.addEventListener("change", () => { search.to.min = addDays(search.from.value, 1); if (search.to.value <= search.from.value) search.to.value = addDays(search.from.value, 2); upd(); });
  search.to.addEventListener("change", upd);
  function upd() { const n = nightsList(search.from.value, search.to.value).length; $("#nights").textContent = n > 0 ? `${n} ${plural(n, "ночь", "ночи", "ночей")}` : "Проверьте даты"; }
  upd();
}

/* Rooms list */
const list = $("#rooms");
if (list) {
  const q = new URLSearchParams(location.search);
  const from = q.get("from"), to = q.get("to");
  const nights = from && to && to > from ? nightsList(from, to) : null;
  const f = $("#filter");
  if (q.get("guests")) f.guests.value = q.get("guests");
  if (nights) $("#stay").innerHTML = `Ваши даты: <b>${fmt(from)} — ${fmt(to)}</b>, ${nights.length} ${plural(nights.length, "ночь", "ночи", "ночей")}. <a href="index.html#book">Изменить</a>`;
  const render = () => {
    const g = Number(f.guests.value), sort = f.sort.value;
    let rooms = ROOMS.filter((r) => r.guests >= g);
    rooms = rooms.sort(sort === "price" ? (a, b) => a.price - b.price : (a, b) => b.size - a.size);
    list.innerHTML = rooms.map((r) => {
      const total = nights ? nights.reduce((s, d) => s + (isWeekend(d) ? r.weekend : r.price), 0) : null;
      const link = `booking.html?room=${r.id}${nights ? `&from=${from}&to=${to}` : ""}&guests=${g}`;
      return `<article class="room">${roomArt(r)}<div class="room__body"><h3>${r.name}</h3><p class="room__meta">${r.size} м² · до ${r.guests} ${plural(r.guests, "гостя", "гостей", "гостей")} · ${r.beds}</p>
        <ul class="chips">${r.features.map((x) => `<li>${x}</li>`).join("")}</ul>
        <div class="room__price">${total ? `<p><b>${rub(total)}</b> за ${nights.length} ${plural(nights.length, "ночь", "ночи", "ночей")}</p>` : `<p>от <b>${rub(r.price)}</b> за ночь</p>`}<a class="btn btn--green" href="${link}">Выбрать</a></div></div></article>`;
    }).join("") || `<p class="empty">Для такой компании подойдёт пара соседних номеров — позвоните нам, подберём.</p>`;
    $("#count").textContent = `${rooms.length} ${plural(rooms.length, "вариант", "варианта", "вариантов")}`;
  };
  f.addEventListener("input", render); render();
}

/* Booking page: live price breakdown */
const book = $("#book-form");
if (book) {
  const q = new URLSearchParams(location.search);
  const room = ROOMS.find((r) => r.id === q.get("room")) ?? ROOMS[0];
  $("#b-art").innerHTML = roomArt(room);
  $("#b-room").textContent = room.name;
  $("#b-meta").textContent = `${room.size} м² · ${room.beds}`;
  const today = iso(new Date());
  book.from.min = today; book.from.value = q.get("from") ?? addDays(today, 7);
  book.to.value = q.get("to") ?? addDays(book.from.value, 2);
  book.guests.max = room.guests; book.guests.value = Math.min(room.guests, Number(q.get("guests") ?? 2));
  const calc = () => {
    book.to.min = addDays(book.from.value, 1);
    const nights = book.to.value > book.from.value ? nightsList(book.from.value, book.to.value) : [];
    const wk = nights.filter(isWeekend).length, wd = nights.length - wk;
    const g = Math.max(1, Math.min(room.guests, Number(book.guests.value) || 1));
    const breakfast = book.breakfast.checked ? BREAKFAST * g * nights.length : 0;
    const transfer = book.transfer.checked ? 3500 : 0;
    const total = wd * room.price + wk * room.weekend + breakfast + transfer;
    $("#lines").innerHTML = nights.length ? [
      wd ? `<div><dt>${wd} ${plural(wd, "будняя ночь", "будние ночи", "будних ночей")} × ${rub(room.price)}</dt><dd>${rub(wd * room.price)}</dd></div>` : "",
      wk ? `<div><dt>${wk} ${plural(wk, "ночь", "ночи", "ночей")} пт–сб × ${rub(room.weekend)}</dt><dd>${rub(wk * room.weekend)}</dd></div>` : "",
      breakfast ? `<div><dt>Завтраки: ${g} × ${nights.length}</dt><dd>${rub(breakfast)}</dd></div>` : "",
      transfer ? `<div><dt>Трансфер от станции</dt><dd>${rub(transfer)}</dd></div>` : "",
    ].join("") : `<div><dt>Выберите даты выезда позже заезда</dt></div>`;
    $("#total").textContent = rub(total);
    $("#dates").textContent = nights.length ? `${fmt(book.from.value)} — ${fmt(book.to.value)} · ${nights.length} ${plural(nights.length, "ночь", "ночи", "ночей")}` : "";
    return nights.length;
  };
  book.addEventListener("input", calc); calc();
  book.addEventListener("submit", (e) => {
    e.preventDefault();
    const checks = [["to", calc() > 0, "Дата выезда должна быть позже заезда"], ["name", book.name.value.trim().length >= 2, "Укажите имя"], ["email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(book.email.value.trim()), "Проверьте email"], ["phone", book.phone.value.replace(/\D/g, "").length >= 10, "Укажите телефон"]];
    checks.forEach(([n, ok, msg]) => { book.elements[n].setAttribute("aria-invalid", String(!ok)); $(`#e-${n}`).textContent = ok ? "" : msg; });
    const bad = checks.find((c) => !c[1]);
    if (bad) return book.elements[bad[0]].focus();
    book.hidden = true;
    const done = $("#done"); done.hidden = false;
    $("#done-text").textContent = `${room.name}, ${$("#dates").textContent}. Итого ${$("#total").textContent}. Это демо-сайт: бронь не создана, оплата не нужна.`;
    done.focus();
  });
}
