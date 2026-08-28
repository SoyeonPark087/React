import { useEffect } from "react";

export default function DetailModal({
  restaurant,
  language,
  favorite,
  onFavorite,
  onClose,
  t
}) {
  useEffect(() => {
    if (!restaurant) return undefined;

    const handler = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [restaurant, onClose]);

  if (!restaurant) return null;

  const localized = (field) =>
    restaurant[field]?.[language] ||
    restaurant[field]?.ko ||
    restaurant[field]?.en ||
    "";

  const directions = () => {
    if (restaurant.lat == null || restaurant.lng == null) return;
    const name = encodeURIComponent(localized("name"));

    window.open(
      `https://map.kakao.com/link/to/${name},${restaurant.lat},${restaurant.lng}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const call = () => {
    if (restaurant.phone) {
      window.location.href = `tel:${restaurant.phone}`;
    }
  };

  const share = async () => {
    const text = [
      localized("name"),
      localized("menu"),
      localized("address")
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: localized("name"), text });
      } catch {}
      return;
    }

    await navigator.clipboard?.writeText(text);
  };

  const heroStyle = restaurant.image
    ? {
        backgroundImage:
          `linear-gradient(180deg,transparent 20%,rgba(0,0,0,.68)),url("${restaurant.image}")`
      }
    : undefined;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="detail-modal"
        onMouseDown={(event) => event.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <button
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label={t("close")}
        >
          ×
        </button>

        <div className="detail-hero" style={heroStyle}>
          <div>
            <p>{localized("district")}</p>
            <h2>{localized("name")}</h2>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-actions">
            <button type="button" className="detail-action" onClick={call}>
              ☎<br />{t("call")}
            </button>
            <button type="button" className="detail-action" onClick={directions}>
              ⌖<br />{t("directions")}
            </button>
            <button
              type="button"
              className="detail-action"
              onClick={() => onFavorite(restaurant.id)}
            >
              {favorite ? "♥" : "♡"}<br />{t("save")}
            </button>
            <button type="button" className="detail-action" onClick={share}>
              ⇧<br />{t("share")}
            </button>
          </div>

          <div className="info-grid">
            <div className="info-row">
              <strong>{t("menu")}</strong>
              <span>{localized("menu")}</span>
            </div>
            <div className="info-row">
              <strong>{t("hours")}</strong>
              <span>{localized("hours")}</span>
            </div>
            <div className="info-row">
              <strong>{t("address")}</strong>
              <span>{localized("address")}</span>
            </div>

            {restaurant.homepage ? (
              <div className="info-row">
                <strong>{t("homepage")}</strong>
                <a href={restaurant.homepage} target="_blank" rel="noreferrer">
                  {restaurant.homepage}
                </a>
              </div>
            ) : null}
          </div>

          <h3>{localized("title")}</h3>
          <p className="detail-description">
            {localized("description")}
          </p>

          <p className="detail-notice">{t("openNowNotice")}</p>
        </div>
      </section>
    </div>
  );
}
