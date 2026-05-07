import React, { useEffect, useMemo, useState } from "react";
import "../AccountPage.css";
import { apiFetch, getJwt } from "../lib/api";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w300";

function getTmdbToken() {
    try {
        return import.meta.env.VITE_TMDB_BEARER;
    } catch {
        return null;
    }
}

async function tmdbFetch(path) {
    const token = getTmdbToken();
    if (!token) return null;

    const res = await fetch(`${TMDB_BASE}${path}`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) return null;
    return res.json();
}

function Card({ item, variant }) {
    const fullStars = Math.floor((Number(item.rating || 0) / 2));
    const halfStar = (Number(item.rating || 0) / 2) - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <article className="category-card top-card must-card" role="listitem">
            <div className="must-poster-wrap">
                <img
                    src={item.img || "/example.jpg"}
                    alt={item.title || ""}
                    className="must-poster"
                    onError={(e) => { e.currentTarget.src = "/example.jpg"; }}
                />
            </div>

            <span className="trend-badge left must-left" aria-hidden="true">
                <img src="/Time.svg" alt="" />
                <span className="badge-text">{item.duration || "—"}</span>
            </span>

            <span className="trend-badge right must-right" aria-hidden="true">
                <span className="rating-row" aria-label={`Рейтинг ${item.rating || 0} из 5`}>
                    {Array.from({ length: fullStars }).map((_, i) => (
                        <img key={"f" + i} src="/star-filled.svg" alt="" className="star-icon" />
                    ))}
                    {halfStar && <img key="half" src="/star-half.svg" alt="" className="star-icon" />}
                    {Array.from({ length: emptyStars }).map((_, i) => (
                        <img key={"e" + i} src="/star-empty.svg" alt="" className="star-icon" />
                    ))}
                </span>

                {variant !== "ratings" && <span className="badge-text votes-text">{item.votes || ""}</span>}
            </span>
        </article>
    );
}

export default function AccountCarousel({ title = "Категория", variant = "ratings" }) {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [items, setItems] = useState([]);
    const [authorized, setAuthorized] = useState(!!getJwt());
    const cardsPerPage = 4;

    const pages = Math.max(1, Math.ceil(items.length / cardsPerPage));

    const visible = useMemo(() => {
        const groups = [];
        for (let i = 0; i < items.length; i += cardsPerPage) {
            groups.push(items.slice(i, i + cardsPerPage));
        }
        return groups[page] || [];
    }, [items, page]);

    useEffect(() => {
        const token = getJwt();
        if (!token) {
            setAuthorized(false);
            setLoading(false);
            setItems([]);
            return;
        }

        setAuthorized(true);
        setLoading(true);

        (async () => {
            try {
                if (variant === "ratings") {
                    const res = await apiFetch("/api/library/ratings");
                    const enriched = await Promise.all((res.items || []).slice(0, 12).map(async (row) => {
                        const details = await tmdbFetch(`/${row.media_type}/${row.tmdb_id}?language=ru-RU`);
                        const title = details?.title || details?.name || `TMDB #${row.tmdb_id}`;
                        const img = details?.poster_path ? `${IMG}${details.poster_path}` : "/example.jpg";
                        const duration = details?.runtime
                            ? `${Math.floor(details.runtime / 60)}ч ${String(details.runtime % 60).padStart(2, "0")}мин`
                            : "—";

                        return {
                            id: `${row.tmdb_id}-${row.media_type}`,
                            img,
                            title,
                            duration,
                            rating: Number(row.rating || 0),
                            votes: `${details?.vote_count ?? 0}`,
                        };
                    }));
                    setItems(enriched);
                } else {
                    const lib = await apiFetch("/api/library/me");
                    const list = (lib.lists && lib.lists[variant]) ? lib.lists[variant] : [];
                    const enriched = await Promise.all(list.slice(0, 12).map(async (row) => {
                        const details = await tmdbFetch(`/${row.media_type}/${row.tmdb_id}?language=ru-RU`);
                        const title = details?.title || details?.name || `TMDB #${row.tmdb_id}`;
                        const img = details?.poster_path ? `${IMG}${details.poster_path}` : "/example.jpg";
                        const duration = details?.runtime
                            ? `${Math.floor(details.runtime / 60)}ч ${String(details.runtime % 60).padStart(2, "0")}мин`
                            : "—";

                        return {
                            id: `${row.tmdb_id}-${row.media_type}`,
                            img,
                            title,
                            duration,
                            rating: Number((details?.vote_average || 0) / 2).toFixed(1),
                            votes: `${details?.vote_count ?? 0}`,
                        };
                    }));
                    setItems(enriched);
                }
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [variant]);

    const prev = () => setPage((p) => Math.max(0, p - 1));
    const next = () => setPage((p) => Math.min(pages - 1, p + 1));

    if (!authorized) {
        return (
            <section className="account-carousel" aria-label={title}>
                <div className="carousel-header">
                    <h2 className="carousel-title">{title}</h2>
                </div>
                <div style={{ color: "#fff", opacity: 0.75 }}>
                    Войдите, чтобы увидеть свои данные.
                </div>
            </section>
        );
    }

    return (
        <section className="account-carousel" aria-label={title}>
            <div className="carousel-header">
                <h2 className="carousel-title">{title}</h2>

                <div className="categories-controls">
                    <button className="ctrl-arrow" onClick={prev} aria-label="Предыдущая" disabled={page === 0}>
                        <img src="/Arrow_left.svg" alt="prev" />
                    </button>

                    <div className="progress-line" role="tablist" aria-label="Страницы карусели">
                        {Array.from({ length: pages }).map((_, idx) => (
                            <span key={idx} className={`progress-seg ${idx === page ? "active" : ""}`} aria-hidden="true" />
                        ))}
                    </div>

                    <button className="ctrl-arrow" onClick={next} aria-label="Следующая" disabled={page === pages - 1}>
                        <img src="/Arrow_right.svg" alt="next" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ color: "#fff", opacity: 0.7 }}>Загрузка...</div>
            ) : (
                <div className="must-row pages" role="list">
                    {visible.length > 0 ? visible.map((it) => <Card key={it.id} item={it} variant={variant} />) : (
                        <div style={{ color: "#fff", opacity: 0.7 }}>Пусто</div>
                    )}
                </div>
            )}
        </section>
    );
}