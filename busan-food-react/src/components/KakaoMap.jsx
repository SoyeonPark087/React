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
  const clustererRef = useRef(null);
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

        const map = new window.kakao.maps.Map(mapElementRef.current, {
          center: new window.kakao.maps.LatLng(35.1796, 129.0756),
          level: 9
        });

        mapRef.current = map;

        infoWindowRef.current = new window.kakao.maps.InfoWindow({
          removable: true
        });

        if (window.kakao.maps.MarkerClusterer) {
          clustererRef.current = new window.kakao.maps.MarkerClusterer({
            map,
            averageCenter: true,
            minLevel: 6,
            disableClickZoom: false,
            styles: [{
              width: "42px",
              height: "42px",
              background: "rgba(23, 105, 224, 0.90)",
              color: "#ffffff",
              textAlign: "center",
              fontWeight: "800",
              lineHeight: "42px",
              borderRadius: "21px",
              boxShadow: "0 6px 16px rgba(23, 105, 224, 0.28)"
            }]
          });
        }

        requestAnimationFrame(() => {
          window.kakao.maps.event.trigger(map, "resize");
          map.setCenter(new window.kakao.maps.LatLng(35.1796, 129.0756));
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

    clustererRef.current?.clear();
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    infoWindowRef.current?.close();

    const validRestaurants = restaurants.filter(
      (restaurant) => restaurant.lat != null && restaurant.lng != null
    );

    const bounds = new window.kakao.maps.LatLngBounds();

    validRestaurants.forEach((restaurant) => {
      const position = new window.kakao.maps.LatLng(
        restaurant.lat,
        restaurant.lng
      );

      bounds.extend(position);

      const marker = new window.kakao.maps.Marker({
        position,
        title:
          restaurant.name?.[language] ||
          restaurant.name?.ko ||
          restaurant.name?.en ||
          ""
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

    if (clustererRef.current) {
      clustererRef.current.addMarkers(markersRef.current);
    } else {
      markersRef.current.forEach((marker) => marker.setMap(mapRef.current));
    }

    if (validRestaurants.length > 0) {
      requestAnimationFrame(() => {
        window.kakao.maps.event.trigger(mapRef.current, "resize");
        mapRef.current.setBounds(bounds, 48, 48, 48, 48);
      });
    }
  }, [ready, restaurants, language, onOpenRestaurant]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps || !userPosition) {
      return;
    }

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
      radius: 150,
      strokeWeight: 2,
      strokeColor: "#1769e0",
      strokeOpacity: 0.8,
      fillColor: "#1769e0",
      fillOpacity: 0.12
    });

    userCircleRef.current.setMap(mapRef.current);

    requestAnimationFrame(() => {
      window.kakao.maps.event.trigger(mapRef.current, "resize");
      mapRef.current.setCenter(position);
      mapRef.current.setLevel(5);
    });
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
