import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataBanner from '../components/DataBanner';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import BookstoreCard from '../components/BookstoreCard';
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView';

export default function SearchPage() {
  const { bookstores, visibleBookstores, loading, error, retry, filters, patchFilters, resetFilters, userLocation, locationStatus, requestLocation } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = [filters.region !== '전체', filters.parking, filters.independent, filters.rental].filter(Boolean).length;

  return (
    <div className="page find-page">
      <header className="page-header sticky-head">
        <div><p className="eyebrow">FIND</p><h1>서점 찾기</h1></div>
        <button className={`filter-toggle ${filtersOpen ? 'active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>필터 {activeCount > 0 && <b>{activeCount}</b>}</button>
      </header>
      <DataBanner />
      <SearchBar value={filters.keyword} onChange={(keyword) => patchFilters({ keyword })} />
      <div className={`filter-wrap ${filtersOpen ? 'open' : ''}`}><FilterPanel /></div>

      <div className="results-toolbar">
        <div><strong>{visibleBookstores.length}</strong><span> / 전체 {bookstores.length}곳</span></div>
        <select value={filters.sort} onChange={(e) => {
          const sort = e.target.value;
          if (sort === 'distance' && !userLocation && locationStatus !== 'loading') requestLocation();
          patchFilters({ sort });
        }} aria-label="정렬">
          <option value="default">기본 순</option>
          <option value="name">이름 순</option>
          <option value="distance">가까운 순</option>
        </select>
      </div>

      {locationStatus === 'denied' && <div className="inline-notice">위치 권한이 없어 거리 정렬은 제한되지만 검색과 상세 기능은 그대로 사용할 수 있어요.</div>}
      {loading && <LoadingView />}
      {error && <ErrorView message={error} onRetry={retry} />}
      {!loading && !error && visibleBookstores.length === 0 && <EmptyView actionLabel="검색·필터 초기화" onAction={resetFilters} />}
      {!loading && !error && visibleBookstores.length > 0 && <div className="results-grid">{visibleBookstores.map((bookstore) => <BookstoreCard key={bookstore.id} bookstore={bookstore} horizontal />)}</div>}
    </div>
  );
}
