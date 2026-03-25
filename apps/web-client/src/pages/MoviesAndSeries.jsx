import React, { useEffect, useRef, useState } from "react";
import CarouselControls from "../components/CarouselControls";
import AdBanner from "../components/AdBanner";

/**
 * MoviesAndSeries — frontend -> TMDB
 * Положи VITE_TMDB_BEARER в .env.local
 */

const TMDB_BASE = "https://api.themoviedb.org/3";
const LANG = "ru-RU";
const IMAGE_PREFIX = "https://image.tmdb.org/t/p/w300";

function getBearerFromEnv() {
    try {
        if (typeof window !== "undefined" && import.meta?.env?.VITE_TMDB_BEARER) {
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

function mediaPath(item, fallbackType = "movie") {
    const type = item?.media_type === "tv" || item?.name ? "tv" : fallbackType;
    return `/movie/${type}/${item?.id}`;
}

function openMediaPath(navigate, item, fallbackType = "movie") {
    if (!navigate || !item?.id) return;
    navigate(mediaPath(item, fallbackType));
}

/**
 * TMDB rating is 0..10, stars UI is 0..5.
 * We keep it simple and convert to a 5-star value.
 */
function toFiveStars(rating10) {
    const value = Number(rating10 || 0);
    return Math.max(0, Math.min(5, Math.round((value / 10) * 5)));
}

function StarRow({ rating10 }) {
    const rating5 = toFiveStars(rating10);
    const fullStars = Math.floor(rating5);
    const emptyStars = 5 - fullStars;

    return (
        <span className="rating-row" aria-label={`Рейтинг ${rating10 || 0} из 10`}>
            {Array.from({ length: fullStars }).map((_, i) => (
                <img key={`full-${i}`} src="/star-filled.svg" alt="" className="star-icon" />
            ))}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <img key={`empty-${i}`} src="/star-empty.svg" alt="" className="star-icon" />
            ))}
        </span>
    );
}

export default function MoviesAndSeries({ navigate }) {
    const [heroIndex, setHeroIndex] = useState(0);
    const autoplayRef = useRef(null);

    const TOP_GENRES_PER_PAGE = 4;
    const TRENDS_PER_PAGE = 5;
    const NEW_PER_PAGE = 5;

    const [topGenrePage, setTopGenrePage] = useState(0);
    const [trendsPage, setTrendsPage] = useState(0);
    const [newPage, setNewPage] = useState(0);

    const [topGenrePageSeries, setTopGenrePageSeries] = useState(0);
    const [trendsPageSeries, setTrendsPageSeries] = useState(0);
    const [newPageSeries, setNewPageSeries] = useState(0);

    const [tmdbGroups, setTmdbGroups] = useState([]);
    const [trends, setTrends] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [mustWatch, setMustWatch] = useState([]);
    const [heroSlides, setHeroSlides] = useState([]);

    const [tmdbGroupsSeries, setTmdbGroupsSeries] = useState([]);
    const [trendsSeries, setTrendsSeries] = useState([]);
    const [newReleasesSeries, setNewReleasesSeries] = useState([]);
    const [mustWatchSeries, setMustWatchSeries] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const topGenresPagesCount = Math.max(1, Math.ceil(tmdbGroups.length / TOP_GENRES_PER_PAGE));
    const trendsPagesCount = Math.max(1, Math.ceil(trends.length / TRENDS_PER_PAGE));
    const newPagesCount = Math.max(1, Math.ceil(newReleases.length / NEW_PER_PAGE));

    const topGenresPagesCountSeries = Math.max(1, Math.ceil(tmdbGroupsSeries.length / TOP_GENRES_PER_PAGE));
    const trendsPagesCountSeries = Math.max(1, Math.ceil(trendsSeries.length / TRENDS_PER_PAGE));
    const newPagesCountSeries = Math.max(1, Math.ceil(newReleasesSeries.length / NEW_PER_PAGE));

    useEffect(() => {
        const len = Math.max(1, heroSlides.length || 1);
        autoplayRef.current = setInterval(() => setHeroIndex((i) => (i + 1) % len), 8000);
        return () => clearInterval(autoplayRef.current);
    }, [heroSlides.length]);

    useEffect(() => {
        const BEARER = getBearerFromEnv();
        if (!BEARER) {
            setError("TMDB token не найден. Положите VITE_TMDB_BEARER в .env.local");
            return;
        }

        let mounted = true;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const [genresRes, tvGenresRes] = await Promise.all([
                    fetchJson(`${TMDB_BASE}/genre/movie/list?language=${LANG}`, BEARER),
                    fetchJson(`${TMDB_BASE}/genre/tv/list?language=${LANG}`, BEARER),
                ]);

                if (!mounted) return;

                const genres = Array.isArray(genresRes?.genres) ? genresRes.genres : [];
                const tvGenresData = Array.isArray(tvGenresRes?.genres) ? tvGenresRes.genres : [];

                const [trendingMoviesRes, trendingTVRes] = await Promise.all([
                    fetchJson(`${TMDB_BASE}/trending/movie/week?language=${LANG}`, BEARER),
                    fetchJson(`${TMDB_BASE}/trending/tv/week?language=${LANG}`, BEARER),
                ]);

                const trendingMovies = Array.isArray(trendingMoviesRes?.results) ? trendingMoviesRes.results : [];
                const trendingTV = Array.isArray(trendingTVRes?.results) ? trendingTVRes.results : [];

                const hero = trendingMovies.slice(0, 4).map((m) => ({
                    id: m?.id,
                    title: m?.title || m?.name || "Без названия",
                    desc: m?.overview || "",
                    bg: m?.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
                        : (m?.poster_path ? `${IMAGE_PREFIX}${m.poster_path}` : "/example.jpg"),
                    tmdb: m,
                }));
                setHeroSlides(hero);

                setTrends(
                    trendingMovies.slice(0, 12).map((m) => ({
                        id: m?.id,
                        img: m?.poster_path ? `${IMAGE_PREFIX}${m.poster_path}` : "/example.jpg",
                        title: m?.title || m?.name || "",
                        duration: "-",
                        views: `${m?.vote_count ?? 0}`,
                        tmdb: m,
                    }))
                );

                let nowPlaying = [];
                try {
                    const np = await fetchJson(`${TMDB_BASE}/movie/now_playing?language=${LANG}&page=1`, BEARER);
                    nowPlaying = Array.isArray(np?.results) ? np.results : [];
                    if (nowPlaying.length === 0) {
                        const up = await fetchJson(`${TMDB_BASE}/movie/upcoming?language=${LANG}&page=1`, BEARER);
                        nowPlaying = Array.isArray(up?.results) ? up.results : [];
                    }
                } catch {
                    nowPlaying = [];
                }

                setNewReleases(
                    nowPlaying.slice(0, 12).map((m) => ({
                        id: m?.id,
                        img: m?.poster_path ? `${IMAGE_PREFIX}${m.poster_path}` : "/example.jpg",
                        release: m?.release_date ? `Вышел ${m.release_date}` : "Дата неизвестна",
                        tmdb: m,
                    }))
                );

                try {
                    const popular = await fetchJson(`${TMDB_BASE}/movie/popular?language=${LANG}&page=1`, BEARER);
                    const popularArr = Array.isArray(popular?.results) ? popular.results : [];
                    setMustWatch(
                        popularArr.slice(0, 6).map((m) => ({
                            id: m?.id,
                            img: m?.poster_path ? `${IMAGE_PREFIX}${m.poster_path}` : "/example.jpg",
                            duration: "-",
                            rating: Number(m?.vote_average || 0),
                            votes: `${m?.vote_count ?? 0}`,
                            tmdb: m,
                        }))
                    );
                } catch {
                    setMustWatch([]);
                }

                const GENRE_LIMIT = 8;
                const PER_GENRE = 8;
                const selectedGenres = genres.slice(0, GENRE_LIMIT);

                const groupsPromises = selectedGenres.map((g) =>
                    fetchJson(
                        `${TMDB_BASE}/discover/movie?language=${LANG}&with_genres=${g.id}&sort_by=popularity.desc&vote_count.gte=30&page=1`,
                        BEARER
                    )
                        .then((d) => ({ genre: g, items: Array.isArray(d?.results) ? d.results.slice(0, PER_GENRE) : [] }))
                        .catch(() => ({ genre: g, items: [] }))
                );
                const groups = await Promise.all(groupsPromises);
                setTmdbGroups(groups);

                let onTheAir = [];
                try {
                    const ota = await fetchJson(`${TMDB_BASE}/tv/on_the_air?language=${LANG}&page=1`, BEARER);
                    onTheAir = Array.isArray(ota?.results) ? ota.results : [];
                    if (onTheAir.length === 0) {
                        const popularTv = await fetchJson(`${TMDB_BASE}/tv/popular?language=${LANG}&page=1`, BEARER);
                        onTheAir = Array.isArray(popularTv?.results) ? popularTv.results : [];
                    }
                } catch {
                    onTheAir = [];
                }

                setNewReleasesSeries(
                    onTheAir.slice(0, 12).map((t) => ({
                        id: t?.id,
                        img: t?.poster_path ? `${IMAGE_PREFIX}${t.poster_path}` : "/example.jpg",
                        release: t?.first_air_date ? `Вышел ${t.first_air_date}` : "Дата неизвестна",
                        duration: "-",
                        seasons: t?.number_of_seasons ? `${t.number_of_seasons} сез.` : "",
                        tmdb: t,
                    }))
                );

                setTrendsSeries(
                    trendingTV.slice(0, 12).map((t) => ({
                        id: t?.id,
                        img: t?.poster_path ? `${IMAGE_PREFIX}${t.poster_path}` : "/example.jpg",
                        title: t?.name || t?.title || "",
                        duration: "-",
                        views: `${t?.vote_count ?? 0}`,
                        tmdb: t,
                    }))
                );

                try {
                    const popularTv = await fetchJson(`${TMDB_BASE}/tv/popular?language=${LANG}&page=1`, BEARER);
                    const arr = Array.isArray(popularTv?.results) ? popularTv.results : [];
                    setMustWatchSeries(
                        arr.slice(0, 6).map((t) => ({
                            id: t?.id,
                            img: t?.poster_path ? `${IMAGE_PREFIX}${t.poster_path}` : "/example.jpg",
                            duration: "-",
                            rating: Number(t?.vote_average || 0),
                            votes: `${t?.vote_count ?? 0}`,
                            tmdb: t,
                        }))
                    );
                } catch {
                    setMustWatchSeries([]);
                }

                const selectedTvGenres = tvGenresData.slice(0, GENRE_LIMIT);
                const groupsTvPromises = selectedTvGenres.map((g) =>
                    fetchJson(
                        `${TMDB_BASE}/discover/tv?language=${LANG}&with_genres=${g.id}&sort_by=popularity.desc&page=1`,
                        BEARER
                    )
                        .then((d) => ({ genre: g, items: Array.isArray(d?.results) ? d.results.slice(0, PER_GENRE) : [] }))
                        .catch(() => ({ genre: g, items: [] }))
                );
                const groupsTv = await Promise.all(groupsTvPromises);
                setTmdbGroupsSeries(groupsTv);
            } catch (err) {
                console.error("TMDB load error:", err);
                if (mounted) setError(String(err?.message || err));
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const onHeroEnter = () => clearInterval(autoplayRef.current);
    const onHeroLeave = () => {
        clearInterval(autoplayRef.current);
        autoplayRef.current = setInterval(
            () => setHeroIndex((i) => (i + 1) % Math.max(1, heroSlides.length || 1)),
            8000
        );
    };

    const heroPrev = () => setHeroIndex((i) => (i - 1 + Math.max(1, heroSlides.length || 1)) % Math.max(1, heroSlides.length || 1));
    const heroNext = () => setHeroIndex((i) => (i + 1) % Math.max(1, heroSlides.length || 1));
    const heroGoTo = (i) => setHeroIndex(i);

    const topPrev = () => setTopGenrePage((p) => Math.max(0, p - 1));
    const topNext = () => setTopGenrePage((p) => Math.min(topGenresPagesCount - 1, p + 1));
    const trendsPrev = () => setTrendsPage((p) => Math.max(0, p - 1));
    const trendsNext = () => setTrendsPage((p) => Math.min(trendsPagesCount - 1, p + 1));
    const newPrev = () => setNewPage((p) => Math.max(0, p - 1));
    const newNext = () => setNewPage((p) => Math.min(newPagesCount - 1, p + 1));

    const topPrevSeries = () => setTopGenrePageSeries((p) => Math.max(0, p - 1));
    const topNextSeries = () => setTopGenrePageSeries((p) => Math.min(topGenresPagesCountSeries - 1, p + 1));
    const trendsPrevSeries = () => setTrendsPageSeries((p) => Math.max(0, p - 1));
    const trendsNextSeries = () => setTrendsPageSeries((p) => Math.min(trendsPagesCountSeries - 1, p + 1));
    const newPrevSeries = () => setNewPageSeries((p) => Math.max(0, p - 1));
    const newNextSeries = () => setNewPageSeries((p) => Math.min(newPagesCountSeries - 1, p + 1));

    const openGenrePage = (mediaType, genre) => {
        if (!navigate || !genre?.id) return;
        navigate(`/media/genre/${mediaType}/${genre.id}`);
    };

    const renderTopGenresPage = (page) => {
        const groups = [];
        for (let i = 0; i < tmdbGroups.length; i += TOP_GENRES_PER_PAGE) {
            groups.push(tmdbGroups.slice(i, i + TOP_GENRES_PER_PAGE));
        }
        const slice = groups[page] || [];

        return (
            <div className="top-genres-grid">
                {slice.map(({ genre, items }) => (
                    <article
                        className="category-card top-card"
                        key={String(genre.id)}
                        style={{ cursor: "pointer" }}
                        onClick={() => openGenrePage("movie", genre)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") openGenrePage("movie", genre);
                        }}
                    >
                        <div className="poster-wrap">
                            <div className="poster-grid">
                                {Array.from({ length: 4 }).map((_, idx) => {
                                    const it = items[idx];
                                    const src = it?.poster_path ? `${IMAGE_PREFIX}${it.poster_path}` : "/example.jpg";
                                    return (
                                        <img
                                            key={idx}
                                            src={src}
                                            alt={it ? (it.title || it.name || "") : ""}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={(ev) => {
                                                ev.currentTarget.src = "/example.jpg";
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="card-footer top-card-footer">
                            <span className="top-badge">Топ-10 в</span>
                            <span className="cat-title">{genre.name}</span>
                            <button
                                className="cat-go"
                                aria-label={`Открыть жанр ${genre.name}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openGenrePage("movie", genre);
                                }}
                            >
                                ➜
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    const renderTopGenresPageSeries = (page) => {
        const groups = [];
        for (let i = 0; i < tmdbGroupsSeries.length; i += TOP_GENRES_PER_PAGE) {
            groups.push(tmdbGroupsSeries.slice(i, i + TOP_GENRES_PER_PAGE));
        }
        const slice = groups[page] || [];

        return (
            <div className="top-genres-grid">
                {slice.map(({ genre, items }) => (
                    <article
                        className="category-card top-card"
                        key={String(genre.id)}
                        style={{ cursor: "pointer" }}
                        onClick={() => openGenrePage("tv", genre)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") openGenrePage("tv", genre);
                        }}
                    >
                        <div className="poster-wrap">
                            <div className="poster-grid">
                                {Array.from({ length: 4 }).map((_, idx) => {
                                    const it = items[idx];
                                    const src = it?.poster_path ? `${IMAGE_PREFIX}${it.poster_path}` : "/example.jpg";
                                    return (
                                        <img
                                            key={idx}
                                            src={src}
                                            alt={it ? (it.name || it.title || "") : ""}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={(ev) => {
                                                ev.currentTarget.src = "/example.jpg";
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="card-footer top-card-footer">
                            <span className="top-badge">Топ-10 в</span>
                            <span className="cat-title">{genre.name}</span>
                            <button
                                className="cat-go"
                                aria-label={`Открыть жанр ${genre.name}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openGenrePage("tv", genre);
                                }}
                            >
                                ➜
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    function MustWatchCard({ item }) {
        return (
            <article
                className="category-card top-card must-card"
                role="listitem"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => openMediaPath(navigate, item.tmdb, "movie")}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openMediaPath(navigate, item.tmdb, "movie");
                }}
            >
                <div className="must-poster-wrap">
                    <img
                        src={item.img}
                        alt={item.title || ""}
                        className="must-poster"
                        onError={(ev) => {
                            ev.currentTarget.src = "/example.jpg";
                        }}
                    />
                </div>

                <span className="trend-badge left must-left" aria-hidden="true">
                    <img src="/Time.svg" alt="" />
                    <span className="badge-text">{item.duration}</span>
                </span>

                <span className="trend-badge right must-right" aria-hidden="true">
                    <StarRow rating10={item.rating} />
                    <span className="badge-text votes-text">{item.votes}</span>
                </span>
            </article>
        );
    }

    function MustWatchCardSeries({ item }) {
        return (
            <article
                className="category-card top-card must-card"
                role="listitem"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => openMediaPath(navigate, item.tmdb, "tv")}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openMediaPath(navigate, item.tmdb, "tv");
                }}
            >
                <div className="must-poster-wrap">
                    <img
                        src={item.img}
                        alt={item.title || ""}
                        className="must-poster"
                        onError={(ev) => {
                            ev.currentTarget.src = "/example.jpg";
                        }}
                    />
                </div>

                <span className="trend-badge left must-left" aria-hidden="true">
                    <img src="/Time.svg" alt="" />
                    <span className="badge-text">{item.duration}</span>
                </span>

                <span className="trend-badge right must-right" aria-hidden="true">
                    <StarRow rating10={item.rating} />
                    <span className="badge-text votes-text">{item.votes}</span>
                </span>
            </article>
        );
    }

    const renderMustWatch = () => (
        <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 60px", padding: "0 12px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className="categories-title">Фильмы, которые обязательно нужно посмотреть</h3>
                <CarouselControls page={0} pages={1} onPrev={() => {}} onNext={() => {}} />
            </div>
            <div style={{ padding: "12px 0 0" }}>
                <div className="must-row" role="list">
                    {mustWatch.map((m) => (
                        <MustWatchCard key={m.id} item={m} />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMustWatchSeries = () => (
        <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 60px", padding: "0 12px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className="categories-title">Сериалы, которые обязательно нужно посмотреть</h3>
                <CarouselControls page={0} pages={1} onPrev={() => {}} onNext={() => {}} />
            </div>
            <div style={{ padding: "12px 0 0" }}>
                <div className="must-row" role="list">
                    {mustWatchSeries.map((m) => (
                        <MustWatchCardSeries key={`s${m.id}`} item={m} />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderTrendsPage = (page) => {
        const start = page * TRENDS_PER_PAGE;
        const slice = trends.slice(start, start + TRENDS_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map((t, idx) => (
                    <article
                        className="trend-card"
                        key={`${t.id}-${idx}`}
                        role="listitem"
                        style={{ cursor: "pointer" }}
                        onClick={() => openMediaPath(navigate, t.tmdb, "movie")}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") openMediaPath(navigate, t.tmdb, "movie");
                        }}
                    >
                        <div className="trend-poster-wrap" aria-hidden="true">
                            <img
                                src={t.img}
                                className="trend-poster"
                                alt={t.title || ""}
                                onError={(ev) => {
                                    ev.currentTarget.src = "/example.jpg";
                                }}
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

    const renderTrendsPageSeries = (page) => {
        const start = page * TRENDS_PER_PAGE;
        const slice = trendsSeries.slice(start, start + TRENDS_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map((t, idx) => (
                    <article
                        className="trend-card"
                        key={`s${t.id}-${idx}`}
                        role="listitem"
                        style={{ cursor: "pointer" }}
                        onClick={() => openMediaPath(navigate, t.tmdb, "tv")}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") openMediaPath(navigate, t.tmdb, "tv");
                        }}
                    >
                        <div className="trend-poster-wrap" aria-hidden="true">
                            <img
                                src={t.img}
                                className="trend-poster"
                                alt={t.title || ""}
                                onError={(ev) => {
                                    ev.currentTarget.src = "/example.jpg";
                                }}
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

    const renderNewReleasesPage = (page) => {
        const start = page * NEW_PER_PAGE;
        const slice = newReleases.slice(start, start + NEW_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map((it) => (
                    <article
                        className="category-card new-card"
                        key={it.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openMediaPath(navigate, it.tmdb, "movie")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") openMediaPath(navigate, it.tmdb, "movie");
                        }}
                    >
                        <div className="new-poster-wrap" aria-hidden="true">
                            <img
                                src={it.img}
                                alt={it.title || ""}
                                className="new-poster"
                                onError={(ev) => {
                                    ev.currentTarget.src = "/example.jpg";
                                }}
                            />
                        </div>
                        <span className="trend-badge left release-badge" style={{ position: "absolute", bottom: 12, left: 12 }}>
                            <img src="/Time.svg" alt="" />
                            <span className="badge-text release-badge-text">{it.release}</span>
                        </span>
                    </article>
                ))}
            </div>
        );
    };

    const renderNewReleasesPageSeries = (page) => {
        const start = page * NEW_PER_PAGE;
        const slice = newReleasesSeries.slice(start, start + NEW_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map((it) => (
                    <article
                        className="category-card new-card"
                        key={it.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openMediaPath(navigate, it.tmdb, "tv")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") openMediaPath(navigate, it.tmdb, "tv");
                        }}
                    >
                        <div className="new-poster-wrap" aria-hidden="true">
                            <img
                                src={it.img}
                                alt={it.title || ""}
                                className="new-poster"
                                onError={(ev) => {
                                    ev.currentTarget.src = "/example.jpg";
                                }}
                            />
                        </div>

                        <span className="trend-badge left release-badge" style={{ position: "absolute", bottom: 12, left: 12 }}>
                            <img src="/Time.svg" alt="" />
                            <span className="badge-text release-badge-text">{it.release}</span>
                        </span>

                        <span className="trend-badge right release-badge" style={{ position: "absolute", bottom: 12, right: 12 }}>
                            <img src="/Seasons.svg" alt="" />
                            <span className="badge-text release-badge-text">{it.seasons}</span>
                        </span>
                    </article>
                ))}
            </div>
        );
    };

    return (
        <section className="ms-page" aria-label="Фильмы и сериалы">
            {error && (
                <div
                    style={{
                        position: "fixed",
                        top: 12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#b21f2d",
                        color: "#fff",
                        padding: "10px 16px",
                        borderRadius: 8,
                        zIndex: 9999,
                        boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
                        maxWidth: "90%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                    role="alert"
                >
                    <strong>TMDB:</strong>
                    <span style={{ whiteSpace: "pre-wrap" }}>{String(error)}</span>
                    <button
                        onClick={() => setError(null)}
                        style={{ marginLeft: 12, background: "transparent", color: "#fff", border: "none", cursor: "pointer" }}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="ms-hero" onMouseEnter={onHeroEnter} onMouseLeave={onHeroLeave}>
                {heroSlides.length > 0 && (
                    <img
                        className="ms-bg-img"
                        src={heroSlides[heroIndex]?.bg}
                        alt={heroSlides[heroIndex]?.title || ""}
                    />
                )}
                <div className="ms-hero-overlay" />

                <button className="ms-hero-arrow left" onClick={heroPrev} aria-label="Предыдущий">
                    <img src="/Arrow_left.svg" alt="Назад" />
                </button>
                <button className="ms-hero-arrow right" onClick={heroNext} aria-label="Следующий">
                    <img src="/Arrow_right.svg" alt="Вперед" />
                </button>

                <div className="ms-hero-center">
                    <h1 className="ms-hero-title">{heroSlides[heroIndex]?.title || "Популярные фильмы"}</h1>
                    <p className="ms-hero-desc">{heroSlides[heroIndex]?.desc || ""}</p>

                    <div className="ms-hero-actions" role="group" aria-label="Действия с фильмом">
                        <button
                            className="ms-btn ms-btn-play"
                            aria-label={`Смотреть ${heroSlides[heroIndex]?.title || ""}`}
                            onClick={() => openMediaPath(navigate, heroSlides[heroIndex]?.tmdb, "movie")}
                        >
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
                    {(heroSlides.length ? heroSlides : [{}, {}, {}]).map((_, i) => (
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

            <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><h3 className="categories-title">Популярный Топ-10 по жанрам</h3></div>
                    <CarouselControls page={topGenrePage} pages={topGenresPagesCount} onPrev={topPrev} onNext={topNext} />
                </div>

                <div style={{ padding: "18px 0 40px" }}>
                    {loading && <div style={{ marginBottom: 8 }}>Загружаем актуальные топы с TMDB...</div>}
                    {renderTopGenresPage(topGenrePage)}
                </div>
            </div>

            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 60px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">В трендах</h3>
                    <CarouselControls page={trendsPage} pages={trendsPagesCount} onPrev={trendsPrev} onNext={trendsNext} />
                </div>
                <div style={{ overflow: "hidden" }}>{renderTrendsPage(trendsPage)}</div>
            </div>

            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">Новинки фильмов</h3>
                    <CarouselControls page={newPage} pages={newPagesCount} onPrev={newPrev} onNext={newNext} />
                </div>
                <div style={{ overflow: "hidden" }}>{renderNewReleasesPage(newPage)}</div>
            </div>

            {renderMustWatch()}

            <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><h3 className="categories-title">Популярный Топ-10 по жанрам</h3></div>
                    <CarouselControls page={topGenrePageSeries} pages={topGenresPagesCountSeries} onPrev={topPrevSeries} onNext={topNextSeries} />
                </div>
                <div style={{ padding: "18px 0 40px" }}>
                    {renderTopGenresPageSeries(topGenrePageSeries)}
                </div>
            </div>

            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 60px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">В трендах</h3>
                    <CarouselControls page={trendsPageSeries} pages={trendsPagesCountSeries} onPrev={trendsPrevSeries} onNext={trendsNextSeries} />
                </div>
                <div style={{ overflow: "hidden" }}>{renderTrendsPageSeries(trendsPageSeries)}</div>
            </div>

            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">Новинки сериалов</h3>
                    <CarouselControls page={newPageSeries} pages={newPagesCountSeries} onPrev={newPrevSeries} onNext={newNextSeries} />
                </div>
                <div style={{ overflow: "hidden", position: "relative" }}>{renderNewReleasesPageSeries(newPageSeries)}</div>
            </div>

            {renderMustWatchSeries()}

            <AdBanner />
        </section>
    );
}