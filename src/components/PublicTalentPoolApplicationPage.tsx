import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Briefcase,
  User,
  GraduationCap,
  ShieldCheck,
  Users,
  Volume2,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  Mail,
  HelpCircle,
  Info,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  Award,
  Search,
  Building2,
  FileCheck,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Mic,
  MicOff,
  Radio,
  Clock,
  Layers,
  Sparkle,
  Sliders,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate, WorkExperience } from "./TalentPool";
import {
  INITIAL_APPLICATION_FORMS,
  PositionApplicationFormItem,
  ApplicationFormSection,
  ApplicationQuestionField
} from "./ApplicationQuestionsFormSettings";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  broadcastDataChange
} from "../data/recruitmentStore";

interface PublicTalentPoolApplicationPageProps {
  onAddCandidate?: (candidate: Candidate) => void;
  onNavigateToTalentPool?: () => void;
}

const SOURCES_LIST = [
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
  { id: "POS-001", title: "Customer Service Representative", dept: "Call Center Operations", loc: "SiBS Tagum / Alabang Site", code: "POS-001" },
  { id: "POS-002", title: "Non Voice Specialist", dept: "Digital & Chat Support", loc: "Cebu IT Park Site", code: "POS-002" },
  { id: "POS-006", title: "Healthcare Claims Specialist", dept: "Healthcare & Insurance", loc: "Davao Matina IT Park", code: "POS-006" },
  { id: "POS-017", title: "Call Center Agent", dept: "Customer Care Operations", loc: "Alabang Site", code: "POS-017" },
  { id: "POS-021", title: "Technical Support Representative (TSR)", dept: "Telecom & Tech Support", loc: "Alabang Site", code: "POS-021" },
  { id: "POS-035", title: "Financial Account Specialist", dept: "Financial Services Group", loc: "Clark Freeport Zone", code: "POS-035" }
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

export default function PublicTalentPoolApplicationPage({
  onAddCandidate,
  onNavigateToTalentPool
}: PublicTalentPoolApplicationPageProps) {
  // Page Step State: 1 = General Master Profile, 2 = Position-Specific Screening Questions, 3 = Review & Submit
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

  // 1️⃣ Application Source & Position
  const [referralCode, setReferralCode] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [referrerName, setReferrerName] = useState("");
  const [referrerContact, setReferrerContact] = useState("");
  const [appliedPosition, setAppliedPosition] = useState("Customer Service Representative");
  const [positionSearchTerm, setPositionSearchTerm] = useState("");
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [targetLocation, setTargetLocation] = useState("SiBS Tagum (Davao del Norte)");

  // 2️⃣ Personal Information
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");

  // 3️⃣ Work Experience
  const [workExpCategory, setWorkExpCategory] = useState("With Work Experience");
  const [workExpList, setWorkExpList] = useState<
    Array<{
      id: string;
      position: string;
      company: string;
      industry: string;
      monthlySalary: string;
      tenure: string;
      reasonForLeaving: string;
    }>
  >([
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

  // 4️⃣ Education, Affiliations, and Training
  const [educationalAttainment, setEducationalAttainment] = useState("College Graduate");
  const [schoolName, setSchoolName] = useState("");
  const [degreeCourse, setDegreeCourse] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [shsStrand, setShsStrand] = useState("STEM");
  const [vocationalCourse, setVocationalCourse] = useState("");
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [customCert, setCustomCert] = useState("");
  const [trainingsAttended, setTrainingsAttended] = useState("");

  // 5️⃣ Work Readiness Questions
  const [isVaccinated, setIsVaccinated] = useState("Yes");
  const [isComfortableOnsite, setIsComfortableOnsite] = useState("Yes");
  const [isGraveyardWilling, setIsGraveyardWilling] = useState("Yes");
  const [employmentPreference, setEmploymentPreference] = useState("Full-time");
  const [hasRemoteAccess, setHasRemoteAccess] = useState("Yes");
  const [isDrugTestWilling, setIsDrugTestWilling] = useState("Yes");
  const [isBackgroundCheckWilling, setIsBackgroundCheckWilling] = useState("Yes");

  // 6️⃣ Character References
  const [ref1Name, setRef1Name] = useState("");
  const [ref1Phone, setRef1Phone] = useState("");
  const [ref2Name, setRef2Name] = useState("");
  const [ref2Phone, setRef2Phone] = useState("");
  const [ref3Name, setRef3Name] = useState("");
  const [ref3Phone, setRef3Phone] = useState("");

  // 7️⃣ Audio and Supporting File Upload (Page 1)
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");

  // 8️⃣ Terms & Privacy (Page 1)
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // ================= PAGE 2: POSITION-SPECIFIC QUESTIONS STATE =================
  // Dynamic question responses stored as key-value pairs (questionId -> answer)
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});
  
  // Interactive Voice Recording simulation for Page 2
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVoiceSample, setRecordedVoiceSample] = useState<string | null>(null);
  const [isPlayingVoiceSample, setIsPlayingVoiceSample] = useState(false);
  const recordingTimerRef = useRef<any>(null);

  // UI States
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidateId, setSubmittedCandidateId] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  // Application Forms state loaded from settings or defaults
  const [applicationForms, setApplicationForms] = useState<PositionApplicationFormItem[]>(() => {
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

  // Sync when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("sibs_application_questions_forms");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApplicationForms(prev => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
          }
        }
      } catch (e) {}
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Find the configured form template for the applied position from ApplicationQuestionsFormSettings
  const activePositionForm = useMemo<PositionApplicationFormItem>(() => {
    // Attempt exact title or code match
    const found = applicationForms.find(
      (f) =>
        f.title.toLowerCase() === appliedPosition.toLowerCase() ||
        f.id.toLowerCase() === appliedPosition.toLowerCase() ||
        f.code.toLowerCase() === appliedPosition.toLowerCase()
    );
    if (found) return found;

    // Fallback to POS-001 or first available
    return (
      applicationForms[0] || {
        id: "POS-001",
        code: "POS-001",
        title: appliedPosition || "Customer Service Representative",
        department: "Call Center Operations",
        site: targetLocation,
        formName: `${appliedPosition || "Customer Service Representative"} - Application Intake Form`,
        status: "Active",
        passingBenchmark: "35 WPM • Voice Prompt Required",
        voiceSampleRequired: true,
        applicationSlug: "pos-form",
        description: "Application screening questionnaire tailored to evaluate role requirements and operational benchmarks.",
        sections: []
      }
    );
  }, [applicationForms, appliedPosition, targetLocation]);

  // Handle Voice Recording timer in simulated portal
  useEffect(() => {
    if (isRecordingVoice) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleStartRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    setRecordedVoiceSample(null);
  };

  const handleStopRecording = () => {
    setIsRecordingVoice(false);
    setRecordedVoiceSample(`Voice_Response_${activePositionForm.code}_${Date.now()}.wav`);
  };

  // Filter positions by search
  const filteredPositions = useMemo(() => {
    if (!positionSearchTerm) return OPEN_POSITIONS;
    return OPEN_POSITIONS.filter(
      (p) =>
        p.title.toLowerCase().includes(positionSearchTerm.toLowerCase()) ||
        p.dept.toLowerCase().includes(positionSearchTerm.toLowerCase()) ||
        p.loc.toLowerCase().includes(positionSearchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(positionSearchTerm.toLowerCase())
    );
  }, [positionSearchTerm]);

  // Source checkbox handler
  const handleToggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  // Add/Remove Work Experience
  const handleAddWorkExp = () => {
    setWorkExpList([
      ...workExpList,
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

  const handleRemoveWorkExp = (id: string) => {
    if (workExpList.length <= 1) return;
    setWorkExpList(workExpList.filter((item) => item.id !== id));
  };

  const handleUpdateWorkExp = (id: string, field: string, val: string) => {
    setWorkExpList(
      workExpList.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Certifications checkbox
  const handleToggleCert = (cert: string) => {
    if (selectedCertifications.includes(cert)) {
      setSelectedCertifications(selectedCertifications.filter((c) => c !== cert));
    } else {
      setSelectedCertifications([...selectedCertifications, cert]);
    }
  };

  // Handle Audio Upload
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioFileName(file.name);
    }
  };

  // Handle Resume Upload
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  // Update answer for dynamic question on Page 2
  const handleAnswerChange = (questionId: string, value: any) => {
    setQuestionAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Reset form
  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to reset all form fields?")) {
      setCurrentPage(1);
      setReferralCode("");
      setSelectedSources([]);
      setReferrerName("");
      setReferrerContact("");
      setAppliedPosition("Customer Service Representative");
      setPositionSearchTerm("");
      setNickname("");
      setTargetLocation("SiBS Tagum (Davao del Norte)");

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
          id: `exp-${Date.now()}`,
          position: "",
          company: "",
          industry: "BPO / Call Center",
          monthlySalary: "",
          tenure: "",
          reasonForLeaving: ""
        }
      ]);

      setEducationalAttainment("College Graduate");
      setSchoolName("");
      setDegreeCourse("");
      setGradYear("");
      setSchoolAddress("");
      setSelectedCertifications([]);
      setCustomCert("");
      setTrainingsAttended("");

      setIsVaccinated("Yes");
      setIsComfortableOnsite("Yes");
      setIsGraveyardWilling("Yes");
      setEmploymentPreference("Full-time");
      setHasRemoteAccess("Yes");
      setIsDrugTestWilling("Yes");
      setIsBackgroundCheckWilling("Yes");

      setRef1Name("");
      setRef1Phone("");
      setRef2Name("");
      setRef2Phone("");
      setRef3Name("");
      setRef3Phone("");

      setAudioFile(null);
      setAudioFileName("");
      setResumeFile(null);
      setResumeFileName("");

      setAgreedToTerms(false);
      setQuestionAnswers({});
      setRecordedVoiceSample(null);
      setFormErrors([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Proceed to Page 2 (Error trapping disabled for design preview)
  const handleProceedToPage2 = () => {
    setFormErrors([]);
    setCurrentPage(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Form Submission Handler (from Page 2)
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    // Validate active questions in active position form
    activePositionForm.sections.forEach((sec) => {
      if (sec.isEnabled) {
        sec.questions.forEach((q) => {
          if (q.isRequired) {
            const ans = questionAnswers[q.id];
            if (q.inputType === "audio_record") {
              if (!recordedVoiceSample && !ans && !audioFileName) {
                errors.push(`Required Voice Recording missing: "${q.label}"`);
              }
            } else if (q.inputType === "checkbox") {
              if (!ans || (Array.isArray(ans) && ans.length === 0)) {
                errors.push(`Required agreement missing: "${q.label}"`);
              }
            } else if (!ans || String(ans).trim() === "") {
              errors.push(`Missing required answer: "${q.label}"`);
            }
          }
        });
      }
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }

    setFormErrors([]);
    setIsSubmitting(true);

    // Simulate API network submission
    setTimeout(() => {
      const generatedId = `SIBS-CAN-${Math.floor(1000 + Math.random() * 9000)}`;

      let age = 24;
      if (dob) {
        const birthYear = new Date(dob).getFullYear();
        if (!isNaN(birthYear)) age = Math.max(18, 2026 - birthYear);
      }

      const certs = [...selectedCertifications];
      if (customCert.trim()) certs.push(customCert.trim());

      const mappedWorkExp: WorkExperience[] =
        workExpCategory === "Fresh Graduate / No Experience"
          ? []
          : workExpList.map((item) => ({
              company: item.company || "N/A",
              position: item.position || "N/A",
              industry: item.industry || "BPO",
              tenure: item.tenure || "1 Year",
              monthlySalary: item.monthlySalary ? `₱${item.monthlySalary}` : "₱25,000",
              reasonForLeaving: item.reasonForLeaving || "Career growth"
            }));

      const newCandidate: Candidate = {
        id: generatedId,
        name: `${firstName} ${middleName ? middleName + " " : ""}${lastName}${
          suffix ? " " + suffix : ""
        }`,
        email: email,
        phone: phone1,
        appliedPosition: appliedPosition,
        department:
          OPEN_POSITIONS.find((p) => p.title === appliedPosition)?.dept ||
          activePositionForm.department ||
          "Operations",
        accountFit: targetLocation,
        sourcingChannel:
          selectedSources.length > 0 ? selectedSources.join(", ") : "Public Web Portal",
        recruiter: "Public Applicant (Self-Registered)",
        applicationDate: new Date().toISOString().split("T")[0],
        status: "New Applicant",
        isPublicEntry: true,
        lastActivityDate: new Date().toISOString().split("T")[0],
        notes: `Registered via Public Talent Pool Application Form. Preferred Nickname: ${
          nickname || "N/A"
        }. Location: ${targetLocation}. Referral Code: ${referralCode || "None"}. JD Form Completed: ${activePositionForm.formName}. Benchmark: ${activePositionForm.passingBenchmark}.`,

        address: address,
        dob: dob,
        age: age,
        gender: "Prefer not to say",
        civilStatus: "Single",
        citizenship: "Filipino",

        workExperience: mappedWorkExp,
        education: [
          {
            level: educationalAttainment as any,
            schoolName: schoolName,
            degreeCourse: degreeCourse || "Secondary / General Studies",
            gradYear: gradYear,
            address: schoolAddress || "Philippines"
          }
        ],

        affiliations: certs,
        trainings: trainingsAttended
          ? [
              {
                title: trainingsAttended,
                date: new Date().toISOString().split("T")[0],
                sponsor: "Self-Reported"
              }
            ]
          : [],

        skills: [
          appliedPosition,
          "Customer Service",
          "Problem Solving",
          "Communication"
        ],
        languages: ["English", "Filipino"],

        vaccinationStatus: isVaccinated === "Yes" ? "Fully Vaccinated" : "Not Vaccinated",
        willingOnSite: isComfortableOnsite === "Yes",
        graveyardShiftReadiness: isGraveyardWilling === "Yes",
        employmentInterest: employmentPreference,

        characterReferences: [
          {
            name: ref1Name,
            company: "Reference 1",
            title: "Professional Reference",
            contactNumber: ref1Phone,
            email: ""
          },
          {
            name: ref2Name,
            company: "Reference 2",
            title: "Professional Reference",
            contactNumber: ref2Phone,
            email: ""
          },
          {
            name: ref3Name,
            company: "Reference 3",
            title: "Professional Reference",
            contactNumber: ref3Phone,
            email: ""
          }
        ],

        hasVoiceRecording: true,
        audioFileName: recordedVoiceSample || audioFileName || "Applicant_VoiceIntro.mp3",
        resumeFileName: resumeFileName || "Applicant_Resume.pdf",

        requirements: {
          torDiploma: "Pending",
          nbiClearance: "Pending",
          medicalCheck: "Pending",
          bir2316: "Pending",
          sssNo: "Pending",
          philHealthNo: "Pending",
          pagIbigNo: "Pending"
        },

        history: [
          {
            date: new Date().toLocaleString(),
            action: "Application & JD Form Completed",
            user: "Candidate Self-Registration"
          }
        ]
      };

      if (onAddCandidate) {
        onAddCandidate(newCandidate);
      }

      // Also persist directly to LocalStorage for Talent Pool & Candidate Pipeline
      try {
        const storedTalentPool = loadFromLocalStorage<Candidate[]>(STORAGE_KEYS.TALENT_POOL, []);
        saveToLocalStorage(STORAGE_KEYS.TALENT_POOL, [newCandidate, ...storedTalentPool]);
        broadcastDataChange("talent_pool");

        // Seed into Candidate Pipeline at Initial Screening
        const storedPipeline = loadFromLocalStorage<any[]>(STORAGE_KEYS.PIPELINE_CANDIDATES, []);
        const newPipelineCandidate = {
          id: generatedId,
          candidateId: generatedId,
          candidateApplicationId: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
          name: newCandidate.name,
          email: newCandidate.email,
          contactNumber: newCandidate.phone,
          source: selectedSources.length > 0 ? selectedSources[0] : "Public Web Portal",
          department: newCandidate.department,
          account: newCandidate.accountFit || "General Operations",
          roleTitle: newCandidate.appliedPosition,
          currentStage: "Initial Screening",
          prfStatus: "Review",
          assessmentStatus: "Not Taken",
          education: newCandidate.education[0]?.degreeCourse || "College Graduate",
          experienceYears: workExpCategory === "Fresh Graduate / No Experience" ? "Fresh Graduate" : "1+ Years Experience",
          expectedSalary: 25000,
          currentLocation: targetLocation || "Tagum City",
          timeline: [
            {
              id: `t-${Date.now()}`,
              stage: "Initial Screening",
              date: new Date().toISOString().replace("T", " ").substring(0, 16),
              updatedBy: "Candidate Self-Portal",
              reason: "Application submitted via external candidate portal (sibsapply.getleadsource.com)."
            }
          ],
          createdAt: new Date().toISOString().split("T")[0]
        };
        saveToLocalStorage(STORAGE_KEYS.PIPELINE_CANDIDATES, [newPipelineCandidate, ...storedPipeline]);
        broadcastDataChange("pipeline");
      } catch (err) {
        console.error("Failed to persist new candidate to storage:", err);
      }

      setIsSubmitting(false);
      setSubmittedCandidateId(generatedId);
    }, 1200);
  };

  // Completion calculation for header progress bar
  const completionPercentage = useMemo(() => {
    let filled = 0;
    let total = 16;

    if (selectedSources.length > 0) filled++;
    if (appliedPosition) filled++;
    if (firstName) filled++;
    if (lastName) filled++;
    if (dob) filled++;
    if (email) filled++;
    if (phone1) filled++;
    if (address) filled++;
    if (schoolName) filled++;
    if (gradYear) filled++;
    if (ref1Name && ref1Phone) filled++;
    if (ref2Name && ref2Phone) filled++;
    if (ref3Name && ref3Phone) filled++;
    if (audioFileName || recordedVoiceSample) filled++;
    if (resumeFileName) filled++;
    if (currentPage === 2) filled++;

    return Math.min(100, Math.round((filled / total) * 100));
  }, [
    selectedSources,
    appliedPosition,
    firstName,
    lastName,
    dob,
    email,
    phone1,
    address,
    schoolName,
    gradYear,
    ref1Name,
    ref1Phone,
    ref2Name,
    ref2Phone,
    ref3Name,
    ref3Phone,
    audioFileName,
    recordedVoiceSample,
    resumeFileName,
    currentPage
  ]);

  return (
    <div id="public-talent-pool-page" className="min-h-screen bg-[#F4F7FB] text-[#101828] font-sans pb-20">
      {/* ================= PUBLIC HEADER BAR ================= */}
      <header className="bg-[#042C51] text-white border-b border-[#083a69] sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5C28] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-[#ff5c28]/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight">SiBS HRIS</h1>
                <span className="bg-[#FF5C28]/20 text-[#FF5C28] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-[#FF5C28]/30">
                  PUBLIC PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Talent Pool Master Registration Form
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToTalentPool && (
              <button
                id="btn-return-talent-pool"
                type="button"
                onClick={onNavigateToTalentPool}
                className="px-3 py-1.5 bg-[#073A6B] hover:bg-[#0a467e] text-slate-200 text-xs font-bold rounded-lg border border-blue-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#FF5C28]" />
                <span className="hidden sm:inline">Return to Talent Pool</span>
              </button>
            )}
            <div className="flex items-center gap-2 bg-[#021B33] px-3 py-1.5 rounded-xl border border-blue-900 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 text-[11px] font-medium hidden sm:inline">
                Live Submissions Active
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#02172C] h-1.5">
          <div
            className="bg-[#FF5C28] h-1.5 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-[#042C51] via-[#073A6B] to-[#042C51] p-6 rounded-2xl text-white shadow-lg mb-6 border border-[#0A467E] relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#FF5C28]/20 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-300">
                  SiBS Practice. Purpose. Philosophy.
                </span>
                <span className="inline-flex items-center gap-1 bg-[#FF5C28]/20 border border-[#FF5C28]/40 px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#FF5C28] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  NO LOGIN REQUIRED • DIRECT CANDIDATE ENTRY
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Talent Pool Master Application
              </h2>
              
              <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                Complete this form to submit your candidate profile directly to the SiBS HRIS Talent Pool for active and future recruitment opportunities. Fields marked with <span className="text-[#FF5C28] font-bold">*</span> are required.
              </p>
            </div>

            <div className="bg-[#021930]/80 backdrop-blur-xs p-3.5 rounded-xl border border-blue-400/20 text-center shrink-0 w-full sm:w-auto">
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                FORM COMPLETION
              </span>
              <span className="text-2xl font-black text-[#FF5C28]">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Page Step Navigator Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-[#E6ECF2] shadow-xs mb-6 flex items-center justify-between gap-2">
          <button
            type="button"
            id="tab-page-1"
            onClick={() => setCurrentPage(1)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentPage === 1
                ? "bg-[#042C51] text-white shadow-md shadow-[#042c51]/15"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              currentPage === 1 ? "bg-[#FF5C28] text-white" : "bg-slate-200 text-slate-700"
            }`}>
              1
            </span>
            <span className="truncate">Page 1: Master Candidate Profile</span>
            {currentPage > 1 && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          </button>

          <button
            type="button"
            id="tab-page-2"
            onClick={() => {
              setFormErrors([]);
              setCurrentPage(2);
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentPage === 2
                ? "bg-[#042C51] text-white shadow-md shadow-[#042c51]/15"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              currentPage === 2 ? "bg-[#FF5C28] text-white" : "bg-slate-200 text-slate-700"
            }`}>
              2
            </span>
            <span className="truncate">Page 2: Position Screening Questions</span>
            <span className="bg-[#FF5C28]/20 text-[#FF5C28] text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
              JD Form
            </span>
          </button>
        </div>

        {/* Form Validation Errors Banner */}
        {formErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl mb-6 shadow-xs space-y-2"
          >
            <div className="flex items-center gap-2 font-black text-xs text-rose-800 uppercase tracking-wide">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Please review missing required fields ({formErrors.length})</span>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1 text-rose-700 font-medium pl-1">
              {formErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ================= PAGE 1: MASTER CANDIDATE PROFILE ================= */}
        {currentPage === 1 && (
          <motion.div
            key="page-1-content"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* 1️⃣ Section 1: Application Source & Position */}
            <section className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  APPLICATION SOURCE AND POSITION - STEP 1 OF 8
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Step 1 of 8</span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Tell us where you learned about SiBS and what position you are applying for.
              </p>

              {/* Orange Referral Code Box */}
              <div className="bg-orange-50/70 border border-orange-200/80 p-4 rounded-xl space-y-2 text-slate-800">
                <div className="flex items-center gap-2 font-black text-xs text-orange-950 uppercase tracking-wide">
                  <Award className="w-4 h-4 text-[#FF5C28]" />
                  <span>REFERRAL CODE</span>
                </div>
                <p className="text-xs text-slate-600">
                  Use this code to connect your application to your referral. Enter a referral code if one was shared with you.
                </p>
                <div className="max-w-md pt-1">
                  <input
                    id="input-referral-code"
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="E.G. REF-******"
                    className="w-full px-3.5 py-2 bg-white border border-orange-200 rounded-xl text-xs font-mono font-bold text-[#042C51] uppercase placeholder:normal-case placeholder:font-normal focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28] outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              {/* How did you first hear about us? */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#042C51]">
                  How did you first hear about us? (Check all that apply) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {SOURCES_LIST.map((source) => {
                    const isChecked = selectedSources.includes(source);
                    return (
                      <label
                        key={source}
                        className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50 border-blue-600 text-[#042C51] font-bold shadow-2xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSource(source)}
                          className="mt-0.5 text-[#042C51] focus:ring-[#042C51] rounded"
                        />
                        <span className="leading-tight">{source}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Referrer Details if Employee Referral Program selected */}
              {selectedSources.includes("Employee Referral Program") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/60 p-4 rounded-xl border border-blue-200"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Referrer Employee Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-referrer-name"
                      type="text"
                      value={referrerName}
                      onChange={(e) => setReferrerName(e.target.value)}
                      placeholder="e.g. Alena Batacan"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#042C51] mb-1">
                      Referrer Employee Contact / Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-referrer-contact"
                      type="text"
                      value={referrerContact}
                      onChange={(e) => setReferrerContact(e.target.value)}
                      placeholder="e.g. alena.b@thesiblingssolutions.com"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                </motion.div>
              )}

              {/* Searchable Position Dropdown & Target Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Check our open positions */}
                <div className="relative">
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Check Our Open Positions <span className="text-red-500">*</span>
                  </label>
                  
                  <div
                    id="dropdown-position-trigger"
                    onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer hover:bg-white hover:border-[#042C51] transition-all"
                  >
                    <span className={appliedPosition ? "text-[#042C51]" : "text-slate-400 font-normal"}>
                      {appliedPosition || "Select open position from database..."}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>

                  {isPositionDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 p-2 space-y-2 max-h-64 overflow-y-auto">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={positionSearchTerm}
                          onChange={(e) => setPositionSearchTerm(e.target.value)}
                          placeholder="Search positions..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        {filteredPositions.map((pos) => (
                          <div
                            key={pos.id}
                            onClick={() => {
                              setAppliedPosition(pos.title);
                              setIsPositionDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-lg text-xs cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between ${
                              appliedPosition === pos.title ? "bg-blue-50 font-bold text-[#042C51]" : "text-slate-700"
                            }`}
                          >
                            <div>
                              <p className="font-bold text-[#042C51] flex items-center gap-1.5">
                                <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.2 rounded font-mono">
                                  {pos.code}
                                </span>
                                {pos.title}
                              </p>
                              <p className="text-[10px] text-slate-500">{pos.dept} • {pos.loc}</p>
                            </div>
                            {appliedPosition === pos.title && <Check className="w-4 h-4 text-blue-600" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preferred Nickname */}
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Preferred Nickname
                  </label>
                  <input
                    id="input-nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Althea / Rose"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden transition-all"
                  />
                </div>

                {/* Target Location */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Which location are you applying for? <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-target-location"
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#042C51] outline-hidden transition-all cursor-pointer"
                  >
                    <option value="SiBS Tagum (Davao del Norte)">SiBS Tagum (Davao del Norte)</option>
                    <option value="Alabang Site">Alabang Site (Muntinlupa City)</option>
                    <option value="Cebu IT Park Site">Cebu IT Park Site (Cebu City)</option>
                    <option value="Clark Freeport Zone Site">Clark Freeport Zone Site (Pampanga)</option>
                    <option value="Davao Matina IT Park Site">Davao Matina IT Park Site (Davao City)</option>
                    <option value="Remote / Work From Home">Remote / Work From Home</option>
                    <option value="Either / Flexible Location">Either / Flexible Location</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 2️⃣ Section 2: Personal Information */}
            <section className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Section 2: Personal Information
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Step 2 of 8</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Althea Rose"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Middle Name</label>
                  <input
                    id="input-middle-name"
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Cruz"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Santos"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Suffix</label>
                  <input
                    id="input-suffix"
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="e.g. Jr, III"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. candidate@example.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Primary Phone (Phone 1) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-phone1"
                    type="text"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    placeholder="e.g. 09171234567"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">
                  Physical Home Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Unit 402, Sunshine Towers, Pioneer St, Mandaluyong City"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                />
              </div>
            </section>

            {/* 3️⃣ Section 3: Work Experience */}
            <section className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Section 3: Work Experience
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Step 3 of 8</span>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 w-fit">
                {["With Work Experience", "Fresh Graduate / No Experience"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setWorkExpCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      workExpCategory === cat
                        ? "bg-[#042C51] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {workExpCategory !== "Fresh Graduate / No Experience" && (
                <div className="space-y-3">
                  {workExpList.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#042C51] uppercase">
                          Experience #{index + 1}
                        </span>
                        {workExpList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWorkExp(exp.id)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Position / Role *
                          </label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleUpdateWorkExp(exp.id, "position", e.target.value)}
                            placeholder="e.g. Customer Support Rep"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateWorkExp(exp.id, "company", e.target.value)}
                            placeholder="e.g. TeleTech Global"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Industry
                          </label>
                          <select
                            value={exp.industry}
                            onChange={(e) => handleUpdateWorkExp(exp.id, "industry", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden"
                          >
                            <option value="BPO / Call Center">BPO / Call Center</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Healthcare & Medical">Healthcare & Medical</option>
                            <option value="Financial Services / Banking">Financial Services / Banking</option>
                            <option value="Retail & Sales">Retail & Sales</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Tenure / Duration
                          </label>
                          <input
                            type="text"
                            value={exp.tenure}
                            onChange={(e) => handleUpdateWorkExp(exp.id, "tenure", e.target.value)}
                            placeholder="e.g. 1 Year 6 Months"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Reason for Leaving
                          </label>
                          <input
                            type="text"
                            value={exp.reasonForLeaving}
                            onChange={(e) => handleUpdateWorkExp(exp.id, "reasonForLeaving", e.target.value)}
                            placeholder="e.g. Career growth / site relocation"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddWorkExp}
                    className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-purple-600 text-purple-700 hover:bg-purple-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Work Experience</span>
                  </button>
                </div>
              )}
            </section>

            {/* 4️⃣ Section 4: Education */}
            <section className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  Section 4: Educational Attainment & Certifications
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Step 4 of 8</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Highest Educational Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-education-level"
                    value={educationalAttainment}
                    onChange={(e) => setEducationalAttainment(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  >
                    <option value="High School Graduate (Old Curriculum)">High School Graduate (Old Curriculum)</option>
                    <option value="Senior High School Graduate (K-12)">Senior High School Graduate (K-12)</option>
                    <option value="Vocational / Short Course Graduate">Vocational / Short Course Graduate</option>
                    <option value="College Undergraduate (1st-2nd Year)">College Undergraduate (1st-2nd Year)</option>
                    <option value="College Undergraduate (3rd-4th Year)">College Undergraduate (3rd-4th Year)</option>
                    <option value="College Graduate">College Graduate (Bachelor's Degree)</option>
                    <option value="Master's / Post Graduate">Master's / Post Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    School / University Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-school-name"
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. University of the Philippines"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Degree / Course / Strand
                  </label>
                  <input
                    id="input-degree-course"
                    type="text"
                    value={degreeCourse}
                    onChange={(e) => setDegreeCourse(e.target.value)}
                    placeholder="e.g. BS Business Administration"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">
                    Year Graduated / Completed <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-grad-year"
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#042C51] outline-hidden"
                  />
                </div>
              </div>
            </section>

            {/* 5️⃣ Section 5: Work Readiness */}
            <section className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Section 5: Work Readiness & Flexibility
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Step 5 of 8</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Are you willing to work in Graveyard / Night Shifts?
                  </span>
                  <div className="flex items-center gap-1.5">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIsGraveyardWilling(opt)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          isGraveyardWilling === opt
                            ? "bg-[#042C51] text-white"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Are you comfortable with 100% on-site work?
                  </span>
                  <div className="flex items-center gap-1.5">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIsComfortableOnsite(opt)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          isComfortableOnsite === opt
                            ? "bg-[#042C51] text-white"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 6️⃣ Section 6: Character References */}
            <section className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Section 6: Character References (3 Required)
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Step 6 of 8</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black bg-blue-100 text-[#042C51] px-2 py-0.5 rounded-full uppercase block w-fit">
                    Reference 1 *
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Full Name *</label>
                    <input
                      type="text"
                      value={ref1Name}
                      onChange={(e) => setRef1Name(e.target.value)}
                      placeholder="e.g. Dr. Roberto Santos"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone Number *</label>
                    <input
                      type="text"
                      value={ref1Phone}
                      onChange={(e) => setRef1Phone(e.target.value)}
                      placeholder="e.g. 09178889900"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black bg-blue-100 text-[#042C51] px-2 py-0.5 rounded-full uppercase block w-fit">
                    Reference 2 *
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Full Name *</label>
                    <input
                      type="text"
                      value={ref2Name}
                      onChange={(e) => setRef2Name(e.target.value)}
                      placeholder="e.g. Clarissa Ocampo"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone Number *</label>
                    <input
                      type="text"
                      value={ref2Phone}
                      onChange={(e) => setRef2Phone(e.target.value)}
                      placeholder="e.g. 09204445566"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black bg-blue-100 text-[#042C51] px-2 py-0.5 rounded-full uppercase block w-fit">
                    Reference 3 *
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Full Name *</label>
                    <input
                      type="text"
                      value={ref3Name}
                      onChange={(e) => setRef3Name(e.target.value)}
                      placeholder="e.g. Mark Torres"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone Number *</label>
                    <input
                      type="text"
                      value={ref3Phone}
                      onChange={(e) => setRef3Phone(e.target.value)}
                      placeholder="e.g. 09187776655"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#042C51] outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 7️⃣ Section 7: Audio & Resume Upload */}
            <section className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#FF5C28]" />
                  Section 7: Voice Audio Recording & Resume Upload * (Mandatory)
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Step 7 of 8</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Audio Upload */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-[#042C51] flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-[#FF5C28]" />
                    Upload Voice Audio File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={audioInputRef}
                    onChange={handleAudioChange}
                    accept=".mp3,.wav,.m4a,.aac,.ogg,.webm,.mp4"
                    className="hidden"
                  />
                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#FF5C28] p-5 rounded-xl text-center bg-white cursor-pointer transition-all hover:bg-orange-50/30 group"
                  >
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#FF5C28] mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-bold text-[#042C51]">
                      {audioFileName ? audioFileName : "Click to Upload Voice Audio"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      .mp3, .wav, .m4a (Max 25MB)
                    </p>
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-[#042C51] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Upload Supporting Resume / CV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={handleResumeChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <div
                    onClick={() => resumeInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-600 p-5 rounded-xl text-center bg-white cursor-pointer transition-all hover:bg-blue-50/30 group"
                  >
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-bold text-[#042C51]">
                      {resumeFileName ? resumeFileName : "Click to Upload Resume / CV"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      .pdf, .doc, .docx (Max 15MB)
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8️⃣ Section 8: Terms & Privacy Consent */}
            <section className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-slate-700" />
                  Section 8: Terms & Privacy Consent *
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Step 8 of 8</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    id="checkbox-terms-agree"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#042C51] focus:ring-[#042C51] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    I agree to terms & conditions provided by the company. By providing my phone number, I agree to receive text messages and emails regarding application status, interview schedules, and hiring updates. <span className="text-red-500 font-bold">*</span>
                  </span>
                </label>
              </div>
            </section>

            {/* Page 1 Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                id="btn-reset-form"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Form</span>
              </button>

              <button
                type="button"
                id="btn-next-page"
                onClick={handleProceedToPage2}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#FF5C28] hover:bg-[#e04b1a] text-white font-black text-xs rounded-xl shadow-lg shadow-[#ff5c28]/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Continue to Next Page: Position Screening Questions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= PAGE 2: POSITION-SPECIFIC SCREENING QUESTIONS ================= */}
        {currentPage === 2 && (
          <motion.div
            key="page-2-content"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            {/* Position Header Banner */}
            <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#042C51] text-white font-mono font-black text-[10px] px-2 py-0.5 rounded">
                      {activePositionForm.code}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      {activePositionForm.department}
                    </span>
                    {activePositionForm.voiceSampleRequired && (
                      <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                        <Mic className="w-3 h-3 text-[#FF5C28]" />
                        Voice Audio Required
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-[#042C51] mt-1.5">
                    {activePositionForm.title} - Application Screening Questions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activePositionForm.description}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Passing Benchmark
                  </span>
                  <span className="text-xs font-black text-[#042C51]">
                    {activePositionForm.passingBenchmark}
                  </span>
                </div>
              </div>

              {/* Position Switcher / Quick Preview notice */}
              <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Viewing live questions generated by <strong>Application Questions Form Settings</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
                  <span className="text-[11px] font-bold text-slate-600">Switch Role Form:</span>
                  <select
                    value={appliedPosition}
                    onChange={(e) => setAppliedPosition(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-black text-[#042C51] focus:outline-none cursor-pointer shadow-2xs"
                  >
                    {applicationForms.map((f) => (
                      <option key={f.id} value={f.title}>
                        {f.code} - {f.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Sections from Form Settings */}
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {activePositionForm.sections.map((section, sIdx) => {
                if (!section.isEnabled) return null;

                return (
                  <section
                    key={section.id || sIdx}
                    className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#FF5C28]" />
                          {section.title}
                        </h4>
                        {section.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {section.description}
                          </p>
                        )}
                      </div>
                      {section.badge && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                          {section.badge}
                        </span>
                      )}
                    </div>

                    {/* Render questions inside section */}
                    <div className="space-y-4">
                      {section.questions.map((question) => {
                        const currentVal = questionAnswers[question.id];

                        return (
                          <div
                            key={question.id}
                            className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <label className="block text-xs font-bold text-[#042C51] leading-snug">
                                {question.label}{" "}
                                {question.isRequired && (
                                  <span className="text-red-500 font-black">*</span>
                                )}
                              </label>
                              {question.systemLocked && (
                                <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  Standard Benchmark
                                </span>
                              )}
                            </div>

                            {question.sublabel && (
                              <p className="text-[11px] text-slate-500 leading-normal">
                                {question.sublabel}
                              </p>
                            )}

                            {/* Render depending on inputType */}
                            {question.inputType === "text" && (
                              <input
                                type="text"
                                value={currentVal || ""}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder={question.placeholder || "Enter your answer..."}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden shadow-2xs"
                              />
                            )}

                            {question.inputType === "textarea" && (
                              <textarea
                                rows={3}
                                value={currentVal || ""}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder={question.placeholder || "Type your detailed response here..."}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden shadow-2xs resize-y"
                              />
                            )}

                            {question.inputType === "select" && (
                              <select
                                value={currentVal || ""}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#042C51] outline-hidden cursor-pointer shadow-2xs"
                              >
                                <option value="">Select option...</option>
                                {question.options?.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            )}

                            {question.inputType === "yes_no" && (
                              <div className="flex items-center gap-2 pt-1">
                                {["Yes", "No"].map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleAnswerChange(question.id, opt)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      currentVal === opt
                                        ? "bg-[#042C51] text-white shadow-xs"
                                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}

                            {question.inputType === "radio" && (
                              <div className="space-y-1.5 pt-1">
                                {question.options?.map((opt) => (
                                  <label
                                    key={opt}
                                    className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                                  >
                                    <input
                                      type="radio"
                                      name={`radio-${question.id}`}
                                      value={opt}
                                      checked={currentVal === opt}
                                      onChange={() => handleAnswerChange(question.id, opt)}
                                      className="text-[#042C51] focus:ring-[#042C51]"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {question.inputType === "checkbox" && (
                              <div className="space-y-2 pt-1">
                                {question.options?.map((opt) => {
                                  const currentArr = Array.isArray(currentVal) ? currentVal : [];
                                  const isChecked = currentArr.includes(opt);

                                  return (
                                    <label
                                      key={opt}
                                      className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer hover:bg-blue-50/50"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          if (isChecked) {
                                            handleAnswerChange(
                                              question.id,
                                              currentArr.filter((i) => i !== opt)
                                            );
                                          } else {
                                            handleAnswerChange(question.id, [...currentArr, opt]);
                                          }
                                        }}
                                        className="mt-0.5 text-[#042C51] focus:ring-[#042C51] rounded"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {question.inputType === "number" && (
                              <input
                                type="number"
                                value={currentVal ?? ""}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder={question.placeholder || "Enter numerical value..."}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden shadow-2xs"
                              />
                            )}

                            {question.inputType === "date" && (
                              <input
                                type="date"
                                value={currentVal || ""}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#042C51] outline-hidden shadow-2xs"
                              />
                            )}

                            {question.inputType === "phone" && (
                              <input
                                type="tel"
                                value={currentVal || ""}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder={question.placeholder || "e.g. 0917-XXX-XXXX"}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium focus:border-[#042C51] outline-hidden shadow-2xs"
                              />
                            )}

                            {question.inputType === "file_upload" && (
                              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 p-4 rounded-xl text-center bg-white cursor-pointer transition-all hover:bg-blue-50/20 group">
                                <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600 mx-auto mb-1.5 transition-colors" />
                                <p className="text-xs font-bold text-[#042C51]">
                                  {currentVal ? currentVal : (question.placeholder || "Click or drag file to upload")}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">PDF, DOC, DOCX or JPG (Max 10MB)</p>
                              </div>
                            )}

                            {/* Live Audio Recorder Simulation Tool for JD Voice Prompts */}
                            {question.inputType === "audio_record" && (
                              <div className="bg-orange-50/80 border border-orange-200 p-4 rounded-xl space-y-3 mt-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                                    <Mic className="w-4 h-4 text-[#FF5C28]" />
                                    Live Voice Audio Recorder
                                  </span>
                                  <span className="text-[10px] font-mono text-orange-800 bg-orange-200/60 px-2 py-0.5 rounded">
                                    Target Duration: 45-60s
                                  </span>
                                </div>

                                <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs text-slate-700 leading-relaxed font-medium">
                                  <span className="font-bold text-[#042C51] block mb-1">
                                    🎙️ Voice Intro Script / Prompt:
                                  </span>
                                  "Please state your full name, location, and briefly explain why you are the best fit for the {activePositionForm.title} role at SiBS Solutions."
                                </div>

                                {/* Recording Controls */}
                                <div className="flex items-center gap-3 pt-1">
                                  {!isRecordingVoice ? (
                                    <button
                                      type="button"
                                      onClick={handleStartRecording}
                                      className="px-4 py-2 bg-[#FF5C28] hover:bg-[#e04b1a] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-[#ff5c28]/20 transition-all"
                                    >
                                      <Mic className="w-4 h-4" />
                                      <span>
                                        {recordedVoiceSample ? "Re-record Voice Audio" : "Start Live Voice Recording"}
                                      </span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={handleStopRecording}
                                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md animate-pulse"
                                    >
                                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                                      <span>Stop Recording ({recordingSeconds}s)</span>
                                    </button>
                                  )}

                                  {recordedVoiceSample && !isRecordingVoice && (
                                    <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      <span className="truncate max-w-[200px]">
                                        {recordedVoiceSample}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setIsPlayingVoiceSample(!isPlayingVoiceSample)}
                                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer ml-1"
                                      >
                                        {isPlayingVoiceSample ? "Pause" : "Test Play"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {/* Form Navigation Controls on Page 2 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  id="btn-back-page-1"
                  onClick={() => {
                    setCurrentPage(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← Back to Master Candidate Profile</span>
                </button>

                <button
                  type="submit"
                  id="btn-final-submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-3.5 bg-[#FF5C28] hover:bg-[#e04b1a] text-white font-black text-xs rounded-xl shadow-lg shadow-[#ff5c28]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Master & Position Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>🚀 Submit Completed Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      {/* ================= CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {submittedCandidateId && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                  Application Registered Successfully
                </span>
                <h3 className="text-xl font-black text-[#042C51] mt-2">
                  Thank You, {firstName}!
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Your master profile and position-specific screening questionnaire for <strong>{appliedPosition}</strong> have been submitted directly to the SiBS Talent Pool database.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase">Candidate Reference ID:</span>
                  <span className="font-mono font-black text-[#042C51] bg-blue-100 px-2 py-0.5 rounded">
                    {submittedCandidateId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase">Applied Position:</span>
                  <span className="font-bold text-slate-800">{appliedPosition}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase">Assigned Site:</span>
                  <span className="font-bold text-slate-800">{targetLocation}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase">JD Form Benchmark:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {activePositionForm.passingBenchmark}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-normal">
                Our Talent Acquisition team will review your voice recording, resume, and questionnaire responses. You will receive an SMS and email regarding your initial assessment results.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {onNavigateToTalentPool && (
                  <button
                    id="btn-confirm-talent-pool"
                    onClick={() => {
                      setSubmittedCandidateId(null);
                      onNavigateToTalentPool();
                    }}
                    className="flex-1 py-2.5 bg-[#042C51] hover:bg-[#073A6B] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    View in Talent Pool Database
                  </button>
                )}
                <button
                  id="btn-confirm-new-response"
                  onClick={() => {
                    setSubmittedCandidateId(null);
                    handleResetForm();
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-slate-200"
                >
                  Submit Another Response
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
