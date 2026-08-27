import RestaurantCard from "./RestaurantCard";

export default function RestaurantList({
  restaurants,
  language,
  userPosition,
  favorites,
  onFavorite,
  onOpen,
  emptyText
}) {
  if (!restaurants.length) {
    return (
      <div className="empty-state compact-empty">
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="card-list">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          language={language}
          userPosition={userPosition}
          favorite={favorites.includes(restaurant.id)}
          onFavorite={onFavorite}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
