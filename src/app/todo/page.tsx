'use client';
import MemoListSection from "./_components/MemoListSection";
import ProjectSection from "./_components/ProjectSection";
import ScreenShare from './_components/ScreenShare';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <ProjectSection/>
      <MemoListSection/>
      <ScreenShare />
    </div>
  );
}
