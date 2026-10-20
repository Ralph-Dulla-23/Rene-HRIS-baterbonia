import { NHOApplicant, NHODocumentItem, NHOQuizQuestion } from "./nhoTypes";

export const NHO_QUIZ_QUESTIONS: NHOQuizQuestion[] = [
  {
    id: 1,
    question: "What is the primary standard for client data protection and workstation security at SiBS?",
    options: [
      "Employees may write passwords on sticky notes as long as they are kept inside their drawer.",
      "Workstations must adhere strictly to the Clean Desk and Clean Screen Policy with no unauthorized mobile devices in production areas.",
      "Employees can share credentials during emergency peak shifts if approved verbally by a peer.",
      "Screens may be left unlocked if stepping away for under three minutes."
    ],
    correctOptionIndex: 1,
    explanation: "At SiBS, information security is paramount. The Clean Desk and Clean Screen Policy prohibits unattended unlocked screens and unauthorized personal recording devices in production."
  },
  {
    id: 2,
    question: "When an employee experiences an unplanned absence or medical emergency, how should notice be provided?",
    options: [
      "Post a message on public social media channels.",
      "Notify their Team Leader and HR at least two hours prior to shift commencement through official SiBS communication channels.",
      "Wait until the following working week to submit an explanation letter.",
      "Ask a family member to call only after three consecutive missed shifts."
    ],
    correctOptionIndex: 1,
    explanation: "Timely communication ensures operational coverage. Notice must be sent at least 2 hours before the scheduled shift via official SiBS escalation channels."
  },
  {
    id: 3,
    question: "What is the timeline for completing pending non-major pre-employment requirements following physical NHO clearance?",
    options: [
      "Any time within the first six months of employment.",
      "Exactly 14 calendar days from the successfully completed physical NHO clearance date.",
      "30 working days from the first payroll cutoff.",
      "No deadline is imposed as long as attendance was marked Show."
    ],
    correctOptionIndex: 1,
    explanation: "The standard SiBS HRIS non-major deadline is exactly 14 calendar days from the successful physical NHO date, including weekends and holidays."
  },
  {
    id: 4,
    question: "Under the SiBS Non-Disclosure Agreement (NDA), what information is considered confidential?",
    options: [
      "Only financial records of SiBS executive management.",
      "All proprietary client records, trade secrets, system designs, employee compensation details, and internal SOPs.",
      "Only software source code stored in production Git repositories.",
      "Public marketing materials posted on the company website."
    ],
    correctOptionIndex: 1,
    explanation: "Confidential information includes all client records, proprietary procedures, employee compensation, and technical configurations."
  },
  {
    id: 5,
    question: "What is the correct procedure if an employee observes a workplace safety or harassment concern?",
    options: [
      "Ignore it unless it directly impacts your personal daily metrics.",
      "Report immediately to HR Admin, an authorized People Partner, or through the confidential Ethics Hotline.",
      "Discuss it with teammates on external messaging apps before reporting.",
      "Wait for the annual company performance review."
    ],
    correctOptionIndex: 1,
    explanation: "SiBS enforces a zero-tolerance policy against harassment and safety violations. Prompt reporting to HR Admin or the Ethics Hotline ensures immediate investigation and protection."
  }
];

export const INITIAL_NHO_TEMPLATES_LIST: Omit<NHODocumentItem, "id" | "status" | "deadlineStatus" | "dueDate">[] = [
  // 4 Majors
  {
    name: "Medical Records (Fit to Work)",
    category: "Major",
    isMajor: true,
    isEssentialAgreement: false,
    description: "Physical medical clearance & Fit to Work certificate issued by accredited clinic.",
    templateCode: "MAJOR-MED-01"
  },
  {
    name: "NBI Clearance (Original / Valid)",
    category: "Major",
    isMajor: true,
    isEssentialAgreement: false,
    description: "Current NBI Clearance verifying no derogatory legal record.",
    templateCode: "MAJOR-NBI-02"
  },
  {
    name: "PSA Birth Certificate",
    category: "Major",
    isMajor: true,
    isEssentialAgreement: false,
    description: "Philippine Statistics Authority (PSA) issued Birth Certificate copy.",
    templateCode: "MAJOR-PSA-03"
  },
  {
    name: "Valid Government ID",
    category: "Major",
    isMajor: true,
    isEssentialAgreement: false,
    description: "Primary government ID (Passport, UMID, Driver's License, or National ID).",
    templateCode: "MAJOR-ID-04"
  },

  // 3 Essential Agreements
  {
    name: "Acceptance to Company Policy",
    category: "Essential Agreement",
    isMajor: false,
    isEssentialAgreement: true,
    description: "Acknowledgment and formal acceptance of SiBS Code of Conduct & Company Rules.",
    templateCode: "AGR-POL-01"
  },
  {
    name: "Memo 01.2022 and Training Bond (NHO)",
    category: "Essential Agreement",
    isMajor: false,
    isEssentialAgreement: true,
    description: "Training commitment, onboarding terms, and service obligation agreement.",
    templateCode: "AGR-BOND-02"
  },
  {
    name: "New NDA (Non-Disclosure Agreement)",
    category: "Essential Agreement",
    isMajor: false,
    isEssentialAgreement: true,
    description: "Proprietary information protection and confidentiality covenant.",
    templateCode: "AGR-NDA-03"
  },

  // 11 NHO PDF Templates (Remaining non-essential)
  {
    name: "BIR Form 1902",
    category: "NHO Template",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Application for Registration for Individuals Earning Purely Compensation Income.",
    templateCode: "NHO-BIR-1902"
  },
  {
    name: "BIR S1905 Registration Update Sheet",
    category: "NHO Template",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Application for Registration Information Update with the Bureau of Internal Revenue.",
    templateCode: "NHO-BIR-1905"
  },
  {
    name: "BIR-RDO 112 Authorization Letter",
    category: "NHO Template",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Authorization letter allowing SiBS HR to represent employee for tax registration.",
    templateCode: "NHO-BIR-AUTH"
  },
  {
    name: "Pre-Employment Requirements Checklist",
    category: "NHO Template",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Standard master checklist of all mandatory and non-major pre-employment items.",
    templateCode: "NHO-CHECKLIST"
  },
  {
    name: "ID Form Updated v6 (August 2026)",
    category: "NHO Template",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Official biometric ID application form for building access & RFID badges.",
    templateCode: "NHO-ID-FORM"
  },
  {
    name: "PHIC Authorization Letter",
    category: "NHO Template",
    isMajor: false,
    isEssentialAgreement: false,
    description: "PhilHealth authorization form for membership verification and employer update.",
    templateCode: "NHO-PHIC-AUTH"
  },
  {
    name: "PMRF V.2020",
    category: "NHO Template",
    isMajor: false,
    isEssentialAgreement: false,
    description: "PhilHealth Member Registration Form updated version 2020.",
    templateCode: "NHO-PMRF-2020"
  },
  {
    name: "Waiver for Requirements",
    category: "NHO Template",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Affidavit of undertaking for acceptable delayed statutory documentation.",
    templateCode: "NHO-WAIVER"
  },

  // Non-Major Pre-Employment
  {
    name: "TOR / College Diploma",
    category: "Pre-Employment",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Official Transcript of Records or Certified True Copy of College Diploma.",
    templateCode: "PRE-TOR-01"
  },
  {
    name: "2x2 ID Picture (White Background)",
    category: "Pre-Employment",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Recent formal 2x2 photograph with plain white background.",
    templateCode: "PRE-PIC-02"
  },
  {
    name: "SSS E-1 / UMID Documentation",
    category: "Pre-Employment",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Social Security System membership verification or static information printout.",
    templateCode: "PRE-SSS-03"
  },
  {
    name: "Pag-IBIG MDF (Member Data Form)",
    category: "Pre-Employment",
    isMajor: false,
    isEssentialAgreement: false,
    description: "Home Development Mutual Fund (HDMF) registration form with Pag-IBIG MID number.",
    templateCode: "PRE-PAGIBIG-04"
  }
];

export const INITIAL_NHO_APPLICANTS: NHOApplicant[] = [
  // 1. Ready for IT Endorsement
  {
    id: "nho-app-01",
    applicantNumber: "APP-2026-0841",
    fullName: "Juan Carlos Dela Cruz",
    firstName: "Juan Carlos",
    lastName: "Dela Cruz",
    email: "juan.delacruz@sampleapplicant.ph",
    phone: "+63 917 555 1201",
    position: "Customer Service Specialist",
    department: "Operations",
    account: "Fintech Core Banking",
    cluster: "Cluster 1",
    reportingLocation: "SiBS Tower 1, BGC, Taguig City",
    scheduledNhoDate: "2026-10-09",
    invitationSentDate: "2026-10-01", // 8 days notice (> 7 days)
    scheduleAccepted: true,
    attendance: "Show",
    attendanceMarkedAt: "2026-10-09 08:45 AM",
    physicalClearance: "Cleared",
    clearedDate: "2026-10-09",
    nonMajorDeadlineDate: "2026-10-23", // exactly 14 calendar days
    rescheduledCount: 0,
    followUpLogs: [],
    tempAccessStatus: "Active",
    tempPasswordGenerated: true,
    tempPasswordHash: "SiBS$Demo#Temp2026!",
    hasChangedPassword: true,
    orientationStatus: "Completed",
    orientationCurrentSlide: 7,
    orientationSlidesViewed: [1, 2, 3, 4, 5, 6, 7],
    orientationQuizAnswers: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1 },
    orientationAcknowledged: true,
    orientationCompletedAt: "2026-10-09 11:20 AM",
    itEndorsed: false,
    itRequestStatus: "Pending",
    proposedKronosUsername: "jdelacruz",
    kronosDisplayName: "Dela Cruz, Juan Carlos",
    assignedDepartment: "Operations - Fintech",
    itProvisioningRemarks: "Standard call floor profile, Shift Group A",
    trainerStatus: "Not Ready",
    assignedTrainerId: "TRN-001",
    assignedTrainerName: "Maria Elena Garcia (Senior Trainer)",
    qdsStatus: "Not Ready",
    qdsMaterials: [],
    wfmStatus: "Not Ready",
    handoffStatus: "Not Ready",
    outcome: "In Progress",
    documents: [
      {
        id: "doc-101",
        name: "Medical Records (Fit to Work)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan (TA Lead)",
        submissionMethod: "Physical Copy",
        fileName: "Medical_Clearance_FitToWork_DelaCruz.pdf",
        templateCode: "MAJOR-MED-01"
      },
      {
        id: "doc-102",
        name: "NBI Clearance (Original / Valid)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan (TA Lead)",
        submissionMethod: "Physical Copy",
        fileName: "NBI_Clearance_2026_DelaCruz.pdf",
        templateCode: "MAJOR-NBI-02"
      },
      {
        id: "doc-103",
        name: "PSA Birth Certificate",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan (TA Lead)",
        submissionMethod: "Physical Copy",
        fileName: "PSA_BirthCertificate_DelaCruz.pdf",
        templateCode: "MAJOR-PSA-03"
      },
      {
        id: "doc-104",
        name: "Valid Government ID",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan (TA Lead)",
        submissionMethod: "Physical Copy",
        fileName: "Passport_GovID_DelaCruz.pdf",
        templateCode: "MAJOR-ID-04"
      },
      // 3 Essential Agreements (All Verified!)
      {
        id: "doc-105",
        name: "Acceptance to Company Policy",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan (TA Lead)",
        submissionMethod: "Electronic Signature",
        fileName: "Signed_CompanyPolicy_DelaCruz.pdf",
        templateCode: "AGR-POL-01"
      },
      {
        id: "doc-106",
        name: "Memo 01.2022 and Training Bond (NHO)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan (TA Lead)",
        submissionMethod: "Electronic Signature",
        fileName: "Signed_TrainingBond_DelaCruz.pdf",
        templateCode: "AGR-BOND-02"
      },
      {
        id: "doc-107",
        name: "New NDA (Non-Disclosure Agreement)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan (TA Lead)",
        submissionMethod: "Manual Upload",
        fileName: "Signed_NDA_DelaCruz_Scanned.pdf",
        templateCode: "AGR-NDA-03"
      },
      // Non-major items (TOR is pending to demonstrate non-majors do not block IT endorsement!)
      {
        id: "doc-108",
        name: "TOR / College Diploma",
        category: "Pre-Employment",
        isMajor: false,
        isEssentialAgreement: false,
        status: "Not Submitted",
        deadlineStatus: "Due Soon",
        dueDate: "2026-10-23",
        description: "Official Transcript of Records or Certified True Copy of College Diploma.",
        templateCode: "PRE-TOR-01"
      },
      {
        id: "doc-109",
        name: "2x2 ID Picture (White Background)",
        category: "Pre-Employment",
        isMajor: false,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-23",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        fileName: "ID_Picture_DelaCruz.jpg",
        templateCode: "PRE-PIC-02"
      },
      {
        id: "doc-110",
        name: "BIR Form 1902",
        category: "NHO Template",
        isMajor: false,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-23",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        fileName: "BIR1902_DelaCruz.pdf",
        templateCode: "NHO-BIR-1902"
      },
      {
        id: "doc-111",
        name: "ID Form Updated v6 (August 2026)",
        category: "NHO Template",
        isMajor: false,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-23",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        fileName: "ID_Form_v6_DelaCruz.pdf",
        templateCode: "NHO-ID-FORM"
      }
    ],
    auditLogs: [
      {
        id: "log-1",
        timestamp: "2026-10-01 10:15 AM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "NHO Scheduled & Invitation Dispatched",
        details: "Scheduled for Oct 09, 2026 (8 calendar days notice). 4 major requirements instructions sent."
      },
      {
        id: "log-2",
        timestamp: "2026-10-09 08:45 AM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "Attendance Marked: Show",
        details: "Applicant presented on time at SiBS Tower 1 training center."
      },
      {
        id: "log-3",
        timestamp: "2026-10-09 09:30 AM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "Physical NHO Clearance: Cleared",
        details: "All 4 major requirements physically inspected and verified. Non-major deadline established: Oct 23, 2026."
      },
      {
        id: "log-4",
        timestamp: "2026-10-09 09:31 AM",
        actor: "SiBS HRIS Automated Service",
        role: "System",
        action: "Temporary Portal Access Issued",
        details: "One-time password retrieval link generated with 24-hour expiration."
      },
      {
        id: "log-5",
        timestamp: "2026-10-09 11:20 AM",
        actor: "Juan Carlos Dela Cruz",
        role: "Applicant",
        action: "Orientation & Knowledge Check Completed",
        details: "All 7 presentation slides reviewed, 5 knowledge check questions answered, and final policy acknowledgment signed."
      },
      {
        id: "log-6",
        timestamp: "2026-10-09 01:15 PM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "All 3 Essential Agreements Verified",
        details: "Company Policy, Training Bond, and NDA checked. Ready for IT Endorsement."
      }
    ]
  },

  // 2. Missing Major Requirement
  {
    id: "nho-app-02",
    applicantNumber: "APP-2026-0842",
    fullName: "Maria Clarisse Santos",
    firstName: "Maria Clarisse",
    lastName: "Santos",
    email: "maria.santos@sampleapplicant.ph",
    phone: "+63 928 555 3344",
    position: "Technical Support Associate",
    department: "Operations",
    account: "Enterprise Cloud IT",
    cluster: "Cluster 2",
    reportingLocation: "SiBS Tower 2, Cebu IT Park",
    scheduledNhoDate: "2026-10-09",
    invitationSentDate: "2026-10-01",
    scheduleAccepted: true,
    attendance: "Show",
    attendanceMarkedAt: "2026-10-09 09:05 AM",
    physicalClearance: "Cleared",
    clearedDate: "2026-10-09",
    nonMajorDeadlineDate: "2026-10-23",
    rescheduledCount: 0,
    followUpLogs: [],
    tempAccessStatus: "Active",
    tempPasswordGenerated: true,
    passwordRetrievalToken: "TOKEN-M7X289",
    retrievalLinkExpiresAt: "2026-10-10 09:00 AM",
    retrievalLinkUsed: true,
    hasChangedPassword: true,
    orientationStatus: "In Progress",
    orientationCurrentSlide: 3,
    orientationSlidesViewed: [1, 2, 3],
    orientationQuizAnswers: {},
    orientationAcknowledged: false,
    itEndorsed: false,
    itRequestStatus: "Pending",
    proposedKronosUsername: "msantos",
    kronosDisplayName: "Santos, Maria Clarisse",
    assignedDepartment: "Technical Support",
    trainerStatus: "Not Ready",
    assignedTrainerId: "TRN-002",
    assignedTrainerName: "Carlos Mendoza (L&D Specialist)",
    qdsStatus: "Not Ready",
    qdsMaterials: [],
    wfmStatus: "Not Ready",
    handoffStatus: "Not Ready",
    outcome: "In Progress",
    documents: [
      {
        id: "doc-201",
        name: "Medical Records (Fit to Work)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Needs Correction",
        deadlineStatus: "Overdue",
        dueDate: "2026-10-09",
        correctionRemarks: "X-Ray pending re-take at Hi-Precision Diagnostics. Fit to Work certificate missing.",
        templateCode: "MAJOR-MED-01"
      },
      {
        id: "doc-202",
        name: "NBI Clearance (Original / Valid)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Gerald Pineda (TA Specialist)",
        submissionMethod: "Physical Copy",
        fileName: "NBI_Santos_Original.pdf",
        templateCode: "MAJOR-NBI-02"
      },
      {
        id: "doc-203",
        name: "PSA Birth Certificate",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Gerald Pineda (TA Specialist)",
        submissionMethod: "Physical Copy",
        fileName: "PSA_Santos.pdf",
        templateCode: "MAJOR-PSA-03"
      },
      {
        id: "doc-204",
        name: "Valid Government ID",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Gerald Pineda (TA Specialist)",
        submissionMethod: "Physical Copy",
        fileName: "UMID_Santos.pdf",
        templateCode: "MAJOR-ID-04"
      },
      // 3 Essential Agreements for Maria Clarisse Santos
      {
        id: "doc-205",
        name: "Acceptance to Company Policy",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Not Submitted",
        templateCode: "AGR-POL-01"
      },
      {
        id: "doc-206",
        name: "Memo 01.2022 and Training Bond (NHO)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Not Submitted",
        templateCode: "AGR-BOND-02"
      },
      {
        id: "doc-207",
        name: "New NDA (Non-Disclosure Agreement)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Not Submitted",
        templateCode: "AGR-NDA-03"
      }
    ],
    auditLogs: [
      {
        id: "log-201",
        timestamp: "2026-10-01 11:00 AM",
        actor: "Gerald Pineda",
        role: "Talent Acquisition",
        action: "NHO Scheduled",
        details: "Scheduled for Oct 09, 2026. 4 major requirements reminder dispatched."
      },
      {
        id: "log-202",
        timestamp: "2026-10-09 09:05 AM",
        actor: "Gerald Pineda",
        role: "Talent Acquisition",
        action: "Attendance Marked: Show (Incomplete Majors)",
        details: "Applicant attended physically but lacked Medical Fit to Work clearance. Temporary account blocked. Rescheduling required."
      }
    ]
  },

  // 3. No Show
  {
    id: "nho-app-03",
    applicantNumber: "APP-2026-0843",
    fullName: "Mark Anthony Reyes",
    firstName: "Mark Anthony",
    lastName: "Reyes",
    email: "mark.reyes@sampleapplicant.ph",
    phone: "+63 919 555 7788",
    position: "Quality Assurance Specialist",
    department: "Quality Assurance",
    account: "Retail E-Commerce",
    cluster: "Cluster 1",
    reportingLocation: "SiBS Tower 1, BGC, Taguig City",
    scheduledNhoDate: "2026-10-09",
    invitationSentDate: "2026-10-01",
    scheduleAccepted: true,
    attendance: "No Show",
    attendanceMarkedAt: "2026-10-09 10:30 AM",
    physicalClearance: "Not Cleared",
    rescheduledCount: 0,
    followUpLogs: [
      {
        id: "fup-1",
        date: "2026-10-09 11:15 AM",
        attemptedBy: "Alena Batacan (TA Lead)",
        method: "Telephone Call",
        result: "No Answer",
        remarks: "Called registered mobile number twice; call redirected to voicemail. Follow-up SMS dispatched."
      }
    ],
    tempAccessStatus: "Not Issued",
    orientationStatus: "Not Started",
    orientationCurrentSlide: 1,
    orientationSlidesViewed: [],
    orientationQuizAnswers: {},
    orientationAcknowledged: false,
    itEndorsed: false,
    itRequestStatus: "Pending",
    proposedKronosUsername: "mreyes",
    kronosDisplayName: "Reyes, Mark Anthony",
    assignedDepartment: "Quality Assurance",
    trainerStatus: "Not Ready",
    assignedTrainerId: "TRN-003",
    assignedTrainerName: "Patricia Cruz (Lead Communications Coach)",
    qdsStatus: "Not Ready",
    qdsMaterials: [],
    wfmStatus: "Not Ready",
    handoffStatus: "Not Ready",
    outcome: "In Progress",
    documents: [
      {
        id: "doc-301",
        name: "Medical Records (Fit to Work)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Not Submitted",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        templateCode: "MAJOR-MED-01"
      },
      {
        id: "doc-302",
        name: "NBI Clearance (Original / Valid)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Not Submitted",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        templateCode: "MAJOR-NBI-02"
      },
      {
        id: "doc-303",
        name: "PSA Birth Certificate",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Not Submitted",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        templateCode: "MAJOR-PSA-03"
      },
      {
        id: "doc-304",
        name: "Valid Government ID",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Not Submitted",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        templateCode: "MAJOR-ID-04"
      },
      {
        id: "doc-305",
        name: "Acceptance to Company Policy",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Not Submitted",
        templateCode: "AGR-POL-01"
      },
      {
        id: "doc-306",
        name: "Memo 01.2022 and Training Bond (NHO)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Not Submitted",
        templateCode: "AGR-BOND-02"
      },
      {
        id: "doc-307",
        name: "New NDA (Non-Disclosure Agreement)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Not Submitted",
        templateCode: "AGR-NDA-03"
      },
      {
        id: "doc-308",
        name: "BIR Form 1902",
        category: "NHO Template",
        isMajor: false,
        isEssentialAgreement: false,
        status: "Not Submitted",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        templateCode: "NHO-BIR-1902"
      },
      {
        id: "doc-309",
        name: "Pre-Employment Requirements Checklist",
        category: "NHO Template",
        isMajor: false,
        isEssentialAgreement: false,
        status: "Not Submitted",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        templateCode: "NHO-CHECKLIST"
      }
    ],
    auditLogs: [
      {
        id: "log-301",
        timestamp: "2026-10-01 02:00 PM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "NHO Scheduled",
        details: "Scheduled for Oct 09, 2026."
      },
      {
        id: "log-302",
        timestamp: "2026-10-09 10:30 AM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "Attendance Marked: No Show",
        details: "Applicant did not arrive by cut-off. Telephone outreach initiated."
      }
    ]
  },

  // 4. Orientation / Agreements Pending
  {
    id: "nho-app-04",
    applicantNumber: "APP-2026-0844",
    fullName: "Beatrice Elena Gomez",
    firstName: "Beatrice Elena",
    lastName: "Gomez",
    email: "beatrice.gomez@sampleapplicant.ph",
    phone: "+63 915 555 9900",
    position: "Healthcare Claims Specialist",
    department: "Operations",
    account: "US Healthcare Claims",
    cluster: "Cluster 3",
    reportingLocation: "SiBS Tower 1, BGC, Taguig City",
    scheduledNhoDate: "2026-10-09",
    invitationSentDate: "2026-10-02",
    scheduleAccepted: true,
    attendance: "Show",
    attendanceMarkedAt: "2026-10-09 08:30 AM",
    physicalClearance: "Cleared",
    clearedDate: "2026-10-09",
    nonMajorDeadlineDate: "2026-10-23",
    rescheduledCount: 0,
    followUpLogs: [],
    tempAccessStatus: "Active",
    tempPasswordGenerated: true,
    tempPasswordHash: "SiBS$Bea#Oct26!",
    hasChangedPassword: true,
    orientationStatus: "In Progress",
    orientationCurrentSlide: 4,
    orientationSlidesViewed: [1, 2, 3, 4],
    orientationQuizAnswers: {},
    orientationAcknowledged: false,
    itEndorsed: false,
    itRequestStatus: "Pending",
    proposedKronosUsername: "bgomez",
    kronosDisplayName: "Gomez, Beatrice Elena",
    assignedDepartment: "Operations - Healthcare",
    trainerStatus: "Not Ready",
    assignedTrainerId: "TRN-004",
    assignedTrainerName: "Danielle Lopez (Operations Trainer)",
    qdsStatus: "Not Ready",
    qdsMaterials: [],
    wfmStatus: "Not Ready",
    handoffStatus: "Not Ready",
    outcome: "In Progress",
    documents: [
      {
        id: "doc-401",
        name: "Medical Records (Fit to Work)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan",
        submissionMethod: "Physical Copy",
        templateCode: "MAJOR-MED-01"
      },
      {
        id: "doc-402",
        name: "NBI Clearance (Original / Valid)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan",
        submissionMethod: "Physical Copy",
        templateCode: "MAJOR-NBI-02"
      },
      {
        id: "doc-403",
        name: "PSA Birth Certificate",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan",
        submissionMethod: "Physical Copy",
        templateCode: "MAJOR-PSA-03"
      },
      {
        id: "doc-404",
        name: "Valid Government ID",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-09",
        submittedDate: "2026-10-09",
        verifiedDate: "2026-10-09",
        verifiedBy: "Alena Batacan",
        submissionMethod: "Physical Copy",
        templateCode: "MAJOR-ID-04"
      },
      // Essential Agreements
      {
        id: "doc-405",
        name: "Acceptance to Company Policy",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "For Verification",
        submittedDate: "2026-10-09",
        submissionMethod: "Electronic Signature",
        fileName: "Policy_Gomez_Signed.pdf",
        templateCode: "AGR-POL-01"
      },
      {
        id: "doc-406",
        name: "Memo 01.2022 and Training Bond (NHO)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Not Submitted",
        templateCode: "AGR-BOND-02"
      },
      {
        id: "doc-407",
        name: "New NDA (Non-Disclosure Agreement)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Not Submitted",
        templateCode: "AGR-NDA-03"
      }
    ],
    auditLogs: [
      {
        id: "log-401",
        timestamp: "2026-10-09 08:30 AM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "Attendance & Physical Clearance Completed",
        details: "Show + 4 majors verified. Temporary portal access generated."
      }
    ]
  },

  // 5. IT Completed, HR Handoff Pending
  {
    id: "nho-app-05",
    applicantNumber: "APP-2026-0845",
    fullName: "Kenneth Joshua Lim",
    firstName: "Kenneth Joshua",
    lastName: "Lim",
    email: "kenneth.lim@sampleapplicant.ph",
    phone: "+63 917 555 4422",
    position: "Senior Network Engineer",
    department: "Information Technology",
    account: "Enterprise Infrastructure",
    cluster: "Cluster 1",
    reportingLocation: "SiBS Tower 1, BGC, Taguig City",
    scheduledNhoDate: "2026-10-05",
    invitationSentDate: "2026-09-27",
    scheduleAccepted: true,
    attendance: "Show",
    attendanceMarkedAt: "2026-10-05 08:30 AM",
    physicalClearance: "Cleared",
    clearedDate: "2026-10-05",
    nonMajorDeadlineDate: "2026-10-19",
    rescheduledCount: 0,
    followUpLogs: [],
    tempAccessStatus: "Active",
    tempPasswordGenerated: true,
    hasChangedPassword: true,
    orientationStatus: "Completed",
    orientationCurrentSlide: 7,
    orientationSlidesViewed: [1, 2, 3, 4, 5, 6, 7],
    orientationQuizAnswers: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1 },
    orientationAcknowledged: true,
    orientationCompletedAt: "2026-10-05 02:00 PM",
    itEndorsed: true,
    itEndorsedAt: "2026-10-06 09:30 AM",
    itEndorsedBy: "Alena Batacan",
    itRequestStatus: "Completed",
    proposedKronosUsername: "klim",
    kronosDisplayName: "Lim, Kenneth Joshua",
    assignedDepartment: "Information Technology",
    itProvisioningRemarks: "Network Admin badge access granted, VLAN 40",
    officialKronosId: "KRN-90845",
    itCompletedAt: "2026-10-06 03:45 PM",
    trainerStatus: "Pending Acceptance",
    assignedTrainerId: "TRN-001",
    assignedTrainerName: "Maria Elena Garcia (Senior Trainer)",
    trainerAssignedAt: "2026-10-06 03:50 PM",
    qdsStatus: "In Progress",
    qdsAssignedAt: "2026-10-06 03:55 PM",
    qdsMaterials: [
      {
        id: "qds-mat-501",
        title: "Enterprise IT Systems & Infrastructure Standards",
        type: "PDF Document",
        fileOrLinkRef: "Enterprise_IT_Standards_2026.pdf",
        fileSize: "4.2 MB",
        description: "Network architecture, SSO credentials, and security escalation",
        assignedAt: "2026-10-06 04:00 PM",
        assignedBy: "Carla Villanueva (Lead QDS)"
      }
    ],
    wfmStatus: "Pending WFM Assignment",
    handoffStatus: "Waiting for Departments",
    handoffSubmittedAt: "2026-10-06 04:00 PM",
    outcome: "In Progress",
    documents: [
      {
        id: "doc-501",
        name: "Medical Records (Fit to Work)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-05",
        submittedDate: "2026-10-05",
        verifiedDate: "2026-10-05",
        templateCode: "MAJOR-MED-01"
      },
      {
        id: "doc-502",
        name: "NBI Clearance (Original / Valid)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-05",
        submittedDate: "2026-10-05",
        verifiedDate: "2026-10-05",
        templateCode: "MAJOR-NBI-02"
      },
      {
        id: "doc-503",
        name: "PSA Birth Certificate",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-05",
        submittedDate: "2026-10-05",
        verifiedDate: "2026-10-05",
        templateCode: "MAJOR-PSA-03"
      },
      {
        id: "doc-504",
        name: "Valid Government ID",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-10-05",
        submittedDate: "2026-10-05",
        verifiedDate: "2026-10-05",
        templateCode: "MAJOR-ID-04"
      },
      {
        id: "doc-505",
        name: "Acceptance to Company Policy",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-10-05",
        verifiedDate: "2026-10-05",
        templateCode: "AGR-POL-01"
      },
      {
        id: "doc-506",
        name: "Memo 01.2022 and Training Bond (NHO)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-10-05",
        verifiedDate: "2026-10-05",
        templateCode: "AGR-BOND-02"
      },
      {
        id: "doc-507",
        name: "New NDA (Non-Disclosure Agreement)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-10-05",
        verifiedDate: "2026-10-05",
        templateCode: "AGR-NDA-03"
      },
      // Non-major pending item
      {
        id: "doc-508",
        name: "TOR / College Diploma",
        category: "Pre-Employment",
        isMajor: false,
        isEssentialAgreement: false,
        status: "For Verification",
        deadlineStatus: "Due Soon",
        dueDate: "2026-10-19",
        submittedDate: "2026-10-08",
        fileName: "TOR_Certified_Lim.pdf",
        templateCode: "PRE-TOR-01"
      }
    ],
    auditLogs: [
      {
        id: "log-501",
        timestamp: "2026-10-05 09:00 AM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "Physical Clearance Cleared",
        details: "All 4 majors verified."
      },
      {
        id: "log-502",
        timestamp: "2026-10-06 09:30 AM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "Endorsed to IT",
        details: "9 mandatory endorsement criteria verified."
      },
      {
        id: "log-503",
        timestamp: "2026-10-06 03:45 PM",
        actor: "Rodrigo Morales",
        role: "IT Manager",
        action: "Kronos Provisioning Completed",
        details: "Official Kronos ID KRN-90845 assigned manually."
      },
      {
        id: "log-504",
        timestamp: "2026-10-06 04:00 PM",
        actor: "SiBS HRIS Service",
        role: "System",
        action: "Handoff Prepared for HR Review",
        details: "Handoff package compiled with pending TOR document (due Oct 19, 2026)."
      }
    ]
  },

  // 6. Outstanding Overdue Document
  {
    id: "nho-app-06",
    applicantNumber: "APP-2026-0846",
    fullName: "Patricia Camille Tan",
    firstName: "Patricia Camille",
    lastName: "Tan",
    email: "patricia.tan@sampleapplicant.ph",
    phone: "+63 920 555 6677",
    position: "Finance Operations Specialist",
    department: "Finance",
    account: "Corporate Shared Services",
    cluster: "Cluster 1",
    reportingLocation: "SiBS Tower 1, BGC, Taguig City",
    scheduledNhoDate: "2026-09-21",
    invitationSentDate: "2026-09-13",
    scheduleAccepted: true,
    attendance: "Show",
    attendanceMarkedAt: "2026-09-21 08:30 AM",
    physicalClearance: "Cleared",
    clearedDate: "2026-09-21",
    nonMajorDeadlineDate: "2026-10-05", // 14 days later, currently in the past!
    rescheduledCount: 0,
    followUpLogs: [],
    tempAccessStatus: "Active",
    tempPasswordGenerated: true,
    hasChangedPassword: true,
    orientationStatus: "Completed",
    orientationCurrentSlide: 7,
    orientationSlidesViewed: [1, 2, 3, 4, 5, 6, 7],
    orientationQuizAnswers: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1 },
    orientationAcknowledged: true,
    orientationCompletedAt: "2026-09-21 03:00 PM",
    itEndorsed: true,
    itEndorsedAt: "2026-09-22 10:00 AM",
    itEndorsedBy: "Alena Batacan",
    itRequestStatus: "Completed",
    proposedKronosUsername: "ptan",
    kronosDisplayName: "Tan, Patricia Camille",
    assignedDepartment: "Finance Operations",
    officialKronosId: "KRN-90846",
    itCompletedAt: "2026-09-22 04:15 PM",
    trainerStatus: "Accepted",
    assignedTrainerId: "TRN-002",
    assignedTrainerName: "Carlos Mendoza (L&D Specialist)",
    trainerAssignedAt: "2026-09-22 04:20 PM",
    trainerAcceptedAt: "2026-09-22 04:45 PM",
    trainerAcceptedBy: "Carlos Mendoza (L&D Specialist)",
    trainerAcceptedById: "TRN-002",
    trainerReviewedMaterials: true,
    qdsStatus: "Completed",
    qdsAssignedAt: "2026-09-22 04:20 PM",
    qdsCompletedAt: "2026-09-22 04:50 PM",
    qdsCompletedBy: "Carla Villanueva (Lead QDS)",
    qdsMaterials: [
      {
        id: "qds-mat-601",
        title: "Finance & Fintech Compliance Curriculum 2026",
        type: "PDF Document",
        fileOrLinkRef: "Fintech_Compliance_Curriculum_2026.pdf",
        fileSize: "5.1 MB",
        description: "Regulatory reporting guidelines and data governance",
        assignedAt: "2026-09-22 04:30 PM",
        assignedBy: "Carla Villanueva (Lead QDS)"
      },
      {
        id: "qds-mat-602",
        title: "Core Banking Simulated Workstation Walkthrough",
        type: "Approved Training Resource Link",
        fileOrLinkRef: "https://sandbox.finance.internal.sibs.com/walkthrough",
        description: "Self-paced banking environment demo sandbox",
        assignedAt: "2026-09-22 04:40 PM",
        assignedBy: "Carla Villanueva (Lead QDS)"
      }
    ],
    wfmStatus: "Assigned",
    wfmProductionWing: "Right Wing",
    wfmSeatNumber: "RW-021",
    wfmAssignedBy: "Danilo Morales (WFM Lead)",
    wfmAssignedAt: "2026-09-22 05:00 PM",
    wfmRemarks: "Standard production seat assigned.",
    handoffStatus: "Accepted",
    hrAcceptedAt: "2026-09-23 09:30 AM",
    hrAcceptedBy: "Dulla, Ralph Vincent (HR Operations Lead)",
    linkedEmployeeJourneyId: "JRN-2026-001",
    outcome: "Completed Handoff",
    documents: [
      {
        id: "doc-601",
        name: "Medical Records (Fit to Work)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-09-21",
        submittedDate: "2026-09-21",
        verifiedDate: "2026-09-21",
        templateCode: "MAJOR-MED-01"
      },
      {
        id: "doc-602",
        name: "NBI Clearance (Original / Valid)",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-09-21",
        submittedDate: "2026-09-21",
        verifiedDate: "2026-09-21",
        templateCode: "MAJOR-NBI-02"
      },
      {
        id: "doc-603",
        name: "PSA Birth Certificate",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-09-21",
        submittedDate: "2026-09-21",
        verifiedDate: "2026-09-21",
        templateCode: "MAJOR-PSA-03"
      },
      {
        id: "doc-604",
        name: "Valid Government ID",
        category: "Major",
        isMajor: true,
        isEssentialAgreement: false,
        status: "Verified",
        deadlineStatus: "On Time",
        dueDate: "2026-09-21",
        submittedDate: "2026-09-21",
        verifiedDate: "2026-09-21",
        templateCode: "MAJOR-ID-04"
      },
      {
        id: "doc-605",
        name: "Acceptance to Company Policy",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-09-21",
        verifiedDate: "2026-09-21",
        templateCode: "AGR-POL-01"
      },
      {
        id: "doc-606",
        name: "Memo 01.2022 and Training Bond (NHO)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-09-21",
        verifiedDate: "2026-09-21",
        templateCode: "AGR-BOND-02"
      },
      {
        id: "doc-607",
        name: "New NDA (Non-Disclosure Agreement)",
        category: "Essential Agreement",
        isMajor: false,
        isEssentialAgreement: true,
        status: "Verified",
        submittedDate: "2026-09-21",
        verifiedDate: "2026-09-21",
        templateCode: "AGR-NDA-03"
      },
      // Overdue item owned by HR!
      {
        id: "doc-608",
        name: "TOR / College Diploma",
        category: "Pre-Employment",
        isMajor: false,
        isEssentialAgreement: false,
        status: "Not Submitted",
        deadlineStatus: "Overdue",
        dueDate: "2026-10-05",
        description: "Official Transcript of Records or Certified True Copy of College Diploma.",
        templateCode: "PRE-TOR-01"
      },
      {
        id: "doc-609",
        name: "BIR Form 1902",
        category: "NHO Template",
        isMajor: false,
        isEssentialAgreement: false,
        status: "For Verification",
        deadlineStatus: "Submitted Late",
        dueDate: "2026-10-05",
        submittedDate: "2026-10-08",
        fileName: "BIR_1902_Tan_LateSubmitted.pdf",
        templateCode: "NHO-BIR-1902"
      }
    ],
    auditLogs: [
      {
        id: "log-601",
        timestamp: "2026-09-21 09:00 AM",
        actor: "Alena Batacan",
        role: "Talent Acquisition",
        action: "Physical Clearance Cleared",
        details: "4 majors physically verified. 14-day deadline established: Oct 05, 2026."
      },
      {
        id: "log-602",
        timestamp: "2026-09-23 09:30 AM",
        actor: "Dulla, Ralph Vincent",
        role: "HR",
        action: "HR Handoff Accepted",
        details: "HR assumed primary ownership of pending non-major documents. Original deadline (Oct 05, 2026) maintained."
      },
      {
        id: "log-603",
        timestamp: "2026-10-06 12:00 AM",
        actor: "SiBS HRIS Automated Service",
        role: "System",
        action: "Non-Major Deadline Elapsed",
        details: "Pending TOR flagged as Overdue. HR notified for follow-up."
      }
    ]
  }
];
