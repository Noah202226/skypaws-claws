"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Activity,
  Loader2,
  History,
  Scale,
  Edit3,
  Trash2,
  Receipt,
  ChevronUp,
  ChevronDown,
  Banknote,
  CalendarClock,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/app/store/useTransactionStore";
import { toast } from "sonner";
import AddTransactionModal from "./AddTransactionModal";
import { useInstallmentStore } from "@/app/store/useInstallmentStore";
import { usePetStore } from "@/app/store/usePetStore";

export default function PetDetailModal({ pet, isOpen, onClose }: any) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);

  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payNote, setPayNote] = useState("");
  const [payDate, setPayDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { transactions, fetchTransactions, isLoading, deleteTransaction } =
    useTransactionStore();
  const {
    installments,
    fetchInstallments,
    addInstallment,
    deleteInstallment,
    isLoading: loadingInstallments,
  } = useInstallmentStore();
  const { deletePet } = usePetStore();

  const latestTx = useMemo(() => transactions[0] || null, [transactions]);

  useEffect(() => {
    if (isOpen && pet?.$id) {
      fetchTransactions(pet.$id);
    }
  }, [isOpen, pet?.$id, fetchTransactions]);

  const handleEdit = (tx: any) => {
    setEditingTx(tx);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this medical record?")) {
      try {
        await deleteTransaction(id);
        toast.success("Record deleted");
      } catch (error) {
        toast.error("Failed to delete record");
      }
    }
  };

  const togglePayments = async (txId: string) => {
    if (expandedTx === txId) {
      setExpandedTx(null);
    } else {
      setExpandedTx(txId);
      await fetchInstallments(txId);
    }
  };

  const handlePaymentSubmit = async (txId: string) => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0)
      return toast.error("Enter a valid amount");

    try {
      await addInstallment(
        txId,
        amount,
        payMethod,
        new Date(payDate).toISOString(),
        payNote
      );
      setPayAmount("");
      setPayNote("");
      toast.success("Payment recorded");
      fetchTransactions(pet.$id);
    } catch (error) {
      toast.error("Failed to process payment");
    }
  };

  const handleDeletePayment = async (instId: string, txId: string) => {
    if (confirm("Delete this payment? The balance will be restored.")) {
      try {
        await deleteInstallment(instId, txId, pet?.$id);
        toast.success("Payment removed");
        fetchTransactions(pet.$id);
      } catch (error) {
        toast.error("Error removing payment");
      }
    }
  };

  const handleDeletePet = async () => {
    // Stage 1: Basic confirmation
    const firstConfirm = confirm(
      `Are you sure you want to delete ${pet.name}? This cannot be undone.`
    );
    if (!firstConfirm) return;

    // Stage 2: Intent confirmation
    const secondConfirm = prompt(
      `Please type the pet's name "${pet.name}" to confirm deletion:`
    );
    if (secondConfirm !== pet.name) {
      toast.error("Name mismatch. Deletion cancelled.");
      return;
    }

    try {
      await deletePet(pet.$id);
      toast.success("Patient profile deleted successfully");
      onClose(); // Close the modal
    } catch (error) {
      toast.error("Failed to delete pet profile");
    }
  };

  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 transition-colors duration-300">
      {/* Theme-Aware Overlay */}
      <div
        className="absolute inset-0 bg-slate-200/60 dark:bg-slate-950/90 backdrop-blur-xl"
        onClick={onClose}
      />

      <div className="relative w-full max-w-9xl h-full md:h-[90vh] bg-white dark:bg-slate-950 border-x md:border border-slate-200 dark:border-slate-800 md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="relative p-6 md:p-10 pb-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-linear-to-b dark:from-indigo-600/5 dark:to-transparent">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-lg dark:shadow-[0_0_30px_rgba(79,70,229,0.3)]">
              <Activity className="h-8 w-8 md:h-10 md:w-10 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                  {pet.name}
                </h3>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Patient File
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">
                {pet.type} • {pet.breed || "Mixed Breed"} • {pet.age || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-500 rounded-2xl text-slate-400 dark:text-slate-500 transition-all border border-slate-200 dark:border-slate-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-white dark:bg-slate-950">
          <div className="space-y-10">
            {/* VITALS DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VitalCard
                icon={
                  <Scale
                    className="text-indigo-600 dark:text-indigo-400"
                    size={20}
                  />
                }
                label="Recorded Weight"
                value={`${latestTx?.recordedWeight || pet.weight || "--"} kg`}
              />
              <VitalCard
                icon={
                  <CalendarClock
                    className="text-emerald-600 dark:text-emerald-400"
                    size={20}
                  />
                }
                label="Next Schedule"
                value={
                  latestTx?.nextAppointmentDate
                    ? new Date(
                        latestTx.nextAppointmentDate
                      ).toLocaleDateString()
                    : "No Visit Set"
                }
              />
              <VitalCard
                icon={
                  <History
                    className="text-amber-600 dark:text-amber-400"
                    size={20}
                  />
                }
                label="Total Visits"
                value={transactions.length.toString()}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* LEFT COLUMN: LOGS */}
              <div className="lg:col-span-8 space-y-6">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                  <History
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />{" "}
                  Medical & Service Logs
                </h4>

                {isLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx: any) => (
                      <div
                        key={tx.$id}
                        className="group relative bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 hover:border-indigo-600/50 transition-all"
                      >
                        {tx.balanceRemaining <= 0 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] dark:opacity-[0.03] rotate-[-15deg]">
                            <span className="text-4xl font-black uppercase border-4 border-slate-900 dark:border-white px-10 py-2 rounded-3xl">
                              Settled
                            </span>
                          </div>
                        )}

                        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-slate-400 dark:text-slate-500 transition-all shadow-sm"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.$id)}
                            className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 hover:text-rose-600 dark:hover:text-rose-500 rounded-xl text-slate-400 dark:text-slate-500 transition-all shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                              <Scale size={12} />
                              <span className="text-[10px] font-black text-slate-900 dark:text-white">
                                {tx.recordedWeight || pet.weight}kg
                              </span>
                            </div>
                            <div>
                              <h5 className="font-black text-slate-900 dark:text-white text-lg uppercase italic">
                                {tx.serviceName || "Untitled Service"}
                              </h5>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {new Date(
                                  tx.transactionDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                              tx.status === "Paid"
                                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                                : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500"
                            }`}
                          >
                            {tx.status}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 mb-6">
                          {/* Service/General Notes */}
                          {tx.notes && tx.notes.trim() !== "" && (
                            <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                              <h6 className="text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
                                Service Notes
                              </h6>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                "{tx.notes}"
                              </p>
                            </div>
                          )}

                          {/* Clinic/Medical Notes */}
                          {tx.clinicalNotes &&
                            tx.clinicalNotes.trim() !== "" && (
                              <div className="p-4 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20">
                                <h6 className="text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                                  <Edit3 size={10} /> Clinical Findings
                                </h6>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                  {tx.clinicalNotes}
                                </p>
                              </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex gap-8">
                            <FinancialStat
                              label="Total Amount"
                              value={tx.totalAmount}
                              color="text-slate-900 dark:text-white"
                            />
                            <FinancialStat
                              label="Remaining"
                              value={tx.balanceRemaining}
                              color="text-rose-600 dark:text-rose-500"
                            />
                          </div>
                          <button
                            onClick={() => togglePayments(tx.$id)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-600/30 rounded-xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest transition-all"
                          >
                            <Receipt size={14} />{" "}
                            {expandedTx === tx.$id
                              ? "Close History"
                              : "Payment History"}{" "}
                            {expandedTx === tx.$id ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                          </button>
                        </div>

                        {expandedTx === tx.$id && (
                          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-white dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                              {loadingInstallments ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 className="animate-spin h-4 w-4 text-indigo-600" />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {installments[tx.$id]?.map((inst: any) => (
                                    <div
                                      key={inst.$id}
                                      className="group/inst flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/30 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-600/5 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-600/20"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Banknote
                                          size={14}
                                          className="text-emerald-600 dark:text-emerald-500"
                                        />
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-slate-900 dark:text-white font-bold">
                                            {new Date(
                                              inst.paymentDate
                                            ).toLocaleDateString()}
                                          </span>
                                          <span className="text-[8px] text-slate-500 uppercase font-black">
                                            {inst.paymentMethod} •{" "}
                                            <span className="text-indigo-600 dark:text-indigo-400 italic font-medium">
                                              {inst.notes || "No notes"}
                                            </span>
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                          +₱{inst.amountPaid.toLocaleString()}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleDeletePayment(
                                              inst.$id,
                                              tx.$id
                                            )
                                          }
                                          className="opacity-0 group-hover/inst:opacity-100 p-1.5 bg-white dark:bg-slate-900 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-500 text-slate-400 rounded-lg transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  {tx.balanceRemaining > 0 && (
                                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <input
                                          type="date"
                                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[10px] text-slate-900 dark:text-white focus:border-indigo-600 outline-none"
                                          value={payDate}
                                          onChange={(e) =>
                                            setPayDate(e.target.value)
                                          }
                                        />
                                        <input
                                          type="text"
                                          placeholder="Payment notes (Ref #, etc)"
                                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[10px] text-slate-900 dark:text-white focus:border-indigo-600 outline-none"
                                          value={payNote}
                                          onChange={(e) =>
                                            setPayNote(e.target.value)
                                          }
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                        <div className="md:col-span-5 relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                                            ₱
                                          </span>
                                          <input
                                            type="number"
                                            placeholder="Amount"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-7 pr-3 text-[10px] text-slate-900 dark:text-white focus:border-indigo-600 outline-none"
                                            value={payAmount}
                                            onChange={(e) =>
                                              setPayAmount(e.target.value)
                                            }
                                          />
                                        </div>
                                        <select
                                          className="md:col-span-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[10px] text-slate-900 dark:text-white focus:border-indigo-600 outline-none"
                                          value={payMethod}
                                          onChange={(e) =>
                                            setPayMethod(e.target.value)
                                          }
                                        >
                                          <option value="Cash">Cash</option>
                                          <option value="GCash">GCash</option>
                                          <option value="Card">Card</option>
                                        </select>
                                        <button
                                          onClick={() =>
                                            handlePaymentSubmit(tx.$id)
                                          }
                                          className="md:col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase transition-colors shadow-lg shadow-indigo-600/20"
                                        >
                                          Add Payment
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: ACTIONS */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden group">
                  <ArrowUpRight className="absolute -top-4 -right-4 h-32 w-32 opacity-10" />
                  <h4 className="text-2xl font-black uppercase italic mb-6">
                    New Visit
                  </h4>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full bg-white text-indigo-600 hover:bg-slate-100 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-lg border-none"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Start Billing
                  </Button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CreditCard size={14} className="text-indigo-600" />{" "}
                    Financial Summary
                  </h5>
                  <div className="space-y-4">
                    <SummaryRow
                      label="Total Lifetime"
                      value={transactions.reduce(
                        (acc, curr) => acc + (curr.totalAmount || 0),
                        0
                      )}
                    />
                    <div className="h-px bg-slate-200 dark:bg-slate-800/50 w-full" />
                    <SummaryRow
                      label="Debt/Balance"
                      value={transactions.reduce(
                        (acc, curr) => acc + (curr.balanceRemaining || 0),
                        0
                      )}
                      color="text-rose-600 dark:text-rose-500"
                    />
                  </div>
                </div>

                {/* NEW: DANGER ZONE */}
                <div className="p-8 border border-rose-500/20 bg-rose-500/5 rounded-[2.5rem] mt-4">
                  <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Trash2 size={14} /> Danger Zone
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Deleting this file will permanently erase all medical
                    history. This action is irreversible.
                  </p>
                  <Button
                    onClick={handleDeletePet}
                    variant="ghost"
                    className="w-full border border-rose-500/30 hover:bg-rose-600 hover:text-white text-rose-500 font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl transition-all"
                  >
                    Permanently Delete Pet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        pet={pet}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTx(null);
        }}
        initialData={editingTx}
      />
    </div>
  );
}

function VitalCard({ icon, label, value }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 hover:shadow-md dark:hover:bg-slate-900 transition-all">
      <div className="mb-3">{icon}</div>
      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      <p className="text-xl font-black text-slate-900 dark:text-white mt-1 uppercase">
        {value}
      </p>
    </div>
  );
}

function FinancialStat({ label, value, color }: any) {
  const isDefault = color === "text-slate-900 dark:text-white";
  return (
    <div className="flex flex-col">
      <span
        className={`text-[9px] font-bold uppercase ${
          isDefault ? "text-slate-400 dark:text-slate-500" : color
        }`}
      >
        {label}
      </span>
      <span className={`font-black italic text-lg ${color}`}>
        ₱{value?.toLocaleString() || "0"}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  color = "text-slate-900 dark:text-white",
}: any) {
  return (
    <div className="flex justify-between items-end">
      <span className="text-xs text-slate-500 font-bold uppercase">
        {label}
      </span>
      <span className={`font-black text-xl italic ${color}`}>
        ₱{value.toLocaleString()}
      </span>
    </div>
  );
}
