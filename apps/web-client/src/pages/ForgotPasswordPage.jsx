// apps/web-client/src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import "../AuthPage.css";
import { apiFetch } from "../lib/api";

export default function ForgotPasswordPage({ navigate }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await apiFetch("/api/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email: email.trim() }),
            });

            setSuccess(res?.message || "Письмо для восстановления отправлено.");
            setEmail("");
        } catch (err) {
            setError(err.message || "Ошибка восстановления пароля");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-container">
                <h1 className="auth-header">Восстановление пароля</h1>

                <form className="auth-form" onSubmit={onSubmit}>
                    <label className="field">
                        <div className="label-text">Email</div>
                        <input
                            type="email"
                            className="input"
                            placeholder="Введите Ваш Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </label>

                    {error && <div className="auth-error" role="alert">{error}</div>}
                    {success && <div style={{ color: "#7CFF7C", marginBottom: 12 }}>{success}</div>}

                    <button className="auth-primary" disabled={loading}>
                        {loading ? "Отправка..." : "Отправить письмо"}
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