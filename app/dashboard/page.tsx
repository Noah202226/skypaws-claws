"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Layout, Bell, Settings } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());

  // Real-time clock logic
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* --- Left Sidebar (Nav) --- */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Layout className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">SKYPAWS</span>
        </div>

        <nav className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="justify-start gap-3 bg-slate-800 text-indigo-400"
          >
            <Layout className="h-4 w-4" /> Overview
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-3 hover:bg-slate-800 text-slate-400"
          >
            <Bell className="h-4 w-4" /> Notifications
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-3 hover:bg-slate-800 text-slate-400"
          >
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-6">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* --- Center Content Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest">
            Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800 text-slate-50">
              <CardHeader>
                <CardTitle className="text-slate-400 text-sm">
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Active</p>
                <p className="text-xs text-indigo-400 mt-1 italic">
                  Verified through Appwrite
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Promos & Marketing Section (Requested fixed bottom) */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-linear-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-indigo-300">
                  Unlock Pro Features
                </h4>
                <p className="text-sm text-slate-400">
                  Get unlimited database collections and custom domains.
                </p>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none">
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* --- Right Sidebar (w-80) --- */}
      <aside className="w-80 border-l border-slate-800 bg-slate-900/30 p-8 flex flex-col gap-8">
        {/* Real-time Clock */}
        <div className="text-center py-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
          <p className="text-indigo-500 font-medium text-sm mb-2 tracking-widest uppercase">
            System Time
          </p>
          <p className="text-4xl font-mono font-bold text-slate-100 tracking-tighter">
            {time.toLocaleTimeString([], { hour12: false })}
          </p>
          <p className="text-slate-500 text-xs mt-2">
            {time.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs text-slate-400"
              >
                Session started from Chrome (Windows)
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
