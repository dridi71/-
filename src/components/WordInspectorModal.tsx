import React from "react";
import { WordItem, TextToken } from "../types";
import { POS_DEFINITIONS } from "../utils/arabicNlp";
import { getLisanAlArabEntry } from "../utils/lisanAlArabDictionary";
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
  if (!isOpen || !wordItem) return null;

  const posMeta = POS_DEFINITIONS[wordItem.pos];
  const lisanEntry = getLisanAlArabEntry(wordItem.word);

  // Context sentences extraction: Find sentences in fullText that contain this word
  const sentences = fullText.split(/[.؟!;\n]+/).filter((s) => s.trim().length > 0);
  const matchingSentences = sentences.filter((s) =>
    s.toLowerCase().includes(wordItem.cleanWord) || s.includes(wordItem.word)
  );

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
                التحليل الصرفي ومعجم لسان العرب لابن منظور
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

        {/* Content Body */}
        <div className="p-5 space-y-4 text-right text-xs overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {/* TTS Speech Bar for Word & Meaning */}
          <div className="p-3 bg-[#0D1117] rounded-xl border border-[#2D3748] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{wordItem.word}</span>
              <span className="text-xs text-[#A0AEC0]">({posMeta?.nameArabic})</span>
            </div>
            <TtsPlayerBar
              textToSpeak={`${wordItem.word}. ${lisanEntry.meaning}`}
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

          {/* Lisan Al-Arab Lexicon Entry Section */}
          <div className="p-4 rounded-xl bg-[#0D1117] border border-[#D4AF37]/30 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#2D3748] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#D4AF37] text-sm">
                <BookMarked className="w-4 h-4 text-[#D4AF37]" />
                <span>شرح المفردة في معجم «لسان العرب» لابن منظور</span>
              </div>
              <div className="flex gap-1.5 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#1A202C] text-[#D4AF37] border border-[#2D3748]">
                  {lisanEntry.bab}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#1A202C] text-[#A0AEC0] border border-[#2D3748]">
                  {lisanEntry.fasl}
                </span>
              </div>
            </div>

            <p className="text-[#CBD5E0] leading-relaxed font-serif text-sm">
              {lisanEntry.fullLexicalText}
            </p>

            {lisanEntry.examplesAndVerses && lisanEntry.examplesAndVerses.length > 0 && (
              <div className="pt-2 border-t border-[#2D3748]/60 space-y-1">
                <span className="text-[#A0AEC0] font-semibold text-[11px] flex items-center gap-1">
                  <Quote className="w-3 h-3 text-[#D4AF37]" /> الشواهد والآيات:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[#E2E8F0] italic font-serif">
                  {lisanEntry.examplesAndVerses.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}

            {lisanEntry.derivatives && lisanEntry.derivatives.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-[#A0AEC0] font-semibold">أبرز المشتقات:</span>
                {lisanEntry.derivatives.map((der, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#1A202C] text-[#E2E8F0] border border-[#2D3748]"
                  >
                    {der}
                  </span>
                ))}
              </div>
            )}
          </div>

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

