import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchBookstores } from '../services/bookstoreApi';
import { haversineDistanceKm } from '../utils/distance';

const AppContext = createContext(null);
const USER_STATE_KEY = 'bookcomma:userState:v1';

const defaultFilters = {
  keyword: '',
  region: '전체',
  parking: false,
  independent: false,
  rental: false,
  sort: 'default',
};

function readUserState() {
  try {
    return JSON.parse(localStorage.getItem(USER_STATE_KEY) || '{}');
  } catch {
    return {};
  }
}

function normalizeUserState(value = {}) {
  const next = {};
  Object.entries(value).forEach(([id, state]) => {
    next[id] = {
      favorite: Boolean(state?.favorite),
      visited: Boolean(state?.visited),
      memo: typeof state?.memo === 'string' ? state.memo : '',
      updatedAt: state?.updatedAt || new Date().toISOString(),
    };
  });
  return next;
}

export function AppProvider({ children }) {
  const [bookstores, setBookstores] = useState([]);
  const [dataMode, setDataMode] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [userStates, setUserStates] = useState(() => normalizeUserState(readUserState()));

  async function loadBookstores() {
    setLoading(true);
    setError('');
    try {
      const result = await fetchBookstores();
      setBookstores(result.items);
      setDataMode(result.mode);
    } catch (err) {
      console.error('[BOOKCAFE API error]', err);
      setError(err instanceof Error ? err.message : '서점 데이터를 불러오지 못했습니다.');
      setDataMode('error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookstores(); }, []);
  useEffect(() => {
    localStorage.setItem(USER_STATE_KEY, JSON.stringify(userStates));
  }, [userStates]);

  const regions = useMemo(() => {
    return ['전체', ...Array.from(new Set(bookstores.map((b) => b.shortRegion).filter(Boolean))).sort((a,b) => a.localeCompare(b, 'ko'))];
  }, [bookstores]);

  const enrichedBookstores = useMemo(() => bookstores.map((bookstore) => ({
    ...bookstore,
    distanceKm: userLocation && Number.isFinite(bookstore.lat) && Number.isFinite(bookstore.lng)
      ? haversineDistanceKm(userLocation.latitude, userLocation.longitude, bookstore.lat, bookstore.lng)
      : null,
  })), [bookstores, userLocation]);

  const visibleBookstores = useMemo(() => {
    const keyword = filters.keyword.trim().toLocaleLowerCase('ko-KR');
    const next = enrichedBookstores.filter((bookstore) => {
      if (keyword) {
        const haystack = `${bookstore.name} ${bookstore.address} ${bookstore.shortRegion} ${bookstore.category}`.toLocaleLowerCase('ko-KR');
        if (!haystack.includes(keyword)) return false;
      }
      if (filters.region !== '전체' && bookstore.shortRegion !== filters.region) return false;
      if (filters.parking && bookstore.parking !== true) return false;
      if (filters.independent && bookstore.independentPublishing !== true) return false;
      if (filters.rental && bookstore.rental !== true) return false;
      return true;
    });

    return [...next].sort((a,b) => {
      if (filters.sort === 'name') return a.name.localeCompare(b.name, 'ko');
      if (filters.sort === 'distance') {
        const ad = Number.isFinite(a.distanceKm) ? a.distanceKm : Number.POSITIVE_INFINITY;
        const bd = Number.isFinite(b.distanceKm) ? b.distanceKm : Number.POSITIVE_INFINITY;
        return ad - bd;
      }
      return 0;
    });
  }, [enrichedBookstores, filters]);

  function resetFilters() { setFilters(defaultFilters); }
  function patchFilters(patch) { setFilters((prev) => ({ ...prev, ...patch })); }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  function updateUserState(bookstoreId, patch) {
    setUserStates((prev) => ({
      ...prev,
      [bookstoreId]: {
        favorite: Boolean(prev[bookstoreId]?.favorite),
        visited: Boolean(prev[bookstoreId]?.visited),
        memo: prev[bookstoreId]?.memo || '',
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function removeUserState(bookstoreId) {
    setUserStates((prev) => {
      const next = { ...prev };
      delete next[bookstoreId];
      return next;
    });
  }

  const value = {
    bookstores: enrichedBookstores,
    visibleBookstores,
    dataMode,
    loading,
    error,
    retry: loadBookstores,
    filters,
    regions,
    patchFilters,
    resetFilters,
    userLocation,
    locationStatus,
    requestLocation,
    selectedMapId,
    setSelectedMapId,
    userStates,
    updateUserState,
    removeUserState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
