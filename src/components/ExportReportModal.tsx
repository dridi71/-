import React, { useState, useRef } from "react";
import { TextStats, WordItem, GrammarCategory, AiGrammarResult } from "../types";
import { stripDiacritics } from "../utils/arabicNlp";
import html2pdf from "html2pdf.js";
import {
  X,
  Copy,
  Download,
  FileText,
  Printer,
  Loader2,
  Sparkles,
  Feather,
  FileDown,
  FileType,
  Check,
  Share2,
} from "lucide-react";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TextStats;
  wordItems: WordItem[];
  categories: GrammarCategory[];
  rawText: string;
  aiResult?: AiGrammarResult | null;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  stats,
  wordItems,
  categories,
  rawText,
  aiResult,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const rhetoricalFigures = aiResult?.rhetoricalFigures || [];

  const generateReportText = (): string => {
    let r = `=== تقرير تحليل النص العربي والنحو والبلاغة ===\n\n`;
    r += `--- 1. الإحصاءات العامة ---\n`;
    r += `• إجمالي عدد الكلمات: ${stats.totalWords}\n`;
    r += `• عدد الكلمات الفريدة: ${stats.uniqueWords}\n`;
    r += `• الكلمات المكررة: ${stats.repeatedWordsCount} (${stats.repeatedWordsRatio}% من إجمالي النص)\n`;
    r += `• عدد الحروف (بدون فواصل): ${stats.charCountNoSpaces}\n`;
    r += `• عدد الجمل: ${stats.sentenceCount} | عدد الفقرات: ${stats.paragraphCount}\n`;
    r += `• زمن القراءة المتوقع: ~${stats.readingTimeMinutes} دقيقة\n\n`;

    if (aiResult) {
      r += `--- 2. الملخص النحوي والبلاغي للذكاء الاصطناعي ---\n`;
      r += `• النحو: ${aiResult.summary}\n`;
      if (aiResult.rhetoricalSummary) {
        r += `• البلاغة والبيان: ${aiResult.rhetoricalSummary}\n`;
      }
      r += `\n`;

      if (rhetoricalFigures.length > 0) {
        r += `--- 3. الصور البيانية والبلاغية (التشبيه، الاستعارة، الكناية) ---\n`;
        rhetoricalFigures.forEach((fig, i) => {
          r += `${i + 1}. [${fig.typeArabicLabel}] "${fig.textSegment}"\n`;
          r += `   الشرح: ${fig.explanation}\n`;
          r += `   الأثر: ${fig.aestheticImpact}\n`;
        });
        r += `\n`;
      }
    }

    r += `--- ${aiResult ? "4" : "2"}. تبويب الأقسام النحوية ---\n`;
    categories?.forEach((cat) => {
      if (!cat) return;
      r += `• ${cat.labelArabic || ""}: ${cat.count || 0} كلمة (${cat.percentage || 0}%)\n`;
    });
    r += `\n`;

    r += `--- ${aiResult ? "5" : "3"}. قائمة الكلمات المكررة (الأكثر شيوعاً) ---\n`;
    const topRepeated = wordItems.filter((w) => w.count >= 2).slice(0, 20);
    topRepeated.forEach((w, i) => {
      r += `${i + 1}. ${w.word} - التكرار: ${w.count} مرات | القسم: ${w.posArabic} | الجذر: ${w.root}\n`;
    });

    return r;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    alert("تم نسخ التقرير النصي كاملاً إلى الحافظة!");
  };

  const handleCopyRawText = () => {
    navigator.clipboard.writeText(rawText);
    alert("تم نسخ النص العربي الأصلي إلى الحافظة!");
  };

  // Download raw Arabic text as .txt file with UTF-8 BOM
  const handleDownloadRawText = () => {
    const blob = new Blob(["\uFEFF" + rawText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `النص_العربي_الأصلي_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download plain Arabic text without diacritics as .txt file
  const handleDownloadPlainText = () => {
    const cleanText = stripDiacritics(rawText);
    const blob = new Blob(["\uFEFF" + cleanText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `النص_العربي_بدون_تشكيل_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download full comprehensive report as .txt file
  const handleDownloadTxtReport = () => {
    const report = generateReportText();
    const blob = new Blob(["\uFEFF" + report], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `تقرير_تحليل_النحو_والبلاغة_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download structured markdown file (.md)
  const handleDownloadMarkdown = () => {
    let md = `# تقرير تحليل النص العربي والنحو والبلاغة\n\n`;
    md += `> تم الاستخراج بواسطة: منصة محلل النصوص والنحو والبلاغة العربية © 2026 Mohamed DRIDI\n\n`;
    md += `## 1. الإحصاءات العامة\n\n`;
    md += `- **إجمالي الكلمات:** ${stats.totalWords}\n`;
    md += `- **الكلمات الفريدة:** ${stats.uniqueWords}\n`;
    md += `- **الكلمات المكررة:** ${stats.repeatedWordsCount} (${stats.repeatedWordsRatio}%)\n`;
    md += `- **عدد الحروف (بدون فواصل):** ${stats.charCountNoSpaces}\n`;
    md += `- **الجمل:** ${stats.sentenceCount} | **الفقرات:** ${stats.paragraphCount}\n`;
    md += `- **زمن القراءة المتوقع:** ~${stats.readingTimeMinutes} دقيقة\n\n`;

    if (aiResult) {
      md += `## 2. ملخص التحليل النحوي والبلاغي (Gemini AI)\n\n`;
      md += `**الملخص النحوي:**\n${aiResult.summary}\n\n`;
      if (aiResult.rhetoricalSummary) {
        md += `**الملخص البلاغي وبيان الصور البيانية:**\n${aiResult.rhetoricalSummary}\n\n`;
      }

      if (rhetoricalFigures.length > 0) {
        md += `### الصور البيانية والبلاغية المستخرجة\n\n`;
        md += `| نوع الصورة | الشاهد من النص | الشرح والتفكيك البلاغي | الأثر الجمالي |\n`;
        md += `|---|---|---|---|\n`;
        rhetoricalFigures.forEach((fig) => {
          md += `| ${fig.typeArabicLabel} | "${fig.textSegment.replace(/\|/g, "/")}" | ${fig.explanation.replace(/\|/g, "/")} | ${fig.aestheticImpact.replace(/\|/g, "/")} |\n`;
        });
        md += `\n`;
      }
    }

    md += `## 3. الأقسام النحوية وتوزيعها\n\n`;
    categories?.forEach((cat) => {
      md += `- **${cat.labelArabic}:** ${cat.count} كلمة (${cat.percentage}%)\n`;
    });
    md += `\n`;

    md += `## 4. النص الأصلي المعالج\n\n\`\`\`arabic\n${rawText}\n\`\`\`\n`;

    const blob = new Blob(["\uFEFF" + md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `تقرير_النحو_والبلاغة_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = pdfRef.current;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `تقرير_تحليل_النص_والبلاغة_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("General PDF Export error:", err);
      alert("حدث خطأ أثناء تنزيل التقرير بتنسيق PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadCsv = () => {
    let csv = "\uFEFFالكلمة,التكرار,النسبة المئوية,القسم النحوي,الجذر الصرفي\n";
    wordItems.forEach((w) => {
      csv += `"${w.word}",${w.count},${w.frequencyPercentage.toFixed(2)}%,"${w.posArabic}","${w.root}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "تحليل_الكلمات_والنحو.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const payload = {
      stats,
      aiResult: aiResult || null,
      categoriesBreakdown: (categories || []).map((c) => ({
        key: c?.key,
        label: c?.labelArabic,
        count: c?.count,
        percentage: c?.percentage,
      })),
      words: wordItems.map((w) => ({
        word: w.word,
        cleanWord: w.cleanWord,
        count: w.count,
        pos: w.pos,
        posArabic: w.posArabic,
        root: w.root,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "تحليل_الكلمات_والبلاغة.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topRepeatedWords = wordItems.filter((w) => w.count >= 2).slice(0, 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F1115]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161B22] border border-[#2D3748] rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-[#1A202C] border-b border-[#2D3748] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#D4AF37] text-[#1A202C]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                تصدير النصوص وتقارير التحليل (Export Options)
              </h3>
              <p className="text-xs text-[#A0AEC0]">
                تنزيل النص كملف نصي (.txt) بالتشكيل أو بدونه، تقرير نصي، Markdown، PDF، أو بيانات CSV / JSON
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#A0AEC0] hover:text-white hover:bg-[#2D3748] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-right overflow-y-auto">
          
          {/* Section 1: Text Exports (.TXT & .MD) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                <FileType className="w-4 h-4 text-[#D4AF37]" />
                1. خيارات تصدير الملفات النصية (Text Files .TXT / .MD)
              </h4>
              <span className="text-[11px] text-[#A0AEC0]">ترميز UTF-8 بمطابقة الحروف العربية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Export Raw Arabic Text */}
              <button
                id="btn-export-raw-txt"
                onClick={handleDownloadRawText}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0D1117] hover:bg-[#1A202C] border border-[#2D3748] hover:border-[#D4AF37]/50 text-right transition-all group"
              >
                <div className="p-2 rounded bg-[#D4AF37]/15 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#1A202C] transition-colors shrink-0 mt-0.5">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-[#D4AF37] transition-colors">
                    النص الأصلي بالتشكيل (.TXT)
                  </div>
                  <div className="text-[11px] text-[#A0AEC0] mt-0.5">
                    تنزيل النص العربي الحالي بالحركات والتشكيل الأصلي
                  </div>
                </div>
              </button>

              {/* Export Plain Text (No Tashkeel) */}
              <button
                id="btn-export-plain-txt"
                onClick={handleDownloadPlainText}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0D1117] hover:bg-[#1A202C] border border-[#2D3748] hover:border-blue-500/50 text-right transition-all group"
              >
                <div className="p-2 rounded bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <FileType className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">
                    النص بدون تشكيل (.TXT)
                  </div>
                  <div className="text-[11px] text-[#A0AEC0] mt-0.5">
                    إزالة الحركات والتنوين وتجريد الحروف للنسخ والبحث
                  </div>
                </div>
              </button>

              {/* Export Full Analysis Text Report */}
              <button
                id="btn-export-report-txt"
                onClick={handleDownloadTxtReport}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0D1117] hover:bg-[#1A202C] border border-[#2D3748] hover:border-emerald-500/50 text-right transition-all group"
              >
                <div className="p-2 rounded bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                    تقرير التحليل النصي الشامل (.TXT)
                  </div>
                  <div className="text-[11px] text-[#A0AEC0] mt-0.5">
                    ملف نصي يحتوي الإحصاءات، النحو، والصور البيانية
                  </div>
                </div>
              </button>

              {/* Export Markdown Document */}
              <button
                id="btn-export-report-md"
                onClick={handleDownloadMarkdown}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0D1117] hover:bg-[#1A202C] border border-[#2D3748] hover:border-purple-500/50 text-right transition-all group"
              >
                <div className="p-2 rounded bg-purple-500/15 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <Feather className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-purple-400 transition-colors">
                    وثيقة التقرير Markdown (.MD)
                  </div>
                  <div className="text-[11px] text-[#A0AEC0] mt-0.5">
                    تنسيق غني بالوسوم وجداول البيانات متوافق مع GitHub وNotion
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Other Formats (PDF, CSV, JSON, Copy) */}
          <div className="space-y-2.5 pt-2 border-t border-[#2D3748]">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              2. التصدير بتنسيقات المستندات والبيانات
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                id="btn-export-pdf"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                <span>تصدير PDF</span>
              </button>

              <button
                id="btn-copy-report"
                onClick={handleCopyReport}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#D4AF37] hover:bg-[#c29f31] text-[#1A202C] rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <Copy className="w-4 h-4" />
                <span>نسخ التقرير</span>
              </button>

              <button
                id="btn-export-csv"
                onClick={handleDownloadCsv}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#161B22] hover:bg-[#2D3748] text-emerald-400 border border-[#2D3748] rounded-lg text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>ملف CSV</span>
              </button>

              <button
                id="btn-export-json"
                onClick={handleDownloadJson}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#161B22] hover:bg-[#2D3748] text-blue-400 border border-[#2D3748] rounded-lg text-xs font-bold transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>ملف JSON</span>
              </button>
            </div>
          </div>

          {/* Section 3: Text Preview */}
          <div className="space-y-1.5 pt-2 border-t border-[#2D3748]">
            <div className="flex items-center justify-between text-xs text-[#A0AEC0]">
              <span className="font-semibold text-white">معاينة نص التقرير:</span>
              <button
                onClick={handleCopyRawText}
                className="text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                نسخ النص الأصلي فقط
              </button>
            </div>
            <textarea
              readOnly
              value={generateReportText()}
              dir="rtl"
              rows={5}
              className="w-full p-3 rounded-lg border border-[#2D3748] bg-[#0D1117] text-[#CBD5E0] text-[11px] font-mono leading-relaxed resize-none focus:outline-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1A202C] border-t border-[#2D3748] flex items-center justify-between">
          <span className="text-xs text-[#718096]">
            جميع الملفات تُحفَظ محلياً على جهازك مباشرة
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#161B22] hover:bg-[#2D3748] text-[#CBD5E0] border border-[#2D3748] rounded-lg text-xs font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Printable PDF Template */}
      <div className="fixed top-[-9999px] left-[-9999px]" dir="rtl">
        <div
          ref={pdfRef}
          className="w-[210mm] p-8 bg-white text-gray-900 font-sans space-y-6"
          style={{ fontFamily: "'Traditional Arabic', 'Amiri', 'Segoe UI', Tahoma, sans-serif" }}
        >
          {/* Document Header */}
          <div className="border-b-2 border-amber-600 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-amber-800">
                منصة محلل النصوص والنحو العربي
              </h1>
              <h2 className="text-sm font-semibold text-gray-700">
                تقرير الإحصاءات العامة وتبويب الأقسام النحوية
              </h2>
            </div>
            <div className="text-left text-xs text-gray-500 font-mono">
              <p>التاريخ: {new Date().toLocaleDateString("ar-EG")}</p>
            </div>
          </div>

          {/* Stats Summary Table */}
          <div>
            <h3 className="text-base font-bold text-amber-900 mb-2 border-r-4 border-amber-600 pr-2">
              📊 1. الإحصاءات والأرقام العامة:
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs bg-amber-50 p-4 border border-amber-200 rounded-lg">
              <div><strong>إجمالي عدد الكلمات:</strong> {stats.totalWords}</div>
              <div><strong>الكلمات الفريدة:</strong> {stats.uniqueWords}</div>
              <div><strong>الكلمات المكررة:</strong> {stats.repeatedWordsCount} ({stats.repeatedWordsRatio}%)</div>
              <div><strong>عدد الحروف:</strong> {stats.charCountNoSpaces}</div>
              <div><strong>عدد الجمل والفقرات:</strong> {stats.sentenceCount} جملة | {stats.paragraphCount} فقرة</div>
              <div><strong>زمن القراءة:</strong> ~{stats.readingTimeMinutes} دقيقة</div>
            </div>
          </div>

          {/* Grammar Categories Breakdown */}
          <div>
            <h3 className="text-base font-bold text-amber-900 mb-2 border-r-4 border-amber-600 pr-2">
              🏷️ 2. توزيع الأقسام النحوية:
            </h3>
            <table className="w-full text-right text-xs border border-gray-300 border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-800">
                  <th className="p-2 border border-gray-300">القسم النحوي</th>
                  <th className="p-2 border border-gray-300">عدد الكلمات</th>
                  <th className="p-2 border border-gray-300">النسبة المئوية</th>
                </tr>
              </thead>
              <tbody>
                {(categories || []).map((c, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-2 border border-gray-200 font-bold text-amber-900">{c?.labelArabic}</td>
                    <td className="p-2 border border-gray-200">{c?.count}</td>
                    <td className="p-2 border border-gray-200">{c?.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Repeated Words */}
          {topRepeatedWords.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-amber-900 mb-2 border-r-4 border-amber-600 pr-2">
                🔄 3. أشد الكلمات تكراراً في النص:
              </h3>
              <table className="w-full text-right text-xs border border-gray-300 border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-800">
                    <th className="p-2 border border-gray-300">#</th>
                    <th className="p-2 border border-gray-300">الكلمة</th>
                    <th className="p-2 border border-gray-300">عدد مرات التكرار</th>
                    <th className="p-2 border border-gray-300">القسم النحوي</th>
                    <th className="p-2 border border-gray-300">الجذر الصرفي</th>
                  </tr>
                </thead>
                <tbody>
                  {topRepeatedWords.map((w, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-2 border border-gray-200 font-bold">{idx + 1}</td>
                      <td className="p-2 border border-gray-200 font-bold text-amber-900">{w.word}</td>
                      <td className="p-2 border border-gray-200">{w.count} مرات</td>
                      <td className="p-2 border border-gray-200">{w.posArabic}</td>
                      <td className="p-2 border border-gray-200 font-mono">{w.root || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-300 pt-3 text-center text-xs text-gray-500 font-mono">
            <p>تم استخراج هذا التقرير بواسطة منصة محلل النصوص والنحو العربي © 2026 Mohamed DRIDI</p>
          </div>
        </div>
      </div>

    </div>
  );
};

