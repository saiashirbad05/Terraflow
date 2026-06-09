"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SectorAllocations {
  transport: number;
  diet: number;
  utilities: number;
}

interface User {
  name: string;
  email: string;
  image: string;
}

interface CarbonContextType {
  emissions: SectorAllocations;
  totalEmissions: number;
  streak: number;
  budgetUsedPercentage: number;
  user: User | null;
  budgetTotal: number;
  setBudgetTotal: (val: number) => void;
  updateEmissions: (category: string, value: number) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  setStats: (emissions: SectorAllocations, totalEmissions: number) => void;
  loginWithGoogle: (name: string, email: string, image: string) => void;
  logout: () => void;
}

const CarbonContext = createContext<CarbonContextType | undefined>(undefined);

export const CarbonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [emissions, setEmissions] = useState<SectorAllocations>({
    transport: 0,
    diet: 0,
    utilities: 0,
  });
  const [streak, setStreak] = useState(14);
  const [user, setUser] = useState<User | null>(null);
  const [budgetTotal, setBudgetTotalState] = useState(150.0);
  const [totalEmissions, setTotalEmissions] = useState(0);

  // Sync state from server
  const syncWithBackend = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setEmissions(data.emissions);
        setTotalEmissions(data.totalEmissions);
      }
    } catch (err) {
      console.error("Failed to load telemetry stats from backend:", err);
    }
  };

  // Load user details and logs on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("terraflow_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedBudget = localStorage.getItem("terraflow_budget_total");
    if (savedBudget) {
      const parsed = parseFloat(savedBudget);
      if (!isNaN(parsed) && parsed > 0) {
        setBudgetTotalState(parsed);
      }
    }
    syncWithBackend();
  }, []);

  const setBudgetTotal = (val: number) => {
    setBudgetTotalState(val);
    localStorage.setItem("terraflow_budget_total", val.toString());
  };

  const budgetUsedPercentage = parseFloat(((totalEmissions / budgetTotal) * 100).toFixed(1));

  const setStats = (newEmissions: SectorAllocations, newTotal: number) => {
    setEmissions(newEmissions);
    setTotalEmissions(newTotal);
  };

  // Add/mitigate logs in Express database
  const updateEmissions = async (category: string, value: number) => {
    try {
      const url = value < 0 ? "/api/logs/mitigate" : "/api/logs/add";
      const payload = value < 0
        ? { category, value }
        : { category, value, specific_item: "quick_preset", unit: "kg" };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setEmissions(data.emissions);
        setTotalEmissions(data.totalEmissions);
      }
    } catch (err) {
      console.error("Failed to push telemetry log to backend:", err);
    }
  };

  const loginWithGoogle = (name: string, email: string, image: string) => {
    const newUser = { name, email, image };
    setUser(newUser);
    localStorage.setItem("terraflow_user", JSON.stringify(newUser));
    router.push("/dashboard");
  };

  const logout = async () => {
    // Reset backend logs on logout for clean sandbox demonstration
    try {
      await fetch("/api/logs/reset", { method: "POST" });
    } catch (e) {}
    
    setUser(null);
    localStorage.removeItem("terraflow_user");
    router.push("/");
  };

  return (
    <CarbonContext.Provider
      value={{
        emissions,
        totalEmissions,
        streak,
        budgetUsedPercentage,
        user,
        budgetTotal,
        setBudgetTotal,
        updateEmissions,
        syncWithBackend,
        setStats,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
};

export const useCarbon = () => {
  const context = useContext(CarbonContext);
  if (!context) throw new Error("useCarbon must be executed within a CarbonProvider element pipeline.");
  return context;
};