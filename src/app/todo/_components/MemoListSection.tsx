import { Input } from "@/components/ui/Input";
import { useApp } from "@/contexts/AppContext";
import { SORT_OPTIONS } from "@/lib/constants";
import { MemoInterface } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useMemo, useState } from "react";
import { MemoSection } from "./MemoSection";

export default function MemoListSection() {
  const {
    state: { selectedProject, memos, selectedMemo, sortOption },
    selectMemo,
    createMemo,
    setSortOption,
  } = useApp();

  const [newMemoTitle, setNewMemoTitle] = useState('');

  // Sort memos
  const sortedMemos = useMemo(() => {
    const sorted = [...memos];

    switch (sortOption) {
      case 'created':
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'updated':
        return sorted.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      default:
        return sorted;
    }
  }, [memos, sortOption]);

  const handleCreateMemo = async () => {
    if (!newMemoTitle.trim()) return;

    try {
      await createMemo(newMemoTitle);
      setNewMemoTitle('');
    } catch (error) {
      console.error('Failed to create memo:', error);
    }
  };

  const handleMemoClick = (memo: MemoInterface, e: React.MouseEvent) => {
    // Ctrl (또는 Cmd) 키를 누른 채로 클릭하면 링크 텍스트 생성
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const linkText = `[@${memo.title}](memo://${memo.id})`;

      // 클립보드에 복사
      navigator.clipboard.writeText(linkText).then(() => {
        // 성공 알림 (간단하게 콘솔로)
        console.log(`메모 링크가 클립보드에 복사되었습니다: ${linkText}`);

        // 커스텀 이벤트 발생 (MemoSection에서 감지 가능)
        window.dispatchEvent(
          new CustomEvent('insertMemoLink', {
            detail: { id: memo.id, title: memo.title },
          })
        );
      });
    } else {
      selectMemo(memo);
    }
  };

  if (!selectedProject) return <div></div>;
  return (
    <div className="content">
      <div className="main-container">
        <div className="title-container">
          <span>{selectedProject.name}</span>          
        </div>
        <div className="main">
          <div style={{ paddingTop: "20px" }}>
            <span style={{ fontWeight: "bold", fontSize: "20px" }}>Tasks</span>{" "}
            <span className="task-count">({memos.length})</span>
          </div>
          <div className="new-task-container">
          <Input
              className="new-task"
              value={newMemoTitle}
              onChange={setNewMemoTitle}
              placeholder="Type a new task!"
              onKeyUp={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  handleCreateMemo();
                }
              }}
            />            
            <span className="guide-text">Enter!</span>
          </div>
          {/* Sort Options */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="task-container">

            {sortedMemos.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                메모가 없습니다.
                <br />
                위에서 새 메모를 만들어보세요.
              </div>
            ) : (
              sortedMemos.map((memo: MemoInterface) => (
                <div
                  key={memo.id}
                  onClick={(e) => handleMemoClick(memo, e)}
                  className={
                    `task ${selectedMemo?.id === memo.id ? 'task-selected' : ''} flex flex-row justify-between w-full`                    
                  }
                >
                  <h3 className="truncate">
                    {memo.title}
                  </h3>
                  <div className="flex flex-col gap-1 text-xs text-gray-500 mr-2">
                    <span>생성: {formatDate(memo.createdAt)}</span>
                    <span>편집: {formatDate(memo.updatedAt)}</span>
                  </div>
                </div>
              ))
            )}
            
          </div>
        </div>
        <MemoSection />
      </div>
    </div>
  );
}