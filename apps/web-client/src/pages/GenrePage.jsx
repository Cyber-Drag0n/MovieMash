// apps/web-client/src/pages/GenrePage.jsx
import React, { useEffect, useMemo, useState } from "react";

const TMDB_BASE = "https://api.themoviedb.org/3";
const LANG = "ru-RU";
const IMAGE_PREFIX = "https://image.tmdb.org/t/p/w300";
const CARDS_PER_PAGE = 24;
const TMDB_PAGE_SIZE = 20;

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

async function fetchGenreBatch({ mediaType, genreId, uiPage, bearer }) {
    const startIndex = (uiPage - 1) * CARDS_PER_PAGE;
    const apiPageStart = Math.floor(startIndex / TMDB_PAGE_SIZE) + 1;
    const offsetInFirstApiPage = startIndex % TMDB_PAGE_SIZE;

    const urls = [
        `${TMDB_BASE}/discover/${mediaType}?language=${LANG}&with_genres=${genreId}&sort_by=popularity.desc&page=${apiPageStart}`,
        `${TMDB_BASE}/discover/${mediaType}?language=${LANG}&with_genres=${genreId}&sort_by=popularity.desc&page=${apiPageStart + 1}`,
    ];

    const [firstRes, secondRes] = await Promise.allSettled([
        fetchJson(urls[0], bearer),
        fetchJson(urls[1], bearer),
    ]);

    const firstData = firstRes.status === "fulfilled" ? firstRes.value : null;
    const secondData = secondRes.status === "fulfilled" ? secondRes.value : null;

    const totalResults = Number(firstData?.total_results || secondData?.total_results || 0);
    const totalPages = Math.max(1, Math.ceil(totalResults / CARDS_PER_PAGE));

    const combined = [
        ...(Array.isArray(firstData?.results) ? firstData.results : []),
        ...(Array.isArray(secondData?.results) ? secondData.results : []),
    ];

    return {
        items: combined.slice(offsetInFirstApiPage, offsetInFirstApiPage + CARDS_PER_PAGE),
        totalPages,
    };
}

export default function GenrePage({ path, navigate }) {
    const params = useMemo(() => {
        const m = path.match(/^\/media\/genre\/(movie|tv)\/(\d+)/);
        if (!m) return null;
        return { mediaType: m[1], genreId: Number(m[2]) };
    }, [path]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [genreName, setGenreName] = useState("");
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!params) return;

        const BEARER = getBearerFromEnv();
        if (!BEARER) {
            setError("TMDB token не найден. Положите VITE_TMDB_BEARER в apps/web-client/.env");
            return;
        }

        let mounted = true;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const genreList = await fetchJson(`${TMDB_BASE}/genre/${params.mediaType}/list?language=${LANG}`, BEARER);
                const genres = Array.isArray(genreList?.genres) ? genreList.genres : [];
                const found = genres.find((g) => Number(g.id) === Number(params.genreId));

                const displayName = capitalizeFirstLetter(found?.name || "Жанр");
                if (!mounted) return;
                setGenreName(displayName);

                const { items: pageItems, totalPages: calcTotalPages } = await fetchGenreBatch({
                    mediaType: params.mediaType,
                    genreId: params.genreId,
                    uiPage: page,
                    bearer: BEARER,
                });

                if (!mounted) return;

                setItems(pageItems);
                setTotalPages(calcTotalPages);
            } catch (err) {
                if (mounted) setError(String(err?.message || err));
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [params?.mediaType, params?.genreId, page]);

    useEffect(() => {
        setPage(1);
    }, [params?.mediaType, params?.genreId]);

    if (!params) {
        return <div style={{ padding: 24, color: "#fff" }}>Некорректный путь жанра.</div>;
    }

    const mediaLabel = params.mediaType === "movie" ? "Фильмы" : "Сериалы";
    const displayGenreName = capitalizeFirstLetter(genreName || "Жанр");

    const openDetail = (item) => {
        if (!item?.id) return;
        navigate(`/movie/${params.mediaType}/${item.id}`);
    };

    return (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 12px 60px", color: "#fff" }}>
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
                    <span style={{ whiteSpace: "pre-wrap", color: "#fff" }}>{String(error)}</span>
                    <button
                        onClick={() => setError(null)}
                        style={{
                            marginLeft: 12,
                            background: "transparent",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                        }}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div style={{ marginBottom: 18 }}>
                <button
                    onClick={() => navigate("/media")}
                    style={{
                        border: "none",
                        background: "#1f1f1f",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: 10,
                        cursor: "pointer",
                        marginBottom: 14,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    ← Назад
                </button>

                <h1 style={{ margin: 0, fontSize: 32, color: "#fff" }}>
                    {displayGenreName}
                </h1>
                <p style={{ margin: "8px 0 0", opacity: 0.8, color: "#fff" }}>
                    {mediaLabel} в этом жанре
                </p>
            </div>

            {loading && <div style={{ marginBottom: 16, color: "#fff" }}>Загружаем список жанра…</div>}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                    gap: 18,
                }}
            >
                {items.map((item) => (
                    <article
                        key={item.id}
                        onClick={() => openDetail(item)}
                        style={{
                            borderRadius: 16,
                            overflow: "hidden",
                            background: "#1b1b1b",
                            position: "relative",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <img
                            src={item?.poster_path ? `${IMAGE_PREFIX}${item.poster_path}` : "/example.jpg"}
                            alt={item?.title || item?.name || ""}
                            style={{
                                width: "100%",
                                aspectRatio: "2 / 3",
                                objectFit: "cover",
                                display: "block",
                            }}
                            onError={(ev) => {
                                ev.currentTarget.src = "/example.jpg";
                            }}
                        />
                        <div style={{ padding: 12, color: "#fff" }}>
                            <div style={{ fontWeight: 700, marginBottom: 6, color: "#fff" }}>
                                {item?.title || item?.name || "Без названия"}
                            </div>
                            <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6, color: "#fff" }}>
                                {params.mediaType === "movie"
                                    ? (item?.release_date || "Дата неизвестна")
                                    : (item?.first_air_date || "Дата неизвестна")}
                            </div>
                            <div style={{ fontSize: 13, opacity: 0.85, color: "#fff" }}>
                                ★ {Number(item?.vote_average || 0).toFixed(1)} / {item?.vote_count ?? 0}
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {!loading && items.length === 0 && (
                <div style={{ marginTop: 24, color: "#fff" }}>Нет данных по этому жанру.</div>
            )}

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 28,
                    flexWrap: "wrap",
                    color: "#fff",
                }}
            >
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    style={{
                        border: "none",
                        background: page <= 1 ? "#444" : "#2b2b2b",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: 10,
                        cursor: page <= 1 ? "not-allowed" : "pointer",
                    }}
                >
                    ← Предыдущая
                </button>

                <span style={{ color: "#fff" }}>
                    Страница {page} из {totalPages}
                </span>

                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    style={{
                        border: "none",
                        background: page >= totalPages ? "#444" : "#2b2b2b",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: 10,
                        cursor: page >= totalPages ? "not-allowed" : "pointer",
                    }}
                >
                    Следующая →
                </button>
            </div>
        </section>
    );
}