import React, { useState, useMemo } from "react";

export interface LeadsTrendPoint {
  period: string;
  leads: number;
  interviews: number;
  yieldPct: number;
}

interface LeadsToInterviewTrendChartProps {
  data?: LeadsTrendPoint[];
  className?: string;
}

export const LeadsToInterviewTrendChart: React.FC<LeadsToInterviewTrendChartProps> = ({
  data,
  className = "",
}) => {
  const defaultData: LeadsTrendPoint[] = [
    { period: "W15", leads: 180, interviews: 65, yieldPct: 36.1 },
    { period: "W16", leads: 195, interviews: 72, yieldPct: 36.9 },
    { period: "W17", leads: 210, interviews: 80, yieldPct: 38.1 },
    { period: "W18", leads: 220, interviews: 85, yieldPct: 38.6 },
    { period: "W19", leads: 225, interviews: 88, yieldPct: 39.1 },
    { period: "W20", leads: 220, interviews: 90, yieldPct: 40.9 },
  ];

  const trendData = data && data.length > 0 ? data : defaultData;
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // SVG dimensions
  const width = 480;
  const height = 175;
  const paddingLeft = 40;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 28;

  // Y-axis ticks & scaling for Interviews (0 to 100)
  const yTicks = [0, 25, 50, 75, 100];
  const minVal = 0;
  const maxVal = 100;

  const chartPoints = useMemo(() => {
    return trendData.map((pt, i) => {
      const x = paddingLeft + (i / (trendData.length - 1)) * (width - paddingLeft - paddingRight);
      const valY = height - paddingBottom - ((pt.interviews - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
      const leadsY = height - paddingBottom - ((pt.leads / 2.5 - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);

      return {
        ...pt,
        x,
        valY,
        leadsY,
      };
    });
  }, [trendData]);

  const activePt = activeIdx !== null ? chartPoints[activeIdx] : null;

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Legend Header */}
      <div className="flex items-center justify-between text-[10px] font-bold pb-1 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] inline-block"></span> Interviews Completed
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-0.5 bg-[#C084FC] inline-block"></span> Leads Vol (Ref)
          </span>
        </div>
        <span className="text-[9px] text-slate-400 font-mono">6-Wk Trend</span>
      </div>

      {/* Main SVG Line Graph matching screenshot */}
      <div className="relative w-full pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Horizontal Gridlines & Y-Axis Numeric Labels on Left */}
          {yTicks.map((val, i) => {
            const y = height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
            return (
              <g key={`y-grid-${i}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  fill="#0F172A"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="end"
                  className="font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Reference Line: Leads Volume (light dotted) */}
          <path
            d={chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.leadsY}`).join(" ")}
            fill="none"
            stroke="#C084FC"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />

          {/* Main Trend Line: Vibrant Solid Purple */}
          <path
            d={chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.valY}`).join(" ")}
            fill="none"
            stroke="#7C3AED"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Node Value Numbers directly above dots (Exact match to screenshot) */}
          {chartPoints.map((pt, idx) => (
            <text
              key={`val-txt-${idx}`}
              x={pt.x}
              y={pt.valY - 8}
              fill="#0F172A"
              fontSize="11"
              fontWeight="900"
              textAnchor="middle"
              className="font-sans"
            >
              {pt.interviews}
            </text>
          ))}

          {/* Circular Nodes at data points */}
          {chartPoints.map((pt, idx) => {
            const isActive = activeIdx === idx;
            return (
              <g key={`node-${idx}`} className="cursor-pointer" onMouseEnter={() => setActiveIdx(idx)}>
                {/* Outer halo on hover */}
                {isActive && (
                  <circle cx={pt.x} cy={pt.valY} r={8} fill="#7C3AED" fillOpacity={0.2} />
                )}
                {/* Main purple node */}
                <circle cx={pt.x} cy={pt.valY} r={4.5} fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />

                {/* Invisible hit box for hover */}
                <rect x={pt.x - 18} y={paddingTop - 10} width="36" height={height - paddingTop - paddingBottom + 20} fill="transparent" />

                {/* X Axis Week Label at bottom */}
                <text
                  x={pt.x}
                  y={height - paddingBottom + 16}
                  fill="#64748B"
                  fontSize="9.5"
                  fontWeight="800"
                  textAnchor="middle"
                  className="font-sans uppercase"
                >
                  {pt.period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip matching style */}
        {activePt && (
          <div className="absolute top-0 right-2 bg-[#042C51] text-white px-2.5 py-1.5 rounded-lg text-[10px] shadow-lg border border-purple-800 pointer-events-none z-10 animate-fade-in">
            <div className="font-bold text-purple-300 border-b border-purple-800/80 pb-0.5 mb-1 flex items-center justify-between gap-3">
              <span>{activePt.period} Details</span>
            </div>
            <div className="space-y-0.5 font-mono">
              <div className="flex justify-between gap-3">
                <span className="text-purple-300">Interviews:</span>
                <strong className="text-white">{activePt.interviews}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-300">Total Leads:</span>
                <strong className="text-slate-100">{activePt.leads}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-emerald-300">Yield %:</span>
                <strong className="text-emerald-400">{activePt.yieldPct}%</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsToInterviewTrendChart;
