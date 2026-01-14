"use client";

import { useState, useEffect } from "react";
import { ClientData, Pet } from "@/app/types/index";
import { useClientStore } from "@/app/store/useClientStore";
import { usePetStore } from "@/app/store/usePetStore";
// 1. Import the Transaction Store
import { useTransactionStore } from "@/app/store/useTransactionStore";
import { toast } from "sonner";
import {
  X,
  User,
  PawPrint,
  Edit2,
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PetDetailModal from "./PetDetailModal";

interface Props {
  client: ClientData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditableItemProps {
  label: string;
  value: string;
  isEdit: boolean;
  onChange: (v: string) => void;
  type?: string;
  isTextArea?: boolean;
}

export default function ClientDetailModal({ client, isOpen, onClose }: Props) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { updateClient, deleteClient } = useClientStore();
  // 2. Destructure deletePet from usePetStore
  const { clientPets, fetchPetsByClient, isPetsLoading, createPet, deletePet } =
    usePetStore();

  // 3. Get transaction tools
  const { transactions, fetchTransactions, deleteTransaction } =
    useTransactionStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    age: "",
    occupation: "",
    birthdate: "",
    address: "",
  });

  const [newPet, setNewPet] = useState({ name: "", type: "Dog", breed: "" });

  useEffect(() => {
    if (client && isOpen) {
      setEditFormData({
        name: client.name || "",
        phone: client.phone || "",
        age: client.age || "",
        occupation: client.occupation || "",
        birthdate: client.birthdate || "",
        address: client.address || "",
      });
      fetchPetsByClient(client.$id);
      // 4. Ensure we have transactions loaded so we can find which ones to delete
      fetchTransactions();
    }
  }, [client, isOpen, fetchPetsByClient, fetchTransactions]);

  if (!isOpen || !client) return null;

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateClient(client.$id, editFormData);
      setIsEditMode(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddPet = async () => {
    if (!newPet.name) return toast.warning("Please enter a pet name");
    setIsUpdating(true);
    try {
      await createPet({ ...newPet, clientId: client.$id });
      setNewPet({ name: "", type: "Dog", breed: "" });
      setIsAddingPet(false);
      toast.success(`${newPet.name} added to records`);
    } catch (err) {
      toast.error("Failed to add pet document");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- UPDATED DELETE LOGIC ---
  const handleDeleteClient = async () => {
    if (deletePassword !== "123GHouls@#") {
      setIsShaking(true);
      toast.error("Invalid Security Password");
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsDeleting(true);
    try {
      // STEP 1: Identify all pets belonging to this client
      // clientPets is already populated by the useEffect logic
      const petsToDelete = clientPets;

      // STEP 2: Find and Delete Transactions for these pets
      // We filter the global transaction list for any transaction matching our pets' IDs
      const petIds = petsToDelete.map((p) => p.$id);

      const transactionsToDelete = transactions.filter((tx) =>
        petIds.includes(tx.petId)
      );

      // Delete transactions concurrently
      if (transactionsToDelete.length > 0) {
        await Promise.all(
          transactionsToDelete.map((tx) => deleteTransaction(tx.$id))
        );
      }

      // STEP 3: Delete the Pets
      if (petsToDelete.length > 0) {
        await Promise.all(petsToDelete.map((pet) => deletePet(pet.$id)));
      }

      // STEP 4: Finally, Delete the Client
      await deleteClient(client.$id);

      // STEP 5: Refresh Global State
      await Promise.all([
        usePetStore.getState().fetchAllPets(true),
        useClientStore.getState().fetchClients(true),
        useTransactionStore.getState().fetchTransactions(),
      ]);

      toast.success("Client and all associated records wiped.");
      setIsDeleteConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete client or associated records.");
    } finally {
      setIsDeleting(false);
    }
  };
  // ----------------------------

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={() => {
          onClose();
          setShowDeleteConfirm(false);
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              {isEditMode ? (
                <input
                  className="bg-white dark:bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-slate-900 dark:text-white font-black italic outline-none focus:ring-1 focus:ring-indigo-500"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              ) : (
                <h3 className="text-xl font-black text-slate-900 dark:text-white italic">
                  {client.name}
                </h3>
              )}
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Client ID: {client.$id.slice(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-2 transition-colors rounded-lg ${
                isEditMode
                  ? "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Profile Details */}
          <div className="bg-slate-50 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <EditableItem
                isEdit={isEditMode}
                label="Phone"
                value={editFormData.phone}
                onChange={(v) => setEditFormData({ ...editFormData, phone: v })}
              />
              <EditableItem
                isEdit={isEditMode}
                label="Age"
                value={editFormData.age}
                onChange={(v) => setEditFormData({ ...editFormData, age: v })}
              />
              <EditableItem
                isEdit={isEditMode}
                label="Occupation"
                value={editFormData.occupation}
                onChange={(v) =>
                  setEditFormData({ ...editFormData, occupation: v })
                }
              />
              <EditableItem
                isEdit={isEditMode}
                label="Birthdate"
                value={editFormData.birthdate}
                type="date"
                onChange={(v) =>
                  setEditFormData({ ...editFormData, birthdate: v })
                }
              />
            </div>
            <EditableItem
              isEdit={isEditMode}
              label="Address"
              value={editFormData.address}
              isTextArea
              onChange={(v) => setEditFormData({ ...editFormData, address: v })}
            />

            {isEditMode && (
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 mt-2 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white shadow-md"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Profile Changes
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Pets List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-pink-500" />
                <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Registered Patients
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingPet(!isAddingPet)}
                className="h-7 text-[10px] uppercase font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
              >
                {isAddingPet ? "Cancel" : "Add Pet"}
              </Button>
            </div>

            {isAddingPet && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50 dark:bg-indigo-600/5 border border-indigo-200 dark:border-indigo-600/20 rounded-xl animate-in slide-in-from-top-2 duration-200">
                <input
                  placeholder="Pet Name"
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  value={newPet.name}
                  onChange={(e) =>
                    setNewPet({ ...newPet, name: e.target.value })
                  }
                />
                <select
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-900 dark:text-white cursor-pointer outline-none"
                  value={newPet.type}
                  onChange={(e) =>
                    setNewPet({ ...newPet, type: e.target.value })
                  }
                >
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Other</option>
                </select>

                <Button
                  onClick={handleAddPet}
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white w-full"
                >
                  {isUpdating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              {isPetsLoading ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <p className="text-[9px] text-slate-500 uppercase font-black">
                    Syncing Patients...
                  </p>
                </div>
              ) : clientPets.length > 0 ? (
                clientPets.map((pet: any) => (
                  <button
                    key={pet.$id}
                    className="flex items-center p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group text-left shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPet(pet);
                    }}
                  >
                    <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <PawPrint className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                        {pet.name}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                        {pet.type} • {pet.breed || "Unknown Breed"}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.2em]">
                    No medical records found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center">
          {showDeleteConfirm && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase animate-pulse">
              <AlertTriangle className="h-4 w-4" /> Permanent Action
            </div>
          )}
          <div className="flex gap-3 ml-auto">
            {showDeleteConfirm && (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-slate-500 text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isDeleting}
              className="h-11 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 hover:text-red-600 transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Client
            </Button>
          </div>
        </div>
      </div>

      <PetDetailModal
        pet={selectedPet}
        isOpen={!!selectedPet}
        onClose={() => setSelectedPet(null)}
      />

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => {
              setIsDeleteConfirmOpen(false);
              setDeletePassword("");
            }}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-500/20 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-rose-500 animate-pulse" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">
                Critical Action
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                You are deleting the client{" "}
                <span className="font-bold text-slate-900 dark:text-white uppercase">
                  {client.name}
                </span>
                . All associated pets, medical records, and appointments will be
                detached or removed.
              </p>

              <div className="w-full space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="security-auth-challenge"
                    autoComplete="new-password"
                    placeholder="Enter security password"
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-2xl py-4 px-6 text-sm text-center font-bold tracking-widest outline-none transition-all dark:text-white ${
                      isShaking
                        ? "border-rose-500 animate-shake ring-4 ring-rose-500/10"
                        : "border-slate-200 dark:border-slate-800 focus:border-rose-500"
                    }`}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleDeleteClient()}
                    autoFocus
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsDeleteConfirmOpen(false);
                      setDeletePassword("");
                    }}
                    className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteClient}
                    disabled={isDeleting}
                    className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Wipe Record"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableItem({
  label,
  value,
  isEdit,
  onChange,
  type = "text",
  isTextArea = false,
}: EditableItemProps) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
        {label}
      </p>
      {isEdit ? (
        isTextArea ? (
          <textarea
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            type={type}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors scheme-light dark:scheme-dark"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : (
        <p className="text-sm text-slate-900 dark:text-slate-200 font-semibold">
          {value || "Not Provided"}
        </p>
      )}
    </div>
  );
}
