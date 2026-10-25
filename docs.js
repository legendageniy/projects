// Docs UI: theme, mobile nav, code tabs with remembered language, copy, highlighting, scrollspy, Ctrl+K search.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

// Theme
const themeBtn = $("#theme");
const dark = () => (document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
themeBtn.setAttribute("aria-pressed", dark());
themeBtn.addEventListener("click", () => { const t = dark() ? "light" : "dark"; document.documentElement.dataset.theme = t; store.set("kvant-docs-theme", t); themeBtn.setAttribute("aria-pressed", t === "dark"); });

// Mobile nav
const nav = $("#nav"), menu = $("#menu");
menu.addEventListener("click", () => { const open = !nav.classList.contains("is-open"); nav.classList.toggle("is-open", open); menu.setAttribute("aria-expanded", open); });

// Syntax highlighting (small, regex-based — enough for short examples)
const KW = { js: "const|let|await|async|import|from|export|function|return|for|try|catch|if|throw|new", python: "import|def|return|from|as", bash: "curl", http: "POST|GET|HTTP", json: "null|true|false", text: "" };
function highlight(src, lang) {
  const kw = KW[lang] ?? "";
  const re = new RegExp([
    lang === "js" ? "(\\/\\/[^\\n]*)" : lang === "python" ? "(#[^\\n]*)" : "(\\b\\B)",
    '("(?:[^"\\\\\\n]|\\\\.)*"(?=\\s*:))',
    '("(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)',
    "(\\b\\d+(?:\\.\\d+)?\\b)",
    kw ? `\\b(${kw})\\b` : "(\\b\\B)",
    lang === "bash" ? "(\\s-[A-Za-z]\\b|\\$[A-Z_]+)" : lang === "http" ? "(^[A-Za-z-]+(?=:))" : "(\\b\\B)",
  ].join("|"), "gm");
  let out = "", last = 0;
  src.replace(re, (m, com, key, str, num, k, flag, off) => {
    out += esc(src.slice(last, off));
    const cls = com ? "c" : key ? (lang === "json" ? "k" : "s") : str ? "s" : num ? "n" : k ? "kw" : "f";
    out += `<span class="t-${cls}">${esc(m)}</span>`;
    last = off + m.length; return m;
  });
  return out + esc(src.slice(last));
}

// Code blocks: tabs + copy
let lang = store.get("kvant-docs-lang") || "bash";
$$(".code").forEach((box, bi) => {
  const pres = $$("pre", box);
  pres.forEach((p) => { const c = $("code", p); c.innerHTML = highlight(c.textContent, p.dataset.lang); });
  const bar = document.createElement("div"); bar.className = "code__bar";
  if (pres.length > 1) {
    bar.innerHTML = `<div role="tablist" aria-label="Язык примера">${pres.map((p, i) => `<button type="button" role="tab" id="tab-${bi}-${i}" aria-controls="pre-${bi}-${i}" data-lang="${p.dataset.lang}">${p.dataset.label}</button>`).join("")}</div>`;
    pres.forEach((p, i) => { p.id = `pre-${bi}-${i}`; p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", `tab-${bi}-${i}`); p.tabIndex = 0; });
  } else bar.innerHTML = `<span class="code__label">${pres[0].dataset.label}</span>`;
  bar.insertAdjacentHTML("beforeend", `<button type="button" class="copy" aria-label="Скопировать код">Копировать</button>`);
  box.prepend(bar);
});
function setLang(l, scope) {
  $$(".code--tabs").forEach((box) => {
    const tabs = $$("[role=tab]", box);
    const target = tabs.find((t) => t.dataset.lang === l) || (scope === box ? null : tabs.find((t) => t.getAttribute("aria-selected") === "true")) || tabs[0];
    if (!target) return;
    tabs.forEach((t, i) => { const on = t === target; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; $(`#${t.getAttribute("aria-controls")}`).hidden = !on; });
  });
}
setLang(lang);
document.addEventListener("click", (e) => {
  const t = e.target.closest(".code [role=tab]");
  if (t) {
    // keep the clicked block in place while other blocks switch language
    const box = t.closest(".code"), before = box.getBoundingClientRect().top;
    lang = t.dataset.lang; store.set("kvant-docs-lang", lang); setLang(lang, box);
    window.scrollBy(0, box.getBoundingClientRect().top - before);
  }
  const c = e.target.closest(".copy");
  if (c) {
    const pre = $$("pre", c.closest(".code")).find((p) => !p.hidden);
    const text = pre.textContent;
    const done = () => { c.textContent = "Скопировано"; c.classList.add("is-done"); setTimeout(() => { c.textContent = "Копировать"; c.classList.remove("is-done"); }, 1600); };
    (navigator.clipboard?.writeText(text) ?? Promise.reject()).then(done, () => { const ta = Object.assign(document.createElement("textarea"), { value: text }); document.body.append(ta); ta.select(); try { document.execCommand("copy"); } catch (er) {} ta.remove(); done(); });
  }
  const fb = e.target.closest("[data-fb]");
  if (fb) fb.parentElement.innerHTML = fb.dataset.fb === "yes" ? "Спасибо! Рады, что помогло." : 'Спасибо за отзыв. Напишите, чего не хватило: <a href="mailto:docs@kvant.example">docs@kvant.example</a>';
});
document.addEventListener("keydown", (e) => {
  const t = e.target.closest?.(".code [role=tab]"); if (!t || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
  const tabs = $$("[role=tab]", t.parentElement), i = tabs.indexOf(t), n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
  e.preventDefault(); n.click(); n.focus();
});

// Heading anchors
$$(".content h2[id]").forEach((h) => h.insertAdjacentHTML("beforeend", ` <a class="anchor" href="#${h.id}" aria-label="Ссылка на раздел «${h.textContent}»">#</a>`));

// Scrollspy
const tocLinks = $$(".toc a");
const heads = tocLinks.map((a) => document.getElementById(a.hash.slice(1)));
function spy() {
  let cur = heads[0];
  heads.forEach((h) => { if (h.getBoundingClientRect().top < 120) cur = h; });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = heads[heads.length - 1];
  tocLinks.forEach((a, i) => (heads[i] === cur ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
}
if (heads.length) { addEventListener("scroll", spy, { passive: true }); spy(); }

// Search
const dlg = $("#search"), q = $("#q"), results = $("#results");
let sel = 0, hits = [];
const norm = (s) => s.toLowerCase().replace(/ё/g, "е");
function search() {
  const words = norm(q.value).split(/\s+/).filter(Boolean);
  hits = words.length ? window.DOCS_INDEX.map((d) => {
    const t = norm(d.t), x = norm(d.x);
    let score = 0; for (const w of words) { if (t.includes(w)) score += 3; else if (x.includes(w)) score += 1; else return null; }
    return { d, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8).map((h) => h.d) : window.DOCS_INDEX.filter((d) => !d.p).slice(0, 6);
  sel = 0; draw(words);
}
function mark(text, words) {
  let out = esc(text);
  words.forEach((w) => { if (w.length > 1) out = out.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/е/g, "[её]")})`, "gi"), "<mark>$1</mark>"); });
  return out;
}
function draw(words = []) {
  results.innerHTML = hits.length ? hits.map((d, i) => {
    const pos = words.length ? norm(d.x).indexOf(words[0]) : -1;
    const snip = pos > 60 ? "…" + d.x.slice(pos - 40, pos + 120) : d.x.slice(0, 150);
    return `<li role="option" id="r-${i}" aria-selected="${i === sel}"><a href="${d.u}" tabindex="-1"><small>${d.g}${d.p ? " › " + d.p : ""}</small><b>${mark(d.t, words)}</b><span>${mark(snip, words)}…</span></a></li>`;
  }).join("") : `<li class="none">Ничего не нашлось. Попробуйте «платёж», «вебхук» или «ключ».</li>`;
  q.setAttribute("aria-activedescendant", hits.length ? `r-${sel}` : "");
}
function openSearch() { dlg.showModal(); q.value = ""; search(); q.focus(); }
$("#open-search").addEventListener("click", openSearch);
document.addEventListener("keydown", (e) => {
  if ((e.key === "k" || e.key === "K" || e.key === "л") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); dlg.open ? dlg.close() : openSearch(); }
  else if (e.key === "/" && !dlg.open && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});
q.addEventListener("input", search);
q.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!hits.length) return; sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; $$("[role=option]", results).forEach((o, i) => o.setAttribute("aria-selected", i === sel)); q.setAttribute("aria-activedescendant", `r-${sel}`); $(`#r-${sel}`).scrollIntoView({ block: "nearest" }); }
  if (e.key === "Enter" && hits[sel]) { e.preventDefault(); go(hits[sel].u); }
});
function go(u) { dlg.close(); location.href = u; }
results.addEventListener("click", (e) => { const a = e.target.closest("a"); if (a) { e.preventDefault(); go(a.getAttribute("href")); } });
results.addEventListener("pointermove", (e) => { const o = e.target.closest("[role=option]"); if (!o) return; sel = Number(o.id.slice(2)); $$("[role=option]", results).forEach((x) => x.setAttribute("aria-selected", x === o)); });
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); dlg.close(); } });
