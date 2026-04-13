// pages/Support.jsx
import React, { useEffect, useRef, useState } from "react";
import "../Support.css";
import FAQ from "../components/FAQ.jsx";
import AdBanner from "../components/AdBanner.jsx";

const FLAGS = [
    { code: "RU", label: "Россия", dialCode: "+7", file: "ru.svg" },
    { code: "US", label: "США", dialCode: "+1", file: "us.svg" },
    { code: "GB", label: "Великобритания", dialCode: "+44", file: "gb.svg" },
    { code: "DE", label: "Германия", dialCode: "+49", file: "de.svg" },
    { code: "FR", label: "Франция", dialCode: "+33", file: "fr.svg" },
    { code: "IT", label: "Италия", dialCode: "+39", file: "it.svg" },
    { code: "ES", label: "Испания", dialCode: "+34", file: "es.svg" },
    { code: "TR", label: "Турция", dialCode: "+90", file: "tr.svg" },
    { code: "KZ", label: "Казахстан", dialCode: "+7", file: "kz.svg" },
    { code: "UA", label: "Украина", dialCode: "+380", file: "ua.svg" },
    { code: "BY", label: "Беларусь", dialCode: "+375", file: "by.svg" },
    { code: "PL", label: "Польша", dialCode: "+48", file: "pl.svg" },
    { code: "CH", label: "Швейцария", dialCode: "+41", file: "ch.svg" },
    { code: "SE", label: "Швеция", dialCode: "+46", file: "se.svg" },
    { code: "JP", label: "Япония", dialCode: "+81", file: "jp.svg" },
    { code: "CN", label: "Китай", dialCode: "+86", file: "cn.svg" },
    { code: "KR", label: "Южная Корея", dialCode: "+82", file: "kr.svg" },
    { code: "AE", label: "ОАЭ", dialCode: "+971", file: "ae.svg" },
    { code: "SA", label: "Саудовская Аравия", dialCode: "+966", file: "sa.svg" },
    { code: "BR", label: "Бразилия", dialCode: "+55", file: "br.svg" },
];

export default function Support() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
        accept: false
    });

    const [selectedFlag, setSelectedFlag] = useState(FLAGS[0]);
    const [flagOpen, setFlagOpen] = useState(false);
    const flagRef = useRef(null);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (flagRef.current && !flagRef.current.contains(e.target)) {
                setFlagOpen(false);
            }
        };

        const onEsc = (e) => {
            if (e.key === "Escape") setFlagOpen(false);
        };

        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onEsc);

        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        console.log("submit", {
            ...form,
            country: selectedFlag.code,
            dialCode: selectedFlag.dialCode
        });
        alert("Сообщение отправлено (заглушка).");
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
                                />
                            </label>

                            <label className="form-field">
                                <span className="label-text">Фамилия</span>
                                <input
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={onChange}
                                    placeholder="Введите Вашу фамилию"
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
                                />
                            </label>

                            <label className="form-field">
                                <span className="label-text">Номер телефона</span>
                                <div className="phone-row">
                                    <div className="flag-picker" ref={flagRef}>
                                        <button
                                            type="button"
                                            className="flag-btn"
                                            onClick={() => setFlagOpen((v) => !v)}
                                            aria-haspopup="listbox"
                                            aria-expanded={flagOpen}
                                            aria-label={`Выбрана страна: ${selectedFlag.label}`}
                                        >
                                            <img
                                                src={`/flags/${selectedFlag.file}`}
                                                alt=""
                                                className="flag-img"
                                            />
                                            <span className="caret">▾</span>
                                        </button>

                                        {flagOpen && (
                                            <div className="flag-menu" role="listbox" aria-label="Выбор страны">
                                                {FLAGS.map((flag) => (
                                                    <button
                                                        key={flag.code}
                                                        type="button"
                                                        className={`flag-item ${selectedFlag.code === flag.code ? "active" : ""}`}
                                                        onClick={() => {
                                                            setSelectedFlag(flag);
                                                            setFlagOpen(false);
                                                        }}
                                                        role="option"
                                                        aria-selected={selectedFlag.code === flag.code}
                                                    >
                                                        <img
                                                            src={`/flags/${flag.file}`}
                                                            alt=""
                                                            className="flag-img"
                                                        />
                                                        <span className="flag-text">{flag.label}</span>
                                                        <span className="flag-dial">{flag.dialCode}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={onChange}
                                        placeholder={`${selectedFlag.dialCode} Введите номер телефона`}
                                    />
                                </div>
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
                            />
                        </label>

                        <div className="form-bottom">
                            <label className="accept-row">
                                <input
                                    name="accept"
                                    type="checkbox"
                                    checked={form.accept}
                                    onChange={onChange}
                                />
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