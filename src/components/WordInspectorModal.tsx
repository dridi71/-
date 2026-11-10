import React, { useState, useEffect } from "react";
import { WordItem, TextToken, AiSynonymsResult, AiAntonymsResult } from "../types";
import { POS_DEFINITIONS } from "../utils/arabicNlp";
import { getLisanAlArabEntry, LisanEntry } from "../utils/lisanAlArabDictionary";
import { TtsPlayerBar } from "./TtsPlayerBar";
import {
  X,
  BookOpen,
  Sparkles,
  Repeat,
  Tag,
  Hash,
  Layers,
  Search,
  BookMarked,
  Quote,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  ArrowLeftRight,
  Loader2,
  Feather,
  PenTool,
  Target,
  Flame,
  Award,
} from "lucide-react";

interface WordInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordItem: WordItem | null;
  fullText: string;
  tokens: TextToken[];
}

export const WordInspectorModal: React.FC<WordInspectorModalProps> = ({
  isOpen,
  onClose,
  wordItem,
  fullText,
  tokens,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "antonyms" | "synonyms" | "lexicon">("all");
  const [loadingSynonyms, setLoadingSynonyms] = useState<boolean>(false);
  const [synonymsData, setSynonymsData] = useState<AiSynonymsResult | null>(null);
  const [synonymsError, setSynonymsError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Dynamic AI Lisan Al-Arab state
  const [aiLisanEntry, setAiLisanEntry] = useState<LisanEntry | null>(null);
  const [loadingLisan, setLoadingLisan] = useState<boolean>(false);
  const [lisanError, setLisanError] = useState<string | null>(null);

  // Dynamic AI Antonyms & Creative Writing state
  const [loadingAntonyms, setLoadingAntonyms] = useState<boolean>(false);
  const [antonymsData, setAntonymsData] = useState<AiAntonymsResult | null>(null);
  const [antonymsError, setAntonymsError] = useState<string | null>(null);
  const [copiedAntonymIndex, setCopiedAntonymIndex] = useState<number | null>(null);
  const [copiedChallenge, setCopiedChallenge] = useState<boolean>(false);

  // Reset state when wordItem changes
  useEffect(() => {
    setSynonymsData(null);
    setSynonymsError(null);
    setLoadingSynonyms(false);
    setAiLisanEntry(null);
    setLoadingLisan(false);
    setLisanError(null);
    setAntonymsData(null);
    setLoadingAntonyms(false);
    setAntonymsError(null);
    setCopiedAntonymIndex(null);
    setCopiedChallenge(false);
  }, [wordItem?.id]);

  if (!isOpen || !wordItem) return null;

  const posMeta = POS_DEFINITIONS[wordItem.pos];
  const defaultLisanEntry = getLisanAlArabEntry(wordItem.word);
  const activeLisanEntry = aiLisanEntry || defaultLisanEntry;

  // Context sentences extraction: Find sentences in fullText that contain this word
  const sentences = fullText.split(/[.؟!;\n]+/).filter((s) => s.trim().length > 0);
  const matchingSentences = sentences.filter((s) =>
    s.toLowerCase().includes(wordItem.cleanWord) || s.includes(wordItem.word)
  );

  const primaryContextSentence = matchingSentences.length > 0 ? matchingSentences[0] : "";

  // Fetch AI Lisan Al-Arab function
  const handleFetchAiLisan = async () => {
    setLoadingLisan(true);
    setLisanError(null);

    try {
      const response = await fetch("/api/lisan-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: wordItem.word,
          root: wordItem.root || defaultLisanEntry.root,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "فشل في البحث المباشر في معجم لسان العرب");
      }

      const data: LisanEntry = await response.json();
      setAiLisanEntry(data);
    } catch (err: any) {
      console.error("Fetch AI Lisan error:", err);
      setLisanError(err.message || "حدث خطأ أثناء البحث في لسان العرب بالذكاء الاصطناعي");
    } finally {
      setLoadingLisan(false);
    }
  };

  // Fetch AI Synonyms function
  const handleFetchSynonyms = async () => {
    setLoadingSynonyms(true);
    setSynonymsError(null);

    try {
      const response = await fetch("/api/synonyms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: wordItem.word,
          root: wordItem.root,
          contextSentence: primaryContextSentence,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "فشل في جلب المرادفات والبدائل البلاغية");
      }

      const data: AiSynonymsResult = await response.json();
      setSynonymsData(data);
    } catch (err: any) {
      console.error("Fetch synonyms error:", err);
      setSynonymsError(err.message || "حدث خطأ أثناء اقتراح المرادفات بواسطة الذكاء الاصطناعي");
    } finally {
      setLoadingSynonyms(false);
    }
  };

  const handleCopySynonym = (synonymText: string, index: number) => {
    navigator.clipboard.writeText(synonymText);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  // Fetch AI Antonyms function
  const handleFetchAntonyms = async () => {
    setLoadingAntonyms(true);
    setAntonymsError(null);

    try {
      const response = await fetch("/api/antonyms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: wordItem.word,
          root: wordItem.root,
          contextSentence: primaryContextSentence,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "فشل في استخراج المتضادات بالذكاء الاصطناعي");
      }

      const data: AiAntonymsResult = await response.json();
      setAntonymsData(data);
    } catch (err: any) {
      console.error("Fetch antonyms error:", err);
      setAntonymsError(err.message || "حدث خطأ أثناء استخراج المتضادات بواسطة الذكاء الاصطناعي");
    } finally {
      setLoadingAntonyms(false);
    }
  };

  const handleCopyAntonym = (antonymText: string, index: number) => {
    navigator.clipboard.writeText(antonymText);
    setCopiedAntonymIndex(index);
    setTimeout(() => {
      setCopiedAntonymIndex(null);
    }, 2000);
  };

  const handleCopyChallenge = (challengeText: string) => {
    navigator.clipboard.writeText(challengeText);
    setCopiedChallenge(true);
    setTimeout(() => {
      setCopiedChallenge(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1115]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161B22] border border-[#2D3748] rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-[#1A202C] border-b border-[#2D3748] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#D4AF37] text-[#1A202C] font-bold flex items-center justify-center text-base shadow-sm">
              {wordItem.word.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                بطاقة الكلمة والمعجم: {wordItem.word}
              </h3>
              <p className="text-xs text-[#A0AEC0]">
                التحليل الصرفي، معجم لسان العرب، واقتراح المرادفات والمتضادات الإبداعية
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

        {/* Navigation Tabs for Inspector Features */}
        <div className="bg-[#0D1117] border-b border-[#2D3748] px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-[#D4AF37] text-[#1A202C] font-bold shadow"
                : "text-[#A0AEC0] hover:text-white hover:bg-[#1A202C]"
            }`}
          >
            عرض شامل
          </button>

          <button
            id="tab-inspector-antonyms"
            onClick={() => {
              setActiveTab("antonyms");
              if (!antonymsData && !loadingAntonyms) {
                handleFetchAntonyms();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "antonyms"
                ? "bg-rose-500 text-white font-bold shadow"
                : "text-rose-400 hover:bg-rose-500/10"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>المتضادات والكتابة الإبداعية</span>
            {antonymsData && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
                {antonymsData.antonyms.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("synonyms")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "synonyms"
                ? "bg-amber-500 text-[#1A202C] font-bold shadow"
                : "text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>المرادفات والبدائل</span>
          </button>

          <button
            onClick={() => setActiveTab("lexicon")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "lexicon"
                ? "bg-[#D4AF37] text-[#1A202C] font-bold shadow"
                : "text-[#CBD5E0] hover:bg-[#1A202C]"
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>معجم لسان العرب</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-right text-xs overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {/* TTS Speech Bar for Word & Meaning */}
          <div className="p-3 bg-[#0D1117] rounded-xl border border-[#2D3748] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{wordItem.word}</span>
              <span className="text-xs text-[#A0AEC0]">({posMeta?.labelArabic})</span>
            </div>
            <TtsPlayerBar
              textToSpeak={`${wordItem.word}. ${activeLisanEntry.meaning}`}
              compact={true}
            />
          </div>

          {/* Main Attributes Grid */}
          <div className="grid grid-cols-2 gap-3">
            
            <div className="p-3 rounded-lg bg-[#1A202C] border border-[#2D3748]">
              <span className="text-[#A0AEC0] block mb-1">القسم النحوي:</span>
              <span className={`px-2 py-0.5 rounded font-bold border inline-block ${posMeta?.badgeClass}`}>
                {wordItem.posArabic}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#1A202C] border border-[#2D3748]">
              <span className="text-[#A0AEC0] block mb-1">عدد مرات التكرار:</span>
              <span className="font-bold text-sm text-[#D4AF37] font-mono">
                {wordItem.count} مرات ({wordItem.frequencyPercentage.toFixed(1)}%)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#1A202C] border border-[#2D3748]">
              <span className="text-[#A0AEC0] block mb-1">الجذر الصرفي:</span>
              <span className="font-bold text-sm text-[#D4AF37] font-mono">
                {wordItem.root}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#1A202C] border border-[#2D3748]">
              <span className="text-[#A0AEC0] block mb-1">الكلمة مجردة:</span>
              <span className="font-bold text-sm text-[#E2E8F0]">
                {wordItem.cleanWord}
              </span>
            </div>

          </div>

          {/* AI Antonyms & Creative Writing Opposites Section */}
          {(activeTab === "all" || activeTab === "antonyms") && (
            <div className="p-4 rounded-xl bg-[#0D1117] border border-rose-500/40 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#2D3748] pb-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 text-sm">
                  <ArrowLeftRight className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>المتضادات وعكس المعنى (الكتابة الإبداعية والطباق)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <PenTool className="w-2.5 h-2.5" /> أسرار البلاغة
                  </span>
                  <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full font-mono">
                    Gemini AI
                  </span>
                </div>
              </div>

              {/* Trigger Button or Loading or Content */}
              {!antonymsData && !loadingAntonyms && (
                <div className="text-center py-4 space-y-2.5 bg-[#161B22]/60 rounded-xl border border-[#2D3748] p-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-sm text-white">
                    اكتشف أضداد الكلمة وأسرار توظيف التناقض والطباق في نصوصك
                  </h5>
                  <p className="text-[#A0AEC0] text-xs max-w-md mx-auto leading-relaxed">
                    «بضدها تتبين الأشياء» — استخرج المتضادات الدقيقة لـ <strong className="text-white">"{wordItem.word}"</strong> مع إرشادات كتابية وشواهد أدبية وتحديات لتحفيز الإبداع الأدبي وصياغة المشاهد المتقابلة.
                  </p>
                  <button
                    id="btn-fetch-antonyms"
                    onClick={handleFetchAntonyms}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-lg text-xs shadow-md transition-all transform active:scale-95"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>استخراج المتضادات وتحدي الكتابة الإبداعية</span>
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loadingAntonyms && (
                <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-rose-300">
                  <Loader2 className="w-7 h-7 animate-spin text-rose-400" />
                  <span className="text-xs font-semibold">
                    جاري استخراج المتضادات الفصيحة وصياغة تحديات الكتابة الإبداعية...
                  </span>
                  <span className="text-[11px] text-[#A0AEC0]">
                    يتم تحليل الفروق الدلالية وتطبيقات الطباق والمقابلة
                  </span>
                </div>
              )}

              {/* Error State */}
              {antonymsError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs space-y-2">
                  <p>{antonymsError}</p>
                  <button
                    onClick={handleFetchAntonyms}
                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded border border-rose-500/40 font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>إعادة المحاولة</span>
                  </button>
                </div>
              )}

              {/* Render Antonyms Data */}
              {antonymsData && (
                <div className="space-y-3.5 text-xs animate-in fade-in duration-200">
                  
                  {/* Creative Overview & Rhetorical Insight */}
                  <div className="p-3 bg-[#161B22] border border-rose-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        بلاغة التضاد وفن التناقض:
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                        {antonymsData.rhetoricalDevice}
                      </span>
                    </div>
                    <p className="leading-relaxed text-[#CBD5E0] text-[11px]">
                      {antonymsData.creativeOverview}
                    </p>
                  </div>

                  {/* Antonyms Cards */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span className="flex items-center gap-1.5">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-rose-400" />
                        قائمة المتضادات (عكس المعنى) وأسرار توظيفها:
                      </span>
                      <span className="text-[10px] text-[#A0AEC0] font-normal">
                        {antonymsData.antonyms.length} متضادات
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {antonymsData.antonyms.map((ant, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#161B22] border border-[#2D3748] hover:border-rose-500/40 rounded-xl space-y-2 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base text-rose-300 font-serif">
                                {ant.antonym}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                                {ant.contrastDegree}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* TTS */}
                              <TtsPlayerBar
                                textToSpeak={ant.antonym}
                                compact={true}
                              />

                              {/* Copy */}
                              <button
                                onClick={() => handleCopyAntonym(ant.antonym, idx)}
                                className="p-1 rounded text-[#A0AEC0] hover:text-white hover:bg-[#2D3748] transition-colors flex items-center gap-1 text-[10px]"
                                title="نسخ الكلمة المضادة"
                              >
                                {copiedAntonymIndex === idx ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">تم النسخ</span>
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

                          {/* Example Literary Contrast */}
                          <div className="p-2 bg-[#0D1117] rounded-lg border border-[#2D3748]/60 space-y-1">
                            <span className="text-[10px] font-bold text-[#A0AEC0] block">
                              شاهد أدبي يجمع الكلمة وضدها (طباق):
                            </span>
                            <p className="text-[#E2E8F0] font-serif text-[11px] italic leading-relaxed">
                              "{ant.exampleUsage}"
                            </p>
                          </div>

                          {/* Creative Writing Tip */}
                          <p className="text-[11px] text-[#CBD5E0] leading-relaxed flex items-start gap-1.5 pt-0.5">
                            <span className="text-rose-400 shrink-0 font-bold">💡 إرشاد للكاتب:</span>
                            <span>{ant.creativePrompt}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creative Writing Challenge Box */}
                  {antonymsData.creativeWritingChallenge && (
                    <div className="p-3 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-[#0D1117] border border-rose-500/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                          <Target className="w-4 h-4 text-rose-400" />
                          تحدي الكتابة الإبداعية (Creative Writing Challenge):
                        </span>
                        <button
                          onClick={() => handleCopyChallenge(antonymsData.creativeWritingChallenge)}
                          className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          {copiedChallenge ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>تم نسخ التحدي</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>نسخ نص التحدي</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[#E2E8F0] leading-relaxed font-serif bg-[#161B22]/70 p-2.5 rounded-lg border border-rose-500/20">
                        {antonymsData.creativeWritingChallenge}
                      </p>
                    </div>
                  )}

                  {/* Re-generate button */}
                  <div className="text-left pt-1">
                    <button
                      onClick={handleFetchAntonyms}
                      className="text-[11px] text-[#A0AEC0] hover:text-rose-300 flex items-center gap-1 ml-auto transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>إعادة توليد متضادات وتحديات جديدة</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* AI Synonyms & Stylistic Enhancements Section */}
          {(activeTab === "all" || activeTab === "synonyms") && (
            <div className="p-4 rounded-xl bg-[#0D1117] border border-amber-500/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#2D3748] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>اقتراح المرادفات والبدائل البلاغية بالذكاء الاصطناعي</span>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                Gemini AI
              </span>
            </div>

            {/* Trigger Button or Loading or Content */}
            {!synonymsData && !loadingSynonyms && (
              <div className="text-center py-3 space-y-2">
                <p className="text-[#A0AEC0] text-xs">
                  احصل على مرادفات عربية فصيحة وبدائل أسلوبية مثرية تناسب سياق جملتك لتحسين الأسلوب الكتابي والتعبيري.
                </p>
                <button
                  onClick={handleFetchSynonyms}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:from-amber-600 hover:to-[#b8982f] text-[#1A202C] font-bold rounded-lg text-xs shadow-md transition-all transform active:scale-95"
                >
                  <Feather className="w-4 h-4" />
                  <span>اقتراح المرادفات والبدائل بالذكاء الاصطناعي</span>
                </button>
              </div>
            )}

            {/* Loading State */}
            {loadingSynonyms && (
              <div className="py-6 flex flex-col items-center justify-center gap-2.5 text-amber-300">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-semibold">
                  جاري تحليل السياق واستخراج أفصح المرادفات والبدائل البلاغية...
                </span>
              </div>
            )}

            {/* Error State */}
            {synonymsError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs space-y-2">
                <p>{synonymsError}</p>
                <button
                  onClick={handleFetchSynonyms}
                  className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded border border-rose-500/40 font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            )}

            {/* Render Synonyms Data */}
            {synonymsData && (
              <div className="space-y-3 text-xs animate-in fade-in duration-200">
                
                {/* Stylistic Overview */}
                <div className="p-2.5 bg-[#161B22] border border-[#2D3748] rounded-lg text-[#E2E8F0]">
                  <span className="font-bold text-amber-400 block mb-0.5 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    الملاحظة البلاغية والأسلوبية:
                  </span>
                  <p className="leading-relaxed text-[#CBD5E0] text-[11px]">
                    {synonymsData.stylisticOverview}
                  </p>
                </div>

                {/* Synonyms Grid / Cards */}
                <div className="space-y-2">
                  <span className="font-bold text-white block text-xs">
                    المرادفات والبدائل الموصى بها:
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                    {synonymsData.synonyms.map((syn, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#161B22] border border-[#2D3748] hover:border-amber-500/40 rounded-lg space-y-1.5 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-amber-300 font-serif">
                              {syn.synonym}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                              {syn.nuance}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* TTS for synonym */}
                            <TtsPlayerBar
                              textToSpeak={syn.synonym}
                              compact={true}
                            />

                            {/* Copy Synonym Button */}
                            <button
                              onClick={() => handleCopySynonym(syn.synonym, idx)}
                              className="p-1 rounded text-[#A0AEC0] hover:text-white hover:bg-[#2D3748] transition-colors flex items-center gap-1 text-[10px]"
                              title="نسخ الكلمة المرادفة"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">تم النسخ</span>
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

                        {/* Example Usage */}
                        <p className="text-[#CBD5E0] text-[11px] font-serif italic bg-[#0D1117] p-1.5 rounded border border-[#2D3748]/50">
                          مثال: "{syn.exampleUsage}"
                        </p>

                        {/* Style Tip */}
                        <p className="text-[10px] text-[#A0AEC0] flex items-center gap-1">
                          <span className="text-amber-400 font-bold">💡 نصيحة الاستخدام:</span> {syn.styleTip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Antonyms if available */}
                {synonymsData.antonyms && synonymsData.antonyms.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px] pt-1">
                    <span className="font-bold text-[#A0AEC0] flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3 text-rose-400" /> الأضداد والمقابلات:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {synonymsData.antonyms.map((ant, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {ant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stylistic General Advice */}
                {synonymsData.stylisticAdvice && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-[11px] leading-relaxed">
                    <span className="font-bold text-amber-400 block mb-0.5">توصية الصياغة الكتابية:</span>
                    {synonymsData.stylisticAdvice}
                  </div>
                )}

                {/* Re-generate button */}
                <div className="text-left pt-1">
                  <button
                    onClick={handleFetchSynonyms}
                    className="text-[11px] text-[#A0AEC0] hover:text-amber-300 flex items-center gap-1 ml-auto transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>إعادة توليد اقتراحات جديدة</span>
                  </button>
                </div>

              </div>
            )}
          </div>
          )}

          {/* Lisan Al-Arab Lexicon Entry Section */}
          {(activeTab === "all" || activeTab === "lexicon") && (
            <div className="p-4 rounded-xl bg-[#0D1117] border border-[#D4AF37]/30 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2D3748] pb-2 gap-2">
                <div className="flex items-center gap-1.5 font-bold text-[#D4AF37] text-sm">
                  <BookMarked className="w-4 h-4 text-[#D4AF37]" />
                  <span>شرح المفردة في معجم «لسان العرب» لابن منظور</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#1A202C] text-[#D4AF37] border border-[#2D3748]">
                    {activeLisanEntry.bab}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1A202C] text-[#A0AEC0] border border-[#2D3748]">
                    {activeLisanEntry.fasl}
                  </span>
                </div>
              </div>

              <p className="text-[#CBD5E0] leading-relaxed font-serif text-sm">
                {activeLisanEntry.fullLexicalText}
              </p>

              {activeLisanEntry.examplesAndVerses && activeLisanEntry.examplesAndVerses.length > 0 && (
                <div className="pt-2 border-t border-[#2D3748]/60 space-y-1">
                  <span className="text-[#A0AEC0] font-semibold text-[11px] flex items-center gap-1">
                    <Quote className="w-3 h-3 text-[#D4AF37]" /> الشواهد والآيات:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[#E2E8F0] italic font-serif">
                    {activeLisanEntry.examplesAndVerses.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeLisanEntry.derivatives && activeLisanEntry.derivatives.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-[#A0AEC0] font-semibold">أبرز المشتقات:</span>
                  {activeLisanEntry.derivatives.map((der, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[#1A202C] text-[#E2E8F0] border border-[#2D3748]"
                    >
                      {der}
                    </span>
                  ))}
                </div>
              )}

              {/* Expand or AI Search for Lisan Al-Arab button */}
              <div className="pt-2 border-t border-[#2D3748]/40 flex items-center justify-between">
                <span className="text-[10px] text-[#A0AEC0]">
                  {aiLisanEntry ? "تم استخراج المادة مباشرة من لسان العرب بالذكاء الاصطناعي" : "شرح معجمي محلي معتمد"}
                </span>
                <button
                  onClick={handleFetchAiLisan}
                  disabled={loadingLisan}
                  className="px-2.5 py-1 bg-[#1A202C] hover:bg-[#2D3748] text-[#D4AF37] border border-[#D4AF37]/30 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loadingLisan ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>جاري التوثيق...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>توسيع الشرح المعجمي التراثي بالذكاء الاصطناعي</span>
                    </>
                  )}
                </button>
              </div>

              {lisanError && (
                <p className="text-[10px] text-rose-400 mt-1">{lisanError}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E2E8F0]">
            <span className="font-bold text-[#D4AF37] block mb-1">الخاصية النحوية:</span>
            <p className="leading-relaxed">{posMeta?.description}</p>
          </div>

          {/* Occurrences in Sentences */}
          <div className="space-y-2">
            <span className="font-bold text-[#E2E8F0] block">
              سياقات ظهور الكلمة في النص ({matchingSentences.length} جملة):
            </span>
            <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 bg-[#0D1117] border border-[#2D3748] rounded-lg">
              {matchingSentences.length === 0 ? (
                <p className="text-[#718096]">لا توجد جمل سياقية محددة.</p>
              ) : (
                matchingSentences.map((s, idx) => (
                  <div key={idx} className="p-2 bg-[#1A202C] rounded border border-[#2D3748] text-[#CBD5E0]">
                    "{s.trim()}"
                  </div>
                ))
              )}
            </div>
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


