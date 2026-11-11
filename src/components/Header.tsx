import React, { useRef } from "react";
import {
  FileText,
  Sparkles,
  RotateCcw,
  BookOpen,
  Download,
  Info,
  Github,
  Upload,
  BookOpenCheck,
  ShieldCheck,
} from "lucide-react";
import { SAMPLE_TEXTS, SampleText } from "../data/sampleTexts";
import { parseDocumentFile } from "../utils/documentParser";

interface HeaderProps {
  onSelectSample: (sample: SampleText) => void;
  onClear: () => void;
  onRunAiAnalysis: () => void;
  onExport: () => void;
  onImportText?: (importedText: string) => void;
  onOpenImportModal?: () => void;
  onOpenSentenceIrab?: () => void;
  isAiLoading: boolean;
  hasText: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectSample,
  onClear,
  onRunAiAnalysis,
  onExport,
  onImportText,
  onOpenImportModal,
  onOpenSentenceIrab,
  isAiLoading,
  hasText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onOpenImportModal) {
      onOpenImportModal();
      return;
    }

    try {
      const result = await parseDocumentFile(file);
      if (result.text && onImportText) {
        onImportText(result.text);
      }
    } catch (err: any) {
      console.error("File parse error:", err);
      alert(err?.message || "تعذر استخراج النص من الملف.");
    }
    e.target.value = "";
  };
  return (
    <header className="bg-[#1A202C] border-b border-[#2D3748] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo and Main Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 bg-[#D4AF37] rounded flex items-center justify-center text-[#1A202C] font-extrabold text-lg shrink-0">
              ع
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  محلل البلاغة والنحو الذكي
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  إحصاء وإعراب
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#21262d] text-[#CBD5E0] border border-[#30363d] tracking-wide flex items-center gap-1" title="Nom en français">
                  <span className="text-[#D4AF37] font-semibold">FR:</span> Arabe Texte Analyse
                </span>
              </div>
              <p className="text-xs text-[#A0AEC0] flex items-center gap-2 mt-0.5">
                <span>تعداد الكلمات، إبراز التكرار، وتبويب الأقسام النحوية والإعراب</span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/25">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>خادم وسيط آمن (API Proxy)</span>
                </span>
              </p>
            </div>
          </div>

          {/* Controls & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
            
            {/* Sample Texts Selector */}
            <div className="relative group">
              <select
                id="sample-text-select"
                aria-label="اختر نصاً نموذجياً"
                onChange={(e) => {
                  const found = SAMPLE_TEXTS.find((s) => s.id === e.target.value);
                  if (found) onSelectSample(found);
                  e.target.value = "";
                }}
                defaultValue=""
                className="appearance-none bg-[#161B22] hover:bg-[#21262d] text-[#CBD5E0] text-xs font-medium px-3.5 py-2 pl-8 rounded-lg border border-[#2D3748] cursor-pointer transition-colors focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="" disabled className="bg-[#161B22] text-[#A0AEC0]">
                  📚 اختر نصاً نموذجياً...
                </option>
                {SAMPLE_TEXTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#161B22] text-[#E2E8F0]">
                    {s.title} ({s.category})
                  </option>
                ))}
              </select>
              <FileText className="w-3.5 h-3.5 text-[#A0AEC0] pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Import Text / Document Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.text,.rtf,.json"
              onChange={handleFileChange}
              className="hidden"
              id="file-input-header"
            />
            <button
              id="btn-import-document"
              onClick={() => {
                if (onOpenImportModal) {
                  onOpenImportModal();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              title="استيراد نص أو مستند (PDF / Word / TXT)"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E0] bg-[#161B22] hover:bg-[#21262d] hover:text-[#D4AF37] px-3 py-2 rounded-lg border border-[#2D3748] transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">استيراد (PDF / Word)</span>
              <span className="sm:hidden">استيراد</span>
            </button>

            {/* Clear Button */}
            {hasText && (
              <button
                id="btn-clear-text"
                onClick={onClear}
                title="مسح النص"
                className="flex items-center gap-1.5 text-xs font-medium text-[#A0AEC0] hover:text-red-400 bg-[#161B22] hover:bg-red-500/10 px-3 py-2 rounded-lg border border-[#2D3748] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>مسح</span>
              </button>
            )}

            {/* Export Text & Report Button */}
            {hasText && (
              <button
                id="btn-export-report"
                onClick={onExport}
                title="تصدير النص والتقرير بصيغ متعددة (TXT, Markdown, PDF, CSV, JSON)"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E0] bg-[#161B22] hover:bg-[#21262d] hover:text-[#D4AF37] px-3 py-2 rounded-lg border border-[#2D3748] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>تصدير النص والتقرير</span>
              </button>
            )}

            {/* Dedicated Sentence Parsing Button */}
            <button
              id="btn-open-sentence-irab"
              onClick={onOpenSentenceIrab}
              title="إعراب جملة مخصصة بالذكاء الاصطناعي (تفكيك تركيبي وإعراب تفصيلي لكل كلمة ومحل الجملة)"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/35 px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              <BookOpenCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>إعراب جملة</span>
            </button>

            {/* AI Deep Grammar & Rhetoric Analysis */}
            <button
              id="btn-ai-grammar"
              onClick={onRunAiAnalysis}
              disabled={isAiLoading || !hasText}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                isAiLoading || !hasText
                  ? "bg-[#2D3748] text-[#718096] cursor-not-allowed border border-[#2D3748]"
                  : "bg-[#D4AF37] hover:bg-[#c29f31] text-[#1A202C] shadow-sm shadow-[#D4AF37]/20"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
              <span>
                {isAiLoading ? "جاري تحليل النحو والبلاغة..." : "إعراب وتحليل بلاغي (AI)"}
              </span>
            </button>

            {/* GitHub Repository Link */}
            <a
              id="btn-github-repo"
              href="https://github.com/dridi0207/arabic-nlp-grammar-suite"
              target="_blank"
              rel="noopener noreferrer"
              title="مستودع المشروع على GitHub (Open Source)"
              className="flex items-center gap-1.5 text-xs font-medium text-[#A0AEC0] hover:text-white bg-[#161B22] hover:bg-[#21262d] px-2.5 sm:px-3 py-2 rounded-lg border border-[#2D3748] transition-colors"
            >
              <Github className="w-4 h-4 text-[#A0AEC0]" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
