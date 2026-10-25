// Sofa configurator: options → SVG front view + plan, wall fit check, price/ETA, shareable URL, cart drawer.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const store = { get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const SHAPES = { straight: { n: "Прямой", base: 52000, depth: 98 }, corner: { n: "Угловой", base: 74000, depth: 98, chaise: 160 }, u: { n: "П-образный", base: 98000, depth: 98, chaise: 160 } };
const SEATS = { 2: { w: 180, k: 0 }, 3: { w: 230, k: 14000 }, 4: { w: 290, k: 29000 } };
const FABRICS = [
  { id: "oat", n: "Букле «Овёс»", type: "boucle", c: "#d9cdb8", k: 1.12, note: "Тёплая фактура с узелками, не боится когтей" },
  { id: "sage", n: "Велюр «Шалфей»", type: "velvet", c: "#8a9a7b", k: 1.08, note: "Мягкий короткий ворс с переливом" },
  { id: "terra", n: "Велюр «Терракота»", type: "velvet", c: "#b8663f", k: 1.08, note: "Насыщенный цвет, устойчив к выгоранию" },
  { id: "graphite", n: "Рогожка «Графит»", type: "weave", c: "#4a4a4c", k: 1, note: "Плотное плетение, практичная для семьи с детьми" },
  { id: "sand", n: "Рогожка «Песок»", type: "weave", c: "#c4b08f", k: 1, note: "Светлая, но с водоотталкивающей пропиткой" },
  { id: "ink", n: "Велюр «Чернила»", type: "velvet", c: "#2f3a5a", k: 1.08, note: "Глубокий синий для акцентного интерьера" },
];
const LEGS = { oak: { n: "Дуб", c: "#b48a5a", p: 0 }, black: { n: "Чёрный металл", c: "#222", p: 3500 }, brass: { n: "Латунь", c: "#c9a14a", p: 6900 } };
const TYPES = { boucle: "букле", velvet: "велюр", weave: "рогожка" };

const def = { shape: "corner", seats: "3", fabric: "sage", legs: "oak", pillows: 2 };
const fromUrl = Object.fromEntries(new URLSearchParams(location.search));
const cfg = { ...def };
if (SHAPES[fromUrl.shape]) cfg.shape = fromUrl.shape;
if (SEATS[fromUrl.seats]) cfg.seats = fromUrl.seats;
if (FABRICS.some((f) => f.id === fromUrl.fabric)) cfg.fabric = fromUrl.fabric;
if (LEGS[fromUrl.legs]) cfg.legs = fromUrl.legs;
if (/^[0-6]$/.test(fromUrl.pillows || "")) cfg.pillows = Number(fromUrl.pillows);

const radio = (name, items, label) => Object.entries(items).map(([k, v]) => `<label><input type="radio" name="${name}" value="${k}"><span>${label(k, v)}</span></label>`).join("");
$("#o-shape").innerHTML = radio("shape", SHAPES, (k, v) => `<svg viewBox="0 0 40 24" aria-hidden="true"><path d="${k === "straight" ? "M4 8h32v10H4z" : k === "corner" ? "M4 8h32v10H14v6H4z" : "M4 8h32v16h-10v-6H14v6H4z"}"/></svg>${v.n}`);
$("#o-seats").innerHTML = radio("seats", SEATS, (k, v) => `${k}<small>${v.w} см</small>`);
$("#o-legs").innerHTML = radio("legs", LEGS, (k, v) => `<i style="--c:${v.c}"></i>${v.n}${v.p ? `<small>+${rub(v.p)}</small>` : "<small>включены</small>"}`);
$("#o-fabric").innerHTML = FABRICS.map((f) => `<label title="${f.n}"><input type="radio" name="fabric" value="${f.id}"><span style="--c:${f.c}" class="sw sw--${f.type}"></span><span class="sr">${f.n}</span></label>`).join("");
$("#fabric-list").innerHTML = FABRICS.map((f) => `<article class="fab"><span class="sw sw--${f.type} sw--big" style="--c:${f.c}"></span><h3>${f.n}</h3><p>${f.note}</p><button type="button" class="link" data-pick="${f.id}">Примерить на диван →</button></article>`).join("");

const form = $("#cfg");
function sync() { ["shape", "seats", "fabric", "legs"].forEach((k) => (form.querySelector(`[name=${k}][value="${cfg[k]}"]`).checked = true)); }

function dims() {
  const s = SHAPES[cfg.shape], w = SEATS[cfg.seats].w + (cfg.shape === "u" ? 60 : 0);
  return { w, d: s.chaise || s.depth, h: 82 };
}
function price() {
  const f = FABRICS.find((x) => x.id === cfg.fabric);
  const base = (SHAPES[cfg.shape].base + SEATS[cfg.seats].k) * f.k;
  return Math.round((base + LEGS[cfg.legs].p + cfg.pillows * 1900) / 100) * 100;
}

// Drawing
function patternDefs(f, id) {
  const dark = "rgba(0,0,0,.14)", light = "rgba(255,255,255,.18)";
  const p = f.type === "boucle" ? `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${f.c}"/><circle cx="2" cy="2" r="1.4" fill="${light}"/><circle cx="6" cy="6" r="1.4" fill="${dark}"/></pattern>`
    : f.type === "weave" ? `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${f.c}"/><path d="M0 0h3v3H0zM3 3h3v3H3z" fill="${dark}" opacity=".5"/></pattern>`
    : `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f.c}"/><stop offset=".45" stop-color="${f.c}" stop-opacity=".88"/><stop offset="1" stop-color="${f.c}"/></linearGradient>`;
  return p + `<linearGradient id="${id}-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`;
}
function sofaSVG(c, id, opts = {}) {
  const f = FABRICS.find((x) => x.id === c.fabric), leg = LEGS[c.legs].c, n = Number(c.seats);
  const armW = 22, W = SEATS[c.seats].w * 2.3 + (c.shape === "u" ? 50 : 0) - (c.seats === "4" && c.shape === "u" ? 40 : 0), x0 = (720 - W) / 2, top = 70, backH = 110, seatY = top + backH - 10, seatH = 70;
  const fill = `url(#${id})`;
  const chaiseW = c.shape === "straight" ? 0 : 150, chaise = (side) => `<g><rect x="${side === "r" ? x0 + W - chaiseW - armW : x0 + armW}" y="${seatY + 6}" width="${chaiseW}" height="${seatH + 34}" rx="14" fill="${fill}"/><rect x="${side === "r" ? x0 + W - chaiseW - armW : x0 + armW}" y="${seatY + 6}" width="${chaiseW}" height="${seatH + 34}" rx="14" fill="url(#${id}-shade)"/></g>`;
  const cushW = (W - armW * 2 - 8) / n;
  const cushions = Array.from({ length: n }, (_, i) => `<rect x="${x0 + armW + 4 + i * cushW}" y="${top + 6}" width="${cushW - 6}" height="${backH - 14}" rx="18" fill="${fill}"/><rect x="${x0 + armW + 4 + i * cushW}" y="${top + 6}" width="${cushW - 6}" height="${backH - 14}" rx="18" fill="url(#${id}-shade)"/>`).join("");
  const seats = Array.from({ length: n }, (_, i) => `<rect x="${x0 + armW + 4 + i * cushW}" y="${seatY}" width="${cushW - 6}" height="${seatH - 20}" rx="12" fill="${fill}"/><rect x="${x0 + armW + 4 + i * cushW}" y="${seatY}" width="${cushW - 6}" height="${seatH - 20}" rx="12" fill="url(#${id}-shade)"/>`).join("");
  const pillowColors = ["#efe6d6", "#c9a14a", "#ffffff", "#b8663f", "#2f3a5a", "#8a9a7b"];
  const pillows = Array.from({ length: c.pillows }, (_, i) => { const px = x0 + armW + 30 + i * ((W - armW * 2 - 110) / Math.max(1, c.pillows - 1 || 1)); return `<rect x="${(c.pillows === 1 ? x0 + W / 2 - 30 : px)}" y="${top + 34}" width="56" height="52" rx="14" fill="${pillowColors[i % pillowColors.length]}" transform="rotate(${i % 2 ? 6 : -6} ${px + 28} ${top + 60})" stroke="rgba(0,0,0,.08)"/>`; }).join("");
  const legs = [x0 + 30, x0 + W - 42, ...(n > 3 || c.shape !== "straight" ? [x0 + W / 2 - 6] : [])].map((lx) => `<rect x="${lx}" y="${seatY + seatH + (c.shape === "straight" ? 0 : 30)}" width="12" height="26" rx="3" fill="${leg}"/>`).join("");
  const base = `<rect x="${x0 + 8}" y="${seatY + seatH - 26}" width="${W - 16}" height="30" rx="10" fill="${fill}"/><rect x="${x0 + 8}" y="${seatY + seatH - 26}" width="${W - 16}" height="30" rx="10" fill="#000" opacity=".16"/>`;
  const arms = [x0, x0 + W - armW].map((ax) => `<rect x="${ax}" y="${top + 50}" width="${armW + 6}" height="${backH + seatH - 50}" rx="12" fill="${fill}"/><rect x="${ax}" y="${top + 50}" width="${armW + 6}" height="${backH + seatH - 50}" rx="12" fill="url(#${id}-shade)"/>`).join("");
  const floorY = seatY + seatH + (c.shape === "straight" ? 26 : 56);
  return `<svg viewBox="0 0 720 ${opts.h || 360}" aria-hidden="true"><defs>${patternDefs(f, id)}</defs>
    <ellipse cx="360" cy="${floorY + 4}" rx="${W / 2 + 30}" ry="14" fill="#000" opacity=".08"/>
    <rect x="${x0 + 10}" y="${top}" width="${W - 20}" height="${backH + seatH - 30}" rx="22" fill="${fill}"/><rect x="${x0 + 10}" y="${top}" width="${W - 20}" height="${backH + seatH - 30}" rx="22" fill="#000" opacity=".16"/>
    ${cushions}${pillows}${base}${seats}${legs}${c.shape === "u" ? chaise("l") + chaise("r") : c.shape === "corner" ? chaise("r") : ""}${arms}</svg>`;
}
function planSVG(c) {
  const d = dims(), wall = Number($("#wall").value) || 0, maxW = Math.max(d.w, wall, 100), k = 220 / maxW;
  const W = d.w * k, D = SHAPES[c.shape].depth * k, C = (SHAPES[c.shape].chaise || 0) * k, x = (240 - W) / 2, y = 26;
  const chaiseW = 75 * k;
  const path = c.shape === "straight" ? `M${x} ${y}h${W}v${D}h${-W}z` : c.shape === "corner" ? `M${x} ${y}h${W}v${C}h${-chaiseW}v${D - C}h${-(W - chaiseW)}z` : `M${x} ${y}h${W}v${C}h${-chaiseW}v${D - C}h${-(W - 2 * chaiseW)}v${C - D}h${-chaiseW}z`;
  const ok = wall >= d.w + 20;
  return `<svg viewBox="0 0 240 ${y + C + D + 30}" aria-hidden="true">
    <line x1="${(240 - wall * k) / 2}" x2="${(240 + wall * k) / 2}" y1="${y - 8}" y2="${y - 8}" stroke="${ok ? "#4d7c5a" : "#c0392b"}" stroke-width="4"/>
    <text x="120" y="${y - 14}" text-anchor="middle" class="pl-t">стена ${wall} см</text>
    <path d="${path}" fill="var(--accent-soft)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="120" y="${y + Math.max(C, D) + 18}" text-anchor="middle" class="pl-t">${d.w} × ${d.d} см</text></svg>`;
}
function render() {
  const d = dims(), p = price(), f = FABRICS.find((x) => x.id === cfg.fabric);
  $("#view").innerHTML = sofaSVG(cfg, "fab-main");
  $("#view").setAttribute("aria-label", `${SHAPES[cfg.shape].n} диван на ${cfg.seats} места, ${f.n}, ножки: ${LEGS[cfg.legs].n.toLowerCase()}`);
  $("#plan").innerHTML = planSVG(cfg);
  $("#fabric-name").textContent = `— ${f.n}`;
  $("#pillows").value = cfg.pillows;
  $$("[data-pillow]").forEach((b) => (b.disabled = (b.dataset.pillow === "-1" && cfg.pillows === 0) || (b.dataset.pillow === "1" && cfg.pillows === 6)));
  $("#dims").innerHTML = `<div><dt>Ширина</dt><dd>${d.w} см</dd></div><div><dt>Глубина</dt><dd>${d.d} см</dd></div><div><dt>Высота</dt><dd>${d.h} см</dd></div><div><dt>Спальное место</dt><dd>${cfg.shape === "straight" ? "нет" : `${d.w - 40} × 140 см`}</dd></div>`;
  $("#price").textContent = rub(p);
  const days = cfg.shape === "u" ? 21 : f.type === "boucle" ? 18 : 14, eta = new Date(Date.now() + days * 864e5);
  $("#eta").textContent = `Изготовим к ${eta.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`;
  const wall = Number($("#wall").value) || 0, spare = wall - d.w;
  const msg = $("#fit-msg");
  msg.textContent = !wall ? "Укажите длину стены" : spare >= 20 ? `Встанет: останется ${spare} см` : spare >= 0 ? `Впритык: зазор ${spare} см — лучше на модель меньше` : `Не встанет: не хватает ${-spare} см`;
  msg.className = !wall ? "" : spare >= 20 ? "ok" : spare >= 0 ? "warn" : "bad";
  history.replaceState(null, "", "?" + new URLSearchParams({ shape: cfg.shape, seats: cfg.seats, fabric: cfg.fabric, legs: cfg.legs, pillows: cfg.pillows }) + location.hash);
}
form.addEventListener("change", (e) => { if (e.target.name && e.target.name in cfg) { cfg[e.target.name] = e.target.value; render(); } });
form.addEventListener("click", (e) => { const b = e.target.closest("[data-pillow]"); if (b) { cfg.pillows = Math.max(0, Math.min(6, cfg.pillows + Number(b.dataset.pillow))); render(); } });
$("#wall").addEventListener("input", render);
document.addEventListener("click", (e) => { const p = e.target.closest("[data-pick]"); if (p) { cfg.fabric = p.dataset.pick; sync(); render(); $("#config").scrollIntoView(); form.querySelector(`[name=fabric][value=${cfg.fabric}]`).focus({ preventScroll: true }); } });
$("#share").addEventListener("click", () => {
  const url = location.href.split("#")[0] + "#config", done = () => ($("#share-msg").textContent = "Ссылка на эту конфигурацию скопирована.");
  (navigator.clipboard?.writeText(url) ?? Promise.reject()).then(done, () => ($("#share-msg").textContent = "Скопируйте ссылку из адресной строки — она уже содержит настройки."));
});
$("#hero-art").innerHTML = sofaSVG({ shape: "corner", seats: "3", fabric: "terra", legs: "brass", pillows: 3 }, "fab-hero", { h: 360 });
sync(); render();

// Cart
let cart = store.get("modul-cart") || [];
const cartEl = $("#cart"), openBtn = $("#cart-open");
const title = (c) => `${SHAPES[c.shape].n} диван, ${c.seats} места`;
function drawCart() {
  $("#cart-count").textContent = cart.length;
  $("#cart-list").innerHTML = cart.length ? cart.map((c, i) => `<li class="ci"><div class="ci__img">${sofaSVG(c, "fab-c" + i, { h: 360 })}</div><div><b>${title(c)}</b><small>${FABRICS.find((f) => f.id === c.fabric).n} · ножки: ${LEGS[c.legs].n.toLowerCase()} · подушек: ${c.pillows}</small><span>${rub(c.price)}</span></div><button type="button" class="x x--sm" data-remove="${i}" aria-label="Удалить: ${title(c)}">×</button></li>`).join("") : `<li class="empty">Пока пусто. Соберите диван в конфигураторе.</li>`;
  const total = cart.reduce((s, c) => s + c.price, 0);
  $("#cart-total").textContent = rub(total);
  $("#cart-note").textContent = cart.length ? (total >= 80000 ? "Подъём и сборка — бесплатно." : `Подъём и сборка — 3 900 ₽. Бесплатно от 80 000 ₽.`) : "";
  $("#checkout").disabled = !cart.length;
  store.set("modul-cart", cart);
}
function openCart() { cartEl.inert = false; cartEl.classList.add("is-open"); openBtn.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; $(".cart__panel .x").focus(); }
function closeCart() { cartEl.classList.remove("is-open"); cartEl.inert = true; openBtn.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; openBtn.focus(); }
openBtn.addEventListener("click", openCart);
cartEl.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeCart();
  const r = e.target.closest("[data-remove]"); if (r) { cart.splice(Number(r.dataset.remove), 1); drawCart(); ($("[data-remove]") || $(".cart__panel .x")).focus(); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && cartEl.classList.contains("is-open")) closeCart(); });
$("#add").addEventListener("click", () => { cart.push({ ...cfg, pillows: Number(cfg.pillows), price: price() }); drawCart(); openCart(); });
$("#checkout").addEventListener("click", () => { $("#cart-list").innerHTML = `<li class="empty"><b>Заказ оформлен.</b> Менеджер позвонит, чтобы уточнить адрес и дату доставки. Это демо — заказ не создан.</li>`; cart = []; store.set("modul-cart", cart); $("#cart-count").textContent = 0; $("#cart-total").textContent = rub(0); $("#cart-note").textContent = ""; $("#checkout").disabled = true; });
drawCart();
