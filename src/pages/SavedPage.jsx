import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BookstoreCard from '../components/BookstoreCard';
import { EmptyView } from '../components/StatusView';

export default function SavedPage() {
  const navigate = useNavigate();
  const { bookstores, userStates, updateUserState, removeUserState } = useApp();
  const [tab, setTab] = useState('favorite');
  const [editingId, setEditingId] = useState(null);
  const [draftMemo, setDraftMemo] = useState('');

  const list = useMemo(() => bookstores.filter((b) => tab === 'favorite' ? userStates[b.id]?.favorite : userStates[b.id]?.visited), [bookstores, userStates, tab]);
  const favCount = bookstores.filter((b) => userStates[b.id]?.favorite).length;
  const visitedCount = bookstores.filter((b) => userStates[b.id]?.visited).length;

  function beginEdit(bookstore) { setEditingId(bookstore.id); setDraftMemo(userStates[bookstore.id]?.memo || ''); }
  function saveEdit(id) { updateUserState(id, { memo: draftMemo }); setEditingId(null); }

  return (
    <div className="page saved-page">
      <header className="page-header"><div><p className="eyebrow">SAVED</p><h1>나의 책방</h1></div><button className="round-icon-button" onClick={() => navigate('/stats')} aria-label="통계">▥</button></header>
      <div className="saved-summary"><div><strong>{favCount}</strong><span>찜한 곳</span></div><div><strong>{visitedCount}</strong><span>방문한 곳</span></div></div>
      <div className="segmented-tabs"><button className={tab === 'favorite' ? 'active' : ''} onClick={() => setTab('favorite')}>♡ 찜한 곳 {favCount}</button><button className={tab === 'visited' ? 'active' : ''} onClick={() => setTab('visited')}>✓ 방문한 곳 {visitedCount}</button></div>

      {list.length === 0 && <EmptyView title={tab === 'favorite' ? '아직 찜한 서점이 없어요' : '아직 방문 기록이 없어요'} description="서점 상세에서 하트나 방문 완료 버튼을 눌러보세요." actionLabel="서점 찾기" onAction={() => navigate('/find')} />}
      <div className="saved-list">
        {list.map((bookstore) => {
          const state = userStates[bookstore.id] || {};
          return <div className="saved-item" key={bookstore.id}>
            <BookstoreCard bookstore={bookstore} horizontal />
            <div className="saved-meta">
              {editingId === bookstore.id ? <>
                <textarea value={draftMemo} onChange={(e) => setDraftMemo(e.target.value)} maxLength={300} placeholder="개인 메모" />
                <div className="saved-actions"><button className="text-button" onClick={() => setEditingId(null)}>취소</button><button className="primary-button small" onClick={() => saveEdit(bookstore.id)}>저장</button></div>
              </> : <>
                <p className={state.memo ? '' : 'muted'}>{state.memo || '아직 메모가 없어요.'}</p>
                <div className="saved-actions">
                  <button className="soft-button small" onClick={() => beginEdit(bookstore)}>메모 수정</button>
                  <button className={`soft-button small ${state.visited ? 'selected-soft' : ''}`} onClick={() => updateUserState(bookstore.id, { visited: !state.visited })}>{state.visited ? '방문 취소' : '방문 완료'}</button>
                  <button className="danger-text" onClick={() => {
                    if (window.confirm('이 서점의 찜·방문·메모 기록을 모두 삭제할까요?')) removeUserState(bookstore.id);
                  }}>기록 삭제</button>
                </div>
              </>}
            </div>
          </div>;
        })}
      </div>
    </div>
  );
}
