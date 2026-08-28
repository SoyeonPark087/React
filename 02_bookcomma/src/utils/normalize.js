const trim = (value) => {
  if (value == null) return null;
  const next = String(value).replace(/\s+/g, ' ').trim();
  return next || null;
};

const alias = {
  name: ['name','title','storename','bookstorename','facilityname','fcltynm','fclty_name','상호명','시설명','서점명'],
  id: ['id','idx','seq','contentid','facilityid','fcltyid','고유번호','관리번호'],
  category: ['category','category1','category2','category3','subjectcategory','type','classification','classtype','분류','유형'],
  description: ['description','subdescription','desc','intro','guide','information','안내','소개'],
  address: ['address','addr','roadaddress','road_addr','location','주소','소재지'],
  phone: ['phone','tel','telephone','contact','전화번호','연락처'],
  lat: ['lat','latitude','y','위도','시설물위도'],
  lng: ['lng','lon','long','longitude','x','경도','시설물경도'],
  hours: ['hours','opentime','operatinghours','businesshours','운영시간','영업시간'],
  closedDays: ['closeddays','closedday','holiday','휴무일','휴관일'],
  parking: ['parking','parkingyn','parkingavailable','주차','주차가능여부'],
  restroom: ['restroom','toilet','화장실','화장실구분'],
  rental: ['rental','rentalyn','rent','대여','대여서비스'],
  independentPublishing: ['independentpublishing','independent','indiepublication','독립출판물','독립출판물취급'],
  naverReview: ['naverreview','review','reviewyn','네이버리뷰','네이버리뷰제공여부'],
  registeredAt: ['registeredat','regdate','createdat','issueddate','등록일','등록일자']
};

function canonicalKey(key) {
  return String(key).toLowerCase().replace(/[\s_\-:.]/g, '');
}

export function recordNodeToObject(node) {
  const object = {};
  Array.from(node.children || []).forEach((child) => {
    object[child.tagName] = trim(child.textContent);
  });
  return object;
}

function pick(record, keys) {
  const entries = Object.entries(record);
  for (const candidate of keys) {
    const ck = canonicalKey(candidate);
    const found = entries.find(([key]) => canonicalKey(key) === ck);
    if (found && trim(found[1]) != null) return trim(found[1]);
  }
  return null;
}

export function normalizeBoolean(value) {
  const text = trim(value)?.toLowerCase();
  if (!text) return null;
  const trueValues = ['y','yes','true','1','가능','있음','유','제공','운영','사용가능','o','○'];
  const falseValues = ['n','no','false','0','불가','없음','무','미제공','미운영','사용불가','x','×'];
  if (trueValues.some((v) => text === v || text.includes(v))) return true;
  if (falseValues.some((v) => text === v || text.includes(v))) return false;
  return null;
}

function normalizeCoordinate(value, type) {
  const cleaned = trim(value);
  if (!cleaned) return null;
  const number = Number(String(cleaned).replace(/,/g, ''));
  if (!Number.isFinite(number)) return null;
  if (type === 'lat' && (number < -90 || number > 90)) return null;
  if (type === 'lng' && (number < -180 || number > 180)) return null;
  return number;
}

const regionMap = [
  ['서울특별시', '서울'],
  ['서울', '서울'],

  ['경기도', '경기'],
  ['경기', '경기'],

  ['부산광역시', '부산'],
  ['부산', '부산'],

  ['대구광역시', '대구'],
  ['대구', '대구'],

  ['인천광역시', '인천'],
  ['인천', '인천'],

  ['광주광역시', '광주'],
  ['광주', '광주'],

  ['대전광역시', '대전'],
  ['대전', '대전'],

  ['울산광역시', '울산'],
  ['울산', '울산'],

  ['세종특별자치시', '세종'],
  ['세종', '세종'],

  ['강원특별자치도', '강원'],
  ['강원도', '강원'],
  ['강원', '강원'],

  ['충청북도', '충북'],
  ['충북', '충북'],

  ['충청남도', '충남'],
  ['충남', '충남'],

  ['전북특별자치도', '전북'],
  ['전라북도', '전북'],
  ['전북', '전북'],

  ['전라남도', '전남'],
  ['전남', '전남'],

  ['경상북도', '경북'],
  ['경북', '경북'],

  ['경상남도', '경남'],
  ['경남', '경남'],

  ['제주특별자치도', '제주'],
  ['제주', '제주'],
];


function parseCombinedCoordinates(value) {
  const text = trim(value);
  if (!text) return { lat: null, lng: null };
  const numbers = (text.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
  if (numbers.length < 2) return { lat: null, lng: null };
  const [a, b] = numbers;
  // 국내 API는 대체로 "경도,위도" 또는 "위도,경도" 형식이다.
  if (Math.abs(a) > 90 && Math.abs(b) <= 90) return { lat: normalizeCoordinate(b, 'lat'), lng: normalizeCoordinate(a, 'lng') };
  if (Math.abs(b) > 90 && Math.abs(a) <= 90) return { lat: normalizeCoordinate(a, 'lat'), lng: normalizeCoordinate(b, 'lng') };
  // 둘 다 범위 안이면 한국의 전형적 범위를 힌트로 사용한다.
  if (a >= 124 && a <= 132 && b >= 32 && b <= 40) return { lat: b, lng: a };
  if (b >= 124 && b <= 132 && a >= 32 && a <= 40) return { lat: a, lng: b };
  return { lat: normalizeCoordinate(a, 'lat'), lng: normalizeCoordinate(b, 'lng') };
}

function extractLabeledText(text, labels) {
  const source = trim(text);
  if (!source) return null;
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = source.match(new RegExp(`${escaped}\\s*[:：-]?\\s*([^|/\\n,;]{1,80})`, 'i'));
    if (match?.[1]) return trim(match[1]);
  }
  return null;
}

function pickBooleanWithFallback(record, keys, description, labels) {
  const direct = normalizeBoolean(pick(record, keys));
  if (direct !== null) return direct;
  const inferred = extractLabeledText(description, labels);
  return normalizeBoolean(inferred);
}

export function extractRegion(address) {
  let text = trim(address) || '';

  // 앞에 붙은 우편번호 제거
  // 예: "(03988) 서울 마포구 ..." → "서울 마포구 ..."
  text = text.replace(/^\(\d{5}\)\s*/, '');

  // 괄호 없이 들어온 우편번호도 제거
  // 예: "03988 서울 마포구 ..." → "서울 마포구 ..."
  text = text.replace(/^\d{5}\s+/, '');

  const found = regionMap.find(([name]) =>
    text.startsWith(name) ||
    text.includes(` ${name} `) ||
    text.includes(`${name} `)
  );

  if (found) return found[1];

  return '기타';
}

function createStableId(name, address) {
  const source = `${name || 'unknown'}|${address || 'unknown'}`;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  return `bookstore-${Math.abs(hash)}`;
}

export function normalizeBookstore(record) {
  const name = pick(record, alias.name) || '이름 정보 없음';
  const address = pick(record, alias.address) || '주소 정보 없음';
  const description = pick(record, alias.description);
  const extraDescription = pick(record, ['subDescription','sub_description','details','detail','상세안내','상세정보']);
  const detailText = [description, extraDescription].filter(Boolean).join(' | ');
  const combined = parseCombinedCoordinates(pick(record, ['coordinates','coordinate','coords','시설물좌표','좌표']));
  const lat = normalizeCoordinate(pick(record, alias.lat), 'lat') ?? combined.lat;
  const lng = normalizeCoordinate(pick(record, alias.lng), 'lng') ?? combined.lng;
  const phone = pick(record, alias.phone);
  const hours = pick(record, alias.hours) || extractLabeledText(detailText, ['운영시간','영업시간','오픈시간']);
  const closedDays = pick(record, alias.closedDays) || extractLabeledText(detailText, ['휴무일','휴관일']);
  const restroom = pick(record, alias.restroom) || extractLabeledText(detailText, ['화장실','화장실 구분']);
  return {
    id: pick(record, alias.id) || createStableId(name, address),
    name,
    category: pick(record, alias.category) || '카페가 있는 서점',
    description,
    address,
    shortRegion: extractRegion(address),
    phone,
    phoneLink: phone ? String(phone).replace(/[^0-9+]/g, '') : null,
    lat,
    lng,
    hours,
    closedDays,
    parking: pickBooleanWithFallback(record, alias.parking, detailText, ['주차 가능 여부','주차여부','주차']),
    restroom,
    rental: pickBooleanWithFallback(record, alias.rental, detailText, ['대여 서비스','대여여부','대여']),
    independentPublishing: pickBooleanWithFallback(record, alias.independentPublishing, detailText, ['독립출판물 취급 여부','독립출판물','독립출판']),
    naverReview: pickBooleanWithFallback(record, alias.naverReview, detailText, ['네이버 리뷰 제공 여부','네이버리뷰','리뷰']),
    registeredAt: pick(record, alias.registeredAt),
    source: 'api',
    raw: record,
  };
}
