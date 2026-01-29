'use client';
import MemoListSection from "./_components/MemoListSection";
import ProjectSection from "./_components/ProjectSection";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <ProjectSection/>
      <MemoListSection/>
    </div>
  );
}