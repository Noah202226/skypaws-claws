"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/auth-context";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { toast } from "sonner";
import {
  User,
  Stethoscope,
  Cat,
  Dna,
  ChevronRight,
  Plus,
  ArrowLeft,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import DangerZone from "../DangerZone";

// --- Sub-Component: Service Manager ---
function ServiceManager({ title, collectionId, showPrice, onBack }: any) {
  const { items, fetchItems, addItem, removeItem, isLoading } =
    useSettingsStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchItems(collectionId);
  }, [collectionId, fetchItems]);

  const handleSave = async () => {
    if (!name) return toast.error("Name is required");
    setIsSaving(true);
    try {
      const data = showPrice ? { name, price: Number(price) } : { name };
      await addItem(collectionId, data);
      setName("");
      setPrice("");
      await fetchItems(collectionId);
      toast.success("Record added");
    } catch (e: any) {
      toast.error("Failed to save", e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeItem(collectionId, id);
      await fetchItems(collectionId);
      toast.error("Record deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 transition-all"
      >
        <ArrowLeft size={14} /> Back to Configuration
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Plus className="text-indigo-600" size={20} />
          </div>
          <h3 className="text-lg font-black dark:text-white italic uppercase tracking-tight">
            Manage {title}
          </h3>
        </div>

        <div className="flex gap-3 mb-8">
          <input
            placeholder={`Enter ${title.toLowerCase()} name...`}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {showPrice && (
            <input
              placeholder="Price"
              type="number"
              className="w-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl h-12 px-6"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            Registered Entries
          </p>
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.$id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all group"
              >
                <div>
                  <p className="text-sm font-bold dark:text-white">
                    {item.name}
                  </p>
                  {showPrice && (
                    <p className="text-xs font-black text-indigo-500 mt-0.5">
                      ${item.price}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.$id)}
                  className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Settings Component ---
export default function SettingsSection() {
  const { user } = useAuth();
  const [view, setView] = useState<
    "menu" | "services" | "categories" | "breeds"
  >("menu");

  const cardClasses =
    "p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl transition-all duration-300 shadow-sm dark:shadow-none";
  const labelClasses =
    "text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2";

  if (view === "services")
    return (
      <ServiceManager
        title="Services"
        collectionId="Services"
        showPrice
        onBack={() => setView("menu")}
      />
    );
  if (view === "categories")
    return (
      <ServiceManager
        title="Categories"
        collectionId="Categories"
        onBack={() => setView("menu")}
      />
    );
  if (view === "breeds")
    return (
      <ServiceManager
        title="Breeds"
        collectionId="Breeds"
        onBack={() => setView("menu")}
      />
    );

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-2xl space-y-8 mb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
          Clinic{" "}
          <span className="text-indigo-600 dark:text-indigo-500">
            Configuration
          </span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Manage your clinical data and patient registries.
        </p>
      </div>

      <div className="grid gap-6">
        <div className={cardClasses}>
          <label className={labelClasses}>
            <User size={12} className="text-indigo-600" /> Administrator
          </label>
          <div className="flex items-center gap-4 mt-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0).toUpperCase() || "V"}
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                {user?.name || "Clinic Manager"}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <label className={labelClasses}>
            <Stethoscope size={12} className="text-indigo-600" /> Medical
            Catalog
          </label>
          <div className="grid gap-3 mt-4">
            <ConfigButton
              onClick={() => setView("services")}
              icon={Stethoscope}
              title="Clinical Services"
              subtitle="Pricing and treatments"
            />
            <ConfigButton
              onClick={() => setView("categories")}
              icon={Cat}
              title="Pet Categories"
              subtitle="Species classifications"
            />
            {/* <ConfigButton
              onClick={() => setView("breeds")}
              icon={Dna}
              title="Breed Registry"
              subtitle="Standardized breed lists"
            /> */}

            {/* <DangerZone /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigButton({ icon: Icon, title, subtitle, onClick }: any) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white h-16 justify-between px-6 font-bold rounded-2xl transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-500/10 transition-colors">
          <Icon
            size={20}
            className="text-slate-400 group-hover:text-indigo-500"
          />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-sm">{title}</span>
          <span className="text-[10px] font-medium text-slate-500 lowercase opacity-70">
            {subtitle}
          </span>
        </div>
      </div>
      <ChevronRight
        size={14}
        className="opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-1"
      />
    </Button>
  );
}
