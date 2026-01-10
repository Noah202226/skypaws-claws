"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/auth-context";

export default function SettingsSection() {
  const { user } = useAuth();

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-xl">
      <h2 className="text-2xl font-black text-white italic mb-6">
        Account <span className="text-indigo-500">Settings</span>
      </h2>

      <div className="space-y-4">
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Current User
          </label>
          <p className="text-lg font-bold text-slate-200 mt-1">
            {user?.name || "Member"}
          </p>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <h4 className="text-sm font-bold text-white mb-2">Preferences</h4>
          <p className="text-xs text-slate-500 mb-4">
            Manage how your dashboard appears and security settings.
          </p>
          <Button
            variant="outline"
            className="w-full border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white h-12 justify-start px-6 font-bold"
          >
            Update Profile Information
          </Button>
          <Button
            variant="outline"
            className="w-full border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white h-12 justify-start px-6 font-bold mt-2"
          >
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
