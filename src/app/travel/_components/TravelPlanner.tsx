'use client';

import type { ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MapBounds } from './TravelMapBoard';
import {
  createTravelPlace,
  createTravelReview,
  deleteTravelCourse,
  deleteTravelPlace,
  exportTravelCourse,
  getTravelCourse,
  getTravelCourses,
  getTravelPlace,
  getTravelPlaces,
  importTravelCourse,
  resolveTravelGoogleMapsLink,
  updateTravelPlace,
  uploadTravelFiles,
} from '@/lib/api';
import type {
  TravelCourseExportResponseInterface,
  TravelCourseImportPayloadInterface,
  TravelCourseInterface,
  TravelPlaceCategory,
  TravelPlaceInterface,
  TravelPlaceRequestInterface,
  TravelReviewRequestInterface,
} from '@/lib/types';
import { Button } from '@/components/ui/Button';

const TravelMapBoard = dynamic(
  () => import('./TravelMapBoard').then((module) => module.TravelMapBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[70vh] items-center justify-center rounded-[2rem] border border-white/10 bg-[#08111f] text-sm text-white/55">
        실제 지도를 불러오는 중...
      </div>
    ),
  },
);

const PLACE_CATEGORIES: Array<{ value: TravelPlaceCategory; label: string }> = [
  { value: 'food', label: '맛집' },
  { value: 'coffee', label: '카페' },
  { value: 'bar', label: '술집' },
  { value: 'culture', label: '문화' },
  { value: 'nature', label: '자연' },
  { value: 'shopping', label: '쇼핑' },
  { value: 'stay', label: '숙소' },
  { value: 'other', label: '기타' },
];

const GOOGLE_MAPS_URL_RE =
  /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|(?:www\.)?google\.\w+\/maps)/;

const PRIMARY_TYPE_TO_CATEGORY: Record<string, TravelPlaceCategory> = {
  restaurant: 'food', meal_delivery: 'food', meal_takeaway: 'food',
  bakery: 'food', food: 'food',
  cafe: 'coffee', coffee_shop: 'coffee',
  bar: 'bar', night_club: 'bar', pub: 'bar',
  museum: 'culture', art_gallery: 'culture', library: 'culture',
  movie_theater: 'culture', tourist_attraction: 'culture',
  park: 'nature', campground: 'nature', beach: 'nature',
  shopping_mall: 'shopping', store: 'shopping',
  clothing_store: 'shopping', supermarket: 'shopping',
  hotel: 'stay', motel: 'stay', lodging: 'stay',
  hostel: 'stay', resort_hotel: 'stay',
};

function mapPrimaryTypeToCategory(primaryType: string | null | undefined): TravelPlaceCategory {
  if (!primaryType) return 'other';
  const normalized = primaryType.toLowerCase().replace(/[\s-]/g, '_');
  return PRIMARY_TYPE_TO_CATEGORY[normalized] ?? 'other';
}

const DEFAULT_CENTER = {
  latitude: 37.5665,
  longitude: 126.978,
};

const DEFAULT_PLACE_FORM = {
  name: '',
  category: 'other' as TravelPlaceCategory,
  latitude: String(DEFAULT_CENTER.latitude),
  longitude: String(DEFAULT_CENTER.longitude),
  address: '',
  description: '',
  openingHours: '',
  specialNotes: '',
  tags: '',
};

const DEFAULT_REVIEW_FORM = {
  rating: '5',
  headline: '',
  body: '',
  visitedAt: '',
};

type TopPanelMode = 'export' | 'import' | null;
type EditorMode = 'create' | 'edit' | null;

export function TravelPlanner() {
  const [places, setPlaces] = useState<TravelPlaceInterface[]>([]);
  const [courses, setCourses] = useState<TravelCourseInterface[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [topPanelMode, setTopPanelMode] = useState<TopPanelMode>(null);
  const [draftPosition, setDraftPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [lookupQuery, setLookupQuery] = useState('');
  const [placeForm, setPlaceForm] = useState(DEFAULT_PLACE_FORM);
  const [placePhotoUrls, setPlacePhotoUrls] = useState<string[]>([]);
  const [newPlaceFiles, setNewPlaceFiles] = useState<File[]>([]);
  const [reviewForm, setReviewForm] = useState(DEFAULT_REVIEW_FORM);
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [tripStartLocation, setTripStartLocation] = useState('');
  const [tripStartAt, setTripStartAt] = useState('');
  const [tripEndAt, setTripEndAt] = useState('');
  const [tripTheme, setTripTheme] = useState('');
  const [tripPace, setTripPace] = useState('');
  const [importText, setImportText] = useState('');
  const [exportResult, setExportResult] =
    useState<TravelCourseExportResponseInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boundsRef = useRef<MapBounds | null>(null);

  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null;
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;

  const editorAnchor = selectedPlace
    ? {
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
      }
    : draftPosition;

  const syncPlaceForm = (
    place: TravelPlaceInterface | null,
    coords?: { latitude: number; longitude: number } | null,
  ) => {
    if (!place) {
      const nextCoords = coords ?? center;
      setPlaceForm({
        ...DEFAULT_PLACE_FORM,
        latitude: nextCoords.latitude.toFixed(6),
        longitude: nextCoords.longitude.toFixed(6),
      });
      setPlacePhotoUrls([]);
      setNewPlaceFiles([]);
      return;
    }

    setPlaceForm({
      name: place.name,
      category: place.category,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      address: place.address ?? '',
      description: place.description ?? '',
      openingHours: place.openingHours ?? '',
      specialNotes: place.specialNotes ?? '',
      tags: place.tags.join(', '),
    });
    setPlacePhotoUrls(place.photoUrls);
    setNewPlaceFiles([]);
  };

  const loadTravelData = async (preferredPlaceId?: string, preferredCourseId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const bbox = boundsRef.current ?? undefined;
      const [placeList, courseList] = await Promise.all([
        getTravelPlaces(bbox),
        getTravelCourses(),
      ]);

      setPlaces(placeList);
      setCourses(courseList);

      const nextPlaceId = preferredPlaceId ?? selectedPlaceId ?? null;
      const nextCourseId = preferredCourseId ?? selectedCourseId ?? courseList[0]?.id ?? null;

      if (nextPlaceId) {
        const detail = await getTravelPlace(nextPlaceId);
        setPlaces((prev) =>
          prev.map((place) => (place.id === detail.id ? detail : place)),
        );
        setSelectedPlaceId(detail.id);
        if (editorMode === 'edit') {
          syncPlaceForm(detail);
        }
      }

      if (nextCourseId) {
        const detail = await getTravelCourse(nextCourseId);
        setCourses((prev) =>
          prev.map((course) => (course.id === detail.id ? detail : course)),
        );
        setSelectedCourseId(detail.id);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : '여행 데이터를 불러오지 못했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    boundsRef.current = bounds;
  }, []);

  const handleRefreshPlaces = useCallback(() => {
    void loadTravelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadTravelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateEditor = (coords: { latitude: number; longitude: number }) => {
    setSelectedPlaceId(null);
    setDraftPosition(coords);
    setEditorMode('create');
    syncPlaceForm(null, coords);
  };

  const openEditEditor = async (placeId: string) => {
    setDraftPosition(null);
    setEditorMode('edit');
    setSelectedPlaceId(placeId);
    try {
      const detail = await getTravelPlace(placeId);
      setPlaces((prev) =>
        prev.map((place) => (place.id === detail.id ? detail : place)),
      );
      syncPlaceForm(detail);
      setCenter({
        latitude: detail.latitude,
        longitude: detail.longitude,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : '장소 정보를 불러오지 못했습니다.',
      );
    }
  };

  const dismissEditor = () => {
    setEditorMode(null);
    setDraftPosition(null);
    setSelectedPlaceId(null);
    setReviewForm(DEFAULT_REVIEW_FORM);
    setReviewFiles([]);
    setNewPlaceFiles([]);
  };

  const handleMapPick = (coords: { latitude: number; longitude: number }) => {
    setCenter(coords);
    openCreateEditor(coords);
  };

  const handleMarkerClick = (placeId: string) => {
    if (multiSelectMode) {
      setSelectedPlaceIds((prev) =>
        prev.includes(placeId)
          ? prev.filter((id) => id !== placeId)
          : [...prev, placeId],
      );
      return;
    }

    void openEditEditor(placeId);
  };

  const handleMarkerLongPress = (placeId: string) => {
    setMultiSelectMode(true);
    setSelectedPlaceIds((prev) =>
      prev.includes(placeId) ? prev : [...prev, placeId],
    );
  };

  const handleLookup = async () => {
    if (!lookupQuery.trim()) {
      return;
    }

    const trimmed = lookupQuery.trim();

    // ── Google Maps URL detection ──
    if (GOOGLE_MAPS_URL_RE.test(trimmed)) {
      setIsResolving(true);
      setError(null);
      try {
        const resolved = await resolveTravelGoogleMapsLink(trimmed);
        const coords = { latitude: resolved.latitude, longitude: resolved.longitude };
        setCenter(coords);
        setLookupQuery(resolved.name);

        // Refresh places to check against latest data
        const freshPlaces = await getTravelPlaces();
        setPlaces(freshPlaces);

        // Duplicate check: 50m radius (coordinates only, name can differ)
        const duplicate = freshPlaces.find((place) => {
          const dLat = (place.latitude - coords.latitude) * 111_000;
          const dLng =
            (place.longitude - coords.longitude) *
            111_000 *
            Math.cos(coords.latitude * (Math.PI / 180));
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          return dist <= 50;
        });

        if (duplicate) {
          void openEditEditor(duplicate.id);
        } else {
          // Open create form with auto-filled data
          setSelectedPlaceId(null);
          setDraftPosition(coords);
          setEditorMode('create');
          setPlaceForm({
            ...DEFAULT_PLACE_FORM,
            name: resolved.name,
            latitude: coords.latitude.toFixed(6),
            longitude: coords.longitude.toFixed(6),
            address: resolved.address ?? '',
            openingHours: resolved.openingHours ?? '',
            category: mapPrimaryTypeToCategory(resolved.primaryType),
          });
          setPlacePhotoUrls([]);
          setNewPlaceFiles([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Google Maps 링크를 처리하지 못했습니다.',
        );
      } finally {
        setIsResolving(false);
      }
      return;
    }

    // ── Coordinate format: lat,lng ──
    const normalized = trimmed.toLowerCase();
    const parts = normalized.split(',').map((part) => Number(part.trim()));

    if (parts.length === 2 && parts.every((value) => Number.isFinite(value))) {
      const coords = {
        latitude: parts[0],
        longitude: parts[1],
      };
      setCenter(coords);
      return;
    }

    // ── Text search among existing places ──
    const match = places.find((place) => {
      const haystack = [
        place.name,
        place.address ?? '',
        place.description ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });

    if (!match) {
      setError('저장된 장소명/주소, lat,lng, 또는 Google Maps URL을 입력하세요.');
      return;
    }

    setCenter({
      latitude: match.latitude,
      longitude: match.longitude,
    });
    void openEditEditor(match.id);
  };

  const uploadImageFiles = async (files: File[], folder: string) => {
    if (!files.length) {
      return [];
    }
    const uploaded = await uploadTravelFiles(files, folder);
    return uploaded.map((file) => file.url);
  };

  const handlePlaceSubmit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const uploadedUrls = await uploadImageFiles(newPlaceFiles, 'places');
      const mergedPhotoUrls = [...placePhotoUrls, ...uploadedUrls];

      const payload: TravelPlaceRequestInterface = {
        name: placeForm.name,
        category: placeForm.category,
        latitude: Number(placeForm.latitude),
        longitude: Number(placeForm.longitude),
        address: placeForm.address || undefined,
        description: placeForm.description || undefined,
        openingHours: placeForm.openingHours || undefined,
        specialNotes: placeForm.specialNotes || undefined,
        tags: placeForm.tags
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        photoUrls: mergedPhotoUrls,
        coverImageUrl: mergedPhotoUrls[0],
      };

      const place =
        editorMode === 'edit' && selectedPlaceId
          ? await updateTravelPlace(selectedPlaceId, payload)
          : await createTravelPlace(payload);

      setSelectedPlaceId(place.id);
      setEditorMode('edit');
      setDraftPosition(null);
      setReviewFiles([]);
      setReviewForm(DEFAULT_REVIEW_FORM);
      await loadTravelData(place.id, selectedCourseId ?? undefined);
      // Set center after loadTravelData so markers render with the updated places array
      setCenter({
        latitude: place.latitude,
        longitude: place.longitude,
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : '장소 저장에 실패했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlace = async () => {
    if (!selectedPlaceId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await deleteTravelPlace(selectedPlaceId);
      dismissEditor();
      await loadTravelData(undefined, selectedCourseId ?? undefined);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : '장소 삭제에 실패했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedPlaceId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const uploadedUrls = await uploadImageFiles(reviewFiles, 'reviews');
      const payload: TravelReviewRequestInterface = {
        rating: Number(reviewForm.rating),
        headline: reviewForm.headline || undefined,
        body: reviewForm.body,
        visitedAt: reviewForm.visitedAt || undefined,
        photoUrls: uploadedUrls,
      };

      await createTravelReview(selectedPlaceId, payload);
      setReviewForm(DEFAULT_REVIEW_FORM);
      setReviewFiles([]);
      await loadTravelData(selectedPlaceId, selectedCourseId ?? undefined);
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : '후기 저장에 실패했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!selectedPlaceIds.length || !tripStartAt || !tripEndAt) {
      setError('코스 선택, 시작/종료 일시를 먼저 입력하세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const selectedPlaces = places
        .filter((place) => selectedPlaceIds.includes(place.id))
        .map((place) => ({
          placeId: place.id,
          name: place.name,
          latitude: place.latitude,
          longitude: place.longitude,
          address: place.address ?? undefined,
          openingHours: place.openingHours ?? undefined,
          specialNotes: place.specialNotes ?? undefined,
          coverImageUrl: place.coverImageUrl ?? undefined,
          reviewSummary: place.reviews
            .slice(0, 2)
            .map((review) => review.headline || review.body),
        }));

      const result = await exportTravelCourse({
        tripWindow: {
          startAt: tripStartAt,
          endAt: tripEndAt,
        },
        courseStart: tripStartLocation
          ? { label: tripStartLocation }
          : {
              latitude: center.latitude,
              longitude: center.longitude,
            },
        selectedPlaces,
        selectionContext: {
          theme: tripTheme || 'free-form',
          pace: tripPace || 'balanced',
        },
      });
      setExportResult(result);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : '코스 export 생성에 실패했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      setError('import 할 JSON을 입력하세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = JSON.parse(importText) as TravelCourseImportPayloadInterface;
      const course = await importTravelCourse(payload);
      setSelectedCourseId(course.id);
      setTopPanelMode(null);
      setImportText('');
      await loadTravelData(selectedPlaceId ?? undefined, course.id);
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : '코스 import에 실패했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setImportText(await file.text());
  };

  const handleDeleteCourse = async (courseId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await deleteTravelCourse(courseId);
      const nextCourseId =
        selectedCourseId === courseId ? null : selectedCourseId;
      setSelectedCourseId(nextCourseId);
      await loadTravelData(selectedPlaceId ?? undefined, nextCourseId ?? undefined);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : '코스 삭제에 실패했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const placeEditorPanel = (
    <div className="space-y-4 pt-4">
      <div className="sticky top-0 z-10 -mx-5 border-b border-white/10 bg-slate-950/96 px-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">
            {editorMode === 'edit' ? '장소 수정' : '새 장소 등록'}
          </h2>
          {editorMode === 'edit' && selectedPlaceId ? (
            <Button variant="ghost" onClick={() => void handleDeletePlace()} disabled={isSaving}>
              장소 삭제
            </Button>
          ) : null}
        </div>

        <div className="mt-3 grid gap-3">
          <label className="text-sm text-white/60">
            장소명
            <input
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              value={placeForm.name}
              onChange={(event) => setPlaceForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>

          <label className="text-sm text-white/60">
            카테고리
            <select
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              value={placeForm.category}
              onChange={(event) =>
                setPlaceForm((prev) => ({
                  ...prev,
                  category: event.target.value as TravelPlaceCategory,
                }))
              }
            >
              {PLACE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value} className="bg-slate-950">
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-3">

        <label className="text-sm text-white/60">
          주소
          <input
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            value={placeForm.address}
            onChange={(event) => setPlaceForm((prev) => ({ ...prev, address: event.target.value }))}
          />
        </label>

        <label className="text-sm text-white/60">
          운영시간
          <textarea
            className="mt-1 min-h-[70px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            value={placeForm.openingHours}
            onChange={(event) => setPlaceForm((prev) => ({ ...prev, openingHours: event.target.value }))}
          />
        </label>

        <label className="text-sm text-white/60">
          설명
          <textarea
            className="mt-1 min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            value={placeForm.description}
            onChange={(event) => setPlaceForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>

        <label className="text-sm text-white/60">
          특이사항
          <textarea
            className="mt-1 min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            value={placeForm.specialNotes}
            onChange={(event) => setPlaceForm((prev) => ({ ...prev, specialNotes: event.target.value }))}
          />
        </label>

        <label className="text-sm text-white/60">
          태그
          <input
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            placeholder="예: brunch, night-view"
            value={placeForm.tags}
            onChange={(event) => setPlaceForm((prev) => ({ ...prev, tags: event.target.value }))}
          />
        </label>

        <label className="text-sm text-white/60">
          장소 사진 업로드
          <input
            type="file"
            multiple
            accept="image/*"
            className="mt-1 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-950"
            onChange={(event) =>
              setNewPlaceFiles(Array.from(event.target.files ?? []))
            }
          />
        </label>
      </div>

      {(placePhotoUrls.length || newPlaceFiles.length) ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">photos</p>
          <div className="grid grid-cols-3 gap-3">
            {placePhotoUrls.map((url) => (
              <div key={url} className="space-y-2">
                <div
                  className="aspect-square rounded-2xl border border-white/10 bg-cover bg-center"
                  style={{ backgroundImage: `url(${url})` }}
                />
                <button
                  type="button"
                  className="w-full rounded-full border border-white/10 px-3 py-1 text-xs text-white/65"
                  onClick={() =>
                    setPlacePhotoUrls((prev) => prev.filter((item) => item !== url))
                  }
                >
                  제거
                </button>
              </div>
            ))}
            {newPlaceFiles.map((file) => (
              <div
                key={`${file.name}-${file.size}`}
                className="flex aspect-square items-end rounded-2xl border border-dashed border-sky-300/30 bg-sky-400/5 p-3 text-xs text-sky-100"
              >
                {file.name}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void handlePlaceSubmit()} disabled={isSaving}>
          {editorMode === 'edit' ? '장소 저장' : '장소 등록'}
        </Button>
      </div>

      {editorMode === 'edit' && selectedPlace ? (
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="space-y-1">
            <h3 className="font-medium text-white">후기 추가</h3>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
              <label className="text-sm text-white/60">
                별점
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: event.target.value }))}
                />
              </label>
              <label className="text-sm text-white/60">
                한줄 요약
                <input
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  value={reviewForm.headline}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, headline: event.target.value }))}
                />
              </label>
            </div>

            <label className="text-sm text-white/60">
              방문일
              <input
                type="date"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                value={reviewForm.visitedAt}
                onChange={(event) => setReviewForm((prev) => ({ ...prev, visitedAt: event.target.value }))}
              />
            </label>

            <label className="text-sm text-white/60">
              후기 내용
              <textarea
                className="mt-1 min-h-[90px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                value={reviewForm.body}
                onChange={(event) => setReviewForm((prev) => ({ ...prev, body: event.target.value }))}
              />
            </label>

            <label className="text-sm text-white/60">
              후기 사진 업로드
              <input
                type="file"
                multiple
                accept="image/*"
                className="mt-1 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-950"
                onChange={(event) =>
                  setReviewFiles(Array.from(event.target.files ?? []))
                }
              />
            </label>
          </div>

          {selectedPlace.reviews.length ? (
            <div className="space-y-2">
              {selectedPlace.reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                  <div className="flex items-center justify-between">
                    <span>{review.headline || '제목 없는 후기'}</span>
                    <span>{'★'.repeat(review.rating)}</span>
                  </div>
                  <p className="mt-2 text-white/55">{review.body}</p>
                </div>
              ))}
            </div>
          ) : null}

          <Button variant="secondary" onClick={() => void handleReviewSubmit()} disabled={isSaving}>
            후기 저장
          </Button>
        </div>
      ) : null}
    </div>
  );

  const exportPanel = (
    <div className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-slate-950/85 p-4 backdrop-blur">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          placeholder="코스 시작 위치"
          value={tripStartLocation}
          onChange={(event) => setTripStartLocation(event.target.value)}
        />
        <input
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          placeholder="테마"
          value={tripTheme}
          onChange={(event) => setTripTheme(event.target.value)}
        />
        <input
          type="datetime-local"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          value={tripStartAt}
          onChange={(event) => setTripStartAt(event.target.value)}
        />
        <input
          type="datetime-local"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          value={tripEndAt}
          onChange={(event) => setTripEndAt(event.target.value)}
        />
      </div>
      <input
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        placeholder="여행 페이스"
        value={tripPace}
        onChange={(event) => setTripPace(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void handleExport()} disabled={isSaving || !selectedPlaceIds.length}>
          export 생성
        </Button>
        <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/55">
          selected {selectedPlaceIds.length}
        </span>
      </div>
      {exportResult ? (
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <pre className="max-h-[220px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs text-emerald-100">
            {JSON.stringify(exportResult.payload, null, 2)}
          </pre>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={() => void navigator.clipboard.writeText(exportResult.promptText)}
            >
              prompt 복사
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const blob = new Blob(
                  [
                    `${exportResult.promptText}\n\n${JSON.stringify(exportResult.payload, null, 2)}`,
                  ],
                  { type: 'text/plain;charset=utf-8' },
                );
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'travel-course-export.txt';
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              txt 저장
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );

  const importPanel = (
    <div className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-slate-950/85 p-4 backdrop-blur">
      <textarea
        className="min-h-[180px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        placeholder="코스 JSON을 붙여넣으세요."
        value={importText}
        onChange={(event) => setImportText(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-full border border-white/10 px-4 py-2 text-sm text-white/75">
          JSON 파일 불러오기
          <input type="file" accept=".json" className="hidden" onChange={(event) => void handleImportFile(event)} />
        </label>
        <Button variant="secondary" onClick={() => void handleImport()} disabled={isSaving}>
          import 실행
        </Button>
      </div>
    </div>
  );

  const footerCourses = (
    <div className="border-t border-white/10 bg-slate-950/92 px-4 py-4 backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
            {courses.length} courses
          </span>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(course.id)}
              className={`min-w-[280px] rounded-3xl border px-4 py-4 text-left transition ${
                selectedCourseId === course.id
                  ? 'border-sky-300/45 bg-sky-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/25'
              }`}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                {course.outputFormatVersion}
              </p>
              <h3 className="mt-2 font-semibold text-white">{course.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-white/55">
                {course.summary || '요약 없음'}
              </p>
            </button>
          ))}
        </div>

        {selectedCourse ? (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedCourse.title}</h3>
                <p className="mt-1 text-white/50">
                  {selectedCourse.startLocation || '시작 위치 미정'} /{' '}
                  {selectedCourse.transportMode || '교통수단 미정'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => void handleDeleteCourse(selectedCourse.id)}>
                코스 삭제
              </Button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedCourse.stops.map((stop) => (
                <div key={`${selectedCourse.id}-${stop.order}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/40">
                    <span>Stop {stop.order}</span>
                    <span>{stop.scheduledAt || '시간 미정'}</span>
                  </div>
                  <h4 className="mt-2 font-semibold text-white">{stop.placeName}</h4>
                  <p className="mt-2 text-white/55">{stop.note || '메모 없음'}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),linear-gradient(180deg,#050b14,#08111f)]">
      <div className="relative flex-1 px-3 pb-3 pt-3 md:px-5 md:pb-5">
        <div className="absolute inset-x-3 top-3 z-20 rounded-[1.75rem] border border-white/10 bg-slate-950/78 px-4 py-4 backdrop-blur md:inset-x-5 md:px-6">
          <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <input
                  className="min-w-[240px] flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="장소명, lat,lng 또는 Google Maps URL 붙여넣기"
                  value={lookupQuery}
                  onChange={(event) => setLookupQuery(event.target.value)}
                />
                <Button variant="secondary" onClick={handleLookup} disabled={isResolving}>
                  {isResolving ? '검색 중...' : '포커스 이동'}
                </Button>
                <Button
                  variant={topPanelMode === 'export' ? 'primary' : 'ghost'}
                  onClick={() => setTopPanelMode((prev) => (prev === 'export' ? null : 'export'))}
                >
                  Export
                </Button>
                <Button
                  variant={topPanelMode === 'import' ? 'primary' : 'ghost'}
                  onClick={() => setTopPanelMode((prev) => (prev === 'import' ? null : 'import'))}
                >
                  Import
                </Button>
                <Button
                  variant={multiSelectMode ? 'primary' : 'ghost'}
                  onClick={() => {
                    if (multiSelectMode) {
                      setMultiSelectMode(false);
                      setSelectedPlaceIds([]);
                      setExportResult(null);
                    } else {
                      setMultiSelectMode(true);
                    }
                  }}
                >
                  {multiSelectMode ? '선택 해제' : '복수 선택'}
                </Button>
              </div>

              {topPanelMode === 'export' ? exportPanel : null}
              {topPanelMode === 'import' ? importPanel : null}
          </div>
        </div>

        {error ? (
          <div className="absolute inset-x-3 top-[188px] z-20 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 md:inset-x-5">
            {error}
          </div>
        ) : null}

        <div className="h-[calc(100vh-220px)] min-h-[720px] pt-[170px] md:pt-[170px]">
          <TravelMapBoard
            places={places}
            center={center}
            selectedPlaceId={selectedPlaceId}
            selectedPlaceIds={selectedPlaceIds}
            draftPosition={draftPosition}
            floatingPanel={editorMode ? placeEditorPanel : null}
            floatingPanelAnchor={editorAnchor}
            onMarkerClick={handleMarkerClick}
            onMarkerLongPress={handleMarkerLongPress}
            onMapPick={handleMapPick}
            onDismissPanel={dismissEditor}
            onBoundsChange={handleBoundsChange}
            onRefresh={handleRefreshPlaces}
          />
        </div>
      </div>

      {footerCourses}

      {isLoading ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="rounded-full border border-white/10 bg-slate-950/92 px-5 py-3 text-sm text-white/70">
            travel data loading...
          </div>
        </div>
      ) : null}
    </div>
  );
}
