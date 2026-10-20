import React, { useState, useMemo } from "react";
import {
  Building2,
  Users,
  DollarSign,
  MapPin,
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  LayoutGrid,
  List,
  UserCheck,
  X,
  ExternalLink,
  PieChart,
  BarChart3,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Check,
  User,
  Inbox,
  Mail,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface DepartmentUnit {
  id: string;
  name: string;
  code: string;
  category: "Core Operations" | "Technology & Infrastructure" | "Healthcare & Compliance" | "Talent & People" | "Executive & Shared";
  head: string;
  headRole: string;
  headEmail: string;
  headAvatar?: string;
  headcount: number;
  maxCapacity: number;
  budget: string;
  budgetUsedPct: number;
  location: string;
  siteRegion: "SiBS Tagum" | "SiBS Davao" | "SiBS Mabini";
  status: "Active & Staffed" | "Ramping" | "Optimizing" | "Strategic Expansion";
  keyPrograms: string[];
  subTeamsCount: number;
  description: string;
}

const INITIAL_DEPARTMENTS: DepartmentUnit[] = [
  {
    id: "DEP-001",
    name: "Call Center Operations",
    code: "CCO-DIV",
    category: "Core Operations",
    head: "Crister Alberca Canitan",
    headRole: "VP of Call Center Operations",
    headEmail: "crister.canitan@thesiblingssolutions.com",
    headcount: 1450,
    maxCapacity: 1600,
    budget: "$2.8M",
    budgetUsedPct: 92,
    location: "Tower B, Floors 2–4",
    siteRegion: "SiBS Tagum",
    status: "Active & Staffed",
    keyPrograms: ["Tier 1/2 Voice Support", "Omnichannel Inbound/Outbound", "Escalations & Resolution", "Enterprise Customer Care"],
    subTeamsCount: 18,
    description: "Main operational engine delivering 24/7 high-volume customer care, technical support, and account management for global enterprise clients."
  },
  {
    id: "DEP-002",
    name: "Human Resource",
    code: "HR-DIV",
    category: "Talent & People",
    head: "Shiela Mae Delos Reyes",
    headRole: "HR & People Operations Director",
    headEmail: "shiela.delosreyes@thesiblingssolutions.com",
    headcount: 32,
    maxCapacity: 40,
    budget: "$520K",
    budgetUsedPct: 86,
    location: "Executive Tower A, Floor 5",
    siteRegion: "SiBS Tagum",
    status: "Active & Staffed",
    keyPrograms: ["Employee Relations & Governance", "Compensation & Benefits", "Labor Law Compliance", "Employee Engagement & Wellness"],
    subTeamsCount: 4,
    description: "Corporate HR backbone driving employee lifecycle management, benefits administration, policy governance, and workplace culture."
  },
  {
    id: "DEP-003",
    name: "IT (Information and Communications Technology)",
    code: "ICT-DIV",
    category: "Technology & Infrastructure",
    head: "Dex Chauncey Ybañez",
    headRole: "Chief Technology & ICT Director",
    headEmail: "dex.ybanez@thesiblingssolutions.com",
    headcount: 65,
    maxCapacity: 80,
    budget: "$1.4M",
    budgetUsedPct: 89,
    location: "Building 1, Floor 3 (NOC Room)",
    siteRegion: "SiBS Davao",
    status: "Active & Staffed",
    keyPrograms: ["24/7 Enterprise NOC", "Network & Fiber Redundancy", "Cybersecurity & PCI-DSS", "Helpdesk & Systems Admin"],
    subTeamsCount: 6,
    description: "Technology infrastructure engine managing network security, server uptime, workstation hardware, and IT service desk support."
  },
  {
    id: "DEP-004",
    name: "Facility Management",
    code: "FM-DIV",
    category: "Executive & Shared",
    head: "Engr. Ronald V. Santos",
    headRole: "Director of Facilities & Real Estate",
    headEmail: "ronald.santos@thesiblingssolutions.com",
    headcount: 48,
    maxCapacity: 55,
    budget: "$680K",
    budgetUsedPct: 82,
    location: "Ground Floor Admin Hub",
    siteRegion: "SiBS Tagum",
    status: "Active & Staffed",
    keyPrograms: ["Building Maintenance & HVAC", "Physical Security & Biometrics", "Generator & Power Backup", "Occupational Health & Safety"],
    subTeamsCount: 5,
    description: "Facility maintenance, physical campus security, power backup infrastructure, and building management across all SiBS locations."
  },
  {
    id: "DEP-005",
    name: "Finance & Accounting",
    code: "FA-DIV",
    category: "Executive & Shared",
    head: "Mark Gregory Sarmiento",
    headRole: "Director of Finance & Controller",
    headEmail: "mark.sarmiento@thesiblingssolutions.com",
    headcount: 28,
    maxCapacity: 35,
    budget: "$750K",
    budgetUsedPct: 88,
    location: "Executive Tower A, Floor 4",
    siteRegion: "SiBS Tagum",
    status: "Active & Staffed",
    keyPrograms: ["Corporate Accounting & Tax", "Payroll Processing", "Budgeting & Financial Audit", "Billing & Client Invoicing"],
    subTeamsCount: 3,
    description: "Financial governance managing corporate accounting, client billing, payroll execution, tax compliance, and budget planning."
  },
  {
    id: "DEP-007",
    name: "Training Management",
    code: "TM-DIV",
    category: "Talent & People",
    head: "Jessica Mae Valencia",
    headRole: "Head of Learning & Development",
    headEmail: "jessica.valencia@thesiblingssolutions.com",
    headcount: 42,
    maxCapacity: 50,
    budget: "$480K",
    budgetUsedPct: 85,
    location: "Innovation Building 1, Floor 2",
    siteRegion: "SiBS Mabini",
    status: "Active & Staffed",
    keyPrograms: ["New Hire Foundation Training", "Communication & Accent Neutralization", "Product & Tool Ramp-up", "Leadership & Upskilling"],
    subTeamsCount: 4,
    description: "Learning and development hub conducting new hire onboarding, account nesting, product training, and leadership upskilling."
  },
  {
    id: "DEP-008",
    name: "Quality Assurance Management",
    code: "QAM-DIV",
    category: "Core Operations",
    head: "Renz Christopher Torres",
    headRole: "Quality Assurance Manager",
    headEmail: "renz.torres@thesiblingssolutions.com",
    headcount: 58,
    maxCapacity: 70,
    budget: "$510K",
    budgetUsedPct: 81,
    location: "Building 3, Floor 3",
    siteRegion: "SiBS Davao",
    status: "Active & Staffed",
    keyPrograms: ["Call & Chat Auditing", "Calibration & CSAT Monitoring", "Compliance & SLA Tracking", "Root Cause Coaching"],
    subTeamsCount: 5,
    description: "Operational quality monitoring ensuring strict compliance with client SLAs, interaction accuracy, and customer satisfaction."
  },
  {
    id: "DEP-009",
    name: "Workforce Management",
    code: "WFM-DIV",
    category: "Technology & Infrastructure",
    head: "Dex Chauncey Ybañez",
    headRole: "Head of Workforce Management",
    headEmail: "dex.ybanez@thesiblingssolutions.com",
    headcount: 38,
    maxCapacity: 45,
    budget: "$420K",
    budgetUsedPct: 81,
    location: "Tower B, Floor 4 (WFM Room)",
    siteRegion: "SiBS Tagum",
    status: "Active & Staffed",
    keyPrograms: ["Erlang Capacity Modeling", "Real-Time Adherence Monitoring", "Shift Scheduling & Roster", "Shrinkage & Attrition Analysis"],
    subTeamsCount: 3,
    description: "Real-time staffing and scheduling command center forecasting volume, shift bidding, and seat occupancy optimization."
  },
  {
    id: "DEP-010",
    name: "Talent Acquisition",
    code: "TA-DIV",
    category: "Talent & People",
    head: "Alena Mendoza Batacan",
    headRole: "Director of Talent Acquisition",
    headEmail: "alena.batacan@thesiblingssolutions.com",
    headcount: 45,
    maxCapacity: 50,
    budget: "$490K",
    budgetUsedPct: 94,
    location: "Building 1, Floor 1 (Recruitment Hub)",
    siteRegion: "SiBS Tagum",
    status: "Active & Staffed",
    keyPrograms: ["Mass Sourcing & Assessment", "Executive Recruitment", "Campus & Job Fair Drives", "Candidate Pre-screening & Offers"],
    subTeamsCount: 4,
    description: "Talent sourcing engine driving high-volume candidate recruitment, candidate screening, interviewing, and hiring pipelines."
  },
  {
    id: "DEP-012",
    name: "Management Team",
    code: "MGMT-DIV",
    category: "Executive & Shared",
    head: "Executive Board & Leadership",
    headRole: "Executive Committee",
    headEmail: "exec.office@thesiblingssolutions.com",
    headcount: 18,
    maxCapacity: 20,
    budget: "$1.2M",
    budgetUsedPct: 90,
    location: "Executive Suite, Floor 6",
    siteRegion: "SiBS Tagum",
    status: "Active & Staffed",
    keyPrograms: ["Corporate Governance", "Strategic Planning & Expansion", "Client Partner Relations", "Operational Excellence Leadership"],
    subTeamsCount: 2,
    description: "Executive leadership committee directing strategic growth, key account expansion, corporate governance, and operational vision."
  },
  {
    id: "DEP-013",
    name: "Process Excellence Management",
    code: "PEM-DIV",
    category: "Core Operations",
    head: "Maria Santos Carpio",
    headRole: "Process Excellence Lead",
    headEmail: "maria.carpio@thesiblingssolutions.com",
    headcount: 22,
    maxCapacity: 30,
    budget: "$380K",
    budgetUsedPct: 78,
    location: "Innovation Building 1, Floor 3",
    siteRegion: "SiBS Mabini",
    status: "Active & Staffed",
    keyPrograms: ["Six Sigma & Lean DMAIC Projects", "Workflow Automation", "Standard Operating Procedures (SOP)", "Continuous Improvement Audits"],
    subTeamsCount: 2,
    description: "Process optimization team applying Lean Six Sigma methodologies to drive continuous operational improvements and workflow efficiency."
  }
];

interface DepartmentsProps {
  onSwitchModule?: (moduleKey: string) => void;
  onOpenLocation?: (locationName: string) => void;
}

export default function Departments({ onSwitchModule, onOpenLocation }: DepartmentsProps) {
  const [departments, setDepartments] = useState<DepartmentUnit[]>(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [regionFilter, setRegionFilter] = useState<string>("All Locations");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedDept, setSelectedDept] = useState<DepartmentUnit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "grid" ? 6 : 8;

  // New Department Form State
  const [newDeptForm, setNewDeptForm] = useState({
    name: "",
    code: "",
    category: "Core Operations" as DepartmentUnit["category"],
    head: "",
    headRole: "",
    headEmail: "",
    headcount: 50,
    maxCapacity: 60,
    budget: "$500K",
    location: "Building 1, Floor 2",
    siteRegion: "SiBS Tagum" as DepartmentUnit["siteRegion"],
    keyProgramsText: "",
    description: ""
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All Categories");
    setRegionFilter("All Locations");
    setActiveTab("all");
    setCurrentPage(1);
    showToast("Filters reset.");
  };

  // Refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Department headcount and capacity synchronized.");
    }, 600);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Department ID", "Code", "Department Name", "Category", "Department Lead", "Email", "Headcount", "Max Capacity", "Annual Budget", "Location", "Site Region", "Status"];
    const rows = filteredDepartments.map(d => [
      d.id,
      `"${d.code}"`,
      `"${d.name}"`,
      `"${d.category}"`,
      `"${d.head}"`,
      `"${d.headEmail}"`,
      d.headcount,
      d.maxCapacity,
      `"${d.budget}"`,
      `"${d.location}"`,
      `"${d.siteRegion}"`,
      `"${d.status}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SiBS_Department_Units_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredDepartments.length} department records to CSV.`);
  };

  // Counts for Tabs
  const counts = useMemo(() => {
    return {
      all: departments.length,
      core: departments.filter(d => d.category === "Core Operations").length,
      tech: departments.filter(d => d.category === "Technology & Infrastructure").length,
      talent: departments.filter(d => d.category === "Talent & People").length,
      exec: departments.filter(d => d.category === "Executive & Shared").length,
      tagum: departments.filter(d => d.siteRegion === "SiBS Tagum").length,
      davao: departments.filter(d => d.siteRegion === "SiBS Davao").length,
      mabini: departments.filter(d => d.siteRegion === "SiBS Mabini").length
    };
  }, [departments]);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      // Tab filter
      if (activeTab === "core" && d.category !== "Core Operations") return false;
      if (activeTab === "tech" && d.category !== "Technology & Infrastructure") return false;
      if (activeTab === "talent" && d.category !== "Talent & People") return false;
      if (activeTab === "exec" && d.category !== "Executive & Shared") return false;
      if (activeTab === "tagum" && d.siteRegion !== "SiBS Tagum") return false;
      if (activeTab === "davao" && d.siteRegion !== "SiBS Davao") return false;
      if (activeTab === "mabini" && d.siteRegion !== "SiBS Mabini") return false;

      // Search keyword
      const matchSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase());
      if (searchTerm.trim() && !matchSearch) return false;

      // Dropdown Category
      if (categoryFilter !== "All Categories" && d.category !== categoryFilter) {
        return false;
      }

      // Dropdown Region
      if (regionFilter !== "All Locations" && d.siteRegion !== regionFilter) {
        return false;
      }

      return true;
    });
  }, [departments, activeTab, searchTerm, categoryFilter, regionFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDepartments.length / itemsPerPage));
  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDepartments, currentPage, itemsPerPage]);

  // Key Totals
  const totalHeadcount = useMemo(() => departments.reduce((acc, d) => acc + d.headcount, 0), [departments]);
  const totalCapacity = useMemo(() => departments.reduce((acc, d) => acc + d.maxCapacity, 0), [departments]);
  const overallOccupancy = Math.round((totalHeadcount / totalCapacity) * 100);

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptForm.name || !newDeptForm.head) {
      showToast("Please fill out Department Name and Department Lead.");
      return;
    }

    const newUnit: DepartmentUnit = {
      id: `DEP-0${departments.length + 1}`,
      name: newDeptForm.name,
      code: newDeptForm.code || `${newDeptForm.name.slice(0, 3).toUpperCase()}-DIV`,
      category: newDeptForm.category,
      head: newDeptForm.head,
      headRole: newDeptForm.headRole || "Department Lead",
      headEmail: newDeptForm.headEmail || "dept.lead@thesiblingssolutions.com",
      headcount: Number(newDeptForm.headcount),
      maxCapacity: Number(newDeptForm.maxCapacity),
      budget: newDeptForm.budget,
      budgetUsedPct: 75,
      location: newDeptForm.location,
      siteRegion: newDeptForm.siteRegion,
      status: "Active & Staffed",
      keyPrograms: newDeptForm.keyProgramsText ? newDeptForm.keyProgramsText.split(",").map(s => s.trim()) : ["Core Program"],
      subTeamsCount: 2,
      description: newDeptForm.description || "Newly deployed operational department unit."
    };

    setDepartments([newUnit, ...departments]);
    setIsAddModalOpen(false);
    showToast(`Department "${newUnit.name}" deployed successfully!`);
    
    // Reset Form
    setNewDeptForm({
      name: "",
      code: "",
      category: "Core Operations",
      head: "",
      headRole: "",
      headEmail: "",
      headcount: 50,
      maxCapacity: 60,
      budget: "$500K",
      location: "Building 1, Floor 2",
      siteRegion: "SiBS Tagum",
      keyProgramsText: "",
      description: ""
    });
  };

  const getCategoryBadgeClass = (category: DepartmentUnit["category"]) => {
    switch (category) {
      case "Core Operations":
        return "bg-blue-50 text-[#042C51] border-blue-200";
      case "Healthcare & Compliance":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Technology & Infrastructure":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Talent & People":
        return "bg-orange-50 text-[#FF5C28] border-orange-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative w-full pb-16" id="departments-root">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#042C51] text-white px-4 py-3 rounded-xl shadow-xl border border-blue-400/30 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. TOP HEADER BANNER (WITH ORANGE ACCENT STRIPE) ==================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden border-t-4 border-t-[#FF5C28]">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                Recruitment View
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#042C51] tracking-tight">
              Department Units & Structure
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Comprehensive organization directory, head manager oversight, staffing capacity, campus floor allocations, and operating budgets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              title="Refresh Department Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#FF5C28]" : ""}`} />
            </button>

            {/* CSV Template / Export Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Template</span>
            </button>

            {/* Solid Orange Primary Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-[#FF5C28] hover:bg-[#e04b1c] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Deploy Department</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. 5 METRICS KPI CARDS (MATCHING REFERENCE THEME) ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Active Units */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              TOTAL UNITS
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#042C51] tracking-tight">
            {departments.length}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Across 3 Operating Sites
            </span>
          </div>
        </div>

        {/* Card 2: Total Staff Allocated */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              TOTAL STAFF
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">
            {totalHeadcount.toLocaleString()}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Allocated Staff Roster
            </span>
          </div>
        </div>

        {/* Card 3: Max Seat Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              MAX CAPACITY
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600 tracking-tight">
            {totalCapacity.toLocaleString()}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Total Campus Desks
            </span>
          </div>
        </div>

        {/* Card 4: Floor Utilization Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              UTILIZATION
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">
            {overallOccupancy}%
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Floor Utilization SLA
            </span>
          </div>
        </div>

        {/* Card 5: Annual OpEx Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-[#FF5C28] tracking-wider">
              ANNUAL OPEX
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF5C28] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#FF5C28] tracking-tight">
            $9.07M
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Total Capital Allocation
            </span>
          </div>
        </div>
      </div>

      {/* ==================== 3. MAIN DIRECTORY CONTAINER ==================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#042C51] tracking-tight">
              Department Directory & Governance
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review operational divisions, leadership hierarchy, site locations, and staffing capacity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
              Showing {filteredDepartments.length} of {departments.length} departments
            </span>
          </div>
        </div>

        {/* Filter Controls Bar matching reference theme */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-[280px]">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search department, lead, code, location floor..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#042C51] focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-[200px]">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={e => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                <option value="Core Operations">Core Operations</option>
                <option value="Technology & Infrastructure">Technology & Infrastructure</option>
                <option value="Talent & People">Talent & People</option>
                <option value="Executive & Shared">Executive & Shared</option>
              </select>
            </div>

            {/* Site / Region Filter */}
            <div className="w-[180px]">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Site Location
              </label>
              <select
                value={regionFilter}
                onChange={e => {
                  setRegionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Locations">All Sites</option>
                <option value="SiBS Tagum">SiBS Tagum</option>
                <option value="SiBS Davao">SiBS Davao</option>
                <option value="SiBS Mabini">SiBS Mabini</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="pb-0.5">
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="pb-0.5 ml-auto flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-[#042C51] shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "table" ? "bg-white text-[#042C51] shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 4. UNDERLINED TAB BAR WITH COUNTER PILLS ==================== */}
        <div className="border-b border-slate-200 px-5 pt-3 flex items-center gap-6 overflow-x-auto text-xs font-black select-none">
          {/* TAB 1: ALL DEPARTMENTS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ALL DEPARTMENTS</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "all" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.all}
            </span>
          </button>

          {/* TAB 2: CORE OPERATIONS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("core");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "core"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>CORE OPERATIONS</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "core" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.core}
            </span>
          </button>

          {/* TAB 3: TECHNOLOGY & ICT */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("tech");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "tech"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>TECHNOLOGY & ICT</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "tech" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.tech}
            </span>
          </button>

          {/* TAB 4: TALENT & PEOPLE */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("talent");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "talent"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>TALENT & PEOPLE</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "talent" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.talent}
            </span>
          </button>

          {/* TAB 5: EXECUTIVE & SHARED */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("exec");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "exec"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EXECUTIVE & SHARED</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "exec" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.exec}
            </span>
          </button>

          {/* TAB 6: SIBS TAGUM */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("tagum");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "tagum"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>SIBS TAGUM</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "tagum" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.tagum}
            </span>
          </button>

          {/* TAB 7: SIBS DAVAO */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("davao");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "davao"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>SIBS DAVAO</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "davao" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.davao}
            </span>
          </button>

          {/* TAB 8: SIBS MABINI */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("mabini");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "mabini"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>SIBS MABINI</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "mabini" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.mabini}
            </span>
          </button>
        </div>

        {/* ==================== 5. CONTENT: GRID OR TABLE ==================== */}
        {filteredDepartments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Inbox className="w-10 h-10 text-slate-300" />
              <p className="font-extrabold text-sm text-slate-600">
                No department units found matching your search or filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#042C51] text-xs font-bold rounded-lg cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedDepartments.map((dept) => {
              const occupancyPct = Math.round((dept.headcount / dept.maxCapacity) * 100);

              return (
                <motion.div
                  key={dept.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#FF5C28]/40 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                  onClick={() => setSelectedDept(dept)}
                >
                  <div className="p-5 space-y-3.5">
                    {/* Top Row: Code & Category Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                          {dept.id} • {dept.code}
                        </span>
                        <h3 className="text-base font-black text-[#FF5C28] group-hover:text-[#e04b1c] transition-colors leading-tight mt-0.5">
                          {dept.name}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${getCategoryBadgeClass(dept.category)}`}>
                        {dept.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>

                    {/* Department Head Block */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#042C51] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {dept.head.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider">Department Lead</div>
                        <div className="text-xs font-black text-[#042C51] truncate">{dept.head}</div>
                        <div className="text-[10.5px] text-slate-500 truncate">{dept.headRole}</div>
                      </div>
                    </div>

                    {/* Floor Location Badge */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                        <span className="truncate text-xs font-medium">{dept.location}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {dept.siteRegion}
                      </span>
                    </div>

                    {/* Headcount Capacity Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#042C51]" /> Staff Capacity
                        </span>
                        <span className="font-mono font-extrabold text-[#042C51]">
                          {dept.headcount} / {dept.maxCapacity} <span className="text-slate-400 font-normal">({occupancyPct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPct > 90 ? "bg-amber-500" : "bg-[#FF5C28]"
                          }`}
                          style={{ width: `${Math.min(100, occupancyPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Programs Tags */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {dept.keyPrograms.slice(0, 2).map((prog, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[150px]">
                            {prog}
                          </span>
                        ))}
                        {dept.keyPrograms.length > 2 && (
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200">
                            +{dept.keyPrograms.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Strip */}
                  <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-1 text-emerald-700 font-extrabold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{dept.budget} Budget</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDept(dept);
                      }}
                      className="text-[#042C51] hover:text-[#FF5C28] flex items-center gap-1 transition-colors cursor-pointer text-xs font-bold"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 select-none">
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    CODE & DEPARTMENT
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    CATEGORY
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    DEPARTMENT LEAD & CONTACT
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    LOCATION & SITE
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    STAFFING / CAPACITY
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    ANNUAL OPEX
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px] text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                {paginatedDepartments.map((dept) => {
                  const occupancyPct = Math.round((dept.headcount / dept.maxCapacity) * 100);

                  return (
                    <tr
                      key={dept.id}
                      onClick={() => setSelectedDept(dept)}
                      className="hover:bg-slate-50/75 transition-colors group cursor-pointer"
                    >
                      {/* CODE & DEPARTMENT */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-black text-[#FF5C28] uppercase text-xs tracking-tight group-hover:text-[#e04b1c] transition-colors">
                            {dept.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">
                            {dept.id} • {dept.code}
                          </p>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(dept.category)}`}>
                          {dept.category}
                        </span>
                      </td>

                      {/* DEPARTMENT LEAD & CONTACT */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-[#042C51]">
                            <User className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                            <span>{dept.head}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {dept.headEmail}
                          </div>
                        </div>
                      </td>

                      {/* LOCATION & SITE */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                            <span>{dept.location}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 inline-block">
                            {dept.siteRegion}
                          </span>
                        </div>
                      </td>

                      {/* STAFFING / CAPACITY */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-slate-800 text-xs">
                            {dept.headcount.toLocaleString()} / {dept.maxCapacity.toLocaleString()}{" "}
                            <span className="text-[10px] text-slate-400 font-normal">({occupancyPct}%)</span>
                          </div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${occupancyPct > 90 ? "bg-amber-500" : "bg-[#FF5C28]"}`}
                              style={{ width: `${Math.min(100, occupancyPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* ANNUAL OPEX */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="font-black text-emerald-700 text-xs">
                          {dept.budget}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td
                        className="py-3.5 px-5 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDept(dept)}
                            className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            onClick={() => setSelectedDept(dept)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#042C51] hover:text-white text-[#042C51] rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== 6. FOOTER PAGINATION ==================== */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p className="font-medium">
            Showing <strong className="text-slate-800">{paginatedDepartments.length}</strong> loaded department units out of{" "}
            <strong className="text-slate-800">{filteredDepartments.length}</strong>
          </p>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Current Page Pill (Solid Orange Pill matching reference theme) */}
            <span className="w-8 h-8 rounded-lg bg-[#FF5C28] text-white font-black text-xs flex items-center justify-center shadow-xs">
              {currentPage}
            </span>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 7. DEPARTMENT DETAIL MODAL ==================== */}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              {/* Modal Header */}
              <div className="bg-[#042C51] text-white p-6 flex items-start justify-between gap-4 border-b-4 border-b-[#FF5C28]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FF5C28] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                      {selectedDept.code}
                    </span>
                    <span className="text-slate-300 text-xs font-semibold">{selectedDept.category}</span>
                  </div>
                  <h2 className="text-xl font-black text-white">{selectedDept.name}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedDept.description}</p>
                </div>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Manager & Contact */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#042C51] text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {selectedDept.head.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-slate-400">Head Manager</div>
                      <div className="text-sm font-black text-[#042C51]">{selectedDept.head}</div>
                      <div className="text-xs text-slate-500">{selectedDept.headRole}</div>
                      <div className="text-[11px] text-[#FF5C28] font-semibold mt-0.5">{selectedDept.headEmail}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full inline-block mt-1">
                      {selectedDept.status}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-3.5 text-center">
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Allocated Staff</span>
                    <div className="text-lg font-black text-[#042C51] mt-1">{selectedDept.headcount} Members</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Max Capacity</span>
                    <div className="text-lg font-black text-slate-700 mt-1">{selectedDept.maxCapacity} Seats</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-emerald-700">Annual Budget</span>
                    <div className="text-lg font-black text-emerald-800 mt-1">{selectedDept.budget}</div>
                  </div>
                </div>

                {/* Location Floor Detail */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#042C51] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#FF5C28]" />
                    <span>Office Location & Facility Allocation</span>
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-[#042C51]">{selectedDept.location}</div>
                      <div className="text-[11px] text-slate-500">Site Region: {selectedDept.siteRegion}</div>
                    </div>
                    {onSwitchModule && (
                      <button
                        onClick={() => {
                          setSelectedDept(null);
                          onSwitchModule("Office Locations");
                        }}
                        className="text-xs text-[#FF5C28] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Office Location</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Key Programs */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#042C51] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#042C51]" />
                    <span>Active Programs & Sub-Teams ({selectedDept.subTeamsCount} Units)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDept.keyPrograms.map((prog, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{prog}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-4 flex items-center justify-between border-t border-slate-200">
                <button
                  onClick={() => {
                    showToast(`Auditing report generated for ${selectedDept.name}`);
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-[#042C51]"
                >
                  Export Audit PDF
                </button>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="bg-[#042C51] hover:bg-[#031e38] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Close Directory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 8. DEPLOY DEPARTMENT MODAL ==================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              <div className="bg-[#042C51] text-white p-5 flex items-center justify-between border-b-4 border-b-[#FF5C28]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="font-black text-sm text-white">Deploy New Department Unit</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDepartment} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#042C51] block">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Customer Care & Analytics"
                    value={newDeptForm.name}
                    onChange={e => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Category</label>
                    <select
                      value={newDeptForm.category}
                      onChange={e => setNewDeptForm({ ...newDeptForm, category: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#042C51] focus:outline-none"
                    >
                      <option value="Core Operations">Core Operations</option>
                      <option value="Healthcare & Compliance">Healthcare & Compliance</option>
                      <option value="Technology & Infrastructure">Technology & Infrastructure</option>
                      <option value="Talent & People">Talent & People</option>
                      <option value="Executive & Shared">Executive & Shared</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. AIC-DIV"
                      value={newDeptForm.code}
                      onChange={e => setNewDeptForm({ ...newDeptForm, code: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Head Lead Manager *</label>
                    <input
                      type="text"
                      required
                      placeholder="Manager Name"
                      value={newDeptForm.head}
                      onChange={e => setNewDeptForm({ ...newDeptForm, head: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Lead Email</label>
                    <input
                      type="email"
                      placeholder="email@thesiblingssolutions.com"
                      value={newDeptForm.headEmail}
                      onChange={e => setNewDeptForm({ ...newDeptForm, headEmail: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Headcount</label>
                    <input
                      type="number"
                      value={newDeptForm.headcount}
                      onChange={e => setNewDeptForm({ ...newDeptForm, headcount: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Max Capacity</label>
                    <input
                      type="number"
                      value={newDeptForm.maxCapacity}
                      onChange={e => setNewDeptForm({ ...newDeptForm, maxCapacity: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Budget</label>
                    <input
                      type="text"
                      placeholder="$600K"
                      value={newDeptForm.budget}
                      onChange={e => setNewDeptForm({ ...newDeptForm, budget: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Location Floor</label>
                    <input
                      type="text"
                      placeholder="Building 2, Floor 3"
                      value={newDeptForm.location}
                      onChange={e => setNewDeptForm({ ...newDeptForm, location: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Site Region</label>
                    <select
                      value={newDeptForm.siteRegion}
                      onChange={e => setNewDeptForm({ ...newDeptForm, siteRegion: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#042C51] focus:outline-none"
                    >
                      <option value="SiBS Tagum">SiBS Tagum</option>
                      <option value="SiBS Davao">SiBS Davao</option>
                      <option value="SiBS Mabini">SiBS Mabini</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#042C51] block">Key Programs (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Inbound Voice, QA Analytics, Escalations"
                    value={newDeptForm.keyProgramsText}
                    onChange={e => setNewDeptForm({ ...newDeptForm, keyProgramsText: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FF5C28] hover:bg-[#e04b1c] text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Deploy Department
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
