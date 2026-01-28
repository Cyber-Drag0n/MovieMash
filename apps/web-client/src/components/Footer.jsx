import React from "react";

const Footer = () => {
    return (
        <footer className="site-footer" role="contentinfo" aria-label="Футер сайта">
            <div className="footer-inner">
                <nav className="footer-grid" aria-label="Ссылки футера">
                    <div className="footer-col">
                        <h3 className="footer-title">Домой</h3>
                        <ul className="footer-list">
                            <li><a href="/">Категории</a></li>
                            <li><a href="/">Цены</a></li>
                            <li><a href="/">FAQ</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3 className="footer-title">Фильмы</h3>
                        <ul className="footer-list">
                            <li><a href="/">Жанры</a></li>
                            <li><a href="/">В трендах</a></li>
                            <li><a href="/">Новинки</a></li>
                            <li><a href="/">Популярное</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3 className="footer-title">Сериалы</h3>
                        <ul className="footer-list">
                            <li><a href="/">Жанры</a></li>
                            <li><a href="/">В трендах</a></li>
                            <li><a href="/">Новинки</a></li>
                            <li><a href="/">Популярное</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3 className="footer-title">Поддержка</h3>
                        <ul className="footer-list">
                            <li><a href="/">Связаться с нами</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3 className="footer-title">Подписки</h3>
                        <ul className="footer-list">
                            <li><a href="/">Планы</a></li>
                            <li><a href="/">Особенности</a></li>
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
