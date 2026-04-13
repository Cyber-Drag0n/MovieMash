import React from "react";

const Footer = ({ navigate, currentPath = "/" }) => {
    const goTo = (target) => {
        if (!target) return;

        const [path, hashPart] = target.split("#");
        const hash = hashPart ? `#${hashPart}` : "";

        const scrollToId = (id) => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                return true;
            }
            return false;
        };

        // Переход с якорем
        if (hash) {
            const id = hash.slice(1);

            if (currentPath === path || currentPath === `${path}/`) {
                // Уже на нужной странице
                const ok = scrollToId(id);
                if (!ok) {
                    setTimeout(() => scrollToId(id), 150);
                }

                // Обновляем hash в адресной строке
                window.history.replaceState({}, "", `${path}${hash}`);
                return;
            }

            if (navigate) {
                navigate(path);

                setTimeout(() => {
                    window.history.replaceState({}, "", `${path}${hash}`);
                    const ok = scrollToId(id);
                    if (!ok) {
                        setTimeout(() => scrollToId(id), 150);
                    }
                }, 150);
            } else {
                window.location.href = `${path}${hash}`;
            }

            return;
        }

        // Обычный маршрут
        if (navigate) {
            navigate(path);
            return;
        }

        window.location.href = path;
    };

    return (
        <footer className="site-footer" role="contentinfo" aria-label="Футер сайта">
            <div className="footer-inner">
                <nav className="footer-grid" aria-label="Ссылки футера">
                    <div className="footer-col">
                        <h3 className="footer-title">Домой</h3>
                        <ul className="footer-list">
                            <li><button type="button" onClick={() => goTo("/#categories")}>Категории</button></li>
                            <li><button type="button" onClick={() => goTo("/#plans")}>Цены</button></li>
                            <li><button type="button" onClick={() => goTo("/#faq")}>FAQ</button></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3 className="footer-title">Фильмы</h3>
                        <ul className="footer-list">
                            <li><button type="button" onClick={() => goTo("/media#genres-movies")}>Жанры</button></li>
                            <li><button type="button" onClick={() => goTo("/media#trending-movies")}>В трендах</button></li>
                            <li><button type="button" onClick={() => goTo("/media#new-movies")}>Новинки</button></li>
                            <li><button type="button" onClick={() => goTo("/media#popular-movies")}>Популярное</button></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3 className="footer-title">Сериалы</h3>
                        <ul className="footer-list">
                            <li><button type="button" onClick={() => goTo("/media#genres-series")}>Жанры</button></li>
                            <li><button type="button" onClick={() => goTo("/media#trending-series")}>В трендах</button></li>
                            <li><button type="button" onClick={() => goTo("/media#new-series")}>Новинки</button></li>
                            <li><button type="button" onClick={() => goTo("/media#popular-series")}>Популярное</button></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3 className="footer-title">Поддержка</h3>
                        <ul className="footer-list">
                            <li><button type="button" onClick={() => goTo("/support")}>Связаться с нами</button></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3 className="footer-title">Подписки</h3>
                        <ul className="footer-list">
                            <li><button type="button" onClick={() => goTo("/subscriptions")}>Планы</button></li>
                            <li><button type="button" onClick={() => goTo("/subscriptions")}>Особенности</button></li>
                        </ul>
                    </div>

                    <div className="footer-col footer-contact">
                        <h3 className="footer-title">Свяжитесь с нами:</h3>

                        <div className="social-row" role="navigation" aria-label="Социальные сети">
                            <a
                                className="social-btn"
                                href="https://vk.com"
                                aria-label="ВКонтакте"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src="/vk.svg" alt="" className="social-icon" aria-hidden="true" />
                            </a>

                            <a
                                className="social-btn"
                                href="https://t.me"
                                aria-label="Telegram"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src="/tg.svg" alt="" className="social-icon" aria-hidden="true" />
                            </a>

                            <a
                                className="social-btn"
                                href="https://instagram.com"
                                aria-label="Instagram"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src="/insta.svg" alt="" className="social-icon" aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;