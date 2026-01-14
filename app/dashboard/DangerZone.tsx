"use client";

import { useState } from "react";
import { useClientStore } from "@/app/store/useClientStore";
import { usePetStore } from "@/app/store/usePetStore";
import { useTransactionStore } from "@/app/store/useTransactionStore";
import { toast } from "sonner";
import {
  Trash2,
  AlertOctagon,
  RefreshCcw,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DangerZone() {
  const [isWipingTransactions, setIsWipingTransactions] = useState(false);
  const [isFactoryResetting, setIsFactoryResetting] = useState(false);

  // 1. Access all stores
  const { transactions, fetchTransactions, deleteTransaction } =
    useTransactionStore();
  const { allPets, fetchAllPets, deletePet } = usePetStore();
  const { clients, fetchClients, deleteClient } = useClientStore();

  // --- FUNCTION 1: DELETE ALL TRANSACTIONS ONLY ---
  const handleWipeTransactions = async () => {
    const confirmed = window.confirm(
      "ARE YOU SURE? This will delete ALL financial history. This cannot be undone."
    );
    if (!confirmed) return;

    setIsWipingTransactions(true);
    try {
      // 1. Ensure we have the latest list
      await fetchTransactions();
      const currentTransactions = useTransactionStore.getState().transactions;

      if (currentTransactions.length === 0) {
        toast.info("No transactions to delete.");
        return;
      }

      // 2. Delete all concurrently
      await Promise.all(
        currentTransactions.map((tx) => deleteTransaction(tx.$id))
      );

      toast.success("Financial history successfully erased.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to wipe transactions.");
    } finally {
      setIsWipingTransactions(false);
    }
  };

  // --- FUNCTION 2: FACTORY RESET (ALL DATA) ---
  const handleFactoryReset = async () => {
    const password = window.prompt(
      "SECURITY CHECK: Type 'DELETE-ALL' to wipe Clients, Pets, and Transactions."
    );

    if (password !== "DELETE-ALL") {
      toast.error("Incorrect confirmation code. Action cancelled.");
      return;
    }

    setIsFactoryResetting(true);
    try {
      // STEP 1: Fetch everything to ensure local state matches DB
      await Promise.all([
        fetchTransactions(),
        fetchAllPets(true),
        fetchClients(true),
      ]);

      // Get latest state directly
      const txs = useTransactionStore.getState().transactions;
      const pets = usePetStore.getState().allPets;
      const clients = useClientStore.getState().clients;

      toast.loading("Phase 1: Erasing Transactions...", { id: "reset-toast" });

      // STEP 2: Delete Transactions (Bottom of hierarchy)
      // We chunk these if there are thousands, but Promise.all is fine for <500
      await Promise.all(txs.map((t) => deleteTransaction(t.$id)));

      toast.loading("Phase 2: Removing Pets...", { id: "reset-toast" });

      // STEP 3: Delete Pets (Middle of hierarchy)
      await Promise.all(pets.map((p) => deletePet(p.$id)));

      toast.loading("Phase 3: Removing Clients...", { id: "reset-toast" });

      // STEP 4: Delete Clients (Top of hierarchy)
      await Promise.all(
        clients.map((c: { $id: string }) => deleteClient(c.$id))
      );

      toast.dismiss("reset-toast");
      toast.success("SYSTEM RESET COMPLETE. All databases are empty.");

      // Optional: Reload page to clear any lingering cache
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.dismiss("reset-toast");
      toast.error("Factory reset encountered an error. Check console.");
    } finally {
      setIsFactoryResetting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="h-8 w-8 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
            Danger Zone
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Irreversible Data Operations
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* OPTION 1: WIPE TRANSACTIONS */}
        <div className="group bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:border-orange-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-orange-500" />
                Reset Financial Data
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
                Deletes <strong>all transactions</strong> only. Clients and Pets
                will remain intact. Use this if you want to clear test payments
                but keep your customer list.
              </p>
            </div>

            <Button
              onClick={handleWipeTransactions}
              disabled={isWipingTransactions || isFactoryResetting}
              className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-orange-500 hover:text-white border border-transparent hover:border-orange-600 font-bold text-xs uppercase tracking-widest h-12 px-6 rounded-xl transition-all"
            >
              {isWipingTransactions ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Wipe Transactions"
              )}
            </Button>
          </div>
        </div>

        {/* OPTION 2: FACTORY RESET */}
        <div className="group relative bg-rose-950/5 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-500/20 p-6 rounded-3xl hover:border-rose-500 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-rose-600 dark:text-rose-500 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                Factory Reset
              </h3>
              <p className="text-xs text-rose-900/60 dark:text-rose-200/60 font-medium max-w-sm leading-relaxed">
                <strong>NUCLEAR OPTION.</strong> Completely erases Transactions,
                Pets, and Clients. Your application will be returned to a blank
                state.
              </p>
            </div>

            <Button
              onClick={handleFactoryReset}
              disabled={isFactoryResetting || isWipingTransactions}
              className="bg-rose-600 text-white hover:bg-rose-700 font-black text-xs uppercase tracking-widest h-12 px-6 rounded-xl shadow-lg shadow-rose-500/20"
            >
              {isFactoryResetting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Everything
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
