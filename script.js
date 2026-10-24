// Menu, active nav link, number counters, case filter, service scroll-spy and the contact form.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const burger = $(".burger"), nav = $("#nav");
burger.addEventListener("click", () => { const open = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(open)); nav.classList.toggle("open", open); });
const here = location.pathname.split("/").pop() || "index.html";
$$(".nav a").forEach((a) => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Count-up numbers when the facts strip appears
const counters = $$("[data-count]");
if (counters.length && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    const end = Number(en.target.dataset.count), t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 1200); en.target.textContent = Math.round(end * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.5 });
  counters.forEach((c) => io.observe(c));
}

// Case filter (tabs)
$$(".tabs [role=tab]").forEach((tab) => tab.addEventListener("click", () => {
  $$(".tabs [role=tab]").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
  $$(".case").forEach((c) => (c.hidden = tab.dataset.filter !== "all" && c.dataset.tag !== tab.dataset.filter));
}));

// Highlight the current service in the side menu
const svcLinks = $$(".svc-nav a");
if (svcLinks.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) svcLinks.forEach((a) => a.classList.toggle("on", a.hash === "#" + en.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
  $$(".svc").forEach((s) => spy.observe(s));
}

// Contact form validation
const form = $("#form");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const checks = {
    name: form.name.value.trim().length >= 2 || "Укажите имя",
    company: form.company.value.trim().length >= 2 || "Укажите компанию",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim()) || "Проверьте email",
    message: form.message.value.trim().length >= 10 || "Опишите задачу хотя бы в паре предложений",
    consent: form.consent.checked || "Нужно согласие на обработку данных",
  };
  let first = null;
  for (const [k, v] of Object.entries(checks)) {
    const bad = v !== true;
    form.elements[k].setAttribute("aria-invalid", String(bad));
    $(`#e-${k}`).textContent = bad ? v : "";
    if (bad && !first) first = form.elements[k];
  }
  if (first) return first.focus();
  form.reset();
  const ok = $(".form__ok"); ok.hidden = false; ok.focus();
});
