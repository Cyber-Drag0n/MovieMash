// src/components/EditProfileModal.jsx
import React, { useState, useEffect } from "react";
import "../AccountPage.css";

export default function EditProfileModal({ user, setUser, onClose }) {
    const [username, setUsername] = useState(user.username || "");
    const [email, setEmail] = useState(user.email || "");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [filePreview, setFilePreview] = useState(user.avatar || "/example.jpg");
    const [fileObj, setFileObj] = useState(null);

    useEffect(() => {
        setFilePreview(user.avatar || "/example.jpg");
    }, [user.avatar]);

    const handleFileChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        setFileObj(f);
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result);
        reader.readAsDataURL(f);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (password && password !== passwordRepeat) {
            alert("Пароли не совпадают");
            return;
        }

        setUser((u) => ({
            ...u,
            username: username || u.username,
            email: email || u.email,
            avatar: fileObj ? filePreview : u.avatar
        }));

        onClose();
    };

    return (
        <div className="modal-overlay account-page" role="dialog" aria-modal="true" aria-label="Редактирование профиля">
            <div className="modal-card">
                <h2 className="modal-title">Редактирование профиля</h2>

                <form className="edit-form" onSubmit={handleSave}>
                    <label className="form-label">Имя пользователя</label>
                    <input className="account-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Введите имя пользователя" />

                    <label className="form-label">Email</label>
                    <input className="account-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

                    <label className="form-label">Пароль</label>
                    <input type="password" className="account-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" />

                    <label className="form-label">Повторите пароль</label>
                    <input type="password" className="account-input" value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)} placeholder="Повторите пароль" />

                    <label className="form-label">Новое изображение профиля</label>
                    <div className="file-row">
                        <div className="avatar-preview">
                            <img src={filePreview} alt="Превью аватарки" />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label htmlFor="avatarFile" className="btn-choose">Выберите файл</label>
                            <input id="avatarFile" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn-save">Сохранить изменения</button>
                    </div>
                </form>
            </div>
        </div>
    );
}