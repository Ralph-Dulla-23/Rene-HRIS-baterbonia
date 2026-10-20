import React, { useState, useMemo } from "react";
import { 
  Info, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  RefreshCw, 
  Layers, 
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Maximize2,
  FileText,
  Printer,
  Download
} from "lucide-react";
import WorkforceHiringTrendDetailsModal from "./WorkforceHiringTrendDetailsModal";
import { generateWorkforceHiringPdf } from "../utils/workforcePdfGenerator";
import { printPageToPdf } from "../utils/pdfExport";
import * as XLSX from "xlsx";
import { 
  SummaryMetrics, 
  PipelineStage, 
  PipelineDropOff, 
  TrendPoint, 
  DetailRecord, 
  RiskLevel 
} from "../types";

interface OverviewProps {
  metrics: SummaryMetrics;
  pipelineStages: PipelineStage[];
  dropOffs: PipelineDropOff[];
  weeklyTrends: TrendPoint[];
  monthlyTrends: TrendPoint[];
  detailRecords: DetailRecord[];
  activeCluster: string;
  activeAccount: string;
  dateRange?: string;
  onRecordClick?: (account: string) => void;
  onRefresh?: () => void;
}

const PERIOD_LIST = [
  "Week 33",
  "Week 34",
  "Week 35",
  "Week 36",
  "Week 37",
  "Week 38 (Current)",
  "All 6 Weeks"
];

export default function OverviewSection({
  metrics,
  pipelineStages,
  dropOffs,
  weeklyTrends,
  monthlyTrends,
  detailRecords,
  activeCluster,
  activeAccount,
  dateRange = "2026 - Week 38 | Sep 15 - Sep 21, 2026",
  onRecordClick,
  onRefresh
}: OverviewProps) {
  // Local state
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Week 38 (Current)");
  const [trendMode, setTrendMode] = useState<"weekly" | "monthly">("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClusterFilter, setSelectedClusterFilter] = useState("All");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof DetailRecord>("requiredHC");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Modal state for Trend Details
  const [isTrendDetailsModalOpen, setIsTrendDetailsModalOpen] = useState(false);

  // Active tooltip state for trend chart
  const [activeTrendIdx, setActiveTrendIdx] = useState<number | null>(null);

  // Tooltip helper state
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Export notification
  const [showExportToast, setShowExportToast] = useState(false);

  // Drag-to-scroll state for the 20+ column master grid
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const activeTrends = trendMode === "weekly" ? weeklyTrends : monthlyTrends;

  // Compute aggregated transitions reactively for the second dashboard column
  const aggregatedTransitions = useMemo(() => {
    const records = detailRecords.filter(rec => {
      if (activeCluster !== "All Clusters" && rec.cluster !== activeCluster) return false;
      if (activeAccount !== "All Accounts" && rec.account !== activeAccount) return false;
      return true;
    });

    const acceptedJO = records.reduce((sum, r) => sum + r.acceptedJO, 0);
    const nho = records.reduce((sum, r) => sum + r.nho, 0);
    const fst = records.reduce((sum, r) => sum + r.fst, 0);
    const pst = records.reduce((sum, r) => sum + r.pst, 0);
    const goLive = records.reduce((sum, r) => sum + r.goLive, 0);

    const joToNho = Math.max(0, acceptedJO - nho);
    const nhoToFst = Math.max(0, nho - fst);
    const fstToPst = Math.max(0, fst - pst);
    const pstToGoLive = Math.max(0, pst - goLive);
    
    // Total drop-offs aggregated from records
    const totalDrop = records.reduce((sum, r) => sum + r.dropOffCount, 0);
    const nhoToPst = Math.max(0, totalDrop - (joToNho + nhoToFst + fstToPst + pstToGoLive));

    return [
      { label: "Accepted JO ➔ NHO", count: joToNho, pct: acceptedJO > 0 ? (joToNho / acceptedJO) * 100 : 0 },
      { label: "NHO ➔ FST", count: nhoToFst, pct: nho > 0 ? (nhoToFst / nho) * 100 : 0 },
      { label: "FST ➔ PST", count: fstToPst, pct: fst > 0 ? (fstToPst / fst) * 100 : 0 },
      { label: "NHO ➔ PST (Side)", count: nhoToPst, pct: nho > 0 ? (nhoToPst / nho) * 100 : 0 },
      { label: "PST ➔ Go Live", count: pstToGoLive, pct: pst > 0 ? (pstToGoLive / pst) * 100 : 0 }
    ];
  }, [detailRecords, activeCluster, activeAccount]);

  // Filter & Search details
  const filteredRecords = useMemo(() => {
    return detailRecords.filter(rec => {
      // General Header filters
      if (activeCluster !== "All Clusters" && rec.cluster !== activeCluster) return false;
      if (activeAccount !== "All Accounts" && rec.account !== activeAccount) return false;

      // Section-level Table filters
      if (selectedClusterFilter !== "All" && rec.cluster !== selectedClusterFilter) return false;
      if (selectedRiskFilter !== "All" && rec.riskLevel !== selectedRiskFilter) return false;

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          rec.account.toLowerCase().includes(query) ||
          rec.cluster.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [detailRecords, activeCluster, activeAccount, selectedClusterFilter, selectedRiskFilter, searchQuery]);

  // Aggregated Summary Row calculations (Totals & Weighted Averages for the Table Footer)
  const summaryTotals = useMemo(() => {
    const count = filteredRecords.length;
    if (count === 0) {
      return {
        requiredHC: 0,
        actualHC: 0,
        bufferPercentage: 0,
        absenteeismCount: 0,
        absenteeismPercentage: 0,
        attritionCount: 0,
        attritionPercentage: 0,
        netActualHC: 0,
        hiringNeeded: 0,
        acceptedJO: 0,
        nho: 0,
        fst: 0,
        pst: 0,
        goLive: 0,
        joToNhoLoss: 0,
        joToNhoRet: 0,
        nhoToFstLoss: 0,
        nhoToFstRet: 0,
        fstToPstLoss: 0,
        fstToPstRet: 0,
        pstToGoLiveLoss: 0,
        pstToGoLiveRet: 0,
        hiredCount: 0,
        hiringRate: 0,
      };
    }

    const req = filteredRecords.reduce((s, r) => s + r.requiredHC, 0);
    const act = filteredRecords.reduce((s, r) => s + r.actualHC, 0);
    const absCount = filteredRecords.reduce((s, r) => s + r.absenteeismCount, 0);
    const attCount = filteredRecords.reduce((s, r) => s + r.attritionCount, 0);
    const netAct = filteredRecords.reduce((s, r) => s + r.netActualHC, 0);
    const hireNeed = filteredRecords.reduce((s, r) => s + r.hiringNeeded, 0);

    const accJO = filteredRecords.reduce((s, r) => s + r.acceptedJO, 0);
    const nho = filteredRecords.reduce((s, r) => s + r.nho, 0);
    const fst = filteredRecords.reduce((s, r) => s + r.fst, 0);
    const pst = filteredRecords.reduce((s, r) => s + r.pst, 0);
    const goLive = filteredRecords.reduce((s, r) => s + r.goLive, 0);
    const hired = filteredRecords.reduce((s, r) => s + r.hiredCount, 0);

    const bufPct = req > 0 ? Number((((netAct - req) / req) * 100).toFixed(2)) : 0;
    const absPct = act > 0 ? Number(((absCount / act) * 100).toFixed(2)) : 0;
    const attPct = act > 0 ? Number(((attCount / act) * 100).toFixed(2)) : 0;

    const joToNhoLoss = Math.max(0, accJO - nho);
    const joToNhoRet = accJO > 0 ? Number(((nho / accJO) * 100).toFixed(1)) : 0;

    const nhoToFstLoss = Math.max(0, nho - fst);
    const nhoToFstRet = nho > 0 ? Number(((fst / nho) * 100).toFixed(1)) : 0;

    const fstToPstLoss = Math.max(0, fst - pst);
    const fstToPstRet = fst > 0 ? Number(((pst / fst) * 100).toFixed(1)) : 0;

    const pstToGoLiveLoss = Math.max(0, pst - goLive);
    const pstToGoLiveRet = pst > 0 ? Number(((goLive / pst) * 100).toFixed(1)) : 0;

    const hiringRate = accJO > 0 ? Number(((hired / accJO) * 100).toFixed(1)) : 0;

    return {
      requiredHC: req,
      actualHC: act,
      bufferPercentage: bufPct,
      absenteeismCount: absCount,
      absenteeismPercentage: absPct,
      attritionCount: attCount,
      attritionPercentage: attPct,
      netActualHC: netAct,
      hiringNeeded: hireNeed,
      acceptedJO: accJO,
      nho,
      fst,
      pst,
      goLive,
      joToNhoLoss,
      joToNhoRet,
      nhoToFstLoss,
      nhoToFstRet,
      fstToPstLoss,
      fstToPstRet,
      pstToGoLiveLoss,
      pstToGoLiveRet,
      hiredCount: hired,
      hiringRate,
    };
  }, [filteredRecords]);

  // Sort records
  const sortedRecords = useMemo(() => {
    const sorted = [...filteredRecords];
    sorted.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return sortDirection === "asc" 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
    return sorted;
  }, [filteredRecords, sortField, sortDirection]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRecords.slice(start, start + rowsPerPage);
  }, [sortedRecords, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedRecords.length / rowsPerPage) || 1;

  const handleSort = (field: keyof DetailRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExportExcel = () => {
    try {
      const exportData = filteredRecords.map((r, i) => ({
        "#": i + 1,
        "Cluster Group": r.cluster,
        "Account Name": r.account,
        "Planned HC": r.requiredHC,
        "Actual HC": r.actualHC,
        "Buffer %": `${r.bufferPercentage}%`,
        "Net Actual": r.netActualHC,
        "Hiring Needed": r.hiringNeeded,
        "Absenteeism": r.absenteeismCount,
        "Abs %": `${r.absenteeismPercentage}%`,
        "Attrition": r.attritionCount,
        "Att %": `${r.attritionPercentage}%`,
        "Accepted JO": r.acceptedJO,
        "NHO Count": r.nho,
        "FST Count": r.fst,
        "PST Count": r.pst,
        "Go Live": r.goLive,
        "Hired Count": r.hiredCount,
        "Hiring Rate %": `${r.hiringRate}%`,
        "Hiring Risk": r.riskLevel
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Workforce_Ledger");
      XLSX.writeFile(wb, `SiBS_Workforce_Ledger_${new Date().toISOString().split("T")[0]}.xlsx`);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 3000);
    } catch (err) {
      console.error("Excel export error:", err);
    }
  };

  const handleExportPdf = () => {
    generateWorkforceHiringPdf({
      metrics,
      detailRecords: filteredRecords,
      activeCluster: selectedClusterFilter === "All" ? activeCluster : selectedClusterFilter,
      activeAccount,
      dateRange
    });
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  // SVG Chart Dimensions & Computations
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;

  const chartPoints = useMemo(() => {
    if (activeTrends.length === 0) return [];
    
    // Find min and max for scaling
    const maxVal = 12; // percentage limit
    const minVal = -8; // buffer goes negative

    return activeTrends.map((pt, idx) => {
      const x = paddingX + (idx / (activeTrends.length - 1)) * (chartWidth - paddingX * 2);
      
      // Scaling formula: y = height - paddingY - ((val - min) / (max - min)) * (height - paddingY * 2)
      const absY = chartHeight - paddingY - ((pt.absenteeism - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
      const attY = chartHeight - paddingY - ((pt.attrition - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
      const bufY = chartHeight - paddingY - ((pt.buffer - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
      const zeroY = chartHeight - paddingY - ((0 - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);

      return {
        ...pt,
        x,
        absY,
        attY,
        bufY,
        zeroY
      };
    });
  }, [activeTrends]);

  // Compute trend averages dynamically for the third column
  const trendAverages = useMemo(() => {
    if (chartPoints.length === 0) return { absAvg: 0, attAvg: 0, bufAvg: 0 };
    const absSum = chartPoints.reduce((sum, p) => sum + p.absenteeism, 0);
    const attSum = chartPoints.reduce((sum, p) => sum + p.attrition, 0);
    const bufSum = chartPoints.reduce((sum, p) => sum + p.buffer, 0);
    const n = chartPoints.length;
    return {
      absAvg: parseFloat((absSum / n).toFixed(2)),
      attAvg: parseFloat((attSum / n).toFixed(2)),
      bufAvg: parseFloat((bufSum / n).toFixed(2))
    };
  }, [chartPoints]);

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {showExportToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#042C51] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#E6ECF2] animate-bounce">
          <FileSpreadsheet className="w-5 h-5 text-[#FF5C28]" />
          <div>
            <p className="text-xs font-bold">Export Complete</p>
            <p className="text-[10px] text-slate-300">workforce_hiring_overview_export.csv downloaded successfully.</p>
          </div>
        </div>
      )}

      {/* ==================== SUMMARY METRICS (9 CARDS) ==================== */}
      <section className="space-y-2 select-none">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-9 gap-3.5 min-w-0">
          {/* Card 1: Required Headcount */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Required HC</span>
              <div className="w-7 h-7 rounded-full bg-[#E9F0FC] flex items-center justify-center text-[#042C51]">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{metrics.requiredHeadcount.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Approved baseline</div>
            </div>
          </div>

          {/* Card 2: Actual Headcount */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Actual HC</span>
              <div className="w-7 h-7 rounded-full bg-[#E9F0FC] flex items-center justify-center text-[#042C51]">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{metrics.actualHeadcount.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Roster count</div>
            </div>
          </div>

          {/* Card 3: Buffer Percentage */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Buffer %</span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${metrics.bufferPercentage < 0 ? "bg-rose-50 text-[#E74C3C]" : "bg-emerald-50 text-emerald-600"}`}>
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <div className={`text-xl font-extrabold tracking-tight ${metrics.bufferPercentage < 0 ? "text-[#E74C3C]" : "text-emerald-600"}`}>
                {metrics.bufferPercentage}%
              </div>
              <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">vs Required HC</div>
            </div>
          </div>

          {/* Card 4: Absenteeism */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Absenteeism</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold text-[#042C51] bg-[#E9F0FC] px-1 py-0.2 rounded">
                  {metrics.absenteeismCount}
                </span>
                <div className="w-7 h-7 rounded-full bg-[#E9F0FC] flex items-center justify-center text-[#042C51]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xl font-extrabold text-[#042C51] tracking-tight">
                {metrics.absenteeismPercentage}%
              </div>
              <div className="text-[9px] text-[#667085] font-bold mt-1 uppercase tracking-wide">Absenteeism %</div>
            </div>
          </div>

          {/* Card 5: Attrition */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Attrition</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold text-[#E74C3C] bg-rose-50 px-1 py-0.2 rounded">
                  {metrics.attritionCount}
                </span>
                <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-[#E74C3C]">
                  <X className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xl font-extrabold text-[#E74C3C] tracking-tight">
                {metrics.attritionPercentage}%
              </div>
              <div className="text-[9px] text-[#E74C3C] font-bold mt-1 uppercase tracking-wide">Attrition %</div>
            </div>
          </div>

          {/* Card 6: Net Actual HC */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Net Actual HC</span>
              <div className="w-7 h-7 rounded-full bg-[#E9F0FC] flex items-center justify-center text-[#042C51]">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{metrics.netActualHC.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide font-mono">Floor availability</div>
            </div>
          </div>

          {/* Card 7: Hiring Needed */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hiring Needed</span>
              <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xl font-extrabold text-indigo-600 tracking-tight">{metrics.hiringNeeded.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Total coverage gap</div>
            </div>
          </div>

          {/* Card 8: Hiring Rate */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hiring Rate</span>
              <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xl font-extrabold text-teal-600 tracking-tight">{metrics.hiringRate}%</div>
              <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide font-mono">Leads to JO yield</div>
            </div>
          </div>

          {/* Card 9: Hired Count */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hired Count</span>
              <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xl font-extrabold text-emerald-600 tracking-tight">{metrics.hiredCount}</div>
              <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Deployed hires</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SEQUENTIAL FLOW FUNNEL CARD ==================== */}
      <section className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-sm select-none">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          
          {/* Main 5 Stages Flow */}
          <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-between gap-2 bg-[#F1F5F9]/50 p-3 rounded-lg border border-slate-100">
            {pipelineStages.map((stage, idx) => {
              // Map nice icons and colors
              let iconColor = "text-blue-500 bg-blue-50";
              let icon = <Users className="w-3.5 h-3.5" />;
              
              if (idx === 0) { // Accepted JO
                iconColor = "text-[#042C51] bg-[#E9F0FC]";
                icon = <Info className="w-3.5 h-3.5" />;
              } else if (idx === 1) { // NHO
                iconColor = "text-purple-600 bg-purple-50";
                icon = <FileSpreadsheet className="w-3.5 h-3.5" />;
              } else if (idx === 2) { // FST
                iconColor = "text-teal-600 bg-teal-50";
                icon = <Users className="w-3.5 h-3.5" />;
              } else if (idx === 3) { // PST
                iconColor = "text-amber-600 bg-amber-50";
                icon = <SlidersHorizontal className="w-3.5 h-3.5" />;
              } else if (idx === 4) { // Go Live
                iconColor = "text-emerald-600 bg-emerald-50";
                icon = <CheckCircle className="w-3.5 h-3.5" />;
              }

              return (
                <React.Fragment key={idx}>
                  {/* Stage block */}
                  <div className="flex items-center gap-3 py-1.5 px-3.5 rounded-lg bg-white shadow-sm border border-[#E6ECF2] flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
                      {icon}
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {stage.name.split(" — ")[0]}
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#042C51]">{stage.count}</span>
                        <span className="text-[9px] font-bold text-[#042C51] bg-[#E9F0FC] px-1 py-0.2 rounded font-mono">
                          {stage.percentageOfJO}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow separator */}
                  {idx < pipelineStages.length - 1 && (
                    <div className="hidden md:flex items-center text-slate-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Right Sourcing Info block */}
          <div className="w-full lg:w-[220px] flex items-center justify-between border-t lg:border-t-0 lg:border-l border-[#E6ECF2] pt-4 lg:pt-0 lg:pl-5 select-none">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Leads to Interview</span>
              <span className="text-2xl font-black text-[#042C51] tracking-tight">{metrics.leadsToInterview.toLocaleString()}</span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Accepted JO to Leads</span>
              <span className="text-sm font-black text-[#042C51]">{metrics.hiringRate}%</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== 3-COLUMN DASHBOARD ROW ==================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none">
        {/* Column 1: HIRING FUNNEL */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
              Hiring Funnel
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Visual stacked funnel depicting active candidate volume and sequential conversion rates.
            </p>
          </div>

          {/* Stacked Funnel SVG Visualizer */}
          <div className="flex justify-center items-center py-2.5 px-2 bg-slate-50/60 rounded-xl border border-slate-200/80">
            <svg width="340" height="235" viewBox="0 0 340 235" className="w-full max-w-[340px] drop-shadow-md select-none">
              {/* Level 1: Accepted JO */}
              <polygon points="10,10 330,10 305,50 35,50" fill="#042C51" />
              <text x="170" y="34" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle">
                Accepted JO: {pipelineStages[0]?.count || 0}
              </text>

              {/* Level 2: NHO */}
              <polygon points="38,54 302,54 277,94 63,94" fill="#2563EB" />
              <text x="170" y="78" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle">
                NHO: {pipelineStages[1]?.count || 0}
              </text>

              {/* Level 3: FST */}
              <polygon points="66,98 274,98 249,138 91,138" fill="#0D9488" />
              <text x="170" y="122" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle">
                FST: {pipelineStages[2]?.count || 0}
              </text>

              {/* Level 4: PST */}
              <polygon points="94,142 246,142 221,182 119,182" fill="#EA580C" />
              <text x="170" y="166" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">
                PST: {pipelineStages[3]?.count || 0}
              </text>

              {/* Level 5: Go Live */}
              <polygon points="122,186 218,186 205,226 135,226" fill="#15803D" />
              <text x="170" y="210" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">
                Live: {pipelineStages[4]?.count || 0}
              </text>
            </svg>
          </div>

          {/* Conversion Table */}
          <div className="border border-[#E6ECF2] rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#E9F0FC] text-[#042C51] font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="px-2.5 py-1.5">Stage</th>
                  <th className="px-2.5 py-1.5 text-right">Count</th>
                  <th className="px-2.5 py-1.5 text-right">Step Conv</th>
                  <th className="px-2.5 py-1.5 text-right">Cum Conv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF2] font-semibold text-slate-700 bg-white">
                {pipelineStages.map((stage, sIdx) => (
                  <tr key={sIdx} className="hover:bg-slate-50">
                    <td className="px-2.5 py-1.5 font-bold text-slate-800">{stage.name.split(" — ")[0]}</td>
                    <td className="px-2.5 py-1.5 text-right font-mono font-bold text-slate-900">{stage.count}</td>
                    <td className="px-2.5 py-1.5 text-right font-mono">
                      {sIdx === 0 ? "-" : `${stage.conversionFromPrevious}%`}
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-mono font-black text-[#042C51]">
                      {stage.percentageOfJO}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-[#E6ECF2] text-center">
            <span className="text-[10px] font-bold text-[#042C51]">
              Hiring Rate (Leads to JO): <strong className="text-[#042C51] text-xs font-black">{metrics.hiringRate}%</strong>
            </span>
          </div>
        </div>

        {/* Column 2: ATTRITION BETWEEN STAGES */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
              Attrition Between Stages
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Identifies candidate drop-off metrics between consecutive milestone stages.
            </p>
          </div>

          {/* Structured Container for Stage Drop-offs */}
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/80 flex-1 flex flex-col justify-around gap-2.5">
            {aggregatedTransitions.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-[#E6ECF2] shadow-2xs flex flex-col gap-1.5 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E74C3C] shrink-0"></span>
                    <span className="text-slate-800 font-extrabold text-[11px]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-slate-400 font-medium">Loss:</span>
                    <span className="text-[#E74C3C] font-black">{item.count}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[#E74C3C] font-black">{item.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className="bg-[#E74C3C] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.max(2, Math.min(100, item.pct))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Attrition Total Summary Box */}
          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-rose-100/80 flex items-center justify-center text-[#E74C3C] shrink-0">
                <X className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-rose-500/80 uppercase tracking-wider block">Total Attrition</span>
                <span className="text-xs font-black text-rose-950">Aggregate Sourcing Loss</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#E74C3C] block leading-none">{metrics.attritionCount}</span>
              <span className="text-[10px] font-bold text-[#E74C3C]">{metrics.attritionPercentage}% rate</span>
            </div>
          </div>
        </div>

        {/* Column 3: 6-WEEK TRENDS */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between space-y-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
                6-Week Trends
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                Historical trajectory of core operational metrics.
              </p>
            </div>

            {/* Action controls: View Trend Details + Weekly/Monthly Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTrendDetailsModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold bg-[#042C51] text-white hover:bg-[#073d6f] rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Open 6-Week Trend Details Diagnostic Center"
              >
                <Maximize2 className="w-3 h-3 text-white" />
                <span className="hidden sm:inline">View Trend Details</span>
                <span className="sm:hidden">Details</span>
              </button>

              {/* Weekly/Monthly Toggle */}
              <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E6ECF2]">
                <button
                  onClick={() => { setTrendMode("weekly"); setActiveTrendIdx(null); }}
                  className={`px-2 py-1 text-[9px] font-black rounded transition-all uppercase tracking-wider ${
                    trendMode === "weekly" ? "bg-white text-[#042C51] shadow-sm" : "text-slate-500 hover:text-[#042C51]"
                  }`}
                >
                  Wk
                </button>
                <button
                  onClick={() => { setTrendMode("monthly"); setActiveTrendIdx(null); }}
                  className={`px-2 py-1 text-[9px] font-black rounded transition-all uppercase tracking-wider ${
                    trendMode === "monthly" ? "bg-white text-[#042C51] shadow-sm" : "text-slate-500 hover:text-[#042C51]"
                  }`}
                >
                  Mo
                </button>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="relative border border-slate-200/80 rounded-xl p-2 bg-slate-50/60 flex-1 flex flex-col justify-center min-h-[180px]">
            {/* Legend */}
            <div className="flex items-center gap-2.5 text-[8px] font-black mb-2 justify-center shrink-0 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-slate-700">
                <span className="w-2.5 h-0.5 bg-[#4B9DFE] inline-block"></span> Abs %
              </span>
              <span className="flex items-center gap-1 text-slate-700">
                <span className="w-2.5 h-0.5 bg-[#E67E22] inline-block"></span> Att %
              </span>
              <span className="flex items-center gap-1 text-slate-700">
                <span className="w-2.5 h-0.5 bg-[#E74C3C] inline-block"></span> Buf %
              </span>
            </div>

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none">
              {/* Grid Lines */}
              {[-8, -4, 0, 4, 8, 12].map((yVal, i) => {
                const scaledY = chartHeight - paddingY - ((yVal - (-8)) / (12 - (-8))) * (chartHeight - paddingY * 2);
                const isZero = yVal === 0;
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={scaledY}
                      x2={chartWidth - paddingX}
                      y2={scaledY}
                      stroke={isZero ? "#E74C3C" : "#E2E8F0"}
                      strokeWidth={isZero ? 1.5 : 0.8}
                      strokeDasharray={isZero ? "none" : "3 3"}
                    />
                    <text
                      x={paddingX - 10}
                      y={scaledY + 3}
                      fill={isZero ? "#E74C3C" : "#94A3B8"}
                      fontSize="9"
                      fontWeight={isZero ? "bold" : "normal"}
                      textAnchor="end"
                    >
                      {yVal}%
                    </text>
                  </g>
                );
              })}

              {/* Zero Target reference line for buffer */}
              <text x={chartWidth - paddingX - 15} y={chartHeight - paddingY - ((0 - (-8)) / (12 - (-8))) * (chartHeight - paddingY * 2) - 4} fill="#E74C3C" fontSize="8" fontWeight="bold" textAnchor="end">
                TARGET BUFFER FLOOR (0%)
              </text>

              {/* Draw Lines */}
              {/* Absenteeism Line */}
              <path
                d={chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.absY}`).join(" ")}
                fill="none"
                stroke="#4B9DFE"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Attrition Line */}
              <path
                d={chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.attY}`).join(" ")}
                fill="none"
                stroke="#E67E22"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Buffer Line */}
              <path
                d={chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.bufY}`).join(" ")}
                fill="none"
                stroke="#E74C3C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Render Dots & Tooltip Target Detectors */}
              {chartPoints.map((pt, idx) => {
                const isActive = activeTrendIdx === idx;
                return (
                  <g key={idx} className="cursor-pointer" onMouseEnter={() => setActiveTrendIdx(idx)}>
                    {/* Dots */}
                    <circle cx={pt.x} cy={pt.absY} r={isActive ? 6 : 3.5} fill="#4B9DFE" stroke="#fff" strokeWidth="1.5" />
                    <circle cx={pt.x} cy={pt.attY} r={isActive ? 6 : 3.5} fill="#E67E22" stroke="#fff" strokeWidth="1.5" />
                    <circle cx={pt.x} cy={pt.bufY} r={isActive ? 6 : 3.5} fill="#E74C3C" stroke="#fff" strokeWidth="1.5" />

                    {/* Vertical guideline */}
                    {isActive && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={chartHeight - paddingY}
                        stroke="#042C51"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Interactive invisible detector area */}
                    <rect
                      x={pt.x - 25}
                      y={paddingY}
                      width="50"
                      height={chartHeight - paddingY * 2}
                      fill="transparent"
                    />

                    {/* X Axis label */}
                    <text
                      x={pt.x}
                      y={chartHeight - paddingY + 15}
                      fill="#64748B"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {pt.period}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Absolute interactive tooltip box inside line chart */}
            {activeTrendIdx !== null && chartPoints[activeTrendIdx] && (
              <div 
                className="absolute bg-[#042C51] text-white p-3 rounded-xl shadow-xl border border-slate-700/60 text-left z-20 transition-all duration-150"
                style={{
                  top: "35px",
                  left: `${(chartPoints[activeTrendIdx].x / chartWidth) * 75}%`,
                  width: "170px"
                }}
              >
                <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    {chartPoints[activeTrendIdx].period} Breakdown
                  </span>
                  <button 
                    onClick={() => setActiveTrendIdx(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">Absenteeism:</span>
                    <strong className="text-[#4B9DFE] font-bold font-mono">{chartPoints[activeTrendIdx].absenteeism}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">Attrition:</span>
                    <strong className="text-[#E67E22] font-bold font-mono">{chartPoints[activeTrendIdx].attrition}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">Buffer Cushion:</span>
                    <strong className={`${
                      chartPoints[activeTrendIdx].buffer < 0 ? "text-[#E74C3C]" : "text-[#2ECC71]"
                    } font-bold font-mono`}>
                      {chartPoints[activeTrendIdx].buffer}%
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Average Stats Boxes */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Abs AVG</span>
              <strong className="text-sm font-black text-[#4B9DFE] font-mono">{trendAverages.absAvg}%</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Att AVG</span>
              <strong className="text-sm font-black text-[#E67E22] font-mono">{trendAverages.attAvg}%</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Buffer AVG</span>
              <strong className={`text-sm font-black font-mono ${trendAverages.bufAvg < 0 ? "text-[#E74C3C]" : "text-emerald-600"}`}>
                {trendAverages.bufAvg}%
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DETAILED PERFORMANCE BY CLUSTER / ACCOUNT MASTER GRID ==================== */}
      <section className="bg-white rounded-2xl border border-[#E6ECF2] shadow-sm overflow-hidden space-y-4 p-5">
        {/* Row 1: Title & Subtitle on left, Period selector on right (matching Image 2) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#042C51] tracking-tight">
              Detailed Performance by Cluster / Account (6-Week Multi-Week Ledger)
            </h3>
            <p className="text-xs text-[#667085] mt-1 font-medium">
              Master account–level capacity ledger across the selected six-week window, including requirements, buffer, workforce loss, pipeline, and yield metrics.
            </p>
          </div>

          {/* Period selector pill container */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] self-start lg:self-center shadow-2xs">
            <div className="flex items-center gap-1.5 pl-2.5 pr-1 text-[#042C51]">
              <Calendar className="w-3.5 h-3.5 text-[#FF5C28]" />
              <span className="text-[11px] font-black tracking-wider uppercase">PERIOD:</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {PERIOD_LIST.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedPeriod === p
                      ? "bg-[#042C51] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Drag pill on left, Form controls on right (matching Image 2) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
          {/* Left: Drag horizontally pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E6ECF2] bg-white text-[11px] font-bold text-[#667085] tracking-wider uppercase shadow-2xs select-none self-start">
            <span className="text-[#FF5C28] font-black text-sm tracking-tighter leading-none">:::</span>
            <span>DRAG HORIZONTALLY TO INSPECT ALL COLUMNS</span>
          </div>

          {/* Right: Controls with labels on top */}
          <div className="flex flex-wrap items-end gap-3 self-start lg:self-end">
            {/* Search */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#042C51]">Search</span>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search account / cluster..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-[#E6ECF2] hover:border-[#94A9C1] rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-[#042C51] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#042C51]/10 min-w-[210px] shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Clusters */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#042C51]">Clusters</span>
              <div className="relative">
                <select
                  value={selectedClusterFilter}
                  onChange={e => { setSelectedClusterFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-white border border-[#E6ECF2] hover:border-[#94A9C1] rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#042C51]/10 min-w-[135px] cursor-pointer shadow-2xs transition-all"
                >
                  <option value="All">All Clusters</option>
                  <option value="Coast Dental">Coast Dental</option>
                  <option value="Corporate">Corporate</option>
                  <option value="SME">SME</option>
                  <option value="US Visa">US Visa</option>
                  <option value="Yomdel">Yomdel</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#667085] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Risks */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#042C51]">Risks</span>
              <div className="relative">
                <select
                  value={selectedRiskFilter}
                  onChange={e => { setSelectedRiskFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-white border border-[#E6ECF2] hover:border-[#94A9C1] rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#042C51]/10 min-w-[125px] cursor-pointer shadow-2xs transition-all"
                >
                  <option value="All">All Risks</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Watch">Watch</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Critical">Critical</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#667085] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Row Count Badge */}
            <div className="h-[38px] px-3.5 bg-[#EBF1F7] text-[#042C51] font-bold text-xs rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
              <span>{filteredRecords.length} account rows</span>
            </div>

            {/* Export Tools */}
            <div className="flex items-center gap-1.5 h-[38px]">
              <button
                onClick={handleExportExcel}
                title="Download Excel Spreadsheet (.xlsx)"
                className="h-full px-2.5 bg-white hover:bg-slate-50 text-[#042C51] rounded-xl flex items-center gap-1 border border-[#E6ECF2] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#042C51]" />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={handleExportPdf}
                title="Download Branded PDF Report"
                className="h-full px-2.5 bg-[#FF5C28] hover:bg-[#e04f20] text-white rounded-xl flex items-center gap-1 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Master Ledger Table with Drag-Scroll Capability */}
        <div 
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`w-full max-w-full min-w-0 overflow-x-auto border border-[#E6ECF2] rounded-xl relative select-none cursor-grab ${
            isMouseDown ? "cursor-grabbing" : ""
          }`}
        >
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#667085] text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-[#E6ECF2]">
              {/* Category Grouping Row 1 */}
              <tr className="border-b border-[#E6ECF2] bg-[#F1F5F9]/80 text-[#042C51]">
                <th className="px-2 py-2 text-center w-8 border-r border-[#E6ECF2] font-black text-slate-400">#</th>
                <th className="px-3 py-2 text-left border-r border-[#E6ECF2] font-black">CLUSTER</th>
                <th className="px-3 py-2 text-left border-r border-[#E6ECF2] font-black">ACCOUNT</th>
                <th colSpan={5} className="px-3 py-2 bg-[#E9F0FC]/60 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  WORKFORCE CAPACITY
                </th>
                <th colSpan={4} className="px-3 py-2 bg-[#F1F5F9]/80 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  SHRINKAGE & ATTRITION
                </th>
                <th colSpan={5} className="px-3 py-2 bg-[#E9F0FC]/60 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  HIRING FUNNEL MILESTONES
                </th>
                <th colSpan={4} className="px-3 py-2 bg-[#F1F5F9]/80 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  STAGE CONVERSIONS
                </th>
                <th colSpan={3} className="px-3 py-2 bg-[#E9F0FC]/60 text-[#042C51] text-center font-black">
                  RESULTS & AUDIT
                </th>
              </tr>

              {/* Individual Column Header Row 2 */}
              <tr className="bg-[#F8FAFC] text-[#667085] border-b border-[#E6ECF2] text-[10px]">
                <th className="px-2 py-2.5 text-center w-8 border-r border-[#E6ECF2] text-slate-400">
                  <span className="text-[11px] font-mono tracking-tighter text-slate-300">:::</span>
                </th>
                <th className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/60 border-r border-[#E6ECF2] text-left" onClick={() => handleSort("cluster")}>
                  CLUSTER GROUP {sortField === "cluster" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/60 border-r border-[#E6ECF2] text-left" onClick={() => handleSort("account")}>
                  ACCOUNT NAME {sortField === "account" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>

                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("requiredHC")}>
                  PLANNED HC {sortField === "requiredHC" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("actualHC")}>
                  ACTUAL HC {sortField === "actualHC" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("bufferPercentage")}>
                  BUFFER % {sortField === "bufferPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("netActualHC")}>
                  NET ACTUAL {sortField === "netActualHC" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60 border-r border-[#E6ECF2]" onClick={() => handleSort("hiringNeeded")}>
                  HIRING NEEDED {sortField === "hiringNeeded" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>

                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("absenteeismCount")}>
                  ABSENTEEISM {sortField === "absenteeismCount" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("absenteeismPercentage")}>
                  ABS % {sortField === "absenteeismPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("attritionCount")}>
                  ATTRITION {sortField === "attritionCount" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60 border-r border-[#E6ECF2]" onClick={() => handleSort("attritionPercentage")}>
                  ATT % {sortField === "attritionPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>

                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("acceptedJO")}>
                  ACCEPTED JO {sortField === "acceptedJO" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("nho")}>
                  NHO COUNT {sortField === "nho" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("fst")}>
                  FST COUNT {sortField === "fst" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("pst")}>
                  PST COUNT {sortField === "pst" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60 border-r border-[#E6ECF2]" onClick={() => handleSort("goLive")}>
                  GO LIVE {sortField === "goLive" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>

                <th className="px-3 py-2.5 text-center">JO ➔ NHO</th>
                <th className="px-3 py-2.5 text-center">NHO ➔ FST</th>
                <th className="px-3 py-2.5 text-center">FST ➔ PST</th>
                <th className="px-3 py-2.5 text-center border-r border-[#E6ECF2]">PST ➔ GO LIVE</th>

                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("hiredCount")}>
                  HIRED COUNT {sortField === "hiredCount" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-200/60" onClick={() => handleSort("hiringRate")}>
                  HIRING RATE % {sortField === "hiringRate" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3.5 py-2.5 text-center">HIRING RISK</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#E6ECF2] bg-white font-medium">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={24} className="text-center py-10 text-slate-400 font-bold">
                    No matching records found. Try clearing your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(rec => {
                  const isExpanded = expandedRows[rec.id];
                  
                  // Stage transition loss & retention calculations
                  const joToNhoLoss = Math.max(0, rec.acceptedJO - rec.nho);
                  const joToNhoRet = rec.acceptedJO > 0 ? ((rec.nho / rec.acceptedJO) * 100).toFixed(0) : "0";

                  const nhoToFstLoss = Math.max(0, rec.nho - rec.fst);
                  const nhoToFstRet = rec.nho > 0 ? ((rec.fst / rec.nho) * 100).toFixed(0) : "0";

                  const fstToPstLoss = Math.max(0, rec.fst - rec.pst);
                  const fstToPstRet = rec.fst > 0 ? ((rec.pst / rec.fst) * 100).toFixed(0) : "0";

                  const pstToGoLiveLoss = Math.max(0, rec.pst - rec.goLive);
                  const pstToGoLiveRet = rec.pst > 0 ? ((rec.goLive / rec.pst) * 100).toFixed(0) : "0";

                  // Color codes for risk badges
                  let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  if (rec.riskLevel === RiskLevel.Watch) badgeStyle = "bg-blue-50 text-blue-700 border-blue-100";
                  if (rec.riskLevel === RiskLevel.AtRisk) badgeStyle = "bg-amber-50 text-amber-700 border-amber-100";
                  if (rec.riskLevel === RiskLevel.Critical) badgeStyle = "bg-rose-50 text-rose-700 border-rose-100 animate-pulse";

                  return (
                    <React.Fragment key={rec.id}>
                      <tr className={`hover:bg-[#F1F5F9]/60 transition-colors ${isExpanded ? "bg-[#E9F0FC]/30" : ""}`}>
                        {/* Accordion trigger */}
                        <td className="px-2 py-3 text-center border-r border-[#E6ECF2]">
                          <button
                            onClick={() => toggleRow(rec.id)}
                            className="p-1 rounded hover:bg-slate-200/80 text-slate-500 focus:outline-none transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        {/* Cluster */}
                        <td className="px-3 py-3 font-semibold text-slate-500 max-w-[120px] truncate border-r border-[#E6ECF2]">{rec.cluster}</td>

                        {/* Account */}
                        <td className="px-3 py-3 text-[#042C51] font-bold border-r border-[#E6ECF2]">
                          <button
                            onClick={() => onRecordClick && onRecordClick(rec.account)}
                            className="hover:underline hover:text-[#FF5C28] text-left focus:outline-none font-extrabold"
                          >
                            {rec.account}
                          </button>
                        </td>

                        {/* Capacity Metrics */}
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-700">{rec.requiredHC}</td>
                        <td className="px-3 py-3 text-right font-mono text-slate-600">{rec.actualHC}</td>
                        <td className={`px-3 py-3 text-right font-mono font-bold ${rec.bufferPercentage < 0 ? "text-[#E74C3C]" : "text-[#2ECC71]"}`}>
                          {rec.bufferPercentage}%
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{rec.netActualHC}</td>
                        <td className={`px-3 py-3 text-right font-mono font-bold border-r border-[#E6ECF2] ${rec.hiringNeeded > 0 ? "text-[#E74C3C]" : "text-slate-700"}`}>
                          {rec.hiringNeeded > 0 ? (
                            <span className="bg-rose-50 text-[#E74C3C] px-1.5 py-0.5 rounded font-black border border-rose-100">
                              {rec.hiringNeeded}
                            </span>
                          ) : (
                            0
                          )}
                        </td>

                        {/* Current Week Loss */}
                        <td className="px-3 py-3 text-right font-mono text-slate-700">{rec.absenteeismCount}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-800">{rec.absenteeismPercentage}%</td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700">{rec.attritionCount}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 border-r border-[#E6ECF2]">{rec.attritionPercentage}%</td>

                        {/* Funnel Counts */}
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-800">{rec.acceptedJO}</td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700">{rec.nho}</td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700">{rec.fst}</td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700">{rec.pst}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600 border-r border-[#E6ECF2]">{rec.goLive}</td>

                        {/* Stage Conversion & Drop-off */}
                        <td className="px-3 py-3 text-center font-mono">
                          <span className="text-[#E74C3C] font-bold">-{joToNhoLoss}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({joToNhoRet}%)</span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono">
                          <span className="text-[#E74C3C] font-bold">-{nhoToFstLoss}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({nhoToFstRet}%)</span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono">
                          <span className="text-[#E74C3C] font-bold">-{fstToPstLoss}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({fstToPstRet}%)</span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono border-r border-[#E6ECF2]">
                          <span className="text-[#E74C3C] font-bold">-{pstToGoLiveLoss}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({pstToGoLiveRet}%)</span>
                        </td>

                        {/* Yield & Risk */}
                        <td className="px-3 py-3 text-right font-mono font-black text-[#042C51]">{rec.hiredCount}</td>
                        <td className="px-3 py-3 text-right font-mono font-black text-[#FF5C28]">{rec.hiringRate}%</td>
                        <td className="px-3.5 py-3 text-center">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${badgeStyle}`}>
                            {rec.riskLevel}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable row containing detailed sequential pipeline and drop-offs */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={24} className="bg-slate-50/90 p-4 border-l-4 border-[#FF5C28] space-y-4">
                            {/* 6-Week Historical Progression Table matching Reference Design */}
                            {rec.weeklyHistory && rec.weeklyHistory.length > 0 && (
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-extrabold text-[#042C51] text-xs uppercase tracking-wider flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-[#FF5C28]" />
                                      <span>6-Week Historical Capacity & Loss Progression (Week 33 – Week 38)</span>
                                    </h4>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    Current active week highlighted
                                  </span>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-[#E6ECF2]">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-[#042C51] text-white font-extrabold uppercase text-[10px]">
                                      <tr>
                                        <th className="px-3 py-2">Week</th>
                                        <th className="px-2.5 py-2 text-right">Req HC</th>
                                        <th className="px-2.5 py-2 text-right">Act HC</th>
                                        <th className="px-2.5 py-2 text-right">Buffer %</th>
                                        <th className="px-2.5 py-2 text-right">Abs (Cnt & %)</th>
                                        <th className="px-2.5 py-2 text-right">Att (Cnt & %)</th>
                                        <th className="px-2.5 py-2 text-right">Net Actual</th>
                                        <th className="px-2.5 py-2 text-right">Hiring Needed</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E6ECF2] bg-white font-mono text-[11px]">
                                      {rec.weeklyHistory.map((wk, wIdx) => {
                                        const isDeficit = wk.bufferPct < 0;
                                        return (
                                          <tr 
                                            key={wIdx} 
                                            className={`${wk.isSelected ? "bg-amber-50/80 font-bold border-l-4 border-l-[#FF5C28]" : "hover:bg-slate-50"} transition-colors`}
                                          >
                                            <td className="px-3 py-2 font-sans font-extrabold text-[#042C51] whitespace-nowrap flex items-center gap-2">
                                              <span>{wk.week}</span>
                                              {wk.isSelected && (
                                                <span className="px-1.5 py-0.5 bg-[#042C51] text-white text-[9px] font-black rounded uppercase tracking-wider">
                                                  SELECTED
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-2.5 py-2 text-right font-bold text-slate-800">{wk.reqHC}</td>
                                            <td className="px-2.5 py-2 text-right font-bold text-slate-800">{wk.actHC}</td>
                                            <td className={`px-2.5 py-2 text-right font-black ${isDeficit ? "text-[#E74C3C]" : "text-[#2ECC71]"}`}>
                                              {wk.bufferPct}%
                                            </td>
                                            <td className="px-2.5 py-2 text-right font-bold text-slate-700">
                                              {wk.absCount} ({wk.absPct.toFixed(2)}%)
                                            </td>
                                            <td className="px-2.5 py-2 text-right font-bold text-[#E74C3C]">
                                              {wk.attCount}({wk.attPct.toFixed(2)}%)
                                            </td>
                                            <td className="px-2.5 py-2 text-right font-bold text-[#042C51]">{wk.netActual}</td>
                                            <td className={`px-2.5 py-2 text-right font-black ${wk.hiringNeeded > 0 ? "text-[#E74C3C]" : "text-slate-500"}`}>
                                              {wk.hiringNeeded}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* 2 Visual Summary Cards: Headcount Ramp and Cumulative Hires matching reference Image 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                  {/* Headcount Ramp Card */}
                                  <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-xs flex items-center justify-between">
                                    <div>
                                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                        6-WEEK HEADCOUNT RAMP
                                      </div>
                                      <div className="text-base font-black text-[#042C51] mt-0.5">
                                        {rec.rampText?.includes("→") ? rec.rampText.split("(")[0].trim() : "33 → 38"}
                                      </div>
                                    </div>
                                    <div className="text-xs font-bold text-[#2ECC71] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                      {rec.rampText?.includes("+") ? `+${rec.rampText.split("+")[1].replace(")", "")}` : "+5 agents"}
                                    </div>
                                  </div>

                                  {/* Cumulative Hires Card */}
                                  <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
                                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                      6-WEEK CUMULATIVE HIRES
                                    </div>
                                    <div className="text-base font-black text-[#FF5C28] mt-0.5">
                                      {typeof rec.cumulativeHires === "number" ? `${rec.cumulativeHires} hired` : `${rec.hiredCount} hired`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* Table Summary Row (TOTAL / AVERAGE) */}
            <tfoot className="bg-[#EEF4F9] text-[#042C51] text-xs font-bold border-t border-[#CBD5E1]">
              <tr>
                <td colSpan={3} className="px-3 py-3 text-left font-extrabold uppercase text-[#042C51] tracking-tight">
                  TOTAL / AVERAGE ({filteredRecords.length} ACCOUNTS)
                </td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.requiredHC}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.actualHC}</td>
                <td className={`px-3 py-3 text-right font-mono font-bold ${summaryTotals.bufferPercentage < 0 ? "text-[#E74C3C]" : "text-emerald-600"}`}>
                  {summaryTotals.bufferPercentage < 0 ? `${summaryTotals.bufferPercentage}%` : `+${summaryTotals.bufferPercentage}%`}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.netActualHC}</td>
                <td className={`px-3 py-3 text-right font-mono font-bold ${summaryTotals.hiringNeeded > 0 ? "text-[#E74C3C]" : "text-[#042C51]"}`}>
                  {summaryTotals.hiringNeeded}
                </td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.absenteeismCount}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.absenteeismPercentage.toFixed(2)}%</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.attritionCount}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.attritionPercentage}%</td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.acceptedJO}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.nho}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.fst}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.pst}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.goLive}</td>

                <td className="px-3 py-3 text-center font-mono font-medium text-slate-600">
                  -{summaryTotals.joToNhoLoss} ({summaryTotals.joToNhoRet}%)
                </td>
                <td className="px-3 py-3 text-center font-mono font-medium text-slate-600">
                  -{summaryTotals.nhoToFstLoss} ({summaryTotals.nhoToFstRet}%)
                </td>
                <td className="px-3 py-3 text-center font-mono font-medium text-slate-600">
                  -{summaryTotals.fstToPstLoss} ({summaryTotals.fstToPstRet}%)
                </td>
                <td className="px-3 py-3 text-center font-mono font-medium text-slate-600">
                  -{summaryTotals.pstToGoLiveLoss} ({summaryTotals.pstToGoLiveRet}%)
                </td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.hiredCount}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{summaryTotals.hiringRate}%</td>
                <td className="px-3 py-3 text-center">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-[#DCE7F3] text-[#042C51]">
                    Summary
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Dense pagination footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100 select-none">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-100 border-none font-bold text-[#042C51] px-2 py-1 rounded focus:outline-none cursor-pointer"
            >
              <option value={10}>10 rows</option>
              <option value={15}>15 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>All (49) rows</option>
            </select>
            <span>Showing {Math.min(filteredRecords.length, (currentPage - 1) * rowsPerPage + 1)}-{Math.min(filteredRecords.length, currentPage * rowsPerPage)} of {filteredRecords.length} records</span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-[#042C51] px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Workforce & Hiring 6-Week Trend Details Diagnostic Center Modal */}
      <WorkforceHiringTrendDetailsModal
        isOpen={isTrendDetailsModalOpen}
        onClose={() => setIsTrendDetailsModalOpen(false)}
        weeklyTrends={weeklyTrends}
        detailRecords={detailRecords}
        initialCluster={selectedClusterFilter}
        initialAccount="All"
      />
    </div>
  );
}
