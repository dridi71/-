import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Zap,
  Copy,
  Check,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  FileCheck,
} from "lucide-react";
import { DocumentImportResult } from "../types";
import {
  parseDocumentFile,
  extractDocumentWithAi,
  isArabicTextReversed,
  reverseArabicWords,
  getArabicTextCounts,
} from "../utils/documentParser";

interface ImportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportText: (text: string, mode: "replace" | "append") => void;
  currentTextLength: number;
}

export const ImportDocumentModal: React.FC<ImportDocumentModalProps> = ({
  isOpen,
  onClose,
  onImportText,
  currentTextLength,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<DocumentImportResult | null>(null);
  const [previewText, setPreviewText] = useState<string>("");
  const [useAiExtraction, setUseAiExtraction] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setLoading(false);
    setLoadingStage("");
    setErrorMessage(null);
    setParseResult(null);
    setPreviewText("");
    setUseAiExtraction(false);
    setCopied(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} م.ب`;
  };

  const getFileBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
      return {
        label: "Word",
        ext: lower.endsWith(".docx") ? "DOCX" : "DOC",
        bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        icon: FileText,
      };
    }
    if (lower.endsWith(".pdf")) {
      return {
        label: "PDF",
        ext: "PDF",
        bg: "bg-red-500/10 text-red-400 border-red-500/30",
        icon: FileText,
      };
    }
    if (lower.endsWith(".json")) {
      return {
        label: "JSON",
        ext: "JSON",
        bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        icon: FileCode,
      };
    }
    return {
      label: "نص",
      ext: "TXT / MD",
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: FileText,
    };
  };

  const processFile = async (file: File, forceAi: boolean = false) => {
    setSelectedFile(file);
    setLoading(true);
    setErrorMessage(null);
    setParseResult(null);
    setPreviewText("");

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const isWord = file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc");

    if (forceAi) {
      setLoadingStage("جارٍ استخراج وتدقيق النص بواسطة نموذج الذكاء الاصطناعي (Gemini 2.5 Flash)...");
    } else if (isWord) {
      setLoadingStage("جارٍ تفكيك مستند Word واستخراج النصوص والفقرات...");
    } else if (isPdf) {
      setLoadingStage("جارٍ قراءة صفحات PDF واستخراج النصوص العربية الرقمية...");
    } else {
      setLoadingStage("جارٍ قراءة الملف النصي...");
    }

    try {
      const result = await parseDocumentFile(file, forceAi);
      
      if (!result.text || result.text.trim().length === 0) {
        if (isPdf && !forceAi) {
          // Scanned PDF detection: offer auto-retry with Gemini AI
          setLoadingStage("يبدو أن مستند PDF مصوّر ولا يحتوي نصاً رقمياً. جلب النص بواسطة الذكاء الاصطناعي...");
          const aiResult = await extractDocumentWithAi(file, "application/pdf");
          const counts = getArabicTextCounts(aiResult.text);
          const finalResult: DocumentImportResult = {
            text: aiResult.text,
            fileName: file.name,
            fileSize: file.size,
            fileType: "pdf",
            wordCount: counts.wordCount,
            charCount: counts.charCount,
            isScanned: true,
            method: "gemini-ai",
          };
          setParseResult(finalResult);
          setPreviewText(finalResult.text);
          setUseAiExtraction(true);
          return;
        }
        throw new Error("لم يتم العثور على أي نصوص قابلة للاستخراج داخل المستند المختار.");
      }

      setParseResult(result);
      setPreviewText(result.text);
    } catch (err: any) {
      console.error("Document parsing error:", err);
      setErrorMessage(
        err?.message || "تعذر قراءة محتوى المستند. تأكد من سلامة الملف أو جرّب خيار الاستخراج بالذكاء الاصطناعي."
      );
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, useAiExtraction);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, useAiExtraction);
    }
    e.target.value = "";
  };

  const handleReExtractWithAi = () => {
    if (selectedFile) {
      setUseAiExtraction(true);
      processFile(selectedFile, true);
    }
  };

  const handleToggleReverseRtl = () => {
    if (previewText) {
      const reversed = reverseArabicWords(previewText);
      setPreviewText(reversed);
      if (parseResult) {
        setParseResult({
          ...parseResult,
          text: reversed,
        });
      }
    }
  };

  const handleCopyPreview = () => {
    if (previewText) {
      navigator.clipboard.writeText(previewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = (mode: "replace" | "append") => {
    if (previewText.trim()) {
      onImportText(previewText.trim(), mode);
      handleClose();
    }
  };

  const badgeInfo = selectedFile ? getFileBadge(selectedFile.name) : null;
  const BadgeIcon = badgeInfo?.icon || FileText;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1A202C] border-b border-[#2D3748] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>استيراد مستند / نص</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  PDF & Word
                </span>
              </h2>
              <p className="text-xs text-[#A0AEC0] mt-0.5">
                استخرج النصوص العربية من مستندات Word، ملفات PDF، والنصوص الخارجية بدقة عالية
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#A0AEC0] hover:text-white hover:bg-[#2D3748] rounded-lg transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Format Badges Supported */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#1A202C] border border-[#2D3748] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-bold text-xs">
                DOCX
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">مستند Word</div>
                <div className="text-[10px] text-[#A0AEC0]">.docx, .doc</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1A202C] border border-[#2D3748] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 font-bold text-xs">
                PDF
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">مستند PDF</div>
                <div className="text-[10px] text-[#A0AEC0]">رقمي ومصوّر</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1A202C] border border-[#2D3748] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs">
                TXT
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">نص / ماركداون</div>
                <div className="text-[10px] text-[#A0AEC0]">.txt, .md, .json</div>
              </div>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md,.text,.rtf,.json"
            onChange={handleFileInputChange}
            className="hidden"
            id="modal-document-file-input"
          />

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]"
                  : "border-[#2D3748] hover:border-[#D4AF37]/50 bg-[#0D1117] hover:bg-[#1A202C]/50"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#1A202C] border border-[#2D3748] flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-bold text-white">
                  اسحب ملف Word أو PDF هنا أو انقر لتصفح جهازك
                </p>
                <p className="text-xs text-[#A0AEC0]">
                  يدعم صيغ Word (.docx, .doc)، مستندات PDF، والملفات النصية (.txt, .md, .json) حتى 25 ميغابايت
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#1A202C] text-[#CBD5E0] border border-[#2D3748]">
                  استخراج فوري وسلس
                </span>
                <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  معالجة ذكية بالذكاء الاصطناعي
                </span>
              </div>
            </div>
          ) : (
            /* Selected File Card */
            <div className="bg-[#0D1117] border border-[#2D3748] rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {badgeInfo && (
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${badgeInfo.bg}`}
                    >
                      <BadgeIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {selectedFile.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#A0AEC0] mt-0.5">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#CBD5E0]">
                        {badgeInfo?.ext || "مستند"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-[#CBD5E0] hover:text-white bg-[#1A202C] hover:bg-[#2D3748] px-3 py-1.5 rounded-lg border border-[#2D3748] transition-colors flex items-center gap-1"
                    title="تغيير الملف"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تغيير الملف</span>
                  </button>
                  <button
                    onClick={resetState}
                    className="p-1.5 text-[#A0AEC0] hover:text-red-400 hover:bg-[#1A202C] rounded-lg transition-colors"
                    title="حذف"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Extraction method badge & switcher */}
              {parseResult && (
                <div className="pt-3 border-t border-[#2D3748]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A0AEC0]">طريقة الاستخراج:</span>
                    {parseResult.method === "gemini-ai" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold text-[11px]">
                        <Sparkles className="w-3 h-3" />
                        ذكاء اصطناعي (Gemini 2.5 Flash)
                      </span>
                    ) : parseResult.method === "mammoth" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold text-[11px]">
                        <Zap className="w-3 h-3" />
                        مباشر (Word Mammoth Engine)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 font-semibold text-[11px]">
                        <Zap className="w-3 h-3" />
                        مباشر (PDF.js Digital Layer)
                      </span>
                    )}
                  </div>

                  {parseResult.method !== "gemini-ai" && (
                    <button
                      onClick={handleReExtractWithAi}
                      disabled={loading}
                      className="text-[11px] font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
                      title="استخرج النص بواسطة الذكاء الاصطناعي لحل مشاكل الخطوط أو التنسيقات المعقدة"
                    >
                      <Sparkles className="w-3 h-3" />
                      إعادة استخراج دقيقة بالذكاء الاصطناعي
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-[#1A202C] border border-[#D4AF37]/40 rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">جارٍ استخراج النص من المستند...</p>
                <p className="text-xs text-[#A0AEC0]">{loadingStage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 text-red-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-red-200">حدث خطأ أثناء قراءة المستند</p>
                <p>{errorMessage}</p>
                {selectedFile && (
                  <button
                    onClick={handleReExtractWithAi}
                    className="mt-1 text-xs font-semibold px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/40 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    محاولة الاستخراج بنموذج الذكاء الاصطناعي (Gemini)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Extracted Text Preview Box */}
          {parseResult && !loading && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#D4AF37]" />
                    معاينة النص المستخرج
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#A0AEC0]">
                    <span className="px-2 py-0.5 bg-[#1A202C] rounded border border-[#2D3748]">
                      {parseResult.wordCount} كلمة
                    </span>
                    <span className="px-2 py-0.5 bg-[#1A202C] rounded border border-[#2D3748]">
                      {parseResult.charCount} حرف
                    </span>
                    {parseResult.pageCount && (
                      <span className="px-2 py-0.5 bg-[#1A202C] rounded border border-[#2D3748] flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#D4AF37]" />
                        {parseResult.pageCount} صفحة
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reversed Arabic check/repair button */}
                  <button
                    onClick={handleToggleReverseRtl}
                    className="text-[11px] font-semibold text-[#CBD5E0] hover:text-[#D4AF37] bg-[#1A202C] hover:bg-[#2D3748] px-2.5 py-1 rounded-md border border-[#2D3748] transition-colors flex items-center gap-1"
                    title="عكس اتجاه الحروف في حال كانت خطوط الـ PDF مقلوبة"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>عكس/إصلاح الحروف</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyPreview}
                    className="text-[11px] font-semibold text-[#CBD5E0] hover:text-[#D4AF37] bg-[#1A202C] hover:bg-[#2D3748] px-2.5 py-1 rounded-md border border-[#2D3748] transition-colors flex items-center gap-1"
                    title="نسخ النص بالكامل"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Text Area Preview */}
              <div className="relative">
                <textarea
                  value={previewText}
                  onChange={(e) => {
                    setPreviewText(e.target.value);
                    const counts = getArabicTextCounts(e.target.value);
                    if (parseResult) {
                      setParseResult({
                        ...parseResult,
                        text: e.target.value,
                        wordCount: counts.wordCount,
                        charCount: counts.charCount,
                      });
                    }
                  }}
                  rows={8}
                  dir="rtl"
                  className="w-full bg-[#0D1117] border border-[#2D3748] focus:border-[#D4AF37] rounded-xl p-3.5 text-sm text-[#F7FAFC] leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-['Cairo',sans-serif]"
                  placeholder="النص المستخرج سيظهر هنا..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#1A202C] border-t border-[#2D3748] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#A0AEC0] w-full sm:w-auto text-center sm:text-right">
            {currentTextLength > 0 ? (
              <span>
                يوجد نص حالي في المحلل ({currentTextLength} حرف). يمكنك استبداله أو إلحاق النص به.
              </span>
            ) : (
              <span>سيتم نقل النص المستخرج مباشرة إلى محلل البلاغة والنحو الذكي.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-[#CBD5E0] hover:text-white bg-[#161B22] hover:bg-[#2D3748] rounded-xl border border-[#2D3748] transition-colors"
            >
              إلغاء
            </button>

            {currentTextLength > 0 && (
              <button
                id="btn-append-document-text"
                disabled={!previewText.trim() || loading}
                onClick={() => handleApply("append")}
                className="px-4 py-2 text-xs font-semibold text-[#D4AF37] hover:text-[#E2C766] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                title="إضافة هذا النص في نهاية النص الموجود حالياً"
              >
                <span>إلحاق بالنص الحالي</span>
              </button>
            )}

            <button
              id="btn-replace-document-text"
              disabled={!previewText.trim() || loading}
              onClick={() => handleApply("replace")}
              className="px-5 py-2 text-xs font-bold text-[#1A202C] bg-[#D4AF37] hover:bg-[#E2C766] rounded-xl shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              title="استبدال النص الحالي والبدء في التحليل"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>استبدال والبدء بالتحليل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
