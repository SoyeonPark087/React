import { formatDistance } from "../utils/geo";

export default function RestaurantCard({
  restaurant,
  language,
  userPosition,
  favorite,
  onFavorite,
  onOpen
}) {
  const localized = (field) =>
    restaurant[field]?.[language] ||
    restaurant[field]?.ko ||
    restaurant[field]?.en ||
    "";

  const distance = formatDistance(userPosition, restaurant);

  return (
    <article
      className="restaurant-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(restaurant)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(restaurant);
      }}
    >
      <div className="thumb">
        <div className="thumb-fallback">
          {localized("district") || "BUSAN"}
        </div>

        {restaurant.thumbnail || restaurant.image ? (
          <img
            src={restaurant.thumbnail || restaurant.image}
            alt=""
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>

      <div className="card-body">
        <div className="card-top">
          <div>
            <h3>{localized("name") || "-"}</h3>
            <p>{localized("title")}</p>
          </div>

          <button
            type="button"
            className={`favorite-button ${favorite ? "active" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onFavorite(restaurant.id);
            }}
          >
            {favorite ? "♥" : "♡"}
          </button>
        </div>

        <p className="menu">{localized("menu")}</p>

        <div className="meta">
          <span>{localized("district")}</span>
          {distance ? <span>· {distance}</span> : null}
        </div>
      </div>
    </article>
  );
}
