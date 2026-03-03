import React, { useState } from "react";

export default function EditProfileModal({ user, setUser, onClose }) {
    const [username, setUsername] = useState(user.username);

    const onSubmit = (event) => {
        event.preventDefault();
        setUser((prev) => ({ ...prev, username }));
        onClose();
    };

    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div className="modal" role="dialog" aria-modal="true" aria-label="Редактировать профиль" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Редактировать профиль</h2>
                <form onSubmit={onSubmit} className="modal-form">
                    <label htmlFor="username" className="modal-label">Имя пользователя</label>
                    <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="modal-input" />
                    <div className="modal-actions">
                        <button type="button" className="ghost-btn" onClick={onClose}>Отмена</button>
                        <button type="submit" className="primary-btn">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}