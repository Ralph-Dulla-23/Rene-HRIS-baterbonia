import React, { useState, useRef } from "react";
import {
  Sparkles,
  RotateCcw,
  Play,
  Accessibility,
  X,
  VolumeX,
  MousePointer,
  Clock,
  CheckCircle2,
  Monitor,
  Smartphone,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Calendar,
  User,
  Heart,
  PartyPopper,
} from "lucide-react";
import BirthdayCelebration from "./BirthdayCelebration";
import ConfettiCanvas from "./ConfettiCanvas";
import { motion, AnimatePresence } from "motion/react";

interface BirthdayShowcasePageProps {
  userEmail?: string;
  onSwitchModule?: (module: string) => void;
}

type FrameMode = "all" | "compact" | "full" | "mobile" | "reduced-motion" | "exit-state";

export default function BirthdayShowcasePage({
  userEmail = "alena.batacan@thesiblingssolutions.com",
  onSwitchModule,
}: BirthdayShowcasePageProps) {
  // Test controls state
  const [activeFrameTab, setActiveFrameTab] = useState<FrameMode>("all");
  const [employeeName, setEmployeeName] = useState<string>("Alena Batacan");
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [confettiSpeed, setConfettiSpeed] = useState<number>(1.0); // 1.0 = gentle & floaty default
  const [celebrationKey, setCelebrationKey] = useState<number>(1);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulated overlay visibility states inside mockups
  const [mockup1Visible, setMockup1Visible] = useState<boolean>(true);
  const [mockup2Visible, setMockup2Visible] = useState<boolean>(true);
  const [mockup3Visible, setMockup3Visible] = useState<boolean>(true);
  const [exitStateSlider, setExitStateSlider] = useState<number>(50); // 0 = Full overlay, 100 = Full dashboard

  const mockup1Ref = useRef<HTMLDivElement>(null);
  const mockup2Ref = useRef<HTMLDivElement>(null);
  const mockup3Ref = useRef<HTMLDivElement>(null);

  // Quick toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Re-trigger global full-screen celebration
  const handleTriggerLiveCelebration = () => {
    setIsTriggering(true);
    triggerToast("Launching joyful rainbow celebration overlay (400ms delay)...");
    setTimeout(() => {
      setCelebrationKey((prev) => prev + 1);
      setIsTriggering(false);
      setMockup1Visible(true);
      setMockup2Visible(true);
      setMockup3Visible(true);
    }, 400);
  };

  // Reset annual local storage
  const handleResetStorage = () => {
    try {
      const year = new Date().getFullYear();
      localStorage.removeItem(`sibs_birthday_celebrated_${year}_SIBS-8429`);
      localStorage.removeItem(`sibs_birthday_celebrated_${year}_DEMO`);
      triggerToast("Annual celebration storage cleared for fresh login test.");
    } catch (e) {
      console.warn("Storage reset:", e);
    }
  };

  const getFirstName = (name: string) => {
    const parts = name.trim().split(" ");
    return parts[0].toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative pb-16 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 bg-[#042C51] text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== PAGE HEADER ==================== */}
      <section className="bg-white p-5 md:p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#E9F0FC] text-[#042C51] px-2.5 py-0.5 rounded-full font-black border border-blue-100 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FF5C28]" />
                SiBS Birthday Easter Egg
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                <Heart className="w-2.5 h-2.5 fill-[#FF5C28] text-[#FF5C28]" />
                Joyful Rainbow Celebration
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#042C51] tracking-tight flex items-center gap-2.5">
              <span>Full-Screen Birthday Celebration Overlay</span>
            </h1>
            <p className="text-xs md:text-sm text-[#526071] max-w-3xl leading-relaxed">
              A colorful, joyful full-viewport celebration on solid deep SiBS navy (<code className="text-[#042C51] font-bold bg-slate-100 px-1.5 py-0.5 rounded font-mono">#042C51</code>). Features bold centered Plus Jakarta Sans typography, pale-yellow name highlight, bouncing exclamation mark, abundant rainbow confetti, and a soft translucent skip pill.
            </p>
          </div>

          {/* Primary Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTriggerLiveCelebration}
              disabled={isTriggering}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF5C28] hover:bg-[#E04D1D] active:scale-95 text-white text-xs font-black rounded-full shadow-xs transition-all cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 fill-white ${isTriggering ? "animate-spin" : ""}`} />
              <span>{isTriggering ? "Launching..." : "Launch Live Overlay"}</span>
            </button>

            <button
              onClick={() => setReducedMotion((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-black rounded-full border transition-all cursor-pointer ${
                reducedMotion
                  ? "bg-[#042C51] text-white border-[#042C51]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
              title="Toggle Reduced Motion Accessibility Mode"
            >
              <Accessibility className="w-3.5 h-3.5" />
              <span>Reduced Motion: {reducedMotion ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={handleResetStorage}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 transition-colors cursor-pointer"
              title="Reset annual 1-per-year celebration flag"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Annual Storage</span>
            </button>
          </div>
        </div>

        {/* Quick Parameters Selector Bar */}
        <div className="pt-3 border-t border-[#E6ECF2] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Test Recipient:</span>
            {["Alena Batacan", "Ralph Vincent", "Marcus Chen", "Sofia Rodriguez"].map((name) => (
              <button
                key={name}
                onClick={() => {
                  setEmployeeName(name);
                  handleTriggerLiveCelebration();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  employeeName === name
                    ? "bg-[#042C51] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {name}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Confetti Speed:</span>
            {[
              { label: "Ultra Floaty (0.7x)", val: 0.7 },
              { label: "Gentle & Slow (1.0x)", val: 1.0 },
              { label: "Moderate (1.3x)", val: 1.3 },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => {
                  setConfettiSpeed(spd.val);
                  triggerToast(`Confetti speed set to ${spd.label}`);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  confettiSpeed === spd.val
                    ? "bg-[#FF5C28] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            <span>Zero Sound</span>
            <span className="text-slate-300">•</span>
            <MousePointer className="w-3.5 h-3.5 text-slate-400" />
            <span>Click/Esc to Dismiss</span>
            <span className="text-slate-300">•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>4.8s Auto-Fade</span>
          </div>
        </div>
      </section>

      {/* ==================== CORE EXPERIENCE PILLARS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-[#042C51] border border-blue-100 shrink-0">
            <Layers className="w-5 h-5 text-[#042C51]" />
          </div>
          <div>
            <h2 className="text-xs font-black text-[#042C51]">Solid Deep Navy Canvas</h2>
            <p className="text-[11px] text-[#526071] mt-0.5 leading-relaxed">
              Solid <code className="font-mono text-[#042C51] font-bold">#042C51</code> background with zero background noise. Authenticated HRIS dashboard is already pre-loaded underneath.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-pink-50 text-[#EC4899] border border-pink-100 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-[#042C51]">Abundant Rainbow Confetti</h2>
            <p className="text-[11px] text-[#526071] mt-0.5 leading-relaxed">
              Fires from left & right sides with top flutter. Features 12 balanced rainbow colors, ribbons, streamers, rounded rects, and tiny hearts.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-orange-50 text-[#FF5C28] border border-orange-100 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-[#042C51]">Cute Centered Greeting</h2>
            <p className="text-[11px] text-[#526071] mt-0.5 leading-relaxed">
              Warm white headline, SiBS orange name with pale-yellow brush highlight, bouncing exclamation mark, and twinkling sparkles.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E6ECF2] shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
            <Accessibility className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-[#042C51]">Reduced-Motion Safe</h2>
            <p className="text-[11px] text-[#526071] mt-0.5 leading-relaxed">
              Replaces flying particles with a static rainbow-confetti perimeter. Polite <code className="font-mono text-[10px]">role="status"</code> for screen readers.
            </p>
          </div>
        </div>
      </div>

      {/* ==================== RESPONSIVE FRAMES VIEWPORT CONTROLLER ==================== */}
      <div className="bg-[#042C51] text-white p-3 md:p-4 rounded-2xl shadow-lg border border-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#FF5C28] flex items-center justify-center font-black text-xs text-white">
            5
          </div>
          <div>
            <p className="text-xs font-black tracking-wide text-white">5 Production Mockup Frames Inspector</p>
            <p className="text-[10px] text-slate-300">Inspect the exact responsive layouts, cute styling, and exit transition states.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            onClick={() => setActiveFrameTab("all")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs cursor-pointer ${
              activeFrameTab === "all"
                ? "bg-[#FF5C28] text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All 5 Frames
          </button>
          <button
            onClick={() => setActiveFrameTab("compact")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs cursor-pointer ${
              activeFrameTab === "compact"
                ? "bg-[#FF5C28] text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            1. Laptop (1366×768)
          </button>
          <button
            onClick={() => setActiveFrameTab("full")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs cursor-pointer ${
              activeFrameTab === "full"
                ? "bg-[#FF5C28] text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            2. Desktop (1920×1080)
          </button>
          <button
            onClick={() => setActiveFrameTab("mobile")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs cursor-pointer ${
              activeFrameTab === "mobile"
                ? "bg-[#FF5C28] text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            3. Mobile (390×844)
          </button>
          <button
            onClick={() => setActiveFrameTab("reduced-motion")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs cursor-pointer ${
              activeFrameTab === "reduced-motion"
                ? "bg-[#FF5C28] text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            4. Reduced-Motion (1366×768)
          </button>
          <button
            onClick={() => setActiveFrameTab("exit-state")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs cursor-pointer ${
              activeFrameTab === "exit-state"
                ? "bg-[#FF5C28] text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            5. Exit State Transition
          </button>
        </div>
      </div>

      {/* ==================== FRAME 1: 1366×768 COMPACT LAPTOP ==================== */}
      {(activeFrameTab === "all" || activeFrameTab === "compact") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#042C51] text-white text-[10px] font-black flex items-center justify-center">1</span>
              <h2 className="text-sm font-black text-[#042C51]">1366 × 768 Compact Laptop Frame</h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                Standard Business Laptop
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMockup1Visible((v) => !v)}
                className="text-xs text-[#FF5C28] font-bold hover:underline cursor-pointer"
              >
                {mockup1Visible ? "Simulate Skip/Dismiss" : "Reset Overlay"}
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-900 p-2 sm:p-4 rounded-2xl shadow-xl overflow-hidden">
            {/* Simulated 1366x768 Browser Window */}
            <div
              ref={mockup1Ref}
              className="bg-[#042C51] rounded-xl overflow-hidden border border-slate-700 aspect-[1366/768] max-h-[600px] relative flex flex-col shadow-inner"
            >
              {/* Browser Address Bar */}
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-slate-300 text-[11px] shrink-0 border-b border-slate-700 z-10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-slate-400 font-mono text-[10px] ml-2">
                    https://hris.thesiblingssolutions.com/dashboard
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">1366 × 768 Compact Frame</span>
              </div>

              {/* Preloaded Dashboard Canvas (Underneath) */}
              <div className="flex-1 bg-[#E6EAF0] flex overflow-hidden relative">
                <div className="w-48 bg-white border-r border-[#E6ECF2] p-3 hidden md:flex flex-col justify-between shrink-0 opacity-40">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-2">
                      <div className="w-6 h-6 rounded bg-[#FF5C28] text-white flex items-center justify-center font-black text-xs">S</div>
                      <span className="text-xs font-black text-[#042C51]">SiBS HRIS</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="px-2 py-1 rounded bg-blue-50 text-[#042C51] font-bold">Dashboard</div>
                      <div className="px-2 py-1 text-slate-500">Attendance</div>
                      <div className="px-2 py-1 text-slate-500">My Leaves</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-3 opacity-40">
                  <div className="h-10 bg-white rounded-lg border border-[#E6ECF2]" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-24 bg-white rounded-xl border border-[#E6ECF2]" />
                    <div className="h-24 bg-white rounded-xl border border-[#E6ECF2]" />
                    <div className="h-24 bg-white rounded-xl border border-[#E6ECF2]" />
                  </div>
                </div>

                {/* FULL-VIEWPORT SOLID NAVY CELEBRATION OVERLAY */}
                {mockup1Visible && (
                  <div className="absolute inset-0 bg-[#042C51] flex flex-col items-center justify-center text-white z-40 overflow-hidden select-none">
                    {/* Rainbow Confetti physics in mockup */}
                    <ConfettiCanvas
                      active={true}
                      reducedMotion={false}
                      durationMs={4200}
                      speedMultiplier={confettiSpeed}
                      isMockup={true}
                      containerElement={mockup1Ref.current}
                    />

                    {/* Translucent Skip Pill */}
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-50">
                      <button
                        onClick={() => setMockup1Visible(false)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xs cursor-pointer transition-colors"
                      >
                        <span>Skip</span>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Centered Cute Typography */}
                    <div className="relative text-center px-4 space-y-1.5 z-40">
                      {/* Left and right popper accents */}
                      <div className="absolute -left-12 top-2 pointer-events-none hidden sm:block">
                        <div className="w-3.5 h-3.5 bg-[#FBBF24] rotate-45 rounded-xs" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899] mt-1" />
                      </div>
                      <div className="absolute -right-12 top-2 pointer-events-none hidden sm:block">
                        <div className="w-3.5 h-3.5 bg-[#FF5C28] -rotate-45 rounded-xs" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-1" />
                      </div>

                      <h3 className="text-2xl sm:text-4xl md:text-5xl font-black font-sans text-[#FFFDF7] tracking-tight uppercase leading-none drop-shadow-md">
                        HAPPY BIRTHDAY,
                      </h3>
                      <div className="relative inline-block text-3xl sm:text-5xl md:text-6xl font-black font-sans text-[#FF5C28] tracking-tight uppercase leading-none drop-shadow-md pt-1">
                        <span className="absolute -bottom-1 left-2 right-2 h-3 bg-[#FEF08A]/25 -rotate-1 rounded-full -z-10" />
                        <span>{getFirstName(employeeName)}</span>
                        <span className="inline-block animate-bounce text-[#FF5C28] ml-0.5">!</span>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-[#D6E4F0] pt-2 max-w-md mx-auto leading-relaxed drop-shadow-xs">
                        Wishing you the happiest day from everyone at SiBS!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FRAME 2: 1920×1080 DESKTOP ==================== */}
      {(activeFrameTab === "all" || activeFrameTab === "full") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#042C51] text-white text-[10px] font-black flex items-center justify-center">2</span>
              <h2 className="text-sm font-black text-[#042C51]">1920 × 1080 Desktop Frame</h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                High-Resolution Workstation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMockup2Visible((v) => !v)}
                className="text-xs text-[#FF5C28] font-bold hover:underline cursor-pointer"
              >
                {mockup2Visible ? "Simulate Skip/Dismiss" : "Reset Overlay"}
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-900 p-2 sm:p-4 rounded-2xl shadow-xl overflow-hidden">
            <div
              ref={mockup2Ref}
              className="bg-[#042C51] rounded-xl overflow-hidden border border-slate-700 aspect-[1920/1080] max-h-[640px] relative flex flex-col shadow-inner"
            >
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-slate-300 text-[11px] shrink-0 border-b border-slate-700 z-10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-slate-400 font-mono text-[10px] ml-2">
                    https://hris.thesiblingssolutions.com/portal
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">1920 × 1080 Desktop Frame</span>
              </div>

              <div className="flex-1 bg-[#E6EAF0] relative flex items-center justify-center">
                {/* FULL-VIEWPORT SOLID NAVY CELEBRATION OVERLAY */}
                {mockup2Visible && (
                  <div className="absolute inset-0 bg-[#042C51] flex flex-col items-center justify-center text-white z-40 overflow-hidden select-none">
                    <ConfettiCanvas
                      active={true}
                      reducedMotion={false}
                      durationMs={4200}
                      speedMultiplier={confettiSpeed}
                      isMockup={true}
                      containerElement={mockup2Ref.current}
                    />

                    {/* Translucent Skip Pill */}
                    <div className="absolute top-5 right-6 z-50">
                      <button
                        onClick={() => setMockup2Visible(false)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 backdrop-blur-md cursor-pointer transition-colors"
                      >
                        <span>Skip</span>
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Centered Typography: Spacious & High Contrast */}
                    <div className="relative text-center px-6 space-y-2 z-40 max-w-3xl">
                      {/* Left and right popper accents */}
                      <div className="absolute -left-16 top-4 pointer-events-none hidden sm:block">
                        <div className="w-4 h-4 bg-[#FBBF24] rotate-45 rounded-xs shadow-xs" />
                        <div className="w-2 h-2 rounded-full bg-[#EC4899] mt-2" />
                      </div>
                      <div className="absolute -right-16 top-4 pointer-events-none hidden sm:block">
                        <div className="w-4 h-4 bg-[#FF5C28] -rotate-45 rounded-xs shadow-xs" />
                        <div className="w-2 h-2 rounded-full bg-[#38BDF8] mt-2" />
                      </div>

                      <h3 className="text-3xl sm:text-5xl md:text-6xl font-black font-sans text-[#FFFDF7] tracking-tight uppercase leading-none drop-shadow-lg">
                        HAPPY BIRTHDAY,
                      </h3>
                      <div className="relative inline-block text-4xl sm:text-6xl md:text-7xl font-black font-sans text-[#FF5C28] tracking-tight uppercase leading-none drop-shadow-lg pt-1">
                        <span className="absolute -bottom-1.5 left-4 right-4 h-4 bg-[#FEF08A]/25 -rotate-1 rounded-full -z-10" />
                        <span>{getFirstName(employeeName)}</span>
                        <span className="inline-block animate-bounce text-[#FF5C28] ml-1">!</span>
                      </div>
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-[#D6E4F0] pt-3 leading-relaxed drop-shadow-xs">
                        Wishing you the happiest day from everyone at SiBS!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FRAME 3: 390×844 MOBILE ==================== */}
      {(activeFrameTab === "all" || activeFrameTab === "mobile") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#042C51] text-white text-[10px] font-black flex items-center justify-center">3</span>
              <h2 className="text-sm font-black text-[#042C51]">390 × 844 Mobile Frame (iPhone / Mobile)</h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                Safe-Area & 44×44px Touch Target
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMockup3Visible((v) => !v)}
                className="text-xs text-[#FF5C28] font-bold hover:underline cursor-pointer"
              >
                {mockup3Visible ? "Simulate Skip" : "Reset Overlay"}
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-xl flex justify-center">
            {/* iPhone Device Frame */}
            <div
              ref={mockup3Ref}
              className="w-[390px] h-[720px] bg-[#042C51] rounded-[48px] border-8 border-slate-800 shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Dynamic Island / Status Bar */}
              <div className="h-9 bg-slate-800 flex items-center justify-between px-6 text-white text-[11px] font-bold shrink-0 z-50">
                <span>9:41</span>
                <div className="w-24 h-4.5 bg-black rounded-full" />
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <div className="w-4 h-2 bg-white rounded-xs" />
                </div>
              </div>

              {/* Mobile Viewport Body */}
              <div className="flex-1 bg-[#042C51] relative flex flex-col items-center justify-center px-5 text-center select-none overflow-hidden">
                {/* Reduced density rainbow confetti */}
                <ConfettiCanvas
                  active={true}
                  reducedMotion={false}
                  durationMs={4200}
                  speedMultiplier={confettiSpeed}
                  isMockup={true}
                  containerElement={mockup3Ref.current}
                />

                {/* Safe-Area Skip Pill Button (Min 44x44px target) */}
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={() => setMockup3Visible(false)}
                    aria-label="Skip celebration"
                    className="flex items-center gap-1 px-4 py-2 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md cursor-pointer"
                  >
                    <span>Skip</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Responsive Centered Cute Typography on Mobile */}
                <div className="space-y-1.5 z-40 max-w-[320px]">
                  <h3 className="text-2xl font-black font-sans text-[#FFFDF7] tracking-tight uppercase leading-none drop-shadow-md">
                    HAPPY BIRTHDAY,
                  </h3>
                  <div className="relative inline-block text-3xl font-black font-sans text-[#FF5C28] tracking-tight uppercase leading-none break-words drop-shadow-md pt-1">
                    <span className="absolute -bottom-1 left-2 right-2 h-3 bg-[#FEF08A]/25 -rotate-1 rounded-full -z-10" />
                    <span>{getFirstName(employeeName)}</span>
                    <span className="inline-block animate-bounce text-[#FF5C28] ml-0.5">!</span>
                  </div>
                  <p className="text-xs font-semibold text-[#D6E4F0] pt-2 leading-relaxed drop-shadow-xs">
                    Wishing you the happiest day from everyone at SiBS!
                  </p>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FRAME 4: 1366×768 REDUCED-MOTION VERSION ==================== */}
      {(activeFrameTab === "all" || activeFrameTab === "reduced-motion") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#042C51] text-white text-[10px] font-black flex items-center justify-center">4</span>
              <h2 className="text-sm font-black text-[#042C51]">1366 × 768 Reduced-Motion Accessibility Frame</h2>
              <span className="text-[10px] bg-blue-100 text-[#042C51] px-2 py-0.5 rounded-full font-bold border border-blue-200">
                prefers-reduced-motion: reduce
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Zero flying particles • Static rainbow-confetti perimeter border • Polite ARIA
            </span>
          </div>

          <div className="w-full bg-slate-900 p-2 sm:p-4 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#042C51] rounded-xl overflow-hidden border border-slate-700 aspect-[1366/768] max-h-[600px] relative flex flex-col shadow-inner">
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-slate-300 text-[11px] shrink-0 border-b border-slate-700 z-10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-slate-400 font-mono text-[10px] ml-2">
                    https://hris.thesiblingssolutions.com/dashboard (Accessibility Mode)
                  </span>
                </div>
                <span className="text-[10px] text-blue-300 font-bold">Reduced Motion Active</span>
              </div>

              <div className="flex-1 bg-[#042C51] relative flex flex-col items-center justify-center text-white overflow-hidden select-none">
                {/* Static Rainbow Confetti Perimeter Border (Zero RAF Animation) */}
                <div className="absolute inset-0 pointer-events-none opacity-85" aria-hidden="true">
                  {/* Top edge */}
                  <div className="absolute top-8 left-12 w-3.5 h-6 bg-[#EF4444] rotate-12 rounded-sm" />
                  <div className="absolute top-16 left-32 w-4 h-2 bg-[#FBBF24] -rotate-45 rounded-sm" />
                  <div className="absolute top-10 left-56 w-3 h-3 rounded-full bg-[#10B981]" />
                  <div className="absolute top-6 left-80 w-3 h-5 bg-[#38BDF8] rotate-25 rounded-sm" />
                  <div className="absolute top-14 left-[45%] w-3 h-3 bg-[#EC4899] rotate-45 rounded-sm" />
                  <div className="absolute top-8 right-80 w-4 h-2 bg-[#8B5CF6] -rotate-12 rounded-sm" />
                  <div className="absolute top-14 right-56 w-3 h-3 rounded-full bg-[#FF5C28]" />
                  <div className="absolute top-8 right-32 w-3.5 h-5 bg-[#A3E635] rotate-30 rounded-sm" />
                  <div className="absolute top-16 right-12 w-4 h-2 bg-white -rotate-15 rounded-sm" />

                  {/* Sides */}
                  <div className="absolute top-36 left-10 w-3 h-6 bg-[#EC4899] rotate-45 rounded-sm" />
                  <div className="absolute top-52 left-20 w-3 h-3 rounded-full bg-[#3B82F6]" />
                  <div className="absolute top-36 right-14 w-3.5 h-5 bg-[#38BDF8] -rotate-25 rounded-sm" />
                  <div className="absolute top-56 right-24 w-3 h-3 rounded-full bg-[#EF4444]" />

                  {/* Bottom edge */}
                  <div className="absolute bottom-12 left-16 w-3.5 h-6 bg-[#14B8A6] rotate-45 rounded-sm" />
                  <div className="absolute bottom-20 left-36 w-3.5 h-3.5 rounded-full bg-[#FF5C28]" />
                  <div className="absolute bottom-10 left-64 w-4 h-2 bg-[#EC4899] -rotate-30 rounded-sm" />
                  <div className="absolute bottom-14 left-[46%] w-3 h-5 bg-[#FBBF24] rotate-12 rounded-sm" />
                  <div className="absolute bottom-10 right-64 w-4 h-2 bg-[#3B82F6] rotate-25 rounded-sm" />
                  <div className="absolute bottom-18 right-36 w-3 h-3 rounded-full bg-[#10B981]" />
                  <div className="absolute bottom-10 right-16 w-3.5 h-6 bg-[#EF4444] -rotate-45 rounded-sm" />
                </div>

                {/* Translucent Skip Pill */}
                <div className="absolute top-5 right-6 z-50">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md">
                    <span>Skip</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Centered Message with Simple Fade */}
                <div className="text-center px-4 space-y-1.5 z-40">
                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-black font-sans text-[#FFFDF7] tracking-tight uppercase leading-none">
                    HAPPY BIRTHDAY,
                  </h3>
                  <div className="relative inline-block text-3xl sm:text-5xl md:text-6xl font-black font-sans text-[#FF5C28] tracking-tight uppercase leading-none pt-1">
                    <span className="absolute -bottom-1 left-2 right-2 h-3 bg-[#FEF08A]/25 -rotate-1 rounded-full -z-10" />
                    <span>{getFirstName(employeeName)}!</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-[#D6E4F0] pt-2 max-w-md mx-auto leading-relaxed">
                    Wishing you the happiest day from everyone at SiBS!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FRAME 5: EXIT STATE FADING INTO HRIS DASHBOARD ==================== */}
      {(activeFrameTab === "all" || activeFrameTab === "exit-state") && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#042C51] text-white text-[10px] font-black flex items-center justify-center">5</span>
              <h2 className="text-sm font-black text-[#042C51]">Exit State Transition — Revealing the SiBS HRIS Dashboard</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                Timeline: 4.5s Auto-Fade
              </span>
            </div>

            {/* Interactive Transition Scrubber */}
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 text-xs">
              <span className="font-bold text-slate-500 text-[11px]">Overlay</span>
              <input
                type="range"
                min="0"
                max="100"
                value={exitStateSlider}
                onChange={(e) => setExitStateSlider(Number(e.target.value))}
                className="w-28 sm:w-36 accent-[#FF5C28] cursor-pointer"
                title="Scrub exit crossfade progress"
              />
              <span className="font-bold text-[#042C51] text-[11px]">Dashboard ({exitStateSlider}%)</span>
            </div>
          </div>

          <div className="w-full bg-slate-900 p-2 sm:p-4 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#E6EAF0] rounded-xl overflow-hidden border border-slate-700 aspect-[1366/768] max-h-[600px] relative flex flex-col shadow-inner">
              {/* Browser Header */}
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-slate-300 text-[11px] shrink-0 border-b border-slate-700 z-30">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-slate-400 font-mono text-[10px] ml-2">
                    https://hris.thesiblingssolutions.com/dashboard
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">Smooth 0.5s Exit Fade</span>
              </div>

              {/* Preloaded Interactive HRIS Dashboard Canvas (Underneath) */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Left Mini Sidebar */}
                <div className="w-48 bg-white border-r border-[#E6ECF2] p-3 hidden md:flex flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <div className="w-6 h-6 rounded bg-[#FF5C28] text-white flex items-center justify-center font-black text-xs">S</div>
                      <span className="text-xs font-black text-[#042C51]">SiBS HRIS</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#E9F0FC] text-[#042C51] font-bold flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-[#FF5C28]" />
                        <span>My Dashboard</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-slate-600 font-medium flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Attendance</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-slate-600 font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Leaves</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Canvas Body */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <div className="h-12 bg-white border-b border-[#E6ECF2] px-4 flex items-center justify-between shrink-0">
                    <div className="text-xs font-black text-[#042C51]">Employee Self-Service Portal</div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-semibold">2026-08-16 09:00 AM</span>
                      <div className="w-6 h-6 rounded-full bg-[#E9F0FC] text-[#042C51] flex items-center justify-center text-[10px] font-black">
                        AB
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-[#E6ECF2] shadow-xs space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-[#042C51]">
                          <span>Time & Attendance</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Ready</span>
                        </div>
                        <div className="text-lg font-black text-[#042C51]">09:00 AM</div>
                        <div className="pt-1">
                          <button className="w-full py-1 bg-[#FF5C28] text-white rounded text-[10px] font-bold">
                            Punch Clock In
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#E6ECF2] shadow-xs space-y-1">
                        <span className="text-[11px] font-bold text-[#042C51]">Vacation Leave Balance</span>
                        <div className="text-lg font-black text-[#FF5C28]">12.5 Days</div>
                        <p className="text-[10px] text-slate-400">Accrued for Q3 2026</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#E6ECF2] shadow-xs space-y-1">
                        <span className="text-[11px] font-bold text-[#042C51]">Company Announcements</span>
                        <div className="text-xs font-bold text-[#042C51] truncate">Quarterly Townhall on Friday</div>
                        <p className="text-[10px] text-slate-400">All-Hands Operations</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DISSOLVING OVERLAY (Controlled by exitStateSlider) */}
                <div
                  className="absolute inset-0 bg-[#042C51] flex flex-col items-center justify-center text-white z-20 pointer-events-none transition-opacity duration-150 select-none overflow-hidden"
                  style={{ opacity: 1 - exitStateSlider / 100 }}
                >
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20">
                      <span>Skip</span>
                      <X className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="text-center px-4 space-y-1.5">
                    <h3 className="text-2xl sm:text-4xl font-black font-sans text-[#FFFDF7] tracking-tight uppercase leading-none">
                      HAPPY BIRTHDAY,
                    </h3>
                    <div className="relative inline-block text-3xl sm:text-5xl font-black font-sans text-[#FF5C28] tracking-tight uppercase leading-none pt-1">
                      <span className="absolute -bottom-1 left-2 right-2 h-3 bg-[#FEF08A]/25 -rotate-1 rounded-full -z-10" />
                      <span>{getFirstName(employeeName)}</span>
                      <span className="inline-block text-[#FF5C28] ml-0.5">!</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#D6E4F0] pt-2 max-w-md mx-auto leading-relaxed">
                      Wishing you the happiest day from everyone at SiBS!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
