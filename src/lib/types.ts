// Project 관련 타입
export interface Project {
  id: string;
  name: string;
  icon: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  icon: string;
  isSecret: boolean;
  password?: string;
}

export interface VerifyPasswordRequest {
  projectId: string;
  password: string;
}

// Memo 관련 타입
export interface Memo {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMemoRequest {
  projectId: string;
  title: string;
}

export interface UpdateMemoRequest {
  id: string;
  content: string;
}

// 메모 콘텐츠 블록 타입
export interface ContentBlock {
  type: 'text' | 'code' | 'checkbox' | 'memo-link';
  content: string;
  metadata?: {
    language?: string;      // 코드 블록의 언어
    checked?: boolean;      // 체크박스 상태
    memoId?: string;        // 메모 링크의 대상 메모 ID
    memoTitle?: string;     // 메모 링크의 제목
  };
}

// 정렬 타입
export type SortOption = 'created' | 'name' | 'updated';

// UI 상태 타입
export interface AppState {
  selectedProject: Project | null;
  selectedMemo: Memo | null;
  projects: Project[];
  memos: Memo[];
  isProjectSidebarHovered: boolean;
  sortOption: SortOption;
  isLoading: boolean;
  error: string | null;
}

// Context 액션 타입
export interface AppContextType {
  state: AppState;

  // Project Actions
  selectProject: (project: Project) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<void>;
  verifyProjectPassword: (projectId: string, password: string) => Promise<boolean>;

  // Memo Actions
  selectMemo: (memo: Memo) => Promise<void>;
  createMemo: (title: string) => Promise<void>;
  updateMemo: (content: string) => Promise<void>;
  setSortOption: (option: SortOption) => void;

}
