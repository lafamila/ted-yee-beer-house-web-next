import type {
  Project,
  Memo,
  CreateProjectRequest,
  CreateMemoRequest,
} from './types';
import { API_BASE_URL } from './constants';

// 프로젝트 API
export async function createProject(
  data: CreateProjectRequest
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  return response.json();
}

export async function verifyPassword(
  projectId: string,
  password: string
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.verified;
}

export async function getProjectMemos(projectId: string): Promise<Memo[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/memos`);

  if (!response.ok) {
    throw new Error('Failed to fetch memos');
  }

  return response.json();
}

export async function getAllProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`);

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

// 메모 API
export async function createMemo(data: CreateMemoRequest): Promise<Memo> {
  const response = await fetch(`${API_BASE_URL}/memos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create memo');
  }

  return response.json();
}

export async function getMemo(id: string): Promise<Memo> {
  const response = await fetch(`${API_BASE_URL}/memos/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch memo');
  }

  return response.json();
}

export async function updateMemo(id: string, content: string): Promise<Memo> {
  const response = await fetch(`${API_BASE_URL}/memos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Failed to update memo');
  }

  return response.json();
}
