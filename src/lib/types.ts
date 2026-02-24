export type CommandLineType = "output" | "input" | "system";
export type CommandLine = { type: CommandLineType; text: string };
export type CommandResult =
  | string
  | string[]
  | void
  | Promise<string | string[] | void>;

export type CommandHandler = (cmd: string, args: string[]) => CommandResult;

export type GameAPIInterface = {
  exec: CommandHandler;
};

export type TerminalHandler = {
  focus: () => void;
  blur: () => void;
  read: (opts?: ReadOptionsInterface) => Promise<string>;
  print: (lines: string | string[]) => void;
};

export interface ReadOptionsInterface {
  label?: string;
  isSecret?: boolean;
}

export interface ReadRequestInterface extends ReadOptionsInterface {
  resolve: (v: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (e?: any) => void;
}

export interface TerminalProps {
  /** Header prompt name (e.g. "guest@portfolio:~") */
  prompt?: string;
  /** Welcome lines shown on mount */
  welcomeMessages?: string[];
  /** Consumer-defined command handler — runs BEFORE builtIns */
  onCommand?: CommandHandler;
  /** Optional callback when user types 'exit' — if omitted, 'exit' is not registered */
  onExit?: () => void;
  /** Optional header controls (e.g. maximize/close buttons) — rendered right side of header */
  headerControls?: import('react').ReactNode;
  /** Height of scrollable body — CSS value or number (px). Default: '100%' */
  height?: number | string;
  /** Additional CSS class for the outermost container */
  className?: string;
}

// Project 관련 타입
export interface ProjectInterface {
  id: string;
  name: string;
  icon: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequestInterface {
  name: string;
  icon: string;
  isSecret: boolean;
  password?: string;
}

export interface VerifyPasswordRequestInterface {
  projectId: string;
  password: string;
}

// Memo 관련 타입
export interface MemoInterface {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMemoRequestInterface {
  projectId: string;
  title: string;
}

export interface UpdateMemoRequestInterface {
  id: string;
  content: string;
}

// 메모 콘텐츠 블록 타입
export interface ContentBlockInterface {
  type: "text" | "code" | "checkbox" | "memo-link";
  content: string;
  metadata?: {
    language?: string; // 코드 블록의 언어
    checked?: boolean; // 체크박스 상태
    memoId?: string; // 메모 링크의 대상 메모 ID
    memoTitle?: string; // 메모 링크의 제목
  };
}

// 정렬 타입
export type SortOption = "created" | "name" | "updated";

// UI 상태 타입
export interface TodoAppStateInterface {
  selectedProject: ProjectInterface | null;
  selectedMemo: MemoInterface | null;
  projects: ProjectInterface[];
  memos: MemoInterface[];
  isProjectSidebarHovered: boolean;
  sortOption: SortOption;
  isLoading: boolean;
  error: string | null;
}

// Context 액션 타입
export interface TodoAppContextTypeInterface {
  state: TodoAppStateInterface;

  // Project Actions
  selectProject: (project: ProjectInterface) => Promise<void>;
  createProject: (data: CreateProjectRequestInterface) => Promise<void>;
  verifyProjectPassword: (
    projectId: string,
    password: string,
  ) => Promise<boolean>;

  // Memo Actions
  selectMemo: (memo: MemoInterface) => Promise<void>;
  createMemo: (title: string) => Promise<void>;
  updateMemo: (content: string) => Promise<void>;
  setSortOption: (option: SortOption) => void;
}
