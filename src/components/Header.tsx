import React from "react";
import {
  FileText,
  Sparkles,
  RotateCcw,
  BookOpen,
  Download,
  Info,
} from "lucide-react";
import { SAMPLE_TEXTS, SampleText } from "../data/sampleTexts";

interface HeaderProps {
  onSelectSample: (sample: SampleText) => void;
  onClear: () => void;
  onRunAiAnalysis: () => void;
  onExport: () => void;
  isAiLoading: boolean;
  hasText: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectSample,
  onClear,
  onRunAiAnalysis,
  onExport,
  isAiLoading,
  hasText,
}) => {
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
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  محلل البلاغة والنحو الذكي
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  إحصاء وإعراب
                </span>
              </div>
              <p className="text-xs text-[#A0AEC0]">
                تعداد الكلمات، إبراز التكرار، وتبويب الأقسام النحوية والإعراب
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

            {/* Export Summary Button */}
            {hasText && (
              <button
                id="btn-export-report"
                onClick={onExport}
                className="flex items-center gap-1.5 text-xs font-medium text-[#CBD5E0] bg-[#161B22] hover:bg-[#21262d] px-3 py-2 rounded-lg border border-[#2D3748] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>تصدير التقرير</span>
              </button>
            )}

            {/* AI Deep Grammar Analysis */}
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
                {isAiLoading ? "جاري التحليل بالنحو الذكي..." : "إعراب مفصل بالذكاء الاصطناعي"}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
