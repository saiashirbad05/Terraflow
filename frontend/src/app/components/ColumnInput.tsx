"use client";

import React, { useState } from "react";
import { useCarbon } from "../../context/CarbonContext";

type CategoryType = "transport" | "diet" | "utilities";

export default function ColumnInput() {
  const [activeTab, setActiveTab] = useState<"quick" | "semantic">("quick");
  
  // Quick Presets State
  const [category, setCategory] = useState<CategoryType>("transport");
  const [specificItem, setSpecificItem] = useState("standard_gasoline_car");
  const [amount, setAmount] = useState("");
  
  // Semantic Console State
  const [inputText, setInputText] = useState("");
  const [jsonPreview, setJsonPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { updateEmissions, setStats } = useCarbon();

  // Activity items mapped by category
  const itemPresets = {
    transport: [
      { id: "standard_gasoline_car", label: "Car (Gasoline)", unit: "miles", coef: 0.41 },
      { id: "electric_vehicle", label: "Electric Vehicle (EV)", unit: "miles", coef: 0.12 },
      { id: "public_bus", label: "Public Bus", unit: "miles", coef: 0.15 },
      { id: "metro_train", label: "Metro/Train", unit: "miles", coef: 0.08 },
    ],
    diet: [
      { id: "beef_meal", label: "Beef Curry / Fry", unit: "servings", coef: 4.2 },
      { id: "chicken_meal", label: "Chicken Curry / Tikka", unit: "servings", coef: 1.1 },
      { id: "fish_meal", label: "Fish Fry / Curry", unit: "servings", coef: 1.3 },
      { id: "paneer_dairy", label: "Paneer / Dairy Dish", unit: "servings", coef: 1.8 },
      { id: "veg_meal", label: "Dal Roti / Veg Meal", unit: "servings", coef: 0.3 },
    ],
    utilities: [
      { id: "grid_electricity", label: "Grid Power", unit: "kWh", coef: 0.52 },
      { id: "solar_power", label: "Solar Power", unit: "kWh", coef: 0.05 },
      { id: "natural_gas_heating", label: "Natural Gas Heating", unit: "hours", coef: 0.38 },
    ],
  };

  // Handle Quick Logger Submit
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const preset = itemPresets[category].find((i) => i.id === specificItem);
    if (!preset) return;

    const totalImpact = parseFloat((val * preset.coef).toFixed(2));
    updateEmissions(category, totalImpact);

    // Format output preview for consistency
    const resultJson = {
      transaction_id: `tx_${Date.now()}_preset`,
      parse_successful: true,
      extracted_activities: [
        {
          category,
          metric_value: val,
          unit: preset.unit,
          specific_item: specificItem,
          confidence_score: 1.0,
        },
      ],
    };

    setJsonPreview(JSON.stringify(resultJson, null, 2));
    setAmount("");
  };

  // Handle Semantic Parser Submit
  const handleSemanticSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setJsonPreview(null);

    try {
      const response = await fetch("/api/parse-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw_text_input: inputText,
        }),
      });

      if (!response.ok) throw new Error("Failed to contact parser API");
      const data = await response.json();

      if (data.parse_successful && data.extracted_activities.length > 0) {
        setJsonPreview(JSON.stringify(data, null, 2));
        if (data.emissions && data.totalEmissions !== undefined) {
          setStats(data.emissions, data.totalEmissions);
        }
        setInputText("");
      } else {
        setJsonPreview(JSON.stringify({ error: "Could not resolve activities." }, null, 2));
      }
    } catch (err) {
      setJsonPreview(JSON.stringify({ error: "API Connection Error" }, null, 2));
    } finally {
      setIsProcessing(false);
    }
  };

  // Get active unit label
  const activeUnit = itemPresets[category].find((i) => i.id === specificItem)?.unit || "";

  return (
    <div className="bg-[#FAF9F5] border border-[#E5E5E0] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#E2ECE9] border border-[#C8DBD5] flex items-center justify-center text-[#2C443B] font-bold font-display">1</div>
            <h2 className="text-lg font-bold text-gray-800 font-display">Activity Log</h2>
          </div>
          {/* Tab Selector */}
          <div className="flex bg-[#F4F3EE] p-1 rounded-lg border border-[#E5E5E0]">
            <button
              onClick={() => setActiveTab("quick")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                activeTab === "quick" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Quick Presets
            </button>
            <button
              onClick={() => setActiveTab("semantic")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                activeTab === "semantic" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              AI Console
            </button>
          </div>
        </div>

        {/* Tab 1: Numbers Only Quick Logger */}
        {activeTab === "quick" && (
          <form onSubmit={handleQuickSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["transport", "diet", "utilities"] as CategoryType[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setSpecificItem(itemPresets[cat][0].id);
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg border capitalize transition-all cursor-pointer ${
                      category === cat
                        ? "bg-[#3B5B4F] text-[#FAF9F5] border-transparent"
                        : "bg-white border-[#E5E5E0] text-gray-600 hover:bg-neutral-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Activity
                </label>
                <select
                  value={specificItem}
                  onChange={(e) => setSpecificItem(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E5E5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3B5B4F] focus:border-transparent text-gray-700"
                >
                  {itemPresets[category].map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Amount ({activeUnit})
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full p-2.5 bg-white border border-[#E5E5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3B5B4F] focus:border-transparent text-gray-800 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3B5B4F] hover:bg-[#2C443B] text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              Add Activity Log
            </button>
          </form>
        )}

        {/* Tab 2: Semantic Text Box */}
        {activeTab === "semantic" && (
          <form onSubmit={handleSemanticSubmit} className="space-y-3">
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              Describe your day's consumption naturally, and let our semantic parser extract details.
            </p>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., I drove my electric vehicle for 20 miles and had lunch..."
              className="w-full h-32 p-3 bg-white border border-[#E5E5E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5B4F] focus:border-transparent font-sans resize-none transition-all placeholder-gray-400 text-gray-800"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#3B5B4F] hover:bg-[#2C443B] text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? "Processing fields..." : "Process Text Log"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 flex-grow flex flex-col justify-end">
        <label className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wider font-mono">
          Structured Live JSON Pipeline Output
        </label>
        <div className="w-full h-32 bg-[#1A1A1A] rounded-lg p-3 overflow-y-auto font-mono text-[11px] text-emerald-400 border border-[#FAF9F5] shadow-inner">
          {jsonPreview ? <pre>{jsonPreview}</pre> : <span className="text-gray-500 italic">// Awaiting input streams...</span>}
        </div>
      </div>
    </div>
  );
}