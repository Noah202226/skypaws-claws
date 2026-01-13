"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/app/store/useTransactionStore";
import { usePetStore } from "@/app/store/usePetStore";
import { Calendar, Clock, Bell, AlertCircle } from "lucide-react";

export default function AppointmentReminders() {
  const { transactions } = useTransactionStore();
  const { allPets } = usePetStore();

  const getPetName = (petId: string) =>
    allPets.find((p) => p.$id === petId)?.name || "Unknown Patient";

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((tx) => {
        if (!tx.nextAppointmentDate) return false;
        const aptDate = new Date(tx.nextAppointmentDate);
        return aptDate >= now;
      })
      .map((tx) => ({
        id: tx.$id,
        petId: tx.petId,
        petName: getPetName(tx.petId),
        date: new Date(tx.nextAppointmentDate!),
        service: tx.serviceName,
        notes: tx.clinicalNotes,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions, allPets]);

  const thisWeek = upcomingAppointments.filter((apt) => {
    const nextWeek = new Date();
    nextWeek.setDate(new Date().getDate() + 7);
    return apt.date <= nextWeek;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-slate-900 dark:text-white font-black italic uppercase tracking-tighter text-lg leading-tight">
            Appointment <br />
            <span className="text-indigo-600 dark:text-indigo-500">
              Reminders
            </span>
          </h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            {upcomingAppointments.length} Upcoming Follow-ups
          </p>
        </div>
        <div className="p-2.5 bg-indigo-600/10 border border-indigo-600/20 rounded-xl">
          <Bell
            size={18}
            className="text-indigo-600 dark:text-indigo-500 animate-pulse"
          />
        </div>
      </div>

      {/* FIXED HEIGHT SCROLLABLE LIST */}
      {/* Use h-[calc(100vh-400px)] to dynamically adjust to screen height or a static px value */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {upcomingAppointments.length === 0 ? (
            <EmptyState />
          ) : (
            upcomingAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                apt={apt}
                isUrgent={thisWeek.includes(apt)}
              />
            ))
          )}
        </div>
        {/* Faded bottom mask to show more items are below */}
        <div className="absolute bottom-0 left-0 right-2 h-12 bg-linear-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
      </div>

      {/* CSS for custom scrollbar (can be moved to globals.css) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// --- Sub-components ---

function AppointmentCard({ apt, isUrgent }: any) {
  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 hover:border-indigo-600/50 rounded-2xl p-4 transition-all shadow-sm dark:shadow-2xl overflow-hidden">
      {isUrgent && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[7px] font-black px-3 py-0.5 rounded-bl-lg uppercase tracking-widest">
          Soon
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            isUrgent
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 dark:bg-slate-950 text-indigo-600 dark:text-indigo-500 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Calendar size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-slate-900 dark:text-white font-black uppercase text-xs truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {apt.petName}
          </h4>
          <p className="text-slate-500 text-[9px] font-bold uppercase truncate">
            {apt.service}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[9px] font-mono bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
              <Clock
                size={10}
                className="text-indigo-600 dark:text-indigo-400"
              />
              {apt.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            {apt.notes && (
              <div className="flex items-center gap-1 text-slate-400 text-[8px] font-bold uppercase italic truncate max-w-20">
                <AlertCircle size={9} /> {apt.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 flex flex-col items-center justify-center opacity-40">
      <Calendar size={32} strokeWidth={1} className="text-slate-500 mb-2" />
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest text-center">
        No Pending <br /> Schedules
      </p>
    </div>
  );
}
