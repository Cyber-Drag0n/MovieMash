// src/pages/AccountPage.jsx
import React, { useState } from "react";
import "../AccountPage.css";
import AccountCarousel from "../components/AccountCarousel";
import EditProfileModal from "../components/EditProfileModal";
import AdBanner from "../components/AdBanner.jsx";

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);

    const [user, setUser] = useState({
        username: "miqxiao",
        email: "miqxiao@example.com",
        avatar: "/example.jpg",
        watchedCount: 14,
    });

    // Пример комментариев — замените на реальные данные при необходимости
    const COMMENTS = [
        {
            id: 1,
            title: `${user.username} (сериалы "Очень странные дела")`,
            country: "из России",
            text: "Это просто что-то с чем-то! Очень сильно буду ждать 5-ый сезон, надеюсь там наконец все будет хорошо у Ога и Майка.",
            rating: 5
        },
        {
            id: 2,
            title: `${user.username} (фильм "Папины дочки: Мама вернулась")`,
            country: "из России",
            text: "Ура наконец у них есть мама.",
            rating: 5
        },
        {
            id: 3,
            title: `${user.username} (сериалы "Пацаны")`,
            country: "из России",
            text: "Самый лучший сериал, наконец показывают истинную личность каждого героя, но под конец удивили меня, конечно. Начинаю смотреть \"Поколение В\".",
            rating: 5
        }
    ];

    return (
        <div className="account-page">
            {/* spacer чтобы профиль располагался под фиксированным верхним navbar */}
            <div className="account-top-spacer" />

            {/* Центрированный блок профиля: внутри — аватар слева, инфо справа, edit справа от ника */}
            <section className="profile-center" aria-label="Профиль пользователя">
                <div className="profile-main">
                    <div className="avatar-wrapper" title="Аватар пользователя">
                        <img src={user.avatar} alt="Аватар" className="avatar" />
                    </div>

                    <div className="profile-right">
                        <div className="username-row">
                            <h1 className="username">{user.username}</h1>
                            <button
                                className="edit-btn"
                                onClick={() => setIsEditing(true)}
                                aria-label="Редактировать профиль"
                                title="Редактировать профиль"
                            >
                                ✎
                            </button>
                        </div>

                        <p className="watched-count">
                            <span className="count">{user.watchedCount}</span>
                            <span className="label">Фильмы и сериалы</span>
                        </p>

                        <nav className="account-tabs" role="tablist" aria-label="Разделы аккаунта">
                            <button
                                role="tab"
                                className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                                onClick={() => setActiveTab("profile")}
                            >
                                Профиль
                            </button>
                            <button
                                role="tab"
                                className={`tab-btn ${activeTab === "comments" ? "active" : ""}`}
                                onClick={() => setActiveTab("comments")}
                            >
                                Комментарии
                            </button>
                            <button
                                role="tab"
                                className={`tab-btn ${activeTab === "likes" ? "active" : ""}`}
                                onClick={() => setActiveTab("likes")}
                            >
                                Лайки
                            </button>
                        </nav>
                    </div>
                </div>
            </section>

            <main className="account-content">
                {activeTab === "profile" && (
                    <>
                        <AccountCarousel title="Оценки и просмотры" variant="ratings" />
                        <AccountCarousel title="Буду смотреть" variant="watchlist" />
                        <AdBanner />
                    </>
                )}

                {activeTab === "comments" && (
                    <div className="comments-wrap">
                        <div className="comments-list" aria-live="polite">
                            {COMMENTS.map((c) => {
                                const fullStars = Math.floor(c.rating);
                                const halfStar = c.rating - fullStars >= 0.5;
                                const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
                                const ratingNumber = Math.max(1, Math.min(5, Math.round(c.rating)));

                                return (
                                    <article key={c.id} className="comment-card" role="article" aria-label={`Комментарий ${c.id}`}>
                                        <div className="comment-left">
                                            <div className="comment-meta">
                                                <strong className="comment-title">{c.title}</strong>
                                                <small className="comment-sub">{c.country}</small>
                                            </div>
                                            <p className="comment-text">{c.text}</p>
                                        </div>

                                        <div className="comment-right" aria-hidden="true">
                                            {/* Используем ту же структуру звёзд, что и в AccountCarousel */}
                                            {/* Овал: звёзды + число внутри одного контейнера */}
                                            <span className="star-oval" aria-label={`Рейтинг ${c.rating} из 5`}>
                                  <span className="rating-row" aria-hidden="true">
                                    {Array.from({ length: fullStars }).map((_, i) => (
                                        <img key={"f"+i} src="/star-filled.svg" alt="" className="star-icon" />
                                    ))}
                                      {halfStar && <img key="half" src="/star-half.svg" alt="" className="star-icon" />}
                                      {Array.from({ length: emptyStars }).map((_, i) => (
                                          <img key={"e"+i} src="/star-empty.svg" alt="" className="star-icon" />
                                      ))}
                                  </span>

                                                {/* число прямо в том же овале — справа от звёзд */}
                                                <span className="rating-number" aria-hidden="true">{ratingNumber}</span>
</span>
                                            <button className="comment-go" aria-label="Перейти к комментарию">
                                                <img src="/Arrow_right.svg" alt="" />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="comments-ad">
                            <AdBanner />
                        </div>
                    </div>
                )}

                {activeTab === "likes" && (
                    <>
                        <AccountCarousel title="Оценки и просмотры" variant="ratings" />
                        {/* рекламный баннер в лайках */}
                        <div style={{ marginTop: 18 }}>
                            <AdBanner />
                        </div>
                    </>
                )}
            </main>

            {isEditing && <EditProfileModal user={user} setUser={setUser} onClose={() => setIsEditing(false)} />}
        </div>
    );
}