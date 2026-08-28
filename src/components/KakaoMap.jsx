import React, { useEffect, useRef, useState } from 'react';

let kakaoPromise;
function loadKakaoMaps(key) {
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (kakaoPromise) return kakaoPromise;
  kakaoPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => reject(new Error('Kakao Maps 스크립트를 불러오지 못했습니다.'));
    document.head.appendChild(script);
  });
  return kakaoPromise;
}

export default function KakaoMap({ bookstores, userLocation, selectedId, onSelect, focusBookstore }) {
  const ref = useRef(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('지도를 준비하고 있어요.');
  const mapKey = import.meta.env.VITE_KAKAO_MAP_KEY?.trim();

  useEffect(() => {
    let cancelled = false;
    if (!mapKey || mapKey.includes('YOUR_KAKAO_JAVASCRIPT_KEY')) {
      setStatus('missing');
      setMessage('Kakao Maps JavaScript 키를 .env에 입력하면 지도가 표시됩니다.');
      return undefined;
    }

    const valid = bookstores.filter((b) => Number.isFinite(b.lat) && Number.isFinite(b.lng));
    if (!valid.length && !userLocation) {
      setStatus('empty');
      setMessage('표시할 좌표 데이터가 없습니다.');
      return undefined;
    }

    setStatus('loading');
    loadKakaoMaps(mapKey).then((kakao) => {
      if (cancelled || !ref.current) return;
      const first = focusBookstore && Number.isFinite(focusBookstore.lat)
        ? focusBookstore
        : valid.find((b) => b.id === selectedId) || valid[0];
      const centerLat = first?.lat ?? userLocation?.latitude ?? 37.5665;
      const centerLng = first?.lng ?? userLocation?.longitude ?? 126.978;
      const map = new kakao.maps.Map(ref.current, {
        center: new kakao.maps.LatLng(centerLat, centerLng),
        level: focusBookstore ? 4 : 9,
      });

      const bounds = new kakao.maps.LatLngBounds();
      valid.forEach((bookstore) => {
        const pos = new kakao.maps.LatLng(bookstore.lat, bookstore.lng);
        const marker = new kakao.maps.Marker({ position: pos, map, title: bookstore.name });
        kakao.maps.event.addListener(marker, 'click', () => {
          onSelect?.(bookstore.id);
          map.panTo(pos);
        });
        bounds.extend(pos);
      });

      if (userLocation) {
        const position = new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
        const marker = new kakao.maps.Marker({ position, map, title: '현재 위치' });
        marker.setZIndex(10);
        bounds.extend(position);
      }

      if (!focusBookstore && valid.length > 1) {
        // 전국 좌표를 모두 맞추면 중국·일본까지 보일 만큼 지나치게 축소될 수 있다.
        // 먼저 결과 범위를 맞춘 뒤 최대 축소 레벨을 제한해 한국 중심의 초기 화면을 유지한다.
        map.setBounds(bounds, 28, 28, 76, 28);
        const MAX_INITIAL_LEVEL = 10;
        if (map.getLevel() > MAX_INITIAL_LEVEL) map.setLevel(MAX_INITIAL_LEVEL);
      }
      setStatus('ready');
    }).catch((error) => {
      console.error('[KAKAO MAP error]', error);
      setStatus('error');
      setMessage(error.message || '지도를 불러오지 못했습니다.');
    });

    return () => { cancelled = true; };
  }, [bookstores, userLocation, selectedId, onSelect, focusBookstore, mapKey]);

  return (
    <div className="map-frame">
      <div ref={ref} className={`kakao-map ${status === 'ready' ? 'visible' : ''}`} />
      {status !== 'ready' && (
        <div className="map-placeholder">
          <div className="map-grid" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="map-pin-demo">⌖</div>
          <strong>{status === 'missing' ? '지도 키를 연결해 주세요' : '지도 준비 중'}</strong>
          <p>{message}</p>
          {status === 'missing' && <code>VITE_KAKAO_MAP_KEY=...</code>}
        </div>
      )}
    </div>
  );
}
