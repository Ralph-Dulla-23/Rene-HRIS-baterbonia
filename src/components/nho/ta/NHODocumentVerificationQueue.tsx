import React, { useState, useMemo } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant, NHODocumentItem } from "../nhoTypes";
import NHODocumentVerificationModal from "./NHODocumentVerificationModal";
import { 
  FileCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Eye, 
  Clock, 
  User, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface VerificationQueueItem {
  applicant: NHOApplicant;
  document: NHODocumentItem;
}

export default function NHODocumentVerificationQueue() {
  const { applicants, setSelectedApplicantId, verifyDocument, returnDocumentForCorrection, showToast } = useNHO();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("For Verification");
  const [selectedApplicantFilter, setSelectedApplicantFilter] = useState<string>("all");

  // Modal review state
  const [activeModalItem, setActiveModalItem] = useState<VerificationQueueItem | null>(null);

  // Quick inline correction state
  const [inlineReturnItem, setInlineReturnItem] = useState<VerificationQueueItem | null>(null);
  const [inlineRemarks, setInlineRemarks] = useState("");

  // Flatten all documents across all applicants into a single consolidated queue
  const allItems: VerificationQueueItem[] = useMemo(() => {
    const list: VerificationQueueItem[] = [];
    applicants.forEach(app => {
      app.documents.forEach(doc => {
        // Include any document that has a status other than "Not Submitted" or has been uploaded
        if (doc.status !== "Not Submitted" || doc.fileName || doc.submittedDate) {
          list.push({ applicant: app, document: doc });
        }
      });
    });
    return list;
  }, [applicants]);

  // Metrics
  const metrics = useMemo(() => {
    const pendingVerification = allItems.filter(i => i.document.status === "For Verification").length;
    const verified = allItems.filter(i => i.document.status === "Verified").length;
    const needsCorrection = allItems.filter(i => i.document.status === "Needs Correction").length;
    const majorsCount = allItems.filter(i => i.document.isMajor && i.document.status === "For Verification").length;

    return {
      pendingVerification,
      verified,
      needsCorrection,
      majorsCount
    };
  }, [allItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter(({ applicant, document }) => {
      // Search
      const matchesSearch = 
        applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.applicantNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (document.fileName || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (categoryFilter === "major" && !document.isMajor) return false;
      if (categoryFilter === "agreement" && !document.isEssentialAgreement) return false;
      if (categoryFilter === "other" && (document.isMajor || document.isEssentialAgreement)) return false;

      // Status filter
      if (statusFilter !== "all" && document.status !== statusFilter) return false;

      // Applicant filter
      if (selectedApplicantFilter !== "all" && applicant.id !== selectedApplicantFilter) return false;

      return true;
    });
  }, [allItems, searchQuery, categoryFilter, statusFilter, selectedApplicantFilter]);

  const handleQuickVerify = (appId: string, docId: string, docName: string) => {
    verifyDocument(appId, docId);
  };

  const handleConfirmInlineReturn = () => {
    if (!inlineReturnItem) return;
    if (!inlineRemarks.trim()) {
      showToast("Please enter mandatory correction remarks.", "error");
      return;
    }
    returnDocumentForCorrection(inlineReturnItem.applicant.id, inlineReturnItem.document.id, inlineRemarks);
    setInlineReturnItem(null);
    setInlineRemarks("");
  };

  return (
    <div className="min-w-0 space-y-5">
      {/* HRIS metric cards: compact sizing and hierarchy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label: "For Verification", value: metrics.pendingVerification, note: "Requires TA review", icon: Clock, tone: "text-amber-600", background: "bg-amber-50 border-amber-100" },
          { label: "Pending Majors", value: metrics.majorsCount, note: "Major requirements in queue", icon: FileText, tone: "text-[#FF5C28]", background: "bg-orange-50 border-orange-100" },
          { label: "Verified Records", value: metrics.verified, note: "Approved by TA / HR", icon: CheckCircle, tone: "text-emerald-600", background: "bg-emerald-50 border-emerald-100" },
          { label: "Needs Correction", value: metrics.needsCorrection, note: "Returned to applicant", icon: AlertTriangle, tone: "text-red-600", background: "bg-red-50 border-red-100" }
        ].map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 shadow-xs transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider ${card.tone} truncate`}>
                  {card.label}
                </span>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${card.background} ${card.tone}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-1">
                <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51]">
                  {card.value}
                </div>
                <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate" title={card.note}>
                  {card.note}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and records are grouped into one HRIS-style records card. */}
      <section className="min-w-0 rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-bold tracking-tight text-[#042C51]">Document Verification Records</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Review submitted requirements, verify eligible documents, or request corrections.</p>
        </div>
        <div className="mb-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-12">
          <label className="space-y-1 sm:col-span-2 xl:col-span-5">
            <span className="block text-xs font-semibold text-slate-700">Search</span>
            <span className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" placeholder="Search applicant, requirement, or file name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-xl border border-[#E6ECF2] bg-white py-2.5 pl-9 pr-3 text-xs text-[#042C51] focus:border-[#FF5C28] focus:outline-none focus:ring-1 focus:ring-[#FF5C28]" />
            </span>
          </label>
          <label className="space-y-1 xl:col-span-2">
            <span className="block text-xs font-semibold text-slate-700">Category</span>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full rounded-xl border border-[#E6ECF2] bg-white px-3 py-2.5 text-xs font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-none">
              <option value="all">All Categories</option><option value="major">Major Requirements (4)</option><option value="agreement">Essential Agreements (3)</option><option value="other">Other Non-Majors</option>
            </select>
          </label>
          <label className="space-y-1 xl:col-span-2">
            <span className="block text-xs font-semibold text-slate-700">Status</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full rounded-xl border border-[#E6ECF2] bg-white px-3 py-2.5 text-xs font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-none">
              <option value="all">All Statuses</option><option value="For Verification">For Verification Only</option><option value="Verified">Verified</option><option value="Needs Correction">Needs Correction</option>
            </select>
          </label>
          <label className="space-y-1 xl:col-span-3">
            <span className="block text-xs font-semibold text-slate-700">Applicant</span>
            <select value={selectedApplicantFilter} onChange={e => setSelectedApplicantFilter(e.target.value)} className="w-full rounded-xl border border-[#E6ECF2] bg-white px-3 py-2.5 text-xs font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-none">
              <option value="all">All Applicants</option>
              {applicants.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
            </select>
          </label>
        </div>
        <div className="min-w-0 overflow-hidden rounded-xl border border-[#E6ECF2] bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#E6ECF2] px-4 pt-2">
            <div className="flex items-center gap-2 border-b-2 border-[#FF5C28] px-1 pb-3 pt-1 text-xs font-extrabold text-[#FF5C28]">
              <FileCheck className="h-3.5 w-3.5" /> REQUIREMENTS
              <span className="rounded-full bg-[#042C51] px-2 py-0.5 text-[10px] font-black text-white">{filteredItems.length}</span>
            </div>
            <span className="pb-2 text-[11px] font-medium text-slate-500">{filteredItems.length} of {allItems.length} records</span>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left text-xs">
              <thead><tr className="border-b border-[#E6ECF2] bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Applicant</th><th className="px-3 py-3">Requirement Name</th>
                <th className="px-3 py-3">Category</th><th className="px-3 py-3">Submission Details</th>
                <th className="px-3 py-3">Status</th><th className="px-4 py-3 text-right">Verification Actions</th>
              </tr></thead>
            <tbody className="divide-y divide-[#E6ECF2]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                    No documents found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ applicant, document }) => {
                  const isVer = document.status === "Verified";
                  const isPending = document.status === "For Verification";
                  const isNeedsCorr = document.status === "Needs Correction";

                  return (
                    <tr key={`${applicant.id}-${document.id}`} className="hover:bg-[#F7F9FC]/80 transition-colors">
                      {/* Applicant */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#042C51]">{applicant.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {applicant.applicantNumber} • {applicant.position}
                        </div>
                      </td>

                      {/* Requirement Name */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{document.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {document.templateCode || "Standard Requirement"}
                        </div>
                        {isNeedsCorr && document.correctionRemarks && (
                          <div className="mt-1 text-[11px] text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                            <strong>Correction:</strong> {document.correctionRemarks}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                          document.isMajor
                            ? "bg-[#FF5C28]/15 text-[#e04f20]"
                            : document.isEssentialAgreement
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-600"
                        }`}>
                          {document.isMajor ? "Major (Mandatory)" : document.isEssentialAgreement ? "Agreement" : "Non-Major"}
                        </span>
                      </td>

                      {/* Submission Details */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-700 font-mono text-[11px]">
                          {document.fileName || (document.signatureDataUrl ? "Electronic Signature Captured" : "Physical Copy / Upload")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {document.submittedDate ? `Submitted: ${document.submittedDate}` : "Session Recorded"}
                          {document.fileSize ? ` (${document.fileSize})` : ""}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1 ${
                          isVer
                            ? "bg-green-100 text-green-800"
                            : isPending
                              ? "bg-blue-100 text-blue-800"
                              : isNeedsCorr
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-600"
                        }`}>
                          {isVer && <CheckCircle className="w-3 h-3 text-green-600" />}
                          {isPending && <Clock className="w-3 h-3 text-blue-600" />}
                          {isNeedsCorr && <AlertTriangle className="w-3 h-3 text-red-600" />}
                          <span>{document.status}</span>
                        </span>
                        {isVer && document.verifiedBy && (
                          <span className="text-[9.5px] text-slate-400 block mt-0.5">
                            by {document.verifiedBy.split(" ")[0]}
                          </span>
                        )}
                      </td>

                      {/* Verification Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview modal button */}
                          <button
                            onClick={() => setActiveModalItem({ applicant, document })}
                            aria-label={`Preview ${document.name} for ${applicant.fullName}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="Inspect File Preview & Audit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isVer && (
                            <>
                              <button
                                onClick={() => setInlineReturnItem({ applicant, document })}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] border border-red-200 transition-colors cursor-pointer"
                              >
                                Needs Correction
                              </button>
                              <button
                                onClick={() => handleQuickVerify(applicant.id, document.id, document.name)}
                                className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Verify</span>
                              </button>
                            </>
                          )}

                          {isVer && (
                            <button
                              onClick={() => setInlineReturnItem({ applicant, document })}
                              className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[10px] border border-slate-200 transition-colors cursor-pointer"
                              title="Authorized TA Correction: Return previously verified item"
                            >
                              Correction
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal Audit Inspection */}
      {activeModalItem && (
        <NHODocumentVerificationModal
          isOpen={!!activeModalItem}
          onClose={() => setActiveModalItem(null)}
          document={activeModalItem.document}
          applicantId={activeModalItem.applicant.id}
          applicantName={activeModalItem.applicant.fullName}
        />
      )}

      {/* Inline Needs Correction Dialog */}
      {inlineReturnItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#042C51]">Return Document for Correction</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Candidate: <strong>{inlineReturnItem.applicant.fullName}</strong> • Requirement: <strong>{inlineReturnItem.document.name}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Mandatory Correction Remarks:
              </label>
              <textarea
                rows={3}
                value={inlineRemarks}
                onChange={e => setInlineRemarks(e.target.value)}
                placeholder="Detail specifically what must be corrected (e.g. Blurry scan, illegible dry seal, expired certificate, missing page 2)..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#042C51]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setInlineReturnItem(null);
                  setInlineRemarks("");
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInlineReturn}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs cursor-pointer"
              >
                Confirm Return for Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
