import React from "react";
import { AiGrammarResult } from "../types";
import {
  X,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  AlertCircle,
  FileText,
} from "lucide-react";

interface AiGrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AiGrammarResult | null;
  error: string | null;
  isLoading: boolean;
}

export const AiGrammarModal: React.FC<AiGrammarModalProps> = ({
  isOpen,
  onClose,
  result,
  error,
  isLoading,
}) => {
  if (!isOpen) return null;

  const handleCopyReport = () => {
    if (!result) return;
    let textReport = `=== الإعراب والتحليل النحوي المفصل (الذكاء الاصطناعي) ===\n\n`;
    textReport += `الملخص النحوي: ${result.summary}\n\n`;
    result.sentencesIrab.forEach((s, idx) => {
      textReport += `--- الجملة [${idx + 1}]: ${s.sentence} ---\n`;
      s.wordsDetail.forEach((w) => {
        textReport += `• ${w.word} (${w.posArabic}): ${w.irabRole} [جذر: ${w.root || "غير محدد"}]\n`;
      });
      textReport += `\n`;
    });
    navigator.clipboard.writeText(textReport);
    alert("تم نسخ تقرير الإعراب كاملاً بنجاح!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1115]/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="bg-[#161B22] border border-[#2D3748] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2D3748] bg-[#1A202C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                جدول الإعراب والتحليل النحوي المفصل (Gemini AI)
              </h3>
              <p className="text-xs text-[#A0AEC0]">
                تحليل إعرابي ودلالي وتصريفي مع الضبط بالتشكيل والجذور
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#A0AEC0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-right">
          
          {isLoading && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-white">
                جاري إجراء الإعراب والتحليل النحوي الدقيق عبر الذكاء الاصطناعي...
              </p>
              <p className="text-xs text-[#A0AEC0]">
                يتم تصنيف المفردات، تحديد الموقع الإعرابي، وإخراج جدول التشكيل.
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs mb-1">تعذر إكمال التحليل النحوي</h4>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <>
              {/* Summary Box */}
              <div className="p-4 rounded-lg bg-[#0D1117] border border-[#2D3748]">
                <h4 className="text-xs font-bold text-[#D4AF37] mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  الملخص النحوي والبلاغي للنص:
                </h4>
                <p className="text-xs text-[#CBD5E0] leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Sentences Irab Section */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  جدول إعراب الجمل والمفردات تفصيلياً:
                </h4>

                {result.sentencesIrab.map((sentenceObj, sIdx) => (
                  <div
                    key={sIdx}
                    className="border border-[#2D3748] rounded-xl overflow-hidden bg-[#0D1117]"
                  >
                    {/* Sentence Header */}
                    <div className="p-3.5 bg-[#1A202C] border-b border-[#2D3748] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="font-bold text-sm text-white font-sans">
                        <span className="text-[#D4AF37] ml-1.5">[{sIdx + 1}]</span>
                        {sentenceObj.sentence}
                      </div>
                      {sentenceObj.translation && (
                        <div className="text-xs text-[#A0AEC0] italic">
                          {sentenceObj.translation}
                        </div>
                      )}
                    </div>

                    {/* Word Details Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-[#161B22] text-[#A0AEC0] font-semibold border-b border-[#2D3748]">
                          <tr>
                            <th className="p-2.5 pr-4">الكلمة بالتشكيل</th>
                            <th className="p-2.5">قسم الكلام</th>
                            <th className="p-2.5">الجذر / الوزن</th>
                            <th className="p-2.5 pl-4">الإعراب والموقع النحوي</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2D3748]">
                          {sentenceObj.wordsDetail.map((w, wIdx) => (
                            <tr key={wIdx} className="hover:bg-[#1A202C]/60 transition-colors">
                              <td className="p-2.5 pr-4 font-bold text-sm text-white">
                                {w.diacritics || w.word}
                              </td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-semibold text-[11px]">
                                  {w.posArabic}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-[#A0AEC0]">
                                {w.root ? `${w.root} (${w.weight || "فعل"})` : "—"}
                              </td>
                              <td className="p-2.5 pl-4 font-medium text-[#CBD5E0] leading-normal">
                                {w.irabRole}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2D3748] bg-[#1A202C] flex items-center justify-between">
          {result && !isLoading && (
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c29f31] text-[#1A202C] transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ تقرير الإعراب</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-[#161B22] hover:bg-[#2D3748] text-[#CBD5E0] border border-[#2D3748] mr-auto transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
