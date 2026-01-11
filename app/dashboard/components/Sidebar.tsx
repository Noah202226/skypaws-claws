"use client";

import { Button } from "@/components/ui/button";
import {
  Layout,
  Users,
  Settings,
  Facebook,
  LogOut,
  PawPrint,
  List,
} from "lucide-react";
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
    // { id: "overview", label: "Overview", icon: Layout },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 z-50 transition-opacity lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 w-64 border-r border-slate-800 bg-slate-950 p-6 flex flex-col z-50 transition-transform lg:translate-x-0 lg:static ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="relative h-10 w-10 rounded-full border-2 border-pink-500 bg-white p-1 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm leading-none tracking-tight italic">
              SKY PAWS
            </span>
            <span className="text-[9px] font-bold text-blue-500 tracking-widest uppercase">
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
              className={`w-full justify-start gap-3 h-11 transition-all ${
                currentTab === item.id
                  ? "bg-slate-900 border-l-2 border-indigo-600 text-indigo-400 font-bold"
                  : "text-slate-400 hover:bg-slate-900 hover:text-blue-400"
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Button>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="pt-6 border-t border-slate-800 flex flex-col gap-1">
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentTab("settings");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full justify-start gap-3 h-11 transition-all ${
              currentTab === "settings"
                ? "bg-slate-900 border-l-2 border-indigo-600 text-indigo-400 font-bold"
                : "text-slate-400 hover:bg-slate-900 hover:text-blue-400"
            }`}
          >
            <Settings className="h-4 w-4" /> Settings
          </Button>

          <a
            href="https://www.facebook.com/profile.php?id=100090768115762&rdid=6XR5H0KzLjYYwvtB&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1C3gPEKxSo%2F#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 hover:text-blue-500 transition-colors"
          >
            <Facebook className="h-4 w-4" />
            <span className="font-bold">Facebook Page</span>
          </a>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-500 hover:text-red-400 hover:bg-red-950/20 mt-2"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
