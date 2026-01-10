"use client";

import { useEffect, useState, useMemo } from "react";
import { useClientStore } from "@/app/store/useClientStore";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  ChevronRight,
  Loader2,
  RefreshCcw,
  Search,
  X,
  PawPrint,
  MapPin,
  Phone,
} from "lucide-react";
import AddClientModal from "./clients/AddClientModal";
import ClientDetailModal from "./clients/ClientDetailModal";
import { formatDate } from "./utils/dateFormatter";

// Define the Pet interface for TypeScript safety
interface Pet {
  name: string;
  type: string;
}

export default function ClientsSection() {
  const {
    clients,
    isLoading,
    fetchClients,
    selectedClient,
    setSelectedClient,
    searchQuery,
    setSearchQuery,
  } = useClientStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  /**
   * Safe parsing helper to handle Appwrite's stringified JSON data.
   * This prevents "Argument of type string[] is not assignable" errors.
   */
  const parsePets = (petsData: any): Pet[] => {
    if (!petsData) return [];
    try {
      const parsed =
        typeof petsData === "string" ? JSON.parse(petsData) : petsData;
      // Handle the case where Appwrite returns an array of stringified objects
      return Array.isArray(parsed)
        ? parsed.map((item: any) =>
            typeof item === "string" ? JSON.parse(item) : item
          )
        : [];
    } catch (e) {
      console.error("Failed to parse pets:", e);
      return [];
    }
  };

  /**
   * Filter logic: Searches Client Name, Phone, and Pet Names.
   * Memoized to ensure high performance during typing.
   */
  const filteredClients = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return clients;

    return clients.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(searchLower);
      const phoneMatch = client.phone.includes(searchLower);

      // Check if any of the client's pets match the search
      const petList = parsePets(client.pets);
      const petMatch = petList.some((pet) =>
        pet.name.toLowerCase().includes(searchLower)
      );

      return nameMatch || phoneMatch || petMatch;
    });
  }, [clients, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* --- Header Area --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Client <span className="text-indigo-500">Database</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {filteredClients.length} Records Found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchClients(true)}
            disabled={isLoading}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] font-bold uppercase text-[10px] tracking-widest h-11 px-6 rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </div>
      </div>

      {/* --- Search Bar --- */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
        <input
          type="text"
          placeholder="Search name, phone, or pet name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* --- Client Card Grid --- */}
      {isLoading && clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => {
              const petList = parsePets(client.pets);

              // Calculate if the client is "New" (joined in last 24 hours)
              const isNew = (() => {
                const createdDate = new Date(client.$createdAt).getTime();
                const now = new Date().getTime();
                return now - createdDate < 24 * 60 * 60 * 1000;
              })();

              return (
                <button
                  key={client.$id}
                  onClick={() => setSelectedClient(client)}
                  className="relative group w-full text-left bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all duration-300 overflow-hidden"
                >
                  {/* Glass Background Decor */}
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-600/10 blur-3xl group-hover:bg-indigo-600/20 transition-all" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600/20 transition-all duration-500">
                        <Users className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-black text-white tracking-tight leading-none group-hover:text-indigo-100 transition-colors">
                            {client.name}
                          </h4>
                          {isNew && (
                            <span className="bg-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        {formatDate(client.$createdAt)}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Contact Info Snaps */}
                  <div className="grid grid-cols-2 gap-3 mb-5 px-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-indigo-500/70" />
                      <span className="text-[11px] font-bold tracking-tight">
                        {client.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500/70" />
                      <span className="text-[11px] font-bold tracking-tight truncate">
                        {client.address || "No Address Set"}
                      </span>
                    </div>
                  </div>

                  {/* Footer Section: Pets Tags & Total Count */}
                  <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {petList.length > 0 ? (
                        petList.slice(0, 2).map((pet, idx) => (
                          <span
                            key={idx}
                            className="bg-pink-500/10 text-pink-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-pink-500/20 shadow-sm"
                          >
                            {pet.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">
                          No Pets Found
                        </span>
                      )}
                      {petList.length > 2 && (
                        <span className="text-slate-500 text-[9px] font-black pt-1">
                          +{petList.length - 2} More
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                      <PawPrint className="h-3 w-3 text-indigo-500" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase">
                        {petList.length} {petList.length === 1 ? "Pet" : "Pets"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <p className="text-slate-600 text-sm font-black uppercase tracking-[0.2em]">
                No Database Entry Found
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- Modals --- */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <ClientDetailModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
}
