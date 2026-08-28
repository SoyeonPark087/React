import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import KakaoMap from '../components/KakaoMap';
import DataBanner from '../components/DataBanner';
import { BookstoreBadges } from '../components/Badges';
import { formatDistance } from '../utils/distance';
import { ErrorView, LoadingView } from '../components/StatusView';

export default function MapPage() {
  const navigate = useNavigate();
  const { visibleBookstores, loading, error, retry, selectedMapId, setSelectedMapId, userLocation, requestLocation, locationStatus } = useApp();
  const selected = useMemo(() => visibleBookstores.find((b) => b.id === selectedMapId) || visibleBookstores[0] || null, [visibleBookstores, selectedMapId]);

  useEffect(() => {
    if (visibleBookstores[0] && !visibleBookstores.some((b) => b.id === selectedMapId)) {
      setSelectedMapId(visibleBookstores[0].id);
    }
  }, [visibleBookstores, selectedMapId, setSelectedMapId]);

  return (
    <div className="page map-page">
      <header className="page-header">
        <div><p className="eyebrow">MAP</p><h1>지도에서 찾기</h1></div>
        <button className="soft-button small" onClick={requestLocation}>{locationStatus === 'loading' ? '확인 중…' : userLocation ? '내 위치 ✓' : '⌖ 내 위치'}</button>
      </header>
      <DataBanner />
      {loading && <LoadingView />}
      {error && <ErrorView message={error} onRetry={retry} />}
      {!loading && !error && <>
        <div className="map-summary"><strong>{visibleBookstores.length}곳</strong><span>현재 검색·필터 결과를 지도에 표시해요.</span></div>
        <KakaoMap bookstores={visibleBookstores} userLocation={userLocation} selectedId={selected?.id} onSelect={setSelectedMapId} />
        {locationStatus === 'denied' && <div className="inline-notice">위치 권한을 허용하지 않아도 서점 마커는 정상적으로 볼 수 있어요.</div>}
        {selected && <article className="map-selected-card">
          <div className="map-selected-top"><span className="region-label">{selected.shortRegion} {formatDistance(selected.distanceKm) && `· ${formatDistance(selected.distanceKm)}`}</span><span className="map-index">⌖</span></div>
          <h2>{selected.name}</h2>
          <p>{selected.address}</p>
          <BookstoreBadges bookstore={selected} />
          <button className="primary-button full" onClick={() => navigate(`/detail/${encodeURIComponent(selected.id)}`)}>상세정보 보기</button>
        </article>}
      </>}
    </div>
  );
}
