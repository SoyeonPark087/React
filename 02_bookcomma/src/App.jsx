import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import MapPage from './pages/MapPage';
import DetailPage from './pages/DetailPage';
import SavedPage from './pages/SavedPage';
import StatsPage from './pages/StatsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/find" element={<SearchPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
