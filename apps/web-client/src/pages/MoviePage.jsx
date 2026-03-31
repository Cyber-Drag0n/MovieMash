// apps/web-client/src/pages/MoviePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../MoviePage.css";
import AdBanner from "../components/AdBanner.jsx";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_POSTER = "https://image.tmdb.org/t/p/original";
const IMAGE_PROFILE = "https://image.tmdb.org/t/p/w185";
const LANG = "ru-RU";
const DEFAULT_REGION = "RU";

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
    const res = await fetch(url, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${bearer}`,
        },
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${txt}`);
    }

    return res.json();
}

function getPoster(path) {
    return path ? `${IMAGE_POSTER}${path}` : "/example.jpg";
}

function getProfile(path) {
    return path ? `${IMAGE_PROFILE}${path}` : "/example.jpg";
}

function formatRuntime(minutes) {
    if (!minutes && minutes !== 0) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}ч ${m.toString().padStart(2, "0")}мин`;
}

function buildVkVideoUrl(query) {
    const q = encodeURIComponent(String(query || "").trim());
    return `https://vkvideo.ru/?q=${q}`;
}

function pickPreferredRegion(regions) {
    if (!regions || typeof regions !== "object") return DEFAULT_REGION;

    const keys = Object.keys(regions);
    if (keys.includes(DEFAULT_REGION)) return DEFAULT_REGION;

    const englishFallbacks = ["US", "GB", "CA", "AU", "NZ", "IE"];
    for (const code of englishFallbacks) {
        if (keys.includes(code)) return code;
    }

    return keys[0] || DEFAULT_REGION;
}

function formatSeasonTitle(season) {
    if (!season) return "Сезон";
    if (season.season_number === 0) return season.name || "Спецэпизоды";
    return season.name || `Сезон ${season.season_number}`;
}

function formatEpisodeQuery(seriesTitle, seasonNumber, episodeNumber, episodeName) {
    return `${seriesTitle} сезон ${seasonNumber} серия ${episodeNumber} ${episodeName || ""}`.trim();
}

function normalizeProviderName(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/[\s\u00A0]+/g, "")
        .replace(/[^a-zа-я0-9+]+/gi, "");
}

function buildProviderUrl(providerName, title) {
    const q = encodeURIComponent(String(title || "").trim());
    const n = normalizeProviderName(providerName);

    if (n.includes("primevideo") || n.includes("amazon")) {
        return `https://www.primevideo.com/search/ref=atv_nb_sr?ie=UTF8&phrase=${q}`;
    }

    if (n.includes("disney")) {
        return `https://www.disneyplus.com/browse/search?q=${q}`;
    }

    if (n.includes("netflix")) {
        return `https://www.netflix.com/search?q=${q}`;
    }

    if (n.includes("appletv") || n.includes("apple")) {
        return `https://tv.apple.com/search?term=${q}`;
    }

    if (n.includes("hulu")) {
        return `https://www.hulu.com/search?q=${q}`;
    }

    if (n.includes("paramount")) {
        return `https://www.paramountplus.com/search/?query=${q}`;
    }

    if (n.includes("peacock")) {
        return `https://www.peacocktv.com/watch/search/${q}`;
    }

    if (n.includes("crunchyroll")) {
        return `https://www.crunchyroll.com/search?from=&q=${q}`;
    }

    if (n.includes("mubi")) {
        return `https://mubi.com/search?query=${q}`;
    }

    if (n.includes("plex")) {
        return `https://watch.plex.tv/search?query=${q}`;
    }

    if (n.includes("youtube")) {
        return `https://www.youtube.com/results?search_query=${q}`;
    }

    return `https://www.google.com/search?q=${encodeURIComponent(`${providerName} ${title}`.trim())}`;
}

function capitalizeFirstLetter(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function MoviePage({ path, navigate }) {
    const params = useMemo(() => {
        const m = path.match(/^\/movie\/(movie|tv)\/(\d+)/);
        if (!m) return null;
        return { mediaType: m[1], id: Number(m[2]) };
    }, [path]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [credits, setCredits] = useState(null);
    const [videos, setVideos] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [watchProviders, setWatchProviders] = useState(null);
    const [watchRegion, setWatchRegion] = useState(DEFAULT_REGION);
    const [providersExpanded, setProvidersExpanded] = useState(false);

    const [seasonDetails, setSeasonDetails] = useState([]);
    const [seasonsLoading, setSeasonsLoading] = useState(false);
    const [expandedSeasons, setExpandedSeasons] = useState({});

    useEffect(() => {
        if (!params) return;

        const BEARER = getBearerFromEnv();
        if (!BEARER) {
            setError("TMDB token не найден. Положите VITE_TMDB_BEARER в apps/web-client/.env");
            setLoading(false);
            return;
        }

        let mounted = true;
        setLoading(true);
        setError(null);
        setProvidersExpanded(false);
        setSeasonDetails([]);
        setExpandedSeasons({});

        (async () => {
            try {
                const [details, creditsRes, videosRes, reviewsRes, similarRes, providersRes] = await Promise.all([
                    fetchJson(`${TMDB_BASE}/${params.mediaType}/${params.id}?language=${LANG}`, BEARER),
                    fetchJson(`${TMDB_BASE}/${params.mediaType}/${params.id}/credits?language=${LANG}`, BEARER),
                    fetchJson(`${TMDB_BASE}/${params.mediaType}/${params.id}/videos?language=${LANG}`, BEARER),
                    fetchJson(`${TMDB_BASE}/${params.mediaType}/${params.id}/reviews?language=${LANG}`, BEARER),
                    fetchJson(`${TMDB_BASE}/${params.mediaType}/${params.id}/similar?language=${LANG}`, BEARER),
                    fetchJson(`${TMDB_BASE}/${params.mediaType}/${params.id}/watch/providers`, BEARER),
                ]);

                if (!mounted) return;

                setData(details);
                setCredits(creditsRes);
                setVideos(Array.isArray(videosRes?.results) ? videosRes.results : []);
                setReviews(Array.isArray(reviewsRes?.results) ? reviewsRes.results : []);
                setSimilar(Array.isArray(similarRes?.results) ? similarRes.results : []);
                setWatchProviders(providersRes?.results || null);
                setWatchRegion(pickPreferredRegion(providersRes?.results || null));

                if (params.mediaType === "tv" && Array.isArray(details?.seasons)) {
                    const validSeasons = details.seasons.filter((s) => s && s.season_number !== 0);

                    if (validSeasons.length > 0) {
                        setSeasonsLoading(true);
                        const seasonsData = await Promise.all(
                            validSeasons.map(async (season) => {
                                try {
                                    const seasonRes = await fetchJson(
                                        `${TMDB_BASE}/tv/${params.id}/season/${season.season_number}?language=${LANG}`,
                                        BEARER
                                    );
                                    return seasonRes;
                                } catch {
                                    return season;
                                }
                            })
                        );

                        if (!mounted) return;

                        setSeasonDetails(seasonsData);
                        setExpandedSeasons((prev) => ({
                            ...prev,
                            [seasonsData[0]?.season_number ?? 1]: true,
                        }));
                        setSeasonsLoading(false);
                    }
                }
            } catch (err) {
                if (mounted) setError(String(err?.message || err));
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [params?.mediaType, params?.id]);

    if (!params) {
        return <div className="movie-page" style={{ color: "#fff", padding: 24 }}>Некорректный путь.</div>;
    }

    if (loading) {
        return <div className="movie-page" style={{ color: "#fff", padding: 24 }}>Загрузка...</div>;
    }

    if (error) {
        return (
            <div className="movie-page" style={{ color: "#fff", padding: 24 }}>
                <div style={{ marginBottom: 16 }}>Ошибка: {error}</div>
                <button className="btn-ghost" onClick={() => navigate("/media")}>Назад</button>
            </div>
        );
    }

    if (!data) {
        return <div className="movie-page" style={{ color: "#fff", padding: 24 }}>Нет данных.</div>;
    }

    const isSeries = params.mediaType === "tv";

    const title = data.title || data.name || "Без названия";
    const hero = getPoster(data.backdrop_path || data.poster_path);
    const year = (data.release_date || data.first_air_date || "").slice(0, 4) || "—";
    const description = data.overview || "Описание отсутствует";
    const runtime = data.runtime || data.episode_run_time?.[0] || 0;
    const genres = Array.isArray(data.genres) ? data.genres.map((g) => capitalizeFirstLetter(g.name)) : [];
    const languages = Array.isArray(data.spoken_languages)
        ? data.spoken_languages.map((l) => l.english_name || l.name).filter(Boolean)
        : [];

    const director =
        params.mediaType === "movie"
            ? credits?.crew?.find((p) => p.job === "Director")
            : data?.created_by?.[0] || credits?.crew?.find((p) => p.job === "Director");

    const music =
        credits?.crew?.find(
            (p) =>
                p.job === "Original Music Composer" ||
                p.job === "Music" ||
                p.department === "Music"
        );

    const cast = Array.isArray(credits?.cast) ? credits.cast.slice(0, 6) : [];
    const trailer =
        videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
        videos.find((v) => v.site === "YouTube") ||
        null;

    const similarItems = similar.slice(0, 12);
    const mainRating = Number(data.vote_average || 0).toFixed(1);

    const regionWatch = watchProviders?.[watchRegion] || null;

    const providerGroups = regionWatch
        ? [
            ...(regionWatch.flatrate || []),
            ...(regionWatch.buy || []),
            ...(regionWatch.rent || []),
            ...(regionWatch.ads || []),
        ]
        : [];

    const uniqueProviders = Array.from(
        new Map(providerGroups.map((p) => [p.provider_id, p])).values()
    )
        .sort((a, b) => (a.display_priority ?? 999) - (b.display_priority ?? 999));

    const visibleProviders = providersExpanded ? uniqueProviders : uniqueProviders.slice(0, 5);
    const hiddenProviders = uniqueProviders.slice(5);
    const hiddenCount = hiddenProviders.length;

    const vkVideoUrl = buildVkVideoUrl(title);

    const toggleSeason = (seasonNumber) => {
        setExpandedSeasons((prev) => ({
            ...prev,
            [seasonNumber]: !prev[seasonNumber],
        }));
    };

    const openProvider = (provider) => {
        const url = buildProviderUrl(provider?.provider_name, title);
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const renderSeriesSeasons = () => {
        if (!isSeries) return null;

        const seasons = seasonDetails.length > 0 ? seasonDetails : data?.seasons || [];

        return (
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 className="section-title">Сезоны и серии:</h3>

                {seasonsLoading && (
                    <div className="body-text" style={{ marginBottom: 12 }}>
                        Загружаем сезоны и серии...
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {seasons
                        .filter((season) => season && season.season_number !== 0)
                        .map((season) => {
                            const seasonNumber = season.season_number;
                            const seasonInfo = seasonDetails.find((s) => s.season_number === seasonNumber) || season;
                            const seasonEpisodes = Array.isArray(seasonInfo.episodes) ? seasonInfo.episodes : [];
                            const isOpen = !!expandedSeasons[seasonNumber];

                            return (
                                <div
                                    key={seasonNumber}
                                    style={{
                                        background: "#111",
                                        borderRadius: 14,
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        overflow: "hidden",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSeason(seasonNumber)}
                                        style={{
                                            width: "100%",
                                            background: "transparent",
                                            color: "#fff",
                                            border: "none",
                                            padding: "18px 20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 16, fontWeight: 700 }}>
                                                {formatSeasonTitle(seasonInfo)}
                                            </div>
                                            <div style={{ fontSize: 13, opacity: 0.8 }}>
                                                {seasonInfo.episode_count || seasonEpisodes.length || 0} серий
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: "50%",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 16,
                                            }}
                                        >
                                            {isOpen ? "↑" : "↓"}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div style={{ padding: "0 20px 18px" }}>
                                            {seasonInfo.overview && (
                                                <p className="body-text" style={{ marginBottom: 18 }}>
                                                    {seasonInfo.overview}
                                                </p>
                                            )}

                                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                                {seasonEpisodes.length > 0 ? seasonEpisodes.map((episode) => {
                                                    const episodeQuery = formatEpisodeQuery(
                                                        title,
                                                        seasonNumber,
                                                        episode.episode_number,
                                                        episode.name
                                                    );
                                                    const episodeUrl = buildVkVideoUrl(episodeQuery);
                                                    const runtimeLabel = formatRuntime(episode.runtime || 0);

                                                    return (
                                                        <a
                                                            key={episode.id || `${seasonNumber}-${episode.episode_number}`}
                                                            href={episodeUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "56px 130px 1fr auto",
                                                                gap: 16,
                                                                alignItems: "start",
                                                                padding: "14px 16px",
                                                                borderRadius: 12,
                                                                background: "#161616",
                                                                textDecoration: "none",
                                                                color: "#fff",
                                                                border: "1px solid rgba(255,255,255,0.05)",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 20,
                                                                    fontWeight: 700,
                                                                    opacity: 0.7,
                                                                    minWidth: 40,
                                                                }}
                                                            >
                                                                {String(episode.episode_number).padStart(2, "0")}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    width: 130,
                                                                    height: 74,
                                                                    borderRadius: 10,
                                                                    overflow: "hidden",
                                                                    background: "#0d0d0d",
                                                                    position: "relative",
                                                                }}
                                                            >
                                                                <img
                                                                    src={episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : "/example.jpg"}
                                                                    alt={episode.name || ""}
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "cover",
                                                                        display: "block",
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = "/example.jpg";
                                                                    }}
                                                                />
                                                                <div
                                                                    style={{
                                                                        position: "absolute",
                                                                        inset: 0,
                                                                        background: "rgba(0,0,0,0.18)",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        fontSize: 18,
                                                                    }}
                                                                >
                                                                    ▶
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                                                                    {episode.name || `Серия ${episode.episode_number}`}
                                                                </div>
                                                                <div
                                                                    className="body-text"
                                                                    style={{
                                                                        fontSize: 13,
                                                                        lineHeight: 1.45,
                                                                        opacity: 0.88,
                                                                    }}
                                                                >
                                                                    {episode.overview || "Описание серии отсутствует."}
                                                                </div>
                                                            </div>

                                                            <div
                                                                style={{
                                                                    whiteSpace: "nowrap",
                                                                    padding: "6px 10px",
                                                                    borderRadius: 999,
                                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                                    fontSize: 12,
                                                                    opacity: 0.9,
                                                                }}
                                                            >
                                                                {runtimeLabel}
                                                            </div>
                                                        </a>
                                                    );
                                                }) : (
                                                    <div className="body-text">Серии для этого сезона не найдены.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    return (
        <div className="movie-page">
            <div
                className="movie-hero"
                style={{ backgroundImage: `url(${hero})` }}
            >
                <div className="movie-hero-overlay">
                    <div className="container hero-inner">
                        <h1 className="movie-title">{title}</h1>
                        <p className="movie-sub muted-text">{description}</p>

                        <div className="hero-actions">
                            <button
                                className="btn-play"
                                aria-label="Смотреть"
                                onClick={() => {
                                    const el = document.getElementById("trailer-section");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                ▶ Смотреть
                            </button>

                            <button className="btn-ghost" aria-label="Добавить в список" title="Добавить в список">
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

            <div className="container movie-body">
                <div className="movie-main">
                    <div className="movie-desc card">
                        <h3 className="section-title">Описание:</h3>
                        <p className="body-text">{description}</p>
                    </div>

                    <div className="movie-cast card">
                        <h3 className="section-title">В ролях:</h3>
                        <div className="cast-row">
                            {cast.length > 0 ? cast.map((person) => (
                                <div key={person.cast_id || person.credit_id || person.id} className="cast-item">
                                    <img
                                        src={getProfile(person.profile_path)}
                                        alt={person.name || ""}
                                    />
                                </div>
                            )) : (
                                <div className="body-text">Актёры не найдены.</div>
                            )}
                        </div>
                    </div>

                    <div className="movie-reviews card">
                        <div className="reviews-header">
                            <h3 className="section-title">Отзывы:</h3>
                            <button className="btn-add" type="button">
                                + Добавить отзыв
                            </button>
                        </div>

                        <div className="reviews-grid">
                            {reviews.length > 0 ? reviews.slice(0, 4).map((r) => {
                                const rating = 4.5;
                                const full = Math.floor(rating);
                                const half = rating - full >= 0.5;
                                const empty = 5 - full - (half ? 1 : 0);

                                return (
                                    <article key={r.id} className="review-card">
                                        <div className="review-left">
                                            <strong className="review-author">{r.author || "Пользователь"}</strong>
                                            <small className="review-origin muted-text">{r.author_details?.username || "TMDB"}</small>
                                            <p className="review-text body-text">{r.content || ""}</p>
                                        </div>

                                        <div className="review-right">
                                            <span className="star-oval compact" aria-hidden="true">
                                                <span className="rating-row compact">
                                                    {Array.from({ length: full }).map((_, i) => (
                                                        <img key={i} src="/star-filled.svg" className="star-icon" alt="" />
                                                    ))}
                                                    {half && <img src="/star-half.svg" className="star-icon" alt="" />}
                                                    {Array.from({ length: empty }).map((_, i) => (
                                                        <img key={"e" + i} src="/star-empty.svg" className="star-icon" alt="" />
                                                    ))}
                                                </span>
                                                <span className="rating-number">{Math.round(rating)}</span>
                                            </span>
                                        </div>
                                    </article>
                                );
                            }) : (
                                <div className="body-text">Отзывы отсутствуют.</div>
                            )}
                        </div>

                        <div className="carousel-controls" aria-hidden="true">
                            <button className="ctrl-arrow" type="button" aria-label="Предыдущая">
                                <img src="/Arrow_left.svg" alt="prev" className="ctrl-arrow-img" />
                            </button>

                            <div className="prog-line">
                                <span className="dot active" />
                            </div>

                            <button className="ctrl-arrow" type="button" aria-label="Следующая">
                                <img src="/Arrow_right.svg" alt="next" className="ctrl-arrow-img" />
                            </button>
                        </div>
                    </div>

                    {renderSeriesSeasons()}
                </div>

                <aside className="movie-side">
                    <div className="side-card">
                        <div className="side-block">
                            <div className="side-row">
                                <img src="/calendar.svg" alt="calendar" className="icon-movie" />
                                <strong className="side-label">Вышел:</strong>
                                <div
                                    className="side-value"
                                    style={{
                                        whiteSpace: "nowrap",
                                        width: "fit-content",
                                        minWidth: "max-content",
                                        padding: "6px 14px",
                                    }}
                                >
                                    {year}
                                </div>
                            </div>
                        </div>

                        <div className="side-block">
                            <div className="side-row">
                                <img src="/language.svg" alt="language" className="icon-movie" />
                                <strong className="side-label">Доступные языки:</strong>
                            </div>
                            <div className="lang-list">
                                {(languages.length > 0 ? languages : ["Русский"]).map((l) => (
                                    <span key={l} className="pill">{l}</span>
                                ))}
                            </div>
                        </div>

                        <div className="side-block">
                            <div className="side-row">
                                <img src="/rate.svg" alt="rate" className="icon-movie" />
                                <strong className="side-label">Рейтинги:</strong>
                            </div>

                            <div className="rating-row-block">
                                <div className="rating-row-lbl muted-text">TMDB</div>
                                <div className="rating-row-val">
                                    <span className="star-oval small compact" aria-hidden="true">
                                        <span className="rating-row compact">
                                            {Array.from({ length: Math.floor(data.vote_average || 0) }).map((_, i) => (
                                                <img key={i} src="/star-filled.svg" className="star-icon" alt="" />
                                            ))}
                                            {Array.from({ length: 5 - Math.floor(data.vote_average || 0) }).map((_, i) => (
                                                <img key={"tm" + i} src="/star-empty.svg" className="star-icon" alt="" />
                                            ))}
                                        </span>
                                        <span className="rating-number">{mainRating}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="rating-row-block">
                                <div className="rating-row-lbl muted-text">MovieMash</div>
                                <div className="rating-row-val">
                                    <span className="star-oval small compact" aria-hidden="true">
                                        <span className="rating-row compact">
                                            <img src="/star-filled.svg" className="star-icon" alt="" />
                                            <img src="/star-filled.svg" className="star-icon" alt="" />
                                            <img src="/star-filled.svg" className="star-icon" alt="" />
                                            <img src="/star-filled.svg" className="star-icon" alt="" />
                                            <img src="/star-empty.svg" className="star-icon" alt="" />
                                        </span>
                                        <span className="rating-number">4</span>
                                    </span>
                                </div>
                            </div>

                            <div className="rating-row-block">
                                <div className="rating-row-lbl muted-text">Длительность</div>
                                <div className="rating-row-val">
                                    <span className="pill">{formatRuntime(runtime)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="side-block">
                            <div className="side-row">
                                <img src="/genres.svg" alt="genres" className="icon-movie" />
                                <strong className="side-label">Жанры:</strong>
                            </div>
                            <div className="tags">
                                {genres.length > 0 ? genres.map((g) => <span key={g} className="pill">{g}</span>) : <span className="pill">—</span>}
                            </div>
                        </div>

                        <div className="side-block">
                            <strong className="side-label">Режиссёр:</strong>
                            <div className="person">
                                <img
                                    src={getProfile(director?.profile_path)}
                                    alt={director?.name || ""}
                                />
                                <div className="person-name">{director?.name || "Не указан"}</div>
                            </div>
                        </div>

                        <div className="side-block">
                            <strong className="side-label">Музыка:</strong>
                            <div className="person">
                                <img
                                    src={getProfile(music?.profile_path)}
                                    alt={music?.name || ""}
                                />
                                <div className="person-name">{music?.name || "Не указано"}</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <div className="movie-cta">
                <div className="card" style={{ marginBottom: 24 }} id="trailer-section">
                    <h3 className="section-title">Трейлер:</h3>
                    {trailer ? (
                        <iframe
                            width="100%"
                            height="500"
                            src={`https://www.youtube.com/embed/${trailer.key}`}
                            title="Trailer"
                            frameBorder="0"
                            allowFullScreen
                            style={{ borderRadius: 16 }}
                        />
                    ) : (
                        <div className="body-text">Трейлер не найден.</div>
                    )}
                </div>

                <div className="card" style={{ marginBottom: 24 }}>
                    <h3 className="section-title">Где смотреть:</h3>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                        <a
                            href={vkVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 14px",
                                borderRadius: 12,
                                background: "#1f1f1f",
                                color: "#fff",
                                textDecoration: "none",
                                border: "1px solid rgba(255,255,255,0.08)"
                            }}
                        >
                            Смотреть в VK Video
                        </a>
                    </div>

                    {watchProviders && Object.keys(watchProviders).length > 0 ? (
                        <>
                            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                                <span style={{ color: "#fff", opacity: 0.85 }}>Регион:</span>
                                <select
                                    value={watchRegion}
                                    onChange={(e) => {
                                        setWatchRegion(e.target.value);
                                        setProvidersExpanded(false);
                                    }}
                                    style={{
                                        background: "#1f1f1f",
                                        color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        borderRadius: 10,
                                        padding: "10px 12px",
                                        outline: "none"
                                    }}
                                >
                                    {Object.keys(watchProviders).map((code) => (
                                        <option key={code} value={code}>
                                            {code}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {regionWatch && uniqueProviders.length > 0 ? (
                                <>
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 12,
                                        alignItems: "center"
                                    }}>
                                        {visibleProviders.map((provider) => (
                                            <button
                                                key={provider.provider_id}
                                                type="button"
                                                onClick={() => openProvider(provider)}
                                                title={provider.provider_name}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    padding: "10px 14px",
                                                    borderRadius: 12,
                                                    background: "#1f1f1f",
                                                    color: "#fff",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {provider.logo_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                        alt={provider.provider_name}
                                                        style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
                                                    />
                                                ) : null}
                                                <span>{provider.provider_name}</span>
                                            </button>
                                        ))}

                                        {hiddenCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setProvidersExpanded((v) => !v)}
                                                style={{
                                                    cursor: "pointer",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    padding: "10px 14px",
                                                    borderRadius: 12,
                                                    background: providersExpanded ? "#2b2b2b" : "#1f1f1f",
                                                    color: "#fff",
                                                    border: "1px solid rgba(255,255,255,0.08)"
                                                }}
                                            >
                                                {providersExpanded ? "Свернуть" : `Показать ещё ${hiddenCount}`}
                                            </button>
                                        )}
                                    </div>

                                    {providersExpanded && hiddenProviders.length > 0 && (
                                        <div style={{
                                            marginTop: 12,
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 12
                                        }}>
                                            {hiddenProviders.map((provider) => (
                                                <button
                                                    key={provider.provider_id}
                                                    type="button"
                                                    onClick={() => openProvider(provider)}
                                                    title={provider.provider_name}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                        padding: "10px 14px",
                                                        borderRadius: 12,
                                                        background: "#1f1f1f",
                                                        color: "#fff",
                                                        border: "1px solid rgba(255,255,255,0.08)",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    {provider.logo_path ? (
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                            alt={provider.provider_name}
                                                            style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
                                                        />
                                                    ) : null}
                                                    <span>{provider.provider_name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 12, opacity: 0.8 }}>
                                        TMDB показывает, где тайтл доступен в выбранном регионе.
                                    </div>
                                </>
                            ) : (
                                <div className="body-text">
                                    В выбранном регионе сейчас нет доступных сервисов по данным TMDB.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="body-text">
                            TMDB не вернул список сервисов для этого тайтла. VK Video остаётся запасным вариантом.
                        </div>
                    )}
                </div>

                <AdBanner />
            </div>

            {similarItems.length > 0 && (
                <div className="container" style={{ marginTop: 40 }}>
                    <h3 className="section-title" style={{ color: "#fff" }}>Похожие</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 18 }}>
                        {similarItems.map((item) => (
                            <article
                                key={item.id}
                                className="genre-card"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/movie/${params.mediaType}/${item.id}`)}
                            >
                                <img
                                    src={getPoster(item.poster_path)}
                                    alt={item.title || item.name || ""}
                                    className="genre-card__img"
                                />
                                <div className="genre-card__body">
                                    <div className="genre-card__title">{item.title || item.name || "Без названия"}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}