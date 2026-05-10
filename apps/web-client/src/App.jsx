// apps/web-client/src/App.jsx
import React, { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import "./App.css";
import CategoriesCarousel from "./components/CategoriesCarousel";
import FAQ from "./components/FAQ";
import Plans from "./components/Plans";
import AdBanner from "./components/AdBanner";
import Footer from "./components/Footer";
import MoviesAndSeries from "./pages/MoviesAndSeries";
import GenrePage from "./pages/GenrePage.jsx";
import Support from "./pages/Support.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import MoviePage from "./pages/MoviePage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

const normalizePath = (p) => {
    if (!p) return "/";
    const noQuery = p.split("?")[0].split("#")[0];
    return noQuery.replace(/\/+$/, "") || "/";
};

const App = () => {
    const initial = typeof window !== "undefined" ? normalizePath(window.location.pathname) : "/";
    const [path, setPath] = useState(initial);

    const navigate = useCallback((to) => {
        const n = normalizePath(to);
        if (window.location.pathname === n) {
            setPath(n);
            return;
        }
        window.history.pushState({}, "", n);
        setPath(n);
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []);

    useEffect(() => {
        const onPop = () => setPath(normalizePath(window.location.pathname));
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    const isHome = path === "/";
    const isAuthHome = path === "/auth";
    const isLoginPage = path === "/login" || path === "/auth/login";
    const isRegisterPage = path === "/register" || path === "/auth/register";
    const isForgotPasswordPage = path === "/auth/forgot-password";
    const isResetPasswordPage = path === "/auth/reset-password";

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
                                время и в любом месте.
                            </h2>
                        </div>

                        <div className="cta-wrapper">
                            <button className="cta-button" aria-label="Начать просмотр">
                                <img src="/Play.svg" alt="" aria-hidden="true" className="cta-icon" />
                                <span className="cta-text">Начать просмотр</span>
                            </button>
                        </div>

                        <section id="categories">
                            <CategoriesCarousel />
                        </section>

                        <section id="faq">
                            <FAQ />
                        </section>

                        <section id="plans">
                            <Plans />
                        </section>

                        <AdBanner />
                    </>
                )}

                {!isHome && path.startsWith("/media/genre/") && <GenrePage path={path} navigate={navigate} />}
                {!isHome && path.startsWith("/media") && !path.startsWith("/media/genre/") && <MoviesAndSeries navigate={navigate} />}
                {!isHome && path.startsWith("/support") && <Support />}
                {!isHome && path.startsWith("/subscriptions") && <Subscriptions />}
                {!isHome && path.startsWith("/account") && <AccountPage navigate={navigate} />}
                {!isHome && isAuthHome && <AuthPage navigate={navigate} />}
                {!isHome && isLoginPage && <LoginPage navigate={navigate} />}
                {!isHome && isRegisterPage && <RegisterPage navigate={navigate} />}
                {!isHome && isForgotPasswordPage && <ForgotPasswordPage navigate={navigate} />}
                {!isHome && isResetPasswordPage && <ResetPasswordPage navigate={navigate} />}
                {!isHome && path.startsWith("/movie") && <MoviePage path={path} navigate={navigate} />}
                {!isHome && path.startsWith("/auth") && !isAuthHome && !isLoginPage && !isRegisterPage && !isForgotPasswordPage && !isResetPasswordPage && <AuthPage navigate={navigate} />}
            </div>

            <Footer />
        </main>
    );
};

export default App;