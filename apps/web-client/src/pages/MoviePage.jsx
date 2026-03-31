// apps/web-client/src/pages/MoviePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../MoviePage.css";
import AdBanner from "../components/AdBanner.jsx";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_POSTER = "https://image.tmdb.org/t/p/w500";
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

function buildVkVideoUrl(title) {
    const q = encodeURIComponent(String(title || "").trim());
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

    const title = data.title || data.name || "Без названия";
    const hero = getPoster(data.backdrop_path || data.poster_path);
    const year = (data.release_date || data.first_air_date || "").slice(0, 4) || "—";
    const description = data.overview || "Описание отсутствует";
    const runtime = data.runtime || data.episode_run_time?.[0] || 0;
    const genres = Array.isArray(data.genres) ? data.genres.map(g => g.name) : [];
    const languages = Array.isArray(data.spoken_languages)
        ? data.spoken_languages.map(l => l.english_name || l.name).filter(Boolean)
        : [];

    const director =
        params.mediaType === "movie"
            ? credits?.crew?.find(p => p.job === "Director")
            : data?.created_by?.[0] || credits?.crew?.find(p => p.job === "Director");

    const music =
        credits?.crew?.find(p =>
            p.job === "Original Music Composer" ||
            p.job === "Music" ||
            p.department === "Music"
        );

    const cast = Array.isArray(credits?.cast) ? credits.cast.slice(0, 6) : [];
    const trailer =
        videos.find(v => v.site === "YouTube" && v.type === "Trailer") ||
        videos.find(v => v.site === "YouTube") ||
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
    );

    const visibleProviders = providersExpanded ? uniqueProviders : uniqueProviders.slice(0, 5);
    const hiddenCount = uniqueProviders.length > 5 ? uniqueProviders.length - 5 : 0;

    const vkVideoUrl = buildVkVideoUrl(title);

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

                <aside className="movie-side">
                    <div className="side-card">
                        <div className="side-block">
                            <div className="side-row">
                                <img src="/calendar.svg" alt="calendar" className="icon-movie" />
                                <strong className="side-label">Вышел:</strong>
                                <div className="side-value">{year}</div>
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
                                            <a
                                                key={provider.provider_id}
                                                href={regionWatch.link || "#"}
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
                                                title={provider.provider_name}
                                            >
                                                {provider.logo_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                        alt={provider.provider_name}
                                                        style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
                                                    />
                                                ) : null}
                                                <span>{provider.provider_name}</span>
                                            </a>
                                        ))}

                                        {uniqueProviders.length > 5 && (
                                            <button
                                                type="button"
                                                onClick={() => setProvidersExpanded(v => !v)}
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

                                    {providersExpanded && uniqueProviders.length > 5 && (
                                        <div style={{
                                            marginTop: 12,
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 12
                                        }}>
                                            {uniqueProviders.slice(5).map((provider) => (
                                                <a
                                                    key={provider.provider_id}
                                                    href={regionWatch.link || "#"}
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
                                                    title={provider.provider_name}
                                                >
                                                    {provider.logo_path ? (
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                            alt={provider.provider_name}
                                                            style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
                                                        />
                                                    ) : null}
                                                    <span>{provider.provider_name}</span>
                                                </a>
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