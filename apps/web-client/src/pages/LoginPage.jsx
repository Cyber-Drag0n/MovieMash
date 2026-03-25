import React, { useState } from "react";
import "../AuthPage.css";

export default function LoginPage({ navigate }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <main className="auth-page">
            <div className="auth-container">

                <h1 className="auth-header">Вход</h1>

                <form className="auth-form">

                    <label className="field">
                        <div className="label-text">Email</div>
                        <input
                            type="email"
                            className="input"
                            placeholder="Введите Ваш Email"
                        />
                    </label>

                    <label className="field">
                        <div className="label-text">Пароль</div>

                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input"
                                placeholder="Введите Ваш пароль"
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <img src="/eye_password.svg" alt="" />
                            </button>
                        </div>

                        <div className="forgot-password">
                            Забыли пароль?
                        </div>
                    </label>

                    <button className="auth-primary">
                        Войти
                    </button>

                    <div className="divider">
                        <span>Или войдите с помощью</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="social-btn">
                            <img src="/telegram.svg" alt="" />
                        </button>
                    </div>

                    <div className="auth-alt">
                        Нет учётной записи?{" "}
                        <button
                            type="button"
                            className="link"
                            onClick={() => navigate("/auth/register")}
                        >
                            Зарегистрироваться
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );
}