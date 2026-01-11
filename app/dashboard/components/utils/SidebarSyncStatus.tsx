"use client";

import { useClientStore } from "@/app/store/useClientStore";
import { usePetStore } from "@/app/store/usePetStore";
import { CloudSunIcon, CheckCircle2, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function SidebarSyncStatus() {
  const isClientSyncing = useClientStore((state) => state.isSyncing);
  const isPetSyncing = usePetStore((state) => state.isSyncing);
  const [isOnline, setIsOnline] = useState(true);

  const isSyncing = isClientSyncing || isPetSyncing;

  // Monitor connectivity
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <div className="px-6 py-4 mb-2">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 group">
        <div className="flex items-center gap-3">
          <div className="relative">
            {isSyncing ? (
              <CloudSunIcon className="h-5 w-5 text-indigo-500 animate-pulse" />
            ) : !isOnline ? (
              <WifiOff className="h-5 w-5 text-rose-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            )}

            {/* Pulsing indicator dot */}
            {isSyncing && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            )}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
              Database Status
            </p>
            <p
              className={`text-[11px] font-bold ${
                isSyncing ? "text-indigo-400" : "text-slate-500"
              }`}
            >
              {isSyncing
                ? "Syncing Records..."
                : !isOnline
                ? "Offline Mode"
                : "System Updated"}
            </p>
          </div>
        </div>

        {/* Progress Spinner for sync */}
        {isSyncing && (
          <div className="h-4 w-4 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
