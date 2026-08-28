import React from 'react';

export function BookstoreBadges({ bookstore, compact = false }) {
  const items = [];
  if (bookstore.parking === true) items.push(['🚗', '주차']);
  if (bookstore.independentPublishing === true) items.push(['✦', '독립출판']);
  if (bookstore.rental === true) items.push(['↗', '대여']);
  if (!items.length) items.push(['☕', '카페 서점']);
  return (
    <div className={`badge-row ${compact ? 'compact' : ''}`}>
      {items.slice(0, compact ? 2 : 4).map(([icon, text]) => <span className="mini-badge" key={text}><span>{icon}</span>{text}</span>)}
    </div>
  );
}
