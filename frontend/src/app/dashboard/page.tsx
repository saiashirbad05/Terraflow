"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import ColumnInput from "../components/ColumnInput";
import ColumnDashboard from "../components/ColumnDashboard";
import ColumnNudges from "../components/ColumnNudges";
import ColumnProgress from "../components/ColumnProgress";
import { CarbonProvider, useCarbon } from "../../context/CarbonContext";

function DashboardContent() {
  const { user } = useCarbon();
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("terraflow_user");
    if (!savedUser && !user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-[#070F0E] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9F5] text-[#1A1A1A] flex flex-col font-sans select-none overflow-x-hidden antialiased">
      {/* Top Operational Navigation bar */}
      <TopNav />
      
      {/* Core Widescreen 16:9 Viewport Layout Container */}
      <main className="flex-grow w-full max-w-[1920px] mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        <ColumnInput />
        <ColumnDashboard />
        <ColumnNudges />
        <ColumnProgress />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <CarbonProvider>
      <DashboardContent />
    </CarbonProvider>
  );
}