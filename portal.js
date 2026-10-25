// Shared logic for the news portal: rubric nav, generative covers, home, category feed and article pages.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
const NOW = new Date();
NEWS.forEach((a) => { a.date = new Date(NOW.getTime() - a.h * 36e5); a.minutes = Math.max(2, Math.round(a.body.join(" ").split(/\s+/).length / 120) + 1); });
const params = new URLSearchParams(location.search);
$$("[data-current-year]").forEach((el) => (el.textContent = NOW.getFullYear()));
$("#today").textContent = NOW.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

const page = $("main").dataset.page, curCat = params.get("c");
$("#rubrics").innerHTML = `<a href="index.html" ${page === "home" ? 'aria-current="page"' : ""}>Главное</a>` + Object.entries(CATS).map(([k, v]) => `<a href="category.html?c=${k}" style="--c:${v.c}" ${curCat === k ? 'aria-current="page"' : ""}>${v.n}</a>`).join("");

function when(d) {
  const h = Math.floor((NOW - d) / 36e5);
  if (h < 1) return "только что";
  if (h < 24) return `${h} ч назад`;
  const y = new Date(NOW); y.setDate(y.getDate() - 1);
  const t = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === y.toDateString() ? `вчера, ${t}` : `${d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, ${t}`;
}
const views = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(".", ",") + " тыс." : n);

// Generative covers: one SVG motif per rubric, varied by article id
function cover(a, ratio = "16 / 9") {
  const c = CATS[a.cat].c, s = a.id * 9301 + 49297, r = (k) => ((s * (k + 1) * 233280) % 1000) / 1000;
  const motif = {
    city: () => Array.from({ length: 9 }, (_, i) => { const w = 60 + r(i) * 50, h = 120 + r(i + 9) * 200; const x = i * 75 - 20; return `<rect x="${x}" y="${450 - h}" width="${w}" height="${h}" fill="#fff" opacity="${0.12 + r(i + 3) * 0.2}"/>` + Array.from({ length: Math.floor(h / 40) }, (_, j) => `<rect x="${x + 12}" y="${450 - h + 16 + j * 40}" width="${w - 24}" height="10" fill="#fff" opacity=".25"/>`).join(""); }).join("") + `<circle cx="${560 + r(1) * 100}" cy="${90 + r(2) * 40}" r="40" fill="#ffe8a3" opacity=".9"/>`,
    transport: () => `<path d="M-20 ${300 + r(1) * 60} C200 ${200 + r(2) * 60} 400 ${380 - r(3) * 60} 820 ${260 + r(4) * 40}" stroke="#fff" stroke-width="18" fill="none" opacity=".35"/><path d="M-20 ${330 + r(1) * 60} C200 ${230 + r(2) * 60} 400 ${410 - r(3) * 60} 820 ${290 + r(4) * 40}" stroke="#fff" stroke-width="6" fill="none" opacity=".6" stroke-dasharray="30 20"/>` + Array.from({ length: 5 }, (_, i) => `<circle cx="${80 + i * 150}" cy="${120 + r(i) * 100}" r="${10 + r(i + 5) * 16}" fill="#fff" opacity=".5"/>`).join(""),
    culture: () => Array.from({ length: 5 }, (_, i) => `<path d="M${40 + i * 150} 450 V${230 + r(i) * 60} a60 60 0 0 1 120 0 V450" fill="#fff" opacity="${0.15 + r(i + 2) * 0.25}"/>`).join("") + `<circle cx="${400}" cy="${110}" r="${50 + r(3) * 20}" fill="none" stroke="#fff" stroke-width="10" opacity=".5"/>`,
    sport: () => Array.from({ length: 6 }, (_, i) => `<ellipse cx="400" cy="${520}" rx="${420 - i * 50}" ry="${330 - i * 45}" fill="none" stroke="#fff" stroke-width="10" opacity="${0.15 + i * 0.07}"/>`).join("") + `<circle cx="${200 + r(1) * 400}" cy="${120 + r(2) * 60}" r="26" fill="#fff" opacity=".85"/>`,
    tech: () => Array.from({ length: 11 }, (_, i) => Array.from({ length: 6 }, (_, j) => `<circle cx="${40 + i * 72}" cy="${50 + j * 72}" r="${3 + (r(i * 7 + j) > 0.7 ? 6 : 0)}" fill="#fff" opacity="${r(i + j) > 0.5 ? 0.7 : 0.3}"/>`).join("")).join("") + `<path d="M40 ${194 + Math.round(r(1) * 2) * 72} H${328} V${338} H${616} V${122} H760" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>`,
    food: () => Array.from({ length: 7 }, (_, i) => `<circle cx="${80 + r(i) * 640}" cy="${60 + r(i + 7) * 330}" r="${30 + r(i + 3) * 60}" fill="#fff" opacity="${0.12 + r(i + 1) * 0.3}"/>`).join("") + `<path d="M330 300 q70 -120 140 0 z" fill="#fff" opacity=".6"/>`,
  }[a.cat]();
  return `<svg class="cover" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" style="aspect-ratio:${ratio}" aria-hidden="true"><defs><linearGradient id="g${a.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#111"/></linearGradient></defs><rect width="800" height="450" fill="url(#g${a.id})"/>${motif}</svg>`;
}
const tag = (a) => `<a class="tag" href="category.html?c=${a.cat}" style="--c:${CATS[a.cat].c}">${CATS[a.cat].n}</a>`;
const meta = (a) => `<p class="meta"><time datetime="${a.date.toISOString()}">${when(a.date)}</time> · ${a.minutes} мин чтения</p>`;
const card = (a, cls = "") => `<article class="card ${cls}"><a class="card__img" href="article.html?id=${a.id}" tabindex="-1" aria-hidden="true">${cover(a)}</a>${tag(a)}<h3><a href="article.html?id=${a.id}">${esc(a.title)}</a></h3>${cls.includes("card--lead") ? `<p class="card__lead">${esc(a.lead)}</p>` : ""}${meta(a)}</article>`;
const byDate = [...NEWS].sort((a, b) => a.h - b.h);

if (page === "home") {
  const lead = NEWS.find((a) => a.top) || byDate[0];
  $("#lead").innerHTML = card(lead, "card--lead");
  $("#latest").innerHTML = `<h2 class="section-title">Последние</h2>` + byDate.filter((a) => a !== lead).slice(0, 4).map((a) => `<article class="mini">${tag(a)}<h3><a href="article.html?id=${a.id}">${esc(a.title)}</a></h3>${meta(a)}</article>`).join("");
  $("#ticker").innerHTML = (byDate.slice(0, 6).map((a) => `<li><time>${a.date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</time> <a href="article.html?id=${a.id}">${esc(a.title)}</a></li>`).join("")).repeat(2);
  $$("#ticker li").slice(6).forEach((li) => { li.setAttribute("aria-hidden", "true"); li.querySelector("a").tabIndex = -1; });
  $("#popular").innerHTML = [...NEWS].sort((a, b) => b.views - a.views).slice(0, 5).map((a) => `<li><a href="article.html?id=${a.id}">${esc(a.title)}</a><span class="meta">${views(a.views)} просмотров</span></li>`).join("");
  $("#sections").innerHTML = Object.entries(CATS).map(([k, v]) => {
    const list = byDate.filter((a) => a.cat === k && a !== lead).slice(0, 3);
    return list.length ? `<section class="rubric" style="--c:${v.c}" aria-labelledby="r-${k}"><header class="rubric__head"><h2 id="r-${k}" class="section-title">${v.n}</h2><a href="category.html?c=${k}">Все материалы →</a></header><div class="grid3">${list.map((a) => card(a)).join("")}</div></section>` : "";
  }).join("");
  const nl = $("#nl");
  nl.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nl.querySelector("input").value.trim());
    nl.querySelector("input").setAttribute("aria-invalid", !ok);
    $(".nl__msg").textContent = ok ? "Готово! Первое письмо придёт сегодня вечером (это демо — адрес никуда не отправлен)." : "Проверьте адрес почты.";
  });
}

if (page === "category") {
  const cat = CATS[curCat];
  if (cat) { $("#cat-title").textContent = cat.n; $("#cat-kicker").textContent = "Рубрика"; document.title = `${cat.n} — Пятая линия`; document.documentElement.style.setProperty("--c", cat.c); }
  else { $("#cat-kicker").textContent = "Все рубрики"; document.title = "Все материалы — Пятая линия"; }
  let sort = "new", shown = 6;
  const feed = $("#feed"), more = $("#more");
  const list = () => NEWS.filter((a) => !cat || a.cat === curCat).sort((a, b) => (sort === "new" ? a.h - b.h : b.views - a.views));
  function draw(focusFrom) {
    const l = list();
    feed.innerHTML = l.slice(0, shown).map((a) => `<article class="row"><a class="row__img" href="article.html?id=${a.id}" tabindex="-1" aria-hidden="true">${cover(a)}</a><div>${tag(a)}<h2><a href="article.html?id=${a.id}">${esc(a.title)}</a></h2><p>${esc(a.lead)}</p><p class="meta">${esc(a.author)} · <time datetime="${a.date.toISOString()}">${when(a.date)}</time> · ${views(a.views)} просмотров</p></div></article>`).join("");
    more.hidden = shown >= l.length;
    if (focusFrom != null) $$(".row h2 a", feed)[focusFrom]?.focus();
  }
  $(".sort").addEventListener("click", (e) => { const b = e.target.closest("[data-sort]"); if (!b) return; sort = b.dataset.sort; $$(".sort button").forEach((x) => x.setAttribute("aria-pressed", x === b)); shown = 6; draw(); });
  more.addEventListener("click", () => { const from = shown; shown += 6; draw(from); });
  draw();
}

if (page === "article") {
  const a = NEWS.find((x) => x.id === Number(params.get("id")));
  const box = $("#article");
  if (!a) {
    box.innerHTML = `<div class="notfound"><h1>Материал не найден</h1><p>Возможно, ссылка устарела. <a href="index.html">Вернуться на главную</a></p></div>`;
    $(".related").hidden = true;
  } else {
    document.title = `${a.title} — Пятая линия`;
    document.documentElement.style.setProperty("--c", CATS[a.cat].c);
    const idx = byDate.indexOf(a), next = byDate[idx + 1] || byDate[0];
    box.innerHTML = `<header class="article__head">${tag(a)}<h1>${esc(a.title)}</h1><p class="article__lead">${esc(a.lead)}</p>
      <div class="article__bar"><p class="meta"><b>${esc(a.author)}</b> · <time datetime="${a.date.toISOString()}">${when(a.date)}</time> · ${a.minutes} мин чтения · ${views(a.views)} просмотров</p>
      <div class="tools"><div role="group" aria-label="Размер текста"><button type="button" data-size="-1" aria-label="Уменьшить текст">A−</button><button type="button" data-size="1" aria-label="Увеличить текст">A+</button></div><button type="button" id="share">Скопировать ссылку</button></div></div></header>
      <figure class="article__cover">${cover(a, "16 / 8")}<figcaption>Иллюстрация: редакция «Пятой линии»</figcaption></figure>
      <div class="article__body" id="body">${a.body.map((p) => (p.startsWith("Q:") ? `<blockquote><p>${esc(p.slice(2))}</p></blockquote>` : `<p>${esc(p)}</p>`)).join("")}</div>
      <a class="next" href="article.html?id=${next.id}"><small>Следующий материал</small>${esc(next.title)} →</a>`;
    $("#related").innerHTML = NEWS.filter((x) => x.cat === a.cat && x !== a).concat(byDate.filter((x) => x.cat !== a.cat)).slice(0, 3).map((x) => card(x)).join("");
    let size = Number(store.get("pl-size") || 0);
    const applySize = () => { $("#body").style.fontSize = `${1.15 + size * 0.1}rem`; $('[data-size="-1"]').disabled = size <= -2; $('[data-size="1"]').disabled = size >= 3; };
    applySize();
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-size]");
      if (b) { size = Math.max(-2, Math.min(3, size + Number(b.dataset.size))); store.set("pl-size", size); applySize(); }
      if (e.target.closest("#share")) {
        const btn = $("#share"), done = () => { btn.textContent = "Ссылка скопирована ✓"; setTimeout(() => (btn.textContent = "Скопировать ссылку"), 1800); };
        (navigator.clipboard?.writeText(location.href) ?? Promise.reject()).then(done, () => { btn.textContent = "Скопируйте адрес из строки браузера"; });
      }
    });
    const bar = $("#progress");
    const onScroll = () => { const r = $("#body").getBoundingClientRect(), total = r.height - innerHeight * 0.5; bar.style.width = Math.max(0, Math.min(100, ((-r.top + innerHeight * 0.3) / Math.max(1, total)) * 100)) + "%"; };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
}
