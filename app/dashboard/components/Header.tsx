"use client";

import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";

interface HeaderProps {
  user: any;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ user, setIsMobileMenuOpen }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex items-center gap-4 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-black text-slate-200">
            {user?.name || "Member"}
          </p>
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest italic">
            Verified Client
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
          <User className="h-5 w-5 text-pink-500" />
        </div>
      </div>
    </header>
  );
}
