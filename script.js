// Navigation, header shadow, reveal-on-scroll, pricing period toggle and signup validation.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const burger = $(".burger");
const nav = $("#nav");
burger.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") !== "true";
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  nav.classList.toggle("open", open);
});
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));

const header = $(".header");
const onScroll = () => header.classList.toggle("scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Pricing: monthly / yearly
$$(".toggle button").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".toggle button").forEach((b) => { b.classList.toggle("on", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    $$("[data-price-month]").forEach((el) => (el.textContent = el.dataset[btn.dataset.period === "year" ? "priceYear" : "priceMonth"]));
  }),
);

// Signup form
const form = $(".signup");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#email");
  const msg = $(".signup__msg");
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
  input.setAttribute("aria-invalid", String(!ok));
  msg.className = "signup__msg " + (ok ? "ok" : "err");
  msg.textContent = ok ? "Готово! Ссылка для входа отправлена на почту (демо — письмо не уходит)." : "Введите рабочий email, например you@company.ru";
  if (ok) form.reset();
  else input.focus();
});

// Reveal sections as they enter the viewport
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12 });
  $$(".feature, .steps li, .plan, .faq__list details, .orbit li").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}
