const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const { query } = require("./db");

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);

function sha256(value) {
    return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function signAuthToken(user) {
    return jwt.sign(
        {
            sub: String(user.id),
            username: user.username,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: `${SESSION_DAYS}d` }
    );
}

function tokenFromReq(req) {
    const header = req.headers.authorization || "";
    return header.startsWith("Bearer ") ? header.slice(7) : null;
}

async function saveSession(userId, token, req) {
    const tokenHash = sha256(token);
    await query(
        `INSERT INTO user_sessions (user_id, session_token_hash, expires_at, ip_address, user_agent)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?)`,
        [
            userId,
            tokenHash,
            SESSION_DAYS,
            req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
            req.headers["user-agent"] || null,
        ]
    );
}

async function ensureDefaultLists(userId) {
    const defaults = [
        ["watchlist", "Буду смотреть"],
        ["favorites", "Лайки"],
        ["watched", "Просмотрено"],
    ];

    for (const [listType, listName] of defaults) {
        await query(
            `INSERT IGNORE INTO user_lists (user_id, list_type, list_name, is_public)
             VALUES (?, ?, ?, 0)`,
            [userId, listType, listName]
        );
    }
}

async function createNotification(userId, title, body, type = "system", linkUrl = null) {
    await query(
        `INSERT INTO notifications (user_id, title, body, type, link_url)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, title, body, type, linkUrl]
    );
}

function avatarToDataUrl(row) {
    if (!row?.avatar_image || !row?.avatar_mime_type) return null;
    const buf = Buffer.isBuffer(row.avatar_image) ? row.avatar_image : Buffer.from(row.avatar_image);
    return `data:${row.avatar_mime_type};base64,${buf.toString("base64")}`;
}

async function getUserByToken(token) {
    if (!token) return null;

    try {
        jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }

    const tokenHash = sha256(token);

    const rows = await query(
        `SELECT s.expires_at,
                u.id, u.username, u.email, u.display_name, u.role, u.is_active, u.is_verified,
                u.avatar_image, u.avatar_mime_type, u.avatar_filename, u.avatar_size,
                u.created_at, u.last_login
         FROM user_sessions s
                  JOIN users u ON u.id = s.user_id
         WHERE s.session_token_hash = ?
             LIMIT 1`,
        [tokenHash]
    );

    const row = rows[0];
    if (!row) return null;

    const exp = new Date(row.expires_at);
    if (Number.isNaN(exp.getTime()) || exp.getTime() < Date.now()) {
        await query(`DELETE FROM user_sessions WHERE session_token_hash = ?`, [tokenHash]);
        return null;
    }

    return row;
}

async function authMiddleware(req, res, next) {
    const token = tokenFromReq(req);
    const user = await getUserByToken(token);
    if (!user) return res.status(401).json({ message: "Не авторизован" });
    req.user = user;
    req.token = token;
    next();
}

async function optionalAuth(req, res, next) {
    const token = tokenFromReq(req);
    if (!token) {
        req.user = null;
        req.token = null;
        return next();
    }

    const user = await getUserByToken(token);
    req.user = user || null;
    req.token = user ? token : null;
    next();
}

function groupLibraryRows(rows) {
    const grouped = {
        favorites: [],
        watched: [],
        watchlist: [],
    };

    for (const row of rows) {
        if (!row?.list_type || !row?.tmdb_id) continue;
        if (!grouped[row.list_type]) continue;

        grouped[row.list_type].push({
            tmdb_id: row.tmdb_id,
            media_type: row.media_type,
            watched: !!row.watched,
            user_rating: row.user_rating,
            added_at: row.added_at,
        });
    }

    return grouped;
}

async function getListId(userId, listType) {
    const rows = await query(
        `SELECT id FROM user_lists WHERE user_id = ? AND list_type = ? LIMIT 1`,
        [userId, listType]
    );
    return rows[0]?.id || null;
}

async function upsertUserRating(userId, tmdbId, mediaType, rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating || 0)));

    if (!safeRating) {
        return null;
    }

    await query(
        `INSERT INTO user_ratings (user_id, tmdb_id, media_type, rating, rated_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), rated_at = NOW()`,
        [userId, tmdbId, mediaType, safeRating]
    );

    return safeRating;
}

app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password, display_name } = req.body || {};
        if (!username || !email || !password) {
            return res.status(400).json({ message: "username, email и password обязательны" });
        }

        const exists = await query(
            `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
            [username, email]
        );
        if (exists.length > 0) {
            return res.status(409).json({ message: "Пользователь уже существует" });
        }

        const password_hash = await argon2.hash(password, { type: argon2.argon2id });

        const result = await query(
            `INSERT INTO users (username, email, password_hash, display_name, role, is_active, is_verified)
             VALUES (?, ?, ?, ?, 'user', 1, 0)`,
            [username, email, password_hash, display_name || username]
        );

        const userId = result.insertId;
        await ensureDefaultLists(userId);

        const userRows = await query(
            `SELECT id, username, email, display_name, role, is_verified
             FROM users WHERE id = ? LIMIT 1`,
            [userId]
        );

        const user = userRows[0];
        const token = signAuthToken(user);
        await saveSession(userId, token, req);
        await createNotification(userId, "Добро пожаловать", "Регистрация прошла успешно", "auth", "/account");

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { login, password } = req.body || {};
        if (!login || !password) {
            return res.status(400).json({ message: "login и password обязательны" });
        }

        const rows = await query(
            `SELECT id, username, email, password_hash, display_name, role, is_active, is_verified
             FROM users
             WHERE username = ? OR email = ?
                 LIMIT 1`,
            [login, login]
        );

        const user = rows[0];
        if (!user) return res.status(401).json({ message: "Неверный логин или пароль" });
        if (!user.is_active) return res.status(403).json({ message: "Аккаунт отключён" });

        const ok = await argon2.verify(user.password_hash, password);
        if (!ok) return res.status(401).json({ message: "Неверный логин или пароль" });

        await ensureDefaultLists(user.id);

        const token = signAuthToken(user);
        await saveSession(user.id, token, req);

        await query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);
        await createNotification(user.id, "Вход выполнен", "Вы успешно вошли в аккаунт", "auth", "/account");

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                display_name: user.display_name,
                role: user.role,
                is_verified: user.is_verified,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/auth/logout", authMiddleware, async (req, res) => {
    try {
        await query(`DELETE FROM user_sessions WHERE session_token_hash = ?`, [sha256(req.token)]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            display_name: req.user.display_name,
            role: req.user.role,
            is_verified: req.user.is_verified,
            is_active: req.user.is_active,
            created_at: req.user.created_at,
            last_login: req.user.last_login,
            avatar_url: avatarToDataUrl(req.user),
        },
    });
});

app.get("/api/account/overview", authMiddleware, async (req, res) => {
    try {
        const userRows = await query(
            `SELECT id, username, email, display_name, role, is_active, is_verified,
                    avatar_image, avatar_mime_type, avatar_filename, avatar_size, created_at, last_login
             FROM users
             WHERE id = ?
                 LIMIT 1`,
            [req.user.id]
        );

        const statsRows = await query(
            `SELECT
                 (SELECT COUNT(*) FROM user_lists WHERE user_id = ? AND list_type = 'favorites') AS favorites_count,
                 (SELECT COUNT(*) FROM user_lists WHERE user_id = ? AND list_type = 'watched') AS watched_count,
                 (SELECT COUNT(*) FROM user_lists WHERE user_id = ? AND list_type = 'watchlist') AS watchlist_count,
                 (SELECT COUNT(*) FROM support_messages WHERE user_id = ?) AS support_messages_count,
                 (SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0) AS unread_notifications_count`,
            [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
        );

        const notifications = await query(
            `SELECT id, title, body, type, link_url, is_read, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
                 LIMIT 10`,
            [req.user.id]
        );

        const libraryRows = await query(
            `SELECT ul.list_type, ul.list_name, li.tmdb_id, li.media_type, li.watched, li.user_rating, li.added_at
             FROM user_lists ul
                      LEFT JOIN list_items li ON li.list_id = ul.id
             WHERE ul.user_id = ?
             ORDER BY ul.list_type, li.added_at DESC`,
            [req.user.id]
        );

        const user = userRows[0];
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                display_name: user.display_name,
                role: user.role,
                is_active: user.is_active,
                is_verified: user.is_verified,
                created_at: user.created_at,
                last_login: user.last_login,
                avatar_url: avatarToDataUrl(user),
            },
            stats: statsRows[0] || {},
            notifications,
            lists: groupLibraryRows(libraryRows),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/account/reviews", authMiddleware, async (req, res) => {
    try {
        const rows = await query(
            `SELECT r.id, r.tmdb_id, r.media_type, r.review_text, r.review_status, r.created_at, r.updated_at,
                    COALESCE(ur.rating, 0) AS rating
             FROM user_reviews r
                      LEFT JOIN user_ratings ur
                                ON ur.user_id = r.user_id
                                    AND ur.tmdb_id = r.tmdb_id
                                    AND ur.media_type = r.media_type
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC
                 LIMIT 50`,
            [req.user.id]
        );

        res.json({ items: rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/account/support-messages", authMiddleware, async (req, res) => {
    try {
        const rows = await query(
            `SELECT id, name, email, subject, message, status, reply_text, created_at, updated_at
             FROM support_messages
             WHERE user_id = ?
             ORDER BY created_at DESC
                 LIMIT 50`,
            [req.user.id]
        );

        res.json({ items: rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch("/api/account/profile", authMiddleware, async (req, res) => {
    try {
        const displayName = req.body.display_name || req.user.display_name || req.user.username;
        const nextUsername = (req.body.username || "").trim();
        const nextEmail = (req.body.email || "").trim();
        const nextPassword = req.body.password;
        const nextPasswordRepeat = req.body.passwordRepeat || req.body.password_repeat;
        const avatarFile = req.files?.avatar ? (Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar) : null;

        if (nextPassword && nextPasswordRepeat && nextPassword !== nextPasswordRepeat) {
            return res.status(400).json({ message: "Пароли не совпадают" });
        }

        if (nextUsername) {
            const existsUsername = await query(
                `SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1`,
                [nextUsername, req.user.id]
            );
            if (existsUsername.length > 0) {
                return res.status(409).json({ message: "Имя пользователя уже занято" });
            }
        }

        if (nextEmail) {
            const existsEmail = await query(
                `SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1`,
                [nextEmail, req.user.id]
            );
            if (existsEmail.length > 0) {
                return res.status(409).json({ message: "Email уже занят" });
            }
        }

        const fields = [];
        const values = [];

        fields.push(`display_name = ?`);
        values.push(displayName);

        if (nextUsername) {
            fields.push(`username = ?`);
            values.push(nextUsername);
        }

        if (nextEmail) {
            fields.push(`email = ?`);
            values.push(nextEmail);
        }

        if (nextPassword) {
            const hashed = await argon2.hash(nextPassword, { type: argon2.argon2id });
            fields.push(`password_hash = ?`);
            values.push(hashed);
        }

        if (avatarFile) {
            fields.push(`avatar_image = ?`);
            values.push(avatarFile.data);
            fields.push(`avatar_mime_type = ?`);
            values.push(avatarFile.mimetype);
            fields.push(`avatar_filename = ?`);
            values.push(avatarFile.name);
            fields.push(`avatar_size = ?`);
            values.push(avatarFile.size);
        }

        values.push(req.user.id);

        await query(
            `UPDATE users
             SET ${fields.join(", ")}
             WHERE id = ?`,
            values
        );

        const updatedRows = await query(
            `SELECT id, username, email, display_name, role, is_active, is_verified,
                    avatar_image, avatar_mime_type, avatar_filename, avatar_size, created_at, last_login
             FROM users
             WHERE id = ?
                 LIMIT 1`,
            [req.user.id]
        );

        const updated = updatedRows[0];
        res.json({
            ok: true,
            user: {
                id: updated.id,
                username: updated.username,
                email: updated.email,
                display_name: updated.display_name,
                role: updated.role,
                is_verified: updated.is_verified,
                is_active: updated.is_active,
                avatar_url: avatarToDataUrl(updated),
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/support/messages", optionalAuth, async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body || {};

        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ message: "Не заполнены обязательные поля" });
        }

        const safeSubject = subject || "Обращение из поддержки";
        const name = `${firstName} ${lastName}`.trim();

        const result = await query(
            `INSERT INTO support_messages
                 (user_id, name, email, subject, message, status)
             VALUES (?, ?, ?, ?, ?, 'new')`,
            [
                req.user ? req.user.id : null,
                name,
                email,
                safeSubject,
                message,
            ]
        );

        if (req.user) {
            await createNotification(
                req.user.id,
                "Сообщение в поддержку отправлено",
                `Тема: ${safeSubject}`,
                "support",
                "/account"
            );
        }

        res.json({ ok: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
        const rows = await query(
            `SELECT id, title, body, type, link_url, is_read, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
                 LIMIT 50`,
            [req.user.id]
        );
        res.json({ items: rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
        await query(
            `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch("/api/notifications/read-all", authMiddleware, async (req, res) => {
    try {
        await query(
            `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
            [req.user.id]
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/library/me", authMiddleware, async (req, res) => {
    try {
        const rows = await query(
            `SELECT ul.list_type, ul.list_name, li.tmdb_id, li.media_type, li.watched, li.user_rating, li.added_at
             FROM user_lists ul
                      LEFT JOIN list_items li ON li.list_id = ul.id
             WHERE ul.user_id = ?
             ORDER BY ul.list_type, li.added_at DESC`,
            [req.user.id]
        );

        res.json({ lists: groupLibraryRows(rows) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/library/ratings", authMiddleware, async (req, res) => {
    try {
        const rows = await query(
            `SELECT tmdb_id, media_type, rating, rated_at
             FROM user_ratings
             WHERE user_id = ?
             ORDER BY rated_at DESC`,
            [req.user.id]
        );

        res.json({ items: rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/library/status", authMiddleware, async (req, res) => {
    try {
        const tmdbId = Number(req.query.tmdb_id);
        const mediaType = req.query.media_type;

        if (!tmdbId || !mediaType) {
            return res.status(400).json({ message: "tmdb_id и media_type обязательны" });
        }

        const rows = await query(
            `SELECT ul.list_type, li.id
             FROM user_lists ul
                      LEFT JOIN list_items li
                                ON li.list_id = ul.id
                                    AND li.tmdb_id = ?
                                    AND li.media_type = ?
             WHERE ul.user_id = ?
               AND ul.list_type IN ('favorites', 'watched', 'watchlist')`,
            [tmdbId, mediaType, req.user.id]
        );

        const status = { favorites: false, watched: false, watchlist: false };
        rows.forEach((r) => {
            if (r.id) status[r.list_type] = true;
        });

        res.json(status);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/library/toggle", authMiddleware, async (req, res) => {
    try {
        const { tmdb_id, media_type, kind } = req.body || {};
        const tmdbId = Number(tmdb_id);

        if (!tmdbId || !media_type || !kind) {
            return res.status(400).json({ message: "tmdb_id, media_type и kind обязательны" });
        }

        if (!["favorites", "watched", "watchlist"].includes(kind)) {
            return res.status(400).json({ message: "kind должен быть favorites, watched или watchlist" });
        }

        const listId = await getListId(req.user.id, kind);
        if (!listId) return res.status(404).json({ message: "Список не найден" });

        const existing = await query(
            `SELECT id FROM list_items
             WHERE list_id = ? AND tmdb_id = ? AND media_type = ?
                 LIMIT 1`,
            [listId, tmdbId, media_type]
        );

        let active = true;

        if (existing.length > 0) {
            await query(`DELETE FROM list_items WHERE id = ?`, [existing[0].id]);
            active = false;
        } else {
            await query(
                `INSERT INTO list_items (list_id, tmdb_id, media_type, watched)
                 VALUES (?, ?, ?, ?)`,
                [listId, tmdbId, media_type, kind === "watched" ? 1 : 0]
            );
        }

        await createNotification(
            req.user.id,
            kind === "favorites"
                ? (active ? "Добавлено в избранное" : "Удалено из избранного")
                : kind === "watched"
                    ? (active ? "Добавлено в просмотренное" : "Убрано из просмотренного")
                    : (active ? "Добавлено в список просмотра" : "Удалено из списка просмотра"),
            `TMDB ID: ${tmdbId}`,
            "library",
            "/account"
        );

        res.json({ ok: true, active, kind });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/library/mark-viewed", authMiddleware, async (req, res) => {
    try {
        const { tmdb_id, media_type } = req.body || {};
        const tmdbId = Number(tmdb_id);

        if (!tmdbId || !media_type) {
            return res.status(400).json({ message: "tmdb_id и media_type обязательны" });
        }

        const listId = await getListId(req.user.id, "watched");
        if (!listId) return res.status(404).json({ message: "Список не найден" });

        await query(
            `INSERT INTO list_items (list_id, tmdb_id, media_type, watched)
             VALUES (?, ?, ?, 1)
                 ON DUPLICATE KEY UPDATE watched = 1, added_at = CURRENT_TIMESTAMP`,
            [listId, tmdbId, media_type]
        );

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   НОВОЕ: отзывы пользователя
   ========================= */

app.get("/api/reviews/me", authMiddleware, async (req, res) => {
    try {
        const tmdbId = Number(req.query.tmdb_id);
        const mediaType = req.query.media_type;

        if (!tmdbId || !mediaType) {
            return res.status(400).json({ message: "tmdb_id и media_type обязательны" });
        }

        const rows = await query(
            `SELECT r.id, r.tmdb_id, r.media_type, r.review_text, r.review_status, r.created_at, r.updated_at,
                    COALESCE(ur.rating, 0) AS rating
             FROM user_reviews r
                      LEFT JOIN user_ratings ur
                                ON ur.user_id = r.user_id
                                    AND ur.tmdb_id = r.tmdb_id
                                    AND ur.media_type = r.media_type
             WHERE r.user_id = ? AND r.tmdb_id = ? AND r.media_type = ?
                 LIMIT 1`,
            [req.user.id, tmdbId, mediaType]
        );

        res.json({ item: rows[0] || null });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/reviews", authMiddleware, async (req, res) => {
    try {
        const { tmdb_id, media_type, review_text, rating } = req.body || {};

        const tmdbId = Number(tmdb_id);
        const text = String(review_text || "").trim();
        const safeRating = Math.max(1, Math.min(5, Number(rating || 0)));

        if (!tmdbId || !media_type || !text) {
            return res.status(400).json({ message: "tmdb_id, media_type и review_text обязательны" });
        }

        if (text.length < 5) {
            return res.status(400).json({ message: "Отзыв слишком короткий" });
        }

        if (text.length > 3000) {
            return res.status(400).json({ message: "Отзыв слишком длинный" });
        }

        await query(
            `INSERT INTO user_reviews
             (user_id, tmdb_id, media_type, review_text, review_status, moderation_notes, moderated_at)
             VALUES (?, ?, ?, ?, 'pending', NULL, NULL)
                 ON DUPLICATE KEY UPDATE
                                      review_text = VALUES(review_text),
                                      review_status = 'pending',
                                      moderation_notes = NULL,
                                      moderated_at = NULL,
                                      updated_at = CURRENT_TIMESTAMP`,
            [req.user.id, tmdbId, mediaType, text]
        );

        if (safeRating) {
            await upsertUserRating(req.user.id, tmdbId, mediaType, safeRating);
        }

        await createNotification(
            req.user.id,
            "Отзыв отправлен на модерацию",
            "Ваш отзыв добавлен и ожидает проверки",
            "library",
            "/account"
        );

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post("/api/library/rate", authMiddleware, async (req, res) => {
    try {
        const { tmdb_id, media_type, rating } = req.body || {};
        const tmdbId = Number(tmdb_id);
        const safeRating = Math.max(1, Math.min(5, Number(rating || 0)));

        if (!tmdbId || !media_type || !safeRating) {
            return res.status(400).json({ message: "tmdb_id, media_type и rating обязательны" });
        }

        await upsertUserRating(req.user.id, tmdbId, mediaType, safeRating);

        res.json({ ok: true, rating: safeRating });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    console.log(`API running on port ${port}`);
});