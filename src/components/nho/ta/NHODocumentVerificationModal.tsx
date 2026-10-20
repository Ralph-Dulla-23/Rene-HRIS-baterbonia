import React, { useState } from "react";
import { useNHO } from "../NHOContext";
import { NHODocumentItem } from "../nhoTypes";
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download, 
  Calendar, 
  User, 
  ShieldCheck,
  Eye
} from "lucide-react";

interface NHODocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: NHODocumentItem | null;
  applicantId: string;
  applicantName: string;
}

export default function NHODocumentVerificationModal({
  isOpen,
  onClose,
  document,
  applicantId,
  applicantName
}: NHODocumentVerificationModalProps) {
  const { verifyDocument, returnDocumentForCorrection, showToast } = useNHO();
  const [remarks, setRemarks] = useState("");
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);

  if (!isOpen || !document) return null;

  const handleVerify = () => {
    verifyDocument(applicantId, document.id);
    onClose();
  };

  const handleReturn = () => {
    if (!remarks.trim()) {
      showToast("Please provide mandatory correction remarks explaining why this document is returned.", "error");
      return;
    }
    returnDocumentForCorrection(applicantId, document.id, remarks);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#042C51] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              Document Verification & Audit
            </h2>
            <p className="text-[11px] text-slate-300">
              Candidate: <strong className="text-white">{applicantName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Content & Details */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="bg-[#F7F9FC] border border-[#E6ECF2] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#042C51] text-sm">{document.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                document.status === "Verified"
                  ? "bg-green-100 text-green-800"
                  : document.status === "For Verification"
                    ? "bg-blue-100 text-blue-800"
                    : document.status === "Needs Correction"
                      ? "bg-red-100 text-red-800"
                      : "bg-slate-100 text-slate-600"
              }`}>
                {document.status}
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">{document.description || "SiBS Official Orientation & Pre-Employment Documentation"}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
              <div><strong>Category:</strong> {document.category}</div>
              <div><strong>Template Code:</strong> {document.templateCode || "—"}</div>
              <div><strong>Submitted Method:</strong> {document.submissionMethod || "Direct Upload"}</div>
              <div><strong>Submitted Date:</strong> {document.submittedDate || "Not Submitted"}</div>
            </div>
          </div>

          {/* Visual Preview Area */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Submitted Artifact Preview:</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {document.fileName || "Simulated_Document.pdf"}
              </span>
            </div>

            {/* Signature Preview if e-signed */}
            {document.signatureDataUrl ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Captured Electronic Drawn Signature:</span>
                <img 
                  src={document.signatureDataUrl} 
                  alt="Applicant Drawn Signature" 
                  className="max-h-24 mx-auto border border-dashed border-slate-300 rounded p-1 bg-white"
                />
                <span className="text-[10px] text-slate-500 block">
                  Signer: {applicantName} • Date: {document.submittedDate}
                </span>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <span className="text-xs font-bold text-slate-700 block">
                  {document.fileName || "Verified Document Content"}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Simulated verified attachment conforming to SiBS document standards.
                </span>
              </div>
            )}
          </div>

          {/* Correction Form if requested */}
          {showCorrectionForm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <span className="font-bold text-red-900 block">
                Enter Mandatory Correction Remarks for Candidate:
              </span>
              <textarea
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Scanned document is blurry, page 2 is missing, or signature does not match ID..."
                className="w-full p-2.5 bg-white border border-red-300 rounded-lg text-xs focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCorrectionForm(false)}
                  className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  Cancel Return
                </button>
                <button
                  type="button"
                  onClick={handleReturn}
                  className="px-4 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Confirm Return for Correction
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showCorrectionForm && (
          <div className="px-6 py-4 bg-slate-50 border-t border-[#E6ECF2] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCorrectionForm(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
            >
              Needs Correction (Return)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleVerify}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify Document</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
