import { create } from "zustand";
import { DATABASE_ID, databases } from "@/lib/appwrite"; // Update with your path
import { ID, Query } from "appwrite";

interface ConfigItem {
  $id: string;
  name: string;
  price?: number;
  categoryId?: string;
}

interface SettingsState {
  items: ConfigItem[];
  isLoading: boolean;
  fetchItems: (collectionId: string) => Promise<void>;
  addItem: (collectionId: string, data: any) => Promise<void>;
  removeItem: (collectionId: string, id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  items: [],
  isLoading: false,
  fetchItems: async (colId) => {
    set({ isLoading: true });
    try {
      const res = await databases.listDocuments(DATABASE_ID!, colId, [
        Query.orderAsc("name"),
      ]);
      set({ items: res.documents as any });
    } finally {
      set({ isLoading: false });
    }
  },
  addItem: async (colId, data) => {
    await databases.createDocument(DATABASE_ID!, colId, ID.unique(), data);
  },
  removeItem: async (colId, docId) => {
    await databases.deleteDocument(DATABASE_ID!, colId, docId);
  },
}));
