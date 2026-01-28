import React, { useRef, useState, useMemo, useEffect } from "react";

const categoriesData = [
    { key: "action", title: "Боевик" },
    { key: "adventure", title: "Приключение" },
    { key: "comedy", title: "Комедия" },
    { key: "drama", title: "Драма" },
    { key: "horror", title: "Хоррор" },
    { key: "sci", title: "Аниме" },
    { key: "fantasy", title: "Фэнтези" },
    { key: "thriller", title: "Триллер" },
    { key: "romance", title: "Романтика" },
    { key: "animation", title: "Дорама" }
];

const CARDS_PER_PAGE = 5;

export default function CategoriesCarousel() {
    const [page, setPage] = useState(0);
    const containerRef = useRef(null);

    const pages = Math.ceil(categoriesData.length / CARDS_PER_PAGE);

    const onPrev = () => setPage(p => Math.max(0, p - 1));
    const onNext = () => setPage(p => Math.min(pages - 1, p + 1));

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [pages]);

    const visibleGroups = useMemo(() => {
        const groups = [];
        for (let i = 0; i < categoriesData.length; i += CARDS_PER_PAGE) {
            groups.push(categoriesData.slice(i, i + CARDS_PER_PAGE));
        }
        return groups;
    }, []);

    return (
        <section className="categories-section">
            <div className="categories-head">
                {/* Левая колонка: заголовок + подпись (h2) под ним */}
                <div className="categories-left">
                    <h3 className="categories-title">Изучите наш широкий выбор категорий</h3>
                    <h2 className="categories-under">
                        Ищете ли вы комедию, которая заставит вас рассмеяться, драму, которая заставит задуматься,
                        или документальный фильм, чтобы узнать что-то новое?
                    </h2>
                </div>

                {/* Контролы (справа), выровнены по центру левой колонки */}
                <div className="categories-controls" role="tablist" aria-label="Навигация по категориям">
                    <button
                        className="ctrl-arrow"
                        onClick={onPrev}
                        disabled={page === 0}
                        aria-label="Назад"
                        title="Назад"
                    >
                        ←
                    </button>

                    <div className="progress-line" aria-hidden="true">
                        {Array.from({ length: pages }).map((_, i) => (
                            <span key={i} className={`progress-seg ${i === page ? "active" : ""}`} />
                        ))}
                    </div>

                    <button
                        className="ctrl-arrow"
                        onClick={onNext}
                        disabled={page === pages - 1}
                        aria-label="Вперед"
                        title="Вперед"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Карточки — слайдимся по страницам */}
            <div className="categories-slider-viewport">
                <div
                    className="categories-slider"
                    ref={containerRef}
                    style={{ transform: `translateX(-${page * 100}%)` }}
                >
                    {visibleGroups.map((group, grpIndex) => (
                        <div className="cards-page" key={grpIndex}>
                            {group.map(cat => (
                                <article className="category-card" key={cat.key}>
                                    <div className="poster-grid">
                                        <div className="poster poster-1" />
                                        <div className="poster poster-2" />
                                        <div className="poster poster-3" />
                                        <div className="poster poster-4" />
                                    </div>

                                    <div className="card-footer">
                                        <span className="cat-title">{cat.title}</span>
                                        <button className="cat-go" aria-label={`Перейти в ${cat.title}`}>➜</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
