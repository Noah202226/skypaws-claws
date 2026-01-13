"use client";

import { Button } from "@/components/ui/button";
import { Users, Settings, Facebook, LogOut, List } from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  logout: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  logout,
}: SidebarProps) {
  const navItems = [
    { id: "clients", label: "Clients", icon: Users },
    { id: "reports", label: "Reports", icon: List },
  ];

  // Shared active style logic
  const getActiveStyles = (id: string) =>
    currentTab === id
      ? "bg-indigo-50 dark:bg-slate-900 border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black shadow-sm dark:shadow-none"
      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-blue-400";

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 dark:bg-black/80 z-50 transition-opacity lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col z-50 transition-all duration-300 lg:translate-x-0 lg:static ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="relative h-10 w-10 rounded-full border-2 border-pink-500 bg-white p-1 overflow-hidden shrink-0 shadow-lg dark:shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <Image
              src="/favicon-512x512.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm leading-none tracking-tight italic text-slate-900 dark:text-white">
              SKY PAWS
            </span>
            <span className="text-[9px] font-bold text-indigo-600 dark:text-blue-500 tracking-widest uppercase mt-0.5">
              Clinic & Claws
            </span>
          </div>
        </div>

        {/* Primary Nav */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => {
                setCurrentTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full justify-start gap-3 h-12 transition-all rounded-r-xl rounded-l-none ${getActiveStyles(
                item.id
              )}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">
                {item.label}
              </span>
            </Button>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1">
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentTab("settings");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full justify-start gap-3 h-12 transition-all rounded-r-xl rounded-l-none ${getActiveStyles(
              "settings"
            )}`}
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Settings</span>
          </Button>

          <a
            href="https://www.facebook.com/..."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Facebook className="h-4 w-4" />
            <span>Facebook Page</span>
          </a>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 mt-2 h-12 transition-all"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
