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
} from "./types";
import { API_BASE_URL } from './constants';

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
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
    `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
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
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
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
    `${API_BASE_URL}/projects/${projectId}/members/${userId}`,
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
    `${API_BASE_URL}/projects/${projectId}/members`,
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
  const response = await fetch(`${API_BASE_URL}/projects`, {
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
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/verify`, {
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
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/memos`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch memos");
  }

  return response.json();
}

export async function getAllProjects(): Promise<ProjectInterface[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
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
  const response = await fetch(`${API_BASE_URL}/memos`, {
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
  const response = await fetch(`${API_BASE_URL}/memos/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/memos/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/articles`, {
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
    ? `${API_BASE_URL}/articles?projectId=${projectId}`
    : `${API_BASE_URL}/articles`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
}

export async function getArticle(articleId: string): Promise<ArticleInterface> {
  const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }

  return response.json();
}

export async function deleteArticle(articleId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete article');
  }

  return response.json();
}

export async function getMemoArticle(memoId: string): Promise<ArticleInterface | null> {
  const response = await fetch(`${API_BASE_URL}/memos/${memoId}/article`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch memo article status');
  }

  return response.json();
}

export async function deleteMemo(memoId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/memos/${memoId}`, {
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
  const response = await fetch(`${API_BASE_URL}/memos/bulk-delete`, {
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
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
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

export async function getLiveKitToken(roomName: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE_URL}/livekit/token`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ roomName }),
  });

  if (!res.ok) throw new Error('Failed to get LiveKit token');
  return res.json();
}
