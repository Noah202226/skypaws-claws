"use client";

import { Sun, Moon, Menu, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  user: any;
  setIsMobileMenuOpen: (open: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function Header({
  user,
  setIsMobileMenuOpen,
  theme,
  toggleTheme,
}: HeaderProps) {
  const pathname = usePathname();

  // Convert "/dashboard/clients" into ["dashboard", "clients"]
  const pathSegments = pathname.split("/").filter((item) => item !== "");

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* --- DYNAMIC BREADCRUMBS --- */}
        <nav className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] italic">
          {pathSegments.map((segment, index) => {
            const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
            const isLast = index === pathSegments.length - 1;

            return (
              <div key={href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    size={12}
                    className="mx-2 text-slate-300 dark:text-slate-700 not-italic"
                  />
                )}
                {isLast ? (
                  <span className="text-slate-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                    {segment.replace(/-/g, " ")}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {segment.replace(/-/g, " ")}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-indigo-400 hover:border-indigo-500/50 transition-all shadow-sm group"
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
        >
          {theme === "dark" ? (
            <Sun
              size={18}
              className="text-amber-500 group-hover:rotate-45 transition-transform"
            />
          ) : (
            <Moon
              size={18}
              className="text-indigo-600 group-hover:-rotate-12 transition-transform"
            />
          )}
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black italic text-slate-900 dark:text-slate-100 leading-none">
              {user?.name}
            </p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              {user?.email}
            </p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs border-2 border-white dark:border-slate-800 shadow-lg shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
