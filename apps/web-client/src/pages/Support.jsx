import React, { useState } from "react";
import "../Support.css";
import FAQ from "../components/FAQ.jsx";
import AdBanner from "../components/AdBanner.jsx";
import { apiFetch } from "../lib/api";

export default function Support() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
        accept: false,
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            await apiFetch("/api/support/messages", {
                method: "POST",
                body: JSON.stringify({
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    subject: form.subject.trim() || "Обращение из поддержки",
                    message: form.message.trim(),
                }),
            });

            setSuccess("Сообщение успешно отправлено");
            setForm({
                firstName: "",
                lastName: "",
                email: "",
                subject: "",
                message: "",
                accept: false,
            });
        } catch (err) {
            setError(err.message || "Ошибка отправки");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page-content support-page" aria-label="Поддержка">
            <div className="support-inner">
                <section className="support-left" aria-labelledby="support-title">
                    <h1 id="support-title" className="support-title">
                        Добро пожаловать на нашу страницу поддержки!
                    </h1>
                    <p className="support-sub">
                        Мы здесь для того, чтобы помочь вам решить любые проблемы, которые могут возникнуть с нашим продуктом.
                    </p>

                    <div className="help-visual-wrap" aria-hidden="true">
                        <img src="/help_container.png" alt="" className="help-container-img" />
                    </div>
                </section>

                <section className="support-right" aria-labelledby="support-form-title">
                    <form className="support-form" onSubmit={onSubmit}>
                        <div className="row-2">
                            <label className="form-field">
                                <span className="label-text">Имя</span>
                                <input
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={onChange}
                                    placeholder="Введите Ваше имя"
                                    required
                                />
                            </label>

                            <label className="form-field">
                                <span className="label-text">Фамилия</span>
                                <input
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={onChange}
                                    placeholder="Введите Вашу фамилию"
                                    required
                                />
                            </label>
                        </div>

                        <div className="row-2">
                            <label className="form-field">
                                <span className="label-text">Email</span>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={onChange}
                                    placeholder="Введите Ваш Email"
                                    required
                                />
                            </label>

                            <label className="form-field">
                                <span className="label-text">Тема</span>
                                <input
                                    name="subject"
                                    value={form.subject}
                                    onChange={onChange}
                                    placeholder="Тема обращения"
                                />
                            </label>
                        </div>

                        <label className="form-field">
                            <span className="label-text">Сообщение</span>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={onChange}
                                placeholder="Введите Ваше сообщение"
                                rows="6"
                                required
                            />
                        </label>

                        <div className="form-bottom">
                            <label className="accept-row">
                                <input
                                    name="accept"
                                    type="checkbox"
                                    checked={form.accept}
                                    onChange={onChange}
                                    required
                                />
                                <span>Я принимаю Пользовательское соглашение и Политику конфиденциальности</span>
                            </label>

                            <button className="submit-btn" type="submit" disabled={!form.accept || loading}>
                                {loading ? "Отправка..." : "Отправить сообщение"}
                            </button>
                        </div>

                        {success && <div style={{ marginTop: 14, color: "#7CFF7C" }}>{success}</div>}
                        {error && <div style={{ marginTop: 14, color: "#ff7b7b" }}>{error}</div>}
                    </form>
                </section>
            </div>

            <FAQ />
            <AdBanner />
        </main>
    );
}