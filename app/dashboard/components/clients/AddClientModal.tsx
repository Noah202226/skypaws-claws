"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, PawPrint, ChevronDown } from "lucide-react";
import { useClientStore } from "@/app/store/useClientStore";
import { toast } from "sonner";
import { useSettingsStore } from "@/app/store/useSettingsStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddClientModal({ isOpen, onClose }: Props) {
  const { addClient } = useClientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    items,
    fetchItems,
    isLoading: isLoadingSettings,
  } = useSettingsStore();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    age: "",
    occupation: "",
    birthdate: "",
    petName: "",
    petType: "Dog",
    petBreed: "",
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch only Categories now
      fetchItems("Categories");
    }
  }, [isOpen, fetchItems]);

  // Filter items that are Categories (items without a categoryId parent link)
  const categories = useMemo(() => items.filter((i) => !i.categoryId), [items]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedCategory = categories.find(
        (c) => c.$id === formData.petType
      )?.name;

      await addClient({
        ...formData,
        petType: selectedCategory || formData.petType,
      });

      toast.success("Registration Successful!", {
        description: `${formData.name} and ${
          formData.petName || "client"
        } added.`,
        duration: 4000,
      });

      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        age: "",
        occupation: "",
        birthdate: "",
        petName: "",
        petType: "Dog",
        petBreed: "",
      });
      onClose();
    } catch (error: any) {
      toast.error("Registration Failed", {
        description: error.message || "Something went wrong while saving.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">
            Register New{" "}
            <span className="text-indigo-600 dark:text-indigo-500">Client</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2">
              Owner Details
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Juan Dela Cruz"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="09..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Age
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="25"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                  placeholder="Engineer, Teacher, etc."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Birthdate
                </label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthdate: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition-all scheme-light dark:scheme-dark"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="juan@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Home Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Brgy. Lawis, Albuera"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400 min-h-16"
              />
            </div>
          </div>

          {/* Section 2: Initial Pet Information */}
          <div className="space-y-4 p-5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <PawPrint className="h-4 w-4 text-pink-600 dark:text-pink-500" />
              <p className="text-[10px] font-black text-pink-600 dark:text-pink-500 uppercase tracking-[0.2em]">
                Add Initial Pet (Optional)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Pet Name
                </label>
                <input
                  type="text"
                  value={formData.petName}
                  onChange={(e) =>
                    setFormData({ ...formData, petName: e.target.value })
                  }
                  placeholder="Bantay"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* DYNAMIC PET TYPE (CATEGORIES) */}
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Type
                </label>
                <select
                  required
                  value={formData.petType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      petType: e.target.value,
                      petBreed: "",
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="">Select Type</option>
                  {categories.map((cat) => (
                    <option key={cat.$id} value={cat.$id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-9 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {/* <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Breed
                </label>
                <input
                  type="text"
                  value={formData.petBreed}
                  onChange={(e) =>
                    setFormData({ ...formData, petBreed: e.target.value })
                  }
                  placeholder="Askal / Siamese"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-all placeholder:text-slate-400"
                />
              </div> */}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 font-black uppercase tracking-widest text-xs mt-4 shadow-lg dark:shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Complete Registration"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
