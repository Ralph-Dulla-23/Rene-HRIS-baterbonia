import React, { useState, useMemo } from "react";

export interface HiringTrendPoint {
  period: string;
  rate: number;
  target: number;
  hires: number;
}

interface HiringRateTrendChartProps {
  data?: HiringTrendPoint[];
  className?: string;
}

export const HiringRateTrendChart: React.FC<HiringRateTrendChartProps> = ({
  data,
  className = "",
}) => {
  const defaultData: HiringTrendPoint[] = [
    { period: "W15", rate: 18.2, target: 20.0, hires: 28 },
    { period: "W16", rate: 19.5, target: 20.0, hires: 30 },
    { period: "W17", rate: 21.0, target: 20.0, hires: 33 },
    { period: "W18", rate: 22.4, target: 20.0, hires: 35 },
    { period: "W19", rate: 21.8, target: 20.0, hires: 32 },
    { period: "W20", rate: 23.1, target: 20.0, hires: 34 },
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

  // Y-axis ticks for Rate (10% to 25%)
  const yTicks = [10, 15, 20, 25];
  const minRate = 10;
  const maxRate = 25;

  const chartPoints = useMemo(() => {
    return trendData.map((pt, i) => {
      const x =
        paddingLeft +
        (i / (trendData.length - 1)) *
          (width - paddingLeft - paddingRight);
      const rateY =
        height -
        paddingBottom -
        ((pt.rate - minRate) / (maxRate - minRate)) *
          (height - paddingTop - paddingBottom);
      const targetY =
        height -
        paddingBottom -
        ((pt.target - minRate) / (maxRate - minRate)) *
          (height - paddingTop - paddingBottom);

      return {
        ...pt,
        x,
        rateY,
        targetY,
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] inline-block"></span>
            Hiring Rate %
          </span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2.5 h-0.5 bg-[#F59E0B] inline-block"></span>
            Target Floor (20%)
          </span>
        </div>
        <span className="text-[9px] text-slate-400 font-mono">6-Wk Trend</span>
      </div>

      {/* Main SVG Line Graph matching screenshot */}
      <div className="relative w-full pt-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Horizontal Gridlines & Y-Axis Numeric Labels on Left */}
          {yTicks.map((val, i) => {
            const y =
              height -
              paddingBottom -
              ((val - minRate) / (maxRate - minRate)) *
                (height - paddingTop - paddingBottom);
            const isTarget = val === 20;

            return (
              <g key={`y-grid-${i}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke={isTarget ? "#F59E0B" : "#F1F5F9"}
                  strokeWidth={isTarget ? "1.2" : "1"}
                  strokeDasharray={isTarget ? "3 2" : undefined}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  fill={isTarget ? "#D97706" : "#0F172A"}
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="end"
                  className="font-mono"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Main Trend Line: Solid Teal */}
          <path
            d={chartPoints
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.rateY}`)
              .join(" ")}
            fill="none"
            stroke="#0D9488"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Node Value Numbers directly above dots */}
          {chartPoints.map((pt, idx) => (
            <text
              key={`val-txt-${idx}`}
              x={pt.x}
              y={pt.rateY - 8}
              fill="#0F172A"
              fontSize="11"
              fontWeight="900"
              textAnchor="middle"
              className="font-sans"
            >
              {pt.rate}%
            </text>
          ))}

          {/* Circular Nodes at data points */}
          {chartPoints.map((pt, idx) => {
            const isActive = activeIdx === idx;

            return (
              <g
                key={`node-${idx}`}
                className="cursor-pointer"
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.rateY}
                    r={8}
                    fill="#0D9488"
                    fillOpacity={0.2}
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.rateY}
                  r={4.5}
                  fill="#0D9488"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                <rect
                  x={pt.x - 18}
                  y={paddingTop - 10}
                  width="36"
                  height={height - paddingTop - paddingBottom + 20}
                  fill="transparent"
                />

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
          <div className="absolute top-0 right-2 bg-[#042C51] text-white px-2.5 py-1.5 rounded-lg text-[10px] shadow-lg border border-teal-800 pointer-events-none z-10 animate-fade-in">
            <div className="font-bold text-teal-300 border-b border-teal-800/80 pb-0.5 mb-1 flex items-center justify-between gap-3">
              <span>{activePt.period} Yield Details</span>
            </div>

            <div className="space-y-0.5 font-mono">
              <div className="flex justify-between gap-3">
                <span className="text-teal-300">Hiring Rate:</span>
                <strong className="text-white">{activePt.rate}%</strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-amber-300">Target Floor:</span>
                <strong className="text-amber-200">{activePt.target}%</strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-emerald-300">Deployed Hires:</span>
                <strong className="text-emerald-400">{activePt.hires}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiringRateTrendChart;
