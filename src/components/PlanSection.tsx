import React, { useState, useMemo, useRef } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Sparkles,
  Bot,
  Send,
  CheckCircle, 
  CheckCircle2,
  AlertTriangle, 
  AlertCircle,
  Layers, 
  Eye, 
  PlusCircle, 
  Calendar,
  TrendingUp, 
  TrendingDown,
  ShieldAlert,
  UsersRound,
  Workflow, 
  X, 
  ChevronRight,
  Info,
  Clock,
  Briefcase,
  BarChart2,
  User,
  Flag,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download
} from "lucide-react";
import { 
  PlanStatus, 
  ActionItemStatus, 
  RiskLevel, 
  WorkforcePlan 
} from "../types";

interface PlanSectionProps {
  plans: WorkforcePlan[];
  activeCluster: string;
  activeAccount: string;
  onViewPlan: (plan: WorkforcePlan) => void;
  onEditPlan?: (plan: WorkforcePlan) => void;
  onAddActionItem?: (planId: string) => void;
  onCreatePlan: (newPlan: Omit<WorkforcePlan, "id" | "actionItems" | "activityHistory" | "createdAt" | "updatedAt">) => void;
}

// Interface for 6-Week Forecast Data Row
interface ForecastWeekData {
  id: string;
  weekLabel: string;
  dateRange: string;
  requiredHC: number;
  actualHC: number;
  absenteeismCount: number;
  absenteeismPct: number;
  attritionCount: number;
  attritionPct: number;
  acceptedJO: number;
  nho: number;
  fst: number;
  pst: number;
  goLive: number;
  hiringRatePct: number;
}


type StaticForecastCardRow = {
  weekNumber: number;
  acceptedJO: number;
  nho: number;
  fst: number;
  pst: number;
  goLive: number;
  leadsToInterview: number;
  interviewsCompleted: number;
  hiringRate: number;
  targetFloor: number;
};

type ForecastGraphRow = StaticForecastCardRow & {
  weekLabel: string;
  acceptedJo: number;
  hiredCount: number;
  yieldPct: number;
};

type PipelineDrop = {
  label: string;
  count: number;
  percent: number;
};

type PipelineSummary = {
  acceptedJo: number;
  nho: number;
  fst: number;
  pst: number;
  goLive: number;
  drops: PipelineDrop[];
  totalLosses: number;
  overallConversion: number;
  cumulativeLossRate: number;
};

function safeForecastNumber(value: unknown) {
  const numberValue = Number(
    String(value ?? 0)
      .replace(/,/g, "")
      .replace(/%/g, "")
  );

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatOverviewNumber(value: unknown) {
  return safeForecastNumber(value).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

function formatForecastPercent(value: unknown, decimals = 1) {
  return `${safeForecastNumber(value).toFixed(decimals)}%`;
}

function averageForecastRows(
  rows: Array<Record<string, unknown>>,
  key: string
) {
  if (!rows.length) return 0;

  return (
    rows.reduce(
      (total, row) => total + safeForecastNumber(row?.[key]),
      0
    ) / rows.length
  );
}

function sumForecastRows(
  rows: Array<Record<string, unknown>>,
  key: string
) {
  return rows.reduce(
    (total, row) => total + safeForecastNumber(row?.[key]),
    0
  );
}

function normalizeForecastGraphRow(
  row: StaticForecastCardRow,
  index = 0
): ForecastGraphRow {
  const acceptedJo = safeForecastNumber(row.acceptedJO);
  const leadsToInterview = safeForecastNumber(row.leadsToInterview);
  const interviewsCompleted = safeForecastNumber(row.interviewsCompleted);
  const hiringRate = safeForecastNumber(row.hiringRate);
  const goLive = safeForecastNumber(row.goLive);

  return {
    ...row,
    weekLabel: row.weekNumber ? `Week ${row.weekNumber}` : `Week ${index + 1}`,
    acceptedJo,
    hiredCount: goLive,
    leadsToInterview,
    interviewsCompleted,
    hiringRate,
    yieldPct:
      leadsToInterview > 0
        ? (interviewsCompleted / leadsToInterview) * 100
        : 0,
    targetFloor: safeForecastNumber(row.targetFloor || 20),
  };
}

function getPipelineDrop(fromValue: number, toValue: number) {
  const count = Math.max(
    0,
    Math.round(
      safeForecastNumber(fromValue) - safeForecastNumber(toValue)
    )
  );
  const percent =
    fromValue > 0 ? (count / safeForecastNumber(fromValue)) * 100 : 0;

  return { count, percent };
}

function getPipelineSummary(rows: ForecastGraphRow[]): PipelineSummary {
  if (!rows.length) {
    return {
      acceptedJo: 0,
      nho: 0,
      fst: 0,
      pst: 0,
      goLive: 0,
      drops: [],
      totalLosses: 0,
      overallConversion: 0,
      cumulativeLossRate: 0,
    };
  }

  const rowRecords = rows as unknown as Array<Record<string, unknown>>;
  const acceptedJo = Math.round(averageForecastRows(rowRecords, "acceptedJo"));
  const nho = Math.round(averageForecastRows(rowRecords, "nho"));
  const fst = Math.round(averageForecastRows(rowRecords, "fst"));
  const pst = Math.round(averageForecastRows(rowRecords, "pst"));
  const goLive = Math.round(averageForecastRows(rowRecords, "goLive"));

  const drops: PipelineDrop[] = [
    { label: "JO → NHO", ...getPipelineDrop(acceptedJo, nho) },
    { label: "NHO → FST", ...getPipelineDrop(nho, fst) },
    { label: "FST → PST", ...getPipelineDrop(fst, pst) },
    { label: "PST → Go Live", ...getPipelineDrop(pst, goLive) },
  ];

  const totalLosses = Math.max(0, acceptedJo - goLive);
  const overallConversion =
    acceptedJo > 0 ? (goLive / acceptedJo) * 100 : 0;
  const cumulativeLossRate =
    acceptedJo > 0 ? (totalLosses / acceptedJo) * 100 : 0;

  return {
    acceptedJo,
    nho,
    fst,
    pst,
    goLive,
    drops,
    totalLosses,
    overallConversion,
    cumulativeLossRate,
  };
}

type AnalyticsCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  iconBoxClassName: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeClassName: string;
  children: React.ReactNode;
  footerLabel: string;
  footerValue: string;
  footerValueClassName: string;
};

function AnalyticsCard({
  title,
  subtitle,
  badge,
  badgeClassName,
  children,
  footerLabel,
  footerValue,
  footerValueClassName,
}: AnalyticsCardProps) {
  return (
    <article className="flex h-full min-h-[360px] 2xl:min-h-[390px] flex-col overflow-hidden rounded-xl border border-[#DDE5EE] bg-white p-3.5 2xl:p-4 shadow-sm">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E9EEF4] pb-2.5">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-sm 2xl:text-base font-bold text-sibs-navy tracking-tight">
            {title}
          </h3>
          <p className="mt-0.5 truncate sibs-text-xs font-semibold text-[#667085]">
            {subtitle}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 sibs-text-micro font-extrabold ${badgeClassName}`}
        >
          {badge}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col py-3 2xl:py-4">
        {children}
      </div>

      <div className="mt-auto flex shrink-0 items-center justify-between gap-3 border-t border-[#E9EEF4] pt-2.5 sibs-text-micro font-bold">
        <span className="font-semibold text-[#667085]">{footerLabel}:</span>
        <strong className={`text-right font-extrabold ${footerValueClassName}`}>
          {footerValue}
        </strong>
      </div>
    </article>
  );
}

function PipelineFlowVisual({
  pipeline,
}: {
  pipeline: PipelineSummary;
}) {
  const stages = [
    { key: "acceptedJo", lines: ["Accepted", "Job Offer"], color: "#042C51" },
    { key: "nho", lines: ["NHO", "Count"], color: "#2563EB" },
    { key: "fst", lines: ["FST", "Count"], color: "#0D9488" },
    { key: "pst", lines: ["PST", "Count"], color: "#F97316" },
    { key: "goLive", lines: ["Go", "Live"], color: "#15803D" },
  ].map((stage) => ({
    ...stage,
    value: safeForecastNumber(
      pipeline[stage.key as keyof PipelineSummary]
    ),
  }));

  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);
  const width = 760;
  const height = 255;
  const baseY = 174;
  const barWidth = 70;
  const gap = 80;
  const startX = 25;
  const minHeight = 72;
  const maxHeight = 118;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[245px] w-full">
      {stages.map((stage, index) => {
        const x = startX + index * (barWidth + gap);
        const barHeight =
          minHeight +
          (stage.value / maxValue) * (maxHeight - minHeight);
        const y = baseY - barHeight;
        const nextStage = stages[index + 1];
        const nextX = startX + (index + 1) * (barWidth + gap);
        const nextHeight = nextStage
          ? minHeight +
            (nextStage.value / maxValue) * (maxHeight - minHeight)
          : barHeight;
        const nextY = baseY - nextHeight;
        const drop = pipeline.drops[index];
        const dropX = (x + barWidth + nextX) / 2;

        return (
          <g key={stage.key}>
            <text
              x={x + barWidth / 2}
              y="18"
              textAnchor="middle"
              fill="#042C51"
              fontSize="10"
              fontWeight="800"
            >
              <tspan x={x + barWidth / 2}>{stage.lines[0]}</tspan>
              <tspan
                x={x + barWidth / 2}
                dy="11"
                fill="#6B88A8"
                fontSize="8.5"
              >
                {stage.lines[1]}
              </tspan>
            </text>

            {nextStage ? (
              <polygon
                points={`${x + barWidth},${y} ${nextX},${nextY} ${nextX},${baseY} ${x + barWidth},${baseY}`}
                fill="#FDEAEA"
                stroke="#F8CACA"
                strokeWidth="0.6"
              />
            ) : null}

            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="4"
              fill={stage.color}
            />

            <text
              x={x + barWidth / 2}
              y={y + barHeight / 2 + 4}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="14"
              fontWeight="900"
            >
              {formatOverviewNumber(stage.value)}
            </text>

            <line
              x1={x + barWidth / 2}
              x2={x + barWidth / 2}
              y1={baseY + 7}
              y2={baseY + 18}
              stroke="#94A3B8"
              strokeWidth="0.9"
            />
            <path
              d={`M ${x + barWidth / 2 - 3} ${baseY + 13} L ${x + barWidth / 2} ${baseY + 7} L ${x + barWidth / 2 + 3} ${baseY + 9}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="0.9"
            />

            {drop ? (
              <text
                x={dropX}
                y={baseY + 27}
                textAnchor="middle"
                fill="#DC2626"
                fontSize="8.5"
                fontWeight="800"
              >
                -{formatOverviewNumber(drop.count)} (-{drop.percent.toFixed(2)}%)
              </text>
            ) : null}
          </g>
        );
      })}

      <text
        x={width / 2}
        y={height - 10}
        textAnchor="middle"
        fill="#DC2626"
        fontSize="10"
        fontWeight="800"
      >
        Drop = Attrition Count (% Attrition)
      </text>
    </svg>
  );
}

function AttritionStageList({ drops = [] }: { drops?: PipelineDrop[] }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-3">
      {drops.map((drop) => (
        <div
          key={drop.label}
          className="flex items-center justify-between gap-3 rounded-[7px] border border-[#E9EEF4] bg-[#F8FAFC] px-3 py-3"
        >
          <span className="text-[11px] font-semibold text-[#344054]">
            {drop.label}:
          </span>
          <strong className="text-right text-[10px] font-extrabold text-rose-600">
            {formatOverviewNumber(drop.count)} candidates (
            {formatForecastPercent(drop.percent, 1)})
          </strong>
        </div>
      ))}
    </div>
  );
}

function LeadsTrendChart({ rows = [] }: { rows?: ForecastGraphRow[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pointerPos, setPointerPos] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = 760;
  const height = 250;
  const padLeft = 46;
  const padRight = 24;
  const padTop = 38;
  const padBottom = 34;

  const maxInterview = Math.max(
    1,
    ...rows.map((row) => safeForecastNumber(row.interviewsCompleted))
  );
  const maxLead = Math.max(
    1,
    ...rows.map((row) => safeForecastNumber(row.leadsToInterview))
  );
  const yMax = Math.max(100, Math.ceil(maxInterview / 25) * 25);
  const leadScale = maxLead > 0 ? maxLead / yMax : 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.round(yMax * ratio)
  );

  function getX(index: number) {
    if (rows.length <= 1) return padLeft;

    return (
      padLeft +
      (index / (rows.length - 1)) * (width - padLeft - padRight)
    );
  }

  function getY(value: number) {
    return (
      height -
      padBottom -
      (safeForecastNumber(value) / yMax) *
        (height - padTop - padBottom)
    );
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current || !rows.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * width;
    const chartW = width - padLeft - padRight;
    const normalized = Math.min(
      Math.max((relativeX - padLeft) / chartW, 0),
      1
    );
    const nearestIndex = Math.round(normalized * (rows.length - 1));

    setActiveIndex(nearestIndex);
    setPointerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  function handleMouseLeave() {
    setActiveIndex(null);
    setPointerPos(null);
  }

  const tooltipStyle = useMemo<React.CSSProperties>(() => {
    if (!pointerPos || activeIndex === null) return {};

    const cardWidth = 175;
    const cardHeight = 115;
    const activeXPixels =
      (getX(activeIndex) / width) * pointerPos.width;
    let left = activeXPixels + 14;

    if (left + cardWidth > pointerPos.width - 12) {
      left = activeXPixels - cardWidth - 14;
    }

    left = Math.max(
      12,
      Math.min(left, pointerPos.width - cardWidth - 12)
    );

    let top = pointerPos.y - cardHeight / 2;
    top = Math.max(
      12,
      Math.min(top, pointerPos.height - cardHeight - 12)
    );

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  }, [pointerPos, activeIndex]);

  const interviewPath = rows
    .map(
      (row, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(
          row.interviewsCompleted
        )}`
    )
    .join(" ");

  const leadPath = rows
    .map(
      (row, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(
          row.leadsToInterview / leadScale
        )}`
    )
    .join(" ");

  const activeRow =
    activeIndex !== null ? rows[activeIndex] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-0 flex-1 flex-col"
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[245px] w-full">
        {ticks.map((tick) => {
          const y = getY(tick);

          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#E8EDF3"
                strokeWidth="1"
              />
              <text
                x={padLeft - 7}
                y={y + 3}
                textAnchor="end"
                fill="#0F172A"
                fontSize="10"
                fontWeight="700"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {activeIndex !== null ? (
          <line
            x1={getX(activeIndex)}
            x2={getX(activeIndex)}
            y1={padTop - 10}
            y2={height - padBottom}
            stroke="#042C51"
            strokeWidth="1.3"
            strokeDasharray="4 4"
            pointerEvents="none"
          />
        ) : null}

        <path
          d={leadPath}
          fill="none"
          stroke="#C084FC"
          strokeWidth="2"
          strokeDasharray="4 3"
          opacity="0.65"
        />

        <path
          d={interviewPath}
          fill="none"
          stroke="#7C3AED"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {rows.map((row, index) => {
          const x = getX(index);
          const y = getY(row.interviewsCompleted);
          const isActive = activeIndex === index;

          return (
            <g
              key={`${row.weekLabel}-${index}`}
              className="cursor-pointer"
            >
              <rect
                x={x - 16}
                y={padTop - 10}
                width="32"
                height={height - padTop - padBottom + 18}
                fill="transparent"
              />
              <text
                x={x}
                y={y - (isActive ? 10 : 8)}
                textAnchor="middle"
                fill={isActive ? "#7C3AED" : "#0F172A"}
                fontSize={isActive ? "12" : "11"}
                fontWeight="800"
              >
                {formatOverviewNumber(row.interviewsCompleted)}
              </text>
              <circle
                cx={x}
                cy={y}
                r={isActive ? "6.5" : "5"}
                fill="#7C3AED"
                stroke="#FFFFFF"
                strokeWidth={isActive ? "2" : "1.5"}
              />
              <text
                x={x}
                y={height - 5}
                textAnchor="middle"
                fill={isActive ? "#042C51" : "#64748B"}
                fontSize="10"
                fontWeight={isActive ? "800" : "700"}
              >
                {row.weekLabel}
              </text>
            </g>
          );
        })}
      </svg>

      {activeRow ? (
        <div
          style={tooltipStyle}
          className="pointer-events-none absolute z-20 min-w-[165px] rounded-xl border border-[#315779] bg-[#042C51]/95 p-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-sm transition-all duration-75"
        >
          <p className="border-b border-[#315779] pb-1.5 font-jakarta text-[11px] font-extrabold uppercase tracking-wide text-[#D7E0EA]">
            {activeRow.weekLabel.toUpperCase()} DETAILS
          </p>
          <div className="mt-2 space-y-1.5 text-[11px]">
            <p className="flex items-center justify-between gap-3">
              <span className="text-[#D7E0EA]">Interviews:</span>
              <strong className="font-extrabold text-violet-300">
                {formatOverviewNumber(activeRow.interviewsCompleted)}
              </strong>
            </p>
            <p className="flex items-center justify-between gap-3">
              <span className="text-[#D7E0EA]">Total Leads:</span>
              <strong className="font-extrabold text-slate-200">
                {formatOverviewNumber(activeRow.leadsToInterview)}
              </strong>
            </p>
            <p className="flex items-center justify-between gap-3">
              <span className="text-[#D7E0EA]">Yield %:</span>
              <strong className="font-extrabold text-emerald-400">
                {formatForecastPercent(activeRow.yieldPct, 1)}
              </strong>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HiringRateTrendChart({ rows = [] }: { rows?: ForecastGraphRow[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pointerPos, setPointerPos] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = 760;
  const height = 250;
  const padLeft = 50;
  const padRight = 24;
  const padTop = 38;
  const padBottom = 34;

  const minRate = Math.min(
    10,
    ...rows.map((row) => safeForecastNumber(row.hiringRate))
  );
  const maxRate = Math.max(
    25,
    ...rows.map((row) => safeForecastNumber(row.hiringRate)),
    ...rows.map((row) => safeForecastNumber(row.targetFloor))
  );
  const yMin = Math.floor(minRate / 5) * 5;
  const yMax = Math.ceil(maxRate / 5) * 5;
  const range = Math.max(5, yMax - yMin);
  const tickStep = range / 3;
  const ticks = [0, 1, 2, 3].map(
    (index) => yMin + tickStep * index
  );

  function getX(index: number) {
    if (rows.length <= 1) return padLeft;

    return (
      padLeft +
      (index / (rows.length - 1)) * (width - padLeft - padRight)
    );
  }

  function getY(value: number) {
    return (
      height -
      padBottom -
      ((safeForecastNumber(value) - yMin) / range) *
        (height - padTop - padBottom)
    );
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current || !rows.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * width;
    const chartW = width - padLeft - padRight;
    const normalized = Math.min(
      Math.max((relativeX - padLeft) / chartW, 0),
      1
    );
    const nearestIndex = Math.round(normalized * (rows.length - 1));

    setActiveIndex(nearestIndex);
    setPointerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  function handleMouseLeave() {
    setActiveIndex(null);
    setPointerPos(null);
  }

  const tooltipStyle = useMemo<React.CSSProperties>(() => {
    if (!pointerPos || activeIndex === null) return {};

    const cardWidth = 175;
    const cardHeight = 115;
    const activeXPixels =
      (getX(activeIndex) / width) * pointerPos.width;
    let left = activeXPixels + 14;

    if (left + cardWidth > pointerPos.width - 12) {
      left = activeXPixels - cardWidth - 14;
    }

    left = Math.max(
      12,
      Math.min(left, pointerPos.width - cardWidth - 12)
    );

    let top = pointerPos.y - cardHeight / 2;
    top = Math.max(
      12,
      Math.min(top, pointerPos.height - cardHeight - 12)
    );

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  }, [pointerPos, activeIndex]);

  const ratePath = rows
    .map(
      (row, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(
          row.hiringRate
        )}`
    )
    .join(" ");

  const rowRecords = rows as unknown as Array<Record<string, unknown>>;
  const targetFloor = rows.length
    ? averageForecastRows(rowRecords, "targetFloor") || 20
    : 20;
  const targetY = getY(targetFloor);
  const activeRow =
    activeIndex !== null ? rows[activeIndex] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-0 flex-1 flex-col"
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[245px] w-full">
        {ticks.map((tick) => {
          const y = getY(tick);

          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#E8EDF3"
                strokeWidth="1"
              />
              <text
                x={padLeft - 7}
                y={y + 3}
                textAnchor="end"
                fill="#0F172A"
                fontSize="10"
                fontWeight="700"
              >
                {Math.round(tick)}%
              </text>
            </g>
          );
        })}

        {activeIndex !== null ? (
          <line
            x1={getX(activeIndex)}
            x2={getX(activeIndex)}
            y1={padTop - 10}
            y2={height - padBottom}
            stroke="#042C51"
            strokeWidth="1.3"
            strokeDasharray="4 4"
            pointerEvents="none"
          />
        ) : null}

        <line
          x1={padLeft}
          y1={targetY}
          x2={width - padRight}
          y2={targetY}
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeDasharray="3 2"
        />

        <path
          d={ratePath}
          fill="none"
          stroke="#0D9488"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {rows.map((row, index) => {
          const x = getX(index);
          const y = getY(row.hiringRate);
          const isActive = activeIndex === index;

          return (
            <g
              key={`${row.weekLabel}-${index}`}
              className="cursor-pointer"
            >
              <rect
                x={x - 16}
                y={padTop - 10}
                width="32"
                height={height - padTop - padBottom + 18}
                fill="transparent"
              />
              <text
                x={x}
                y={y - (isActive ? 10 : 8)}
                textAnchor="middle"
                fill={isActive ? "#0D9488" : "#0F172A"}
                fontSize={isActive ? "12" : "11"}
                fontWeight="800"
              >
                {formatForecastPercent(row.hiringRate, 1)}
              </text>
              <circle
                cx={x}
                cy={y}
                r={isActive ? "6.5" : "5"}
                fill="#0D9488"
                stroke="#FFFFFF"
                strokeWidth={isActive ? "2" : "1.5"}
              />
              <text
                x={x}
                y={height - 5}
                textAnchor="middle"
                fill={isActive ? "#042C51" : "#64748B"}
                fontSize="10"
                fontWeight={isActive ? "800" : "700"}
              >
                {row.weekLabel}
              </text>
            </g>
          );
        })}
      </svg>

      {activeRow ? (
        <div
          style={tooltipStyle}
          className="pointer-events-none absolute z-20 min-w-[165px] rounded-xl border border-[#315779] bg-[#042C51]/95 p-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-sm transition-all duration-75"
        >
          <p className="border-b border-[#315779] pb-1.5 font-jakarta text-[11px] font-extrabold uppercase tracking-wide text-[#D7E0EA]">
            {activeRow.weekLabel.toUpperCase()} YIELD DETAILS
          </p>
          <div className="mt-2 space-y-1.5 text-[11px]">
            <p className="flex items-center justify-between gap-3">
              <span className="text-[#D7E0EA]">Hiring Rate:</span>
              <strong className="font-extrabold text-teal-300">
                {formatForecastPercent(activeRow.hiringRate, 1)}
              </strong>
            </p>
            <p className="flex items-center justify-between gap-3">
              <span className="text-[#D7E0EA]">Target Floor:</span>
              <strong className="font-extrabold text-amber-300">
                {formatForecastPercent(activeRow.targetFloor, 0)}
              </strong>
            </p>
            <p className="flex items-center justify-between gap-3">
              <span className="text-[#D7E0EA]">Deployed Hires:</span>
              <strong className="font-extrabold text-emerald-400">
                {formatOverviewNumber(activeRow.hiredCount)}
              </strong>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ForecastBottomGraphsInline({
  rows = [],
}: {
  rows?: StaticForecastCardRow[];
}) {
  const graphRows = useMemo(
    () => rows.map(normalizeForecastGraphRow),
    [rows]
  );
  const pipeline = useMemo(
    () => getPipelineSummary(graphRows),
    [graphRows]
  );

  if (!graphRows.length) return null;

  const rowRecords =
    graphRows as unknown as Array<Record<string, unknown>>;
  const totalLeads = Math.round(
    sumForecastRows(rowRecords, "leadsToInterview")
  );
  const totalInterviews = Math.round(
    sumForecastRows(rowRecords, "interviewsCompleted")
  );
  const averageYield =
    totalLeads > 0
      ? (totalInterviews / totalLeads) * 100
      : averageForecastRows(rowRecords, "yieldPct");
  const weeklyAverageLeads = graphRows.length
    ? Math.round(totalLeads / graphRows.length)
    : 0;
  const averageHiringRate = averageForecastRows(
    rowRecords,
    "hiringRate"
  );
  const averageTargetFloor =
    averageForecastRows(rowRecords, "targetFloor") || 20;
  const deployedCount = pipeline.goLive;
  const isOnTarget = averageHiringRate >= averageTargetFloor;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-10">
        <div className="xl:col-span-7">
          <AnalyticsCard
            icon={Workflow}
            iconBoxClassName="bg-[#042C51]"
            iconClassName="text-white"
            title="Pipeline Flow – Total (6 Weeks)"
            subtitle="6-Week Cumulative Training Funnel"
            badge={`${formatOverviewNumber(pipeline.acceptedJo)} JO`}
            badgeClassName="border-blue-100 bg-blue-50 text-blue-700"
            footerLabel="Overall Conversion"
            footerValue={`${formatForecastPercent(
              pipeline.overallConversion,
              1
            )} (JO to Live)`}
            footerValueClassName="text-[#F97316]"
          >
            <PipelineFlowVisual pipeline={pipeline} />
          </AnalyticsCard>
        </div>

        <div className="xl:col-span-3">
          <AnalyticsCard
            icon={ShieldAlert}
            iconBoxClassName="bg-rose-50"
            iconClassName="text-rose-600"
            title="Attrition by Stage – Total (6 Weeks)"
            subtitle="Stage Drop-off Loss Breakdown"
            badge={`${formatOverviewNumber(
              pipeline.totalLosses
            )} Losses`}
            badgeClassName="border-rose-100 bg-rose-50 text-rose-600"
            footerLabel="Cumulative Loss Rate"
            footerValue={`${formatForecastPercent(
              pipeline.cumulativeLossRate,
              1
            )} Total Drop`}
            footerValueClassName="text-rose-600"
          >
            <AttritionStageList drops={pipeline.drops} />
          </AnalyticsCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnalyticsCard
          icon={UsersRound}
          iconBoxClassName="bg-violet-50"
          iconClassName="text-violet-600"
          title="Leads to Interview Trend"
          subtitle="6-Week Sourcing Volume & Yield"
          badge={`${formatOverviewNumber(totalLeads)} Leads`}
          badgeClassName="border-violet-100 bg-violet-50 text-violet-700"
          footerLabel="Weekly Avg Sourcing"
          footerValue={`${formatOverviewNumber(
            weeklyAverageLeads
          )} Leads / Wk`}
          footerValueClassName="text-violet-700"
        >
          <div className="mb-1 flex items-end justify-between gap-3">
            <div>
              <strong className="text-[20px] font-black leading-none text-[#042C51]">
                {formatOverviewNumber(totalInterviews)}
              </strong>
              <span className="ml-1 text-[8px] font-bold uppercase text-[#6B88A8]">
                Interviews
              </span>
            </div>
            <strong className="text-[10px] font-extrabold text-violet-600">
              {formatForecastPercent(averageYield, 1)} Avg Yield
            </strong>
          </div>

          <div className="mb-1 flex items-center justify-between gap-3 border-b border-[#E9EEF4] pb-1.5 text-[8px] font-bold">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-violet-700">
                <span className="h-2 w-2 rounded-full bg-violet-600" />
                Interviews Completed
              </span>
              <span className="inline-flex items-center gap-1 text-[#A78BFA]">
                <span className="w-3 border-t border-dashed border-[#C084FC]" />
                Leads Vol (Ref)
              </span>
            </div>
            <span className="text-[#94A3B8]">6-Wk Trend</span>
          </div>

          <LeadsTrendChart rows={graphRows} />
        </AnalyticsCard>

        <AnalyticsCard
          icon={TrendingUp}
          iconBoxClassName="bg-teal-50"
          iconClassName="text-teal-600"
          title="Hiring Rate Trend"
          subtitle="6-Week Lead-to-JO Yield %"
          badge={`${formatForecastPercent(
            averageHiringRate,
            1
          )} Avg`}
          badgeClassName="border-teal-100 bg-teal-50 text-teal-700"
          footerLabel="6-Wk Target Status"
          footerValue={
            isOnTarget
              ? `On Target (≥ ${formatForecastPercent(
                  averageTargetFloor,
                  0
                )})`
              : `Below Target (< ${formatForecastPercent(
                  averageTargetFloor,
                  0
                )})`
          }
          footerValueClassName={
            isOnTarget ? "text-teal-700" : "text-rose-600"
          }
        >
          <div className="mb-1 flex items-end justify-between gap-3">
            <div>
              <strong className="text-[20px] font-black leading-none text-teal-600">
                {formatForecastPercent(averageHiringRate, 1)}
              </strong>
              <span className="ml-1 text-[8px] font-bold uppercase text-[#6B88A8]">
                JO Yield
              </span>
            </div>
            <strong className="text-[10px] font-extrabold text-emerald-600">
              {formatOverviewNumber(deployedCount)} Deployed
            </strong>
          </div>

          <div className="mb-1 flex items-center justify-between gap-3 border-b border-[#E9EEF4] pb-1.5 text-[8px] font-bold">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-teal-700">
                <span className="h-2 w-2 rounded-full bg-teal-600" />
                Hiring Rate %
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <span className="w-3 border-t border-dashed border-amber-500" />
                Target Floor (20%)
              </span>
            </div>
            <span className="text-[#94A3B8]">6-Wk Trend</span>
          </div>

          <HiringRateTrendChart rows={graphRows} />
        </AnalyticsCard>
      </div>
    </section>
  );
}

export default function PlanSection({
  plans,
  activeCluster,
  activeAccount,
  onViewPlan,
  onAddActionItem,
  onCreatePlan
}: PlanSectionProps) {
  // Versioning & Scope Controls
  const [selectedVersion, setSelectedVersion] = useState("2024 - Week 20 | May 13 - May 19");
  const [selectedCluster, setSelectedCluster] = useState("All");
  const [selectedAccount, setSelectedAccount] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewPlanModalOpen, setIsViewPlanModalOpen] = useState(false);
  const [selectedWeekDetails, setSelectedWeekDetails] = useState<ForecastWeekData | null>(null);
  
  // Action Item Setup Modal
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionForm, setActionForm] = useState({
    title: "",
    targetAccount: "Verizon Tech",
    assignee: "Sarah Jenkins (WFM Principal)",
    priority: "High" as "High" | "Medium" | "Low",
    targetDate: "2026-08-15"
  });

  // Status Modal Feedback
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "warning" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

  // Graph Series Active Toggles
  const [activeSeries, setActiveSeries] = useState({
    required: true,
    actual: true,
    absenteeism: true,
    attrition: true
  });

  // AI Modal Interactive Chat State
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ sender: "ai" | "user"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your SiBS AI Workforce Intelligence Advisor. I have analyzed your 6-Week Forecast Headcount Plan for Week 20 - Week 25. Noticeable capacity risks exist in Telecom & Tech (Account: Verizon Tech & Comcast Core) due to an upcoming 12.4% attrition spike in Week 22. How can I assist you with scenario planning today?",
      time: "Just now"
    }
  ]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const showStatus = (type: "success" | "warning" | "error", title: string, message: string) => {
    setStatusModal({ isOpen: true, type, title, message });
  };

  // Drag-to-Scroll refs and handlers for Table 1 (Forecast Plan)
  const table1Ref = useRef<HTMLDivElement>(null);
  const [isMouseDown1, setIsMouseDown1] = useState(false);
  const [startX1, setStartX1] = useState(0);
  const [scrollLeft1, setScrollLeft1] = useState(0);

  const handleMouseDown1 = (e: React.MouseEvent) => {
    if (!table1Ref.current) return;
    setIsMouseDown1(true);
    setStartX1(e.pageX - table1Ref.current.offsetLeft);
    setScrollLeft1(table1Ref.current.scrollLeft);
  };
  const handleMouseLeave1 = () => setIsMouseDown1(false);
  const handleMouseUp1 = () => setIsMouseDown1(false);
  const handleMouseMove1 = (e: React.MouseEvent) => {
    if (!isMouseDown1 || !table1Ref.current) return;
    e.preventDefault();
    const x = e.pageX - table1Ref.current.offsetLeft;
    const walk = (x - startX1) * 1.5;
    table1Ref.current.scrollLeft = scrollLeft1 - walk;
  };

  // Drag-to-Scroll refs and handlers for Table 2 (Accounts Plan)
  const table2Ref = useRef<HTMLDivElement>(null);
  const [isMouseDown2, setIsMouseDown2] = useState(false);
  const [startX2, setStartX2] = useState(0);
  const [scrollLeft2, setScrollLeft2] = useState(0);

  const handleMouseDown2 = (e: React.MouseEvent) => {
    if (!table2Ref.current) return;
    setIsMouseDown2(true);
    setStartX2(e.pageX - table2Ref.current.offsetLeft);
    setScrollLeft2(table2Ref.current.scrollLeft);
  };
  const handleMouseLeave2 = () => setIsMouseDown2(false);
  const handleMouseUp2 = () => setIsMouseDown2(false);
  const handleMouseMove2 = (e: React.MouseEvent) => {
    if (!isMouseDown2 || !table2Ref.current) return;
    e.preventDefault();
    const x = e.pageX - table2Ref.current.offsetLeft;
    const walk = (x - startX2) * 1.5;
    table2Ref.current.scrollLeft = scrollLeft2 - walk;
  };

  // Mock 6-Week Forecast Horizon Data
  const forecastWeeks: ForecastWeekData[] = useMemo(() => {
    return [
      {
        id: "w20",
        weekLabel: "Week 20",
        dateRange: "May 13 - May 19, 2024",
        requiredHC: 1250,
        actualHC: 1180,
        absenteeismCount: 62,
        absenteeismPct: 5.25,
        attritionCount: 48,
        attritionPct: 4.07,
        acceptedJO: 145,
        nho: 130,
        fst: 115,
        pst: 102,
        goLive: 95,
        hiringRatePct: 65.5
      },
      {
        id: "w21",
        weekLabel: "Week 21",
        dateRange: "May 20 - May 26, 2024",
        requiredHC: 1280,
        actualHC: 1205,
        absenteeismCount: 68,
        absenteeismPct: 5.64,
        attritionCount: 52,
        attritionPct: 4.32,
        acceptedJO: 160,
        nho: 142,
        fst: 128,
        pst: 114,
        goLive: 105,
        hiringRatePct: 65.6
      },
      {
        id: "w22",
        weekLabel: "Week 22",
        dateRange: "May 27 - Jun 02, 2024",
        requiredHC: 1310,
        actualHC: 1210,
        absenteeismCount: 74,
        absenteeismPct: 6.12,
        attritionCount: 65,
        attritionPct: 5.37,
        acceptedJO: 180,
        nho: 158,
        fst: 140,
        pst: 122,
        goLive: 110,
        hiringRatePct: 61.1
      },
      {
        id: "w23",
        weekLabel: "Week 23",
        dateRange: "Jun 03 - Jun 09, 2024",
        requiredHC: 1350,
        actualHC: 1245,
        absenteeismCount: 71,
        absenteeismPct: 5.70,
        attritionCount: 58,
        attritionPct: 4.66,
        acceptedJO: 195,
        nho: 172,
        fst: 155,
        pst: 138,
        goLive: 125,
        hiringRatePct: 64.1
      },
      {
        id: "w24",
        weekLabel: "Week 24",
        dateRange: "Jun 10 - Jun 16, 2024",
        requiredHC: 1380,
        actualHC: 1290,
        absenteeismCount: 70,
        absenteeismPct: 5.43,
        attritionCount: 50,
        attritionPct: 3.88,
        acceptedJO: 210,
        nho: 188,
        fst: 168,
        pst: 150,
        goLive: 138,
        hiringRatePct: 65.7
      },
      {
        id: "w25",
        weekLabel: "Week 25",
        dateRange: "Jun 17 - Jun 23, 2024",
        requiredHC: 1400,
        actualHC: 1340,
        absenteeismCount: 65,
        absenteeismPct: 4.85,
        attritionCount: 45,
        attritionPct: 3.36,
        acceptedJO: 220,
        nho: 200,
        fst: 180,
        pst: 165,
        goLive: 152,
        hiringRatePct: 69.1
      }
    ];
  }, []);

  // Executive Summary Calculation for Top Metric Cards
  const topMetrics = useMemo(() => {
    const totalReq = forecastWeeks[0].requiredHC;
    const totalAct = forecastWeeks[0].actualHC;
    const abs = forecastWeeks[0].absenteeismCount;
    const att = forecastWeeks[0].attritionCount;
    const netAct = totalAct - abs - att;
    const bufferPct = Number((((netAct - totalReq) / totalReq) * 100).toFixed(1));
    const hiringNeeded = Math.max(0, totalReq - netAct);
    const hiredCount = forecastWeeks[0].goLive;
    const hiringRate = forecastWeeks[0].hiringRatePct;
    const targetLeads = Math.round(hiringNeeded / (hiringRate / 100));

    return {
      totalReq,
      totalAct,
      netAct,
      bufferPct,
      hiringNeeded,
      abs,
      att,
      hiredCount,
      targetLeads
    };
  }, [forecastWeeks]);

  // Summary calculation for Table 1 (6-Week Totals / Averages)
  const forecastSummary = useMemo(() => {
    const count = forecastWeeks.length;
    const reqSum = forecastWeeks.reduce((acc, w) => acc + w.requiredHC, 0);
    const actSum = forecastWeeks.reduce((acc, w) => acc + w.actualHC, 0);
    const absSum = forecastWeeks.reduce((acc, w) => acc + w.absenteeismCount, 0);
    const attSum = forecastWeeks.reduce((acc, w) => acc + w.attritionCount, 0);

    const netActSum = forecastWeeks.reduce((acc, w) => {
      const net = w.actualHC - w.absenteeismCount - w.attritionCount;
      return acc + net;
    }, 0);

    const hiringNeededSum = forecastWeeks.reduce((acc, w) => {
      const net = w.actualHC - w.absenteeismCount - w.attritionCount;
      return acc + Math.max(0, w.requiredHC - net);
    }, 0);

    const accJOSum = forecastWeeks.reduce((acc, w) => acc + w.acceptedJO, 0);
    const nhoSum = forecastWeeks.reduce((acc, w) => acc + w.nho, 0);
    const fstSum = forecastWeeks.reduce((acc, w) => acc + w.fst, 0);
    const pstSum = forecastWeeks.reduce((acc, w) => acc + w.pst, 0);
    const goLiveSum = forecastWeeks.reduce((acc, w) => acc + w.goLive, 0);

    const avgReq = Math.round(reqSum / count);
    const avgAct = Math.round(actSum / count);
    const avgNetAct = Math.round(netActSum / count);
    const avgBuffer = avgReq > 0 ? Number((((avgNetAct - avgReq) / avgReq) * 100).toFixed(2)) : 0;
    const avgAbsPct = avgAct > 0 ? Number((((absSum / count) / avgAct) * 100).toFixed(2)) : 0;
    const avgAttPct = avgAct > 0 ? Number((((attSum / count) / avgAct) * 100).toFixed(2)) : 0;
    const avgHiringRate = Number((forecastWeeks.reduce((acc, w) => acc + w.hiringRatePct, 0) / count).toFixed(1));
    const totalLeadsNeeded = Math.round(hiringNeededSum / (avgHiringRate / 100));

    return {
      avgReq,
      avgAct,
      avgNetAct,
      avgBuffer,
      hiringNeededSum,
      absSum,
      avgAbsPct,
      attSum,
      avgAttPct,
      accJOSum,
      nhoSum,
      fstSum,
      pstSum,
      goLiveSum,
      avgHiringRate,
      totalLeadsNeeded
    };
  }, [forecastWeeks]);

  // Filter Account Plans for Table 2
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      if (activeCluster !== "All Clusters" && p.cluster !== activeCluster) return false;
      if (activeAccount !== "All Accounts" && p.account !== activeAccount) return false;
      if (selectedCluster !== "All" && p.cluster !== selectedCluster) return false;
      if (selectedAccount !== "All" && p.account !== selectedAccount) return false;

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          p.account.toLowerCase().includes(query) ||
          p.cluster.toLowerCase().includes(query) ||
          p.owner.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [plans, activeCluster, activeAccount, selectedCluster, selectedAccount, searchQuery]);

  // Summary totals for Table 2 (Details by Cluster / Account)
  const accountsSummary = useMemo(() => {
    const count = filteredPlans.length;
    if (count === 0) {
      return {
        requiredHC: 0,
        actualHC: 0,
        bufferPct: 0,
        netActualHC: 0,
        hiringNeeded: 0,
        absenteeism6Wks: 0,
        absenteeismRatePct: 0,
        attrition6Wks: 0,
        attritionRatePct: 0,
        acceptedJO: 0,
        nho: 0,
        fst: 0,
        pst: 0,
        goLive: 0,
        hiredCount: 0,
        hiringRatePct: 0,
        leadsNeeded: 0
      };
    }

    const req = filteredPlans.reduce((s, p) => s + p.requiredHeadcount, 0);
    const act = filteredPlans.reduce((s, p) => s + p.actualHeadcount, 0);
    const abs6Wks = filteredPlans.reduce((s, p) => s + (p.kpiSnapshot.absenteeismCount * 6), 0);
    const att6Wks = filteredPlans.reduce((s, p) => s + (p.kpiSnapshot.attritionCount * 6), 0);

    const netAct = filteredPlans.reduce((s, p) => {
      const net = p.actualHeadcount - p.kpiSnapshot.absenteeismCount - p.kpiSnapshot.attritionCount;
      return s + net;
    }, 0);

    const hireNeed = filteredPlans.reduce((s, p) => s + p.hiringNeeded, 0);
    const accJO = filteredPlans.reduce((s, p) => s + p.kpiSnapshot.acceptedJO, 0);
    const nho = filteredPlans.reduce((s, p) => s + p.kpiSnapshot.nho, 0);
    const fst = filteredPlans.reduce((s, p) => s + p.kpiSnapshot.fst, 0);
    const pst = filteredPlans.reduce((s, p) => s + p.kpiSnapshot.pst, 0);
    const goLive = filteredPlans.reduce((s, p) => s + p.kpiSnapshot.goLive, 0);
    const hired = filteredPlans.reduce((s, p) => s + p.hiredCount, 0);
    const leads = filteredPlans.reduce((s, p) => s + p.leadsNeeded, 0);

    const bufPct = req > 0 ? Number((((netAct - req) / req) * 100).toFixed(2)) : 0;
    const absRate = act > 0 ? Number((((abs6Wks / 6) / act) * 100).toFixed(2)) : 0;
    const attRate = act > 0 ? Number((((att6Wks / 6) / act) * 100).toFixed(2)) : 0;
    const avgHireRate = Number((filteredPlans.reduce((s, p) => s + p.hiringRate, 0) / count).toFixed(1));

    return {
      requiredHC: req,
      actualHC: act,
      bufferPct: bufPct,
      netActualHC: netAct,
      hiringNeeded: hireNeed,
      absenteeism6Wks: abs6Wks,
      absenteeismRatePct: absRate,
      attrition6Wks: att6Wks,
      attritionRatePct: attRate,
      acceptedJO: accJO,
      nho,
      fst,
      pst,
      goLive,
      hiredCount: hired,
      hiringRatePct: avgHireRate,
      leadsNeeded: leads
    };
  }, [filteredPlans]);

  // Create Plan Form Handler
  const [newCluster, setNewCluster] = useState("Telecom & Tech");
  const [newAccount, setNewAccount] = useState("");
  const [newPeriod, setNewPeriod] = useState("Q3 2026 Ramp");
  const [newReq, setNewReq] = useState(400);
  const [newAct, setNewAct] = useState(380);
  const [newHired, setNewHired] = useState(15);
  const [newHiringRate, setNewHiringRate] = useState(65);

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.trim()) {
      alert("Please specify a valid Account Name.");
      return;
    }

    const hiringNeeded = Math.max(0, newReq - newAct);
    const leadsNeeded = Math.round(hiringNeeded / (newHiringRate / 100));

    onCreatePlan({
      cluster: newCluster,
      account: newAccount,
      planPeriod: newPeriod,
      requiredHeadcount: newReq,
      actualHeadcount: newAct,
      hiredCount: newHired,
      hiringNeeded,
      hiringRate: newHiringRate,
      leadsNeeded,
      interviewCount: Math.round(leadsNeeded * 0.8),
      fstCount: Math.round(leadsNeeded * 0.5),
      status: PlanStatus.Draft,
      owner: "Sarah Jenkins (WFM Principal)",
      approvedBy: "Pending Operations Review",
      kpiSnapshot: {
        bufferPercentage: parseFloat((((newAct - newReq) / newReq) * 100).toFixed(1)),
        absenteeismCount: Math.round(newAct * 0.08),
        absenteeismPercentage: 8.0,
        attritionCount: Math.round(newAct * 0.04),
        attritionPercentage: 4.0,
        acceptedJO: Math.round(hiringNeeded * 1.2),
        nho: Math.round(hiringNeeded * 1.1),
        fst: Math.round(hiringNeeded * 0.95),
        pst: Math.round(hiringNeeded * 0.85),
        goLive: Math.round(hiringNeeded * 0.8),
        hiredCount: newHired,
        hiringRate: newHiringRate
      },
      pipeline: {
        acceptedJO: Math.round(hiringNeeded * 1.2),
        nho: Math.round(hiringNeeded * 1.1),
        fst: Math.round(hiringNeeded * 0.95),
        pst: Math.round(hiringNeeded * 0.85),
        goLive: Math.round(hiringNeeded * 0.8),
        dropOffs: {
          joToNho: Math.round(hiringNeeded * 0.1),
          nhoToFst: Math.round(hiringNeeded * 0.15),
          fstToPst: Math.round(hiringNeeded * 0.1),
          nhoToPst: Math.round(hiringNeeded * 0.25),
          pstToGoLive: Math.round(hiringNeeded * 0.05)
        }
      }
    });

    setIsCreating(false);
    setNewAccount("");
    showStatus("success", "Workforce Hiring Plan Draft Created", `Draft plan initialized for ${newAccount} under ${newCluster}.`);
  };

  // Action Item Setup Form Handler
  const handleCreateActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionForm.title.trim()) return;

    setIsActionModalOpen(false);
    showStatus(
      "success",
      "Operational Action Item Assigned",
      `Task "${actionForm.title}" assigned to ${actionForm.assignee} for ${actionForm.targetAccount}.`
    );
    setActionForm({
      title: "",
      targetAccount: "Verizon Tech",
      assignee: "Sarah Jenkins (WFM Principal)",
      priority: "High",
      targetDate: "2026-08-15"
    });
  };

  // AI Chat send message
  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userText = aiChatInput;
    setAiMessages(prev => [...prev, { sender: "user", text: userText, time: "Just now" }]);
    setAiChatInput("");

    setTimeout(() => {
      let responseText = "Based on current WFM telemetry, adjusting the FST training start date for Week 22 by 5 days allows 18 additional candidates to pass background checks, reducing the net deficit from 192 to 14 slots.";
      if (userText.toLowerCase().includes("telecom") || userText.toLowerCase().includes("verizon")) {
        responseText = "For Telecom & Tech (Verizon), I recommend opening an accelerated 25-agent FST batch on May 20 (Week 21) to offset the predicted Week 22 spike in attrition.";
      } else if (userText.toLowerCase().includes("batch") || userText.toLowerCase().includes("class")) {
        responseText = "To maximize training yield, schedule NHO on Mondays, FST on Wednesdays, and PST on the following Monday. This schedule historically reduces drop-off by 8.4%.";
      }

      setAiMessages(prev => [...prev, { sender: "ai", text: responseText, time: "Just now" }]);
    }, 600);
  };

  const staticForecastCardRows: StaticForecastCardRow[] = [
    { weekNumber: 20, acceptedJO: 145, nho: 130, fst: 115, pst: 102, goLive: 95, leadsToInterview: 420, interviewsCompleted: 286, hiringRate: 21.4, targetFloor: 20 },
    { weekNumber: 21, acceptedJO: 160, nho: 142, fst: 128, pst: 114, goLive: 105, leadsToInterview: 455, interviewsCompleted: 305, hiringRate: 22.1, targetFloor: 20 },
    { weekNumber: 22, acceptedJO: 180, nho: 158, fst: 140, pst: 122, goLive: 110, leadsToInterview: 510, interviewsCompleted: 338, hiringRate: 21.8, targetFloor: 20 },
    { weekNumber: 23, acceptedJO: 195, nho: 172, fst: 155, pst: 138, goLive: 125, leadsToInterview: 540, interviewsCompleted: 360, hiringRate: 22.7, targetFloor: 20 },
    { weekNumber: 24, acceptedJO: 210, nho: 188, fst: 168, pst: 150, goLive: 138, leadsToInterview: 575, interviewsCompleted: 390, hiringRate: 23.2, targetFloor: 20 },
    { weekNumber: 25, acceptedJO: 220, nho: 200, fst: 180, pst: 165, goLive: 152, leadsToInterview: 610, interviewsCompleted: 420, hiringRate: 24.1, targetFloor: 20 },
  ];

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#042C51] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#E6ECF2] flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-[#2ECC71]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ==================== TOP COMMAND & VERSIONING CONTROL BAR ==================== */}
    

      {/* ==================== 3. EXECUTIVE KPI SUMMARY CARDS ==================== */}
      {/* Component: ForecastWorkforceHiringOverview */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-9 gap-3 min-w-0">
        {/* Required Headcount */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Required HC</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-[#042C51] font-mono">{topMetrics.totalReq.toLocaleString()}</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-100">
              Contract
            </span>
          </div>
        </div>

        {/* Actual Headcount */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Actual HC</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-800 font-mono">{topMetrics.totalAct.toLocaleString()}</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-600 rounded">
              Active
            </span>
          </div>
        </div>

        {/* Net Actual HC */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Net Actual HC</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-[#042C51] font-mono">{topMetrics.netAct.toLocaleString()}</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-navy-900 bg-[#042C51] text-white rounded">
              Effective
            </span>
          </div>
        </div>

        {/* Buffer % */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Buffer %</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-lg font-black font-mono ${topMetrics.bufferPct < 0 ? "text-[#E74C3C]" : "text-[#2ECC71]"}`}>
              {topMetrics.bufferPct}%
            </span>
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${topMetrics.bufferPct < 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
              {topMetrics.bufferPct < 0 ? "Deficit" : "Surplus"}
            </span>
          </div>
        </div>

        {/* Hiring Needed */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Hiring Needed</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-[#E74C3C] font-mono">{topMetrics.hiringNeeded}</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-800 rounded">
              Open Gap
            </span>
          </div>
        </div>

        {/* Absenteeism */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Absenteeism</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-blue-600 font-mono">{topMetrics.abs}</span>
            <span className="text-[10px] font-semibold text-slate-400">5.25%</span>
          </div>
        </div>

        {/* Attrition */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Attrition</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-rose-600 font-mono">{topMetrics.att}</span>
            <span className="text-[10px] font-semibold text-slate-400">4.07%</span>
          </div>
        </div>

        {/* Hired Count */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Hired Deployed</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-emerald-600 font-mono">{topMetrics.hiredCount}</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
              Live
            </span>
          </div>
        </div>

        {/* Target Leads */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Leads</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-purple-700 font-mono">{topMetrics.targetLeads}</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-50 text-purple-700 rounded border border-purple-100">
              Sourcing
            </span>
          </div>
        </div>
      </section>

      {/* ==================== TABLE 1: 6-WEEK FORECAST HEADCOUNT PLAN ==================== */}
      {/* Component: ForecastHeadcountPlanTables */}
      <section className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4 select-none">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-[#042C51] flex items-center gap-2">
              6-Week Forecast Headcount Plan (Weekly Capacities & Milestones)
            </h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Multi-week forecasting matrix mapping headcount requirements, capacity shortfalls, absenteeism, turnover, and milestone class start dates across 6 rolling weeks. <strong className="text-[#042C51]">Click any row to view unit-level week details.</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-extrabold text-[#042C51] bg-[#E9F0FC] px-2.5 py-1 rounded-full border border-blue-200">
              <span>↔ Drag or scroll horizontally to view all 17 columns</span>
            </span>
          </div>
        </div>

        {/* Forecast Table 1 Container with Drag-Scroll */}
        <div
          ref={table1Ref}
          onMouseDown={handleMouseDown1}
          onMouseLeave={handleMouseLeave1}
          onMouseUp={handleMouseUp1}
          onMouseMove={handleMouseMove1}
          className={`w-full max-w-full min-w-0 overflow-x-auto border border-[#E6ECF2] rounded-xl relative select-none cursor-grab ${
            isMouseDown1 ? "cursor-grabbing" : ""
          }`}
        >
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#667085] text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-[#E6ECF2]">
              {/* Category Grouping Row 1 */}
              <tr className="border-b border-[#E6ECF2] bg-[#F1F5F9]/80 text-[#042C51]">
                <th colSpan={2} className="px-3 py-2 bg-[#F1F5F9]/80 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  1. FORECAST WEEK & PERIOD
                </th>
                <th colSpan={5} className="px-3 py-2 bg-[#E9F0FC]/60 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  2. CAPACITY & SHORTFALL
                </th>
                <th colSpan={4} className="px-3 py-2 bg-[#F1F5F9]/80 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  3. WEEKLY LOSS TELEMETRY
                </th>
                <th colSpan={5} className="px-3 py-2 bg-[#E9F0FC]/60 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  4. TRAINING MILESTONE & CONVERSION PIPELINE
                </th>
                <th colSpan={2} className="px-3 py-2 bg-[#F1F5F9]/80 text-[#042C51] text-center font-black">
                  5. YIELD & LEADS TARGET
                </th>
              </tr>

              {/* Individual Column Header Row 2 */}
              <tr className="bg-[#F8FAFC] text-[#667085] border-b border-[#E6ECF2] text-[10px]">
                <th className="px-3 py-2.5 border-r border-[#E6ECF2]">Forecast Week</th>
                <th className="px-3 py-2.5 border-r border-[#E6ECF2]">Date Range</th>

                <th className="px-3 py-2.5 text-right">Required HC</th>
                <th className="px-3 py-2.5 text-right">Actual HC</th>
                <th className="px-3 py-2.5 text-right">Net Actual HC</th>
                <th className="px-3 py-2.5 text-right">Buffer %</th>
                <th className="px-3 py-2.5 text-right border-r border-[#E6ECF2]">Hiring Needed</th>

                <th className="px-3 py-2.5 text-right">Absenteeism</th>
                <th className="px-3 py-2.5 text-right">Abs %</th>
                <th className="px-3 py-2.5 text-right">Attrition</th>
                <th className="px-3 py-2.5 text-right border-r border-[#E6ECF2]">Att %</th>

                <th className="px-3 py-2.5 text-right">Accepted JO</th>
                <th className="px-3 py-2.5 text-right">NHO Count</th>
                <th className="px-3 py-2.5 text-right">FST Count</th>
                <th className="px-3 py-2.5 text-right">PST Count</th>
                <th className="px-3 py-2.5 text-right border-r border-[#E6ECF2]">Go Live</th>

                <th className="px-3 py-2.5 text-right">Hiring Rate %</th>
                <th className="px-3.5 py-2.5 text-right">Leads Needed</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E6ECF2] font-medium bg-white">
              {forecastWeeks.map((fw) => {
                const netActual = fw.actualHC - fw.absenteeismCount - fw.attritionCount;
                const bufferPct = Number((((netActual - fw.requiredHC) / fw.requiredHC) * 100).toFixed(2));
                const hiringNeeded = Math.max(0, fw.requiredHC - netActual);
                const leadsNeeded = Math.round(hiringNeeded / (fw.hiringRatePct / 100));

                return (
                  <tr 
                    key={fw.id} 
                    onClick={() => setSelectedWeekDetails(fw)}
                    className="hover:bg-[#F1F5F9]/60 cursor-pointer transition-colors group"
                  >
                    {/* Forecast Week */}
                    <td className="px-3 py-3 font-extrabold text-[#042C51] border-r border-[#E6ECF2] flex items-center justify-between">
                      <span>{fw.weekLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C28] transition-colors" />
                    </td>

                    {/* Date Range */}
                    <td className="px-3 py-3 text-slate-500 border-r border-[#E6ECF2] text-[11px] font-semibold">{fw.dateRange}</td>

                    {/* Required HC */}
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-700">{fw.requiredHC}</td>

                    {/* Actual HC */}
                    <td className="px-3 py-3 text-right font-mono text-slate-600">{fw.actualHC}</td>

                    {/* Net Actual HC */}
                    <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{netActual}</td>

                    {/* Buffer % */}
                    <td className={`px-3 py-3 text-right font-mono font-bold ${bufferPct < 0 ? "text-[#E74C3C]" : "text-[#2ECC71]"}`}>
                      {bufferPct}%
                    </td>

                    {/* Hiring Needed */}
                    <td className="px-3 py-3 text-right font-mono font-bold border-r border-[#E6ECF2]">
                      {hiringNeeded > 0 ? (
                        <span className="bg-rose-50 text-[#E74C3C] px-2 py-0.5 rounded font-black border border-rose-100">
                          {hiringNeeded}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold">0</span>
                      )}
                    </td>

                    {/* Loss Telemetry */}
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{fw.absenteeismCount}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800">{fw.absenteeismPct}%</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{fw.attritionCount}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 border-r border-[#E6ECF2]">{fw.attritionPct}%</td>

                    {/* Training Funnel */}
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800">{fw.acceptedJO}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{fw.nho}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{fw.fst}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{fw.pst}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600 border-r border-[#E6ECF2]">{fw.goLive}</td>

                    {/* Yield & Leads */}
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{fw.hiringRatePct}%</td>
                    <td className="px-3.5 py-3 text-right font-mono font-black text-[#FF5C28]">{leadsNeeded}</td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table 1 Summary Row (TOTAL / AVERAGE) */}
            <tfoot className="bg-[#EEF4F9] text-[#042C51] text-xs font-bold border-t border-[#CBD5E1]">
              <tr>
                <td colSpan={2} className="px-3 py-3 text-left font-extrabold uppercase text-[#042C51] tracking-tight">
                  6-WEEK TOTAL / AVERAGE
                </td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.avgReq} (avg)</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.avgAct} (avg)</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.avgNetAct} (avg)</td>
                <td className={`px-3 py-3 text-right font-mono font-bold ${forecastSummary.avgBuffer < 0 ? "text-[#E74C3C]" : "text-emerald-600"}`}>
                  {forecastSummary.avgBuffer < 0 ? `${forecastSummary.avgBuffer}%` : `+${forecastSummary.avgBuffer}%`}
                </td>
                <td className={`px-3 py-3 text-right font-mono font-bold ${forecastSummary.hiringNeededSum > 0 ? "text-[#E74C3C]" : "text-[#042C51]"}`}>
                  {forecastSummary.hiringNeededSum} (tot)
                </td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.absSum} (tot)</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.avgAbsPct}%</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.attSum} (tot)</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.avgAttPct}%</td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.accJOSum}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.nhoSum}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.fstSum}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.pstSum}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600">{forecastSummary.goLiveSum}</td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.avgHiringRate}%</td>
                <td className="px-3.5 py-3 text-right font-mono font-bold text-[#042C51]">{forecastSummary.totalLeadsNeeded}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

    
      {/* ==================== STATIC FORECAST ANALYTICS CARDS ==================== */}
      <ForecastBottomGraphsInline rows={staticForecastCardRows} />

      {/* ==================== TABLE 2: DETAILS BY CLUSTER / ACCOUNT ==================== */}
      {/* Component: WorkforceHiringAccountsTable */}
      <section className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm space-y-4 select-none">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-[#042C51] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF5C28]" />
              Details by Cluster / Account (6-Week Forecast Average Plan)
            </h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Account-level breakdown aggregating 6-week forecast averages for every individual Cluster and Client Account.
            </p>
          </div>

          {/* Search, Cluster & Account Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search account or cluster..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#F1F5F9] border border-transparent rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#042C51] transition-all"
              />
            </div>

            <select
              value={selectedCluster}
              onChange={e => { setSelectedCluster(e.target.value); setSelectedAccount("All"); }}
              className="bg-[#F1F5F9] px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#042C51] focus:outline-none cursor-pointer"
            >
              <option value="All">All Clusters</option>
              <option value="Telecom & Tech">Telecom & Tech</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare & Ins.">Healthcare & Ins.</option>
              <option value="Retail & E-Commerce">Retail & E-Commerce</option>
            </select>

            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="bg-[#F1F5F9] px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#042C51] focus:outline-none cursor-pointer"
            >
              <option value="All">All Accounts</option>
              <option value="Verizon Tech">Verizon Tech</option>
              <option value="Comcast Technical">Comcast Technical</option>
              <option value="Aetna Core">Aetna Core</option>
              <option value="Citi Premier">Citi Premier</option>
            </select>
          </div>
        </div>

        {/* Forecast Table 2 Container with Drag-Scroll */}
        <div
          ref={table2Ref}
          onMouseDown={handleMouseDown2}
          onMouseLeave={handleMouseLeave2}
          onMouseUp={handleMouseUp2}
          onMouseMove={handleMouseMove2}
          className={`w-full max-w-full min-w-0 overflow-x-auto border border-[#E6ECF2] rounded-xl relative select-none cursor-grab ${
            isMouseDown2 ? "cursor-grabbing" : ""
          }`}
        >
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#667085] text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-[#E6ECF2]">
              {/* Category Grouping Row 1 */}
              <tr className="border-b border-[#E6ECF2] bg-[#F1F5F9]/80 text-[#042C51]">
                <th colSpan={2} className="px-3 py-2 bg-[#F1F5F9]/80 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  1. IDENTIFICATION & SCOPE
                </th>
                <th colSpan={5} className="px-3 py-2 bg-[#E9F0FC]/60 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  2. ACCOUNT CAPACITY & SHORTFALL AVERAGES
                </th>
                <th colSpan={4} className="px-3 py-2 bg-[#F1F5F9]/80 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  3. 6-WEEK CUMULATIVE LOSS TELEMETRY
                </th>
                <th colSpan={6} className="px-3 py-2 bg-[#E9F0FC]/60 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  4. ACCOUNT TRAINING FUNNEL & PLACEMENTS
                </th>
                <th colSpan={2} className="px-3 py-2 bg-[#F1F5F9]/80 text-[#042C51] border-r border-[#E6ECF2] text-center font-black">
                  5. YIELD & LEADS TARGET
                </th>
                <th className="px-3 py-2 bg-[#E9F0FC]/60 text-[#042C51] text-center font-black">
                  6. ACTIONS
                </th>
              </tr>

              {/* Individual Column Header Row 2 */}
              <tr className="bg-[#F8FAFC] text-[#667085] border-b border-[#E6ECF2] text-[10px]">
                <th className="px-3 py-2.5 border-r border-[#E6ECF2]">Cluster</th>
                <th className="px-3 py-2.5 border-r border-[#E6ECF2]">Account</th>

                <th className="px-3 py-2.5 text-right">Required HC</th>
                <th className="px-3 py-2.5 text-right">Actual HC</th>
                <th className="px-3 py-2.5 text-right">Buffer %</th>
                <th className="px-3 py-2.5 text-right">Net Actual HC</th>
                <th className="px-3 py-2.5 text-right border-r border-[#E6ECF2]">Hiring Needed</th>

                <th className="px-3 py-2.5 text-right">Absenteeism (6 Wks)</th>
                <th className="px-3 py-2.5 text-right">Abs Rate %</th>
                <th className="px-3 py-2.5 text-right">Attrition (6 Wks)</th>
                <th className="px-3 py-2.5 text-right border-r border-[#E6ECF2]">Att Rate %</th>

                <th className="px-3 py-2.5 text-right">Accepted JO</th>
                <th className="px-3 py-2.5 text-right">NHO Count</th>
                <th className="px-3 py-2.5 text-right">FST Count</th>
                <th className="px-3 py-2.5 text-right">PST Count</th>
                <th className="px-3 py-2.5 text-right">Go Live</th>
                <th className="px-3 py-2.5 text-right border-r border-[#E6ECF2]">Hired Count</th>

                <th className="px-3 py-2.5 text-right">Hiring Rate %</th>
                <th className="px-3 py-2.5 text-right border-r border-[#E6ECF2]">Target Leads</th>

                <th className="px-3.5 py-2.5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E6ECF2] font-medium bg-white">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={20} className="text-center py-10 text-slate-400 font-bold">
                    No active account plans matching parameters.
                  </td>
                </tr>
              ) : (
                filteredPlans.map(plan => {
                  const absenteeism6Wks = plan.kpiSnapshot.absenteeismCount * 6;
                  const attrition6Wks = plan.kpiSnapshot.attritionCount * 6;
                  const netActual = plan.actualHeadcount - plan.kpiSnapshot.absenteeismCount - plan.kpiSnapshot.attritionCount;
                  const bufferPct = plan.kpiSnapshot.bufferPercentage;

                  return (
                    <tr key={plan.id} className="hover:bg-[#F1F5F9]/60 transition-colors">
                      {/* Cluster */}
                      <td className="px-3 py-3 font-semibold text-slate-500 border-r border-[#E6ECF2]">{plan.cluster}</td>

                      {/* Account */}
                      <td className="px-3 py-3 text-[#042C51] font-extrabold border-r border-[#E6ECF2]">
                        <button
                          onClick={() => onViewPlan(plan)}
                          className="hover:underline hover:text-[#FF5C28] text-left focus:outline-none"
                        >
                          {plan.account}
                        </button>
                      </td>

                      {/* Capacity Metrics */}
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-700">{plan.requiredHeadcount}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-600">{plan.actualHeadcount}</td>
                      <td className={`px-3 py-3 text-right font-mono font-bold ${bufferPct < 0 ? "text-[#E74C3C]" : "text-[#2ECC71]"}`}>
                        {bufferPct}%
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{netActual}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold border-r border-[#E6ECF2]">
                        {plan.hiringNeeded > 0 ? (
                          <span className="bg-rose-50 text-[#E74C3C] px-2 py-0.5 rounded font-black border border-rose-100">
                            {plan.hiringNeeded}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">0</span>
                        )}
                      </td>

                      {/* 6-Week Cumulative Loss */}
                      <td className="px-3 py-3 text-right font-mono text-slate-700">{absenteeism6Wks}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-800">{plan.kpiSnapshot.absenteeismPercentage}%</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-700">{attrition6Wks}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 border-r border-[#E6ECF2]">{plan.kpiSnapshot.attritionPercentage}%</td>

                      {/* Funnel & Placements */}
                      <td className="px-3 py-3 text-right font-mono text-slate-800">{plan.kpiSnapshot.acceptedJO}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-700">{plan.kpiSnapshot.nho}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-700">{plan.kpiSnapshot.fst}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-700">{plan.kpiSnapshot.pst}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600">{plan.kpiSnapshot.goLive}</td>
                      <td className="px-3 py-3 text-right font-mono font-black text-emerald-600 bg-emerald-50/50 border-r border-[#E6ECF2]">{plan.hiredCount}</td>

                      {/* Yield & Leads */}
                      <td className="px-3 py-3 text-right font-mono text-slate-700">{plan.hiringRate}%</td>
                      <td className="px-3 py-3 text-right font-mono font-black text-[#FF5C28] border-r border-[#E6ECF2]">{plan.leadsNeeded}</td>

                      {/* Action */}
                      <td className="px-3.5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewPlan(plan)}
                            title="View Account Hiring Plan"
                            className="p-1.5 bg-[#E9F0FC] hover:bg-blue-100 text-[#042C51] rounded-lg transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onAddActionItem && onAddActionItem(plan.id)}
                            title="Add Task"
                            className="p-1.5 bg-slate-100 hover:bg-[#FF5C28]/10 text-[#FF5C28] rounded-lg transition-all"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table 2 Summary Row (TOTAL / AVERAGE) */}
            <tfoot className="bg-[#EEF4F9] text-[#042C51] text-xs font-bold border-t border-[#CBD5E1]">
              <tr>
                <td colSpan={2} className="px-3 py-3 text-left font-extrabold uppercase text-[#042C51] tracking-tight">
                  TOTAL / AVERAGE ({filteredPlans.length} ACCOUNTS)
                </td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.requiredHC}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.actualHC}</td>
                <td className={`px-3 py-3 text-right font-mono font-bold ${accountsSummary.bufferPct < 0 ? "text-[#E74C3C]" : "text-emerald-600"}`}>
                  {accountsSummary.bufferPct < 0 ? `${accountsSummary.bufferPct}%` : `+${accountsSummary.bufferPct}%`}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.netActualHC}</td>
                <td className={`px-3 py-3 text-right font-mono font-bold ${accountsSummary.hiringNeeded > 0 ? "text-[#E74C3C]" : "text-[#042C51]"}`}>
                  {accountsSummary.hiringNeeded}
                </td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.absenteeism6Wks}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.absenteeismRatePct}%</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.attrition6Wks}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.attritionRatePct}%</td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.acceptedJO}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.nho}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.fst}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.pst}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600">{accountsSummary.goLive}</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.hiredCount}</td>

                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.hiringRatePct}%</td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#042C51]">{accountsSummary.leadsNeeded}</td>

                <td className="px-3.5 py-3 text-center">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-[#DCE7F3] text-[#042C51]">
                    Summary
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ==================== 1. AI WORKFORCE INTELLIGENCE ADVISOR MODAL ==================== */}
      {/* Component: AIInsightModal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#042C51] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-[#FF5C28] to-amber-500 rounded-xl shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    AI Workforce Intelligence Advisor
                    <span className="px-2 py-0.5 text-[9px] font-black bg-amber-400 text-[#042C51] rounded-full uppercase">
                      Live Telemetry
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">Automated capacity deficit modeling & batch scheduling recommendations.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)} 
                className="text-slate-300 hover:text-white p-1.5 rounded-lg bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Chat */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Executive Alert Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-amber-900">
                  <strong className="block font-bold">Capacity Deficit Risk Alert (Week 22 - Week 24)</strong>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Telecom & Tech accounts show a projected 192-slot gap before the Go-Live target on June 17. The primary loss driver is a 36-candidate drop-off between Accepted JO and NHO.
                  </p>
                </div>
              </div>

              {/* Strategic AI Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
                <strong className="text-xs font-bold text-[#042C51] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Recommended Mitigation Actions
                </strong>
                <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-1">
                  <li>Accelerate FST batch start date for Verizon Tech by 3 days.</li>
                  <li>Over-hire Accepted JOs by 18% in Week 21 to buffer NHO drop-offs.</li>
                  <li>Reallocate 12 cross-trained PST agents from Comcast Support.</li>
                </ul>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 pt-2">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed text-xs shadow-xs ${
                        msg.sender === "user"
                          ? "bg-[#FF5C28] text-white rounded-br-none"
                          : "bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`block text-[9px] mt-1.5 text-right font-bold ${msg.sender === "user" ? "text-amber-100" : "text-slate-400"}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Chat Form */}
            <form onSubmit={handleSendAiMessage} className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask AI Advisor follow-up questions (e.g. How to mitigate Week 22 deficit?)..."
                value={aiChatInput}
                onChange={e => setAiChatInput(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#042C51] transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#042C51] hover:bg-[#063b6b] text-white font-bold rounded-xl flex items-center gap-1.5 shadow transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 2. KPI SNAPSHOT MODAL ==================== */}
      {/* Component: KPISnapshotModal */}
      {isKpiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#042C51] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#7DD3FC]" />
                <div>
                  <h3 className="text-sm font-bold">Week 20 Operational KPI Snapshot</h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">High-level capacity floors, absenteeism, turnover & class start dates.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsKpiModalOpen(false)} 
                className="text-slate-300 hover:text-white p-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Required HC Floor</span>
                  <span className="text-base font-black text-[#042C51]">1,250</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Net Active HC</span>
                  <span className="text-base font-black text-slate-800">1,070</span>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                  <span className="block text-[10px] text-rose-700 font-bold uppercase">Net Hiring Gap</span>
                  <span className="text-base font-black text-[#E74C3C]">180 Slots</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                  <span className="block text-[10px] text-emerald-700 font-bold uppercase">Target Go Live</span>
                  <span className="text-base font-black text-emerald-800">95 Agents</span>
                </div>
              </div>

              {/* Class Schedule Dates */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-[#042C51] flex items-center justify-between">
                  <span>Class Start Dates & Milestone Schedule</span>
                  <Clock className="w-3.5 h-3.5 text-[#FF5C28]" />
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500 font-medium">NHO Orientation Date:</span>
                    <strong className="text-slate-800 font-mono">May 13, 2024</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500 font-medium">FST Skills Start Date:</span>
                    <strong className="text-slate-800 font-mono">May 20, 2024</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500 font-medium">PST Product Start Date:</span>
                    <strong className="text-slate-800 font-mono">May 27, 2024</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500 font-medium">Go-Live Launch Date:</span>
                    <strong className="text-emerald-600 font-bold font-mono">June 10, 2024</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsKpiModalOpen(false)}
                  className="px-4 py-2 bg-[#042C51] text-white font-bold rounded-xl hover:bg-[#063b6b] transition-all"
                >
                  Close Snapshot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. VIEW PLAN DETAILS AUDIT MODAL ==================== */}
      {/* Component: ViewPlanModal */}
      {isViewPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="bg-[#042C51] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7DD3FC]" />
                <div>
                  <h3 className="text-sm font-bold">Comprehensive Hiring Plan Audit Log</h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">Account breakdown, historical performance & training timeline audit logs.</p>
                </div>
              </div>
              <button onClick={() => setIsViewPlanModalOpen(false)} className="text-slate-300 hover:text-white p-1.5 rounded-lg bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <strong className="text-sm font-black text-[#042C51]">Master Fiscal Planning Scope</strong>
                  <p className="text-slate-500 mt-0.5">Aggregate statistics across active accounts & clusters.</p>
                </div>
                <button 
                  onClick={() => showToast("Full Audit Log exported as CSV / PDF report!")}
                  className="px-3 py-2 bg-[#042C51] text-white font-bold rounded-lg flex items-center gap-1.5 hover:bg-[#063b6b]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              </div>

              {/* Historical Audit Logs */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#042C51] uppercase text-[11px] tracking-wide">Historical Week-Over-Week Logs</h4>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {plans.map(p => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-[#042C51] text-xs">{p.account}</span>
                        <span className="text-slate-400 text-[10px] ml-2">({p.cluster})</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Owner: {p.owner} • Status: <strong className="text-emerald-600">{p.status}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-700 block">{p.requiredHeadcount} Req / {p.actualHeadcount} Act</span>
                        <span className="text-[10px] text-slate-400">Updated: {p.updatedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsViewPlanModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 rounded-xl"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. WEEKLY ACCOUNT DRILL-DOWN MODAL ==================== */}
      {/* Component: ForecastWeekAccountDetailsModal */}
      {selectedWeekDetails && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#042C51] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>{selectedWeekDetails.weekLabel} Unit-Level Account Drill-Down</span>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-blue-500 text-white rounded">
                    {selectedWeekDetails.dateRange}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">Shift schedules, attendance roster & enrolled candidate cohorts.</p>
              </div>
              <button onClick={() => setSelectedWeekDetails(null)} className="text-slate-300 hover:text-white p-1.5 rounded-lg bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Required</span>
                  <span className="text-base font-black text-[#042C51] font-mono">{selectedWeekDetails.requiredHC}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Actual Staff</span>
                  <span className="text-base font-black text-slate-800 font-mono">{selectedWeekDetails.actualHC}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Open Gap</span>
                  <span className="text-base font-black text-rose-600 font-mono">
                    {Math.max(0, selectedWeekDetails.requiredHC - (selectedWeekDetails.actualHC - selectedWeekDetails.absenteeismCount - selectedWeekDetails.attritionCount))}
                  </span>
                </div>
              </div>

              {/* Cohort Pipeline */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-[#042C51]">Enrolled Milestone Cohorts ({selectedWeekDetails.weekLabel})</h4>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-slate-500 font-bold block">NHO</span>
                    <span className="text-sm font-black text-blue-900 font-mono">{selectedWeekDetails.nho}</span>
                  </div>
                  <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                    <span className="text-slate-500 font-bold block">FST</span>
                    <span className="text-sm font-black text-purple-900 font-mono">{selectedWeekDetails.fst}</span>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    <span className="text-slate-500 font-bold block">PST</span>
                    <span className="text-sm font-black text-amber-900 font-mono">{selectedWeekDetails.pst}</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 font-bold block">Go Live</span>
                    <span className="text-sm font-black text-emerald-900 font-mono">{selectedWeekDetails.goLive}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end">
                <button
                  onClick={() => setSelectedWeekDetails(null)}
                  className="px-4 py-2 bg-[#042C51] text-white font-bold rounded-xl"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. OPERATIONAL ACTION ITEM SETUP MODAL ==================== */}
      {/* Component: ActionItemModal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#042C51] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Assign Operational Action Item</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">Assign mitigation tasks to WFM or Operations leads.</p>
              </div>
              <button onClick={() => setIsActionModalOpen(false)} className="text-slate-300 hover:text-white font-bold text-xs p-1.5 rounded-lg bg-slate-800">✕</button>
            </div>

            <form onSubmit={handleCreateActionItem} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#667085] font-bold mb-1">Task Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule emergency FST batch for Verizon"
                  value={actionForm.title}
                  onChange={e => setActionForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2.5 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                />
              </div>

              <div>
                <label className="block text-[#667085] font-bold mb-1">Target Account</label>
                <select
                  value={actionForm.targetAccount}
                  onChange={e => setActionForm(p => ({ ...p, targetAccount: e.target.value }))}
                  className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-[#042C51] focus:outline-none focus:bg-white focus:border-[#042C51]"
                >
                  <option value="Verizon Tech">Verizon Tech</option>
                  <option value="Comcast Technical">Comcast Technical</option>
                  <option value="Aetna Core">Aetna Core</option>
                  <option value="Citi Premier">Citi Premier</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Assignee</label>
                  <input
                    type="text"
                    required
                    value={actionForm.assignee}
                    onChange={e => setActionForm(p => ({ ...p, assignee: e.target.value }))}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Priority Level</label>
                  <select
                    value={actionForm.priority}
                    onChange={e => setActionForm(p => ({ ...p, priority: e.target.value as "High" | "Medium" | "Low" }))}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-[#042C51] focus:outline-none focus:bg-white focus:border-[#042C51]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#667085] font-bold mb-1">Target Resolution Date</label>
                <input
                  type="date"
                  required
                  value={actionForm.targetDate}
                  onChange={e => setActionForm(p => ({ ...p, targetDate: e.target.value }))}
                  className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold rounded-lg shadow transition-all"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 6. OPERATION STATUS & FEEDBACK MODAL ==================== */}
      {/* Component: StatusModal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-[#042C51]">{statusModal.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{statusModal.message}</p>
            <button
              onClick={() => setStatusModal(p => ({ ...p, isOpen: false }))}
              className="w-full py-2 bg-[#042C51] hover:bg-[#063b6b] text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* ==================== CREATE PLAN MODAL ==================== */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#042C51] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Initialize Workforce Hiring Plan</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">Define target headcounts to dynamically generate pipeline sourcing requirements.</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="text-slate-300 hover:text-white font-bold text-xs p-1.5 rounded-lg bg-slate-800">✕</button>
            </div>

            <form onSubmit={handleSubmitPlan} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Target Cluster</label>
                  <select
                    value={newCluster}
                    onChange={e => setNewCluster(e.target.value)}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-[#042C51] focus:outline-none focus:bg-white focus:border-[#042C51]"
                  >
                    <option value="Telecom & Tech">Telecom & Tech</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Healthcare & Ins.">Healthcare & Ins.</option>
                    <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Comcast Core"
                    value={newAccount}
                    onChange={e => setNewAccount(e.target.value)}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Ramp Period</label>
                  <input
                    type="text"
                    required
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value)}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Required Headcount</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newReq}
                    onChange={e => setNewReq(Number(e.target.value))}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Current Actual Headcount</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newAct}
                    onChange={e => setNewAct(Number(e.target.value))}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Hired Year-to-Date</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newHired}
                    onChange={e => setNewHired(Number(e.target.value))}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#667085] font-bold mb-1">Target Sourcing Hiring Rate (%)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={100}
                    value={newHiringRate}
                    onChange={e => setNewHiringRate(Number(e.target.value))}
                    className="w-full bg-[#F1F5F9] border border-transparent rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#042C51]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Yield used to compute Required Leads (Interview / Hiring Rate)</span>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold rounded-lg shadow transition-all"
                >
                  Save Draft Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
