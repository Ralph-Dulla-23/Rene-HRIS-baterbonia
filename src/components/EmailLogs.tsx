import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle,
  CheckCircle2,
  X,
  Send,
  ExternalLink,
  ChevronDown,
  Clock,
  Sparkles,
  Eye,
  RotateCw,
  AlertTriangle,
  XCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  FileText,
  MousePointerClick,
  ShieldCheck,
  Inbox,
  TrendingUp,
  Server,
  Layers,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  INITIAL_EMAIL_LOGS,
  EMAIL_LOG_STATS,
  EmailLogItem,
  EmailTimelineEvent
} from "../data/emailLogsData";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  broadcastDataChange
} from "../data/recruitmentStore";

interface EmailLogsProps {
  userEmail?: string;
  onSwitchModule?: (moduleKey: string) => void;
}

export default function EmailLogs({
  userEmail = "crister.canitan@thesiblingssolutions.com",
  onSwitchModule
}: EmailLogsProps) {
  // Derive name of current user account for logged-by display
  const currentAccountName = useMemo(() => {
    if (!userEmail) return "CRISTER CANITAN";
    if (userEmail.includes("@")) {
      const handle = userEmail.split("@")[0];
      const parts = handle.split(".").map(p => p.toUpperCase());
      return parts.join(" ");
    }
    return userEmail.toUpperCase();
  }, [userEmail]);

  // --- STATE ---
  const [logs, setLogs] = useState<EmailLogItem[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.EMAIL_LOGS, INITIAL_EMAIL_LOGS)
  );

  // Sync to localStorage
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.EMAIL_LOGS, logs);
    broadcastDataChange("email_logs");
  }, [logs]);

  // Listen for storage updates
  useEffect(() => {
    const handleStoreUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.channel === "email_logs" || customEvent.detail?.channel === "all") {
        setLogs(prev => {
          const fresh = loadFromLocalStorage(STORAGE_KEYS.EMAIL_LOGS, INITIAL_EMAIL_LOGS);
          return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
        });
      }
    };
    window.addEventListener("sibs_store_update", handleStoreUpdate);
    return () => window.removeEventListener("sibs_store_update", handleStoreUpdate);
  }, []);
  const [selectedEmail, setSelectedEmail] = useState<EmailLogItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState<"preview" | "timeline" | "headers" | "text">("preview");

  // Tab filter (Underlined tab bar with counter pills matching the reference design theme)
  const [activeTab, setActiveTab] = useState<
    "all" | "delivered" | "opened" | "clicked" | "bounced" | "failed" | "approvals" | "relay"
  >("all");

  // Search & Filter controls
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [accountFilter, setAccountFilter] = useState<string>("All Accounts");
  const [periodFilter, setPeriodFilter] = useState<string>("All Time");

  // Modals
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testRecipientName, setTestRecipientName] = useState("Demmy Diagbel Labus");
  const [testRecipientEmail, setTestRecipientEmail] = useState("demlabus@gmail.com");
  const [testTemplate, setTestTemplate] = useState("Job Offer");
  const [testPosition, setTestPosition] = useState("Software Management - Full Stack Developer");
  const [testAccount, setTestAccount] = useState("CD - Connect");
  const [testSite, setTestSite] = useState<"Tagum City Campus" | "Davao City Site">("Tagum City Campus");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All Categories");
    setAccountFilter("All Accounts");
    setPeriodFilter("All Time");
    setActiveTab("all");
    setCurrentPage(1);
    showToast("Filters cleared.");
  };

  // Refresh Queue Simulation
  const handleRefreshQueue = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Email delivery records synchronized with SMTP relay.");
    }, 600);
  };

  // Re-send Email Single
  const handleResendEmail = (log: EmailLogItem) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const updatedLogs = logs.map(item => {
      if (item.id === log.id) {
        const newEvent: EmailTimelineEvent = {
          id: `ev-resend-${Date.now()}`,
          event: "Dispatched",
          timestamp: `${currentDate} ${currentTime}`,
          detail: `Re-dispatched manually by ${currentAccountName} via Google Workspace SMTP Relay`
        };
        return {
          ...item,
          status: "Delivered" as const,
          timeline: [...item.timeline, newEvent]
        };
      }
      return item;
    });

    setLogs(updatedLogs);
    if (selectedEmail && selectedEmail.id === log.id) {
      setSelectedEmail(updatedLogs.find(i => i.id === log.id) || null);
    }
    showToast(`Re-dispatched email to ${log.recipientName} (${log.recipientEmail})`);
  };

  // Dispatch Test Email
  const handleDispatchTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientEmail) return;

    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newLog: EmailLogItem = {
      id: `EML-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      messageId: `<sibs-relay-${Date.now()}@mail.thesiblingssolutions.com>`,
      timestamp: `${currentDate} ${currentTime}`,
      recipientName: testRecipientName || "New Recipient",
      recipientEmail: testRecipientEmail,
      recipientRole: "Candidate",
      senderName: currentAccountName,
      senderEmail: userEmail || "careers@thesiblingssolutions.com",
      replyTo: "recruitment@thesiblingssolutions.com",
      subject: `[DISPATCH] ${testTemplate} Notification - ${testRecipientName}`,
      category: testTemplate as any,
      status: "Delivered",
      positionTitle: testPosition,
      accountName: testAccount,
      siteLocation: testSite,
      previewSnippet: `Official candidate communication dispatched via SiBS Google Workspace SMTP Relay by ${currentAccountName}...`,
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background-color: #042C51; padding: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">SiBS TALENT ACQUISITION DISPATCH</h2>
            <p style="color: #94A3B8; font-size: 11px; margin: 4px 0 0 0;">Sender: ${currentAccountName} &lt;${userEmail}&gt;</p>
          </div>
          <div style="padding: 24px;">
            <p style="color: #334155; font-size: 14px;">Hi <strong>${testRecipientName}</strong>,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              This is an official recruitment notification regarding your application for <strong>${testPosition}</strong> under <strong>${testAccount}</strong>.
            </p>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 8px; font-size: 13px; color: #475569; margin: 16px 0;">
              <p style="margin: 3px 0;"><strong>Campus Site:</strong> ${testSite}</p>
              <p style="margin: 3px 0;"><strong>Template:</strong> ${testTemplate}</p>
              <p style="margin: 3px 0;"><strong>Relay Status:</strong> Delivered to Recipient MX (250 OK)</p>
            </div>
            <p style="color: #64748B; font-size: 12px;">
              For questions or further assistance, reply to recruitment@thesiblingssolutions.com.
            </p>
          </div>
        </div>
      `,
      bodyText: `Dear ${testRecipientName}, Notification for ${testPosition} (${testAccount}) at ${testSite}. Dispatched by ${currentAccountName}.`,
      timeline: [
        {
          id: `ev-${Date.now()}-1`,
          event: "Queued",
          timestamp: `${currentDate} ${currentTime}`,
          detail: `Enqueued by ${currentAccountName}`
        },
        {
          id: `ev-${Date.now()}-2`,
          event: "Dispatched",
          timestamp: `${currentDate} ${currentTime}`,
          detail: "Transmitted via Google Workspace SMTP Relay (142.250.157.108:587)"
        },
        {
          id: `ev-${Date.now()}-3`,
          event: "Delivered",
          timestamp: `${currentDate} ${currentTime}`,
          detail: "Recipient MX server confirmed delivery (250 OK)"
        }
      ],
      technicalMeta: {
        smtpServer: "smtp.gmail.com:587",
        tlsVersion: "TLSv1.3",
        authResults: "spf=pass dkim=pass dmarc=pass",
        retryCount: 0,
        responseTimeMs: 235
      }
    };

    setLogs([newLog, ...logs]);
    setIsTestEmailModalOpen(false);
    showToast(`Logged and dispatched ${testTemplate} email to ${testRecipientName}!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Message/Email ID", "Timestamp", "Recipient Name", "Recipient Email", "Role", "Category", "Status", "Subject", "Position", "Account", "Site Location", "Dispatched By"];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.recipientName}"`,
      `"${l.recipientEmail}"`,
      `"${l.recipientRole}"`,
      `"${l.category}"`,
      `"${l.status}"`,
      `"${l.subject.replace(/"/g, '""')}"`,
      `"${l.positionTitle}"`,
      `"${l.accountName}"`,
      `"${l.siteLocation}"`,
      `"${l.senderName}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SiBS_Email_Delivery_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded CSV report with ${filteredLogs.length} email records.`);
  };

  // Status Counts for Tab Badges
  const counts = useMemo(() => {
    return {
      all: logs.length,
      delivered: logs.filter(l => l.status === "Delivered").length,
      opened: logs.filter(l => l.status === "Opened").length,
      clicked: logs.filter(l => l.status === "Clicked").length,
      bounced: logs.filter(l => l.status === "Bounced").length,
      failed: logs.filter(l => l.status === "Failed").length,
      approvals: logs.filter(l => l.category === "Internal Approval").length
    };
  }, [logs]);

  // Unique Accounts for filter dropdown
  const uniqueAccounts = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.accountName) set.add(l.accountName);
    });
    return Array.from(set);
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Tab filter
      if (activeTab === "delivered" && log.status !== "Delivered") return false;
      if (activeTab === "opened" && log.status !== "Opened") return false;
      if (activeTab === "clicked" && log.status !== "Clicked") return false;
      if (activeTab === "bounced" && log.status !== "Bounced") return false;
      if (activeTab === "failed" && log.status !== "Failed") return false;
      if (activeTab === "approvals" && log.category !== "Internal Approval") return false;

      // Search keyword (recipient name, email, subject, id, position, account)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          log.recipientName.toLowerCase().includes(query) ||
          log.recipientEmail.toLowerCase().includes(query) ||
          log.subject.toLowerCase().includes(query) ||
          log.id.toLowerCase().includes(query) ||
          log.positionTitle.toLowerCase().includes(query) ||
          log.accountName.toLowerCase().includes(query) ||
          log.senderName.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Category Filter
      if (categoryFilter !== "All Categories" && log.category !== categoryFilter) {
        return false;
      }

      // Account Filter
      if (accountFilter !== "All Accounts" && log.accountName !== accountFilter) {
        return false;
      }

      // Period Filter
      if (periodFilter === "Today" && !log.timestamp.startsWith("2026-09-14")) {
        return false;
      } else if (periodFilter === "Yesterday" && !log.timestamp.startsWith("2026-09-13")) {
        return false;
      }

      return true;
    });
  }, [logs, activeTab, searchTerm, categoryFilter, accountFilter, periodFilter]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Inspect email helper
  const openEmailDetails = (log: EmailLogItem) => {
    setSelectedEmail(log);
    setDrawerActiveTab("preview");
    setIsDrawerOpen(true);
  };

  // Status Badge Helper matching current theme in reference screenshot
  const getStatusBadge = (status: EmailLogItem["status"]) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            DELIVERED
          </span>
        );
      case "Opened":
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            OPENED
          </span>
        );
      case "Clicked":
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <Send className="w-3 h-3 text-purple-600" />
            CLICKED CTA
          </span>
        );
      case "Bounced":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            BOUNCED
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  // Category Badge Helper
  const getCategoryBadge = (category: EmailLogItem["category"]) => {
    switch (category) {
      case "Job Offer":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
            Job Offer
          </span>
        );
      case "Interview Invite":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#042C51]">
            Interview
          </span>
        );
      case "Assessment":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
            Assessment
          </span>
        );
      case "NHO Schedule":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
            NHO Schedule
          </span>
        );
      case "Application Link":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800">
            Intake Form
          </span>
        );
      case "Internal Approval":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">
            Approval Needed
          </span>
        );
      case "Weekly Digest":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800">
            Weekly Digest
          </span>
        );
      case "Regret Letter":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
            Talent Pool
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
            Status Update
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none relative w-full pb-16" id="email-logs-root">
      {/* Toast Notification matching current theme */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#042C51] text-white px-4 py-3 rounded-xl shadow-xl border border-blue-400/30 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF5C28]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. TOP HEADER BANNER (WITH ORANGE ACCENT STRIPE) ==================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden border-t-4 border-t-[#FF5C28]">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                Recruitment View
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#042C51] tracking-tight">
              Email Logs & Delivery Tracking
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Audit trail, real-time dispatch status, candidate correspondence, and delivery tracking across all automated and manual recruitment communications.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Refresh Queue Button */}
            <button
              onClick={handleRefreshQueue}
              disabled={isRefreshing}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              title="Refresh logs from SMTP relay"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#FF5C28]" : ""}`} />
            </button>

            {/* CSV Template / Export Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Template</span>
            </button>

            {/* Solid Orange Primary Button */}
            <button
              onClick={() => setIsTestEmailModalOpen(true)}
              className="px-4 py-2.5 bg-[#FF5C28] hover:bg-[#e04b1c] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Dispatch Test Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. 5 METRICS KPI CARDS (THEME MATCHING SCREENSHOT) ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Emails Sent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              TOTAL EMAILS
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#042C51] tracking-tight">
            {logs.length}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Active Dispatch Roster
            </span>
          </div>
        </div>

        {/* Card 2: Delivered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              DELIVERED
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">
            {counts.delivered}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              99.2% Delivery SLA
            </span>
          </div>
        </div>

        {/* Card 3: Opened */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              OPENED
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600 tracking-tight">
            {counts.opened}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              76.4% Open Rate
            </span>
          </div>
        </div>

        {/* Card 4: Clicked Links */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              CLICKED CTA
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">
            {counts.clicked}
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              Offer & Assessment Links
            </span>
          </div>
        </div>

        {/* Card 5: Bounced / Failed Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-[#FF5C28] tracking-wider">
              BOUNCE RATE
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF5C28] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#FF5C28] tracking-tight">
            {(((counts.bounced + counts.failed) / Math.max(1, logs.length)) * 100).toFixed(1)}%
          </div>
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium">
              {counts.bounced + counts.failed} Bounced / Issues
            </span>
          </div>
        </div>
      </div>

      {/* ==================== 3. MAIN EMAIL DIRECTORY CONTAINER ==================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#042C51] tracking-tight">
              Email Communication Directory
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Search and filter email dispatches by status, template category, position, account, and recipient.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
              Showing {filteredLogs.length} of {logs.length} emails
            </span>
          </div>
        </div>

        {/* Filter Controls Bar matching reference theme */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-[280px]">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search recipient, email, subject, position, account, message ID..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#042C51] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category / Template Filter */}
            <div className="w-[200px]">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={e => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                <option value="Job Offer">Job Offer</option>
                <option value="Interview Invite">Interview Invite</option>
                <option value="Assessment">Assessment</option>
                <option value="Application Link">Application Intake</option>
                <option value="NHO Schedule">NHO Schedule</option>
                <option value="Internal Approval">Internal Approval</option>
                <option value="Weekly Digest">Weekly Digest</option>
                <option value="Regret Letter">Regret Notice</option>
              </select>
            </div>

            {/* Account Filter */}
            <div className="w-[180px]">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Account
              </label>
              <select
                value={accountFilter}
                onChange={e => {
                  setAccountFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Accounts">All Accounts</option>
                {uniqueAccounts.map(acc => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="pb-0.5">
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 4. UNDERLINED TAB BAR WITH COUNTER PILLS ==================== */}
        <div className="border-b border-slate-200 px-5 pt-3 flex items-center gap-6 overflow-x-auto text-xs font-black select-none">
          {/* TAB 1: ALL EMAILS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>ALL EMAILS</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "all" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.all}
            </span>
          </button>

          {/* TAB 2: DELIVERED */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("delivered");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "delivered"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>DELIVERED</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "delivered" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.delivered}
            </span>
          </button>

          {/* TAB 3: OPENED */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("opened");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "opened"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>OPENED</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "opened" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.opened}
            </span>
          </button>

          {/* TAB 4: CLICKED CTA */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("clicked");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "clicked"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>CLICKED CTA</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "clicked" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.clicked}
            </span>
          </button>

          {/* TAB 5: BOUNCED */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("bounced");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "bounced"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>BOUNCED</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "bounced" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.bounced}
            </span>
          </button>

          {/* TAB 6: FAILED */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("failed");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "failed"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "failed" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.failed}
            </span>
          </button>

          {/* TAB 7: INTERNAL APPROVALS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("approvals");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "approvals"
                ? "border-[#FF5C28] text-[#042C51]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INTERNAL APPROVALS</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "approvals" ? "bg-[#042C51] text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.approvals}
            </span>
          </button>

          {/* TAB 8: RELAY STATUS */}
          <button
            type="button"
            onClick={() => {
              showToast("Relay Status: Google Workspace & SendGrid Cluster Active (142.250.157.108:587). Latency: 44ms.");
            }}
            className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition-all cursor-pointer whitespace-nowrap"
          >
            <Server className="w-3.5 h-3.5" />
            <span>RELAY STATUS</span>
          </button>
        </div>

        {/* ==================== 5. EMAIL LOGS TABLE ==================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 select-none">
                <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                  RECIPIENT & MESSAGE ID
                </th>
                <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                  EMAIL ADDRESS & ROLE
                </th>
                <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                  SUBJECT & CATEGORY
                </th>
                <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                  POSITION & ACCOUNT
                </th>
                <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                  STATUS
                </th>
                <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px]">
                  DISPATCHED BY
                </th>
                <th className="py-3.5 px-5 font-black uppercase tracking-wider text-[10px] text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Inbox className="w-10 h-10 text-slate-300" />
                      <p className="font-extrabold text-sm text-slate-600">
                        No email communication logs found matching your filters.
                      </p>
                      <button
                        onClick={handleClearFilters}
                        className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#042C51] text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(log => {
                  return (
                    <tr
                      key={log.id}
                      onClick={() => openEmailDetails(log)}
                      className="hover:bg-slate-50/75 transition-colors group cursor-pointer"
                    >
                      {/* RECIPIENT & MESSAGE ID */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-black text-[#FF5C28] uppercase text-xs tracking-tight group-hover:text-[#e04b1c] transition-colors">
                            {log.recipientName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">
                            LOG ID: {log.id}
                          </p>
                        </div>
                      </td>

                      {/* EMAIL ADDRESS & ROLE */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 font-mono">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={log.recipientEmail}>
                              {log.recipientEmail}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {log.recipientRole}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {log.siteLocation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SUBJECT & CATEGORY */}
                      <td className="py-3.5 px-5 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(log.category)}
                          </div>
                          <p className="font-bold text-[#042C51] truncate text-xs" title={log.subject}>
                            {log.subject}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{log.previewSnippet}</p>
                        </div>
                      </td>

                      {/* POSITION & ACCOUNT */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 text-xs truncate max-w-[190px]">
                            {log.positionTitle}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Account:{" "}
                            <span className="font-semibold text-slate-700">
                              {log.accountName}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(log.status)}
                          {log.technicalMeta.bounceReason && (
                            <p className="text-[10px] text-rose-600 font-bold max-w-[140px] truncate" title={log.technicalMeta.bounceReason}>
                              {log.technicalMeta.bounceReason}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* DISPATCHED BY */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-[#042C51] uppercase">
                            <User className="w-3.5 h-3.5 text-[#FF5C28]" />
                            <span>{log.senderName || "SYSTEM RELAY"}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {log.timestamp}
                          </p>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td
                        className="py-3.5 px-5 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Eye Button */}
                          <button
                            onClick={() => openEmailDetails(log)}
                            className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="Inspect Email Body & Headers"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </button>

                          {/* Re-send Action */}
                          <button
                            onClick={() => handleResendEmail(log)}
                            className="w-7 h-7 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="Re-send Email to Recipient"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          {/* Copy Message ID */}
                          <button
                            onClick={() => {
                              handleCopy(log.messageId, log.id);
                              showToast(`Copied Message-ID for ${log.recipientName}`);
                            }}
                            className="w-7 h-7 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="Copy RFC-5322 Message-ID"
                          >
                            {copiedId === log.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-purple-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ==================== 6. FOOTER PAGINATION ==================== */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p className="font-medium">
            Showing <strong className="text-slate-800">{paginatedLogs.length}</strong> loaded email records out of{" "}
            <strong className="text-slate-800">{filteredLogs.length}</strong>
          </p>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Current Page Indicator (Solid Orange Pill matching reference theme) */}
            <span className="w-8 h-8 rounded-lg bg-[#FF5C28] text-white font-black text-xs flex items-center justify-center shadow-xs">
              {currentPage}
            </span>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 7. EMAIL INSPECTION SLIDE-OUT DRAWER ==================== */}
      <AnimatePresence>
        {isDrawerOpen && selectedEmail && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="bg-[#042C51] text-white p-5 flex items-start justify-between gap-4 border-b border-blue-900">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-800 text-blue-200 text-[10px] font-black uppercase tracking-wider">
                      {selectedEmail.category}
                    </span>
                    {getStatusBadge(selectedEmail.status)}
                  </div>
                  <h3 className="text-base font-black text-white leading-snug mt-1">
                    {selectedEmail.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                    <span>
                      To: <strong className="text-white">{selectedEmail.recipientName}</strong> (
                      {selectedEmail.recipientEmail})
                    </span>
                    <span>•</span>
                    <span>{selectedEmail.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-4">
                <button
                  onClick={() => setDrawerActiveTab("preview")}
                  className={`py-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    drawerActiveTab === "preview"
                      ? "border-[#FF5C28] text-[#042C51]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Rendered Preview</span>
                </button>
                <button
                  onClick={() => setDrawerActiveTab("timeline")}
                  className={`py-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    drawerActiveTab === "timeline"
                      ? "border-[#FF5C28] text-[#042C51]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Delivery Audit ({selectedEmail.timeline.length})</span>
                </button>
                <button
                  onClick={() => setDrawerActiveTab("headers")}
                  className={`py-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    drawerActiveTab === "headers"
                      ? "border-[#FF5C28] text-[#042C51]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>SMTP Headers</span>
                </button>
                <button
                  onClick={() => setDrawerActiveTab("text")}
                  className={`py-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    drawerActiveTab === "text"
                      ? "border-[#FF5C28] text-[#042C51]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Plain Text</span>
                </button>
              </div>

              {/* Drawer Body Contents */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {/* TAB 1: HTML RENDERED PREVIEW */}
                {drawerActiveTab === "preview" && (
                  <div className="space-y-4">
                    {/* Summary Metadata */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div>
                          <span className="text-slate-400 font-bold block">Sender:</span>
                          <span className="font-bold text-[#042C51]">{selectedEmail.senderName}</span>{" "}
                          <span className="text-slate-500 font-mono text-[11px]">&lt;{selectedEmail.senderEmail}&gt;</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">Reply-To:</span>
                          <span className="font-mono text-slate-700">{selectedEmail.replyTo}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">Position & Account:</span>
                          <span className="font-bold text-slate-800">{selectedEmail.positionTitle}</span>{" "}
                          <span className="text-slate-500">({selectedEmail.accountName})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">Campus Site:</span>
                          <span className="font-bold text-slate-800">{selectedEmail.siteLocation}</span>
                        </div>
                      </div>

                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-500">
                            Attachments ({selectedEmail.attachments.length}):
                          </span>
                          {selectedEmail.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-100 text-[#042C51] border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-2xs"
                            >
                              <FileText className="w-3 h-3 text-[#FF5C28]" />
                              <span>{att.name}</span>
                              <span className="text-slate-400 text-[10px]">({att.size})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Email Viewport */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden">
                      <div className="text-[10px] uppercase tracking-wider font-black text-slate-400 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                        <span>Rendered Email Content</span>
                        <span className="text-emerald-600 font-bold">100% Inline CSS Compatible</span>
                      </div>
                      <div
                        className="email-rendered-viewport"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: AUDIT & INTERACTION TIMELINE */}
                {drawerActiveTab === "timeline" && (
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                      <h4 className="text-xs font-black text-[#042C51] uppercase tracking-wider mb-4">
                        End-to-End Delivery & Recipient Interaction History
                      </h4>

                      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {selectedEmail.timeline.map((item, idx) => {
                          let dotColor = "bg-slate-400";
                          if (item.event === "Delivered") dotColor = "bg-emerald-500";
                          if (item.event === "Opened") dotColor = "bg-blue-600";
                          if (item.event === "Clicked") dotColor = "bg-purple-600";
                          if (item.event === "Bounced" || item.event === "Failed") dotColor = "bg-rose-500";

                          return (
                            <div key={item.id || idx} className="relative group">
                              <div
                                className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${dotColor} shadow-xs`}
                              />
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-[#042C51] text-xs uppercase tracking-wide">
                                    {item.event}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">{item.timestamp}</span>
                                </div>
                                <p className="text-slate-700 font-medium mt-1">{item.detail}</p>
                                {(item.ip || item.userAgent || item.location) && (
                                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono">
                                    {item.ip && <span>IP: {item.ip}</span>}
                                    {item.location && <span>Location: {item.location}</span>}
                                    {item.userAgent && <span className="truncate max-w-xs">{item.userAgent}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SMTP HEADERS & DIAGNOSTICS */}
                {drawerActiveTab === "headers" && (
                  <div className="space-y-4">
                    <div className="bg-[#042C51] text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2 overflow-x-auto shadow-inner">
                      <p className="text-amber-400 font-bold border-b border-slate-700 pb-1">
                        # RFC-5322 Raw Header Diagnostics
                      </p>
                      <p><span className="text-blue-400 font-bold">Message-ID:</span> {selectedEmail.messageId}</p>
                      <p><span className="text-blue-400 font-bold">From:</span> {selectedEmail.senderName} &lt;{selectedEmail.senderEmail}&gt;</p>
                      <p><span className="text-blue-400 font-bold">To:</span> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;</p>
                      <p><span className="text-blue-400 font-bold">Reply-To:</span> {selectedEmail.replyTo}</p>
                      <p><span className="text-blue-400 font-bold">Date:</span> {selectedEmail.timestamp} +0800</p>
                      <p><span className="text-blue-400 font-bold">Subject:</span> {selectedEmail.subject}</p>
                      <p><span className="text-blue-400 font-bold">MIME-Version:</span> 1.0</p>
                      <p><span className="text-blue-400 font-bold">Content-Type:</span> multipart/alternative</p>
                      <p><span className="text-blue-400 font-bold">X-Mailer:</span> SiBS HRIS Communication Engine v4.2</p>
                      <p><span className="text-blue-400 font-bold">X-Relay-Server:</span> {selectedEmail.technicalMeta.smtpServer}</p>
                      <p><span className="text-blue-400 font-bold">X-TLS-Protocol:</span> {selectedEmail.technicalMeta.tlsVersion}</p>
                      <p><span className="text-emerald-400 font-bold">Authentication-Results:</span> {selectedEmail.technicalMeta.authResults}</p>
                      {selectedEmail.technicalMeta.bounceReason && (
                        <p className="text-rose-400 font-bold pt-2 border-t border-slate-700">
                          X-Bounce-Diagnostic: {selectedEmail.technicalMeta.bounceReason}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopy(selectedEmail.messageId, "raw-headers")}
                      className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Full Technical Headers</span>
                    </button>
                  </div>
                )}

                {/* TAB 4: PLAIN TEXT FALLBACK */}
                {drawerActiveTab === "text" && (
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-2xs">
                      {selectedEmail.bodyText}
                    </div>
                    <button
                      onClick={() => handleCopy(selectedEmail.bodyText, "raw-text")}
                      className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Plain Text Content</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Drawer
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleCopy(selectedEmail.recipientEmail, "copy-email");
                      showToast(`Copied recipient address: ${selectedEmail.recipientEmail}`);
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Address</span>
                  </button>
                  <button
                    onClick={() => {
                      handleResendEmail(selectedEmail);
                    }}
                    className="px-4 py-2 bg-[#042C51] hover:bg-[#073A6B] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#FF5C28]" />
                    <span>Re-send to Recipient</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== 8. DISPATCH TEST EMAIL MODAL ==================== */}
      {isTestEmailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#042C51] text-white flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#FF5C28]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#042C51]">Dispatch Test Email Broadcast</h3>
                  <p className="text-[11px] text-slate-500">Verify SMTP relay transmission and client rendering</p>
                </div>
              </div>
              <button
                onClick={() => setIsTestEmailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchTestEmail} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Recipient Name</label>
                  <input
                    type="text"
                    value={testRecipientName}
                    onChange={e => setTestRecipientName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#042C51]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Recipient Email Address</label>
                  <input
                    type="email"
                    value={testRecipientEmail}
                    onChange={e => setTestRecipientEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#042C51]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Select Template Format</label>
                <select
                  value={testTemplate}
                  onChange={e => setTestTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#042C51] cursor-pointer"
                >
                  <option value="Job Offer">Official Job Offer (Offer V2)</option>
                  <option value="Interview Invite">Interview Schedule Notification</option>
                  <option value="Assessment">Online Assessment & Versant Test Link</option>
                  <option value="NHO Schedule">New Hire Orientation (NHO) Protocol</option>
                  <option value="Application Link">Application Intake Online Form</option>
                  <option value="Internal Approval">Internal Offer Approval Notice</option>
                  <option value="Weekly Digest">Weekly TA Management Digest</option>
                  <option value="Regret Letter">Talent Pool / Disposition Notice</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Position</label>
                  <input
                    type="text"
                    value={testPosition}
                    onChange={e => setTestPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#042C51]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Account</label>
                  <input
                    type="text"
                    value={testAccount}
                    onChange={e => setTestAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#042C51]"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-900 space-y-1">
                <p className="font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" /> Relay Server Confirmation
                </p>
                <p className="text-blue-800/80">
                  This test will be dispatched via Google Workspace SMTP Relay (142.250.157.108:587) and instantly recorded in your live Email Delivery Log table.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF5C28] hover:bg-[#e04b1c] text-white font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Send Test Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
