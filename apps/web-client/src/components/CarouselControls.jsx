// src/components/CarouselControls.jsx
import React from "react";

export default function CarouselControls({ page = 0, pages = 1, onPrev, onNext }) {
    return (
        <div className="categories-controls" role="tablist" aria-label="Навигация по слайдам">
            <button
                className="ctrl-arrow"
                onClick={onPrev}
                disabled={page <= 0}
                aria-label="Назад"
                title="Назад"
            >
                ←
            </button>

            <div className="progress-line" aria-hidden="true">
                {Array.from({ length: pages }).map((_, i) => (
                    <span key={i} className={`progress-seg ${i === page ? "active" : ""}`} />
                ))}
            </div>

            <button
                className="ctrl-arrow"
                onClick={onNext}
                disabled={page >= pages - 1}
                aria-label="Вперед"
                title="Вперед"
            >
                →
            </button>
        </div>
    );
}
