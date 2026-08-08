import React, { useState } from "react";
import { GrammarCategory, WordItem, PosType } from "../types";
import { POS_DEFINITIONS } from "../utils/arabicNlp";
import {
  Layers,
  Search,
  BookOpen,
  Sparkles,
  ChevronLeft,
  Tag,
  Hash,
} from "lucide-react";

interface GrammarTabsProps {
  categories: GrammarCategory[];
  onSelectWord: (wordItem: WordItem) => void;
  onInspectWordIrab?: (wordItem: WordItem) => void;
}

export const GrammarTabs: React.FC<GrammarTabsProps> = ({
  categories,
  onSelectWord,
  onInspectWordIrab,
}) => {
  const [activeTab, setActiveTab] = useState<PosType>("noun");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentCategory = categories.find((c) => c.key === activeTab) || categories[0] || null;

  // Filter words in active category by search query
  const filteredWords = currentCategory
    ? currentCategory.words.filter((w) =>
        w.word.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        w.cleanWord.includes(searchQuery.trim()) ||
        w.root.includes(searchQuery.trim())
      )
    : [];

  if (!currentCategory) {
    return (
      <div className="bg-[#0D1117] border border-[#2D3748] rounded-xl p-8 text-center text-[#718096] text-xs">
        يرجى كتابة أو لصق نص عربي في المربع أعلاه لعرض التبويب والتحليل النحوي لأقسام الكلام.
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] border border-[#2D3748] rounded-xl overflow-hidden transition-colors">
      
      {/* Category Section Header */}
      <div className="p-4 sm:p-5 border-b border-[#2D3748] bg-[#1A202C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#161B22] text-[#D4AF37]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#A0AEC0] uppercase tracking-widest">
              التبويب النحوي وأقسام الكلام
            </h2>
            <p className="text-xs text-[#718096]">
              تصنيف دقيق للمفردات: أسماء، أفعال، حروف وأدوات، ضمائر، وصفات
            </p>
          </div>
        </div>

        {/* Search input in tab */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المفردات أو الجذر..."
            dir="rtl"
            className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-[#2D3748] bg-[#161B22] text-[#E2E8F0] focus:outline-none focus:border-[#D4AF37]"
          />
          <Search className="w-3.5 h-3.5 text-[#A0AEC0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-[#2D3748] bg-[#161B22] px-3 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = cat.key === activeTab;

          return (
            <button
              key={cat.key}
              onClick={() => {
                setActiveTab(cat.key);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 border-t border-x ${
                isActive
                  ? "bg-[#1A202C] text-white border-[#2D3748] border-b-transparent -mb-px"
                  : "bg-transparent text-[#A0AEC0] border-transparent hover:text-white hover:bg-[#1A202C]/50"
              }`}
            >
              <span>{cat.labelArabic}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${cat.badgeClass}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Header Info */}
      <div className="p-4 bg-[#161B22]/60 border-b border-[#2D3748] text-xs text-[#A0AEC0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="font-bold text-white">
            {currentCategory.labelArabic}:
          </span>{" "}
          {POS_DEFINITIONS[currentCategory.key]?.description}
        </div>
        <div className="font-mono text-[#D4AF37] font-medium">
          العدد: {currentCategory.count} كلمة ({currentCategory.percentage}% من النص)
        </div>
      </div>

      {/* Words Grid inside Active Tab */}
      <div className="p-4 sm:p-5">
        {filteredWords.length === 0 ? (
          <div className="text-center py-8 text-[#718096] text-xs">
            لا توجد كلمات ضمن فئة "{currentCategory.labelArabic}" مطابقة للبحث.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredWords.map((word) => (
              <div
                key={word.id}
                onClick={() => onSelectWord(word)}
                className="group bg-[#1A202C] hover:bg-[#21262d] border border-[#2D3748] hover:border-[#D4AF37]/50 rounded-lg p-3 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-[#D4AF37]">
                      {word.word}
                    </span>
                    {word.isRepeated && (
                      <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        ×{word.count}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#A0AEC0] font-mono">
                    الجذر: <span className="font-bold text-white">{word.root}</span> | {word.frequencyPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onInspectWordIrab && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectWordIrab(word);
                      }}
                      title="عرض الإعراب والجذر"
                      className="p-1.5 rounded bg-[#161B22] text-[#A0AEC0] hover:text-[#D4AF37] border border-[#2D3748] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronLeft className="w-4 h-4 text-[#718096] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
