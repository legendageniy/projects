// Pulse CRM demo: hash router, overview charts (SVG), deals table, kanban pipeline, theme toggle.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const { daily, deals, STAGES, MANAGERS, SOURCES, today } = window.PULSE;
const fmt = (n) => Math.round(n).toLocaleString("ru-RU");
const rub = (n) => fmt(n) + " ₽";
const short = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(".", ",") + " млн" : n >= 1e3 ? Math.round(n / 1e3) + " тыс" : String(n));
const dShort = (d) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");
const stage = (id) => STAGES.find((s) => s.id === id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const NS = "http://www.w3.org/2000/svg";
const tip = $("#tip");
function showTip(html, x, y) { tip.innerHTML = html; tip.hidden = false; const r = tip.getBoundingClientRect(); tip.style.left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x + 14)) + "px"; tip.style.top = Math.max(8, y - r.height - 12) + "px"; }
const hideTip = () => (tip.hidden = true);
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("is-on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("is-on"), 2600); }

// Theme
const themeBtn = $("#theme");
const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
const syncTheme = () => themeBtn.setAttribute("aria-pressed", isDark());
themeBtn.addEventListener("click", () => { const t = isDark() ? "light" : "dark"; document.documentElement.dataset.theme = t; try { localStorage.setItem("pulse-theme", t); } catch (e) {} syncTheme(); renderOverview(); });
syncTheme();

// Mobile menu
const side = $("#side"), menu = $("#menu");
const setMenu = (open) => { side.classList.toggle("is-open", open); menu.setAttribute("aria-expanded", open); };
menu.addEventListener("click", () => setMenu(!side.classList.contains("is-open")));
side.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

// Router
const TITLES = { overview: "Обзор", deals: "Сделки", pipeline: "Воронка" };
function route() {
  const v = TITLES[location.hash.slice(1)] ? location.hash.slice(1) : "overview";
  $$("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== v));
  $$("[data-view]").forEach((a) => (a.dataset.view === v ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  $("#view-title").textContent = TITLES[v];
  document.title = `${TITLES[v]} — Пульс CRM`;
  if (v === "overview") renderOverview(); if (v === "deals") renderDeals(); if (v === "pipeline") renderBoard();
}
window.addEventListener("hashchange", () => { route(); window.scrollTo(0, 0); $("#view").focus({ preventScroll: true }); });

// ---------- Overview ----------
let range = 30;
const inRange = (d, from, to) => d >= from && d < to;
function periodStats(from, to) {
  const ds = deals.filter((d) => inRange(d.created, from, to));
  const closed = deals.filter((d) => d.closed && inRange(d.closed, from, to)), won = closed.filter((d) => d.stage === "won");
  const rev = daily.filter((x) => inRange(x.date, from, to)).reduce((s, x) => s + x.value, 0);
  return { ds, won, rev, count: ds.length, conv: closed.length ? (won.length / closed.length) * 100 : 0, avg: won.length ? won.reduce((s, d) => s + d.amount, 0) / won.length : 0 };
}
function spark(values) {
  const w = 120, h = 34, max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--series-1)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
}
function delta(cur, prev, unit = "%") {
  if (!prev) return `<span class="delta">—</span>`;
  const d = unit === "pp" ? cur - prev : ((cur - prev) / prev) * 100;
  if (Math.abs(d) < 0.05) return `<span class="delta">без изменений</span>`;
  const up = d >= 0;
  return `<span class="delta ${up ? "delta--up" : "delta--down"}"><span aria-hidden="true">${up ? "▲" : "▼"}</span> ${up ? "+" : "−"}${Math.abs(d).toFixed(1).replace(".", ",")}${unit === "pp" ? " п.п." : "%"} <span class="sr">к прошлому периоду</span></span>`;
}
function buckets() {
  const slice = daily.slice(-range);
  if (range <= 30) return slice.map((x) => ({ label: dShort(x.date), from: x.date, value: x.value, plan: x.plan }));
  const out = [];
  for (let i = 0; i < slice.length; i += 7) { const part = slice.slice(i, i + 7); out.push({ label: dShort(part[0].date), from: part[0].date, to: part[part.length - 1].date, value: part.reduce((s, x) => s + x.value, 0), plan: part.reduce((s, x) => s + x.plan, 0), partial: part.length < 7 }); }
  return out;
}
function renderOverview() {
  $$("[data-range]").forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.range) === range));
  const end = new Date(today.getTime() + 864e5), from = new Date(end.getTime() - range * 864e5), pfrom = new Date(from.getTime() - range * 864e5);
  $("#range-label").textContent = `${dShort(from)} — ${dShort(today)}, сравнение с предыдущими ${range} днями`;
  const cur = periodStats(from, end), prev = periodStats(pfrom, from);
  const b = buckets();
  const perBucketDeals = b.map((x, i) => deals.filter((d) => d.created >= x.from && d.created < (b[i + 1]?.from ?? end)).length);
  $("#kpis").innerHTML = [
    ["Выручка", rub(cur.rev), delta(cur.rev, prev.rev), spark(b.map((x) => x.value))],
    ["Новые сделки", fmt(cur.count), delta(cur.count, prev.count), spark(perBucketDeals)],
    ["Конверсия в победу", cur.conv.toFixed(1).replace(".", ",") + "%", delta(cur.conv, prev.conv, "pp"), ""],
    ["Средний чек", rub(cur.avg), delta(cur.avg, prev.avg), ""],
  ].map(([n, v, d, s]) => `<article class="kpi"><h2 class="kpi__name">${n}</h2><p class="kpi__val">${v}</p><div class="kpi__foot">${d}${s}</div></article>`).join("");
  revenueChart(b);
  funnel(cur.ds);
  sources(cur.won);
  leaders(cur.won);
}
$(".filters").addEventListener("click", (e) => { const b = e.target.closest("[data-range]"); if (b) { range = Number(b.dataset.range); renderOverview(); } });

function revenueChart(b) {
  const box = $("#rev-chart"), W = Math.max(300, box.clientWidth || 760), H = W < 500 ? 220 : 280, m = { l: 56, r: 48, t: 16, b: 30 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = Math.max(...b.map((x) => Math.max(x.value, x.plan))) * 1.1;
  const step = Math.pow(10, Math.floor(Math.log10(max / 4))), tick = Math.ceil(max / 4 / step) * step;
  const x = (i) => m.l + (b.length === 1 ? iw / 2 : (i / (b.length - 1)) * iw), y = (v) => m.t + ih - (v / (tick * 4)) * ih;
  const line = (k) => b.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join("");
  const every = Math.ceil(b.length / Math.max(3, Math.floor(iw / 110)));
  const total = b.reduce((s, p) => s + p.value, 0), plan = b.reduce((s, p) => s + p.plan, 0);
  $("#rev-sub").textContent = `${rub(total)} за ${range} дней · ${Math.round((total / plan) * 100)}% плана${range > 30 ? " · по неделям" : " · по дням"}`;
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Выручка за ${range} дней: ${rub(total)}, план ${rub(plan)}. Подробности — в таблице." tabindex="0">
    ${[0, 1, 2, 3, 4].map((k) => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(k * tick)}" y2="${y(k * tick)}" class="${k ? "grid" : "axis"}"/><text x="${m.l - 8}" y="${y(k * tick) + 4}" class="tick" text-anchor="end">${short(k * tick)}</text>`).join("")}
    ${b.map((p, i) => (i % every === 0 ? `<text x="${x(i)}" y="${H - 8}" class="tick" text-anchor="middle">${p.label}</text>` : "")).join("")}
    <path d="${line("value")}L${x(b.length - 1)} ${y(0)}L${x(0)} ${y(0)}Z" class="area"/>
    <path d="${line("plan")}" class="plan-line"/>
    <path d="${line("value")}" class="rev-line"/>
    <text x="${x(b.length - 1) + 8}" y="${y(b[b.length - 1].value) + 4}" class="dlabel">Факт</text>
    <text x="${x(b.length - 1) + 8}" y="${y(b[b.length - 1].plan) + (Math.abs(y(b[b.length - 1].plan) - y(b[b.length - 1].value)) < 14 ? (b[b.length - 1].plan > b[b.length - 1].value ? -8 : 16) : 4)}" class="dlabel dlabel--muted">План</text>
    <g class="cross" hidden><line class="cross__line" y1="${m.t}" y2="${m.t + ih}"/><circle r="5" class="cross__dot"/></g>
    <rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent" class="hit"/>
  </svg>`;
  const svg = $("svg", box), cross = $(".cross", svg);
  const at = (i, cx, cy) => {
    const p = b[i]; cross.hidden = false;
    $(".cross__line", cross).setAttribute("x1", x(i)); $(".cross__line", cross).setAttribute("x2", x(i));
    $(".cross__dot", cross).setAttribute("cx", x(i)); $(".cross__dot", cross).setAttribute("cy", y(p.value));
    showTip(`<b>${p.to ? `${p.label} — ${dShort(p.to)}` : p.label}</b><span><i class="sw sw--rev"></i>Факт <b>${rub(p.value)}</b></span><span><i class="sw sw--plan"></i>План <b>${rub(p.plan)}</b></span>${p.partial ? "<small>неполная неделя</small>" : ""}`, cx, cy);
  };
  const idxFromEvent = (e) => { const r = svg.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; return Math.max(0, Math.min(b.length - 1, Math.round(((px - m.l) / iw) * (b.length - 1)))); };
  svg.addEventListener("pointermove", (e) => at(idxFromEvent(e), e.clientX, e.clientY));
  svg.addEventListener("pointerleave", () => { cross.hidden = true; hideTip(); });
  let ki = b.length - 1;
  svg.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault();
    ki = Math.max(0, Math.min(b.length - 1, ki + (e.key === "ArrowRight" ? 1 : -1)));
    const r = svg.getBoundingClientRect(); at(ki, r.left + (x(ki) / W) * r.width, r.top + (y(b[ki].value) / H) * r.height);
  });
  svg.addEventListener("blur", () => { cross.hidden = true; hideTip(); });
  $("#rev-table").innerHTML = `<table class="table table--compact"><caption class="sr">Выручка по ${range > 30 ? "неделям" : "дням"}</caption><thead><tr><th scope="col">${range > 30 ? "Неделя с" : "День"}</th><th scope="col" class="num">Факт</th><th scope="col" class="num">План</th><th scope="col" class="num">Отклонение</th></tr></thead><tbody>${b.map((p) => `<tr><td>${p.label}</td><td class="num">${rub(p.value)}</td><td class="num">${rub(p.plan)}</td><td class="num">${p.value >= p.plan ? "+" : "−"}${rub(Math.abs(p.value - p.plan))}</td></tr>`).join("")}</tbody></table>`;
}
$("#rev-table-btn").addEventListener("click", (e) => { const t = $("#rev-table"), open = t.hidden; t.hidden = !open; e.currentTarget.setAttribute("aria-expanded", open); e.currentTarget.textContent = open ? "Скрыть таблицу" : "Таблица"; });

function funnel(ds) {
  const order = ["new", "qual", "offer", "talks", "won"], idx = (s) => (s === "lost" ? 1 : order.indexOf(s));
  const counts = order.map((s, i) => ds.filter((d) => idx(d.stage) >= i).length);
  const ramp = ["var(--seq-250)", "var(--seq-350)", "var(--seq-450)", "var(--seq-500)", "var(--seq-600)"];
  $("#funnel").innerHTML = `<ol class="funnel">${order.map((s, i) => `<li><span class="funnel__name">${stage(s).n}</span><span class="funnel__bar"><span style="width:${counts[0] ? (counts[i] / counts[0]) * 100 : 0}%;background:${ramp[i]}"></span></span><span class="funnel__val"><b>${counts[i]}</b> ${i ? `<small>${counts[0] ? Math.round((counts[i] / counts[0]) * 100) : 0}%</small>` : ""}</span></li>`).join("")}</ol>`;
}
function sources(won) {
  const rows = SOURCES.map((s) => ({ s, sum: won.filter((d) => d.source === s).reduce((a, d) => a + d.amount, 0), n: won.filter((d) => d.source === s).length })).sort((a, b) => b.sum - a.sum);
  const max = Math.max(1, ...rows.map((r) => r.sum));
  $("#src-chart").innerHTML = `<ul class="hbars">${rows.map((r) => `<li tabindex="0" data-tip="<b>${r.s}</b><span>${r.n} ${r.n % 10 === 1 && r.n % 100 !== 11 ? "сделка" : r.n % 10 >= 2 && r.n % 10 <= 4 && (r.n % 100 < 12 || r.n % 100 > 14) ? "сделки" : "сделок"} · <b>${rub(r.sum)}</b></span>"><span class="hbars__name">${r.s}</span><span class="hbars__track"><span style="width:${(r.sum / max) * 100}%"></span></span><span class="hbars__val">${r.sum ? short(r.sum) : "0"}</span></li>`).join("")}</ul>`;
}
$("#src-chart").addEventListener("pointermove", (e) => { const li = e.target.closest("[data-tip]"); if (li) showTip(li.dataset.tip, e.clientX, e.clientY); else hideTip(); });
$("#src-chart").addEventListener("pointerleave", hideTip);
$("#src-chart").addEventListener("focusin", (e) => { const li = e.target.closest("[data-tip]"); if (li) { const r = li.getBoundingClientRect(); showTip(li.dataset.tip, r.left + r.width / 2, r.top); } });
$("#src-chart").addEventListener("focusout", hideTip);
function leaders(won) {
  const target = 700000 * (range / 30);
  const rows = MANAGERS.map((n) => ({ n, sum: won.filter((d) => d.manager === n).reduce((a, d) => a + d.amount, 0) })).sort((a, b) => b.sum - a.sum);
  $("#leaders").innerHTML = rows.map((r) => {
    const pct = Math.round((r.sum / target) * 100), st = pct >= 100 ? ["good", "✓", "выполнен"] : pct >= 70 ? ["warning", "→", "в пути"] : ["critical", "!", "отстаёт"];
    return `<li><span class="avatar avatar--sm" aria-hidden="true">${r.n.split(" ").map((x) => x[0]).join("")}</span><span class="leaders__body"><span class="leaders__top"><b>${r.n}</b><span>${short(r.sum)} ₽ <span class="muted">из ${short(target)}</span></span></span><span class="progress"><span class="st-${st[0]}" style="width:${Math.min(100, pct)}%"></span></span></span><span class="status status--${st[0]}"><span aria-hidden="true">${st[1]}</span> ${pct}% · ${st[2]}</span></li>`;
  }).join("");
}

// ---------- Deals ----------
const fStage = $("#f-stage"), fMgr = $("#f-manager"), gSearch = $("#global-search");
fStage.innerHTML += STAGES.map((s) => `<option value="${s.id}">${s.n}</option>`).join("");
fMgr.innerHTML += MANAGERS.map((m) => `<option>${m}</option>`).join("");
let sort = { key: "created", dir: -1 }, page = 1;
const PER = 12;
function filtered() {
  const q = gSearch.value.trim().toLowerCase();
  return deals.filter((d) => (!fStage.value || d.stage === fStage.value) && (!fMgr.value || d.manager === fMgr.value) && (!q || `${d.company} ${d.contact} ${d.id}`.toLowerCase().includes(q)))
    .sort((a, b) => { const k = sort.key, va = k === "stage" ? STAGES.findIndex((s) => s.id === a.stage) : a[k], vb = k === "stage" ? STAGES.findIndex((s) => s.id === b.stage) : b[k]; return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir; });
}
const badge = (id) => `<span class="badge badge--${id}">${stage(id).n}</span>`;
function renderDeals() {
  const list = filtered(), pages = Math.max(1, Math.ceil(list.length / PER));
  page = Math.min(page, pages);
  const rows = list.slice((page - 1) * PER, page * PER);
  $("#deals-count").textContent = `Найдено: ${list.length} · на сумму ${rub(list.reduce((s, d) => s + d.amount, 0))}`;
  $("#deals-table tbody").innerHTML = rows.length ? rows.map((d) => `<tr><td><button type="button" class="row-link" data-open="${d.id}">${esc(d.company)}</button><small>${esc(d.contact)}</small></td><td>${badge(d.stage)}</td><td>${d.manager}</td><td class="num">${rub(d.amount)}</td><td>${d.created.toLocaleDateString("ru-RU")}</td></tr>`).join("") : `<tr><td colspan="5" class="empty">Ничего не найдено. Попробуйте изменить фильтры.</td></tr>`;
  $$("#deals-table th").forEach((th) => th.setAttribute("aria-sort", $("button", th).dataset.sort === sort.key ? (sort.dir > 0 ? "ascending" : "descending") : "none"));
  $("#pager").innerHTML = pages > 1 ? `<button type="button" data-page="${page - 1}" ${page === 1 ? "disabled" : ""} aria-label="Предыдущая страница">←</button>${Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1).map((n, i, arr) => `${i && n - arr[i - 1] > 1 ? '<span class="gap" aria-hidden="true">…</span>' : ""}<button type="button" data-page="${n}" ${n === page ? 'aria-current="page"' : ""}>${n}</button>`).join("")}<button type="button" data-page="${page + 1}" ${page === pages ? "disabled" : ""} aria-label="Следующая страница">→</button>` : "";
}
$("#deals-table thead").addEventListener("click", (e) => { const b = e.target.closest("[data-sort]"); if (!b) return; sort = sort.key === b.dataset.sort ? { key: sort.key, dir: -sort.dir } : { key: b.dataset.sort, dir: b.dataset.sort === "amount" || b.dataset.sort === "created" ? -1 : 1 }; renderDeals(); });
$("#pager").addEventListener("click", (e) => { const b = e.target.closest("[data-page]"); if (b && !b.disabled) { page = Number(b.dataset.page); renderDeals(); } });
[fStage, fMgr].forEach((el) => el.addEventListener("change", () => { page = 1; renderDeals(); }));
gSearch.addEventListener("input", () => { page = 1; if (location.hash !== "#deals") location.hash = "#deals"; else renderDeals(); });
$("#export").addEventListener("click", () => {
  const list = filtered(), q = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const csv = "﻿" + [["ID", "Компания", "Контакт", "Этап", "Менеджер", "Источник", "Сумма", "Создана"].join(";"), ...list.map((d) => [d.id, q(d.company), q(d.contact), stage(d.stage).n, d.manager, d.source, d.amount, d.created.toLocaleDateString("ru-RU")].join(";"))].join("\n");
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), download: "deals.csv" });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(`Выгружено сделок: ${list.length}`);
});

const setClosed = (d) => { d.closed = d.stage === "won" || d.stage === "lost" ? d.closed || new Date(today) : null; };

// Drawer
const drawer = $("#drawer");
let lastFocus = null;
function openDeal(id) {
  const d = deals.find((x) => x.id === Number(id)); if (!d) return;
  lastFocus = document.activeElement;
  $("#drawer-body").innerHTML = `<p class="muted small">Сделка #${d.id}</p><h2 id="d-title">${esc(d.company)}</h2>
    <p class="drawer__sum">${rub(d.amount)}</p>
    <dl class="dl"><dt>Контакт</dt><dd>${esc(d.contact)}</dd><dt>Менеджер</dt><dd>${d.manager}</dd><dt>Источник</dt><dd>${d.source}</dd><dt>Создана</dt><dd>${d.created.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</dd>${d.closed ? `<dt>Закрыта</dt><dd>${d.closed.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</dd>` : ""}<dt>Вероятность</dt><dd>${stage(d.stage).p}%</dd></dl>
    <label class="field"><span>Этап сделки</span><select id="d-stage">${STAGES.map((s) => `<option value="${s.id}" ${s.id === d.stage ? "selected" : ""}>${s.n}</option>`).join("")}</select></label>
    <label class="field"><span>Заметка</span><textarea id="d-note" rows="3" placeholder="Например: перезвонить после согласования бюджета"></textarea></label>
    <button class="btn" type="button" id="d-save" data-id="${d.id}">Сохранить</button>`;
  drawer.inert = false; drawer.classList.add("is-open"); document.body.style.overflow = "hidden";
  $("#d-stage").focus();
}
function closeDrawer() { drawer.classList.remove("is-open"); drawer.inert = true; document.body.style.overflow = ""; lastFocus?.focus(); }
document.addEventListener("click", (e) => {
  const o = e.target.closest("[data-open]"); if (o) openDeal(o.dataset.open);
  if (e.target.closest("[data-close]")) closeDrawer();
  const s = e.target.closest("#d-save");
  if (s) { const d = deals.find((x) => x.id === Number(s.dataset.id)); const prev = d.stage; d.stage = $("#d-stage").value; setClosed(d); closeDrawer(); route(); $(`[data-open="${d.id}"]`)?.focus(); toast(prev === d.stage ? "Сохранено" : `${d.company}: ${stage(prev).n} → ${stage(d.stage).n}`); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  if (e.key === "Tab" && drawer.classList.contains("is-open")) {
    const f = $$("button, select, textarea", $(".drawer__panel")), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { e.preventDefault(); gSearch.focus(); }
});

// ---------- Pipeline ----------
const board = $("#board");
function renderBoard() {
  board.innerHTML = STAGES.map((s, si) => {
    const all = deals.filter((d) => d.stage === s.id), closed = s.id === "won" || s.id === "lost";
    // closed columns show the most recent deals only, open ones show everything by amount
    const list = closed ? [...all].sort((a, b) => b.created - a.created).slice(0, 8) : [...all].sort((a, b) => b.amount - a.amount);
    return `<section class="col col--${s.id}" data-stage="${s.id}" aria-labelledby="col-${s.id}"><header class="col__head"><h2 id="col-${s.id}">${s.n} <span class="count">${all.length}</span></h2><p class="muted small">${rub(all.reduce((a, d) => a + d.amount, 0))}${closed && all.length > list.length ? ` · показаны последние ${list.length}` : ""}</p></header>
      <ul class="col__list">${list.map((d) => `<li class="deal" draggable="true" data-id="${d.id}"><button type="button" class="row-link" data-open="${d.id}">${esc(d.company)}</button><span class="deal__sum">${rub(d.amount)}</span><span class="deal__foot"><span class="avatar avatar--xs" title="${d.manager}" aria-hidden="true">${d.manager.split(" ").map((x) => x[0]).join("")}</span><span class="muted small">${dShort(d.created)}</span><span class="deal__move"><button type="button" data-move="-1" data-id="${d.id}" ${si === 0 ? "disabled" : ""} aria-label="${esc(d.company)}: на этап «${STAGES[si - 1]?.n ?? ""}»">←</button><button type="button" data-move="1" data-id="${d.id}" ${si === STAGES.length - 1 ? "disabled" : ""} aria-label="${esc(d.company)}: на этап «${STAGES[si + 1]?.n ?? ""}»">→</button></span></span></li>`).join("")}</ul></section>`;
  }).join("");
}
function moveDeal(id, to) {
  const d = deals.find((x) => x.id === Number(id)); if (!d || d.stage === to) return;
  const from = d.stage; d.stage = to; setClosed(d); renderBoard(); toast(`${d.company}: ${stage(from).n} → ${stage(to).n}`);
}
board.addEventListener("click", (e) => {
  const b = e.target.closest("[data-move]"); if (!b) return;
  const d = deals.find((x) => x.id === Number(b.dataset.id)), i = STAGES.findIndex((s) => s.id === d.stage) + Number(b.dataset.move);
  moveDeal(d.id, STAGES[i].id);
  const again = $(`[data-move="${b.dataset.move}"][data-id="${d.id}"]`, board); (again && !again.disabled ? again : $(`.deal[data-id="${d.id}"] .row-link`, board))?.focus();
});
board.addEventListener("dragstart", (e) => { const c = e.target.closest(".deal"); if (!c) return; e.dataTransfer.setData("text/plain", c.dataset.id); e.dataTransfer.effectAllowed = "move"; c.classList.add("is-drag"); });
board.addEventListener("dragend", (e) => { e.target.closest?.(".deal")?.classList.remove("is-drag"); $$(".col.is-over", board).forEach((c) => c.classList.remove("is-over")); });
board.addEventListener("dragover", (e) => { const c = e.target.closest(".col"); if (!c) return; e.preventDefault(); $$(".col.is-over", board).forEach((x) => x !== c && x.classList.remove("is-over")); c.classList.add("is-over"); });
board.addEventListener("drop", (e) => { const c = e.target.closest(".col"); if (!c) return; e.preventDefault(); moveDeal(e.dataTransfer.getData("text/plain"), c.dataset.stage); });

let rz;
window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (!$("#overview").hidden) revenueChart(buckets()); }, 150); });
route();
requestAnimationFrame(() => window.scrollTo(0, 0));
