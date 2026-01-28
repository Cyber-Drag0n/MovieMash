import React from "react";

export default function AdBanner() {
    return (
        <section className="ad-banner">
            <div className="ad-overlay">
                <div className="ad-content">
                    <div className="ad-text">
                        <h2 className="ad-title">
                            Начните смотреть бесплатно прямо сейчас!
                        </h2>
                        <p className="ad-sub">
                            Это прямой и убедительный призыв, который мгновенно побуждает
                            пользователей начать бесплатный пробный период MovieMash.
                        </p>
                    </div>

                    <button className="ad-btn">Начать пробную версию</button>
                </div>
            </div>
        </section>
    );
}
