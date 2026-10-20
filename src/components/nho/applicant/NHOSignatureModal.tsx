import React, { useRef, useState, useEffect } from "react";
import { useNHO } from "../NHOContext";
import { NHODocumentItem } from "../nhoTypes";
import { 
  X, 
  RotateCcw, 
  Check, 
  FileText, 
  Upload, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";

interface NHOSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: NHODocumentItem;
  applicantId: string;
}

export default function NHOSignatureModal({
  isOpen,
  onClose,
  document,
  applicantId
}: NHOSignatureModalProps) {
  const { submitAgreement, showToast } = useNHO();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [method, setMethod] = useState<"Electronic Signature" | "Manual Upload">("Electronic Signature");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [manualFileName, setManualFileName] = useState("");

  useEffect(() => {
    if (isOpen && method === "Electronic Signature") {
      setTimeout(() => {
        initCanvas();
      }, 100);
    }
  }, [isOpen, method]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#042C51";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  if (!isOpen) return null;

  // Canvas coordinate helper with responsive scaling
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const isTouch = "touches" in e;
    const clientX = isTouch && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ("touches" in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ("touches" in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSubmit = () => {
    if (method === "Electronic Signature") {
      if (!hasDrawn) {
        showToast("Please provide your signature on the drawing canvas before submitting.", "error");
        return;
      }
      if (!consentChecked) {
        showToast("You must select the electronic consent acknowledgment checkbox.", "error");
        return;
      }

      const canvas = canvasRef.current;
      const dataUrl = canvas ? canvas.toDataURL("image/png") : undefined;
      submitAgreement(applicantId, document.id, "Electronic Signature", dataUrl);
      onClose();
    } else {
      if (!manualFileName.trim()) {
        showToast("Please select a signed document file to upload.", "error");
        return;
      }
      submitAgreement(applicantId, document.id, "Manual Upload", undefined, manualFileName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#042C51] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5C28] block">
              Essential Agreement Signing
            </span>
            <h2 className="text-sm font-bold tracking-tight">{document.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Toggle */}
        <div className="px-6 py-2.5 bg-[#F7F9FC] border-b border-[#E6ECF2] flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMethod("Electronic Signature")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              method === "Electronic Signature" ? "bg-[#042C51] text-white" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            Method A: Electronic Drawn Signature
          </button>
          <button
            type="button"
            onClick={() => setMethod("Manual Upload")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              method === "Manual Upload" ? "bg-[#042C51] text-white" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            Method B: Manual Signed Copy Upload
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Agreement summary context */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#042C51] block text-xs">Contract Terms Acknowledgment</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              By executing this agreement, you affirm that you have reviewed the provisions of <strong>{document.name}</strong>, understand your employee obligations, and agree to uphold all stipulated operational and confidentiality policies.
            </p>
          </div>

          {method === "Electronic Signature" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block">
                  Draw Signature Canvas:
                </label>
                <button
                  type="button"
                  onClick={initCanvas}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#042C51] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Canvas</span>
                </button>
              </div>

              {/* HTML5 Canvas */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white p-1 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 touch-none cursor-crosshair bg-white"
                />
              </div>

              <span className="text-[10px] text-slate-400 block text-center">
                Use your mouse, touchpad, or touchscreen to sign above within the box.
              </span>

              {/* Consent checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50/70 border border-orange-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#FF5C28] focus:ring-[#FF5C28]"
                />
                <span className="text-[11px] text-orange-950 leading-relaxed">
                  I understand that this is an electronic simulation of signing this agreement for the SiBS NHO process, and I confirm the submission of my signature.
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <span className="font-bold text-slate-700 block text-xs">
                  Upload Physically Signed & Scanned Agreement
                </span>
                <p className="text-[11px] text-slate-500">
                  Only the applicant may upload signed copies. Download the template, sign by hand, and upload the scanned PDF or image.
                </p>

                <input
                  type="file"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setManualFileName(e.target.files[0].name);
                    }
                  }}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#042C51] file:text-white hover:file:bg-[#0B365F] cursor-pointer"
                />
              </div>

              {manualFileName && (
                <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-900 text-xs flex items-center justify-between">
                  <span>Selected file: <strong>{manualFileName}</strong></span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-[#E6ECF2] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Submit for TA Verification
          </button>
        </div>
      </div>
    </div>
  );
}
