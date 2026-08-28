import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DataBanner from '../components/DataBanner';
import SearchBar from '../components/SearchBar';
import BookstoreCard from '../components/BookstoreCard';
import { ErrorView, LoadingView } from '../components/StatusView';
import { buildRegionStats } from '../utils/stats';

const quickRegions = ['서울','경기','부산','제주'];

export default function HomePage() {
  const navigate = useNavigate();
  const { bookstores, loading, error, retry, filters, patchFilters, requestLocation, locationStatus, userLocation } = useApp();
  const stats = useMemo(() => buildRegionStats(bookstores), [bookstores]);
  const topRegions = stats.slice(0, 3);
  const featured = useMemo(() => {
    return [...bookstores]
      .sort((a,b) => Number(b.independentPublishing) - Number(a.independentPublishing) || Number(b.parking) - Number(a.parking))
      .slice(0, 4);
  }, [bookstores]);

  function goSearch(keyword) {
    patchFilters({ keyword });
    navigate('/find');
  }

  function applyQuick(patch) {
    patchFilters({ keyword:'', region:'전체', parking:false, independent:false, rental:false, ...patch });
    navigate('/find');
  }

  return (
    <div className="page home-page">
      <header className="home-header">
        <div>
          <p className="eyebrow">BOOK + CAFE</p>
          <h1>책쉼표<span className="brand-dot">.</span></h1>
        </div>
        <button className="round-icon-button" onClick={() => navigate('/stats')} aria-label="지역 통계">▥</button>
      </header>

      <DataBanner />

      <section className="hero-card">
        <div className="hero-copy">
          <span className="hero-kicker">오늘의 작은 여행</span>
          <h2>책도 읽고, 커피도 마실<br/>나만의 서점을 찾아보세요.</h2>
          <p>전국의 카페가 있는 서점을 공공데이터로 한눈에.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hero-book">▤</span>
          <span className="hero-cup">☕</span>
          <span className="hero-spark">✦</span>
        </div>
      </section>

      <SearchBar value={filters.keyword} onChange={(keyword) => patchFilters({ keyword })} onSubmit={goSearch} />

      <section className="section-block">
        <div className="section-heading"><div><span className="section-kicker">QUICK FIND</span><h2>어떤 곳을 찾고 있나요?</h2></div></div>
        <div className="quick-grid">
          <button className="quick-card blue" onClick={() => applyQuick({ parking:true })}><span className="quick-icon">P</span><strong>주차 가능한 곳</strong><small>차로 편하게</small></button>
          <button className="quick-card yellow" onClick={() => applyQuick({ independent:true })}><span className="quick-icon">✦</span><strong>독립출판물</strong><small>새로운 책 발견</small></button>
          <button className="quick-card green" onClick={() => applyQuick({ rental:true })}><span className="quick-icon">↗</span><strong>대여 가능한 곳</strong><small>책을 빌려 읽기</small></button>
          <button className="quick-card pink" onClick={() => { requestLocation(); navigate('/map'); }}><span className="quick-icon">⌖</span><strong>내 주변 찾기</strong><small>{locationStatus === 'loading' ? '위치 확인 중' : userLocation ? '위치 확인 완료' : '가까운 순서로'}</small></button>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="section-kicker">REGION</span><h2>지역으로 둘러보기</h2></div>
          <button className="text-button" onClick={() => navigate('/stats')}>통계 보기 →</button>
        </div>
        <div className="region-row">
          {quickRegions.map((region) => <button key={region} className="region-pill" onClick={() => applyQuick({ region })}>{region}</button>)}
        </div>
        {!!topRegions.length && <div className="tiny-stats">{topRegions.map((s) => <span key={s.region}><strong>{s.region}</strong> {s.total}곳</span>)}</div>}
      </section>

      <section className="section-block last-section">
        <div className="section-heading">
          <div><span className="section-kicker">PICK</span><h2>둘러볼 만한 책쉼표</h2></div>
          <button className="text-button" onClick={() => navigate('/find')}>전체 보기 →</button>
        </div>
        {loading && <LoadingView compact />}
        {error && <ErrorView message={error} onRetry={retry} />}
        {!loading && !error && <div className="card-grid">{featured.map((bookstore) => <BookstoreCard key={bookstore.id} bookstore={bookstore} />)}</div>}
      </section>
    </div>
  );
}
