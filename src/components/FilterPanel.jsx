import React from 'react';
import { useApp } from '../context/AppContext';

export default function FilterPanel() {
  const { filters, patchFilters, regions, resetFilters, userLocation, requestLocation, locationStatus } = useApp();
  const activeCount = [filters.region !== '전체', filters.parking, filters.independent, filters.rental].filter(Boolean).length;
  return (
    <section className="filter-panel" aria-label="검색 필터">
      <div className="filter-heading">
        <div><strong>필터</strong>{activeCount > 0 && <span className="filter-count">{activeCount}</span>}</div>
        <button className="text-button" onClick={resetFilters}>초기화</button>
      </div>
      <label className="field-label">지역</label>
      <div className="chip-scroll">
        {regions.map((region) => (
          <button key={region} className={`filter-chip ${filters.region === region ? 'active' : ''}`} onClick={() => patchFilters({ region })}>{region}</button>
        ))}
      </div>
      <label className="field-label">조건</label>
      <div className="feature-grid">
        <ToggleChip active={filters.parking} onClick={() => patchFilters({ parking: !filters.parking })} icon="P" label="주차 가능" />
        <ToggleChip active={filters.independent} onClick={() => patchFilters({ independent: !filters.independent })} icon="✦" label="독립출판" />
        <ToggleChip active={filters.rental} onClick={() => patchFilters({ rental: !filters.rental })} icon="↗" label="대여 가능" />
        <ToggleChip active={Boolean(userLocation)} onClick={requestLocation} icon="⌖" label={locationStatus === 'loading' ? '위치 확인 중' : '내 위치'} />
      </div>
    </section>
  );
}

function ToggleChip({ active, onClick, icon, label }) {
  return <button className={`feature-chip ${active ? 'active' : ''}`} onClick={onClick}><span>{icon}</span>{label}</button>;
}
