import React, { useState, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Music,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  RotateCcw,
  Save,
  UserCheck,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate } from "./TalentPool";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCandidate: (newCandidate: Candidate) => void;
  userEmail?: string;
}

interface WorkExpItem {
  id: string;
  position: string;
  company: string;
  industry: string;
  monthlySalary: string;
  tenure: string;
  reasonForLeaving: string;
}

const SOURCING_CHANNELS = [
  "Employee Referral Program",
  "Print Ads (Billboards, Brochures, Flyers, Posters)",
  "Social Media Pages",
  "Social Media Ads",
  "Online Job Portals",
  "Walk In",
  "Word of Mouth",
  "Institutional Partnership",
  "External Referral Listings",
  "Job Fairs",
  "Employee Retention Program",
  "Others"
];

const OPEN_POSITIONS = [
  "Healthcare Support Specialist",
  "Technical Support Associate",
  "Financial Account Expert",
  "Customer Service Representative",
  "Bilingual Support Specialist",
  "IT Systems Administrator",
  "Talent Acquisition Specialist",
  "Quality Assurance Analyst"
];

const LOCATIONS = [
  "Tagum City",
  "Davao City",
  "Municipality of Mabini"
];

const CERTIFICATIONS_LIST = [
  "CPA (Certified Public Accountant)",
  "LPT (Licensed Professional Teacher)",
  "Master Degree Holder",
  "Doctorate Holder",
  "Lean Six Sigma Belt Holder",
  "NC II (TESDA)",
  "BOSH / COSH (Safety Officer)",
  "First Aid Certification",
  "Other"
];

export default function AddCandidateModal({
  isOpen,
  onClose,
  onSaveCandidate,
  userEmail
}: AddCandidateModalProps) {
  // 1️⃣ Section 1: Source & Position
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [referrerName, setReferrerName] = useState("");
  const [referrerId, setReferrerId] = useState("");
  const [appliedPosition, setAppliedPosition] = useState("Healthcare Support Specialist");
  const [nickname, setNickname] = useState("");
  const [location, setLocation] = useState("Davao City Site");

  // 2️⃣ Section 2: Personal Information
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");

  // 3️⃣ Section 3: Work Experience
  const [workExpCategory, setWorkExpCategory] = useState("With Work Experience");
  const [workExpList, setWorkExpList] = useState<WorkExpItem[]>([
    {
      id: "exp-1",
      position: "",
      company: "",
      industry: "BPO / Call Center",
      monthlySalary: "",
      tenure: "",
      reasonForLeaving: ""
    }
  ]);

  // 4️⃣ Section 4: Education, Affiliations & Training
  const [educationalAttainment, setEducationalAttainment] = useState("College Graduate");
  // Academic details state
  const [elementarySchool, setElementarySchool] = useState("");
  const [elementaryGradYear, setElementaryGradYear] = useState("");
  const [elementaryAddress, setElementaryAddress] = useState("");

  const [highSchool, setHighSchool] = useState("");
  const [highSchoolGradYear, setHighSchoolGradYear] = useState("");
  const [highSchoolAddress, setHighSchoolAddress] = useState("");

  const [shsStrand, setShsStrand] = useState("STEM");
  const [shsSchool, setShsSchool] = useState("");
  const [shsGradYear, setShsGradYear] = useState("");
  const [shsAddress, setShsAddress] = useState("");

  const [collegeSchool, setCollegeSchool] = useState("");
  const [collegeDegree, setCollegeDegree] = useState("");
  const [collegeGradYear, setCollegeGradYear] = useState("");
  const [collegeAddress, setCollegeAddress] = useState("");

  const [vocationalSchool, setVocationalSchool] = useState("");
  const [vocationalCourse, setVocationalCourse] = useState("");
  const [vocationalGradYear, setVocationalGradYear] = useState("");

  const [postGradSchool, setPostGradSchool] = useState("");
  const [postGradCourse, setPostGradCourse] = useState("");
  const [postGradGradYear, setPostGradGradYear] = useState("");

  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [customCert, setCustomCert] = useState("");
  const [trainingsAttended, setTrainingsAttended] = useState("");

  // 5️⃣ Section 5: Work Readiness Questions
  const [isVaccinated, setIsVaccinated] = useState("Yes");
  const [isComfortableOnsite, setIsComfortableOnsite] = useState("Yes");
  const [isGraveyardWilling, setIsGraveyardWilling] = useState("Yes");
  const [employmentPreference, setEmploymentPreference] = useState("Full-time");
  const [hasRemoteAccess, setHasRemoteAccess] = useState("Yes");
  const [isDrugTestWilling, setIsDrugTestWilling] = useState("Yes");
  const [isBgcWilling, setIsBgcWilling] = useState("Yes");

  // 6️⃣ Section 6: References
  const [ref1Name, setRef1Name] = useState("");
  const [ref1Phone, setRef1Phone] = useState("");
  const [ref2Name, setRef2Name] = useState("");
  const [ref2Phone, setRef2Phone] = useState("");
  const [ref3Name, setRef3Name] = useState("");
  const [ref3Phone, setRef3Phone] = useState("");

  // 7️⃣ Section 7: Audio & File Upload
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [supportingFile, setSupportingFile] = useState<File | null>(null);

  // 8️⃣ Section 8: Remarks
  const [recruiterRemarks, setRecruiterRemarks] = useState("");

  // 9️⃣ Section 9: Terms & Privacy Consent
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // Error/Validation State
  const [validationError, setValidationError] = useState<string | null>(null);

  // File Input Refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Source Checkbox Handler
  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  // Certification Checkbox Handler
  const toggleCertification = (cert: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  // Add Work Experience Row
  const handleAddWorkExp = () => {
    setWorkExpList((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        position: "",
        company: "",
        industry: "BPO / Call Center",
        monthlySalary: "",
        tenure: "",
        reasonForLeaving: ""
      }
    ]);
  };

  // Update Work Experience Row
  const handleUpdateWorkExp = (id: string, field: keyof WorkExpItem, val: string) => {
    setWorkExpList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Remove Work Experience Row
  const handleRemoveWorkExp = (id: string) => {
    setWorkExpList((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset Form
  const handleResetForm = () => {
    setSelectedSources([]);
    setReferrerName("");
    setReferrerId("");
    setAppliedPosition("Healthcare Support Specialist");
    setNickname("");
    setLocation("Davao City Site");

    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSuffix("");
    setDob("");
    setEmail("");
    setPhone1("");
    setPhone2("");
    setAddress("");

    setWorkExpCategory("With Work Experience");
    setWorkExpList([
      {
        id: "exp-1",
        position: "",
        company: "",
        industry: "BPO / Call Center",
        monthlySalary: "",
        tenure: "",
        reasonForLeaving: ""
      }
    ]);

    setEducationalAttainment("College Graduate");
    setElementarySchool("");
    setElementaryGradYear("");
    setElementaryAddress("");
    setHighSchool("");
    setHighSchoolGradYear("");
    setHighSchoolAddress("");
    setShsStrand("STEM");
    setShsSchool("");
    setShsGradYear("");
    setShsAddress("");
    setCollegeSchool("");
    setCollegeDegree("");
    setCollegeGradYear("");
    setCollegeAddress("");
    setVocationalSchool("");
    setVocationalCourse("");
    setVocationalGradYear("");
    setPostGradSchool("");
    setPostGradCourse("");
    setPostGradGradYear("");

    setSelectedCertifications([]);
    setCustomCert("");
    setTrainingsAttended("");

    setIsVaccinated("Yes");
    setIsComfortableOnsite("Yes");
    setIsGraveyardWilling("Yes");
    setEmploymentPreference("Full-time");
    setHasRemoteAccess("Yes");
    setIsDrugTestWilling("Yes");
    setIsBgcWilling("Yes");

    setRef1Name("");
    setRef1Phone("");
    setRef2Name("");
    setRef2Phone("");
    setRef3Name("");
    setRef3Phone("");

    setAudioFile(null);
    setSupportingFile(null);
    setRecruiterRemarks("");
    setPrivacyConsent(false);
    setValidationError(null);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form Validations
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError("First Name and Last Name are required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please enter a valid candidate email address.");
      return;
    }
    if (!phone1.trim()) {
      setValidationError("Primary Mobile Phone (Phone 1) is required.");
      return;
    }
    if (!address.trim()) {
      setValidationError("Complete Physical Address is required.");
      return;
    }
    if (!dob) {
      setValidationError("Date of Birth is required.");
      return;
    }
    if (selectedSources.length === 0) {
      setValidationError("Please select at least one Application Source.");
      return;
    }
    if (!privacyConsent) {
      setValidationError("You must confirm the Terms & Privacy Consent checkbox before saving.");
      return;
    }

    // Construct Full Name
    const fullName = `${firstName.trim()} ${middleName.trim() ? middleName.trim() + " " : ""}${lastName.trim()}${
      suffix.trim() ? " " + suffix.trim() : ""
    }`;

    // Construct Skills / Certifications list
    const combinedCerts = [...selectedCertifications];
    if (selectedCertifications.includes("Other") && customCert.trim()) {
      combinedCerts.push(customCert.trim());
    }

    const primarySource = selectedSources.join(", ");

    const newCandidate: Candidate = {
      id: `SIBS-CAN-9${Math.floor(1000 + Math.random() * 9000)}`,
      name: fullName,
      email: email.trim(),
      phone: phone1.trim(),
      appliedPosition: appliedPosition,
      department:
        appliedPosition.includes("Healthcare")
          ? "Healthcare & Life Sciences"
          : appliedPosition.includes("Technical") || appliedPosition.includes("IT")
          ? "Information Technology & Telecom"
          : appliedPosition.includes("Financial")
          ? "Financial Services & Banking"
          : "Customer Experience Operations",
      accountFit: `${appliedPosition} Wave 1`,
      sourcingChannel: primarySource,
      recruiter: userEmail || "Alena Batacan",
      applicationDate: new Date().toISOString().split("T")[0],
      status: "Silver Pool",
      isPublicEntry: false,
      lastActivityDate: new Date().toISOString().split("T")[0],
      notes: recruiterRemarks || "Registered into master Talent Pool database.",

      address: address.trim(),
      dob: dob,
      age: dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 25,
      gender: "Not Specified",
      civilStatus: "Single",
      citizenship: "Filipino",

      workExperience: workExpCategory === "No Experience / Fresh Grad" ? [] : workExpList.map(w => ({
        company: w.company || "Previous Company",
        position: w.position || "Staff Specialist",
        industry: w.industry,
        tenure: w.tenure || "1 Year",
        monthlySalary: w.monthlySalary ? `₱${w.monthlySalary}` : "₱20,000",
        reasonForLeaving: w.reasonForLeaving || "Career Growth"
      })),

      education: [
        {
          level: (educationalAttainment || "College") as any,
          schoolName: collegeSchool || highSchool || elementarySchool || "Educational Institution",
          degreeCourse: collegeDegree || "General High School Curriculum",
          gradYear: collegeGradYear || highSchoolGradYear || "2022",
          address: collegeAddress || highSchoolAddress || address
        }
      ],

      skills: combinedCerts.length > 0 ? combinedCerts : ["BPO Fundamentals", "Customer Communication"],
      languages: ["English (Fluent)", "Filipino"],

      hasVoiceRecording: !!audioFile,
      audioFileName: audioFile ? audioFile.name : undefined,
      resumeFileName: supportingFile ? supportingFile.name : "Candidate_Profile_CV.pdf",

      characterReferences: [
        {
          name: ref1Name || "Reference 1",
          company: "Previous Employer",
          title: "Manager / Supervisor",
          contactNumber: ref1Phone || phone1,
          email: "reference1@company.com"
        },
        ...(ref2Name ? [{
          name: ref2Name,
          company: "Previous Employer",
          title: "Senior Colleague",
          contactNumber: ref2Phone,
          email: "reference2@company.com"
        }] : []),
        ...(ref3Name ? [{
          name: ref3Name,
          company: "Educational Institution",
          title: "Professor / Mentor",
          contactNumber: ref3Phone,
          email: "reference3@company.com"
        }] : [])
      ],

      assessmentStatus: "Pending",
      testScore: "Pending Initial Evaluation",

      history: [
        {
          date: new Date().toISOString().split("T")[0],
          action: `Master candidate profile created via Add Candidate Modal (${primarySource})`,
          user: userEmail || "Alena Batacan"
        }
      ]
    };

    onSaveCandidate(newCandidate);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#042C51]/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl my-6 flex flex-col max-h-[92vh] overflow-hidden text-[#101828]"
        >
          {/* ==================== 1. MODAL HEADER ==================== */}
          <div className="bg-[#042C51] text-white p-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#063a6b] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-[#FF5C28] flex items-center justify-center shadow-inner shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Add Candidate</span>
                  <span className="text-[10px] bg-[#FF5C28] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Registration
                  </span>
                </h2>
                <p className="text-xs text-slate-300 leading-snug">
                  Create a reusable candidate master dossier for the Talent Pool with sourcing and profile records.
                </p>
              </div>
            </div>

            {/* Modal Header Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                title="Reset all form fields to initial clean state"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-1.5 bg-[#FF5C28] hover:bg-[#e04f20] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-orange-400/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Candidate</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer ml-1"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE MODAL BODY */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
            {/* ==================== 2. INFORMATION BANNER ==================== */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 p-4 rounded-xl border border-blue-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-[#042C51] flex items-center gap-2">
                    <span>Candidate Dossier Registration Standard</span>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                      Talent Pool Sync
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Provide sourcing channels, contact information, work history, academic background, and shift readiness details to register a complete candidate profile into the master pool.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <span className="bg-[#042C51] text-white text-[11px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
                  New Candidate Profile
                </span>
              </div>
            </div>

            {/* Validation Alert Box */}
            {validationError && (
              <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-800 font-bold border border-rose-200 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1️⃣ Application Source and Position */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#FF5C28]" />
                Section 1: Application Source & Position Alignment
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Sourcing & Metadata</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Specify where the applicant learned about SiBS and their target position alignment.
            </p>

            {/* How did the applicant first hear about us? (Multi-select Checkboxes) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#042C51] mb-1">
                How did the applicant first hear about us? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {SOURCING_CHANNELS.map((source) => {
                  const isChecked = selectedSources.includes(source);
                  return (
                    <label
                      key={source}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? "bg-blue-50/80 border-[#042C51] text-[#042C51] font-bold shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSource(source)}
                        className="mt-0.5 rounded text-[#042C51] focus:ring-[#042C51]"
                      />
                      <span>{source}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Conditional Referral Inputs */}
            {selectedSources.includes("Employee Referral Program") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    Referrer Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={referrerName}
                    onChange={(e) => setReferrerName(e.target.value)}
                    placeholder="e.g. John Mark Dela Cruz"
                    className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 focus:border-[#042C51] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    Referrer Contact Number / Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={referrerId}
                    onChange={(e) => setReferrerId(e.target.value)}
                    placeholder="e.g. EMP-2025-0891 / 09171234567"
                    className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 focus:border-[#042C51] outline-hidden"
                  />
                </div>
              </motion.div>
            )}

            {/* Position, Nickname, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  Check open positions <span className="text-red-500">*</span>
                </label>
                <select
                  value={appliedPosition}
                  onChange={(e) => setAppliedPosition(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all cursor-pointer"
                >
                  {OPEN_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">Preferred Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  Target Work Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all cursor-pointer"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2️⃣ Personal Information */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#FF5C28]" />
                Section 2: Personal Information & Contact
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Applicant Identity</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Enter applicant legal name, contact numbers, and physical residence address.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Maria"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#042C51] mb-1">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Clara"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Santos"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#042C51] mb-1">Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="e.g. Jr., Sr., III"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  Phone 1 (Primary Mobile) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  placeholder="09171234567"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">Phone 2 (Secondary Mobile)</label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  placeholder="09289876543 (Optional)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  Complete Physical Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No., Street, Barangay, City, Province"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3️⃣ Work Experience */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Section 3: Work Experience History
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Employment Record</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Select work experience tenure or add past employment detail cards.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#042C51] mb-1">
                Work Experience Category <span className="text-red-500">*</span>
              </label>
              <select
                value={workExpCategory}
                onChange={(e) => setWorkExpCategory(e.target.value)}
                className="w-full max-w-md px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all cursor-pointer"
              >
                <option value="No Experience / Fresh Grad">No Experience / Fresh Grad</option>
                <option value="With Work Experience">With Work Experience</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="5+ Years">5+ Years</option>
              </select>
            </div>

            {/* Dynamic Experience Cards */}
            {workExpCategory !== "No Experience / Fresh Grad" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#042C51] uppercase">
                    Past Employment Cards ({workExpList.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddWorkExp}
                    className="px-3 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Work Experience</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {workExpList.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative"
                    >
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-black bg-blue-100 text-[#042C51] px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                          Experience #{index + 1}
                        </span>
                        {workExpList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWorkExp(item.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Remove Experience"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#042C51] mb-1">
                            Role / Position Title
                          </label>
                          <input
                            type="text"
                            value={item.position}
                            onChange={(e) => handleUpdateWorkExp(item.id, "position", e.target.value)}
                            placeholder="e.g. Customer Care Specialist"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#042C51] mb-1">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(e) => handleUpdateWorkExp(item.id, "company", e.target.value)}
                            placeholder="e.g. Teleperformance PH"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#042C51] mb-1">Industry</label>
                          <select
                            value={item.industry}
                            onChange={(e) => handleUpdateWorkExp(item.id, "industry", e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden cursor-pointer"
                          >
                            <option value="BPO / Call Center">BPO / Call Center</option>
                            <option value="Healthcare & Nursing">Healthcare & Nursing</option>
                            <option value="Financial Services & Banking">Financial Services & Banking</option>
                            <option value="IT & Software Development">IT & Software Development</option>
                            <option value="Retail & Sales">Retail & Sales</option>
                            <option value="Education & Training">Education & Training</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#042C51] mb-1">
                            Monthly Compensation (PHP)
                          </label>
                          <input
                            type="text"
                            value={item.monthlySalary}
                            onChange={(e) => handleUpdateWorkExp(item.id, "monthlySalary", e.target.value)}
                            placeholder="e.g. 25000"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#042C51] mb-1">
                            Length of Work Experience
                          </label>
                          <input
                            type="text"
                            value={item.tenure}
                            onChange={(e) => handleUpdateWorkExp(item.id, "tenure", e.target.value)}
                            placeholder="e.g. 2 years 6 months"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#042C51] mb-1">
                            Reason for Leaving
                          </label>
                          <input
                            type="text"
                            value={item.reasonForLeaving}
                            onChange={(e) => handleUpdateWorkExp(item.id, "reasonForLeaving", e.target.value)}
                            placeholder="e.g. Career advancement"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4️⃣ Education, Affiliations, and Training */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                Section 4: Education, Certifications & Training
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Academic & Qualifications</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Select educational attainment and complete school, certification, and seminar details.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#042C51] mb-1">
                Highest Educational Attainment <span className="text-red-500">*</span>
              </label>
              <select
                value={educationalAttainment}
                onChange={(e) => setEducationalAttainment(e.target.value)}
                className="w-full max-w-md px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all cursor-pointer"
              >
                <option value="High School">High School</option>
                <option value="Senior High">Senior High</option>
                <option value="College Undergraduate">College Undergraduate</option>
                <option value="College Graduate">College Graduate</option>
                <option value="Vocational">Vocational</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate Degree">Doctorate Degree</option>
              </select>
            </div>

            {/* Dynamic Academic Cards based on Attainment */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                Academic Details ({educationalAttainment})
              </h4>

              {/* High School details */}
              {(educationalAttainment === "High School" || educationalAttainment === "Senior High") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      High School Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={highSchool}
                      onChange={(e) => setHighSchool(e.target.value)}
                      placeholder="e.g. Davao City National High School"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Year Graduated <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={highSchoolGradYear}
                      onChange={(e) => setHighSchoolGradYear(e.target.value)}
                      placeholder="e.g. 2018"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">School Address</label>
                    <input
                      type="text"
                      value={highSchoolAddress}
                      onChange={(e) => setHighSchoolAddress(e.target.value)}
                      placeholder="e.g. F. Torres St, Davao City"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Senior High Strand if SHS */}
              {educationalAttainment === "Senior High" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Senior High School Strand <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={shsStrand}
                      onChange={(e) => setShsStrand(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden cursor-pointer"
                    >
                      <option value="STEM">STEM (Science, Tech, Engineering, Math)</option>
                      <option value="ABM">ABM (Accountancy, Business, Management)</option>
                      <option value="HUMSS">HUMSS (Humanities & Social Sciences)</option>
                      <option value="GAS">GAS (General Academic Strand)</option>
                      <option value="TVL">TVL (Technical-Vocational-Livelihood)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* College details */}
              {(educationalAttainment === "College Undergraduate" || educationalAttainment === "College Graduate" || educationalAttainment === "Master's Degree" || educationalAttainment === "Doctorate Degree") && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      College / University <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={collegeSchool}
                      onChange={(e) => setCollegeSchool(e.target.value)}
                      placeholder="e.g. San Pedro College"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Course / Degree <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={collegeDegree}
                      onChange={(e) => setCollegeDegree(e.target.value)}
                      placeholder="e.g. BS Nursing / BS MedTech"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Year Graduated <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={collegeGradYear}
                      onChange={(e) => setCollegeGradYear(e.target.value)}
                      placeholder="e.g. 2022"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">School Address</label>
                    <input
                      type="text"
                      value={collegeAddress}
                      onChange={(e) => setCollegeAddress(e.target.value)}
                      placeholder="Davao City"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Vocational details */}
              {educationalAttainment === "Vocational" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Vocational School <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vocationalSchool}
                      onChange={(e) => setVocationalSchool(e.target.value)}
                      placeholder="e.g. TESDA Regional Center"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Vocational Course <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vocationalCourse}
                      onChange={(e) => setVocationalCourse(e.target.value)}
                      placeholder="e.g. Computer Hardware Servicing"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">Year Completed</label>
                    <input
                      type="text"
                      value={vocationalGradYear}
                      onChange={(e) => setVocationalGradYear(e.target.value)}
                      placeholder="e.g. 2021"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Master's / Doctorate details */}
              {(educationalAttainment === "Master's Degree" || educationalAttainment === "Doctorate Degree") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Post-Grad Graduate School <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={postGradSchool}
                      onChange={(e) => setPostGradSchool(e.target.value)}
                      placeholder="e.g. Ateneo de Manila Graduate School"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">Master / Doctorate Program</label>
                    <input
                      type="text"
                      value={postGradCourse}
                      onChange={(e) => setPostGradCourse(e.target.value)}
                      placeholder="e.g. Master in Business Administration"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">Completion Year</label>
                    <input
                      type="text"
                      value={postGradGradYear}
                      onChange={(e) => setPostGradGradYear(e.target.value)}
                      placeholder="e.g. 2025"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Affiliations & Certifications (Checkboxes) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#042C51] mb-1">
                Affiliations and Certifications
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {CERTIFICATIONS_LIST.map((cert) => {
                  const isChecked = selectedCertifications.includes(cert);
                  return (
                    <label
                      key={cert}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? "bg-purple-50/80 border-purple-600 text-purple-900 font-bold shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCertification(cert)}
                        className="rounded text-purple-600 focus:ring-purple-600"
                      />
                      <span>{cert}</span>
                    </label>
                  );
                })}
              </div>

              {selectedCertifications.includes("Other") && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={customCert}
                    onChange={(e) => setCustomCert(e.target.value)}
                    placeholder="Specify custom license or certification (e.g. US RN License / CompTIA A+)"
                    className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-800 focus:border-[#042C51] outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Training Attended */}
            <div>
              <label className="block text-xs font-bold text-[#042C51] mb-1">Training Attended</label>
              <textarea
                rows={2}
                value={trainingsAttended}
                onChange={(e) => setTrainingsAttended(e.target.value)}
                placeholder="List seminars, workshops, professional training programs attended..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden leading-normal"
              />
            </div>
          </div>

          {/* 5️⃣ Work Readiness Questions */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Section 5: Work Readiness & Compliance Questions
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Shift & Compliance Setup</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Review work setup, shift flexibility, and compliance readiness options.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Are you fully vaccinated? */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-[#042C51]">
                  Are you fully vaccinated? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="vac"
                      value="Yes"
                      checked={isVaccinated === "Yes"}
                      onChange={(e) => setIsVaccinated(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="vac"
                      value="No"
                      checked={isVaccinated === "No"}
                      onChange={(e) => setIsVaccinated(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Comfortable on site? */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-[#042C51]">
                  Are you comfortable working on site? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="onsite"
                      value="Yes"
                      checked={isComfortableOnsite === "Yes"}
                      onChange={(e) => setIsComfortableOnsite(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="onsite"
                      value="No"
                      checked={isComfortableOnsite === "No"}
                      onChange={(e) => setIsComfortableOnsite(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Willing to work graveyard shift? */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-[#042C51]">
                  Are you willing to work in graveyard shift? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="grave"
                      value="Yes"
                      checked={isGraveyardWilling === "Yes"}
                      onChange={(e) => setIsGraveyardWilling(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="grave"
                      value="No"
                      checked={isGraveyardWilling === "No"}
                      onChange={(e) => setIsGraveyardWilling(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Full-time, part-time, or either? */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-[#042C51]">
                  Employment Preference <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  {["Full-time", "Part-time", "Either"].map((pref) => (
                    <label key={pref} className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 text-xs">
                      <input
                        type="radio"
                        name="empPref"
                        value={pref}
                        checked={employmentPreference === pref}
                        onChange={(e) => setEmploymentPreference(e.target.value)}
                        className="text-[#042C51] focus:ring-[#042C51]"
                      />
                      <span>{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remote work access? */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold text-[#042C51]">
                  If remote, do you have access to a computer, high-speed Internet, and private workspace? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="remote"
                      value="Yes"
                      checked={hasRemoteAccess === "Yes"}
                      onChange={(e) => setHasRemoteAccess(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="remote"
                      value="No"
                      checked={hasRemoteAccess === "No"}
                      onChange={(e) => setHasRemoteAccess(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Willing to undertake drug test? */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-[#042C51]">
                  Willing to undergo drug screening test? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="drug"
                      value="Yes"
                      checked={isDrugTestWilling === "Yes"}
                      onChange={(e) => setIsDrugTestWilling(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="drug"
                      value="No"
                      checked={isDrugTestWilling === "No"}
                      onChange={(e) => setIsDrugTestWilling(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Willing to allow SiBS background check? */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-[#042C51]">
                  Willing to undergo background check? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="bgc"
                      value="Yes"
                      checked={isBgcWilling === "Yes"}
                      onChange={(e) => setIsBgcWilling(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="bgc"
                      value="No"
                      checked={isBgcWilling === "No"}
                      onChange={(e) => setIsBgcWilling(e.target.value)}
                      className="text-[#042C51] focus:ring-[#042C51]"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 6️⃣ References */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Section 6: Character & Professional References
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Background Verification</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Provide contact details for three professional character references.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Reference 1 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black bg-blue-100 text-[#042C51] px-2.5 py-0.5 rounded-full border border-blue-200 uppercase block w-fit">
                  Reference 1 <span className="text-red-500">*</span>
                </span>
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={ref1Name}
                    onChange={(e) => setRef1Name(e.target.value)}
                    placeholder="e.g. Dr. Roberto Santos"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={ref1Phone}
                    onChange={(e) => setRef1Phone(e.target.value)}
                    placeholder="09178889900"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Reference 2 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black bg-blue-100 text-[#042C51] px-2.5 py-0.5 rounded-full border border-blue-200 uppercase block w-fit">
                  Reference 2 <span className="text-red-500">*</span>
                </span>
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={ref2Name}
                    onChange={(e) => setRef2Name(e.target.value)}
                    placeholder="e.g. Prof. Angela Reyes"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={ref2Phone}
                    onChange={(e) => setRef2Phone(e.target.value)}
                    placeholder="09201112233"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Reference 3 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black bg-blue-100 text-[#042C51] px-2.5 py-0.5 rounded-full border border-blue-200 uppercase block w-fit">
                  Reference 3 <span className="text-red-500">*</span>
                </span>
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={ref3Name}
                    onChange={(e) => setRef3Name(e.target.value)}
                    placeholder="e.g. Engr. Mark Tan"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={ref3Phone}
                    onChange={(e) => setRef3Phone(e.target.value)}
                    placeholder="09187776655"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 7️⃣ Audio and File Upload */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF5C28]" />
                Section 7: Audio Assessment & File Uploads
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Media & Attachments</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Upload candidate voice sample recording and supporting resume or portfolio documents.
            </p>

            {/* Audio Prompt Guide Box */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/80 text-xs space-y-1.5">
              <span className="font-black text-[#042C51] flex items-center gap-1.5 uppercase text-[10px]">
                <Info className="w-4 h-4 text-[#FF5C28]" />
                Voice Screening Audio Prompt Guide
              </span>
              <p className="text-slate-700 font-medium text-xs">
                The candidate audio recording may address the following screening topics:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 pl-1 font-medium">
                <li>Why did you apply for this position at SiBS?</li>
                <li>What key strengths do you bring to our team?</li>
                <li>How does this role align with your long-term career goals?</li>
                <li>How did you hear about this opportunity?</li>
              </ul>
            </div>

            {/* Upload Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Single Audio File */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-[#FF5C28]" />
                  Upload Audio Recording
                </span>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.mp4,.flac,.amr,.3gp,.opus,.aiff,.caf,.wma"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAudioFile(e.target.files[0]);
                    }
                  }}
                />
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#FF5C28] p-5 rounded-xl text-center cursor-pointer transition-colors bg-white hover:bg-orange-50/30 flex flex-col items-center justify-center space-y-1"
                >
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold text-[#042C51]">
                    {audioFile ? audioFile.name : "Drag & drop or click to upload audio"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    MP3, WAV, M4A, AAC, OGG, WEBM, FLAC
                  </span>
                </div>
                {audioFile && (
                  <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Attached: {audioFile.name} ({Math.round(audioFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              {/* Upload Supporting File */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Upload Resume / Portfolio
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSupportingFile(e.target.files[0]);
                    }
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-600 p-5 rounded-xl text-center cursor-pointer transition-colors bg-white hover:bg-blue-50/30 flex flex-col items-center justify-center space-y-1"
                >
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold text-[#042C51]">
                    {supportingFile ? supportingFile.name : "Drag & drop or click to upload file"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    PDF, DOC/DOCX, XLS/CSV, JPG, PNG
                  </span>
                </div>
                {supportingFile && (
                  <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Attached: {supportingFile.name} ({Math.round(supportingFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 8️⃣ Remarks */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5C28]" />
                Section 8: Recruiter Remarks & Observations
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Internal Recruiter Notes</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Optional internal recruiter notes, initial screening remarks, or SVAR speech observation notes.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#042C51] mb-1">
                Candidate Notes & Screening Observations
              </label>
              <textarea
                rows={3}
                value={recruiterRemarks}
                onChange={(e) => setRecruiterRemarks(e.target.value)}
                placeholder="Enter recruiter notes, screening remarks, SVAR audio observations, or special considerations..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden leading-normal"
              />
            </div>
          </div>

          {/* 9️⃣ Terms & Privacy Consent */}
          <div className="bg-[#FFF0EB] p-5 rounded-2xl border border-orange-200/80 shadow-xs space-y-2">
            <div className="flex items-start gap-3">
              <input
                id="privacyConsent"
                type="checkbox"
                required
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#FF5C28] rounded border-orange-300 focus:ring-[#FF5C28] cursor-pointer"
              />
              <label htmlFor="privacyConsent" className="text-xs text-[#042C51] font-extrabold cursor-pointer leading-relaxed">
                I agree to terms & conditions provided by the company. By providing candidate phone number and details, I confirm that the candidate agreed to the collection and use of these details for recruitment processing. <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          {/* ==================== 3. MODAL FOOTER ==================== */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">
              Clicking <strong>Save Candidate</strong> registers the candidate profile into the Talent Pool database.
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reset Form
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#FF5C28] hover:bg-[#e04f20] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Candidate</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  </div>
</AnimatePresence>
);
}
