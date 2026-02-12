// src/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import "./Header.css";

const navItems = [
    { label: "Домой", path: "/" },
    { label: "Фильмы и сериалы", path: "/media" },
    { label: "Поддержка", path: "/support" },
    { label: "Подписки", path: "/subscriptions" },
];

const icons = [
    { src: "/Search.svg", alt: "Поиск", href: "/search", type: "search" },
    { src: "/Notifications.svg", alt: "Уведомления", href: "/notifications", type: "link" },
    { src: "/Account.svg", alt: "Профиль", href: "/account", type: "link" },
];

// --- MOCK results (замени на fetch к API при необходимости) ---
const MOCK_RESULTS = [
    { id: 1, title: "Мстители: Финал", subtitle: "Фильм • 2019", img: "/avengers.png", path: "/media/1" },
    { id: 2, title: "Джон Уик 4", subtitle: "Фильм • 2023", img: "/john-wick.png", path: "/media/2" },
    { id: 3, title: "Матрица: Воскрешение", subtitle: "Фильм • 2021", img: "/matrix.png", path: "/media/3" },
    { id: 4, title: "Бумажный дом", subtitle: "Сериал • 4 сезона", img: "/tdp.jpg", path: "/media/tdp" },
    { id: 5, title: "Во все тяжкие", subtitle: "Сериал • 5 сезонов", img: "/bb.jpg", path: "/media/bb" },
    { id: 6, title: "Лучшие приколы", subtitle: "Сериал • 1 сезон", img: "/ex.jpg", path: "/media/ex" },
];

const Header = ({ navigate, currentPath }) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    const inputRef = useRef(null);
    const overlayRef = useRef(null);
    const toggleBtnRef = useRef(null);

    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => inputRef.current?.focus(), 0);
            setActiveIndex(-1);
            // initially show popular / everything
            setResults(MOCK_RESULTS.slice(0, 6));
        } else {
            setQuery("");
            setResults([]);
        }
    }, [searchOpen]);

    // close on ESC / click outside
    useEffect(() => {
        if (!searchOpen) return;

        const onKey = (e) => {
            if (e.key === "Escape") {
                setSearchOpen(false);
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex(i => Math.min(i + 1, (results.length - 1)));
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex(i => Math.max(i - 1, 0));
            }
            if (e.key === "Enter") {
                if (activeIndex >= 0 && results[activeIndex]) {
                    goto(results[activeIndex].path);
                }
            }
        };

        const onClickOutside = (e) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target) &&
                toggleBtnRef.current && !toggleBtnRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClickOutside);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClickOutside);
        };
    }, [searchOpen, results, activeIndex]);

    const normalized = (p) => {
        if (!p) return "/";
        return p.replace(/\/+$/, "") || "/";
    };

    const handleNavClick = (e, to) => {
        if (navigate) {
            e.preventDefault();
            navigate(to);
        }
    };

    const goto = (path) => {
        setSearchOpen(false);
        if (navigate) navigate(path);
        else window.location.href = path;
    };

    // simple client-side filter; replace with API call (debounced) if needed
    useEffect(() => {
        if (!query) {
            setResults(MOCK_RESULTS.slice(0, 6));
            setActiveIndex(-1);
            return;
        }
        const q = query.toLowerCase();
        const filtered = MOCK_RESULTS.filter(r =>
            r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
        ).slice(0, 8);
        setResults(filtered);
        setActiveIndex(filtered.length ? 0 : -1);
    }, [query]);

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

                    <div className="icons-container" aria-hidden="false">
                        {icons.map((ic) => {
                            if (ic.type === "search") {
                                return (
                                    <button
                                        key={ic.src}
                                        ref={toggleBtnRef}
                                        type="button"
                                        className={`icon-btn search-toggle`}
                                        aria-label={searchOpen ? "Закрыть поиск" : "Открыть поиск"}
                                        title={searchOpen ? "Закрыть поиск" : "Поиск"}
                                        aria-expanded={searchOpen}
                                        onClick={() => setSearchOpen(s => !s)}
                                    >
                                        {/* когда открыт — показываем крестик, иначе иконку */}
                                        {searchOpen ? <span className="search-close-sign">✕</span>
                                            : <img src={ic.src} alt={ic.alt} className="icon-img" />}
                                    </button>
                                );
                            }

                            return (
                                <a
                                    key={ic.src}
                                    href={ic.href}
                                    className="icon-btn"
                                    aria-label={ic.alt}
                                    title={ic.alt}
                                    onClick={(e) => handleNavClick(e, ic.href)}
                                >
                                    <img src={ic.src} alt={ic.alt} className="icon-img" />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Overlay search — поверх header (top/left/right совпадают с header) */}
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
                            onSubmit={(e) => { e.preventDefault(); if (results[activeIndex]) goto(results[activeIndex].path); else if (query) goto(`/search?q=${encodeURIComponent(query)}`); }}
                            role="search"
                        >
                            <button type="submit" className="search-submit" aria-label="Найти">
                                <img src="/Search.svg" alt="" />
                            </button>

                            <input
                                ref={inputRef}
                                className="search-input"
                                type="search"
                                placeholder="Название фильма, сериала или имя актёра, режиссёра"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Поле поиска"
                                aria-autocomplete="list"
                                aria-controls="search-results"
                                aria-activedescendant={activeIndex >= 0 ? `result-${results[activeIndex]?.id}` : undefined}
                            />

                            <button type="button" className="search-popup-close" aria-label="Закрыть поиск" onClick={() => setSearchOpen(false)}>✕</button>
                        </form>

                        {/* dropdown results */}
                        <div className="search-results-wrapper" role="region" aria-label="Результаты поиска">
                            <ul id="search-results" role="listbox" className="search-results">
                                {results.length === 0 ? (
                                    <li className="no-results">Ничего не найдено</li>
                                ) : results.map((r, idx) => (
                                    <li
                                        key={r.id}
                                        id={`result-${r.id}`}
                                        role="option"
                                        aria-selected={idx === activeIndex}
                                        className={`search-result ${idx === activeIndex ? "active" : ""}`}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => goto(r.path)}
                                    >
                                        <img src={r.img} alt="" className="result-thumb" onError={(e)=>e.currentTarget.src="/example.jpg"} />
                                        <div className="result-meta">
                                            <div className="result-title">{r.title}</div>
                                            <div className="result-sub">{r.subtitle}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
