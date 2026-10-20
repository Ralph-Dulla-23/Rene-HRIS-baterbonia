import React, { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Layers,
  Palette,
  Type,
  LayoutGrid,
  CheckCircle,
  Search,
  ExternalLink,
  Shield,
  Eye,
  Sliders,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  Info,
  Calendar,
  Users,
  Briefcase,
  GitFork,
  ArrowRight,
  Copy,
  Check,
  Figma
} from "lucide-react";
import { generateFigmaCanvasSvg, downloadFile } from "../utils/figmaExporter";
import {
  generateFullDesignSystemPdf,
  SYSTEM_SCREENS,
  DESIGN_TOKENS,
  ScreenSpec
} from "../utils/frontendDesignPdfGenerator";
import { printPageToPdf } from "../utils/pdfExport";

interface FrontendDesignPdfViewProps {
  onSwitchModule?: (moduleKey: string) => void;
  onClose?: () => void;
}

export default function FrontendDesignPdfView({ onSwitchModule, onClose }: FrontendDesignPdfViewProps) {
  const [activeTab, setActiveTab] = useState<"screens" | "tokens" | "components" | "architecture">("screens");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedScreen, setSelectedScreen] = useState<ScreenSpec | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const categories = [
    "All",
    "Core HR & Dashboards",
    "Workforce Planning",
    "Recruitment Pipeline",
    "Operations & Governance",
    "Portals & Public Forms"
  ];

  const filteredScreens = useMemo(() => {
    return SYSTEM_SCREENS.filter(screen => {
      const matchesCategory = selectedCategory === "All" || screen.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        screen.title.toLowerCase().includes(q) ||
        screen.subtitle.toLowerCase().includes(q) ||
        screen.personas.some(p => p.toLowerCase().includes(q)) ||
        screen.keyFeatures.some(f => f.toLowerCase().includes(q)) ||
        screen.components.some(c => c.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleDownloadVectorPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateFullDesignSystemPdf();
    } catch (err) {
      console.error("Error generating vector PDF:", err);
    } finally {
      setTimeout(() => {
        setIsGeneratingPdf(false);
      }, 800);
    }
  };

  const handlePrintVisualPdf = () => {
    printPageToPdf("SiBS_HRIS_Full_Frontend_Design_Specbook");
  };

  const handleCopyColor = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => {
      setCopiedToken(null);
    }, 2000);
  };

  const getModuleKeyFromScreenId = (id: string): string => {
    switch (id) {
      case "super-admin-dashboard": return "Super Admin Dashboard";
      case "hr-admin-dashboard": return "HR Admin Dashboard";
      case "ta-dashboard": return "TA Dashboard";
      case "om-dashboard": return "OM Dashboard";
      case "employee-dashboard": return "Employee Dashboard";
      case "employee-directory": return "Employee Directory";
      case "time-attendance": return "Time & Attendance";
      case "leaves-management": return "Leaves & Time Off";
      case "resignation-management": return "Resignation Management";
      case "workforce-hiring": return "Workforce Hiring";
      case "job-descriptions": return "Job Description";
      case "hiring-needs-intake": return "Hiring Needs Intake";
      case "available-positions": return "Available Positions";
      case "applicant-leads": return "Applicant Leads";
      case "talent-pool": return "Talent Pool";
      case "candidate-pipeline": return "Candidate Pipeline";
      case "offers": return "Offers";
      case "onboarding": return "Onboarding";
      case "recruitment-flowchart": return "Recruitment Flowchart";
      case "sourcing-analytics": return "Sourcing Analytics";
      case "email-logs": return "Email Logs";
      case "recruitment-settings": return "Recruitment Settings";
      case "public-application-portal": return "Public Application Form";
      case "candidate-experience-survey": return "Candidate Experience";
      default: return "Workforce Hiring";
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-[#E6EAF0] pb-16">
      {/* ==================== TOP ACTION HEADER ==================== */}
      <div className="bg-white border-b border-[#E6ECF2] shadow-xs sticky top-16 z-20 px-6 py-4">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#042C51] to-[#0B365F] text-white flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
              <FileText className="w-5 h-5 text-[#FF5C28]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#042C51] tracking-tight">
                  Frontend Design System & UI Specbook
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-[#EBF5FB] text-[#21618C] text-[10.5px] font-extrabold tracking-wide uppercase border border-[#AED6F1]">
                  PDF Specbook v2.4
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                Complete interactive catalog and exportable multi-page vector PDF of all 24+ frontend screens, design tokens, and workflows.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                const svgStr = generateFigmaCanvasSvg();
                downloadFile("sibs-hris-figma-frames.svg", svgStr, "image/svg+xml");
              }}
              className="px-4 py-2 rounded-xl bg-[#042C51] hover:bg-[#FF5C28] text-white font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              title="Download 10 Desktop Frames SVG ready to drag-and-drop into Figma"
            >
              <Figma className="w-4 h-4 text-[#FF5C28]" />
              <span>Download Figma Canvas (.SVG)</span>
            </button>

            <button
              onClick={handlePrintVisualPdf}
              className="px-4 py-2 rounded-xl bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              title="Print visual catalog with browser dialog"
            >
              <Printer className="w-4 h-4 text-[#215789]" />
              <span>Print / Visual PDF</span>
            </button>

            <button
              onClick={handleDownloadVectorPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              title="Download structured multi-page PDF specbook"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Building Vector PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Specbook (Vector PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="max-w-[1920px] mx-auto mt-4 pt-3 border-t border-[#E6ECF2] flex items-center justify-between overflow-x-auto gap-4 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("screens")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "screens"
                  ? "bg-[#042C51] text-white shadow-xs"
                  : "bg-white text-[#667085] hover:text-[#042C51] hover:bg-[#F7F9FC] border border-[#E6ECF2]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All System Screens ({SYSTEM_SCREENS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("tokens")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "tokens"
                  ? "bg-[#042C51] text-white shadow-xs"
                  : "bg-white text-[#667085] hover:text-[#042C51] hover:bg-[#F7F9FC] border border-[#E6ECF2]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design Tokens & Palette</span>
            </button>

            <button
              onClick={() => setActiveTab("components")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "components"
                  ? "bg-[#042C51] text-white shadow-xs"
                  : "bg-white text-[#667085] hover:text-[#042C51] hover:bg-[#F7F9FC] border border-[#E6ECF2]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>UI Component Library</span>
            </button>

            <button
              onClick={() => setActiveTab("architecture")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "architecture"
                  ? "bg-[#042C51] text-white shadow-xs"
                  : "bg-white text-[#667085] hover:text-[#042C51] hover:bg-[#F7F9FC] border border-[#E6ECF2]"
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Architecture & SOP Matrix</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11.5px] text-[#667085] font-semibold shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
              24 Active Screens
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FF5C28]" />
              16-Step Pipeline
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4B9DFE]" />
              Plus Jakarta Sans
            </span>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT CONTAINER ==================== */}
      <div className="max-w-[1920px] mx-auto px-6 pt-6 w-full space-y-6">

        {/* TAB 1: ALL SYSTEM SCREENS */}
        {activeTab === "screens" && (
          <div className="space-y-6">
            {/* Filter & Search Toolbar */}
            <div className="bg-white rounded-xl border border-[#E6ECF2] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#042C51] text-white shadow-xs"
                        : "bg-[#F7F9FC] text-[#667085] hover:text-[#042C51] hover:bg-[#E6EAF0]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A9C1]" />
                <input
                  type="text"
                  placeholder="Search screens, personas, features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#F7F9FC] border border-[#BECBDA] text-xs text-[#042C51] placeholder-[#94A9C1] focus:outline-none focus:border-[#FF5C28]"
                />
              </div>
            </div>

            {/* Screens Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredScreens.map((screen) => {
                const targetModule = getModuleKeyFromScreenId(screen.id);
                return (
                  <div
                    key={screen.id}
                    className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow group relative"
                  >
                    {/* Top Accent Gradient Bar */}
                    <div 
                      className="h-1.5 w-full"
                      style={{
                        background: `linear-gradient(to right, rgb(${screen.accentColor.join(",")}), #FF5C28)`
                      }}
                    />

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        {/* Category & Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28] bg-[#FFF2ED] px-2 py-0.5 rounded-md border border-[#FFD8CA]">
                            {screen.category}
                          </span>
                          <span className="text-[9.5px] font-bold text-[#667085]">
                            {screen.slaOrKpi.split(",")[0]}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-black text-[#042C51] group-hover:text-[#FF5C28] transition-colors leading-snug">
                          {screen.title}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-[11.5px] text-[#667085] leading-relaxed line-clamp-2">
                          {screen.subtitle}
                        </p>

                        {/* Personas */}
                        <div className="pt-2 border-t border-[#F1F5F9] space-y-1">
                          <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#94A9C1]">
                            Primary Actors
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {screen.personas.map((p, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-[#F7F9FC] text-[#215789] text-[10px] font-medium border border-[#E6ECF2]"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key Features */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#94A9C1]">
                            Core Capabilities
                          </span>
                          <ul className="space-y-0.5">
                            {screen.keyFeatures.slice(0, 3).map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[10.5px] text-[#334155]">
                                <CheckCircle className="w-3 h-3 text-[#2ECC71] shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-[#E6ECF2] flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedScreen(screen)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F7F9FC] hover:bg-[#E6EAF0] text-[#042C51] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-[#215789]" />
                          <span>Inspect Spec</span>
                        </button>

                        {onSwitchModule && (
                          <button
                            onClick={() => onSwitchModule(targetModule)}
                            className="px-3 py-1.5 rounded-lg bg-[#042C51] hover:bg-[#FF5C28] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <span>Launch</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DESIGN TOKENS & PALETTE */}
        {activeTab === "tokens" && (
          <div className="space-y-6">
            {/* Color Architecture */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#042C51]">1. Enterprise Color Palette Architecture</h2>
                  <p className="text-xs text-[#667085]">
                    Strict enterprise brand palette anchored by Deep Navy (#042C51) and Vivid Orange (#FF5C28) on high-contrast pale blue-gray.
                  </p>
                </div>
                {copiedToken && (
                  <span className="px-2.5 py-1 rounded-md bg-[#E8F8F0] text-[#1E8449] text-xs font-bold flex items-center gap-1 border border-[#A9DFBF]">
                    <Check className="w-3.5 h-3.5" />
                    Copied {copiedToken}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {DESIGN_TOKENS.brand.map((token, i) => (
                  <div
                    key={i}
                    onClick={() => handleCopyColor(token.hex)}
                    className="bg-[#F7F9FC] rounded-xl border border-[#E6ECF2] p-4 flex flex-col justify-between hover:border-[#FF5C28] cursor-pointer transition-all group"
                  >
                    <div className="space-y-2">
                      <div
                        className="w-full h-16 rounded-lg shadow-inner flex items-center justify-center font-bold text-xs"
                        style={{
                          backgroundColor: token.hex,
                          color: token.hex === "#FFFFFF" || token.hex === "#E6EAF0" || token.hex === "#F7F9FC" ? "#042C51" : "#FFFFFF",
                          border: token.hex === "#FFFFFF" ? "1px solid #E6ECF2" : "none"
                        }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px]">
                          <Copy className="w-3 h-3" />
                          Copy
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#042C51]">{token.name}</h4>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#667085] pt-1">
                          <span>{token.hex}</span>
                          <span>RGB({token.rgb})</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#667085] pt-2 border-t border-[#E6ECF2] mt-2 leading-tight">
                      {token.usage}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Tone System */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-black text-[#042C51]">2. Semantic Status & Tone System</h2>
                <p className="text-xs text-[#667085]">
                  High-contrast semantic feedback classes pairing soft backgrounds with high-saturation indicator pills.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DESIGN_TOKENS.tones.map((tone, i) => (
                  <div
                    key={i}
                    onClick={() => handleCopyColor(tone.hex)}
                    className="rounded-xl border p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-sm"
                    style={{ backgroundColor: tone.bg, borderColor: tone.hex + "40" }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white"
                          style={{ backgroundColor: tone.hex }}
                        >
                          {tone.name.split(" ")[0]}
                        </span>
                        <span className="text-[10px] font-mono font-bold" style={{ color: tone.hex }}>
                          {tone.hex}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-[#042C51]">{tone.name}</h4>
                    </div>
                    <p className="text-[10.5px] text-[#334155] pt-2 mt-2 leading-tight">
                      {tone.usage}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Scales */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-black text-[#042C51]">3. Centralized Typography System (Plus Jakarta Sans)</h2>
                <p className="text-xs text-[#667085]">
                  Responsive typography scale with dedicated classes for high data density across 1920p (2XL) and 1366p displays.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F9FC] border-b border-[#E6ECF2] text-[10.5px] font-black text-[#042C51] uppercase tracking-wider">
                      <th className="p-3">CSS Class Selector</th>
                      <th className="p-3">Rendered Size</th>
                      <th className="p-3">Font Weight</th>
                      <th className="p-3">Live Visual Sample</th>
                      <th className="p-3">Applied Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6ECF2] text-xs">
                    {DESIGN_TOKENS.typography.map((tp, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFCFF]">
                        <td className="p-3 font-mono font-bold text-[#FF5C28]">{tp.class}</td>
                        <td className="p-3 text-[#667085]">{tp.size}</td>
                        <td className="p-3 font-semibold text-[#042C51]">{tp.weight}</td>
                        <td className="p-3">
                          <span className={`font-sans font-bold text-[#042C51] ${tp.class.replace(".", "")}`}>
                            The quick brown fox jumps
                          </span>
                        </td>
                        <td className="p-3 text-[#334155] text-[11.5px]">{tp.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UI COMPONENT LIBRARY */}
        {activeTab === "components" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-black text-[#042C51]">Enterprise Component Showcase & States</h2>
                <p className="text-xs text-[#667085]">
                  Interactive preview of foundational UI atoms, buttons, status chips, data tables, and input controls.
                </p>
              </div>

              {/* Buttons Showcase */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#94A9C1]">Button Variants</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
                    Primary Action Button
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
                    Deep Navy Primary
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] font-semibold text-xs transition-colors cursor-pointer shadow-xs">
                    Secondary Outline
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-[#E8F8F0] text-[#1E8449] border border-[#A9DFBF] font-bold text-xs hover:bg-[#d5f5e3] transition-colors cursor-pointer">
                    Success State Action
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-[#FDEDEC] text-[#B03A2E] border border-[#F5B7B1] font-bold text-xs hover:bg-[#fadbd8] transition-colors cursor-pointer">
                    Destructive Action
                  </button>
                </div>
              </div>

              {/* Status Chips */}
              <div className="space-y-2 pt-4 border-t border-[#E6ECF2]">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#94A9C1]">Status Badges & Pills</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#E8F8F0] text-[#1E8449] text-xs font-bold border border-[#A9DFBF]">
                    Approved / Passed (Tone Green)
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#FEF5E7] text-[#B9770E] text-xs font-bold border border-[#FAD7A0]">
                    Pending Verification (Tone Amber)
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#FDEDEC] text-[#B03A2E] text-xs font-bold border border-[#F5B7B1]">
                    Rejected / Drop-off (Tone Red)
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#EBF5FB] text-[#21618C] text-xs font-bold border border-[#AED6F1]">
                    Interview Scheduled (Tone Blue)
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#F4ECF7] text-[#6C3483] text-xs font-bold border border-[#D7BDE2]">
                    Offer Extended (Tone Purple)
                  </span>
                </div>
              </div>

              {/* Metric Card Preview */}
              <div className="space-y-2 pt-4 border-t border-[#E6ECF2]">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#94A9C1]">Data Metric Card Standard</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#F7F9FC] rounded-xl border border-[#E6ECF2] p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#042C51] to-[#FF5C28]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#667085]">Active Headcount</span>
                    <div className="text-2xl font-black text-[#042C51] mt-1">1,248</div>
                    <span className="text-[10.5px] text-[#1E8449] font-bold">↑ +14.2% vs last month</span>
                  </div>

                  <div className="bg-[#F7F9FC] rounded-xl border border-[#E6ECF2] p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#2ECC71]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#667085]">Offer Acceptance Rate</span>
                    <div className="text-2xl font-black text-[#042C51] mt-1">88.4%</div>
                    <span className="text-[10.5px] text-[#1E8449] font-bold">Target: &gt;85% SLA</span>
                  </div>

                  <div className="bg-[#F7F9FC] rounded-xl border border-[#E6ECF2] p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5C28]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#667085]">Avg Time-to-Fill</span>
                    <div className="text-2xl font-black text-[#042C51] mt-1">11.8 Days</div>
                    <span className="text-[10.5px] text-[#21618C] font-bold">SLA: &lt;14 Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ARCHITECTURE & SOP MATRIX */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#042C51]">End-to-End 16-Step Recruitment SOP Lifecycle</h2>
                  <p className="text-xs text-[#667085]">
                    Strategic 4-phase operating model connecting requisition intake directly to NHO graduation.
                  </p>
                </div>
                {onSwitchModule && (
                  <button
                    onClick={() => onSwitchModule("Recruitment Flowchart")}
                    className="px-3.5 py-2 rounded-xl bg-[#042C51] hover:bg-[#FF5C28] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <GitFork className="w-4 h-4 text-[#FF5C28]" />
                    <span>Open Interactive Flowchart</span>
                  </button>
                )}
              </div>

              {/* 4 Phases Timeline Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#EBF5FB] border border-[#AED6F1] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#21618C]">Phase 1</span>
                    <span className="text-[10px] font-bold text-[#667085]">1–2 Days</span>
                  </div>
                  <h4 className="text-sm font-black text-[#042C51]">Plan & Approve</h4>
                  <ul className="text-[11px] text-[#334155] space-y-1">
                    <li>• Step 1: Requisition Request (PRF)</li>
                    <li>• Step 2: Requisition Approval</li>
                  </ul>
                </div>

                <div className="bg-[#E8F8F0] border border-[#A9DFBF] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E8449]">Phase 2</span>
                    <span className="text-[10px] font-bold text-[#667085]">1–2 Days</span>
                  </div>
                  <h4 className="text-sm font-black text-[#042C51]">Prepare</h4>
                  <ul className="text-[11px] text-[#334155] space-y-1">
                    <li>• Step 3: Job Description Specs</li>
                    <li>• Step 4: Sourcing Strategy</li>
                    <li>• Step 5: Job Posting Launch</li>
                  </ul>
                </div>

                <div className="bg-[#FEF5E7] border border-[#FAD7A0] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#B9770E]">Phase 3</span>
                    <span className="text-[10px] font-bold text-[#667085]">5–8 Days</span>
                  </div>
                  <h4 className="text-sm font-black text-[#042C51]">Attract & Evaluate</h4>
                  <ul className="text-[11px] text-[#334155] space-y-1">
                    <li>• Step 6: Sourcing & Intake</li>
                    <li>• Step 7: Initial Screening</li>
                    <li>• Step 8: Assessment Fit</li>
                    <li>• Step 9-10: Department Interviews</li>
                    <li>• Step 11: Candidate Selection</li>
                  </ul>
                </div>

                <div className="bg-[#F4ECF7] border border-[#D7BDE2] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#6C3483]">Phase 4</span>
                    <span className="text-[10px] font-bold text-[#667085]">3–5 Days</span>
                  </div>
                  <h4 className="text-sm font-black text-[#042C51]">Hire & Onboard</h4>
                  <ul className="text-[11px] text-[#334155] space-y-1">
                    <li>• Step 12: Offer Extended</li>
                    <li>• Step 13: Offer Accepted</li>
                    <li>• Step 14: 5 Pre-Employment Checks</li>
                    <li>• Step 15: NHO & Day 1</li>
                    <li>• Step 16: Probationary Review</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== SCREEN INSPECTOR MODAL ==================== */}
      {selectedScreen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div 
              className="p-5 text-white flex items-center justify-between"
              style={{ backgroundColor: `rgb(${selectedScreen.accentColor.join(",")})` }}
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFA488]">
                  {selectedScreen.category}
                </span>
                <h3 className="text-base font-black text-white">{selectedScreen.title}</h3>
              </div>
              <button
                onClick={() => setSelectedScreen(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-[#042C51] max-h-[80vh] overflow-y-auto">
              <div>
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#94A9C1]">Purpose & Subtitle</span>
                <p className="text-sm font-medium text-[#334155] mt-0.5">{selectedScreen.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E6ECF2]">
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[#94A9C1]">Target SLA / KPI Benchmark</span>
                  <p className="font-bold text-[#FF5C28] mt-0.5">{selectedScreen.slaOrKpi}</p>
                </div>
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[#94A9C1]">Target Personas</span>
                  <p className="font-medium text-[#215789] mt-0.5">{selectedScreen.personas.join(", ")}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6ECF2] space-y-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#94A9C1]">Key Capabilities & Sub-views</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScreen.keyFeatures.map((feat, i) => (
                    <li key={i} className="p-2 rounded-lg bg-[#F7F9FC] border border-[#E6ECF2] flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#2ECC71] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#E6ECF2] space-y-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#94A9C1]">Composed UI Components</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScreen.components.map((comp, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-[#EBF5FB] text-[#21618C] font-semibold text-[11px] border border-[#AED6F1]">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F7F9FC] border-t border-[#E6ECF2] flex items-center justify-between">
              <button
                onClick={() => setSelectedScreen(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#E6EAF0] cursor-pointer"
              >
                Close Spec
              </button>

              {onSwitchModule && (
                <button
                  onClick={() => {
                    const modKey = getModuleKeyFromScreenId(selectedScreen.id);
                    setSelectedScreen(null);
                    onSwitchModule(modKey);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Live Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
