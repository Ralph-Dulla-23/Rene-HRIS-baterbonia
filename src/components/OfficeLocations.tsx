import React, { useState, useMemo } from "react";
import {
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Plus,
  Search,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Wifi,
  Coffee,
  Clock,
  Layers,
  X,
  Compass,
  Building,
  Navigation,
  Globe,
  Award,
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  LayoutGrid,
  List,
  Eye,
  Inbox,
  UserCheck,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface OfficeSite {
  id: string;
  name: string;
  code: string;
  region: "Mindanao" | "Luzon" | "Visayas";
  city: string;
  address: string;
  director: string;
  directorTitle: string;
  directorEmail: string;
  capacity: number;
  occupied: number;
  floors: string;
  status: "24/7 Active Operations" | "Executive Site" | "Expansion Site";
  departmentsHoused: string[];
  facilities: string[];
  contactPhone: string;
  description: string;
}

const INITIAL_SITES: OfficeSite[] = [
  {
    id: "SITE-001",
    name: "SiBS Tagum (Main HQ & Site 1)",
    code: "SIBS-TGM",
    region: "Mindanao",
    city: "Tagum City",
    address: "National Highway, Visayan Village, Tagum City, Davao del Norte, 8100 Philippines",
    director: "Mark Gregory Sarmiento",
    directorTitle: "Site Director & VP Operations - SiBS Tagum HQ",
    directorEmail: "mark.sarmiento@thesiblingssolutions.com",
    capacity: 2000,
    occupied: 1750,
    floors: "Commercial Towers A & B (Floors 1 to 6)",
    status: "24/7 Active Operations",
    departmentsHoused: [
      "Call Center Operations",
      "Human Resource",
      "Finance & Accounting",
      "Workforce Management",
      "Talent Acquisition",
      "Management Team",
      "Facility Management"
    ],
    facilities: [
      "Global Command Center",
      "Executive Boardrooms",
      "PCI-DSS Security Floor",
      "24/7 Security & Lounge",
      "Recruitment & Onboarding Hub",
      "Lactation & Wellness Room",
      "Dual Redundant Fiber Lines"
    ],
    contactPhone: "+63 (084) 216-3300",
    description: "SiBS Main Corporate Headquarters located in Tagum City, housing executive governance, global call center operations, financial services, and workforce command center."
  },
  {
    id: "SITE-002",
    name: "SiBS Davao (Operations Center & Site 2)",
    code: "SIBS-DVO",
    region: "Mindanao",
    city: "Davao City",
    address: "JP Laurel Ave, Bajada, Davao City, 8000 Philippines",
    director: "Alena Mendoza Batacan",
    directorTitle: "Regional Site Director - SiBS Davao Center",
    directorEmail: "alena.batacan@thesiblingssolutions.com",
    capacity: 1500,
    occupied: 1320,
    floors: "Buildings 1 & 2 (Floors 1 to 4)",
    status: "24/7 Active Operations",
    departmentsHoused: [
      "IT (Information and Communications Technology)",
      "Quality Assurance Management",
      "Call Center Operations",
      "Talent Acquisition"
    ],
    facilities: [
      "24/7 Enterprise NOC",
      "24/7 Cafeteria & Lounge",
      "Biometric Access Control",
      "Medical Clinic & First Aid",
      "Sleeping Quarters",
      "Dual Fiber Redundancy",
      "Generator Power Backup"
    ],
    contactPhone: "+63 (082) 298-4400",
    description: "SiBS primary regional customer delivery and technical support center in Davao City servicing key enterprise telecom and high-volume e-commerce clients."
  },
  {
    id: "SITE-003",
    name: "SiBS Mabini (Development Center & Site 3)",
    code: "SIBS-MBN",
    region: "Mindanao",
    city: "Municipality of Mabini",
    address: "Poblacion, Municipality of Mabini, Davao de Oro, Mindanao, 8807 Philippines",
    director: "Dex Chauncey Ybañez",
    directorTitle: "Regional Expansion & Community Hub Lead",
    directorEmail: "dex.ybanez@thesiblingssolutions.com",
    capacity: 650,
    occupied: 420,
    floors: "Innovation Complex, Ground & 2nd Floor",
    status: "Expansion Site",
    departmentsHoused: [
      "Training Management",
      "Process Excellence Management",
      "Talent Sourcing Incubator"
    ],
    facilities: [
      "Solar Auxiliary Power Backup",
      "Training Ramp & Nesting Labs",
      "Free Community Employee Shuttle",
      "High-Speed Satellite & Fiber",
      "Outdoor Recreational Terrace"
    ],
    contactPhone: "+63 (084) 810-5500",
    description: "SiBS specialized development and community talent expansion campus in the Municipality of Mabini, pioneering rural BPO career advancement."
  }
];

interface OfficeLocationsProps {
  onSwitchModule?: (moduleKey: string) => void;
}

export default function OfficeLocations({ onSwitchModule }: OfficeLocationsProps) {
  const [sites, setSites] = useState<OfficeSite[]>(INITIAL_SITES);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("All Regions");
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedSite, setSelectedSite] = useState<OfficeSite | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "grid" ? 4 : 6;

  // New Site Form
  const [newSiteForm, setNewSiteForm] = useState({
    name: "",
    code: "",
    region: "Mindanao" as OfficeSite["region"],
    city: "",
    address: "",
    director: "",
    directorTitle: "Site Operations Lead",
    directorEmail: "",
    capacity: 500,
    floors: "Building 1, Floor 2",
    contactPhone: "+63 (082) 500-0000",
    status: "Expansion Site" as OfficeSite["status"],
    facilitiesText: "24/7 Security, Biometric Access, Dual Redundant Fiber, First Aid Clinic",
    description: ""
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setRegionFilter("All Regions");
    setStatusFilter("All Statuses");
    setActiveTab("all");
    setCurrentPage(1);
    showToast("Filters reset.");
  };

  // Refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Campus capacity and active seat roster synchronized.");
    }, 600);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Site ID",
      "Code",
      "Campus Name",
      "Region",
      "City",
      "Address",
      "Site Director",
      "Director Email",
      "Contact Phone",
      "Capacity",
      "Occupied",
      "Occupancy Pct",
      "Allocated Floors",
      "Status"
    ];
    const rows = filteredSites.map(s => [
      s.id,
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.region}"`,
      `"${s.city}"`,
      `"${s.address}"`,
      `"${s.director}"`,
      `"${s.directorEmail}"`,
      `"${s.contactPhone}"`,
      s.capacity,
      s.occupied,
      `${Math.round((s.occupied / s.capacity) * 100)}%`,
      `"${s.floors}"`,
      `"${s.status}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SiBS_Office_Locations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredSites.length} office campus records to CSV.`);
  };

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: sites.length,
      tagum: sites.filter(s => s.name.toLowerCase().includes("tagum") || s.city.toLowerCase().includes("tagum")).length,
      davao: sites.filter(s => s.name.toLowerCase().includes("davao") || s.city.toLowerCase().includes("davao")).length,
      mabini: sites.filter(s => s.name.toLowerCase().includes("mabini") || s.city.toLowerCase().includes("mabini")).length,
      active: sites.filter(s => s.status === "24/7 Active Operations").length,
      expansion: sites.filter(s => s.status === "Expansion Site").length
    };
  }, [sites]);

  // Overall Campus Stats
  const totalCapacity = useMemo(() => sites.reduce((acc, s) => acc + s.capacity, 0), [sites]);
  const totalOccupied = useMemo(() => sites.reduce((acc, s) => acc + s.occupied, 0), [sites]);
  const overallOccupancy = Math.round((totalOccupied / totalCapacity) * 100);

  // Filtered Sites
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      // Tab filter
      if (activeTab === "tagum" && !site.name.toLowerCase().includes("tagum") && !site.city.toLowerCase().includes("tagum")) return false;
      if (activeTab === "davao" && !site.name.toLowerCase().includes("davao") && !site.city.toLowerCase().includes("davao")) return false;
      if (activeTab === "mabini" && !site.name.toLowerCase().includes("mabini") && !site.city.toLowerCase().includes("mabini")) return false;
      if (activeTab === "active" && site.status !== "24/7 Active Operations") return false;
      if (activeTab === "expansion" && site.status !== "Expansion Site") return false;

      // Search keyword
      const matchSearch =
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.id.toLowerCase().includes(searchTerm.toLowerCase());
      if (searchTerm.trim() && !matchSearch) return false;

      // Dropdown Region
      if (regionFilter !== "All Regions" && site.region !== regionFilter) {
        return false;
      }

      // Dropdown Status
      if (statusFilter !== "All Statuses" && site.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [sites, activeTab, searchTerm, regionFilter, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSites.length / itemsPerPage));
  const paginatedSites = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSites.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSites, currentPage, itemsPerPage]);

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteForm.name || !newSiteForm.city) {
      showToast("Please provide Campus Name and City.");
      return;
    }

    const newSite: OfficeSite = {
      id: `SITE-00${sites.length + 1}`,
      name: newSiteForm.name,
      code: newSiteForm.code || `${newSiteForm.city.slice(0, 3).toUpperCase()}-HUB`,
      region: newSiteForm.region,
      city: newSiteForm.city,
      address: newSiteForm.address || `${newSiteForm.city}, Philippines`,
      director: newSiteForm.director || "Site Operations Lead",
      directorTitle: newSiteForm.directorTitle || "Site Operations Director",
      directorEmail: newSiteForm.directorEmail || "site.lead@thesiblingssolutions.com",
      capacity: Number(newSiteForm.capacity),
      occupied: Math.round(Number(newSiteForm.capacity) * 0.65),
      floors: newSiteForm.floors,
      status: newSiteForm.status,
      departmentsHoused: ["Call Center Operations", "Facilities Management", "Talent Acquisition"],
      facilities: newSiteForm.facilitiesText
        ? newSiteForm.facilitiesText.split(",").map(f => f.trim())
        : ["24/7 Security", "Biometric Access", "High-Speed Fiber", "First Aid Clinic"],
      contactPhone: newSiteForm.contactPhone,
      description: newSiteForm.description || "Newly established corporate operational site facility."
    };

    setSites([newSite, ...sites]);
    setIsAddModalOpen(false);
    showToast(`Site "${newSite.name}" registered successfully!`);

    setNewSiteForm({
      name: "",
      code: "",
      region: "Mindanao",
      city: "",
      address: "",
      director: "",
      directorTitle: "Site Operations Lead",
      directorEmail: "",
      capacity: 500,
      floors: "Building 1, Floor 2",
      contactPhone: "+63 (082) 500-0000",
      status: "Expansion Site",
      facilitiesText: "24/7 Security, Biometric Access, Dual Redundant Fiber, First Aid Clinic",
      description: ""
    });
  };

  const getStatusBadge = (status: OfficeSite["status"]) => {
    switch (status) {
      case "24/7 Active Operations":
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            24/7 Active Operations
          </span>
        );
      case "Executive Site":
        return (
          <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
            <Award className="w-3 h-3 text-purple-600" />
            Executive Site
          </span>
        );
      case "Expansion Site":
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Expansion Site
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative w-full pb-16" id="office-locations-root">
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
              Office Locations & Campuses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Enterprise delivery network across SiBS Tagum HQ, SiBS Davao Operations Center, and SiBS Mabini Development Center.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              title="Refresh Campus Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#FF5C28]" : ""}`} />
            </button>

            {/* CSV Export / Template Button */}
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
              <span>Register Office Site</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. 5 METRICS KPI CARDS (MATCHING REFERENCE THEME) ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Sites */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              TOTAL SITES
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#042C51] tracking-tight">
            {sites.length}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Tagum, Davao & Mabini
            </span>
          </div>
        </div>

        {/* Card 2: Total Workstations Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              TOTAL CAPACITY
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
              Campus Desk Inventory
            </span>
          </div>
        </div>

        {/* Card 3: Active Occupancy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              ACTIVE SEATS
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">
            {totalOccupied.toLocaleString()}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Staff Occupying Desks
            </span>
          </div>
        </div>

        {/* Card 4: Seat Utilization */}
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
              Seat Occupancy Rate
            </span>
          </div>
        </div>

        {/* Card 5: 24/7 Active Hubs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-[#FF5C28] tracking-wider">
              24/7 ACTIVE HUBS
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF5C28] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#FF5C28] tracking-tight">
            {counts.active} Sites
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Continuous Shift Delivery
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
              Corporate Campuses & Facilities Directory
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review campus blueprints, infrastructure security, floor allocations, and on-site leadership contacts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
              Showing {filteredSites.length} of {sites.length} campuses
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
                  placeholder="Search campus, city, code, director, address..."
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

            {/* Region Filter */}
            <div className="w-[190px]">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Region
              </label>
              <select
                value={regionFilter}
                onChange={e => {
                  setRegionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Regions">All Regions</option>
                <option value="Mindanao">Mindanao Region</option>
                <option value="Visayas">Visayas Region</option>
                <option value="Luzon">Luzon Region</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-[200px]">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Operational Status
              </label>
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="24/7 Active Operations">24/7 Active Operations</option>
                <option value="Executive Site">Executive Site</option>
                <option value="Expansion Site">Expansion Site</option>
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
          {/* TAB 1: ALL SITES */}
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
            <span>ALL SITES</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "all" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.all}
            </span>
          </button>

          {/* TAB 2: SIBS TAGUM HQ */}
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
            <Building className="w-3.5 h-3.5" />
            <span>SIBS TAGUM HQ</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "tagum" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.tagum}
            </span>
          </button>

          {/* TAB 3: SIBS DAVAO */}
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
            <Compass className="w-3.5 h-3.5" />
            <span>SIBS DAVAO</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "davao" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.davao}
            </span>
          </button>

          {/* TAB 4: SIBS MABINI */}
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

          {/* TAB 5: 24/7 ACTIVE HUBS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("active");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "active"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>24/7 ACTIVE</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "active" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.active}
            </span>
          </button>

          {/* TAB 6: EXPANSION SITES */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("expansion");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "expansion"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>EXPANSION SITES</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "expansion" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.expansion}
            </span>
          </button>
        </div>

        {/* ==================== 5. CONTENT: GRID OR TABLE ==================== */}
        {filteredSites.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Inbox className="w-10 h-10 text-slate-300" />
              <p className="font-extrabold text-sm text-slate-600">
                No office campuses found matching your search or filter criteria.
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
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {paginatedSites.map((site) => {
              const occPct = Math.round((site.occupied / site.capacity) * 100);

              return (
                <motion.div
                  key={site.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#FF5C28]/40 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                  onClick={() => setSelectedSite(site)}
                >
                  <div className="p-5 space-y-3.5">
                    {/* Top Row: Code & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                            {site.id} • {site.code}
                          </span>
                          <span className="bg-slate-100 text-[#042C51] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
                            {site.region} Region
                          </span>
                        </div>
                        <h3 className="text-base font-black text-[#FF5C28] group-hover:text-[#e04b1c] transition-colors leading-tight mt-0.5">
                          {site.name}
                        </h3>
                      </div>
                      <div>{getStatusBadge(site.status)}</div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {site.description}
                    </p>

                    {/* Address & Floor Allocation Block */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
                      <div className="flex items-start gap-2 text-slate-700 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5C28] shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-800">{site.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium pl-5">
                        <Layers className="w-3.5 h-3.5 text-[#042C51]" />
                        <span>Allocated Floors: <strong className="text-slate-700">{site.floors}</strong></span>
                      </div>
                    </div>

                    {/* Site Director Block */}
                    <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#042C51] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {site.director.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider">Site Director</div>
                          <div className="text-xs font-black text-[#042C51] truncate">{site.director}</div>
                          <div className="text-[10.5px] text-slate-500 truncate">{site.directorTitle}</div>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-500 font-medium shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Phone className="w-3 h-3 text-[#FF5C28]" />
                          <span className="font-mono text-[10.5px]">{site.contactPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Seat Capacity Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#042C51]" /> Workstation Capacity
                        </span>
                        <span className="font-mono font-extrabold text-[#042C51]">
                          {site.occupied.toLocaleString()} / {site.capacity.toLocaleString()} Seats{" "}
                          <span className="text-slate-400 font-normal">({occPct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occPct > 88 ? "bg-amber-500" : "bg-[#FF5C28]"
                          }`}
                          style={{ width: `${Math.min(100, occPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Facilities Tags */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {site.facilities.slice(0, 3).map((fac, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[170px] flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>{fac}</span>
                          </span>
                        ))}
                        {site.facilities.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200">
                            +{site.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Strip */}
                  <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
                    <div className="text-[11px] text-slate-500 font-medium">
                      Housed: <strong className="text-[#042C51]">{site.departmentsHoused.length} Departments</strong>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSite(site);
                      }}
                      className="text-[#042C51] hover:text-[#FF5C28] flex items-center gap-1 transition-colors cursor-pointer text-xs font-bold"
                    >
                      <span>View Blueprint & Teams</span>
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
                    CODE & CAMPUS NAME
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    REGION & CITY
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    SITE DIRECTOR & CONTACT
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    FLOORS & WINGS
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    WORKSTATIONS / CAPACITY
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                    STATUS
                  </th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px] text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                {paginatedSites.map((site) => {
                  const occPct = Math.round((site.occupied / site.capacity) * 100);

                  return (
                    <tr
                      key={site.id}
                      onClick={() => setSelectedSite(site)}
                      className="hover:bg-slate-50/75 transition-colors group cursor-pointer"
                    >
                      {/* CODE & CAMPUS */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-black text-[#FF5C28] uppercase text-xs tracking-tight group-hover:text-[#e04b1c] transition-colors">
                            {site.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">
                            {site.id} • {site.code}
                          </p>
                        </div>
                      </td>

                      {/* REGION & CITY */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">{site.city}</span>
                          <span className="text-[10.5px] text-slate-400 font-medium">{site.region} Region</span>
                        </div>
                      </td>

                      {/* DIRECTOR */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#042C51] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                            {site.director.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{site.director}</p>
                            <p className="text-[10.5px] text-slate-400 font-mono">{site.contactPhone}</p>
                          </div>
                        </div>
                      </td>

                      {/* FLOORS */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-xs truncate max-w-[180px]">{site.floors}</span>
                        </div>
                      </td>

                      {/* CAPACITY & PROGRESS */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-1 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800 font-mono">
                              {site.occupied.toLocaleString()} / {site.capacity.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                              {occPct}%
                            </span>
                          </div>
                          <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                occPct > 88 ? "bg-amber-500" : "bg-[#FF5C28]"
                              }`}
                              style={{ width: `${Math.min(100, occPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getStatusBadge(site.status)}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSite(site);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#042C51] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Blueprint"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSite(site);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#042C51] text-slate-700 hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Blueprint
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
        <div className="px-6 py-4 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800 font-bold">{filteredSites.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
            <strong className="text-slate-800 font-bold">{Math.min(currentPage * itemsPerPage, filteredSites.length)}</strong> of{" "}
            <strong className="text-slate-800 font-bold">{filteredSites.length}</strong> campuses
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  currentPage === page
                    ? "bg-[#FF5C28] text-white shadow-2xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 7. CAMPUS BLUEPRINT & TEAMS MODAL ==================== */}
      <AnimatePresence>
        {selectedSite && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              {/* Modal Navy Header with Orange Stripe */}
              <div className="bg-[#042C51] text-white p-6 border-b-4 border-b-[#FF5C28] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FF5C28] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                      {selectedSite.code}
                    </span>
                    <span className="text-slate-300 text-xs font-semibold">{selectedSite.region} Region</span>
                    <span className="text-emerald-400 text-xs font-bold">• {selectedSite.status}</span>
                  </div>
                  <h2 className="text-xl font-black text-white">{selectedSite.name}</h2>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5C28] shrink-0" />
                    <span>{selectedSite.address}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs">
                {/* Director Header Card */}
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#042C51] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {selectedSite.director.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Campus Director</div>
                      <div className="text-sm font-extrabold text-[#042C51]">{selectedSite.director}</div>
                      <div className="text-slate-500 font-medium">{selectedSite.directorTitle}</div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <span className="text-[11px] font-bold text-[#FF5C28] block">{selectedSite.directorEmail}</span>
                    <span className="text-slate-600 font-mono text-xs">{selectedSite.contactPhone}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Total Workstations</span>
                    <div className="text-lg font-black text-[#042C51] mt-1">{selectedSite.capacity.toLocaleString()} Seats</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase text-emerald-700">Active Occupancy</span>
                    <div className="text-lg font-black text-emerald-800 mt-1">{selectedSite.occupied.toLocaleString()} Active</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200/80 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase text-blue-700">Occupancy SLA</span>
                    <div className="text-lg font-black text-blue-800 mt-1">
                      {Math.round((selectedSite.occupied / selectedSite.capacity) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Allocated Floors */}
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Building Wings & Floors</div>
                    <div className="text-xs font-bold text-slate-800">{selectedSite.floors}</div>
                  </div>
                </div>

                {/* Departments Housed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#042C51] flex items-center gap-1.5 text-xs">
                      <Building2 className="w-4 h-4 text-[#FF5C28]" />
                      <span>Housed Department Divisions ({selectedSite.departmentsHoused.length})</span>
                    </h4>
                    {onSwitchModule && (
                      <button
                        onClick={() => {
                          setSelectedSite(null);
                          onSwitchModule("Departments");
                        }}
                        className="text-[11px] text-[#FF5C28] hover:underline font-bold cursor-pointer"
                      >
                        View in Departments Module →
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSite.departmentsHoused.map((deptName, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl font-bold text-slate-800 flex items-center justify-between"
                      >
                        <span className="truncate">{deptName}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus Facilities & Amenities */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#042C51] flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Campus Infrastructure, Security & Amenities</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSite.facilities.map((fac, i) => (
                      <div
                        key={i}
                        className="bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl text-emerald-900 font-semibold flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                {onSwitchModule && (
                  <button
                    onClick={() => {
                      setSelectedSite(null);
                      onSwitchModule("Departments");
                    }}
                    className="text-xs text-[#042C51] font-bold hover:underline cursor-pointer"
                  >
                    Switch to Departments Structure
                  </button>
                )}
                <button
                  onClick={() => setSelectedSite(null)}
                  className="bg-[#042C51] hover:bg-[#031e38] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer ml-auto"
                >
                  Close Site Blueprint
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 8. REGISTER NEW SITE MODAL ==================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              <div className="bg-[#042C51] text-white p-5 border-b-4 border-b-[#FF5C28] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF5C28]" />
                  <h3 className="font-black text-sm text-white">Register New Office Location Site</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSite} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#042C51] block">Campus / Site Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SiBS Iloilo Tech Hub"
                    value={newSiteForm.name}
                    onChange={e => setNewSiteForm({ ...newSiteForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Region *</label>
                    <select
                      value={newSiteForm.region}
                      onChange={e => setNewSiteForm({ ...newSiteForm, region: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#042C51] focus:outline-none cursor-pointer"
                    >
                      <option value="Mindanao">Mindanao</option>
                      <option value="Visayas">Visayas</option>
                      <option value="Luzon">Luzon</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Iloilo City"
                      value={newSiteForm.city}
                      onChange={e => setNewSiteForm({ ...newSiteForm, city: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Campus Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SIBS-ILO"
                      value={newSiteForm.code}
                      onChange={e => setNewSiteForm({ ...newSiteForm, code: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Operational Status</label>
                    <select
                      value={newSiteForm.status}
                      onChange={e => setNewSiteForm({ ...newSiteForm, status: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#042C51] focus:outline-none cursor-pointer"
                    >
                      <option value="Expansion Site">Expansion Site</option>
                      <option value="24/7 Active Operations">24/7 Active Operations</option>
                      <option value="Executive Site">Executive Site</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#042C51] block">Street Address</label>
                  <input
                    type="text"
                    placeholder="Full street address & building name"
                    value={newSiteForm.address}
                    onChange={e => setNewSiteForm({ ...newSiteForm, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Site Director</label>
                    <input
                      type="text"
                      placeholder="Director Name"
                      value={newSiteForm.director}
                      onChange={e => setNewSiteForm({ ...newSiteForm, director: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Director Email</label>
                    <input
                      type="email"
                      placeholder="director@thesiblingssolutions.com"
                      value={newSiteForm.directorEmail}
                      onChange={e => setNewSiteForm({ ...newSiteForm, directorEmail: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Workstation Capacity</label>
                    <input
                      type="number"
                      value={newSiteForm.capacity}
                      onChange={e => setNewSiteForm({ ...newSiteForm, capacity: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:bg-white focus:border-[#042C51]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#042C51] block">Floors / Wings</label>
                    <input
                      type="text"
                      placeholder="e.g. Tower B, Floors 3-4"
                      value={newSiteForm.floors}
                      onChange={e => setNewSiteForm({ ...newSiteForm, floors: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#042C51] block">Facilities & Security (comma separated)</label>
                  <input
                    type="text"
                    placeholder="24/7 Security, Biometric Access, Dual Redundant Fiber, First Aid Clinic"
                    value={newSiteForm.facilitiesText}
                    onChange={e => setNewSiteForm({ ...newSiteForm, facilitiesText: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#042C51] block">Campus Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of this operational campus facility..."
                    value={newSiteForm.description}
                    onChange={e => setNewSiteForm({ ...newSiteForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FF5C28] hover:bg-[#e04b1c] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Register Site
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
