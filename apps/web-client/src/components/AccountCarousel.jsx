// src/components/AccountCarousel.jsx
import React, { useState } from "react";
import "../AccountPage.css";


const SAMPLE = [
    { id: 1, img: "/example.jpg", duration: "1ч 57мин", rating: 4.5, votes: "20K" },
    { id: 2, img: "/example.jpg", duration: "1ч 30мин", rating: 4.0, votes: "12K" },
    { id: 3, img: "/example.jpg", duration: "1ч 42мин", rating: 4.8, votes: "48K" },
    { id: 4, img: "/example.jpg", duration: "2ч 10мин", rating: 4.2, votes: "9.2K" },
    { id: 5, img: "/example.jpg", duration: "1ч 38мин", rating: 3.8, votes: "3.1K" },
    { id: 6, img: "/example.jpg", duration: "1ч 20мин", rating: 4.1, votes: "7.8K" }
];

function MustWatchCard({ item, variant }) {
    const fullStars = Math.floor(item.rating);
    const halfStar = item.rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <article className="category-card top-card must-card" role="listitem">
            <div className="must-poster-wrap">
                <img
                    src={item.img}
                    alt=""
                    className="must-poster"
                    onError={(e) => { e.currentTarget.src = "/example.jpg"; }}
                />
            </div>

            <span className="trend-badge left must-left" aria-hidden="true">
        <img src="/Time.svg" alt="" />
        <span className="badge-text">{item.duration}</span>
      </span>

            <span className="trend-badge right must-right" aria-hidden="true">
        <span className="rating-row" aria-label={`Рейтинг ${item.rating} из 5`}>
          {Array.from({ length: fullStars }).map((_, i) => (
              <img key={"f"+i} src="/star-filled.svg" alt="" className="star-icon" />
          ))}
            {halfStar && <img key="half" src="/star-half.svg" alt="" className="star-icon" />}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <img key={"e"+i} src="/star-empty.svg" alt="" className="star-icon" />
            ))}
        </span>

                {/* в режиме ratings — ТОЛЬКО звёзды, без текста видимости голосов */}
                {variant === "watchlist" && <span className="badge-text votes-text">{item.votes}</span>}
      </span>
        </article>
    );
}

export default function AccountCarousel({ title = "Категория", variant = "ratings" }) {
    const cardsPerPage = 4;
    const groups = [];
    for (let i = 0; i < SAMPLE.length; i += cardsPerPage) groups.push(SAMPLE.slice(i, i + cardsPerPage));
    const pages = Math.max(1, groups.length);

    const [page, setPage] = useState(0);
    const prev = () => setPage((p) => Math.max(0, p - 1));
    const next = () => setPage((p) => Math.min(pages - 1, p + 1));

    return (
        <section className="account-carousel" aria-label={title}>
            <div className="carousel-header">
                <h2 className="carousel-title">{title}</h2>

                {/* Контролблок: стрелки + progress-line (ваш CSS использован) */}
                <div className="categories-controls">
                    <button className="ctrl-arrow" onClick={prev} aria-label="Предыдущая" disabled={page === 0}>
                        <img src="/Arrow_left.svg" alt="prev" />
                    </button>

                    <div className="progress-line" role="tablist" aria-label="Страницы карусели">
                        {Array.from({ length: pages }).map((_, idx) => (
                            <span key={idx} className={`progress-seg ${idx === page ? "active" : ""}`} aria-hidden="true" />
                        ))}
                    </div>

                    <button className="ctrl-arrow" onClick={next} aria-label="Следующая" disabled={page === pages - 1}>
                        <img src="/Arrow_right.svg" alt="next" />
                    </button>
                </div>
            </div>

            <div className="must-row pages" role="list">
                {(groups[page] || []).map((it) => <MustWatchCard key={it.id} item={it} variant={variant} />)}
            </div>
        </section>
    );
}