import React, { useState } from "react";
import "../AuthPage.css";
import { apiFetch, setJwt } from "../lib/api";

export default function LoginPage({ navigate }) {
    const [showPassword, setShowPassword] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ login, password }),
            });

            setJwt(res.token);
            localStorage.setItem("movie_mash_user", JSON.stringify(res.user));
            navigate("/account");
        } catch (err) {
            setError(err.message || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-container">
                <h1 className="auth-header">Вход</h1>

                <form className="auth-form" onSubmit={onSubmit}>
                    <label className="field">
                        <div className="label-text">Email или логин</div>
                        <input
                            type="text"
                            className="input"
                            placeholder="Введите Ваш Email или логин"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className="field">
                        <div className="label-text">Пароль</div>

                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input"
                                placeholder="Введите Ваш пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <img src="/eye_password.svg" alt="" />
                            </button>
                        </div>

                        <div className="forgot-password">Забыли пароль?</div>
                    </label>

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <button className="auth-primary" disabled={loading}>
                        {loading ? "Вход..." : "Войти"}
                    </button>

                    <div className="auth-alt">
                        Нет учётной записи?{" "}
                        <button
                            type="button"
                            className="link"
                            onClick={() => navigate("/register")}
                        >
                            Зарегистрироваться
                        </button>
                    </div>

                    <div className="auth-alt">
                        <button
                            type="button"
                            className="link"
                            onClick={() => navigate("/auth")}
                        >
                            Вернуться к выбору
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}