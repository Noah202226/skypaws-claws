"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Scale,
  Activity,
  CalendarDays,
  Plus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/app/store/useTransactionStore";
import { toast } from "sonner";

export default function AddTransactionModal({
  pet,
  isOpen,
  onClose,
  initialData = null,
}: any) {
  const { addTransaction, updateTransaction, isLoading } =
    useTransactionStore();

  // Input States
  const [serviceName, setServiceName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentType, setPaymentType] = useState<"Full" | "Installment">(
    "Full"
  );
  const [customDate, setCustomDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [nextAppointment, setNextAppointment] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");

  useEffect(() => {
    if (initialData && isOpen) {
      setServiceName(initialData.serviceName || "");
      setTotalAmount(initialData.totalAmount?.toString() || "");
      setPaymentType(initialData.balanceRemaining > 0 ? "Installment" : "Full");
      setCustomDate(
        initialData.transactionDate
          ? new Date(initialData.transactionDate).toISOString().split("T")[0]
          : ""
      );
      setNextAppointment(
        initialData.nextAppointmentDate
          ? new Date(initialData.nextAppointmentDate)
              .toISOString()
              .split("T")[0]
          : ""
      );
      setClinicalNotes(initialData.clinicalNotes || "");
      setCurrentWeight(initialData.recordedWeight || "");
      setAmountPaid("");
    } else if (isOpen) {
      setServiceName("");
      setTotalAmount("");
      setAmountPaid("");
      setPaymentMethod("Cash");
      setPaymentType("Full");
      setCustomDate(new Date().toISOString().split("T")[0]);
      setNextAppointment("");
      setClinicalNotes("");
      setCurrentWeight(pet?.weight || "");
    }
  }, [initialData, isOpen, pet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalAmount);
    const paidToday =
      paymentType === "Full" ? total : parseFloat(amountPaid || "0");
    const balance = total - paidToday;

    const payload = {
      petId: pet.$id,
      serviceName,
      totalAmount: total,
      balanceRemaining: balance,
      status: balance <= 0 ? "Paid" : ("Partial" as any),
      transactionDate: new Date(customDate).toISOString(),
      clinicalNotes,
      nextAppointmentDate: nextAppointment
        ? new Date(nextAppointment).toISOString()
        : null,
      recordedWeight: currentWeight,
    };

    try {
      if (initialData) {
        await updateTransaction(initialData.$id, payload);
        toast.success("Medical record updated");
      } else {
        await addTransaction({
          ...payload,
          initialAmountPaid: paidToday,
          paymentMethod: paymentMethod,
        });
        toast.success("Visit record saved");
      }
      onClose();
    } catch (error) {
      toast.error("Process failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      {/* Dynamic Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md dark:bg-slate-950/90"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-4xl bg-card border border-border rounded-[2.5rem] p-6 md:p-10 shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div
              className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm ${
                initialData
                  ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {initialData ? <Activity size={28} /> : <Plus size={28} />}
            </div>
            <div>
              <h4 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">
                {initialData ? "Modify Clinical Entry" : "New Visit Entry"}
              </h4>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                Patient:{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {pet.name}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 hover:bg-muted rounded-2xl text-muted-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: MEDICAL SECTION */}
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-px w-8 bg-current opacity-30" />
              Medical Status
            </h5>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">
                  Visit Date
                </label>
                <div className="relative group">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="date"
                    className="w-full bg-muted/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground text-sm outline-none focus:border-indigo-600 transition-all dark:scheme-dark"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">
                  Weight (kg)
                </label>
                <div className="relative group">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="number"
                    step="0.1"
                    autoFocus
                    className="w-full bg-muted/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground text-sm outline-none focus:border-indigo-600 transition-all"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">
                Clinical Notes
              </label>
              <textarea
                placeholder="Clinical findings & observations..."
                className="w-full bg-muted/50 border border-border rounded-3xl py-5 px-6 text-foreground text-sm outline-none focus:border-indigo-600 min-h-[220px] resize-none transition-all"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
              />
            </div>
          </div>

          {/* RIGHT: BILLING SECTION */}
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-px w-8 bg-current opacity-30" />
              Billing Details
            </h5>

            <div className="space-y-4">
              <input
                required
                placeholder="Service / Procedure Name"
                className="w-full bg-muted/50 border border-border rounded-2xl py-4 px-6 text-foreground text-sm outline-none focus:border-indigo-600 transition-all"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-600 font-black text-lg">
                  ₱
                </span>
                <input
                  required
                  type="number"
                  placeholder="Total Cost"
                  className="w-full bg-muted/50 border border-border rounded-2xl py-5 pl-12 pr-6 text-foreground text-xl font-black outline-none focus:border-indigo-600 transition-all"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/50 border border-border rounded-2xl">
              <button
                type="button"
                onClick={() => setPaymentType("Full")}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  paymentType === "Full"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Fully Paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("Installment")}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  paymentType === "Installment"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Partial/Terms
              </button>
            </div>

            {/* INSTALLMENT BOX */}
            {paymentType === "Installment" && !initialData && (
              <div className="space-y-4 p-6 bg-indigo-50/50 dark:bg-indigo-600/5 border border-indigo-100 dark:border-indigo-500/10 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase ml-1">
                    Initial Deposit (₱)
                  </label>
                  <input
                    type="number"
                    placeholder="Amount paid today"
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm outline-none focus:border-indigo-600 transition-all"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase ml-1">
                    Payment Method
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-xs outline-none focus:border-indigo-600 appearance-none cursor-pointer transition-all"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="GCash">GCash</option>
                      <option value="Card">Bank Card</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* FOLLOW UP */}
            <div className="p-6 bg-muted/30 border border-border rounded-4xl space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-indigo-600" /> Next Appointment
              </label>
              <input
                type="date"
                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm outline-none focus:border-indigo-600 transition-all dark:scheme-dark"
                value={nextAppointment}
                onChange={(e) => setNextAppointment(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-10 pt-8 border-t border-border">
          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full h-16 md:h-20 rounded-4xl font-black uppercase text-xs md:text-sm tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3
      ${
        isLoading
          ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
      }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Syncing with Cloud...</span>
              </>
            ) : initialData ? (
              "Update Medical Record"
            ) : (
              "Confirm & Save Visit"
            )}
          </Button>

          {/* Optional: Add a small status text below the button when loading */}
          {isLoading && (
            <p className="text-center text-[9px] font-black uppercase tracking-widest text-indigo-600 animate-pulse mt-4">
              Please do not close the window
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
