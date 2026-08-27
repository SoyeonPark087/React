import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import RestaurantList from "./components/RestaurantList";
import DetailModal from "./components/DetailModal";
import KakaoMap from "./components/KakaoMap";
import { translate } from "./i18n";
import { loadRestaurants } from "./services/publicData";
import { distanceKm } from "./utils/geo";
import {
  loadFavorites,
  loadLanguage,
  loadRecent,
  saveFavorites,
  saveLanguage,
  saveRecent
} from "./utils/storage";
import { useGeolocation } from "./hooks/useGeolocation";

export default function App() {
  const [language, setLanguage] = useState(loadLanguage);
  const [view, setView] = useState("home");
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [recent, setRecent] = useState(loadRecent);
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState("");
  const [dataError, setDataError] = useState("");

  const { position, requestLocation } = useGeolocation();

  const t = useCallback(
    (key) => translate(language, key),
    [language]
  );

  const localized = useCallback(
    (restaurant, field) =>
      restaurant[field]?.[language] ||
      restaurant[field]?.ko ||
      restaurant[field]?.en ||
      "",
    [language]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setDataError("");
    setDataStatus(t("loading"));

    try {
      const data = await loadRestaurants();
      setRestaurants(data);
      setDataStatus(`${t("loaded")} · ${data.length}`);

      if (!data.length) {
        setDataError(t("noData"));
      }
    } catch (error) {
      console.error("Public Data API Error:", error);

      if (error.code === "PUBLIC_DATA_KEY_MISSING") {
        setDataError(`${t("apiKeyMissing")} ${t("apiKeyHint")}`);
      } else {
        setDataError(
          `${t("apiError")} ${error.message || ""} ${t("corsHint")}`.trim()
        );
      }

      setRestaurants([]);
      setDataStatus(t("apiError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.lang = language;
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveRecent(recent);
  }, [recent]);

  const districts = useMemo(() => {
    return [...new Set(
      restaurants
        .map((restaurant) => localized(restaurant, "district"))
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }, [restaurants, localized]);

  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    const filtered = restaurants.filter((restaurant) => {
      const restaurantDistrict = localized(restaurant, "district");

      if (district !== "all" && restaurantDistrict !== district) {
        return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [
        localized(restaurant, "name"),
        localized(restaurant, "title"),
        localized(restaurant, "address"),
        localized(restaurant, "menu"),
        localized(restaurant, "description"),
        restaurantDistrict
      ].join(" ").toLocaleLowerCase();

      return haystack.includes(normalizedQuery);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "distance" && position) {
        return (
          (distanceKm(position, a.lat, a.lng) ?? Infinity) -
          (distanceKm(position, b.lat, b.lng) ?? Infinity)
        );
      }

      if (sort === "name") {
        return localized(a, "name").localeCompare(localized(b, "name"));
      }

      return 0;
    });
  }, [restaurants, query, district, sort, position, localized]);

  const favoriteRestaurants = useMemo(
    () => restaurants.filter((restaurant) => favorites.includes(restaurant.id)),
    [restaurants, favorites]
  );

  const recentRestaurants = useMemo(
    () =>
      recent
        .map((id) => restaurants.find((restaurant) => restaurant.id === id))
        .filter(Boolean),
    [recent, restaurants]
  );

  const toggleFavorite = useCallback((id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current]
    );
  }, []);

  const openRestaurant = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
    setRecent((current) => [
      restaurant.id,
      ...current.filter((id) => id !== restaurant.id)
    ].slice(0, 20));
  }, []);

  const goNearby = async () => {
    try {
      await requestLocation();
      setSort("distance");
      setView("search");
    } catch {
      // 브라우저 권한 팝업에서 거절한 경우 유지
    }
  };

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setLanguageOpen(false);
  };

  return (
    <div className="app-shell">
      <Header
        language={language}
        onLanguageClick={() => setLanguageOpen(true)}
        t={t}
      />

      <main>
        {view === "home" && (
          <section className="view">
            <section className="hero-card">
              <p className="hero-copy">{t("hero")}</p>

              <div className="search-box">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setView("search");
                  }}
                  type="search"
                  placeholder={t("searchPlaceholder")}
                />
              </div>

              <div className="hero-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={goNearby}
                >
                  📍 {t("nearby")}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setView("map")}
                >
                  🗺 {t("openMap")}
                </button>
              </div>
            </section>

            {dataError && (
              <section className="api-notice">
                <strong>{t("apiStatus")}</strong>
                {dataError}
              </section>
            )}

            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">DISTRICT</p>
                  <h2>{t("districtTitle")}</h2>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setDistrict("all");
                    setView("search");
                  }}
                >
                  {t("viewAll")}
                </button>
              </div>

              <div className="chip-row">
                {districts.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className="chip"
                    onClick={() => {
                      setDistrict(item);
                      setView("search");
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">RECOMMENDED</p>
                  <h2>{t("officialPicks")}</h2>
                </div>

                <span className="sync-badge">{dataStatus}</span>
              </div>

              {loading ? (
                <div className="card-list">
                  <div className="loading-card" />
                  <div className="loading-card" />
                  <div className="loading-card" />
                </div>
              ) : (
                <RestaurantList
                  restaurants={restaurants.slice(0, 8)}
                  language={language}
                  userPosition={position}
                  favorites={favorites}
                  onFavorite={toggleFavorite}
                  onOpen={openRestaurant}
                  emptyText={t("noData")}
                />
              )}
            </section>
          </section>
        )}

        {view === "search" && (
          <section className="view">
            <div className="sticky-search">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  placeholder={t("searchPlaceholder")}
                />
              </div>

              <div className="chip-row compact">
                <button
                  type="button"
                  className={`chip ${district === "all" ? "active" : ""}`}
                  onClick={() => setDistrict("all")}
                >
                  {t("all")}
                </button>

                {districts.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`chip ${district === item ? "active" : ""}`}
                    onClick={() => setDistrict(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="result-toolbar">
                <strong>
                  {filteredRestaurants.length}
                  {t("result")}
                </strong>

                <select
                  value={sort}
                  onChange={async (event) => {
                    const nextSort = event.target.value;

                    if (nextSort === "distance" && !position) {
                      try {
                        await requestLocation();
                      } catch {
                        return;
                      }
                    }

                    setSort(nextSort);
                  }}
                >
                  <option value="recommended">{t("sortRecommended")}</option>
                  <option value="distance">{t("sortDistance")}</option>
                  <option value="name">{t("sortName")}</option>
                </select>
              </div>
            </div>

            <RestaurantList
              restaurants={filteredRestaurants}
              language={language}
              userPosition={position}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onOpen={openRestaurant}
              emptyText={t("noData")}
            />
          </section>
        )}

        {view === "map" && (
          <section className="view map-view">
            <div className="map-toolbar">
              <button
                type="button"
                className="floating-button"
                onClick={requestLocation}
              >
                ◎ {t("myLocation")}
              </button>

              <button
                type="button"
                className="floating-button"
                onClick={() => setView("search")}
              >
                ☰ {t("list")}
              </button>
            </div>

            <div id="map">
              <KakaoMap
                restaurants={filteredRestaurants}
                language={language}
                userPosition={position}
                onOpenRestaurant={openRestaurant}
                t={t}
              />
            </div>
          </section>
        )}

        {view === "favorites" && (
          <section className="view">
            <section className="section page-title-section">
              <p className="section-kicker">SAVED</p>
              <h2>{t("favorites")}</h2>
            </section>

            <RestaurantList
              restaurants={favoriteRestaurants}
              language={language}
              userPosition={position}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onOpen={openRestaurant}
              emptyText={t("noFavorites")}
            />
          </section>
        )}

        {view === "my" && (
          <section className="view">
            <section className="section page-title-section">
              <p className="section-kicker">MY</p>
              <h2>{t("settings")}</h2>
            </section>

            <div className="settings-card">
              <button
                type="button"
                className="setting-row"
                onClick={() => setLanguageOpen(true)}
              >
                <div>
                  <strong>{t("language")}</strong>
                  <span>{t("languageDesc")}</span>
                </div>
                <span>{language === "ko" ? "한국어" : "English"} ›</span>
              </button>

              <button
                type="button"
                className="setting-row"
                onClick={requestLocation}
              >
                <div>
                  <strong>{t("location")}</strong>
                  <span>{t("locationDesc")}</span>
                </div>
                <span>›</span>
              </button>

              <button
                type="button"
                className="setting-row"
                onClick={loadData}
              >
                <div>
                  <strong>{t("reloadData")}</strong>
                  <span>{t("reloadDataDesc")}</span>
                </div>
                <span>↻</span>
              </button>

              <div className="setting-row static">
                <div>
                  <strong>{t("dataSource")}</strong>
                  <span>{t("dataSourceDesc")}</span>
                </div>
              </div>
            </div>

            <section className="section">
              <p className="notice">{t("practiceWarning")}</p>
            </section>

            <section className="section">
              <p className="section-kicker">{t("recent")}</p>
              <h2>{t("recentlyViewed")}</h2>

              <RestaurantList
                restaurants={recentRestaurants}
                language={language}
                userPosition={position}
                favorites={favorites}
                onFavorite={toggleFavorite}
                onOpen={openRestaurant}
                emptyText={t("noData")}
              />
            </section>
          </section>
        )}
      </main>

      <BottomNav
        currentView={view}
        onChange={setView}
        t={t}
      />

      {selectedRestaurant && (
        <DetailModal
          restaurant={selectedRestaurant}
          language={language}
          favorite={favorites.includes(selectedRestaurant.id)}
          onFavorite={toggleFavorite}
          onClose={() => setSelectedRestaurant(null)}
          t={t}
        />
      )}

      {languageOpen && (
        <div
          className="modal-backdrop language-backdrop"
          onMouseDown={() => setLanguageOpen(false)}
        >
          <section
            className="language-sheet"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="dialog-sheet-header">
              <h3>{t("language")}</h3>

              <button
                type="button"
                className="icon-button"
                onClick={() => setLanguageOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="language-options">
              <button
                type="button"
                className={`language-option ${language === "ko" ? "active" : ""}`}
                onClick={() => changeLanguage("ko")}
              >
                한국어
              </button>

              <button
                type="button"
                className={`language-option ${language === "en" ? "active" : ""}`}
                onClick={() => changeLanguage("en")}
              >
                English
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
