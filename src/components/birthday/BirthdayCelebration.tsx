import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ConfettiCanvas from "./ConfettiCanvas";

export interface BirthdayCelebrationProps {
  key?: React.Key;
  /** Employee's full name or first name */
  employeeName?: string;
  /** Unique employee ID for annual storage persistence */
  employeeId?: string;
  /** Force trigger celebration regardless of storage */
  forceShow?: boolean;
  /** Override reduced motion preference */
  reducedMotionOverride?: boolean;
  /** Callback when celebration is dismissed/faded */
  onDismiss?: () => void;
  /** Initial delay before celebration overlay appears (default 400ms) */
  initialDelayMs?: number;
  /** Auto-fade duration in milliseconds (default 4800ms = 4.8s) */
  autoDismissDurationMs?: number;
  /** When running inside simulated viewport mockup containers */
  isMockupContainer?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function BirthdayCelebration({
  employeeName = "Alena Batacan",
  employeeId = "SIBS-8429",
  forceShow = false,
  reducedMotionOverride,
  onDismiss,
  initialDelayMs = 400,
  autoDismissDurationMs = 4800,
  isMockupContainer = false,
  containerRef,
}: BirthdayCelebrationProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [hasDismissed, setHasDismissed] = useState<boolean>(false);

  // Extract first name cleanly (e.g. "Alena Mendoza Batacan" -> "ALENA", "BATACAN, ALENA" -> "ALENA")
  const firstName = React.useMemo(() => {
    if (!employeeName) return "ALENA";
    let raw = employeeName.trim();
    if (raw.includes(",")) {
      const parts = raw.split(",");
      if (parts[1]) {
        raw = parts[1].trim().split(" ")[0];
      }
    } else {
      raw = raw.split(" ")[0];
    }
    return raw.toUpperCase();
  }, [employeeName]);

  // System prefers-reduced-motion check
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const isReducedMotion =
    reducedMotionOverride !== undefined ? reducedMotionOverride : systemReducedMotion;

  // Annual persistence key format: `sibs_birthday_celebrated_${YEAR}_${EMPLOYEE_ID}`
  const currentYear = new Date().getFullYear();
  const storageKey = `sibs_birthday_celebrated_${currentYear}_${employeeId}`;

  // Dismiss callback handler
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setConfettiActive(false);
    setHasDismissed(true);
    if (onDismiss) onDismiss();
  }, [onDismiss]);

  // Keyboard shortcut: Escape key dismisses instantly
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleDismiss]);

  // Start sequence on mount or when forced
  useEffect(() => {
    if (hasDismissed && !forceShow) return;

    if (!forceShow) {
      try {
        const alreadyCelebrated = localStorage.getItem(storageKey);
        if (alreadyCelebrated === "true") {
          return; // Do not show again this calendar year
        }
      } catch (e) {
        console.warn("Storage check skipped:", e);
      }
    }

    // 1. Initial delay ~300-500ms after dashboard paint
    const startTimer = setTimeout(() => {
      setIsVisible(true);
      if (!isReducedMotion) {
        setConfettiActive(true);
      }

      // Record annual celebration flag
      try {
        localStorage.setItem(storageKey, "true");
      } catch (e) {
        // Safe fallback
      }
    }, initialDelayMs);

    return () => clearTimeout(startTimer);
  }, [forceShow, initialDelayMs, isReducedMotion, storageKey, hasDismissed]);

  // 2. Auto-fade celebration after ~4.5s
  useEffect(() => {
    if (!isVisible) return;

    const autoFadeTimer = setTimeout(() => {
      handleDismiss();
    }, autoDismissDurationMs);

    return () => clearTimeout(autoFadeTimer);
  }, [isVisible, autoDismissDurationMs, handleDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="sibs-birthday-rainbow-overlay"
          id="sibs-birthday-celebration-overlay"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onClick={(e) => {
            // Dismiss on background click
            if (e.target === e.currentTarget) {
              handleDismiss();
            }
          }}
          className={`${
            isMockupContainer ? "absolute inset-0" : "fixed inset-0"
          } z-50 flex flex-col items-center justify-center bg-[#042C51] text-white select-none overflow-hidden cursor-default`}
        >
          {/* Animated Rainbow Confetti Layer */}
          <ConfettiCanvas
            active={confettiActive}
            onComplete={() => setConfettiActive(false)}
            reducedMotion={isReducedMotion}
            durationMs={4200}
            isMockup={isMockupContainer}
            containerElement={containerRef?.current}
          />

          {/* STATIC RAINBOW CONFETTI BORDER (Used when Reduced-Motion is active) */}
          {isReducedMotion && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden opacity-90"
              aria-hidden="true"
            >
              {/* Top border rainbow confetti */}
              <div className="absolute top-8 left-12 w-3.5 h-6 bg-[#EF4444] rotate-12 rounded-sm" />
              <div className="absolute top-16 left-32 w-4 h-2 bg-[#FBBF24] -rotate-45 rounded-sm" />
              <div className="absolute top-10 left-56 w-3 h-3 rounded-full bg-[#10B981]" />
              <div className="absolute top-6 left-80 w-3 h-5 bg-[#38BDF8] rotate-25 rounded-sm" />
              <div className="absolute top-14 left-[45%] w-3 h-3 bg-[#EC4899] rotate-45 rounded-sm" />
              <div className="absolute top-8 right-80 w-4 h-2 bg-[#8B5CF6] -rotate-12 rounded-sm" />
              <div className="absolute top-14 right-56 w-3 h-3 rounded-full bg-[#FF5C28]" />
              <div className="absolute top-8 right-32 w-3.5 h-5 bg-[#A3E635] rotate-30 rounded-sm" />
              <div className="absolute top-16 right-12 w-4 h-2 bg-white -rotate-15 rounded-sm" />

              {/* Left edge rainbow confetti */}
              <div className="absolute top-36 left-10 w-3 h-6 bg-[#EC4899] rotate-45 rounded-sm" />
              <div className="absolute top-52 left-20 w-3 h-3 rounded-full bg-[#3B82F6]" />
              <div className="absolute top-72 left-8 w-4 h-2.5 bg-[#FF5C28] -rotate-30 rounded-sm" />
              <div className="absolute bottom-56 left-14 w-3.5 h-5 bg-[#FBBF24] rotate-15 rounded-sm" />
              <div className="absolute bottom-36 left-24 w-3 h-3 rounded-full bg-[#10B981]" />

              {/* Right edge rainbow confetti */}
              <div className="absolute top-36 right-14 w-3.5 h-5 bg-[#38BDF8] -rotate-25 rounded-sm" />
              <div className="absolute top-56 right-24 w-3 h-3 rounded-full bg-[#EF4444]" />
              <div className="absolute top-72 right-10 w-4 h-2 bg-[#A3E635] rotate-45 rounded-sm" />
              <div className="absolute bottom-56 right-16 w-3 h-5 bg-[#8B5CF6] -rotate-15 rounded-sm" />
              <div className="absolute bottom-36 right-28 w-3 h-3 rounded-full bg-[#FACC15]" />

              {/* Bottom border rainbow confetti */}
              <div className="absolute bottom-12 left-16 w-3.5 h-6 bg-[#14B8A6] rotate-45 rounded-sm" />
              <div className="absolute bottom-20 left-36 w-3.5 h-3.5 rounded-full bg-[#FF5C28]" />
              <div className="absolute bottom-10 left-64 w-4 h-2 bg-[#EC4899] -rotate-30 rounded-sm" />
              <div className="absolute bottom-14 left-[46%] w-3 h-5 bg-[#FBBF24] rotate-12 rounded-sm" />
              <div className="absolute bottom-10 right-64 w-4 h-2 bg-[#3B82F6] rotate-25 rounded-sm" />
              <div className="absolute bottom-18 right-36 w-3 h-3 rounded-full bg-[#10B981]" />
              <div className="absolute bottom-10 right-16 w-3.5 h-6 bg-[#EF4444] -rotate-45 rounded-sm" />
            </div>
          )}

          {/* Upper Right Skip Pill Control */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Skip celebration and view dashboard"
              title="Skip celebration (Esc)"
              className="flex items-center gap-1.5 px-4 py-2 sm:px-4.5 sm:py-2.5 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-xs sm:text-sm font-bold tracking-wide border border-white/20 backdrop-blur-md shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5C28] focus:ring-offset-2 focus:ring-offset-[#042C51]"
            >
              <span>Skip</span>
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* ==================== CENTERED BIRTHDAY GREETING ==================== */}
          <div
            className="relative z-40 max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pop-in Container with gentle celebratory bounce */}
            <motion.div
              initial={
                isReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 12, scale: 0.94 }
              }
              animate={
                isReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              transition={
                isReducedMotion
                  ? { duration: 0.3 }
                  : {
                      type: "spring",
                      damping: 18,
                      stiffness: 240,
                      mass: 0.8,
                      delay: 0.05,
                    }
              }
              className="relative flex flex-col items-center"
            >
              {/* Small Party-Popper Confetti Bursts Beside Headline (Not emojis, clean SVG shapes) */}
              <div
                className="absolute -left-10 sm:-left-16 md:-left-20 top-2 sm:top-4 pointer-events-none hidden sm:block"
                aria-hidden="true"
              >
                <div className="relative w-10 h-10">
                  {/* Left popper cone shape */}
                  <div className="w-4 h-4 bg-[#FBBF24] rotate-45 rounded-xs shadow-xs" />
                  {/* Bursting sparks */}
                  <div className="absolute -top-3 -left-2 w-2 h-2 rounded-full bg-[#EC4899] animate-ping" />
                  <div className="absolute -top-2 left-4 w-2.5 h-1.5 bg-[#38BDF8] rotate-12" />
                  <div className="absolute top-4 -left-3 w-2 h-3 bg-[#A3E635] -rotate-45" />
                  <div className="absolute -top-4 left-1 w-1.5 h-1.5 rounded-full bg-[#FF5C28]" />
                </div>
              </div>

              <div
                className="absolute -right-10 sm:-right-16 md:-right-20 top-2 sm:top-4 pointer-events-none hidden sm:block"
                aria-hidden="true"
              >
                <div className="relative w-10 h-10">
                  {/* Right popper cone shape */}
                  <div className="w-4 h-4 bg-[#FF5C28] -rotate-45 rounded-xs shadow-xs ml-auto" />
                  {/* Bursting sparks */}
                  <div className="absolute -top-3 -right-2 w-2 h-2 rounded-full bg-[#FACC15] animate-ping" />
                  <div className="absolute -top-2 right-4 w-2.5 h-1.5 bg-[#8B5CF6] -rotate-12" />
                  <div className="absolute top-4 -right-3 w-2 h-3 bg-[#10B981] 45deg" />
                  <div className="absolute -top-4 right-1 w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                </div>
              </div>

              {/* Twinkling Star Sparkles Close to Headline */}
              <div
                className="absolute -top-7 left-12 pointer-events-none hidden sm:block animate-pulse"
                aria-hidden="true"
              >
                <svg className="w-5 h-5 text-[#FACC15]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
              <div
                className="absolute -top-5 right-14 pointer-events-none hidden sm:block animate-pulse delay-150"
                aria-hidden="true"
              >
                <svg className="w-4 h-4 text-[#38BDF8]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
              <div
                className="absolute top-1/2 -right-8 pointer-events-none hidden sm:block animate-pulse delay-300"
                aria-hidden="true"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899] shadow-xs" />
              </div>
              <div
                className="absolute top-1/2 -left-8 pointer-events-none hidden sm:block animate-pulse delay-200"
                aria-hidden="true"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#A3E635] shadow-xs" />
              </div>

              {/* Main Headline Block */}
              <div className="space-y-1 sm:space-y-2">
                {/* Line 1: "HAPPY BIRTHDAY," in Warm White */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-sans text-[#FFFDF7] tracking-tight uppercase leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
                  HAPPY BIRTHDAY,
                </h1>

                {/* Line 2: "[FIRST NAME]!" in SiBS Orange with Soft Pale-Yellow Highlight Underneath & Cheerful Bouncing Exclamation Mark */}
                <div className="relative inline-block text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-sans text-[#FF5C28] tracking-tight uppercase leading-none break-words drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] pt-1">
                  {/* Subtle Pale-Yellow/Cream Underline Brush Highlight */}
                  <span
                    className="absolute -bottom-1.5 left-2 right-2 sm:left-4 sm:right-4 h-3 sm:h-4.5 bg-[#FEF08A]/25 -rotate-1 rounded-full -z-10 pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Name Text */}
                  <span className="relative z-10">{firstName}</span>

                  {/* Cheerful Bouncing Exclamation Mark */}
                  <motion.span
                    className="inline-block relative z-10 text-[#FF5C28] ml-0.5"
                    animate={
                      isReducedMotion
                        ? {}
                        : {
                            y: [0, -6, 0, -3, 0],
                            scale: [1, 1.08, 1, 1.04, 1],
                          }
                    }
                    transition={
                      isReducedMotion
                        ? {}
                        : {
                            duration: 1.4,
                            repeat: Infinity,
                            repeatDelay: 1.2,
                            ease: "easeInOut",
                          }
                    }
                  >
                    !
                  </motion.span>
                </div>

                {/* Supporting Line */}
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-[#D6E4F0] max-w-xl mx-auto pt-3 sm:pt-4 tracking-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Wishing you the happiest day from everyone at SiBS!
                </p>
              </div>
            </motion.div>
          </div>

          {/* Polite Screen Reader Announcement */}
          <div className="sr-only">
            Happy birthday, {firstName}! Wishing you the happiest day from everyone at SiBS!
            Press Escape or activate the skip button to proceed to your dashboard immediately.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
