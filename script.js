// Aurora background, tour dates with past/upcoming state, albums with Web Audio snippets and a live visualizer.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Aurora: a few drifting translucent ribbons
const aur = $("#aurora"), ac = aur.getContext("2d");
function drawAurora(t) {
  const w = (aur.width = aur.clientWidth), h = (aur.height = aur.clientHeight);
  ac.clearRect(0, 0, w, h);
  [["rgba(64, 255, 196, .22)", 0.0], ["rgba(120, 140, 255, .18)", 1.7], ["rgba(190, 110, 255, .12)", 3.1]].forEach(([c, ph]) => {
    ac.beginPath();
    for (let x = 0; x <= w; x += 12) { const y = h * 0.35 + Math.sin(x / 210 + t / 3000 + ph) * 60 + Math.sin(x / 90 + t / 1700) * 18; x ? ac.lineTo(x, y) : ac.moveTo(x, y); }
    ac.lineWidth = 90; ac.strokeStyle = c; ac.filter = "blur(30px)"; ac.stroke();
  });
  ac.filter = "none";
  if (!reduce) requestAnimationFrame(drawAurora);
}
requestAnimationFrame(drawAurora);

// Tour
const SHOWS = [
  ["2026-09-12", "Архангельск", "Клуб «Бункер»", "past"], ["2026-10-03", "Санкт-Петербург", "Морзе", "past"],
  ["2026-11-14", "Москва", "Мутабор", "sold"], ["2026-11-15", "Москва", "Мутабор (доп.)", "few"], ["2026-11-21", "Нижний Новгород", "Мелодия", "ok"],
  ["2026-11-28", "Казань", "Сквот", "ok"], ["2026-12-05", "Екатеринбург", "Ельцин Центр", "few"], ["2026-12-06", "Пермь", "Дягилев", "ok"],
  ["2026-12-12", "Новосибирск", "Подземка", "ok"], ["2026-12-19", "Самара", "Звезда", "ok"], ["2027-02-14", "Мурманск", "Дом культуры", "ok"], ["2027-03-01", "Калининград", "Янтарь-холл", "ok"],
];
const today = new Date().toISOString().slice(0, 10);
$("#city").innerHTML = `<option value="">Все</option>` + [...new Set(SHOWS.map((s) => s[1]))].map((c) => `<option>${c}</option>`).join("");
function renderTour() {
  const city = $("#city").value, past = $("#show-past").checked;
  const list = SHOWS.filter(([d, c]) => (!city || c === city) && (past || d >= today));
  $("#dates").innerHTML = list.map(([d, c, venue, st]) => {
    const isPast = d < today, date = new Date(d + "T12:00");
    const btn = isPast ? `<span class="st st--past">Прошёл</span>` : st === "sold" ? `<span class="st st--sold">Sold out</span>` : `<a class="btn btn--sm" href="#tour">${st === "few" ? "Последние билеты" : "Билеты"}</a>`;
    return `<li class="${isPast ? "is-past" : ""}"><time datetime="${d}"><b>${date.getDate()}</b>${date.toLocaleDateString("ru-RU", { month: "short" })}</time><div><h3>${c}</h3><span>${venue} · ${date.toLocaleDateString("ru-RU", { weekday: "long" })}</span></div>${btn}</li>`;
  }).join("") || `<li class="none">Концертов не найдено. Отметьте «Прошедшие» или выберите другой город.</li>`;
}
$("#city").addEventListener("change", renderTour); $("#show-past").addEventListener("change", renderTour); renderTour();

// Albums with generative covers
const ALBUMS = [
  { t: "Полярный день", y: 2026, c: ["#0b1a2a", "#40ffc4", "#7d8cff"], tracks: [["Белое море", 62, [0, 4, 7, 12]], ["Маяк", 57, [0, 3, 7, 10]], ["Полярный день", 64, [0, 5, 9, 12]]] },
  { t: "Дорога на Север", y: 2022, c: ["#2a1a12", "#ff9a5c", "#ffd29a"], tracks: [["Трасса М8", 55, [0, 4, 7, 11]], ["Попутчик", 60, [0, 3, 8, 10]]] },
  { t: "Солёный ветер", y: 2019, c: ["#1a1030", "#c06cff", "#6cc6ff"], tracks: [["Солёный ветер", 58, [0, 4, 9, 12]], ["Баренцево", 53, [0, 5, 7, 10]]] },
];
const cover = ({ c: [bg, a, b] }, i) => `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="${bg}"/>${Array.from({ length: 7 }, (_, k) => `<path d="M0 ${60 + k * 18} Q100 ${30 + k * 18 + i * 10} 200 ${70 + k * 18}" stroke="${k % 2 ? a : b}" stroke-width="${3 + (k % 3)}" fill="none" opacity="${0.35 + k * 0.08}"/>`).join("")}<circle cx="${140 - i * 30}" cy="50" r="18" fill="${a}" opacity=".9"/></svg>`;
$("#albums").innerHTML = ALBUMS.map((al, i) => `<article class="album"><div class="album__cover">${cover(al, i)}</div><div><h3>${al.t}</h3><p class="muted">${al.y} · фрагменты: ${al.tracks.length}</p><ol class="tracks">${al.tracks.map(([n], k) => `<li><button type="button" class="tbtn" data-a="${i}" data-t="${k}" aria-pressed="false" aria-label="Слушать фрагмент: ${n}">▶</button><span>${n}</span><small>0:12</small></li>`).join("")}</ol></div></article>`).join("");

// Web Audio snippet: arpeggio over a pad, routed through an analyser for the visualizer
let ctx, analyser, stopAt = 0, playing = null, nodes = [];
const viz = $("#viz"), vc = viz.getContext("2d");
function stop() { nodes.forEach((n) => { try { n.stop(); } catch {} }); nodes = []; playing = null; $$(".tbtn").forEach((b) => { b.setAttribute("aria-pressed", "false"); b.textContent = "▶"; }); $("#now").textContent = "Ничего не играет"; }
function play(ai, ti) {
  const key = `${ai}-${ti}`;
  if (playing === key) return stop();
  stop();
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  analyser ??= Object.assign(ctx.createAnalyser(), { fftSize: 256 });
  const out = ctx.createGain(); out.gain.value = 0.18; out.connect(analyser); analyser.connect(ctx.destination);
  const [name, root, steps] = ALBUMS[ai].tracks[ti];
  const hz = (m) => 440 * 2 ** ((m - 69) / 12), t0 = ctx.currentTime + 0.05, dur = 12;
  // pad
  steps.slice(0, 3).forEach((s) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.value = hz(root + s - 12); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.35, t0 + 1.5); g.gain.setValueAtTime(0.35, t0 + dur - 1.5); g.gain.linearRampToValueAtTime(0, t0 + dur); o.connect(g).connect(out); o.start(t0); o.stop(t0 + dur); nodes.push(o); });
  // arpeggio
  for (let i = 0; i < dur * 4 - 2; i++) { const o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + i * 0.25; o.type = "sine"; o.frequency.value = hz(root + steps[i % 4] + (i % 16 >= 8 ? 12 : 0)); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.24); o.connect(g).connect(out); o.start(t); o.stop(t + 0.25); nodes.push(o); }
  stopAt = t0 + dur; playing = key;
  const b = $(`.tbtn[data-a="${ai}"][data-t="${ti}"]`); b.setAttribute("aria-pressed", "true"); b.textContent = "❚❚";
  $("#now").textContent = `Играет: «${name}» — альбом «${ALBUMS[ai].t}»`;
  draw();
}
function draw() {
  const w = viz.width, h = viz.height; vc.clearRect(0, 0, w, h);
  if (!playing) return;
  if (ctx.currentTime > stopAt) return stop(), vc.clearRect(0, 0, w, h);
  const data = new Uint8Array(analyser.frequencyBinCount); analyser.getByteFrequencyData(data);
  const n = 64, bw = w / n;
  for (let i = 0; i < n; i++) { const v = data[i * 2] / 255, bh = Math.max(3, v * h); const g = vc.createLinearGradient(0, h, 0, h - bh); g.addColorStop(0, "#40ffc4"); g.addColorStop(1, "#7d8cff"); vc.fillStyle = g; vc.fillRect(i * bw + 2, h - bh, bw - 4, bh); }
  requestAnimationFrame(draw);
}
$("#albums").addEventListener("click", (e) => { const b = e.target.closest(".tbtn"); if (b) play(Number(b.dataset.a), Number(b.dataset.t)); });

$("#news").addEventListener("submit", (e) => { e.preventDefault(); const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("#n-email").value.trim()); $("#n-email").setAttribute("aria-invalid", String(!ok)); $(".n-msg").textContent = ok ? "Готово! Напишем, когда откроется продажа (демо)." : "Проверьте email."; });
