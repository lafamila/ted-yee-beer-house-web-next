declare global {
  interface Window {
    google?: GoogleMapsGlobal;
    __teddyGoogleMapsPromise?: Promise<GoogleMapsGlobal>;
    __teddyGoogleMapsInit?: () => void;
  }
}

const GOOGLE_MAPS_SRC = 'https://maps.googleapis.com/maps/api/js';

interface GoogleGeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface GoogleMapsGlobal {
  maps: {
    Geocoder: new () => {
      geocode: (
        request: { address?: string; location?: { lat: number; lng: number } },
        callback: (
          results: GoogleGeocodeResult[] | null,
          status: string,
        ) => void,
      ) => void;
    };
    importLibrary: (library: string) => Promise<unknown>;
    marker?: unknown;
  };
}

function getGoogleMapsKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
}

export async function loadGoogleMapsApi() {
  if (typeof window === 'undefined') {
    throw new Error('Google Maps API is only available in the browser.');
  }

  if (window.google?.maps) {
    return window.google;
  }

  if (window.__teddyGoogleMapsPromise) {
    return window.__teddyGoogleMapsPromise;
  }

  const apiKey = getGoogleMapsKey();
  if (!apiKey) {
    throw new Error(
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required to use Google Maps.',
    );
  }

  window.__teddyGoogleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-google-maps-loader="teddy"]',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google) {
          resolve(window.google);
          return;
        }
        reject(new Error('Google Maps API loaded without global object.'));
      });
      existingScript.addEventListener('error', () =>
        reject(new Error('Failed to load Google Maps API.')),
      );
      return;
    }

    const callbackName = '__teddyGoogleMapsInit';
    window[callbackName] = () => {
      if (window.google) {
        resolve(window.google);
        return;
      }
      reject(new Error('Google Maps API loaded without global object.'));
    };

    const script = document.createElement('script');
    script.src =
      `${GOOGLE_MAPS_SRC}?key=${apiKey}` +
      '&v=weekly&language=ko&libraries=marker&loading=async' +
      `&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = 'teddy';
    script.onerror = () => reject(new Error('Failed to load Google Maps API.'));
    document.head.appendChild(script);
  });

  return window.__teddyGoogleMapsPromise;
}

export async function geocodeAddressWithGoogle(query: string) {
  const google = await loadGoogleMapsApi();
  const geocoder = new google.maps.Geocoder();

  return new Promise<{
    latitude: number;
    longitude: number;
    formattedAddress: string;
  } | null>((resolve, reject) => {
    geocoder.geocode(
      {
        address: query,
      },
      (results: GoogleGeocodeResult[] | null, status: string) => {
        if (status === 'OK' && results?.[0]) {
          const location = results[0].geometry.location;
          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
            formattedAddress: results[0].formatted_address,
          });
          return;
        }

        if (status === 'ZERO_RESULTS') {
          resolve(null);
          return;
        }

        reject(new Error(`Google geocoding failed: ${status}`));
      },
    );
  });
}

export async function reverseGeocodeWithGoogle(
  latitude: number,
  longitude: number,
) {
  const google = await loadGoogleMapsApi();
  const geocoder = new google.maps.Geocoder();

  return new Promise<string | null>((resolve, reject) => {
    geocoder.geocode(
      {
        location: { lat: latitude, lng: longitude },
      },
      (results: GoogleGeocodeResult[] | null, status: string) => {
        if (status === 'OK' && results?.[0]) {
          resolve(results[0].formatted_address);
          return;
        }

        if (status === 'ZERO_RESULTS') {
          resolve(null);
          return;
        }

        reject(new Error(`Google reverse geocoding failed: ${status}`));
      },
    );
  });
}
