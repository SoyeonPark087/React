import React from 'react';

export function LoadingView({ compact = false }) {
  return (
    <div className={`status-view ${compact ? 'compact' : ''}`}>
      <div className="spinner" aria-hidden="true" />
      <strong>서점 정보를 불러오는 중</strong>
      <p>공공데이터를 정리하고 있어요.</p>
    </div>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <div className="status-view error-view">
      <div className="status-emoji">!</div>
      <strong>데이터를 불러오지 못했어요</strong>
      <p>{message}</p>
      <button className="primary-button" onClick={onRetry}>다시 시도</button>
    </div>
  );
}

export function EmptyView({ title = '조건에 맞는 서점이 없어요', description = '검색어나 필터를 바꿔보세요.', actionLabel, onAction }) {
  return (
    <div className="status-view empty-view">
      <div className="status-emoji">☕</div>
      <strong>{title}</strong>
      <p>{description}</p>
      {actionLabel && <button className="soft-button" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
