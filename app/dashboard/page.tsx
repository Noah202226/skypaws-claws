"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import Sidebar from "@/app/dashboard/components/Sidebar";
import Header from "@/app/dashboard/components/Header";
import OverviewSection from "@/app/dashboard/components/Overview";
import ClientsSection from "@/app/dashboard/components/Clients";
import SettingsSection from "@/app/dashboard/components/Settings";
import ReportsSection from "./components/ReportsSection";
import AppointmentReminders from "./AppointmentReminders";
import { Clock } from "lucide-react";

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
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-300">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        logout={logout}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* --- MOBILE ONLY CONTENT (Hidden on Desktop XL) --- */}
        <div className="xl:hidden px-6 pt-6 space-y-6">
          {/* Mobile Clock & Date */}
          <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
            <div>
              <p className="text-4xl font-mono font-bold tracking-tighter italic text-slate-900 dark:text-white">
                {time.toLocaleTimeString([], {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
                {time.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="p-3 bg-indigo-600/10 rounded-2xl">
              <Clock className="text-indigo-600" size={20} />
            </div>
          </div>

          {/* Mobile Reminders (Limited height for mobile) */}
          <div className="h-[300px] overflow-hidden">
            <AppointmentReminders />
          </div>
        </div>

        {/* --- MAIN TAB CONTENT --- */}
        <div className="flex-1 p-6 sm:p-10">
          {currentTab === "overview" && <OverviewSection />}
          {currentTab === "clients" && <ClientsSection />}
          {currentTab === "settings" && <SettingsSection />}
          {currentTab === "reports" && <ReportsSection />}

          {/* --- PROMOS & MARKETING (Bottom of center area as per instructions) --- */}
          {/* <div className="mt-12 p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] border border-indigo-500/20 relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                Promos & Marketing
              </p>
              <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">
                Expand Your <span className="text-indigo-500">Practice</span>
              </h4>
              <button className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                View Campaigns
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full" />
          </div> */}
        </div>
      </main>

      {/* --- DESKTOP SIDEBAR (xl:flex) --- */}
      <aside className="hidden xl:flex w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-8 flex-col gap-6 transition-colors">
        {/* Clock Section */}
        <div className="text-center py-10 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-indigo-500/20 relative overflow-hidden shadow-sm">
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

        <div className="mt-8 flex-1 overflow-hidden">
          <AppointmentReminders />
        </div>
      </aside>
    </div>
  );
}
