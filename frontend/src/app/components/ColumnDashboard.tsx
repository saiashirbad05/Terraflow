"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useCarbon } from "../../context/CarbonContext";

export default function ColumnDashboard() {
  const { emissions, totalEmissions } = useCarbon();

  const graphData = [
    { name: "Transport", value: emissions.transport, color: "#3B5B4F" },
    { name: "Diet", value: emissions.diet, color: "#D4A373" },
    { name: "Utilities", value: emissions.utilities, color: "#8B85B8" },
  ];

  const hasData = totalEmissions > 0;

  return (
    <div className="bg-[#FAF9F5] border border-[#E5E5E0] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#FAF0E6] border border-[#EADBCE] flex items-center justify-center text-[#7F5539] font-bold font-display">2</div>
          <h2 className="text-lg font-bold text-gray-800 font-display">Emissions Dashboard</h2>
        </div>
        
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#F4F3EE] rounded-lg border border-dashed border-[#E5E5E0] min-h-[300px]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Awaiting Telemetry Data</span>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
              No activity logs recorded. Input travel, food, or utility data to generate real-time infographics.
            </p>
          </div>
        ) : (
          <>
            {/* Core Live Data Counters */}
            <div className="bg-[#F4F3EE] border border-[#E5E5E0] rounded-lg p-4 text-center mb-4">
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Total CO2e Accumulation</span>
              <div className="text-3xl font-bold text-[#1A1A1A] font-display tracking-tight my-0.5">
                {totalEmissions} <span className="text-sm font-medium text-gray-500">kg</span>
              </div>
              <span className="text-[10px] text-[#2C443B] font-semibold">Decrease versus baseline target</span>
            </div>

            {/* Dynamic Recharts Bar Visualization */}
            <div className="w-full h-48 mt-4 animate-fadeIn">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E0" />
                  <XAxis dataKey="name" stroke="#888880" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888880" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F4F3EE' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {graphData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {hasData && (
        <div className="mt-6 pt-4 border-t border-[#E5E5E0] grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Transport</span>
            <span className="text-xs font-bold text-[#3B5B4F] font-mono">{emissions.transport}kg</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Diet</span>
            <span className="text-xs font-bold text-[#D4A373] font-mono">{emissions.diet}kg</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Utilities</span>
            <span className="text-xs font-bold text-[#8B85B8] font-mono">{emissions.utilities}kg</span>
          </div>
        </div>
      )}
    </div>
  );
}