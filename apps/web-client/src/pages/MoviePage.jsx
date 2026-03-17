// src/pages/MoviePage.jsx
import React from "react";
import "../MoviePage.css";
import AdBanner from "../components/AdBanner.jsx";

// небольшой мок данных — в реальном проекте замените fetch/props
const MOVIES = {
    1: {
        id: 1,
        title: "Кантара",
        poster: "/example.jpg",
        hero: "/example.jpg",
        year: 2022,
        description: "Пылкий молодой человек вступает в столкновение с непоколебимым лесничим в южноканадской деревне, где правят духовность, судьба и фольклор.",
        duration: "2ч 08мин",
        languages: ["Английский", "Русский"],
        imdb: 4.5,
        moviemash: 4,
        genres: ["Боевик", "Приключения"],
        director: { name: "Rishab Shetty", avatar: "/example.jpg" },
        music: { name: "B. Ajaneesh Loknath", avatar: "/example.jpg" },
        cast: [
            "/example.jpg","/example.jpg","/example.jpg","/example.jpg","/example.jpg","/example.jpg"
        ],
        reviews: [
            { id: 1, author: "Aniket Roy", text: "Этот фильм мне порекомендовала моя очень близкая подруга...", rating: 4.5 },
            { id: 2, author: "Swaraj", text: "Неумолимый король обещает свои земли местным племенам...", rating: 5 }
        ]
    }
};

export default function MoviePage() {
    // статически показываем первый фильм — роутинг позже подключим на бэке/в роутере
    const movie = MOVIES[1];

    return (
        <div className="movie-page">
            {/* HERO */}
            <div className="movie-hero" style={{ backgroundImage: `url(${movie.hero})` }}>
                <div className="movie-hero-overlay">
                    <div className="container hero-inner">
                        <h1 className="movie-title">{movie.title}</h1>
                        <p className="movie-sub">{movie.description}</p>

                        <div className="hero-actions">
                            <button className="btn-play" aria-label="Смотреть">▶ Смотреть</button>

                            {/* одна из кнопок использует ваш like.svg — остальные можно заменить позже */}
                            <button className="btn-ghost" aria-label="Добавить в список">
                                <img src="/plus.svg" alt="like" style={{ width: 18, height: 18 }} />
                            </button>

                            <button className="btn-ghost" aria-label="Нравится">
                                <img src="/like.svg" alt="like" style={{ width: 18, height: 18 }} />
                            </button>

                            <button className="btn-ghost" aria-label="Звук">
                                <img src="/sound.svg" alt="like" style={{ width: 18, height: 18 }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="container movie-body">
                <div className="movie-main">
                    {/* Описание */}
                    <div className="movie-desc card">
                        <h3>Описание:</h3>
                        <p>{movie.description}</p>
                    </div>

                    {/* В ролях */}
                    <div className="movie-cast card">
                        <h3>В ролях:</h3>
                        <div className="cast-row">
                            {movie.cast.map((src, idx) => (
                                <div key={idx} className="cast-item">
                                    <img src={src} alt={`actor-${idx}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Отзывы */}
                    <div className="movie-reviews card">
                        <div className="reviews-header">
                            <h3>Отзывы:</h3>
                            <button className="btn-add" type="button">+ Добавить отзыв</button>
                        </div>

                        <div className="reviews-grid">
                            {movie.reviews.map((r) => {
                                const full = Math.floor(r.rating);
                                const half = r.rating - full >= 0.5;
                                const empty = 5 - full - (half ? 1 : 0);
                                return (
                                    <article key={r.id} className="review-card">
                                        <div className="review-left">
                                            <strong>{r.author}</strong>
                                            <small>из Индия</small>
                                            <p className="review-text">{r.text}</p>
                                        </div>

                                        <div className="review-right">
                                            <span className="star-oval" aria-hidden="true">
                                                <span className="rating-row">
                                                    {Array.from({ length: full }).map((_, i) => (
                                                        <img key={i} src="/star-filled.svg" className="star-icon" alt="" />
                                                    ))}
                                                    {half && <img src="/star-half.svg" className="star-icon" alt="" />}
                                                    {Array.from({ length: empty }).map((_, i) => (
                                                        <img key={"e"+i} src="/star-empty.svg" className="star-icon" alt="" />
                                                    ))}
                                                </span>
                                                <span className="rating-number">{Math.round(r.rating)}</span>
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="carousel-controls" aria-hidden="true">
                            <button className="ctrl-arrow" type="button">◀</button>
                            <div className="prog-line"><span className="dot active" /></div>
                            <button className="ctrl-arrow" type="button">▶</button>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR */}
                <aside className="movie-side">
                    <div className="side-card">
                        <div><strong>Вышел:</strong></div>
                        <div className="side-value">{movie.year}</div>

                        <div className="side-block">
                            <strong>Доступные языки:</strong>
                            <div className="lang-list">{movie.languages.map(l => <span key={l} className="pill">{l}</span>)}</div>
                        </div>

                        <div className="side-block">
                            <strong>Рейтинги:</strong>

                            <div className="rating-row-block">
                                <div className="rating-row-lbl">IMDb</div>
                                <div className="rating-row-val">
                                    <span className="star-oval small">
                                        <span className="rating-row">
                                            {Array.from({ length: Math.floor(movie.imdb) }).map((_,i)=> (
                                                <img key={i} src="/star-filled.svg" className="star-icon" alt=""/>
                                            ))}
                                            {/* добавляем пустую звезду до 5 для визуальной целостности */}
                                            {Array.from({ length: 5 - Math.floor(movie.imdb) }).map((_,i)=> (
                                                <img key={"ie"+i} src="/star-empty.svg" className="star-icon" alt=""/>
                                            ))}
                                        </span>
                                        <span className="rating-number">{movie.imdb}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="rating-row-block">
                                <div className="rating-row-lbl">MovieMash</div>
                                <div className="rating-row-val">
                                    <span className="star-oval small">
                                        <span className="rating-row">
                                            {Array.from({ length: Math.floor(movie.moviemash) }).map((_,i)=> (
                                                <img key={i} src="/star-filled.svg" className="star-icon" alt=""/>
                                            ))}
                                            {Array.from({ length: 5 - Math.floor(movie.moviemash) }).map((_,i)=> (
                                                <img key={"me"+i} src="/star-empty.svg" className="star-icon" alt=""/>
                                            ))}
                                        </span>
                                        <span className="rating-number">{movie.moviemash}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="side-block">
                            <strong>Жанры:</strong>
                            <div className="tags">{movie.genres.map(g => <span key={g} className="pill">{g}</span>)}</div>
                        </div>

                        <div className="side-block">
                            <strong>Режиссёр:</strong>
                            <div className="person">
                                <img src={movie.director.avatar} alt="" />
                                <div>{movie.director.name}</div>
                            </div>
                        </div>

                        <div className="side-block">
                            <strong>Музыка:</strong>
                            <div className="person">
                                <img src={movie.music.avatar} alt="" />
                                <div>{movie.music.name}</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

                <AdBanner />
        </div>
    );
}