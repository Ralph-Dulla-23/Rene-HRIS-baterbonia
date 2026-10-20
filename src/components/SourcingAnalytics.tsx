import React, { useState, useMemo } from "react";
import {
  Compass,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle,
  AlertCircle,
  MapPin,
  FileText,
  Check,
  Info,
  Edit2,
  Trash2,
  Database,
  Filter,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  BookOpen,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Percent,
  Layers,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

import SourceDetailsModal from "./SourceDetailsModal";

interface SourcingAnalyticsProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

export interface SourceCostEntry {
  id: string;
  amount: number;
  date: string;
  dateFrom?: string;
  dateTo?: string;
  remarks: string;
  reference: string;
  status?: "Upcoming" | "Ongoing" | "Completed";
}

export interface SourcingSource {
  id: string;
  name: string;
  type: "Employee Referral" | "Job Portals" | "Social Media" | "Agency" | "Direct Sourcing" | "University Relations";
  applicants: number;
  screened: number;
  interviewed: number;
  offered: number;
  hired: number;
  costEntries: SourceCostEntry[];
  latestApplicant: string;
  lastActivity: string;
}

const INITIAL_SOURCES: SourcingSource[] = [
  {
    id: "SRC-001",
    name: "Facebook Target Ads",
    type: "Social Media",
    applicants: 185,
    screened: 120,
    interviewed: 45,
    offered: 18,
    hired: 12,
    costEntries: [
      { id: "CST-001", amount: 450, date: "2026-07-01", dateFrom: "2026-07-01", dateTo: "2026-07-15", remarks: "Davao CSR Campaign Boost", reference: "FB-INV-9921", status: "Completed" },
      { id: "CST-002", amount: 300, date: "2026-07-15", dateFrom: "2026-07-15", dateTo: "2026-07-31", remarks: "Tagum Healthcare Ads", reference: "FB-INV-9954", status: "Ongoing" }
    ],
    latestApplicant: "Hannah Grace Alcantara",
    lastActivity: "2026-07-20"
  },
  {
    id: "SRC-002",
    name: "JobStreet Premium",
    type: "Job Portals",
    applicants: 310,
    screened: 190,
    interviewed: 85,
    offered: 35,
    hired: 28,
    costEntries: [
      { id: "CST-003", amount: 1200, date: "2026-07-05", dateFrom: "2026-07-05", dateTo: "2026-08-05", remarks: "Q3 Bulk Sourcing Package", reference: "JS-RECP-4402", status: "Ongoing" }
    ],
    latestApplicant: "Christian Paul Ramos",
    lastActivity: "2026-07-19"
  },
  {
    id: "SRC-003",
    name: "Internal Referral Program",
    type: "Employee Referral",
    applicants: 64,
    screened: 58,
    interviewed: 42,
    offered: 22,
    hired: 19,
    costEntries: [
      { id: "CST-004", amount: 950, date: "2026-07-10", dateFrom: "2026-07-10", dateTo: "2026-07-10", remarks: "Davao Tech Support Payouts", reference: "RF-DISB-102", status: "Completed" }
    ],
    latestApplicant: "Sarah Jane Montero",
    lastActivity: "2026-07-20"
  },
  {
    id: "SRC-004",
    name: "LinkedIn Recruiter Lite",
    type: "Direct Sourcing",
    applicants: 48,
    screened: 35,
    interviewed: 24,
    offered: 9,
    hired: 6,
    costEntries: [
      { id: "CST-005", amount: 380, date: "2026-07-01", dateFrom: "2026-07-01", dateTo: "2026-07-31", remarks: "Monthly Seat License", reference: "LI-SUBS-30", status: "Completed" }
    ],
    latestApplicant: "Miguel De Guzman",
    lastActivity: "2026-07-18"
  },
  {
    id: "SRC-005",
    name: "Indeed Organic Posts",
    type: "Job Portals",
    applicants: 155,
    screened: 95,
    interviewed: 32,
    offered: 8,
    hired: 4,
    costEntries: [],
    latestApplicant: "Kristine Joy Mendoza",
    lastActivity: "2026-07-19"
  },
  {
    id: "SRC-006",
    name: "Davao Doctors College Career Fair",
    type: "University Relations",
    applicants: 95,
    screened: 70,
    interviewed: 30,
    offered: 12,
    hired: 8,
    costEntries: [
      { id: "CST-006", amount: 500, date: "2026-06-25", dateFrom: "2026-06-25", dateTo: "2026-06-25", remarks: "Booth Sponsorship & Flyers", reference: "DDC-EVT-440", status: "Completed" }
    ],
    latestApplicant: "Elizah Marie Santos",
    lastActivity: "2026-07-14"
  },
  {
    id: "SRC-007",
    name: "Apex Placement Partners",
    type: "Agency",
    applicants: 25,
    screened: 24,
    interviewed: 20,
    offered: 15,
    hired: 11,
    costEntries: [
      { id: "CST-007", amount: 2200, date: "2026-07-08", dateFrom: "2026-07-08", dateTo: "2026-07-08", remarks: "Tier 2 Lead Agent Placement", reference: "APEX-INV-009", status: "Completed" }
    ],
    latestApplicant: "Reynold Cruz",
    lastActivity: "2026-07-16"
  }
];

export default function SourcingAnalytics({ userEmail, onSwitchModule }: SourcingAnalyticsProps) {
  // --- STATE ---
  const [sources, setSources] = useState<SourcingSource[]>(INITIAL_SOURCES);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourcingTypeFilter, setSourcingTypeFilter] = useState<string>("All");
  const [costFilter, setCostFilter] = useState<"All" | "With Cost" | "No Cost">("All");
  const [performanceFilter, setPerformanceFilter] = useState<"All" | "With Applicants" | "No Applicants" | "With Hires" | "No Hires">("All");
  
  const [isAddCostModalOpen, setIsAddCostModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourcingSource | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- ADD COST STATE ---
  const [costSourceId, setCostSourceId] = useState("");
  const [costAmount, setCostAmount] = useState<number>(0);
  const [costDate, setCostDate] = useState("2026-07-20");
  const [costRemarks, setCostRemarks] = useState("");
  const [costReference, setCostReference] = useState("");

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update Source from Modal (Live recalculations)
  const handleUpdateSource = (updatedSource: SourcingSource) => {
    setSources((prev) => prev.map((s) => (s.id === updatedSource.id ? updatedSource : s)));
    setSelectedSource(updatedSource);
  };

  // --- DYNAMIC COMPUTATIONS ---
  const metrics = useMemo(() => {
    let totalSources = sources.length;
    let activeSources = sources.filter(s => s.applicants > 0).length;
    let totalApplicants = sources.reduce((sum, s) => sum + s.applicants, 0);
    let totalHired = sources.reduce((sum, s) => sum + s.hired, 0);

    let totalCost = sources.reduce((sum, s) => {
      const sourceCost = s.costEntries.reduce((cSum, entry) => cSum + entry.amount, 0);
      return sum + sourceCost;
    }, 0);

    let costPerHire = totalHired > 0 ? totalCost / totalHired : 0;

    return {
      totalSources,
      activeSources,
      totalApplicants,
      totalHired,
      totalCost,
      costPerHire
    };
  }, [sources]);

  // Filtering Logic
  const filteredSources = useMemo(() => {
    return sources.filter((src) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        src.name.toLowerCase().includes(q) ||
        src.type.toLowerCase().includes(q) ||
        src.latestApplicant.toLowerCase().includes(q) ||
        src.id.toLowerCase().includes(q);

      const matchesType = sourcingTypeFilter === "All" || src.type === sourcingTypeFilter;

      const sourceTotalCost = src.costEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const matchesCost =
        costFilter === "All" ||
        (costFilter === "With Cost" && sourceTotalCost > 0) ||
        (costFilter === "No Cost" && sourceTotalCost === 0);

      const matchesPerformance =
        performanceFilter === "All" ||
        (performanceFilter === "With Applicants" && src.applicants > 0) ||
        (performanceFilter === "No Applicants" && src.applicants === 0) ||
        (performanceFilter === "With Hires" && src.hired > 0) ||
        (performanceFilter === "No Hires" && src.hired === 0);

      return matchesSearch && matchesType && matchesCost && matchesPerformance;
    });
  }, [sources, searchTerm, sourcingTypeFilter, costFilter, performanceFilter]);

  // Reset Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSourcingTypeFilter("All");
    setCostFilter("All");
    setPerformanceFilter("All");
    triggerToast("All sourcing analytics filters have been cleared.");
  };

  // --- RECHARTS DATA PREPARATION ---
  const chartsData = useMemo(() => {
    return sources.map((src) => {
      const sourceTotalCost = src.costEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const conversionRate = src.applicants > 0 ? (src.hired / src.applicants) * 100 : 0;
      
      return {
        id: src.id,
        name: src.name,
        applicants: src.applicants,
        hired: src.hired,
        cost: sourceTotalCost,
        conversion: parseFloat(conversionRate.toFixed(1))
      };
    }).sort((a, b) => b.applicants - a.applicants); // Sort by applicant volume descending
  }, [sources]);

  // Handle Adding Source Cost
  const handleAddCostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!costSourceId) {
      triggerToast("Please select a Sourcing Channel.");
      return;
    }
    if (costAmount <= 0) {
      triggerToast("Please input a valid cost amount.");
      return;
    }

    const nextCostId = `CST-0${Math.random().toString().slice(2, 6)}`;
    const newEntry: SourceCostEntry = {
      id: nextCostId,
      amount: parseFloat(costAmount.toString()),
      date: costDate,
      remarks: costRemarks || "Operational channel cost injection",
      reference: costReference || `REF-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const updated = sources.map((src) => {
      if (src.id === costSourceId) {
        return {
          ...src,
          costEntries: [...src.costEntries, newEntry]
        };
      }
      return src;
    });

    setSources(updated);
    
    // Also update selected source if active in modal
    if (selectedSource && selectedSource.id === costSourceId) {
      const live = updated.find(s => s.id === costSourceId);
      if (live) setSelectedSource(live);
    }

    const targetSrcName = sources.find(s => s.id === costSourceId)?.name || "";
    setIsAddCostModalOpen(false);
    triggerToast(`Added cost of ₱${costAmount.toLocaleString()} to ${targetSrcName}.`);

    // Reset Form
    setCostSourceId("");
    setCostAmount(0);
    setCostRemarks("");
    setCostReference("");
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative" id="sourcing-analytics-root">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 bg-[#042C51] border-l-4 border-[#FF5C28] text-white px-5 py-3 rounded-r-xl shadow-2xl z-50 flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle className="w-4.5 h-4.5 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. HEADER & ACTIONS ==================== */}
      <section className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
              Recruitment View
            </span>
          </div>
          <h1 className="text-xl font-black text-[#042C51] tracking-tight">Sourcing Analytics</h1>
          <p className="text-xs text-[#667085] leading-normal">
            Analyze applicant channels, screen conversion percentages, specific source cost metrics, and recruitment channel viability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerToast("Sourcing metrics refreshed and compiled successfully.");
            }}
            className="p-2 text-slate-600 hover:text-[#042C51] bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setCostSourceId(sources[0]?.id || "");
              setIsAddCostModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Source Cost Entry</span>
          </button>
        </div>
      </section>

      {/* ==================== 2. SOURCING PERFORMANCE SUMMARY (METRICS) ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Tracked Sources */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm h-[115px] hover:shadow-md transition-all flex flex-col justify-between group select-none">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Tracked Channels</span>
            <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center text-[#042C51]">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <h2 className="text-xl font-black text-[#042C51] tracking-tight">{metrics.totalSources}</h2>
            <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
              {metrics.activeSources} currently active
            </div>
          </div>
        </div>

        {/* Public Applicants */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm h-[115px] hover:shadow-md transition-all flex flex-col justify-between group select-none">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Public Applicants</span>
            <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <h2 className="text-xl font-black text-[#042C51] tracking-tight">{metrics.totalApplicants}</h2>
            <div className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-wide">
              +14% vs last month
            </div>
          </div>
        </div>

        {/* Hired From Sources */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm h-[115px] hover:shadow-md transition-all flex flex-col justify-between group select-none">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Hires</span>
            <div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <h2 className="text-xl font-black text-[#042C51] tracking-tight">{metrics.totalHired}</h2>
            <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
              Avg. conversion {(metrics.totalApplicants > 0 ? (metrics.totalHired / metrics.totalApplicants) * 100 : 0).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Total Source Cost */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm h-[115px] hover:shadow-md transition-all flex flex-col justify-between group select-none">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Sourcing Budget Cost</span>
            <div className="w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center text-[#FF5C28]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <h2 className="text-xl font-black text-[#042C51] tracking-tight">
              ₱{metrics.totalCost.toLocaleString()}
            </h2>
            <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">All registered cost entries</div>
          </div>
        </div>

        {/* Overall Cost / Hire */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm h-[115px] hover:shadow-md transition-all flex flex-col justify-between group col-span-2 lg:col-span-1 select-none">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Overall Cost per Hire</span>
            <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <h2 className="text-xl font-black text-[#FF5C28] tracking-tight">
              ₱{Math.round(metrics.costPerHire).toLocaleString()}
            </h2>
            <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Goal: ₱150</div>
          </div>
        </div>

      </div>

      {/* ==================== 3. SOURCING ANALYTICS CHARTS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart A: Applicant Volume per Source */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider">Applicant Volume</h3>
            <p className="text-[10px] text-slate-500">Total raw submissions registered in database</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="id" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#042C51", border: "none", borderRadius: "8px", color: "#fff" }}
                  labelFormatter={(value) => {
                    const source = sources.find(s => s.id === value);
                    return source ? source.name : value;
                  }}
                />
                <Bar dataKey="applicants" fill="#042C51" radius={[4, 4, 0, 0]}>
                  {chartsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#FF5C28" : "#042C51"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Conversion to Hire */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider">Conversion to Hire (%)</h3>
            <p className="text-[10px] text-slate-500">Percentage of registered applicants successfully hired</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="id" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis unit="%" tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#042C51", border: "none", borderRadius: "8px", color: "#fff" }}
                  labelFormatter={(value) => {
                    const source = sources.find(s => s.id === value);
                    return source ? source.name : value;
                  }}
                />
                <Bar dataKey="conversion" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {chartsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.conversion > 20 ? "#10b981" : "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart C: Source Cost */}
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider">Sourcing Channel Cost</h3>
            <p className="text-[10px] text-slate-500">Aggregated payments and ads expenses (₱)</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="id" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#042C51", border: "none", borderRadius: "8px", color: "#fff" }}
                  labelFormatter={(value) => {
                    const source = sources.find(s => s.id === value);
                    return source ? source.name : value;
                  }}
                />
                <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                  {chartsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cost > 1000 ? "#FF5C28" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ==================== 4. FILTERING & SEARCH ==================== */}
      <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider">Search & Filter Channels</h3>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-[10px] text-[#FF5C28] hover:underline font-bold"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Term */}
          <div className="md:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Channel, ID, Sourcing Type, Applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
            />
          </div>

          {/* Sourcing Option Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sourcingTypeFilter}
              onChange={(e) => setSourcingTypeFilter(e.target.value)}
              className="w-full bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:bg-white text-slate-800"
            >
              <option value="All">All Sourcing Types</option>
              <option value="Employee Referral">Employee Referral</option>
              <option value="Job Portals">Job Portals</option>
              <option value="Social Media">Social Media</option>
              <option value="Agency">Agency placements</option>
              <option value="Direct Sourcing">Direct Sourcing</option>
              <option value="University Relations">University Relations</option>
            </select>
          </div>

          {/* Cost Status Dropdown */}
          <div className="md:col-span-2.5">
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value as any)}
              className="w-full bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:bg-white text-slate-800"
            >
              <option value="All">All Cost Statuses</option>
              <option value="With Cost">With Cost Entries</option>
              <option value="No Cost">No Sourcing Cost (Organic)</option>
            </select>
          </div>

          {/* Performance Dropdown */}
          <div className="md:col-span-2.5">
            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value as any)}
              className="w-full bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:bg-white text-slate-800"
            >
              <option value="All">All Performance</option>
              <option value="With Applicants">Has Applicants</option>
              <option value="No Applicants">No Applicants</option>
              <option value="With Hires">Has Successful Hires</option>
              <option value="No Hires">No Hires Yet</option>
            </select>
          </div>

        </div>
      </div>

      {/* ==================== 5. SOURCING ANALYTICS LIST (DATA TABLE) ==================== */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-black text-[#042C51]">Sourcing Channel Performance Directory</h3>
            <p className="text-[10px] text-[#667085]">Live tracking conversion matrix derived from database applicant counts</p>
          </div>
          
          <span className="text-[10px] bg-[#E9F0FC] text-[#042C51] px-2.5 py-0.5 rounded font-black border border-blue-100">
            Showing {filteredSources.length} sourcing channels
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3">Source Channel</th>
                  <th className="p-3 text-center">Source Cost</th>
                  <th className="p-3 text-center">Cost Entries</th>
                  <th className="p-3 text-center">Applicants</th>
                  <th className="p-3 text-center">Screened</th>
                  <th className="p-3 text-center">Interviewed</th>
                  <th className="p-3 text-center">Offered</th>
                  <th className="p-3 text-center">Hired</th>
                  <th className="p-3 text-center">Conversion (%)</th>
                  <th className="p-3 text-center">Cost / Hire</th>
                  <th className="p-3">Latest Applicant</th>
                  <th className="p-3">Last Activity</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSources.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-12 text-center text-slate-400 font-bold">
                      No sourcing channels match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredSources.map((src) => {
                    const sourceTotalCost = src.costEntries.reduce((sum, entry) => sum + entry.amount, 0);
                    const conversionRate = src.applicants > 0 ? (src.hired / src.applicants) * 100 : 0;
                    const channelCostPerHire = src.hired > 0 ? sourceTotalCost / src.hired : 0;
                    const performanceBadge = src.hired > 0 ? "With Hires" : src.applicants > 0 ? "With Applicants" : "Inactive";

                    return (
                      <tr
                        key={src.id}
                        onClick={() => setSelectedSource(src)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                          selectedSource?.id === src.id ? "bg-[#FFF0EB]" : ""
                        }`}
                      >
                        {/* Source Name & Badge */}
                        <td className="p-3">
                          <span className="font-extrabold text-[#042C51] block text-xs">{src.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-slate-400 font-mono">{src.id}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-[9px] text-slate-500 font-bold">{src.type}</span>
                            <span className="text-slate-300">|</span>
                            <span
                              className={`px-1 rounded text-[8px] font-black uppercase ${
                                performanceBadge === "With Hires"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : performanceBadge === "With Applicants"
                                  ? "bg-blue-50 text-[#042C51] border border-blue-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {performanceBadge}
                            </span>
                          </div>
                        </td>

                        {/* Source Cost */}
                        <td className="p-3 text-center font-extrabold text-slate-800">
                          {sourceTotalCost > 0 ? `₱${sourceTotalCost.toLocaleString()}` : "₱0"}
                        </td>

                        {/* Cost Entries Count */}
                        <td className="p-3 text-center text-slate-500 font-bold">
                          {src.costEntries.length}
                        </td>

                        {/* Applicants */}
                        <td className="p-3 text-center font-bold text-[#042C51]">
                          {src.applicants}
                        </td>

                        {/* Screened */}
                        <td className="p-3 text-center text-slate-600 font-semibold">
                          {src.screened}
                        </td>

                        {/* Interviewed */}
                        <td className="p-3 text-center text-slate-600 font-semibold">
                          {src.interviewed}
                        </td>

                        {/* Offered */}
                        <td className="p-3 text-center text-slate-600 font-semibold">
                          {src.offered}
                        </td>

                        {/* Hired */}
                        <td className="p-3 text-center font-extrabold text-emerald-600">
                          {src.hired}
                        </td>

                        {/* Conversion Rate */}
                        <td className="p-3 text-center">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-extrabold font-mono text-[10px]">
                            {conversionRate.toFixed(1)}%
                          </span>
                        </td>

                        {/* Cost / Hire */}
                        <td className="p-3 text-center font-extrabold text-[#FF5C28]">
                          {channelCostPerHire > 0 ? `₱${Math.round(channelCostPerHire).toLocaleString()}` : "—"}
                        </td>

                        {/* Latest Applicant */}
                        <td className="p-3">
                          <span className="text-slate-800 font-bold block max-w-[130px] truncate" title={src.latestApplicant}>
                            {src.latestApplicant}
                          </span>
                        </td>

                        {/* Last Activity */}
                        <td className="p-3 text-slate-500 font-medium">
                          {src.lastActivity}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSource(src);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-[#FFE0D5] hover:text-[#FF5C28] text-[#042C51] rounded text-[10px] font-extrabold border border-slate-200 transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== 6. COST PER HIRE RULE NOTE ==================== */}
      <section className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-[#042C51]">Cost Per Hire Calculation SLA Protocol</h4>
          <p className="text-[10.5px] text-slate-600 leading-relaxed">
            <strong>Candidate Volume Notice:</strong> Raw candidate volume counts are fed directly from our live public application landing form APIs. Sourcing Channel Cost injections are aggregated over active recruiting budget cycles. Conversion metrics represent candidates moving successfully into "Hired" states, automatically establishing cost-per-hire parameters for each corporate channel.
          </p>
        </div>
      </section>

      {/* ==================== 7. MODALS & WORKFLOWS ==================== */}

      {/* ADD SOURCE COST MODAL */}
      <AnimatePresence>
        {isAddCostModalOpen && (
          <div className="fixed inset-0 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-900"
            >
              <div className="p-4 bg-[#042C51] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#FF5C28]" />
                  <div>
                    <h2 className="text-sm font-black">Register Sourcing Channel Cost</h2>
                    <p className="text-[10px] text-slate-300 font-medium">Inject operational expenses into channel metrics</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddCostModalOpen(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddCostSubmit} className="p-6 space-y-4">
                
                {/* Channel Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Sourcing Channel</label>
                  <select
                    value={costSourceId}
                    onChange={(e) => setCostSourceId(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
                  >
                    {sources.map((src) => (
                      <option key={src.id} value={src.id}>
                        [{src.id}] {src.name} ({src.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Expense Amount (₱)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={costAmount || ""}
                      onChange={(e) => setCostAmount(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800 font-mono font-bold"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={costDate}
                      onChange={(e) => setCostDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                {/* Reference Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Receipt Reference / Invoice #</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-99"
                    value={costReference}
                    onChange={(e) => setCostReference(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800 font-mono"
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Purpose / Budget Context</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Brief description of ads boost target, sponsorship matrix, license parameters..."
                    value={costRemarks}
                    onChange={(e) => setCostRemarks(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCostModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-black rounded-lg transition-all"
                  >
                    Submit Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOURCE DETAILS MODAL */}
      <AnimatePresence>
        {selectedSource && (
          <SourceDetailsModal
            source={selectedSource}
            onClose={() => setSelectedSource(null)}
            onUpdateSource={handleUpdateSource}
            onTriggerToast={triggerToast}
          />
        )}
      </AnimatePresence>

    </div>
  );

  // Helper inside component to set numbers in state safely
  function setFormAmountHelper(val: string) {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setCostAmount(num);
    } else {
      setCostAmount(0);
    }
  }
}
