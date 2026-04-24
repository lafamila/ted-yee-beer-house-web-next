export type CommandLineType = "output" | "input" | "system";
export type CommandLine = { type: CommandLineType; text: string; className?: string };
export type CommandResult =
  | string
  | string[]
  | void
  | Promise<string | string[] | void>;

export type CommandHandler = (cmd: string, args: string[]) => CommandResult;

export type GameAPIInterface = {
  exec: CommandHandler;
  showBubble: (text: string) => void;
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
  promptPrefix?: string;
  hidePrompt?: boolean;
  inputClassName?: string;
  /** Fixed status line rendered above the input (e.g. vim's "-- INSERT --") */
  statusLine?: string;
}

// Project 관련 타입
export interface ProjectInterface {
  id: string;
  name: string;
  icon: string;
  isSecret: boolean;
  ownerId?: string;
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
  createdBy?: string;
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

// Article (게시글) 관련 타입
export interface ArticleInterface {
  id: string;
  memoId: string;
  projectId: string;
  title: string;
  content: string;
  publishedVersion: number;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  projectName?: string;
  projectIcon?: string;
  isSecret?: boolean;
}

// 목록 조회용 (content 제외)
export interface ArticleListItemInterface {
  id: string;
  memoId: string;
  projectId: string;
  title: string;
  publishedVersion: number;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  projectName?: string;
  projectIcon?: string;
  isSecret?: boolean;
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
  selectedMemoIds: string[];
  members: ProjectMemberInterface[];
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
  toggleSelectMemo: (memoId: string) => void;
  clearSelectedMemos: () => void;
  deleteMemos: (memoIds: string[]) => Promise<void>;

  // Member Actions
  loadMembers: (projectId: string) => Promise<void>;
  inviteMember: (projectId: string, userId: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
}

// User / Auth 관련 타입
export interface UserInterface {
  id: string;
  username: string;
  displayName: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
}

// Daily Task Tracker 타입
export interface CalendarDayInterface {
  date: string;
  completedCount: number;
  totalCount: number;
  ratio: number;
}

export interface CalendarMonthInterface {
  year: number;
  month: number;
  totalTaskTypes: number;
  days: CalendarDayInterface[];
}

export interface DailyTaskTypeInterface {
  id: string;
  name: string;
  icon: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DayDetailTaskInterface {
  taskTypeId: string;
  name: string;
  icon: string;
  completed: boolean;
}

export interface DayDetailInterface {
  date: string;
  tasks: DayDetailTaskInterface[];
}

export interface LoginResponseInterface {
  accessToken: string;
  tokenType: string;
  user: UserInterface;
}

export interface ProjectMemberInterface {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  invitedAt: string;
  username: string;
  displayName: string;
  isAdmin: boolean;
}

export type TravelPlaceCategory =
  | "food"
  | "coffee"
  | "bar"
  | "culture"
  | "nature"
  | "shopping"
  | "stay"
  | "other";

export interface TravelPlaceInterface {
  id: string;
  category: TravelPlaceCategory;
  name: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  description?: string | null;
  openingHours?: string | null;
  specialNotes?: string | null;
  coverImageUrl?: string | null;
  photoUrls: string[];
  tags: string[];
  reviews: TravelReviewInterface[];
  createdAt: string;
  updatedAt: string;
}

export interface TravelReviewInterface {
  id: string;
  placeId: string;
  rating: number;
  headline?: string | null;
  body: string;
  visitedAt?: string | null;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TravelCourseStopInterface {
  placeId: string;
  placeName: string;
  order: number;
  scheduledAt?: string | null;
  note?: string | null;
  reasoningText?: string | null;
  transitHint?: string | null;
}

export interface TravelCourseInterface {
  id: string;
  title: string;
  startLocation?: string | null;
  tripStartAt?: string | null;
  tripEndAt?: string | null;
  transportMode?: string | null;
  summary?: string | null;
  promptText?: string | null;
  outputFormatVersion: string;
  stops: TravelCourseStopInterface[];
  createdAt: string;
  updatedAt: string;
}

export interface TravelPlaceRequestInterface {
  name: string;
  category: TravelPlaceCategory;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  openingHours?: string;
  specialNotes?: string;
  coverImageUrl?: string;
  photoUrls?: string[];
  tags?: string[];
}

export interface TravelReviewRequestInterface {
  rating: number;
  headline?: string;
  body: string;
  visitedAt?: string;
  photoUrls?: string[];
}

export interface TravelUploadedFileInterface {
  key: string;
  url: string;
  contentType: string;
  filename: string;
}

export interface TravelSelectedPlaceInterface {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  openingHours?: string;
  specialNotes?: string;
  coverImageUrl?: string;
  reviewSummary?: string[];
}

export interface TravelCourseExportRequestInterface {
  tripWindow: {
    startAt: string;
    endAt: string;
  };
  courseStart: {
    label?: string;
    latitude?: number;
    longitude?: number;
  };
  selectedPlaces: TravelSelectedPlaceInterface[];
  selectionContext?: Record<string, string>;
}

export interface TravelCourseExportResponseInterface {
  outputFormatVersion: string;
  payload: Record<string, unknown>;
  promptText: string;
}

export interface TravelCourseImportPayloadInterface {
  outputFormatVersion: string;
  course: {
    title: string;
    startLocation?: string;
    tripWindow?: {
      startAt?: string;
      endAt?: string;
    };
    transportMode?: string;
    summary?: string;
    promptText?: string;
    stops: Array<{
      placeId: string;
      placeName: string;
      scheduledAt?: string;
      note?: string;
      reasoningText?: string;
      transitHint?: string;
    }>;
  };
  validation?: Record<string, unknown>;
}

export interface GoogleMapsLinkResolutionInterface {
  resolvedUrl: string;
  googlePlaceId?: string | null;
  googleMapsUri?: string | null;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  openingHours?: string | null;
  primaryType?: string | null;
}
