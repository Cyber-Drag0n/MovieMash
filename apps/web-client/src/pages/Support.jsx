// pages/Support.jsx
import React, { useState } from "react";
import "../Support.css";
import FAQ from "../components/FAQ.jsx";
import AdBanner from "../components/AdBanner.jsx";

export default function Support() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
        accept: false
    });

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: тут отправка формы (fetch/axios) или валидация
        console.log("submit", form);
        alert("Сообщение отправлено (заглушка).");
    };

    return (
        <main className="page-content support-page" aria-label="Поддержка">
            <div className="support-inner">
                {/* LEFT: заголовок + картинка-контейнер */}
                <section className="support-left" aria-labelledby="support-title">
                    <h1 id="support-title" className="support-title">
                        Добро пожаловать на нашу страницу поддержки!
                    </h1>
                    <p className="support-sub">
                        Мы здесь для того, чтобы помочь вам решить любые проблемы, которые могут возникнуть с нашим продуктом.
                    </p>

                    <div className="help-visual-wrap" aria-hidden="true">
                        {/* картинка-контейнер (static в public) */}
                        <img src="/help_container.png" alt="" className="help-container-img" />
                    </div>
                </section>

                {/* RIGHT: форма */}
                <section className="support-right" aria-labelledby="support-form-title">

                    <form className="support-form" onSubmit={onSubmit}>
                        <div className="row-2">
                            <label className="form-field">
                                <span className="label-text">Имя</span>
                                <input name="firstName" value={form.firstName} onChange={onChange} placeholder="Введите Ваше имя" />
                            </label>

                            <label className="form-field">
                                <span className="label-text">Фамилия</span>
                                <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Введите Вашу фамилию" />
                            </label>
                        </div>

                        <div className="row-2">
                            <label className="form-field">
                                <span className="label-text">Email</span>
                                <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Введите Ваш Email" />
                            </label>

                            <label className="form-field">
                                <span className="label-text">Номер телефона</span>
                                <div className="phone-row">
                                    <button type="button" className="flag-btn" aria-hidden="true">
                                        <img src="/russia.svg" alt="" className="flag-img" />
                                        <span className="caret">▾</span>
                                    </button>
                                    <input name="phone" value={form.phone} onChange={onChange} placeholder="Введите номер телефона" />
                                </div>
                            </label>
                        </div>

                        <label className="form-field">
                            <span className="label-text">Сообщение</span>
                            <textarea name="message" value={form.message} onChange={onChange} placeholder="Введите Ваше сообщение" rows="6" />
                        </label>

                        <div className="form-bottom">
                            <label className="accept-row">
                                <input name="accept" type="checkbox" checked={form.accept} onChange={onChange} />
                                <span>Я принимаю Пользовательское соглашение и Политику конфиденциальности</span>
                            </label>

                            <button className="submit-btn" type="submit" disabled={!form.accept}>
                                Отправить сообщение
                            </button>

                        </div>
                    </form>
                </section>
            </div>
            <FAQ />
            <AdBanner />
        </main>
    );
}
