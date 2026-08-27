const NAV_ITEMS = [
  ["home", "⌂", "home"],
  ["search", "⌕", "search"],
  ["map", "⌖", "map"],
  ["favorites", "♡", "favoritesShort"],
  ["my", "☻", null]
];

export default function BottomNav({ currentView, onChange, t }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(([view, icon, translationKey]) => (
        <button
          type="button"
          key={view}
          className={`nav-item ${currentView === view ? "active" : ""}`}
          onClick={() => onChange(view)}
        >
          <span>{icon}</span>
          <small>{translationKey ? t(translationKey) : "MY"}</small>
        </button>
      ))}
    </nav>
  );
}
