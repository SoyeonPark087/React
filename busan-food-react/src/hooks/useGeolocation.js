import { useCallback, useState } from "react";

export function useGeolocation() {
  const [position, setPosition] = useState(null);

  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation unavailable"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (result) => {
          const next = {
            lat: result.coords.latitude,
            lng: result.coords.longitude
          };
          setPosition(next);
          resolve(next);
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 9000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  return { position, requestLocation };
}
