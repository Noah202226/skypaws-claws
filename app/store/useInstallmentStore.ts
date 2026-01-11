// app/store/useInstallmentStore.ts
import { create } from "zustand";
import { databases, DATABASE_ID } from "@/lib/appwrite";
import { ID, Query, Models } from "appwrite";
import { useTransactionStore } from "./useTransactionStore";
import { toast } from "sonner";

interface Installment extends Models.Document {
  transactionId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
}

interface InstallmentState {
  installments: Record<string, Installment[]>;
  isLoading: boolean;
  fetchInstallments: (transactionId: string) => Promise<void>;
  addInstallment: (
    transactionId: string,
    amount: number,
    method: string,
    customeDate: string,
    notes: string
  ) => Promise<void>;
  deleteInstallment: (
    installmentId: string,
    transactionId: string,
    petId: string
  ) => Promise<void>;
}

const INSTALLMENT_COLLECTION_ID = "installments";
const TRANSACTION_COLLECTION_ID = "transactions";
export const useInstallmentStore = create<InstallmentState>((set, get) => ({
  installments: {},
  isLoading: false,

  fetchInstallments: async (transactionId: string) => {
    set({ isLoading: true });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID!,
        INSTALLMENT_COLLECTION_ID,
        [
          Query.equal("transactionId", transactionId),
          Query.orderAsc("paymentDate"),
        ]
      );
      set((state) => ({
        installments: {
          ...state.installments,
          [transactionId]: response.documents as unknown as Installment[],
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addInstallment: async (
    transactionId: string,
    amount: number,
    method: string,
    customDate?: string,
    notes?: string
  ) => {
    try {
      // 1. Create the payment record in Appwrite
      await databases.createDocument(
        DATABASE_ID!,
        INSTALLMENT_COLLECTION_ID,
        ID.unique(),
        {
          transactionId,
          amountPaid: amount,
          paymentDate: customDate || new Date().toISOString(),
          paymentMethod: method,
          notes: notes || "Payment received", // Use the dynamic note
        }
      );

      // 2. Get current transaction data from Appwrite to ensure precision
      const txStore = useTransactionStore.getState();
      const targetTx = await databases.getDocument(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID,
        transactionId
      );

      const currentBalance = targetTx.balanceRemaining;
      const newBalance = Math.max(0, currentBalance - amount);
      const newStatus = newBalance <= 0 ? "Paid" : "Partial";

      // 3. Update the Actual Appwrite Document
      await databases.updateDocument(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID,
        transactionId,
        {
          balanceRemaining: newBalance,
          status: newStatus,
        }
      );

      // 4. RE-FETCH FRESH DATA: Instead of updating local state manually,
      // we trigger the fetchers from both stores to sync with the server.
      await get().fetchInstallments(transactionId);

      // If your PetDetailModal relies on the pet's full transaction history:
      if (targetTx.petId) {
        await txStore.fetchTransactions(targetTx.petId);
      }
    } catch (error) {
      console.error("Database Update Error:", error);
      throw error;
    }
  },

  deleteInstallment: async (
    installmentId: string,
    transactionId: string,
    petId: string
  ) => {
    try {
      // 1. Get the installment document first to know how much was paid
      const installment = await databases.getDocument(
        DATABASE_ID!,
        INSTALLMENT_COLLECTION_ID,
        installmentId
      );
      const amountToRestore = installment.amountPaid;

      // 2. Get the current transaction to calculate the new balance
      const tx = await databases.getDocument(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID,
        transactionId
      );

      // 3. Delete the installment
      await databases.deleteDocument(
        DATABASE_ID!,
        INSTALLMENT_COLLECTION_ID,
        installmentId
      );

      // 4. Update the Transaction document with restored balance
      const newBalance = (tx.balanceRemaining || 0) + amountToRestore;

      await databases.updateDocument(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID,
        transactionId,
        {
          balanceRemaining: newBalance,
          status: newBalance <= 0 ? "Paid" : "Partial",
        }
      );

      // 5. Refresh both local states
      await get().fetchInstallments(transactionId);
      await useTransactionStore.getState().fetchTransactions(petId);

      toast.success("Payment deleted and balance restored");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete payment");
    }
  },
}));
