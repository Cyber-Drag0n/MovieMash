import React, { useState } from "react";

const plans = [
    {
        id: "basic",
        title: "Базовый тариф",
        desc: "Доступ к огромной библиотеке кино: от культовых классик до самых свежих и громких новинок.",
        monthly: 800,
        early: 7700
    },
    {
        id: "standard",
        title: "Стандартный тариф",
        desc: "Доступ к более широкой подборке фильмов и сериалов, включая большинство новинок и эксклюзивный контент.",
        monthly: 1050,
        early: 10100
    },
    {
        id: "premium",
        title: "Премиум тариф",
        desc: "Вся библиотека кино без ограничений: самые свежие премьеры, эксклюзивные проекты и функция загрузки для просмотра без интернета.",
        monthly: 1200,
        early: 11500
    }
];

export default function Plans() {
    const [billing, setBilling] = useState("month"); // 'month' | 'year'
    const [selected, setSelected] = useState(null);

    const formatPrice = (val) => `${Math.round(val)}₽`;

    const handleSelect = (plan) => {
        setSelected(plan.id);
        alert(`Выбран план: ${plan.title} (${billing === "month" ? "ежемесячно" : "ежегодно"})`);
    };

    return (
        <section className="plans-section" aria-label="Планы подписки">
            <div className="plans-head">
                <div>
                    <h2 className="plans-title">Выберите план, который подходит именно вам</h2>
                    <p className="plans-sub">
                        Присоединяйтесь к MovieMash и выбирайте из наших гибких вариантов подписки, адаптированных к вашим
                        предпочтениям при просмотре. Приготовьтесь к развлечениям в режиме нон-стоп!
                    </p>
                </div>

                <div className="billing-toggle" role="tablist" aria-label="Выбор периода оплаты">
                    <button
                        className={`billing-btn ${billing === "month" ? "active" : ""}`}
                        onClick={() => setBilling("month")}
                        aria-pressed={billing === "month"}
                    >
                        Ежемесячно
                    </button>
                    <button
                        className={`billing-btn ${billing === "year" ? "active" : ""}`}
                        onClick={() => setBilling("year")}
                        aria-pressed={billing === "year"}
                    >
                        Ежегодно
                    </button>
                </div>
            </div>

            <div className="plans-grid">
                {plans.map((p) => {
                    const isSelected = selected === p.id;
                    // используем p.early когда показываем годовую цену (ты сама заполнила эти поля)
                    const priceValue = billing === "month" ? p.monthly : p.early;

                    return (
                        <article key={p.id} className={`plan-card ${isSelected ? "selected" : ""}`} aria-label={p.title}>
                            <div className="plan-inner">
                                <h3 className="plan-title">{p.title}</h3>

                                {/* Описание — теперь даём минимальную высоту, чтобы кнопки выравнивались */}
                                <p className="plan-desc">{p.desc}</p>

                                <div className="plan-price">
                                    <div className="price-big">{formatPrice(priceValue)}</div>
                                    <div className="price-sub">{billing === "month" ? "/мес." : "/год"}</div>
                                </div>

                                <div className="plan-actions">
                                    <button className="trial-btn" onClick={() => alert("Запрос на пробную версию")}>Пробная версия</button>
                                    <button className="choose-btn" onClick={() => handleSelect(p)}>Выбрать план</button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
