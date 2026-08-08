import React, { useState, useMemo } from "react";
import { TextToken, WordItem, HighlightMode, PosType, GrammarError } from "../types";
import { POS_DEFINITIONS, normalizeArabic, stripDiacritics } from "../utils/arabicNlp";
import { TtsPlayerBar } from "./TtsPlayerBar";
import {
  detectGrammarErrors,
  applyCorrection,
  applyAllCorrections,
} from "../utils/grammarChecker";
import {
  Eye,
  Edit3,
  Layers,
  Palette,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  X,
  Wand2,
  AlertTriangle,
  Check,
  CheckCheck,
  ArrowLeft,
  HelpCircle,
  BookOpenCheck,
} from "lucide-react";

interface InteractiveTextReaderProps {
  text: string;
  onChangeText: (newText: string) => void;
  tokens: TextToken[];
  wordItems: WordItem[];
  selectedWordId: string | null;
  onSelectWord: (wordItem: WordItem | null) => void;
  highlightMode: HighlightMode;
  onSetHighlightMode: (mode: HighlightMode) => void;
}

export const InteractiveTextReader: React.FC<InteractiveTextReaderProps> = ({
  text,
  onChangeText,
  tokens,
  wordItems,
  selectedWordId,
  onSelectWord,
  highlightMode,
  onSetHighlightMode,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showGrammarInspector, setShowGrammarInspector] = useState<boolean>(false);
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);

  // Run Real-time Grammar & Spelling Engine
  const grammarErrors = useMemo(() => {
    return detectGrammarErrors(text);
  }, [text]);

  // Quick lookup map for WordItems
  const wordMap = new Map<string, WordItem>();
  wordItems.forEach((item) => wordMap.set(item.id, item));

  const selectedWordObj = selectedWordId ? wordItems.find((w) => w.id === selectedWordId) : null;

  // Search matching helper
  const normalizedQuery = normalizeArabic(searchTerm.trim().toLowerCase());

  const isTokenMatch = (token: TextToken) => {
    if (!token.isWord || !normalizedQuery) return false;
    const cleanTokenNorm = normalizeArabic((token.cleanText || "").toLowerCase());
    const origTokenNorm = normalizeArabic((token.originalText || "").toLowerCase());
    return cleanTokenNorm.includes(normalizedQuery) || origTokenNorm.includes(normalizedQuery);
  };

  const searchMatchesCount = useMemo(() => {
    if (!normalizedQuery) return 0;
    return tokens.filter((t) => isTokenMatch(t)).length;
  }, [tokens, normalizedQuery]);

  const handleFixSingleError = (err: GrammarError) => {
    const updated = applyCorrection(text, err);
    onChangeText(updated);
  };

  const handleFixAllErrors = () => {
    const updated = applyAllCorrections(text, grammarErrors);
    onChangeText(updated);
  };

  return (
    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden transition-colors relative">
      
      {/* Top Toolbar */}
      <div className="p-3 sm:p-4 bg-[#1A202C] border-b border-[#2D3748] flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Toggle Mode: View vs Edit */}
        <div className="flex items-center gap-1.5 bg-[#0D1117] p-1 rounded-lg w-fit border border-[#2D3748]">
          <button
            id="btn-mode-interactive"
            onClick={() => setIsEditing(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              !isEditing
                ? "bg-[#161B22] text-[#D4AF37] border border-[#D4AF37]/30 shadow-xs"
                : "text-[#A0AEC0] hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>عرض النص والتظليل</span>
          </button>
          <button
            id="btn-mode-edit"
            onClick={() => setIsEditing(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isEditing
                ? "bg-[#161B22] text-[#D4AF37] border border-[#D4AF37]/30 shadow-xs"
                : "text-[#A0AEC0] hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>محرر النص الأصلي</span>
          </button>
        </div>

        {/* Action Controls: Grammar Checker & Highlight Modes */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Grammar & Spelling Checker Toggle */}
          <button
            id="btn-toggle-grammar-checker"
            onClick={() => setShowGrammarInspector(!showGrammarInspector)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
              showGrammarInspector
                ? "bg-[#D4AF37] text-[#1A202C] border-[#D4AF37] font-bold shadow-md"
                : grammarErrors.length > 0
                ? "bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20"
                : "bg-[#0D1117] text-[#A0AEC0] border-[#2D3748] hover:text-white"
            }`}
            title="التدقيق الإملائي والنحوي التلقائي للنص"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>التدقيق الإملائي والنحوي</span>
            {grammarErrors.length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-[#1A202C] font-mono text-[10px] font-black">
                {grammarErrors.length}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> سليم
              </span>
            )}
          </button>

          {/* Color Highlight Mode Controls */}
          {!isEditing && (
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-xs text-[#A0AEC0] font-medium ml-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
                النمط:
              </span>

              <button
                id="highlight-mode-none"
                onClick={() => onSetHighlightMode("none")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                  highlightMode === "none"
                    ? "bg-[#D4AF37] text-[#1A202C] border-[#D4AF37] font-bold"
                    : "bg-[#0D1117] text-[#CBD5E0] border-[#2D3748] hover:bg-[#161B22]"
                }`}
              >
                عادي
              </button>

              <button
                id="highlight-mode-frequency"
                onClick={() => onSetHighlightMode("frequency")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                  highlightMode === "frequency"
                    ? "bg-[#D4AF37] text-[#1A202C] border-[#D4AF37] font-bold"
                    : "bg-[#0D1117] text-[#D4AF37] border-[#2D3748] hover:bg-[#161B22]"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                المكرر
              </button>

              <button
                id="highlight-mode-pos"
                onClick={() => onSetHighlightMode("pos")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                  highlightMode === "pos"
                    ? "bg-blue-500 text-white border-blue-500 font-bold"
                    : "bg-[#0D1117] text-blue-400 border-[#2D3748] hover:bg-[#161B22]"
                }`}
              >
                <Layers className="w-3 h-3" />
                النحو
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Grammar & Spelling Inspector Drawer / Panel */}
      {showGrammarInspector && (
        <div className="bg-[#0D1117] border-b border-[#2D3748] p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D3748]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BookOpenCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  مساعد التدقيق اللغوي والإملائي المباشر
                  {grammarErrors.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono">
                      {grammarErrors.length} ملاحظة
                    </span>
                  )}
                </h4>
                <p className="text-xs text-[#A0AEC0]">
                  اكتشاف أخطاء الهمزات، التاء والهاء المربوطة، الألف المقصورة، وواو العطف تلقائياً
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {grammarErrors.length > 0 && (
                <button
                  onClick={handleFixAllErrors}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c29f31] text-[#1A202C] text-xs font-bold transition-colors shadow-sm"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>تصحيح كافة الأخطاء بضغطة واحدة ({grammarErrors.length})</span>
                </button>
              )}

              <button
                onClick={() => setShowGrammarInspector(false)}
                className="p-1.5 text-[#A0AEC0] hover:text-white rounded-lg transition-colors"
                title="إغلاق اللوحة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {grammarErrors.length === 0 ? (
            <div className="py-6 text-center space-y-2 bg-[#161B22] rounded-xl border border-[#2D3748]">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-sm text-white">ممتاز! لم يتم العثور على أخطاء إملائية أو نحو شائعة.</h5>
              <p className="text-xs text-[#A0AEC0]">
                النص يبدو سليماً وفق القواعد النحوية والإملائية الأساسية للهمزات وعلامات الترقيم.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
              {grammarErrors.map((err, idx) => (
                <div
                  key={err.id || idx}
                  className="p-3 rounded-xl bg-[#161B22] border border-[#2D3748] hover:border-amber-500/50 transition-all flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {err.type}
                      </span>
                      <span className="text-[10px] text-[#A0AEC0] font-mono">
                        موقع #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm pt-1">
                      <span className="line-through text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {err.word}
                      </span>
                      <ArrowLeft className="w-3.5 h-3.5 text-[#A0AEC0] shrink-0" />
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {err.suggestion}
                      </span>
                    </div>

                    <p className="text-xs text-[#CBD5E0] leading-relaxed">
                      {err.explanation}
                    </p>
                  </div>

                  <button
                    onClick={() => handleFixSingleError(err)}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-[#1A202C] hover:bg-amber-500/20 hover:text-amber-300 text-xs font-semibold text-[#CBD5E0] border border-[#2D3748] hover:border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>تطبيق التصحيح</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Secondary Search Sub-bar */}
      {!isEditing && (
        <div className="p-2.5 px-4 bg-[#0D1117] border-b border-[#2D3748] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              id="search-word-reader"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث عن كلمة في النص وتظليل كافة تكراراتها..."
              dir="rtl"
              className="w-full pl-8 pr-9 py-1.5 text-xs rounded-lg border border-[#2D3748] bg-[#161B22] text-[#E2E8F0] placeholder-[#718096] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
            <Search className="w-3.5 h-3.5 text-[#A0AEC0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white p-0.5 rounded transition-colors"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchTerm.trim().length > 0 && (
            <div className="text-xs text-[#CBD5E0] font-medium flex items-center gap-1.5 bg-[#1A202C] px-3 py-1 rounded-md border border-[#2D3748]">
              <span>نتائج البحث:</span>
              <span className="font-bold text-[#D4AF37] font-mono">
                {searchMatchesCount} تكرار
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6 min-h-[220px] relative space-y-4">
        
        {/* TTS Speech Bar */}
        <TtsPlayerBar
          textToSpeak={text}
          title="الاستماع لقراءة النص العربي بالنطق الفصيح"
        />

        {isEditing ? (
          <div className="space-y-3 mt-4">
            <textarea
              id="input-arabic-text"
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder="اكتب أو الصق النص العربي هنا للتحليل والإعراب وتعداد الكلمات المكررة والتدقيق النحوي..."
              dir="rtl"
              rows={8}
              className="w-full p-4 rounded-xl border border-[#2D3748] bg-[#0D1117] text-[#CBD5E0] text-lg sm:text-xl leading-relaxed focus:outline-none focus:border-[#D4AF37] font-serif resize-y"
            />
            
            {/* Live Inline Suggestions Widget when editing */}
            {grammarErrors.length > 0 && (
              <div className="p-3 bg-[#0D1117] border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    اقتراحات التصحيح السريع أثناء الكتابة ({grammarErrors.length}):
                  </span>
                  <button
                    onClick={handleFixAllErrors}
                    className="text-[#D4AF37] hover:underline font-bold text-xs"
                  >
                    تصحيح الكل ({grammarErrors.length})
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grammarErrors.slice(0, 5).map((err, i) => (
                    <button
                      key={i}
                      onClick={() => handleFixSingleError(err)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161B22] border border-amber-500/40 text-xs text-[#E2E8F0] hover:bg-amber-500/20 transition-colors"
                      title={err.explanation}
                    >
                      <span className="line-through text-rose-400 font-mono">{err.word}</span>
                      <ArrowLeft className="w-3 h-3 text-[#A0AEC0]" />
                      <span className="text-emerald-400 font-bold font-mono">{err.suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-[#718096] text-left">
              عدد الحروف: {text.length}
            </p>
          </div>
        ) : (
          <div className="mt-4">
            {!text || text.trim().length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-[#A0AEC0] text-sm">
                  لا يوجد نص معروض حالياً. اكتب نصاً أو اختر من النصوص النموذجية أعلاه.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f31] text-[#1A202C] rounded-lg text-xs font-bold"
                >
                  إدخال نص جديد
                </button>
              </div>
            ) : (
              <div
                dir="rtl"
                className="text-xl sm:text-2xl leading-relaxed text-[#CBD5E0] font-serif select-text"
              >
                {tokens.map((token) => {
                  if (!token.isWord || !token.wordItemId) {
                    return (
                      <span key={`t_${token.index}`} className="whitespace-pre-wrap">
                        {token.originalText}
                      </span>
                    );
                  }

                  const wordObj = wordMap.get(token.wordItemId);
                  if (!wordObj) {
                    return <span key={`t_${token.index}`}>{token.originalText}</span>;
                  }

                  const isSelected = selectedWordId === wordObj.id;
                  const isMatched = isTokenMatch(token);

                  // Check if this token matches a grammar error
                  const hasGrammarError = grammarErrors.some(
                    (e) => e.word === token.originalText || e.word === wordObj.word
                  );

                  let colorClass = "";

                  if (isMatched) {
                    colorClass = "bg-[#D4AF37] text-[#1A202C] font-black ring-2 ring-[#D4AF37]/80 shadow-md scale-105 z-20 relative rounded-sm px-1.5";
                  } else if (highlightMode === "frequency") {
                    if (wordObj.isRepeated) {
                      colorClass = wordObj.colorTag;
                    }
                  } else if (highlightMode === "pos") {
                    const posMeta = POS_DEFINITIONS[wordObj.pos];
                    if (posMeta) {
                      colorClass = posMeta.bgHighlightClass;
                    }
                  }

                  return (
                    <span
                      key={`t_${token.index}`}
                      onClick={() => onSelectWord(isSelected ? null : wordObj)}
                      className={`inline-block px-1 py-0.5 mx-0.5 rounded cursor-pointer transition-all ${colorClass} ${
                        isSelected && !isMatched
                          ? "ring-2 ring-[#D4AF37] scale-105 font-bold shadow-md z-10 relative bg-[#D4AF37]/20"
                          : "hover:scale-105"
                      } ${
                        hasGrammarError && !isMatched
                          ? "border-b-2 border-dashed border-amber-400/80 bg-amber-500/10"
                          : ""
                      }`}
                      title={`${wordObj.word} (${wordObj.posArabic}) - تكررت: ${wordObj.count} مرة${
                        hasGrammarError ? " | يتوفر اقتراح تصحيح إملائي" : ""
                      }`}
                    >
                      {token.originalText}
                      {highlightMode === "frequency" && wordObj.isRepeated && (
                        <sub className="text-[10px] font-mono font-bold mr-0.5 text-[#D4AF37]">
                          [{wordObj.count}]
                        </sub>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Word Bar / Inspector Footer */}
      {!isEditing && selectedWordObj && (
        <div className="bg-[#1A202C] border-t border-[#2D3748] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#D4AF37] text-[#1A202C] flex items-center justify-center font-bold text-sm">
              {selectedWordObj.word.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {selectedWordObj.word}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${POS_DEFINITIONS[selectedWordObj.pos]?.badgeClass}`}>
                  {selectedWordObj.posArabic}
                </span>
                {selectedWordObj.isRepeated && (
                  <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded font-bold text-[11px]">
                    مكررة {selectedWordObj.count} مرات
                  </span>
                )}
              </div>
              <p className="text-[#A0AEC0] mt-0.5">
                الجذر الصرفي: <strong className="font-mono text-[#D4AF37]">{selectedWordObj.root}</strong> | النسبة من النص: {selectedWordObj.frequencyPercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectWord(null)}
            className="text-[#A0AEC0] hover:text-white underline text-xs"
          >
            إلغاء التحديد
          </button>
        </div>
      )}

      {/* Legend Footer for Highlight Modes */}
      {!isEditing && highlightMode !== "none" && (
        <div className="bg-[#0D1117] border-t border-[#2D3748] p-3 px-4 text-xs">
          {highlightMode === "frequency" && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-[#A0AEC0]">دليل ألوان التكرار:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 inline-block"></span>
                <span className="text-[#CBD5E0]">تكرار منخفض (2)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-orange-500/30 border border-orange-500/60 inline-block"></span>
                <span className="text-[#CBD5E0]">متوسط (3-4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-red-500/30 border border-red-500/60 inline-block"></span>
                <span className="text-[#CBD5E0]">تكرار مكثف (5+)</span>
              </div>
            </div>
          )}

          {highlightMode === "pos" && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-[#A0AEC0]">دليل أقسام الكلام:</span>
              {(Object.keys(POS_DEFINITIONS) as PosType[]).map((key) => {
                const info = POS_DEFINITIONS[key];
                return (
                  <div key={key} className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${info.badgeClass}`}>
                      {info.labelArabic}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

