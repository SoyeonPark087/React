import React from 'react';
import { useApp } from '../context/AppContext';

export default function DataBanner() {
  const { dataMode, bookstores } = useApp();
  if (dataMode === 'sample') {
    return (
      <div className="demo-banner" role="status">
        <span>DEMO</span>
        API 키를 넣기 전이라 샘플 데이터를 표시 중이에요.
      </div>
    );
  }
  if (dataMode === 'api') {
    return (
      <div className="demo-banner live-banner" role="status">
        <span>LIVE</span>
        공공데이터 API 연결됨 · {bookstores.length}곳
      </div>
    );
  }
  return null;
}
