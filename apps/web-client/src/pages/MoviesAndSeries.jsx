// pages/MoviesAndSeries.jsx
import React, { useState, useEffect, useRef } from "react";
import CarouselControls from "../components/CarouselControls";
import AdBanner from "../components/AdBanner";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    }
};
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/* ----------------- Компонент страницы ----------------- */
export default function MoviesAndSeries() {
    const [heroIndex, setHeroIndex] = useState(0);
    const autoplayRef = useRef(null);

    // Movies states (заменяют заглушки)
    const [genresMovies, setGenresMovies] = useState([]);            // [{id, name}, ...]
    const [moviesByGenre, setMoviesByGenre] = useState({});          // { genreId: [movies...] }
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [newMovies, setNewMovies] = useState([]);
    const [mustWatchMovies, setMustWatchMovies] = useState([]);
    const [heroItems, setHeroItems] = useState([]);

    // Series states (аналогично)
    const [genresSeries, setGenresSeries] = useState([]);
    const [moviesByGenreSeries, setMoviesByGenreSeries] = useState({});
    const [trendingSeries, setTrendingSeries] = useState([]);
    const [newSeries, setNewSeries] = useState([]);
    const [mustWatchSeries, setMustWatchSeries] = useState([]);

    // Пагинация / карусели
    const [genresPage, setGenresPage] = useState(0);
    const [topGenrePage, setTopGenrePage] = useState(0);
    const [trendsPage, setTrendsPage] = useState(0);
    const [genresPageSeries, setGenresPageSeries] = useState(0);
    const [topGenrePageSeries, setTopGenrePageSeries] = useState(0);
    const [trendsPageSeries, setTrendsPageSeries] = useState(0);

    const GENRES_PER_PAGE = 5;
    const TOP_GENRES_PER_PAGE = 4;
    const TRENDS_PER_PAGE = 5;

    // Состояния загрузки/ошибки для первичной инициализации
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [loadError, setLoadError] = useState(''); // пустая строка — нет ошибки

    // fetch-обёртка для TMDB (использует Authorization header; при v3 api_key — адаптируй)
    const fetchTMDB = async (path) => {
        const url = `${API_BASE_URL}${path}${path.includes('?') ? '&' : '?'}language=ru-RU`;
        const res = await fetch(url, API_OPTIONS);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    };

    // Вынес загрузчик в useCallback, чтобы можно было перезапустить по кнопке "Повторить"
    const loadInitial = useCallback(async () => {
        setIsLoadingInitial(true);
        setLoadError('');
        try {
            // Основные параллельные запросы (фильмы + сериалы)
            const [
                genresMovieResp,
                trendingMovieResp,
                nowPlayingResp,
                popularResp,
                genresTvResp,
                trendingTvResp,
                onAirTvResp,
                popularTvResp
            ] = await Promise.all([
                fetchTMDB('/genre/movie/list'),
                fetchTMDB('/trending/movie/week'),
                fetchTMDB('/movie/now_playing?page=1'),
                fetchTMDB('/movie/popular?page=1'),
                fetchTMDB('/genre/tv/list'),
                fetchTMDB('/trending/tv/week'),
                fetchTMDB('/tv/on_the_air?page=1'),
                fetchTMDB('/tv/popular?page=1')
            ]);

            // Заполняем базовые состояния
            setGenresMovies(genresMovieResp.genres || []);
            setTrendingMovies(trendingMovieResp.results || []);
            setNewMovies(nowPlayingResp.results || []);
            setMustWatchMovies((popularResp.results || []).slice(0, 6));
            setHeroItems((popularResp.results || []).slice(0, 6));

            setGenresSeries(genresTvResp.genres || []);
            setTrendingSeries(trendingTvResp.results || []);
            setNewSeries(onAirTvResp.results || []);
            setMustWatchSeries((popularTvResp.results || []).slice(0, 6));

            // --------- ВАЖНО: ограничиваем жанры до 8 (чтобы не делать слишком много запросов) ---------
            const movieGenreList = (genresMovieResp.genres || []).slice(0, 8);
            const tvGenreList = (genresTvResp.genres || []).slice(0, 8);

            // Запрашиваем discover для каждого выбранного жанра (по топ-популярности)
            const movieByGenrePromises = movieGenreList.map(async (g) => {
                const resp = await fetchTMDB(`/discover/movie?with_genres=${g.id}&sort_by=popularity.desc&page=1`);
                return { genreId: g.id, items: resp.results || [] };
            });

            const seriesByGenrePromises = tvGenreList.map(async (g) => {
                const resp = await fetchTMDB(`/discover/tv?with_genres=${g.id}&sort_by=popularity.desc&page=1`);
                return { genreId: g.id, items: resp.results || [] };
            });

            const moviesByGenreArr = await Promise.all(movieByGenrePromises);
            const seriesByGenreArr = await Promise.all(seriesByGenrePromises);

            const moviesByGenreObj = {};
            moviesByGenreArr.forEach(x => { moviesByGenreObj[x.genreId] = x.items; });
            setMoviesByGenre(moviesByGenreObj);

            const seriesByGenreObj = {};
            seriesByGenreArr.forEach(x => { seriesByGenreObj[x.genreId] = x.items; });
            setMoviesByGenreSeries(seriesByGenreObj);

        } catch (err) {
            console.error("Ошибка загрузки данных TMDB:", err);
            setLoadError('Не удалось загрузить данные. Проверьте подключение и нажмите «Повторить».');
        } finally {
            setIsLoadingInitial(false);
        }
    }, []);

    // монтирование — запускаем загрузку
    useEffect(() => {
        loadInitial();
        // autoplay для hero
        autoplayRef.current = setInterval(() => setHeroIndex(i => (i + 1) % Math.max(1, heroItems.length || 3)), 8000);
        return () => clearInterval(autoplayRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Вспомогательные функции форматирования
    const getPoster = (item) => item?.poster_path ? `${IMAGE_BASE}${item.poster_path}` : "/example.jpg";
    const getBackdrop = (item) => item?.backdrop_path ? `${IMAGE_BASE}${item.backdrop_path}` : (item?.poster_path ? `${IMAGE_BASE}${item.poster_path}` : "/example.jpg");
    const formatVotes = (v) => v ? `${Math.round(v / 1000)}K` : "—";

    /* ------------------ РЕНДЕР-ХЕЛПЕРЫ ------------------ */

    // Жанры (фильмы) — берем страницы по GENRES_PER_PAGE
    const renderGenresPage = (page) => {
        const start = page * GENRES_PER_PAGE;
        const slice = genresMovies.slice(start, start + GENRES_PER_PAGE);
        return (
            <div style={{ display: "flex", gap: 20 }}>
                {slice.map((g) => (
                    <article className="category-card" key={g.id}>
                        <div className="poster-grid">
                            {(moviesByGenre[g.id] || []).slice(0,4).map((m, idx) => (
                                <div
                                    key={idx}
                                    className={`poster poster-${idx+1}`}
                                    style={{ backgroundImage: `url(${getPoster(m)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                />
                            ))}
                        </div>
                        <div className="card-footer">
                            <span className="cat-title">{g.name}</span>
                            <button className="cat-go" aria-label={`Перейти в ${g.name}`}>➜</button>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    // Top-10 по жанрам (movies) — 2x2 превью внутри карточки
    const renderTopGenresPage = (page) => {
        const groups = [];
        for (let i = 0; i < genresMovies.length; i += TOP_GENRES_PER_PAGE) groups.push(genresMovies.slice(i, i + TOP_GENRES_PER_PAGE));
        const slice = groups[page] || [];
        return (
            <div style={{ display: "flex", gap: 22, justifyContent: "center", alignItems: "flex-start" }}>
                {slice.map((g) => {
                    const items = moviesByGenre[g.id] || [];
                    return (
                        <article className="category-card top-card" key={g.id}>
                            <div className="poster-wrap">
                                <div className="top-badge">Топ-10 в</div>
                                <div className="poster-grid">
                                    {items.slice(0,4).map((m, i) => (
                                        <div key={i} className="poster" style={{ height: 78, borderRadius: 8, backgroundImage: `url(${getPoster(m)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    ))}
                                </div>
                            </div>
                            <div className="card-footer">
                                <span className="cat-title">{g.name}</span>
                                <button className="cat-go" aria-label={`Перейти в ${g.name}`}>➜</button>
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    };

    // В трендах (movies)
    const renderTrendsPage = (page) => {
        const start = page * TRENDS_PER_PAGE;
        const slice = trendingMovies.slice(start, start + TRENDS_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map(t => (
                    <article className="trend-card" key={t.id}>
                        <div className="trend-poster-wrap">
                            <img src={getPoster(t)} className="trend-poster" alt={t.title || t.name} onError={(e)=>{e.currentTarget.src="/example.jpg"}} />
                            <span className="trend-badge left">
                <img src="/Time.svg" alt="" />
                <span className="badge-text">—</span> {/* runtime — нужен detail запрос */}
              </span>
                            <span className="trend-badge right">
                <img src="/Eye.svg" alt="" />
                <span className="badge-text">{formatVotes(t.vote_count)}</span>
              </span>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    // Новинки фильмов
    const renderNewReleasesPage = (page) => {
        const NEW_PER_PAGE = 5;
        const start = page * NEW_PER_PAGE;
        const slice = newMovies.slice(start, start + NEW_PER_PAGE);
        return (
            <div className="trends-row" role="list" style={{ justifyContent: "flex-start" }}>
                {slice.map(it => (
                    <article className="category-card new-card" key={it.id}>
                        <div className="new-poster-wrap">
                            <img src={getPoster(it)} alt={it.title} className="new-poster" onError={(e)=>{e.currentTarget.src="/example.jpg"}} />
                        </div>
                        <span className="new-badge">
              <span className="new-badge-text">{it.release_date ? `Вышел ${it.release_date}` : "—"}</span>
            </span>
                    </article>
                ))}
            </div>
        );
    };

    // Must-watch (фильмы)
    const renderMustWatch = () => (
        <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 60px", padding: "0 12px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className="categories-title">Фильмы, которые обязательно нужно посмотреть</h3>
            </div>

            <div style={{ padding: "12px 0 0" }}>
                <div className="must-row" role="list" style={{ display: "flex", gap: 22, justifyContent: "flex-start" }}>
                    {mustWatchMovies.map(item => {
                        const rating = item.vote_average || 0;
                        const stars = Math.round((rating/10) * 5);
                        return (
                            <article className="category-card top-card must-card" key={item.id}>
                                <div className="must-poster-wrap">
                                    <img src={getPoster(item)} alt={item.title} className="must-poster" onError={(e)=>{e.currentTarget.src="/example.jpg"}} />
                                </div>

                                <span className="trend-badge left must-left">
                  <img src="/Time.svg" alt="" />
                  <span className="badge-text">—</span>
                </span>

                                <span className="trend-badge right must-right">
                  <span className="rating-row" aria-label={`Рейтинг ${rating} из 10`}>
                    {Array.from({length: stars}).map((_,i) => <img key={i} src="/star-filled.svg" className="star-icon" alt=""/> )}
                      {Array.from({length: 5-stars}).map((_,i) => <img key={"e"+i} src="/star-empty.svg" className="star-icon" alt=""/> )}
                  </span>
                  <span className="badge-text votes-text">{formatVotes(item.vote_count)}</span>
                </span>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    /* ------------------ JSX страницы ------------------ */
    return (
        <section className="ms-page" aria-label="Фильмы и сериалы">
            {/* Если была ошибка загрузки — показываем верхний баннер с кнопками */}
            {loadError && (
                <div style={{
                    maxWidth: 1200, margin: '18px auto', padding: '12px 16px',
                    borderRadius: 10, background: 'linear-gradient(180deg, rgba(232,18,18,0.08), rgba(20,20,20,0.6))',
                    border: '1px solid rgba(232,18,18,0.12)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
                }}>
                    <div style={{ fontSize: 14 }}>{loadError}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => loadInitial()} style={{ background: '#E81212', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Повторить</button>
                        <button onClick={() => setLoadError('')} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Закрыть</button>
                    </div>
                </div>
            )}

            {/* Loading state: можно показать skeleton или простой текст */}
            {isLoadingInitial && (
                <div style={{ maxWidth: 1200, margin: '8px auto', color: '#BDBDBD', padding: '8px 12px' }}>Загрузка данных...</div>
            )}

            {/* HERO (используем heroItems) */}
            <div className="ms-hero" onMouseEnter={() => clearInterval(autoplayRef.current)} onMouseLeave={() => {
                clearInterval(autoplayRef.current);
                autoplayRef.current = setInterval(() => setHeroIndex(i => (i + 1) % Math.max(1, heroItems.length || 3)), 8000);
            }}>
                {heroItems[heroIndex] && (
                    <img className="ms-bg-img" src={getBackdrop(heroItems[heroIndex])} alt={heroItems[heroIndex].title || heroItems[heroIndex].name} />
                )}
                <div className="ms-hero-overlay" />
                <div className="ms-hero-center">
                    <h1 className="ms-hero-title">{heroItems[heroIndex]?.title || heroItems[heroIndex]?.name || "Премьеры"}</h1>
                    <p className="ms-hero-desc">{heroItems[heroIndex]?.overview}</p>

                    <div className="ms-hero-actions" role="group" aria-label="Действия с фильмом">
                        <button className="ms-btn ms-btn-play" aria-label="Смотреть">
                            <img src="/Play.svg" alt="" className="ms-btn-icon" />
                            <span>Смотреть</span>
                        </button>
                    </div>
                </div>

                <div className="ms-hero-indicators" role="tablist" aria-label="Постеры">
                    {heroItems.map((_, i) => (
                        <button key={i} className={`ms-ind-dot ${i === heroIndex ? "active" : ""}`} onClick={() => setHeroIndex(i)} aria-pressed={i === heroIndex} aria-label={`Перейти к ${i+1}`} />
                    ))}
                </div>
            </div>

            {/* --- Наши жанры (movies) --- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "28px auto 0", padding: "0 12px", position: "relative" }}>
                <button className="ms-btn ms-btn-watch"><span>Фильмы</span></button>
                <div className="categories-head" style={{ alignItems: "center" }}>
                    <div className="categories-left"><h3 className="categories-title">Наши жанры</h3></div>
                    <CarouselControls page={genresPage} pages={Math.max(1, Math.ceil(genresMovies.length/GENRES_PER_PAGE))} onPrev={() => setGenresPage(p => Math.max(0, p-1))} onNext={() => setGenresPage(p => Math.min(Math.max(0, Math.ceil(genresMovies.length/GENRES_PER_PAGE)-1), p+1))} />
                </div>
                <div style={{ padding: "12px 0 28px" }}>
                    {renderGenresPage(genresPage)}
                </div>
            </div>

            {/* --- Популярный Топ-10 по жанрам (movies) --- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "20px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 className="categories-title">Популярный Топ-10 по жанрам</h3>
                    <CarouselControls page={topGenrePage} pages={Math.max(1, Math.ceil(genresMovies.length/TOP_GENRES_PER_PAGE))} onPrev={() => setTopGenrePage(p => Math.max(0, p-1))} onNext={() => setTopGenrePage(p => Math.min(Math.max(0, Math.ceil(genresMovies.length/TOP_GENRES_PER_PAGE)-1), p+1))} />
                </div>
                <div style={{ padding: "18px 0 40px" }}>
                    {renderTopGenresPage(topGenrePage)}
                </div>
            </div>

            {/* --- В трендах (movies) --- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 60px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">В трендах</h3>
                    <CarouselControls page={trendsPage} pages={Math.max(1, Math.ceil(trendingMovies.length/TRENDS_PER_PAGE))} onPrev={() => setTrendsPage(p => Math.max(0, p-1))} onNext={() => setTrendsPage(p => Math.min(Math.max(0, Math.ceil(trendingMovies.length/TRENDS_PER_PAGE)-1), p+1))} />
                </div>
                <div style={{ overflow: "hidden" }}>
                    {renderTrendsPage(trendsPage)}
                </div>
            </div>

            {/* --- Новинки фильмов --- */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "10px auto 40px", padding: "0 12px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="categories-title">Новинки фильмов</h3>
                </div>
                <div style={{ overflow: "hidden" }}>
                    {renderNewReleasesPage(0)}
                </div>
            </div>

            {/* --- Must-watch (movies) --- */}
            {renderMustWatch()}

            {/* ---------------- СЕРИАЛЫ (дублируем, используя серии-states) ---------------- */}
            <div style={{ height: 20 }} />

            {/* Наши жанры (series) */}
            <div className="section-block" style={{ maxWidth: 1200, margin: "28px auto 0", padding: "0 12px", position: "relative" }}>
                <button className="ms-btn ms-btn-watch"><span>Сериалы</span></button>
                <div className="categories-head" style={{ alignItems: "center" }}>
                    <div className="categories-left"><h3 className="categories-title">Наши жанры</h3></div>
                    <CarouselControls page={genresPageSeries} pages={Math.max(1, Math.ceil(genresSeries.length/GENRES_PER_PAGE))} onPrev={() => setGenresPageSeries(p => Math.max(0, p-1))} onNext={() => setGenresPageSeries(p => Math.min(Math.max(0, Math.ceil(genresSeries.length/GENRES_PER_PAGE)-1), p+1))} />
                </div>
                <div style={{ padding: "12px 0 28px" }}>
                    <div style={{ display: "flex", gap: 20 }}>
                        {genresSeries.slice(genresPageSeries * GENRES_PER_PAGE, (genresPageSeries+1)*GENRES_PER_PAGE).map(g => (
                            <article className="category-card" key={g.id}>
                                <div className="poster-grid">
                                    {(moviesByGenreSeries[g.id] || []).slice(0,4).map((m, idx) => (
                                        <div key={idx} className="poster" style={{ backgroundImage: `url(${getPoster(m)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    ))}
                                </div>
                                <div className="card-footer">
                                    <span className="cat-title">{g.name}</span>
                                    <button className="cat-go" aria-label={`Перейти в ${g.name}`}>➜</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>

            {/* Тренды / Новинки / Must-watch для сериалов — можно добавить рендеры аналогично фильмам, используя соответствующие состояния */}
            <AdBanner />
        </section>
    );
}
