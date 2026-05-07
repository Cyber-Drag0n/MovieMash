import React, { useEffect, useMemo, useState } from "react";
import "../AccountPage.css";
import AccountCarousel from "../components/AccountCarousel";
import EditProfileModal from "../components/EditProfileModal";
import AdBanner from "../components/AdBanner.jsx";
import { apiFetch, clearJwt, getJwt } from "../lib/api";

const TABS = [
    { key: "profile", label: "Профиль" },
    { key: "comments", label: "Комментарии" },
    { key: "likes", label: "Лайки" },
];

const TMDB_BASE = "https://api.themoviedb.org/3";
const LANG = "ru-RU";

function getTmdbToken() {
    try {
        return import.meta.env.VITE_TMDB_BEARER;
    } catch {
        return null;
    }
}

async function tmdbFetch(path) {
    const token = getTmdbToken();
    if (!token) return null;

    const res = await fetch(`${TMDB_BASE}${path}`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) return null;
    return res.json();
}

export default function AccountPage({ navigate }) {
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [authorized, setAuthorized] = useState(!!getJwt());

    const [user, setUser] = useState({
        username: "",
        email: "",
        avatar: "/example.jpg",
        watchedCount: 0,
        display_name: "",
    });

    const [stats, setStats] = useState({
        favorites_count: 0,
        watched_count: 0,
        watchlist_count: 0,
        support_messages_count: 0,
        unread_notifications_count: 0,
    });

    const [notifications, setNotifications] = useState([]);
    const [supportMessages, setSupportMessages] = useState([]);
    const [comments, setComments] = useState([]);

    const loadAccount = async () => {
        setLoading(true);
        setError("");

        if (!getJwt()) {
            setAuthorized(false);
            setLoading(false);
            return;
        }

        setAuthorized(true);

        try {
            const [overviewRes, supportRes, reviewsRes, notificationsRes] = await Promise.all([
                apiFetch("/api/account/overview"),
                apiFetch("/api/account/support-messages").catch(() => ({ items: [] })),
                apiFetch("/api/account/reviews").catch(() => ({ items: [] })),
                apiFetch("/api/notifications").catch(() => ({ items: [] })),
            ]);

            const u = overviewRes?.user || {};
            setUser({
                username: u.username || "",
                email: u.email || "",
                avatar: u.avatar_url || "/example.jpg",
                watchedCount: overviewRes?.stats?.watched_count ?? 0,
                display_name: u.display_name || "",
            });

            setStats({
                favorites_count: overviewRes?.stats?.favorites_count ?? 0,
                watched_count: overviewRes?.stats?.watched_count ?? 0,
                watchlist_count: overviewRes?.stats?.watchlist_count ?? 0,
                support_messages_count: overviewRes?.stats?.support_messages_count ?? 0,
                unread_notifications_count: overviewRes?.stats?.unread_notifications_count ?? 0,
            });

            setNotifications(Array.isArray(notificationsRes?.items) ? notificationsRes.items : []);
            setSupportMessages(Array.isArray(supportRes?.items) ? supportRes.items : []);

            const rawReviews = Array.isArray(reviewsRes?.items) ? reviewsRes.items : [];
            const enriched = await Promise.all(rawReviews.map(async (item) => {
                const details = await tmdbFetch(`/${item.media_type}/${item.tmdb_id}?language=${LANG}`);
                const title = details?.title || details?.name || `TMDB #${item.tmdb_id}`;
                const ratingValue = Number(details?.vote_average || 0);
                const rating = ratingValue > 0 ? Math.max(1, Math.min(5, Math.round(ratingValue / 2))) : 0;

                return {
                    id: item.id,
                    tmdb_id: item.tmdb_id,
                    media_type: item.media_type,
                    title: `${item.media_type === "movie" ? "Фильм" : "Сериал"} "${title}"`,
                    country: "из TMDB",
                    text: item.review_text || "",
                    rating,
                    created_at: item.created_at,
                };
            }));

            setComments(enriched);
        } catch (err) {
            setError(err.message || "Ошибка загрузки аккаунта");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccount();
    }, []);

    const watchedCount = useMemo(() => stats.watched_count || user.watchedCount || 0, [stats, user]);

    const onSaveProfile = async (formData) => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const res = await apiFetch("/api/account/profile", {
                method: "PATCH",
                body: formData,
            });

            if (res?.user) {
                setUser((prev) => ({
                    ...prev,
                    username: res.user.username || prev.username,
                    email: res.user.email || prev.email,
                    avatar: res.user.avatar_url || prev.avatar,
                    display_name: res.user.display_name || prev.display_name,
                }));
            }

            setSuccess("Профиль сохранён");
            setIsEditing(false);
            await loadAccount();
        } catch (err) {
            setError(err.message || "Ошибка сохранения профиля");
        } finally {
            setSaving(false);
        }
    };

    const markAllNotificationsRead = async () => {
        try {
            await apiFetch("/api/notifications/read-all", { method: "PATCH" });
            await loadAccount();
            setSuccess("Все уведомления отмечены как прочитанные");
        } catch (err) {
            setError(err.message || "Ошибка обновления уведомлений");
        }
    };

    const markNotificationRead = async (id) => {
        try {
            await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
            await loadAccount();
        } catch (err) {
            setError(err.message || "Ошибка обновления уведомления");
        }
    };

    const logout = async () => {
        try {
            await apiFetch("/api/auth/logout", { method: "POST" });
        } catch {
            // ignore
        }
        clearJwt();
        setAuthorized(false);
        navigate("/auth/login");
    };

    const openTmdbItem = (item) => {
        if (!item?.tmdb_id || !item?.media_type) return;
        navigate(`/movie/${item.media_type}/${item.tmdb_id}`);
    };

    if (loading) {
        return <div style={{ color: "#fff", padding: 24 }}>Загрузка...</div>;
    }

    if (!authorized) {
        return (
            <div className="account-page">
                <div className="account-top-spacer" />
                <section className="profile-center" aria-label="Гость">
                    <div className="profile-main">
                        <div className="avatar-wrapper" title="Гость">
                            <img src="/example.jpg" alt="Гость" className="avatar" />
                        </div>

                        <div className="profile-right">
                            <div className="username-row">
                                <h1 className="username">Гость</h1>
                            </div>

                            <p className="watched-count">
                                <span className="count">0</span>
                                <span className="label">Фильмы и сериалы</span>
                            </p>

                            <nav className="account-tabs" role="tablist" aria-label="Разделы аккаунта">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        role="tab"
                                        className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                                        onClick={() => {
                                            if (tab.key === "profile") setActiveTab("profile");
                                            else navigate("/auth/login");
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </section>

                <main className="account-content">
                    <div className="comments-wrap">
                        <div className="comments-list">
                            <article className="comment-card">
                                <div className="comment-left">
                                    <div className="comment-meta">
                                        <strong className="comment-title">Войдите, чтобы открыть аккаунт</strong>
                                        <small className="comment-sub">гость</small>
                                    </div>
                                    <p className="comment-text">
                                        После входа будут доступны лайки, просмотренное, уведомления, сообщения поддержки и редактирование профиля.
                                    </p>
                                </div>

                                <div className="comment-right">
                                    <button className="comment-go" aria-label="Войти" onClick={() => navigate("/auth/login")}>
                                        <img src="/Arrow_right.svg" alt="" />
                                    </button>
                                </div>
                            </article>
                        </div>

                        <div className="comments-ad">
                            <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
                                <button className="submit-btn" type="button" onClick={() => navigate("/auth/login")}>
                                    Войти
                                </button>
                                <button className="submit-btn" type="button" onClick={() => navigate("/auth/register")}>
                                    Зарегистрироваться
                                </button>
                            </div>
                            <AdBanner />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="account-page">
            <div className="account-top-spacer" />

            <section className="profile-center" aria-label="Профиль пользователя">
                <div className="profile-main">
                    <div className="avatar-wrapper" title="Аватар пользователя">
                        <img src={user.avatar || "/example.jpg"} alt="Аватар" className="avatar" />
                    </div>

                    <div className="profile-right">
                        <div className="username-row">
                            <h1 className="username">{user.username || "—"}</h1>
                            <button
                                className="edit-btn"
                                onClick={() => setIsEditing(true)}
                                aria-label="Редактировать профиль"
                                title="Редактировать профиль"
                            >
                                ✎
                            </button>
                        </div>

                        <nav className="account-tabs" role="tablist" aria-label="Разделы аккаунта">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    role="tab"
                                    className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </section>

            {(error || success) && (
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 12px 16px" }}>
                    {error && <div style={{ color: "#ff7b7b" }}>{error}</div>}
                    {success && <div style={{ color: "#7CFF7C" }}>{success}</div>}
                </div>
            )}

            <main className="account-content">
                {activeTab === "profile" && (
                    <>
                        <AccountCarousel title="Оценки и просмотры" variant="ratings" />
                        <AccountCarousel title="Буду смотреть" variant="watchlist" />

                        <div className="comments-wrap" style={{ marginTop: 18 }}>
                            <div className="comments-list" aria-live="polite">
                                <article className="comment-card">
                                    <div className="comment-left">
                                        <div className="comment-meta">
                                            <strong className="comment-title">Уведомления</strong>
                                            <small className="comment-sub">
                                                {stats.unread_notifications_count > 0 ? `Непрочитанных: ${stats.unread_notifications_count}` : "Нет непрочитанных"}
                                            </small>
                                        </div>
                                        <p className="comment-text">
                                            Здесь отображаются последние события аккаунта: поддержка, лайки, просмотренное и входы в систему.
                                        </p>
                                    </div>

                                    <div className="comment-right">
                                        <button className="comment-go" aria-label="Прочитать все" onClick={markAllNotificationsRead}>
                                            <img src="/Arrow_right.svg" alt="" />
                                        </button>
                                    </div>
                                </article>

                                {(notifications || []).slice(0, 3).map((n) => (
                                    <article key={n.id} className="comment-card">
                                        <div className="comment-left">
                                            <div className="comment-meta">
                                                <strong className="comment-title">{n.title}</strong>
                                                <small className="comment-sub">{n.created_at}</small>
                                            </div>
                                            <p className="comment-text">{n.body}</p>
                                        </div>

                                        <div className="comment-right">
                                            <button
                                                className="comment-go"
                                                aria-label="Отметить прочитанным"
                                                onClick={() => markNotificationRead(n.id)}
                                            >
                                                <img src="/Arrow_right.svg" alt="" />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                            <AdBanner />
                        </div>
                    </>
                )}

                {activeTab === "comments" && (
                    <div className="comments-wrap">
                        <div className="comments-list" aria-live="polite">
                            {comments.length > 0 ? (
                                comments.map((c) => {
                                    const fullStars = Math.floor(c.rating);
                                    const halfStar = c.rating - fullStars >= 0.5;
                                    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
                                    const ratingNumber = c.rating > 0 ? Math.max(1, Math.min(5, Math.round(c.rating))) : 0;

                                    return (
                                        <article key={c.id} className="comment-card" role="article">
                                            <div className="comment-left">
                                                <div className="comment-meta">
                                                    <strong className="comment-title">{c.title}</strong>
                                                    <small className="comment-sub">{c.country}</small>
                                                </div>
                                                <p className="comment-text">{c.text}</p>
                                            </div>

                                            <div className="comment-right" aria-hidden="true">
                                                <span className="star-oval" aria-label={ratingNumber > 0 ? `Рейтинг ${c.rating} из 5` : "Рейтинг недоступен"}>
                                                    <span className="rating-row" aria-hidden="true">
                                                        {ratingNumber > 0 ? (
                                                            <>
                                                                {Array.from({ length: fullStars }).map((_, i) => (
                                                                    <img key={"f" + i} src="/star-filled.svg" alt="" className="star-icon" />
                                                                ))}
                                                                {halfStar && <img key="half" src="/star-half.svg" alt="" className="star-icon" />}
                                                                {Array.from({ length: emptyStars }).map((_, i) => (
                                                                    <img key={"e" + i} src="/star-empty.svg" alt="" className="star-icon" />
                                                                ))}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <img src="/star-empty.svg" alt="" className="star-icon" />
                                                                <img src="/star-empty.svg" alt="" className="star-icon" />
                                                                <img src="/star-empty.svg" alt="" className="star-icon" />
                                                                <img src="/star-empty.svg" alt="" className="star-icon" />
                                                                <img src="/star-empty.svg" alt="" className="star-icon" />
                                                            </>
                                                        )}
                                                    </span>

                                                    <span className="rating-number" aria-hidden="true">
                                                        {ratingNumber > 0 ? ratingNumber : "—"}
                                                    </span>
                                                </span>

                                                <button className="comment-go" aria-label="Перейти к тайтлу" onClick={() => openTmdbItem(c)}>
                                                    <img src="/Arrow_right.svg" alt="" />
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div style={{ color: "#fff", opacity: 0.7 }}>Комментариев пока нет</div>
                            )}
                        </div>

                        <div className="comments-ad">
                            <AdBanner />
                        </div>
                    </div>
                )}

                {activeTab === "likes" && (
                    <>
                        <AccountCarousel title="Лайки" variant="favorites" />
                        <div style={{ marginTop: 18 }}>
                            <AdBanner />
                        </div>
                    </>
                )}
            </main>

            {isEditing && (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsEditing(false)}
                    onSave={onSaveProfile}
                    saving={saving}
                />
            )}
        </div>
    );
}