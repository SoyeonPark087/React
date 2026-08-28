import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDistance } from '../utils/distance';
import { BookstoreBadges } from './Badges';

function toneIndex(id) {
  return Math.abs([...String(id)].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 5;
}

export default function BookstoreCard({ bookstore, horizontal = false }) {
  const navigate = useNavigate();
  const { userStates, updateUserState } = useApp();
  const state = userStates[bookstore.id] || {};
  const distance = formatDistance(bookstore.distanceKm);
  const tone = toneIndex(bookstore.id);

  function openDetail() { navigate(`/detail/${encodeURIComponent(bookstore.id)}`); }

  return (
    <article
      className={`bookstore-card tone-${tone} ${horizontal ? 'horizontal' : ''}`}
      onClick={openDetail}
      tabIndex="0"
      onKeyDown={(e) => { if (e.target === e.currentTarget && e.key === 'Enter') openDetail(); }}
    >
      <div className="card-content">
        <div className="card-title-row">
          <div className="card-title-copy">
            <div className="card-region-row">
              <span className="card-place-icon" aria-hidden="true">☕</span>
              <span className="region-label">{bookstore.shortRegion || '지역 정보 없음'} {distance && `· ${distance}`}</span>
            </div>
            <h3>{bookstore.name}</h3>
          </div>
          <button
            className={`heart-button ${state.favorite ? 'selected' : ''}`}
            aria-label={state.favorite ? '찜 해제' : '찜하기'}
            onClick={(e) => { e.stopPropagation(); updateUserState(bookstore.id, { favorite: !state.favorite }); }}
          >{state.favorite ? '♥' : '♡'}</button>
        </div>

        <p className="card-address">{bookstore.address}</p>

        <div className="card-facts" aria-label="방문 정보 요약">
          {bookstore.hours && <span><b>◷</b>{bookstore.hours}</span>}
          {bookstore.closedDays && <span><b>○</b>{bookstore.closedDays}</span>}
        </div>

        <BookstoreBadges bookstore={bookstore} compact />
      </div>
    </article>
  );
}
