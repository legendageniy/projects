// Articles of the demo blog. `body` is trusted static HTML written by the author.
const POSTS = [
  {
    slug: "css-container-queries",
    title: "Container queries на практике: карточка, которая знает своё место",
    excerpt: "Медиазапросы смотрят на окно, а компоненту важен его контейнер. Разбираем, как перевести карточку товара на @container и не сломать старые браузеры.",
    tags: ["CSS", "Вёрстка"], date: "2026-10-14", minutes: 7, author: "Марина Котова", cover: ["#ff5a36", "#ffb199"],
    body: `
<p>Типичная история: карточка товара прекрасно выглядит в сетке на три колонки, но стоит положить её в узкий сайдбар — и картинка с текстом начинают драться за место. Медиазапросы тут бессильны: окно широкое, а места у карточки мало.</p>
<h2 id="idea">Идея</h2>
<p>Container queries позволяют компоненту реагировать на размер родителя. Для этого родитель объявляется контейнером, а внутри мы пишем условия как в медиазапросах.</p>
<pre><code class="lang-css">.card-slot { container-type: inline-size; }

@container (min-width: 420px) {
  .card { display: grid; grid-template-columns: 160px 1fr; }
}</code></pre>
<h2 id="units">Единицы контейнера</h2>
<p>Вместе с запросами появились единицы <code>cqi</code> и <code>cqb</code> — проценты от размеров контейнера. Ими удобно масштабировать заголовок, не привязываясь к ширине окна.</p>
<pre><code class="lang-css">.card h3 { font-size: clamp(1rem, 4cqi, 1.5rem); }</code></pre>
<h2 id="fallback">Запасной вариант</h2>
<p>Поддержка уже у всех актуальных браузеров, но для старых достаточно мобильной раскладки по умолчанию: всё, что внутри <code>@container</code>, — это улучшение, а не основа.</p>
<blockquote>Пишите базовые стили для самого узкого случая, а контейнерные запросы добавляйте как надстройку.</blockquote>
<h2 id="summary">Итог</h2>
<p>Компоненты становятся по-настоящему переносимыми: одна и та же карточка корректно выглядит в сетке, сайдбаре и модальном окне без модификаторов вроде <code>.card--compact</code>.</p>`,
  },
  {
    slug: "postgres-indexes",
    title: "Индексы в PostgreSQL: пять ошибок, которые замедляют запросы",
    excerpt: "Почему индекс есть, а запрос всё равно читает всю таблицу. Составные индексы, функции в условиях, частичные индексы и EXPLAIN без страха.",
    tags: ["Базы данных", "Backend"], date: "2026-10-02", minutes: 10, author: "Олег Нестеров", cover: ["#2f6bff", "#9cc0ff"],
    body: `
<p>Индекс — не волшебная кнопка «быстрее». Планировщик использует его, только если это выгоднее последовательного чтения. Разберём частые причины, почему ваш индекс простаивает.</p>
<h2 id="order">1. Неправильный порядок колонок</h2>
<p>Составной индекс <code>(status, created_at)</code> помогает запросам по <code>status</code>, но почти бесполезен для фильтра только по <code>created_at</code>.</p>
<pre><code class="lang-sql">CREATE INDEX orders_status_created_idx
  ON orders (status, created_at DESC);</code></pre>
<h2 id="functions">2. Функция над колонкой</h2>
<p>Условие <code>WHERE lower(email) = $1</code> не использует обычный индекс по <code>email</code>. Нужен индекс по выражению.</p>
<pre><code class="lang-sql">CREATE INDEX users_email_lower_idx ON users (lower(email));</code></pre>
<h2 id="partial">3. Индекс на всё, когда нужна часть</h2>
<p>Если 95% заказов закрыты, а ищем мы открытые, частичный индекс будет в разы меньше и быстрее.</p>
<pre><code class="lang-sql">CREATE INDEX orders_open_idx ON orders (created_at) WHERE status = 'open';</code></pre>
<h2 id="explain">4. Не смотреть в EXPLAIN</h2>
<p><code>EXPLAIN (ANALYZE, BUFFERS)</code> показывает реальный план и чтения с диска. Ищите <code>Seq Scan</code> на больших таблицах и расхождение оценки строк с фактом.</p>
<h2 id="stats">5. Устаревшая статистика</h2>
<p>После массовой загрузки данных запустите <code>ANALYZE</code>, иначе планировщик будет принимать решения по старой картине мира.</p>`,
  },
  {
    slug: "typescript-satisfies",
    title: "satisfies в TypeScript: проверка типа без потери точности",
    excerpt: "Оператор satisfies проверяет объект на соответствие типу, но сохраняет литеральные типы. Показываю, где он заменяет as const и аннотации.",
    tags: ["TypeScript", "Frontend"], date: "2026-09-21", minutes: 5, author: "Марина Котова", cover: ["#7c5cff", "#c9b8ff"],
    body: `
<p>Аннотация типа расширяет значение до объявленного типа, а <code>as</code> отключает проверку. <code>satisfies</code> делает третье: проверяет, но не меняет выведенный тип.</p>
<h2 id="example">Пример</h2>
<pre><code class="lang-ts">type Route = { path: string; auth: boolean };

const routes = {
  home: { path: "/", auth: false },
  admin: { path: "/admin", auth: true },
} satisfies Record&lt;string, Route&gt;;

routes.admin.auth; // boolean
routes.blog;       // ошибка: такого маршрута нет</code></pre>
<h2 id="why">Зачем это нужно</h2>
<p>Опечатка в ключе <code>auth</code> будет поймана, а автодополнение <code>routes.</code> покажет конкретные маршруты, а не любые строки.</p>
<h2 id="when">Когда не подходит</h2>
<p>Если значение должно быть ровно объявленного типа (например, для публичного API модуля), обычная аннотация честнее.</p>`,
  },
  {
    slug: "web-vitals-inp",
    title: "INP вместо FID: как найти и починить медленные клики",
    excerpt: "Interaction to Next Paint измеряет отзывчивость всей сессии. Разбираем, откуда берутся долгие задачи и как дробить работу в обработчиках.",
    tags: ["Производительность", "Frontend"], date: "2026-09-09", minutes: 8, author: "Илья Гордеев", cover: ["#12a37a", "#a8ecd3"],
    body: `
<p>INP берёт почти худшее взаимодействие за визит и измеряет время от ввода до следующей отрисовки. Хорошо — до 200 мс.</p>
<h2 id="find">Как найти виновника</h2>
<p>В DevTools откройте Performance, включите замедление CPU и повторите клик. Ищите длинные задачи (больше 50 мс) сразу после события.</p>
<h2 id="yield">Отдавайте управление браузеру</h2>
<pre><code class="lang-js">button.addEventListener("click", async () => {
  showSpinner();             // мгновенная обратная связь
  await scheduler.yield();   // даём браузеру отрисовать кадр
  heavyRecalculation();
});</code></pre>
<h2 id="tips">Что ещё помогает</h2>
<ul><li>Не делайте синхронные запросы к <code>localStorage</code> в горячих обработчиках.</li><li>Виртуализируйте длинные списки.</li><li>Переносите тяжёлые вычисления в Web Worker.</li></ul>`,
  },
  {
    slug: "git-worktree",
    title: "git worktree: несколько веток в соседних папках",
    excerpt: "Срочный хотфикс посреди большой задачи без stash и пересборки. Как работают рабочие деревья Git и где они особенно удобны.",
    tags: ["Git", "Инструменты"], date: "2026-08-28", minutes: 4, author: "Олег Нестеров", cover: ["#f2a541", "#ffe0a8"],
    body: `
<p>Обычно мы переключаем ветки в одной папке. <code>git worktree</code> позволяет держать несколько веток одновременно в разных папках, разделяя одну историю.</p>
<h2 id="usage">Использование</h2>
<pre><code class="lang-bash">git worktree add ../hotfix main
cd ../hotfix && git switch -c fix/payment
# ...исправили, закоммитили, вернулись
git worktree remove ../hotfix</code></pre>
<h2 id="cases">Где удобно</h2>
<ul><li>Хотфикс без прерывания текущей работы.</li><li>Ревью чужой ветки с запущенным dev-сервером.</li><li>Сравнение поведения двух версий бок о бок.</li></ul>`,
  },
  {
    slug: "accessibility-forms",
    title: "Доступные формы: подписи, ошибки и фокус",
    excerpt: "Плейсхолдер — не подпись, красная рамка — не сообщение об ошибке. Чек-лист доступной формы, который проверяется за десять минут.",
    tags: ["Доступность", "Frontend"], date: "2026-08-15", minutes: 6, author: "Илья Гордеев", cover: ["#e8456b", "#ffc2d1"],
    body: `
<p>Формы — место, где сайт чаще всего теряет пользователей со скринридерами и клавиатурой. Хорошая новость: большинство проблем решается разметкой.</p>
<h2 id="labels">Подписи</h2>
<p>У каждого поля должен быть <code>&lt;label for&gt;</code>. Плейсхолдер исчезает при вводе и плохо читается.</p>
<h2 id="errors">Ошибки</h2>
<pre><code class="lang-html">&lt;input id="email" aria-invalid="true" aria-describedby="email-err"&gt;
&lt;p id="email-err"&gt;Проверьте адрес: например, name@example.com&lt;/p&gt;</code></pre>
<h2 id="focus">Фокус</h2>
<p>После неудачной отправки переводите фокус на первое поле с ошибкой, а после успешной — на сообщение об успехе.</p>`,
  },
];
