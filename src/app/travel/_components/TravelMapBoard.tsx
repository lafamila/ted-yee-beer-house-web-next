'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, {
  Marker,
  NavigationControl,
  type LngLatLike,
  type Map as MapLibreMap,
} from 'maplibre-gl';
import type { TravelPlaceInterface } from '@/lib/types';

interface FloatingPanelAnchor {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

interface TravelMapBoardProps {
  places: TravelPlaceInterface[];
  center: FloatingPanelAnchor;
  selectedPlaceId: string | null;
  selectedPlaceIds: string[];
  draftPosition: FloatingPanelAnchor | null;
  onMarkerClick: (placeId: string) => void;
  onMarkerLongPress: (placeId: string) => void;
  onMapPick: (coords: FloatingPanelAnchor) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  onRefresh?: () => void;
}

const OPEN_FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function buildMarkerContent(options: {
  name: string;
  category: string;
  imageUrl?: string | null;
  active: boolean;
  multi: boolean;
  draft?: boolean;
}) {
  const root = document.createElement('div');
  root.className = 'travel-marker-shell';

  const card = document.createElement('div');
  const classes = [
    'travel-marker',
    `travel-marker--${options.category}`,
    options.active ? 'travel-marker--active' : '',
    options.multi ? 'travel-marker--multi' : '',
    options.draft ? 'travel-marker--draft' : '',
  ]
    .filter(Boolean)
    .join(' ');
  card.className = classes;

  const image = document.createElement('span');
  image.className = 'travel-marker__image';
  if (options.imageUrl) {
    image.style.backgroundImage = `url(${options.imageUrl})`;
  }

  const label = document.createElement('span');
  label.className = 'travel-marker__label';
  label.textContent = options.name;

  card.append(image, label);
  root.append(card);
  return root;
}

export function TravelMapBoard({
  places,
  center,
  selectedPlaceId,
  selectedPlaceIds,
  draftPosition,
  onMarkerClick,
  onMarkerLongPress,
  onMapPick,
  onBoundsChange,
  onRefresh,
}: TravelMapBoardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialCenterRef = useRef(center);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const draftMarkerRef = useRef<Marker | null>(null);
  const onMapPickRef = useRef(onMapPick);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onMarkerLongPressRef = useRef(onMarkerLongPress);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onMapPickRef.current = onMapPick;
    onMarkerClickRef.current = onMarkerClick;
    onMarkerLongPressRef.current = onMarkerLongPress;
    onBoundsChangeRef.current = onBoundsChange;
  }, [onMapPick, onMarkerClick, onMarkerLongPress, onBoundsChange]);

  useEffect(() => {
    const markers = markersRef.current;
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPEN_FREE_MAP_STYLE,
      center: [
        initialCenterRef.current.longitude,
        initialCenterRef.current.latitude,
      ],
      zoom: 13,
      pitch: 0,
    });
    map.addControl(new NavigationControl(), 'bottom-right');
    mapRef.current = map;

    map.on('load', () => {
      setMapReady(true);
      // Emit initial bounds
      const b = map.getBounds();
      onBoundsChangeRef.current?.({
        swLat: b.getSouth(),
        swLng: b.getWest(),
        neLat: b.getNorth(),
        neLng: b.getEast(),
      });
    });
    map.on('click', (event) => {
      onMapPickRef.current({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      });
    });
    map.on('moveend', () => {
      const b = map.getBounds();
      onBoundsChangeRef.current?.({
        swLat: b.getSouth(),
        swLng: b.getWest(),
        neLat: b.getNorth(),
        neLng: b.getEast(),
      });
    });

    return () => {
      draftMarkerRef.current?.remove();
      markers.forEach((marker) => marker.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.easeTo({
      center: [center.longitude, center.latitude] as LngLatLike,
      duration: 700,
    });
  }, [center.latitude, center.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    const activeIds = new Set(places.map((place) => place.id));
    markersRef.current.forEach((marker, placeId) => {
      if (!activeIds.has(placeId)) {
        marker.remove();
        markersRef.current.delete(placeId);
      }
    });

    places.forEach((place) => {
      const existingMarker = markersRef.current.get(place.id);
      const element = buildMarkerContent({
        name: place.name,
        category: place.category,
        imageUrl: place.coverImageUrl || place.photoUrls[0] || null,
        active: selectedPlaceId === place.id,
        multi: selectedPlaceIds.includes(place.id),
      });

      let holdTimer: number | undefined;
      let longPressed = false;

      const startHold = () => {
        if (holdTimer) {
          window.clearTimeout(holdTimer);
        }
        longPressed = false;
        holdTimer = window.setTimeout(() => {
          longPressed = true;
          onMarkerLongPressRef.current(place.id);
        }, 550);
      };

      const stopHold = () => {
        if (holdTimer) {
          window.clearTimeout(holdTimer);
          holdTimer = undefined;
        }
      };

      element.addEventListener('mousedown', startHold);
      element.addEventListener('mouseup', stopHold);
      element.addEventListener('mouseleave', stopHold);
      element.addEventListener('touchstart', startHold, { passive: true });
      element.addEventListener('touchend', stopHold);
      element.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        stopHold();
        onMarkerLongPressRef.current(place.id);
      });
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        if (longPressed) {
          longPressed = false;
          return;
        }
        onMarkerClickRef.current(place.id);
      });

      if (existingMarker) {
        existingMarker.remove();
        markersRef.current.delete(place.id);
      }

      const marker = new Marker({
        element,
        anchor: 'bottom',
      })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);

      markersRef.current.set(place.id, marker);
    });
  }, [
    places,
    mapReady,
    selectedPlaceId,
    selectedPlaceIds,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    if (!draftPosition) {
      draftMarkerRef.current?.remove();
      draftMarkerRef.current = null;
      return;
    }

    const element = buildMarkerContent({
      name: 'NEW SPOT',
      category: 'other',
      active: false,
      multi: false,
      draft: true,
    });

    if (draftMarkerRef.current) {
      draftMarkerRef.current.remove();
      draftMarkerRef.current = null;
    }

    draftMarkerRef.current = new Marker({
      element,
      anchor: 'bottom',
    })
      .setLngLat([draftPosition.longitude, draftPosition.latitude])
      .addTo(map);
  }, [draftPosition, mapReady]);

  return (
    <div className="relative h-full w-full overflow-visible rounded-[1.25rem]">
      <div className="absolute inset-0 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#08111f] shadow-[0_26px_64px_rgba(0,0,0,0.34)]">
        <div ref={containerRef} className="travel-map h-full w-full" />
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="absolute right-2.5 top-2.5 z-10 rounded-lg border border-white/15 bg-slate-950/80 px-2.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur transition-all hover:border-white/30 hover:text-white"
          >
            ↻ 이 지역 검색
          </button>
        )}
      </div>
    </div>
  );
}
