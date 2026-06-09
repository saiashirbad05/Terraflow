"use client";

import React, { useState } from "react";
import { useCarbon } from "../../context/CarbonContext";
import Logo from "./Logo";

export default function TopNav() {
  const { streak, totalEmissions, user, logout } = useCarbon();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="w-full bg-[#FAF9F5] border-b border-[#E5E5E0] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-50">
      <div className="flex items-center gap-3">
        <Logo className="w-12 h-12" />
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none font-display">TerraFlow</h1>
          <span className="text-[9px] font-bold text-[#3B5B4F] uppercase tracking-widest block mt-0.5">
            Carbon Insights Engine // Minimalist
          </span>
        </div>
      </div>

      {/* Real-time Tracking Context Telemetry Pill Indicators */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-[#E2ECE9] border border-[#C8DBD5] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#3B5B4F] animate-pulse" />
          <span className="text-[#2C443B] font-medium font-mono">Telemetry Active</span>
        </div>

        <div className="bg-[#FAF0E6] border border-[#EADBCE] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
          <span className="text-[#7F5539] font-bold">Streak:</span>
          <span className="font-extrabold text-[#7F5539] font-mono">{streak} Days</span>
        </div>

        <div className="bg-[#EAE6F3] border border-[#DCD3EB] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
          <span className="text-[#5C4D7D] font-bold">∑ Real-time Load:</span>
          <span className="font-extrabold text-[#5C4D7D] font-mono">{totalEmissions} kg CO2e</span>
        </div>

        {/* User profile with Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-[#FAF9F5] hover:bg-neutral-100 border border-[#E5E5E0] rounded-lg p-1 pr-3 transition-all cursor-pointer"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-[#E5E5E0]"
                />
              ) : (
                <div className="w-7 h-7 rounded bg-[#3B5B4F] text-[#FAF9F5] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-semibold text-gray-700">{user.name.split(" ")[0]}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg shadow-md py-1 text-sm z-50">
                <div className="px-4 py-2 border-b border-[#E5E5E0]">
                  <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs text-red-600 font-bold">
            Guest Account
          </div>
        )}
      </div>
    </header>
  );
}