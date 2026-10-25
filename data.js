// Deterministic demo data: daily revenue for 180 days and a list of deals.
(function () {
  let seed = 20261025;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = (n) => new Date(today.getTime() - n * 864e5);

  const daily = [];
  for (let i = 179; i >= 0; i--) {
    const d = day(i), wd = d.getDay();
    const trend = 1 + (179 - i) / 400, weekend = wd === 0 || wd === 6 ? 0.35 : 1;
    const value = Math.round((150000 + rnd() * 120000) * trend * weekend / 1000) * 1000;
    daily.push({ date: d, value, plan: Math.round(190000 * trend * weekend / 1000) * 1000 });
  }

  const STAGES = [
    { id: "new", n: "Новая", p: 10 }, { id: "qual", n: "Квалификация", p: 25 }, { id: "offer", n: "КП отправлено", p: 50 },
    { id: "talks", n: "Переговоры", p: 75 }, { id: "won", n: "Выиграна", p: 100 }, { id: "lost", n: "Проиграна", p: 0 },
  ];
  const MANAGERS = ["Анна Ростова", "Игорь Белов", "Мария Ким", "Денис Орлов", "Ольга Садыкова"];
  const SOURCES = ["Сайт", "Рекомендация", "Реклама", "Выставка", "Холодный звонок"];
  const KIND = ["Кофейня", "Студия", "Пекарня", "Автосервис", "Клиника", "Типография", "Фитнес-клуб", "Салон", "Школа", "Бюро", "Мастерская", "Агентство"];
  const NAME = ["Зерно", "Квадрат", "Север", "Маяк", "Орбита", "Палитра", "Гранит", "Луч", "Вектор", "Атлас", "Бриз", "Кедр", "Слон", "Ромашка", "Пиксель", "Ось"];
  const FIRST = ["Алексей", "Елена", "Сергей", "Наталья", "Павел", "Юлия", "Артём", "Светлана", "Михаил", "Ксения"];
  const FIRST_F = ["Елена", "Наталья", "Юлия", "Светлана", "Ксения"];
  const LAST = ["Иванов", "Смирнов", "Кузнецов", "Попов", "Соколов", "Лебедев", "Новиков", "Морозов", "Волков", "Зайцев"];
  const used = new Set(), deals = [];
  for (let i = 0; i < 150; i++) {
    let company; do { company = `${pick(KIND)} «${pick(NAME)}»`; } while (used.has(company)); used.add(company);
    // older deals are mostly closed, fresh ones are still moving through the pipeline
    const age = Math.floor(rnd() * 178), r = rnd();
    const stage = age > 45 ? (r < 0.62 ? "won" : r < 0.94 ? "lost" : "talks")
      : r < 0.2 ? "new" : r < 0.38 ? "qual" : r < 0.56 ? "offer" : r < 0.72 ? "talks" : r < 0.88 ? "won" : "lost";
    const first = pick(FIRST), last = pick(LAST);
    deals.push({
      id: 1000 + i, company, stage,
      contact: `${first} ${FIRST_F.includes(first) ? last + "а" : last}`,
      manager: pick(MANAGERS), source: pick(SOURCES),
      amount: Math.round((40000 + rnd() * rnd() * 900000) / 1000) * 1000,
      created: day(age),
      // close date for won/lost deals: a few days to six weeks after creation, never in the future
      closed: stage === "won" || stage === "lost" ? day(Math.max(0, age - 3 - Math.floor(rnd() * Math.min(40, age)))) : null,
    });
  }
  window.PULSE = { daily, deals, STAGES, MANAGERS, SOURCES, today };
})();
