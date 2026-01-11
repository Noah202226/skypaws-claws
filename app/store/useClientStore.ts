import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { databases, DATABASE_ID } from "@/lib/appwrite";
import { ID } from "appwrite";

import { ClientData } from "../types/index";

import { usePetStore } from "./usePetStore";

interface ClientState {
  isSyncing: boolean;
  clients: ClientData[];
  selectedClient: ClientData | null;
  searchQuery: string;
  isLoading: boolean;

  // Fetching
  fetchClients: (force?: boolean) => Promise<void>;

  // Actions
  addClient: (data: any) => Promise<void>;
  updateClient: (
    id: string,
    data: Partial<Omit<ClientData, "$id" | "$createdAt">>
  ) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  setSelectedClient: (client: ClientData | null) => void;
  setSearchQuery: (query: string) => void;
}

const CLIENT_COLLECTION_ID = "6961d65a0027d534256a";
const PETS_COLLECTION_ID = "pets";

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      isSyncing: false,
      clients: [],
      selectedClient: null,
      searchQuery: "",
      isLoading: false,

      fetchClients: async (force = false) => {
        const isBackgroundFetch = get().clients.length > 0;

        if (isBackgroundFetch) set({ isSyncing: true });
        else set({ isLoading: true });

        try {
          const response = await databases.listDocuments(
            DATABASE_ID!,
            CLIENT_COLLECTION_ID
          );
          set({ clients: response.documents as unknown as ClientData[] });
        } catch (error) {
          console.error("Error fetching clients:", error);
        } finally {
          set({ isSyncing: false, isLoading: false });
        }
      },

      addClient: async (formData: any) => {
        set({ isSyncing: true });
        try {
          // 1. Extract Client Data
          const clientPayload = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            age: formData.age,
            occupation: formData.occupation,
            birthdate: formData.birthdate,
          };

          // 2. Create Client in Appwrite
          const newClient = await databases.createDocument(
            DATABASE_ID!,
            CLIENT_COLLECTION_ID,
            ID.unique(),
            clientPayload
          );

          // 3. If Pet Name exists, create the Pet linked to this Client
          if (formData.petName) {
            await databases.createDocument(
              DATABASE_ID!,
              PETS_COLLECTION_ID,
              ID.unique(),
              {
                name: formData.petName,
                type: formData.petType,
                breed: formData.petBreed,
                clientId: newClient.$id, // The link
              }
            );
          }

          // 4. Update local state
          set((state: any) => ({
            clients: [newClient, ...state.clients],
          }));

          await usePetStore.getState().fetchAllPets();
          get().fetchClients(true);
        } catch (error) {
          console.error("Store Error:", error);
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      updateClient: async (id, data) => {
        set({ isSyncing: true });
        try {
          const updatedDoc = await databases.updateDocument(
            DATABASE_ID!,
            CLIENT_COLLECTION_ID,
            id,
            data
          );

          set((state) => ({
            clients: state.clients.map((c) =>
              c.$id === id
                ? { ...c, ...(updatedDoc as unknown as ClientData) }
                : c
            ),
            selectedClient:
              state.selectedClient?.$id === id
                ? {
                    ...state.selectedClient,
                    ...(updatedDoc as unknown as ClientData),
                  }
                : state.selectedClient,
          }));
        } catch (error) {
          console.error("Error updating client:", error);
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      deleteClient: async (id) => {
        set({ isSyncing: true });
        try {
          await databases.deleteDocument(
            DATABASE_ID!,
            CLIENT_COLLECTION_ID,
            id
          );

          set((state) => ({
            clients: state.clients.filter((c) => c.$id !== id),
            selectedClient:
              state.selectedClient?.$id === id ? null : state.selectedClient,
          }));
        } catch (error) {
          console.error("Error deleting client:", error);
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      setSelectedClient: (client) => set({ selectedClient: client }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "client-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clients: state.clients,
        searchQuery: state.searchQuery,
      }),
    }
  )
);
