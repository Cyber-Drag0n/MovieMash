// src/App.jsx
import React, { useEffect, useState, useCallback } from "react";
import Header from "./Header";
import "./App.css";
import CategoriesCarousel from "./components/CategoriesCarousel";
import FAQ from "./components/FAQ";
import Plans from "./components/Plans";
import AdBanner from "./components/AdBanner";
import Footer from "./components/Footer";
import MoviesAndSeries from "./pages/MoviesAndSeries";

const normalizePath = (p) => {
    if (!p) return "/";
    // убираем query/hash и завершающие слеши
    const noQuery = p.split("?")[0].split("#")[0];
    return noQuery.replace(/\/+$/, "") || "/";
};

const App = () => {
    const initial = typeof window !== "undefined" ? normalizePath(window.location.pathname) : "/";
    const [path, setPath] = useState(initial);

    const navigate = useCallback((to) => {
        const n = normalizePath(to);
        if (window.location.pathname === n) {
            // если тот же путь — всё равно обновим state (на случай, если мы хотим)
            setPath(n);
            return;
        }
        window.history.pushState({}, "", to);
        setPath(n);
        window.scrollTo({ top: 0, behavior: "instant" });
    }, []);

    useEffect(() => {
        const onPop = () => setPath(normalizePath(window.location.pathname));
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    const isHome = path === "/";

    return (
        <main>
            <Header navigate={navigate} currentPath={path} />

            {isHome && (
                <section className="home-hero" aria-hidden="true">
                    <img src="/Home.png" alt="" className="hero-img" />
                </section>
            )}

            <div className={`page-content ${isHome ? "with-hero" : "no-hero"}`}>
                {isHome && (
                    <>
                        <div className="TextContainer">
                            <h1>Лучшее приложение для фильмов</h1>
                            <h2>
                                MovieMash - это лучшее приложение для потокового просмотра ваших любимых фильмов и шоу по запросу, в любое
                                время и в любом месте. С помощью MovieMash Вы можете наслаждаться широким спектром контента, включая новейшие
                                блокбастеры, классические фильмы, популярные телешоу и многое другое.
                            </h2>
                        </div>

                        <div className="cta-wrapper">
                            <button className="cta-button" aria-label="Начать просмотр">
                                <img src="/Play.svg" alt="" aria-hidden="true" className="cta-icon" />
                                <span className="cta-text">Начать просмотр</span>
                            </button>
                        </div>

                        <CategoriesCarousel />
                        <FAQ />
                        <Plans />
                        <AdBanner />
                    </>
                )}

                {/* Показываем MoviesAndSeries если путь начинается с /media */}
                {!isHome && path.startsWith("/media") && <MoviesAndSeries />}

                {/* остальные внутренние пути — оставляем пустыми (по желанию можно добавить заголовок) */}
            </div>

            <Footer />
        </main>
    );
};

export default App;
