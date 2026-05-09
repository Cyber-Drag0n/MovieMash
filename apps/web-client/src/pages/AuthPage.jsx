import React, { useEffect } from "react";
import "../AuthPage.css";
import { getJwt } from "../lib/api";

export default function AuthPage({ navigate }) {
    useEffect(() => {
        if (getJwt() && typeof navigate === "function") {
            navigate("/account");
        }
    }, [navigate]);

    return (
        <main className="auth-page auth-hub" aria-label="Выбор способа входа">
            <div className="auth-container auth-hub-container">
                <div className="auth-hub-top">
                    <img src="/Logo.svg" alt="MovieMash" className="auth-hub-logo" />
                    <h1 className="auth-header">Добро пожаловать</h1>
                    <p className="auth-hub-text">
                        Выберите, что нужно сделать дальше: войти в аккаунт или создать новый.
                    </p>
                </div>

                <div className="auth-hub-actions">
                    <button type="button" className="auth-primary auth-hub-btn" onClick={() => navigate("/login")}>
                        Войти
                    </button>
                    <button type="button" className="auth-secondary auth-hub-btn" onClick={() => navigate("/register")}>
                        Регистрация
                    </button>
                </div>

                <div className="auth-hub-foot">
                    <button type="button" className="link" onClick={() => navigate("/")}>
                        Вернуться на главную
                    </button>
                </div>
            </div>
        </main>
    );
}