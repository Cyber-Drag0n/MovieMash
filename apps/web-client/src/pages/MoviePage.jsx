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
        description:
            "Пылкий молодой человек вступает в столкновение с непоколебимым лесничим в южноканадской деревне, где правят духовность, судьба и фольклор.",
        duration: "2ч 08мин",
        languages: ["Английский", "Русский"],
        imdb: 4.5,
        moviemash: 4,
        genres: ["Боевик", "Приключения"],
        director: { name: "Rishab Shetty", avatar: "/example.jpg" },
        music: { name: "B. Ajaneesh Loknath", avatar: "/example.jpg" },
        cast: [
            "/example.jpg",
            "/example.jpg",
            "/example.jpg",
            "/example.jpg",
            "/example.jpg",
            "/example.jpg",
        ],
        reviews: [
            {
                id: 1,
                author: "Aniket Roy",
                text: "Этот фильм мне порекомендовала моя очень близкая подруга...",
                rating: 4.5,
            },
            {
                id: 2,
                author: "Swaraj",
                text: "Неумолимый король обещает свои земли местным племенам...",
                rating: 5,
            },
        ],
    },
};

export default function MoviePage() {
    const movie = MOVIES[1];

    return (
        <div className="movie-page">
            {/* HERO */}
            <div
                className="movie-hero"
                style={{ backgroundImage: `url(${movie.hero || "/example.jpg"})` }}
            >
                <div className="movie-hero-overlay">
                    <div className="container hero-inner">
                        <h1 className="movie-title">{movie.title}</h1>
                        <p className="movie-sub muted-text">{movie.description}</p>

                        <div className="hero-actions">
                            <button className="btn-play" aria-label="Смотреть">
                                ▶ Смотреть
                            </button>

                            <button
                                className="btn-ghost"
                                aria-label="Добавить в список"
                                title="Добавить в список"
                            >
                                <img src="/plus.svg" alt="plus" style={{ width: 18, height: 18 }} />
                            </button>

                            <button className="btn-ghost" aria-label="Нравится" title="Нравится">
                                <img src="/like.svg" alt="like" style={{ width: 18, height: 18 }} />
                            </button>

                            <button className="btn-ghost" aria-label="Звук" title="Звук">
                                <img src="/sound.svg" alt="sound" style={{ width: 18, height: 18 }} />
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
                        <h3 className="section-title">Описание:</h3>
                        <p className="body-text">{movie.description}</p>
                    </div>

                    {/* В ролях */}
                    <div className="movie-cast card">
                        <h3 className="section-title">В ролях:</h3>
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
                            <h3 className="section-title">Отзывы:</h3>
                            <button className="btn-add" type="button">
                                + Добавить отзыв
                            </button>
                        </div>

                        <div className="reviews-grid">
                            {movie.reviews.map((r) => {
                                const full = Math.floor(r.rating);
                                const half = r.rating - full >= 0.5;
                                const empty = 5 - full - (half ? 1 : 0);
                                return (
                                    <article key={r.id} className="review-card">
                                        <div className="review-left">
                                            <strong className="review-author">{r.author}</strong>
                                            <small className="review-origin muted-text">из Индия</small>
                                            <p className="review-text body-text">{r.text}</p>
                                        </div>

                                        <div className="review-right">
                      <span className="star-oval compact" aria-hidden="true">
                        <span className="rating-row compact">
                          {Array.from({ length: full }).map((_, i) => (
                              <img key={i} src="/star-filled.svg" className="star-icon" alt="" />
                          ))}
                            {half && (
                                <img src="/star-half.svg" className="star-icon" alt="" />
                            )}
                            {Array.from({ length: empty }).map((_, i) => (
                                <img key={"e" + i} src="/star-empty.svg" className="star-icon" alt="" />
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
                            <button className="ctrl-arrow" type="button" aria-label="Предыдущая">
                                <img src="/arrow_left.svg" alt="prev" className="ctrl-arrow-img" />
                            </button>

                            <div className="prog-line">
                                <span className="dot active" />
                            </div>

                            <button className="ctrl-arrow" type="button" aria-label="Следующая">
                                <img src="/arrow_right.svg" alt="next" className="ctrl-arrow-img" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR */}
                <aside className="movie-side">
                    <div className="side-card">
                        {/* released */}
                        <div className="side-block">
                            <div className="side-row">
                                <img src="/calendar.svg" alt="calendar" className="icon-movie" />
                                <strong className="side-label">Вышел:</strong>
                                <div className="side-value">{movie.year}</div>
                            </div>
                        </div>

                        {/* languages */}
                        <div className="side-block">
                            <div className="side-row">
                                <img src="/language.svg" alt="language" className="icon-movie" />
                                <strong className="side-label">Доступные языки:</strong>
                            </div>
                            <div className="lang-list">{movie.languages.map((l) => <span key={l} className="pill">{l}</span>)}</div>
                        </div>

                        {/* ratings */}
                        <div className="side-block">
                            <div className="side-row">
                                <img src="/rate.svg" alt="rate" className="icon-movie" />
                                <strong className="side-label">Рейтинги:</strong>
                            </div>

                            <div className="rating-row-block">
                                <div className="rating-row-lbl muted-text">IMDb</div>
                                <div className="rating-row-val">
                  <span className="star-oval small compact" aria-hidden="true">
                    <span className="rating-row compact">
                      {Array.from({ length: Math.floor(movie.imdb) }).map((_, i) => (
                          <img key={i} src="/star-filled.svg" className="star-icon" alt="" />
                      ))}
                        {Array.from({ length: 5 - Math.floor(movie.imdb) }).map((_, i) => (
                            <img key={"ie" + i} src="/star-empty.svg" className="star-icon" alt="" />
                        ))}
                    </span>
                    <span className="rating-number">{movie.imdb}</span>
                  </span>
                                </div>
                            </div>

                            <div className="rating-row-block">
                                <div className="rating-row-lbl muted-text">MovieMash</div>
                                <div className="rating-row-val">
                  <span className="star-oval small compact" aria-hidden="true">
                    <span className="rating-row compact">
                      {Array.from({ length: Math.floor(movie.moviemash) }).map((_, i) => (
                          <img key={i} src="/star-filled.svg" className="star-icon" alt="" />
                      ))}
                        {Array.from({ length: 5 - Math.floor(movie.moviemash) }).map((_, i) => (
                            <img key={"me" + i} src="/star-empty.svg" className="star-icon" alt="" />
                        ))}
                    </span>
                    <span className="rating-number">{movie.moviemash}</span>
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* genres */}
                        <div className="side-block">
                            <div className="side-row">
                                <img src="/genres.svg" alt="genres" className="icon-movie" />
                                <strong className="side-label">Жанры:</strong>
                            </div>
                            <div className="tags">{movie.genres.map((g) => <span key={g} className="pill">{g}</span>)}</div>
                        </div>

                        {/* director */}
                        <div className="side-block">
                            <strong className="side-label">Режиссёр:</strong>
                            <div className="person">
                                <img src={movie.director.avatar} alt="" />
                                <div className="person-name">{movie.director.name}</div>
                            </div>
                        </div>

                        {/* music */}
                        <div className="side-block">
                            <strong className="side-label">Музыка:</strong>
                            <div className="person">
                                <img src={movie.music.avatar} alt="" />
                                <div className="person-name">{movie.music.name}</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* рекламный баннер */}
            <div className="movie-cta">
                <AdBanner />
            </div>
        </div>
    );
}