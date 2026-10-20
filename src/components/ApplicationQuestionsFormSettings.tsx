import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Check,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  Search,
  RefreshCw,
  Share2,
  QrCode,
  Smartphone,
  Monitor,
  Phone,
  Mic,
  Upload,
  ArrowLeft,
  ArrowRight,
  Layers,
  Save,
  Edit3,
  Calendar,
  Type,
  AlignLeft,
  Hash,
  Radio,
  CheckSquare,
  ToggleLeft,
  ClipboardList
} from "lucide-react";

// ================= TYPES =================

export interface ApplicationQuestionField {
  id: string;
  label: string;
  sublabel?: string;
  placeholder?: string;
  inputType:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "yes_no"
    | "date"
    | "phone"
    | "file_upload"
    | "audio_record";
  isRequired: boolean;
  options?: string[];
  helpTooltip?: string;
  systemLocked?: boolean;
}

export interface ApplicationFormSection {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  isMandatory?: boolean;
  isEnabled: boolean;
  isCollapsed?: boolean;
  questions: ApplicationQuestionField[];
}

export interface PositionApplicationFormItem {
  id: string;
  code: string;
  title: string;
  department: string;
  site: string;
  formName: string;
  status: "Active" | "Draft" | "Inactive";
  passingBenchmark: string;
  description: string;
  voiceSampleRequired: boolean;
  applicationSlug: string;
  sections: ApplicationFormSection[];
}

// ================= DEFAULT PRESET SECTIONS =================

const createSourcingSection = (): ApplicationFormSection => ({
  id: "sec-source",
  title: "1. SOURCING CHANNEL & ATTRIBUTION",
  description: "Captures how the candidate discovered SiBS and site preferences.",
  badge: "Attribution",
  isMandatory: true,
  isEnabled: true,
  isCollapsed: false,
  questions: [
    {
      id: "q-source-channel",
      label: "How did you find out about SiBS Solutions?",
      sublabel: "Select your primary recruitment channel.",
      inputType: "select",
      isRequired: true,
      options: [
        "Employee Referral Program",
        "Social Media (Facebook / Instagram)",
        "Job Portals (JobStreet, Indeed)",
        "Walk-in Application",
        "Job Fair / Campus Caravan",
        "Billboards & Community Outreach"
      ],
      systemLocked: true
    },
    {
      id: "q-referrer-name",
      label: "Employee Referrer Full Name & SiBS ID (If Applicable)",
      sublabel: "Enter name of active employee who referred you.",
      placeholder: "e.g. Maria Santos (ID: 6496)",
      inputType: "text",
      isRequired: false
    },
    {
      id: "q-target-site",
      label: "Preferred Working Site Location",
      sublabel: "Choose your primary reporting facility.",
      inputType: "radio",
      isRequired: true,
      options: [
        "Tagum City Hub (Main)",
        "Davao City Matina IT Park",
        "Municipality of Mabini",
        "Cebu IT Park Hub"
      ],
      systemLocked: true
    }
  ]
});

const createPersonalInfoSection = (): ApplicationFormSection => ({
  id: "sec-personal",
  title: "2. PERSONAL & CONTACT DETAILS",
  description: "Core legal identity, active phone numbers, and email address.",
  badge: "Identity",
  isMandatory: true,
  isEnabled: true,
  isCollapsed: false,
  questions: [
    {
      id: "q-full-name",
      label: "Applicant Complete Legal Name",
      sublabel: "First Name, Middle Name, Last Name, and Suffix.",
      placeholder: "Juan Bautista Santos Jr.",
      inputType: "text",
      isRequired: true,
      systemLocked: true
    },
    {
      id: "q-dob",
      label: "Date of Birth",
      sublabel: "Must be 18 years of age or older.",
      inputType: "date",
      isRequired: true,
      systemLocked: true
    },
    {
      id: "q-contact-phones",
      label: "Primary Mobile Number",
      sublabel: "Reachable via SMS and phone calls.",
      placeholder: "0917-XXX-XXXX",
      inputType: "phone",
      isRequired: true,
      systemLocked: true
    },
    {
      id: "q-email",
      label: "Active Email Address",
      sublabel: "For assessment links and interview invitations.",
      placeholder: "candidate@gmail.com",
      inputType: "text",
      isRequired: true,
      systemLocked: true
    },
    {
      id: "q-address",
      label: "Current Residential Address",
      sublabel: "Barangay, City/Municipality, Province.",
      placeholder: "e.g. Purok Mabuhay, Tagum City, Davao del Norte",
      inputType: "textarea",
      isRequired: true
    }
  ]
});

const createExperienceSection = (): ApplicationFormSection => ({
  id: "sec-experience",
  title: "3. WORK HISTORY & BPO EXPERIENCE",
  description: "Previous contact center background and tenure.",
  badge: "Experience",
  isEnabled: true,
  isCollapsed: false,
  questions: [
    {
      id: "q-exp-category",
      label: "Work Experience Level",
      sublabel: "Indicate whether you have previous employment experience.",
      inputType: "radio",
      isRequired: true,
      options: ["With Work Experience", "Fresh Graduate / No Work Experience"]
    },
    {
      id: "q-bpo-tenure",
      label: "Total BPO / Call Center Experience",
      sublabel: "Select your total accumulated tenure.",
      inputType: "select",
      isRequired: true,
      options: [
        "None / No BPO Experience",
        "Less than 6 Months",
        "6 Months to 1 Year",
        "1 Year to 2 Years",
        "2 Years to 3 Years",
        "Over 3 Years"
      ]
    },
    {
      id: "q-last-employer",
      label: "Most Recent Employer & Role",
      sublabel: "Company name and position held.",
      placeholder: "e.g. Teleperformance - Customer Care Associate",
      inputType: "text",
      isRequired: false
    }
  ]
});

const createEducationSection = (): ApplicationFormSection => ({
  id: "sec-education",
  title: "4. EDUCATIONAL ATTAINMENT",
  description: "Highest academic level completed.",
  badge: "Education",
  isEnabled: true,
  isCollapsed: false,
  questions: [
    {
      id: "q-highest-education",
      label: "Highest Educational Attainment Completed",
      sublabel: "Select your academic milestone.",
      inputType: "select",
      isRequired: true,
      options: [
        "High School Graduate (Old Curriculum)",
        "Senior High School Graduate (K-12)",
        "Vocational / TESDA Certificate",
        "College Undergraduate (1st-2nd Year)",
        "College Undergraduate (3rd-4th Year)",
        "Bachelor's Degree Graduate"
      ]
    },
    {
      id: "q-school-degree",
      label: "School & Degree / Course Program",
      sublabel: "Name of institution and course.",
      placeholder: "e.g. University of Mindanao - BS Information Technology",
      inputType: "text",
      isRequired: false
    }
  ]
});

const createReadinessSection = (): ApplicationFormSection => ({
  id: "sec-readiness",
  title: "5. WORK READINESS & SHIFT FLEXIBILITY",
  description: "Night shift willingness and on-site reporting commitment.",
  badge: "Readiness",
  isEnabled: true,
  isCollapsed: false,
  questions: [
    {
      id: "q-graveyard-shift",
      label: "Are you willing to work in a Graveyard / Night Shift schedule (24/7 rotating shifts)?",
      sublabel: "Client accounts operate across US/UK business hours.",
      inputType: "yes_no",
      isRequired: true,
      systemLocked: true
    },
    {
      id: "q-onsite-work",
      label: "Are you fully willing and able to report 100% on-site at the chosen SiBS Hub?",
      sublabel: "Physical on-site reporting is required.",
      inputType: "yes_no",
      isRequired: true,
      systemLocked: true
    },
    {
      id: "q-earliest-start",
      label: "Earliest Available Start Date",
      sublabel: "When can you start onboarding?",
      inputType: "select",
      isRequired: true,
      options: [
        "Immediately / Tomorrow",
        "Within 1 Week",
        "Within 2 Weeks",
        "Within 30 Days (Rendering Notice)"
      ]
    }
  ]
});

const createAttachmentsSection = (): ApplicationFormSection => ({
  id: "sec-attachments",
  title: "6. RESUME & DOCUMENTS",
  description: "Upload resume file in PDF/DOCX format.",
  badge: "Documents",
  isEnabled: true,
  isCollapsed: false,
  questions: [
    {
      id: "q-resume-upload",
      label: "Upload Updated Resume / Curriculum Vitae",
      sublabel: "PDF or Word document format (Max 10MB).",
      inputType: "file_upload",
      isRequired: true,
      systemLocked: true
    }
  ]
});

const createPrivacySection = (): ApplicationFormSection => ({
  id: "sec-privacy",
  title: "7. DATA PRIVACY ACT CONSENT",
  description: "RA 10173 legal consent declaration.",
  badge: "Compliance",
  isEnabled: true,
  isCollapsed: false,
  questions: [
    {
      id: "q-privacy-consent",
      label: "Republic Act No. 10173 (Data Privacy Act) Acknowledgment",
      sublabel: "I authorize SiBS Solutions to process and store my application data for recruitment.",
      inputType: "checkbox",
      isRequired: true,
      options: ["I understand and agree to the Data Privacy Terms and Sworn Application Declaration."],
      systemLocked: true
    }
  ]
});

// ================= INITIAL POSITION FORMS =================

export const INITIAL_APPLICATION_FORMS: PositionApplicationFormItem[] = [
  {
    id: "POS-001",
    code: "POS-001",
    title: "Customer Service Representative",
    department: "Call Center Operations",
    site: "SiBS Tagum",
    formName: "Customer Service Representative - Application Intake Form",
    status: "Active",
    passingBenchmark: "35 WPM • Voice Prompt Required",
    voiceSampleRequired: true,
    applicationSlug: "POS-001-customer-service-representative",
    description: "Application screening form evaluating verbal English clarity, active listening, customer empathy, and operational night shift readiness.",
    sections: [
      createSourcingSection(),
      createPersonalInfoSection(),
      createExperienceSection(),
      createEducationSection(),
      createReadinessSection(),
      {
        id: "sec-voice-csr",
        title: "6. VOICE AUDIO SAMPLE & VERBAL FLUENCY",
        description: "Evaluates applicant's conversational English cadence and phone voice clarity.",
        badge: "Voice Screening",
        isEnabled: true,
        isCollapsed: false,
        questions: [
          {
            id: "q-csr-voice",
            label: "Record 45-Second English Voice Introduction Sample",
            sublabel: "Read: 'Good day! Thank you for calling SiBS Customer Support. My name is [Your Name], and I would be delighted to assist you today.'",
            inputType: "audio_record",
            isRequired: true
          },
          {
            id: "q-csr-deescalate",
            label: "Scenario: A customer is upset about an unexpected billing charge. How would you respond?",
            sublabel: "Demonstrate empathy, active listening, and calm de-escalation.",
            placeholder: "First, I will listen attentively without interrupting, acknowledge their frustration empathetically...",
            inputType: "textarea",
            isRequired: true
          }
        ]
      },
      createAttachmentsSection(),
      createPrivacySection()
    ]
  },
  {
    id: "POS-002",
    code: "POS-002",
    title: "Non Voice Specialist",
    department: "Call Center Operations",
    site: "SiBS Davao",
    formName: "Non Voice Specialist - Digital Screening Form",
    status: "Active",
    passingBenchmark: "Min 40 WPM • Grammar Test",
    voiceSampleRequired: false,
    applicationSlug: "POS-002-non-voice-specialist",
    description: "Intake form for live chat and omnichannel specialists measuring typing speed accuracy, written grammar, and multi-chat multitasking.",
    sections: [
      createSourcingSection(),
      createPersonalInfoSection(),
      createExperienceSection(),
      createEducationSection(),
      createReadinessSection(),
      {
        id: "sec-nonvoice-test",
        title: "6. WRITTEN ENGLISH & CHAT SIMULATION",
        description: "Evaluates typing benchmark and concurrent messaging capability.",
        badge: "Digital Non-Voice",
        isEnabled: true,
        isCollapsed: false,
        questions: [
          {
            id: "q-nonvoice-wpm",
            label: "Typing Test Result (Minimum 40 WPM Required)",
            sublabel: "Enter typing speed result (e.g. 45 WPM with 98% accuracy).",
            placeholder: "e.g. 48 WPM, 98% Accuracy",
            inputType: "text",
            isRequired: true
          },
          {
            id: "q-nonvoice-email",
            label: "Written Exercise: Customer requests refund on non-refundable digital service.",
            sublabel: "Write a professional, polite, and firm response providing alternative solutions.",
            placeholder: "Dear Customer, Thank you for reaching out to us. We understand your situation...",
            inputType: "textarea",
            isRequired: true
          },
          {
            id: "q-nonvoice-concurrency",
            label: "Are you comfortable handling 2 to 3 simultaneous chat conversations concurrently?",
            sublabel: "Live chat agents handle concurrent customer messaging sessions.",
            inputType: "yes_no",
            isRequired: true
          }
        ]
      },
      createAttachmentsSection(),
      createPrivacySection()
    ]
  },
  {
    id: "POS-006",
    code: "POS-006",
    title: "Healthcare Claims Specialist",
    department: "Human Resource",
    site: "SiBS Mabini",
    formName: "Healthcare Claims Specialist - Intake Form",
    status: "Active",
    passingBenchmark: "HIPAA Verification • Medical Terminology",
    voiceSampleRequired: false,
    applicationSlug: "POS-006-healthcare-claims-specialist",
    description: "Screening form for HIPAA-compliant medical claims processing personnel, evaluating insurance terminology grasp and accuracy.",
    sections: [
      createSourcingSection(),
      createPersonalInfoSection(),
      createExperienceSection(),
      createEducationSection(),
      createReadinessSection(),
      {
        id: "sec-healthcare-spec",
        title: "6. HIPAA & HEALTHCARE ACCOUNT SCREENING",
        description: "Verifies medical claims knowledge and compliance grasp.",
        badge: "Healthcare Screening",
        isEnabled: true,
        isCollapsed: false,
        questions: [
          {
            id: "q-hipaa-training",
            label: "Have you undergone formal HIPAA Compliance or PHI training?",
            sublabel: "Mandatory for US healthcare accounts.",
            inputType: "radio",
            isRequired: true,
            options: [
              "Yes, certified / active healthcare BPO experience",
              "Yes, completed in academic healthcare curriculum",
              "No, but willing to undergo strict certification"
            ]
          },
          {
            id: "q-medical-degree-check",
            label: "Do you hold a degree in Medical / Allied Health Fields?",
            sublabel: "Nursing, Medical Technology, Pharmacy, Physical Therapy, Biology, etc.",
            inputType: "yes_no",
            isRequired: false
          }
        ]
      },
      createAttachmentsSection(),
      createPrivacySection()
    ]
  },
  {
    id: "POS-017",
    code: "POS-017",
    title: "Call Center Agent",
    department: "Call Center Operations",
    site: "SiBS Davao",
    formName: "Call Center Agent - Standard Application Form",
    status: "Active",
    passingBenchmark: "30 WPM • Self-Intro Voice",
    voiceSampleRequired: true,
    applicationSlug: "POS-017-call-center-agent",
    description: "Standard inbound customer call handling screening evaluating tone neutralization, active listening, and punctuality.",
    sections: [
      createSourcingSection(),
      createPersonalInfoSection(),
      createExperienceSection(),
      createEducationSection(),
      createReadinessSection(),
      {
        id: "sec-agent-voice",
        title: "6. VOICE AUDIO SAMPLE & CONVERSATIONAL SCREENING",
        description: "Voice recording and situational call handling assessment.",
        badge: "Inbound Voice",
        isEnabled: true,
        isCollapsed: false,
        questions: [
          {
            id: "q-agent-voice-rec",
            label: "Audio Recording: 30-Second Self Introduction",
            sublabel: "State your name, highest educational attainment, and why you are excited to join SiBS.",
            inputType: "audio_record",
            isRequired: true
          },
          {
            id: "q-agent-punctuality",
            label: "Attendance & Punctuality Commitment",
            sublabel: "Are you committed to 100% on-time attendance on rotating schedules?",
            inputType: "yes_no",
            isRequired: true
          }
        ]
      },
      createAttachmentsSection(),
      createPrivacySection()
    ]
  },
  {
    id: "POS-021",
    code: "POS-021",
    title: "Technical Support Representative",
    department: "IT & Technical Operations",
    site: "SiBS Tagum",
    formName: "Technical Support Representative - Diagnostics Form",
    status: "Active",
    passingBenchmark: "Hardware & ISP Diagnostics • Voice Prompt",
    voiceSampleRequired: true,
    applicationSlug: "POS-021-technical-support-representative",
    description: "Tests candidate's step-by-step troubleshooting logic, hardware setup, and ISP network diagnostic explanation.",
    sections: [
      createSourcingSection(),
      createPersonalInfoSection(),
      createExperienceSection(),
      createEducationSection(),
      createReadinessSection(),
      {
        id: "sec-tech-diag",
        title: "6. TECHNICAL & NETWORK DIAGNOSTICS",
        description: "Diagnostic problem breakdown and tech troubleshooting.",
        badge: "Technical Screening",
        isEnabled: true,
        isCollapsed: false,
        questions: [
          {
            id: "q-tech-voice",
            label: "Voice Recording: Explaining Wi-Fi Troubleshooting to a Non-Tech Customer",
            sublabel: "Guide a customer through restarting their router and checking LED indicator lights simply.",
            inputType: "audio_record",
            isRequired: true
          },
          {
            id: "q-tech-os",
            label: "Which operating systems and technologies are you proficient in troubleshooting?",
            sublabel: "Select all that apply.",
            inputType: "checkbox",
            isRequired: true,
            options: [
              "Windows 10 / 11",
              "macOS",
              "Android & iOS Mobile",
              "TCP/IP, DNS, Gateway Configuration",
              "Router / Modem GUI Setup"
            ]
          }
        ]
      },
      createAttachmentsSection(),
      createPrivacySection()
    ]
  },
  {
    id: "POS-035",
    code: "POS-035",
    title: "Financial Account Specialist",
    department: "Financial Services",
    site: "SiBS Davao",
    formName: "Financial Account Specialist - Intake & Security Form",
    status: "Active",
    passingBenchmark: "PCI-DSS Clean-Desk • Math Check",
    voiceSampleRequired: true,
    applicationSlug: "POS-035-financial-account-specialist",
    description: "Financial account screening evaluating customer authentication, numerical calculation precision, and strict clean-desk commitment.",
    sections: [
      createSourcingSection(),
      createPersonalInfoSection(),
      createExperienceSection(),
      createEducationSection(),
      createReadinessSection(),
      {
        id: "sec-fin-sec",
        title: "6. FINANCIAL INTEGRITY & CLEAN-DESK POLICY",
        description: "Security compliance and identity authentication screening.",
        badge: "Financial Security",
        isEnabled: true,
        isCollapsed: false,
        questions: [
          {
            id: "q-fin-voice",
            label: "Voice Recording: Customer Identity Verification Protocol",
            sublabel: "Read standard 3-point authentication script: 'For your security, may I please verify your full billing address and last 4 digits of your account?'",
            inputType: "audio_record",
            isRequired: true
          },
          {
            id: "q-fin-cleandesk",
            label: "Are you fully willing to comply with Strict Clean-Desk & Zero-Cellular Policies on the production floor?",
            sublabel: "Mandatory for PCI-DSS compliant financial accounts.",
            inputType: "yes_no",
            isRequired: true
          }
        ]
      },
      createAttachmentsSection(),
      createPrivacySection()
    ]
  }
];

interface ApplicationQuestionsFormSettingsProps {
  onSwitchModule?: (moduleName: string) => void;
  showToast: (msg: string) => void;
}

export default function ApplicationQuestionsFormSettings({
  onSwitchModule,
  showToast
}: ApplicationQuestionsFormSettingsProps) {
  // State: Positions and their dedicated form sections
  const [positions, setPositions] = useState<PositionApplicationFormItem[]>(() => {
    try {
      const saved = localStorage.getItem("sibs_application_questions_forms");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading saved application forms", e);
    }
    return INITIAL_APPLICATION_FORMS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sibs_application_questions_forms", JSON.stringify(positions));
    } catch (e) {
      console.error("Error persisting application forms", e);
    }
  }, [positions]);
  const [selectedPosId, setSelectedPosId] = useState<string>("POS-001");
  const [posSearch, setPosSearch] = useState("");
  const [formStatusFilter, setFormStatusFilter] = useState("All");
  const [formViewMode, setFormViewMode] = useState<"table" | "edit">("table");

  // Step Wizard State (Same method as Final Interview Form: 1 | 2 | 3 | "all")
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3 | "all">(1);
  const [showNewbieGuide, setShowNewbieGuide] = useState(true);

  // Inline Preview Toggles for Question fields
  const [inlinePreviewQuestions, setInlinePreviewQuestions] = useState<Record<string, boolean>>({});

  // Live Candidate Portal Preview Modal State
  const [isLivePreviewModalOpen, setIsLivePreviewModalOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [previewActiveSectionIdx, setPreviewActiveSectionIdx] = useState(0);
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(false);
  const [simulatedAudioRecorded, setSimulatedAudioRecorded] = useState(false);

  // QR Code Share Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Active Selected Position
  const selectedPosition = useMemo(() => {
    return positions.find(p => p.id === selectedPosId) || positions[0];
  }, [positions, selectedPosId]);

  // Filtered positions for Table view
  const filteredPositions = useMemo(() => {
    return positions.filter(p => {
      const matchSearch =
        p.title.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.department.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.site.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.formName.toLowerCase().includes(posSearch.toLowerCase());

      const matchStatus = formStatusFilter === "All" || p.status === formStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [positions, posSearch, formStatusFilter]);

  // Total questions count for selected position
  const totalQuestionsCount = useMemo(() => {
    return selectedPosition.sections.reduce((acc, s) => acc + (s.isEnabled ? s.questions.length : 0), 0);
  }, [selectedPosition]);

  // Open position in edit wizard
  const handleOpenPositionForm = (posId: string) => {
    setSelectedPosId(posId);
    setFormViewMode("edit");
    setBuilderStep(1);
  };

  // Update selected position basic details (Step 1)
  const handleUpdatePositionFormDetails = (field: keyof PositionApplicationFormItem, value: any) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  // 1-Click Preset Section Handler (Step 2)
  const handleAddPresetSection = (
    presetType: "sourcing" | "personal" | "experience" | "education" | "readiness" | "voice" | "technical" | "documents" | "privacy"
  ) => {
    let newSec: ApplicationFormSection;
    const secNum = selectedPosition.sections.length + 1;

    switch (presetType) {
      case "sourcing":
        newSec = {
          ...createSourcingSection(),
          id: `sec-${Date.now()}`,
          title: `${secNum}. SOURCING CHANNEL & ATTRIBUTION`
        };
        break;
      case "personal":
        newSec = {
          ...createPersonalInfoSection(),
          id: `sec-${Date.now()}`,
          title: `${secNum}. PERSONAL & CONTACT DETAILS`
        };
        break;
      case "experience":
        newSec = {
          ...createExperienceSection(),
          id: `sec-${Date.now()}`,
          title: `${secNum}. WORK HISTORY & BPO EXPERIENCE`
        };
        break;
      case "education":
        newSec = {
          ...createEducationSection(),
          id: `sec-${Date.now()}`,
          title: `${secNum}. EDUCATIONAL ATTAINMENT`
        };
        break;
      case "readiness":
        newSec = {
          ...createReadinessSection(),
          id: `sec-${Date.now()}`,
          title: `${secNum}. WORK READINESS & SHIFT FLEXIBILITY`
        };
        break;
      case "voice":
        newSec = {
          id: `sec-${Date.now()}`,
          title: `${secNum}. VOICE AUDIO PROMPT & VERBAL FLUENCY`,
          description: "Evaluates conversational English cadence and phone voice clarity.",
          badge: "Voice Screening",
          isEnabled: true,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-1`,
              label: "Record 45-Second English Voice Introduction Sample",
              sublabel: "Read standard greeting script or introduce yourself clearly.",
              inputType: "audio_record",
              isRequired: true
            },
            {
              id: `q-${Date.now()}-2`,
              label: "Customer Escalation Handling Scenario",
              sublabel: "Describe how you resolve difficult customer concerns with empathy.",
              inputType: "textarea",
              isRequired: true
            }
          ]
        };
        break;
      case "technical":
        newSec = {
          id: `sec-${Date.now()}`,
          title: `${secNum}. TECHNICAL APTITUDE & DIAGNOSTICS`,
          description: "Tests hardware, network, and diagnostic troubleshooting grasp.",
          badge: "Tech Screening",
          isEnabled: true,
          isCollapsed: false,
          questions: [
            {
              id: `q-${Date.now()}-1`,
              label: "Typing Speed & Accuracy Benchmark (WPM)",
              sublabel: "Enter your recent typing test score.",
              placeholder: "e.g. 45 WPM, 98% Accuracy",
              inputType: "text",
              isRequired: true
            },
            {
              id: `q-${Date.now()}-2`,
              label: "Which technical tools and operating systems are you proficient in?",
              sublabel: "Select all that apply.",
              inputType: "checkbox",
              isRequired: true,
              options: ["Windows 10/11", "macOS", "TCP/IP & DNS", "Router/Modem Setup", "CRM Ticketing"]
            }
          ]
        };
        break;
      case "documents":
        newSec = {
          ...createAttachmentsSection(),
          id: `sec-${Date.now()}`,
          title: `${secNum}. RESUME & DOCUMENT UPLOADS`
        };
        break;
      case "privacy":
      default:
        newSec = {
          ...createPrivacySection(),
          id: `sec-${Date.now()}`,
          title: `${secNum}. DATA PRIVACY ACT (RA 10173) CONSENT`
        };
        break;
    }

    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return { ...p, sections: [...p.sections, newSec] };
        }
        return p;
      })
    );
    showToast(`Added standard "${newSec.title}" section to ${selectedPosition.title}.`);
  };

  // Add Blank Section
  const handleAddSection = () => {
    const newSec: ApplicationFormSection = {
      id: `sec-${Date.now()}`,
      title: `${selectedPosition.sections.length + 1}. CUSTOM SCREENING SECTION`,
      description: "Custom pre-screening questions and criteria for this position.",
      badge: "Custom Section",
      isEnabled: true,
      isCollapsed: false,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          label: "Custom pre-screening question for candidate",
          sublabel: "Provide helper guidance or input instructions.",
          inputType: "text",
          isRequired: false
        }
      ]
    };

    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return { ...p, sections: [...p.sections, newSec] };
        }
        return p;
      })
    );
    showToast(`Added new blank section to ${selectedPosition.title}.`);
  };

  // Update Section Title
  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.map(s => (s.id === sectionId ? { ...s, title } : s))
          };
        }
        return p;
      })
    );
  };

  // Move Section Up/Down
  const handleMoveSection = (secIdx: number, direction: "up" | "down") => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          const newSections = [...p.sections];
          const targetIdx = direction === "up" ? secIdx - 1 : secIdx + 1;
          if (targetIdx < 0 || targetIdx >= newSections.length) return p;
          const [moved] = newSections.splice(secIdx, 1);
          newSections.splice(targetIdx, 0, moved);
          return { ...p, sections: newSections };
        }
        return p;
      })
    );
  };

  // Delete Section
  const handleDeleteSection = (sectionId: string) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.filter(s => s.id !== sectionId)
          };
        }
        return p;
      })
    );
    showToast("Section removed from this application form.");
  };

  // Expand / Collapse Section
  const handleToggleSectionCollapse = (sectionId: string) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.map(s => (s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s))
          };
        }
        return p;
      })
    );
  };

  // Expand / Collapse All
  const handleExpandAllSections = (expand: boolean) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.map(s => ({ ...s, isCollapsed: !expand }))
          };
        }
        return p;
      })
    );
  };

  // Add Question to Section (Step 3)
  const handleAddQuestionToSection = (sectionId: string) => {
    const newQuestion: ApplicationQuestionField = {
      id: `q-${Date.now()}`,
      label: "New intake question or screening requirement",
      sublabel: "Instructions or helper text for applicant.",
      inputType: "text",
      isRequired: false
    };

    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.map(s => {
              if (s.id === sectionId) {
                return { ...s, questions: [...s.questions, newQuestion] };
              }
              return s;
            })
          };
        }
        return p;
      })
    );
    showToast("Added new field to section.");
  };

  // Update Question in Section
  const handleUpdateQuestionInSection = (
    sectionId: string,
    questionId: string,
    field: keyof ApplicationQuestionField,
    val: any
  ) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.map(s => {
              if (s.id === sectionId) {
                return {
                  ...s,
                  questions: s.questions.map(q => {
                    if (q.id === questionId) {
                      const updated = { ...q, [field]: val };
                      // Auto populate options if changing to select/radio/checkbox
                      if (field === "inputType" && ["select", "radio", "checkbox"].includes(val) && !q.options?.length) {
                        updated.options = ["Option 1", "Option 2", "Option 3"];
                      }
                      return updated;
                    }
                    return q;
                  })
                };
              }
              return s;
            })
          };
        }
        return p;
      })
    );
  };

  // Move Question Up/Down
  const handleMoveQuestion = (sectionId: string, qIdx: number, direction: "up" | "down") => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.map(s => {
              if (s.id === sectionId) {
                const newQuestions = [...s.questions];
                const targetIdx = direction === "up" ? qIdx - 1 : qIdx + 1;
                if (targetIdx < 0 || targetIdx >= newQuestions.length) return s;
                const [moved] = newQuestions.splice(qIdx, 1);
                newQuestions.splice(targetIdx, 0, moved);
                return { ...s, questions: newQuestions };
              }
              return s;
            })
          };
        }
        return p;
      })
    );
  };

  // Duplicate Question
  const handleDuplicateQuestion = (sectionId: string, qId: string) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.map(s => {
              if (s.id === sectionId) {
                const target = s.questions.find(q => q.id === qId);
                if (!target) return s;
                const dup: ApplicationQuestionField = {
                  ...JSON.parse(JSON.stringify(target)),
                  id: `q-${Date.now()}`,
                  label: `${target.label} (Copy)`
                };
                return { ...s, questions: [...s.questions, dup] };
              }
              return s;
            })
          };
        }
        return p;
      })
    );
    showToast("Field duplicated.");
  };

  // Delete Question
  const handleDeleteQuestion = (sectionId: string, qId: string) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === selectedPosId) {
          return {
            ...p,
            sections: p.sections.map(s => {
              if (s.id === sectionId) {
                return {
                  ...s,
                  questions: s.questions.filter(q => q.id !== qId)
                };
              }
              return s;
            })
          };
        }
        return p;
      })
    );
    showToast("Field removed.");
  };

  // Toggle inline preview
  const toggleInlinePreview = (qId: string) => {
    setInlinePreviewQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Helper to copy application portal URL
  const handleCopyPortalUrl = (slug: string, title: string) => {
    const url = `https://sibs.careers/apply/${slug}`;
    navigator.clipboard.writeText(url);
    showToast(`Application link for ${title} copied to clipboard!`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
      {/* ================= HEADER SECTION WITH BREADCRUMBS & TOP CONTROLS ================= */}
      <div className="space-y-4">
        {/* Screen Stage Breadcrumbs (Image 2) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {formViewMode === "edit" && (
              <>
                <button
                  onClick={() => setFormViewMode("table")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#042C51] text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs group mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#FF5C28] group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Forms</span>
                </button>
                <span className="text-[11px] text-slate-300">|</span>
              </>
            )}
            <span className="text-[11px] font-bold text-slate-400">Settings</span>
            <span className="text-[11px] text-slate-300">/</span>
            <span 
              onClick={() => setFormViewMode("table")}
              className={`text-[11px] font-bold ${formViewMode === "edit" ? "text-slate-500 hover:text-[#042C51] cursor-pointer" : "text-slate-700 font-extrabold"}`}
            >
              Position-based Application Forms
            </span>
            {formViewMode === "edit" && (
              <>
                <span className="text-[11px] text-slate-300">/</span>
                <span className="text-[11px] font-black text-[#042C51] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 shadow-2xs">
                  {selectedPosition.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* TABLE VIEW HEADER */}
        {formViewMode === "table" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-[#042C51]">Position-based Application Forms</h2>
              <p className="text-xs text-slate-500 font-medium">
                Manage position candidate application intake forms, pre-screening questions, voice audio prompts, and intake requirements.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200">
                {positions.length} configured forms
              </span>

              <button
                onClick={() => {
                  setPreviewActiveSectionIdx(0);
                  setIsLivePreviewModalOpen(true);
                }}
                className="bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Eye className="w-4 h-4 text-white" /> Preview Candidate Portal
              </button>

              <button
                onClick={() => setIsQrModalOpen(true)}
                className="p-2 text-slate-600 hover:text-[#042C51] bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                title="Generate QR Code & Share Link"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                onClick={() => showToast("Application form templates reloaded.")}
                className="p-2 text-slate-600 hover:text-[#042C51] bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* EDITOR VIEW HEADER */}
        {formViewMode === "edit" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            {/* Left: Badges, Big Title & Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-black uppercase text-slate-700 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28] animate-pulse" />
                  APPLICATION QUESTIONNAIRE EDITOR
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50/80 border border-orange-200 text-[11px] font-black text-[#FF5C28]">
                  {selectedPosition.code}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#042C51] tracking-tight uppercase">
                {selectedPosition.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configure this position's application questionnaire, scoring threshold, intake sections, and custom questions.
              </p>
            </div>

            {/* Right: Clean, Flat Action Button Group */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showToast("Application form reloaded from template.")}
                className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#042C51] border border-slate-200 rounded-xl cursor-pointer transition-colors shadow-2xs"
                title="Reload Form"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setPreviewActiveSectionIdx(0);
                  setIsLivePreviewModalOpen(true);
                }}
                className="bg-white hover:bg-slate-50 text-[#042C51] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:border-slate-300"
              >
                <Eye className="w-4 h-4 text-[#FF5C28]" />
                <span>Test Candidate Portal</span>
              </button>

              <button
                onClick={() => showToast(`Saved all application form sections for ${selectedPosition.title}`)}
                className="bg-[#042C51] hover:bg-[#073A6B] text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Save className="w-4 h-4 text-[#FF5C28]" />
                <span>Save Form</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= VIEW 1: TABLE BASED VIEW ================= */}
      {formViewMode === "table" && (
        <div className="space-y-4">
          {/* Table Search & Status Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search forms by role title, position code, department..."
                value={posSearch}
                onChange={e => setPosSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#042C51] focus:outline-none focus:border-[#042C51] focus:ring-1 focus:ring-[#042C51]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Status:</span>
              {["All", "Active", "Inactive", "Draft"].map(st => (
                <button
                  key={st}
                  onClick={() => setFormStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formStatusFilter === st
                      ? "bg-[#042C51] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Position Application Forms Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-xs bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#042C51] text-white text-[11px] uppercase font-black tracking-wider border-b border-[#063a6b]">
                  <th className="p-3.5 pl-4">Position Title & Code</th>
                  <th className="p-3.5">Department & Site</th>
                  <th className="p-3.5">Form Name</th>
                  <th className="p-3.5">Key Requirements / Benchmark</th>
                  <th className="p-3.5">Questions</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPositions.map(p => {
                  const qCount = p.sections.reduce((acc, s) => acc + (s.isEnabled ? s.questions.length : 0), 0);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleOpenPositionForm(p.id)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-4 font-bold text-[#042C51]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-[#FF5C28] shrink-0" />
                          <div>
                            <p className="font-extrabold text-[#042C51] group-hover:text-blue-700 transition-colors">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">{p.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-800">{p.department}</p>
                        <span className="text-[10px] text-slate-500 font-semibold">{p.site}</span>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium max-w-[220px] truncate">
                        {p.formName}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-[11px] px-2.5 py-1 rounded-lg inline-block">
                          {p.passingBenchmark}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 font-bold text-[11px] px-2.5 py-1 rounded-lg inline-block">
                          {p.id === selectedPosId ? totalQuestionsCount : qCount} Fields
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide inline-block ${
                            p.status === "Active"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : p.status === "Draft"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPositionForm(p.id)}
                            className="bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#FF5C28]" /> Edit Form
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPosId(p.id);
                              setPreviewActiveSectionIdx(0);
                              setIsLivePreviewModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#042C51] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Preview Candidate Portal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopyPortalUrl(p.applicationSlug, p.title)}
                            className="p-1.5 text-slate-500 hover:text-[#042C51] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Copy Application Link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPositions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      No application forms match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: EDITABLE FORM VIEW (NEWBIE-FRIENDLY WIZARD MODE) ================= */}
      {formViewMode === "edit" && (
        <div className="space-y-6">
          {/* POSITION FORM SUMMARY CARD (Matches Image 1) */}
          <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                  Position Form Summary
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  Review the selected position before editing its application questionnaire.
                </p>
              </div>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  selectedPosition.status === "Active"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {selectedPosition.status || "ACTIVE"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Tile 1: Position Title */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Position Title
                </span>
                <div className="mt-1">
                  <p className="text-xs font-black text-[#042C51] line-clamp-1">
                    {selectedPosition.title}
                  </p>
                  <span className="text-[11px] font-bold text-[#FF5C28]">
                    {selectedPosition.code}
                  </span>
                </div>
              </div>

              {/* Tile 2: Department / Site */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Department / Site
                </span>
                <div className="mt-1">
                  <p className="text-xs font-bold text-[#042C51]">
                    {selectedPosition.department}
                  </p>
                  <span className="text-[11px] font-medium text-slate-500">
                    {selectedPosition.site}
                  </span>
                </div>
              </div>

              {/* Tile 3: Passing Benchmark */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Benchmark Score
                </span>
                <div className="mt-1">
                  <p className="text-xl font-black text-[#FF5C28]">
                    {selectedPosition.passingBenchmark}
                  </p>
                </div>
              </div>

              {/* Tile 4: Criteria / Questions */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Intake Fields
                </span>
                <div className="mt-1">
                  <p className="text-xl font-black text-[#042C51]">
                    {totalQuestionsCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* UNIFIED SINGLE-PAGE APPLICATION FORM BUILDER */}
          <div className="space-y-6">
            {/* SECTION 1: BASIC DETAILS CARD */}
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-[#042C51]">Form Basic Information & Portal Settings</h3>
                  <p className="text-xs text-slate-500 font-medium">Configure primary application intake properties and candidate instructions</p>
                </div>
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">Position Code: {selectedPosition.code}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold text-[#042C51] block mb-1">
                    Form Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedPosition.formName}
                    onChange={e => handleUpdatePositionFormDetails("formName", e.target.value)}
                    placeholder="e.g. CSR Application Intake Form"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] focus:outline-none focus:border-[#042C51]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Name displayed at the top of the candidate application portal.</p>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-[#042C51] block mb-1">Form Status</label>
                  <select
                    value={selectedPosition.status}
                    onChange={e => handleUpdatePositionFormDetails("status", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] focus:outline-none focus:border-[#042C51]"
                  >
                    <option value="Active">Active (Accepting Applicants)</option>
                    <option value="Draft">Draft (In Setup)</option>
                    <option value="Inactive">Inactive (Disabled)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">Only "Active" forms are accessible to job seekers.</p>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-[#042C51] block mb-1">
                    Key Benchmark / Requirement <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedPosition.passingBenchmark}
                    onChange={e => handleUpdatePositionFormDetails("passingBenchmark", e.target.value)}
                    placeholder="e.g. Min 35 WPM • Voice Prompt"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-[#042C51] focus:outline-none focus:border-[#042C51]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Screening threshold displayed on public job card.</p>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs font-extrabold text-[#042C51] block mb-1">Candidate Directives / Overview</label>
                  <input
                    type="text"
                    value={selectedPosition.description}
                    onChange={e => handleUpdatePositionFormDetails("description", e.target.value)}
                    placeholder="e.g. Please fill out all required fields and prepare your 45-second voice introduction."
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-[#042C51] focus:outline-none focus:border-[#042C51]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Instructions visible to applicants before filling out the form.</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: FORM SECTIONS & INTAKE FIELDS ARCHITECTURE */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-[#042C51]">
                      Application Sections & Intake Questions
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedPosition.sections.length} Sections • {totalQuestionsCount} Question Fields
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleExpandAllSections(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={() => handleExpandAllSections(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Collapse All
                    </button>
                    <button
                      onClick={handleAddSection}
                      className="bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Blank Section
                    </button>
                    <button
                      onClick={() => {
                        setPreviewActiveSectionIdx(0);
                        setIsLivePreviewModalOpen(true);
                      }}
                      className="bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FF5C28]" /> Test Form
                    </button>
                  </div>
                </div>

                {/* 1-CLICK PRESET BUTTONS */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#042C51] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
                      Quickly add pre-configured sections using 1-Click Standard Presets:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleAddPresetSection("voice")}
                      className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <p className="text-xs font-bold text-[#042C51] group-hover:text-blue-700 flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-[#FF5C28]" /> Voice Screening
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">45-sec English audio recording prompt</p>
                    </button>

                    <button
                      onClick={() => handleAddPresetSection("technical")}
                      className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <p className="text-xs font-bold text-[#042C51] group-hover:text-blue-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Typing / Tech Diagnostic
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">WPM benchmarks & tools proficiencies</p>
                    </button>

                    <button
                      onClick={() => handleAddPresetSection("experience")}
                      className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <p className="text-xs font-bold text-[#042C51] group-hover:text-blue-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Work & BPO History
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Tenure, past employer, account types</p>
                    </button>

                    <button
                      onClick={() => handleAddPresetSection("readiness")}
                      className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <p className="text-xs font-bold text-[#042C51] group-hover:text-blue-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Shift & Readiness
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Night shift, on-site, start dates</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* LIST OF SECTIONS & FIELDS */}
              <div className="space-y-5">
                  {selectedPosition.sections.map((sec, secIdx) => (
                    <div
                      key={sec.id}
                      className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                    >
                      {/* SECTION HEADER */}
                      <div className="bg-[#042C51] text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="w-7 h-7 rounded-lg bg-[#FF5C28] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                            S{secIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={e => handleUpdateSectionTitle(sec.id, e.target.value)}
                            className="bg-white/10 hover:bg-white/15 focus:bg-white focus:text-[#042C51] text-white font-extrabold text-xs sm:text-sm px-3 py-1.5 rounded-xl w-full max-w-lg border border-white/20 focus:outline-none transition-all"
                            placeholder="Enter Section Title (e.g. PERSONAL & CONTACT DETAILS)"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* Section Reordering Controls */}
                          <div className="flex items-center bg-white/10 rounded-xl border border-white/15 p-0.5">
                            <button
                              onClick={() => handleMoveSection(secIdx, "up")}
                              disabled={secIdx === 0}
                              className="p-1 text-white disabled:opacity-30 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                              title="Move section up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveSection(secIdx, "down")}
                              disabled={secIdx === selectedPosition.sections.length - 1}
                              className="p-1 text-white disabled:opacity-30 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                              title="Move section down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Add Question Button */}
                          <button
                            onClick={() => handleAddQuestionToSection(sec.id)}
                            className="bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Add question to section"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Field
                          </button>

                          {/* Collapse Toggle */}
                          <button
                            onClick={() => handleToggleSectionCollapse(sec.id)}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
                            title={sec.isCollapsed ? "Expand section" : "Collapse section"}
                          >
                            {sec.isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </button>

                          {/* Delete Section */}
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-1.5 bg-rose-500/20 hover:bg-rose-600/40 text-rose-200 rounded-xl transition-colors cursor-pointer"
                            title="Delete section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* SECTION BODY: FIELD EDITOR CARDS */}
                      {!sec.isCollapsed && (
                        <div className="p-4 sm:p-5 bg-slate-50/70 space-y-3.5">
                          {sec.questions.length === 0 ? (
                            <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                              <p className="text-xs font-bold text-slate-500">No question fields in this section yet.</p>
                              <button
                                onClick={() => handleAddQuestionToSection(sec.id)}
                                className="bg-[#042C51] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 text-[#FF5C28]" /> Add First Field
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3.5">
                              {sec.questions.map((q, qIdx) => (
                                <div
                                  key={q.id}
                                  className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
                                >
                                  {/* FIELD HEADER & CONTROLS */}
                                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-[#042C51] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                        {qIdx + 1}
                                      </span>
                                      <span className="text-xs font-black text-[#042C51]">Question Field #{qIdx + 1}</span>

                                      {/* Question Reordering */}
                                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                        <button
                                          onClick={() => handleMoveQuestion(sec.id, qIdx, "up")}
                                          disabled={qIdx === 0}
                                          className="p-0.5 text-slate-600 disabled:opacity-30 hover:bg-white rounded transition-colors cursor-pointer"
                                          title="Move up"
                                        >
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleMoveQuestion(sec.id, qIdx, "down")}
                                          disabled={qIdx === sec.questions.length - 1}
                                          className="p-0.5 text-slate-600 disabled:opacity-30 hover:bg-white rounded transition-colors cursor-pointer"
                                          title="Move down"
                                        >
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                      {/* INPUT TYPE SELECTOR */}
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-bold text-slate-400">Type:</span>
                                        <select
                                          value={q.inputType}
                                          onChange={e =>
                                            handleUpdateQuestionInSection(sec.id, q.id, "inputType", e.target.value)
                                          }
                                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#042C51] focus:outline-none"
                                        >
                                          <option value="text">Single Line Text</option>
                                          <option value="textarea">Multi-line Paragraph</option>
                                          <option value="number">Number</option>
                                          <option value="select">Dropdown Select</option>
                                          <option value="radio">Radio Choice (Single)</option>
                                          <option value="checkbox">Checkboxes (Multiple)</option>
                                          <option value="yes_no">Yes / No Toggle</option>
                                          <option value="date">Date Picker</option>
                                          <option value="phone">Phone Number</option>
                                          <option value="file_upload">File Upload (PDF/DOCX)</option>
                                          <option value="audio_record">Voice Audio Recording</option>
                                        </select>
                                      </div>

                                      {/* REQUIRED TOGGLE */}
                                      <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                        <input
                                          type="checkbox"
                                          checked={q.isRequired}
                                          onChange={e =>
                                            handleUpdateQuestionInSection(sec.id, q.id, "isRequired", e.target.checked)
                                          }
                                          className="rounded text-[#FF5C28] focus:ring-[#FF5C28]"
                                        />
                                        <span>Required</span>
                                      </label>

                                      {/* DUPLICATE FIELD */}
                                      <button
                                        onClick={() => handleDuplicateQuestion(sec.id, q.id)}
                                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title="Duplicate field"
                                      >
                                        <ClipboardList className="w-3.5 h-3.5" />
                                      </button>

                                      {/* INLINE PREVIEW TOGGLE */}
                                      <button
                                        onClick={() => toggleInlinePreview(q.id)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                          inlinePreviewQuestions[q.id]
                                            ? "bg-orange-100 text-[#FF5C28]"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                        title="Toggle component preview"
                                      >
                                        <Sparkles className="w-3 h-3 text-[#FF5C28]" />
                                        <span>{inlinePreviewQuestions[q.id] ? "Hide Preview" : "Quick Preview"}</span>
                                      </button>

                                      {/* DELETE QUESTION BUTTON */}
                                      <button
                                        onClick={() => handleDeleteQuestion(sec.id, q.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Remove question"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* QUESTION LABEL / TITLE INPUT */}
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                        Question Prompt / Field Label
                                      </label>
                                      <input
                                        type="text"
                                        value={q.label}
                                        onChange={e =>
                                          handleUpdateQuestionInSection(sec.id, q.id, "label", e.target.value)
                                        }
                                        placeholder="Enter intake question label..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#042C51] focus:outline-none focus:bg-white focus:border-[#042C51]"
                                      />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                          Sublabel / Helper Text (Optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={q.sublabel || ""}
                                          onChange={e =>
                                            handleUpdateQuestionInSection(sec.id, q.id, "sublabel", e.target.value)
                                          }
                                          placeholder="e.g. Enter complete legal name as shown on ID"
                                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                          Placeholder / Sample (Optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={q.placeholder || ""}
                                          onChange={e =>
                                            handleUpdateQuestionInSection(sec.id, q.id, "placeholder", e.target.value)
                                          }
                                          placeholder="e.g. Juan Dela Cruz"
                                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white"
                                        />
                                      </div>
                                    </div>

                                    {/* OPTIONS EDITOR (For Select, Radio, Checkbox) */}
                                    {["select", "radio", "checkbox"].includes(q.inputType) && (
                                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                            Choice Options ({q.options?.length || 0})
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const cur = q.options || [];
                                              handleUpdateQuestionInSection(sec.id, q.id, "options", [
                                                ...cur,
                                                `Option ${cur.length + 1}`
                                              ]);
                                            }}
                                            className="text-[10px] font-bold text-[#FF5C28] hover:underline cursor-pointer"
                                          >
                                            + Add Option
                                          </button>
                                        </div>
                                        <div className="space-y-1">
                                          {(q.options || ["Option 1", "Option 2"]).map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-1.5">
                                              <input
                                                type="text"
                                                value={opt}
                                                onChange={e => {
                                                  const newOpts = [...(q.options || [])];
                                                  newOpts[oIdx] = e.target.value;
                                                  handleUpdateQuestionInSection(sec.id, q.id, "options", newOpts);
                                                }}
                                                className="bg-white px-2 py-1 text-xs border border-slate-200 rounded-lg flex-1 font-semibold text-[#042C51] focus:outline-none"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newOpts = (q.options || []).filter((_, idx) => idx !== oIdx);
                                                  handleUpdateQuestionInSection(sec.id, q.id, "options", newOpts);
                                                }}
                                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* INLINE COMPONENT PREVIEW (EXPANDABLE) */}
                                  {inlinePreviewQuestions[q.id] && (
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                          Live Candidate Input Preview ({q.inputType})
                                        </span>
                                      </div>

                                      {q.inputType === "text" && (
                                        <input
                                          type="text"
                                          placeholder={q.placeholder || "Enter text..."}
                                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                      )}

                                      {q.inputType === "textarea" && (
                                        <textarea
                                          rows={2}
                                          placeholder={q.placeholder || "Enter paragraph..."}
                                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                      )}

                                      {q.inputType === "audio_record" && (
                                        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                              <Mic className="w-4 h-4" />
                                            </span>
                                            <div>
                                              <p className="font-bold text-[#042C51]">45-Second Voice Recorder</p>
                                              <p className="text-[10px] text-slate-400">Click to record voice sample</p>
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            className="px-3 py-1.5 bg-[#FF5C28] text-white text-xs font-bold rounded-lg cursor-pointer"
                                          >
                                            Start Recording
                                          </button>
                                        </div>
                                      )}

                                      {q.inputType === "file_upload" && (
                                        <div className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-xl text-center">
                                          <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                                          <p className="font-bold text-slate-700">Drag & Drop Resume or Browse</p>
                                          <p className="text-[10px] text-slate-400">Supports PDF, DOCX (Max 10MB)</p>
                                        </div>
                                      )}

                                      {q.inputType === "yes_no" && (
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            className="px-4 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs"
                                          >
                                            ✓ Yes
                                          </button>
                                          <button
                                            type="button"
                                            className="px-4 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 font-bold rounded-lg text-xs"
                                          >
                                            ✕ No
                                          </button>
                                        </div>
                                      )}

                                      {["select", "radio", "checkbox"].includes(q.inputType) && (
                                        <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                                          {(q.options || ["Option 1", "Option 2"]).map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                                              <input
                                                type={q.inputType === "checkbox" ? "checkbox" : "radio"}
                                                disabled
                                              />
                                              <span>{opt}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* BUTTON TO ADD QUESTION TO THIS SECTION */}
                          <button
                            onClick={() => handleAddQuestionToSection(sec.id)}
                            className="w-full py-2.5 bg-white hover:bg-slate-100 text-[#042C51] border border-dashed border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-4 h-4 text-[#FF5C28]" /> Add Field to "{sec.title}"
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* ADD NEW SECTION DASHED BUTTON */}
              <button
                onClick={handleAddSection}
                className="w-full py-4 bg-slate-50 hover:bg-blue-50/50 text-[#042C51] border-2 border-dashed border-slate-300 hover:border-[#042C51] rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <Plus className="w-4 h-4 text-[#FF5C28] group-hover:scale-125 transition-transform" />
                <span>+ Add New Application Section</span>
              </button>
            </div>

            {/* FORM FOOTER ACTIONS */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setFormViewMode("table")}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" /> Done & Back to Table
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPreviewActiveSectionIdx(0);
                    setIsLivePreviewModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#042C51] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-[#FF5C28]" /> Preview Candidate Portal
                </button>
                <button
                  onClick={() =>
                    showToast(`Saved all application form sections for ${selectedPosition.title}`)
                  }
                  className="px-6 py-2.5 bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4 text-[#FF5C28]" /> Save Position Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= LIVE CANDIDATE PORTAL SIMULATION MODAL ================= */}
      {isLivePreviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div
            className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto transition-all ${
              previewViewport === "mobile" ? "w-full max-w-sm" : "w-full max-w-3xl"
            } max-h-[90vh]`}
          >
            {/* MODAL HEADER */}
            <div className="bg-[#042C51] text-white p-4 flex items-center justify-between shrink-0 border-b border-[#073A6B]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#FF5C28] text-white flex items-center justify-center font-black text-xs">
                  SiBS
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    Candidate Portal Preview
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                      Live Simulation
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate max-w-xs sm:max-w-md">
                    {selectedPosition.title} ({selectedPosition.code}) • {selectedPosition.site}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport Toggles */}
                <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15">
                  <button
                    onClick={() => setPreviewViewport("desktop")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      previewViewport === "desktop" ? "bg-[#FF5C28] text-white" : "text-slate-300 hover:text-white"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewViewport("mobile")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      previewViewport === "mobile" ? "bg-[#FF5C28] text-white" : "text-slate-300 hover:text-white"
                    }`}
                    title="Mobile Viewport"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsLivePreviewModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* SIMULATED BROWSER / PORTAL CONTAINER */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
              {/* PORTAL BRAND HERO */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2">
                <span className="text-[10px] font-black bg-blue-50 text-[#042C51] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  SiBS CAREERS OFFICIAL INTAKE
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#042C51]">{selectedPosition.title}</h2>
                <p className="text-xs text-slate-500 font-medium max-w-lg mx-auto">
                  {selectedPosition.description}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-bold text-slate-600">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">📍 {selectedPosition.site}</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">🏢 {selectedPosition.department}</span>
                  <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg">
                    ⚡ {selectedPosition.passingBenchmark}
                  </span>
                </div>
              </div>

              {/* STEP PROGRESS INDICATOR */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-black text-[#042C51] mb-2">
                  <span>
                    Step {previewActiveSectionIdx + 1} of {selectedPosition.sections.length}
                  </span>
                  <span className="text-slate-500 text-[11px] font-semibold">
                    {selectedPosition.sections[previewActiveSectionIdx]?.title}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF5C28] h-full transition-all duration-300"
                    style={{
                      width: `${((previewActiveSectionIdx + 1) / selectedPosition.sections.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* CURRENT SECTION QUESTIONS */}
              {selectedPosition.sections[previewActiveSectionIdx] && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="font-extrabold text-sm text-[#042C51]">
                      {selectedPosition.sections[previewActiveSectionIdx].title}
                    </h3>
                    {selectedPosition.sections[previewActiveSectionIdx].description && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedPosition.sections[previewActiveSectionIdx].description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedPosition.sections[previewActiveSectionIdx].questions.map((q, idx) => (
                      <div key={q.id} className="space-y-1.5">
                        <label className="text-xs font-bold text-[#042C51] flex items-center justify-between">
                          <span>
                            {idx + 1}. {q.label}{" "}
                            {q.isRequired && <span className="text-rose-500 font-black">*</span>}
                          </span>
                        </label>
                        {q.sublabel && <p className="text-[11px] text-slate-500">{q.sublabel}</p>}

                        {q.inputType === "text" && (
                          <input
                            type="text"
                            placeholder={q.placeholder || "Enter your answer..."}
                            className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-[#042C51] focus:outline-none focus:border-[#042C51]"
                          />
                        )}

                        {q.inputType === "textarea" && (
                          <textarea
                            rows={3}
                            placeholder={q.placeholder || "Provide details..."}
                            className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-[#042C51] focus:outline-none focus:border-[#042C51]"
                          />
                        )}

                        {q.inputType === "select" && (
                          <select className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] focus:outline-none">
                            <option value="">-- Please Select --</option>
                            {(q.options || []).map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {q.inputType === "radio" && (
                          <div className="space-y-2 pt-1">
                            {(q.options || []).map((opt, i) => (
                              <label
                                key={i}
                                className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-xs font-semibold text-[#042C51] cursor-pointer"
                              >
                                <input type="radio" name={`q-${q.id}`} className="text-[#FF5C28]" />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.inputType === "checkbox" && (
                          <div className="space-y-2 pt-1">
                            {(q.options || []).map((opt, i) => (
                              <label
                                key={i}
                                className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-xs font-semibold text-[#042C51] cursor-pointer"
                              >
                                <input type="checkbox" className="text-[#FF5C28] rounded" />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.inputType === "yes_no" && (
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] cursor-pointer transition-colors"
                            >
                              ✓ Yes
                            </button>
                            <button
                              type="button"
                              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border border-slate-200 rounded-xl text-xs font-bold text-[#042C51] cursor-pointer transition-colors"
                            >
                              ✕ No
                            </button>
                          </div>
                        )}

                        {q.inputType === "audio_record" && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                    isSimulatingAudio ? "bg-red-500 text-white animate-pulse" : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  <Mic className="w-4 h-4" />
                                </span>
                                <div>
                                  <p className="font-extrabold text-xs text-[#042C51]">
                                    {isSimulatingAudio
                                      ? "Recording Voice Sample..."
                                      : simulatedAudioRecorded
                                      ? "Voice Audio Recorded ✓"
                                      : "Voice Recording Prompt"}
                                  </p>
                                  <p className="text-[10px] text-slate-400">45-Second English Simulation</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!isSimulatingAudio && !simulatedAudioRecorded) {
                                    setIsSimulatingAudio(true);
                                    setTimeout(() => {
                                      setIsSimulatingAudio(false);
                                      setSimulatedAudioRecorded(true);
                                      showToast("Sample voice audio captured!");
                                    }, 2500);
                                  } else {
                                    setSimulatedAudioRecorded(false);
                                  }
                                }}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer shadow-2xs transition-all ${
                                  isSimulatingAudio
                                    ? "bg-red-600 text-white"
                                    : simulatedAudioRecorded
                                    ? "bg-emerald-600 text-white"
                                    : "bg-[#FF5C28] text-white"
                                }`}
                              >
                                {isSimulatingAudio
                                  ? "Recording..."
                                  : simulatedAudioRecorded
                                  ? "Re-record"
                                  : "Start Recording"}
                              </button>
                            </div>
                          </div>
                        )}

                        {q.inputType === "file_upload" && (
                          <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-1 cursor-pointer hover:bg-blue-50/40 transition-colors">
                            <Upload className="w-5 h-5 text-[#FF5C28] mx-auto" />
                            <p className="text-xs font-bold text-[#042C51]">Click to upload resume or drag & drop</p>
                            <p className="text-[10px] text-slate-400">PDF, DOCX format (Max 10MB)</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* PORTAL SIMULATOR STEP NAVIGATION */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={previewActiveSectionIdx === 0}
                      onClick={() => setPreviewActiveSectionIdx(prev => Math.max(0, prev - 1))}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Previous Step
                    </button>

                    {previewActiveSectionIdx < selectedPosition.sections.length - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewActiveSectionIdx(prev =>
                            Math.min(selectedPosition.sections.length - 1, prev + 1)
                          )
                        }
                        className="px-4 py-2 bg-[#042C51] hover:bg-[#073A6B] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Next Step</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          showToast("Candidate application submitted successfully!");
                          setIsLivePreviewModalOpen(false);
                        }}
                        className="px-5 py-2 bg-[#FF5C28] hover:bg-[#e04f20] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                      >
                        Submit Application ✓
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= QR CODE SHARE MODAL ================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#FF5C28]" />
                <h3 className="text-sm font-black text-[#042C51]">QR Code & Public Application Link</h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
                {/* Visual QR Code placeholder */}
                <div className="w-44 h-44 bg-[#042C51] rounded-xl flex flex-col items-center justify-center text-white p-3 space-y-2 shadow-xs">
                  <QrCode className="w-20 h-20 text-white" />
                  <p className="text-[10px] font-mono tracking-widest text-[#FF5C28] uppercase">SCAN TO APPLY</p>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-[#042C51]">{selectedPosition.title}</h4>
                <p className="text-xs text-slate-400 font-semibold">{selectedPosition.site}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Link</span>
                <p className="font-mono text-[11px] text-[#042C51] break-all">
                  https://sibs.careers/apply/{selectedPosition.applicationSlug}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCopyPortalUrl(selectedPosition.applicationSlug, selectedPosition.title)}
                className="flex-1 py-2.5 bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-4 h-4 text-[#FF5C28]" /> Copy URL Link
              </button>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
