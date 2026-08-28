export const mockBookstores = [
  { id:'sample-seoul-1', name:'페이지온 북카페', category:'북카페 서점', description:'책과 커피를 함께 즐기는 도심형 샘플 서점입니다.', address:'서울특별시 마포구 월드컵로 12', phone:'02-000-1001', lat:37.5565, lng:126.9102, hours:'10:00 ~ 21:00', closedDays:'매주 월요일', parking:true, restroom:'남녀 구분', rental:false, independentPublishing:true, naverReview:true, registeredAt:'2026-01-12' },
  { id:'sample-seoul-2', name:'모닝페이지', category:'독립서점 · 카페', description:'조용한 좌석과 독립출판물 코너가 있는 샘플 공간입니다.', address:'서울특별시 종로구 자하문로 31', phone:'02-000-1002', lat:37.5796, lng:126.9708, hours:'11:00 ~ 20:00', closedDays:'화요일', parking:false, restroom:'공용', rental:true, independentPublishing:true, naverReview:true, registeredAt:'2026-02-08' },
  { id:'sample-gyeonggi-1', name:'느린문장', category:'서점 · 카페', description:'산책 후 쉬어가기 좋은 샘플 북카페입니다.', address:'경기도 수원시 팔달구 행궁로 25', phone:'031-000-1101', lat:37.2831, lng:127.0166, hours:'10:30 ~ 20:30', closedDays:'수요일', parking:true, restroom:'남녀 구분', rental:true, independentPublishing:false, naverReview:false, registeredAt:'2026-03-03' },
  { id:'sample-gyeonggi-2', name:'북앤빈', category:'북카페', description:'넓은 주차 공간과 열람석을 갖춘 샘플 서점입니다.', address:'경기도 파주시 회동길 54', phone:'031-000-1102', lat:37.7124, lng:126.6879, hours:'10:00 ~ 19:00', closedDays:'연중무휴', parking:true, restroom:'남녀 구분', rental:false, independentPublishing:true, naverReview:true, registeredAt:'2026-03-20' },
  { id:'sample-busan-1', name:'파도책방', category:'독립서점 · 카페', description:'바다 산책과 함께 들르기 좋은 샘플 서점입니다.', address:'부산광역시 수영구 광안해변로 145', phone:'051-000-1201', lat:35.1532, lng:129.1187, hours:'11:00 ~ 22:00', closedDays:'월요일', parking:false, restroom:'공용', rental:true, independentPublishing:true, naverReview:true, registeredAt:'2026-04-11' },
  { id:'sample-busan-2', name:'책의온도', category:'서점 · 카페', description:'지역 작가 큐레이션을 선보이는 샘플 공간입니다.', address:'부산광역시 동구 중앙대로 221', phone:'051-000-1202', lat:35.1152, lng:129.0401, hours:'09:30 ~ 20:00', closedDays:'일요일', parking:true, restroom:'남녀 구분', rental:false, independentPublishing:false, naverReview:false, registeredAt:'2026-05-01' },
  { id:'sample-jeju-1', name:'귤빛문고', category:'독립서점 · 카페', description:'제주 여행 중 쉬어가기 좋은 샘플 서점입니다.', address:'제주특별자치도 제주시 애월읍 애월해안로 18', phone:'064-000-1301', lat:33.4622, lng:126.3097, hours:'10:00 ~ 19:00', closedDays:'목요일', parking:true, restroom:'남녀 구분', rental:true, independentPublishing:true, naverReview:true, registeredAt:'2026-05-17' },
  { id:'sample-jeju-2', name:'오후의책장', category:'북카페', description:'창가 좌석이 매력적인 샘플 북카페입니다.', address:'제주특별자치도 서귀포시 중문관광로 72', phone:'064-000-1302', lat:33.2507, lng:126.4127, hours:'11:00 ~ 20:00', closedDays:'수요일', parking:true, restroom:'공용', rental:false, independentPublishing:false, naverReview:true, registeredAt:'2026-06-03' },
  { id:'sample-daegu-1', name:'문장수집소', category:'독립서점 · 카페', description:'작은 전시와 독립출판물을 만나는 샘플 공간입니다.', address:'대구광역시 중구 동성로 14', phone:'053-000-1401', lat:35.8692, lng:128.5967, hours:'12:00 ~ 21:00', closedDays:'화요일', parking:false, restroom:'공용', rental:true, independentPublishing:true, naverReview:false, registeredAt:'2026-06-20' },
  { id:'sample-daejeon-1', name:'한쪽서가', category:'서점 · 카페', description:'과학도시의 차분한 분위기를 담은 샘플 서점입니다.', address:'대전광역시 유성구 대학로 86', phone:'042-000-1501', lat:36.3619, lng:127.3447, hours:'10:00 ~ 21:00', closedDays:'연중무휴', parking:true, restroom:'남녀 구분', rental:true, independentPublishing:false, naverReview:true, registeredAt:'2026-07-04' },
  { id:'sample-gwangju-1', name:'빛고을책차', category:'북카페', description:'지역 문화 큐레이션이 있는 샘플 북카페입니다.', address:'광주광역시 동구 문화전당로 38', phone:'062-000-1601', lat:35.1468, lng:126.9199, hours:'10:30 ~ 20:30', closedDays:'월요일', parking:false, restroom:'공용', rental:false, independentPublishing:true, naverReview:false, registeredAt:'2026-07-19' },
  { id:'sample-gangwon-1', name:'숲속문장', category:'서점 · 카페', description:'여행길에 잠시 쉬며 책을 읽는 샘플 공간입니다.', address:'강원특별자치도 강릉시 경강로 2115', phone:'033-000-1701', lat:37.7544, lng:128.8982, hours:'09:00 ~ 19:00', closedDays:'목요일', parking:true, restroom:'남녀 구분', rental:false, independentPublishing:true, naverReview:true, registeredAt:'2026-08-02' }
].map((item) => ({
  ...item,
  shortRegion: item.address.startsWith('서울') ? '서울'
    : item.address.startsWith('경기') ? '경기'
    : item.address.startsWith('부산') ? '부산'
    : item.address.startsWith('대구') ? '대구'
    : item.address.startsWith('광주') ? '광주'
    : item.address.startsWith('대전') ? '대전'
    : item.address.startsWith('제주') ? '제주'
    : item.address.startsWith('강원') ? '강원' : '기타',
  phoneLink: item.phone ? item.phone.replace(/[^0-9+]/g, '') : null,
  source: 'sample',
}));
