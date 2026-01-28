import React, { useState } from "react";

const faqData = [
    { id: 1, q: "Что такое MovieMash?", a: "MovieMash - это потоковый сервис, который позволяет вам смотреть фильмы и шоу по запросу." },
    { id: 2, q: "Сколько стоит MovieMash?", a: "Стоимость тарифов начинается от 800 рублей. Доступны три варианта подписки:\n• Основной — 800 ₽\n• Стандартный — 1050 ₽\n• Премиум — 1200 ₽" },
    { id: 3, q: "Какой контент доступен на MovieMash?", a: "На MovieMash есть всё: от культовой классики до самых свежих новинок. Фильмы, сериалы, документальное кино, аниме и даже нишевые артхаусные проекты." },
    { id: 4, q: "Как я могу смотреть MovieMash?", a: "Зарегистрируйтесь — и мгновенно получите полный доступ ко всем фильмам и сериалам на 30 дней. Никаких предоплат, отменить можно в любой момент." },
    {
        id: 5,
        q: "Как мне зарегистрироваться на MovieMash?",
        a:
            "Это быстро и легко!\n" +
            "1. Нажмите на «Профиль» (на сайте — значок в правом верхнем углу; в мобильной версии — ищите его в «бургер-меню» ☰).\n" +
            "2. В открывшемся окне выберите кнопку «Зарегистрироваться».\n" +
            "3. Введите свой email и придумайте пароль."
    },
    {
        id: 6,
        q: "Есть ли бесплатная пробная версия MovieMash?",
        a:
            "Бесплатные 30 дней MovieMash.\n" +
            "Полный доступ ко всем фильмам и сериалам. Никакой карты не нужно, скрытых условий нет. Просто регистрируешься и смотришь. Если не подойдет — легко отменить."
    },
    {
        id: 7,
        q: "Как мне связаться со службой поддержки MovieMash?",
        a:
            "Чтобы обратиться в нашу службу поддержки:\n" +
            "1. Перейдите в раздел «Помощь» на сайте или в приложении.\n" +
            "2. Заполните форму обратной связи, указав:\n" +
            "   • Ваше имя и фамилию\n" +
            "   • Электронную почту\n" +
            "   • Номер телефона\n" +
            "   • Суть вашего вопроса\n" +
            "3. Ответ придет на указанную почту в течение 24 часов. Мы всегда готовы помочь!"
    },
    {
        id: 8,
        q: "Какие существуют способы оплаты в MovieMash?",
        a:
            "Оплатить подписку можно любым удобным способом:\n" +
            "• Банковские карты (Visa, Mastercard, МИР)\n" +
            "• Электронные кошельки (ЮMoney, QIWI)\n" +
            "• Мобильные платежи\n" +
            "• Через интернет-банкинг"
    }
];

export default function FAQ() {
    // теперь это массив id открытых вопросов — можно открыть несколько
    const [openIds, setOpenIds] = useState([]);

    const mid = Math.ceil(faqData.length / 2);
    const left = faqData.slice(0, mid);
    const right = faqData.slice(mid);

    const toggle = (id) => {
        setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <section className="faq-section">
            <div className="faq-head">
                <div className="faq-left">
                    <h3 className="faq-title">Часто задаваемые вопросы</h3>
                    <p className="faq-sub">
                        У вас есть вопросы? У нас есть ответы! Ознакомьтесь с разделом часто задаваемых вопросов, чтобы найти ответы на
                        самые распространённые вопросы о MovieMash.
                    </p>
                </div>

                <div className="faq-action">
                    <button className="ask-btn">Спросить вопрос</button>
                </div>
            </div>

            <div className="faq-grid">
                <div className="faq-column">
                    {left.map(item => {
                        const opened = openIds.includes(item.id);
                        return (
                            <div className="faq-item" key={item.id}>
                                <div className="faq-row">
                                    <div className="num-badge">{String(item.id).padStart(2, "0")}</div>

                                    <button
                                        className="faq-question"
                                        onClick={() => toggle(item.id)}
                                        aria-expanded={opened}
                                    >
                                        {item.q}
                                    </button>

                                    {/* кнопка пустого содержимого — отображение плюса/минуса через CSS псевдоэлементы */}
                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggle(item.id)}
                                        aria-label={opened ? "Свернуть" : "Развернуть"}
                                        aria-expanded={opened}
                                    />
                                </div>

                                {opened && (
                                    <div className="faq-answer">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="faq-column">
                    {right.map(item => {
                        const opened = openIds.includes(item.id);
                        return (
                            <div className="faq-item" key={item.id}>
                                <div className="faq-row">
                                    <div className="num-badge">{String(item.id).padStart(2, "0")}</div>

                                    <button
                                        className="faq-question"
                                        onClick={() => toggle(item.id)}
                                        aria-expanded={opened}
                                    >
                                        {item.q}
                                    </button>

                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggle(item.id)}
                                        aria-label={opened ? "Свернуть" : "Развернуть"}
                                        aria-expanded={opened}
                                    />
                                </div>

                                {opened && (
                                    <div className="faq-answer">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
