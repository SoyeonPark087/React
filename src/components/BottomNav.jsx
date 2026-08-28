import React from 'react';
import { NavLink } from 'react-router-dom';

const items = [
  ['/', '⌂', '홈'],
  ['/find', '⌕', '찾기'],
  ['/map', '⌖', '지도'],
  ['/saved', '♡', '나의 책방'],
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="주요 화면">
      <div className="bottom-nav-inner">
        {items.map(([to, icon, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
