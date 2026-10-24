// Blog UI: theme toggle, post list with search/tags, article rendering, TOC, code highlight, copy, progress.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

// Theme: saved choice or system preference
const root = document.documentElement;
const saved = (() => { try { return localStorage.getItem("bait-theme"); } catch { return null; } })();
if (saved) root.dataset.theme = saved;
$("#theme")?.addEventListener("click", () => {
  const dark = (root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) !== "dark";
  root.dataset.theme = dark ? "dark" : "light";
  try { localStorage.setItem("bait-theme", root.dataset.theme); } catch {}
});
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const cover = (p, cls = "cover") => `<div class="${cls}" style="--a:${p.cover[0]};--b:${p.cover[1]}" aria-hidden="true"><span>${esc(p.tags[0])}</span></div>`;
const meta = (p) => `<p class="meta"><span>${esc(p.author)}</span><span>${fmtDate(p.date)}</span><span>${p.minutes} мин</span></p>`;

/* Home: featured post, search, tag filter */
const list = $("#posts");
if (list) {
  const [first, ...rest] = POSTS;
  $("#featured").innerHTML = `<a class="featured" href="post.html?slug=${first.slug}">${cover(first, "cover cover--big")}<div><p class="tags">${first.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</p><h2>${esc(first.title)}</h2><p class="excerpt">${esc(first.excerpt)}</p>${meta(first)}</div></a>`;
  const tags = [...new Set(POSTS.flatMap((p) => p.tags))];
  $("#tags").innerHTML = `<button type="button" aria-pressed="true" data-tag="">Все</button>` + tags.map((t) => `<button type="button" aria-pressed="false" data-tag="${esc(t)}">${esc(t)}</button>`).join("");
  let tag = new URLSearchParams(location.search).get("tag") ?? "";
  const render = () => {
    const q = $("#search").value.trim().toLowerCase();
    const items = (q || tag ? POSTS : rest).filter((p) => (!tag || p.tags.includes(tag)) && (!q || (p.title + p.excerpt + p.tags.join(" ")).toLowerCase().includes(q)));
    $("#featured").hidden = Boolean(q || tag);
    $$("#tags button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tag === tag)));
    list.innerHTML = items.length ? items.map((p) => `<li><a class="post" href="post.html?slug=${p.slug}">${cover(p)}<div><p class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</p><h3>${esc(p.title)}</h3><p class="excerpt">${esc(p.excerpt)}</p>${meta(p)}</div></a></li>`).join("") : `<li class="none">Ничего не найдено по запросу «${esc(q)}».</li>`;
    $("#result").textContent = q || tag ? `Найдено статей: ${items.length}` : "";
  };
  $("#tags").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; tag = b.dataset.tag; history.replaceState(null, "", tag ? `?tag=${encodeURIComponent(tag)}` : location.pathname); render(); });
  $("#search").addEventListener("input", render);
  render();
}

/* Tiny syntax highlighter for the article code samples */
const KW = /\b(const|let|var|function|async|await|return|if|else|for|of|in|new|type|interface|import|export|from|class|extends|true|false|null|undefined|CREATE|INDEX|ON|WHERE|SELECT|FROM|DESC|ASC|AND|OR|git|cd|container-type|display|grid-template-columns|font-size)\b/g;
function highlight(code) {
  const text = code.textContent;
  const tokens = [];
  const re = /(\/\/[^\n]*|#[^\n{]*$|--[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@container|@media)/gm;
  let last = 0, m;
  while ((m = re.exec(text))) {
    tokens.push(esc(text.slice(last, m.index)).replace(KW, '<span class="k">$1</span>'));
    tokens.push(`<span class="${m[1] ? "c" : m[2] ? "s" : "k"}">${esc(m[0])}</span>`);
    last = re.lastIndex;
  }
  tokens.push(esc(text.slice(last)).replace(KW, '<span class="k">$1</span>'));
  code.innerHTML = tokens.join("");
}

/* Article page */
const article = $("#article");
if (article) {
  const slug = new URLSearchParams(location.search).get("slug");
  const i = Math.max(0, POSTS.findIndex((p) => p.slug === slug));
  const p = POSTS[i];
  document.title = `${p.title} — Байт`;
  $('meta[name="description"]').content = p.excerpt;
  $("#a-head").innerHTML = `<p class="tags">${p.tags.map((t) => `<a href="index.html?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join("")}</p><h1>${esc(p.title)}</h1><p class="lead">${esc(p.excerpt)}</p>${meta(p)}`;
  $("#a-cover").innerHTML = cover(p, "cover cover--wide");
  article.innerHTML = p.body;
  $$("pre code", article).forEach((code) => {
    highlight(code);
    const pre = code.parentElement;
    const lang = (code.className.match(/lang-(\w+)/) || [])[1];
    const bar = document.createElement("div");
    bar.className = "code-bar";
    bar.innerHTML = `<span>${lang ?? "code"}</span><button type="button">Копировать</button>`;
    pre.before(bar);
    bar.querySelector("button").addEventListener("click", async (e) => {
      try { await navigator.clipboard.writeText(code.textContent); e.target.textContent = "Скопировано ✓"; }
      catch { e.target.textContent = "Не удалось"; }
      setTimeout(() => (e.target.textContent = "Копировать"), 1600);
    });
  });
  const heads = $$("h2[id]", article);
  $("#toc").innerHTML = heads.map((h) => `<li><a href="#${h.id}">${esc(h.textContent)}</a></li>`).join("");
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) $$("#toc a").forEach((a) => a.classList.toggle("on", a.hash === "#" + x.target.id)); }), { rootMargin: "0px 0px -70% 0px" });
    heads.forEach((h) => spy.observe(h));
  }
  const prev = POSTS[i + 1], next = POSTS[i - 1];
  $("#pager").innerHTML = (prev ? `<a href="post.html?slug=${prev.slug}"><small>← Предыдущая</small>${esc(prev.title)}</a>` : "<span></span>") + (next ? `<a class="next" href="post.html?slug=${next.slug}"><small>Следующая →</small>${esc(next.title)}</a>` : "");
  const bar = $("#progress");
  const onScroll = () => { const r = article.getBoundingClientRect(); const k = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight * 0.6))); bar.style.transform = `scaleX(${k})`; };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

/* Newsletter forms */
$$(".subscribe").forEach((f) => f.addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim());
  f.email.setAttribute("aria-invalid", String(!ok));
  f.querySelector(".sub-msg").textContent = ok ? "Готово! Первое письмо придёт в пятницу (демо — не придёт)." : "Проверьте email";
  if (ok) f.reset();
}));
