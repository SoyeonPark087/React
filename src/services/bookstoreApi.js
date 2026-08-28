import { mockBookstores } from '../data/mockBookstores';
import { normalizeBookstore, recordNodeToObject } from '../utils/normalize';

const API_URL = import.meta.env.VITE_PUBLIC_DATA_API_URL?.trim();
const SERVICE_KEY = import.meta.env.VITE_PUBLIC_DATA_SERVICE_KEY?.trim();
const KEY_PARAM = import.meta.env.VITE_PUBLIC_DATA_KEY_PARAM?.trim() || 'serviceKey';
const EXTRA_PARAMS = import.meta.env.VITE_PUBLIC_DATA_EXTRA_PARAMS?.trim();
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_WHEN_UNCONFIGURED ?? 'true') !== 'false';

function isConfigured() {
  return Boolean(API_URL && !API_URL.includes('YOUR_OPEN_API_ENDPOINT'));
}

function buildRequestUrl() {
  const url = new URL(API_URL);
  if (SERVICE_KEY && !SERVICE_KEY.includes('YOUR_SERVICE_KEY')) {
    let key = SERVICE_KEY;
    try { key = decodeURIComponent(SERVICE_KEY); } catch { /* already decoded */ }
    url.searchParams.set(KEY_PARAM, key);
  }
  if (EXTRA_PARAMS) {
    new URLSearchParams(EXTRA_PARAMS).forEach((value, key) => url.searchParams.set(key, value));
  }
  return url.toString();
}

function parseXml(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) throw new Error('XML 파싱에 실패했습니다. API 응답 형식을 확인해 주세요.');

  const candidates = ['item', 'Item', 'ITEM', 'row', 'Row', 'ROW', 'record', 'Record', 'RECORD', 'data', 'Data', 'DATA'];
  let nodes = [];
  for (const selector of candidates) {
    nodes = Array.from(doc.getElementsByTagName(selector));
    if (nodes.length) break;
  }

  if (!nodes.length) {
    const root = doc.documentElement;
    const childGroups = Array.from(root.children || []).filter((node) => node.children?.length > 1);
    const repeated = childGroups.find((node) => Array.from(node.children).every((c) => c.tagName === node.children[0]?.tagName));
    if (repeated) nodes = Array.from(repeated.children);
  }

  return nodes.map(recordNodeToObject).filter((record) => Object.keys(record).length);
}

export async function fetchBookstores() {
  if (!isConfigured()) {
    if (!USE_MOCK) throw new Error('공공데이터 API URL이 설정되지 않았습니다. .env를 확인해 주세요.');
    console.info('[BOOKCAFE API] API 미설정 → 샘플 데이터 모드', mockBookstores.length);
    return { items: mockBookstores, mode: 'sample', rawCount: mockBookstores.length };
  }

  const requestUrl = buildRequestUrl();
  const safeUrl = new URL(requestUrl);
  if (SERVICE_KEY && !SERVICE_KEY.includes('YOUR_SERVICE_KEY')) safeUrl.searchParams.set(KEY_PARAM, '***');
  console.log('[BOOKCAFE API request]', safeUrl.toString());

  const response = await fetch(requestUrl);
  console.log('[BOOKCAFE API status]', response.status, response.statusText);
  if (!response.ok) throw new Error(`공공데이터 API 요청 실패 (HTTP ${response.status})`);

  const xmlText = await response.text();
  console.log('[BOOKCAFE API raw]', xmlText.slice(0, 500));

  const records = parseXml(xmlText);
  const normalized = records.map(normalizeBookstore).filter((item) => item.name && item.address);
  console.log('[BOOKCAFE API parsed]', normalized.length, normalized.slice(0, 3));

  if (!normalized.length) throw new Error('API 응답은 받았지만 서점 항목을 찾지 못했습니다. XML 태그 매핑을 확인해 주세요.');
  return { items: normalized, mode: 'api', rawCount: records.length };
}
