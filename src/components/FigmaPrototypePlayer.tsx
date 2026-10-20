import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  RotateCcw, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  HelpCircle, 
  Eye, 
  X, 
  Sliders, 
  Download,
  Info,
  MousePointerClick
} from "lucide-react";

export type DevicePreset = "desktop" | "macbook" | "tablet" | "mobile" | "fit";

export interface PrototypeFrame {
  id: string;
  name: string;
  moduleKey: string;
  tabKey?: "overview" | "plan";
  description: string;
  category: "Public & Portal" | "Employee Self-Service" | "Operations & WFM" | "Recruitment & Talent";
}

export const PROTOTYPE_FRAMES: PrototypeFrame[] = [
  {
    id: "frame-01",
    name: "01_Portal_Landing_Page",
    moduleKey: "Login Page",
    description: "Atmospheric twilight sunset portal & glassmorphism auth card (ID 6784)",
    category: "Public & Portal"
  },
  {
    id: "frame-02",
    name: "02_Employee_Dashboard",
    moduleKey: "My Dashboard",
    description: "Employee daily metrics, punch-in status, quick services & leaves",
    category: "Employee Self-Service"
  },
  {
    id: "frame-03",
    name: "03_Workforce_Hiring_Overview",
    moduleKey: "Workforce Hiring",
    tabKey: "overview",
    description: "Master ramp ledger, buffer gaps, drop-off waterfall & pipeline",
    category: "Operations & WFM"
  },
  {
    id: "frame-04",
    name: "04_Workforce_Hiring_Plan",
    moduleKey: "Workforce Hiring",
    tabKey: "plan",
    description: "Sourcing capacity cards, PRF fulfillment & task assignments",
    category: "Operations & WFM"
  },
  {
    id: "frame-05",
    name: "05_Public_Careers_Application",
    moduleKey: "Public Application Form",
    description: "External applicant submission with resume upload & screening",
    category: "Public & Portal"
  },
  {
    id: "frame-06",
    name: "06_Candidate_VoC_Survey",
    moduleKey: "Public Survey Form",
    description: "Candidate interview experience evaluation with rating stars",
    category: "Public & Portal"
  },
  {
    id: "frame-07",
    name: "07_Employee_Directory_Mobile",
    moduleKey: "Employee Directory",
    description: "Workforce directory search, hierarchy & mobile roster view",
    category: "Employee Self-Service"
  },
  {
    id: "frame-08",
    name: "08_Biometric_Time_Attendance",
    moduleKey: "Time & Attendance",
    description: "Live turnstile logs, late deductions & biometric schedule sync",
    category: "Operations & WFM"
  },
  {
    id: "frame-09",
    name: "09_Birthday_Easter_Egg",
    moduleKey: "Birthday Easter Egg",
    description: "Annual cultural celebration modal with digital confetti & card",
    category: "Employee Self-Service"
  },
  {
    id: "frame-10",
    name: "10_Super_Admin_Workspace",
    moduleKey: "Super Admin Dashboard",
    description: "Executive controls, audit trail, permissions & cluster settings",
    category: "Operations & WFM"
  }
];

interface FigmaPrototypePlayerProps {
  currentModule: string;
  activeTab?: "overview" | "plan";
  onNavigateFrame: (moduleKey: string, tabKey?: "overview" | "plan") => void;
  children: React.ReactNode;
  isFigmaMode: boolean;
  onToggleFigmaMode: (enabled: boolean) => void;
}

export default function FigmaPrototypePlayer({
  currentModule,
  activeTab,
  onNavigateFrame,
  children,
  isFigmaMode,
  onToggleFigmaMode
}: FigmaPrototypePlayerProps) {
  const [device, setDevice] = useState<DevicePreset>("fit");
  const [showHotspotHints, setShowHotspotHints] = useState(true);
  const [showHotspotFlash, setShowHotspotFlash] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showInspectPanel, setShowInspectPanel] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFrameDropdownOpen, setIsFrameDropdownOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Determine current active frame
  const currentFrame = PROTOTYPE_FRAMES.find(
    f => f.moduleKey === currentModule && (!f.tabKey || f.tabKey === activeTab)
  ) || PROTOTYPE_FRAMES[0];

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If user clicks on non-interactive background, flash hotspot hints (just like Figma prototype mode!)
    const target = e.target as HTMLElement;
    const isInteractive = target.closest("button, a, input, select, textarea, [role='button'], [tabindex]");
    if (!isInteractive && showHotspotHints) {
      setShowHotspotFlash(true);
      setTimeout(() => setShowHotspotFlash(false), 800);
    }
  };

  const handleCopyUrl = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyTokens = () => {
    const tokens = {
      designSystem: "SiBS HRIS Enterprise Design System v2.6",
      colors: {
        brandNavy: "#042C51",
        brandNavyDark: "#051B33",
        brandOrange: "#FF5C28",
        brandOrangeHover: "#E04412",
        brandBlueLight: "#E9F0FC",
        brandBackground: "#DDE4EC",
        brandBorder: "#E6ECF2",
        accentAmber: "#FFC72C",
        statusEmerald: "#10B981"
      },
      typography: {
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        displayScale: {
          h1: "2.25rem (36px) / font-black / tracking-tight",
          h2: "1.5rem (24px) / font-extrabold",
          h3: "1.125rem (18px) / font-bold",
          body: "0.875rem (14px) / font-normal / line-height 1.5",
          caption: "0.75rem (12px) / font-semibold / uppercase"
        }
      },
      radii: {
        card: "16px / rounded-2xl",
        button: "12px / rounded-xl",
        modal: "24px / rounded-3xl"
      },
      shadows: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        glass: "0 25px 50px -12px rgb(0 0 0 / 0.5), backdrop-blur 24px"
      }
    };
    navigator.clipboard.writeText(JSON.stringify(tokens, null, 2));
    setCopiedTokens(true);
    setTimeout(() => setCopiedTokens(false), 2000);
  };

  const handleRestart = () => {
    onNavigateFrame("Login Page");
  };

  // Keyboard shortcut: 'R' to restart prototype
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        if (!["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement)?.tagName || "")) {
          handleRestart();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isFigmaMode) {
    return (
      <div className="relative w-full min-h-screen">
        {/* Floating Figma Prototype Mode Launcher Pill */}
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#1E1E1E] text-white p-1.5 pl-3 rounded-full shadow-2xl border border-white/20 hover:scale-105 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold">
            {/* Figma Icon */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 38 57" fill="none">
              <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
              <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
              <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
              <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
              <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
            </svg>
            <span>Figma Prototype Mode</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleFigmaMode(true)}
            className="px-3 py-1 bg-[#FF5C28] hover:bg-[#E04412] text-white text-xs font-black rounded-full transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Present</span>
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      id="figma-prototype-player"
      onClick={handleCanvasClick}
      className={`min-h-screen w-full bg-[#1E1E1E] text-white flex flex-col select-none overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50" : "relative"
      }`}
    >
      {/* ==================== 1. FIGMA PRESENTATION TOP CHROME BAR ==================== */}
      <header className="h-12 bg-[#2C2C2C] border-b border-[#383838] px-3 sm:px-4 flex items-center justify-between gap-3 text-xs shrink-0 z-40">
        
        {/* Left: Figma Logo & Flow / File Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <svg className="w-4 h-5" viewBox="0 0 38 57" fill="none">
              <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
              <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
              <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
              <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
              <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
            </svg>
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-slate-100 truncate hidden md:inline">
              SiBS HRIS Enterprise System
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-[#FF5C28] font-bold truncate">
              Prototype Flow
            </span>
          </div>
        </div>

        {/* Center: Frame / Artboard Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFrameDropdownOpen(!isFrameDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#383838] hover:bg-[#444444] border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#0ACF83]" />
            <span className="max-w-[150px] sm:max-w-[200px] truncate font-mono">
              {currentFrame.name}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isFrameDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Artboards Dropdown Menu */}
          {isFrameDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-80 max-h-[460px] overflow-y-auto bg-[#252525] border border-white/15 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 flex items-center justify-between">
                <span>Select Prototype Frame</span>
                <span>{PROTOTYPE_FRAMES.length} Artboards</span>
              </div>
              
              <div className="py-1">
                {PROTOTYPE_FRAMES.map((f, idx) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onNavigateFrame(f.moduleKey, f.tabKey);
                      setIsFrameDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                      currentFrame.id === f.id
                        ? "bg-[#0055A5]/40 text-white font-bold border-l-2 border-[#1ABCFE]"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-500 mt-0.5 w-4 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono font-medium">{f.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{f.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Prototype Controls & Device Framing */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Device Mockup Selector */}
          <div className="hidden lg:flex items-center bg-[#1E1E1E] p-0.5 rounded-lg border border-white/10 text-slate-400">
            <button
              type="button"
              onClick={() => setDevice("fit")}
              title="Full / Fit Screen"
              className={`p-1.5 rounded transition-colors ${device === "fit" ? "bg-[#383838] text-white" : "hover:text-slate-200"}`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("macbook")}
              title="MacBook Pro 16'' (1728 x 1117)"
              className={`p-1.5 rounded transition-colors ${device === "macbook" ? "bg-[#383838] text-white" : "hover:text-slate-200"}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              title="iPad Pro (1024 x 1366)"
              className={`p-1.5 rounded transition-colors ${device === "tablet" ? "bg-[#383838] text-white" : "hover:text-slate-200"}`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              title="iPhone 16 Pro (393 x 852)"
              className={`p-1.5 rounded transition-colors ${device === "mobile" ? "bg-[#383838] text-white" : "hover:text-slate-200"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hotspot Hints Toggle */}
          <button
            type="button"
            onClick={() => setShowHotspotHints(!showHotspotHints)}
            title="Toggle Blue Hotspot Click Hints (Figma style)"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              showHotspotHints 
                ? "bg-[#1ABCFE]/15 border-[#1ABCFE]/50 text-[#1ABCFE]" 
                : "bg-[#383838] border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-medium">Hotspots</span>
          </button>

          {/* Figma Inspect / Design Tokens Button */}
          <button
            type="button"
            onClick={() => setShowInspectPanel(!showInspectPanel)}
            title="Inspect Figma Tokens & Specs"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              showInspectPanel 
                ? "bg-[#A259FF]/20 border-[#A259FF]/50 text-[#A259FF]" 
                : "bg-[#383838] border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-medium">Inspect</span>
          </button>

          {/* Import to Figma Guide Button */}
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-2.5 py-1 rounded-lg bg-[#FF5C28] hover:bg-[#E04412] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export to Figma</span>
          </button>

          {/* Restart Flow Button (shortcut: R) */}
          <button
            type="button"
            onClick={handleRestart}
            title="Restart Prototype Flow (Press 'R')"
            className="p-1.5 rounded-lg bg-[#383838] hover:bg-[#444444] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Exit Figma Mode */}
          <button
            type="button"
            onClick={() => onToggleFigmaMode(false)}
            title="Return to standard web app view"
            className="p-1.5 rounded-lg bg-[#383838] hover:bg-red-500/20 hover:text-red-300 border border-white/10 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ==================== 2. PROTOTYPE VIEWPORT & CANVAS ==================== */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center p-2 sm:p-6 bg-[#111111]">
        
        {/* Figma Canvas Dot Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #666666 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        {/* Hotspot Click Overlay Indicator (Classic Figma blue flash) */}
        {showHotspotFlash && (
          <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center animate-fade-in">
            <div className="bg-[#1ABCFE]/20 border-2 border-[#1ABCFE] rounded-xl px-4 py-2 text-[#1ABCFE] font-mono text-xs font-bold shadow-lg backdrop-blur-xs flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 animate-bounce" />
              <span>Interactive Hotspot Hint: Click buttons or links to navigate</span>
            </div>
          </div>
        )}

        {/* Canvas Device Frame Mockup Wrapper */}
        <div 
          className={`transition-all duration-300 ease-out relative ${
            device === "fit" 
              ? "w-full h-full max-w-full rounded-none"
              : device === "macbook"
                ? "w-[1280px] max-w-[95vw] h-[800px] max-h-[85vh] bg-[#000000] p-3 rounded-[24px] shadow-2xl border-4 border-[#333333] flex flex-col"
                : device === "tablet"
                  ? "w-[820px] max-w-[90vw] h-[860px] max-h-[88vh] bg-[#000000] p-4 rounded-[32px] shadow-2xl border-4 border-[#333333] flex flex-col"
                  : "w-[400px] max-w-[90vw] h-[820px] max-h-[88vh] bg-[#000000] p-3 rounded-[44px] shadow-2xl border-4 border-[#333333] flex flex-col"
          }`}
        >
          {/* Simulated Laptop / Mobile Notch & Bar */}
          {device === "macbook" && (
            <div className="h-5 flex items-center justify-between px-3 text-[10px] text-slate-400 pb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
              </div>
              <div className="text-[9px] font-mono text-slate-500">MacBook Pro 16" • 100% Display</div>
            </div>
          )}

          {device === "mobile" && (
            <div className="h-6 flex items-center justify-center relative pb-1">
              <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center text-[8px] text-slate-600 font-bold border border-white/5">
                Dynamic Island
              </div>
            </div>
          )}

          {/* Actual Application Content Rendered Inside Frame */}
          <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden rounded-xl bg-[#DDE4EC] relative">
            {children}
          </div>
        </div>
      </div>

      {/* ==================== 3. BOTTOM PROTOTYPE STATUS FOOTER ==================== */}
      <footer className="h-8 bg-[#222222] border-t border-[#333333] px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Interactive Flow Ready</span>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400 font-mono">
            Active: {currentFrame.name}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-slate-500 hidden md:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#333333] text-slate-300 font-mono">R</kbd> to restart prototype
          </span>
          <button
            type="button"
            onClick={() => onToggleFigmaMode(false)}
            className="text-[#FF5C28] hover:underline font-semibold cursor-pointer"
          >
            Switch to Regular App View →
          </button>
        </div>
      </footer>

      {/* ==================== 4. FIGMA DEV / INSPECT TOKENS DRAWER ==================== */}
      {showInspectPanel && (
        <aside className="fixed top-12 right-0 bottom-8 w-80 bg-[#1E1E1E] border-l border-white/15 shadow-2xl p-4 overflow-y-auto z-40 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#A259FF]" />
              <span className="font-bold text-white">Design Tokens & Specs</span>
            </div>
            <button
              type="button"
              onClick={() => setShowInspectPanel(false)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* Color Swatches */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Brand Color Palette
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-[#042C51] border border-white/20" />
                    <span>#042C51</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Primary Navy</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-[#FF5C28] border border-white/20" />
                    <span>#FF5C28</span>
                  </div>
                  <span className="text-[10px] text-slate-400">SiBS Orange</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-[#E9F0FC] border border-slate-300" />
                    <span>#E9F0FC</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Soft Ice Blue</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-[#DDE4EC] border border-slate-300" />
                    <span>#DDE4EC</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Dashboard Canvas</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Typography Scale
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/10 space-y-1 text-[11px] font-mono">
                <div className="text-slate-300">Family: Inter, system-ui</div>
                <div className="text-slate-400">H1: 36px / Black (900)</div>
                <div className="text-slate-400">H2: 24px / ExtraBold (800)</div>
                <div className="text-slate-400">Body: 14px / Regular (400)</div>
                <div className="text-slate-400">Caps: 10px / Bold (700)</div>
              </div>
            </div>

            {/* Copy Tokens JSON */}
            <button
              type="button"
              onClick={handleCopyTokens}
              className="w-full py-2 px-3 rounded-lg bg-[#383838] hover:bg-[#444444] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-white/10 cursor-pointer"
            >
              {copiedTokens ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTokens ? "Tokens Copied to Clipboard!" : "Copy Design Tokens JSON"}</span>
            </button>
          </div>
        </aside>
      )}

      {/* ==================== 5. EXPORT / OPEN IN FIGMA MODAL ==================== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#242424] border border-white/20 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1ABCFE]/20 to-[#A259FF]/20 border border-[#1ABCFE]/40 flex items-center justify-center">
                <svg className="w-5 h-6" viewBox="0 0 38 57" fill="none">
                  <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
                  <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
                  <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
                  <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
                  <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Export to Native Figma Vector File</h3>
                <p className="text-xs text-slate-400">Generate 100% editable Figma frames & Auto-Layouts</p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 text-xs text-slate-200">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="font-bold text-slate-100 flex items-center justify-between">
                  <span>Step 1: Copy your live app prototype URL</span>
                  {copiedUrl && <span className="text-emerald-400 text-[10px]">Copied!</span>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={window.location.origin}
                    className="flex-1 px-3 py-1.5 bg-[#181818] rounded-lg border border-white/10 text-slate-300 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 bg-[#1ABCFE] hover:bg-[#0099DD] text-black font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer text-xs"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="font-bold text-slate-100">
                  Step 2: Use the free Figma plugin (Instant Vector Import)
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>In your Figma file, open Plugins & search for <strong className="text-[#FF5C28]">html.to.design</strong> (or <strong className="text-white">HTML to Figma</strong>).</li>
                  <li>Paste the copied URL above into the plugin input.</li>
                  <li>Select your target viewports (Desktop 1440px or Mobile 393px).</li>
                  <li>Click <strong>Import</strong> — it will convert all HTML, CSS, fonts, and images into native, editable Figma vectors with auto-layout!</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-[#0055A5]/20 border border-[#0055A5]/40 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#1ABCFE] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-normal">
                  You can also continue using the built-in <strong>Figma Prototype Player Mode</strong> on this screen to demonstrate the complete interactive user journey, test click hotspots, and switch device viewports.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCopyUrl();
                  window.open("https://www.figma.com/community/plugin/1159123024924461424/html-to-design", "_blank");
                }}
                className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#E04412] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Open html.to.design in Figma</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
