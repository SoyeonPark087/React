# 책쉼표 · BOOK + CAFE

공공데이터포털의 **한국문화정보원_카페가 있는 서점데이터**를 기반으로 전국의 카페 서점을 검색·필터·지도·상세정보로 탐색하는 React 웹 앱입니다.

## 1. 실행

```bash
npm install
npm run dev
```

배포용 빌드 확인:

```bash
npm run build
npm run preview
```

## 2. API 키 설정

프로젝트 루트의 `.env.example`을 복사하여 `.env`를 만듭니다.

```bash
cp .env.example .env
```

### 공공데이터

```env
VITE_PUBLIC_DATA_API_URL=https://실제_API_URL
VITE_PUBLIC_DATA_SERVICE_KEY=발급받은_인증키
VITE_PUBLIC_DATA_KEY_PARAM=serviceKey
VITE_PUBLIC_DATA_EXTRA_PARAMS=pageNo=1&numOfRows=1000
```

- `VITE_PUBLIC_DATA_API_URL`: 공공데이터포털 활용신청 후 확인되는 실제 호출 URL
- `VITE_PUBLIC_DATA_SERVICE_KEY`: 인증키가 필요한 API일 때 입력
- `VITE_PUBLIC_DATA_KEY_PARAM`: 인증키 query parameter 이름이 다르면 변경
- `VITE_PUBLIC_DATA_EXTRA_PARAMS`: API 문서의 페이지/행수 등 추가 파라미터

> API URL과 키가 비어 있으면 기본값으로 **샘플 데이터 모드**가 실행됩니다. 제출 전에는 반드시 실제 API 응답으로 확인하세요.

### Kakao 지도

```env
VITE_KAKAO_MAP_KEY=카카오_JavaScript_키
```

카카오 개발자 콘솔에서 **JavaScript 키**와 실행 도메인을 설정한 뒤 입력하면 지도 화면이 활성화됩니다. 키가 없더라도 앱의 검색/필터/상세/찜/통계 기능은 동작하며 지도 자리에는 설정 안내가 표시됩니다.

## 3. 실제 XML 태그가 다를 때

공공데이터 API마다 XML 태그명이 다를 수 있습니다. `src/utils/normalize.js`의 `alias` 객체에 실제 태그명을 추가하면 됩니다.

예시:

```js
const alias = {
  name: ['name', 'FCLTY_NM', '실제서점명태그'],
  address: ['address', 'ADDR', '실제주소태그'],
  lat: ['lat', 'LATITUDE', '실제위도태그'],
  lng: ['lng', 'LONGITUDE', '실제경도태그'],
};
```

API 레코드 노드가 `item`, `row`, `record`, `data`가 아니라면 `src/services/bookstoreApi.js`의 `candidates` 배열에 실제 노드명을 추가합니다.

## 4. 평가용 Console 증빙

실제 API가 연결되면 새로고침 시 개발자도구 Console에 다음이 출력됩니다.

```text
[BOOKCAFE API request] ...
[BOOKCAFE API status] 200 OK
[BOOKCAFE API raw] <XML 앞부분 ...>
[BOOKCAFE API parsed] N [정규화 샘플 3개]
```

인증키는 Console의 요청 URL에서 `***`로 가려집니다.

## 5. 구현 화면

1. **홈** — 통합 검색, 빠른 필터, 지역 탐색, 추천 카드
2. **서점 찾기** — 상호명/주소/지역 검색, 지역·주차·독립출판·대여 다중 필터, 정렬
3. **지도** — 필터 결과 마커, 현재 위치, 거리, 마커 선택 상세 연결
4. **서점 상세** — 운영시간, 휴무, 전화, 주소, 시설, 지도, 찜·방문·메모
5. **나의 책방** — 찜/방문 목록, 메모 수정, 개인 기록 삭제
6. **지역 통계** — 지역별 개수, 주차/독립출판/대여 비율, 지역 드릴다운

## 6. 데이터 처리

- XML `fetch()` → `DOMParser`
- raw XML Console 확인
- `Bookstore` 표준 객체로 정규화
- Boolean/좌표/지역/전화번호 정제
- 검색 + AND 다중 필터
- Haversine 현재 위치 거리 계산
- `reduce` 기반 지역 통계
- 찜·방문·메모는 공공데이터와 분리하여 `localStorage`에 저장

## 7. 오류 처리

- API 미설정 → 샘플 데이터 모드
- API HTTP 오류 → 오류 화면 + 재시도
- XML 파싱/매핑 실패 → 오류 메시지
- 검색 결과 없음 → 필터 초기화 CTA
- 위치 권한 거부 → 거리 기능만 제한, 나머지 앱 유지
- 좌표 누락 → 목록/상세 유지, 지도에서만 제외
- 지도 키 누락 → 지도 설정 안내, 다른 기능 정상 유지

## 8. 중요 파일

```text
src/
  pages/       HomePage, SearchPage, MapPage, DetailPage, SavedPage, StatsPage
  components/  BottomNav, SearchBar, FilterPanel, BookstoreCard, KakaoMap ...
  context/     AppContext.jsx
  services/    bookstoreApi.js
  utils/       normalize.js, distance.js, stats.js
  data/        mockBookstores.js
```

## 제출 전

`TEST_CHECKLIST.md`의 항목을 실제 API + 모바일 화면에서 모두 확인하는 것을 권장합니다.

## 9. UI 조정 사항

- 원본 OpenAPI에 서점 이미지 필드가 없다는 전제로 목록/상세의 큰 이미지 영역을 사용하지 않습니다.
- 서점 카드는 지역·주소·운영시간·휴무일·시설 배지를 중심으로 표시하고, 서점별 컬러 포인트는 장식 용도로만 사용합니다.
- 지도 첫 진입 시 전국 데이터의 `fitBounds` 결과가 과도하게 축소되지 않도록 최대 초기 축소 레벨을 제한합니다. 지역 필터를 적용하면 해당 결과 범위는 그대로 자동 맞춤됩니다.
