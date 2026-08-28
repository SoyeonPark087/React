import React, { useEffect, useState } from 'react';

export default function SearchBar({ value, onChange, onSubmit, placeholder = '서점 이름이나 지역을 검색해보세요', autoFocus = false }) {
  const [local, setLocal] = useState(value || '');
  useEffect(() => { setLocal(value || ''); }, [value]);

  function sync(next) {
    setLocal(next);
    onChange?.(next);
  }

  return (
    <form className="search-bar" onSubmit={(e) => { e.preventDefault(); onSubmit?.(local); }} role="search">
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        value={local}
        onChange={(e) => sync(e.target.value)}
        placeholder={placeholder}
        aria-label="서점 검색"
        autoFocus={autoFocus}
      />
      {local && <button type="button" className="search-clear" aria-label="검색어 지우기" onClick={() => sync('')}>×</button>}
      <button type="submit" className="search-submit">검색</button>
    </form>
  );
}
