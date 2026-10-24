// «Горизонт» — tours data, SVG landscapes, catalog filters, tour page with dates and price.
const TOURS = [
  { id: "baikal", name: "Байкал: лёд и маяки", region: "Сибирь", days: 6, price: 64900, months: [1, 2, 3], scene: "lake", pal: ["#9fc6e7", "#e8f4fb", "#5d88b0", "#2c4c6e"], level: "Лёгкий", group: 12,
    plan: ["Иркутск: встреча, переезд на Ольхон", "Мыс Хобой и ледяные гроты", "Маяк Шаманка, баня на льду", "Малое море на хивусе", "Свободный день, мастер-класс по позам", "Возвращение в Иркутск"] },
  { id: "altai", name: "Алтай: Чуйский тракт", region: "Алтай", days: 8, price: 78500, months: [6, 7, 8, 9], scene: "mountains", pal: ["#f6c68b", "#fdeedc", "#7b9a6b", "#3e5a3c"], level: "Средний", group: 14,
    plan: ["Горно-Алтайск, переезд в Чемал", "Катунь и остров Патмос", "Перевал Чике-Таман", "Гейзерное озеро", "Марсианские горы Кызыл-Чин", "Долина Чулышмана", "Водопад Учар (треккинг)", "Обратный путь"] },
  { id: "kamchatka", name: "Камчатка: вулканы и океан", region: "Дальний Восток", days: 10, price: 189000, months: [7, 8, 9], scene: "volcano", pal: ["#ffb199", "#ffe9df", "#6b4f63", "#2d2233"], level: "Сложный", group: 10,
    plan: ["Петропавловск-Камчатский", "Авачинская бухта на катере", "Восхождение на Авачинский вулкан", "Мутновский вулкан", "Термальные источники", "Долина гейзеров (вертолёт)", "Халактырский пляж", "Рыбалка и уха", "Свободный день", "Вылет"] },
  { id: "karelia", name: "Карелия: шхеры на байдарках", region: "Север", days: 5, price: 42900, months: [6, 7, 8], scene: "forest", pal: ["#cfe3d6", "#f1f7f2", "#5f8a6c", "#2f4a39"], level: "Средний", group: 12,
    plan: ["Сортавала, инструктаж", "Ладожские шхеры, остров Валаам", "Водопады Рускеалы", "Ночёвка в палатках на острове", "Возвращение"] },
  { id: "kazan", name: "Казань и Свияжск на выходные", region: "Поволжье", days: 3, price: 21900, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], scene: "city", pal: ["#f3d7a2", "#fff6e6", "#c97b53", "#5b3a2e"], level: "Лёгкий", group: 20,
    plan: ["Кремль, улица Баумана, татарская кухня", "Свияжск и Храм всех религий", "Старо-Татарская слобода, отъезд"] },
  { id: "dagestan", name: "Дагестан: каньоны и аулы", region: "Кавказ", days: 7, price: 69900, months: [5, 6, 7, 8, 9, 10], scene: "mountains", pal: ["#f2a97e", "#fde3cf", "#9c6b52", "#4f3328"], level: "Средний", group: 14,
    plan: ["Махачкала, бархан Сарыкум", "Сулакский каньон", "Аул-призрак Гамсутль", "Гуниб и Салтинский водопад", "Чох и ремёсла", "Дербент", "Вылет"] },
  { id: "murmansk", name: "Мурманск: северное сияние", region: "Север", days: 4, price: 49900, months: [11, 12, 1, 2, 3], scene: "aurora", pal: ["#0d1b2a", "#1b3a4b", "#2b4c5c", "#0b141c"], level: "Лёгкий", group: 16,
    plan: ["Мурманск, ледокол «Ленин»", "Териберка и Баренцево море", "Охота за сиянием на снегоходах", "Саамская деревня, отъезд"] },
  { id: "crimea", name: "Крым: южный берег пешком", region: "Юг", days: 7, price: 54900, months: [4, 5, 6, 9, 10], scene: "sea", pal: ["#ffd29d", "#fff3dd", "#3d8db0", "#215b74"], level: "Средний", group: 14,
    plan: ["Ялта, Царская тропа", "Ай-Петри", "Новый Свет, тропа Голицына", "Судак", "Мангуп-Кале", "Балаклава на каяках", "Отъезд"] },
];
const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const plural = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? b : c);

function scene(t) {
  const [sky, glow, mid, front] = t.pal;
  const ridge = (base, amp, seed) => { let d = `M0 300 L0 ${base}`; for (let x = 0; x <= 480; x += 60) d += ` L${x} ${base - Math.abs(Math.sin(x / 70 + seed)) * amp}`; return d + " L480 300 Z"; };
  const parts = {
    mountains: `<circle cx="340" cy="90" r="34" fill="${glow}"/><path d="${ridge(190, 90, 1)}" fill="${mid}"/><path d="${ridge(240, 60, 3)}" fill="${front}"/>`,
    volcano: `<circle cx="120" cy="80" r="30" fill="${glow}"/><path d="M60 300 L210 110 L240 110 L400 300Z" fill="${mid}"/><path d="M210 110 L225 90 L240 110 L232 125 L218 125Z" fill="#fff"/><path d="M225 90 q-20 -40 10 -70" stroke="#d6c7cf" stroke-width="10" fill="none" opacity=".6"/><path d="${ridge(260, 30, 2)}" fill="${front}"/>`,
    lake: `<path d="${ridge(170, 50, 4)}" fill="${mid}"/><rect y="200" width="480" height="100" fill="${glow}"/><path d="M0 230h480M40 260h200M260 250h180" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M380 200 v-50 h10 v50 z" fill="#d9534f"/>`,
    forest: Array.from({ length: 16 }, (_, i) => `<path d="M${i * 32} ${230 - (i % 3) * 20} l18 -${70 + (i % 4) * 14} l18 ${70 + (i % 4) * 14}z" fill="${i % 2 ? mid : front}"/>`).join("") + `<rect y="228" width="480" height="72" fill="${glow}" opacity=".9"/><path d="M0 250h480" stroke="#fff" stroke-width="3" opacity=".6"/>`,
    city: `<circle cx="380" cy="80" r="30" fill="${glow}"/>` + [[40, 120, 60], [110, 80, 50], [170, 150, 46], [226, 60, 70], [306, 130, 40], [356, 100, 70], [436, 140, 44]].map(([x, h, w]) => `<rect x="${x}" y="${300 - h - 40}" width="${w}" height="${h + 40}" fill="${front}"/>`).join("") + `<path d="M246 180 q15 -40 30 0z" fill="${mid}"/><rect x="258" y="130" width="6" height="30" fill="${mid}"/>`,
    aurora: `<path d="M0 120 C120 40 240 160 480 60" stroke="#5cf2b2" stroke-width="40" fill="none" opacity=".35"/><path d="M0 150 C160 80 300 180 480 100" stroke="#9b7bff" stroke-width="26" fill="none" opacity=".3"/>` + Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 97) % 480}" cy="${(i * 53) % 120}" r="1.5" fill="#fff"/>`).join("") + `<path d="${ridge(240, 40, 5)}" fill="${mid}"/><path d="M0 270 h480 v30 H0z" fill="#e8f0f5"/>`,
    sea: `<circle cx="240" cy="170" r="50" fill="${glow}"/><rect y="180" width="480" height="120" fill="${mid}"/><path d="M60 210h360M120 240h240M180 270h120" stroke="${glow}" stroke-width="4" opacity=".7"/><path d="M0 180 L80 120 L150 180Z" fill="${front}"/>`,
  };
  return `<svg viewBox="0 0 480 300" class="scene" role="img" aria-label="Иллюстрация: ${t.name}"><defs><linearGradient id="g-${t.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${glow}"/></linearGradient></defs><rect width="480" height="300" fill="url(#g-${t.id})"/>${parts[t.scene]}</svg>`;
}
function card(t) {
  return `<article class="tour"><a href="tour.html?id=${t.id}" class="tour__img">${scene(t)}<span class="badge">${t.days} ${plural(t.days, "день", "дня", "дней")}</span></a><div class="tour__body"><p class="tour__meta">${t.region} · ${t.level}</p><h3><a href="tour.html?id=${t.id}">${t.name}</a></h3><p class="tour__months">${t.months.length === 12 ? "Круглый год" : t.months.map((m) => MONTHS[m - 1].slice(0, 3)).join(", ")}</p><p class="tour__price">от <b>${rub(t.price)}</b></p></div></article>`;
}

const burger = $(".burger"), nav = $("#nav");
burger?.addEventListener("click", () => { const o = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(o)); nav.classList.toggle("open", o); });
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* Home */
if ($("#popular")) {
  $("#popular").innerHTML = TOURS.slice(0, 3).map(card).join("");
  const f = $("#quick");
  f.month.innerHTML = `<option value="">Любой месяц</option>` + MONTHS.map((m, i) => `<option value="${i + 1}">${m[0].toUpperCase() + m.slice(1)}</option>`).join("");
  f.region.innerHTML = `<option value="">Все регионы</option>` + [...new Set(TOURS.map((t) => t.region))].map((r) => `<option>${r}</option>`).join("");
}

/* Catalog */
if ($("#list")) {
  const f = $("#filters"), q = new URLSearchParams(location.search);
  f.region.innerHTML = `<option value="">Все</option>` + [...new Set(TOURS.map((t) => t.region))].map((r) => `<option>${r}</option>`).join("");
  f.month.innerHTML = `<option value="">Любой</option>` + MONTHS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join("");
  ["region", "month"].forEach((k) => q.get(k) && (f[k].value = q.get(k)));
  const render = () => {
    const region = f.region.value, month = Number(f.month.value), max = Number(f.budget.value), dur = f.duration.value, sort = f.sort.value;
    $("#budget-out").textContent = max >= 200000 ? "без ограничений" : `до ${rub(max)}`;
    let list = TOURS.filter((t) => (!region || t.region === region) && (!month || t.months.includes(month)) && t.price <= max && (!dur || (dur === "short" ? t.days <= 4 : dur === "mid" ? t.days >= 5 && t.days <= 7 : t.days >= 8)));
    if (sort === "price") list.sort((a, b) => a.price - b.price); else if (sort === "days") list.sort((a, b) => a.days - b.days);
    $("#list").innerHTML = list.map(card).join("") || `<p class="empty">Под такие условия туров нет. Расширьте бюджет или выберите другой месяц.</p>`;
    $("#count").textContent = `${list.length} ${plural(list.length, "тур", "тура", "туров")}`;
  };
  f.addEventListener("input", render); f.addEventListener("reset", () => setTimeout(render)); render();
}

/* Tour page */
if ($("#tour")) {
  const t = TOURS.find((x) => x.id === new URLSearchParams(location.search).get("id")) ?? TOURS[0];
  document.title = `${t.name} — Горизонт`;
  $("#t-scene").innerHTML = scene(t);
  $("#t-name").textContent = t.name; $("#crumb").textContent = t.name;
  $("#t-facts").innerHTML = `<li><b>${t.days}</b>${plural(t.days, "день", "дня", "дней")}</li><li><b>${t.level}</b>сложность</li><li><b>до ${t.group}</b>человек в группе</li><li><b>${t.region}</b>регион</li>`;
  $("#t-plan").innerHTML = t.plan.map((p, i) => `<li><details ${i === 0 ? "open" : ""}><summary><span>День ${i + 1}</span>${p}</summary><p>Завтрак, программа дня с гидом, трансфер. Вечером — ужин и отдых. Время в пути и детали маршрута пришлём в памятке перед поездкой.</p></details></li>`).join("");
  // Departure dates: the first two Saturdays of each in-season month, up to 6 dates
  const dates = [];
  const d = new Date(); d.setDate(d.getDate() + 14);
  while (dates.length < 6 && d < new Date(Date.now() + 400 * 864e5)) {
    if (d.getDay() === 6 && t.months.includes(d.getMonth() + 1) && d.getDate() <= 14) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  const f = $("#t-form");
  $("#t-dates").innerHTML = dates.map((x, i) => { const peak = [7, 8, 1].includes(x.getMonth() + 1); const left = 2 + ((x.getDate() * 7) % 9); return `<label class="date"><input type="radio" name="date" value="${i}" ${i === 0 ? "checked" : ""} data-k="${peak ? 1.15 : 1}"><span><b>${x.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</b><small>${peak ? "сезон +15%" : "базовая цена"} · мест: ${left}</small></span></label>`; }).join("");
  const calc = () => {
    const k = Number($("[name=date]:checked")?.dataset.k ?? 1), adults = Number(f.adults.value), kids = Number(f.kids.value);
    const base = Math.round(t.price * k / 100) * 100;
    const total = base * adults + Math.round(base * 0.7) * kids + (f.single.checked ? 9900 : 0);
    $("#t-from").textContent = rub(base);
    $("#t-total").textContent = rub(total);
    $("#t-break").textContent = `${adults} взр. × ${rub(base)}${kids ? ` + ${kids} дет. × ${rub(Math.round(base * 0.7))}` : ""}${f.single.checked ? " + одноместное размещение" : ""}`;
  };
  f.addEventListener("input", calc); calc();
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = f.name.value.trim().length > 1 && f.phone.value.replace(/\D/g, "").length >= 10;
    f.name.setAttribute("aria-invalid", String(f.name.value.trim().length < 2)); f.phone.setAttribute("aria-invalid", String(f.phone.value.replace(/\D/g, "").length < 10));
    $("#t-msg").textContent = ok ? `Заявка на «${t.name}» принята: ${$("[name=date]:checked + span b").textContent}, ${$("#t-total").textContent}. Это демо — менеджер не позвонит.` : "Укажите имя и телефон.";
  });
  $("#t-related").innerHTML = TOURS.filter((x) => x.id !== t.id).slice(0, 3).map(card).join("");
}
