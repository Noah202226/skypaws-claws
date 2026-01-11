import { create } from "zustand";
import { databases, DATABASE_ID } from "@/lib/appwrite";
import { ID, Query, Models } from "appwrite";

interface Installment extends Models.Document {
  transactionId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
}

interface Transaction extends Models.Document {
  petId: string;
  serviceName: string;
  totalAmount: number;
  balanceRemaining: number;
  status: "Paid" | "Partial";
  transactionDate: string;
  clinicalNotes?: string;
  nextAppointmentDate?: string | null;
  recordedWeight?: string;
}

export interface AddTransactionData {
  petId: string;
  serviceName: string;
  totalAmount: number;
  balanceRemaining: number;
  status: "Paid" | "Partial";
  transactionDate: string;
  initialAmountPaid: number;
  paymentMethod: string;
  clinicalNotes?: string;
  nextAppointmentDate?: string | null;
  recordedWeight?: string;
}

interface TransactionState {
  transactions: Transaction[];
  installments: Record<string, Installment[]>; // Added missing state type
  isLoading: boolean;
  fetchTransactions: (petId: string) => Promise<void>;
  // UPDATED: Return type matches the return statement
  addTransaction: (
    data: AddTransactionData
  ) => Promise<{ newTx: Transaction; firstInstallment: Installment }>;
  updateTransaction: (
    id: string,
    data: Partial<AddTransactionData>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const TRANSACTION_COLLECTION_ID = "transactions";
const INSTALLMENT_COLLECTION_ID = "installments";

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  installments: {},
  isLoading: false,

  fetchTransactions: async (petId: string) => {
    const { isLoading, transactions } = get();

    // Prevent fetching if already loading
    if (isLoading) return;

    // Guard 2: Optional - Don't fetch if we already have the data
    // and the first transaction belongs to this pet.
    if (transactions.length > 0 && transactions[0].petId === petId) return;

    set({ isLoading: true });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID,
        [Query.equal("petId", petId), Query.orderDesc("transactionDate")]
      );
      set({
        transactions: response.documents as unknown as Transaction[],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addTransaction: async (data: AddTransactionData) => {
    try {
      const {
        initialAmountPaid,
        paymentMethod,
        transactionDate,
        ...txPayload
      } = data;

      const newTx = (await databases.createDocument(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID,
        ID.unique(),
        { ...txPayload, transactionDate }
      )) as unknown as Transaction;

      const firstInstallment = (await databases.createDocument(
        DATABASE_ID!,
        INSTALLMENT_COLLECTION_ID,
        ID.unique(),
        {
          transactionId: newTx.$id,
          amountPaid: initialAmountPaid,
          paymentDate: transactionDate,
          paymentMethod: paymentMethod || "Cash",
          notes:
            data.status === "Paid" ? "Full Payment" : "Initial Downpayment",
        }
      )) as unknown as Installment;

      set((state) => ({
        transactions: [newTx, ...state.transactions],
        installments: {
          ...state.installments,
          [newTx.$id]: [firstInstallment],
        },
      }));

      return { newTx, firstInstallment };
    } catch (error) {
      console.error("Combined Create Error:", error);
      throw error;
    }
  },

  updateTransaction: async (id: string, data: Partial<AddTransactionData>) => {
    try {
      // Create a payload removing fields that aren't in the Transaction collection
      const { initialAmountPaid, paymentMethod, ...updatePayload } = data;

      const response = await databases.updateDocument(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID,
        id,
        updatePayload
      );

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.$id === id ? (response as unknown as Transaction) : t
        ),
      }));
    } catch (error) {
      console.error("Update Error:", error);
      throw error;
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID,
        id
      );
      set((state) => ({
        transactions: state.transactions.filter((t) => t.$id !== id),
      }));
    } catch (error) {
      console.error("Delete Error:", error);
      throw error;
    }
  },
}));
