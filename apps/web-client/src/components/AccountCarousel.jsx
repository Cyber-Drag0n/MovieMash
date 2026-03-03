import React, { useState } from "react";

const SAMPLE_MUST = [
    { id: 1, img: "/example.jpg", duration: "1ч 57мин", rating: 4.5, votes: "20K", title: "Постер 1" },
    { id: 2, img: "/example.jpg", duration: "1ч 30мин", rating: 4.0, votes: "12K", title: "Постер 2" },
    { id: 3, img: "/example.jpg", duration: "1ч 42мин", rating: 4.8, votes: "48K", title: "Постер 3" },
    { id: 4, img: "/example.jpg", duration: "2ч 10мин", rating: 4.2, votes: "9.2K", title: "Постер 4" }
];

export default function AccountCarousel({ title, variant }) {
    const [page, setPage] = useState(0);

    if (variant === "must") {
        const cardsPerPage = 4;
        const groups = [];

        for (let i = 0; i < SAMPLE_MUST.length; i += cardsPerPage) {
            groups.push(SAMPLE_MUST.slice(i, i + cardsPerPage));
        }

        const prev = () => setPage((p) => Math.max(0, p - 1));
        const next = () => setPage((p) => Math.min(groups.length - 1, p + 1));

        return (
            <section className="account-carousel" aria-label={title}>
                <div className="carousel-header">
                    <h2>{title}</h2>
                    <div className="carousel-controls">
                        <button className="ctrl-arrow" onClick={prev} disabled={page === 0} aria-label="Предыдущая страница">‹</button>
                        <button className="ctrl-arrow" onClick={next} disabled={page === groups.length - 1} aria-label="Следующая страница">›</button>
                    </div>
                </div>

                <div className="must-row">
                    {(groups[page] || []).map((item) => (
                        <article className="must-card" key={item.id} aria-label={item.title}>
                            <div className="must-poster-wrap">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="must-poster"
                                    onError={(e) => {
                                        e.currentTarget.src = "/example.jpg";
                                    }}
                                />
                            </div>

                            <span className="trend-badge must-left">
                                <img src="/Time.svg" alt="" className="badge-icon" />
                                <span className="badge-text">{item.duration}</span>
                            </span>

                            <span className="trend-badge must-right">
                                <span className="rating-row" aria-label={`Рейтинг ${item.rating}`}>
                                    {Array.from({ length: Math.floor(item.rating) }).map((_, i) => (
                                        <img key={i} src="/star-filled.svg" alt="" className="star-icon" />
                                    ))}
                                    {item.rating - Math.floor(item.rating) >= 0.5 && <img src="/star-half.svg" alt="" className="star-icon" />}
                                    {Array.from({ length: 5 - Math.ceil(item.rating) }).map((_, i) => (
                                        <img key={`e${i}`} src="/star-empty.svg" alt="" className="star-icon" />
                                    ))}
                                </span>
                                <span className="votes-text">{item.votes}</span>
                            </span>
                        </article>
                    ))}
                </div>
            </section>
        );
    }

    return null;
}