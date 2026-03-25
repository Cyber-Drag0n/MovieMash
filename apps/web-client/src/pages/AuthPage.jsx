// src/pages/AuthPage.jsx
import React, { useState } from "react";
import "../AuthPage.css";

export default function AuthPage({ navigate }) {
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false); // локальный признак успешной авторизации (если нет navigate)

    const submit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!email || !password) {
            setError("Заполните email и пароль");
            return;
        }
        if (mode === "register" && password !== password2) {
            setError("Пароли не совпадают");
            return;
        }

        // front-end only: если передан navigate (App), то переходим на /account
        if (typeof navigate === "function") {
            navigate("/account");
            return;
        }

        // иначе просто показываем краткое подтверждение (фронт-заглушка)
        setSuccess(true);
    };

    return (
        <main className="auth-page" aria-live="polite">
            <div className="auth-container" role="region" aria-label="Форма авторизации">
                <h1 className="auth-header">{mode === "login" ? "Вход" : "Регистрация"}</h1>

                <div className="auth-tabs" role="tablist" aria-label="Выбор режима">
                    <button
                        role="tab"
                        aria-selected={mode === "login"}
                        className={`tab ${mode === "login" ? "active" : ""}`}
                        onClick={() => { setMode("login"); setError(""); setSuccess(false); }}
                    >
                        Вход
                    </button>
                    <button
                        role="tab"
                        aria-selected={mode === "register"}
                        className={`tab ${mode === "register" ? "active" : ""}`}
                        onClick={() => { setMode("register"); setError(""); setSuccess(false); }}
                    >
                        Регистрация
                    </button>
                </div>

                {success && (
                    <div className="auth-success" role="status">
                        Успешно! Вы вошли (режим фронта).
                    </div>
                )}

                <form className="auth-form" onSubmit={submit} noValidate>
                    <label className="field">
                        <div className="label-text">Email</div>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Введите Ваш Email"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="field">
                        <div className="label-text">Пароль</div>
                        <div className="password-row">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите Ваш пароль"
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                                required
                            />
                            <button
                                type="button"
                                title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                className="eye-btn"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-pressed={showPassword}
                                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                            >
                                <img src="/Eye.svg" alt="" />
                            </button>
                        </div>
                    </label>

                    {mode === "register" && (
                        <label className="field">
                            <div className="label-text">Повторите пароль</div>
                            <div className="password-row">
                                <input
                                    type={showPassword2 ? "text" : "password"}
                                    className="input"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    placeholder="Повторите пароль"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    title={showPassword2 ? "Скрыть пароль" : "Показать пароль"}
                                    className="eye-btn"
                                    onClick={() => setShowPassword2((s) => !s)}
                                    aria-pressed={showPassword2}
                                    aria-label={showPassword2 ? "Скрыть пароль" : "Показать пароль"}
                                >
                                    <img src="/Eye.svg" alt="" />
                                </button>
                            </div>
                        </label>
                    )}

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <button type="submit" className="auth-primary">
                        {mode === "login" ? "Войти" : "Зарегистрироваться"}
                    </button>

                    <div className="auth-alt">
                        {mode === "login" ? (
                            <span>Нет учётной записи? <button type="button" className="link" onClick={() => { setMode("register"); setError(""); }}>Зарегистрироваться</button></span>
                        ) : (
                            <span>Уже есть аккаунт? <button type="button" className="link" onClick={() => { setMode("login"); setError(""); }}>Войти</button></span>
                        )}
                    </div>
                </form>
            </div>
        </main>
    );
}