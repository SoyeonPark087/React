import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  const location = useLocation();
  const hideBottom = location.pathname.startsWith('/detail/');
  return (
    <div className="app-shell">
      <main className={hideBottom ? 'page-stage no-bottom-nav' : 'page-stage'}>
        <Outlet />
      </main>
      {!hideBottom && <BottomNav />}
    </div>
  );
}
