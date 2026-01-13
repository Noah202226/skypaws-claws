"use client";

import { useMemo, useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Activity,
  PieChart as PieIcon,
  FileSpreadsheet,
  Users,
  ShoppingBag,
  ArrowUpRight,
  HandCoins,
  UserPlus,
  RefreshCcw,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/app/store/useTransactionStore";
import { usePetStore } from "@/app/store/usePetStore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useClientStore } from "@/app/store/useClientStore";

export default function ReportsSection() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { allPets, fetchAllPets } = usePetStore();
  const { clients, fetchClients } = useClientStore();

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString(
      "en-CA"
    );
  });

  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).toLocaleDateString("en-CA");
  });

  useEffect(() => {
    fetchTransactions();
    fetchAllPets();
    fetchClients();
  }, [fetchTransactions, fetchAllPets, fetchClients]);

  const clientMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach((client) => {
      // Maps the ID (e.g., 6964EC...) to the Name (e.g., John Doe)
      map[client.$id] = client.name;
    });
    return map;
  }, [clients]);

  const { metrics, monthlyData, serviceStats, topDebtors, customerKPIs } =
    useMemo(() => {
      // 1. GLOBAL TRANSACTION COUNT (Frequency Logic)
      // We count how many times each pet has EVER visited the clinic
      const globalTransactionCount: Record<string, number> = {};
      transactions.forEach((tx) => {
        globalTransactionCount[tx.petId] =
          (globalTransactionCount[tx.petId] || 0) + 1;
      });

      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      // 2. FILTER TRANSACTIONS FOR SELECTED RANGE
      const filtered = transactions.filter((tx) => {
        const txDate = new Date(tx.transactionDate).setHours(0, 0, 0, 0);
        return (!start || txDate >= start) && (!end || txDate <= end);
      });

      // 3. FINANCIAL CALCULATIONS
      const totalRevenue = filtered.reduce(
        (acc, curr) => acc + (Number(curr.totalAmount) || 0),
        0
      );
      const totalBalanceOwed = filtered.reduce(
        (acc, curr) => acc + (Number(curr.balanceRemaining) || 0),
        0
      );

      // 4. NEW vs REPEAT LOGIC (Based on count >= 2)
      const uniquePetsInRange = new Set(filtered.map((tx) => tx.petId));
      let newCustomers = 0;
      let repeatCustomers = 0;

      uniquePetsInRange.forEach((petId) => {
        const totalVisits = globalTransactionCount[petId] || 0;

        // If they have 2 or more transactions total, they are Repeat
        if (totalVisits >= 2) {
          repeatCustomers++;
        } else {
          newCustomers++;
        }
      });

      // 5. CHART DATA (Fixed: monthlyData/chartPoints)
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const salesByMonth = new Array(12).fill(0);
      filtered.forEach((tx) => {
        const d = new Date(tx.transactionDate);
        if (!isNaN(d.getTime())) {
          salesByMonth[d.getMonth()] += Number(tx.totalAmount) || 0;
        }
      });

      const maxAmt = Math.max(...salesByMonth, 1);
      const chartPoints = salesByMonth.map((amount, i) => ({
        label: months[i],
        amount,
        y: 180 - (amount / maxAmt) * 150, // Scales the line to fit the SVG height
      }));

      // 6. SERVICE STATS & DEBTORS (Same as before)
      const services = Object.entries(
        filtered.reduce((acc: any, tx) => {
          acc[tx.serviceName || "Other"] =
            (acc[tx.serviceName || "Other"] || 0) + Number(tx.totalAmount);
          return acc;
        }, {})
      )
        .map(([name, revenue]: any) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

      const clientAgg: Record<string, { name: string; debt: number }> = {};

      filtered.forEach((tx) => {
        // If tx.clientId exists, use it to get the name from our map
        // Otherwise, fallback to "Unknown Client"
        const clientId = tx.clientName;
        const clientName = clientId
          ? clientMap[clientId] || "Unknown Client"
          : "Unknown Client";

        if (!clientAgg[clientName]) {
          clientAgg[clientName] = { name: clientName, debt: 0 };
        }

        clientAgg[clientName].debt += Number(tx.balanceRemaining) || 0;
      });

      const sortedDebtors = Object.values(clientAgg)
        .filter((c) => c.debt > 0)
        .sort((a, b) => b.debt - a.debt)
        .slice(0, 3); // Top 3 highest owing clients

      return {
        metrics: {
          totalRevenue,
          totalBalanceOwed,
          count: filtered.length,
          avg: filtered.length > 0 ? totalRevenue / filtered.length : 0,
          collectionRate:
            totalRevenue > 0
              ? ((totalRevenue - totalBalanceOwed) / totalRevenue) * 100
              : 0,
        },
        customerKPIs: {
          newCustomers,
          repeatCustomers,
          totalUnique: uniquePetsInRange.size,
        },
        monthlyData: chartPoints,
        serviceStats: services,
        topDebtors: sortedDebtors,
      };
    }, [transactions, startDate, endDate, clientMap]);

  const handleExportExcel = async () => {
    /* Same logic as before */
  };

  return (
    <div className="flex flex-col h-full space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
            Clinic{" "}
            <span className="text-indigo-600 dark:text-indigo-500">
              Revenue
            </span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
            Executive Financial Intelligence
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-colors">
          <DateInput label="From" value={startDate} onChange={setStartDate} />
          <DateInput label="To" value={endDate} onChange={setEndDate} />
          <Button
            onClick={handleExportExcel}
            className="mt-5 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black uppercase rounded-xl h-10 px-6 shadow-lg shadow-emerald-500/20"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {/* Financial Stats Grid (Row 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gross Revenue"
          value={`₱${metrics.totalRevenue.toLocaleString()}`}
          color="emerald"
          icon={<DollarSign />}
        />
        <MetricCard
          title="Total Owed"
          value={`₱${metrics.totalBalanceOwed.toLocaleString()}`}
          color="amber"
          icon={<AlertCircle />}
        />
        <MetricCard
          title="Collect Rate"
          value={`${metrics.collectionRate.toFixed(1)}%`}
          color="pink"
          icon={<ArrowUpRight />}
          subtitle="Revenue Efficiency"
        />
        <MetricCard
          title="Avg Transaction"
          value={`₱${Math.round(metrics.avg).toLocaleString()}`}
          color="indigo"
          icon={<HandCoins />}
        />
      </div>

      {/* NEW: Operational KPI Grid (Row 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Transactions"
          value={metrics.count.toString()}
          color="slate"
          icon={<Hash />}
          subtitle="Volume in Period"
        />
        <MetricCard
          title="New Patients"
          value={customerKPIs.newCustomers.toString()}
          color="indigo"
          icon={<UserPlus />}
          subtitle="Acquisition Growth"
        />
        <MetricCard
          title="Repeat Patients"
          value={customerKPIs.repeatCustomers.toString()}
          color="emerald"
          icon={<RefreshCcw />}
          subtitle="Retention Loyalty"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REVENUE AREA CHART */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 overflow-hidden relative shadow-sm dark:shadow-none transition-colors">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-indigo-500" /> Revenue Flow
            </h3>
            <span className="text-[9px] font-black px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20 uppercase">
              Current Year Trend
            </span>
          </div>

          <div className="relative h-[220px] w-full pt-10">
            <svg
              className="w-full h-full"
              viewBox="0 0 1100 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 200 ${monthlyData
                  .map((d, i) => `L ${i * 100} ${d.y}`)
                  .join(" ")} L 1100 200 Z`}
                fill="url(#areaGrad)"
              />
              <path
                d={`M 0 ${monthlyData[0].y} ${monthlyData
                  .map((d, i) => `L ${i * 100} ${d.y}`)
                  .join(" ")}`}
                fill="none"
                stroke="#6366F1"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              {monthlyData.map((d, i) => (
                <div key={i} className="text-center group">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase group-hover:text-indigo-500 transition-colors">
                    {d.label}
                  </span>
                  {d.amount > 0 && (
                    <div className="text-[8px] font-bold text-slate-500 mt-1">
                      ₱{(d.amount / 1000).toFixed(1)}k
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="space-y-6">
          <div className="bg-red-500/5 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 rounded-[2.5rem] p-6 shadow-sm dark:shadow-2xl">
            <h3 className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 mb-6 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Highest Unpaid
            </h3>
            <div className="space-y-3">
              {topDebtors.map((client, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-indigo-600/30 transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
                      {client.name}{" "}
                      {/* This will now show "John Doe" instead of the ID */}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      Total Family Balance
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-bold text-rose-500 font-mono">
                      ₱{client.debt.toLocaleString()}
                    </span>
                    {client.debt > 5000 && (
                      <span className="text-[7px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded mt-1 font-black uppercase">
                        High Priority
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {topDebtors.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-[10px] text-slate-600 font-black uppercase">
                    No outstanding balances
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm transition-colors">
            <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <PieIcon className="w-3 h-3 text-emerald-500" /> Revenue by
              Service
            </h3>
            <div className="space-y-4">
              {serviceStats.slice(0, 5).map((s: any, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[9px] font-bold mb-1">
                    <span className="text-slate-500 dark:text-slate-400 uppercase">
                      {s.name}
                    </span>
                    <span className="text-slate-900 dark:text-white font-mono">
                      ₱{s.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 shadow-md"
                      style={{
                        width: `${
                          (s.revenue / (metrics.totalRevenue || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Growth Promo */}
      {/* Growth Promo - Styled per your Deep Dark Mode preference */}
      <div className="mt-12 p-8 bg-slate-900 border border-indigo-600/30 rounded-[3rem] relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Activity className="w-32 h-32 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
            Promos & <span className="text-indigo-500">Marketing</span>
          </h3>
          <p className="text-sm text-slate-400 max-w-md mt-2 font-medium">
            Your retention rate is{" "}
            {(
              (customerKPIs.repeatCustomers / (customerKPIs.totalUnique || 1)) *
              100
            ).toFixed(0)}
            %.
            {customerKPIs.newCustomers > customerKPIs.repeatCustomers
              ? " High acquisition detected. Consider a 'Second Visit' discount to boost retention."
              : " Strong loyalty! Launch a referral program to leverage your repeat base."}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function DateInput({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-[11px] font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
      />
    </div>
  );
}

function MetricCard({ title, value, icon, color, subtitle }: any) {
  const colorMap: any = {
    emerald:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10",
    indigo:
      "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/10",
    pink: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/5 border-pink-100 dark:border-pink-500/10",
    amber:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10",
  };

  return (
    <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] hover:shadow-lg dark:hover:bg-slate-900/50 transition-all group relative overflow-hidden shadow-sm">
      <div className="flex items-center gap-5">
        <div
          className={`p-3.5 rounded-2xl border ${colorMap[color]} transition-transform shadow-sm group-hover:scale-105`}
        >
          {icon && typeof icon !== "string"
            ? { ...icon, props: { ...icon.props, className: "w-6 h-6" } }
            : icon}
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">
            {title}
          </p>
          <h4 className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {value}
          </h4>
          {subtitle && (
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
