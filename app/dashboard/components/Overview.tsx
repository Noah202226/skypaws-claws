"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, ShieldCheck, PawPrint } from "lucide-react";

export default function OverviewSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white italic">
          Expert Care for{" "}
          <span className="text-pink-500">Your Happy Pets.</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Manage appointments and health records for Brgy. Lawis, Albuera.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-slate-900/50 border-slate-800 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                <Stethoscope className="h-5 w-5" />
              </div>
              <CardTitle className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                Medical Status
              </CardTitle>
            </div>
            <p className="text-2xl font-black text-white italic">Active Care</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                Grooming Plan
              </CardTitle>
            </div>
            <p className="text-2xl font-black text-white italic">
              Premium Styling
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Promos & Marketing Section */}
      <div className="mt-12 bg-linear-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <PawPrint className="h-32 w-32 text-indigo-500 -rotate-12" />
        </div>
        <div className="relative z-10">
          <span className="bg-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            New Promo
          </span>
          <h3 className="text-xl font-black text-white mt-4 italic">
            Summer Pet Wellness Month
          </h3>
          <p className="text-slate-400 text-sm mt-2 max-w-md">
            Get 20% off on all vaccinations and basic grooming packages this
            June!
          </p>
          <Button className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase px-8 h-10">
            Claim Discount
          </Button>
        </div>
      </div>
    </div>
  );
}
