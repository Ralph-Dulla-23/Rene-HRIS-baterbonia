import React, { useState, useMemo } from "react";
import {
  X,
  Compass,
  DollarSign,
  Calendar,
  User,
  Users,
  Award,
  TrendingUp,
  Percent,
  Plus,
  Edit2,
  Trash2,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Tag,
  ArrowRight,
  Sparkles,
  HelpCircle,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SourcingSource, SourceCostEntry } from "./SourcingAnalytics";

interface SourceDetailsModalProps {
  source: SourcingSource | null;
  onClose: () => void;
  onUpdateSource: (updatedSource: SourcingSource) => void;
  onTriggerToast: (msg: string) => void;
}

export default function SourceDetailsModal({
  source,
  onClose,
  onUpdateSource,
  onTriggerToast
}: SourceDetailsModalProps) {
  if (!source) return null;

  // --- LOCAL EDIT / ADD EXPENSE STATE ---
  const [editingExpense, setEditingExpense] = useState<SourceCostEntry | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Form State for Adding / Editing Expense
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formRemarks, setFormRemarks] = useState("");
  const [formReference, setFormReference] = useState("");
  const [formDateFrom, setFormDateFrom] = useState("");
  const [formDateTo, setFormDateTo] = useState("");
  const [formStatus, setFormStatus] = useState<"Upcoming" | "Ongoing" | "Completed">("Completed");

  // Open Edit Expense Modal
  const handleStartEdit = (entry: SourceCostEntry) => {
    setEditingExpense(entry);
    setFormAmount(entry.amount);
    setFormRemarks(entry.remarks);
    setFormReference(entry.reference || "");
    setFormDateFrom(entry.dateFrom || entry.date || new Date().toISOString().split("T")[0]);
    setFormDateTo(entry.dateTo || entry.date || new Date().toISOString().split("T")[0]);
    setFormStatus(entry.status || "Completed");
  };

  // Open Add Expense Modal
  const handleStartAdd = () => {
    setIsAddingExpense(true);
    setFormAmount(500);
    setFormRemarks("");
    setFormReference(`REF-${Math.floor(1000 + Math.random() * 9000)}`);
    const today = new Date().toISOString().split("T")[0];
    setFormDateFrom(today);
    setFormDateTo(today);
    setFormStatus("Completed");
  };

  // Close Forms
  const handleCloseForm = () => {
    setEditingExpense(null);
    setIsAddingExpense(false);
  };

  // Save Add or Edit Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0) {
      onTriggerToast("Please enter a valid expense amount greater than 0.");
      return;
    }

    let updatedCostEntries = [...source.costEntries];

    if (editingExpense) {
      // Edit existing expense
      updatedCostEntries = updatedCostEntries.map((item) => {
        if (item.id === editingExpense.id) {
          return {
            ...item,
            amount: formAmount,
            remarks: formRemarks,
            reference: formReference,
            date: formDateFrom,
            dateFrom: formDateFrom,
            dateTo: formDateTo,
            status: formStatus
          };
        }
        return item;
      });
      onTriggerToast(`Expense "${editingExpense.id}" updated successfully.`);
    } else if (isAddingExpense) {
      // Add new expense
      const newEntry: SourceCostEntry = {
        id: `CST-${String(source.costEntries.length + 1).padStart(3, "0")}`,
        amount: formAmount,
        date: formDateFrom,
        dateFrom: formDateFrom,
        dateTo: formDateTo,
        remarks: formRemarks,
        reference: formReference,
        status: formStatus
      };
      updatedCostEntries.unshift(newEntry);
      onTriggerToast(`New expense of ₱${formAmount.toLocaleString()} added to ${source.name}.`);
    }

    const updatedSource: SourcingSource = {
      ...source,
      costEntries: updatedCostEntries,
      lastActivity: new Date().toISOString().split("T")[0]
    };

    onUpdateSource(updatedSource);
    handleCloseForm();
  };

  // Confirm Delete Expense
  const handleConfirmDelete = (id: string) => {
    const updatedCostEntries = source.costEntries.filter((item) => item.id !== id);
    const updatedSource: SourcingSource = {
      ...source,
      costEntries: updatedCostEntries,
      lastActivity: new Date().toISOString().split("T")[0]
    };
    onUpdateSource(updatedSource);
    setDeletingExpenseId(null);
    onTriggerToast(`Expense ${id} deleted.`);
  };

  // Live Calculations for Header and Cards
  const totalCost = useMemo(() => {
    return source.costEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [source.costEntries]);

  const conversionRate = useMemo(() => {
    if (!source.applicants || source.applicants === 0) return "0.0";
    return ((source.hired / source.applicants) * 100).toFixed(1);
  }, [source.applicants, source.hired]);

  const costPerHire = useMemo(() => {
    if (!source.hired || source.hired === 0) return null;
    return Math.round(totalCost / source.hired);
  }, [totalCost, source.hired]);

  // Stage conversion rates for funnel
  const funnelStages = [
    {
      label: "Candidate Volume",
      subLabel: "All public applicants",
      count: source.applicants,
      percent: 100,
      color: "bg-[#042C51]",
      textColor: "text-[#042C51]",
      badgeBg: "bg-slate-100 text-slate-700"
    },
    {
      label: "Screened",
      subLabel: "Initial HR & Resume Fit",
      count: source.screened,
      percent: source.applicants > 0 ? (source.screened / source.applicants) * 100 : 0,
      color: "bg-blue-600",
      textColor: "text-blue-700",
      badgeBg: "bg-blue-50 text-blue-700 border border-blue-200"
    },
    {
      label: "Interviewed",
      subLabel: "OPS & Technical Evaluations",
      count: source.interviewed,
      percent: source.applicants > 0 ? (source.interviewed / source.applicants) * 100 : 0,
      color: "bg-indigo-600",
      textColor: "text-indigo-700",
      badgeBg: "bg-indigo-50 text-indigo-700 border border-indigo-200"
    },
    {
      label: "Offered",
      subLabel: "Job Offer Released",
      count: source.offered,
      percent: source.applicants > 0 ? (source.offered / source.applicants) * 100 : 0,
      color: "bg-amber-500",
      textColor: "text-amber-800",
      badgeBg: "bg-amber-50 text-amber-800 border border-amber-200"
    },
    {
      label: "Hired (Active)",
      subLabel: "Onboarded Talent",
      count: source.hired,
      percent: source.applicants > 0 ? (source.hired / source.applicants) * 100 : 0,
      color: "bg-emerald-600",
      textColor: "text-emerald-700",
      badgeBg: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#042C51]/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl my-6 overflow-hidden text-slate-900 flex flex-col max-h-[92vh]"
      >
        {/* ==================== 1. HEADER BANNER (Matching Image 2) ==================== */}
        <div className="bg-[#042C51] text-white p-4 sm:p-5 shrink-0 relative overflow-hidden flex items-center justify-between border-b border-[#063866]">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FF5C28]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-[#FF5C28] flex items-center justify-center shrink-0 shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">{source.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 text-slate-200 border border-white/10">
                  {source.type}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-2">
                <span className="font-mono text-slate-300">ID: {source.id}</span>
                <span>•</span>
                <span>Channel Sourcing Performance & Cost Metrics</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 relative z-10"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ==================== BODY CONTENT ==================== */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* 5 HIGH-LEVEL METRIC TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Tile 1: Applicants */}
            <div className="bg-[#042C51] text-white rounded-2xl p-3.5 border border-[#0A3D6C] shadow-xs hover:border-[#FF5C28]/40 transition-all">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Applicants</span>
                <Users className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="text-xl font-black text-white font-mono">{source.applicants}</div>
              <span className="text-[10px] text-slate-300/80 font-medium">Total submissions</span>
            </div>

            {/* Tile 2: Hired */}
            <div className="bg-[#042C51] text-white rounded-2xl p-3.5 border border-[#0A3D6C] shadow-xs hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Hired</span>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono">{source.hired}</div>
              <span className="text-[10px] text-emerald-200/80 font-medium">Active hires</span>
            </div>

            {/* Tile 3: Conversion Rate */}
            <div className="bg-[#042C51] text-white rounded-2xl p-3.5 border border-[#0A3D6C] shadow-xs hover:border-indigo-400/40 transition-all">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Conversion</span>
                <Percent className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <div className="text-xl font-black text-indigo-300 font-mono">{conversionRate}%</div>
              <span className="text-[10px] text-slate-300/80 font-medium">Hired / Applicants</span>
            </div>

            {/* Tile 4: Total Source Cost */}
            <div className="bg-[#042C51] text-white rounded-2xl p-3.5 border border-[#0A3D6C] shadow-xs hover:border-amber-400/40 transition-all">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Total Cost</span>
                <DollarSign className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="text-xl font-black text-amber-300 font-mono">
                ₱{totalCost.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-300/80 font-medium">{source.costEntries.length} expense logs</span>
            </div>

            {/* Tile 5: Cost per Hire */}
            <div className="bg-[#042C51] text-white rounded-2xl p-3.5 border border-[#0A3D6C] shadow-xs hover:border-[#FF5C28]/60 transition-all col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5C28]">Cost / Hire</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#FF5C28]" />
              </div>
              <div className="text-xl font-black text-[#FF855F] font-mono">
                {costPerHire !== null ? `₱${costPerHire.toLocaleString()}` : "N/A"}
              </div>
              <span className="text-[10px] text-slate-300/80 font-medium">Total Cost ÷ Hired</span>
            </div>
          </div>
          {/* ==================== 2. CANDIDATE SOURCE FUNNEL ==================== */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#042C51]" />
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider">
                  Candidate Recruitment Funnel
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Stage progression from submission to onboarded hire
              </span>
            </div>

            <div className="space-y-3">
              {funnelStages.map((stage) => {
                const barWidth = Math.max(stage.percent, 3); // Minimum visible bar width
                return (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#042C51]">{stage.label}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({stage.subLabel})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-800">{stage.count} candidate{stage.count !== 1 ? "s" : ""}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${stage.badgeBg}`}>
                          {stage.percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${stage.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================== 3. EXPENSE ENTRIES LIST & MANAGEMENT ==================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#FF5C28]" />
                  Channel Expense Entries & Budget Logs
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Track ad boosts, subscription packages, and direct channel outlays
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartAdd}
                className="px-3.5 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Expense Entry
              </button>
            </div>

            {/* Expense Entries Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-black border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Expense Notes & Campaign</th>
                      <th className="p-3">Covered Date Range</th>
                      <th className="p-3 text-right">Amount (₱)</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {source.costEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <Tag className="w-6 h-6 text-slate-300" />
                            <p className="font-bold text-xs">No expense entries recorded for this channel.</p>
                            <p className="text-[11px] text-slate-400">Organic channel or zero direct expenditure logged.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      source.costEntries.map((entry) => {
                        const dateFromStr = entry.dateFrom || entry.date;
                        const dateToStr = entry.dateTo || entry.date;
                        const statusVal = entry.status || "Completed";

                        return (
                          <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-[#042C51]">
                              {entry.reference || entry.id}
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-800">{entry.remarks}</p>
                              <span className="text-[10px] text-slate-400 font-mono">Entry ID: {entry.id}</span>
                            </td>
                            <td className="p-3 text-slate-600 font-medium">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{dateFromStr}</span>
                                {dateToStr && dateToStr !== dateFromStr && (
                                  <>
                                    <span className="text-slate-400">to</span>
                                    <span>{dateToStr}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-black text-[#FF5C28]">
                              ₱{entry.amount.toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                  statusVal === "Completed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : statusVal === "Ongoing"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {statusVal === "Completed" && <CheckCircle2 className="w-2.5 h-2.5" />}
                                {statusVal === "Ongoing" && <Clock className="w-2.5 h-2.5" />}
                                {statusVal === "Upcoming" && <AlertCircle className="w-2.5 h-2.5" />}
                                {statusVal}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(entry)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#042C51] hover:bg-slate-100 transition-all cursor-pointer"
                                  title="Edit Expense"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingExpenseId(entry.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                  title="Remove Expense"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {/* ==================== 4. CHANNEL METADATA & SLA FORMULA ==================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metadata Card 1 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latest Applicant</span>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#042C51]" />
                <span className="text-xs font-black text-[#042C51] truncate">{source.latestApplicant || "None yet"}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Recent public form enrollment</span>
            </div>

            {/* Metadata Card 2 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Activity Timestamp</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF5C28]" />
                <span className="text-xs font-black text-[#042C51] font-mono">{source.lastActivity || "N/A"}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Audit & log timestamp</span>
            </div>

            {/* Metadata Card 3: Formula Explanation */}
            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                Cost per Hire Formula
              </span>
              <p className="text-[11px] text-amber-900 font-semibold leading-tight">
                CPH = Total Channel Expenses ÷ Total Hires
              </p>
              <p className="text-[10px] text-amber-800 leading-normal">
                Real-time calculation based on aggregated ad boosts and confirmed onboardings.
              </p>
            </div>
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-[#FF5C28]" />
            <span className="font-medium">Live ROI metrics recalculated automatically</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#042C51] hover:bg-[#FF5C28] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>

        {/* ==================== INLINE ADD / EDIT EXPENSE MODAL ==================== */}
        <AnimatePresence>
          {(isAddingExpense || editingExpense) && (
            <div className="fixed inset-0 z-60 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-900"
              >
                <div className="bg-[#042C51] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#063866]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 text-[#FF5C28] flex items-center justify-center font-bold">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {editingExpense ? `Edit Expense: ${editingExpense.id}` : `Add New Expense for ${source.name}`}
                      </h3>
                      <p className="text-[11px] text-slate-300 font-medium">Update financial outlay parameters</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveExpense} className="p-5 space-y-4">
                  {/* Expense Description / Campaign Notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Expense Description & Campaign Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formRemarks}
                      onChange={(e) => setFormRemarks(e.target.value)}
                      placeholder="e.g. Davao Customer Support Ads Campaign, JobStreet Featured Posting..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#042C51] outline-hidden transition-all resize-none"
                    />
                  </div>

                  {/* Amount and Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        Expense Amount (₱) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formAmount || ""}
                        onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as "Upcoming" | "Ongoing" | "Completed")}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                      >
                        <option value="Completed">Completed</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Upcoming">Upcoming</option>
                      </select>
                    </div>
                  </div>

                  {/* Covered Date Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Date From</label>
                      <input
                        type="date"
                        required
                        value={formDateFrom}
                        onChange={(e) => setFormDateFrom(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Date To</label>
                      <input
                        type="date"
                        required
                        value={formDateTo}
                        onChange={(e) => setFormDateTo(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  {/* Reference / Invoice Code */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Reference Code / Invoice #
                    </label>
                    <input
                      type="text"
                      value={formReference}
                      onChange={(e) => setFormReference(e.target.value)}
                      placeholder="e.g. FB-INV-9921"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#042C51] hover:bg-[#FF5C28] text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer"
                    >
                      Save Expense
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==================== CONFIRM DELETE EXPENSE PROMPT ==================== */}
        <AnimatePresence>
          {deletingExpenseId && (
            <div className="fixed inset-0 z-60 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#042C51]">Remove Expense Entry?</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Are you sure you want to delete expense entry <strong className="font-mono text-slate-800">{deletingExpenseId}</strong>? Total cost and cost-per-hire metrics will be recalculated instantly.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingExpenseId(null)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(deletingExpenseId)}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer"
                  >
                    Yes, Delete Entry
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
