import React, { useState } from "react";
import "../AuthPage.css";
import { apiFetch, setJwt } from "../lib/api";

export default function RegisterPage({ navigate }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== password2) {
            setError("Пароли не совпадают");
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    display_name: username,
                }),
            });

            setJwt(res.token);
            localStorage.setItem("movie_mash_user", JSON.stringify(res.user));
            navigate("/account");
        } catch (err) {
            setError(err.message || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-container">
                <h1 className="auth-header">Регистрация</h1>

                <form className="auth-form" onSubmit={onSubmit}>
                    <label className="field">
                        <div className="label-text">Имя пользователя</div>
                        <input
                            type="text"
                            className="input"
                            placeholder="Введите имя пользователя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </label>

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

                    <label className="field">
                        <div className="label-text">Пароль</div>

                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input"
                                placeholder="Введите Ваш пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
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
                    </label>

                    <label className="field">
                        <div className="label-text">Повторите пароль</div>

                        <div className="input-wrapper">
                            <input
                                type={showPassword2 ? "text" : "password"}
                                className="input"
                                placeholder="Повторите Ваш пароль"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword2(!showPassword2)}
                            >
                                <img src="/eye_password.svg" alt="" />
                            </button>
                        </div>
                    </label>

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <button className="auth-primary" disabled={loading}>
                        {loading ? "Создание..." : "Зарегистрироваться"}
                    </button>

                    <div className="auth-alt">
                        Уже есть аккаунт?{" "}
                        <button
                            type="button"
                            className="link"
                            onClick={() => navigate("/login")}
                        >
                            Войти
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