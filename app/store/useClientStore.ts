import { create } from "zustand";
import { ClientData } from "@/app/types/index";
import { databases, ID } from "@/lib/appwrite";
import { Query } from "appwrite";

interface ClientState {
  clients: ClientData[];
  selectedClient: ClientData | null;
  isLoading: boolean;
  lastFetched: number | null;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  fetchClients: (force?: boolean) => Promise<void>;
  setSelectedClient: (client: ClientData | null) => void;
  addClient: (formData: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    age?: string;
    occupation?: string;
    birthdate?: string;
    // Optional initial pet fields
    petName?: string;
    petType?: string;
    petBreed?: string;
  }) => Promise<void>;

  updateClient: (clientId: string, data: Partial<ClientData>) => Promise<void>;

  deleteClient: (clientId: string) => Promise<void>;
}

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
const COLLECTION_ID = "6961d65a0027d534256a";
const PETS_COLLECTION_ID = "pets";

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,
  lastFetched: null,

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedClient: (client) => set({ selectedClient: client }),

  // Inside useClientStore.ts
  fetchClients: async (force = false) => {
    const { lastFetched, clients } = get();
    const fiveMinutes = 5 * 60 * 1000;

    // Only use cache if NOT forced and data is fresh
    if (
      !force &&
      clients.length > 0 &&
      lastFetched &&
      Date.now() - lastFetched < fiveMinutes
    ) {
      console.log("Using cached client data...");
      return;
    }

    set({ isLoading: true });
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderDesc("$createdAt")]
      );

      set({
        clients: response.documents as unknown as ClientData[],
        lastFetched: Date.now(), // Update timestamp
        isLoading: false,
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      set({ isLoading: false });
    }
  },

  // Inside useClientStore.ts -> addClient
  addClient: async (data: any) => {
    try {
      // 1. Prepare the pet data (if it exists)
      // We create a stringified object, then wrap it in an ARRAY []
      const petData = data.petName
        ? [
            JSON.stringify({
              name: data.petName,
              type: data.petType,
              breed: data.petBreed,
            }),
          ]
        : [];

      // 2. Save the Client
      const clientResponse = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          age: data.age,
          occupation: data.occupation,
          birthdate: data.birthdate,

          // ✅ This must be an array to match your Appwrite Attribute type
          pets: petData,
        }
      );

      // 3. Save to Pets Collection (Keep this for deep management)
      if (data.petName) {
        await databases.createDocument(
          DATABASE_ID,
          PETS_COLLECTION_ID,
          ID.unique(),
          {
            name: data.petName,
            type: data.petType,
            breed: data.petBreed,
            clientId: clientResponse.$id,
            ownerName: clientResponse.name,
          }
        );
      }

      get().fetchClients(true);
    } catch (error) {
      console.error("Add Client Error:", error);
      throw error;
    }
  },

  updateClient: async (clientId, data) => {
    set({ isLoading: true });
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        clientId,
        data
      );

      const updatedClient = response as unknown as ClientData;

      set((state) => ({
        clients: state.clients.map((c) =>
          c.$id === clientId ? updatedClient : c
        ),
        // Also update selectedClient if it's the one being edited
        selectedClient:
          state.selectedClient?.$id === clientId
            ? updatedClient
            : state.selectedClient,
        isLoading: false,
      }));

      get().fetchClients(true);
    } catch (error) {
      set({ isLoading: false });
      console.error("Update Error:", error);
      throw error;
    }
  },

  deleteClient: async (clientId) => {
    set({ isLoading: true });
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, clientId);

      set((state) => ({
        clients: state.clients.filter((c) => c.$id !== clientId),
        selectedClient: null, // Clear selection after delete
        isLoading: false,
      }));

      get().fetchClients(true);
    } catch (error) {
      set({ isLoading: false });
      console.error("Delete Error:", error);
      throw error;
    }
  },
}));
