"use client";

import React, { useState, useEffect } from "react";
import { useCarbon, CarbonProvider } from "../context/CarbonContext";
import MockGoogleModal from "./components/MockGoogleModal";
import Logo from "./components/Logo";
import { motion } from "framer-motion";
import { Shield, Leaf, LogIn, ArrowRight, CornerDownRight, CheckCircle2, Lock, Eye, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

function LandingContent() {
  const { user, loginWithGoogle } = useCarbon();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  // Live Sandbox states
  const [sandboxCategory, setSandboxCategory] = useState<"transport" | "diet" | "utilities">("transport");
  const [sandboxItem, setSandboxItem] = useState("electric_vehicle");
  const [sandboxAmount, setSandboxAmount] = useState("15");

  // Keep local state matching emissions for the landing page sandbox chart
  const [sandboxEmissions, setSandboxEmissions] = useState({
    transport: 6.15,
    diet: 2.1,
    utilities: 5.2,
  });

  // Items mapped by category
  const categoryItems = {
    transport: [
      { id: "standard_gasoline_car", name: "Standard Gasoline Car", coef: 0.41, unit: "mi" },
      { id: "electric_vehicle", name: "Electric Vehicle (EV)", coef: 0.15, unit: "mi" },
      { id: "public_bus", name: "Public Bus", coef: 0.12, unit: "mi" },
      { id: "metro_train", name: "Metro Train", coef: 0.08, unit: "mi" },
    ],
    diet: [
      { id: "beef_meal", name: "Mutton Curry / Fry", coef: 4.2, unit: "servings" },
      { id: "chicken_meal", name: "Chicken Curry / Tikka", coef: 1.1, unit: "servings" },
      { id: "fish_meal", name: "Fish Fry / Curry", coef: 1.3, unit: "servings" },
      { id: "paneer_dairy", name: "Paneer / Dairy Dish", coef: 1.8, unit: "servings" },
      { id: "veg_meal", name: "Dal Roti / Veg Meal", coef: 0.3, unit: "servings" },
    ],
    utilities: [
      { id: "grid_electricity", name: "Grid Electricity", coef: 0.52, unit: "kWh" },
      { id: "solar_power", name: "Solar Power", coef: 0.05, unit: "kWh" },
      { id: "natural_gas_heating", name: "Natural Gas Heating", coef: 0.22, unit: "kWh" },
    ],
  };

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Keep sandboxItem in sync when category changes
  useEffect(() => {
    const items = categoryItems[sandboxCategory];
    setSandboxItem(items[0].id);
    if (sandboxCategory === "transport") setSandboxAmount("15");
    else if (sandboxCategory === "diet") setSandboxAmount("1");
    else setSandboxAmount("10");
  }, [sandboxCategory]);

  // Update sandbox emissions graph in real-time based on sandbox inputs
  useEffect(() => {
    const amt = parseFloat(sandboxAmount);
    if (isNaN(amt) || amt <= 0) return;

    const items = categoryItems[sandboxCategory];
    const selected = items.find((i) => i.id === sandboxItem) || items[0];
    const calculatedImpact = parseFloat((amt * selected.coef).toFixed(2));
    
    setSandboxEmissions((prev) => ({
      ...prev,
      [sandboxCategory]: calculatedImpact,
    }));
  }, [sandboxCategory, sandboxItem, sandboxAmount]);

  const currentUnit = categoryItems[sandboxCategory].find((i) => i.id === sandboxItem)?.unit || "units";
  const currentItemLabel = categoryItems[sandboxCategory].find((i) => i.id === sandboxItem)?.name || "";

  // Recharts graph data for landing sandbox
  const graphData = [
    { name: "Travel Impact", value: sandboxEmissions.transport, color: "#3B5B4F" },
    { name: "Food Impact", value: sandboxEmissions.diet, color: "#D4A373" },
    { name: "Energy Impact", value: sandboxEmissions.utilities, color: "#8B85B8" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1A1A] overflow-x-hidden font-sans selection:bg-[#E2ECE9] relative">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5E5E0_1px,transparent_1px),linear-gradient(to_bottom,#E5E5E0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none z-0" />

      {/* Floating Navigation */}
      <div className="w-full sticky top-4 z-40 px-4">
        <nav className="max-w-5xl mx-auto border border-[#E5E5E0] bg-[#FAF9F5]/90 backdrop-blur-md rounded-2xl px-6 py-3.5 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <Logo className="w-11 h-11" />
            <span className="text-sm font-extrabold tracking-wider uppercase font-display text-[#1A1A1A]">TerraFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50">
            <a href="#how-it-works" className="hover:text-[#3B5B4F] transition-colors">How It Works</a>
            <a href="#sandbox" className="hover:text-[#3B5B4F] transition-colors">Interactive Sandbox</a>
            <a href="#security" className="hover:text-[#3B5B4F] transition-colors">Security & Trust</a>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2 rounded-lg bg-[#3B5B4F] hover:bg-[#2C443B] text-[#FAF9F5] transition-all font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </button>
        </nav>
      </div>

      {/* Hero Header */}
      <header className="relative w-full max-w-5xl mx-auto px-6 pt-16 pb-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2ECE9] border border-[#C8DBD5] text-[#2C443B] text-[10px] font-bold uppercase tracking-widest">
            Simple Carbon Tracking
          </div>

          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-[#1A1A1A] leading-[1.05] font-display">
            A simple diary <br />
            for your <span className="font-serif-italic text-[#3B5B4F] font-normal tracking-normal">carbon goals.</span>
          </h1>

          <p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed">
            TerraFlow helps you understand the carbon footprint of your everyday choices. No confusing setups, math, or endless forms. Just write down or select what you did and see the impact instantly.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-3.5 bg-[#3B5B4F] hover:bg-[#2C443B] text-[#FAF9F5] font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-3 text-xs uppercase tracking-wider"
            >
              Sign In with Google
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>
            <a
              href="#sandbox"
              className="text-[#3B5B4F] hover:text-[#2C443B] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 justify-center"
            >
              Try the interactive sandbox
              <CornerDownRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Hero Interactive Art Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 bg-white border border-[#E5E5E0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2ECE9]/40 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Carbon Nudge Insight</span>
          <div className="w-10 h-10 rounded-full bg-[#EADBCE]/30 flex items-center justify-center text-[#7F5539]">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-display text-gray-800 leading-tight">Swap mutton for plant-based meals</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Changing a single standard mutton dish to a plant-based alternative reduces the food portion of your carbon impact by over 90% for that meal.
          </p>
          <div className="pt-2 border-t border-[#E5E5E0] flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <span>Estimated Savings</span>
            <span className="text-[#3B5B4F] font-mono font-bold">-3.8 kg CO2e</span>
          </div>
        </motion.div>
      </header>

      {/* Simple Step-by-Step Walkthrough with Scroll trigger */}
      <section id="how-it-works" className="bg-[#F4F3EE] border-y border-[#E5E5E0] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl mx-auto space-y-3"
          >
            <span className="text-[#3B5B4F] text-[10px] font-bold uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] font-display">
              Carbon diary built for simplicity.
            </h2>
            <p className="text-gray-500 text-sm">
              Keep it simple, track your actions, and build sustainable habits.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4 bg-white border border-[#E5E5E0] rounded-xl p-6 hover:shadow-sm transition-shadow"
            >
              <span className="font-display font-bold text-5xl text-[#3B5B4F]/20 leading-none block">01</span>
              <h3 className="text-lg font-bold text-gray-800 font-display">Fast Number Inputs</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No forms or formulas. Click your favorite presets or enter simple values for transit, food, and energy.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 bg-white border border-[#E5E5E0] rounded-xl p-6 hover:shadow-sm transition-shadow"
            >
              <span className="font-display font-bold text-5xl text-[#3B5B4F]/20 leading-none block">02</span>
              <h3 className="text-lg font-bold text-gray-800 font-display">Interactive Feedback</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Watch your daily carbon logs update automatically with immediate visual alerts when you exceed target margins.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4 bg-white border border-[#E5E5E0] rounded-xl p-6 hover:shadow-sm transition-shadow"
            >
              <span className="font-display font-bold text-5xl text-[#3B5B4F]/20 leading-none block">03</span>
              <h3 className="text-lg font-bold text-gray-800 font-display">Low-Sacrifice Nudges</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Receive friendly recommendations based on your logs to help you stay within a safe environmental budget.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Live Sandbox (Try It Live) with Real-Time Chart */}
      <section id="sandbox" className="max-w-5xl mx-auto px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 space-y-6"
        >
          <span className="text-[#3B5B4F] text-[10px] font-bold uppercase tracking-widest">Interactive Calculator</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] font-display">
            Try the live simulator.
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Adjust the sliders or change values below to simulate how different choices affect your carbon output in real time. Switch categories to explore transport, diet, and utility multipliers.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3B5B4F]">
            <CheckCircle2 className="w-4.5 h-4.5" /> Instant math & charts update
          </div>
        </motion.div>

        {/* Sandbox Calculator Widget & Chart Grid */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Controls Card */}
          <div className="md:col-span-6 bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">1. Choose Category</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["transport", "diet", "utilities"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSandboxCategory(cat)}
                      className={`py-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                        sandboxCategory === cat
                          ? "bg-[#3B5B4F] text-[#FAF9F5] border-transparent shadow-sm"
                          : "bg-[#FAF9F5] border-[#E5E5E0] text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {cat === "transport" ? "Travel" : cat === "diet" ? "Food" : "Energy"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">2. Choose Item</label>
                <select
                  value={sandboxItem}
                  onChange={(e) => setSandboxItem(e.target.value)}
                  className="w-full p-2 bg-[#FAF9F5] border border-[#E5E5E0] rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#3B5B4F] text-gray-700"
                >
                  {categoryItems[sandboxCategory].map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.coef} kg/unit)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    3. Amount ({currentUnit})
                  </label>
                  <span className="text-xs font-mono font-bold text-[#3B5B4F]">{sandboxAmount}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={sandboxCategory === "transport" ? "100" : sandboxCategory === "diet" ? "10" : "150"}
                  value={sandboxAmount}
                  onChange={(e) => setSandboxAmount(e.target.value)}
                  className="w-full accent-[#3B5B4F] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                Save Log to Dashboard
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Recharts Visual Card */}
          <div className="md:col-span-6 bg-[#FAF9F5] border border-[#E5E5E0] rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Live Carbon Impact Chart</span>
              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E0" />
                    <XAxis dataKey="name" stroke="#888880" fontSize={8} tickLine={false} />
                    <YAxis stroke="#888880" fontSize={8} tickLine={false} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {graphData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white border border-[#E5E5E0] rounded-lg p-2.5 mt-2 text-center text-[10px] text-gray-500 leading-tight">
              <span className="font-bold text-[#1A1A1A]">{currentItemLabel}</span> output is <span className="font-bold text-[#3B5B4F] font-mono">{sandboxEmissions[sandboxCategory]} kg CO2e</span>.
            </div>
          </div>
        </motion.div>
      </section>

      {/* Security & Governance Section */}
      <section id="security" className="bg-white border-y border-[#E5E5E0] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl mx-auto space-y-3"
          >
            <span className="text-[#3B5B4F] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Security & Trust Assurance
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] font-display">
              Secure by Design.
            </h2>
            <p className="text-gray-500 text-sm">
              We protect your entries and ensure reliable system behavior.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Security Pillar 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6 bg-[#FAF9F5] border border-[#E5E5E0] rounded-xl space-y-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#3B5B4F]">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider font-display">Input Sanitization</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                All raw text entries are sanitized server-side before execution to block cross-site scripting (XSS) and script injections.
              </p>
            </motion.div>

            {/* Security Pillar 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 bg-[#FAF9F5] border border-[#E5E5E0] rounded-xl space-y-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#3B5B4F]">
                <Eye className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider font-display">Payload Guard</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                API payloads are limited to 500 characters, safeguarding computing resources against buffer or resource exhaustion.
              </p>
            </motion.div>

            {/* Security Pillar 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-6 bg-[#FAF9F5] border border-[#E5E5E0] rounded-xl space-y-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#3B5B4F]">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider font-display">Strict Type Checks</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                Strict parsing checks reject empty queries, wrong headers, or non-JSON content with explicit 400 bad request codes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-[#3B5B4F] text-[#FAF9F5] rounded-2xl p-8 md:p-12 text-center space-y-5 relative overflow-hidden shadow-sm"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-display">Start your green streak today.</h2>
          <p className="text-[#FAF9F5]/80 text-sm max-w-md mx-auto leading-relaxed">
            Create a mock account to save your daily logs, track your progress streaks, and unlock achievement badges.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mx-auto px-6 py-3 bg-[#FAF9F5] hover:bg-neutral-100 text-[#3B5B4F] font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            Sign In with Google
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E0] bg-[#FAF9F5] py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5 opacity-60" />
            <p>© 2026 TerraFlow Carbon. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Security Policy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>

      {/* Google Login Modal */}
      <MockGoogleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLogin={(name, email, image) => {
          loginWithGoogle(name, email, image);
          setModalOpen(false);
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <CarbonProvider>
      <LandingContent />
    </CarbonProvider>
  );
}
