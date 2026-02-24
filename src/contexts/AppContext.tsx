'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  TodoAppStateInterface,
  TodoAppContextTypeInterface,
  ProjectInterface,
  MemoInterface,
  CreateProjectRequestInterface,
  SortOption,
} from '@/lib/types';
import * as api from '@/lib/api';

const initialState: TodoAppStateInterface = {
  selectedProject: null,
  selectedMemo: null,
  projects: [],
  memos: [],
  isProjectSidebarHovered: false,
  sortOption: 'created',
  isLoading: false,
  error: null,
};

const AppContext = createContext<TodoAppContextTypeInterface | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TodoAppStateInterface>(initialState);


  const loadProjects = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const projects = await api.getAllProjects();
      setState((prev) => ({ ...prev, projects, isLoading: false }));
     } catch {
      setState((prev) => ({
        ...prev,
        error: '프로젝트 목록을 불러오는데 실패했습니다.',
        isLoading: false,
      }));
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    Promise.resolve().then(loadProjects);
  }, []);

  // Project Actions
  const selectProject = useCallback(async (project: ProjectInterface) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // 프로젝트의 메모 리스트 로드
      const memos = await api.getProjectMemos(project.id);

      setState((prev) => ({
        ...prev,
        selectedProject: project,
        memos,
        selectedMemo: null, // 프로젝트 변경 시 선택된 메모 초기화
        isLoading: false,
      }));
     } catch {
      setState((prev) => ({
        ...prev,
        error: '메모 목록을 불러오는데 실패했습니다.',
        isLoading: false,
      }));
    }
  }, []);

  const createProject = useCallback(
    async (data: CreateProjectRequestInterface) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const newProject = await api.createProject(data);

        setState((prev) => ({
          ...prev,
          projects: [...prev.projects, newProject],
          isLoading: false,
        }));

        // 새로 생성한 프로젝트 자동 선택
        await selectProject(newProject);
       } catch (error) {
        setState((prev) => ({
          ...prev,
          error: '프로젝트 생성에 실패했습니다.',
          isLoading: false,
        }));
        throw error;
      }
    },
    [selectProject]
  );

  const verifyProjectPassword = useCallback(
    async (projectId: string, password: string): Promise<boolean> => {
      try {
        const verified = await api.verifyPassword(projectId, password);
        return verified;
       } catch {
        setState((prev) => ({
          ...prev,
          error: '비밀번호 검증에 실패했습니다.',
        }));
        return false;
      }
    },
    []
  );

  // Memo Actions
  const selectMemo = useCallback(async (memo: MemoInterface) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // 메모 상세 정보 로드
      const fullMemo = await api.getMemo(memo.id);

      setState((prev) => ({
        ...prev,
        selectedMemo: fullMemo,
        isLoading: false,
      }));
     } catch {
      setState((prev) => ({
        ...prev,
        error: '메모를 불러오는데 실패했습니다.',
        isLoading: false,
      }));
    }
  }, []);

  const createMemo = useCallback(
    async (title: string) => {
      if (!state.selectedProject) {
        setState((prev) => ({
          ...prev,
          error: '프로젝트를 먼저 선택해주세요.',
        }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const newMemo = await api.createMemo({
          projectId: state.selectedProject.id,
          title,
        });

        setState((prev) => ({
          ...prev,
          memos: [...prev.memos, newMemo],
          isLoading: false,
        }));

        // 새로 생성한 메모 자동 선택
        await selectMemo(newMemo);
       } catch (error) {
        setState((prev) => ({
          ...prev,
          error: '메모 생성에 실패했습니다.',
          isLoading: false,
        }));
        throw error;
      }
    },
    [state.selectedProject, selectMemo]
  );

  const updateMemo = useCallback(
    async (content: string) => {
      if (!state.selectedMemo) {
        setState((prev) => ({
          ...prev,
          error: '메모를 먼저 선택해주세요.',
        }));
        return;
      }

      try {
        const updatedMemo = await api.updateMemo(state.selectedMemo.id, content);

        setState((prev) => ({
          ...prev,
          selectedMemo: updatedMemo,
          memos: prev.memos.map((memo) =>
            memo.id === updatedMemo.id ? updatedMemo : memo
          ),
        }));
       } catch (error) {
        setState((prev) => ({
          ...prev,
          error: '메모 저장에 실패했습니다.',
        }));
        throw error;
      }
    },
    [state.selectedMemo]
  );

  const setSortOption = useCallback((option: SortOption) => {
    setState((prev) => ({ ...prev, sortOption: option }));
  }, []);

  // URL 쿼리 파라미터로 메모 열기
  useEffect(() => {
    const openMemoFromUrl = async () => {
      if (typeof window === 'undefined' || state.projects.length === 0) return;

      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId');
      const memoId = urlParams.get('memoId');

      if (projectId && memoId) {
        const project = state.projects.find((p) => p.id === projectId);
        if (project && (!state.selectedProject || state.selectedProject.id !== projectId)) {
          await selectProject(project);

          // 메모 선택
          setTimeout(async () => {
            try {
              const memos = await api.getProjectMemos(projectId);
              const memo = memos.find((m) => m.id === memoId);
              if (memo) {
                await selectMemo(memo);
              }
             } catch (error) {
              console.error('Failed to load memo from URL:', error);
            }
          }, 100);
        }
      }
    };

    openMemoFromUrl();
  }, [state.projects, state.selectedProject, selectProject, selectMemo]);

  const value: TodoAppContextTypeInterface = {
    state,
    selectProject,
    createProject,
    verifyProjectPassword,
    selectMemo,
    createMemo,
    updateMemo,
    setSortOption,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): TodoAppContextTypeInterface {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
