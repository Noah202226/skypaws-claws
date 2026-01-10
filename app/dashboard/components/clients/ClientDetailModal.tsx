"use client";

import { useState, useEffect } from "react";
import { ClientData } from "@/app/types/index";
import { useClientStore } from "@/app/store/useClientStore";
import { toast } from "sonner"; // Import toast
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
  const { updateClient, deleteClient } = useClientStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    if (client) {
      setEditFormData({
        name: client.name || "",
        phone: client.phone || "",
        age: client.age || "",
        occupation: client.occupation || "",
        birthdate: client.birthdate || "",
        address: client.address || "",
      });
    }
  }, [client, isEditMode]);

  if (!isOpen || !client) return null;

  const parsedPets =
    client.pets
      ?.map((p: string) => {
        try {
          return JSON.parse(p);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean) || [];

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateClient(client.$id, editFormData);
      setIsEditMode(false);
      toast.success("Profile updated successfully"); // SUCCESS NOTIFICATION
    } catch (err) {
      toast.error("Failed to update profile"); // ERROR NOTIFICATION
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddPet = async () => {
    if (!newPet.name) return toast.warning("Please enter a pet name");
    setIsUpdating(true);
    try {
      const petString = JSON.stringify(newPet);
      const updatedPetsArray = [...(client.pets || []), petString];
      await updateClient(client.$id, { pets: updatedPetsArray });
      setNewPet({ name: "", type: "Dog", breed: "" });
      setIsAddingPet(false);
      toast.success(`${newPet.name} added to records`); // SUCCESS NOTIFICATION
    } catch (err) {
      toast.error("Failed to add pet");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteClient(client.$id);
      toast.error("Client record deleted permanently"); // DELETE NOTIFICATION
      onClose();
    } catch (err) {
      toast.error("Failed to delete client");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              {isEditMode ? (
                <input
                  className="bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-white font-black italic outline-none"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              ) : (
                <h3 className="text-xl font-black text-white italic">
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
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-slate-400 hover:text-indigo-400"
              }`}
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="bg-slate-950/30 p-5 rounded-2xl border border-slate-800 space-y-4">
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
                className="w-full bg-indigo-600 mt-2"
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

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-pink-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Pets History
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingPet(!isAddingPet)}
                className="h-7 text-[10px] uppercase font-black text-indigo-400"
              >
                {isAddingPet ? "Cancel" : "Add Pet"}
              </Button>
            </div>

            {isAddingPet && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-600/5 border border-indigo-600/20 rounded-xl">
                <input
                  placeholder="Pet Name"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  value={newPet.name}
                  onChange={(e) =>
                    setNewPet({ ...newPet, name: e.target.value })
                  }
                />
                <select
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white"
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
                  className="bg-indigo-600"
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
              {parsedPets.map((pet: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center p-3 bg-slate-950 border border-slate-800 rounded-xl"
                >
                  <PawPrint className="h-4 w-4 text-pink-500 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      {pet.name}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {pet.type} • {pet.breed || "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center">
          {showDeleteConfirm && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase">
              <AlertTriangle className="h-4 w-4" /> Permanent Action
            </div>
          )}
          <div className="flex gap-3 ml-auto">
            {showDeleteConfirm && (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-slate-400 text-xs"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleDeleteClient}
              disabled={isDeleting}
              className={`h-10 px-4 text-[10px] font-black uppercase tracking-widest ${
                showDeleteConfirm
                  ? "bg-red-600"
                  : "bg-slate-800 text-slate-500 hover:text-red-500 border border-transparent hover:border-red-600/30"
              }`}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {showDeleteConfirm ? "Confirm Delete" : "Delete Client"}
            </Button>
          </div>
        </div>
      </div>
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
            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-indigo-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            type={type}
            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white outline-none focus:border-indigo-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : (
        <p className="text-sm text-slate-200 font-semibold">{value || "N/A"}</p>
      )}
    </div>
  );
}
