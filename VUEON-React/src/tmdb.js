const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const LANG = "ko-KR";
const REGION = "KR";

export const hasApiKey = () => Boolean(API_KEY && !API_KEY.includes("YOUR_TMDB"));

function url(path, params = {}, language = LANG) {
  const u = new URL(`${BASE}${path}`);
  u.searchParams.set("api_key", API_KEY || "");
  if (language) u.searchParams.set("language", language);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  });
  return u.toString();
}

export async function api(path, params = {}, language = LANG) {
  if (!hasApiKey()) throw new Error("TMDB_API_KEY_MISSING");
  const r = await fetch(url(path, params, language));
  if (!r.ok) {
    if (r.status === 401) throw new Error("TMDB_API_KEY_INVALID");
    throw new Error(`TMDB_HTTP_${r.status}`);
  }
  return r.json();
}

const image = (path, size = "w500") => path ? `${IMG}/${size}${path}` : "";

export function normalize(movie, genres = {}) {
  const genre = movie.genres?.slice(0,3).map(g => g.name).join(" · ") ||
    (movie.genre_ids || []).slice(0,2).map(id => genres[id]).filter(Boolean).join(" · ") || "영화";
  return {
    id: movie.id,
    title: movie.title || movie.name || movie.original_title || "제목 없음",
    year: (movie.release_date || movie.first_air_date || "미정").split("-")[0],
    genre,
    overview: movie.overview || "등록된 줄거리가 없습니다.",
    rating: typeof movie.vote_average === "number" ? movie.vote_average : 0,
    poster: image(movie.poster_path, "w500"),
    backdrop: image(movie.backdrop_path, "original"),
    backdropPath: movie.backdrop_path || "",
    runtime: movie.runtime ? `${Math.floor(movie.runtime/60)}시간 ${movie.runtime%60}분` : "",
    age: "15+"
  };
}

async function genres() {
  const data = await api("/genre/movie/list");
  return Object.fromEntries((data.genres || []).map(g => [g.id, g.name]));
}

async function list(path, genreMap, params = {}) {
  const data = await api(path, { region: REGION, ...params });
  return (data.results || []).map(m => normalize(m, genreMap));
}

export async function homeData() {
  const genreMap = await genres();
  const [trendingData, popular, nowPlaying, topRated, upcoming, comedy, romance, horror, documentary] = await Promise.all([
    api("/trending/movie/week"),
    list("/movie/popular", genreMap),
    list("/movie/now_playing", genreMap),
    list("/movie/top_rated", genreMap),
    list("/movie/upcoming", genreMap),
    list("/discover/movie", genreMap, { with_genres: 35, sort_by: "popularity.desc" }),
    list("/discover/movie", genreMap, { with_genres: 10749, sort_by: "popularity.desc" }),
    list("/discover/movie", genreMap, { with_genres: 27, sort_by: "popularity.desc" }),
    list("/discover/movie", genreMap, { with_genres: 99, sort_by: "popularity.desc" })
  ]);
  const trending = (trendingData.results || []).map(m => normalize(m, genreMap));
  const candidates = [...trending, ...popular, ...nowPlaying].filter(m => m.backdropPath);
  const heroMovie = candidates[Math.floor(Math.random() * candidates.length)] || popular[0] || trending[0];
  return {
    genreMap,
    heroMovie,
    sections: [
      { key:"top", title:"오늘의 TOP 10", type:"rank", movies:trending.slice(0,10) },
      { key:"popular", title:"지금 인기 있는 영화", movies:popular.slice(0,18) },
      { key:"now", title:"현재 상영 중", movies:nowPlaying.slice(0,18) },
      { key:"rated", title:"평점 높은 영화", movies:topRated.slice(0,18) },
      { key:"upcoming", title:"곧 공개되는 영화", movies:upcoming.slice(0,18) },
      { key:"comedy", title:"웃고 싶을 때 보는 코미디", movies:comedy.slice(0,18) },
      { key:"romance", title:"설레는 로맨스 영화", movies:romance.slice(0,18) },
      { key:"horror", title:"등골 서늘한 공포 영화", movies:horror.slice(0,18) },
      { key:"documentary", title:"흥미로운 다큐멘터리", movies:documentary.slice(0,18) }
    ]
  };
}

export async function detail(id, genreMap = {}) {
  const data = await api(`/movie/${id}`, { append_to_response:"credits,videos" });
  return normalize(data, genreMap);
}

export async function search(query, genreMap = {}) {
  const data = await api("/search/movie", { query, include_adult:false, region:REGION });
  return (data.results || []).map(m => normalize(m, genreMap));
}

export async function trailer(id) {
  let data = await api(`/movie/${id}/videos`);
  let videos = data.results || [];
  if (!videos.length) {
    data = await api(`/movie/${id}/videos`, {}, "en-US");
    videos = data.results || [];
  }
  return videos.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    videos.find(v => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find(v => v.site === "YouTube" && v.type === "Teaser") || null;
}
