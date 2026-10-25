// Episodes list with search and topics; a real <audio> player fed by a WAV synthesized in the browser.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
$$("[data-current-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

const EPS = [
  { n: 48, t: "Почему мы откладываем звонок маме", topic: "Семья", date: "2026-10-21", min: 42, seed: 1 },
  { n: 47, t: "Сколько стоит ремонт кухни на самом деле", topic: "Деньги", date: "2026-10-14", min: 51, seed: 2 },
  { n: 46, t: "Привычки, которые не прижились", topic: "Привычки", date: "2026-10-07", min: 38, seed: 3 },
  { n: 45, t: "Суп на неделю: спор о заготовках", topic: "Еда", date: "2026-09-30", min: 44, seed: 4 },
  { n: 44, t: "Как договориться, кто моет посуду", topic: "Семья", date: "2026-09-23", min: 36, seed: 5 },
  { n: 43, t: "Финансовая подушка: с чего начать", topic: "Деньги", date: "2026-09-16", min: 47, seed: 6 },
  { n: 42, t: "Утро без телефона: эксперимент на 30 дней", topic: "Привычки", date: "2026-09-09", min: 40, seed: 7 },
  { n: 41, t: "Хлеб дома: стоит ли заводить закваску", topic: "Еда", date: "2026-09-02", min: 33, seed: 8 },
];
const fmtDate = (d) => new Date(d + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// --- Synthesized demo audio (soft chords), encoded as 16-bit PCM WAV ---
const cache = new Map();
function synth(seed) {
  if (cache.has(seed)) return cache.get(seed);
  const rate = 22050, secs = 75, len = rate * secs, data = new Float32Array(len);
  const base = [196, 220, 174.6, 246.9][seed % 4];
  const chords = [[1, 1.25, 1.5], [0.89, 1.12, 1.33], [1.12, 1.4, 1.68], [0.84, 1.06, 1.26]];
  for (let i = 0; i < len; i++) {
    const t = i / rate, bar = Math.floor(t / 4) % 4, local = t % 4;
    const env = Math.min(1, local * 2) * Math.max(0, 1 - local / 4.2);
    let v = 0;
    for (const k of chords[bar]) v += Math.sin(2 * Math.PI * base * k * t) * 0.18 + Math.sin(2 * Math.PI * base * k * 2 * t) * 0.04;
    const pluck = t % 1 < 0.6 ? Math.sin(2 * Math.PI * base * 4 * chords[bar][Math.floor(t) % 3] * t) * Math.exp(-(t % 1) * 7) * 0.12 : 0;
    data[i] = (v * env + pluck) * 0.7 * Math.min(1, t / 2, (secs - t) / 2);
  }
  const buf = new ArrayBuffer(44 + len * 2), dv = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); dv.setUint32(4, 36 + len * 2, true); w(8, "WAVEfmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, rate, true); dv.setUint32(28, rate * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, "data"); dv.setUint32(40, len * 2, true);
  for (let i = 0; i < len; i++) dv.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 32767, true);
  const url = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  cache.set(seed, url);
  return url;
}

const audio = $("#audio");
let current = null;
function playEp(ep) {
  if (current?.n === ep.n) { audio.paused ? audio.play() : audio.pause(); return; }
  current = ep;
  audio.src = synth(ep.seed);
  audio.playbackRate = Number($("#speed").textContent.replace("×", "")) || 1;
  audio.play().catch(() => {});
  $("#mini").hidden = false;
  $("#mini-title").textContent = `#${ep.n} · ${ep.t}`;
  sync();
}
function sync() {
  $$("[data-play]").forEach((b) => {
    const on = current && Number(b.dataset.play) === current.n && !audio.paused;
    b.setAttribute("aria-pressed", String(Boolean(on)));
    b.querySelector("span").textContent = on ? "❚❚" : "▶";
    b.setAttribute("aria-label", `${on ? "Пауза" : "Слушать"}: выпуск ${b.dataset.play}`);
  });
  $("#mini-play").textContent = audio.paused ? "▶" : "❚❚";
  $("#mini-play").setAttribute("aria-label", audio.paused ? "Продолжить" : "Пауза");
}
audio.addEventListener("play", sync); audio.addEventListener("pause", sync); audio.addEventListener("ended", sync);
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  $("#mini-seek").value = (audio.currentTime / audio.duration) * 100;
  $("#mini-time").textContent = `${mmss(audio.currentTime)} / ${mmss(audio.duration)}`;
});
$("#mini-seek").addEventListener("input", (e) => { if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration; });
$("#mini-play").addEventListener("click", () => (audio.paused ? audio.play() : audio.pause()));
$("#back15").addEventListener("click", () => (audio.currentTime = Math.max(0, audio.currentTime - 15)));
$("#fwd15").addEventListener("click", () => (audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15)));
$("#speed").addEventListener("click", (e) => { const s = { "1×": 1.5, "1.5×": 2, "2×": 1 }[e.target.textContent]; audio.playbackRate = s; e.target.textContent = `${s}×`; });
document.addEventListener("click", (e) => { const b = e.target.closest("[data-play]"); if (b) playEp(EPS.find((x) => x.n === Number(b.dataset.play))); });

// Latest + list
const latest = EPS[0];
$("#latest").innerHTML = `<button type="button" class="play" data-play="${latest.n}" aria-pressed="false" aria-label="Слушать: выпуск ${latest.n}"><span>▶</span></button><div><small>Выпуск #${latest.n} · ${fmtDate(latest.date)} · ${latest.min} мин</small><b>${latest.t}</b></div>`;
const topics = ["Все", ...new Set(EPS.map((e) => e.topic))];
let topic = "Все";
$("#topics").innerHTML = topics.map((t) => `<button type="button" aria-pressed="${t === "Все"}" data-topic="${t}">${t}</button>`).join("");
function renderList() {
  const q = $("#q").value.trim().toLowerCase();
  const list = EPS.filter((e) => (topic === "Все" || e.topic === topic) && (!q || (e.t + e.topic).toLowerCase().includes(q)));
  $("#eps").innerHTML = list.map((e) => `<li class="ep"><button type="button" class="play play--sm" data-play="${e.n}" aria-pressed="false" aria-label="Слушать: выпуск ${e.n}"><span>▶</span></button><div class="ep__body"><small>#${e.n} · ${e.topic}</small><h3>${e.t}</h3></div><span class="ep__meta">${fmtDate(e.date)}<br>${e.min} мин</span></li>`).join("") || `<li class="none">Ничего не нашли. Попробуйте другое слово.</li>`;
  $$("#topics button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.topic === topic)));
  sync();
}
$("#topics").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { topic = b.dataset.topic; renderList(); } });
$("#q").addEventListener("input", renderList);
renderList();

$("#mail").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("#m-email").value.trim());
  $("#m-email").setAttribute("aria-invalid", String(!ok));
  $(".m-msg").textContent = ok ? "Готово! Новые выпуски будут приходить по средам (демо — не будут)." : "Проверьте email.";
});
