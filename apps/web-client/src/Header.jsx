import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Header.css";
import { apiFetch, getJwt } from "./lib/api";

const navItems = [
    { label: "Домой", path: "/" },
    { label: "Фильмы и сериалы", path: "/media" },
    { label: "Поддержка", path: "/support" },
    { label: "Подписки", path: "/subscriptions" },
];

const TMDB_BASE = "https://api.themoviedb.org/3";
const LANG = "ru-RU";
const IMAGE_PREFIX = "https://image.tmdb.org/t/p/w154";

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

async function fetchJson(url, bearer, signal) {
    const res = await fetch(url, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${bearer}`,
        },
        signal,
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${txt}`);
    }

    return res.json();
}

function mediaPath(item) {
    const type = item?.media_type === "tv" || item?.name ? "tv" : "movie";
    return `/movie/${type}/${item?.id}`;
}

function resultTitle(item) {
    return item?.title || item?.name || "Без названия";
}

function resultSubtitle(item) {
    const year = item?.release_date?.slice(0, 4) || item?.first_air_date?.slice(0, 4) || "—";
    const type = item?.media_type === "tv" || item?.name ? "Сериал" : "Фильм";
    return `${type} • ${year}`;
}

function normalizePath(path) {
    if (!path) return "/";
    return path.replace(/\/+$/, "") || "/";
}

function isAbsoluteUrl(value) {
    return /^https?:\/\//i.test(String(value || ""));
}

export default function Header({ navigate, currentPath }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    const inputRef = useRef(null);
    const overlayRef = useRef(null);
    const toggleBtnRef = useRef(null);

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationItems, setNotificationItems] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifRef = useRef(null);
    const notifBtnRef = useRef(null);

    const bearer = useMemo(() => getBearerFromEnv(), []);
    const [isAuthed, setIsAuthed] = useState(!!getJwt());

    useEffect(() => {
        const syncAuth = () => setIsAuthed(!!getJwt());
        syncAuth();

        const onStorage = (e) => {
            if (!e || e.key === "movie_mash_token" || e.key === null) {
                syncAuth();
            }
        };

        const onAuthChanged = () => syncAuth();

        window.addEventListener("storage", onStorage);
        window.addEventListener("movie-mash-auth-changed", onAuthChanged);

        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("movie-mash-auth-changed", onAuthChanged);
        };
    }, []);

    const goto = useCallback((path) => {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setQuery("");
        setResults([]);
        setActiveIndex(-1);

        if (navigate) navigate(path);
        else window.location.href = path;
    }, [navigate]);

    const handleNavClick = (e, to) => {
        if (navigate) {
            e.preventDefault();
            navigate(to);
        }
    };

    useEffect(() => {
        if (!searchOpen) {
            setQuery("");
            setResults([]);
            setActiveIndex(-1);
            return;
        }

        setNotificationsOpen(false);
        setTimeout(() => inputRef.current?.focus(), 0);
        setActiveIndex(-1);

        const controller = new AbortController();

        (async () => {
            try {
                if (!bearer) {
                    setResults([]);
                    return;
                }

                const res = await fetchJson(
                    `${TMDB_BASE}/trending/movie/week?language=${LANG}`,
                    bearer,
                    controller.signal
                );

                const initial = Array.isArray(res?.results) ? res.results.slice(0, 6) : [];
                setResults(
                    initial.map((item) => ({
                        id: `${item?.media_type || "movie"}-${item?.id}`,
                        title: resultTitle(item),
                        subtitle: resultSubtitle(item),
                        img: item?.poster_path ? `${IMAGE_PREFIX}${item.poster_path}` : "/example.jpg",
                        path: mediaPath(item),
                    }))
                );
            } catch {
                if (!controller.signal.aborted) {
                    setResults([]);
                }
            }
        })();

        return () => controller.abort();
    }, [searchOpen, bearer]);

    useEffect(() => {
        if (!searchOpen) return;

        const controller = new AbortController();
        const t = setTimeout(async () => {
            try {
                if (!bearer) {
                    setResults([]);
                    return;
                }

                if (!query.trim()) {
                    const [moviesRes, tvRes] = await Promise.all([
                        fetchJson(`${TMDB_BASE}/trending/movie/week?language=${LANG}`, bearer, controller.signal),
                        fetchJson(`${TMDB_BASE}/trending/tv/week?language=${LANG}`, bearer, controller.signal),
                    ]);

                    const merged = [
                        ...(Array.isArray(moviesRes?.results) ? moviesRes.results : []),
                        ...(Array.isArray(tvRes?.results) ? tvRes.results : []),
                    ]
                        .filter((it) => it?.id)
                        .slice(0, 8)
                        .map((item) => ({
                            id: `${item?.media_type || (item?.title ? "movie" : "tv")}-${item?.id}`,
                            title: resultTitle(item),
                            subtitle: resultSubtitle(item),
                            img: item?.poster_path ? `${IMAGE_PREFIX}${item.poster_path}` : "/example.jpg",
                            path: mediaPath(item),
                        }));

                    setResults(merged);
                    setActiveIndex(merged.length ? 0 : -1);
                    return;
                }

                const data = await fetchJson(
                    `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=${LANG}&page=1`,
                    bearer,
                    controller.signal
                );

                const filtered = (Array.isArray(data?.results) ? data.results : [])
                    .filter((item) => item?.id && (item?.media_type === "movie" || item?.media_type === "tv"))
                    .slice(0, 8)
                    .map((item) => ({
                        id: `${item.media_type}-${item.id}`,
                        title: resultTitle(item),
                        subtitle: resultSubtitle(item),
                        img: item?.poster_path ? `${IMAGE_PREFIX}${item.poster_path}` : "/example.jpg",
                        path: mediaPath(item),
                    }));

                setResults(filtered);
                setActiveIndex(filtered.length ? 0 : -1);
            } catch {
                if (!controller.signal.aborted) {
                    setResults([]);
                    setActiveIndex(-1);
                }
            }
        }, 300);

        return () => {
            clearTimeout(t);
            controller.abort();
        };
    }, [query, searchOpen, bearer]);

    useEffect(() => {
        if (!searchOpen) return;

        const onKey = (e) => {
            if (e.key === "Escape") {
                setSearchOpen(false);
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter") {
                if (activeIndex >= 0 && results[activeIndex]) {
                    goto(results[activeIndex].path);
                }
            }
        };

        const onClickOutside = (e) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(e.target) &&
                toggleBtnRef.current &&
                !toggleBtnRef.current.contains(e.target)
            ) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClickOutside);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClickOutside);
        };
    }, [searchOpen, results, activeIndex, goto]);

    useEffect(() => {
        if (!notificationsOpen) return;

        const loadNotifications = async () => {
            if (!isAuthed) {
                setNotificationItems([]);
                setNotifLoading(false);
                return;
            }

            setNotifLoading(true);
            try {
                const res = await apiFetch("/api/notifications");
                setNotificationItems(
                    Array.isArray(res?.items) ? res.items.filter((item) => !item.is_read) : []
                );
            } catch {
                setNotificationItems([]);
            } finally {
                setNotifLoading(false);
            }
        };

        loadNotifications();
    }, [notificationsOpen, isAuthed]);

    useEffect(() => {
        if (!notificationsOpen) return;

        const handleDocClick = (e) => {
            if (
                notifRef.current &&
                !notifRef.current.contains(e.target) &&
                notifBtnRef.current &&
                !notifBtnRef.current.contains(e.target)
            ) {
                setNotificationsOpen(false);
            }
        };

        const handleKey = (e) => {
            if (e.key === "Escape") setNotificationsOpen(false);
        };

        document.addEventListener("mousedown", handleDocClick);
        document.addEventListener("touchstart", handleDocClick);
        document.addEventListener("keydown", handleKey);

        return () => {
            document.removeEventListener("mousedown", handleDocClick);
            document.removeEventListener("touchstart", handleDocClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [notificationsOpen]);

    const handleOpenNotification = async (item) => {
        try {
            if (item?.id && !item?.is_read) {
                await apiFetch(`/api/notifications/${item.id}/read`, { method: "PATCH" });
            }
        } catch {
            // ignore
        }

        setNotificationItems((prev) => prev.filter((n) => String(n.id) !== String(item.id)));
        setNotificationsOpen(false);

        if (!item?.link_url) return;
        if (isAbsoluteUrl(item.link_url)) {
            window.open(item.link_url, "_blank", "noopener,noreferrer");
            return;
        }
        goto(normalizePath(item.link_url));
    };

    const markAllRead = async () => {
        try {
            await apiFetch("/api/notifications/read-all", { method: "PATCH" });
            setNotificationItems((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        } catch {
            // ignore
        }
    };

    const unreadCount = notificationItems.filter((n) => !n.is_read).length;
    const authTarget = isAuthed ? "/account" : "/auth";
    const authLabel = isAuthed ? "Аккаунт" : "Войти";

    const normalized = (p) => normalizePath(p);

    return (
        <>
            <header className="topbar" role="navigation" aria-label="Main navigation">
                <div className="header-inner">
                    <div className="left-group">
                        <a href="/" className="logo-link" aria-label="На главную" onClick={(e) => handleNavClick(e, "/")}>
                            <img src="/Logo.svg" alt="Логотип" className="logo" />
                        </a>
                    </div>

                    <nav className="button-container" aria-label="Главное меню">
                        {navItems.map((item) => {
                            const active = normalized(currentPath) === normalized(item.path);
                            return (
                                <a
                                    key={item.path}
                                    href={item.path}
                                    className={`nav-button ${active ? "active" : ""}`}
                                    onClick={(e) => handleNavClick(e, item.path)}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>

                    <div className="icons-container">
                        <button
                            ref={toggleBtnRef}
                            type="button"
                            className="icon-btn search-toggle"
                            aria-label={searchOpen ? "Закрыть поиск" : "Открыть поиск"}
                            title={searchOpen ? "Закрыть поиск" : "Поиск"}
                            aria-expanded={searchOpen}
                            onClick={() => {
                                setNotificationsOpen(false);
                                setSearchOpen((s) => !s);
                            }}
                        >
                            {searchOpen ? (
                                <span className="search-close-sign" aria-hidden="true">
                                    ✕
                                </span>
                            ) : (
                                <img src="/Search.svg" alt="Поиск" className="icon-img" />
                            )}
                        </button>

                        {isAuthed && (
                            <div className="notif-wrap">
                                <button
                                    ref={notifBtnRef}
                                    type="button"
                                    className="icon-btn icon-btn--notif"
                                    aria-label="Уведомления"
                                    title="Уведомления"
                                    aria-haspopup="dialog"
                                    aria-expanded={notificationsOpen}
                                    onClick={() => {
                                        setSearchOpen(false);
                                        setNotificationsOpen((v) => !v);
                                    }}
                                >
                                    <img src="/Notifications.svg" alt="Уведомления" className="icon-img" />
                                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                                </button>

                                <div
                                    ref={notifRef}
                                    className={`notif-popup ${notificationsOpen ? "open" : ""}`}
                                    role="dialog"
                                    aria-label="Уведомления"
                                    aria-hidden={!notificationsOpen}
                                >
                                    <div className="notif-inner">
                                        <div className="notif-header-row">
                                            <strong className="notif-title">Уведомления</strong>
                                            {notificationItems.length > 0 && (
                                                <button type="button" className="notif-mark-all" onClick={markAllRead}>
                                                    Прочитать все
                                                </button>
                                            )}
                                        </div>

                                        {notifLoading ? (
                                            <div className="notif-empty">Загрузка уведомлений...</div>
                                        ) : notificationItems.length === 0 ? (
                                            <div className="notif-empty">У Вас пока нет уведомлений</div>
                                        ) : (
                                            <div className="notif-list">
                                                {notificationItems.slice(0, 6).map((item) => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className={`notif-item ${item.is_read ? "read" : "unread"}`}
                                                        onClick={() => handleOpenNotification(item)}
                                                    >
                                                        <div className="notif-item-title-row">
                                                            <span className="notif-item-title">{item.title}</span>
                                                            {!item.is_read && <span className="notif-dot" />}
                                                        </div>
                                                        <div className="notif-item-body">{item.body}</div>
                                                        <div className="notif-item-date">{item.created_at}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            className="user-entry-btn"
                            aria-label={authLabel}
                            title={authLabel}
                            onClick={() => goto(authTarget)}
                        >
                            <img src="/Account.svg" alt="" className="icon-img" />
                            <span>{authLabel}</span>
                        </button>
                    </div>
                </div>
            </header>

            {searchOpen && (
                <div
                    className="search-overlay"
                    role="dialog"
                    aria-label="Поиск по сайту"
                    aria-modal="false"
                    ref={overlayRef}
                >
                    <div className="search-inner">
                        <form
                            className="search-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (results[activeIndex]) {
                                    goto(results[activeIndex].path);
                                } else if (results[0]) {
                                    goto(results[0].path);
                                }
                            }}
                            role="search"
                        >
                            <button type="submit" className="search-submit" aria-label="Найти">
                                <img src="/Search.svg" alt="" />
                            </button>

                            <input
                                ref={inputRef}
                                className="search-input"
                                type="text"
                                placeholder="Название фильма или сериала"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Поле поиска"
                                aria-autocomplete="list"
                                aria-controls="search-results"
                                aria-activedescendant={activeIndex >= 0 ? `result-${results[activeIndex]?.id}` : undefined}
                                autoComplete="off"
                                spellCheck="false"
                            />

                            <button
                                type="button"
                                className="search-popup-close"
                                aria-label="Закрыть поиск"
                                onClick={() => setSearchOpen(false)}
                            >
                                ✕
                            </button>
                        </form>

                        <div className="search-results-wrapper" role="region" aria-label="Результаты поиска">
                            <ul id="search-results" role="listbox" className="search-results">
                                {results.length === 0 ? (
                                    <li className="no-results">Ничего не найдено</li>
                                ) : (
                                    results.map((r, idx) => (
                                        <li
                                            key={r.id}
                                            id={`result-${r.id}`}
                                            role="option"
                                            aria-selected={idx === activeIndex}
                                            className={`search-result ${idx === activeIndex ? "active" : ""}`}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            onClick={() => goto(r.path)}
                                        >
                                            <img
                                                src={r.img}
                                                alt=""
                                                className="result-thumb"
                                                onError={(e) => (e.currentTarget.src = "/example.jpg")}
                                            />
                                            <div className="result-meta">
                                                <div className="result-title">{r.title}</div>
                                                <div className="result-sub">{r.subtitle}</div>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}