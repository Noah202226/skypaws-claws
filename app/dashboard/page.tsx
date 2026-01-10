"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import Sidebar from "@/app/dashboard/components/Sidebar";
import Header from "@/app/dashboard/components/Header";
import OverviewSection from "@/app/dashboard/components/Overview";
import ClientsSection from "@/app/dashboard/components/Clients";
import SettingsSection from "@/app/dashboard/components/Settings";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("clients");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        logout={logout}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <Header user={user} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="flex-1 p-6 sm:p-10">
          {currentTab === "overview" && <OverviewSection />}
          {currentTab === "clients" && <ClientsSection />}
          {currentTab === "settings" && <SettingsSection />}
        </div>
      </main>

      {/* Right Sidebar - Width 80 */}
      <aside className="hidden xl:flex w-80 border-l border-slate-800 bg-slate-950 p-8 flex-col gap-6">
        <div className="text-center py-10 bg-slate-900/40 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-blue-600 via-indigo-600 to-pink-500" />
          <p className="text-indigo-500 font-black text-[10px] mb-2 tracking-[0.3em] uppercase">
            Clinic Time
          </p>
          <p className="text-4xl font-mono font-bold tracking-tighter italic">
            {time.toLocaleTimeString([], { hour12: false })}
          </p>
          <div className="h-px w-12 bg-slate-800 mx-auto my-4" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            {time.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </aside>
    </div>
  );
}
