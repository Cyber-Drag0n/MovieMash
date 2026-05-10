// apps/web-client/src/pages/ResetPasswordPage.jsx
import React, { useMemo, useState } from "react";
import "../AuthPage.css";
import { apiFetch } from "../lib/api";

export default function ResetPasswordPage({ navigate }) {
    const token = useMemo(() => {
        try {
            const search = typeof window !== "undefined" ? window.location.search : "";
            return new URLSearchParams(search).get("token") || "";
        } catch {
            return "";
        }
    }, []);

    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!token) {
            setError("Токен сброса не найден");
            return;
        }

        if (!password.trim() || !passwordRepeat.trim()) {
            setError("Введите новый пароль и повторите его");
            return;
        }

        if (password !== passwordRepeat) {
            setError("Пароли не совпадают");
            return;
        }

        if (password.length < 6) {
            setError("Пароль должен быть не короче 6 символов");
            return;
        }

        setLoading(true);

        try {
            await apiFetch("/api/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({
                    token,
                    password,
                    passwordRepeat,
                }),
            });

            setSuccess("Пароль успешно изменён");
            setPassword("");
            setPasswordRepeat("");

            setTimeout(() => {
                navigate("/auth/login");
            }, 1200);
        } catch (err) {
            setError(err.message || "Ошибка сброса пароля");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-container">
                <h1 className="auth-header">Новый пароль</h1>

                <form className="auth-form" onSubmit={onSubmit}>
                    <label className="field">
                        <div className="label-text">Новый пароль</div>
                        <input
                            type="password"
                            className="input"
                            placeholder="Введите новый пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </label>

                    <label className="field">
                        <div className="label-text">Повторите пароль</div>
                        <input
                            type="password"
                            className="input"
                            placeholder="Повторите новый пароль"
                            value={passwordRepeat}
                            onChange={(e) => setPasswordRepeat(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </label>

                    {error && (
                        <div className="auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ color: "#7CFF7C", marginBottom: 12 }}>
                            {success}
                        </div>
                    )}

                    <button className="auth-primary" disabled={loading}>
                        {loading ? "Сохранение..." : "Изменить пароль"}
                    </button>

                    <div className="auth-alt">
                        <button
                            type="button"
                            className="link"
                            onClick={() => navigate("/auth/login")}
                        >
                            Вернуться ко входу
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}