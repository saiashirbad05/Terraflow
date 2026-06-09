"use client";

import React, { useState } from "react";
import { useCarbon } from "../../context/CarbonContext";

interface NudgeCard {
  id: string;
  title: string;
  impact: string;
  impactVal: number;
  category: "transport" | "diet" | "utilities";
  colorClass: string;
}

export default function ColumnNudges() {
  const { updateEmissions } = useCarbon();
  const [nudges, setNudges] = useState<NudgeCard[]>([
    { id: "n_1", title: "Opt for public metro line over solo transit loops tomorrow.", impact: "-3.4 kg", impactVal: -3.4, category: "transport", colorClass: "border-[#C8DBD5] bg-[#E2ECE9] text-[#2C443B]" },
    { id: "n_2", title: "Switch tomorrow's lunch protein source to plant alternatives.", impact: "-2.1 kg", impactVal: -2.1, category: "diet", colorClass: "border-[#EADBCE] bg-[#FAF0E6] text-[#7F5539]" },
    { id: "n_3", title: "Configure standby appliance kill switches to reduce idle power.", impact: "-1.5 kg", impactVal: -1.5, category: "utilities", colorClass: "border-[#DCD3EB] bg-[#EAE6F3] text-[#5C4D7D]" }
  ]);

  const handleApplyNudge = (nudge: NudgeCard) => {
    // Subtract from context emissions
    updateEmissions(nudge.category, nudge.impactVal);
    // Remove nudge from active suggestion queue
    setNudges((prev) => prev.filter((item) => item.id !== nudge.id));
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#E5E5E0] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#EAE6F3] border border-[#DCD3EB] flex items-center justify-center text-[#5C4D7D] font-bold font-display">3</div>
          <h2 className="text-lg font-bold text-gray-800 font-display">Behavioral Nudges</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Dynamic context recommendations triggered by calculated telemetry overheads. Click action nodes to add entries to goals.
        </p>

        <div className="space-y-3">
          {nudges.length > 0 ? (
            nudges.map((nudge) => (
              <div key={nudge.id} className={`p-4 border-l-4 rounded-r-lg flex flex-col justify-between gap-3 transition-all hover:translate-x-0.5 shadow-sm ${nudge.colorClass}`}>
                <p className="text-xs font-semibold leading-relaxed">{nudge.title}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-white/60 rounded border border-white/40">
                    Impact: {nudge.impact}
                  </span>
                  <button
                    onClick={() => handleApplyNudge(nudge)}
                    className="text-[10px] font-bold text-gray-700 hover:text-gray-950 px-2.5 py-1 rounded bg-white border border-gray-200 hover:shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    + Add to Plan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-gray-400 italic bg-[#F4F3EE] rounded-lg border border-dashed border-[#E5E5E0]">
              All behavioral reduction targets are currently optimized. Check back later!
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#3B5B4F] text-[#FAF9F5] p-3 rounded-lg flex items-center justify-between text-xs font-semibold mt-4">
        <span>Active Mitigation Plan:</span>
        <span className="bg-[#FAF9F5] text-[#3B5B4F] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          {nudges.length} Items Queued
        </span>
      </div>
    </div>
  );
}