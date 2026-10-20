import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type RGBColor = [number, number, number];

export interface ScreenSpec {
  id: string;
  category: "Core HR & Dashboards" | "Workforce Planning" | "Recruitment Pipeline" | "Operations & Governance" | "Portals & Public Forms";
  title: string;
  subtitle: string;
  personas: string[];
  keyFeatures: string[];
  components: string[];
  slaOrKpi: string;
  accentColor: RGBColor;
}

export const SYSTEM_SCREENS: ScreenSpec[] = [
  // 1. Core HR & Dashboards
  {
    id: "super-admin-dashboard",
    category: "Core HR & Dashboards",
    title: "Super Admin Enterprise Dashboard",
    subtitle: "Cross-campus workforce telemetry, system health, and administrative controls",
    personas: ["Super Admin", "Executive Leadership", "Chief HR Officer"],
    keyFeatures: ["Multi-campus headcounts", "Live system activity logs", "Role & permission governance", "Audit trails"],
    components: ["Executive KPI Cards", "Campus Distribution Chart", "Audit Log Stream", "Quick Switcher"],
    slaOrKpi: "99.9% Uptime, Real-Time Activity Refresh",
    accentColor: [4, 44, 81]
  },
  {
    id: "hr-admin-dashboard",
    category: "Core HR & Dashboards",
    title: "HR Admin Operational Dashboard",
    subtitle: "Workforce distribution, attendance compliance, active requisitions, and pending clearances",
    personas: ["HR Director", "HR Operations Manager", "HR Generalist"],
    keyFeatures: ["Campus attrition & headcount tracking", "Daily attendance rates", "Active PRF monitoring", "Urgent clearances"],
    components: ["Summary KPI Metrics", "Campus Distribution Cards", "Requisition Pipeline", "Clearance List"],
    slaOrKpi: "95%+ Attendance Rate, < 24h Clearance Review",
    accentColor: [4, 44, 81]
  },
  {
    id: "ta-dashboard",
    category: "Core HR & Dashboards",
    title: "Talent Acquisition (TA) Lead Dashboard",
    subtitle: "Recruiter pipeline velocity, time-to-fill analytics, offer acceptance, and hiring funnel",
    personas: ["TA Manager", "Recruitment Lead", "Senior Recruiter"],
    keyFeatures: ["Recruiter target progress", "Funnel conversion rates", "Time-to-fill SLA tracker", "Drop-off breakdown"],
    components: ["Recruitment Velocity KPIs", "Funnel Visualizer", "Recruiter Load Table", "Weekly Trends"],
    slaOrKpi: "< 14 Days Time-to-Fill, 85%+ Offer Acceptance",
    accentColor: [255, 92, 40]
  },
  {
    id: "om-dashboard",
    category: "Core HR & Dashboards",
    title: "Operations Manager (OM) Dashboard",
    subtitle: "Ramp readiness, seat capacity, wave scheduling, and production handover metrics",
    personas: ["Operations Manager", "Account Director", "Site Director"],
    keyFeatures: ["Wave-to-training readiness", "Seat occupancy %", "New hire operational fit", "Requisition sign-off"],
    components: ["Ramp Readiness Gauge", "Seat Capacity Matrix", "Wave Schedule Table", "Requisition Approval"],
    slaOrKpi: "100% Day-1 Ramp Fulfillment, 0 Unplanned Vacancies",
    accentColor: [46, 204, 113]
  },
  {
    id: "employee-dashboard",
    category: "Core HR & Dashboards",
    title: "Employee Self-Service (ESS) Portal",
    subtitle: "Personal profile, shift schedule, leave balances, timeclock history, and internal opportunities",
    personas: ["Frontline Employee", "Team Lead", "Internal Staff"],
    keyFeatures: ["One-click Punch In/Out", "Leave balance tracker", "Payslip archive", "Internal referrals"],
    components: ["Timeclock Card", "Leave Balances Widget", "Upcoming Shifts Schedule", "Quick Actions"],
    slaOrKpi: "100% Biometric Sync, 100% Policy Transparency",
    accentColor: [75, 157, 254]
  },
  {
    id: "employee-directory",
    category: "Core HR & Dashboards",
    title: "Employee Directory & Multi-Device Inspector",
    subtitle: "Master personnel roster with multi-device responsive simulation (Desktop, Tablet, Mobile)",
    personas: ["HR Admin", "Operations", "Team Leaders", "All Employees"],
    keyFeatures: ["Search & filter by Campus/Dept", "Interactive device preview switcher", "Employee detail modal", "Status badges"],
    components: ["Responsive Device Frame", "Employee Roster Table", "Filter Toolbar", "Detail Drawer"],
    slaOrKpi: "< 200ms Search Latency across 1,000+ Profiles",
    accentColor: [4, 44, 81]
  },
  {
    id: "time-attendance",
    category: "Core HR & Dashboards",
    title: "Time & Attendance Engine",
    subtitle: "Timesheet validation, overtime approvals, tardiness alerts, and biometric logs",
    personas: ["Timekeeping Specialist", "HR Officer", "Supervisors"],
    keyFeatures: ["Daily time records (DTR)", "Shift schedule rosters", "Overtime approval requests", "Exception tracking"],
    components: ["DTR Timesheet Grid", "Biometric Sync Status", "Overtime Ledger", "Approval Modal"],
    slaOrKpi: "100% Payroll Cutoff Compliance, < 12h Dispute Resolution",
    accentColor: [4, 44, 81]
  },
  {
    id: "leaves-management",
    category: "Core HR & Dashboards",
    title: "Leaves & Time-Off Management",
    subtitle: "Leave requests, accrual calendars, entitlement balances, and manager approvals",
    personas: ["HR Leaves Specialist", "People Managers", "Employees"],
    keyFeatures: ["Vacation/Sick leave balances", "Department calendar heatmap", "Multi-tier approval flow", "Document upload"],
    components: ["Entitlement Balance Cards", "Leave Request Form", "Calendar Schedule", "Approval Queue"],
    slaOrKpi: "< 24h Approval Turnaround, Automated Accrual Engine",
    accentColor: [46, 204, 113]
  },
  {
    id: "resignation-management",
    category: "Core HR & Dashboards",
    title: "Resignation & Offboarding Clearance",
    subtitle: "30-day notice management, asset return workflows, exit interviews, and final pay computations",
    personas: ["Offboarding Specialist", "IT Asset Manager", "HR Generalist"],
    keyFeatures: ["Notice tracking (30-day countdown)", "Multi-department clearance checklist", "Exit interview survey", "Final pay lock"],
    components: ["Offboarding Kanban", "Asset Return Checklist", "Exit Survey Aggregator", "Clearance Certificate"],
    slaOrKpi: "100% Asset Recovery, < 30 Days Final Pay Delivery",
    accentColor: [231, 76, 60]
  },

  // 2. Workforce Planning
  {
    id: "workforce-hiring",
    category: "Workforce Planning",
    title: "Workforce & Hiring Plan (RAMPS)",
    subtitle: "Master capacity plan, target headcount vs actual fills, pipeline coverage, and budget forecasting",
    personas: ["WFM Planner", "TA Lead", "Finance Director"],
    keyFeatures: ["Interactive Ramp Plan Matrix", "Coverage percentage calculations", "Budget variance tracking", "Export to Excel/PDF"],
    components: ["Coverage Header Bar", "RAMPS Table Grid", "Account Filter Toolbar", "PDF Spec Generator"],
    slaOrKpi: "95%+ Hiring Plan Attainment, ±3% Budget Accuracy",
    accentColor: [4, 44, 81]
  },
  {
    id: "job-descriptions",
    category: "Workforce Planning",
    title: "Job Descriptions & Factor Benchmarks",
    subtitle: "Repository of formalized job specs, compensable factor scoring, salary grade bands, and approval workflows",
    personas: ["Compensation & Benefits Specialist", "HR Director", "Hiring Managers"],
    keyFeatures: ["Job description editor", "Compensable factor scoring matrix", "Salary band alignment", "Department linkage"],
    components: ["Job Specs Catalog", "Factor Score Calculator", "Salary Matrix", "Approval Modal"],
    slaOrKpi: "100% Role Job-Match Accuracy, Annual Market Calibration",
    accentColor: [4, 44, 81]
  },
  {
    id: "hiring-needs-intake",
    category: "Workforce Planning",
    title: "Personnel Requisition Intake (PRF)",
    subtitle: "Formal hiring requests, budget code approvals, headcount justifications, and requisition SLA tracking",
    personas: ["Hiring Manager", "Department Head", "Finance Approver", "TA Recruiter"],
    keyFeatures: ["New PRF multi-step creation modal", "Requisition status lifecycle", "Budget code validation", "Live sync to Positions"],
    components: ["Requisition Roster", "Create PRF Modal", "Approval Status Tracker", "Headcount Matrix"],
    slaOrKpi: "< 48h PRF Approval Turnaround, 100% Budget Authorized",
    accentColor: [255, 92, 40]
  },
  {
    id: "available-positions",
    category: "Workforce Planning",
    title: "Available Positions & Requisition Matching",
    subtitle: "Live registry of authorized open requisitions matched with job descriptions and talent sourcing pipelines",
    personas: ["TA Sourcing Lead", "Hiring Managers", "Campus Recruiters"],
    keyFeatures: ["Open position cards", "Fulfillment percentage indicator", "Linkage to JD and PRF", "Quick applicant sourcing jump"],
    components: ["Position Cards Grid", "Sourcing Channel Badges", "Fulfillment Progress Bar", "Quick Action Menu"],
    slaOrKpi: "< 7 Days Posting to First Qualified Candidate",
    accentColor: [4, 44, 81]
  },

  // 3. Recruitment Pipeline
  {
    id: "applicant-leads",
    category: "Recruitment Pipeline",
    title: "Applicant Leads Sourcing Hub",
    subtitle: "Multi-channel intake (Walk-in, Job Fair, Referral, Social Ads, QR Codes) with fast-track qualification",
    personas: ["Sourcing Specialist", "Recruiter", "Event Coordinator"],
    keyFeatures: ["Channel tagging", "Quick status qualification (Qualified, In Review, Rejected)", "Direct convert to Pipeline candidate", "Bulk CSV Export"],
    components: ["Lead Channel Summary", "Lead Data Table", "Channel Filter Chips", "Convert-to-Candidate Modal"],
    slaOrKpi: "< 24h Lead Contact SLA, 70%+ First-Touch Rate",
    accentColor: [75, 157, 254]
  },
  {
    id: "talent-pool",
    category: "Recruitment Pipeline",
    title: "Talent Pool Master Archive",
    subtitle: "Historical candidate repository with categorizations (Silver Pool, Recyclable, Do Not Reprocess, Drop-off)",
    personas: ["TA Sourcing Lead", "Senior Recruiter"],
    keyFeatures: ["Sub-pool categorization", "Bulk CSV import & batch upload", "1-Click Endorsement into active waves", "Skill search"],
    components: ["Pool Sub-tab Bar", "Bulk Upload Modal", "Endorse Modal", "Talent Roster Table"],
    slaOrKpi: "30%+ Passive Sourcing Re-engagement Rate",
    accentColor: [4, 44, 81]
  },
  {
    id: "candidate-pipeline",
    category: "Recruitment Pipeline",
    title: "Candidate Pipeline (Kanban & Calendar)",
    subtitle: "Full-cycle hiring stages with mandatory PRF Gating, weighted assessment rubrics, and Google Meet integration",
    personas: ["Lead Recruiter", "Interviewers", "Hiring Managers"],
    keyFeatures: ["Drag-and-Drop Kanban Board", "Interactive Interview Calendar", "Mandatory PRF Matching Gate", "Scoring Rubrics Modal"],
    components: ["Pipeline Kanban Columns", "Calendar Scheduler", "PRF Matching Modal", "Interview Evaluation Form"],
    slaOrKpi: "< 48h Stage Movement SLA, 100% PRF Verification",
    accentColor: [255, 92, 40]
  },
  {
    id: "offers",
    category: "Recruitment Pipeline",
    title: "Job Offers & Compensation Governance",
    subtitle: "Itemized compensation structuring, multi-tier approvals, offer letter generator, and candidate acceptance tracking",
    personas: ["TA Manager", "Comp & Ben Lead", "Finance Director"],
    keyFeatures: ["Itemized salary breakdown (Basic + Allowances + Night Diff)", "Approval workflow status", "Offer letter generator", "Onboarding handoff"],
    components: ["Offers Table", "Create Offer Modal", "Compensation Calculator", "Approval Badge Stream"],
    slaOrKpi: "< 24h Offer Issuance SLA, 85%+ Target Acceptance",
    accentColor: [46, 204, 113]
  },
  {
    id: "onboarding",
    category: "Recruitment Pipeline",
    title: "Onboarding & Pre-Employment Compliance",
    subtitle: "5 Major Pre-Employment Requirements tracking, NHO class scheduling, and automated graduation to Employee Directory",
    personas: ["Onboarding Coordinator", "HR Compliance Specialist", "Training Manager"],
    keyFeatures: ["5 Requirements Checklist (TOR, Medical, NBI, PSA, IDs)", "NHO Class Roster", "Document verification modal", "1-Click Graduation to Directory"],
    components: ["Compliance Tracker Matrix", "NHO Class Roster", "Requirement Modal", "Graduation Trigger"],
    slaOrKpi: "100% Day-1 Medical & NBI Compliance",
    accentColor: [4, 44, 81]
  },

  // 4. Operations & Governance
  {
    id: "recruitment-flowchart",
    category: "Operations & Governance",
    title: "Interactive 16-Step Recruitment Flowchart & SOP Simulator",
    subtitle: "Comprehensive 4-phase, 16-step visual interactive diagram, step inspectors, loopbacks, and simulation engine",
    personas: ["HR Leadership", "TA Specialists", "Auditors", "New Recruiters"],
    keyFeatures: ["Interactive step nodes", "Phase filtering", "Live simulation playback", "PDF SOP Export", "Direct module deep-links"],
    components: ["Flow Diagram Canvas", "Step Inspector Drawer", "Phase Filter Pills", "Simulation Controls"],
    slaOrKpi: "100% SOP Compliance, Complete Process Auditability",
    accentColor: [4, 44, 81]
  },
  {
    id: "sourcing-analytics",
    category: "Operations & Governance",
    title: "Sourcing Channel & Funnel Analytics",
    subtitle: "Channel performance ROI, cost-per-hire, source effectiveness, and bottleneck discovery",
    personas: ["TA Director", "HR Analytics Specialist"],
    keyFeatures: ["Channel conversion rates", "Cost per hire metrics", "Lead volume breakdown", "Exportable analytics charts"],
    components: ["Channel ROI Charts", "Conversion Funnel Bar", "Lead Source Table", "Date Range Filter"],
    slaOrKpi: "Sub-PHP 1,500 Cost-per-Hire on Organic Channels",
    accentColor: [255, 92, 40]
  },
  {
    id: "email-logs",
    category: "Operations & Governance",
    title: "Communications & System Email Logs",
    subtitle: "Outbound recruitment email audit trail, deliverability status, event timelines, and template previews",
    personas: ["Recruitment Operations", "Compliance Officer", "System Admin"],
    keyFeatures: ["Search & filter email logs", "Message preview drawer", "Delivery event timeline", "Resend capability"],
    components: ["Email Log Table", "Detail Drawer", "Event Timeline", "Search & Filter Bar"],
    slaOrKpi: "99.8% Email Delivery Rate, 100% Message Traceability",
    accentColor: [4, 44, 81]
  },
  {
    id: "recruitment-settings",
    category: "Operations & Governance",
    title: "Recruitment Engine & SLA Governance Settings",
    subtitle: "Email templates, pipeline stages, custom hiring rubrics, campus locations, and SLA thresholds",
    personas: ["Super Admin", "TA Operations Lead"],
    keyFeatures: ["Configurable SLA thresholds", "Custom email templates", "Rubric scoring weights", "Department & campus mappings"],
    components: ["Settings Sub-tabs", "SLA Configuration Grid", "Template Editor", "Save & Sync Bar"],
    slaOrKpi: "Zero Hardcoded Workflow Constraints",
    accentColor: [4, 44, 81]
  },

  // 5. Portals & Public Forms
  {
    id: "public-application-portal",
    category: "Portals & Public Forms",
    title: "Public Talent Pool Self-Application Portal",
    subtitle: "Standalone responsive candidate portal (`sibsapply.getleadsource.com`) with audio voice intros and custom questions",
    personas: ["External Candidates", "Campus Walk-ins", "Job Applicants"],
    keyFeatures: ["2-Step Application Flow", "Audio voice self-introduction", "Resume upload", "Direct sync to Leads & Talent Pool"],
    components: ["Public Hero Banner", "2-Step Application Stepper", "Audio Recorder Widget", "Success Receipt"],
    slaOrKpi: "< 3 Minutes Form Completion Time, Zero Mobile Friction",
    accentColor: [255, 92, 40]
  },
  {
    id: "candidate-experience-survey",
    category: "Portals & Public Forms",
    title: "Candidate Experience Feedback & Net Promoter Portal",
    subtitle: "Public 5-star NPS rating, interview feedback survey, recruiter satisfaction scoring, and analytics dashboard",
    personas: ["Candidates (Post-Interview / Post-Hire)", "TA Leadership"],
    keyFeatures: ["5-Star Rating Rubric", "Net Promoter Score (NPS) calculation", "Feedback sentiment aggregator", "Executive Experience KPIs"],
    components: ["Public Survey Card", "NPS Gauge", "Recruiter Ratings Matrix", "Candidate Feedback Cards"],
    slaOrKpi: "+75 Net Promoter Score (NPS), 80%+ Feedback Response Rate",
    accentColor: [46, 204, 113]
  }
];

export const DESIGN_TOKENS = {
  brand: [
    { name: "Primary Deep Navy", hex: "#042C51", rgb: "4, 44, 81", usage: "Headings, primary typography, sidebar shell, active tabs, dark accents" },
    { name: "Vivid Action Orange", hex: "#FF5C28", rgb: "255, 92, 40", usage: "Primary CTA buttons, active pagination, focus rings, top card accent gradients" },
    { name: "Application Shell Bg", hex: "#E6EAF0", rgb: "230, 234, 240", usage: "Global background canvas, container background" },
    { name: "Surface Clean White", hex: "#FFFFFF", rgb: "255, 255, 255", usage: "Cards, data tables, modals, input containers" },
    { name: "Subtle Surface Alt", hex: "#F7F9FC", rgb: "247, 249, 252", usage: "Table header rows, hover states, secondary chips" }
  ],
  tones: [
    { name: "Tone Green (Success)", hex: "#2ECC71", rgb: "46, 204, 113", bg: "#E8F8F0", usage: "Passed assessments, hired candidates, approved PRFs, active employees" },
    { name: "Tone Amber (Warning)", hex: "#E67E22", rgb: "230, 126, 34", bg: "#FEF5E7", usage: "Pending approvals, expiring clearances, approaching SLA thresholds" },
    { name: "Tone Red (Danger)", hex: "#E74C3C", rgb: "231, 76, 60", bg: "#FDEDEC", usage: "Failed assessments, rejected requisitions, drop-offs, critical SLA breaches" },
    { name: "Tone Blue (Info)", hex: "#4B9DFE", rgb: "75, 157, 254", bg: "#EBF5FB", usage: "Interview scheduled, new leads, active evaluations, informational alerts" }
  ],
  typography: [
    { class: ".sibs-text-micro", size: "9.5px / 10px", weight: "700/800", usage: "Kick-off labels, date badges, table category tags, metric captions" },
    { class: ".sibs-text-xs", size: "11.5px / 12px", weight: "500/600", usage: "Sidebar navigation links, search inputs, user profile names, small table cells" },
    { class: ".sibs-text-sm", size: "12.5px / 13px", weight: "500/600", usage: "Secondary data, button text, form labels, compact filters" },
    { class: ".sibs-text-base", size: "13.5px / 14px", weight: "400/500", usage: "Standard body text, table row content, card descriptions" },
    { class: ".sibs-text-md", size: "15px / 16px", weight: "600/700", usage: "Section headers, card titles, drawer sub-titles" },
    { class: ".sibs-text-lg", size: "17px / 18px", weight: "700/800", usage: "Sub-module titles, modal titles, stage headers" },
    { class: ".sibs-text-xl", size: "20px / 22px", weight: "800", usage: "Page titles, primary KPI numbers, hero metrics" }
  ]
};

/**
 * Generates an executive-grade, multi-page vector PDF containing all frontend screen
 * architectures, design tokens, workflows, and UI specifications.
 */
export function generateFullDesignSystemPdf() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const navy: RGBColor = [4, 44, 81];
  const orange: RGBColor = [255, 92, 40];
  const darkSlate: RGBColor = [30, 41, 59];
  const mutedSlate: RGBColor = [100, 116, 139];
  const paleBg: RGBColor = [241, 245, 249];

  const setFill = (c: RGBColor) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c: RGBColor) => doc.setTextColor(c[0], c[1], c[2]);

  let currentPage = 1;
  const totalPages = 7;

  const drawHeader = (title: string, sub: string) => {
    // Top banner
    setFill(navy);
    doc.rect(0, 0, 210, 22, "F");

    // Accent line
    setFill(orange);
    doc.rect(0, 22, 210, 1.5, "F");

    // Brand title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SiBS HRIS ENTERPRISE UI SPECBOOK", 14, 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 164, 136);
    doc.text(`${title.toUpperCase()} — ${sub.toUpperCase()}`, 14, 16);

    doc.setTextColor(200, 220, 240);
    doc.setFontSize(7.5);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, 160, 16);
  };

  const drawFooter = () => {
    setFill(paleBg);
    doc.rect(0, 287, 210, 10, "F");

    setText(mutedSlate);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("SiBS Solutions Inc. • Internal Enterprise System Architecture • Confidential & Proprietary", 14, 293);
    doc.text(`Page ${currentPage} of ${totalPages}`, 185, 293);
  };

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE ARCHITECTURE
  // ==========================================
  // Cover Banner
  setFill(navy);
  doc.rect(0, 0, 210, 110, "F");
  setFill(orange);
  doc.rect(0, 110, 210, 3, "F");

  // Logo Badge
  setFill(orange);
  doc.roundedRect(14, 20, 18, 18, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("S", 20, 33);

  // Title
  doc.setFontSize(22);
  doc.text("SiBS HRIS", 38, 28);
  doc.setFontSize(11);
  doc.setTextColor(255, 164, 136);
  doc.text("COMPLETE FRONTEND SYSTEM & UI SPECBOOK", 38, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(210, 230, 250);
  doc.text("Human Resources Information System • Design Tokens, UI Blueprint & Screen Specifications", 14, 52);
  doc.text(`Campuses Covered: Davao City (HQ), Tagum City, Mabini Campus | Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, 14, 58);

  // Quick stats card on cover
  const statBoxY = 68;
  const stats = [
    { label: "TOTAL SCREENS", val: "24+" },
    { label: "SYSTEM MODULES", val: "5 WORKSPACES" },
    { label: "USER PERSONAS", val: "8 ROLES" },
    { label: "RECRUITMENT STEPS", val: "16-STEP SOP" }
  ];

  stats.forEach((st, idx) => {
    const x = 14 + idx * 46;
    doc.setFillColor(11, 54, 95);
    doc.roundedRect(x, statBoxY, 43, 26, 2, 2, "F");
    doc.setTextColor(255, 164, 136);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(st.label, x + 4, statBoxY + 8);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text(st.val, x + 4, statBoxY + 19);
  });

  // Body content on page 1
  let yPos = 125;
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. Executive Summary & Design System Philosophy", 14, yPos);

  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setText(darkSlate);
  const introText = 
    "SiBS HRIS is an enterprise-grade Human Resources Information System engineered for high data density, rapid multi-role task execution, and unified workforce visibility. Built with a bespoke navy and vivid orange brand architecture, it strictly adheres to enterprise ergonomic standards: zero visual fluff, high-contrast readable typography, mathematically proportional layout grids, and full responsive support across desktop (1920p / 1366p), tablet, and mobile viewports.";
  doc.text(doc.splitTextToSize(introText, 182), 14, yPos);

  yPos += 22;
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. System Workspaces & Architectural Scope", 14, yPos);

  yPos += 4;
  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Workspace", "Primary Scope & Functional Capabilities", "Key Modules & Sub-screens", "Primary Actors"]],
    body: [
      [
        "Core HR & Role Dashboards",
        "Role-tailored telemetry, master personnel records, biometric timekeeping, leaves, offboarding",
        "Super Admin, HR Admin, TA Lead, OM, Employee Portal, Directory, Attendance, Leaves, Resignation",
        "Super Admin, HR Admins, People Managers, Employees"
      ],
      [
        "Workforce Planning",
        "RAMPS capacity forecasting, personnel requisition intake (PRF), job descriptions & factor scoring",
        "Workforce & Hiring Plan, Job Descriptions, Hiring Needs Intake, Available Positions",
        "WFM Planners, TA Leads, Finance Approvers, Hiring Managers"
      ],
      [
        "Recruitment Pipeline",
        "Multi-channel sourcing, talent pool archive, PRF-gated Kanban pipeline, offers & onboarding",
        "Applicant Leads, Talent Pool, Candidate Pipeline (Kanban/Calendar), Offers, Onboarding (5 Req Tracker)",
        "Recruiters, Interviewers, Sourcing Specialists, Onboarding Officers"
      ],
      [
        "Operations & Governance",
        "Interactive 16-step SOP flowchart, sourcing ROI analytics, weekly summaries, email audit trail",
        "Recruitment Flowchart, Sourcing Analytics, Action Items, Weekly Reports, Email Logs, Settings",
        "TA Directors, Operations Managers, Compliance Auditors"
      ],
      [
        "Public Candidate Portals",
        "Responsive candidate self-application portal & post-interview Candidate Experience survey",
        "Public Talent Pool Portal (sibsapply.getleadsource.com), Candidate Experience NPS Survey",
        "External Candidates, Campus Walk-ins, Job Applicants"
      ]
    ],
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: "bold" },
      1: { cellWidth: 55 },
      2: { cellWidth: 55 },
      3: { cellWidth: 34 }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  drawFooter();

  // ==========================================
  // PAGE 2: DESIGN TOKENS & VISUAL IDENTITY
  // ==========================================
  doc.addPage();
  currentPage = 2;
  drawHeader("Visual Identity & Design Tokens", "Color Hierarchy, Typography Scale & Layout Rules");

  yPos = 30;
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. Core Brand Colors & Palette Matrix", 14, yPos);

  yPos += 4;
  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Token Name", "HEX Code", "RGB Values", "Recommended Enterprise UI Usage"]],
    body: DESIGN_TOKENS.brand.map(b => [b.name, b.hex, b.rgb, b.usage]),
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold" },
      1: { cellWidth: 25 },
      2: { cellWidth: 28 },
      3: { cellWidth: 84 }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. Status & Tone System (Accessible Contrast AA Compliance)", 14, yPos);

  yPos += 4;
  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Tone / Semantic State", "HEX Accent", "Soft Background", "System Meaning & Applied UI States"]],
    body: DESIGN_TOKENS.tones.map(t => [t.name, t.hex, t.bg, t.usage]),
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold" },
      1: { cellWidth: 25 },
      2: { cellWidth: 28 },
      3: { cellWidth: 84 }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. Typography Scale & Responsive Font Sizing (Plus Jakarta Sans)", 14, yPos);

  yPos += 4;
  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["CSS Class Selector", "Rendered Size (<1536p / 2XL)", "Font Weight", "Applied Enterprise Use Case"]],
    body: DESIGN_TOKENS.typography.map(tp => [tp.class, tp.size, tp.weight, tp.usage]),
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: "bold" },
      1: { cellWidth: 42 },
      2: { cellWidth: 25 },
      3: { cellWidth: 77 }
    }
  });

  drawFooter();

  // ==========================================
  // PAGE 3: CORE HR & ROLE DASHBOARDS
  // ==========================================
  doc.addPage();
  currentPage = 3;
  drawHeader("Core HR & Role-Based Dashboards", "Super Admin, HR Admin, TA Lead, OM & Employee Portal");

  yPos = 30;
  const coreHrScreens = SYSTEM_SCREENS.filter(s => s.category === "Core HR & Dashboards");

  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Screen & Module Title", "User Personas", "Key Frontend Features & Sub-views", "Component Spec / SLAs"]],
    body: coreHrScreens.map(s => [
      `${s.title}\n(${s.subtitle})`,
      s.personas.join(", "),
      s.keyFeatures.join(" • "),
      `Components: ${s.components.join(", ")}\nSLA/KPI: ${s.slaOrKpi}`
    ]),
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.2, textColor: [30, 41, 59], cellPadding: 2.4 },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: "bold" },
      1: { cellWidth: 34 },
      2: { cellWidth: 54 },
      3: { cellWidth: 46 }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  drawFooter();

  // ==========================================
  // PAGE 4: WORKFORCE PLANNING & REQUISITIONS
  // ==========================================
  doc.addPage();
  currentPage = 4;
  drawHeader("Workforce Planning & Requisitions", "RAMPS Capacity Plan, PRF Intake, JDs & Available Positions");

  yPos = 30;
  const wfScreens = SYSTEM_SCREENS.filter(s => s.category === "Workforce Planning");

  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Screen & Module Title", "User Personas", "Key Frontend Features & Sub-views", "Component Spec / SLAs"]],
    body: wfScreens.map(s => [
      `${s.title}\n(${s.subtitle})`,
      s.personas.join(", "),
      s.keyFeatures.join(" • "),
      `Components: ${s.components.join(", ")}\nSLA/KPI: ${s.slaOrKpi}`
    ]),
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 2.8 },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: "bold" },
      1: { cellWidth: 34 },
      2: { cellWidth: 54 },
      3: { cellWidth: 46 }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  // Add a callout box explaining PRF Gating Architecture
  yPos = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(235, 245, 255);
  doc.roundedRect(14, yPos, 182, 36, 2, 2, "F");
  doc.setDrawColor(75, 157, 254);
  doc.roundedRect(14, yPos, 182, 36, 2, 2, "D");

  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("CORE ARCHITECTURAL RULE: MANDATORY PRF GATING SYSTEM", 18, yPos + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setText(darkSlate);
  const prfExplanation = 
    "In SiBS HRIS, candidates cannot advance to formal assessment scoring, hiring manager interviews, or compensation offer generation without an active, approved Personnel Requisition Form (PRF) with verified headcount allocation. If an unmapped candidate is dragged in Kanban, the system automatically triggers a PRF Selection Modal to enforce budget integrity and headcount tracking.";
  doc.text(doc.splitTextToSize(prfExplanation, 174), 18, yPos + 12);

  drawFooter();

  // ==========================================
  // PAGE 5: RECRUITMENT PIPELINE & PORTALS
  // ==========================================
  doc.addPage();
  currentPage = 5;
  drawHeader("Recruitment Pipeline & Portals", "Leads Intake, Talent Pool, Kanban Pipeline & Public Forms");

  yPos = 30;
  const pipelineScreens = SYSTEM_SCREENS.filter(s => s.category === "Recruitment Pipeline" || s.category === "Portals & Public Forms");

  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Screen & Module Title", "Category / Roles", "Key Frontend Features & Sub-views", "Component Spec / SLAs"]],
    body: pipelineScreens.map(s => [
      `${s.title}\n(${s.subtitle})`,
      `${s.category}\n${s.personas.slice(0, 2).join(", ")}`,
      s.keyFeatures.join(" • "),
      `Components: ${s.components.join(", ")}\nSLA/KPI: ${s.slaOrKpi}`
    ]),
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.2, textColor: [30, 41, 59], cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: "bold" },
      1: { cellWidth: 32 },
      2: { cellWidth: 56 },
      3: { cellWidth: 46 }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  drawFooter();

  // ==========================================
  // PAGE 6: OFFERS, COMPLIANCE & ONBOARDING
  // ==========================================
  doc.addPage();
  currentPage = 6;
  drawHeader("Offers, Compliance & Onboarding", "Compensation Governance, 5 Pre-Employment Requirements & NHO");

  yPos = 30;
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("1. Itemized Compensation Package Structure", 14, yPos);

  yPos += 4;
  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Compensation Component", "Type / Frequency", "Standard Rate / Range", "Taxation & Approval Policy"]],
    body: [
      ["Basic Monthly Salary", "Base Pay (Semi-monthly)", "PHP 18,000 - 65,000", "Taxable, strict alignment with Job Description Factor Band"],
      ["De Minimis Allowances", "Non-Taxable Allowance", "PHP 2,500 - 5,000", "Non-taxable rice, laundry, and medical subsidy"],
      ["Night Differential (ND)", "10% Shift Premium", "10:00 PM - 6:00 AM hours", "Statutory requirement for night-shift campaigns"],
      ["Signing / Retention Bonus", "One-time / Milestones", "PHP 10,000 - 50,000 (Tiered)", "Requires TA Lead + Finance Approver sign-off with 1-yr bond"]
    ],
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold" },
      1: { cellWidth: 35 },
      2: { cellWidth: 40 },
      3: { cellWidth: 62 }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("2. The 5 Major Pre-Employment Compliance Requirements (NHO Gate)", 14, yPos);

  yPos += 4;
  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Requirement #", "Document Name", "Verification Method", "Mandatory Gate Policy"]],
    body: [
      ["Req 1", "Transcript of Records (TOR) / Diploma / Form 137", "Certified true copy or scanned registrar verification", "Must be submitted before Day 1 NHO start"],
      ["Req 2", "Medical Clearance (Fit-to-Work Certificate)", "Accredited clinic drug test, X-Ray & physical exam", "Strict blocker — candidate cannot attend NHO if pending"],
      ["Req 3", "NBI / Police Clearance", "Valid authenticated NBI Clearance certificate", "Must have validity period spanning hiring quarter"],
      ["Req 4", "PSA Birth Certificate", "Official Philippine Statistics Authority copy", "Required for 201 filing and dependent enrollment"],
      ["Req 5", "Government IDs (SSS, PhilHealth, Pag-IBIG, TIN)", "Official member data record (MDR) & numbers", "Required for automated payroll disbursement"]
    ],
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold" },
      1: { cellWidth: 55, fontStyle: "bold" },
      2: { cellWidth: 55 },
      3: { cellWidth: 50 }
    }
  });

  drawFooter();

  // ==========================================
  // PAGE 7: RECRUITMENT OPERATIONS & 16-STEP SOP
  // ==========================================
  doc.addPage();
  currentPage = 7;
  drawHeader("Recruitment Operations & 16-Step SOP", "Flowchart Architecture, Sourcing Analytics, Email Audit & Settings");

  yPos = 30;
  setText(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("1. End-to-End 16-Step Standard Operating Procedure (SOP) Matrix", 14, yPos);

  yPos += 4;
  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Phase", "Step Range", "Phase Objectives & Key Milestones", "Standard SLA"]],
    body: [
      [
        "Phase 1: Plan & Approve",
        "Step 1 - 2",
        "Step 1: Requisition Request (Hiring Needs Intake) • Step 2: Requisition Approval (TA/OM/Finance sign-off)",
        "1–2 Days"
      ],
      [
        "Phase 2: Prepare",
        "Step 3 - 5",
        "Step 3: Job Description & Competencies • Step 4: Sourcing Strategy • Step 5: Job Posting & Campaign Launch",
        "1–2 Days"
      ],
      [
        "Phase 3: Attract & Evaluate",
        "Step 6 - 11",
        "Step 6: Sourcing & Intake • Step 7: Initial Screening • Step 8: Assessment Fit • Step 9: Department Interview • Step 10: Final Interview • Step 11: Candidate Selection",
        "5–8 Days"
      ],
      [
        "Phase 4: Hire & Onboard",
        "Step 12 - 16",
        "Step 12: Offer Extended • Step 13: Offer Accepted • Step 14: Pre-Employment Verification • Step 15: NHO & Day 1 • Step 16: Probationary Review",
        "3–5 Days"
      ]
    ],
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 2.6 },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: "bold" },
      1: { cellWidth: 24, fontStyle: "bold" },
      2: { cellWidth: 92 },
      3: { cellWidth: 28 }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;
  const opsScreens = SYSTEM_SCREENS.filter(s => s.category === "Operations & Governance");

  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    head: [["Operations Module", "Key Frontend Capabilities", "Components & Auditability", "Target SLA"]],
    body: opsScreens.map(s => [
      s.title,
      s.keyFeatures.join(" • "),
      s.components.join(", "),
      s.slaOrKpi
    ]),
    headStyles: { fillColor: [4, 44, 81], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.2, textColor: [30, 41, 59], cellPadding: 2.4 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: 62 },
      2: { cellWidth: 50 },
      3: { cellWidth: 28 }
    }
  });

  drawFooter();

  // Save the generated document
  doc.save(`SiBS_HRIS_Full_Frontend_Design_Specbook_${new Date().toISOString().slice(0, 10)}.pdf`);
}
