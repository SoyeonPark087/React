export default function Header({ language, onLanguageClick, t }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">BUSAN PUBLIC DATA</p>
        <h1>{t("brand")}</h1>
      </div>

      <button
        type="button"
        className="icon-button"
        onClick={onLanguageClick}
        aria-label={t("language")}
      >
        {language.toUpperCase()}
      </button>
    </header>
  );
}
