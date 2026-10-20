import { IABranch, SystemModuleSummary } from "./flowchartTypes";

export const MERMAID_DIAGRAMS: Record<string, { title: string; code: string; description: string }> = {
  "process-1-ia": {
    title: "1. High-Level Information Architecture Flowchart",
    description: "Main structural hierarchy across all roles and system sections in the SiBS Solutions HRIS Ecosystem wireframe.",
    code: `flowchart TD
    ROOT([SiBS Solutions HRIS Ecosystem]) --> NAV[Global Topbar & Role Navigation]

    %% Main Branches
    NAV --> M1[Employee Access]
    NAV --> M2[Core HR & Attendance]
    NAV --> M3[Recruitment & Talent Lifecycle]
    NAV --> M4[Workforce Planning Engine]
    NAV --> M5[Executive & Analytics Dashboards]
    NAV --> M6[Administration & Organization]

    %% Sub-modules
    M1 --> E1[My Attendance / Timesheet]
    M1 --> E2[My Leaves & Time Off Requests]
    M1 --> E3[My Profile & Schedule]

    M2 --> HR1[Employee Directory]
    M2 --> HR2[Time & Attendance Real-Time Board]
    M2 --> HR3[Leaves & Time Off Approval Queue]
    M2 --> HR4[Resignation Management & Clearance]

    M3 --> REC1[Job Descriptions & Compensable Factors]
    M3 --> REC2[Hiring Needs Intake]
    M3 --> REC3[Available Positions]
    M3 --> REC4[Sourcing Analytics & Channels]
    M3 --> REC5[Applicant Leads & Resume Ingestion]
    M3 --> REC6[Public Application Portal]
    M3 --> REC7[Talent Pool & Screening Stages]
    M3 --> REC8[Job Offers & Acceptance Tracking]
    M3 --> REC9[Onboarding & Pre-Employment Checklist]

    M4 --> W1[Workforce Hiring Overview]
    M4 --> W2[Workforce Hiring Plan Ledger]
    M4 --> W3[View Plan Drawer & Ramp Analysis]
    M4 --> W4[Action Items & Task Execution]

    M5 --> D1[Super Admin Dashboard]
    M5 --> D2[HR Executive Dashboard]
    M5 --> D3[TA Recruiter Dashboard]
    M5 --> D4[OM Operations Manager Dashboard]
    M5 --> D5[Weekly Reports & Hiring Yield]

    M6 --> A1[Departments Catalog - 7 Units]
    M6 --> A2[Office Locations - Tagum, Davao, Mabini]
    M6 --> A3[Recruitment Settings & Scoring Criteria]
    M6 --> A4[Email Communication Logs & Audit Trail]`
  },
  "process-2-recruitment": {
    title: "2. End-to-End Recruitment & Talent Acquisition Pipeline Flowchart",
    description: "Complete candidate journey from job demand creation through sourcing, assessments, offers, and day-1 orientation.",
    code: `flowchart LR
    subgraph PHASE1["1. Demand & Intake"]
        A1[OM / Dept Lead submits Hiring Need Intake] --> A2{Approved by HR & WFM?}
        A2 -- No --> A3[Intake Rejected / Returned]
        A2 -- Yes --> A4[Generate Available Position & Link JD]
    end

    subgraph PHASE2["2. Sourcing & Leads"]
        A4 --> B1[Publish Job Posting]
        B1 --> B2[Public Application Form]
        B1 --> B3[External Channels: Indeed / Referrals / Walk-ins]
        B2 & B3 --> B4[Applicant Leads Ingestion]
        B4 --> B5[Lead Qualification & Screening]
    end

    subgraph PHASE3["3. Talent Pool Pipeline"]
        B5 --> C1[Talent Pool Database]
        C1 --> C2[Initial HR Interview]
        C2 --> C3[Skills Assessment & Language Evaluation]
        C3 --> C4[Operations / Client Final Interview]
        C4 --> C5{Interview Passed?}
        C5 -- No --> C6[Talent Pool Archive / Re-profile]
    end

    subgraph PHASE4["4. Offer & Onboarding"]
        C5 -- Yes --> D1[Generate Job Offer & Compensation]
        D1 --> D2{Candidate Accepts Offer?}
        D2 -- No --> D3[Offer Declined / Renegotiate]
        D2 -- Yes --> D4[Transfer to Onboarding Module]
        D4 --> D5[Collect Pre-Employment Requirements]
        D5 --> D6[Contract Signing & IT Asset Allocation]
        D6 --> D7[Day-1 Welcome Kit & Orientation]
        D7 --> D8[Converted to Active Employee Directory]
    end

    PHASE1 --> PHASE2 --> PHASE3 --> PHASE4`
  },
  "process-3-workforce": {
    title: "3. Workforce Planning & Capacity Ramp Flowchart",
    description: "Core Workforce & Hiring scenario workflows connecting Overview KPIs with Plan Ledgers, Ramp Drawers, and Global Sync.",
    code: `flowchart TD
    START[Account Hiring Request Identified] --> STEP1[Cluster & Account Selection]
    
    STEP1 --> STEP2[Evaluate Required Headcount vs Actual Capacity]
    STEP2 --> CALC[Compute Gap / Buffer % & Ramp Variance]
    
    CALC --> V1{Viewing Mode?}
    
    %% Overview Path
    V1 -- Overview Screen --> OV1[Workforce Coverage KPIs]
    OV1 --> OV2[Cluster Progress Cards]
    OV2 --> OV3[Account Hiring Ramps Ledger]
    OV3 --> OV4[Expand Row for Detailed Headcount Breakdown]

    %% Plan Path
    V1 -- Plan Screen --> PL1[Plan Ledger Table]
    PL1 --> PL2[Open Plan Drawer]
    PL2 --> PL3[Adjust Hired Count / Timeline Targets]
    PL2 --> PL4[Assign Recruitment Action Items & Due Dates]
    PL4 --> PL5[Save & Synchronize Headcount Records]

    PL5 --> SYNC[(Global Detail Records)]
    SYNC --> OV1`
  },
  "process-4-core-hr": {
    title: "4. Core HR, Attendance & Lifecycle Flowchart",
    description: "Operational workflows for daily time & attendance, leave application/approvals, and resignation clearances.",
    code: `flowchart TD
    EMP([Employee / Staff]) --> CLOCK[Daily Time & Attendance]
    
    CLOCK --> CHK1{Shift Discrepancy or Overtime?}
    CHK1 -- Yes --> ADJ[Attendance Discrepancy Review by Supervisor]
    CHK1 -- No --> LOGGED[Timesheet Approved for Payroll]

    EMP --> LEAVE[Submit Leave Application]
    LEAVE --> LTYPE{Leave Type}
    LTYPE --> L1[Vacation / Sick / Emergency / Maternity]
    L1 --> LBAL[Check Balance & Blackout Dates]
    LBAL --> LAPPR{Manager & HR Approval}
    LAPPR -- Approved --> LOK[Deduct Balance & Notify Shift Lead]
    LAPPR -- Rejected --> LREJ[Reason Provided & Feedback Sent]

    EMP --> SEP[Submit Resignation Request]
    SEP --> S1[Record Resignation Notice in Resignation Mgmt]
    S1 --> S2[Exit Interview Scheduling & Survey]
    S2 --> S3[Department Clearance: IT, Finance, HR]
    S3 --> S4[Final Pay Computation & Deactivation]`
  },
  "process-5-governance": {
    title: "5. Organizational & Administrative Governance Flowchart",
    description: "Administrative hierarchy governing 7 organizational divisions, 3 office locations, scoring configurations, and dispatch logs.",
    code: `flowchart TD
    SUPER[Super Admin / HR Governance] --> GOV{Administrative Module}

    %% Departments
    GOV --> G1[Departments Management]
    G1 --> D1[7 Organizational Divisions: Ops, HR, Finance, IT, TA, WFM, Facilities]
    D1 --> D2[Track Headcount, Budget Caps, and Division Leaders]

    %% Office Locations
    GOV --> G2[Office Locations Registry]
    G2 --> L1[SiBS Tagum HQ - Site 1]
    G2 --> L2[SiBS Davao Operations Center - Site 2]
    G2 --> L3[SiBS Mabini Development Center - Site 3]
    L1 & L2 & L3 --> L4[Track Desk Inventory, Seat Occupancy %, and 24/7 Operations]

    %% Settings & Logs
    GOV --> G3[Recruitment Settings]
    G3 --> S1[Configure Assessment Passing Thresholds, Scoring Matrices & SLA Windows]

    GOV --> G4[Email Communication Logs]
    G4 --> E1[Audit Automated Notifications: Interview Invites, Offer Letters & Onboarding Updates]`
  }
};

export const IA_BRANCHES: IABranch[] = [
  {
    id: "M1",
    name: "Employee Access",
    code: "M1",
    roleAudience: "All Employees & Frontline Agents",
    color: "#0E8773",
    borderColor: "border-teal-300",
    bgLight: "bg-teal-50/50",
    description: "Self-service portal enabling frontline talent to track time, view schedules, and file leave requests.",
    subModules: [
      { id: "E1", name: "My Attendance / Timesheet", moduleKey: "Time & Attendance", description: "Personal daily clock-in/out stamps, break punches, and biometric logs.", badge: "Self-Service" },
      { id: "E2", name: "My Leaves & Time Off Requests", moduleKey: "Leaves & Time Off", description: "Leave application portal, balance tracker, and pending approval tracker.", badge: "Real-Time" },
      { id: "E3", name: "My Profile & Schedule", moduleKey: "Employee Directory", description: "Frontline employee profile, work shift assignment, and contact details.", badge: "Profile" }
    ]
  },
  {
    id: "M2",
    name: "Core HR & Attendance",
    code: "M2",
    roleAudience: "HR Officers & Team Leads",
    color: "#1D68BD",
    borderColor: "border-blue-300",
    bgLight: "bg-blue-50/50",
    description: "Daily workforce attendance board, real-time rosters, leave approval workflows, and resignation tracking.",
    subModules: [
      { id: "HR1", name: "Employee Directory", moduleKey: "Employee Directory", description: "Complete organizational roster with SiBS ID, department, and status filters.", badge: "2,450 Staff" },
      { id: "HR2", name: "Time & Attendance Real-Time Board", moduleKey: "Time & Attendance", description: "Live clocking board monitoring presence, tardiness, and overtime requests.", badge: "Live Sync" },
      { id: "HR3", name: "Leaves & Time Off Approval Queue", moduleKey: "Leaves & Time Off", description: "Manager approval queue for vacation, sick, and emergency leave filings.", badge: "Approvals" },
      { id: "HR4", name: "Resignation Management & Clearance", moduleKey: "Resignation Management", description: "End-to-end offboarding tracking with 3-department clearance signoff.", badge: "Clearance" }
    ]
  },
  {
    id: "M3",
    name: "Recruitment & Talent Lifecycle",
    code: "M3",
    roleAudience: "TA Recruiters, Sourcing Specialists & Hiring Managers",
    color: "#6B21A8",
    borderColor: "border-purple-300",
    bgLight: "bg-purple-50/50",
    description: "Full talent acquisition engine from job descriptions to public candidate intake, screening, and day-1 onboarding.",
    subModules: [
      { id: "REC1", name: "Job Descriptions & Compensable Factors", moduleKey: "Job Description", description: "Job catalog with role criteria, educational levels, and salary benchmarks.", badge: "Catalog" },
      { id: "REC2", name: "Hiring Needs Intake", moduleKey: "Hiring Needs Intake", description: "Requisition intake tickets submitted by Operations Managers and Account Leads.", badge: "Demand" },
      { id: "REC3", name: "Available Positions", moduleKey: "Available Positions", description: "Active open headcount postings linked to approved JDs and campus sites.", badge: "Openings" },
      { id: "REC4", name: "Sourcing Analytics & Channels", moduleKey: "Sourcing Analytics", description: "Channel effectiveness tracking (Indeed, Facebook, Walk-ins, Referrals).", badge: "Metrics" },
      { id: "REC5", name: "Applicant Leads & Resume Ingestion", moduleKey: "Applicant Leads", description: "Inbound applicant leads capture and resume parsing queue.", badge: "Leads" },
      { id: "REC6", name: "Public Application Portal", moduleKey: "Public Application Form", description: "Candidate-facing responsive portal for external applicant intake.", badge: "Public" },
      { id: "REC7", name: "Talent Pool & Screening Stages", moduleKey: "Talent Pool", description: "Candidate pipeline board across screening, exams, and interviews.", badge: "Pipeline" },
      { id: "REC8", name: "Job Offers & Acceptance Tracking", moduleKey: "Offers", description: "Employment offer letter dispatch, compensation specs, and acceptance status.", badge: "Offers" },
      { id: "REC9", name: "Onboarding & Pre-Employment Checklist", moduleKey: "Onboarding", description: "Pre-employment requirement collection (NBI, SSS, Medical) and orientation.", badge: "Pre-Emp" }
    ]
  },
  {
    id: "M4",
    name: "Workforce Planning Engine",
    code: "M4",
    roleAudience: "WFM Principals, Capacity Planners & Ops Directors",
    color: "#FF5C28",
    borderColor: "border-orange-300",
    bgLight: "bg-orange-50/50",
    description: "Ramp modeling, buffer variance calculations, capacity planning, and action item task execution.",
    subModules: [
      { id: "W1", name: "Workforce Hiring Overview", moduleKey: "Workforce Hiring", description: "Macro coverage KPIs, cluster progress cards, and account hiring ramps ledger.", badge: "KPIs" },
      { id: "W2", name: "Workforce Hiring Plan Ledger", moduleKey: "Workforce Hiring", description: "Comprehensive scenario planning table with hiring rates and deficit metrics.", badge: "Ledger" },
      { id: "W3", name: "View Plan Drawer & Ramp Analysis", moduleKey: "Workforce Hiring", description: "Deep-dive drawer with training cohort timelines (NHO, FST, PST, Go-Live).", badge: "Cohorts" },
      { id: "W4", name: "Action Items & Task Execution", moduleKey: "Action Items", description: "Assigned recruitment tasks, ramp blockers, and mitigation action items.", badge: "Tasks" }
    ]
  },
  {
    id: "M5",
    name: "Executive & Analytics Dashboards",
    code: "M5",
    roleAudience: "Executives, OM, TA Leads & Super Admins",
    color: "#042C51",
    borderColor: "border-slate-300",
    bgLight: "bg-slate-50/70",
    description: "Role-tailored cockpits providing real-time visibility into operational health, hiring velocity, and SLAs.",
    subModules: [
      { id: "D1", name: "Super Admin Dashboard", moduleKey: "Super Admin Dashboard", description: "System-wide overview covering server status, database health, and total users.", badge: "Admin" },
      { id: "D2", name: "HR Executive Dashboard", moduleKey: "HR Dashboard", description: "Executive cockpit monitoring headcount, retention rate, and diversity metrics.", badge: "Exec" },
      { id: "D3", name: "TA Recruiter Dashboard", moduleKey: "TA Dashboard", description: "Talent acquisition command center showing lead conversion and recruiter yields.", badge: "TA" },
      { id: "D4", name: "OM Operations Manager Dashboard", moduleKey: "OM Dashboard", description: "Operational cockpit tracking account staffing levels, coverage, and attrition.", badge: "Ops" },
      { id: "D5", name: "Weekly Reports & Hiring Yield", moduleKey: "Weekly Reports", description: "Automated executive summary reports and multi-week hiring ramp analytics.", badge: "Reports" }
    ]
  },
  {
    id: "M6",
    name: "Administration & Organization",
    code: "M6",
    roleAudience: "System Administrators & HR Directors",
    color: "#475569",
    borderColor: "border-slate-400",
    bgLight: "bg-slate-100/60",
    description: "Master governance managing organizational units, multi-campus physical sites, scoring criteria, and audit trails.",
    subModules: [
      { id: "A1", name: "Departments Catalog - 7 Units", moduleKey: "Departments", description: "Operations, HR, Finance, IT, TA, WFM, and Facilities organizational units.", badge: "7 Units" },
      { id: "A2", name: "Office Locations - Tagum, Davao, Mabini", moduleKey: "Office Locations", description: "Multi-campus site registry tracking seat inventory and occupancy percentage.", badge: "3 Sites" },
      { id: "A3", name: "Recruitment Settings & Scoring Criteria", moduleKey: "Recruitment Settings", description: "Scoring matrices, assessment passing benchmarks, and SLA window rules.", badge: "Rules" },
      { id: "A4", name: "Email Communication Logs & Audit Trail", moduleKey: "Email Logs", description: "Complete audit log of transactional candidate emails and interview invites.", badge: "Audit" }
    ]
  }
];

export const SYSTEM_MODULES_SUMMARY: SystemModuleSummary[] = [
  {
    area: "Workforce Hiring",
    primaryScreens: ["Overview", "Plan Ledger", "Plan Drawer", "Action Items"],
    keyActions: [
      "Ramp monitoring across all accounts",
      "Required vs. actual headcount analysis",
      "Cluster filtering & buffer variance calculation",
      "Training cohort progression (NHO, FST, PST, Go-Live)"
    ],
    primaryModuleKey: "Workforce Hiring",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "BarChart2"
  },
  {
    area: "Recruitment Engine",
    primaryScreens: ["Job Descriptions", "Intake", "Available Positions", "Sourcing", "Leads", "Public Portal", "Talent Pool", "Offers", "Onboarding"],
    keyActions: [
      "Multi-stage hiring pipeline & evaluation",
      "Competency scoring & candidate scorecards",
      "Automated offer letter dispatch & signature tracking",
      "Pre-employment document clearance (NBI, SSS, Medical)"
    ],
    primaryModuleKey: "Talent Pool",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "Users"
  },
  {
    area: "Core HR",
    primaryScreens: ["HR/TA/OM Dashboards", "Employee Directory", "Time & Attendance", "Leaves", "Resignations"],
    keyActions: [
      "Real-time attendance & shift line coverage tracking",
      "Biometric clock-in & discrepancy review",
      "Multi-tier leave approval queue & balances",
      "Structured exit interview & 3-department offboarding clearance"
    ],
    primaryModuleKey: "Employee Directory",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "Building2"
  },
  {
    area: "Administration",
    primaryScreens: ["Super Admin", "Departments", "Office Locations (Tagum, Davao, Mabini)", "Recruitment Settings", "Email Logs"],
    keyActions: [
      "Master facility capacity & seat inventory management",
      "Department allocations & division leadership",
      "Automated dispatch verification & audit trail",
      "Assessment passing thresholds & SLA calibration"
    ],
    primaryModuleKey: "Recruitment Settings",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    icon: "Settings"
  }
];
