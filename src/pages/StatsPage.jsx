import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DataBanner from '../components/DataBanner';
import { buildRegionStats } from '../utils/stats';
import { ErrorView, LoadingView } from '../components/StatusView';

export default function StatsPage() {
  const navigate = useNavigate();
  const { bookstores, loading, error, retry, patchFilters } = useApp();
  const stats = useMemo(() => buildRegionStats(bookstores), [bookstores]);
  const total = bookstores.length;
  const rate = (field) => total ? Math.round((bookstores.filter((b) => b[field] === true).length / total) * 100) : 0;
  const max = Math.max(1, ...stats.map((s) => s.total));

  function drill(region) { patchFilters({ keyword:'', region, parking:false, independent:false, rental:false }); navigate('/find'); }

  return (
    <div className="page stats-page">
      <header className="page-header"><div><p className="eyebrow">DATA</p><h1>지역 통계</h1></div><button className="back-button top-back" onClick={() => navigate(-1)}>← 뒤로</button></header>
      <DataBanner />
      {loading && <LoadingView />}
      {error && <ErrorView message={error} onRetry={retry} />}
      {!loading && !error && <>
        <section className="stats-hero">
          <span>현재 불러온 데이터</span><strong>{total}<small>곳</small></strong><p>공공데이터를 지역·시설 기준으로 직접 집계했어요.</p>
        </section>
        <section className="rate-grid">
          <RateCard tone="blue" icon="P" label="주차 가능" rate={rate('parking')} />
          <RateCard tone="yellow" icon="✦" label="독립출판" rate={rate('independentPublishing')} />
          <RateCard tone="green" icon="↗" label="대여 가능" rate={rate('rental')} />
        </section>
        <section className="section-block">
          <div className="section-heading"><div><span className="section-kicker">REGION COUNT</span><h2>지역별 서점 수</h2></div></div>
          <div className="bar-list">
            {stats.map((row) => <button className="bar-row" key={row.region} onClick={() => drill(row.region)}>
              <span className="bar-region">{row.region}</span>
              <span className="bar-track"><i style={{ width:`${(row.total / max) * 100}%` }} /></span>
              <strong>{row.total}</strong>
            </button>)}
          </div>
          <p className="helper-text">지역 막대를 누르면 해당 지역이 적용된 서점 찾기 화면으로 이동합니다.</p>
        </section>
        <section className="section-block last-section">
          <div className="section-heading"><div><span className="section-kicker">DETAIL</span><h2>지역별 서비스 비율</h2></div></div>
          <div className="stats-table-wrap"><table className="stats-table"><thead><tr><th>지역</th><th>전체</th><th>주차</th><th>독립</th><th>대여</th></tr></thead><tbody>{stats.map((r) => <tr key={r.region}><td>{r.region}</td><td>{r.total}</td><td>{r.parkingRate}%</td><td>{r.independentRate}%</td><td>{r.rentalRate}%</td></tr>)}</tbody></table></div>
        </section>
      </>}
    </div>
  );
}

function RateCard({ tone, icon, label, rate }) {
  return <article className={`rate-card ${tone}`}><span>{icon}</span><small>{label}</small><strong>{rate}<i>%</i></strong><div className="rate-track"><b style={{ width:`${rate}%` }} /></div></article>;
}
