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
import PetDetailModal from "./clients/PetDetailModal"; // Assuming this path
import { formatDate } from "./utils/dateFormatter";
import { usePetStore } from "@/app/store/usePetStore";

import { ClientData, Pet } from "@/app/types/index";

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

  const { allPets, fetchAllPets } = usePetStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useEffect(() => {
    fetchClients();
    fetchAllPets();
  }, []);

  /**
   * 1. STABLE DATA MAPPING
   * We combine clients and pets once, so the pet objects
   * passed to the modal don't change unless the data actually changes.
   */
  const clientsWithPets = useMemo(() => {
    return clients.map((client) => ({
      ...client,
      pets: allPets.filter((p: any) => p.clientId === client.$id),
    }));
  }, [clients, allPets]);

  /**
   * 2. FILTER LOGIC
   * Now filtering against our stable 'clientsWithPets' array
   */
  const filteredClients = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return clientsWithPets;

    return clientsWithPets.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(searchLower);
      const phoneMatch = client.phone.includes(searchLower);
      const petMatch = client.pets.some(
        (pet) =>
          pet.name.toLowerCase().includes(searchLower) ||
          (pet.breed && pet.breed.toLowerCase().includes(searchLower))
      );

      return nameMatch || phoneMatch || petMatch;
    });
  }, [clientsWithPets, searchQuery]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-hidden">
      {/* --- Header Area (Fixed) --- */}
      <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      {/* --- Search Bar (Fixed) --- */}
      <div className="flex-none relative group">
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

      {/* --- Client Card Grid (Scrollable) --- */}
      <div className="flex-1 min-h-0 relative">
        <div
          className="h-[65vh] overflow-y-auto pr-2 custom-scrollbar pb-10"
          style={{ scrollbarGutter: "stable" }}
        >
          {isLoading && clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  // 🔥 NEW RELATIONAL LOGIC:
                  // Filter allPets to find only those belonging to this client
                  const clientPets = allPets.filter(
                    (p: any) => p.clientId === client.$id
                  );

                  const isNew = (() => {
                    const createdDate = new Date(client.$createdAt).getTime();
                    const now = new Date().getTime();
                    return now - createdDate < 24 * 60 * 60 * 1000;
                  })();

                  return (
                    <div
                      key={client.$id}
                      onClick={() => setSelectedClient(client)}
                      className="relative group w-full text-left bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      {/* Glass Background Decor */}
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-600/10 blur-3xl group-hover:bg-indigo-600/20 transition-all" />

                      {/* Header Content */}
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
                            <span className="text-[10px] text-slate-500 font-bold uppercase">
                              {formatDate(client.$createdAt)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-2 gap-3 mb-5 px-1 text-slate-400">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-indigo-500/70" />
                          <span className="text-[11px] font-bold tracking-tight">
                            {client.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500/70" />
                          <span className="text-[11px] font-bold tracking-tight truncate">
                            {client.address || "No Address"}
                          </span>
                        </div>
                      </div>

                      {/* Footer Section: Using clientPets from the filter above */}
                      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {clientPets.length > 0 ? (
                            clientPets
                              .slice(0, 2)
                              .map((pet: any, idx: number) => (
                                <button
                                  key={pet.$id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPet(pet); // Now uses the real Pet object
                                  }}
                                  className="relative z-10 bg-pink-500/10 hover:bg-pink-500/30 text-pink-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-pink-500/20 shadow-sm transition-all active:scale-95"
                                >
                                  {pet.name}
                                </button>
                              ))
                          ) : (
                            <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">
                              No Pets
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                          <PawPrint className="h-3 w-3 text-indigo-500" />
                          <span className="text-[10px] font-black text-indigo-400 uppercase">
                            {clientPets.length}{" "}
                            {clientPets.length === 1 ? "Pet" : "Pets"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                  <p className="text-slate-600 text-sm font-black uppercase tracking-[0.2em]">
                    No Records Found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

      <PetDetailModal
        pet={selectedPet}
        isOpen={!!selectedPet}
        onClose={() => setSelectedPet(null)}
      />

      {/* Add this CSS for the scrollbar if not in global.css */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
    </div>
  );
}
