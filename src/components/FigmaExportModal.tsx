import React, { useState } from "react";
import {
  X,
  Download,
  Figma,
  Layers,
  Sparkles,
  CheckCircle,
  FileCode,
  Palette,
  ExternalLink,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";
import {
  SIBS_FIGMA_TOKENS,
  generateFigmaCanvasSvg,
  generateFigmaHtmlSpec,
  downloadFile
} from "../utils/figmaExporter";

interface FigmaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FigmaExportModal({ isOpen, onClose }: FigmaExportModalProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [downloadedAsset, setDownloadedAsset] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTokens = () => {
    const jsonStr = JSON.stringify(SIBS_FIGMA_TOKENS, null, 2);
    downloadFile("sibs-hris-figma-tokens.json", jsonStr, "application/json");
    setDownloadedAsset("tokens");
    setTimeout(() => setDownloadedAsset(null), 3000);
  };

  const handleDownloadCanvasSvg = () => {
    const svgStr = generateFigmaCanvasSvg();
    downloadFile("sibs-hris-figma-frames.svg", svgStr, "image/svg+xml");
    setDownloadedAsset("canvas");
    setTimeout(() => setDownloadedAsset(null), 3000);
  };

  const handleDownloadHtmlSpec = () => {
    const htmlStr = generateFigmaHtmlSpec();
    downloadFile("sibs-hris-figma-design-spec.html", htmlStr, "text/html");
    setDownloadedAsset("html");
    setTimeout(() => setDownloadedAsset(null), 3000);
  };

  const handleCopyTokensJson = () => {
    const jsonStr = JSON.stringify(SIBS_FIGMA_TOKENS, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* ==================== MODAL HEADER ==================== */}
        <div className="bg-[#042C51] px-6 py-5 text-white flex items-center justify-between relative overflow-hidden border-b border-[#0B365F]">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FF5C28]/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#FF5C28] text-white flex items-center justify-center shadow-md shadow-orange-900/30 shrink-0">
              <Figma className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Figma Ready-to-Upload Design Bundle
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#FFF2ED] text-[#FF5C28] text-[10.5px] font-black uppercase tracking-wider border border-[#FFD8CA]">
                  10 Core UI Screens
                </span>
              </div>
              <p className="text-xs text-[#8FAEC9]">
                Export ready-to-import Figma Design Tokens, Multi-Artboard Vector Canvas SVG, and HTML Specs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================== MODAL BODY ==================== */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto bg-[#F7F9FC]">

          {/* Banner */}
          <div className="bg-white rounded-xl p-4 border border-[#E6ECF2] shadow-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#FF5C28] shrink-0 mt-0.5" />
            <div className="text-xs text-[#334155] space-y-1">
              <p className="font-extrabold text-[#042C51]">
                Complete Front-End Design Coverage for Figma:
              </p>
              <p className="text-[#667085] leading-relaxed">
                You can import this entire project into Figma using 3 standard methods depending on your workflow preference.
              </p>
            </div>
          </div>

          {/* Asset Download Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Asset 1: Vector Canvas SVG */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] hover:border-[#FF5C28] p-4 shadow-xs transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF0F7] text-[#042C51] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5 text-[#042C51]" />
                </div>
                <h3 className="text-xs font-black text-[#042C51] leading-tight">
                  1. Figma Canvas Vector SVG
                </h3>
                <p className="text-[11px] text-[#667085] leading-relaxed">
                  Contains 10 scalable 1920×1080 desktop artboards covering all front-end UI screens.
                </p>
                <div className="pt-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#EBF5FB] text-[#21618C] text-[10px] font-bold border border-[#AED6F1]">
                    Direct Drag &amp; Drop into Figma
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownloadCanvasSvg}
                className="w-full py-2 px-3 rounded-xl bg-[#042C51] hover:bg-[#FF5C28] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .SVG Frames</span>
              </button>
            </div>

            {/* Asset 2: Tokens Studio JSON */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] hover:border-[#FF5C28] p-4 shadow-xs transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FFF2ED] text-[#FF5C28] flex items-center justify-center font-bold">
                  <Palette className="w-5 h-5 text-[#FF5C28]" />
                </div>
                <h3 className="text-xs font-black text-[#042C51] leading-tight">
                  2. Figma Design Tokens (JSON)
                </h3>
                <p className="text-[11px] text-[#667085] leading-relaxed">
                  Full W3C Design Tokens JSON with Navy/Orange colors, Plus Jakarta typography &amp; component styles.
                </p>
                <div className="pt-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#E8F8F0] text-[#1E8449] text-[10px] font-bold border border-[#A9DFBF]">
                    Tokens Studio for Figma
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownloadTokens}
                  className="flex-1 py-2 px-2 rounded-xl bg-[#042C51] hover:bg-[#FF5C28] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .JSON</span>
                </button>
                <button
                  onClick={handleCopyTokensJson}
                  className="p-2 rounded-xl bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] text-xs transition-colors cursor-pointer"
                  title="Copy JSON to Clipboard"
                >
                  {copiedToken ? <Check className="w-4 h-4 text-[#2ECC71]" /> : <Copy className="w-4 h-4 text-[#215789]" />}
                </button>
              </div>
            </div>

            {/* Asset 3: HTML-to-Figma Spec */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] hover:border-[#FF5C28] p-4 shadow-xs transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF0F7] text-[#042C51] flex items-center justify-center font-bold">
                  <FileCode className="w-5 h-5 text-[#215789]" />
                </div>
                <h3 className="text-xs font-black text-[#042C51] leading-tight">
                  3. HTML-to-Figma UI Bundle
                </h3>
                <p className="text-[11px] text-[#667085] leading-relaxed">
                  Full front-end DOM spec HTML file ready for automated conversion into Figma Auto-Layout layers.
                </p>
                <div className="pt-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#FEF5E7] text-[#E67E22] text-[10px] font-bold border border-[#FAD7A0]">
                    HTML to Design Plugin
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownloadHtmlSpec}
                className="w-full py-2 px-3 rounded-xl bg-[#042C51] hover:bg-[#FF5C28] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .HTML Spec</span>
              </button>
            </div>

          </div>

          {/* Download Success Confirmation Toast */}
          {downloadedAsset && (
            <div className="bg-[#E8F8F0] border border-[#A9DFBF] text-[#1E8449] p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-[#1E8449]" />
              <span>Asset generated and downloaded successfully! Ready to upload to Figma.</span>
            </div>
          )}

          {/* ==================== STEP-BY-STEP UPLOAD INSTRUCTIONS ==================== */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider border-b border-[#E6ECF2] pb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#FF5C28]" />
              <span>How to Import into Figma (3 Simple Ways)</span>
            </h3>

            <div className="space-y-3 text-xs">

              {/* Method 1 */}
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] space-y-1">
                <div className="flex items-center gap-2 font-black text-[#042C51]">
                  <span className="w-5 h-5 rounded-full bg-[#042C51] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Method 1: Direct Drag-and-Drop (Instant)</span>
                </div>
                <p className="text-[#475569] pl-7">
                  Download <strong className="text-[#042C51]">sibs-hris-figma-frames.svg</strong>. Open Figma, create a new canvas, and drag the downloaded .SVG file straight into Figma. Figma will automatically render all 10 desktop screen artboards as editable vector shapes and text layers!
                </p>
              </div>

              {/* Method 2 */}
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] space-y-1">
                <div className="flex items-center gap-2 font-black text-[#042C51]">
                  <span className="w-5 h-5 rounded-full bg-[#FF5C28] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Method 2: Import Variables &amp; Tokens (Tokens Studio Plugin)</span>
                </div>
                <p className="text-[#475569] pl-7">
                  Download <strong className="text-[#042C51]">sibs-hris-figma-tokens.json</strong>. In Figma, open the free <em>"Tokens Studio for Figma"</em> plugin (or Figma Native Variables), click <strong>Import JSON</strong>, and select the file to load all SiBS Navy `#042C51` &amp; Orange `#FF5C28` color styles, Plus Jakarta Sans typography, and component radii.
                </p>
              </div>

              {/* Method 3 */}
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] space-y-1">
                <div className="flex items-center gap-2 font-black text-[#042C51]">
                  <span className="w-5 h-5 rounded-full bg-[#215789] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Method 3: HTML to Figma Plugin (Auto-Layout Frame Conversion)</span>
                </div>
                <p className="text-[#475569] pl-7">
                  Download <strong className="text-[#042C51]">sibs-hris-figma-design-spec.html</strong>. Open Figma and run the free <em>"html to design"</em> or <em>"HTML to Figma"</em> plugin. Import the HTML file to automatically generate auto-layout responsive Figma frames with live DOM components!
                </p>
              </div>

            </div>
          </div>

          {/* Included 10 Front-End Screens Roster */}
          <div className="bg-[#042C51] text-white rounded-2xl p-4 space-y-2 border border-[#0B365F]">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FFA488]">
              Covered Front-End Modules (10/10 Screens)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] font-bold text-[#8FAEC9]">
              <span className="p-1.5 rounded bg-[#0B365F] truncate">1. RAMPS Plan</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">2. PRF Intake</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">3. JD Factor Matrix</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">4. Sourcing Leads</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">5. Assessment Pipeline</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">6. Offer Matrix</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">7. Statutory Compliance</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">8. 201 Directory</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">9. Time &amp; Attendance</span>
              <span className="p-1.5 rounded bg-[#0B365F] truncate">10. Process Specbook</span>
            </div>
          </div>

        </div>

        {/* ==================== MODAL FOOTER ==================== */}
        <div className="bg-white border-t border-[#E6ECF2] px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-[#667085] font-medium">
            SiBS HRIS Solutions Inc. • Figma Design System &amp; Tokens Bundle
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Exporter
          </button>
        </div>
      </div>
    </div>
  );
}
