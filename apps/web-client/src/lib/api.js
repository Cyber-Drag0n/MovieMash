const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function emitAuthChange() {
    try {
        window.dispatchEvent(new Event("movie-mash-auth-changed"));
    } catch {
        // ignore
    }
}

export function getJwt() {
    return localStorage.getItem("movie_mash_token");
}

export function setJwt(token) {
    localStorage.setItem("movie_mash_token", token);
    emitAuthChange();
}

export function clearJwt() {
    localStorage.removeItem("movie_mash_token");
    localStorage.removeItem("movie_mash_user");
    emitAuthChange();
}

export async function apiFetch(path, options = {}) {
    const token = getJwt();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || "Ошибка запроса");
    }

    return data;
}