// src/pages/AuthPage.jsx
import React, { useState } from "react";
import "../AuthPage.css"; // убедитесь, что файл лежит в src/pages/AuthPage.css

export default function AuthPage({ navigate }) {
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [error, setError] = useState("");

    const submit = (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Заполните email и пароль"); return; }
        if (mode === "register" && password !== password2) { setError("Пароли не совпадают"); return; }

        // TODO: заменить на реальный API вызов
        setTimeout(() => {
            // симуляция успешного логина/регистрации
            if (typeof navigate === "function") navigate("/account");
            else window.location.href = "/account";
        }, 400);
    };

    return (
        <main className="auth-page">
            <div className="auth-container">
                <h1 className="auth-header">{mode === "login" ? "Вход" : "Регистрация"}</h1>

                <div className="auth-tabs">
                    <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Вход</button>
                    <button className={`tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>Регистрация</button>
                </div>

                <form className="auth-form" onSubmit={submit}>
                    <label className="field">
                        <div className="label-text">Email</div>
                        <input type="email" className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Введите Ваш Email" />
                    </label>

                    <label className="field">
                        <div className="label-text">Пароль</div>
                        <div className="password-row">
                            <input type={showPassword ? "text" : "password"} className="input" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Введите Ваш пароль" />
                            <button type="button" className="eye-btn" onClick={() => setShowPassword(s => !s)} aria-label="Показать пароль">
                                <img src="/Eye.svg" alt="eye" />
                            </button>
                        </div>
                    </label>

                    {mode === "register" && (
                        <label className="field">
                            <div className="label-text">Повторите пароль</div>
                            <div className="password-row">
                                <input type={showPassword2 ? "text" : "password"} className="input" value={password2} onChange={(e)=>setPassword2(e.target.value)} placeholder="Повторите пароль" />
                                <button type="button" className="eye-btn" onClick={() => setShowPassword2(s => !s)} aria-label="Показать пароль">
                                    <img src="/Eye.svg" alt="eye" />
                                </button>
                            </div>
                        </label>
                    )}

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-primary">{mode === "login" ? "Войти" : "Зарегистрироваться"}</button>

                    <div className="auth-alt">
                        {mode === "login" ? (
                            <span>Нет учётной записи? <button type="button" className="link" onClick={() => setMode("register")}>Зарегистрироваться</button></span>
                        ) : (
                            <span>Уже есть аккаунт? <button type="button" className="link" onClick={() => setMode("login")}>Войти</button></span>
                        )}
                    </div>
                </form>
            </div>
        </main>
    );
}
