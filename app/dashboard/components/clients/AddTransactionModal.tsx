"use client";

import { useState, useEffect } from "react";
import {
  X,
  Receipt,
  Banknote,
  Calendar,
  Clock,
  Scale,
  Activity,
  CalendarDays,
  Plus,
  CreditCard,
  Wallet,
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
  const { addTransaction, updateTransaction } = useTransactionStore();

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
      setAmountPaid(""); // Usually reset for updates unless editing the specific installment
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
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                initialData ? "bg-amber-500/20" : "bg-indigo-600"
              }`}
            >
              {initialData ? (
                <Activity className="text-amber-500" />
              ) : (
                <Plus className="text-white" />
              )}
            </div>
            <div>
              <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">
                {initialData ? "Modify Clinical Entry" : "New Visit Entry"}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Patient: {pet.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: CLINICAL STATUS */}
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              Medical Status
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                  Visit Date
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-xs outline-none focus:border-emerald-500 scheme-dark"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-emerald-500"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <textarea
              placeholder="Clinical findings & observations..."
              className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-4 px-6 text-white text-sm outline-none focus:border-emerald-500 min-h-[220px] resize-none"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
            />
          </div>

          {/* RIGHT: BILLING & PAYMENT */}
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              Billing Details
            </h5>
            <div className="space-y-4">
              <input
                required
                placeholder="Service/Procedure Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-indigo-500"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">
                  ₱
                </span>
                <input
                  required
                  type="number"
                  placeholder="Total Cost"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-black outline-none focus:border-indigo-500"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
            </div>

            {/* PAYMENT TYPE SELECTOR */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setPaymentType("Full")}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  paymentType === "Full"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Full Paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("Installment")}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  paymentType === "Installment"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Partial/Terms
              </button>
            </div>

            {/* CONDITIONAL INSTALLMENT FIELDS */}
            {paymentType === "Installment" && !initialData && (
              <div className="space-y-4 p-5 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-indigo-400 uppercase ml-1">
                    Initial Deposit (₱)
                  </label>
                  <input
                    type="number"
                    placeholder="Amount paid today"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-indigo-500"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-indigo-400 uppercase ml-1">
                    Payment Method
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-indigo-500"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Card">Bank Card</option>
                  </select>
                </div>
              </div>
            )}

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-4xl space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Next Appointment
              </label>
              <input
                type="date"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white text-xs outline-none scheme-dark focus:border-indigo-500"
                value={nextAppointment}
                onChange={(e) => setNextAppointment(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800">
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 h-16 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-indigo-900/20 transition-all"
          >
            {initialData ? "Update Medical Record" : "Confirm & Save Visit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
