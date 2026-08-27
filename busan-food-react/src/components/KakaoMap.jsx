import { useEffect, useRef, useState } from "react";
import { loadKakaoSdk } from "../services/kakaoMap";

export default function KakaoMap({
  restaurants,
  language,
  userPosition,
  onOpenRestaurant,
  t
}) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        await loadKakaoSdk();
        if (cancelled || !mapElementRef.current) return;

        mapRef.current = new window.kakao.maps.Map(mapElementRef.current, {
          center: new window.kakao.maps.LatLng(35.1379, 129.0556),
          level: 8
        });

        infoWindowRef.current = new window.kakao.maps.InfoWindow({
          removable: true
        });

        setError("");
        setReady(true);
      } catch (sdkError) {
        if (sdkError.code === "KAKAO_KEY_MISSING") {
          setError(`${t("kakaoKeyMissing")} ${t("kakaoKeyHint")}`);
        } else {
          setError(sdkError.message || "Kakao Maps error");
        }
      }
    }

    initialize();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    infoWindowRef.current?.close();

    restaurants
      .filter((restaurant) => restaurant.lat != null && restaurant.lng != null)
      .forEach((restaurant) => {
        const marker = new window.kakao.maps.Marker({
          map: mapRef.current,
          position: new window.kakao.maps.LatLng(
            restaurant.lat,
            restaurant.lng
          )
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          const name =
            restaurant.name?.[language] ||
            restaurant.name?.ko ||
            restaurant.name?.en ||
            "";

          const menu =
            restaurant.menu?.[language] ||
            restaurant.menu?.ko ||
            restaurant.menu?.en ||
            "";

          infoWindowRef.current?.setContent(
            `<div class="kakao-info"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(menu)}</span></div>`
          );

          infoWindowRef.current?.open(mapRef.current, marker);
          onOpenRestaurant(restaurant);
        });

        markersRef.current.push(marker);
      });
  }, [ready, restaurants, language, onOpenRestaurant]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps || !userPosition) return;

    const position = new window.kakao.maps.LatLng(
      userPosition.lat,
      userPosition.lng
    );

    userMarkerRef.current?.setMap(null);
    userCircleRef.current?.setMap(null);

    userMarkerRef.current = new window.kakao.maps.Marker({
      map: mapRef.current,
      position,
      zIndex: 10
    });

    userCircleRef.current = new window.kakao.maps.Circle({
      center: position,
      radius: 120,
      strokeWeight: 2,
      strokeColor: "#1769e0",
      strokeOpacity: 0.8,
      fillColor: "#1769e0",
      fillOpacity: 0.12
    });

    userCircleRef.current.setMap(mapRef.current);
    mapRef.current.setCenter(position);
    mapRef.current.setLevel(5);
  }, [ready, userPosition]);

  if (error) {
    return (
      <div className="map-status">
        <strong>{t("kakaoKeyMissing")}</strong>
        <span>{error}</span>
      </div>
    );
  }

  return <div ref={mapElementRef} className="kakao-map-canvas" />;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
