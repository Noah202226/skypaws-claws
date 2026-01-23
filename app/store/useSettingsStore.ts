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
        Query.limit(1000),
      ]);
      set({ items: res.documents as any });
    } finally {
      set({ isLoading: false });
    }
  },
  // Tip: Adding a local state update after adding/removing items
  // makes the UI feel much faster!
  addItem: async (colId, data) => {
    try {
      const newItem = await databases.createDocument(
        DATABASE_ID!,
        colId,
        ID.unique(),
        data,
      );
      set((state) => ({
        items: [...state.items, newItem as any].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }));
    } catch (error) {
      console.error("Error adding setting:", error);
    }
  },

  removeItem: async (colId, docId) => {
    try {
      await databases.deleteDocument(DATABASE_ID!, colId, docId);
      set((state) => ({ items: state.items.filter((i) => i.$id !== docId) }));
    } catch (error) {
      console.error("Error removing setting:", error);
    }
  },
}));
