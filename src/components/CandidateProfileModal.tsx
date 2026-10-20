import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Heart,
  GraduationCap,
  Award,
  Briefcase,
  BookOpen,
  Sparkles,
  Phone,
  FileCheck2,
  FileText,
  Lock,
  Edit3,
  Check,
  Calendar,
  MapPin,
  FileCheck,
  Send,
  RefreshCw,
  MoreVertical,
  Upload,
  Download,
  Trash2,
  Plus,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  Sparkles as SparkleIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate } from "./TalentPool";

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onUpdateCandidate?: (updatedCandidate: Candidate) => void;
  onMoveToPipeline?: (candidate: Candidate) => void;
  onChangeStatus?: (candidate: Candidate) => void;
}

export default function CandidateProfileModal({
  isOpen,
  onClose,
  candidate,
  onUpdateCandidate,
  onMoveToPipeline,
  onChangeStatus
}: CandidateProfileModalProps) {
  const [activeTab, setActiveTab] = useState("Personal");
  const [activeSubtopic, setActiveSubtopic] = useState("Basic Info");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState<Candidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dossierNotesDraft, setDossierNotesDraft] = useState("");

  useEffect(() => {
    if (candidate) {
      setEditedCandidate({ ...candidate });
      setDossierNotesDraft(candidate.notes || "");
      setIsEditing(false);
      setActiveTab("Personal");
      setActiveSubtopic("Basic Info");
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const currentData = editedCandidate || candidate;

  // Split name into components if available
  const nameParts = currentData.name.split(" ");
  const lastNameGuess = nameParts.length > 1 ? nameParts[nameParts.length - 1] : currentData.name;
  const firstNameGuess = nameParts.length > 1 ? nameParts.slice(0, nameParts.length - 1).join(" ") : currentData.name;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFieldChange = (field: keyof Candidate, value: any) => {
    if (!editedCandidate) return;
    setEditedCandidate({
      ...editedCandidate,
      [field]: value
    });
  };

  const saveProfileData = () => {
    if (editedCandidate && onUpdateCandidate) {
      onUpdateCandidate(editedCandidate);
    }
    setIsEditing(false);
    showToast("Candidate Dossier records updated successfully!");
  };

  const cancelEditing = () => {
    setEditedCandidate({ ...candidate });
    setIsEditing(false);
    showToast("Editing cancelled. Retained original candidate record.");
  };

  const handleSaveNotes = () => {
    if (editedCandidate) {
      const updated = { ...editedCandidate, notes: dossierNotesDraft };
      setEditedCandidate(updated);
      if (onUpdateCandidate) onUpdateCandidate(updated);
      showToast("Private candidate notes saved into dossier.");
    }
  };

  // Main Tabs Configuration
  const tabs = [
    { id: "Personal", label: "Personal Info", icon: User },
    { id: "Family", label: "Family / Kin", icon: Heart },
    { id: "Education", label: "Education", icon: GraduationCap },
    { id: "Eligibility", label: "Credentials", icon: Award },
    { id: "Experience", label: "Experience", icon: Briefcase },
    { id: "Training", label: "Trainings", icon: BookOpen },
    { id: "Skills", label: "Skills / Awards", icon: SparkleIcon },
    { id: "References", label: "References", icon: Phone },
    { id: "Application", label: "Application & HR", icon: FileCheck2 },
    { id: "Documents", label: "Documents", icon: FileText },
    { id: "Notes", label: "Dossier Notes", icon: Lock }
  ];

  // Subtopics mapping for Personal & Application tabs
  const getSubtopics = (tabId: string) => {
    switch (tabId) {
      case "Personal":
        return ["Basic Info", "Contact", "Address", "Government IDs"];
      case "Application":
        return ["Overview", "Assessment & Readiness", "Status History"];
      default:
        return [];
    }
  };

  const subtopics = getSubtopics(activeTab);

  return (
    <div className="fixed inset-0 bg-[#042C51]/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto select-none">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden my-auto text-slate-900 flex flex-col max-h-[92vh] relative"
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 right-14 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-emerald-500 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Top Header Bar */}
        <div className="p-3.5 bg-[#042C51] text-white flex items-center justify-between border-b border-blue-900 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#FF5C28] text-white rounded-lg shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-tight uppercase">Talent Pool Candidate Profile</h2>
              <p className="text-[10px] text-blue-200 font-medium">
                Comprehensive 201 filing and talent screening dossier record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-900 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Close Candidate Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* ==================== 1. COMPACT CANDIDATE SUMMARY HEADER ==================== */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6ECF2] shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#042C51] via-[#FF5C28] to-[#042C51]"></div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4 mt-1">
              {/* Main Candidate Info Block */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#042C51] to-[#084782] flex items-center justify-center text-white text-xl font-black shadow-md relative shrink-0">
                  {currentData.name.charAt(0)}
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"
                    title={`Status: ${currentData.status}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-base sm:text-lg font-black text-[#042C51] tracking-tight">
                      {lastNameGuess.toUpperCase()}, {firstNameGuess}
                    </h2>
                    <span className="px-2.5 py-0.5 text-[9.5px] font-black uppercase bg-[#FF5C28] text-white rounded-full flex items-center gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                      {currentData.status}
                    </span>
                    <span className="px-2.5 py-0.5 text-[9.5px] font-black uppercase bg-[#E9F0FC] text-[#042C51] border border-blue-100 rounded-full font-mono">
                      {currentData.id}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#FF5C28] mt-0.5">
                    {currentData.appliedPosition}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[10.5px] text-[#667085] font-semibold mt-1.5">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[#042C51]" /> {currentData.department}
                    </span>
                    <span className="hidden md:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#042C51]" /> Applied: {currentData.applicationDate}
                    </span>
                    <span className="hidden md:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-[#042C51]" /> Fit: {currentData.accountFit}
                    </span>
                    <span className="hidden md:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#042C51]" /> {currentData.address || "Davao Site"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={saveProfileData}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Record</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#667085] rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#042C51] hover:bg-[#083e70] text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#FF5C28]" />
                      <span>Edit Profile Record</span>
                    </button>

                    {onMoveToPipeline && (
                      <button
                        type="button"
                        onClick={() => {
                          onMoveToPipeline(currentData);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Move to Pipeline</span>
                      </button>
                    )}

                    {onChangeStatus && (
                      <button
                        type="button"
                        onClick={() => {
                          onChangeStatus(currentData);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Status</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ==================== 2. REDESIGNED PROFILE NAVIGATION ==================== */}
          <div className="bg-white p-2.5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-2">
            {/* Main Tabs Strip */}
            <div className="flex items-center overflow-x-auto gap-1 pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              {tabs.map((t) => {
                const IconComp = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTab(t.id);
                      const subs = getSubtopics(t.id);
                      setActiveSubtopic(subs.length > 0 ? subs[0] : "");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#042C51] text-white shadow-xs"
                        : "text-[#667085] hover:bg-slate-100 hover:text-[#042C51]"
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-[#FF5C28]" : "text-slate-400"}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Subsections Pills Row (if applicable) */}
            {subtopics.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold">
                <span className="text-slate-400 uppercase text-[9.5px] tracking-wider pl-1 font-black">
                  Subsections:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {subtopics.map((sub) => {
                    const isSubActive = activeSubtopic === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setActiveSubtopic(sub)}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          isSubActive
                            ? "bg-[#042C51] text-white font-black shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ==================== 3. MAIN CONTENT DOSSIER CARD (FULL WIDTH) ==================== */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-5">
            {/* Subsection Header */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <span>{activeTab.toUpperCase()}</span>
                  {activeSubtopic && (
                    <>
                      <span className="text-slate-300">&gt;</span>
                      <span className="text-[#FF5C28]">{activeSubtopic.toUpperCase()}</span>
                    </>
                  )}
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
                  {isEditing
                    ? "Edit mode enabled. Modify candidate record values and click Save."
                    : "Secure read-only state. Values shown as recorded in Talent Pool database."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#042C51] text-[9.5px] font-black uppercase border border-blue-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#042C51] block"></span>
                  Official Dossier Record
                </span>
              </div>
            </div>

            {/* TAB CONTENT IMPLEMENTATIONS */}

            {/* TAB 1: PERSONAL INFO */}
            {activeTab === "Personal" && (
              <div className="space-y-4">
                {activeSubtopic === "Basic Info" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <FieldBox
                      label="FIRST NAME"
                      value={currentData.name.split(" ")[0]}
                      isEditing={isEditing}
                      onChange={(val) => handleFieldChange("name", `${val} ${currentData.name.split(" ").slice(1).join(" ")}`)}
                    />
                    <FieldBox
                      label="MIDDLE NAME"
                      value="Mendoza"
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="LAST NAME"
                      value={lastNameGuess}
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="NAME EXTENSION (JR/III)"
                      value="—"
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="PREFERRED NAME"
                      value={currentData.name.split(" ")[0]}
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="BIRTH DATE"
                      value={currentData.dob || "1998-05-14"}
                      isEditing={isEditing}
                      onChange={(val) => handleFieldChange("dob", val)}
                      type="date"
                    />
                    <FieldBox
                      label="PLACE OF BIRTH"
                      value="Davao City, Philippines"
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="GENDER"
                      value={currentData.gender || "Female"}
                      isEditing={isEditing}
                      onChange={(val) => handleFieldChange("gender", val)}
                    />
                    <FieldBox
                      label="CIVIL STATUS"
                      value={currentData.civilStatus || "Single"}
                      isEditing={isEditing}
                      onChange={(val) => handleFieldChange("civilStatus", val)}
                    />
                    <FieldBox
                      label="CITIZENSHIP"
                      value={currentData.citizenship || "Filipino"}
                      isEditing={isEditing}
                      onChange={(val) => handleFieldChange("citizenship", val)}
                    />
                    <FieldBox
                      label="BLOOD TYPE"
                      value="O+"
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="AGE"
                      value={`${currentData.age || 26} y/o`}
                      isEditing={isEditing}
                    />
                  </div>
                )}

                {activeSubtopic === "Contact" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <FieldBox
                      label="EMAIL ADDRESS"
                      value={currentData.email}
                      isEditing={isEditing}
                      onChange={(val) => handleFieldChange("email", val)}
                    />
                    <FieldBox
                      label="MOBILE NUMBER (PHONE 1)"
                      value={currentData.phone}
                      isEditing={isEditing}
                      onChange={(val) => handleFieldChange("phone", val)}
                    />
                    <FieldBox
                      label="SECONDARY MOBILE (PHONE 2)"
                      value="+63 928 987 6543"
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="TELEPHONE"
                      value="+63 82 221 4567"
                      isEditing={isEditing}
                    />
                  </div>
                )}

                {activeSubtopic === "Address" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldBox
                      label="RESIDENTIAL / PHYSICAL ADDRESS"
                      value={currentData.address || "Door 4, Santos Bldg, F. Torres St, Davao City"}
                      isEditing={isEditing}
                      onChange={(val) => handleFieldChange("address", val)}
                    />
                    <FieldBox
                      label="PERMANENT HOME ADDRESS"
                      value={currentData.address || "Door 4, Santos Bldg, F. Torres St, Davao City"}
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="TARGET WORK LOCATION"
                      value="Davao City Site"
                      isEditing={isEditing}
                    />
                    <FieldBox
                      label="WORK SETUP PREFERENCE"
                      value="Onsite / Hybrid"
                      isEditing={isEditing}
                    />
                  </div>
                )}

                {activeSubtopic === "Government IDs" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <FieldBox label="SSS NUMBER" value="34-5678901-2" isEditing={isEditing} />
                    <FieldBox label="PHILHEALTH NUMBER" value="12-003456789-4" isEditing={isEditing} />
                    <FieldBox label="PAG-IBIG MID NUMBER" value="1210-3456-7890" isEditing={isEditing} />
                    <FieldBox label="TIN NUMBER" value="123-456-789-000" isEditing={isEditing} />
                    <FieldBox label="GSIS NUMBER" value="N/A (Private)" isEditing={isEditing} />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FAMILY / KIN */}
            {activeTab === "Family" && (
              <div className="space-y-5 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-600" />
                    Emergency Contact Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <FieldBox label="CONTACT PERSON NAME" value="Elena Santos" isEditing={isEditing} />
                    <FieldBox label="RELATIONSHIP" value="Mother" isEditing={isEditing} />
                    <FieldBox label="PHONE NUMBER" value="+63 917 888 2233" isEditing={isEditing} />
                    <FieldBox label="EMAIL ADDRESS" value="elena.santos@gmail.com" isEditing={isEditing} />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-[#042C51] uppercase">Parents & Spouse Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FieldBox label="FATHER FULL NAME" value="Roberto Santos Sr." isEditing={isEditing} />
                    <FieldBox label="MOTHER MAIDEN NAME" value="Elena Mendoza" isEditing={isEditing} />
                    <FieldBox label="SPOUSE FULL NAME" value="N/A (Single)" isEditing={isEditing} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EDUCATION */}
            {activeTab === "Education" && (
              <div className="space-y-4 text-xs">
                <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Academic History Cards
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(currentData.education && currentData.education.length > 0
                    ? currentData.education
                    : [
                        {
                          level: "College" as const,
                          schoolName: "Ateneo de Davao University",
                          degreeCourse: "BS Nursing",
                          gradYear: "2020",
                          address: "E. Jacinto St, Davao City"
                        },
                        {
                          level: "High School" as const,
                          schoolName: "Davao City National High School",
                          degreeCourse: "STEM Strand",
                          gradYear: "2016",
                          address: "F. Torres St, Davao City"
                        }
                      ]
                  ).map((edu, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] font-black bg-blue-100 text-[#042C51] px-2.5 py-0.5 rounded uppercase">
                          {edu.level}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Graduated: {edu.gradYear}</span>
                      </div>
                      <h5 className="font-black text-[#042C51] text-xs">{edu.degreeCourse}</h5>
                      <p className="font-bold text-slate-700 text-[11px]">{edu.schoolName}</p>
                      <p className="text-slate-400 text-[10px]">{edu.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CREDENTIALS & LICENSES */}
            {activeTab === "Eligibility" && (
              <div className="space-y-4 text-xs">
                <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Professional Licenses, Certifications & Eligibility
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(currentData.licenses && currentData.licenses.length > 0
                    ? currentData.licenses
                    : [
                        {
                          title: "LPT (Licensed Professional Teacher)",
                          licenseNo: "PRC-0891234",
                          rating: "86.40%",
                          validity: "2028-11-23"
                        },
                        {
                          title: "Lean Six Sigma Yellow Belt",
                          licenseNo: "LSS-YB-2023-11",
                          rating: "Passed",
                          validity: "Lifetime"
                        }
                      ]
                  ).map((lic, idx) => (
                    <div key={idx} className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded uppercase">
                          Official License
                        </span>
                        <span className="text-[10px] text-amber-800 font-mono font-bold">No: {lic.licenseNo}</span>
                      </div>
                      <h5 className="font-black text-amber-950 text-xs">{lic.title}</h5>
                      <div className="flex justify-between text-[10.5px] text-amber-900 font-medium">
                        <span>Rating: <strong>{lic.rating}</strong></span>
                        <span>Validity: <strong>{lic.validity}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: WORK EXPERIENCE */}
            {activeTab === "Experience" && (
              <div className="space-y-4 text-xs">
                <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#FF5C28]" />
                  Past Employment History
                </h4>

                <div className="space-y-3">
                  {(currentData.workExperience && currentData.workExperience.length > 0
                    ? currentData.workExperience
                    : [
                        {
                          company: "Teleperformance PH",
                          position: "Customer Support Specialist",
                          industry: "BPO / Call Center",
                          tenure: "2 years 4 months",
                          monthlySalary: "₱24,000",
                          reasonForLeaving: "Career advancement in healthcare niche"
                        }
                      ]
                  ).map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex flex-wrap justify-between items-start gap-1">
                        <div>
                          <h5 className="font-black text-[#042C51] text-xs">{exp.position}</h5>
                          <p className="text-slate-700 font-bold text-[11px]">{exp.company} ({exp.industry})</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded font-bold text-[10px]">
                          {exp.tenure}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] pt-1 border-t border-slate-200/60 text-slate-600">
                        <div>Monthly Salary: <strong className="text-slate-800">{exp.monthlySalary}</strong></div>
                        <div>Reason for Leaving: <em className="text-slate-700">{exp.reasonForLeaving}</em></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: TRAININGS */}
            {activeTab === "Training" && (
              <div className="space-y-4 text-xs">
                <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Seminars, Workshops & Training Attended
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(currentData.trainings && currentData.trainings.length > 0
                    ? currentData.trainings
                    : [
                        {
                          title: "HIPAA & US Healthcare Compliance Workshop",
                          date: "2024-03-15",
                          sponsor: "Medical BPO Academy"
                        },
                        {
                          title: "Advanced Customer Communication & De-escalation",
                          date: "2023-08-20",
                          sponsor: "SiBS Internal L&D"
                        }
                      ]
                  ).map((trn, idx) => (
                    <div key={idx} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                        Certified Training
                      </span>
                      <h5 className="font-black text-emerald-950 text-xs">{trn.title}</h5>
                      <p className="text-[10.5px] text-emerald-900">Sponsor: <strong>{trn.sponsor}</strong></p>
                      <p className="text-[10px] text-slate-400">Completion Date: {trn.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: SKILLS & AWARDS */}
            {activeTab === "Skills" && (
              <div className="space-y-5 text-xs">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#042C51] uppercase">Technical & Functional Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentData.skills.map((sk, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-[#042C51] border border-blue-200 rounded-lg font-bold text-xs">
                        ⚡ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#042C51] uppercase">Languages & Communication</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentData.languages || ["English (Fluent)", "Filipino (Native)", "Cebuano"]).map((lang, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold text-xs">
                        🗣️ {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: REFERENCES */}
            {activeTab === "References" && (
              <div className="space-y-4 text-xs">
                <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Character & Work References
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {(currentData.characterReferences || [
                    {
                      name: "Dr. Roberto Santos",
                      company: "Davao Doctors Hospital",
                      title: "Head of Medical Records",
                      contactNumber: "+63 917 888 9900",
                      email: "r.santos@ddh.com.ph"
                    }
                  ]).map((ref, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <h5 className="font-black text-[#042C51] text-xs">{ref.name}</h5>
                      <p className="text-[11px] font-bold text-slate-700">{ref.title} — {ref.company}</p>
                      <div className="text-[10px] text-slate-500 font-mono space-y-0.5 pt-1 border-t border-slate-200">
                        <p>Phone: {ref.contactNumber}</p>
                        <p>Email: {ref.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: APPLICATION & HR */}
            {activeTab === "Application" && (
              <div className="space-y-4 text-xs">
                {activeSubtopic === "Overview" && (
                  <div className="space-y-4">
                    {/* Inbound Lead Origin Banner if candidate is from leads */}
                    {(currentData.sourcingChannel?.toLowerCase().includes("lead") ||
                      currentData.notes?.includes("LEAD-") ||
                      currentData.history?.some(h => h.action.toLowerCase().includes("lead"))) && (
                      <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#FF5C28] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                              <SparkleIcon className="w-3 h-3" /> Originated from Applicant Lead
                            </span>
                            <span className="text-xs font-bold text-orange-950">Inbound Lead Intake Dossier</span>
                          </div>
                          <span className="text-[10px] font-mono text-orange-700 bg-orange-100 px-2 py-0.5 rounded font-bold">
                            Lead Record Verified
                          </span>
                        </div>
                        <p className="text-xs text-orange-900/90 leading-relaxed">
                          This candidate profile was successfully converted and transferred from the <strong>Applicant Leads & Inquiries Intake Database</strong>. All initial inquiry metadata, recruiter contact records, and timestamps have been merged into this Talent Pool profile.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <FieldBox label="SOURCING CHANNEL" value={currentData.sourcingChannel} isEditing={isEditing} />
                      <FieldBox label="ASSIGNED RECRUITER" value={currentData.recruiter} isEditing={isEditing} />
                      <FieldBox label="APPLIED POSITION" value={currentData.appliedPosition} isEditing={isEditing} />
                      <FieldBox label="TARGET ACCOUNT FIT" value={currentData.accountFit} isEditing={isEditing} />
                      <FieldBox label="APPLICATION DATE" value={currentData.applicationDate} isEditing={isEditing} />
                      <FieldBox label="CURRENT CANDIDATE STATUS" value={currentData.status} isEditing={isEditing} />
                    </div>
                  </div>
                )}

                {activeSubtopic === "Assessment & Readiness" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <FieldBox label="ASSESSMENT STATUS" value={currentData.assessmentStatus || "Completed"} isEditing={isEditing} />
                      <FieldBox label="TEST OVERALL SCORE" value={currentData.testScore || "88.5% (High Pass)"} isEditing={isEditing} />
                      <FieldBox label="FULL VACCINATION STATUS" value="Yes (Fully Vaccinated + Booster)" isEditing={isEditing} />
                      <FieldBox label="ONSITE WORK COMFORT" value="Yes (100% Comfortable)" isEditing={isEditing} />
                      <FieldBox label="GRAVEYARD SHIFT WILLINGNESS" value="Yes (Flexible Schedule)" isEditing={isEditing} />
                      <FieldBox label="DRUG TEST & BGC READINESS" value="Willing & Cleared" isEditing={isEditing} />
                    </div>
                  </div>
                )}

                {activeSubtopic === "Status History" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#042C51] uppercase">Audit History & State Transitions</h4>
                      <span className="text-[10px] text-slate-400 font-medium">Includes Sourcing & Lead Intake Logs</span>
                    </div>

                    <div className="space-y-2">
                      {currentData.history.map((h, i) => {
                        const isLeadAction = h.action.toLowerCase().includes("lead") || h.action.toLowerCase().includes("inbound");
                        return (
                          <div 
                            key={i} 
                            className={`p-3 rounded-xl border flex items-start gap-3 text-xs transition-all ${
                              isLeadAction 
                                ? "bg-orange-50/60 border-orange-200" 
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg mt-0.5 ${
                              isLeadAction 
                                ? "bg-orange-500 text-white" 
                                : "bg-blue-100 text-[#042C51]"
                            }`}>
                              {isLeadAction ? <SparkleIcon className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`font-bold ${isLeadAction ? "text-orange-950" : "text-slate-800"}`}>
                                  {h.action}
                                </p>
                                {isLeadAction && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-orange-200 text-orange-800 rounded">
                                    Lead History
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {h.date} • Performed by: <strong>{h.user}</strong>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 10: DOCUMENTS */}
            {activeTab === "Documents" && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Attached Files & Media
                  </h4>
                  <button className="px-3 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-100 text-[#042C51] rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{currentData.resumeFileName || "Candidate_CV_Resume.pdf"}</p>
                        <p className="text-[10px] text-slate-400 font-mono">1.2 MB • PDF Document</p>
                      </div>
                    </div>
                    <button className="p-1.5 text-slate-500 hover:text-[#042C51] hover:bg-slate-200 rounded-lg cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {currentData.hasVoiceRecording && (
                    <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-amber-950">{currentData.audioFileName || "Candidate_Voice_Sample.mp3"}</p>
                          <p className="text-[10px] text-amber-800 font-mono">3.4 MB • Audio Screening File</p>
                        </div>
                      </div>
                      <button className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-lg cursor-pointer">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 11: DOSSIER NOTES */}
            {activeTab === "Notes" && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-[#042C51] uppercase flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#FF5C28]" />
                    Confidential Recruiter & Screener Notes
                  </h4>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 bg-[#042C51] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Notes</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={dossierNotesDraft}
                  onChange={(e) => setDossierNotesDraft(e.target.value)}
                  placeholder="Enter internal recruiter screening observations, interview performance remarks, or target alignment notes..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#042C51]"
                />
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Sub-component for clean, consistent uppercase read-only / edit field boxes (matching Employee Directory screenshot style!)
function FieldBox({
  label,
  value,
  isEditing = false,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (val: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-[#667085] uppercase tracking-wide block">
        {label}
      </label>
      {isEditing && onChange ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2 bg-white border border-[#042C51] rounded-xl font-extrabold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#042C51]"
        />
      ) : (
        <div className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl font-bold text-slate-800 text-xs tracking-tight truncate">
          {value || "—"}
        </div>
      )}
    </div>
  );
}
