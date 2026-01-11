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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/app/store/useTransactionStore";
import { usePetStore } from "@/app/store/usePetStore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function ReportsSection() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { allPets, fetchAllPets } = usePetStore();

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
  }, [fetchTransactions, fetchAllPets]);

  const petMap = useMemo(() => {
    const map: Record<string, string> = {};
    allPets.forEach((pet) => {
      map[pet.$id] = pet.name;
    });
    return map;
  }, [allPets]);

  const {
    metrics,
    monthlyData,
    serviceStats,
    topCustomers,
    topDebtors,
    filteredTransactions,
  } = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate).setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      return (!start || txDate >= start) && (!end || txDate <= end);
    });

    const totalRevenue = filtered.reduce(
      (acc, curr) => acc + (Number(curr.totalAmount) || 0),
      0
    );
    const totalBalanceOwed = filtered.reduce(
      (acc, curr) => acc + (Number(curr.balanceRemaining) || 0),
      0
    );

    // --- CUSTOMER & DEBTOR LOGIC ---
    const customerAgg: Record<
      string,
      { name: string; total: number; count: number; debt: number }
    > = {};
    filtered.forEach((tx: any) => {
      const petName = petMap[tx.petId] || tx.clientName || "Unknown Pet";
      if (!customerAgg[petName]) {
        customerAgg[petName] = { name: petName, total: 0, count: 0, debt: 0 };
      }
      customerAgg[petName].total += Number(tx.totalAmount) || 0;
      customerAgg[petName].debt += Number(tx.balanceRemaining) || 0;
      customerAgg[petName].count += 1;
    });

    const sortedCustomers = Object.values(customerAgg)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    const sortedDebtors = Object.values(customerAgg)
      .filter((c) => c.debt > 0)
      .sort((a, b) => b.debt - a.debt)
      .slice(0, 3);

    // --- REVENUE FLOW ---
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
      if (!isNaN(d.getTime()))
        salesByMonth[d.getMonth()] += Number(tx.totalAmount) || 0;
    });

    const maxAmt = Math.max(...salesByMonth, 1);
    const chartPoints = salesByMonth.map((amount, i) => ({
      label: months[i],
      amount,
      y: 180 - (amount / maxAmt) * 150,
    }));

    // --- SERVICE ANALYTICS ---
    const services = Object.entries(
      filtered.reduce((acc: any, tx) => {
        acc[tx.serviceName || "Other"] =
          (acc[tx.serviceName || "Other"] || 0) + Number(tx.totalAmount);
        return acc;
      }, {})
    )
      .map(([name, revenue]: any) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

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
      monthlyData: chartPoints,
      serviceStats: services,
      topCustomers: sortedCustomers,
      topDebtors: sortedDebtors,
      filteredTransactions: filtered.sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      ),
    };
  }, [transactions, startDate, endDate, petMap]);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Executive Report");

    // HEADER BRANDING
    sheet.mergeCells("A1:F2");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "SKYPAWS & CLAWS EXECUTIVE REVENUE ANALYSIS";
    titleCell.font = {
      name: "Arial Black",
      size: 16,
      color: { argb: "FFFFFFFF" },
    };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // KPI SUMMARY SECTION
    sheet.addRow([]);
    sheet.addRow(["METRIC", "VALUE", "", "COLLECTION SUMMARY"]);
    sheet.addRow([
      "Report Period",
      `${startDate} to ${endDate}`,
      "",
      "Total Invoiced",
      metrics.totalRevenue,
    ]);
    sheet.addRow([
      "Total Transactions",
      metrics.count,
      "",
      "Total Collected",
      metrics.totalRevenue - metrics.totalBalanceOwed,
    ]);
    sheet.addRow([
      "Average Transaction",
      metrics.avg,
      "",
      "Pending (Owed)",
      metrics.totalBalanceOwed,
    ]);
    sheet.addRow([
      "",
      "",
      "",
      "Collection Rate",
      `${metrics.collectionRate.toFixed(1)}%`,
    ]);

    // Format KPI numbers
    [5, 6, 7].forEach((rowIdx) => {
      sheet.getCell(`E${rowIdx}`).numFmt = '"₱"#,##0.00';
      sheet.getCell(`B${rowIdx}`).numFmt = rowIdx === 6 ? "0" : '"₱"#,##0.00';
    });

    // DATA TABLE
    sheet.addRow([]);
    const head = sheet.addRow([
      "DATE",
      "PET NAME",
      "SERVICE",
      "STATUS",
      "TOTAL",
      "OWED",
    ]);
    head.eachCell((c) => {
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" },
      };
      c.font = { color: { argb: "FFFFFFFF" }, bold: true };
    });

    filteredTransactions.forEach((tx: any) => {
      const row = sheet.addRow([
        new Date(tx.transactionDate).toLocaleDateString(),
        petMap[tx.petId] || "Unknown",
        tx.serviceName,
        tx.status,
        tx.totalAmount,
        tx.balanceRemaining,
      ]);

      // Conditional Formatting: Red text for unpaid balances
      if (tx.balanceRemaining > 0) {
        row.getCell(6).font = { color: { argb: "FFFF0000" }, bold: true };
      }
      row.getCell(5).numFmt = '"₱"#,##0.00';
      row.getCell(6).numFmt = '"₱"#,##0.00';
    });

    sheet.columns = [
      { width: 30 },
      { width: 50 },
      { width: 50 },
      { width: 50 },
      { width: 30 },
      { width: 30 },
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Executive_Report_${startDate}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Clinic <span className="text-indigo-500">Revenue</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
            Executive Financial Intelligence
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-800/60 shadow-2xl">
          <DateInput label="From" value={startDate} onChange={setStartDate} />
          <DateInput label="To" value={endDate} onChange={setEndDate} />
          <Button
            onClick={handleExportExcel}
            className="mt-5 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black uppercase rounded-xl h-10 px-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REVENUE AREA CHART */}
        <div className="xl:col-span-2 bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] p-8 overflow-hidden relative">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-indigo-500" /> Revenue Flow
            </h3>
            <span className="text-[9px] font-black px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 uppercase">
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
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
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
            <div className="flex justify-between mt-4 border-t border-slate-800/50 pt-4">
              {monthlyData.map((d, i) => (
                <div key={i} className="text-center group">
                  <span className="text-[9px] font-black text-slate-600 uppercase group-hover:text-indigo-400 transition-colors">
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
          {/* TOP DEBTORS - CRITICAL FOR OWNER */}
          <div className="bg-red-500/5 border border-red-500/10 rounded-4xl p-6 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase text-red-400 mb-6 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Highest Unpaid (Action)
            </h3>
            <div className="space-y-3">
              {topDebtors.length > 0 ? (
                topDebtors.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-red-500/10"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase">
                        {c.name}
                      </span>
                      <span className="text-[8px] text-red-500/60 font-bold uppercase">
                        Pending Balance
                      </span>
                    </div>
                    <span className="text-[11px] font-black text-red-400 font-mono">
                      ₱{c.debt.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[9px] font-bold text-slate-600 uppercase text-center py-4 italic">
                  No pending balances found
                </p>
              )}
            </div>
          </div>

          {/* SERVICE IMPACT */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-4xl p-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
              <PieIcon className="w-3 h-3 text-emerald-500" /> Revenue by
              Service
            </h3>
            <div className="space-y-4">
              {serviceStats.slice(0, 5).map((s: any, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[9px] font-bold mb-1">
                    <span className="text-slate-400 uppercase">{s.name}</span>
                    <span className="text-white font-mono">
                      ₱{s.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                    <div
                      className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
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

      {/* BOTTOM SECTION: PROMOS & MARKETING */}
      <div className="mt-12 p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <ShoppingBag className="w-32 h-32 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
            Growth <span className="text-indigo-400">Marketing</span>
          </h3>
          <p className="text-sm text-slate-400 max-w-md mt-2">
            Based on your ATV of ₱{Math.round(metrics.avg).toLocaleString()},
            focus on upselling grooming packages to current medical patients to
            increase monthly revenue by 15%.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[8px] font-black text-slate-600 uppercase ml-2 tracking-[0.2em]">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[11px] font-bold text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer invert-[0.05] dark:invert-0"
      />
    </div>
  );
}

function MetricCard({ title, value, icon, color, subtitle }: any) {
  const colorMap: any = {
    emerald:
      "text-emerald-400 bg-emerald-500/5 border-emerald-500/10 shadow-emerald-500/5",
    indigo:
      "text-indigo-400 bg-indigo-500/5 border-indigo-500/10 shadow-indigo-500/5",
    pink: "text-pink-400 bg-pink-500/5 border-pink-500/10 shadow-pink-500/5",
    amber:
      "text-amber-400 bg-amber-500/5 border-amber-500/10 shadow-amber-500/5",
  };

  return (
    <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-[2.5rem] hover:bg-slate-900/50 transition-all group relative overflow-hidden">
      <div className="flex items-center gap-5">
        <div
          className={`p-3.5 rounded-2xl border ${colorMap[color]} group-hover:scale-110 transition-transform shadow-lg`}
        >
          {icon && typeof icon !== "string"
            ? { ...icon, props: { ...icon.props, className: "w-6 h-6" } }
            : icon}
        </div>
        <div>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
            {title}
          </p>
          <h4 className="text-2xl font-mono font-bold text-white tracking-tighter group-hover:text-indigo-400 transition-colors">
            {value}
          </h4>
          {subtitle && (
            <p className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
