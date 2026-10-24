// Countdown, .ics calendar file, RSVP with conditional fields (answer remembered on this device).
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const START = new Date("2027-06-12T14:30:00+03:00"), END = new Date("2027-06-12T23:30:00+03:00");
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

function tick() {
  let s = Math.max(0, Math.floor((START - Date.now()) / 1000));
  $("#c-d").textContent = Math.floor(s / 86400); s %= 86400;
  $("#c-h").textContent = Math.floor(s / 3600); $("#c-m").textContent = Math.floor((s % 3600) / 60);
}
tick(); setInterval(tick, 30000);

// Calendar file (RFC 5545)
$("#ics").addEventListener("click", () => {
  const f = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wedding-demo//RU", "BEGIN:VEVENT", `UID:anna-maxim-2027@example.com`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(START)}`, `DTEND:${f(END)}`, "SUMMARY:Свадьба Анны и Максима", "LOCATION:Усадьба «Яблоневый сад»\\, деревня Липки", "DESCRIPTION:Сбор гостей в 14:30. Дресс-код: шалфей\\, пудровая роза\\, сливочный.", "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Завтра свадьба!", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([ics], { type: "text/calendar" })), download: "anna-maxim-wedding.ics" });
  document.body.append(a); a.click(); a.remove();
});

// RSVP
const form = $("#rsvp-form"), KEY = "wedding-rsvp";
const yes = () => form.come.value === "yes";
form.addEventListener("change", () => ($(".if-yes").hidden = !yes()));
const describe = (r) => r.come === "yes"
  ? `Спасибо, ${r.name}! Ждём вас${r.plus > 0 ? ` и ещё ${r.plus} ${r.plus == 1 ? "гостя" : "гостей"}` : ""} 12 июня.${r.opts.includes("bus") ? " Место в автобусе за вами." : ""}`
  : `Жаль, ${r.name}, что не получится. Спасибо, что ответили!`;
function showReplied(r) { $("#replied").hidden = false; $("#replied-text").textContent = describe(r); form.hidden = true; }
try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved) showReplied(saved); } catch {}
$("#change").addEventListener("click", () => { $("#replied").hidden = true; form.hidden = false; form.name.focus(); });
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const err = $(".err");
  if (form.name.value.trim().length < 2) { err.textContent = "Напишите, пожалуйста, имя."; form.name.setAttribute("aria-invalid", "true"); return form.name.focus(); }
  form.name.setAttribute("aria-invalid", "false");
  if (!form.come.value) { err.textContent = "Отметьте, сможете ли прийти."; return form.querySelector("[name=come]").focus(); }
  err.textContent = "";
  const r = { name: form.name.value.trim().split(" ")[0], come: form.come.value, plus: Number(form.plus.value), opts: $$("[name=opts]:checked").map((x) => x.value), song: form.song.value.trim() };
  try { localStorage.setItem(KEY, JSON.stringify(r)); } catch {}
  showReplied(r);
  $("#replied").focus?.();
});
