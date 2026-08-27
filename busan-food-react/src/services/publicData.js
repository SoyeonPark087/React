import { APP_CONFIG } from "../config";

function normalizeServiceKey(key) {
  const value = String(key || "").trim();
  if (value.includes("%")) return value;
  return encodeURIComponent(value);
}

function buildUrl(endpoint, pageNo) {
  return (
    `${APP_CONFIG.PUBLIC_DATA_BASE_URL}/${endpoint}` +
    `?serviceKey=${normalizeServiceKey(APP_CONFIG.PUBLIC_DATA_SERVICE_KEY)}` +
    `&numOfRows=${APP_CONFIG.PUBLIC_DATA_ROWS_PER_PAGE}` +
    `&pageNo=${pageNo}` +
    `&resultType=json`
  );
}

function looksLikeRestaurant(item) {
  return item &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    (
      "UC_SEQ" in item ||
      "MAIN_TITLE" in item ||
      "GUGUN_NM" in item ||
      "ADDR1" in item ||
      "LAT" in item ||
      "LNG" in item
    );
}

function findErrorInfo(node) {
  if (!node || typeof node !== "object") return null;

  const code =
    node.resultCode ??
    node.returnReasonCode ??
    node.returnAuthMsgCode ??
    node.cmmMsgHeader?.returnReasonCode;

  const message =
    node.resultMsg ??
    node.errMsg ??
    node.returnAuthMsg ??
    node.cmmMsgHeader?.returnAuthMsg;

  if (code != null && String(code) !== "" && String(code) !== "00") {
    return { code: String(code), message: String(message || "") };
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === "object") {
      const found = findErrorInfo(value);
      if (found) return found;
    }
  }
  return null;
}

function findRestaurantArray(node) {
  if (!node) return null;

  if (Array.isArray(node)) {
    if (node.some(looksLikeRestaurant)) return node;
    for (const child of node) {
      const found = findRestaurantArray(child);
      if (found) return found;
    }
    return null;
  }

  if (typeof node === "object") {
    const candidates = [
      node?.response?.body?.items?.item,
      node?.response?.body?.items,
      node?.body?.items?.item,
      node?.body?.items,
      node?.items?.item,
      node?.items,
      node?.item,
      node?.getFoodKr?.item,
      node?.getFoodKr?.items,
      node?.getFoodEn?.item,
      node?.getFoodEn?.items
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate) && candidate.some(looksLikeRestaurant)) return candidate;
      if (looksLikeRestaurant(candidate)) return [candidate];
    }

    for (const value of Object.values(node)) {
      const found = findRestaurantArray(value);
      if (found) return found;
    }
  }

  return null;
}

function findTotalCount(node) {
  if (!node || typeof node !== "object") return null;

  for (const key of ["totalCount", "TOTAL_COUNT", "total_count"]) {
    if (key in node && node[key] != null && node[key] !== "") {
      const value = Number(node[key]);
      if (Number.isFinite(value)) return value;
    }
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === "object") {
      const found = findTotalCount(value);
      if (found != null) return found;
    }
  }
  return null;
}

function extractJsonPayload(data) {
  const error = findErrorInfo(data);
  if (error) throw new Error(`${error.code} ${error.message}`.trim());

  const items = findRestaurantArray(data) || [];
  const totalCount = findTotalCount(data) ?? items.length;
  return { items, totalCount };
}

function xmlToObject(text) {
  const xml = new DOMParser().parseFromString(text, "application/xml");

  if (xml.querySelector("parsererror")) {
    throw new Error("Invalid XML response");
  }

  const resultCode = xml.querySelector("resultCode")?.textContent?.trim() || "";
  const resultMsg = xml.querySelector("resultMsg")?.textContent?.trim() || "";

  if (resultCode && resultCode !== "00") {
    throw new Error(`${resultCode} ${resultMsg}`.trim());
  }

  const items = [...xml.querySelectorAll("item")].map((item) => {
    const object = {};
    [...item.children].forEach((child) => {
      object[child.tagName] = child.textContent?.trim() || "";
    });
    return object;
  });

  const totalCount = Number(xml.querySelector("totalCount")?.textContent || items.length);
  return { items, totalCount };
}

async function fetchPage(endpoint, pageNo) {
  const response = await fetch(buildUrl(endpoint, pageNo));

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = (await response.text()).trim();
  if (!text) return { items: [], totalCount: 0 };

  if (text.startsWith("{") || text.startsWith("[")) {
    const result = extractJsonPayload(JSON.parse(text));
    console.log(`[PublicData] ${endpoint} page=${pageNo}`, {
      itemCount: result.items.length,
      totalCount: result.totalCount
    });
    return result;
  }

  return xmlToObject(text);
}

async function fetchAll(endpoint) {
  const all = [];
  let totalCount = null;

  for (let pageNo = 1; pageNo <= APP_CONFIG.PUBLIC_DATA_MAX_PAGES; pageNo += 1) {
    const result = await fetchPage(endpoint, pageNo);
    all.push(...result.items);

    if (totalCount == null) totalCount = result.totalCount;
    if (!result.items.length) break;
    if (all.length >= totalCount) break;
    if (result.items.length < APP_CONFIG.PUBLIC_DATA_ROWS_PER_PAGE) break;
  }

  return all;
}

function firstValue(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : "";
}

export function mergeRestaurants(koItems, enItems) {
  const englishMap = new Map(
    enItems.map((item) => [
      String(firstValue(item, ["UC_SEQ", "ucSeq", "uc_seq"])),
      item
    ])
  );

  return koItems.map((ko) => {
    const id = String(firstValue(ko, ["UC_SEQ", "ucSeq", "uc_seq"]));
    if (!id) return null;

    const en = englishMap.get(id) || {};
    const lat = Number(firstValue(ko, ["LAT", "lat"]));
    const lng = Number(firstValue(ko, ["LNG", "lng"]));

    return {
      id,
      name: {
        ko: firstValue(ko, ["MAIN_TITLE", "PLACE", "TITLE"]),
        en: firstValue(en, ["PLACE", "MAIN_TITLE", "TITLE"])
      },
      district: {
        ko: firstValue(ko, ["GUGUN_NM"]),
        en: firstValue(en, ["GUGUN_NM"])
      },
      title: {
        ko: firstValue(ko, ["TITLE", "SUBTITLE"]),
        en: firstValue(en, ["TITLE", "SUBTITLE"])
      },
      address: {
        ko: [firstValue(ko, ["ADDR1"]), firstValue(ko, ["ADDR2"])].filter(Boolean).join(" "),
        en: [firstValue(en, ["ADDR1"]), firstValue(en, ["ADDR2"])].filter(Boolean).join(" ")
      },
      menu: {
        ko: firstValue(ko, ["RPRSNTV_MENU"]),
        en: firstValue(en, ["RPRSNTV_MENU"])
      },
      description: {
        ko: firstValue(ko, ["ITEMCNTNTS"]),
        en: firstValue(en, ["ITEMCNTNTS"])
      },
      hours: {
        ko: firstValue(ko, ["USAGE_DAY_WEEK_AND_TIME"]),
        en: firstValue(en, ["USAGE_DAY_WEEK_AND_TIME"])
      },
      phone: firstValue(ko, ["CNTCT_TEL"]) || firstValue(en, ["CNTCT_TEL"]),
      homepage: firstValue(ko, ["HOMEPAGE_URL"]) || firstValue(en, ["HOMEPAGE_URL"]),
      image: normalizeImageUrl(firstValue(ko, ["MAIN_IMG_NORMAL"])),
      thumbnail: normalizeImageUrl(firstValue(ko, ["MAIN_IMG_THUMB"])),
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null
    };
  }).filter(Boolean);
}

export async function loadRestaurants() {
  if (
    !APP_CONFIG.PUBLIC_DATA_SERVICE_KEY ||
    APP_CONFIG.PUBLIC_DATA_SERVICE_KEY === "YOUR_PUBLIC_DATA_SERVICE_KEY"
  ) {
    const error = new Error("PUBLIC_DATA_KEY_MISSING");
    error.code = "PUBLIC_DATA_KEY_MISSING";
    throw error;
  }

  const koItems = await fetchAll(APP_CONFIG.PUBLIC_DATA_KO_ENDPOINT);

  let enItems = [];
  try {
    enItems = await fetchAll(APP_CONFIG.PUBLIC_DATA_EN_ENDPOINT);
  } catch (error) {
    console.warn("English public data failed; Korean data will still be used.", error);
  }

  return mergeRestaurants(koItems, enItems);
}
