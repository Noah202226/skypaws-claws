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
import PetDetailModal from "./clients/PetDetailModal";
import { formatDate } from "./utils/dateFormatter";
import { usePetStore } from "@/app/store/usePetStore";
import { Pet } from "@/app/types/index";
import AppointmentReminders from "../AppointmentReminders";
import { useTransactionStore } from "@/app/store/useTransactionStore";

export default function ClientsSection() {
  const {
    clients,
    isLoading,
    fetchClients,
    selectedClient,
    setSelectedClient,
    searchQuery,
    setSearchQuery,
    isSyncing,
    hasMore,
    loadMoreClients,
  } = useClientStore();

  const { allPets, fetchAllPets } = usePetStore();
  const { fetchTransactions } = useTransactionStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useEffect(() => {
    fetchClients();
    fetchAllPets();
    fetchTransactions();
  }, [fetchClients, fetchAllPets, fetchTransactions]);

  const clientsWithPets = useMemo(() => {
    // 1. Always map clients even if pets aren't loaded yet to prevent empty screen
    return clients.map((client) => {
      // 2. Debug: If pets aren't showing, log one check
      // console.log(`Checking pets for ${client.name} (ID: ${client.$id})`);

      const pets = allPets.filter((p) => {
        // Force string comparison and trim to avoid hidden whitespace issues
        return String(p.clientId).trim() === String(client.$id).trim();
      });

      return {
        ...client,
        pets: pets || [],
      };
    });
  }, [clients, allPets]); // This will re-run as soon as allPets is updated from the fetch

  const filteredClients = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return clientsWithPets;

    return clientsWithPets.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(searchLower);
      const phoneMatch = client.phone.includes(searchLower);
      const petMatch = client.pets.some(
        (pet) =>
          pet.name.toLowerCase().includes(searchLower) ||
          (pet.breed && pet.breed.toLowerCase().includes(searchLower)),
      );
      return nameMatch || phoneMatch || petMatch;
    });
  }, [clientsWithPets, searchQuery]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-hidden">
      {/* --- Header Area --- */}
      <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
            Client{" "}
            <span className="text-indigo-600 dark:text-indigo-500">
              Database
            </span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {filteredClients.length} Records Found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              // This will refresh both Clients and Pets
              await Promise.all([
                fetchClients(true),
                fetchAllPets(true),
                fetchTransactions(), // <--- This updates the sidebar data!
              ]);
            }}
            disabled={isLoading}
            className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 font-black uppercase text-[10px] tracking-widest h-11 px-6 rounded-xl transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </div>
      </div>

      {/* --- Search Bar --- */}
      <div className="flex-none relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Search name, phone, or pet name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* --- Client Card Grid --- */}
      <div className="flex-1 min-h-0 relative">
        <div className="h-[65vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
          {isLoading && clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  // Use the pre-filtered pets from our memo
                  const clientPets = client.pets || [];

                  const isNew = (() => {
                    const createdDate = new Date(client.$createdAt).getTime();
                    return (
                      new Date().getTime() - createdDate < 24 * 60 * 60 * 1000
                    );
                  })();

                  return (
                    <div
                      key={client.$id}
                      onClick={() => setSelectedClient(client)}
                      className="relative group w-full text-left bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 hover:bg-slate-50 dark:hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none cursor-pointer overflow-hidden"
                    >
                      {/* Brand Accent Blur */}
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-600/10 blur-3xl group-hover:bg-indigo-500/20 transition-all" />

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            <Users className="h-6 w-6 text-slate-500 dark:text-indigo-400 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                {client.name}
                              </h4>
                              {isNew && (
                                <span className="bg-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white italic">
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                              Registered: {formatDate(client.$createdAt)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-2 gap-3 mb-5 px-1">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Phone className="h-3.5 w-3.5 text-indigo-500/70" />
                          <span className="text-[11px] font-bold tracking-tight">
                            {client.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500/70" />
                          <span className="text-[11px] font-bold tracking-tight truncate">
                            {client.address || "No Address Provided"}
                          </span>
                        </div>
                      </div>

                      {/* Pet Tags */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {clientPets.length > 0 ? (
                            clientPets.slice(0, 2).map((pet: any) => (
                              <button
                                key={pet.$id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPet(pet);
                                }}
                                className="relative z-10 bg-pink-50 dark:bg-pink-500/10 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500/30 text-pink-600 dark:text-pink-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-pink-100 dark:border-pink-500/20 shadow-sm transition-all"
                              >
                                {pet.name}
                              </button>
                            ))
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest">
                              No Registered Pets
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                          <PawPrint className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase">
                            {clientPets.length}{" "}
                            {clientPets.length === 1 ? "Pet" : "Pets"}
                          </span>
                        </div>
                      </div>

                      {hasMore && (
                        <Button
                          onClick={loadMoreClients}
                          disabled={isSyncing}
                          className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest py-6"
                        >
                          {isSyncing ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Load More Records"
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-900/20">
                  <p className="text-slate-400 dark:text-slate-600 text-sm font-black uppercase tracking-[0.2em]">
                    No Matching Records
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
        onClose={async () => {
          setSelectedClient(null);
          await Promise.all([fetchAllPets(true), fetchTransactions()]);
        }}
      />
      <PetDetailModal
        pet={selectedPet}
        isOpen={!!selectedPet}
        onClose={async () => {
          setSelectedPet(null);
          // Refresh pets and transactions so the sidebar removes the deleted pet's reminders
          await Promise.all([fetchAllPets(true), fetchTransactions()]);
        }}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
    </div>
  );
}
