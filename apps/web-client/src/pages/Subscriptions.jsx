// pages/Subscriptions.jsx
import React from "react";
import Plans from "../components/Plans"; // у тебя уже есть этот компонент
import "../Subscriptions.css";
import AdBanner from "../components/AdBanner.jsx";

export default function Subscriptions() {
    return (
        <main className="page-content subscriptions-page" aria-label="Подписки">
            {/* Вставляем готовый компонент Plans.jsx */}
            <section style={{ marginBottom: 28 }}>
                <Plans />
            </section>

            {/* Таблица-панель тарифов */}
            <section className="subs-table-wrap" aria-labelledby="subs-title">
                <h1 id="subs-title" className="subs-title">Сравните наши планы и выберите подходящий для вас</h1>
                <p className="subs-sub">
                    MovieMash предлагает три различных тарифных плана в соответствии с вашими потребностями:
                    Базовый, Стандартный и Премиум. Сравните возможности каждого плана и выберите тот, который подходит именно вам.
                </p>

                <div className="table-container" role="table" aria-label="Сравнение планов">
                    <table className="subscriptions-table" role="presentation">
                        <thead>
                        <tr>
                            <th className="col-feature">Возможности</th>
                            <th className="col-plan">Базовый</th>
                            <th className="col-plan popular">
                                Стандартный
                                <span className="plan-badge">Популярное</span>
                            </th>
                            <th className="col-plan">Премиум</th>
                        </tr>
                        </thead>

                        <tbody>
                        <tr>
                            <td className="feature">Цена</td>
                            <td>800₽/в месяц</td>
                            <td>1050₽/в месяц</td>
                            <td>1200₽/в месяц</td>
                        </tr>

                        <tr>
                            <td className="feature">Контент</td>
                            <td>Доступ к широкому выбору фильмов и сериалов, включая некоторые новинки.</td>
                            <td>Доступ к более широкому выбору фильмов и сериалов, включая большинство новинок и эксклюзивный контент.</td>
                            <td>Доступ к самому полному каталогу, включая все новинки и возможность просмотра офлайн.</td>
                        </tr>

                        <tr>
                            <td className="feature">Устройства</td>
                            <td>Просмотр на одном устройстве одновременно.</td>
                            <td>Просмотр на двух устройствах одновременно.</td>
                            <td>Просмотр на пяти устройствах одновременно.</td>
                        </tr>

                        <tr>
                            <td className="feature">Пробный период</td>
                            <td>30 дней</td>
                            <td>30 дней</td>
                            <td>30 дней</td>
                        </tr>

                        <tr>
                            <td className="feature">Отмена периода</td>
                            <td>Да, в любой момент</td>
                            <td>Да, в любой момент</td>
                            <td>Да, в любой момент</td>
                        </tr>

                        <tr>
                            <td className="feature">HDR</td>
                            <td>Нет</td>
                            <td>Да</td>
                            <td>Да</td>
                        </tr>

                        <tr>
                            <td className="feature">Доступ без рекламы</td>
                            <td>Нет</td>
                            <td>Да</td>
                            <td>Да</td>
                        </tr>

                        <tr>
                            <td className="feature">Офлайн-просмотр</td>
                            <td>Нет</td>
                            <td>Да, для некоторых позиций</td>
                            <td>Да, для всех позиций</td>
                        </tr>

                        <tr>
                            <td className="feature">Семейный доступ</td>
                            <td>Нет</td>
                            <td>Да, до 5 членов семьи</td>
                            <td>Да, до 6 членов семьи</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            < AdBanner/>
        </main>
    );
}
