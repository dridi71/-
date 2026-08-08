import React from "react";
import { TextStats } from "../types";
import {
  Hash,
  Copy,
  Repeat,
  AlignJustify,
  Clock,
  BarChart2,
  FileSpreadsheet,
} from "lucide-react";

interface StatsGridProps {
  stats: TextStats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      
      {/* Total Words Card */}
      <div id="stat-total-words" className="bg-[#1A202C] rounded-lg border border-[#2D3748] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#A0AEC0] text-xs uppercase tracking-widest font-medium">إجمالي الكلمات</span>
          <div className="p-1 rounded bg-[#161B22] text-[#A0AEC0]">
            <Hash className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white font-mono">
            {stats.totalWords.toLocaleString("ar-EG")}
          </div>
          <p className="text-[10px] text-[#718096] mt-1">
            المجموع الكلي في النص
          </p>
        </div>
      </div>

      {/* Unique Words Card */}
      <div id="stat-unique-words" className="bg-[#1A202C] rounded-lg border border-[#2D3748] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#A0AEC0] text-xs uppercase tracking-widest font-medium">كلمات فريدة</span>
          <div className="p-1 rounded bg-[#161B22] text-blue-400">
            <Copy className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-400 font-mono">
            {stats.uniqueWords.toLocaleString("ar-EG")}
          </div>
          <p className="text-[10px] text-[#718096] mt-1">
            بدون تكرار الكلمات
          </p>
        </div>
      </div>

      {/* Repeated Words Card */}
      <div id="stat-repeated-words" className="bg-[#1A202C] rounded-lg border border-[#2D3748] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#A0AEC0] text-xs uppercase tracking-widest font-medium">كلمات مكررة</span>
          <div className="p-1 rounded bg-[#161B22] text-[#D4AF37]">
            <Repeat className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#D4AF37] font-mono">
              {stats.repeatedWordsCount.toLocaleString("ar-EG")}
            </span>
            <span className="text-xs font-semibold text-[#D4AF37]/80">
              ({stats.repeatedWordsRatio}%)
            </span>
          </div>
          <p className="text-[10px] text-[#718096] mt-1">
            مكررة أكثر من مرة
          </p>
        </div>
      </div>

      {/* Characters Count Card */}
      <div id="stat-chars-count" className="bg-[#1A202C] rounded-lg border border-[#2D3748] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#A0AEC0] text-xs uppercase tracking-widest font-medium">عدد الحروف</span>
          <div className="p-1 rounded bg-[#161B22] text-emerald-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">
            {stats.charCountNoSpaces.toLocaleString("ar-EG")}
          </div>
          <p className="text-[10px] text-[#718096] mt-1">
            {stats.charCountWithSpaces.toLocaleString("ar-EG")} مع الفواصل
          </p>
        </div>
      </div>

      {/* Sentences & Paragraphs */}
      <div id="stat-sentences-paragraphs" className="bg-[#1A202C] rounded-lg border border-[#2D3748] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#A0AEC0] text-xs uppercase tracking-widest font-medium">الجمل والفقرات</span>
          <div className="p-1 rounded bg-[#161B22] text-purple-400">
            <AlignJustify className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-purple-400 font-mono">
            {stats.sentenceCount.toLocaleString("ar-EG")} <span className="text-xs font-normal text-[#A0AEC0]">جملة</span>
          </div>
          <p className="text-[10px] text-[#718096] mt-1">
            موزعة على {stats.paragraphCount.toLocaleString("ar-EG")} فقرة
          </p>
        </div>
      </div>

      {/* Reading Time */}
      <div id="stat-reading-time" className="bg-[#1A202C] rounded-lg border border-[#2D3748] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#A0AEC0] text-xs uppercase tracking-widest font-medium">زمن القراءة</span>
          <div className="p-1 rounded bg-[#161B22] text-teal-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-teal-400 font-mono">
            ~{stats.readingTimeMinutes.toLocaleString("ar-EG")} <span className="text-xs font-normal text-[#A0AEC0]">دقيقة</span>
          </div>
          <p className="text-[10px] text-[#718096] mt-1">
            متوسط طول الكلمة: {stats.avgWordLength} أحرف
          </p>
        </div>
      </div>

    </div>
  );
};
