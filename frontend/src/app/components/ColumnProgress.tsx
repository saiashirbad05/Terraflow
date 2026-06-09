"use client";

import React, { useState } from "react";
import { useCarbon } from "../../context/CarbonContext";

export default function ColumnProgress() {
  const { budgetUsedPercentage, streak, totalEmissions, budgetTotal, setBudgetTotal } = useCarbon();
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(budgetTotal.toString());

  // Constrain calculation dynamics for inline circular tracking graphics
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(budgetUsedPercentage, 100) / 100) * circumference;

  const hasData = totalEmissions > 0;

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetValue);
    if (!isNaN(parsed) && parsed > 0) {
      setBudgetTotal(parsed);
      setEditingBudget(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#E5E5E0] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#E2ECE9] border border-[#C8DBD5] flex items-center justify-center text-[#2C443B] font-bold font-display">4</div>
          <h2 className="text-lg font-bold text-gray-800 font-display">Performance Matrix</h2>
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#F4F3EE] rounded-lg border border-dashed border-[#E5E5E0] min-h-[300px]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Awaiting Activity</span>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
              Log activity logs in the first panel to populate carbon ceilings and achievements.
            </p>
          </div>
        ) : (
          <>
            {/* Circular SVG Progress Matrix Segment */}
            <div className="flex flex-col items-center justify-center my-4 animate-fadeIn">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r={radius} className="stroke-stone-200" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    className="stroke-[#3B5B4F] transition-all duration-500 ease-out"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-[#1A1A1A] font-display">{budgetUsedPercentage}%</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Quota Used</span>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 mt-3 text-center leading-normal">
                {editingBudget ? (
                  <form onSubmit={handleBudgetSubmit} className="flex items-center gap-1.5 justify-center mt-1">
                    <input
                      type="number"
                      value={budgetValue}
                      onChange={(e) => setBudgetValue(e.target.value)}
                      className="w-16 p-1 bg-white border border-[#E5E5E0] rounded text-[10px] font-mono text-center"
                      required
                    />
                    <button type="submit" className="px-2 py-1 bg-[#3B5B4F] text-white text-[9px] rounded font-bold uppercase cursor-pointer">
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <span>Weekly Carbon Ceiling: <span className="font-bold text-gray-800">{budgetTotal} kg CO2e</span></span>
                    <button
                      onClick={() => setEditingBudget(true)}
                      className="text-[9px] text-[#3B5B4F] hover:underline font-bold uppercase cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Rewards / Achievement Shelf */}
            <div className="mt-6">
              <span className="text-xs font-bold text-gray-700 block mb-2 font-display">Unlocked Achievements</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 border border-[#EADBCE] rounded-lg bg-[#FAF0E6] flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-[#7F5539] uppercase tracking-wider">Active</span>
                  <span className="text-[10px] font-extrabold text-[#7F5539] mt-1 block leading-tight">{streak} Day Streak</span>
                </div>
                <div className="p-3 border border-[#C8DBD5] rounded-lg bg-[#E2ECE9] flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-[#2C443B] uppercase tracking-wider">Badge</span>
                  <span className="text-[10px] font-extrabold text-[#2C443B] mt-1 block leading-tight">Green Hero</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {hasData && (
        /* Global Leaderboard Mini Widget */
        <div className="mt-6 pt-4 border-t border-[#E5E5E0] animate-fadeIn">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-1.5">
            <span>Regional Cohort</span>
            <span className="text-[#3B5B4F] font-bold">Rank #12</span>
          </div>
          <div className="w-full bg-[#E5E5E0] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#3B5B4F] h-full w-[78%] rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}