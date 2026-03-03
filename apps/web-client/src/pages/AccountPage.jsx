import React, { useState } from "react";
import "../AccountPage.css";
import AccountCarousel from "../components/AccountCarousel";
import EditProfileModal from "../components/EditProfileModal";

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);

    const [user, setUser] = useState({
        username: "miqxiao",
        avatar: "/Account.svg",
        watchedCount: 14
    });

    return (
        <div className="account-page">
            <div className="account-header">
                <div className="avatar-wrapper">
                    <img src={user.avatar} alt="Аватар" className="avatar" />
                </div>

                <div className="user-info">
                    <div className="username-row">
                        <h1 className="username">{user.username}</h1>
                        <button className="edit-btn" onClick={() => setIsEditing(true)} aria-label="Редактировать профиль">
                            ✎
                        </button>
                    </div>

                    <p className="watched-count">
                        <span className="count">{user.watchedCount}</span>
                        <span>Фильмы и сериалы</span>
                    </p>

                    <div className="account-tabs" role="tablist" aria-label="Разделы аккаунта">
                        <button role="tab" aria-selected={activeTab === "profile"} className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Профиль</button>
                        <button role="tab" aria-selected={activeTab === "comments"} className={activeTab === "comments" ? "active" : ""} onClick={() => setActiveTab("comments")}>Комментарии</button>
                        <button role="tab" aria-selected={activeTab === "likes"} className={activeTab === "likes" ? "active" : ""} onClick={() => setActiveTab("likes")}>Лайки</button>
                    </div>
                </div>
            </div>

            <main className="account-content">
                {activeTab === "profile" && (
                    <>
                        <AccountCarousel title="Оценки и просмотры" variant="must" />
                        <AccountCarousel title="Буду смотреть" variant="must" />
                    </>
                )}

                {activeTab === "comments" && (
                    <div className="comments-list">
                        <article className="comment-card">
                            <div className="comment-meta">
                                <strong>miqxiao (сериалы)</strong>
                                <span className="stars" aria-label="Рейтинг 5 из 5">★★★★★</span>
                            </div>
                            <p className="comment-text">Здесь будут ваши комментарии.</p>
                        </article>
                    </div>
                )}

                {activeTab === "likes" && <p className="placeholder">Лайки будут здесь</p>}
            </main>

            {isEditing && (
                <EditProfileModal user={user} setUser={setUser} onClose={() => setIsEditing(false)} />
            )}
        </div>
    );
}