import React from "react";

const EmptyPage = ({ title = "Пустая страница", subtitle = "" }) => {
    return (
        <section style={{ padding: "40px 16px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <h1 style={{ color: "#fff", marginBottom: 8 }}>{title}</h1>
                {subtitle && <p style={{ color: "rgba(153,153,153,1)" }}>{subtitle}</p>}
                {/* оставим место для будущего контента */}
                <div style={{ height: 240 }} aria-hidden="true"></div>
            </div>
        </section>
    );
};

export default EmptyPage;
