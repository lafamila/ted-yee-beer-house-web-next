import type {
  ProjectInterface,
  MemoInterface,
  CreateProjectRequestInterface,
  CreateMemoRequestInterface,
  ArticleInterface,
  ArticleListItemInterface,
  UserInterface,
  LoginResponseInterface,
  ProjectMemberInterface,
  TravelCourseExportRequestInterface,
  TravelCourseExportResponseInterface,
  TravelCourseImportPayloadInterface,
  TravelCourseInterface,
  TravelPlaceInterface,
  TravelPlaceRequestInterface,
  TravelReviewInterface,
  TravelReviewRequestInterface,
  TravelUploadedFileInterface,
  GoogleMapsLinkResolutionInterface,
} from "./types";
import { TODO_API_BASE_URL, TRAVEL_API_BASE_URL } from './constants';

// ─── Auth helpers ───────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function jsonAuthHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...authHeaders() };
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export async function login(
  username: string,
  password: string,
): Promise<LoginResponseInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '로그인에 실패했습니다.');
  }

  return response.json();
}

export async function getMe(): Promise<UserInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/auth/me`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}

// ─── User API ───────────────────────────────────────────────────────────────

export async function searchUsers(query: string): Promise<UserInterface[]> {
  const response = await fetch(
    `${TODO_API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
    { headers: authHeaders() },
  );

  if (!response.ok) {
    throw new Error('Failed to search users');
  }

  return response.json();
}

// ─── Project Member API ─────────────────────────────────────────────────────

export async function inviteMember(
  projectId: string,
  userId: string,
  role: string = 'member',
): Promise<ProjectMemberInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ userId, role }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '멤버 초대에 실패했습니다.');
  }

  return response.json();
}

export async function removeMember(
  projectId: string,
  userId: string,
): Promise<{ message: string }> {
  const response = await fetch(
    `${TODO_API_BASE_URL}/projects/${projectId}/members/${userId}`,
    {
      method: 'DELETE',
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to remove member');
  }

  return response.json();
}

export async function getProjectMembers(
  projectId: string,
): Promise<ProjectMemberInterface[]> {
  const response = await fetch(
    `${TODO_API_BASE_URL}/projects/${projectId}/members`,
    { headers: authHeaders() },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch project members');
  }

  return response.json();
}

// ─── 프로젝트 API ──────────────────────────────────────────────────────────

export async function createProject(
  data: CreateProjectRequestInterface,
): Promise<ProjectInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/projects`, {
    method: "POST",
    headers: jsonAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json();
}

export async function verifyPassword(
  projectId: string,
  password: string
): Promise<boolean> {
  const response = await fetch(`${TODO_API_BASE_URL}/projects/${projectId}/verify`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.verified;
}

export async function getProjectMemos(
  projectId: string,
): Promise<MemoInterface[]> {
  const response = await fetch(`${TODO_API_BASE_URL}/projects/${projectId}/memos`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch memos");
  }

  return response.json();
}

export async function getAllProjects(): Promise<ProjectInterface[]> {
  const response = await fetch(`${TODO_API_BASE_URL}/projects`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}

// ─── 메모 API ───────────────────────────────────────────────────────────────

export async function createMemo(
  data: CreateMemoRequestInterface,
): Promise<MemoInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/memos`, {
    method: "POST",
    headers: jsonAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (response.status === 409) {
    const errorData = await response.json();
    const error = new Error("Duplicate memo title") as Error & {
      existingMemoId?: string;
    };
    error.existingMemoId = errorData.detail?.existingMemoId;
    throw error;
  }

  if (!response.ok) {
    throw new Error("Failed to create memo");
  }

  return response.json();
}

export async function getMemo(id: string): Promise<MemoInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/memos/${id}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch memo");
  }

  return response.json();
}

export async function updateMemo(
  id: string,
  content: string,
): Promise<MemoInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/memos/${id}`, {
    method: "PUT",
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to update memo");
  }

  return response.json();
}

// ─── Article API ────────────────────────────────────────────────────────────

export async function publishArticle(memoId: string): Promise<ArticleInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/articles`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ memoId }),
  });

  if (!response.ok) {
    throw new Error('Failed to publish article');
  }

  return response.json();
}

export async function getArticles(projectId?: string): Promise<ArticleListItemInterface[]> {
  const url = projectId
    ? `${TODO_API_BASE_URL}/articles?projectId=${projectId}`
    : `${TODO_API_BASE_URL}/articles`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
}

export async function getArticle(articleId: string): Promise<ArticleInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/articles/${articleId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }

  return response.json();
}

export async function deleteArticle(articleId: string): Promise<{ message: string }> {
  const response = await fetch(`${TODO_API_BASE_URL}/articles/${articleId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete article');
  }

  return response.json();
}

export async function getMemoArticle(memoId: string): Promise<ArticleInterface | null> {
  const response = await fetch(`${TODO_API_BASE_URL}/memos/${memoId}/article`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch memo article status');
  }

  return response.json();
}

export async function deleteMemo(memoId: string): Promise<{ message: string }> {
  const response = await fetch(`${TODO_API_BASE_URL}/memos/${memoId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete memo');
  }

  return response.json();
}

export async function bulkDeleteMemos(
  memoIds: string[],
): Promise<{ message: string; deletedCount: number }> {
  const response = await fetch(`${TODO_API_BASE_URL}/memos/bulk-delete`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ memoIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to bulk delete memos');
  }

  return response.json();
}

export async function register(
  username: string,
  password: string,
  displayName: string,
): Promise<LoginResponseInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, displayName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '회원가입에 실패했습니다.');
  }

  return response.json();
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const response = await fetch(`${TODO_API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '비밀번호 변경에 실패했습니다.');
  }

  return response.json();
}

// ─── Daily Task Tracker ─────────────────────────────────────────────────────

export async function getCalendarMonth(
  year: number,
  month: number,
): Promise<import('./types').CalendarMonthInterface> {
  const response = await fetch(
    `${TODO_API_BASE_URL}/daily-tasks/calendar?year=${year}&month=${month}`,
  );
  if (!response.ok) throw new Error('Failed to fetch calendar data');
  return response.json();
}

export async function getDayDetail(
  date: string,
): Promise<import('./types').DayDetailInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/daily-tasks/calendar/${date}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch day detail');
  return response.json();
}

export async function getTaskTypes(): Promise<import('./types').DailyTaskTypeInterface[]> {
  const response = await fetch(`${TODO_API_BASE_URL}/daily-tasks/types`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch task types');
  return response.json();
}

export async function createTaskType(
  data: { name: string; icon?: string; color?: string },
): Promise<import('./types').DailyTaskTypeInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/daily-tasks/types`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || 'Failed to create task type');
  }
  return response.json();
}

export async function updateTaskType(
  typeId: string,
  data: { name?: string; icon?: string; color?: string; isActive?: boolean; displayOrder?: number },
): Promise<import('./types').DailyTaskTypeInterface> {
  const response = await fetch(`${TODO_API_BASE_URL}/daily-tasks/types/${typeId}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update task type');
  return response.json();
}

export async function deleteTaskType(typeId: string): Promise<void> {
  const response = await fetch(`${TODO_API_BASE_URL}/daily-tasks/types/${typeId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete task type');
}

export async function completeTask(
  taskTypeId: string,
  completedDate: string,
): Promise<void> {
  const response = await fetch(`${TODO_API_BASE_URL}/daily-tasks/complete`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ taskTypeId, completedDate }),
  });
  if (!response.ok) throw new Error('Failed to complete task');
}

export async function uncompleteTask(
  taskTypeId: string,
  date: string,
): Promise<void> {
  const response = await fetch(`${TODO_API_BASE_URL}/daily-tasks/complete/${taskTypeId}/${date}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to uncomplete task');
}

export async function getLiveKitToken(roomName: string): Promise<{ token: string }> {
  const res = await fetch(`${TODO_API_BASE_URL}/livekit/token`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ roomName }),
  });

  if (!res.ok) throw new Error('Failed to get LiveKit token');
  return res.json();
}

export async function getTravelPlaces(
  bbox?: { swLat: number; swLng: number; neLat: number; neLng: number },
): Promise<TravelPlaceInterface[]> {
  let url = `${TRAVEL_API_BASE_URL}/places`;
  if (bbox) {
    const p = new URLSearchParams({
      sw_lat: String(bbox.swLat),
      sw_lng: String(bbox.swLng),
      ne_lat: String(bbox.neLat),
      ne_lng: String(bbox.neLng),
    });
    url += `?${p}`;
  }
  const response = await fetch(url, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch travel places');
  }

  return response.json();
}

export async function getTravelPlace(placeId: string): Promise<TravelPlaceInterface> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/places/${placeId}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch travel place');
  }

  return response.json();
}

export async function createTravelPlace(
  data: TravelPlaceRequestInterface,
): Promise<TravelPlaceInterface> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/places`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create travel place');
  }

  return response.json();
}

export async function uploadTravelFiles(
  files: File[],
  folder: string,
): Promise<TravelUploadedFileInterface[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  formData.append('folder', folder);

  const response = await fetch(`${TRAVEL_API_BASE_URL}/uploads`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to upload travel files');
  }

  return response.json();
}

export async function resolveTravelGoogleMapsLink(
  url: string,
): Promise<GoogleMapsLinkResolutionInterface> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/places/resolve-google-link`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || 'Failed to resolve Google Maps shared link',
    );
  }

  return response.json();
}

export async function updateTravelPlace(
  placeId: string,
  data: Partial<TravelPlaceRequestInterface>,
): Promise<TravelPlaceInterface> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/places/${placeId}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update travel place');
  }

  return response.json();
}

export async function deleteTravelPlace(placeId: string): Promise<void> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/places/${placeId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete travel place');
  }
}

export async function createTravelReview(
  placeId: string,
  data: TravelReviewRequestInterface,
): Promise<TravelReviewInterface> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/places/${placeId}/reviews`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create travel review');
  }

  return response.json();
}

export async function getTravelCourses(): Promise<TravelCourseInterface[]> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/courses`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch travel courses');
  }

  return response.json();
}

export async function getTravelCourse(courseId: string): Promise<TravelCourseInterface> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/courses/${courseId}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch travel course');
  }

  return response.json();
}

export async function deleteTravelCourse(courseId: string): Promise<void> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/courses/${courseId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete travel course');
  }
}

export async function exportTravelCourse(
  data: TravelCourseExportRequestInterface,
): Promise<TravelCourseExportResponseInterface> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/courses/export`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to export travel course');
  }

  return response.json();
}

export async function importTravelCourse(
  importPayload: TravelCourseImportPayloadInterface,
): Promise<TravelCourseInterface> {
  const response = await fetch(`${TRAVEL_API_BASE_URL}/courses/import`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(importPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Failed to import travel course');
  }

  return response.json();
}
