"use client";

import { useState, useEffect } from "react";
import { X, Plus, Activity, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PetDetailModal({ pet, isOpen, onClose }: any) {
  const [transactions, setTransactions] = useState([]);

  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic">
                {pet.name}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {pet.breed} • {pet.type}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X />
          </button>
        </div>

        {/* Action: Add Transaction */}
        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest h-10 mb-6">
          <Plus className="mr-2 h-4 w-4" /> Add New Service
        </Button>

        {/* Service History List */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
            Service History
          </p>

          {transactions.length > 0 ? (
            transactions.map((tx: any, i) => (
              <div
                key={i}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-bold text-white">
                    {tx.serviceName}
                  </p>
                  <p className="text-[10px] text-slate-500">{tx.date}</p>
                </div>
                <p className="text-indigo-400 font-black text-sm">
                  ₱{tx.amount}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
              <p className="text-[10px] text-slate-600 font-bold uppercase">
                No services recorded yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
