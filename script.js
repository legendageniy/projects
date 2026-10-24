// RU/EN switch (remembered), copy email, print to PDF.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EN = {
  print: "Download PDF", name: "Andrey Sokolov", role: "Frontend Developer · React, TypeScript", status: "Open to offers · remote or Saint Petersburg",
  aboutT: "About", about: "7 years building interfaces for products with a large audience. I like fast websites and clear code: made a marketplace catalogue 2.4× faster, built a 120-component design system and mentored three juniors to middle level.",
  expT: "Experience", c1: "Polka marketplace", c2: "Koshelyok fintech startup", c3: "Pixel web studio", sk3: "CSS, responsive layout", now: "present", j1p: "Senior Frontend Developer", j1a: "Moved the catalogue to server rendering: LCP 4.1 → 1.7 s, conversion +6%", j1b: "Introduced visual tests, halving release regressions", j1c: "Mentor for three developers, interviewer",
  j2p: "Frontend Developer", j2a: "Created a 120-component design system documented in Storybook", j2b: "Built the web app from scratch: React, TypeScript, React Query", j2c: "Brought forms up to WCAG 2.1 AA",
  j3p: "Junior → Middle Frontend Developer", j3a: "40+ websites for small businesses: layout, animation, CMS integrations",
  projT: "Projects", p1: "CLI that keeps bundle size in check in CI. 900★ on GitHub.", p2: "Accessibility checklist for UI reviews, translated into 4 languages.",
  skillsT: "Skills", sk4: "Performance", sk5: "Testing", eduT: "Education", edu1: "Saint Petersburg State University, Applied Mathematics",
  langT: "Languages", langs: "Russian — native<br>English — B2, daily written and spoken work communication", foot: "Demo résumé template: the person, companies and numbers are fictional.",
};
const RU = {};
$$("[data-i18n]").forEach((el) => (RU[el.dataset.i18n] = el.innerHTML));
function setLang(lang) {
  const dict = lang === "en" ? EN : RU;
  $$("[data-i18n]").forEach((el) => { if (dict[el.dataset.i18n]) el.innerHTML = dict[el.dataset.i18n]; });
  document.documentElement.lang = lang;
  document.title = lang === "en" ? "Andrey Sokolov — Frontend Developer" : "Андрей Соколов — Frontend-разработчик";
  $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  try { localStorage.setItem("cv-lang", lang); } catch {}
}
$$("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
try { const saved = localStorage.getItem("cv-lang"); if (saved === "en") setLang("en"); } catch {}

function toast(text) { const t = $(".toast"); t.textContent = text; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1800); }
$(".copy").addEventListener("click", async (e) => {
  const v = e.currentTarget.dataset.copy;
  try { await navigator.clipboard.writeText(v); toast(document.documentElement.lang === "en" ? "Email copied" : "Email скопирован"); }
  catch { location.href = "mailto:" + v; }
});
$("#print").addEventListener("click", () => print());
