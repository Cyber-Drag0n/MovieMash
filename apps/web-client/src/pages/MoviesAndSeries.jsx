// pages/MoviesAndSeries.jsx
import React, { useState, useEffect, useRef } from "react";
import CarouselControls from "../components/CarouselControls";

const HERO = [
    { id: 1, title: "Мстители: Финал", desc: "Оставшиеся в живых члены команды Мстителей...", bg: "/avengers.png" },
    { id: 2, title: "Джон Уик 4", desc: "Ветеран пытается уйти от преследующих сил...", bg: "/john-wick.png" },
    { id: 3, title: "Матрица: Воскрешение", desc: "Неожиданные откровения и новый виток борьбы...", bg: "/matrix.png" }
];

// расширенный список для Top-10 (мин. 12 элементов — чтобы листать)
const TOP10_ITEMS = [
    { id: 1, title: "Фильм 1", img: "/thumb1.jpg" },
    { id: 2, title: "Фильм 2", img: "/thumb2.jpg" },
    { id: 3, title: "Фильм 3", img: "/thumb3.jpg" },
    { id: 4, title: "Фильм 4", img: "/thumb4.jpg" },
    { id: 5, title: "Фильм 5", img: "/thumb5.jpg" },
    { id: 6, title: "Фильм 6", img: "/thumb6.jpg" },
    { id: 7, title: "Фильм 7", img: "/thumb7.jpg" },
    { id: 8, title: "Фильм 8", img: "/thumb8.jpg" },
    { id: 9, title: "Фильм 9", img: "/thumb9.jpg" },
    { id: 10, title: "Фильм 10", img: "/thumb10.jpg" },
    { id: 11, title: "Фильм 11", img: "/thumb11.jpg" },
    { id: 12, title: "Фильм 12", img: "/thumb12.jpg" },
];

const GENRES = [
    "Боевик", "Приключение", "Комедия", "Драма", "Хоррор",
    "Аниме", "Фэнтези", "Триллер", "Романтика", "Дорама"
];

const CARDS_PER_PAGE = 4; // для Top-10 показываем 4 миниатюры на страницу

export default function MoviesAndSeries() {
    const items = HERO;
    const [index, setIndex] = useState(0);
    const autoplayRef = useRef(null);

    // секции
    const [genresPage, setGenresPage] = useState(0);
    const [topPage, setTopPage] = useState(0);

    const topPagesCount = Math.ceil(TOP10_ITEMS.length / CARDS_PER_PAGE);
    const genresPagesCount = Math.ceil(GENRES.length / 5); // оставляем 5 карточек жанров/страница

    useEffect(() => {
        autoplayRef.current = setInterval(() => setIndex(i => (i + 1) % items.length), 8000);
        return () => clearInterval(autoplayRef.current);
    }, [items.length]);

    const onMouseEnter = () => clearInterval(autoplayRef.current);
    const onMouseLeave = () => {
        clearInterval(autoplayRef.current);
        autoplayRef.current = setInterval(() => setIndex(i => (i + 1) % items.length), 8000);
    };

    const prev = () => setIndex(i => (i - 1 + items.length) % items.length);
    const next = () => setIndex(i => (i + 1) % items.length);
    const goTo = (i) => setIndex(i);

    // жанры control handlers
    const genresPrev = () => setGenresPage(p => Math.max(0, p - 1));
    const genresNext = () => setGenresPage(p => Math.min(genresPagesCount - 1, p + 1));

    // top10 handlers (по 4 миниатюры)
    const topPrev = () => setTopPage(p => Math.max(0, p - 1));
    const topNext = () => setTopPage(p => Math.min(topPagesCount - 1, p + 1));

    // рендер: 4 миниатюр top
    const renderTopPage = (page) => {
        const start = page * CARDS_PER_PAGE;
        const slice = TOP10_ITEMS.slice(start, start + CARDS_PER_PAGE);
        return (
            <div className="top-thumbs-row" style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                {slice.map((it) => (
                    <div key={it.id} className="top-thumb-card">
                        <img
                            src={it.img}
                            alt={it.title}
                            className="top-thumb-img"
                            onError={(e) => { e.target.src = "/media/placeholder.jpg"; }}
                        />
                        <div className="top-thumb-title">{it.title}</div>
                    </div>
                ))}
            </div>
        );
    };

    // жанры (по 5 карточек как раньше, но внутри карточки 2x2 постера)
    const renderGenresPage = (page) => {
        const groups = [];
        for (let i = 0; i < GENRES.length; i += 5) groups.push(GENRES.slice(i, i + 5));
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

    return (
        <section className="ms-page" aria-label="Фильмы и сериалы">
            {/* HERO */}
            <div className="ms-hero" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                {items[index]?.bg && (
                    <img className="ms-bg-img" src={items[index].bg} alt={items[index].title} />
                )}
                <div className="ms-hero-overlay" />

                <button className="ms-hero-arrow left" onClick={prev} aria-label="Предыдущий">
                    <img src="/Arrow_left.svg" alt="Назад" />
                </button>
                <button className="ms-hero-arrow right" onClick={next} aria-label="Следующий">
                    <img src="/Arrow_right.svg" alt="Вперед" />
                </button>

                <div className="ms-hero-center">
                    <h1 className="ms-hero-title">{items[index]?.title}</h1>
                    <p className="ms-hero-desc">{items[index]?.desc}</p>

                    <div className="ms-hero-actions" role="group" aria-label="Действия с фильмом">
                        <button className="ms-btn ms-btn-play" aria-label={`Смотреть ${items[index]?.title}`}>
                            <img src="/Play.svg" alt="" aria-hidden="true" className="ms-btn-icon" />
                            <span>Смотреть</span>
                        </button>

                        <button className="ms-btn ms-btn-circle" aria-label="Добавить в список">
                            <img src="/plus.svg" alt="" aria-hidden="true" className="ms-btn-small-icon" />
                        </button>

                        <button className="ms-btn ms-btn-circle" aria-label="Нравится">
                            <img src="/like.svg" alt="" aria-hidden="true" className="ms-btn-small-icon" />
                        </button>

                        <button className="ms-btn ms-btn-circle" aria-label="Звук">
                            <img src="/sound.svg" alt="" aria-hidden="true" className="ms-btn-small-icon" />
                        </button>
                    </div>
                </div>

                <div className="ms-hero-indicators" role="tablist" aria-label="Постеры">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            className={`ms-ind-dot ${i === index ? "active" : ""}`}
                            onClick={() => goTo(i)}
                            aria-pressed={i === index}
                            aria-label={`Перейти к ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* --- Наши жанры (с табкой "Фильмы") --- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "28px auto 0", padding: "0 12px", position: "relative" }}>
                <button className="ms-btn ms-btn-watch">
                    <h2>Фильмы</h2>
                </button>
                <div className="categories-head" style={{ alignItems: "center" }}>
                    <div className="categories-left">
                        <h3 className="categories-title">Наши жанры</h3>
                    </div>

                    <CarouselControls
                        page={genresPage}
                        pages={genresPagesCount}
                        onPrev={genresPrev}
                        onNext={genresNext}
                    />
                </div>

                <div style={{ padding: "12px 0 28px" }}>
                    {renderGenresPage(genresPage)}
                </div>
            </div>

        </section>
    );
}
