import React, { useEffect, useState } from "react";
import "../AccountPage.css";

export default function EditProfileModal({ user, onClose, onSave, saving = false }) {
    const [username, setUsername] = useState(user.username || "");
    const [email, setEmail] = useState(user.email || "");
    const [displayName, setDisplayName] = useState(user.display_name || "");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [filePreview, setFilePreview] = useState(user.avatar || "/example.jpg");
    const [fileObj, setFileObj] = useState(null);

    useEffect(() => {
        setUsername(user.username || "");
        setEmail(user.email || "");
        setDisplayName(user.display_name || "");
        setPassword("");
        setPasswordRepeat("");
        setFilePreview(user.avatar || "/example.jpg");
        setFileObj(null);
    }, [user]);

    const handleFileChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        setFileObj(f);

        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result);
        reader.readAsDataURL(f);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if ((password || passwordRepeat) && password !== passwordRepeat) {
            alert("Пароли не совпадают");
            return;
        }

        const form = new FormData();
        form.append("username", username);
        form.append("email", email);
        form.append("display_name", displayName);

        if (password) {
            form.append("password", password);
            form.append("passwordRepeat", passwordRepeat);
        }

        if (fileObj) {
            form.append("avatar", fileObj);
        }

        await onSave(form);
    };

    return (
        <div className="modal-overlay account-page" role="dialog" aria-modal="true" aria-label="Редактирование профиля">
            <div className="modal-card">
                <h2 className="modal-title">Редактирование профиля</h2>

                <form className="edit-form" onSubmit={handleSave}>
                    <label className="form-label">Имя пользователя</label>
                    <input className="account-input" value={username} onChange={(e) => setUsername(e.target.value)} />

                    <label className="form-label">Email</label>
                    <input className="account-input" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <label className="form-label">Отображаемое имя</label>
                    <input className="account-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

                    <label className="form-label">Новый пароль</label>
                    <input type="password" className="account-input" value={password} onChange={(e) => setPassword(e.target.value)} />

                    <label className="form-label">Повторите пароль</label>
                    <input type="password" className="account-input" value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)} />

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
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? "Сохранение..." : "Сохранить изменения"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}