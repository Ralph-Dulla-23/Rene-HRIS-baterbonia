import { 
  PlanStatus, 
  ActionItemStatus, 
  RiskLevel, 
  SummaryMetrics, 
  PipelineStage, 
  PipelineDropOff, 
  TrendPoint, 
  DetailRecord, 
  WorkforcePlan,
  ActionItem,
  ScheduleItem
} from "./types";
import { EXACT_49_DETAIL_RECORDS } from "./detailRecordsData";

// Static definitions of clusters and accounts
export const CLUSTERS = [
  "All Clusters",
  "Coast Dental",
  "Corporate",
  "SME",
  "US Visa",
  "Yomdel"
];

export const ACCOUNTS_BY_CLUSTER: { [key: string]: string[] } = {
  "Coast Dental": [
    "CD – Cash",
    "CD – Collect",
    "CD – Connect",
    "CD – DRX",
    "CD – Reconciliation",
    "CD – Teledentistry"
  ],
  "Corporate": [
    "Admin",
    "BOD",
    "Comp & Ben",
    "Employee Relations",
    "Finance & Accounting",
    "HR & Talent Acquisition",
    "IT & Facilities",
    "Marketing",
    "Operations Management",
    "Quality Assurance",
    "Training & Development",
    "Workforce Management"
  ],
  "SME": [
    "CFAS",
    "Channel Assist",
    "FrontSteps",
    "G & G Services",
    "Marketlend",
    "MedRecords",
    "Physicians Footcare",
    "Pinnacle Health Group",
    "Sun Dental Labs",
    "Virtuoso Technologies",
    "YouthfulMD",
    "Apex Global",
    "Blue Horizon",
    "CloudTech Support",
    "Delta Media",
    "Eagle Logistics",
    "First Choice Health",
    "Global Logistics",
    "Horizon Care",
    "InnoSoft Solutions",
    "Nexus BPO",
    "Optima Tech",
    "Prime Support",
    "Summit Dental",
    "Vanguard CX"
  ],
  "US Visa": [
    "US Visa"
  ],
  "Yomdel": [
    "Yomdel Brief Your Market",
    "Yomdel Outbound",
    "Yomdel Parcelly",
    "Yomdel Property",
    "Yomdel Sector"
  ]
};

export const ALL_ACCOUNTS = Object.values(ACCOUNTS_BY_CLUSTER).flat();

// Initial summary metrics for overview - Exact 1:1 figures from Week 38
export const INITIAL_SUMMARY_METRICS: SummaryMetrics = {
  requiredHeadcount: 461,
  actualHeadcount: 461,
  bufferPercentage: -6.29,
  absenteeismCount: 0,
  absenteeismPercentage: 0.00,
  attritionCount: 29,
  attritionPercentage: 6.29,
  netActualHC: 432,
  hiringNeeded: 29,
  hiringRate: 362.5,
  hiredCount: 58,
  leadsToInterview: 16
};

// Pipeline Stages - Exact 1:1 conversion and milestone counts
export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  { name: "Accepted Job Offer", count: 12, percentageOfJO: 362.5, conversionFromPrevious: 100, targetCount: 15, isWarning: false },
  { name: "NHO Count", count: 46, percentageOfJO: 287.5, conversionFromPrevious: 383.3, targetCount: 40, isWarning: false },
  { name: "FST Count", count: 58, percentageOfJO: 362.5, conversionFromPrevious: 126.1, targetCount: 50, isWarning: false },
  { name: "PST Count", count: 238, percentageOfJO: 1487.5, conversionFromPrevious: 410.3, targetCount: 200, isWarning: false },
  { name: "Go Live", count: 65, percentageOfJO: 406.3, conversionFromPrevious: 27.3, targetCount: 60, isWarning: false }
];

// Pipeline Drop-offs between stages
export const INITIAL_DROP_OFFS: PipelineDropOff[] = [
  { fromStage: "Accepted JO", toStage: "NHO", count: 0, percentage: 0.0, retainedCount: 12, warningSeverity: "low" },
  { fromStage: "NHO", toStage: "FST", count: 6, percentage: 13.0, retainedCount: 46, warningSeverity: "medium" },
  { fromStage: "FST", toStage: "PST", count: 0, percentage: 0.0, retainedCount: 58, warningSeverity: "low" },
  { fromStage: "NHO", toStage: "PST", count: 0, percentage: 0.0, retainedCount: 238, warningSeverity: "low" },
  { fromStage: "PST", toStage: "Go Live", count: 0, percentage: 0.0, retainedCount: 65, warningSeverity: "low" }
];

// 6-Week Trends (Week 33 – Week 38, 2026) matching exact averages and curves
export const WEEKLY_TRENDS: TrendPoint[] = [
  { period: "Week 33", absenteeism: 6.0, attrition: 10.4, buffer: -16.4 },
  { period: "Week 34", absenteeism: 6.7, attrition: 9.3, buffer: -16.0 },
  { period: "Week 35", absenteeism: 7.9, attrition: 8.8, buffer: -16.7 },
  { period: "Week 36", absenteeism: 9.9, attrition: 7.7, buffer: -17.5 },
  { period: "Week 37", absenteeism: 36.0, attrition: 6.7, buffer: -42.7 },
  { period: "Week 38", absenteeism: 0.0, attrition: 6.29, buffer: 0.0 }
];

export const MONTHLY_TRENDS: TrendPoint[] = [
  { period: "May 2026", absenteeism: 7.2, attrition: 8.5, buffer: -15.4 },
  { period: "Jun 2026", absenteeism: 8.1, attrition: 8.9, buffer: -16.2 },
  { period: "Jul 2026", absenteeism: 8.5, attrition: 9.1, buffer: -17.0 },
  { period: "Aug 2026", absenteeism: 9.2, attrition: 8.2, buffer: -18.5 },
  { period: "Sep 2026", absenteeism: 0.0, attrition: 6.29, buffer: 0.0 }
];

// Helper to generate realistic 6-week history for an account
function makeWeeklyHistory(
  accountName: string, 
  clusterName: string, 
  req: number, 
  act: number, 
  buf: number, 
  abs: number, 
  att: number, 
  net: number, 
  need: number
) {
  if (req === 0 && act === 0) {
    return [
      { week: "Week 33", reqHC: 0, actHC: 0, bufferPct: 0, absCount: 0, absPct: 0, attCount: 0, attPct: 0, netActual: 0, hiringNeeded: 0 },
      { week: "Week 34", reqHC: 0, actHC: 0, bufferPct: 0, absCount: 0, absPct: 0, attCount: 0, attPct: 0, netActual: 0, hiringNeeded: 0 },
      { week: "Week 35", reqHC: 0, actHC: 0, bufferPct: 0, absCount: 0, absPct: 0.20, attCount: 0, attPct: 0, netActual: 0, hiringNeeded: 0 },
      { week: "Week 36", reqHC: 0, actHC: 0, bufferPct: 0, absCount: 0, absPct: 0, attCount: 0, attPct: 0.10, netActual: 0, hiringNeeded: 0 },
      { week: "Week 37", reqHC: 0, actHC: 0, bufferPct: 0, absCount: 0, absPct: 0.10, attCount: 0, attPct: 0.20, netActual: 0, hiringNeeded: 0 },
      { week: "Week 38", reqHC: 0, actHC: 0, bufferPct: 0, absCount: 0, absPct: 0, attCount: 0, attPct: 0, netActual: 0, hiringNeeded: 0, isSelected: true },
    ];
  }

  const attRate = req > 0 ? (att / req) * 100 : 0;
  return [
    { week: "Week 33", reqHC: req, actHC: act, bufferPct: Math.round((buf - 1.2) * 100) / 100, absCount: 0, absPct: 0, attCount: Math.max(0, att - 2), attPct: Math.round((attRate - 1.1) * 100) / 100, netActual: act - Math.max(0, att - 2), hiringNeeded: Math.max(0, need - 2) },
    { week: "Week 34", reqHC: req, actHC: act, bufferPct: Math.round((buf - 0.8) * 100) / 100, absCount: 0, absPct: 0, attCount: Math.max(0, att - 1), attPct: Math.round((attRate - 0.7) * 100) / 100, netActual: act - Math.max(0, att - 1), hiringNeeded: Math.max(0, need - 1) },
    { week: "Week 35", reqHC: req, actHC: act, bufferPct: Math.round((buf - 0.5) * 100) / 100, absCount: 0, absPct: 0.15, attCount: att, attPct: Math.round(attRate * 100) / 100, netActual: net, hiringNeeded: need },
    { week: "Week 36", reqHC: req, actHC: act, bufferPct: buf, absCount: 0, absPct: 0, attCount: att, attPct: Math.round(attRate * 100) / 100, netActual: net, hiringNeeded: need },
    { week: "Week 37", reqHC: req, actHC: act, bufferPct: buf, absCount: 0, absPct: 0.10, attCount: att, attPct: Math.round(attRate * 100) / 100, netActual: net, hiringNeeded: need },
    { week: "Week 38", reqHC: req, actHC: act, bufferPct: buf, absCount: abs, absPct: 0, attCount: att, attPct: Math.round(attRate * 100) / 100, netActual: net, hiringNeeded: need, isSelected: true }
  ];
}

// Details record per Cluster and Account
export const INITIAL_DETAIL_RECORDS: DetailRecord[] = EXACT_49_DETAIL_RECORDS;
const _UNUSED_LEGACY_RECORDS: any[] = [
  {
    id: "rec-1",
    cluster: "Telecom & Tech",
    account: "T-Mobile Care",
    requiredHC: 650,
    actualHC: 620,
    bufferPercentage: -4.6,
    absenteeismCount: 52,
    absenteeismPercentage: 8.38,
    attritionCount: 31,
    attritionPercentage: 5.0,
    netActualHC: 568,
    hiringNeeded: 82,
    acceptedJO: 60,
    nho: 56,
    fst: 50,
    pst: 45,
    goLive: 42,
    dropOffCount: 18,
    dropOffPercentage: 30.0,
    hiredCount: 55,
    hiringRate: 70.0,
    riskLevel: RiskLevel.Watch
  },
  {
    id: "rec-2",
    cluster: "Telecom & Tech",
    account: "Verizon Tech",
    requiredHC: 550,
    actualHC: 520,
    bufferPercentage: -5.4,
    absenteeismCount: 48,
    absenteeismPercentage: 9.23,
    attritionCount: 28,
    attritionPercentage: 5.38,
    netActualHC: 472,
    hiringNeeded: 78,
    acceptedJO: 50,
    nho: 45,
    fst: 38,
    pst: 32,
    goLive: 30,
    dropOffCount: 20,
    dropOffPercentage: 40.0,
    hiredCount: 42,
    hiringRate: 60.0,
    riskLevel: RiskLevel.AtRisk
  },
  {
    id: "rec-3",
    cluster: "Telecom & Tech",
    account: "AT&T Support",
    requiredHC: 450,
    actualHC: 440,
    bufferPercentage: -2.2,
    absenteeismCount: 30,
    absenteeismPercentage: 6.81,
    attritionCount: 15,
    attritionPercentage: 3.4,
    netActualHC: 410,
    hiringNeeded: 40,
    acceptedJO: 35,
    nho: 34,
    fst: 32,
    pst: 30,
    goLive: 28,
    dropOffCount: 7,
    dropOffPercentage: 20.0,
    hiredCount: 31,
    hiringRate: 80.0,
    riskLevel: RiskLevel.Healthy
  },
  {
    id: "rec-4",
    cluster: "Telecom & Tech",
    account: "Comcast Technical",
    requiredHC: 400,
    actualHC: 360,
    bufferPercentage: -10.0,
    absenteeismCount: 38,
    absenteeismPercentage: 10.55,
    attritionCount: 24,
    attritionPercentage: 6.67,
    netActualHC: 322,
    hiringNeeded: 78,
    acceptedJO: 45,
    nho: 40,
    fst: 32,
    pst: 26,
    goLive: 24,
    dropOffCount: 21,
    dropOffPercentage: 46.7,
    hiredCount: 32,
    hiringRate: 53.3,
    riskLevel: RiskLevel.Critical
  },
  {
    id: "rec-5",
    cluster: "Financial Services",
    account: "Chase Credit",
    requiredHC: 500,
    actualHC: 485,
    bufferPercentage: -3.0,
    absenteeismCount: 35,
    absenteeismPercentage: 7.21,
    attritionCount: 18,
    attritionPercentage: 3.71,
    netActualHC: 450,
    hiringNeeded: 50,
    acceptedJO: 45,
    nho: 43,
    fst: 40,
    pst: 37,
    goLive: 35,
    dropOffCount: 10,
    dropOffPercentage: 22.2,
    hiredCount: 42,
    hiringRate: 77.8,
    riskLevel: RiskLevel.Healthy
  },
  {
    id: "rec-6",
    cluster: "Financial Services",
    account: "Citi Global",
    requiredHC: 480,
    actualHC: 445,
    bufferPercentage: -7.2,
    absenteeismCount: 42,
    absenteeismPercentage: 9.43,
    attritionCount: 25,
    attritionPercentage: 5.61,
    netActualHC: 403,
    hiringNeeded: 77,
    acceptedJO: 52,
    nho: 48,
    fst: 42,
    pst: 36,
    goLive: 32,
    dropOffCount: 20,
    dropOffPercentage: 38.4,
    hiredCount: 38,
    hiringRate: 61.5,
    riskLevel: RiskLevel.AtRisk
  },
  {
    id: "rec-7",
    cluster: "Financial Services",
    account: "Capital One Help",
    requiredHC: 400,
    actualHC: 390,
    bufferPercentage: -2.5,
    absenteeismCount: 28,
    absenteeismPercentage: 7.17,
    attritionCount: 12,
    attritionPercentage: 3.07,
    netActualHC: 362,
    hiringNeeded: 38,
    acceptedJO: 30,
    nho: 28,
    fst: 26,
    pst: 25,
    goLive: 24,
    dropOffCount: 6,
    dropOffPercentage: 20.0,
    hiredCount: 27,
    hiringRate: 80.0,
    riskLevel: RiskLevel.Healthy
  },
  {
    id: "rec-8",
    cluster: "Healthcare & Ins.",
    account: "UnitedHealth VIP",
    requiredHC: 420,
    actualHC: 405,
    bufferPercentage: -3.5,
    absenteeismCount: 32,
    absenteeismPercentage: 7.9,
    attritionCount: 15,
    attritionPercentage: 3.7,
    netActualHC: 373,
    hiringNeeded: 47,
    acceptedJO: 38,
    nho: 36,
    fst: 33,
    pst: 30,
    goLive: 28,
    dropOffCount: 10,
    dropOffPercentage: 26.3,
    hiredCount: 32,
    hiringRate: 73.7,
    riskLevel: RiskLevel.Watch
  },
  {
    id: "rec-9",
    cluster: "Healthcare & Ins.",
    account: "Aetna Core",
    requiredHC: 350,
    actualHC: 310,
    bufferPercentage: -11.4,
    absenteeismCount: 35,
    absenteeismPercentage: 11.29,
    attritionCount: 22,
    attritionPercentage: 7.09,
    netActualHC: 275,
    hiringNeeded: 75,
    acceptedJO: 45,
    nho: 40,
    fst: 31,
    pst: 25,
    goLive: 22,
    dropOffCount: 23,
    dropOffPercentage: 51.1,
    hiredCount: 26,
    hiringRate: 48.8,
    riskLevel: RiskLevel.Critical
  },
  {
    id: "rec-10",
    cluster: "Retail & E-Commerce",
    account: "Amazon Care",
    requiredHC: 500,
    actualHC: 495,
    bufferPercentage: -1.0,
    absenteeismCount: 30,
    absenteeismPercentage: 6.06,
    attritionCount: 16,
    attritionPercentage: 3.23,
    netActualHC: 465,
    hiringNeeded: 35,
    acceptedJO: 40,
    nho: 38,
    fst: 35,
    pst: 33,
    goLive: 31,
    dropOffCount: 9,
    dropOffPercentage: 22.5,
    hiredCount: 36,
    hiringRate: 77.5,
    riskLevel: RiskLevel.Healthy
  },
  {
    id: "rec-11",
    cluster: "Retail & E-Commerce",
    account: "Target Guest",
    requiredHC: 450,
    actualHC: 420,
    bufferPercentage: -6.6,
    absenteeismCount: 38,
    absenteeismPercentage: 9.05,
    attritionCount: 22,
    attritionPercentage: 5.23,
    netActualHC: 382,
    hiringNeeded: 68,
    acceptedJO: 45,
    nho: 41,
    fst: 36,
    pst: 30,
    goLive: 27,
    dropOffCount: 18,
    dropOffPercentage: 40.0,
    hiredCount: 33,
    hiringRate: 60.0,
    riskLevel: RiskLevel.AtRisk
  }
];

// Mock action items
export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: "act-1",
    workforcePlanId: "plan-1",
    taskDescription: "Launch local sourcing caravan in Bulacan region to increase candidate pipeline volume.",
    assignee: "Regina Phalange (Sourcing)",
    targetDate: "2026-07-25",
    status: ActionItemStatus.InProgress,
    priority: "High",
    createdAt: "2026-07-15",
    updatedAt: "2026-07-15"
  },
  {
    id: "act-2",
    workforcePlanId: "plan-1",
    taskDescription: "Revise FST curriculum with operations stakeholders to address NHO to FST leakage.",
    assignee: "Marcus Aurelius (Training)",
    targetDate: "2026-07-29",
    status: ActionItemStatus.NotStarted,
    priority: "Medium",
    createdAt: "2026-07-16",
    updatedAt: "2026-07-16"
  },
  {
    id: "act-3",
    workforcePlanId: "plan-1",
    taskDescription: "Align shift requirements with the client to relax night differential requirements during orientation.",
    assignee: "Clara Oswald (Account Manager)",
    targetDate: "2026-07-20",
    status: ActionItemStatus.Completed,
    priority: "High",
    createdAt: "2026-07-10",
    updatedAt: "2026-07-18"
  },
  {
    id: "act-4",
    workforcePlanId: "plan-2",
    taskDescription: "Conduct focus group discussion for PST trainers to investigate drop-off before Go-Live.",
    assignee: "Arthur Pendragon (Training Lead)",
    targetDate: "2026-07-28",
    status: ActionItemStatus.InProgress,
    priority: "Medium",
    createdAt: "2026-07-17",
    updatedAt: "2026-07-18"
  },
  {
    id: "act-5",
    workforcePlanId: "plan-2",
    taskDescription: "Partner with Recruitment Marketing to push social media referrals for Comcast technical agents.",
    assignee: "Gwen Stacy (Marketing)",
    targetDate: "2026-07-22",
    status: ActionItemStatus.Blocked,
    priority: "High",
    createdAt: "2026-07-14",
    updatedAt: "2026-07-19"
  },
  {
    id: "act-6",
    workforcePlanId: "plan-3",
    taskDescription: "Validate PRF count with corporate operations for Aetna Core Q3 ramp.",
    assignee: "John Watson (WFM Manager)",
    targetDate: "2026-08-05",
    status: ActionItemStatus.NotStarted,
    priority: "Low",
    createdAt: "2026-07-19",
    updatedAt: "2026-07-19"
  }
];

// Initial Workforce Plans matching the table data
export const INITIAL_PLANS: WorkforcePlan[] = [
  {
    id: "plan-1",
    cluster: "Telecom & Tech",
    account: "Verizon Tech",
    planPeriod: "Q3 2026 Ramp",
    requiredHeadcount: 550,
    actualHeadcount: 520,
    hiredCount: 42,
    hiringNeeded: 78,
    hiringRate: 60.0, // FST / Interview
    leadsNeeded: 216,
    interviewCount: 130,
    fstCount: 78,
    status: PlanStatus.Active,
    owner: "Sarah Jenkins (WFM Principal)",
    approvedBy: "James Carter (Operations VP)",
    createdAt: "2026-07-12",
    updatedAt: "2026-07-18",
    kpiSnapshot: {
      bufferPercentage: -5.4,
      absenteeismCount: 48,
      absenteeismPercentage: 9.23,
      attritionCount: 28,
      attritionPercentage: 5.38,
      acceptedJO: 50,
      nho: 45,
      fst: 38,
      pst: 32,
      goLive: 30,
      hiredCount: 42,
      hiringRate: 60.0
    },
    pipeline: {
      acceptedJO: 50,
      nho: 45,
      fst: 38,
      pst: 32,
      goLive: 30,
      dropOffs: {
        joToNho: 5,
        nhoToFst: 7,
        fstToPst: 6,
        nhoToPst: 13,
        pstToGoLive: 2
      }
    },
    actionItems: [
      {
        id: "act-4",
        workforcePlanId: "plan-1",
        taskDescription: "Conduct focus group discussion for PST trainers to investigate drop-off before Go-Live.",
        assignee: "Arthur Pendragon (Training Lead)",
        targetDate: "2026-07-28",
        status: ActionItemStatus.InProgress,
        priority: "Medium",
        createdAt: "2026-07-17",
        updatedAt: "2026-07-18"
      }
    ],
    activityHistory: [
      { id: "h-1", date: "2026-07-18 10:30", user: "Sarah Jenkins", action: "Updated plan pipeline status", details: "Changed Go Live count from 28 to 30 following training sign-off." },
      { id: "h-2", date: "2026-07-15 14:15", user: "James Carter", action: "Plan approved", details: "Approved the initial ramp projections for Comcast and Verizon Tech." },
      { id: "h-3", date: "2026-07-12 09:00", user: "Sarah Jenkins", action: "Plan created", details: "Drafted plan for Verizon Tech Q3 2026." }
    ]
  },
  {
    id: "plan-2",
    cluster: "Telecom & Tech",
    account: "Comcast Technical",
    planPeriod: "Q3 2026 Ramp",
    requiredHeadcount: 400,
    actualHeadcount: 360,
    hiredCount: 32,
    hiringNeeded: 78,
    hiringRate: 53.3,
    leadsNeeded: 245,
    interviewCount: 150,
    fstCount: 80,
    status: PlanStatus.ForReview,
    owner: "Peter Parker (Recruitment Lead)",
    approvedBy: "Unassigned",
    createdAt: "2026-07-14",
    updatedAt: "2026-07-19",
    kpiSnapshot: {
      bufferPercentage: -10.0,
      absenteeismCount: 38,
      absenteeismPercentage: 10.55,
      attritionCount: 24,
      attritionPercentage: 6.67,
      acceptedJO: 45,
      nho: 40,
      fst: 32,
      pst: 26,
      goLive: 24,
      hiredCount: 32,
      hiringRate: 53.3
    },
    pipeline: {
      acceptedJO: 45,
      nho: 40,
      fst: 32,
      pst: 26,
      goLive: 24,
      dropOffs: {
        joToNho: 5,
        nhoToFst: 8,
        fstToPst: 6,
        nhoToPst: 14,
        pstToGoLive: 2
      }
    },
    actionItems: [
      {
        id: "act-5",
        workforcePlanId: "plan-2",
        taskDescription: "Partner with Recruitment Marketing to push social media referrals for Comcast technical agents.",
        assignee: "Gwen Stacy (Marketing)",
        targetDate: "2026-07-22",
        status: ActionItemStatus.Blocked,
        priority: "High",
        createdAt: "2026-07-14",
        updatedAt: "2026-07-19"
      }
    ],
    activityHistory: [
      { id: "h-4", date: "2026-07-19 16:45", user: "Peter Parker", action: "Submitted for Review", details: "Moved Comcast Technical plan to Review status after adding sitemap referrals." },
      { id: "h-5", date: "2026-07-14 11:20", user: "Peter Parker", action: "Plan created", details: "Drafted Comcast Technical hiring ramp." }
    ]
  },
  {
    id: "plan-3",
    cluster: "Healthcare & Ins.",
    account: "Aetna Core",
    planPeriod: "Q3 2026 Ramp",
    requiredHeadcount: 350,
    actualHeadcount: 310,
    hiredCount: 26,
    hiringNeeded: 75,
    hiringRate: 48.8,
    leadsNeeded: 310,
    interviewCount: 180,
    fstCount: 88,
    status: PlanStatus.Active,
    owner: "Sarah Jenkins (WFM Principal)",
    approvedBy: "James Carter (Operations VP)",
    createdAt: "2026-07-11",
    updatedAt: "2026-07-19",
    kpiSnapshot: {
      bufferPercentage: -11.4,
      absenteeismCount: 35,
      absenteeismPercentage: 11.29,
      attritionCount: 22,
      attritionPercentage: 7.09,
      acceptedJO: 45,
      nho: 40,
      fst: 31,
      pst: 25,
      goLive: 22,
      hiredCount: 26,
      hiringRate: 48.8
    },
    pipeline: {
      acceptedJO: 45,
      nho: 40,
      fst: 31,
      pst: 25,
      goLive: 22,
      dropOffs: {
        joToNho: 5,
        nhoToFst: 9,
        fstToPst: 6,
        nhoToPst: 15,
        pstToGoLive: 3
      }
    },
    actionItems: [
      {
        id: "act-6",
        workforcePlanId: "plan-3",
        taskDescription: "Validate PRF count with corporate operations for Aetna Core Q3 ramp.",
        assignee: "John Watson (WFM Manager)",
        targetDate: "2026-08-05",
        status: ActionItemStatus.NotStarted,
        priority: "Low",
        createdAt: "2026-07-19",
        updatedAt: "2026-07-19"
      }
    ],
    activityHistory: [
      { id: "h-6", date: "2026-07-19 12:00", user: "Sarah Jenkins", action: "Updated snapshot metrics", details: "Synchronized active database with current WFM metrics." }
    ]
  },
  {
    id: "plan-4",
    cluster: "Telecom & Tech",
    account: "T-Mobile Care",
    planPeriod: "Q3 2026 Ramp",
    requiredHeadcount: 650,
    actualHeadcount: 620,
    hiredCount: 55,
    hiringNeeded: 82,
    hiringRate: 70.0,
    leadsNeeded: 120,
    interviewCount: 100,
    fstCount: 70,
    status: PlanStatus.Draft,
    owner: "Sarah Jenkins (WFM Principal)",
    createdAt: "2026-07-18",
    updatedAt: "2026-07-18",
    kpiSnapshot: {
      bufferPercentage: -4.6,
      absenteeismCount: 52,
      absenteeismPercentage: 8.38,
      attritionCount: 31,
      attritionPercentage: 5.0,
      acceptedJO: 60,
      nho: 56,
      fst: 50,
      pst: 45,
      goLive: 42,
      hiredCount: 55,
      hiringRate: 70.0
    },
    pipeline: {
      acceptedJO: 60,
      nho: 56,
      fst: 50,
      pst: 45,
      goLive: 42,
      dropOffs: {
        joToNho: 4,
        nhoToFst: 6,
        fstToPst: 5,
        nhoToPst: 11,
        pstToGoLive: 3
      }
    },
    actionItems: [],
    activityHistory: [
      { id: "h-7", date: "2026-07-18 08:30", user: "Sarah Jenkins", action: "Draft initialized", details: "Initialized draft for T-Mobile Care ramping up for Q3." }
    ]
  }
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: "sched-0a",
    title: "Soft Dev & TA Sync",
    category: "Talent Acquisition",
    date: "2026-07-01",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    location: "Virtual Room 1",
    organizer: "Sarah Jenkins (TA Specialist)",
    participantOrAccount: "Telecom & Tech Cluster",
    status: "Scheduled",
    priority: "Medium",
    notes: "Soft dev software candidate alignment",
    createdAt: "2026-06-25",
    updatedAt: "2026-06-25"
  },
  {
    id: "sched-0b",
    title: "Soft Dev & TA Sync",
    category: "Talent Acquisition",
    date: "2026-07-08",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    location: "Virtual Room 1",
    organizer: "Sarah Jenkins (TA Specialist)",
    participantOrAccount: "Telecom & Tech Cluster",
    status: "Scheduled",
    priority: "Medium",
    notes: "Soft dev software candidate alignment",
    createdAt: "2026-07-01",
    updatedAt: "2026-07-01"
  },
  {
    id: "sched-0c",
    title: "Soft Dev & TA Sync",
    category: "Talent Acquisition",
    date: "2026-07-15",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    location: "Virtual Room 1",
    organizer: "Sarah Jenkins (TA Specialist)",
    participantOrAccount: "Telecom & Tech Cluster",
    status: "Scheduled",
    priority: "Medium",
    notes: "Soft dev software candidate alignment",
    createdAt: "2026-07-08",
    updatedAt: "2026-07-08"
  },
  {
    id: "sched-0d",
    title: "Soft Dev & TA Sync",
    category: "Talent Acquisition",
    date: "2026-07-22",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    location: "Virtual Room 1",
    organizer: "Sarah Jenkins (TA Specialist)",
    participantOrAccount: "Telecom & Tech Cluster",
    status: "Scheduled",
    priority: "Medium",
    notes: "Soft dev software candidate alignment",
    createdAt: "2026-07-15",
    updatedAt: "2026-07-15"
  },
  {
    id: "sched-1",
    title: "Soft Dev & TA Sync",
    category: "Talent Acquisition",
    date: "2026-07-29",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    location: "Interview Room 3B & MS Teams",
    organizer: "Sarah Jenkins (TA Specialist)",
    participantOrAccount: "Verizon Tech / Candidate: Mark Santos",
    status: "Scheduled",
    priority: "High",
    notes: "Technical evaluation and customer service assessment for Tier 2 support applicants.",
    createdAt: "2026-07-25",
    updatedAt: "2026-07-29"
  },
  {
    id: "sched-2",
    title: "Telecom Cluster HR Performance Sync",
    category: "Human Resources",
    date: "2026-07-29",
    startTime: "11:00",
    endTime: "12:00",
    location: "Executive Boardroom A",
    organizer: "Alena Batacan (Operations Director)",
    participantOrAccount: "All Account HR Business Partners",
    status: "In Progress",
    priority: "Medium",
    notes: "Reviewing Q3 ramp attendance rates, attrition drivers, and employee engagement scores.",
    createdAt: "2026-07-26",
    updatedAt: "2026-07-29"
  },
  {
    id: "sched-3",
    title: "Initial Screening Drive - Healthcare Support Specialists",
    category: "Talent Acquisition",
    date: "2026-07-29",
    startTime: "14:00",
    endTime: "16:30",
    location: "Recruitment Hub - Hub 2",
    organizer: "Michael Tan (Lead Recruiter)",
    participantOrAccount: "UnitedHealth VIP / 18 Applicants",
    status: "Scheduled",
    priority: "High",
    notes: "Batch screening for HIPAA compliance knowledge and voice assessment.",
    createdAt: "2026-07-27",
    updatedAt: "2026-07-29"
  },
  {
    id: "sched-4",
    title: "New Hire Orientation (NHO) Cohort 12 Kickoff",
    category: "Training & Onboarding",
    date: "2026-07-30",
    startTime: "08:30",
    endTime: "12:00",
    location: "Training Lab 4 (Floor 5)",
    organizer: "Patricia Lee (L&D Manager)",
    participantOrAccount: "Comcast Technical / 25 New Hires",
    status: "Scheduled",
    priority: "High",
    notes: "Company policies, badge distribution, IT asset deployment, and cultural orientation.",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28"
  },
  {
    id: "sched-5",
    title: "Comcast Technical Account Interview Panel",
    category: "Talent Acquisition",
    date: "2026-07-30",
    startTime: "13:30",
    endTime: "15:00",
    location: "Virtual Room 102",
    organizer: "Sarah Jenkins (TA Specialist)",
    participantOrAccount: "Comcast Technical / 8 Candidates",
    status: "Scheduled",
    priority: "Medium",
    notes: "Final Ops interview with Account Operations Manager.",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28"
  },
  {
    id: "sched-6",
    title: "Weekly Ramp & Capacity Alignment - Chase Credit",
    category: "Operations & WFM",
    date: "2026-07-31",
    startTime: "10:00",
    endTime: "11:30",
    location: "WFM War Room & Teams",
    organizer: "David Miller (WFM Principal)",
    participantOrAccount: "Chase Credit Account Management",
    status: "Scheduled",
    priority: "High",
    notes: "Realigning required headcount against actual training output and drop-off buffer.",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28"
  },
  {
    id: "sched-7",
    title: "Exit Interview & Offboarding Clearance - ID #4092",
    category: "Human Resources",
    date: "2026-07-31",
    startTime: "15:00",
    endTime: "16:00",
    location: "HR Office 101",
    organizer: "Elena Rostova (HR Officer)",
    participantOrAccount: "AT&T Support / Resigned Agent",
    status: "Scheduled",
    priority: "Low",
    notes: "Documenting attrition reasons, turn-over of company assets, and exit interview checklist.",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28"
  },
  {
    id: "sched-8",
    title: "Mega Sourcing Job Fair Walk-In Drive",
    category: "Talent Acquisition",
    date: "2026-08-03",
    startTime: "09:00",
    endTime: "17:00",
    location: "Main Atrium & Recruitment Floor",
    organizer: "TA Sourcing Team",
    participantOrAccount: "All Accounts / Public Walk-ins",
    status: "Scheduled",
    priority: "High",
    notes: "One-day processing for Financial and Retail accounts with immediate Job Offer issuance.",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28"
  },
  {
    id: "sched-9",
    title: "Foundation Skills Training (FST) Batch A Kickoff",
    category: "Training & Onboarding",
    date: "2026-08-04",
    startTime: "09:00",
    endTime: "12:00",
    location: "Training Lab 2",
    organizer: "Robert Vance (Master Trainer)",
    participantOrAccount: "Amazon Care / 30 Trainees",
    status: "Scheduled",
    priority: "High",
    notes: "Soft skills, American accent neutralization, and customer empathy training.",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28"
  },
  {
    id: "sched-10",
    title: "Benefits & Leave Policy Q3 Employee Briefing",
    category: "Human Resources",
    date: "2026-08-05",
    startTime: "14:00",
    endTime: "15:30",
    location: "Auditorium & Live Stream",
    organizer: "Alena Batacan (Operations Director)",
    participantOrAccount: "All Employees & Ops Leads",
    status: "Scheduled",
    priority: "Medium",
    notes: "Explanation of updated health HMO coverage, mental wellness leaves, and PTO accruals.",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28"
  }
];

