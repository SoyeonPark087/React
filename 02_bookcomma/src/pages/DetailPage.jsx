import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BookstoreBadges } from '../components/Badges';
import KakaoMap from '../components/KakaoMap';
import { formatDistance } from '../utils/distance';
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookstores, userStates, updateUserState, userLocation, requestLocation, locationStatus, loading, error, retry } = useApp();
  const bookstore = useMemo(() => bookstores.find((b) => b.id === decodeURIComponent(id)), [bookstores, id]);
  const state = bookstore ? (userStates[bookstore.id] || {}) : {};
  const [memo, setMemo] = useState(state.memo || '');
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (bookstore) setMemo(userStates[bookstore.id]?.memo || '');
  }, [bookstore?.id]);

  if (loading) return <div className="page detail-page"><LoadingView /></div>;
  if (error) return <div className="page detail-page"><button className="back-button" onClick={() => navigate(-1)}>← 뒤로</button><ErrorView message={error} onRetry={retry} /></div>;
  if (!bookstore) return <div className="page detail-page"><button className="back-button" onClick={() => navigate(-1)}>← 뒤로</button><EmptyView title="서점 정보를 찾을 수 없어요" description="목록에서 다시 선택해 주세요." actionLabel="서점 찾기" onAction={() => navigate('/find')} /></div>;

  function saveMemo() {
    updateUserState(bookstore.id, { memo });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1400);
  }

  const distance = formatDistance(bookstore.distanceKm);
  return (
    <div className="page detail-page">
      <div className="detail-topbar">
        <button className="back-button" onClick={() => navigate(-1)}>← 뒤로</button>
        <button className={`heart-button detail-heart ${state.favorite ? 'selected' : ''}`} onClick={() => updateUserState(bookstore.id, { favorite: !state.favorite })}>{state.favorite ? '♥' : '♡'}</button>
      </div>
      <section className="detail-hero">
        <div className="detail-category-row">
          <span className="detail-place-icon" aria-hidden="true">📚</span>
          <span>{bookstore.category || '카페가 있는 서점'}</span>
        </div>
        <span className="region-label">{bookstore.shortRegion} {distance && `· 내 위치에서 ${distance}`}</span>
        <h1>{bookstore.name}</h1>
        <p>{bookstore.address}</p>
        <BookstoreBadges bookstore={bookstore} />
      </section>

      <section className="detail-section">
        <h2>방문 정보</h2>
        <div className="info-grid">
          <InfoCard icon="◷" label="운영시간" value={bookstore.hours || '정보 없음'} />
          <InfoCard icon="○" label="휴무일" value={bookstore.closedDays || '정보 없음'} />
          <InfoCard icon="⌖" label="주소" value={bookstore.address || '정보 없음'} wide />
          <InfoCard icon="☎" label="전화" value={bookstore.phone || '정보 없음'} href={bookstore.phoneLink ? `tel:${bookstore.phoneLink}` : null} wide />
        </div>
      </section>

      <section className="detail-section">
        <h2>시설 및 서비스</h2>
        <div className="facility-grid">
          <Facility label="주차" value={bookstore.parking} icon="P" />
          <Facility label="독립출판물" value={bookstore.independentPublishing} icon="✦" />
          <Facility label="대여" value={bookstore.rental} icon="↗" />
          <Facility label="화장실" value={bookstore.restroom ? true : null} icon="WC" text={bookstore.restroom} />
          <Facility label="네이버 리뷰" value={bookstore.naverReview} icon="N" />
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading"><div><h2>위치</h2></div><button className="text-button" onClick={() => { requestLocation(); }}>내 위치 {userLocation ? '✓' : ''}</button></div>
        {Number.isFinite(bookstore.lat) && Number.isFinite(bookstore.lng)
          ? <KakaoMap bookstores={[bookstore]} userLocation={userLocation} selectedId={bookstore.id} focusBookstore={bookstore} />
          : <div className="inline-notice">좌표 정보가 없어 지도는 표시하지 않아요. 주소 정보는 위에서 확인할 수 있습니다.</div>}
        {locationStatus === 'denied' && <p className="helper-text">위치 권한이 없어도 지도와 상세 정보는 정상적으로 사용할 수 있습니다.</p>}
      </section>

      <section className="detail-section personal-section">
        <div className="section-heading"><div><span className="section-kicker">MY BOOKSTORE</span><h2>나의 기록</h2></div></div>
        <div className="personal-actions">
          <button className={`state-button ${state.favorite ? 'active favorite' : ''}`} onClick={() => updateUserState(bookstore.id, { favorite: !state.favorite })}>{state.favorite ? '♥ 찜한 서점' : '♡ 찜하기'}</button>
          <button className={`state-button ${state.visited ? 'active visited' : ''}`} onClick={() => updateUserState(bookstore.id, { visited: !state.visited })}>{state.visited ? '✓ 방문 완료' : '○ 방문 전'}</button>
        </div>
        <label className="memo-label" htmlFor="memo">개인 메모</label>
        <textarea id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="좌석, 분위기, 다음에 읽을 책처럼 나만의 메모를 남겨보세요." maxLength={300} />
        <div className="memo-actions"><small>{memo.length}/300</small><button className="primary-button small" onClick={saveMemo}>{savedFlash ? '저장됨 ✓' : '메모 저장'}</button></div>
      </section>
    </div>
  );
}

function InfoCard({ icon, label, value, href, wide }) {
  const content = <><span className="info-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></>;
  return href ? <a className={`info-card ${wide ? 'wide' : ''}`} href={href}>{content}</a> : <div className={`info-card ${wide ? 'wide' : ''}`}>{content}</div>;
}

function Facility({ label, value, icon, text }) {
  const status = value === true ? (text || '가능') : value === false ? '불가' : (text || '정보 없음');
  return <div className={`facility-card ${value === true ? 'yes' : value === false ? 'no' : ''}`}><span>{icon}</span><strong>{label}</strong><small>{status}</small></div>;
}
