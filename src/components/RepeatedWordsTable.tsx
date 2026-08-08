import React, { useState } from "react";
import { WordItem } from "../types";
import { POS_DEFINITIONS } from "../utils/arabicNlp";
import {
  Repeat,
  Filter,
  Search,
  CheckCircle2,
  Sparkles,
  BarChart,
  Eye,
} from "lucide-react";

interface RepeatedWordsTableProps {
  wordItems: WordItem[];
  totalWordsCount: number;
  minRepeatThreshold: number;
  onChangeMinRepeat: (newMin: number) => void;
  ignoreStopWords: boolean;
  onToggleStopWords: (ignore: boolean) => void;
  ignoreDiacritics: boolean;
  onToggleDiacritics: (ignore: boolean) => void;
  onSelectWord: (wordItem: WordItem) => void;
  selectedWordId: string | null;
}

export const RepeatedWordsTable: React.FC<RepeatedWordsTableProps> = ({
  wordItems,
  totalWordsCount,
  minRepeatThreshold,
  onChangeMinRepeat,
  ignoreStopWords,
  onToggleStopWords,
  ignoreDiacritics,
  onToggleDiacritics,
  onSelectWord,
  selectedWordId,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter word items to those matching repeat criteria
  const repeatedWords = wordItems.filter((item) => {
    const satisfiesMin = item.count >= minRepeatThreshold;
    const satisfiesStopWords = ignoreStopWords ? !item.isStopWord : true;
    const satisfiesSearch =
      item.word.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      item.cleanWord.includes(searchQuery.trim()) ||
      item.root.includes(searchQuery.trim());

    return satisfiesMin && satisfiesStopWords && satisfiesSearch;
  });

  const totalRepeatedTypes = repeatedWords.length;
  const maxWordRepeat = wordItems.length > 0 ? Math.max(...wordItems.map((w) => w.count)) : 1;

  return (
    <div className="bg-[#0D1117] border border-[#2D3748] rounded-xl overflow-hidden transition-colors">
      
      {/* Table Section Header */}
      <div className="p-4 sm:p-5 border-b border-[#2D3748] bg-[#1A202C] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#161B22] text-[#D4AF37]">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#A0AEC0] uppercase tracking-widest flex items-center gap-2">
              جدول إبراز وتبويب الكلمات المكررة
              <span className="text-xs px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-bold font-mono">
                {totalRepeatedTypes} كلمة مكررة
              </span>
            </h2>
            <p className="text-xs text-[#718096]">
              تحليل التكرارات ونسبتها مع إمكانية استبعاد حروف الجر والتصفية الشاملة
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في الكلمات المكررة..."
            dir="rtl"
            className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-[#2D3748] bg-[#161B22] text-[#E2E8F0] focus:outline-none focus:border-[#D4AF37]"
          />
          <Search className="w-3.5 h-3.5 text-[#A0AEC0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-3 sm:p-4 bg-[#161B22] border-b border-[#2D3748] flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Min Repeat Threshold */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-semibold text-[#A0AEC0]">حد التكرار الأدنى:</span>
          <div className="flex items-center gap-1">
            {[2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => onChangeMinRepeat(val)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  minRepeatThreshold === val
                    ? "bg-[#D4AF37] text-[#1A202C]"
                    : "bg-[#0D1117] text-[#CBD5E0] border border-[#2D3748] hover:bg-[#1A202C]"
                }`}
              >
                ≥ {val} مرات
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center flex-wrap gap-4">
          
          {/* Exclude Stop Words */}
          <label className="flex items-center gap-2 cursor-pointer font-medium text-[#A0AEC0] hover:text-white">
            <input
              type="checkbox"
              checked={ignoreStopWords}
              onChange={(e) => onToggleStopWords(e.target.checked)}
              className="w-4 h-4 rounded border-[#2D3748] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer bg-[#0D1117]"
            />
            <span>حذف حروف الجر والأدوات الشائعة</span>
          </label>

          {/* Ignore Diacritics */}
          <label className="flex items-center gap-2 cursor-pointer font-medium text-[#A0AEC0] hover:text-white">
            <input
              type="checkbox"
              checked={ignoreDiacritics}
              onChange={(e) => onToggleDiacritics(e.target.checked)}
              className="w-4 h-4 rounded border-[#2D3748] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer bg-[#0D1117]"
            />
            <span>تجاهل التشكيل والحركات عند التجميع</span>
          </label>

        </div>

      </div>

      {/* Repeated Words Table */}
      <div className="overflow-x-auto">
        {repeatedWords.length === 0 ? (
          <div className="py-12 text-center text-[#718096] text-xs space-y-1">
            <p className="font-medium text-[#A0AEC0]">لا توجد كلمات مكررة تنطبق عليها الشروط المحددة.</p>
            <p>جرب خفض حد التكرار الأدنى أو إلغاء تفعيل الفلاتر.</p>
          </div>
        ) : (
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1A202C] text-[#A0AEC0] font-semibold border-b border-[#2D3748]">
              <tr>
                <th className="p-3 pr-4">الكلمة</th>
                <th className="p-3 text-center">عدد التكرار</th>
                <th className="p-3">نسبة الشيوع والتكرار</th>
                <th className="p-3">القسم النحوي</th>
                <th className="p-3">الجذر الصرفي</th>
                <th className="p-3 text-center pl-4">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3748]">
              {repeatedWords.map((item) => {
                const isSelected = selectedWordId === item.id;
                const posMeta = POS_DEFINITIONS[item.pos];
                const pctOfMax = maxWordRepeat > 0 ? (item.count / maxWordRepeat) * 100 : 0;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectWord(item)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#D4AF37]/20 font-medium"
                        : "hover:bg-[#1A202C]/60"
                    }`}
                  >
                    {/* Word */}
                    <td className="p-3 pr-4 font-bold text-sm text-white group-hover:text-[#D4AF37]">
                      {item.word}
                      {item.isStopWord && (
                        <span className="mr-2 text-[10px] font-normal text-[#718096]">
                          (أداة/حرف)
                        </span>
                      )}
                    </td>

                    {/* Count */}
                    <td className="p-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded font-bold font-mono text-xs bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        {item.count} مرات
                      </span>
                    </td>

                    {/* Frequency Bar */}
                    <td className="p-3 w-48 sm:w-64">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-[#A0AEC0]">
                          <span>{item.frequencyPercentage.toFixed(1)}% من النص</span>
                        </div>
                        <div className="w-full bg-[#161B22] rounded-full h-1.5 overflow-hidden border border-[#2D3748]">
                          <div
                            className="bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(8, pctOfMax)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* POS */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${posMeta?.badgeClass}`}>
                        {item.posArabic}
                      </span>
                    </td>

                    {/* Root */}
                    <td className="p-3 font-mono font-bold text-[#E2E8F0]">
                      {item.root}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center pl-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWord(item);
                        }}
                        className={`p-1.5 rounded text-xs transition-colors border ${
                          isSelected
                            ? "bg-[#D4AF37] text-[#1A202C] border-[#D4AF37]"
                            : "bg-[#161B22] text-[#A0AEC0] hover:text-white border-[#2D3748]"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
