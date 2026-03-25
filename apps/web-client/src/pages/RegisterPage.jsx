import React, { useState } from "react";
import "../AuthPage.css";

export default function RegisterPage({ navigate }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    return (
        <main className="auth-page">
            <div className="auth-container">

                <h1 className="auth-header">Регистрация</h1>

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
                    </label>

                    <label className="field">
                        <div className="label-text">Пароль</div>

                        <div className="input-wrapper">
                            <input
                                type={showPassword2 ? "text" : "password"}
                                className="input"
                                placeholder="Повторите Ваш пароль"
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

                    <button className="auth-primary">
                        Зарегистрироваться
                    </button>

                    <div className="auth-alt">
                        Уже есть аккаунт?{" "}
                        <button
                            type="button"
                            className="link"
                            onClick={() => navigate("/auth/login")}
                        >
                            Войти
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );
}