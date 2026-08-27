const FAVORITES_KEY = "busan.react.favorites";
const RECENT_KEY = "busan.react.recent";
const LANGUAGE_KEY = "busan.react.language";

export function loadFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); }
  catch { return []; }
}

export function saveFavorites(items) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}

export function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}

export function saveRecent(items) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(items));
}

export function loadLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === "ko" || saved === "en") return saved;
  return (navigator.language || "ko").toLowerCase().startsWith("en") ? "en" : "ko";
}

export function saveLanguage(language) {
  localStorage.setItem(LANGUAGE_KEY, language);
}
