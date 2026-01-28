// src/Header.jsx
import React from "react";
import "./Header.css";

const navItems = [
    { label: "Домой", path: "/" },
    { label: "Фильмы и сериалы", path: "/media" },
    { label: "Поддержка", path: "/support" },
    { label: "Подписки", path: "/subscriptions" },
];

const icons = [
    { src: "/Search.svg", alt: "Поиск", href: "/search" },
    { src: "/Notifications.svg", alt: "Уведомления", href: "/notifications" },
    { src: "/Account.svg", alt: "Профиль", href: "/account" },
];

const Header = ({ navigate, currentPath }) => {
    const handleClick = (e, to) => {
        // используем navigate если он есть — чтобы не перезагружать страницу
        if (navigate) {
            e.preventDefault();
            navigate(to);
        }
    };

    const normalized = (p) => {
        if (!p) return "/";
        return p.replace(/\/+$/, "") || "/";
    };

    return (
        <header className="topbar" role="navigation" aria-label="Main navigation">
            <div className="header-inner">
                <div className="left-group">
                    <a
                        href="/"
                        className="logo-link"
                        aria-label="На главную"
                        onClick={(e) => handleClick(e, "/")}
                    >
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
                                onClick={(e) => handleClick(e, item.path)}
                            >
                                {item.label}
                            </a>
                        );
                    })}
                </nav>

                <div className="icons-container" aria-hidden="false">
                    {icons.map((ic) => (
                        <a key={ic.src} href={ic.href} className="icon-btn" aria-label={ic.alt} title={ic.alt}>
                            <img src={ic.src} alt={ic.alt} className="icon-img" />
                        </a>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;
