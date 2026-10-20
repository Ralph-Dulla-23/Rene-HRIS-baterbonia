import React, { useState, useEffect, useRef } from "react";
import {
  X,
  RotateCcw,
  Save,
  Info,
  Plus,
  Trash2,
  FileText,
  Briefcase,
  Award,
  ChevronDown,
  Calendar,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Indent,
  Outdent,
  AlignLeft,
  AlignCenter,
  Eraser,
  Undo,
  Redo,
  GraduationCap,
  Check,
  Search,
  Sparkles,
  MapPin,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JobDescriptionRecord } from "./JobDescriptionPage";

export interface CompetencyRow {
  id: string;
  title: string;
  description: string;
  proficiency: "Average" | "Proficient" | "Excellent";
}

interface AddJobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newJd: JobDescriptionRecord) => void;
  existingTemplates?: JobDescriptionRecord[];
  triggerStatusModal?: (type: "success" | "error" | "info", title: string, message: string) => void;
}

const INITIAL_COMPETENCIES: CompetencyRow[] = [
  {
    id: "comp-1",
    title: "Communication & Active Listening",
    description: "Ability to convey technical ideas clearly and de-escalate complex customer situations empathetically.",
    proficiency: "Proficient"
  },
  {
    id: "comp-2",
    title: "Problem Solving & Diagnostic Flow",
    description: "Identifies root causes systematically using triage checklists and standard operating procedures.",
    proficiency: "Proficient"
  }
];

const PERSONALITY_OPTIONS = [
  "Detail-oriented, adaptable, customer-focused, and proactive problem solver",
  "High empathy, active listener, resilient under high inquiry volumes",
  "Analytical, process-driven, methodical with high diagnostic rigor",
  "Collaborative team player, self-starter, strong conflict-resolution skills",
  "Results-oriented, agile, proactive communicator in fast-paced environments"
];

// Preset IQ Factor 1: Education Requirements
const EDUCATION_OPTIONS = [
  "Bachelor's Degree in Computer Science, Information Technology, or Engineering",
  "Bachelor's Degree in Business Administration, Marketing, or Management",
  "Bachelor's Degree in Communications, Psychology, or Liberal Arts",
  "Bachelor's Degree (Any 4-Year College Course / Equivalent)",
  "Associate Degree or College Undergraduate (At least 2 Years Completed)",
  "High School Graduate / Senior High School (K-12) Graduate",
  "Master's Degree / Post-Graduate Degree / MBA",
  "Vocational / Technical Diploma / Trade Certification (TESDA or Equivalent)"
];

// Preset IQ Factor 2: Work Experience Requirements
const WORK_EXPERIENCE_OPTIONS = [
  "Fresh Graduates / Entry-Level Candidates Welcome (No Experience Required)",
  "At least 6 Months of Customer Service or BPO Voice / Non-Voice Experience",
  "1–2 Years of Customer Support, Helpdesk, or Technical Service Experience",
  "2–3 Years of Specialized Technical Troubleshooting or Tier-2 Escalations",
  "3–5 Years of Progressive Domain / Operational Experience",
  "5+ Years of Extensive Subject Matter Expertise and Advanced Troubleshooting",
  "1–2 Years of Supervisory, Team Lead, or Quality Coaching Experience",
  "3+ Years of People Management and Service Delivery Leadership Experience"
];

// Preset Certifications & Affiliations
const CERTIFICATION_OPTIONS = [
  "ITIL Foundation / ITIL v4 Certification",
  "Lean Six Sigma (Yellow Belt / Green Belt / Black Belt)",
  "CompTIA A+ / Network+ / Security+",
  "Cisco Certified Network Associate (CCNA)",
  "Microsoft Certified: Azure Fundamentals / Modern Desktop",
  "COPC Registered Coordinator / Quality Auditor",
  "Project Management Professional (PMP / CAPM)",
  "AWS Certified Cloud Practitioner / Solutions Architect",
  "Google Cloud Certified Associate Cloud Engineer",
  "No Specific Certifications Required"
];

// Preset Operating Locations & Work Models
const LOCATION_OPTIONS = [
  "Cebu IT Park, Cebu City (On-Site)",
  "Bacolod Site, Negros Occidental (On-Site)",
  "Metro Manila / Ortigas Center (On-Site)",
  "Davao Site, Mindanao (On-Site)",
  "Clark Freeport Zone, Pampanga (On-Site)",
  "Hybrid Work Setup (2 Days Remote / 3 Days On-Site)",
  "Permanent Work-From-Home (Remote / Distributed)"
];

// BPREDS Approved Account Coding Standards (e.g. YDL, CDC, CDN, USV)
const ACCOUNT_OPTIONS = [
  { code: "YDL", name: "Yomdel", label: "YDL – Yomdel" },
  { code: "CDC", name: "CD Collect", label: "CDC – CD Collect" },
  { code: "CDN", name: "Connect", label: "CDN – Connect" },
  { code: "USV", name: "US Visa", label: "USV – US Visa" },
  { code: "VZT", name: "Verizon Tech", label: "VZT – Verizon Tech" },
  { code: "CMT", name: "Comcast Support", label: "CMT – Comcast Support" },
  { code: "TMO", name: "T-Mobile Customer Care", label: "TMO – T-Mobile Customer Care" },
  { code: "ISS", name: "Internal Shared Services", label: "ISS – Internal Shared Services" },
  { code: "ERS", name: "Enterprise Retail Support", label: "ERS – Enterprise Retail Support" }
];

// REUSABLE MULTI-SELECT DROPDOWN COMPONENT
interface MultiSelectDropdownProps {
  label: string;
  subLabel?: string;
  badgeText?: string;
  icon: React.ReactNode;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  subLabel,
  badgeText,
  icon,
  options,
  selectedValues,
  onChange,
  placeholder = "Select or search requirements...",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customInput, setCustomInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const removeValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedValues.includes(trimmed)) {
      onChange([...selectedValues, trimmed]);
      setCustomInput("");
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <span className="text-[#FF5C28]">{icon}</span>
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        {badgeText && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            {badgeText}
          </span>
        )}
      </div>

      {subLabel && <p className="text-[11px] text-slate-500">{subLabel}</p>}

      {/* Trigger & Badge Display Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] p-2 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-[#042C51] transition-all flex items-center justify-between gap-2 flex-wrap"
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {selectedValues.length === 0 ? (
            <span className="text-xs text-slate-400 font-normal px-1.5 select-none">
              {placeholder}
            </span>
          ) : (
            selectedValues.map((val, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-blue-50/80 text-[#042C51] border border-blue-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold max-w-full truncate shadow-2xs group"
              >
                <span className="truncate">{val}</span>
                <button
                  type="button"
                  onClick={(e) => removeValue(val, e)}
                  className="p-0.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pr-1 text-slate-400">
          {selectedValues.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {selectedValues.length} selected
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#042C51]" : ""
            }`}
          />
        </div>
      </div>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-2.5 mt-1"
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search standard options..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51]"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center justify-between text-[11px] font-bold px-1 text-slate-500 border-b border-slate-100 pb-1.5">
              <span>Standard Specifications</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange([...options])}
                  className="text-blue-700 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-slate-500 hover:text-red-600 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 pr-1 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-400">
                  No matching standard options found.
                </div>
              ) : (
                filteredOptions.map((opt, i) => {
                  const isSelected = selectedValues.includes(opt);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleOption(opt)}
                      className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-[#042C51] font-semibold"
                          : "hover:bg-slate-50 text-slate-700 font-normal"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-[#042C51] border-[#042C51] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="leading-snug">{opt}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Custom Option Input */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                placeholder="Type a custom requirement & add..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#042C51]"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={!customInput.trim()}
                className="px-3 py-1.5 bg-[#042C51] disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AddJobDescriptionModal: React.FC<AddJobDescriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTemplates = [],
  triggerStatusModal
}) => {
  // SECTION 1: HIRING REQUIREMENT & TEMPLATE LINK
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [roleTitle, setRoleTitle] = useState<string>("");
  const [account, setAccount] = useState<string>("VZT – Verizon Tech");
  const [department, setDepartment] = useState<string>("Technical Support");
  const [location, setLocation] = useState<string>("Cebu IT Park, Cebu City (On-Site)");
  const [dateRequested, setDateRequested] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [preparedBy, setPreparedBy] = useState<string>("6496 – CANITAN, CRISTER ALBERCA");

  // SECTION 2: JOB DESCRIPTION CONTENT
  const [reportsTo, setReportsTo] = useState<string>("Operations Manager");
  const [isSupervisory, setIsSupervisory] = useState<boolean>(false);

  // IQ FACTORS 1 & 2 & CERTIFICATIONS TEXT AREAS
  const [education, setEducation] = useState<string>(
    "Bachelor's Degree (Any 4-Year College Course / Equivalent) or Associate Degree / College Undergraduate (At least 2 Years Completed)"
  );
  const [experience, setExperience] = useState<string>(
    "1–2 Years of Customer Support, Helpdesk, or Technical Service Experience in a BPO or related operational environment"
  );
  const [certificationsAndAffiliations, setCertificationsAndAffiliations] = useState<string>(
    "No Specific Certifications Required. ITIL Foundation or Lean Six Sigma certification is an advantage."
  );

  const [positionOverview, setPositionOverview] = useState<string>(
    "Describe the main purpose of the role."
  );
  const [qualifications, setQualifications] = useState<string>(
    "Enter qualifications, characteristics, or notes."
  );
  const [targetPersonality, setTargetPersonality] = useState<string>(
    "Detail-oriented, adaptable, customer-focused, and proactive problem solver"
  );
  const [responsibilities, setResponsibilities] = useState<string>(
    "• Execute primary operational workflows and deliver high quality deliverables according to SLA benchmarks.\n• Diagnose and resolve escalated customer inquiries with speed, accuracy, and clear communication.\n• Maintain detailed records, notes, and metrics within CRM software and operational logging systems."
  );

  // SECTION 3: DESIRED COMPETENCIES & CAPABILITY MATRIX
  const [competencies, setCompetencies] = useState<CompetencyRow[]>(INITIAL_COMPETENCIES);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset / Default sync
  useEffect(() => {
    if (isOpen) {
      if (!roleTitle) {
        setRoleTitle("Senior Customer Support Representative");
        setDocumentTitle("JD_Senior_Support_v1.0.pdf");
      }
    }
  }, [isOpen]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const template = existingTemplates.find((t) => t.id === templateId);
    if (template) {
      setRoleTitle(template.roleTitle || "");
      setDocumentTitle(template.documentTitle || `JD_${(template.roleTitle || "Role").replace(/\s+/g, "_")}_v1.0.pdf`);
      setDepartment(template.department || "Technical Support");
      setAccount(template.account || "VZT – Verizon Tech");
      if (template.location) {
        setLocation(template.location);
      }
      setIsSupervisory(
        Boolean(
          template.supervisoryLevel &&
          !template.supervisoryLevel.toLowerCase().includes("individual") &&
          !template.supervisoryLevel.toLowerCase().includes("non-supervisory")
        )
      );
      if (template.educationRequirements && template.educationRequirements.length > 0) {
        setEducation(template.educationRequirements.join("\n"));
      }
      if (template.experienceRequirements && template.experienceRequirements.length > 0) {
        setExperience(template.experienceRequirements.join("\n"));
      }
      if (template.certificationsAndAffiliations && template.certificationsAndAffiliations.length > 0) {
        setCertificationsAndAffiliations(template.certificationsAndAffiliations.join("\n"));
      }
      if (template.responsibilities && template.responsibilities.length > 0) {
        setResponsibilities(template.responsibilities.join("\n"));
      }
      if (template.targetPersonality) {
        setTargetPersonality(template.targetPersonality);
      }
      if (triggerStatusModal) {
        triggerStatusModal("info", "Template Loaded", `Populated fields from template: ${template.roleTitle}`);
      }
    }
  };

  // Add Competency Row
  const handleAddCompetency = () => {
    const newComp: CompetencyRow = {
      id: `comp-${Date.now()}`,
      title: "",
      description: "",
      proficiency: "Proficient"
    };
    setCompetencies((prev) => [...prev, newComp]);
  };

  // Remove Competency Row
  const handleRemoveCompetency = (id: string) => {
    setCompetencies((prev) => prev.filter((c) => c.id !== id));
  };

  // Update Competency Row
  const handleUpdateCompetency = (id: string, field: keyof CompetencyRow, value: any) => {
    setCompetencies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Reset Form
  const handleReset = () => {
    setSelectedTemplateId("");
    setRoleTitle("Senior Customer Support Representative");
    setDocumentTitle("JD_Senior_Support_v1.0.pdf");
    setAccount("VZT – Verizon Tech");
    setDepartment("Technical Support");
    setLocation("Cebu IT Park, Cebu City (On-Site)");
    setDateRequested(new Date().toISOString().split("T")[0]);
    setPreparedBy("6496 – CANITAN, CRISTER ALBERCA");
    setReportsTo("Operations Manager");
    setIsSupervisory(false);
    setEducation(
      "Bachelor's Degree (Any 4-Year College Course / Equivalent) or Associate Degree / College Undergraduate (At least 2 Years Completed)"
    );
    setExperience(
      "1–2 Years of Customer Support, Helpdesk, or Technical Service Experience in a BPO or related operational environment"
    );
    setCertificationsAndAffiliations(
      "No Specific Certifications Required. ITIL Foundation or Lean Six Sigma certification is an advantage."
    );
    setPositionOverview("Describe the main purpose of the role.");
    setQualifications("Enter qualifications, characteristics, or notes.");
    setTargetPersonality("Detail-oriented, adaptable, customer-focused, and proactive problem solver");
    setResponsibilities(
      "• Execute primary operational workflows and deliver high quality deliverables according to SLA benchmarks.\n• Diagnose and resolve escalated customer inquiries with speed, accuracy, and clear communication.\n• Maintain detailed records, notes, and metrics within CRM software and operational logging systems."
    );
    setCompetencies(INITIAL_COMPETENCIES);
    setErrors({});

    if (triggerStatusModal) {
      triggerStatusModal("info", "Form Reset", "All fields have been reset to default values.");
    }
  };

  // Save Job Description
  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    if (!roleTitle.trim()) newErrors.roleTitle = "Role Title is required";
    if (!documentTitle.trim()) newErrors.documentTitle = "Document Title is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (triggerStatusModal) {
        triggerStatusModal("error", "Validation Error", "Please fill in all mandatory fields before saving.");
      }
      return;
    }

    const todayStr = dateRequested || new Date().toISOString().split("T")[0];
    const generatedId = `JD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

    const eduList = education.split("\n").map((s) => s.trim()).filter(Boolean);
    const expList = experience.split("\n").map((s) => s.trim()).filter(Boolean);
    const certList = certificationsAndAffiliations.split("\n").map((s) => s.trim()).filter(Boolean);
    const respList = responsibilities.split("\n").map((s) => s.trim()).filter(Boolean);

    const newJDRecord: JobDescriptionRecord = {
      id: generatedId,
      documentTitle: documentTitle.trim(),
      roleTitle: roleTitle.trim(),
      department: department.trim(),
      account: account.trim(),
      location: location.trim(),
      linkedHiringNeed: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90) + 10)} (New Position)`,
      supervisoryLevel: isSupervisory ? ("Supervisor" as any) : ("Individual Contributor" as any),
      status: "New Job Description" as any,
      dateRequested: todayStr,
      versionNo: "v1.0",
      educationRequirements: eduList.length > 0 ? eduList : [education.trim() || "Standard Education Requirement"],
      experienceRequirements: expList.length > 0 ? expList : [experience.trim() || "Standard Work Experience Requirement"],
      certificationsAndAffiliations: certList.length > 0 ? certList : [certificationsAndAffiliations.trim() || "No Specific Certifications Required"],
      competencies: competencies.map((c) => c.title || c.description || "Competency Standard"),
      compensableFactors: [
        {
          id: 1,
          factorName: "Education",
          category: "IQ",
          criteria: eduList.join("; ") || education.trim() || "Bachelor's degree or equivalent college degree.",
          weightOrPoints: 10
        },
        {
          id: 2,
          factorName: "Work Experience",
          category: "IQ",
          criteria: expList.join("; ") || experience.trim() || "Minimum 1-2 years relevant experience.",
          weightOrPoints: 15
        },
        {
          id: 3,
          factorName: "Desired Competencies",
          category: "IQ",
          criteria: competencies.map(c => c.title || c.description).join("; ") || "Core diagnostic and operational competencies.",
          weightOrPoints: 15
        },
        {
          id: 4,
          factorName: "Work Complexity / Budget Authority",
          category: "IQ",
          criteria: "Handles moderate to high complexity task streams and deliverables.",
          weightOrPoints: 10
        },
        {
          id: 5,
          factorName: "Independent Judgment / Decision Making / Problem Solving",
          category: "IQ",
          criteria: "Autonomous resolution of operational roadblocks within established SOP guidelines.",
          weightOrPoints: 15
        },
        {
          id: 6,
          factorName: "Leadership / Team Influence",
          category: "EQ",
          criteria: isSupervisory ? "Provides direct supervision and operational leadership." : "Collaborative peer contributor and team player.",
          weightOrPoints: 10
        },
        {
          id: 7,
          factorName: "Customer Focus & Interpersonal Skill",
          category: "EQ",
          criteria: targetPersonality || "High empathy, active listener, resilient under pressure.",
          weightOrPoints: 10
        },
        {
          id: 8,
          factorName: "Work Environment & Physical Demands",
          category: "CONDITIONS",
          criteria: `${location || "Standard office/BPO facility"} or compliant remote workstation.`,
          weightOrPoints: 5
        },
        {
          id: 9,
          factorName: "Work Hazards / Health & Safety",
          category: "CONDITIONS",
          criteria: "Low physical hazard; prolonged computer screen usage and seated workstation.",
          weightOrPoints: 10
        }
      ],
      responsibilities: respList.length > 0 ? respList : [responsibilities.trim() || "Execute key operational workflows and deliverables."],
      targetPersonality: targetPersonality.trim(),
      revisionHistory: [
        {
          id: `REV-${Date.now().toString().slice(-4)}`,
          date: todayStr,
          author: preparedBy.split("–")[1]?.trim() || "HR Specialist",
          version: "v1.0",
          remarks: "Job Description created with defined Education, Work Experience, and Competency requirements."
        }
      ]
    };

    onSave(newJDRecord);
    onClose();
  };

  if (!isOpen) return null;

  // Rich text editor toolbar component
  const EditorToolbar = () => (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b border-slate-200 text-slate-500 overflow-x-auto select-none">
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Bold">
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Italic">
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Underline">
        <Underline className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Strikethrough">
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-1" />

      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Bullet List">
        <List className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Numbered List">
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Outdent">
        <Outdent className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Indent">
        <Indent className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-1" />

      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Align Left">
        <AlignLeft className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Align Center">
        <AlignCenter className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-1" />

      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Clear Formatting">
        <Eraser className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Undo">
        <Undo className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="p-1 hover:bg-slate-100 hover:text-slate-800 rounded transition-colors" title="Redo">
        <Redo className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div
      id="add-jd-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.99, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: 8 }}
        transition={{ duration: 0.18 }}
        className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-6xl my-auto max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden font-sans"
      >
        {/* MODAL HEADER */}
        <div className="bg-[#042C51] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#031d36]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-400/20 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-[#FF5C28]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-white">
                  ADD JOB DESCRIPTION
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#FF5C28] text-white text-[10px] font-black uppercase tracking-wider">
                  SPECIFICATION
                </span>
              </div>
              <p className="text-xs text-blue-100/85 font-normal mt-0.5">
                Create or update job description specifications for hiring requirements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-lg border border-slate-400/30 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset fields to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save Job Description</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#F8FAFC] text-slate-900 text-sm">
          {/* CONTEXTUAL SPECIFICATION GUIDE BANNER */}
          <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-[#042C51]">
                  Contextual Specification Guide
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                  NEW SPEC MODE
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are creating a new Job Description specification. Define educational requirements, work experience benchmarks, supervisory level, and competency standards for the recruitment intake.
              </p>
            </div>
          </div>

          {/* SECTION 1: HIRING REQUIREMENT & TEMPLATE LINK */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#FF5C28]" />
                  <h3 className="text-xs sm:text-sm font-black text-[#042C51] tracking-wide uppercase">
                    SECTION 1: HIRING REQUIREMENT &amp; TEMPLATE LINK
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Select an approved template or create a new record, then complete all existing ownership and position fields.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STATUS</span>
                <span className="border border-orange-300 bg-orange-50/70 text-[#FF5C28] font-bold text-xs px-3 py-0.5 rounded-full">
                  For Approval
                </span>
              </div>
            </div>

            {/* Existing Job Description Template dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Existing Job Description Template
                </label>
                <span className="text-xs font-bold text-[#042C51] hover:underline cursor-pointer">
                  Select template or create new
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all cursor-pointer"
                >
                  <option value="">No Existing Job Description – New Job Description</option>
                  {existingTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.roleTitle} ({t.department} - {t.account})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Grid Form Fields Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => {
                    setDocumentTitle(e.target.value);
                    if (errors.documentTitle) setErrors((prev) => ({ ...prev, documentTitle: "" }));
                  }}
                  placeholder="e.g. JD_Senior_Support_v1.0.pdf"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all"
                />
                {errors.documentTitle && <p className="text-[11px] text-red-500 mt-1">{errors.documentTitle}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Role Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => {
                    setRoleTitle(e.target.value);
                    if (errors.roleTitle) setErrors((prev) => ({ ...prev, roleTitle: "" }));
                  }}
                  placeholder="e.g. Senior Customer Support Representative"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all"
                />
                {errors.roleTitle && <p className="text-[11px] text-red-500 mt-1">{errors.roleTitle}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Account / Client (BPREDS 3-Letter Code) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all cursor-pointer"
                  >
                    {ACCOUNT_OPTIONS.map((acc) => (
                      <option key={acc.code} value={acc.label}>
                        {acc.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid Form Fields Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all cursor-pointer"
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Customer Care">Customer Care</option>
                    <option value="Operations">Operations</option>
                    <option value="Talent Acquisition">Talent Acquisition</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Workforce Management">Workforce Management</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Location / Work Setup <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all cursor-pointer"
                  >
                    {LOCATION_OPTIONS.map((loc, idx) => (
                      <option key={idx} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date Requested <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateRequested}
                    onChange={(e) => setDateRequested(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Prepared By / Requested By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: JOB DESCRIPTION CONTENT & REQUIREMENTS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF5C28]" />
                  <h3 className="text-xs sm:text-sm font-black text-[#042C51] tracking-wide uppercase">
                    SECTION 2: JOB DESCRIPTION CONTENT &amp; REQUIREMENTS
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Standardized specifications aligned with BPREDS guidelines, SIPOC process mapping, and JE compensable factors.
                </p>
              </div>

              <span className="text-xs font-bold text-[#042C51] bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                Specification Matrix
              </span>
            </div>

            {/* Row 1: Reports to & Supervisory Responsibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reports to <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={reportsTo}
                    onChange={(e) => setReportsTo(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all cursor-pointer"
                  >
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Team Lead - Technical Support">Team Lead - Technical Support</option>
                    <option value="Director of Operations">Director of Operations</option>
                    <option value="Service Delivery Manager">Service Delivery Manager</option>
                    <option value="Senior QA Lead">Senior QA Lead</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Supervisory Responsibility <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">Aligned with JE compensable factor</span>
                </div>
                <div className="flex rounded-xl border border-slate-300 overflow-hidden bg-white h-[38px]">
                  <button
                    type="button"
                    onClick={() => setIsSupervisory(true)}
                    className={`flex-1 flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      isSupervisory ? "bg-[#042C51] text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Yes (Supervisory)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSupervisory(false)}
                    className={`flex-1 flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      !isSupervisory ? "bg-[#042C51] text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    No (Individual Contributor)
                  </button>
                </div>
              </div>
            </div>

            {/* Position Overview with Rich Editor Toolbar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Position Overview <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-medium text-slate-500">
                  Standardized description • Use approved 3-letter account codes (e.g. YDL, CDC, CDN, USV)
                </span>
              </div>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:border-[#042C51] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <EditorToolbar />
                <textarea
                  rows={3}
                  value={positionOverview}
                  onChange={(e) => setPositionOverview(e.target.value)}
                  placeholder="Describe the standardized position purpose using approved account codes (e.g. YDL, CDC, CDN, USV per BPREDS master guidelines)."
                  className="w-full p-3 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none resize-y leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Duties and Responsibilities with Rich Editor Toolbar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Duties and Responsibilities <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-medium text-slate-500">
                  Derived from the account&apos;s MOP, which in turn should come from the SIPOC / process mapping
                </span>
              </div>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:border-[#042C51] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <EditorToolbar />
                <textarea
                  rows={4}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Enter key duties and responsibilities derived from the account's MOP / SIPOC process mapping..."
                  className="w-full p-3 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none resize-y leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Qualifications & Characteristics with Rich Editor Toolbar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Qualifications and Characteristics <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-medium text-slate-500">
                  Behavioral / soft-skill competencies identified by PE based on actual process requirements
                </span>
              </div>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:border-[#042C51] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <EditorToolbar />
                <textarea
                  rows={3}
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="Enter behavioral and soft-skill competencies identified by PE based on actual process requirements."
                  className="w-full p-3 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none resize-y leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Preferred Personality Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Preferred Personality Profile <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={targetPersonality}
                  onChange={(e) => setTargetPersonality(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#042C51] transition-all cursor-pointer"
                >
                  <option value="">Select personality types</option>
                  {PERSONALITY_OPTIONS.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* IQ FACTOR 1: EDUCATION (TEXT AREA) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Education <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-medium text-slate-500">
                  Specify minimum required or accepted educational attainment levels (IQ Factor 1)
                </span>
              </div>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:border-[#042C51] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <EditorToolbar />
                <textarea
                  rows={3}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="Enter minimum required or accepted educational attainment levels..."
                  className="w-full p-3 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none resize-y leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* IQ FACTOR 2: EXPERIENCE (TEXT AREA) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Experience <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-medium text-slate-500">
                  Specify required years of operational experience, domain background, or prior expertise (IQ Factor 2)
                </span>
              </div>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:border-[#042C51] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <EditorToolbar />
                <textarea
                  rows={3}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Enter required years of operational experience, domain background, or prior expertise..."
                  className="w-full p-3 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none resize-y leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* CERTIFICATIONS AND AFFILIATIONS (TEXT AREA) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Certifications and Affiliations
                </label>
                <span className="text-[10px] font-medium text-slate-500">
                  Specify required or preferred industry certifications, credentials, licenses, or affiliations
                </span>
              </div>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:border-[#042C51] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <EditorToolbar />
                <textarea
                  rows={3}
                  value={certificationsAndAffiliations}
                  onChange={(e) => setCertificationsAndAffiliations(e.target.value)}
                  placeholder="Enter required or preferred industry certifications, credentials, licenses, or affiliations..."
                  className="w-full p-3 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none resize-y leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: DESIRED TECHNICAL COMPETENCIES & CAPABILITY MATRIX */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FF5C28]" />
                  <h3 className="text-xs sm:text-sm font-black text-[#042C51] tracking-wide uppercase">
                    SECTION 3: DESIRED TECHNICAL COMPETENCIES &amp; CAPABILITY MATRIX
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Technical / hard-skill requirements derived from the MOP, including system / CRM proficiency where applicable (IQ Factor 3).
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                IQ Factor 3
              </span>
            </div>

            {/* Table & Matrix */}
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
              {/* Header Row */}
              <div className="border-b border-slate-200 bg-white grid grid-cols-12 py-3 px-4 text-xs font-black text-[#042C51] tracking-wide uppercase items-center">
                <div className="col-span-6">COMPETENCY FOR THIS POSITION</div>
                <div className="col-span-2 text-center">AVERAGE</div>
                <div className="col-span-2 text-center">PROFICIENT</div>
                <div className="col-span-2 text-center">EXCELLENT</div>
              </div>

              {/* Rows or Empty State */}
              {competencies.length === 0 ? (
                <div className="py-12 text-center text-xs font-medium text-slate-500 bg-white">
                  No competencies added yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white">
                  {competencies.map((comp) => (
                    <div key={comp.id} className="grid grid-cols-12 p-3 px-4 items-center gap-3 hover:bg-slate-50/50 transition-colors">
                      {/* Left: Input / Description */}
                      <div className="col-span-6">
                        <textarea
                          rows={2}
                          value={comp.description || comp.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateCompetency(comp.id, "description", val);
                            handleUpdateCompetency(comp.id, "title", val.split(".")[0] || "Competency");
                          }}
                          placeholder="Describe this competency..."
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#042C51] transition-all resize-none"
                        />
                      </div>

                      {/* Radio 1: AVERAGE */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleUpdateCompetency(comp.id, "proficiency", "Average")}
                          className="p-1 cursor-pointer"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              comp.proficiency === "Average"
                                ? "border-[#042C51] ring-2 ring-blue-500/20"
                                : "border-slate-400 hover:border-slate-600"
                            }`}
                          >
                            {comp.proficiency === "Average" && (
                              <div className="w-2 h-2 rounded-full bg-[#042C51]" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Radio 2: PROFICIENT */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleUpdateCompetency(comp.id, "proficiency", "Proficient")}
                          className="p-1 cursor-pointer"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              comp.proficiency === "Proficient"
                                ? "border-[#042C51] ring-2 ring-blue-500/20"
                                : "border-slate-400 hover:border-slate-600"
                            }`}
                          >
                            {comp.proficiency === "Proficient" && (
                              <div className="w-2 h-2 rounded-full bg-[#042C51]" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Radio 3: EXCELLENT & Delete button */}
                      <div className="col-span-2 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateCompetency(comp.id, "proficiency", "Excellent")}
                          className="p-1 cursor-pointer"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              comp.proficiency === "Excellent"
                                ? "border-[#042C51] ring-2 ring-blue-500/20"
                                : "border-slate-400 hover:border-slate-600"
                            }`}
                          >
                            {comp.proficiency === "Excellent" && (
                              <div className="w-2 h-2 rounded-full bg-[#042C51]" />
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveCompetency(comp.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors shadow-2xs cursor-pointer ml-auto"
                          title="Delete competency"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Competency Button */}
            <button
              type="button"
              onClick={handleAddCompetency}
              className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#042C51] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Competency</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddJobDescriptionModal;
