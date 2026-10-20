import React from "react";

export type ArrowColor = "blue" | "teal" | "purple" | "orange" | "emerald" | "amber" | "red" | "slate";

interface FlowArrowProps {
  label?: string;
  sublabel?: string;
  color?: ArrowColor;
  direction?: "right" | "down" | "left" | "up";
  animated?: boolean;
  className?: string;
  length?: "sm" | "md" | "lg" | "xl";
  dashed?: boolean;
  onClick?: () => void;
  labelPosition?: "right" | "left";
}

const COLOR_MAP: Record<ArrowColor, {
  stroke: string;
  badge: string;
  particle: string;
  glow: string;
  ring: string;
}> = {
  blue: {
    stroke: "#1D68BD",
    badge: "bg-[#1D68BD] text-white border-blue-600",
    particle: "#60A5FA",
    glow: "drop-shadow-[0_0_6px_rgba(29,104,189,0.4)]",
    ring: "ring-blue-200"
  },
  teal: {
    stroke: "#0E8773",
    badge: "bg-[#0E8773] text-white border-teal-700",
    particle: "#2DD4BF",
    glow: "drop-shadow-[0_0_6px_rgba(14,135,115,0.4)]",
    ring: "ring-teal-200"
  },
  purple: {
    stroke: "#6B21A8",
    badge: "bg-[#6B21A8] text-white border-purple-800",
    particle: "#C084FC",
    glow: "drop-shadow-[0_0_6px_rgba(107,33,168,0.4)]",
    ring: "ring-purple-200"
  },
  orange: {
    stroke: "#FF5C28",
    badge: "bg-[#FF5C28] text-white border-orange-600",
    particle: "#FDBA74",
    glow: "drop-shadow-[0_0_6px_rgba(255,92,40,0.4)]",
    ring: "ring-orange-200"
  },
  emerald: {
    stroke: "#059669",
    badge: "bg-emerald-600 text-white border-emerald-700",
    particle: "#34D399",
    glow: "drop-shadow-[0_0_6px_rgba(5,150,105,0.4)]",
    ring: "ring-emerald-200"
  },
  amber: {
    stroke: "#D97706",
    badge: "bg-amber-600 text-white border-amber-700",
    particle: "#FBBF24",
    glow: "drop-shadow-[0_0_6px_rgba(217,119,6,0.4)]",
    ring: "ring-amber-200"
  },
  red: {
    stroke: "#DC2626",
    badge: "bg-red-600 text-white border-red-700",
    particle: "#F87171",
    glow: "drop-shadow-[0_0_6px_rgba(220,38,38,0.4)]",
    ring: "ring-red-200"
  },
  slate: {
    stroke: "#475569",
    badge: "bg-slate-700 text-white border-slate-800",
    particle: "#94A3B8",
    glow: "drop-shadow-[0_0_6px_rgba(71,85,105,0.3)]",
    ring: "ring-slate-200"
  }
};

export function HorizontalFlowArrow({
  label,
  sublabel,
  color = "blue",
  animated = true,
  length = "md",
  dashed = false,
  className = "",
  onClick
}: FlowArrowProps) {
  const c = COLOR_MAP[color];
  const reactId = React.useId();
  const markerId = `h-arrow-${color}-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Estimate required width so that label badge NEVER spills out and overlaps adjacent process cards
  const labelLength = Math.max(label ? label.length : 0, sublabel ? sublabel.length * 0.85 : 0);
  const requiredLabelWidth = labelLength > 0 ? Math.ceil(labelLength * 8) + 36 : 0;

  const baseWidth = {
    sm: 48,
    md: 76,
    lg: 104,
    xl: 140
  }[length];

  const effectiveWidth = Math.max(baseWidth, requiredLabelWidth);

  return (
    <div
      onClick={onClick}
      style={{ width: `${effectiveWidth}px`, minWidth: `${effectiveWidth}px` }}
      className={`flex flex-col items-center justify-center shrink-0 relative select-none py-1 group px-1 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      title={label ? `Process Flow: ${label}` : "Process Flow"}
    >
      {/* Step Transition Label Badge - comfortably contained inside effectiveWidth */}
      {label && (
        <div
          className={`px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap shadow-xs border transition-all duration-300 z-10 ${
            c.badge
          } group-hover:scale-105 group-hover:shadow-md mb-1`}
        >
          {label}
        </div>
      )}

      {/* SVG Arrow Line with Arrowhead and Moving Pulse spanning full width */}
      <div className="w-full h-5 flex items-center justify-center relative my-0.5">
        <svg
          viewBox={`0 0 ${effectiveWidth} 16`}
          style={{ width: `${effectiveWidth}px` }}
          className={`h-4 overflow-visible transition-all duration-300 ${c.glow}`}
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 6 3, 0 6" fill={c.stroke} />
            </marker>
          </defs>

          {/* Main Connector Line */}
          <line
            x1="4"
            y1="8"
            x2={effectiveWidth - 8}
            y2="8"
            stroke={c.stroke}
            strokeWidth="2.5"
            strokeDasharray={dashed ? "4,3" : undefined}
            strokeLinecap="round"
            markerEnd={`url(#${markerId})`}
          />

          {/* Animated Flow Pulse */}
          {animated && (
            <circle r="3" cy="8" fill={c.particle}>
              <animate
                attributeName="cx"
                from="6"
                to={effectiveWidth - 11}
                dur="1.3s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>
      </div>

      {/* Micro Sub-label below arrow line with safe width */}
      {sublabel && (
        <span 
          style={{ maxWidth: `${effectiveWidth - 4}px` }}
          className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tight truncate leading-none text-center mt-0.5 block"
        >
          {sublabel}
        </span>
      )}
    </div>
  );
}

export function VerticalFlowArrow({
  label,
  sublabel,
  color = "blue",
  animated = true,
  length = "md",
  dashed = false,
  className = "",
  onClick,
  labelPosition = "right"
}: FlowArrowProps) {
  const c = COLOR_MAP[color];
  const reactId = React.useId();
  const markerId = `v-arrow-${color}-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const hasLabel = Boolean(label || sublabel);

  const effectiveSvgHeight = {
    sm: hasLabel ? 48 : 32,
    md: hasLabel ? 64 : 48,
    lg: hasLabel ? 84 : 72,
    xl: hasLabel ? 108 : 96
  }[length];

  const heightClasses = {
    sm: hasLabel ? "h-12 min-h-[48px]" : "h-8 min-h-[32px]",
    md: hasLabel ? "h-16 min-h-[64px]" : "h-12 min-h-[48px]",
    lg: hasLabel ? "h-21 min-h-[84px]" : "h-18 min-h-[72px]",
    xl: hasLabel ? "h-27 min-h-[108px]" : "h-24 min-h-[96px]"
  }[length];

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center shrink-0 relative select-none px-2 my-1 group ${
        onClick ? "cursor-pointer" : ""
      } ${heightClasses} ${className}`}
      title={label ? `Process Flow: ${label}` : "Process Flow"}
    >
      <div className="relative flex items-center justify-center h-full">
        {/* SVG Arrow Line with Arrowhead and Moving Pulse */}
        <svg
          viewBox={`0 0 16 ${effectiveSvgHeight}`}
          style={{ height: `${effectiveSvgHeight}px` }}
          className={`w-4 overflow-visible transition-all duration-300 ${c.glow}`}
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 6 3, 0 6" fill={c.stroke} />
            </marker>
          </defs>

          {/* Main Connector Line */}
          <line
            x1="8"
            y1="2"
            x2="8"
            y2={effectiveSvgHeight - 8}
            stroke={c.stroke}
            strokeWidth="2.5"
            strokeDasharray={dashed ? "4,3" : undefined}
            strokeLinecap="round"
            markerEnd={`url(#${markerId})`}
          />

          {/* Animated Flow Pulse */}
          {animated && (
            <circle r="3" cx="8" fill={c.particle}>
              <animate
                attributeName="cy"
                from="4"
                to={effectiveSvgHeight - 11}
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>

        {/* Floating Label & Sublabel Badge positioned cleanly to the side of the arrow line so it NEVER overlaps the arrow or adjacent process nodes */}
        {hasLabel && (
          <div
            className={`absolute ${
              labelPosition === "left"
                ? "right-[calc(50%+14px)] items-end text-right"
                : "left-[calc(50%+14px)] items-start text-left"
            } top-1/2 -translate-y-1/2 flex flex-col pointer-events-auto z-20`}
          >
            {label && (
              <div
                className={`px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap shadow-xs border transition-all duration-300 ${
                  c.badge
                } group-hover:scale-105 group-hover:shadow-md`}
              >
                {label}
              </div>
            )}
            {sublabel && (
              <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap mt-0.5 px-0.5">
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Split branch connector for Decision Diamonds
 */
export function DecisionBranchConnector({
  leftLabel = "Option A",
  leftSublabel,
  leftColor = "blue",
  rightLabel = "Option B",
  rightSublabel,
  rightColor = "orange",
  animated = true
}: {
  leftLabel?: string;
  leftSublabel?: string;
  leftColor?: ArrowColor;
  rightLabel?: string;
  rightSublabel?: string;
  rightColor?: ArrowColor;
  animated?: boolean;
}) {
  const leftC = COLOR_MAP[leftColor];
  const rightC = COLOR_MAP[rightColor];

  return (
    <div className="w-full flex flex-col items-center select-none my-2">
      {/* Stem down from decision */}
      <div className="w-0.5 h-4 bg-slate-300"></div>

      {/* Horizontal splitter with directional arrows pointing left and right, then down */}
      <div className="w-full max-w-xl relative flex justify-between items-center px-4 sm:px-12">
        {/* Horizontal crossbar */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-300 -z-0"></div>

        {/* Left Branch Out */}
        <div className="z-10 flex flex-col items-center">
          <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-xs border ${leftC.badge}`}>
            {leftLabel}
          </div>
          {leftSublabel && (
            <span className="text-[7.5px] font-bold text-slate-500 mt-0.5">{leftSublabel}</span>
          )}
          <VerticalFlowArrow color={leftColor} length="sm" animated={animated} />
        </div>

        {/* Center Pivot Indicator */}
        <div className="z-10 w-2 h-2 rounded-full bg-[#042C51] ring-4 ring-slate-100"></div>

        {/* Right Branch Out */}
        <div className="z-10 flex flex-col items-center">
          <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-xs border ${rightC.badge}`}>
            {rightLabel}
          </div>
          {rightSublabel && (
            <span className="text-[7.5px] font-bold text-slate-500 mt-0.5">{rightSublabel}</span>
          )}
          <VerticalFlowArrow color={rightColor} length="sm" animated={animated} />
        </div>
      </div>
    </div>
  );
}
