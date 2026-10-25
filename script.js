// Bouquet builder with live SVG preview, ready-made bouquets, delivery form with slots and card counter.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const FLOWERS = [
  { id: "rose", n: "Роза", price: 190, colors: ["#e8475f", "#f6a5b4", "#fff4e8"], shape: "rose" },
  { id: "tulip", n: "Тюльпан", price: 120, colors: ["#ff7a59", "#ffd166", "#c77dff"], shape: "tulip" },
  { id: "peony", n: "Пион", price: 420, colors: ["#f7b2c4", "#fff0f3", "#e05780"], shape: "peony" },
  { id: "chamo", n: "Ромашка", price: 70, colors: ["#ffffff"], shape: "daisy" },
  { id: "lav", n: "Лаванда, пучок", price: 260, colors: ["#9d8df1"], shape: "lav" },
];
const WRAP = { craft: ["#d8b48a", 0], blush: ["#f2c7c1", 0], sage: ["#b9c9b2", 0], box: ["#2f4a3a", 600] };
const GREEN = { none: 0, euc: 350, fern: 250 };
const state = Object.fromEntries(FLOWERS.map((f) => [f.id, { qty: f.id === "rose" ? 5 : f.id === "chamo" ? 4 : 0, color: 0 }]));

$("#flowers").innerHTML = FLOWERS.map((f) => `<li class="fl"><span class="fl__name"><b>${f.n}</b><small>${rub(f.price)} / шт</small></span>
  ${f.colors.length > 1 ? `<span class="swatches" role="radiogroup" aria-label="Цвет: ${f.n}">${f.colors.map((c, i) => `<label><input type="radio" name="c-${f.id}" value="${i}" ${i === 0 ? "checked" : ""}><i style="--c:${c}" title="${c}"></i><span class="sr">Оттенок ${i + 1}</span></label>`).join("")}</span>` : "<span></span>"}
  <span class="step" role="group" aria-label="Количество: ${f.n}"><button type="button" data-f="${f.id}" data-d="-1" aria-label="Меньше">−</button><output id="q-${f.id}">0</output><button type="button" data-f="${f.id}" data-d="1" aria-label="Больше">+</button></span></li>`).join("");

const head = (shape, c, x, y) => ({
  rose: `<circle cx="${x}" cy="${y}" r="15" fill="${c}"/><path d="M${x - 8} ${y}a8 8 0 0 1 16 0a5 5 0 0 1-10 0" stroke="rgba(0,0,0,.18)" stroke-width="2" fill="none"/>`,
  tulip: `<path d="M${x - 11} ${y - 6}q0 22 11 22t11-22l-6 7-5-11-5 11z" fill="${c}"/>`,
  peony: `<circle cx="${x}" cy="${y}" r="20" fill="${c}"/><circle cx="${x - 6}" cy="${y - 4}" r="9" fill="rgba(255,255,255,.35)"/><circle cx="${x + 6}" cy="${y + 4}" r="8" fill="rgba(0,0,0,.08)"/>`,
  daisy: Array.from({ length: 10 }, (_, k) => `<ellipse cx="${x + Math.cos((k * Math.PI) / 5) * 10}" cy="${y + Math.sin((k * Math.PI) / 5) * 10}" rx="7" ry="3.5" transform="rotate(${k * 36} ${x + Math.cos((k * Math.PI) / 5) * 10} ${y + Math.sin((k * Math.PI) / 5) * 10})" fill="#fff" stroke="#e6e0d8"/>`).join("") + `<circle cx="${x}" cy="${y}" r="5" fill="#f4b400"/>`,
  lav: Array.from({ length: 6 }, (_, k) => `<ellipse cx="${x + (k % 2 ? 3 : -3)}" cy="${y - k * 6}" rx="3.5" ry="4.5" fill="${c}"/>`).join(""),
}[shape]);
function render() {
  const green = $("[name=green]:checked").value, wrap = $("[name=wrap]:checked").value;
  const items = [];
  FLOWERS.forEach((f) => { const s = state[f.id]; for (let i = 0; i < s.qty; i++) items.push({ f, c: f.colors[s.color] }); });
  // stable pseudo-random placement in a dome
  const heads = items.map((it, i) => { const a = (i * 137.5 * Math.PI) / 180, r = 8 * Math.sqrt(i + 1) * Math.min(1, 9 / Math.sqrt(items.length + 1)) * 1.6; return { ...it, x: 150 + Math.cos(a) * r * 1.5, y: 120 + Math.sin(a) * r * 0.8 - (items.length > 12 ? 10 : 0) }; }).sort((a, b) => a.y - b.y);
  const stems = heads.map((h) => `<path d="M${h.x} ${h.y}L${150 + (h.x - 150) * 0.15} 260" stroke="#4f7a52" stroke-width="2.5"/>`).join("");
  const greens = green === "none" ? "" : Array.from({ length: 9 }, (_, k) => { const a = -Math.PI + (k / 8) * Math.PI, x = 150 + Math.cos(a) * 95, y = 150 + Math.sin(a) * 75; return green === "euc" ? `<g fill="#8fae99">${[0, 1, 2].map((j) => `<circle cx="${150 + (x - 150) * (0.6 + j * 0.2)}" cy="${150 + (y - 150) * (0.6 + j * 0.2)}" r="${7 - j}"/>`).join("")}</g>` : `<path d="M150 170 Q${(150 + x) / 2} ${y - 10} ${x} ${y}" stroke="#3f7d4f" stroke-width="5" stroke-dasharray="2 4" fill="none"/>`; }).join("");
  const [wc] = WRAP[wrap];
  const wrapSvg = wrap === "box" ? `<rect x="80" y="170" width="140" height="90" rx="10" fill="${wc}"/><rect x="80" y="170" width="140" height="14" fill="#264030"/><text x="150" y="232" text-anchor="middle" fill="#efe6d8" font-family="Noto Serif Variable" font-size="14">Букетная</text>` : `<path d="M70 150 L150 290 L230 150 L200 165 L150 140 L100 165Z" fill="${wc}"/><path d="M150 290 L120 175 M150 290 L180 175" stroke="rgba(0,0,0,.12)" stroke-width="2"/><path d="M130 236 q20 10 40 0 l-6 14 q-14 -6 -28 0z" fill="#e86f68"/>`;
  $("#preview").innerHTML = `<svg viewBox="0 0 300 300" aria-hidden="true">${wrap === "box" ? "" : stems}${greens}${heads.map((h) => head(h.f.shape, h.c, h.x, h.y)).join("")}${wrapSvg}${wrap === "box" ? "" : ""}</svg>`;
  const count = items.length, price = items.reduce((s, it) => s + it.f.price, 0) + GREEN[green] + WRAP[wrap][1] + (count ? 300 : 0);
  $("#b-count").textContent = `${count} ${count % 10 === 1 && count % 100 !== 11 ? "цветок" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "цветка" : "цветов"}${count ? " · сборка 300 ₽" : ""}`;
  $("#b-price").textContent = rub(price);
  FLOWERS.forEach((f) => ($(`#q-${f.id}`).value = state[f.id].qty));
  return { count, price };
}
$("#builder-form").addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (!b) return; const s = state[b.dataset.f]; s.qty = Math.max(0, Math.min(51, s.qty + Number(b.dataset.d))); render(); });
$("#builder-form").addEventListener("change", (e) => { if (e.target.name?.startsWith("c-")) state[e.target.name.slice(2)].color = Number(e.target.value); render(); });
render();

// Ready bouquets
const READY = [
  { n: "Утро в саду", p: 3900, mix: { peony: [3, 0], rose: [4, 1], chamo: [0, 0] }, wrap: "blush", green: "euc" },
  { n: "Солнечный", p: 2600, mix: { tulip: [9, 1], chamo: [6, 0] }, wrap: "craft", green: "fern" },
  { n: "Классика", p: 4700, mix: { rose: [15, 0] }, wrap: "box", green: "none" },
  { n: "Прованс", p: 3200, mix: { lav: [4, 0], rose: [5, 2], chamo: [4, 0] }, wrap: "sage", green: "euc" },
];
let order = null;
const snapshot = () => FLOWERS.filter((f) => state[f.id].qty).map((f) => `${f.n.toLowerCase().replace(", пучок", "")} × ${state[f.id].qty}`).join(", ");
function applyReady(r) {
  FLOWERS.forEach((f) => { state[f.id].qty = r.mix[f.id]?.[0] ?? 0; state[f.id].color = r.mix[f.id]?.[1] ?? 0; const radio = $(`[name="c-${f.id}"][value="${state[f.id].color}"]`); if (radio) radio.checked = true; });
  $(`[name=wrap][value=${r.wrap}]`).checked = true; $(`[name=green][value=${r.green}]`).checked = true;
}
$("#ready-list").innerHTML = READY.map((r, i) => `<article class="rb"><div class="rb__img" id="rb-${i}"></div><h3>${r.n}</h3><p class="muted"></p><div class="rb__buy"><b>${rub(r.p)}</b><button type="button" class="btn btn--sm" data-ready="${i}">Выбрать</button></div></article>`).join("");
const saved = JSON.parse(JSON.stringify(state)), savedWrap = $("[name=wrap]:checked").value, savedGreen = $("[name=green]:checked").value;
READY.forEach((r, i) => { applyReady(r); render(); $(`#rb-${i}`).innerHTML = $("#preview").innerHTML; if (i === 0) $("#hero-art").innerHTML = $("#preview").innerHTML; $(`#rb-${i}`).nextElementSibling.nextElementSibling.textContent = snapshot(); });
Object.assign(state, saved); FLOWERS.forEach((f) => { const radio = $(`[name="c-${f.id}"][value="${state[f.id].color}"]`); if (radio) radio.checked = true; }); $(`[name=wrap][value=${savedWrap}]`).checked = true; $(`[name=green][value=${savedGreen}]`).checked = true; render();
document.addEventListener("click", (e) => {
  const r = e.target.closest("[data-ready]");
  if (r) { const b = READY[r.dataset.ready]; order = { name: `«${b.n}»`, price: b.p }; applyReady(b); render(); setOrder(); $("#delivery").scrollIntoView(); }
});
$("#to-order").addEventListener("click", () => {
  const { count, price } = render();
  if (!count) { $("#hint").textContent = "Добавьте хотя бы один цветок."; return; }
  $("#hint").textContent = "";
  order = { name: `ваш букет: ${snapshot()}`, price }; setOrder(); $("#delivery").scrollIntoView();
});

// Delivery
const of = $("#order");
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
of.date.min = iso(new Date()); of.date.value = iso(new Date());
function slots() {
  const isToday = of.date.value === iso(new Date()), h = new Date().getHours() + 2;
  const all = ["9:00–12:00", "12:00–15:00", "15:00–18:00", "18:00–21:00"].filter((s) => !isToday || Number(s.split(":")[0]) >= h);
  of.slot.innerHTML = all.length ? all.map((s) => `<option>${s}</option>`).join("") : `<option value="">На сегодня интервалов нет — выберите завтра</option>`;
}
of.date.addEventListener("change", slots); slots();
function setOrder() {
  $("#your").innerHTML = order ? `Вы выбрали ${order.name} — <b>${rub(order.price)}</b>` : "Букет ещё не выбран";
  const del = order && order.price >= 5000 ? 0 : 390;
  $("#o-total").textContent = order ? `${rub(order.price + del)}${del ? " (доставка 390 ₽)" : " (доставка бесплатно)"}` : "—";
}
of.card.addEventListener("input", () => ($("#card-left").textContent = 150 - of.card.value.length));
of.addEventListener("submit", (e) => {
  e.preventDefault();
  const errs = [];
  if (!order) errs.push("выберите или соберите букет");
  if (!of.slot.value) errs.push("интервал доставки");
  if (of.addr.value.trim().length < 6) { errs.push("адрес"); of.addr.setAttribute("aria-invalid", "true"); } else of.addr.setAttribute("aria-invalid", "false");
  if (of.to.value.trim().length < 2) { errs.push("имя получателя"); of.to.setAttribute("aria-invalid", "true"); } else of.to.setAttribute("aria-invalid", "false");
  if (of.phone.value.replace(/\D/g, "").length < 10) { errs.push("ваш телефон"); of.phone.setAttribute("aria-invalid", "true"); } else of.phone.setAttribute("aria-invalid", "false");
  $(".err").textContent = errs.length ? "Нужно указать: " + errs.join(", ") + "." : "";
  if (errs.length) return;
  $(".err").textContent = "";
  of.innerHTML = `<div class="done" tabindex="-1"><p class="big">Заказ принят 💐</p><p>${order.name}, ${new Date(of.date.value + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, ${of.slot.value}. Пришлём фото букета перед отправкой. Это демо — заказ не создан.</p></div>`;
  $(".done").focus();
});
