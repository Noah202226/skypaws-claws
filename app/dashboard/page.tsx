"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import Sidebar from "@/app/dashboard/components/Sidebar";
import Header from "@/app/dashboard/components/Header";
import OverviewSection from "@/app/dashboard/components/Overview";
import ClientsSection from "@/app/dashboard/components/Clients";
import SettingsSection from "@/app/dashboard/components/Settings";
import ReportsSection from "./components/ReportsSection";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("clients");

  // --- THEME LOGIC START ---
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check local storage or system on mount
    const saved = localStorage.getItem("skypaws-theme") as "light" | "dark";
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("skypaws-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  // --- THEME LOGIC END ---

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    /* Changed bg-slate-950 to bg-background and text-slate-50 to text-foreground */
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-300">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        logout={logout}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Pass toggleTheme to Header so you can place a button there */}
        <Header
          user={user}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <div className="flex-1 p-6 sm:p-10">
          {currentTab === "overview" && <OverviewSection />}
          {currentTab === "clients" && <ClientsSection />}
          {currentTab === "settings" && <SettingsSection />}
          {currentTab === "reports" && <ReportsSection />}
        </div>
      </main>

      {/* Right Sidebar - Updated with light mode support */}
      <aside className="hidden xl:flex w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-8 flex-col gap-6 transition-colors">
        <div className="text-center py-10 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-indigo-500/20 relative overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-blue-600 via-indigo-600 to-pink-500" />
          <p className="text-indigo-600 dark:text-indigo-500 font-black text-[10px] mb-2 tracking-[0.3em] uppercase">
            Clinic Time
          </p>
          <p className="text-4xl font-mono font-bold tracking-tighter italic text-slate-900 dark:text-white">
            {time.toLocaleTimeString([], { hour12: false })}
          </p>
          <div className="h-px w-12 bg-slate-200 dark:bg-slate-800 mx-auto my-4" />
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
            {time.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* --- PROMOS & MARKETING SECTION (From Saved Info) --- */}
        <div className="mt-auto p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
            Promotion
          </p>
          <p className="text-sm font-bold mt-1">Upgrade to Pro</p>
          <p className="text-[10px] mt-1 opacity-90">
            Unlock advanced analytics and unlimited clients.
          </p>
        </div>
      </aside>
    </div>
  );
}
