import React, { useRef, useState, useMemo, useEffect } from "react";

const TMDB_BASE = "https://api.themoviedb.org/3";
const LANG = "ru-RU";
const IMAGE_PREFIX = "https://image.tmdb.org/t/p/w300";
const CARDS_PER_PAGE = 5;

function getBearerFromEnv() {
    try {
        if (typeof window !== "undefined" && import.meta.env && import.meta.env.VITE_TMDB_BEARER) {
            return import.meta.env.VITE_TMDB_BEARER;
        }
    } catch {
        // ignore
    }
    return null;
}

async function fetchJson(url, bearer) {
    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${bearer}`,
    };

    const res = await fetch(url, { headers });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${txt}`);
    }
    return res.json();
}

function capitalizeFirstLetter(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function CategoriesCarousel({ navigate }) {
    const [page, setPage] = useState(0);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    const pages = Math.max(1, Math.ceil(genres.length / CARDS_PER_PAGE));

    const onPrev = () => setPage((p) => Math.max(0, p - 1));
    const onNext = () => setPage((p) => Math.min(pages - 1, p + 1));

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [pages]);

    useEffect(() => {
        const BEARER = getBearerFromEnv();
        if (!BEARER) {
            setError("TMDB token не найден. Положите VITE_TMDB_BEARER в apps/web-client/.env.local");
            return;
        }

        let mounted = true;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const genresRes = await fetchJson(
                    `${TMDB_BASE}/genre/movie/list?language=${LANG}`,
                    BEARER
                );

                const items = Array.isArray(genresRes?.genres) ? genresRes.genres : [];

                const genresWithPosters = await Promise.all(
                    items.slice(0, 10).map(async (genre) => {
                        try {
                            const discoverRes = await fetchJson(
                                `${TMDB_BASE}/discover/movie?language=${LANG}&with_genres=${genre.id}&sort_by=popularity.desc&vote_count.gte=50&page=1`,
                                BEARER
                            );

                            const results = Array.isArray(discoverRes?.results) ? discoverRes.results : [];
                            const posters = results.slice(0, 4).map((movie) => ({
                                id: movie?.id,
                                title: movie?.title || movie?.name || "",
                                poster: movie?.poster_path ? `${IMAGE_PREFIX}${movie.poster_path}` : "/example.jpg",
                            }));

                            while (posters.length < 4) {
                                posters.push({
                                    id: `${genre.id}-${posters.length}`,
                                    title: "",
                                    poster: "/example.jpg",
                                });
                            }

                            return {
                                id: genre.id,
                                title: capitalizeFirstLetter(genre.name),
                                posters,
                            };
                        } catch {
                            return {
                                id: genre.id,
                                title: capitalizeFirstLetter(genre.name),
                                posters: [
                                    { id: `${genre.id}-1`, title: "", poster: "/example.jpg" },
                                    { id: `${genre.id}-2`, title: "", poster: "/example.jpg" },
                                    { id: `${genre.id}-3`, title: "", poster: "/example.jpg" },
                                    { id: `${genre.id}-4`, title: "", poster: "/example.jpg" },
                                ],
                            };
                        }
                    })
                );

                if (mounted) setGenres(genresWithPosters);
            } catch (err) {
                if (mounted) setError(String(err?.message || err));
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const visibleGroups = useMemo(() => {
        const groups = [];
        for (let i = 0; i < genres.length; i += CARDS_PER_PAGE) {
            groups.push(genres.slice(i, i + CARDS_PER_PAGE));
        }
        return groups;
    }, [genres]);

    const openGenre = (genreId) => {
        if (navigate) {
            navigate(`/media/genre/movie/${genreId}`);
        }
    };

    return (
        <section className="categories-section">
            {error && (
                <div className="genre-toast" role="alert">
                    <strong>TMDB:</strong>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} aria-label="Закрыть">✕</button>
                </div>
            )}

            <div className="categories-head">
                <div className="categories-left">
                    <h3 className="categories-title">Изучите наш широкий выбор категорий</h3>
                    <h2 className="categories-under">
                        Ищете ли вы комедию, которая заставит вас рассмеяться, драму, которая заставит задуматься,
                        или документальный фильм, чтобы узнать что-то новое?
                    </h2>
                </div>

                <div className="categories-controls" role="tablist" aria-label="Навигация по категориям">
                    <button
                        className="ctrl-arrow"
                        onClick={onPrev}
                        disabled={page === 0}
                        aria-label="Назад"
                        title="Назад"
                    >
                        <img className="arrows" src="/Arrow_left.svg" alt="prev" />
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
                        <img className="arrows" src="/Arrow_right.svg" alt="next" />
                    </button>
                </div>
            </div>

            {loading && <div style={{ color: "#fff", marginBottom: 12 }}>Загрузка категорий TMDB…</div>}

            <div className="categories-slider-viewport">
                <div
                    className="categories-slider"
                    ref={containerRef}
                    style={{ transform: `translateX(-${page * 100}%)` }}
                >
                    {visibleGroups.map((group, grpIndex) => (
                        <div className="cards-page" key={grpIndex}>
                            {group.map((cat) => (
                                <article
                                    className="category-card"
                                    key={cat.id}
                                    onClick={() => openGenre(cat.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") openGenre(cat.id);
                                    }}
                                >
                                    <div className="poster-grid">
                                        {cat.posters.map((poster) => (
                                            <img
                                                key={poster.id}
                                                src={poster.poster}
                                                alt={poster.title}
                                                onError={(e) => {
                                                    e.currentTarget.src = "/example.jpg";
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="card-footer">
                                        <span className="cat-title">{cat.title}</span>
                                        <button
                                            className="cat-go"
                                            aria-label={`Перейти в ${cat.title}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openGenre(cat.id);
                                            }}
                                        >
                                            ➜
                                        </button>
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