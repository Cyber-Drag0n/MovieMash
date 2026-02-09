// pages/MoviesAndSeries.jsx
import React, { useState, useEffect, useRef } from "react";
import CarouselControls from "../components/CarouselControls";
import AdBanner from "../components/AdBanner";

/* ----------------- MOVIES data (как было) ----------------- */
const HERO = [
    { id: 1, title: "Мстители: Финал", desc: "Оставшиеся в живых члены команды Мстителей...", bg: "/avengers.png" },
    { id: 2, title: "Джон Уик 4", desc: "Ветеран пытается уйти от преследующих сил...", bg: "/john-wick.png" },
    { id: 3, title: "Матрица: Воскрешение", desc: "Неожиданные откровения и новый виток борьбы...", bg: "/matrix.png" }
];

const TRENDES = [
    { id: 1, img: "/tr1.jpg", duration: "1ч 30мин", views: "2K"},
    { id: 2, img: "/tr2.jpg", duration: "1ч 57мин", views: "1.5K"},
    { id: 3, img: "/tr3.jpg", duration: "2ч 10мин", views: "1.8K"},
    { id: 4, img: "/tr4.jpg", duration: "2ч 20мин", views: "3K"},
    { id: 5, img: "/tr5.jpg", duration: "1ч 42мин", views: "5K"},
    { id: 6, img: "/tr6.jpg", duration: "1ч 45мин", views: "3.2K"}
];

const GENRES = [
    "Боевик", "Приключение", "Комедия", "Драма", "Хоррор",
    "Аниме", "Фэнтези", "Триллер"
];

const NEW_RELEASES = [
    { id: 1, img: "/example.jpg", release: "Вышел 14 апреля 2023" },
    { id: 2, img: "/example.jpg", release: "Вышел 22 апреля 2023" },
    { id: 3, img: "/example.jpg", release: "Вышел 13 апреля 2023" },
    { id: 4, img: "/example.jpg", release: "Вышел 19 апреля 2023" },
    { id: 5, img: "/example.jpg", release: "Вышел 11 апреля 2023" },
    { id: 6, img: "/example.jpg", release: "Вышел 01 марта 2023" }
];

const MUST_WATCH = [
    { id: 1, img: "/must1.jpg", duration: "1ч 57мин", rating: 4.5, votes: "20K" },
    { id: 2, img: "/must2.jpg", duration: "1ч 30мин", rating: 4.0, votes: "12K" },
    { id: 3, img: "/must3.jpg", duration: "1ч 42мин", rating: 4.8, votes: "48K" },
    { id: 4, img: "/must4.jpg", duration: "2ч 10мин", rating: 4.2, votes: "9.2K" }
];

/* ----------------- SERIES data (дублируем / переиспользуем для "как у фильмов") ----------------- */
/* Чтобы "В трендах" и "Новинки" для сериалов были такими же по количеству блоков,
   мы переиспользуем массивы TRENDES и NEW_RELEASES. */
const TRENDES_SERIES = TRENDES.slice(); // копия, можно заменить на свои данные
// Новинки сериалов — добавил поля duration и seasons (чтобы показывать левый/правый овалы)
const NEW_RELEASES_SERIES = [
    { id: 1, img: "/example.jpg", release: "Вышел 05 мая 2023", duration: "10ч 30мин", seasons: "5 сезонов" },
    { id: 2, img: "/example.jpg", release: "Вышел 20 апреля 2023", duration: "8ч 20мин", seasons: "3 сезона" },
    { id: 3, img: "/example.jpg", release: "Вышел 01 апреля 2023", duration: "12ч 10мин", seasons: "6 сезонов" },
    { id: 4, img: "/example.jpg", release: "Вышел 10 марта 2023", duration: "9ч 00мин", seasons: "4 сезона" },
    { id: 5, img: "/example.jpg", release: "Вышел 28 февраля 2023", duration: "7ч 40мин", seasons: "2 сезона" },
    { id: 6, img: "/example.jpg", release: "Вышел 15 февраля 2023", duration: "11ч 05мин", seasons: "7 сезонов" }
];

const GENRES_SERIES = GENRES.slice();

const MUST_WATCH_SERIES = [
    { id: 1, img: "/must1.jpg", duration: "10ч 30мин", rating: 4.9, votes: "300K" },
    { id: 2, img: "/must2.jpg", duration: "12ч 10мин", rating: 4.6, votes: "210K" },
    { id: 3, img: "/must3.jpg", duration: "9ч 45мин", rating: 4.7, votes: "180K" },
    { id: 4, img: "/must4.jpg", duration: "15ч 00мин", rating: 4.4, votes: "90K" }
];

/* ----------------- Компонент страницы ----------------- */
export default function MoviesAndSeries() {
    const [heroIndex, setHeroIndex] = useState(0);
    const autoplayRef = useRef(null);

    // Movies states
    const [genresPage, setGenresPage] = useState(0);
    const [topGenrePage, setTopGenrePage] = useState(0);
    const [trendsPage, setTrendsPage] = useState(0);

    // Series states (отдельные)
    const [genresPageSeries, setGenresPageSeries] = useState(0);
    const [topGenrePageSeries, setTopGenrePageSeries] = useState(0);
    const [trendsPageSeries, setTrendsPageSeries] = useState(0);

    const GENRES_PER_PAGE = 5;
    const TOP_GENRES_PER_PAGE = 4;
    const TRENDS_PER_PAGE = 5;

    const genresPagesCount = Math.max(1, Math.ceil(GENRES.length / GENRES_PER_PAGE));
    const topGenresPagesCount = Math.max(1, Math.ceil(GENRES.length / TOP_GENRES_PER_PAGE));
    const trendsPagesCount = Math.max(1, Math.ceil(TRENDES.length / TRENDS_PER_PAGE));

    const genresPagesCountSeries = Math.max(1, Math.ceil(GENRES_SERIES.length / GENRES_PER_PAGE));
    const topGenresPagesCountSeries = Math.max(1, Math.ceil(GENRES_SERIES.length / TOP_GENRES_PER_PAGE));
    const trendsPagesCountSeries = Math.max(1, Math.ceil(TRENDES_SERIES.length / TRENDS_PER_PAGE));

    const [newPage, setNewPage] = useState(0);
    const NEW_PER_PAGE = 5;
    const newPagesCount = Math.max(1, Math.ceil(NEW_RELEASES.length / NEW_PER_PAGE));
    const newPrev = () => setNewPage(p => Math.max(0, p - 1));
    const newNext = () => setNewPage(p => Math.min(newPagesCount - 1, p + 1));

    const [newPageSeries, setNewPageSeries] = useState(0);
    const newPagesCountSeries = Math.max(1, Math.ceil(NEW_RELEASES_SERIES.length / NEW_PER_PAGE));
    const newPrevSeries = () => setNewPageSeries(p => Math.max(0, p - 1));
    const newNextSeries = () => setNewPageSeries(p => Math.min(newPagesCountSeries - 1, p + 1));

    useEffect(() => {
        autoplayRef.current = setInterval(() => setHeroIndex(i => (i + 1) % HERO.length), 8000);
        return () => clearInterval(autoplayRef.current);
    }, []);

    const onHeroEnter = () => clearInterval(autoplayRef.current);
    const onHeroLeave = () => {
        clearInterval(autoplayRef.current);
        autoplayRef.current = setInterval(() => setHeroIndex(i => (i + 1) % HERO.length), 8000);
    };

    const heroPrev = () => setHeroIndex(i => (i - 1 + HERO.length) % HERO.length);
    const heroNext = () => setHeroIndex(i => (i + 1) % HERO.length);
    const heroGoTo = (i) => setHeroIndex(i);

    // Movies controls
    const genresPrev = () => setGenresPage(p => Math.max(0, p - 1));
    const genresNext = () => setGenresPage(p => Math.min(genresPagesCount - 1, p + 1));
    const topPrev = () => setTopGenrePage(p => Math.max(0, p - 1));
    const topNext = () => setTopGenrePage(p => Math.min(topGenresPagesCount - 1, p + 1));
    const trendsPrev = () => setTrendsPage(p => Math.max(0, p - 1));
    const trendsNext = () => setTrendsPage(p => Math.min(trendsPagesCount - 1, p + 1));

    // Series controls
    const genresPrevSeries = () => setGenresPageSeries(p => Math.max(0, p - 1));
    const genresNextSeries = () => setGenresPageSeries(p => Math.min(genresPagesCountSeries - 1, p + 1));
    const topPrevSeries = () => setTopGenrePageSeries(p => Math.max(0, p - 1));
    const topNextSeries = () => setTopGenrePageSeries(p => Math.min(topGenresPagesCountSeries - 1, p + 1));
    const trendsPrevSeries = () => setTrendsPageSeries(p => Math.max(0, p - 1));
    const trendsNextSeries = () => setTrendsPageSeries(p => Math.min(trendsPagesCountSeries - 1, p + 1));

    /* ---------- RENDER HELPERS (movies) ---------- */
    const renderGenresPage = (page) => {
        const groups = [];
        for (let i = 0; i < GENRES.length; i += GENRES_PER_PAGE) groups.push(GENRES.slice(i, i + GENRES_PER_PAGE));
        const slice = groups[page] || [];
        return (
            <div style={{ display: "flex", gap: 20 }}>
                {slice.map((g) => (
                    <article className="category-card" key={g}>
                        <div className="poster-grid">
                            <div className="poster poster-1" />
                            <div className="poster poster-2" />
                            <div className="poster poster-3" />
                            <div className="poster poster-4" />
                        </div>
                        <div className="card-footer">
                            <span className="cat-title">{g}</span>
                            <button className="cat-go" aria-label={`Перейти в ${g}`}>➜</button>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    const renderTopGenresPage = (page) => {
        const groups = [];
        for (let i = 0; i < GENRES.length; i += TOP_GENRES_PER_PAGE) groups.push(GENRES.slice(i, i + TOP_GENRES_PER_PAGE));
        const slice = groups[page] || [];
        return (
            <div style={{ display: "flex", gap: 22, justifyContent: "center", alignItems: "flex-start" }}>
                {slice.map((g) => (
                    <article className="category-card top-card" key={g}>
                        <div className="poster-wrap">
                            <div className="top-badge">Топ-10 в</div>
                            <div className="poster-grid">
                                <div className="poster poster-1" />
                                <div className="poster poster-2" />
                                <div className="poster poster-3" />
                                <div className="poster poster-4" />
                            </div>
                        </div>
                        <div className="card-footer">
                            <span className="cat-title">{g}</span>
                            <button className="cat-go" aria-label={`Перейти в ${g}`}>➜</button>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    function NewReleaseCard({ item }) {
        return (
            <article className="category-card new-card" role="listitem">
                <div className="new-poster-wrap" aria-hidden="true">
                    <img
                        src={item.img}
                        alt=""
                        className="new-poster"
                        onError={(e) => { e.currentTarget.src = "/example.jpg"; }}
                    />
                </div>

                <span className="new-badge">
          <span className="new-badge-text">{item.release}</span>
        </span>
            </article>
        );
    }

    const renderNewReleasesPage = (page) => {
        const start = page * NEW_PER_PAGE;
        const slice = NEW_RELEASES.slice(start, start + NEW_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map(it => <NewReleaseCard key={it.id} item={it} />)}
            </div>
        );
    };

    const renderTrendsPage = (page) => {
        const start = page * TRENDS_PER_PAGE;
        const slice = TRENDES.slice(start, start + TRENDS_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map(t => (
                    <article className="trend-card" key={t.id} role="listitem" aria-hidden="false">
                        <div className="trend-poster-wrap" aria-hidden="true">
                            <img
                                src={t.img}
                                className="trend-poster"
                                onError={(e) => { e.currentTarget.src = "/example.jpg"; }}
                            />

                            <span className="trend-badge left">
                <img src="/Time.svg" alt="" />
                <span className="badge-text">{t.duration}</span>
              </span>

                            <span className="trend-badge right">
                <img src="/Eye.svg" alt="" />
                <span className="badge-text">{t.views}</span>
              </span>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    function MustWatchCard({ item }) {
        const fullStars = Math.floor(item.rating);
        const halfStar = item.rating - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <article className="category-card top-card must-card" role="listitem">
                <div className="must-poster-wrap">
                    <img
                        src={item.img}
                        alt=""
                        className="must-poster"
                        onError={(e) => { e.currentTarget.src = "/example.jpg"; }}
                    />
                </div>

                <span className="trend-badge left must-left" aria-hidden="true">
          <img src="/Time.svg" alt="" />
          <span className="badge-text">{item.duration}</span>
        </span>

                <span className="trend-badge right must-right" aria-hidden="true">
          <span className="rating-row" aria-label={`Рейтинг ${item.rating} из 5`}>
            {Array.from({ length: fullStars }).map((_, i) => (
                <img key={"f"+i} src="/star-filled.svg" alt="" className="star-icon" />
            ))}
              {halfStar && <img key="half" src="/star-half.svg" alt="" className="star-icon" />}
              {Array.from({ length: emptyStars }).map((_, i) => (
                  <img key={"e"+i} src="/star-empty.svg" alt="" className="star-icon" />
              ))}
          </span>

          <span className="badge-text votes-text">{item.votes}</span>
        </span>
            </article>
        );
    }

    const renderMustWatch = () => {
        return (
            <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 60px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">Фильмы, которые обязательно нужно посмотреть</h3>
                    <CarouselControls page={0} pages={1} onPrev={()=>{}} onNext={()=>{}} />
                </div>

                <div style={{ padding: "12px 0 0" }}>
                    <div className="must-row" role="list" style={{ display: "flex", gap: 22, justifyContent: "flex-start" }}>
                        {MUST_WATCH.map(m => <MustWatchCard key={m.id} item={m} />)}
                    </div>
                </div>
            </div>
        );
    };

    /* ---------- RENDER HELPERS (series)  ---------- */
    const renderGenresPageSeries = (page) => {
        const groups = [];
        for (let i = 0; i < GENRES_SERIES.length; i += GENRES_PER_PAGE) groups.push(GENRES_SERIES.slice(i, i + GENRES_PER_PAGE));
        const slice = groups[page] || [];
        return (
            <div style={{ display: "flex", gap: 20 }}>
                {slice.map((g) => (
                    <article className="category-card" key={g + "-s"}>
                        <div className="poster-grid">
                            <div className="poster poster-1" />
                            <div className="poster poster-2" />
                            <div className="poster poster-3" />
                            <div className="poster poster-4" />
                        </div>
                        <div className="card-footer">
                            <span className="cat-title">{g}</span>
                            <button className="cat-go" aria-label={`Перейти в ${g}`}>➜</button>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    const renderTopGenresPageSeries = (page) => {
        const groups = [];
        for (let i = 0; i < GENRES_SERIES.length; i += TOP_GENRES_PER_PAGE) groups.push(GENRES_SERIES.slice(i, i + TOP_GENRES_PER_PAGE));
        const slice = groups[page] || [];
        return (
            <div style={{ display: "flex", gap: 22, justifyContent: "center", alignItems: "flex-start" }}>
                {slice.map((g) => (
                    <article className="category-card top-card" key={g + "-s"}>
                        <div className="poster-wrap">
                            <div className="top-badge">Топ-10 в</div>
                            <div className="poster-grid">
                                <div className="poster poster-1" />
                                <div className="poster poster-2" />
                                <div className="poster poster-3" />
                                <div className="poster poster-4" />
                            </div>
                        </div>
                        <div className="card-footer">
                            <span className="cat-title">{g}</span>
                            <button className="cat-go" aria-label={`Перейти в ${g}`}>➜</button>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    // Новинки сериалов — левый овал: duration, правый овал: seasons (Seasons.svg)
    const renderNewReleasesPageSeries = (page) => {
        const start = page * NEW_PER_PAGE;
        const slice = NEW_RELEASES_SERIES.slice(start, start + NEW_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map(it => (
                    <article className="category-card new-card" key={"s"+it.id}>
                        <div className="new-poster-wrap" aria-hidden="true">
                            <img src={it.img} alt="" className="new-poster" onError={(e)=>{e.currentTarget.src="/example.jpg"}} />
                        </div>

                        {/* бейджи вынесены наружу (внешняя рамка): левый — duration, правый — seasons */}
                        <span className="trend-badge left" style={{ position: "absolute", bottom: 12, left: 12 }}>
              <img src="/Time.svg" alt="" />
              <span className="badge-text">{it.duration}</span>
            </span>

                        <span className="trend-badge right" style={{ position: "absolute", bottom: 12, right: 12 }}>
              <img src="/Seasons.svg" alt="" />
              <span className="badge-text">{it.seasons}</span>
            </span>
                    </article>
                ))}
            </div>
        );
    };

    const renderTrendsPageSeries = (page) => {
        const start = page * TRENDS_PER_PAGE;
        const slice = TRENDES_SERIES.slice(start, start + TRENDS_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map((t, idx) => (
                    <article className="trend-card" key={"s"+t.id+"-"+idx} role="listitem" aria-hidden="false">
                        <div className="trend-poster-wrap" aria-hidden="true">
                            <img
                                src={t.img}
                                className="trend-poster"
                                onError={(e) => { e.currentTarget.src = "/example.jpg"; }}
                            />

                            <span className="trend-badge left">
                <img src="/Time.svg" alt="" />
                <span className="badge-text">{t.duration}</span>
              </span>

                            <span className="trend-badge right">
                <img src="/Eye.svg" alt="" />
                <span className="badge-text">{t.views}</span>
              </span>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    function MustWatchCardSeries({ item }) {
        // оставляем как у фильмов: слева время, справа — рейтинг/звёзды + голоса
        const fullStars = Math.floor(item.rating);
        const halfStar = item.rating - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return (
            <article className="category-card top-card must-card" role="listitem" key={"s"+item.id}>
                <div className="must-poster-wrap">
                    <img src={item.img} alt="" className="must-poster" onError={(e)=>{e.currentTarget.src="/example.jpg"}} />
                </div>

                <span className="trend-badge left must-left" aria-hidden="true">
          <img src="/Time.svg" alt="" />
          <span className="badge-text">{item.duration}</span>
        </span>

                <span className="trend-badge right must-right" aria-hidden="true">
          <span className="rating-row" aria-label={`Рейтинг ${item.rating} из 5`}>
            {Array.from({ length: fullStars }).map((_, i) => (<img key={"sf"+i} src="/star-filled.svg" alt="" className="star-icon" />))}
              {halfStar && <img key="sh" src="/star-half.svg" alt="" className="star-icon" />}
              {Array.from({ length: emptyStars }).map((_, i) => (<img key={"se"+i} src="/star-empty.svg" alt="" className="star-icon" />))}
          </span>
          <span className="badge-text votes-text">{item.votes}</span>
        </span>
            </article>
        );
    }

    const renderMustWatchSeries = () => {
        return (
            <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 60px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">Сериалы, которые обязательно нужно посмотреть</h3>
                    <CarouselControls page={0} pages={1} onPrev={()=>{}} onNext={()=>{}} />
                </div>

                <div style={{ padding: "12px 0 0" }}>
                    <div className="must-row" role="list" style={{ display: "flex", gap: 22, justifyContent: "flex-start" }}>
                        {MUST_WATCH_SERIES.map(m => <MustWatchCardSeries key={"s"+m.id} item={m} />)}
                    </div>
                </div>
            </div>
        );
    };

    /* ----------------- JSX page ----------------- */
    return (
        <section className="ms-page" aria-label="Фильмы и сериалы">
            {/* HERO (movies) — единственный крупный баннер, который остался */}
            <div className="ms-hero" onMouseEnter={onHeroEnter} onMouseLeave={onHeroLeave}>
                {HERO[heroIndex]?.bg && <img className="ms-bg-img" src={HERO[heroIndex].bg} alt={HERO[heroIndex].title} />}
                <div className="ms-hero-overlay" />

                <button className="ms-hero-arrow left" onClick={heroPrev} aria-label="Предыдущий">
                    <img src="/Arrow_left.svg" alt="Назад" />
                </button>
                <button className="ms-hero-arrow right" onClick={heroNext} aria-label="Следующий">
                    <img src="/Arrow_right.svg" alt="Вперед" />
                </button>

                <div className="ms-hero-center">
                    <h1 className="ms-hero-title">{HERO[heroIndex].title}</h1>
                    <p className="ms-hero-desc">{HERO[heroIndex].desc}</p>

                    <div className="ms-hero-actions" role="group" aria-label="Действия с фильмом">
                        <button className="ms-btn ms-btn-play" aria-label={`Смотреть ${HERO[heroIndex].title}`}>
                            <img src="/Play.svg" alt="" className="ms-btn-icon" />
                            <span>Смотреть</span>
                        </button>
                        <button className="ms-btn ms-btn-circle" aria-label="Добавить в список">
                            <img src="/plus.svg" alt="" className="ms-btn-small-icon" />
                        </button>
                        <button className="ms-btn ms-btn-circle" aria-label="Нравится">
                            <img src="/like.svg" alt="" className="ms-btn-small-icon" />
                        </button>
                        <button className="ms-btn ms-btn-circle" aria-label="Звук">
                            <img src="/sound.svg" alt="" className="ms-btn-small-icon" />
                        </button>
                    </div>
                </div>

                <div className="ms-hero-indicators" role="tablist" aria-label="Постеры">
                    {HERO.map((_, i) => (
                        <button
                            key={i}
                            className={`ms-ind-dot ${i === heroIndex ? "active" : ""}`}
                            onClick={() => heroGoTo(i)}
                            aria-pressed={i === heroIndex}
                            aria-label={`Перейти к ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* ---------------- MOVIES: Наши жанры ---------------- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "28px auto 0", padding: "0 12px", position: "relative" }}>
                <button className="ms-btn ms-btn-watch" aria-current="true">
                    <span>Фильмы</span>
                </button>

                <div className="categories-head" style={{ alignItems: "center" }}>
                    <div className="categories-left">
                        <h3 className="categories-title">Наши жанры</h3>
                    </div>

                    <CarouselControls page={genresPage} pages={genresPagesCount} onPrev={genresPrev} onNext={genresNext} />
                </div>

                <div style={{ padding: "12px 0 28px" }}>
                    {renderGenresPage(genresPage)}
                </div>
            </div>

            {/* ---------------- MOVIES: Популярный Топ-10 по жанрам ---------------- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><h3 className="categories-title">Популярный Топ-10 по жанрам</h3></div>
                    <CarouselControls page={topGenrePage} pages={topGenresPagesCount} onPrev={topPrev} onNext={topNext} />
                </div>

                <div style={{ padding: "18px 0 40px" }}>
                    {renderTopGenresPage(topGenrePage)}
                </div>
            </div>

            {/* ---------------- MOVIES: В трендах ---------------- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 60px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">В трендах</h3>
                    <CarouselControls page={trendsPage} pages={trendsPagesCount} onPrev={trendsPrev} onNext={trendsNext} />
                </div>

                <div style={{ overflow: "hidden" }}>
                    {renderTrendsPage(trendsPage)}
                </div>
            </div>

            {/* ---------------- MOVIES: Новинки фильмов ---------------- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">Новинки фильмов</h3>
                    <CarouselControls page={newPage} pages={newPagesCount} onPrev={newPrev} onNext={newNext} />
                </div>

                <div style={{ overflow: "hidden" }}>
                    {renderNewReleasesPage(newPage)}
                </div>
            </div>

            {/* MOVIES must-watch */}
            {renderMustWatch()}

            {/* ======================== SERIES (дублируем полностью для сериалов) ======================== */}

            {/* NOTE: убрал крупный баннер для сериалов — должен быть только баннер фильмов вверху */}

            {/* ---------------- SERIES: Наши жанры ---------------- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "28px auto 0", padding: "0 12px", position: "relative" }}>
                <button className="ms-btn ms-btn-watch">
                    <span>Сериалы</span>
                </button>

                <div className="categories-head" style={{ alignItems: "center" }}>
                    <div className="categories-left">
                        <h3 className="categories-title">Наши жанры</h3>
                    </div>

                    <CarouselControls page={genresPageSeries} pages={genresPagesCountSeries} onPrev={genresPrevSeries} onNext={genresNextSeries} />
                </div>

                <div style={{ padding: "12px 0 28px" }}>
                    {renderGenresPageSeries(genresPageSeries)}
                </div>
            </div>

            {/* ---------------- SERIES: Популярный Топ-10 по жанрам ---------------- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><h3 className="categories-title">Популярный Топ-10 по жанрам</h3></div>
                    <CarouselControls page={topGenrePageSeries} pages={topGenresPagesCountSeries} onPrev={topPrevSeries} onNext={topNextSeries} />
                </div>

                <div style={{ padding: "18px 0 40px" }}>
                    {renderTopGenresPageSeries(topGenrePageSeries)}
                </div>
            </div>

            {/* ---------------- SERIES: В трендах (сколько же, как у фильмов) ---------------- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 60px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">В трендах</h3>
                    <CarouselControls page={trendsPageSeries} pages={trendsPagesCountSeries} onPrev={trendsPrevSeries} onNext={trendsNextSeries} />
                </div>

                <div style={{ overflow: "hidden" }}>
                    {renderTrendsPageSeries(trendsPageSeries)}
                </div>
            </div>

            {/* ---------------- SERIES: Новинки сериалов (левый овал — duration, правый — seasons) ---------------- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">Новинки сериалов</h3>
                    <CarouselControls page={newPageSeries} pages={newPagesCountSeries} onPrev={newPrevSeries} onNext={newNextSeries} />
                </div>

                <div style={{ overflow: "hidden", position: "relative" }}>
                    {renderNewReleasesPageSeries(newPageSeries)}
                </div>
            </div>

            {/* SERIES must-watch */}
            {renderMustWatchSeries()}

            <AdBanner />

        </section>
    );
}
