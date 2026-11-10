import React, { useState, useEffect } from "react";
import {
  BookOpenCheck,
  Sparkles,
  Volume2,
  Copy,
  Check,
  X,
  Layers,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  Feather,
  RefreshCw,
  Send,
} from "lucide-react";
import { SingleSentenceIrabResult } from "../types";
import { useArabicTts } from "../utils/useArabicTts";

interface SentenceIrabModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSentence?: string;
}

const SAMPLE_SENTENCES = [
  {
    title: "قرآن كريم",
    sentence: "إِنَّ مَعَ العُسْرِ يُسْراً",
    description: "حرف ناسخ وشبه جملة خبر مقدم واسم إن مؤخر",
  },
  {
    title: "شعر حكمي",
    sentence: "إِذَا الشَّعْبُ يَوْماً أَرَادَ الحَيَاةَ فَلَا بُدَّ أَنْ يَسْتَجِيبَ القَدَرُ",
    description: "إذا الشرطية وفعل شرط مقدر وجواب شرط مقترن بالفاء",
  },
  {
    title: "جملة اسمية ونعت",
    sentence: "العِلْمُ نُورٌ يَهْدِي الحَيَارَى إِلَى الحَقِّ",
    description: "مبتدأ وخبر مفرد وجملة فعلية في محل رفع نعت",
  },
  {
    title: "أفعال المقاربة",
    sentence: "كَادَ المَطَرُ يَنْهَمِرُ مِنَ السَّمَاءِ",
    description: "فعل ماض ناقص من أفعال المقاربة وخبره جملة فعلية",
  },
  {
    title: "حكمة المتنبي",
    sentence: "لَوْلَا المَشَقَّةُ سَادَ النَّاسُ كُلُّهُمُ",
    description: "لولا الامتناعية ومبتدأ حذف خبره وجوباً وتوكيد معنوي",
  },
];

export const SentenceIrabModal: React.FC<SentenceIrabModalProps> = ({
  isOpen,
  onClose,
  initialSentence = "",
}) => {
  const [inputSentence, setInputSentence] = useState<string>(initialSentence);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SingleSentenceIrabResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedWordIndex, setCopiedWordIndex] = useState<number | null>(null);

  const { speak, isPlaying, stop } = useArabicTts();

  // Sync initialSentence when opening
  useEffect(() => {
    if (initialSentence && isOpen) {
      setInputSentence(initialSentence);
      handleAnalyzeSentence(initialSentence);
    }
  }, [initialSentence, isOpen]);

  if (!isOpen) return null;

  const handleAnalyzeSentence = async (textToAnalyze?: string) => {
    const target = (textToAnalyze ?? inputSentence).trim();
    if (!target) {
      setError("الرجاء كتابة أو اختيار جملة صالحة للإعراب.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: target }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || `خطأ في الخادم (رمز: ${response.status})`);
      }

      const data: SingleSentenceIrabResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Sentence Irab error:", err);
      setError(err?.message || "تعذر إتمام الإعراب بواسطة الذكاء الاصطناعي. الرجاء المحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: string) => {
    setInputSentence(sample);
    handleAnalyzeSentence(sample);
  };

  const handleCopyFullReport = () => {
    if (!result) return;
    let report = `═════════════════════════════════════\n`;
    report += `📜 تقرير الإعراب النحوي التفصيلي للجملة\n`;
    report += `═════════════════════════════════════\n\n`;
    report += `• الجملة مشكولة: ${result.diacritizedSentence}\n`;
    report += `• نوع الجملة: ${result.sentenceType}\n`;
    report += `• المحل الإعرابي العام: ${result.sentenceRole}\n`;
    report += `• أركان الجملة: ${result.mainPillars.pillar1} | ${result.mainPillars.pillar2}`;
    if (result.mainPillars.extra) report += ` | ${result.mainPillars.extra}`;
    report += `\n\n─────────────────────────────────────\n`;
    report += `📌 إعراب مفردات الجملة بالتفصيل:\n`;
    report += `─────────────────────────────────────\n`;

    result.wordsDetail.forEach((w, idx) => {
      report += `${idx + 1}. [${w.diacritized || w.word}] (${w.posArabic} - ${w.grammaticalCase}):\n`;
      report += `   ← الإعراب: ${w.irabDetailed}\n`;
      report += `   ← علامة الإعراب: ${w.marker} (${w.markerType || "أصلية"})\n`;
      if (w.syntacticRelation) report += `   ← الارتباط والتعلق: ${w.syntacticRelation}\n`;
      if (w.root) report += `   ← الجذر الصرفي: ${w.root} (الوزن: ${w.weight || "-"})\n`;
      report += `\n`;
    });

    if (result.subClauses && result.subClauses.length > 0) {
      report += `─────────────────────────────────────\n`;
      report += `🔗 الجمل الفرعية وأشباه الجمل ومحلها:\n`;
      result.subClauses.forEach((c) => {
        report += `• «${c.clause}» [${c.clauseType}]: ${c.irabRole}\n`;
      });
      report += `\n`;
    }

    if (result.grammaticalNotes && result.grammaticalNotes.length > 0) {
      report += `─────────────────────────────────────\n`;
      report += `💡 لطائف وفوائد نحوية:\n`;
      result.grammaticalNotes.forEach((note) => {
        report += `• ${note}\n`;
      });
      report += `\n`;
    }

    if (result.rhetoricalTouch) {
      report += `─────────────────────────────────────\n`;
      report += `✨ اللمسة البلاغية والجمالية:\n${result.rhetoricalTouch}\n`;
    }

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWordIrab = (word: SingleSentenceIrabResult["wordsDetail"][0], index: number) => {
    const text = `إعراب [${word.diacritized || word.word}]: ${word.irabDetailed} (علامة الإعراب: ${word.marker})`;
    navigator.clipboard.writeText(text);
    setCopiedWordIndex(index);
    setTimeout(() => setCopiedWordIndex(null), 2000);
  };

  const getCaseBadgeClass = (grammaticalCase: string) => {
    if (grammaticalCase.includes("مرفوع")) {
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    }
    if (grammaticalCase.includes("منصوب")) {
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    }
    if (grammaticalCase.includes("مجرور")) {
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    }
    if (grammaticalCase.includes("مجزوم")) {
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    }
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#1A202C] border-b border-[#2D3748] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  محلل إعراب الجملة الذكي
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  إعراب مفصل
                </span>
              </div>
              <p className="text-xs text-[#A0AEC0] mt-0.5">
                تفكيك تركيبي وإعراب شامل لأركان الجملة ومفرداتها وشواهدها بالذكاء الاصطناعي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {result && (
              <button
                onClick={handleCopyFullReport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1117] hover:bg-[#161B22] border border-[#2D3748] text-xs font-semibold text-[#CBD5E0] hover:text-[#D4AF37] transition-colors"
                title="نسخ تقرير الإعراب الكامل"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم نسخ التقرير</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>نسخ الإعراب</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#A0AEC0] hover:text-white hover:bg-[#2D3748] rounded-lg transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto grow">

          {/* Input & Search Section */}
          <div className="bg-[#0D1117] border border-[#2D3748] rounded-2xl p-4 sm:p-5 space-y-3">
            <label className="text-xs font-bold text-[#CBD5E0] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#D4AF37]" />
                اكتب أو عدّل الجملة المراد إعرابها:
              </span>
              <span className="text-[11px] text-[#A0AEC0] font-normal">
                يدعم الجمل الاسمية، الفعلية، الشرطية، وأبيات الشعر
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={inputSentence}
                onChange={(e) => setInputSentence(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnalyzeSentence();
                  }
                }}
                dir="rtl"
                placeholder="مثال: إِنَّ مَعَ العُسْرِ يُسْراً أو كانَ الطالبُ مجتهداً..."
                className="w-full bg-[#161B22] border border-[#2D3748] focus:border-[#D4AF37] rounded-xl px-4 py-3 pl-28 text-base text-white placeholder-[#718096] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-['Cairo',sans-serif]"
              />

              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {inputSentence.trim() && (
                  <button
                    onClick={() => speak(inputSentence)}
                    className="p-2 text-[#CBD5E0] hover:text-[#D4AF37] hover:bg-[#1A202C] rounded-lg transition-colors"
                    title="الاستماع لنطق الجملة"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  id="btn-run-sentence-irab"
                  disabled={loading || !inputSentence.trim()}
                  onClick={() => handleAnalyzeSentence()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#e0bb3c] text-[#1A202C] rounded-lg font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>إعراب</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Suggestions Pills */}
            <div className="pt-2">
              <div className="text-[11px] text-[#A0AEC0] mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-[#D4AF37]" />
                <span>أو اختر جملة نموذجية جاهزة للتحليل الفوري:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_SENTENCES.map((sample, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSelectSample(sample.sentence)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#161B22] hover:bg-[#1A202C] text-[#CBD5E0] hover:text-[#D4AF37] border border-[#2D3748] hover:border-[#D4AF37]/50 transition-colors flex items-center gap-1.5"
                    title={sample.description}
                  >
                    <span className="font-semibold">{sample.sentence}</span>
                    <span className="text-[10px] text-[#718096]">({sample.title})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Animation State */}
          {loading && (
            <div className="py-12 text-center space-y-3 bg-[#0D1117] rounded-2xl border border-[#D4AF37]/30">
              <div className="w-12 h-12 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  جارٍ إعراب الجملة واستخراج العلاقات التركيبية بدقة...
                </p>
                <p className="text-xs text-[#A0AEC0]">
                  تحديد أركان الجملة، تفكيك المفردات، علامات الإعراب الظاهرة والمقدرة، ومحل الجملة من الإعراب
                </p>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 text-red-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-red-200">تعذر استكمال إعراب الجملة</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Result Presentation */}
          {result && !loading && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* 1. Sentence Identity & Banner */}
              <div className="bg-gradient-to-r from-[#1A202C] via-[#161B22] to-[#1A202C] border border-[#D4AF37]/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2D3748]">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      {result.sentenceType}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-[#161B22] text-[#CBD5E0] border border-[#2D3748] text-xs font-semibold">
                      {result.sentenceRole}
                    </span>
                  </div>

                  <button
                    onClick={() => speak(result.diacritizedSentence || result.originalSentence)}
                    className="flex items-center gap-1.5 text-xs text-[#CBD5E0] hover:text-[#D4AF37] bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#2D3748] transition-colors self-start sm:self-auto"
                    title="الاستماع للجملة مشكولة"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>نطق الجملة</span>
                  </button>
                </div>

                {/* Diacritized Sentence Text */}
                <div className="py-2">
                  <div className="text-xl sm:text-2xl font-bold text-white font-['Cairo',serif] tracking-wide leading-relaxed text-center sm:text-right">
                    {result.diacritizedSentence || result.originalSentence}
                  </div>
                </div>

                {/* Main Pillars (المسند والمسند إليه / المبتدأ والخبر / الفعل والفاعل) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#0D1117] border border-[#2D3748]">
                    <div className="text-[11px] text-[#A0AEC0] mb-1">الركن الأول:</div>
                    <div className="text-xs font-bold text-emerald-400">
                      {result.mainPillars.pillar1}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0D1117] border border-[#2D3748]">
                    <div className="text-[11px] text-[#A0AEC0] mb-1">الركن الثاني:</div>
                    <div className="text-xs font-bold text-blue-400">
                      {result.mainPillars.pillar2}
                    </div>
                  </div>

                  {result.mainPillars.extra && (
                    <div className="p-3 rounded-xl bg-[#0D1117] border border-[#2D3748]">
                      <div className="text-[11px] text-[#A0AEC0] mb-1">المتعلقات والفضلات:</div>
                      <div className="text-xs font-bold text-[#D4AF37]">
                        {result.mainPillars.extra}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Detailed Word-by-Word Irab Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpenCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>إعراب مفردات الجملة بالتفصيل ({result.wordsDetail.length} كلمات)</span>
                  </h3>
                  <span className="text-[11px] text-[#A0AEC0]">
                    انقر على أي مفردة للاستماع أو نسخ الإعراب
                  </span>
                </div>

                <div className="space-y-3">
                  {result.wordsDetail.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0D1117] border border-[#2D3748] hover:border-[#D4AF37]/50 rounded-xl p-4 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#2D3748]/60">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-[#1A202C] border border-[#2D3748] flex items-center justify-center text-[11px] font-bold text-[#CBD5E0]">
                            {idx + 1}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-white font-['Cairo',serif]">
                            {item.diacritized || item.word}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-[#1A202C] text-[#CBD5E0] border border-[#2D3748]">
                            {item.posArabic}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${getCaseBadgeClass(
                              item.grammaticalCase
                            )}`}
                          >
                            {item.grammaticalCase}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 self-end sm:self-auto">
                          <button
                            onClick={() => speak(item.diacritized || item.word)}
                            className="p-1.5 text-[#A0AEC0] hover:text-[#D4AF37] hover:bg-[#1A202C] rounded-lg transition-colors"
                            title="نطق الكلمة"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleCopyWordIrab(item, idx)}
                            className="p-1.5 text-[#A0AEC0] hover:text-white hover:bg-[#1A202C] rounded-lg transition-colors"
                            title="نسخ إعراب هذه الكلمة"
                          >
                            {copiedWordIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Detailed Irab Description */}
                      <div className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed bg-[#161B22] p-3 rounded-lg border border-[#2D3748]/50">
                        <span className="font-bold text-[#D4AF37] ml-1.5">الإعراب:</span>
                        <span>{item.irabDetailed}</span>
                      </div>

                      {/* Badges: Marker, Syntactic relation, Root, Weight */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#2D3748]">
                          <span className="text-[#A0AEC0] text-[11px] block">علامة الإعراب:</span>
                          <span className="font-semibold text-white">{item.marker}</span>
                        </div>

                        {item.markerType && (
                          <div className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#2D3748]">
                            <span className="text-[#A0AEC0] text-[11px] block">نوع العلامة:</span>
                            <span className="font-semibold text-[#CBD5E0]">{item.markerType}</span>
                          </div>
                        )}

                        {item.syntacticRelation && (
                          <div className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#2D3748]">
                            <span className="text-[#A0AEC0] text-[11px] block">التعلق / الارتباط:</span>
                            <span className="font-semibold text-[#CBD5E0] truncate block" title={item.syntacticRelation}>
                              {item.syntacticRelation}
                            </span>
                          </div>
                        )}

                        {item.root && (
                          <div className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#2D3748]">
                            <span className="text-[#A0AEC0] text-[11px] block">الجذر والوزن:</span>
                            <span className="font-semibold text-amber-300">
                              {item.root} {item.weight ? `(فَعَلَ: ${item.weight})` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Subordinate Clauses (الجمل الفرعية ومحلها من الإعراب) */}
              {result.subClauses && result.subClauses.length > 0 && (
                <div className="bg-[#0D1117] border border-[#2D3748] rounded-2xl p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    <span>الجمل الفرعية وأشباه الجمل ومحلها من الإعراب</span>
                  </h4>
                  <div className="space-y-2">
                    {result.subClauses.map((clause, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 rounded-xl bg-[#161B22] border border-[#2D3748] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-['Cairo',serif]">
                            «{clause.clause}»
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[#1A202C] text-[#CBD5E0] border border-[#2D3748]">
                            {clause.clauseType}
                          </span>
                        </div>
                        <div className="font-semibold text-[#D4AF37]">
                          {clause.irabRole}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Grammatical Notes & Rhetorical Touch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Notes */}
                {result.grammaticalNotes && result.grammaticalNotes.length > 0 && (
                  <div className="bg-[#0D1117] border border-[#2D3748] rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>فوائد ولطائف نحوية</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#CBD5E0]">
                      {result.grammaticalNotes.map((note, nIdx) => (
                        <li key={nIdx} className="flex items-start gap-2">
                          <span className="text-[#D4AF37]">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Rhetorical Touch */}
                {result.rhetoricalTouch && (
                  <div className="bg-[#0D1117] border border-[#2D3748] rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Feather className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>اللمسة البلاغية والجمالية</span>
                    </h4>
                    <p className="text-xs text-[#CBD5E0] leading-relaxed">
                      {result.rhetoricalTouch}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#1A202C] border-t border-[#2D3748] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#A0AEC0] text-center sm:text-right">
            مُعرب بدقة استناداً إلى مصنفات النحو العربي ومجمع اللغة العربية
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {result && (
              <button
                onClick={handleCopyFullReport}
                className="px-4 py-2 text-xs font-semibold text-[#CBD5E0] hover:text-[#D4AF37] bg-[#161B22] hover:bg-[#2D3748] rounded-xl border border-[#2D3748] transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "تم النسخ" : "نسخ التقرير"}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-[#1A202C] bg-[#D4AF37] hover:bg-[#e0bb3c] rounded-xl shadow transition-all"
            >
              تم / إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
