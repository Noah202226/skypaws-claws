import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { databases, DATABASE_ID } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

interface Pet {
  $id: string;
  name: string;
  type: string;
  breed: string;
  clientId: string;
}

interface Transaction {
  $id?: string;
  petId: string;
  serviceName: string;
  totalAmount: number;
  amountPaid: number;
  balanceRemaining: number;
  paymentStatus: "Paid" | "Partial";
  date: string;
}

interface PetState {
  isSyncing: boolean;
  allPets: Pet[]; // Global cache for the main list
  clientPets: Pet[]; // Specific list for selected client
  transactions: Transaction[];
  isPetsLoading: boolean;
  isLoading: boolean;

  // Fetching
  fetchAllPets: (force?: boolean) => Promise<void>;
  fetchPetsByClient: (clientId: string) => Promise<void>;
  fetchTransactions: (petId: string) => Promise<void>;

  // Actions
  createPet: (data: Omit<Pet, "$id">) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;

  addTransaction: (data: Omit<Transaction, "$id">) => Promise<void>;
  updateTransactionPayment: (
    id: string,
    additionalPayment: number
  ) => Promise<void>;
}

const PETS_COLLECTION_ID = "pets";
const TRANSACTIONS_COLLECTION_ID = "transactions";

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      isSyncing: false,
      allPets: [],
      clientPets: [],
      transactions: [],
      isPetsLoading: false,
      isLoading: false,

      fetchAllPets: async (force = false) => {
        const isBackgroundFetch = get().clientPets.length > 0;

        // If we have data, we 'sync' in background; if not, we 'load' (blocking)
        if (isBackgroundFetch) set({ isSyncing: true });
        else set({ isPetsLoading: true });

        try {
          const response = await databases.listDocuments(
            DATABASE_ID!,
            PETS_COLLECTION_ID,
            [Query.limit(1000)]
          );
          set({ allPets: response.documents as unknown as Pet[] });
        } catch (error) {
          console.error("Error fetching all pets:", error);
        } finally {
          set({ isSyncing: false, isPetsLoading: false });
        }
      },

      fetchPetsByClient: async (clientId: string) => {
        set({ isPetsLoading: true });
        try {
          const response = await databases.listDocuments(
            DATABASE_ID!,
            PETS_COLLECTION_ID,
            [Query.equal("clientId", clientId)]
          );
          set({ clientPets: response.documents as unknown as Pet[] });
        } catch (error) {
          console.error("Error fetching client pets:", error);
        } finally {
          set({ isPetsLoading: false });
        }
      },

      createPet: async (data) => {
        set({ isLoading: true });
        try {
          const newPet = await databases.createDocument(
            DATABASE_ID!,
            PETS_COLLECTION_ID,
            ID.unique(),
            data
          );

          const petDoc = newPet as unknown as Pet;

          // Optimistic local update: add to both lists immediately
          set((state) => ({
            allPets: [...state.allPets, petDoc],
            clientPets: [...state.clientPets, petDoc],
          }));
        } catch (error) {
          console.error("Create pet error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deletePet: async (petId: string) => {
        set({ isLoading: true });
        try {
          // Delete from Appwrite
          await databases.deleteDocument(
            DATABASE_ID!,
            PETS_COLLECTION_ID,
            petId
          );

          // Update local state: remove from allPets and clientPets
          set((state) => ({
            allPets: state.allPets.filter((p) => p.$id !== petId),
            clientPets: state.clientPets.filter((p) => p.$id !== petId),
          }));
        } catch (error) {
          console.error("Error deleting pet:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchTransactions: async (petId: string) => {
        set({ isLoading: true });
        try {
          const response = await databases.listDocuments(
            DATABASE_ID!,
            TRANSACTIONS_COLLECTION_ID!,
            [Query.equal("petId", petId)]
          );
          set({ transactions: response.documents as unknown as Transaction[] });
        } catch (error) {
          console.error("Error fetching transactions:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addTransaction: async (data) => {
        try {
          const newDoc = await databases.createDocument(
            DATABASE_ID!,
            TRANSACTIONS_COLLECTION_ID!,
            ID.unique(),
            data
          );
          set((state) => ({
            transactions: [
              ...state.transactions,
              newDoc as unknown as Transaction,
            ],
          }));
        } catch (error) {
          console.error("Error adding transaction:", error);
          throw error;
        }
      },

      updateTransactionPayment: async (id, additionalPayment) => {
        const transaction = get().transactions.find((t) => t.$id === id);
        if (!transaction) return;

        const newAmountPaid = transaction.amountPaid + additionalPayment;
        const newBalance = transaction.totalAmount - newAmountPaid;

        try {
          const updated = await databases.updateDocument(
            DATABASE_ID!,
            TRANSACTIONS_COLLECTION_ID!,
            id,
            {
              amountPaid: newAmountPaid,
              balanceRemaining: newBalance,
              paymentStatus: newBalance <= 0 ? "Paid" : "Partial",
            }
          );

          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.$id === id ? (updated as unknown as Transaction) : t
            ),
          }));
        } catch (error) {
          console.error("Error updating payment:", error);
        }
      },
    }),
    {
      name: "pet-storage",
      storage: createJSONStorage(() => localStorage),
      // We only want to persist the lists, not the loading states
      partialize: (state) => ({ allPets: state.allPets }),
    }
  )
);
