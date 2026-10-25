// Pre-order bakery: product catalog with allergen filters, cart drawer (localStorage), pickup day/time rules.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const ART = {
  loaf: `<ellipse cx="100" cy="92" rx="78" ry="40" fill="#b5652e"/><path d="M40 82c20-14 40 0 60-10s38 4 58-6" stroke="#e8b36b" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M55 70l10 18M85 64l10 20M115 62l10 22M145 66l10 18" stroke="#8a4320" stroke-width="5" stroke-linecap="round"/>`,
  baguette: `<rect x="14" y="74" width="172" height="36" rx="18" fill="#c47a3a" transform="rotate(-12 100 92)"/><path d="M40 92l16-16M74 86l16-16M108 80l16-16M142 74l16-16" stroke="#f0c47e" stroke-width="5" stroke-linecap="round"/>`,
  croissant: `<path d="M30 110c10-40 40-60 70-60s60 20 70 60c-18-8-30-6-40 4-10-18-50-18-60 0-10-10-22-12-40-4z" fill="#d9903e"/><path d="M70 64l8 40M100 54v48M130 64l-8 40" stroke="#a65d22" stroke-width="5" stroke-linecap="round"/>`,
  roll: `<circle cx="100" cy="90" r="56" fill="#c98a4c"/><path d="M100 90m-6 0a6 6 0 1 1 12 0a18 18 0 1 1-36 0a30 30 0 1 1 60 0a42 42 0 1 1-84 0" stroke="#7b3f17" stroke-width="5" fill="none"/><path d="M60 60c20 8 60 8 80 0" stroke="#fff6e0" stroke-width="6" stroke-linecap="round"/>`,
  cake: `<path d="M40 70h120v60H40z" fill="#f6d7d7"/><path d="M40 92h120" stroke="#e98a8a" stroke-width="8"/><path d="M40 70c10-12 20 12 30 0s20 12 30 0 20 12 30 0 20 12 30 0" fill="#fff" stroke="#fff" stroke-width="6"/><circle cx="100" cy="50" r="10" fill="#c0392b"/><rect x="99" y="34" width="2" height="8" fill="#3f5b3a"/>`,
  eclair: `<rect x="30" y="72" width="140" height="44" rx="22" fill="#e1a65e"/><rect x="34" y="68" width="132" height="22" rx="11" fill="#5b3420"/>`,
  muffin: `<path d="M60 90h80l-10 46H70z" fill="#e98a8a"/><path d="M70 90v46M86 90v46M102 90v46M118 90v46" stroke="#d26f6f" stroke-width="3"/><path d="M50 92c0-30 24-46 50-46s50 16 50 46z" fill="#7a4a2a"/><circle cx="80" cy="72" r="5" fill="#3a2215"/><circle cx="112" cy="64" r="5" fill="#3a2215"/><circle cx="124" cy="82" r="5" fill="#3a2215"/>`,
  pie: `<ellipse cx="100" cy="100" rx="80" ry="30" fill="#c47a3a"/><ellipse cx="100" cy="92" rx="72" ry="24" fill="#8e2e4a"/><path d="M40 92h120M60 76l80 32M140 76l-80 32" stroke="#e8b36b" stroke-width="6" stroke-linecap="round"/>`,
};
const art = (k, bg) => `<svg viewBox="0 0 200 160" aria-hidden="true"><rect width="200" height="160" rx="20" fill="${bg}"/>${ART[k]}</svg>`;
const PRODUCTS = [
  { id: "sour", n: "Пшеничный на закваске", cat: "Хлеб", price: 290, w: "750 г", art: "loaf", bg: "#fbe6c9", no: ["nuts", "milk"] },
  { id: "rye", n: "Бородинский", cat: "Хлеб", price: 240, w: "600 г", art: "loaf", bg: "#efd9c0", no: ["nuts", "milk"] },
  { id: "bag", n: "Багет", cat: "Хлеб", price: 150, w: "250 г", art: "baguette", bg: "#fff0d6", no: ["nuts", "milk"] },
  { id: "gf", n: "Безглютеновый с семечками", cat: "Хлеб", price: 380, w: "500 г", art: "loaf", bg: "#e8f0d8", no: ["gluten", "nuts", "milk"] },
  { id: "cro", n: "Круассан", cat: "Выпечка", price: 180, w: "80 г", art: "croissant", bg: "#ffe8a3", no: ["nuts"] },
  { id: "cin", n: "Синнабон", cat: "Выпечка", price: 220, w: "120 г", art: "roll", bg: "#fbe0cc", no: [] },
  { id: "muf", n: "Маффин с шоколадом", cat: "Выпечка", price: 160, w: "100 г", art: "muffin", bg: "#f9dcdc", no: ["nuts"] },
  { id: "ecl", n: "Эклер ванильный", cat: "Десерты", price: 210, w: "90 г", art: "eclair", bg: "#f6e4cf", no: ["nuts"] },
  { id: "cake", n: "Торт «Наполеон», кусок", cat: "Десерты", price: 320, w: "150 г", art: "cake", bg: "#fde2e2", no: ["nuts"] },
  { id: "pie", n: "Пирог с вишней", cat: "Десерты", price: 890, w: "800 г, целый", art: "pie", bg: "#f3dde4", no: ["nuts"] },
];
$("#hero-art").innerHTML = art("loaf", "#ffe8a3") + art("croissant", "#fbe0cc");

// Catalog
let cat = "Все";
$("#cats").innerHTML = ["Все", ...new Set(PRODUCTS.map((p) => p.cat))].map((c) => `<button type="button" aria-pressed="${c === "Все"}" data-c="${c}">${c}</button>`).join("");
function renderProducts() {
  const without = $$(".allergens input:checked").map((i) => i.value);
  const list = PRODUCTS.filter((p) => (cat === "Все" || p.cat === cat) && without.every((a) => p.no.includes(a)));
  $$("#cats button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === cat)));
  $("#products").innerHTML = list.map((p) => `<article class="product">${art(p.art, p.bg)}<h3>${p.n}</h3><p class="muted">${p.w}${p.no.includes("gluten") ? " · без глютена" : ""}</p><div class="buy"><b>${rub(p.price)}</b><button type="button" class="add" data-add="${p.id}" aria-label="Добавить «${p.n}» в корзину">+ В корзину</button></div></article>`).join("") || `<p class="empty">Под эти фильтры ничего нет. Спросите нас — испечём на заказ.</p>`;
}
$("#cats").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { cat = b.dataset.c; renderProducts(); } });
$$(".allergens input").forEach((i) => i.addEventListener("change", renderProducts));
renderProducts();

// Cart
const KEY = "korochka-cart";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; } };
const write = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} renderCart(); };
function renderCart() {
  const c = read(), ids = Object.keys(c).filter((id) => c[id] > 0);
  const n = ids.reduce((s, id) => s + c[id], 0), sum = ids.reduce((s, id) => s + c[id] * PRODUCTS.find((p) => p.id === id).price, 0);
  $("#count").textContent = n;
  $("#lines").innerHTML = ids.length ? ids.map((id) => { const p = PRODUCTS.find((x) => x.id === id); return `<li><span class="mini">${art(p.art, p.bg)}</span><div><b>${p.n}</b><small>${rub(p.price)}</small></div><div class="qty"><button type="button" data-q="${id}" data-d="-1" aria-label="Меньше: ${p.n}">−</button><span>${c[id]}</span><button type="button" data-q="${id}" data-d="1" aria-label="Больше: ${p.n}">+</button></div></li>`; }).join("") : `<li class="empty">Пока пусто. Добавьте что-нибудь вкусное.</li>`;
  $("#total").textContent = rub(sum);
  $("#checkout").hidden = !ids.length;
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-add]");
  if (a) { const c = read(); c[a.dataset.add] = Math.min(20, (c[a.dataset.add] ?? 0) + 1); write(c); a.textContent = "✓ Добавлено"; setTimeout(() => (a.textContent = "+ В корзину"), 1200); }
  const q = e.target.closest("[data-q]");
  if (q) { const c = read(); c[q.dataset.q] = Math.max(0, (c[q.dataset.q] ?? 0) + Number(q.dataset.d)); write(c); }
});
const drawer = $("#drawer"), overlay = $("#overlay"), opener = $("#open-cart");
const openCart = (open) => {
  drawer.classList.toggle("open", open); drawer.setAttribute("aria-hidden", String(!open)); overlay.hidden = !open; opener.setAttribute("aria-expanded", String(open));
  drawer.inert = !open;
  if (open) $("#close-cart").focus(); else opener.focus();
};
drawer.inert = true;
opener.addEventListener("click", () => openCart(true));
$("#close-cart").addEventListener("click", () => openCart(false));
overlay.addEventListener("click", () => openCart(false));
addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) openCart(false); });

// Pickup: tomorrow is available only if ordered before 20:00; Monday the bakery is closed.
const now = new Date();
$("#hours").textContent = now.getHours() < 20 ? "Заказ на завтра — до 20:00" : "Заказы на завтра закрыты, доступны со дня после";
const days = [];
for (let k = 1; days.length < 5; k++) {
  const d = new Date(); d.setDate(d.getDate() + k);
  if (k === 1 && now.getHours() >= 20) continue;
  if (d.getDay() === 1) continue;
  days.push(d);
}
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
$("#days").innerHTML = days.map((d, i) => `<label><input type="radio" name="day" value="${iso(d)}" ${i ? "" : "checked"}><span><small>${d.toLocaleDateString("ru-RU", { weekday: "short" })}</small>${d.getDate()}</span></label>`).join("");
function slots() {
  const d = new Date($("[name=day]:checked").value + "T12:00"), weekend = [0, 6].includes(d.getDay());
  const out = []; for (let h = weekend ? 9 : 8; h < 20; h++) out.push(`${h}:00–${h + 1}:00`);
  $("#slot").innerHTML = out.map((s) => `<option>${s}</option>`).join("");
}
$("#days").addEventListener("change", slots); slots();
renderCart();

$("#checkout").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, okN = f.name.value.trim().length > 1, okP = f.phone.value.replace(/\D/g, "").length >= 10;
  f.name.setAttribute("aria-invalid", String(!okN)); f.phone.setAttribute("aria-invalid", String(!okP));
  $(".err").textContent = okN && okP ? "" : "Укажите имя и телефон — напомним о заказе.";
  if (!okN || !okP) return;
  const when = new Date($("[name=day]:checked").value + "T12:00").toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  const done = $("#done"); done.hidden = false; f.hidden = true;
  done.innerHTML = `<p class="script">Спасибо!</p><p>Заказ на ${$("#total").textContent} будет ждать вас ${when}, ${f.slot.value}. Это демо-сайт — заказ не передан в пекарню.</p>`;
  write({}); $("#checkout").hidden = true; done.focus();
});
