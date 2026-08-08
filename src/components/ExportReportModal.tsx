import React from "react";
import { TextStats, WordItem, GrammarCategory } from "../types";
import { X, Copy, Download, FileText, CheckCircle2 } from "lucide-react";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TextStats;
  wordItems: WordItem[];
  categories: GrammarCategory[];
  rawText: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  stats,
  wordItems,
  categories,
  rawText,
}) => {
  if (!isOpen) return null;

  const generateReportText = (): string => {
    let r = `=== تقرير تحليل النص العربي وتعداد الكلمات والنحو ===\n\n`;
    r += `--- 1. الإحصاءات العامة ---\n`;
    r += `• إجمالي عدد الكلمات: ${stats.totalWords}\n`;
    r += `• عدد الكلمات الفريدة: ${stats.uniqueWords}\n`;
    r += `• الكلمات المكررة: ${stats.repeatedWordsCount} (${stats.repeatedWordsRatio}% من إجمالي النص)\n`;
    r += `• عدد الحروف (بدون فواصل): ${stats.charCountNoSpaces}\n`;
    r += `• عدد الجمل: ${stats.sentenceCount} | عدد الفقرات: ${stats.paragraphCount}\n`;
    r += `• زمن القراءة المتوقع: ~${stats.readingTimeMinutes} دقيقة\n\n`;

    r += `--- 2. تبويب الأقسام النحوية ---\n`;
    categories.forEach((cat) => {
      r += `• ${cat.labelArabic}: ${cat.count} كلمة (${cat.percentage}%)\n`;
    });
    r += `\n`;

    r += `--- 3. قائمة الكلمات المكررة (الأكثر شيوعاً) ---\n`;
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
      categoriesBreakdown: categories.map((c) => ({
        key: c.key,
        label: c.labelArabic,
        count: c.count,
        percentage: c.percentage,
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
    link.setAttribute("download", "تحليل_الكلمات.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1115]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161B22] border border-[#2D3748] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-[#1A202C] border-b border-[#2D3748] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#D4AF37] text-[#1A202C]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                تصدير واستخراج نتائج التحليل
              </h3>
              <p className="text-xs text-[#A0AEC0]">
                نسخ التقرير النصي أو تنزيل ملفات CSV / JSON للبيانات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#A0AEC0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview */}
        <div className="p-5 space-y-4 text-right">
          <textarea
            readOnly
            value={generateReportText()}
            dir="rtl"
            rows={10}
            className="w-full p-3.5 rounded-lg border border-[#2D3748] bg-[#0D1117] text-[#CBD5E0] text-xs font-mono leading-relaxed resize-none focus:outline-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handleCopyReport}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-[#D4AF37] hover:bg-[#c29f31] text-[#1A202C] rounded-lg text-xs font-bold transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>نسخ التقرير النصي</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-[#161B22] hover:bg-[#2D3748] text-emerald-400 border border-[#2D3748] rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل CSV</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-[#161B22] hover:bg-[#2D3748] text-blue-400 border border-[#2D3748] rounded-lg text-xs font-bold transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>تنزيل JSON</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1A202C] border-t border-[#2D3748] text-left">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#161B22] hover:bg-[#2D3748] text-[#CBD5E0] border border-[#2D3748] rounded-lg text-xs font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
