// «Вольт» — demo store. Product data, SVG product art, cart in localStorage and page logic.
const PRODUCTS = [
  { id: "nord-x5", cat: "phones", brand: "Nord", name: "Nord X5", price: 54990, old: 61990, rating: 4.8, color: "#2b2f3a", tag: "Хит", specs: { "Экран": "6,4″ OLED, 120 Гц", "Память": "256 ГБ", "Камера": "50 + 12 Мп", "Аккумулятор": "4800 мА·ч" } },
  { id: "nord-x5-lite", cat: "phones", brand: "Nord", name: "Nord X5 Lite", price: 32990, rating: 4.6, color: "#7d8cff", specs: { "Экран": "6,1″ OLED", "Память": "128 ГБ", "Камера": "48 Мп", "Аккумулятор": "4300 мА·ч" } },
  { id: "kite-one", cat: "phones", brand: "Kite", name: "Kite One", price: 23990, rating: 4.4, color: "#f2c94c", tag: "Новинка", specs: { "Экран": "6,6″ IPS, 90 Гц", "Память": "128 ГБ", "Камера": "50 Мп", "Аккумулятор": "5000 мА·ч" } },
  { id: "arca-book-14", cat: "laptops", brand: "Arca", name: "Arca Book 14", price: 89990, old: 99990, rating: 4.9, color: "#c9ced8", tag: "Хит", specs: { "Экран": "14″ 2.8K", "Процессор": "8 ядер", "ОЗУ": "16 ГБ", "SSD": "512 ГБ" } },
  { id: "arca-book-16", cat: "laptops", brand: "Arca", name: "Arca Book 16 Pro", price: 149990, rating: 4.8, color: "#3a3f4b", specs: { "Экран": "16″ 3K, 120 Гц", "Процессор": "12 ядер", "ОЗУ": "32 ГБ", "SSD": "1 ТБ" } },
  { id: "lumo-air", cat: "laptops", brand: "Lumo", name: "Lumo Air 13", price: 64990, rating: 4.5, color: "#e7d7c9", specs: { "Экран": "13,3″ FHD", "Процессор": "6 ядер", "ОЗУ": "8 ГБ", "SSD": "256 ГБ" } },
  { id: "kite-buds", cat: "audio", brand: "Kite", name: "Kite Buds 2", price: 6990, old: 8990, rating: 4.5, color: "#f4f4f1", specs: { "Тип": "TWS", "Шумоподавление": "Активное", "Работа": "до 30 ч с кейсом", "Защита": "IPX4" } },
  { id: "nord-studio", cat: "audio", brand: "Nord", name: "Nord Studio", price: 18990, rating: 4.7, color: "#1f2229", tag: "Хит", specs: { "Тип": "Полноразмерные", "Шумоподавление": "Активное", "Работа": "до 40 ч", "Подключение": "Bluetooth 5.3" } },
  { id: "lumo-pods", cat: "audio", brand: "Lumo", name: "Lumo Pods", price: 3490, rating: 4.2, color: "#9fd8c7", specs: { "Тип": "TWS", "Шумоподавление": "Нет", "Работа": "до 20 ч", "Защита": "IPX5" } },
  { id: "arca-watch", cat: "watches", brand: "Arca", name: "Arca Watch S", price: 24990, rating: 4.6, color: "#2e3440", specs: { "Экран": "1,8″ AMOLED", "Датчики": "Пульс, SpO₂, GPS", "Работа": "до 7 дней", "Защита": "5 ATM" } },
  { id: "kite-band", cat: "watches", brand: "Kite", name: "Kite Band 4", price: 4290, rating: 4.3, color: "#ff8a65", tag: "Новинка", specs: { "Экран": "1,5″ AMOLED", "Датчики": "Пульс, сон", "Работа": "до 14 дней", "Защита": "5 ATM" } },
  { id: "nord-tab", cat: "tablets", brand: "Nord", name: "Nord Tab 11", price: 39990, rating: 4.7, color: "#4b5563", specs: { "Экран": "11″ 2.5K, 120 Гц", "Память": "128 ГБ", "Стилус": "Поддерживается", "Аккумулятор": "8600 мА·ч" } },
  { id: "lumo-tab", cat: "tablets", brand: "Lumo", name: "Lumo Tab 10", price: 19990, old: 22990, rating: 4.4, color: "#b8c4d6", specs: { "Экран": "10,4″ IPS", "Память": "64 ГБ", "Стилус": "Нет", "Аккумулятор": "7000 мА·ч" } },
  { id: "kite-boom", cat: "speakers", brand: "Kite", name: "Kite Boom", price: 7490, rating: 4.6, color: "#2f80ed", specs: { "Мощность": "20 Вт", "Работа": "до 18 ч", "Защита": "IP67", "Подключение": "Bluetooth 5.3" } },
  { id: "nord-home", cat: "speakers", brand: "Nord", name: "Nord Home Max", price: 21990, rating: 4.8, color: "#d9d4cc", tag: "Хит", specs: { "Мощность": "60 Вт", "Голосовой помощник": "Есть", "Мультирум": "Да", "Подключение": "Wi-Fi, Bluetooth" } },
  { id: "arca-mini", cat: "speakers", brand: "Arca", name: "Arca Mini", price: 2990, rating: 4.1, color: "#e85d75", specs: { "Мощность": "5 Вт", "Работа": "до 10 ч", "Защита": "IPX5", "Подключение": "Bluetooth 5.0" } },
];
const CATS = { phones: "Смартфоны", laptops: "Ноутбуки", audio: "Наушники", watches: "Часы и браслеты", tablets: "Планшеты", speakers: "Колонки" };
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* Stylised product illustrations, so the demo needs no photos. */
function art(p, big = false) {
  const c = p.color, d = "#0e1014";
  const shapes = {
    phones: `<rect x="70" y="20" width="60" height="120" rx="12" fill="${d}"/><rect x="74" y="24" width="52" height="112" rx="9" fill="${c}"/><rect x="88" y="28" width="24" height="5" rx="2.5" fill="${d}"/><circle cx="114" cy="44" r="6" fill="${d}" opacity=".25"/>`,
    laptops: `<rect x="40" y="36" width="120" height="76" rx="6" fill="${d}"/><rect x="45" y="41" width="110" height="66" rx="3" fill="${c}"/><path d="M28 116h144l-10 12H38z" fill="${d}"/><rect x="88" y="116" width="24" height="3" rx="1.5" fill="${c}"/>`,
    audio: `<path d="M60 96V80a40 40 0 0 1 80 0v16" fill="none" stroke="${d}" stroke-width="9" stroke-linecap="round"/><rect x="46" y="84" width="28" height="44" rx="12" fill="${c}" stroke="${d}" stroke-width="4"/><rect x="126" y="84" width="28" height="44" rx="12" fill="${c}" stroke="${d}" stroke-width="4"/>`,
    watches: `<rect x="82" y="18" width="36" height="124" rx="10" fill="${d}" opacity=".85"/><rect x="66" y="48" width="68" height="68" rx="20" fill="${d}"/><rect x="72" y="54" width="56" height="56" rx="15" fill="${c}"/><path d="M100 70v14l10 6" stroke="${d}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    tablets: `<rect x="48" y="24" width="104" height="116" rx="12" fill="${d}"/><rect x="54" y="30" width="92" height="104" rx="7" fill="${c}"/><circle cx="100" cy="27" r="1.6" fill="${c}"/>`,
    speakers: `<rect x="62" y="34" width="76" height="102" rx="26" fill="${c}" stroke="${d}" stroke-width="5"/><circle cx="100" cy="96" r="22" fill="${d}"/><circle cx="100" cy="96" r="9" fill="${c}"/><circle cx="100" cy="54" r="7" fill="${d}"/>`,
  };
  return `<svg viewBox="0 0 200 160" role="img" aria-label="${esc(p.name)}" class="${big ? "art art--big" : "art"}"><ellipse cx="100" cy="146" rx="62" ry="6" fill="#000" opacity=".08"/>${shapes[p.cat]}</svg>`;
}

/* Cart: [{ id, qty }] in localStorage (no personal data). */
const CART_KEY = "volt-cart";
const cart = {
  read() { try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; } catch { return []; } },
  write(lines) { try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch {} updateBadge(); },
  add(id, qty = 1) { const l = cart.read(); const f = l.find((x) => x.id === id); f ? (f.qty = Math.min(f.qty + qty, 9)) : l.push({ id, qty }); cart.write(l); },
  set(id, qty) { cart.write(cart.read().map((x) => (x.id === id ? { ...x, qty } : x)).filter((x) => x.qty > 0)); },
  count() { return cart.read().reduce((s, x) => s + x.qty, 0); },
};
function updateBadge() { $$("[data-cart-count]").forEach((el) => { const n = cart.count(); el.textContent = n; el.hidden = n === 0; }); }

function toast(text) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
  t.textContent = text; t.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function card(p) {
  return `<article class="product">
    <a class="product__media" href="product.html?id=${p.id}" aria-label="${esc(p.name)}">${p.tag ? `<span class="label">${p.tag}</span>` : ""}${art(p)}</a>
    <p class="product__brand">${p.brand} · ${CATS[p.cat]}</p>
    <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
    <p class="product__rating" aria-label="Рейтинг ${p.rating} из 5">★ ${p.rating.toString().replace(".", ",")}</p>
    <div class="product__buy"><p class="price">${rub(p.price)}${p.old ? ` <s>${rub(p.old)}</s>` : ""}</p>
    <button class="btn btn--icon" type="button" data-add="${p.id}" aria-label="Добавить ${esc(p.name)} в корзину">+</button></div>
  </article>`;
}

/* Common: header menu, year, add-to-cart buttons */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { cart.add(add.dataset.add); toast(`${PRODUCTS.find((p) => p.id === add.dataset.add).name} — в корзине`); }
});
const burger = $(".burger");
burger?.addEventListener("click", () => { const open = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(open)); $(".nav").classList.toggle("open", open); });
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
updateBadge();

const page = document.body.dataset.page;

/* Home */
if (page === "home") {
  $("#hits").innerHTML = PRODUCTS.filter((p) => p.tag === "Хит").map(card).join("");
  $("#cats").innerHTML = Object.entries(CATS).map(([k, v]) => { const p = PRODUCTS.find((x) => x.cat === k); return `<a class="cat" href="catalog.html?cat=${k}">${art(p)}<span>${v}</span><small>${PRODUCTS.filter((x) => x.cat === k).length} товара</small></a>`; }).join("");
  const sale = PRODUCTS.filter((p) => p.old);
  $("#sale").innerHTML = sale.map(card).join("");
}

/* Catalog with filters synced to the URL */
if (page === "catalog") {
  const form = $("#filters");
  const params = new URLSearchParams(location.search);
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))].sort();
  $("#f-cat").innerHTML = `<label class="chip"><input type="radio" name="cat" value="" checked> Все</label>` + Object.entries(CATS).map(([k, v]) => `<label class="chip"><input type="radio" name="cat" value="${k}"> ${v}</label>`).join("");
  $("#f-brand").innerHTML = brands.map((b) => `<label class="check"><input type="checkbox" name="brand" value="${b}"> ${b}</label>`).join("");
  if (params.get("cat")) form.cat.value = params.get("cat");
  params.getAll("brand").forEach((b) => { const i = form.querySelector(`[name=brand][value="${b}"]`); if (i) i.checked = true; });
  if (params.get("max")) form.max.value = params.get("max");
  if (params.get("sort")) form.sort.value = params.get("sort");

  const render = () => {
    const fd = new FormData(form);
    const cat = fd.get("cat"), sel = fd.getAll("brand"), max = Number(fd.get("max")) || Infinity, sort = fd.get("sort"), sale = fd.get("sale");
    let list = PRODUCTS.filter((p) => (!cat || p.cat === cat) && (!sel.length || sel.includes(p.brand)) && p.price <= max && (!sale || p.old));
    const by = { cheap: (a, b) => a.price - b.price, expensive: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating };
    if (by[sort]) list = [...list].sort(by[sort]);
    $("#grid").innerHTML = list.length ? list.map(card).join("") : `<p class="empty">Ничего не нашлось. <button type="button" class="link" data-reset>Сбросить фильтры</button></p>`;
    $("#count").textContent = `${list.length} ${list.length % 10 === 1 && list.length % 100 !== 11 ? "товар" : list.length % 10 >= 2 && list.length % 10 <= 4 && (list.length % 100 < 12 || list.length % 100 > 14) ? "товара" : "товаров"}`;
    $("#title").textContent = cat ? CATS[cat] : "Каталог";
    $("#max-out").textContent = Number.isFinite(max) ? `до ${rub(max)}` : "любая";
    const q = new URLSearchParams();
    if (cat) q.set("cat", cat); sel.forEach((b) => q.append("brand", b)); if (fd.get("max") && max < 150000) q.set("max", fd.get("max")); if (sort && sort !== "popular") q.set("sort", sort); if (sale) q.set("sale", "1");
    history.replaceState(null, "", q.toString() ? `?${q}` : location.pathname);
  };
  if (params.get("sale")) form.sale.checked = true;
  form.addEventListener("input", render);
  form.addEventListener("reset", () => setTimeout(render));
  document.addEventListener("click", (e) => { if (e.target.closest("[data-reset]")) form.reset(); });
  $("#toggle-filters")?.addEventListener("click", (e) => { const open = form.classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", String(open)); });
  render();
}

/* Product page */
if (page === "product") {
  const p = PRODUCTS.find((x) => x.id === new URLSearchParams(location.search).get("id")) ?? PRODUCTS[0];
  document.title = `${p.name} — купить в Вольт`;
  $("#crumb-cat").textContent = CATS[p.cat]; $("#crumb-cat").href = `catalog.html?cat=${p.cat}`;
  $("#crumb-name").textContent = p.name;
  $("#p-art").innerHTML = art(p, true);
  $("#p-brand").textContent = `${p.brand} · ${CATS[p.cat]}`;
  $("#p-name").textContent = p.name;
  $("#p-rating").textContent = `★ ${p.rating.toString().replace(".", ",")} · ${Math.round(p.rating * 37)} оценок`;
  $("#p-price").innerHTML = `${rub(p.price)}${p.old ? ` <s>${rub(p.old)}</s> <em>−${Math.round((1 - p.price / p.old) * 100)}%</em>` : ""}`;
  $("#p-specs").innerHTML = Object.entries(p.specs).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  let qty = 1;
  const q = $("#qty");
  $$("[data-qty]").forEach((b) => b.addEventListener("click", () => { qty = Math.min(9, Math.max(1, qty + Number(b.dataset.qty))); q.textContent = qty; }));
  $("#buy").addEventListener("click", () => { cart.add(p.id, qty); toast(`${p.name} × ${qty} — в корзине`); });
  $("#related").innerHTML = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter((x) => x.cat !== p.cat)).slice(0, 4).map(card).join("");
}

/* Cart and checkout */
if (page === "cart") {
  const PROMO = { VOLT10: 0.1 };
  let discount = 0;
  const render = () => {
    const lines = cart.read().map((l) => ({ ...l, p: PRODUCTS.find((p) => p.id === l.id) })).filter((l) => l.p);
    $("#cart-empty").hidden = lines.length > 0;
    $("#cart-full").hidden = lines.length === 0;
    $("#lines").innerHTML = lines.map(({ p, qty }) => `<li class="line">
      <a href="product.html?id=${p.id}" class="line__art">${art(p)}</a>
      <div class="line__info"><a href="product.html?id=${p.id}"><b>${esc(p.name)}</b></a><small>${p.brand} · ${CATS[p.cat]}</small></div>
      <div class="stepper" role="group" aria-label="Количество ${esc(p.name)}"><button type="button" data-line="${p.id}" data-d="-1" aria-label="Уменьшить">−</button><span>${qty}</span><button type="button" data-line="${p.id}" data-d="1" aria-label="Увеличить">+</button></div>
      <b class="line__sum">${rub(p.price * qty)}</b>
      <button type="button" class="line__del" data-del="${p.id}" aria-label="Удалить ${esc(p.name)}">✕</button></li>`).join("");
    const sum = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
    const disc = Math.round(sum * discount);
    const delivery = sum - disc >= 30000 || sum === 0 ? 0 : 490;
    $("#s-items").textContent = rub(sum);
    $("#s-disc").textContent = disc ? `−${rub(disc)}` : "—";
    $("#s-del").textContent = delivery ? rub(delivery) : "бесплатно";
    $("#s-total").textContent = rub(sum - disc + delivery);
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-line]");
    if (b) { const l = cart.read().find((x) => x.id === b.dataset.line); cart.set(l.id, Math.min(9, l.qty + Number(b.dataset.d))); render(); }
    const d = e.target.closest("[data-del]");
    if (d) { cart.set(d.dataset.del, 0); render(); }
  });
  $("#promo").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("#promo-code").value.trim().toUpperCase();
    discount = PROMO[code] ?? 0;
    $("#promo-msg").textContent = discount ? "Промокод применён: −10%" : "Такого промокода нет. Попробуйте VOLT10";
    $("#promo-msg").className = discount ? "ok" : "err";
    render();
  });
  const form = $("#checkout");
  const rules = {
    name: (v) => v.trim().length >= 2 || "Укажите имя",
    phone: (v) => v.replace(/\D/g, "").length >= 10 || "Телефон в формате +7 900 000-00-00",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Проверьте email",
    address: (v) => form.delivery.value === "pickup" || v.trim().length >= 6 || "Укажите адрес доставки",
  };
  form.addEventListener("change", () => { $("#address-field").hidden = form.delivery.value === "pickup"; });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let first = null;
    for (const [name, rule] of Object.entries(rules)) {
      const input = form.elements[name], res = rule(input.value), err = $(`#${name}-err`);
      const bad = res !== true;
      input.setAttribute("aria-invalid", String(bad)); err.textContent = bad ? res : "";
      if (bad && !first) first = input;
    }
    if (first) return first.focus();
    const n = Math.floor(100000 + Math.random() * 900000);
    cart.write([]);
    $("#cart-full").hidden = true;
    $("#done").hidden = false;
    $("#done-num").textContent = n;
    $("#done").focus();
  });
  render();
}
