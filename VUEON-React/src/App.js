import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { detail, hasApiKey, homeData, search, trailer } from "./tmdb";

const Icon = ({ type }) => {
  const path = {
    search:"m21 21-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z",
    play:"M8 5v14l11-7z",
    info:"M12 17v-6m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    left:"m15 18-6-6 6-6",
    right:"m9 18 6-6-6-6"
  }[type];
  return <svg className={type === "play" ? "fill-icon" : ""} viewBox="0 0 24 24"><path d={path}/></svg>;
};

function Header({ session, onLogin, onLogout, onSearch, onSaved }) {
  const [scrolled,setScrolled] = useState(false);
  const [menu,setMenu] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    fn(); window.addEventListener("scroll",fn); return () => window.removeEventListener("scroll",fn);
  },[]);
  useEffect(() => {
    const fn = e => { if(ref.current && !ref.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown",fn); return () => document.removeEventListener("mousedown",fn);
  },[]);
  const initial = (session?.name || session?.email || "V").charAt(0).toUpperCase();
  return <header className={`header ${scrolled ? "scrolled":""}`}>
    <a className="brand" href="#top">VUEON</a>
    <nav className="desktop-nav">
      <a href="#top">홈</a><a href="#popular">영화</a><a href="#now">NEW</a>
      <button className="nav-link-btn" onClick={onSaved}>내가 찜한 콘텐츠</button>
    </nav>
    <div className="header-actions">
      <button className="icon-btn" onClick={onSearch} aria-label="검색"><Icon type="search"/></button>
      {!session ? <button className="login-link-btn" onClick={onLogin}>로그인</button> :
      <div className="profile-menu-wrap" ref={ref}>
        <button className="profile-btn" onClick={() => setMenu(v=>!v)}><span>{initial}</span><small>▾</small></button>
        <div className={`profile-menu ${menu ? "open":""}`}>
          <div className="profile-menu-user"><div className="profile-menu-avatar">{initial}</div><div><strong>{session.name}</strong><span>{session.email}</span></div></div>
          <button className="profile-menu-item" onClick={()=>{onSaved();setMenu(false)}}>찜한 콘텐츠</button>
          <button className="profile-menu-item danger" onClick={()=>{onLogout();setMenu(false)}}>로그아웃</button>
        </div>
      </div>}
    </div>
  </header>;
}

function Hero({movie,onOpen}) {
  const [video,setVideo] = useState(null);
  const [visible,setVisible] = useState(false);
  useEffect(() => {
    let alive = true, fadeTimer;
    setVideo(null); setVisible(false);
    if(!movie?.id) return;
    const timer = setTimeout(async()=>{
      try {
        const v = await trailer(movie.id);
        if(!alive || !v) return;
        setVideo(v);
        fadeTimer = setTimeout(()=> alive && setVisible(true),900);
      } catch(e) { console.warn(e); }
    },2200);
    return ()=>{alive=false;clearTimeout(timer);clearTimeout(fadeTimer)};
  },[movie?.id]);
  if(!movie) return null;
  const src = video ? `https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.key}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1` : "";
  return <section className="hero" id="top">
    {video && <div className={`hero-video ${visible ? "active":""}`}><iframe src={src} title={`${movie.title} 미리보기`} allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin"/></div>}
    <div className="hero-bg" style={{backgroundImage:movie.backdrop ? `url("${movie.backdrop}")`:undefined}}/>
    <div className="hero-overlay"/>
    <div className="hero-content">
      <p className="eyebrow"><span className="badge">V</span> VUEON ORIGINAL</p>
      <h1>{movie.title}</h1>
      <div className="hero-meta"><span className="match">{Math.max(70,Math.round(movie.rating*10))}% 일치</span><span>{movie.year}</span><span className="age">{movie.age}</span><span>★ {movie.rating.toFixed(1)}</span></div>
      <p className="hero-copy">{movie.overview}</p>
      <div className="hero-buttons"><button className="btn btn-primary" onClick={()=>onOpen(movie)}><Icon type="play"/>재생</button><button className="btn btn-secondary" onClick={()=>onOpen(movie)}><Icon type="info"/>상세 정보</button></div>
    </div>
  </section>;
}

function Card({movie,rank,saved,onOpen,onSave}) {
  return <article className={`card ${rank ? "rank-card":""}`} tabIndex="0" onClick={()=>onOpen(movie)} onKeyDown={e=>{if(e.key==="Enter"){onOpen(movie)}}}>
    {rank && <div className="rank-number">{rank}</div>}
    <div className="card-art" style={{backgroundImage:movie.backdrop?`url("${movie.backdrop}")`:movie.poster?`url("${movie.poster}")`:undefined}}>
      <div className="card-hover-panel">
        <div className="card-action-row"><button className="mini-circle primary" onClick={e=>{e.stopPropagation();onOpen(movie)}}><Icon type="play"/></button><button className={`mini-circle ${saved?"saved":""}`} onClick={e=>{e.stopPropagation();onSave(movie)}}>{saved?"✓":"+"}</button></div>
        <strong>{movie.title}</strong>
        <div className="card-meta"><span className="match">{Math.max(70,Math.round(movie.rating*10))}% 일치</span><span>★ {movie.rating.toFixed(1)}</span><span>{movie.year}</span></div>
        <span className="card-genre">{movie.genre}</span><p className="card-description">{movie.overview}</p>
      </div>
    </div>
  </article>;
}

function Row({section,saved,onOpen,onSave}) {
  const ref = useRef(null);
  const scroll = dir => ref.current?.scrollBy({left:dir*ref.current.clientWidth*.85,behavior:"smooth"});
  return <section className="row-section" id={section.key}><div className="section-heading"><h2>{section.title}</h2></div><div className="row-shell">
    <button className="row-arrow prev" onClick={()=>scroll(-1)}><Icon type="left"/></button>
    <div className="card-row" ref={ref}>{section.movies.map((m,i)=><Card key={`${section.key}-${m.id}`} movie={m} rank={section.type==="rank"?i+1:null} saved={saved.has(m.id)} onOpen={onOpen} onSave={onSave}/>)}</div>
    <button className="row-arrow next" onClick={()=>scroll(1)}><Icon type="right"/></button>
  </div></section>;
}

function VideoModal({ video, movieTitle, onClose }) {
  useEffect(() => {
    if (!video) return;

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [video, onClose]);

  if (!video) return null;

  const src =
    `https://www.youtube.com/embed/${video.key}` +
    `?autoplay=1&controls=1&rel=0&playsinline=1`;

  return (
    <div
      className="video-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="video-modal">
        <button
          className="video-modal-close"
          onClick={onClose}
          aria-label="영상 닫기"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" />
          </svg>
        </button>

        <div className="video-player">
          <iframe
            src={src}
            title={`${movieTitle} 예고편`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <div className="video-modal-info">
          <span>VUEON PREVIEW</span>
          <h3>{movieTitle}</h3>
          <p>{video.name || "공식 예고편"}</p>
        </div>
      </div>
    </div>
  );
}

function Modal({movie,saved,onClose,onSave}) {
  const [video, setVideo] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");

  useEffect(() => {
    if (!movie) return;

    const fn = (e) => {
      if (e.key === "Escape" && !videoOpen) onClose();
    };

    document.addEventListener("keydown", fn);
    document.body.classList.add("modal-open");

    return () => {
      document.removeEventListener("keydown", fn);
      document.body.classList.remove("modal-open");
    };
  }, [movie, onClose, videoOpen]);

  useEffect(() => {
    setVideo(null);
    setVideoOpen(false);
    setVideoError("");
    setVideoLoading(false);
  }, [movie?.id]);

  if (!movie) return null;

  const playTrailer = async () => {
    if (videoLoading) return;

    setVideoError("");
    setVideoLoading(true);

    try {
      const result = await trailer(movie.id);

      if (!result) {
        setVideoError("등록된 예고편이 없습니다.");
        return;
      }

      setVideo(result);
      setVideoOpen(true);
    } catch (error) {
      console.error("예고편 호출 오류:", error);
      setVideoError("예고편을 불러오지 못했습니다.");
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <>
      <div
        className="modal-backdrop"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <article className="modal">
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="상세 정보 닫기"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" />
            </svg>
          </button>

          <div
            className="modal-visual"
            style={{
              backgroundImage: movie.backdrop
                ? `url("${movie.backdrop}")`
                : movie.poster
                ? `url("${movie.poster}")`
                : undefined
            }}
          />

          <div className="modal-body">
            <div className="modal-title-row">
              <div>
                <p className="modal-kicker">VUEON FEATURE</p>
                <h2>{movie.title}</h2>
              </div>

              <button
                className={`circle-btn ${saved ? "saved" : ""}`}
                onClick={() => onSave(movie)}
                aria-label={saved ? "찜 해제" : "찜하기"}
              >
                {saved ? "✓" : "+"}
              </button>
            </div>

            <div className="modal-meta">
              <span className="match">
                {Math.max(70, Math.round(movie.rating * 10))}% 일치
              </span>
              <span>{movie.year}</span>
              <span>{movie.age}</span>
              <span>★ {movie.rating.toFixed(1)}</span>
              {movie.runtime && <span>{movie.runtime}</span>}
              <span>{movie.genre}</span>
            </div>

            <p className="modal-desc">{movie.overview}</p>

            <button
              className="btn btn-primary"
              onClick={playTrailer}
              disabled={videoLoading}
            >
              <Icon type="play"/>
              {videoLoading ? "불러오는 중..." : "재생"}
            </button>

            {videoError && (
              <p className="video-error">{videoError}</p>
            )}
          </div>
        </article>
      </div>

      {videoOpen && video && (
        <VideoModal
          video={video}
          movieTitle={movie.title}
          onClose={() => {
            setVideoOpen(false);
            setVideo(null);
          }}
        />
      )}
    </>
  );
}

function Search({open,onClose,onSearch,results,loading,onOpen}) {
  const [q,setQ]=useState("");
  useEffect(()=>{if(!open){setQ("");return}const t=setTimeout(()=>onSearch(q.trim()),350);return()=>clearTimeout(t)},[q,open,onSearch]);
  if(!open)return null;
  return <div className="search-overlay"><div className="search-box large"><Icon type="search"/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="제목을 검색해보세요"/><button onClick={onClose}>×</button></div>{!q?<p className="search-empty">영화 제목을 입력해주세요.</p>:loading?<p className="search-empty">검색 중...</p>:results.length?<div className="poster-grid">{results.map(m=><button className="poster" key={m.id} onClick={()=>{onOpen(m);onClose()}}><div className="poster-art" style={{backgroundImage:m.poster?`url("${m.poster}")`:undefined}}/><div className="poster-info"><strong>{m.title}</strong><span>{m.year} · ★ {m.rating.toFixed(1)}</span></div></button>)}</div>:<p className="search-empty">검색 결과가 없습니다.</p>}</div>;
}

function Auth({open,onClose,onLogin}) {
  const [mode,setMode]=useState("login"),[form,setForm]=useState({name:"",email:"",password:"",confirm:""}),[error,setError]=useState("");
  if(!open)return null;
  const users=()=>{try{return JSON.parse(localStorage.getItem("vueonUsers")||"[]")}catch{return[]}};
  const submit=e=>{e.preventDefault();setError("");if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))return setError("올바른 이메일 주소를 입력해주세요.");if(mode==="signup"){if(form.name.trim().length<2)return setError("이름을 2자 이상 입력해주세요.");if(form.password.length<8)return setError("비밀번호는 8자 이상 입력해주세요.");if(form.password!==form.confirm)return setError("비밀번호가 일치하지 않습니다.");const us=users();if(us.some(u=>u.email.toLowerCase()===form.email.toLowerCase()))return setError("이미 가입된 이메일입니다.");const user={name:form.name.trim(),email:form.email,password:form.password};localStorage.setItem("vueonUsers",JSON.stringify([...us,user]));onLogin({name:user.name,email:user.email});onClose();}else{const user=users().find(u=>u.email.toLowerCase()===form.email.toLowerCase()&&u.password===form.password);if(!user)return setError("이메일 또는 비밀번호가 올바르지 않습니다.");onLogin({name:user.name,email:user.email});onClose();}};
  const f=(k,v)=>setForm(s=>({...s,[k]:v}));
  return <div className="auth-screen"><div className="auth-bg"/><div className="auth-shade"/><header className="auth-header"><button className="auth-brand" onClick={onClose}>VUEON</button><button className="auth-close" onClick={onClose}>×</button></header><div className="auth-wrap"><div className="auth-card"><div className="auth-tabs"><button className={`auth-tab ${mode==="login"?"active":""}`} onClick={()=>setMode("login")}>로그인</button><button className={`auth-tab ${mode==="signup"?"active":""}`} onClick={()=>setMode("signup")}>회원가입</button></div><form className="auth-form" onSubmit={submit}><div className="auth-copy"><h2>{mode==="login"?"다시 만나서 반가워요.":"무제한 스트리밍을 시작하세요."}</h2><p>{mode==="login"?"VUEON 계정으로 로그인하고 감상을 이어보세요.":"간단한 정보만 입력하면 바로 VUEON을 이용할 수 있습니다."}</p></div>{mode==="signup"&&<label className="field"><span>이름</span><input value={form.name} onChange={e=>f("name",e.target.value)} placeholder="홍길동"/></label>}<label className="field"><span>이메일</span><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="name@example.com"/></label><label className="field"><span>비밀번호</span><input type="password" value={form.password} onChange={e=>f("password",e.target.value)} placeholder="8자 이상 입력"/></label>{mode==="signup"&&<label className="field"><span>비밀번호 확인</span><input type="password" value={form.confirm} onChange={e=>f("confirm",e.target.value)} placeholder="비밀번호 다시 입력"/></label>}{error&&<p className="auth-error">{error}</p>}<button className="auth-submit">{mode==="login"?"로그인":"회원가입"}</button><p className="auth-note">포트폴리오용 프론트엔드 데모입니다. 실제 서비스에서는 서버 인증과 암호화 저장이 필요합니다.</p></form></div></div></div>;
}

export default function App(){
  const [hero,setHero]=useState(null),[sections,setSections]=useState([]),[genreMap,setGenreMap]=useState({}),[loading,setLoading]=useState(true),[error,setError]=useState(""),[selected,setSelected]=useState(null),[saved,setSaved]=useState(()=>{try{return new Set(JSON.parse(localStorage.getItem("vueonSavedMovies")||"[]"))}catch{return new Set()}}),[session,setSession]=useState(()=>{try{return JSON.parse(localStorage.getItem("vueonSession")||"null")}catch{return null}}),[auth,setAuth]=useState(false),[searchOpen,setSearchOpen]=useState(false),[results,setResults]=useState([]),[searchLoading,setSearchLoading]=useState(false),[savedMode,setSavedMode]=useState(false);
  useEffect(()=>{let alive=true;(async()=>{if(!hasApiKey()){setError("TMDB_API_KEY_MISSING");setLoading(false);return}try{const data=await homeData();if(!alive)return;setHero(data.heroMovie);setSections(data.sections);setGenreMap(data.genreMap)}catch(e){if(alive)setError(e.message)}finally{if(alive)setLoading(false)}})();return()=>{alive=false}},[]);
  const openMovie=useCallback(async m=>{setSelected(m);try{setSelected(await detail(m.id,genreMap))}catch(e){console.warn(e)}},[genreMap]);
  const toggleSaved=useCallback(m=>setSaved(cur=>{const n=new Set(cur);n.has(m.id)?n.delete(m.id):n.add(m.id);localStorage.setItem("vueonSavedMovies",JSON.stringify([...n]));return n}),[]);
  const doSearch=useCallback(async q=>{if(!q){setResults([]);return}setSearchLoading(true);try{setResults(await search(q,genreMap))}catch{setResults([])}finally{setSearchLoading(false)}},[genreMap]);
  const savedMovies=useMemo(()=>{const map=new Map();sections.forEach(s=>s.movies.forEach(m=>map.set(m.id,m)));if(hero)map.set(hero.id,hero);return [...saved].map(id=>map.get(id)).filter(Boolean)},[sections,hero,saved]);
  const login=user=>{localStorage.setItem("vueonSession",JSON.stringify(user));setSession(user)};const logout=()=>{localStorage.removeItem("vueonSession");setSession(null)};
  const display=savedMode?[{key:"saved",title:"내가 찜한 콘텐츠",movies:savedMovies}]:sections;
  return <><Header session={session} onLogin={()=>setAuth(true)} onLogout={logout} onSearch={()=>setSearchOpen(true)} onSaved={()=>setSavedMode(true)}/><main>{!savedMode&&<Hero movie={hero} onOpen={openMovie}/>}<section className={`content-area ${savedMode?"saved-page":""}`}>{savedMode&&<div className="saved-toolbar"><button onClick={()=>setSavedMode(false)}>← 홈으로</button></div>}{loading?<div className="loading-state"><div className="loader"/><p>TMDB 영화 정보를 불러오는 중...</p></div>:error?<div className="api-error"><h2>TMDB API 키를 입력해주세요.</h2><p>루트에 <code>.env.local</code> 파일을 만들고 아래 값을 입력한 뒤 서버를 재시작하세요.</p><code>REACT_APP_TMDB_API_KEY=본인의_TMDB_V3_API_KEY</code></div>:savedMode&&!savedMovies.length?<div className="empty-saved"><h2>찜한 콘텐츠가 없습니다.</h2><p>영화 카드의 + 버튼을 눌러 저장해보세요.</p></div>:display.map(s=><Row key={s.key} section={s} saved={saved} onOpen={openMovie} onSave={toggleSaved}/>)}</section></main><footer className="footer"><div className="footer-links"><a href="#popular">인기 영화</a><a href="#comedy">코미디</a><a href="#romance">로맨스</a><a href="#horror">공포</a><a href="#documentary">다큐멘터리</a></div><p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p><p>© 2026 VUEON Entertainment. Portfolio demo.</p></footer><Modal movie={selected} saved={selected?saved.has(selected.id):false} onClose={()=>setSelected(null)} onSave={toggleSaved}/><Search open={searchOpen} onClose={()=>setSearchOpen(false)} onSearch={doSearch} results={results} loading={searchLoading} onOpen={openMovie}/><Auth open={auth} onClose={()=>setAuth(false)} onLogin={login}/></>;
}
