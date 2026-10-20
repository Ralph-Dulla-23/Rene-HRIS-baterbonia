import React from "react";
import { ArrowUp } from "lucide-react";

export interface PipelineStageItem {
  name: string;
  shortName?: string;
  count: number;
  subtitle?: string;
  color?: string;
}

interface PipelineStageDropChartProps {
  stages?: PipelineStageItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  hideCardWrapper?: boolean;
}

export const PipelineStageDropChart: React.FC<PipelineStageDropChartProps> = ({
  stages,
  title = "Pipeline Flow & Stage Attrition Drop",
  subtitle = "Visual representation of candidate volumes, stage connectors, and attrition drop counts.",
  className = "",
  hideCardWrapper = false,
}) => {
  // Default data fallback if not provided
  const defaultStages: PipelineStageItem[] = [
    { name: "Accepted", shortName: "Job Offer", count: 270, subtitle: "Accepted JO", color: "#042C51" },
    { name: "NHO", shortName: "Count", count: 252, subtitle: "NHO Count", color: "#2563EB" },
    { name: "FST", shortName: "Count", count: 230, subtitle: "FST Count", color: "#0D9488" },
    { name: "PST", shortName: "Count", count: 210, subtitle: "PST Count", color: "#EA580C" },
    { name: "Go Live", shortName: "Count", count: 192, subtitle: "Go Live", color: "#15803D" },
  ];

  const chartData = stages && stages.length > 0 ? stages : defaultStages;

  // Max count for scaling bars
  const maxCount = Math.max(...chartData.map((s) => s.count), 1);

  // Colors for 5 stages if not defined
  const colors = [
    "#042C51", // Dark Navy
    "#2563EB", // Blue
    "#0D9488", // Teal
    "#EA580C", // Orange
    "#15803D", // Green
  ];

  // SVG Geometry Dimensions
  const svgWidth = 720;
  const svgHeight = 270;
  const barWidth = 68;
  const barGap = 62;
  const leftPadding = (svgWidth - (chartData.length * barWidth + (chartData.length - 1) * barGap)) / 2;
  const barBaseY = 175;
  const maxBarHeight = 115;
  const minBarHeight = 35;

  const containerStyle = hideCardWrapper
    ? `select-none w-full ${className}`
    : `bg-white p-4 rounded-2xl border border-[#E6ECF2] shadow-sm select-none ${className}`;

  return (
    <div className={containerStyle}>
      {/* Header */}
      {!hideCardWrapper && (title || subtitle) && (
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{subtitle}</p>}
          </div>
          <span className="px-2 py-0.5 text-[9px] font-black bg-rose-50 text-rose-700 rounded-full border border-rose-100 uppercase tracking-wide">
            Attrition Focus
          </span>
        </div>
      )}

      {/* SVG Stage Drop Chart */}
      <div className="w-full overflow-x-auto flex justify-center py-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[720px] h-auto drop-shadow-2xs overflow-visible"
        >
          <defs>
            {/* Shaded Drop Polygon Gradient */}
            <linearGradient id="dropGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="gainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Render Bridge Connectors between stages */}
          {chartData.map((stage, i) => {
            if (i === chartData.length - 1) return null;

            const nextStage = chartData[i + 1];
            const x1 = leftPadding + i * (barWidth + barGap) + barWidth;
            const x2 = leftPadding + (i + 1) * (barWidth + barGap);

            const h1 = Math.max(minBarHeight, (stage.count / maxCount) * maxBarHeight);
            const h2 = Math.max(minBarHeight, (nextStage.count / maxCount) * maxBarHeight);

            const y1Top = barBaseY - h1;
            const y2Top = barBaseY - h2;
            const yBottom = barBaseY;

            const isDrop = stage.count >= nextStage.count;

            return (
              <g key={`bridge-${i}`}>
                {/* Connector Trapezoid Polygon */}
                <polygon
                  points={`${x1},${y1Top} ${x2},${y2Top} ${x2},${yBottom} ${x1},${yBottom}`}
                  fill={isDrop ? "url(#dropGradient)" : "url(#gainGradient)"}
                  stroke={isDrop ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          {/* Render Stage Bars */}
          {chartData.map((stage, i) => {
            const x = leftPadding + i * (barWidth + barGap);
            const barHeight = Math.max(minBarHeight, (stage.count / maxCount) * maxBarHeight);
            const y = barBaseY - barHeight;
            const color = stage.color || colors[i % colors.length];

            // Title split
            const nameParts = stage.name.split(" ");
            const line1 = nameParts[0] || stage.name;
            const line2 = nameParts.slice(1).join(" ") || stage.shortName || "";

            return (
              <g key={`bar-${i}`}>
                {/* Stage Header Label (Top) */}
                <text x={x + barWidth / 2} y="15" textAnchor="middle" fill="#042C51" fontSize="10" fontWeight="900">
                  {line1}
                </text>
                {line2 && (
                  <text x={x + barWidth / 2} y="27" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="700">
                    {line2}
                  </text>
                )}

                {/* Vertical Bar Rect */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  ry="6"
                  fill={color}
                  className="transition-all duration-300 hover:opacity-90"
                />

                {/* Inner Count Value */}
                <text
                  x={x + barWidth / 2}
                  y={y + barHeight / 2 + 5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="15"
                  fontWeight="900"
                  className="font-mono"
                >
                  {stage.count}
                </text>

                {/* Bottom Upward Arrow */}
                <g transform={`translate(${x + barWidth / 2 - 6}, ${barBaseY + 8})`}>
                  <path
                    d="M 6 12 L 6 2 M 6 2 L 2 6 M 6 2 L 10 6"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              </g>
            );
          })}

          {/* Render Drop / Attrition Count Metrics below stage gaps */}
          {chartData.map((stage, i) => {
            if (i === chartData.length - 1) return null;

            const nextStage = chartData[i + 1];
            const dropCount = nextStage.count - stage.count;
            const dropPct = stage.count > 0 ? ((dropCount / stage.count) * 100) : 0;

            const midX = leftPadding + i * (barWidth + barGap) + barWidth + barGap / 2;
            const gapY = barBaseY + 28;

            const isDrop = dropCount <= 0;
            const formattedVal = isDrop
              ? `${dropCount} (${dropPct.toFixed(2)}%)`
              : `+${dropCount} (+${dropPct.toFixed(2)}%)`;

            return (
              <g key={`drop-${i}`}>
                {/* Drop Value Text */}
                <text
                  x={midX}
                  y={gapY}
                  textAnchor="middle"
                  fill={isDrop ? "#DC2626" : "#16A34A"}
                  fontSize="10"
                  fontWeight="900"
                  className="font-mono"
                >
                  {formattedVal}
                </text>
              </g>
            );
          })}

          {/* Bottom Footer Legend */}
          <g transform={`translate(${svgWidth / 2}, ${svgHeight - 10})`}>
            <text textAnchor="middle" fill="#DC2626" fontSize="12" fontWeight="900" className="tracking-wide">
              Drop = Attrition Count (% Attrition)
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default PipelineStageDropChart;
