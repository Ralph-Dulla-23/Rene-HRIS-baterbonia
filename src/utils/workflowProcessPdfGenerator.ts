import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type RGBColor = [number, number, number];

export interface ProcessPageSpec {
  pageNumber: number;
  title: string;
  subtitle: string;
  imageReference: string;
  phaseTag: string;
  slaTarget: string;
  processNodes: Array<{
    type: "action" | "decision" | "dropoff" | "end";
    label: string;
    description: string;
    owner: string;
    branches?: { yes?: string; no?: string };
  }>;
  screenCallouts: Array<{
    number: number;
    title: string;
    screenName: string;
    moduleKey: string;
    description: string;
    validations: string[];
  }>;
}

export const WORKFLOW_PAGES: ProcessPageSpec[] = [
  // PAGE 1
  {
    pageNumber: 1,
    title: "PAGE 1: Entry / Workforce Planning & Position Governance",
    subtitle: "Requisition Intake, Demand Alignment, JD Compensable Factors & Available Positions",
    imageReference: "Process Logic (Image 1)",
    phaseTag: "PHASE 1: PLAN & APPROVE",
    slaTarget: "1 – 2 Days SLA",
    processNodes: [
      {
        type: "action",
        label: "Workforce Demand & Headcount Check",
        description: "Analyze target vs actual headcount, buffer percentage, and quarterly attrition.",
        owner: "WFM Capacity Planner"
      },
      {
        type: "action",
        label: "Stream A: Hiring Needs Intake (PRF)",
        description: "Submit Personnel Requisition Form with budget code, campus, and target start date.",
        owner: "Hiring Manager / OM"
      },
      {
        type: "action",
        label: "Stream B: Job Description (JD) Factor Scoring",
        description: "Evaluate 5 compensable factors and assign salary grade band alignment.",
        owner: "Compensation & Benefits Specialist"
      },
      {
        type: "decision",
        label: "Decisions: PRF & JD Approved?",
        description: "Multi-tier approval check by TA Manager, Operations Director, and Finance.",
        owner: "Approvers Committee",
        branches: { yes: "Proceed to Register Position", no: "Revise Requisition / Budget" }
      },
      {
        type: "end",
        label: "End Gate: Register Available Position",
        description: "Publish active position to Available Positions Registry for sourcing launch.",
        owner: "TA Sourcing Lead"
      }
    ],
    screenCallouts: [
      {
        number: 1,
        title: "Workforce & Hiring Plan (RAMPS)",
        screenName: "Workforce Hiring Plan Matrix",
        moduleKey: "Workforce Hiring",
        description: "Calculates headcount gap, buffer %, net actuals, and budget variance by account/campus.",
        validations: ["Net HC = Actuals - Attrition", "Buffer % = (Net - Target) / Target"]
      },
      {
        number: 2,
        title: "New PRF Multi-Step Intake Modal",
        screenName: "Personnel Requisition Intake",
        moduleKey: "Hiring Needs Intake",
        description: "Captures replacement vs expansion reason, salary range, and cost-center budget code.",
        validations: ["Mandatory Budget Code Format", "Department Head e-Signature"]
      },
      {
        number: 3,
        title: "Job Description & Factor Matrix",
        screenName: "JD & Factor Calculator",
        moduleKey: "Job Description",
        description: "Scores complexity, education, experience, impact, and supervisory scope (100–500 pts).",
        validations: ["Compensable Total Auto-Calculated", "Salary Grade Match Verified"]
      },
      {
        number: 4,
        title: "Requisition Approval Workflow",
        screenName: "Approval Drawer",
        moduleKey: "Hiring Needs Intake",
        description: "Real-time audit log tracking TA, OM, and Finance electronic sign-offs with SLA countdown.",
        validations: ["Sequential Approval Routing", "< 48 Hours Turnaround SLA"]
      },
      {
        number: 5,
        title: "Available Positions Registry",
        screenName: "Open Positions Roster",
        moduleKey: "Available Positions",
        description: "Active open requisition cards linked to approved PRFs and target candidate pipelines.",
        validations: ["100% PRF Verification Badge", "Real-Time Fulfillment Tracker"]
      }
    ]
  },

  // PAGE 2
  {
    pageNumber: 2,
    title: "PAGE 2: Sourcing, Leads & Candidate Application",
    subtitle: "Multi-Channel Sourcing, Automated Email Invitations, Public Self-Portal & Talent Archive",
    imageReference: "Process Logic (Image 2)",
    phaseTag: "PHASE 2 & 3: PREPARE & ATTRACT",
    slaTarget: "1 – 2 Days SLA",
    processNodes: [
      {
        type: "action",
        label: "Log Applicant Lead",
        description: "Capture lead from Walk-in, Job Fair, Employee Referral, Social Ads, or QR Code.",
        owner: "Sourcing Specialist"
      },
      {
        type: "action",
        label: "Email Sent with Referral / Portal Link",
        description: "Dispatch automated email with unique self-application link and QR code token.",
        owner: "System Mailer Service"
      },
      {
        type: "action",
        label: "Candidate Portal (sibsapply...)",
        description: "Candidate submits profile, resume, voice intro audio, and custom questionnaire.",
        owner: "External Applicant"
      },
      {
        type: "action",
        label: "Add to Talent Pool Database",
        description: "Archive candidate in Talent Pool (Silver Pool, Recyclable, or Active Pipeline).",
        owner: "TA Sourcing Lead"
      },
      {
        type: "decision",
        label: "Initial Screening Qualification?",
        description: "Evaluate basic qualifications, location fit, shift willingness, and salary expectation.",
        owner: "Recruiter",
        branches: { yes: "Endorse to Candidate Pipeline", no: "Archive in Silver Pool / Reject" }
      }
    ],
    screenCallouts: [
      {
        number: 1,
        title: "Applicant Leads Hub",
        screenName: "Multi-Channel Sourcing Table",
        moduleKey: "Applicant Leads",
        description: "Centralized leads ledger tagged with 11 channels (Walk-in, Referral, Facebook, JobStreet, QR).",
        validations: ["Duplicate Email/Phone Check", "Channel Source Auto-Tag"]
      },
      {
        number: 2,
        title: "Email Notification Log & Preview",
        screenName: "System Email Audit Log",
        moduleKey: "Email Logs",
        description: "Outbound communication logs with deliverability tracking, timestamp, and template preview.",
        validations: ["Delivery Event Tracking", "Template Variable Substitution"]
      },
      {
        number: 3,
        title: "Public Candidate Application Portal",
        screenName: "sibsapply.getleadsource.com",
        moduleKey: "Public Application Form",
        description: "Responsive 2-step applicant portal featuring voice intro audio recorder and resume parse.",
        validations: ["Max 3Min Audio Self-Intro", "Mandatory Phone Format Check"]
      },
      {
        number: 4,
        title: "Talent Pool Master Archive",
        screenName: "Talent Pool Categorization",
        moduleKey: "Talent Pool",
        description: "Sub-pool classification (Silver Pool, Recyclable, Do Not Reprocess, Active Waves).",
        validations: ["1-Click Wave Endorsement", "Batch CSV Import Support"]
      },
      {
        number: 5,
        title: "Candidate Pipeline Kanban Stage 1",
        screenName: "Kanban Pipeline - Sourced/Leads",
        moduleKey: "Candidate Pipeline",
        description: "Initial pipeline column displaying candidate cards with channel badges and contact status.",
        validations: ["Mandatory PRF Code Mapping", "Stage Entry Timestamp Log"]
      }
    ]
  },

  // PAGE 3
  {
    pageNumber: 3,
    title: "PAGE 3: Candidate Evaluation & Assessment",
    subtitle: "PRF Gating, Online Assessment Scoring, Interview Scheduling & Competency Rubrics",
    imageReference: "Process Logic (Image 3)",
    phaseTag: "PHASE 3: ATTRACT & EVALUATE",
    slaTarget: "5 – 8 Days SLA",
    processNodes: [
      {
        type: "action",
        label: "Initial Screening & PRF Review",
        description: "Verify candidate alignment with open PRF position requirements and campaign parameters.",
        owner: "Recruiter"
      },
      {
        type: "action",
        label: "Assessment Invitation & Scoring",
        description: "Administer typing test, English communication fit, and cognitive assessment.",
        owner: "Assessment Specialist"
      },
      {
        type: "action",
        label: "Schedule Candidate Interview",
        description: "Generate interview schedule, assign interviewer panel, and issue Google Meet invite.",
        owner: "Recruitment Coordinator"
      },
      {
        type: "decision",
        label: "Candidate Response (Accept/Reschedule)?",
        description: "Track candidate interview confirmation or reschedule request within 24 hours.",
        owner: "Candidate / Coordinator",
        branches: { yes: "Proceed to Interview", no: "Log Drop-off Reason / Reschedule" }
      },
      {
        type: "end",
        label: "Final Interview & Competency Scorecard",
        description: "Execute structured interview with competency rubrics and pass/fail decision.",
        owner: "Hiring Manager / Department Head"
      }
    ],
    screenCallouts: [
      {
        number: 1,
        title: "Mandatory PRF Selection Gate Modal",
        screenName: "Headcount Authorization Gate",
        moduleKey: "Candidate Pipeline",
        description: "Enforces active PRF mapping before moving candidate past initial screening column.",
        validations: ["100% PRF Verification Blocker", "Headcount Capacity Warning"]
      },
      {
        number: 2,
        title: "Online Assessment Fit Scoring Sheet",
        screenName: "Assessment Scoring Rubric",
        moduleKey: "Candidate Pipeline",
        description: "Scores typing speed (WPM), accuracy %, Versant score, and cognitive logic percentile.",
        validations: ["Typing WPM ≥ 35 Benchmark", "English Versant Score Auto-Grade"]
      },
      {
        number: 3,
        title: "Interview Scheduler & Google Meet Modal",
        screenName: "Calendar & Meet Scheduler",
        moduleKey: "Candidate Pipeline",
        description: "Interactive scheduling calendar with Google Meet auto-link generation and email dispatch.",
        validations: ["Interviewer Calendar Conflict Check", "Auto Google Meet Link Creation"]
      },
      {
        number: 4,
        title: "Candidate Response & Drop-Off Tracker",
        screenName: "Response Log & Drop-off Analytics",
        moduleKey: "Action Items",
        description: "Logs attendance confirmations, reschedule requests, no-shows, and drop-off reasons.",
        validations: ["Categorized Drop-Off Reason Code", "Automated Follow-up Trigger"]
      },
      {
        number: 5,
        title: "Interview Scorecard & Competency Form",
        screenName: "Structured Interview Rubrics",
        moduleKey: "Candidate Pipeline",
        description: "Weighted evaluation form scoring technical fit, culture fit, communication, and adaptability.",
        validations: ["4-Point Scale Evaluation", "Mandatory Hiring Recommendation"]
      }
    ]
  },

  // PAGE 4
  {
    pageNumber: 4,
    title: "PAGE 4: Offer Preparation, Approval & NHO Batching",
    subtitle: "Itemized Compensation Builder, Multi-Tier Approval, Offer Letter PDF & NHO Scheduling",
    imageReference: "Process Logic (Image 4)",
    phaseTag: "PHASE 4: HIRE & ONBOARD",
    slaTarget: "3 – 5 Days SLA",
    processNodes: [
      {
        type: "action",
        label: "Candidate Offer Details Formulation",
        description: "Structure itemized package (Basic Pay, De Minimis Allowances, Night Diff, Signing Bonus).",
        owner: "TA Manager / Comp & Ben"
      },
      {
        type: "decision",
        label: "Proceed for Approval (Version Control)?",
        description: "Verify compensation stays within authorized Job Description salary grade band.",
        owner: "TA Lead, OM & Finance",
        branches: { yes: "Generate Official Offer Letter", no: "Revise Offer Package / Escalate" }
      },
      {
        type: "action",
        label: "Send Offer PDF & Acceptance Tracking",
        description: "Dispatch e-signature offer letter with acceptance deadline and status tracking.",
        owner: "Recruitment Specialist"
      },
      {
        type: "end",
        label: "Automatic NHO Batch Schedule",
        description: "Assign candidate to upcoming New Hire Orientation (NHO) cohort wave.",
        owner: "Onboarding Coordinator"
      }
    ],
    screenCallouts: [
      {
        number: 1,
        title: "Itemized Compensation Package Builder",
        screenName: "Salary Breakdown Matrix",
        moduleKey: "Offers",
        description: "Calculates Basic Monthly Salary, Non-Taxable Allowances, 10% Night Diff, and Bonus Milestones.",
        validations: ["JD Salary Grade Band Check", "Non-Taxable Allowance Cap Lock"]
      },
      {
        number: 2,
        title: "Multi-Tier Offer Approval Matrix",
        screenName: "Offer Approval Workflow",
        moduleKey: "Offers",
        description: "Sequential sign-off drawer tracking TA Lead, Operations Director, and Finance Director.",
        validations: ["All 3 Approvals Required for Exec Offer", "Version History Lock"]
      },
      {
        number: 3,
        title: "Generated Employment Offer Letter PDF",
        screenName: "Offer Letter Preview & E-Sign",
        moduleKey: "Offers",
        description: "Official branded PDF document preview with itemized salary breakdown and digital signature link.",
        validations: ["E-Sign Compliance Token", "48-Hour Expiration Counter"]
      },
      {
        number: 4,
        title: "NHO Batch Selector & Cohort Scheduler",
        screenName: "NHO Wave Scheduler",
        moduleKey: "Onboarding",
        description: "Assigns accepted candidates to specific campus NHO cohorts (Davao, Tagum, Mabini).",
        validations: ["Max 25 Trainees per Cohort", "Trainer Assignment Verification"]
      }
    ]
  },

  // PAGE 5
  {
    pageNumber: 5,
    title: "PAGE 5: Requirements, Onboarding & End State",
    subtitle: "5 Major Pre-Employment Requirements, Verification Drawer, NHO Roster & Directory Graduation",
    imageReference: "Process Logic (Image 5)",
    phaseTag: "PHASE 4: END STATE & GRADUATION",
    slaTarget: "100% Day-1 Compliance",
    processNodes: [
      {
        type: "action",
        label: "Manage Pre-Employment Requirements",
        description: "Collect and track 5 mandatory statutory documents (TOR, Medical, NBI, PSA, IDs).",
        owner: "Onboarding Officer"
      },
      {
        type: "decision",
        label: "Gate: All 5 Major Complete?",
        description: "Verify complete document submission and Fit-to-Work medical clearance.",
        owner: "Compliance Specialist",
        branches: { yes: "Proceed to NHO Graduation", no: "Issue Compliance Follow-up Alert" }
      },
      {
        type: "action",
        label: "Create / Update Onboarding Record",
        description: "Update cohort roster, start-date countdown, and IT asset allocation checklist.",
        owner: "HR Operations"
      },
      {
        type: "end",
        label: "END: Hired / Active (Graduate to Directory)",
        description: "Execute 1-click system action to graduate candidate into active Employee Directory.",
        owner: "HR Admin"
      }
    ],
    screenCallouts: [
      {
        number: 1,
        title: "5 Major Pre-Employment Requirements Checklist",
        screenName: "Pre-Employment Matrix",
        moduleKey: "Onboarding",
        description: "Tracks TOR/Diploma, Medical Fit-to-Work, NBI Clearance, PSA Birth Cert, and SSS/TIN IDs.",
        validations: ["Fit-to-Work Drug Test Verified", "NBI Clearance Validity Check"]
      },
      {
        number: 2,
        title: "Document Verification Drawer & Upload",
        screenName: "Document Inspection Drawer",
        moduleKey: "Onboarding",
        description: "Inspects uploaded candidate files, confirms authenticity, or triggers rejection notes.",
        validations: ["PDF/JPG Format Support", "Audit Log Image Timestamp"]
      },
      {
        number: 3,
        title: "Onboarding Cohort Roster & Start-Date Tracker",
        screenName: "NHO Cohort Roster",
        moduleKey: "Onboarding",
        description: "Roster matrix showing start-date countdowns, attendance status, and day-1 readiness.",
        validations: ["Day-1 Attendance Punch Log", "Equipment Handoff Check"]
      },
      {
        number: 4,
        title: "1-Click Graduate to Employee Directory Action",
        screenName: "Employee Directory Graduation Trigger",
        moduleKey: "Employee Directory",
        description: "Converts candidate profile into active employee with generated Employee ID (SIB-2026-XXX).",
        validations: ["Automated Employee ID Generator", "Direct Sync to HR Directory"]
      },
      {
        number: 5,
        title: "Supporting Cross-Cutting Modules Bar",
        screenName: "Audit, Email Logs & NPS Survey",
        moduleKey: "HR Admin Dashboard",
        description: "Syncs hiring data to HR Admin Dashboard, Email Audit Logs, Action Items, and NPS Survey.",
        validations: ["Real-Time Metrics Refresh", "100% Audit Traceability"]
      }
    ]
  }
];

/**
 * Generates an executive-grade, 5-page A4 Landscape Process-to-Screen PDF document.
 * Left Pane (45%): Flowchart Process Logic & Decisions
 * Right Pane (55%): Corresponding Frontend UI Wireframes & Callout Annotations
 */
export function generateWorkflowProcessPdf(screenSnapshots?: Record<number, string>) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const navy: RGBColor = [4, 44, 81];
  const orange: RGBColor = [255, 92, 40];
  const darkSlate: RGBColor = [30, 41, 59];
  const mutedSlate: RGBColor = [100, 116, 139];
  const paleBg: RGBColor = [241, 245, 249];
  const lightBlue: RGBColor = [235, 245, 255];
  const borderBlue: RGBColor = [174, 214, 241];
  const greenBg: RGBColor = [232, 248, 240];
  const greenText: RGBColor = [30, 132, 73];

  const setFill = (c: RGBColor) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c: RGBColor) => doc.setTextColor(c[0], c[1], c[2]);
  const setStroke = (c: RGBColor) => doc.setDrawColor(c[0], c[1], c[2]);

  WORKFLOW_PAGES.forEach((pageSpec, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
    }

    // ==================== HEADER BANNER ====================
    setFill(navy);
    doc.rect(0, 0, 297, 20, "F");

    setFill(orange);
    doc.rect(0, 20, 297, 1.5, "F");

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SiBS HRIS PROCESS-TO-SCREEN SYSTEM SPECBOOK", 12, 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 164, 136);
    doc.text(pageSpec.title.toUpperCase(), 12, 15);

    doc.setTextColor(200, 220, 240);
    doc.setFontSize(7.5);
    doc.text(`${pageSpec.phaseTag} • ${pageSpec.slaTarget} • A4 LANDSCAPE DUAL-PANE SPEC`, 190, 15);

    // ==================== DUAL-PANE DIVIDER ====================
    // Left Pane: 12 to 135 (123mm width)
    // Right Pane: 142 to 285 (143mm width)
    const leftX = 12;
    const leftWidth = 123;
    const rightX = 142;
    const rightWidth = 143;
    const topY = 26;

    // Center vertical dividing line
    setStroke([210, 220, 230]);
    doc.setLineWidth(0.5);
    doc.line(138, topY - 2, 138, 198);

    // ==================== LEFT PANE: PROCESS LOGIC ====================
    // Left Header Box
    setFill(navy);
    doc.roundedRect(leftX, topY, leftWidth, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("PROCESS LOGIC & FLOWCHART ENGINE", leftX + 4, topY + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(255, 164, 136);
    doc.text(`Reference: ${pageSpec.imageReference}`, leftX + 4, topY + 9.5);

    // Render Process Nodes
    let currentY = topY + 16;
    pageSpec.processNodes.forEach((node, nIdx) => {
      const nodeHeight = node.type === "decision" ? 28 : 22;

      // Node Box Background
      if (node.type === "decision") {
        setFill([254, 245, 231]); // Amber pale
        setStroke([250, 215, 160]);
      } else if (node.type === "end") {
        setFill(greenBg);
        setStroke([169, 223, 191]);
      } else {
        setFill([247, 249, 252]);
        setStroke([230, 236, 242]);
      }

      doc.roundedRect(leftX, currentY, leftWidth, nodeHeight, 2, 2, "FD");

      // Node Type Badge
      if (node.type === "decision") {
        setFill(orange);
        doc.rect(leftX, currentY, 3, nodeHeight, "F");
      } else if (node.type === "end") {
        setFill(greenText);
        doc.rect(leftX, currentY, 3, nodeHeight, "F");
      } else {
        setFill(navy);
        doc.rect(leftX, currentY, 3, nodeHeight, "F");
      }

      // Step Number & Label
      setText(navy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(`${nIdx + 1}. ${node.label}`, leftX + 6, currentY + 5);

      // Role Owner
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      setText(mutedSlate);
      doc.text(`Owner: ${node.owner}`, leftX + 6, currentY + 9);

      // Description
      doc.setFontSize(7);
      setText(darkSlate);
      const descLines = doc.splitTextToSize(node.description, leftWidth - 12);
      doc.text(descLines, leftX + 6, currentY + 13.5);

      // Decision Branches if applicable
      if (node.type === "decision" && node.branches) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(30, 132, 73);
        doc.text(`[YES] -> ${node.branches.yes}`, leftX + 6, currentY + 22);
        doc.setTextColor(203, 67, 53);
        doc.text(`[NO] -> ${node.branches.no}`, leftX + 6, currentY + 25.5);
      }

      // Connecting Arrow to next node if not last
      if (nIdx < pageSpec.processNodes.length - 1) {
        setStroke(navy);
        doc.setLineWidth(0.4);
        const arrowY1 = currentY + nodeHeight;
        const arrowY2 = arrowY1 + 4;
        doc.line(leftX + leftWidth / 2, arrowY1, leftX + leftWidth / 2, arrowY2);
      }

      currentY += nodeHeight + 4.5;
    });

    // ==================== RIGHT PANE: SCREEN UI ARCHITECTURE & MOCKUP SCREENSHOT ====================
    // Right Header Box
    setFill(navy);
    doc.roundedRect(rightX, topY, rightWidth, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("FRONTEND SCREEN UI MOCKUP & COMPONENT CALLOUTS", rightX + 4, topY + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 164, 136);
    doc.text("Annotated UI Screenshot Frame with Pinned Callout Badges & Validations", rightX + 4, topY + 8);

    // --- BROWSER SCREENSHOT WINDOW FRAME (Mockup) ---
    const mockY = topY + 11;
    const mockHeight = 56;
    setFill([240, 244, 248]);
    setStroke([200, 212, 224]);
    doc.roundedRect(rightX, mockY, rightWidth, mockHeight, 2, 2, "FD");

    // Browser Chrome Header Bar
    setFill([218, 226, 236]);
    doc.roundedRect(rightX, mockY, rightWidth, 6, 2, 2, "F");
    
    // Window dots (Red, Yellow, Green)
    setFill([235, 87, 87]); doc.circle(rightX + 4, mockY + 3, 1, "F");
    setFill([242, 201, 76]); doc.circle(rightX + 7, mockY + 3, 1, "F");
    setFill([39, 174, 96]); doc.circle(rightX + 10, mockY + 3, 1, "F");

    // Address Bar
    setFill([255, 255, 255]);
    doc.roundedRect(rightX + 15, mockY + 1, rightWidth - 30, 4, 1, 1, "F");
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    const mockUrls = [
      "https://hris.sibs.com/workforce-planning/ramps-capacity-matrix",
      "https://hris.sibs.com/sourcing/applicant-leads-hub?channel=all",
      "https://hris.sibs.com/pipeline/candidate-evaluation-assessment",
      "https://hris.sibs.com/offers/compensation-builder-approval",
      "https://hris.sibs.com/onboarding/pre-employment-compliance-matrix"
    ];
    doc.text(mockUrls[pageIndex] || "https://hris.sibs.com/system", rightX + 17, mockY + 3.6);

    // Screen Content Background
    const contentY = mockY + 6;
    const contentH = mockHeight - 6;
    setFill([255, 255, 255]);
    doc.rect(rightX + 0.5, contentY, rightWidth - 1, contentH - 0.5, "F");

    if (screenSnapshots && screenSnapshots[pageIndex]) {
      try {
        doc.addImage(
          screenSnapshots[pageIndex],
          "PNG",
          rightX + 0.5,
          contentY,
          rightWidth - 1,
          contentH - 0.5
        );
      } catch (err) {
        console.warn("Failed to add snapshot image to PDF page", pageIndex, err);
      }
    } else {
      // --- SCREENSHOT PAGE LAYOUT (Matching User's Reference UI) ---
      // 1. View Tag & Top Bar
      setFill([255, 242, 237]); setStroke([255, 208, 193]);
      doc.roundedRect(rightX + 2, contentY + 2, 28, 3.5, 1, 1, "FD");
      setFill([255, 92, 40]); doc.circle(rightX + 4, contentY + 3.75, 0.6, "F");
      doc.setTextColor(255, 92, 40); doc.setFont("helvetica", "bold"); doc.setFontSize(4.2);
      doc.text(pageIndex === 0 ? "RECRUITMENT VIEW" : pageIndex === 1 ? "SOURCING LEADS" : pageIndex === 2 ? "ASSESSMENT FIT" : pageIndex === 3 ? "OFFER MATRIX" : "ONBOARDING GATE", rightX + 5.5, contentY + 4.5);

      // Primary CTA Button
      setFill([255, 92, 40]);
      doc.roundedRect(rightX + rightWidth - 30, contentY + 2, 28, 4, 1, 1, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(4.5); doc.setFont("helvetica", "bold");
      doc.text(pageIndex === 0 ? "+ Add Requisition" : pageIndex === 1 ? "+ Import Leads" : pageIndex === 2 ? "+ New Scorecard" : pageIndex === 3 ? "+ Build Offer" : "+ Verify Document", rightX + rightWidth - 28, contentY + 4.8);

      // Page Title & Subtitle
      doc.setTextColor(4, 44, 81); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
      doc.text(
        pageIndex === 0 ? "Personnel Requisition Form (PRF) & Capacity Matrix" :
        pageIndex === 1 ? "Applicant Leads Hub & Multi-Channel Sourcing" :
        pageIndex === 2 ? "Candidate Evaluation, Assessment & Versant Fit" :
        pageIndex === 3 ? "Itemized Compensation Builder & Approval Matrix" :
        "Pre-Employment Statutory Compliance Checklist",
        rightX + 2, contentY + 9.5
      );

      doc.setTextColor(100, 116, 139); doc.setFontSize(4.2); doc.setFont("helvetica", "normal");
      doc.text(
        pageIndex === 0 ? "Manage headcount capacity, buffer gaps, and PRF intake approvals." :
        pageIndex === 1 ? "Track applicant leads across Walk-In, Social Media, Referrals, and Portals." :
        pageIndex === 2 ? "Evaluate candidate typing speed, Versant English score, and scorecard grades." :
        pageIndex === 3 ? "Build compensation packages within salary bands and route for sign-off." :
        "Verify 5 mandatory Philippine statutory pre-employment documents prior to directory entry.",
        rightX + 2, contentY + 12.5
      );

      // 2. 4 Stat KPI Cards Grid
      const statW = (rightWidth - 10) / 4;
      const statY = contentY + 14.5;

      // Card 1: Total
      setFill([248, 250, 252]); setStroke([226, 232, 240]);
      doc.roundedRect(rightX + 2, statY, statW, 8, 1, 1, "FD");
      doc.setTextColor(100, 116, 139); doc.setFontSize(3.8); doc.setFont("helvetica", "bold");
      doc.text("TOTAL RECORDS", rightX + 3.5, statY + 2.5);
      doc.setTextColor(4, 44, 81); doc.setFontSize(6);
      doc.text(pageIndex === 0 ? "14 PRFs" : pageIndex === 1 ? "1,240 Leads" : pageIndex === 2 ? "186 Candidates" : pageIndex === 3 ? "42 Offers" : "38 Cohort", rightX + 3.5, statY + 5.5);

      // Card 2: Approved / Qualified
      setFill([232, 248, 240]); setStroke([169, 223, 191]);
      doc.roundedRect(rightX + 2 + statW + 2, statY, statW, 8, 1, 1, "FD");
      doc.setTextColor(30, 132, 73); doc.setFontSize(3.8); doc.setFont("helvetica", "bold");
      doc.text("APPROVED / QUALIFIED", rightX + 3.5 + statW + 2, statY + 2.5);
      doc.setTextColor(30, 132, 73); doc.setFontSize(6);
      doc.text(pageIndex === 0 ? "12 Approved" : pageIndex === 1 ? "840 Screened" : pageIndex === 2 ? "142 Passed" : pageIndex === 3 ? "36 Accepted" : "32 Graduated", rightX + 3.5 + statW + 2, statY + 5.5);

      // Card 3: Pending / Gap
      setFill([254, 245, 231]); setStroke([250, 215, 160]);
      doc.roundedRect(rightX + 2 + (statW + 2) * 2, statY, statW, 8, 1, 1, "FD");
      doc.setTextColor(230, 126, 34); doc.setFontSize(3.8); doc.setFont("helvetica", "bold");
      doc.text("PENDING / REVISION", rightX + 3.5 + (statW + 2) * 2, statY + 2.5);
      doc.setTextColor(230, 126, 34); doc.setFontSize(6);
      doc.text(pageIndex === 0 ? "38 Gap Seats" : pageIndex === 1 ? "120 Pending" : pageIndex === 2 ? "28 Scheduled" : pageIndex === 3 ? "4 In Review" : "6 Pending Docs", rightX + 3.5 + (statW + 2) * 2, statY + 5.5);

      // Card 4: System Metric
      setFill([235, 245, 255]); setStroke([174, 214, 241]);
      doc.roundedRect(rightX + 2 + (statW + 2) * 3, statY, statW, 8, 1, 1, "FD");
      doc.setTextColor(33, 97, 140); doc.setFontSize(3.8); doc.setFont("helvetica", "bold");
      doc.text("METRIC RATE", rightX + 3.5 + (statW + 2) * 3, statY + 2.5);
      doc.setTextColor(33, 97, 140); doc.setFontSize(6);
      doc.text(pageIndex === 0 ? "91.5% Capacity" : pageIndex === 1 ? "68% Portal Conv" : pageIndex === 2 ? "3.8 / 4.0 Avg" : pageIndex === 3 ? "100% Band Pass" : "Batch 2026-09", rightX + 3.5 + (statW + 2) * 3, statY + 5.5);

      // 3. Search & Filter Bar
      const filterY = statY + 9.5;
      setFill([248, 250, 252]); setStroke([203, 213, 225]);
      doc.roundedRect(rightX + 2, filterY, rightWidth - 36, 4.5, 1, 1, "FD");
      doc.setTextColor(100, 116, 139); doc.setFontSize(4); doc.setFont("helvetica", "bold");
      doc.text("Q  Search title, document code, applicant name, account, or supervisory level...", rightX + 4, filterY + 3);

      // Dropdown pill
      setFill([255, 255, 255]); setStroke([203, 213, 225]);
      doc.roundedRect(rightX + rightWidth - 32, filterY, 18, 4.5, 1, 1, "FD");
      doc.setTextColor(51, 65, 85); doc.setFontSize(4);
      doc.text("All Accounts v", rightX + rightWidth - 30, filterY + 3);

      doc.roundedRect(rightX + rightWidth - 12, filterY, 10, 4.5, 1, 1, "FD");
      doc.setTextColor(100, 116, 139);
      doc.text("Clear", rightX + rightWidth - 10, filterY + 3);

      // 4. Filter Tabs Row
      const tabY = filterY + 6;
      doc.setFontSize(4.2); doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 92, 40); doc.text("ALL RECORDS (14)", rightX + 2, tabY);
      doc.setTextColor(100, 116, 139); doc.text("ACTIVE / APPROVED (10)", rightX + 28, tabY);
      doc.text("FOR REVISION (2)", rightX + 62, tabY);
      doc.text("NEW INTAKE (2)", rightX + 90, tabY);
      doc.text("ARCHIVED (1)", rightX + 114, tabY);

      setStroke([255, 92, 40]); doc.line(rightX + 2, tabY + 1, rightX + 24, tabY + 1);
      setStroke([226, 232, 240]); doc.line(rightX + 24, tabY + 1, rightX + rightWidth - 2, tabY + 1);

      // 5. Data Records Table
      const tableY = tabY + 3;
      setFill([245, 247, 250]); doc.rect(rightX + 2, tableY, rightWidth - 4, 3.5, "F");
      doc.setTextColor(100, 116, 139); doc.setFontSize(3.8); doc.setFont("helvetica", "bold");
      doc.text("ROLE & DOCUMENT TITLE", rightX + 4, tableY + 2.4);
      doc.text("DEPARTMENT / ACCOUNT", rightX + 54, tableY + 2.4);
      doc.text("STATUS & LEVEL", rightX + 92, tableY + 2.4);
      doc.text("DATE & VERSION", rightX + 120, tableY + 2.4);

      // Table Row 1
      setFill([255, 255, 255]); doc.rect(rightX + 2, tableY + 3.5, rightWidth - 4, 4.5, "F");
      doc.setTextColor(4, 44, 81); doc.setFontSize(4.2); doc.setFont("helvetica", "bold");
      doc.text(pageIndex === 0 ? "[PDF] PRF_Healthcare_Support_v2.1.pdf" : pageIndex === 1 ? "[LEAD] Cruz, Maria Santos (Facebook)" : pageIndex === 2 ? "[SCORECARD] Candidate_102 (Passed)" : pageIndex === 3 ? "[OFFER] Offer_Package_Candidate_102.pdf" : "[COMPLIANCE] Compliance_Matrix_SIB-882.pdf", rightX + 4, tableY + 6.8);
      doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
      doc.text(pageIndex === 0 ? "Healthcare Ops (Verizon)" : pageIndex === 1 ? "Customer Care (Davao)" : pageIndex === 2 ? "WPM: 52 | Versant: 84" : pageIndex === 3 ? "Band 4 (P32,650 Total)" : "5/5 Statutory Docs Verified", rightX + 54, tableY + 6.8);

      // Status Pill Badge Row 1
      setFill([232, 248, 240]); doc.roundedRect(rightX + 92, tableY + 4.5, 20, 3, 1, 1, "F");
      doc.setTextColor(30, 132, 73); doc.setFontSize(3.5); doc.setFont("helvetica", "bold");
      doc.text("✔ APPROVED", rightX + 94, tableY + 6.6);

      doc.setTextColor(100, 116, 139); doc.setFontSize(3.8); doc.setFont("helvetica", "normal");
      doc.text("v2.1 (2026-06-12)", rightX + 120, tableY + 6.8);

      // Table Row 2
      setFill([248, 250, 252]); doc.rect(rightX + 2, tableY + 8, rightWidth - 4, 4.5, "F");
      doc.setTextColor(4, 44, 81); doc.setFontSize(4.2); doc.setFont("helvetica", "bold");
      doc.text(pageIndex === 0 ? "[PDF] PRF_Tech_Support_Lead_v1.0.pdf" : pageIndex === 1 ? "[LEAD] Reyes, Juan Carlos (Walk-In)" : pageIndex === 2 ? "[SCORECARD] Candidate_103 (Silver Pool)" : pageIndex === 3 ? "[OFFER] Offer_Package_Candidate_105.pdf" : "[COMPLIANCE] Compliance_Matrix_SIB-883.pdf", rightX + 4, tableY + 11.3);
      doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
      doc.text(pageIndex === 0 ? "Operations (Comcast Support)" : pageIndex === 1 ? "Technical Support Team" : pageIndex === 2 ? "WPM: 41 | Versant: 71" : pageIndex === 3 ? "Band 5 (P38,000 Total)" : "4/5 Docs (NBI Pending)", rightX + 54, tableY + 11.3);

      // Status Pill Badge Row 2
      setFill([254, 245, 231]); doc.roundedRect(rightX + 92, tableY + 9, 20, 3, 1, 1, "F");
      doc.setTextColor(230, 126, 34); doc.setFontSize(3.5); doc.setFont("helvetica", "bold");
      doc.text("⚠ FOR REVISION", rightX + 93.5, tableY + 11.1);

      doc.setTextColor(100, 116, 139); doc.setFontSize(3.8); doc.setFont("helvetica", "normal");
      doc.text("v1.0 (2026-07-02)", rightX + 120, tableY + 11.3);
    }
    // Render Screen Callouts Items below Screenshot
    let screenY = mockY + mockHeight + 3;
    pageSpec.screenCallouts.forEach((callout) => {
      const calloutHeight = 22;

      // Card Container
      setFill([255, 255, 255]);
      setStroke([230, 236, 242]);
      doc.roundedRect(rightX, screenY, rightWidth, calloutHeight, 2, 2, "FD");

      // Top Accent Line
      setFill(orange);
      doc.rect(rightX, screenY, rightWidth, 1, "F");

      // Number Callout Badge (Circle)
      setFill(navy);
      doc.circle(rightX + 5, screenY + 5.5, 3.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(`${callout.number}`, rightX + 4, screenY + 7.8);

      // Title & Screen Name
      setText(navy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(callout.title, rightX + 11, screenY + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      setText(mutedSlate);
      doc.text(`Screen: ${callout.screenName}`, rightX + 11, screenY + 9);

      // Description
      doc.setFontSize(6.5);
      setText(darkSlate);
      const cLines = doc.splitTextToSize(callout.description, rightWidth - 14);
      doc.text(cLines, rightX + 11, screenY + 12.5);

      // Validations Chips Box
      let valX = rightX + 11;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(33, 97, 140);

      callout.validations.forEach((val) => {
        const textWidth = doc.getTextWidth(`• ${val}`);
        setFill(lightBlue);
        setStroke(borderBlue);
        doc.roundedRect(valX, screenY + 16, textWidth + 3, 4.5, 1, 1, "FD");
        doc.text(`• ${val}`, valX + 1.5, screenY + 19.2);
        valX += textWidth + 5;
      });

      screenY += calloutHeight + 2;
    });

    // ==================== FOOTER ====================
    setFill(paleBg);
    doc.rect(0, 202, 297, 8, "F");

    setText(mutedSlate);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("SiBS HRIS Solutions Inc. • Dual-Pane Process-to-Screen Architecture Specbook • Confidential", 12, 206.5);
    doc.text(`Page ${pageIndex + 1} of ${WORKFLOW_PAGES.length}`, 268, 206.5);
  });

  // Save PDF file
  doc.save(`SiBS_HRIS_Process_To_Screen_Specbook_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generates a full-bleed, 5-page A4 Landscape PDF where each page displays the
 * FULL HIGH-DEFINITION PROTOTYPE SCREEN UI taking up the entire canvas (285mm x 164mm),
 * accompanied by top process header metadata, SLA badges, and validation rules.
 */
export function generateFullPrototypePdf(screenSnapshots?: Record<number, string>) {
  const doc = new jsPDF({
    orientation: "landscape",
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
  const setStroke = (c: RGBColor) => doc.setDrawColor(c[0], c[1], c[2]);

  const urls = [
    "https://hris.sibs.com/workforce-planning/ramps-capacity-matrix",
    "https://hris.sibs.com/sourcing/applicant-leads-hub?channel=all",
    "https://hris.sibs.com/pipeline/candidate-evaluation-assessment",
    "https://hris.sibs.com/offers/compensation-builder-approval",
    "https://hris.sibs.com/onboarding/pre-employment-compliance-matrix"
  ];

  WORKFLOW_PAGES.forEach((pageSpec, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
    }

    // ==================== 1. TOP HEADER BANNER (16mm) ====================
    setFill(navy);
    doc.rect(0, 0, 297, 16, "F");

    setFill(orange);
    doc.rect(0, 16, 297, 1.2, "F");

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("SiBS HRIS FULL PROTOTYPE SCREEN SPECBOOK", 10, 7.5);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 164, 136);
    doc.text(`PAGE ${pageIndex + 1} OF 5: ${pageSpec.title.toUpperCase()}`, 10, 12.5);

    // Right Header Tag
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${pageSpec.phaseTag} • SLA: ${pageSpec.slaTarget}`, 287, 10, { align: "right" });

    // ==================== 2. SUB-HEADER METADATA STRIP (y=18 to y=27) ====================
    setFill([241, 245, 249]);
    setStroke([203, 213, 225]);
    doc.roundedRect(6, 18.5, 285, 9, 1, 1, "FD");

    // Process Subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(4, 44, 81);
    doc.text(`Process Scope: ${pageSpec.subtitle}`, 9, 22.5);

    // Enforced Validations Summary Badges
    const validations = pageSpec.screenCallouts.flatMap(c => c.validations).slice(0, 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Enforced Rules:", 170, 22.5);

    let valX = 188;
    validations.forEach((val) => {
      const w = doc.getTextWidth(`✔ ${val}`);
      if (valX + w < 288) {
        setFill([235, 245, 255]);
        setStroke([174, 214, 241]);
        doc.roundedRect(valX, 19.8, w + 3, 4, 1, 1, "FD");
        doc.setTextColor(33, 97, 140);
        doc.text(`✔ ${val}`, valX + 1.5, 22.7);
        valX += w + 5;
      }
    });

    // ==================== 3. BROWSER FRAME & PROTOTYPE CANVAS (y=28.5 to y=200) ====================
    const canvasY = 28.5;
    const canvasH = 172.5;
    const canvasW = 285;
    const canvasX = 6;

    // Outer Frame Background & Border
    setFill([255, 255, 255]);
    setStroke([180, 195, 210]);
    doc.roundedRect(canvasX, canvasY, canvasW, canvasH, 1.5, 1.5, "FD");

    // Browser Window Header Bar (height = 5.5mm)
    setFill(navy);
    doc.rect(canvasX + 0.3, canvasY + 0.3, canvasW - 0.6, 5.5, "F");

    // Red Yellow Green Window Controls
    setFill([255, 95, 86]); doc.circle(canvasX + 3, canvasY + 3, 0.8, "F");
    setFill([255, 189, 46]); doc.circle(canvasX + 5.2, canvasY + 3, 0.8, "F");
    setFill([39, 201, 63]); doc.circle(canvasX + 7.4, canvasY + 3, 0.8, "F");

    // Address Bar Box
    setFill([11, 54, 95]);
    setStroke([19, 64, 109]);
    doc.roundedRect(canvasX + 12, canvasY + 1.2, 170, 3.2, 0.8, 0.8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(143, 174, 201);
    doc.text(urls[pageIndex] || urls[0], canvasX + 14, canvasY + 3.4);

    // Live Prototype Badge
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 204, 113);
    doc.text("● LIVE INTERACTIVE PROTOTYPE SCREEN CAPTURE", canvasX + canvasW - 4, canvasY + 3.4, { align: "right" });

    // --- MAIN SCREENSHOT IMAGE AREA (y=34.5mm to y=200mm) ---
    const imgY = canvasY + 6;
    const imgH = canvasH - 6.5;

    if (screenSnapshots && screenSnapshots[pageIndex]) {
      try {
        doc.addImage(
          screenSnapshots[pageIndex],
          "PNG",
          canvasX + 0.5,
          imgY,
          canvasW - 1,
          imgH,
          undefined,
          "FAST"
        );
      } catch (err) {
        console.warn("Failed to render full prototype screenshot in PDF page", pageIndex, err);
      }
    } else {
      // Vector fallback if snapshot is missing
      setFill([247, 249, 252]);
      doc.rect(canvasX + 0.5, imgY, canvasW - 1, imgH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(4, 44, 81);
      doc.text(`PROTOTYPE UI SCREEN: ${pageSpec.title}`, canvasX + 10, imgY + 15);
    }

    // ==================== 4. FOOTER (y=202mm to 210mm) ====================
    setFill(paleBg);
    doc.rect(0, 202, 297, 8, "F");

    setText(mutedSlate);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("SiBS HRIS Solutions Inc. • Interactive Recruitment Lifecycle Prototype Specbook • Confidential", 10, 206.5);
    doc.text(`Page ${pageIndex + 1} of 5`, 287, 206.5, { align: "right" });
  });

  // Save PDF file
  doc.save(`SiBS_HRIS_Full_Prototype_Specbook_${new Date().toISOString().slice(0, 10)}.pdf`);
}
