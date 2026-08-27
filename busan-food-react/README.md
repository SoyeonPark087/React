# 부산 공식 맛집 가이드 — React + Vite

동일 PRD를 기준으로 만든 React 버전입니다.

배포 목표:

```text
https://soyeonpark087.github.io/React/
```

그래서 `vite.config.js`는 `base: "/React/"`로 설정되어 있습니다.

## 구현 기능

- React + Vite
- 한국어 / English
- 부산맛집 국문 `getFoodKr`
- 부산맛집 영문 `getFoodEn`
- `UC_SEQ` 기준 국문/영문 병합
- 통합 검색
- 구·군 필터
- 현재 위치 기반 거리순
- Kakao Maps JavaScript API
- 카카오맵 Marker / 현재 위치
- 카카오맵 길찾기
- 전화 / 공유
- 찜 / 최근 본 맛집
- localStorage
- GitHub Pages 자동 배포 workflow

## API Key 입력

`src/config.js`에서 아래 두 값만 수정하세요.

```javascript
KAKAO_JAVASCRIPT_KEY: "YOUR_KAKAO_JAVASCRIPT_KEY",
PUBLIC_DATA_SERVICE_KEY: "YOUR_PUBLIC_DATA_SERVICE_KEY",
```

공공데이터는 연습과제용으로 브라우저에서 직접 호출합니다.

## 로컬 실행

Node.js 설치 후:

```bash
npm install
npm run dev
```

기본 주소:

```text
http://localhost:5173
```

## Kakao Developers 등록

개발용:

```text
http://localhost:5173
```

GitHub Pages 운영용 origin:

```text
https://soyeonpark087.github.io
```

배포 페이지 자체 주소:

```text
https://soyeonpark087.github.io/React/
```

## GitHub Pages 배포

Repository 이름을 `React`로 사용하고 프로젝트를 repository root에 올리는 기준입니다.

GitHub:

```text
Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동 실행됩니다.

## Git 업로드 예시

```bash
git init
git add .
git commit -m "Create Busan food React app"
git branch -M main
git remote add origin https://github.com/soyeonpark087/React.git
git push -u origin main
```

이미 repository가 연결되어 있다면:

```bash
git add .
git commit -m "Update Busan food React app"
git push
```

## 프로젝트 구조

```text
src/
├─ components/
│  ├─ BottomNav.jsx
│  ├─ DetailModal.jsx
│  ├─ Header.jsx
│  ├─ KakaoMap.jsx
│  ├─ RestaurantCard.jsx
│  └─ RestaurantList.jsx
├─ hooks/
│  └─ useGeolocation.js
├─ services/
│  ├─ kakaoMap.js
│  └─ publicData.js
├─ utils/
│  ├─ geo.js
│  └─ storage.js
├─ App.jsx
├─ config.js
├─ i18n.js
├─ main.jsx
└─ styles.css
```

## PRD 데이터 매핑

```text
UC_SEQ                  → id
MAIN_TITLE / PLACE      → name
GUGUN_NM                → district
LAT / LNG               → 지도 / 주변 맛집
ADDR1 / ADDR2           → address
CNTCT_TEL               → 전화
USAGE_DAY_WEEK_AND_TIME → hours
RPRSNTV_MENU            → 대표메뉴
ITEMCNTNTS               → 상세설명
MAIN_IMG_NORMAL          → 상세 이미지
MAIN_IMG_THUMB           → 목록 이미지
```

## 참고

공공데이터 API가 GitHub Pages의 브라우저 직접 호출을 CORS 정책으로 막는 경우에는 프록시/백엔드가 필요할 수 있습니다. 과제용 직접 호출 구조는 그대로 두었습니다.
