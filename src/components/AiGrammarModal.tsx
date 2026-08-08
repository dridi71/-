import React, { useState, useRef } from "react";
import { AiGrammarResult, AiRhetoricalFigure } from "../types";
import html2pdf from "html2pdf.js";
import {
  X,
  Sparkles,
  BookOpen,
  Copy,
  AlertCircle,
  FileText,
  Printer,
  Loader2,
  Feather,
  Palette,
  Layers,
  Quote,
  Eye,
  Award,
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
  const [activeTab, setActiveTab] = useState<"combined" | "grammar" | "rhetoric">("combined");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const rhetoricalFigures = result?.rhetoricalFigures || [];

  // Categorize figures for count badges
  const simileCount = rhetoricalFigures.filter(
    (f) => f.type === "simile" || f.typeArabicLabel.includes("تشبيه")
  ).length;
  const metaphorCount = rhetoricalFigures.filter(
    (f) => f.type === "metaphor" || f.typeArabicLabel.includes("استعارة")
  ).length;
  const metonymyCount = rhetoricalFigures.filter(
    (f) => f.type === "metonymy" || f.typeArabicLabel.includes("كناية")
  ).length;
  const badicCount = rhetoricalFigures.length - (simileCount + metaphorCount + metonymyCount);

  const getFigureBadgeStyle = (figure: AiRhetoricalFigure) => {
    const label = figure.typeArabicLabel || "";
    const type = figure.type || "";
    if (type === "simile" || label.includes("تشبيه")) {
      return {
        bg: "bg-purple-500/15 border-purple-500/40 text-purple-300",
        pill: "bg-purple-500 text-white",
        iconColor: "text-purple-400",
        borderCard: "border-purple-500/30 hover:border-purple-500/60",
      };
    }
    if (type === "metaphor" || label.includes("استعارة")) {
      return {
        bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
        pill: "bg-emerald-500 text-white",
        iconColor: "text-emerald-400",
        borderCard: "border-emerald-500/30 hover:border-emerald-500/60",
      };
    }
    if (type === "metonymy" || label.includes("كناية")) {
      return {
        bg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
        pill: "bg-amber-500 text-white",
        iconColor: "text-amber-400",
        borderCard: "border-amber-500/30 hover:border-amber-500/60",
      };
    }
    return {
      bg: "bg-blue-500/15 border-blue-500/40 text-blue-300",
      pill: "bg-blue-500 text-white",
      iconColor: "text-blue-400",
      borderCard: "border-blue-500/30 hover:border-blue-500/60",
    };
  };

  const handleCopyReport = () => {
    if (!result) return;
    let textReport = `=== التحليل النحوي والبلاغي المفصل (الذكاء الاصطناعي) ===\n\n`;
    textReport += `الملخص النحوي: ${result.summary}\n\n`;

    if (result.rhetoricalSummary) {
      textReport += `الملخص البلاغي وبيان الصور: ${result.rhetoricalSummary}\n\n`;
    }

    if (rhetoricalFigures.length > 0) {
      textReport += `--- الصور البيانية والبلاغية (التشبيه، الاستعارة، الكناية) ---\n`;
      rhetoricalFigures.forEach((fig, idx) => {
        textReport += `[${idx + 1}] ${fig.typeArabicLabel}: "${fig.textSegment}"\n`;
        textReport += `    • الشرح: ${fig.explanation}\n`;
        textReport += `    • الأثر الجمالي: ${fig.aestheticImpact}\n\n`;
      });
    }

    textReport += `--- جدول إعراب الجمل ---\n`;
    result.sentencesIrab.forEach((s, idx) => {
      textReport += `• الجملة [${idx + 1}]: ${s.sentence}\n`;
      s.wordsDetail.forEach((w) => {
        textReport += `  - ${w.word} (${w.posArabic}): ${w.irabRole} [جذر: ${w.root || "غير محدد"}]\n`;
      });
      textReport += `\n`;
    });

    navigator.clipboard.writeText(textReport);
    alert("تم نسخ تقرير التحليل النحوي والبلاغي كاملاً بنجاح!");
  };

  const handleExportPdf = async () => {
    if (!result || !pdfContainerRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = pdfContainerRef.current;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `تقرير_الإعراب_والتحليل_البلاغي_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("حدث خطأ أثناء تصدير ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F1115]/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="bg-[#161B22] border border-[#2D3748] rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2D3748] bg-[#1A202C] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shrink-0">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>التحليل النحوي والبلاغي للصور البيانية</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-[#A0AEC0]">
                إعراب مفصل واستخراج التشبيه، الاستعارة، الكناية، وجماليات البيان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#A0AEC0] hover:text-white hover:bg-[#2D3748] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Selection Tabs */}
        {result && !isLoading && (
          <div className="bg-[#0D1117] border-b border-[#2D3748] px-5 py-2.5 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab("combined")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "combined"
                  ? "bg-[#D4AF37] text-[#1A202C] font-bold shadow"
                  : "text-[#A0AEC0] hover:text-white hover:bg-[#1A202C]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>التقرير الشامل المدمج</span>
            </button>

            <button
              onClick={() => setActiveTab("rhetoric")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "rhetoric"
                  ? "bg-[#D4AF37] text-[#1A202C] font-bold shadow"
                  : "text-[#A0AEC0] hover:text-white hover:bg-[#1A202C]"
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>الصور البيانية والبلاغية ({rhetoricalFigures.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("grammar")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "grammar"
                  ? "bg-[#D4AF37] text-[#1A202C] font-bold shadow"
                  : "text-[#A0AEC0] hover:text-white hover:bg-[#1A202C]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>جدول الإعراب النحوي ({result.sentencesIrab.length} جمل)</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-right">
          
          {isLoading && (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-white">
                جاري تحليل النص نحوياً وبلاغياً واستخراج الصور البيانية بالذكاء الاصطناعي...
              </p>
              <p className="text-xs text-[#A0AEC0]">
                يتم تصنيف المفردات، تفكيك التشبيهات والاستعارات والكنايات، وتوفير التقرير الموثق.
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs mb-1">تعذر إكمال التحليل النحوي والبلاغي</h4>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <>
              {/* Summary Overview Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0D1117] border border-[#2D3748] space-y-2">
                  <h4 className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    الملخص النحوي العام للنص:
                  </h4>
                  <p className="text-xs text-[#CBD5E0] leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1117] border border-[#2D3748] space-y-2">
                  <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-400" />
                    الملخص البلاغي وبيان الصور البيانية:
                  </h4>
                  <p className="text-xs text-[#CBD5E0] leading-relaxed">
                    {result.rhetoricalSummary || "تم استخراج ونقد الصور البيانية والأساليب البلاغية الواردة في النص بأسلوب دقيق."}
                  </p>
                </div>
              </div>

              {/* Rhetorical Figures & Images View */}
              {(activeTab === "rhetoric" || activeTab === "combined") && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[#2D3748]">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Feather className="w-4 h-4 text-[#D4AF37]" />
                      الصور البيانية والبلاغية المستخرجة (التشبيه، الاستعارة، الكناية والمجاز):
                    </h4>

                    {/* Stat Badges for rhetoric types */}
                    <div className="flex items-center gap-2 text-[11px] font-medium flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        التشبيه ({simileCount})
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        الاستعارة ({metaphorCount})
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        الكناية ({metonymyCount})
                      </span>
                      {badicCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          بديع ومجاز ({badicCount})
                        </span>
                      )}
                    </div>
                  </div>

                  {rhetoricalFigures.length === 0 ? (
                    <div className="p-8 text-center bg-[#0D1117] border border-[#2D3748] rounded-xl text-xs text-[#718096]">
                      لم يتم رصد صور بيانية صريحة في النص الحالي، النص يغلب عليه الأسلوب التقريري المباشر.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {rhetoricalFigures.map((fig, fIdx) => {
                        const style = getFigureBadgeStyle(fig);
                        return (
                          <div
                            key={fIdx}
                            className={`p-4 rounded-xl bg-[#0D1117] border transition-all ${style.borderCard} space-y-3`}
                          >
                            {/* Figure Header & Type */}
                            <div className="flex items-center justify-between gap-2 border-b border-[#2D3748]/60 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.bg}`}>
                                  {fig.typeArabicLabel || "صورة بيانية"}
                                </span>
                                <span className="text-xs text-[#A0AEC0] font-mono">
                                  صورة رقم #{fIdx + 1}
                                </span>
                              </div>
                              <Award className={`w-4 h-4 ${style.iconColor}`} />
                            </div>

                            {/* Quote Text */}
                            <div className="p-3 bg-[#161B22] rounded-lg border border-[#2D3748] flex items-start gap-2 text-white font-serif text-sm font-semibold leading-relaxed">
                              <Quote className="w-4 h-4 text-[#D4AF37] shrink-0 mt-1 rotate-180" />
                              <span>"{fig.textSegment}"</span>
                            </div>

                            {/* Detailed Explanation & Aesthetic Impact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="p-3 rounded-lg bg-[#1A202C]/60 border border-[#2D3748]/60 space-y-1">
                                <span className="font-bold text-[#D4AF37] block flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  الشرح وتفكيك الصورة:
                                </span>
                                <p className="text-[#CBD5E0] leading-relaxed">
                                  {fig.explanation}
                                </p>
                              </div>

                              <div className="p-3 rounded-lg bg-[#1A202C]/60 border border-[#2D3748]/60 space-y-1">
                                <span className="font-bold text-emerald-400 block flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                  الأثر الجمالي والأدبي:
                                </span>
                                <p className="text-[#CBD5E0] leading-relaxed">
                                  {fig.aestheticImpact}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sentences Irab Section */}
              {(activeTab === "grammar" || activeTab === "combined") && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-[#2D3748]">
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
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2D3748] bg-[#1A202C] flex flex-wrap items-center justify-between gap-3">
          {result && !isLoading && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري جيل ملف PDF...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>تصدير تقرير PDF المنظم</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c29f31] text-[#1A202C] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ التقرير النصي</span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-[#161B22] hover:bg-[#2D3748] text-[#CBD5E0] border border-[#2D3748] mr-auto transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Hidden Printable PDF Container (Formatted specifically for high-quality PDF printout) */}
      {result && (
        <div className="fixed top-[-9999px] left-[-9999px]" dir="rtl">
          <div
            ref={pdfContainerRef}
            className="w-[210mm] p-8 bg-white text-gray-900 font-sans space-y-6"
            style={{ fontFamily: "'Traditional Arabic', 'Amiri', 'Segoe UI', Tahoma, sans-serif" }}
          >
            {/* Header / Title Bar */}
            <div className="border-b-2 border-amber-600 pb-4 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-amber-800 mb-1">
                  منصة محلل النصوص والنحو والبلاغة العربية
                </h1>
                <h2 className="text-base font-semibold text-gray-700">
                  تقرير الإعراب والتحليل البلاغي الشامل (Gemini AI Parser)
                </h2>
              </div>
              <div className="text-left text-xs text-gray-500 font-mono">
                <p>تاريخ التقرير: {new Date().toLocaleDateString("ar-EG")}</p>
                <p>إصدار المعالج: 2.5.0</p>
              </div>
            </div>

            {/* Summaries Box */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <h3 className="text-xs font-bold text-amber-900">
                  📌 الملخص النحوي للنص:
                </h3>
                <p className="text-xs text-gray-800 leading-relaxed font-serif">
                  {result.summary}
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
                <h3 className="text-xs font-bold text-purple-900">
                  🎨 الملخص البلاغي وبيان الصور البيانية:
                </h3>
                <p className="text-xs text-gray-800 leading-relaxed font-serif">
                  {result.rhetoricalSummary || "تم استخراج ونقد الصور البيانية والأساليب البلاغية الواردة في النص بأسلوب دقيق."}
                </p>
              </div>
            </div>

            {/* Rhetorical Figures Section in PDF */}
            {rhetoricalFigures.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 border-r-4 border-amber-600 pr-2">
                  🎨 1. قسم الصور البيانية والبلاغية (التشبيه، الاستعارة، الكناية والمجاز):
                </h3>

                <table className="w-full text-right text-xs border border-gray-300 border-collapse">
                  <thead>
                    <tr className="bg-amber-100 text-amber-900 font-bold border-b border-gray-300">
                      <th className="p-2 border-l border-gray-300">نوع الصورة</th>
                      <th className="p-2 border-l border-gray-300">الشاهد / العبارة من النص</th>
                      <th className="p-2 border-l border-gray-300">التفكيك والشرح البلاغي</th>
                      <th className="p-2">الأثر الجمالي والأدبي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rhetoricalFigures.map((fig, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-2 border-l border-gray-200 font-bold text-amber-900 shrink-0">
                          {fig.typeArabicLabel}
                        </td>
                        <td className="p-2 border-l border-gray-200 font-serif font-bold text-gray-900">
                          "{fig.textSegment}"
                        </td>
                        <td className="p-2 border-l border-gray-200 text-gray-700">
                          {fig.explanation}
                        </td>
                        <td className="p-2 text-gray-800 font-medium">
                          {fig.aestheticImpact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Detailed Sentences Irab */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-r-4 border-amber-600 pr-2">
                📖 2. جدول الإعراب والمواقع النحوية التفصيلية:
              </h3>

              {result.sentencesIrab.map((sentenceObj, sIdx) => (
                <div key={sIdx} className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <div className="p-2.5 bg-amber-100/80 border-b border-gray-300 font-bold text-xs text-gray-900 flex justify-between">
                    <span>
                      <span className="text-amber-800 ml-1">[{sIdx + 1}]</span>
                      {sentenceObj.sentence}
                    </span>
                    {sentenceObj.translation && (
                      <span className="text-[11px] font-normal text-gray-600 italic">
                        {sentenceObj.translation}
                      </span>
                    )}
                  </div>

                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-200 text-gray-800 font-bold border-b border-gray-300">
                        <th className="p-1.5 border-l border-gray-300">الكلمة بالتشكيل</th>
                        <th className="p-1.5 border-l border-gray-300">قسم الكلام</th>
                        <th className="p-1.5 border-l border-gray-300">الجذر / الوزن</th>
                        <th className="p-1.5">الموقع الإعرابي والنحوي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentenceObj.wordsDetail.map((w, wIdx) => (
                        <tr key={wIdx} className={wIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-1.5 border-l border-gray-200 font-bold text-amber-900">
                            {w.diacritics || w.word}
                          </td>
                          <td className="p-1.5 border-l border-gray-200 text-gray-700">
                            {w.posArabic}
                          </td>
                          <td className="p-1.5 border-l border-gray-200 text-gray-600 font-mono">
                            {w.root ? `${w.root} (${w.weight || "فعل"})` : "—"}
                          </td>
                          <td className="p-1.5 text-gray-800 font-medium">
                            {w.irabRole}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 pt-3 text-center text-xs text-gray-500 font-mono">
              <p>تم استخراج هذا التقرير آلياً بواسطة منصة محلل النصوص والنحو والبلاغة العربية © 2026 Mohamed DRIDI</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

