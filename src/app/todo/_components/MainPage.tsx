"use client";
import { useState, useEffect } from "react";
import ProjectSection from "./ProjectSection";
import MemoListSection from "./MemoListSection";
export default function MainPage() {

  return ( 
    <div>
      <ProjectSection/>
      <MemoListSection/>
    </div>
  );
}
