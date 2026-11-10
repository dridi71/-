import React, { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { StatsGrid } from "./components/StatsGrid";
import { InteractiveTextReader } from "./components/InteractiveTextReader";
import { GrammarTabs } from "./components/GrammarTabs";
import { RepeatedWordsTable } from "./components/RepeatedWordsTable";
import { AiGrammarModal } from "./components/AiGrammarModal";
import { WordInspectorModal } from "./components/WordInspectorModal";
import { ExportReportModal } from "./components/ExportReportModal";
import { ImportDocumentModal } from "./components/ImportDocumentModal";
import { SentenceIrabModal } from "./components/SentenceIrabModal";

import { analyzeArabicText } from "./utils/arabicNlp";
import { SAMPLE_TEXTS, SampleText } from "./data/sampleTexts";
import {
  HighlightMode,
  WordItem,
  AiGrammarResult,
} from "./types";

export default function App() {
  // Main Text State initialized with first sample text
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].content);

  // Analysis Options
  const [ignoreDiacritics, setIgnoreDiacritics] = useState<boolean>(true);
  const [ignoreStopWords, setIgnoreStopWords] = useState<boolean>(false);
  const [minRepeatThreshold, setMinRepeatThreshold] = useState<number>(2);

  // UI Interactive States
  const [highlightMode, setHighlightMode] = useState<HighlightMode>("frequency");
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  // AI Modal States
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AiGrammarResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Modals
  const [inspectorWord, setInspectorWord] = useState<WordItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isSentenceIrabOpen, setIsSentenceIrabOpen] = useState<boolean>(false);
  const [sentenceToIrab, setSentenceToIrab] = useState<string>("");

  // Run Real-time Arabic NLP Pipeline
  const { tokens, wordItems, stats, categories } = useMemo(() => {
    return analyzeArabicText(text, {
      ignoreDiacriticsForDuplicates: ignoreDiacritics,
      ignoreStopWordsForDuplicates: ignoreStopWords,
      minRepeatThreshold,
    });
  }, [text, ignoreDiacritics, ignoreStopWords, minRepeatThreshold]);

  // Selected Word Object
  const selectedWordObj = useMemo(() => {
    return wordItems.find((w) => w.id === selectedWordId) || null;
  }, [wordItems, selectedWordId]);

  // Handlers
  const handleSelectSample = (sample: SampleText) => {
    setText(sample.content);
    setSelectedWordId(null);
  };

  const handleClear = () => {
    setText("");
    setSelectedWordId(null);
    setAiResult(null);
  };

  const handleSelectWord = (wordItem: WordItem | null) => {
    if (!wordItem) {
      setSelectedWordId(null);
    } else {
      setSelectedWordId(wordItem.id);
    }
  };

  const handleInspectWord = (wordItem: WordItem) => {
    setInspectorWord(wordItem);
    setIsInspectorOpen(true);
  };

  // Trigger Gemini AI Full Syntax & I'rab Analysis
  const handleRunAiGrammar = async () => {
    if (!text || text.trim().length === 0) return;

    setIsAiLoading(true);
    setAiError(null);
    setIsAiModalOpen(true);

    try {
      const response = await fetch("/api/analyze-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء إجراء الإعراب بالنحو الذكي");
      }

      setAiResult(data as AiGrammarResult);
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      setAiError(err.message || "عذراً، يتعذر الاتصال بخدمة التحليل النحوي الذكي حالياً.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImportText = (importedText: string, mode: "replace" | "append" = "replace") => {
    if (mode === "append" && text.trim().length > 0) {
      setText((prev) => `${prev.trim()}\n\n${importedText.trim()}`);
    } else {
      setText(importedText.trim());
    }
    setSelectedWordId(null);
    setAiResult(null);
  };

  const handleOpenSentenceIrab = (sentence?: string) => {
    if (sentence && sentence.trim()) {
      setSentenceToIrab(sentence.trim());
    } else {
      const firstSentence = text.split(/[.؟!;\n]+/).map((s) => s.trim()).filter((s) => s.length > 2)[0] || "";
      setSentenceToIrab(firstSentence);
    }
    setIsSentenceIrabOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E2E8F0] font-sans antialiased selection:bg-[#D4AF37] selection:text-[#1A202C] flex flex-col justify-between" dir="rtl">
      
      <div>
        {/* Top Header & Toolbar */}
        <Header
          onSelectSample={handleSelectSample}
          onClear={handleClear}
          onRunAiAnalysis={handleRunAiGrammar}
          onExport={() => setIsExportOpen(true)}
          onImportText={(t) => handleImportText(t, "replace")}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenSentenceIrab={() => handleOpenSentenceIrab()}
          isAiLoading={isAiLoading}
          hasText={text.trim().length > 0}
        />

        {/* Main Body Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6">
          
          {/* Statistics Grid Bar */}
          <StatsGrid stats={stats} />

          {/* Interactive Text Reader & Highlight Canvas */}
          <InteractiveTextReader
            text={text}
            onChangeText={setText}
            tokens={tokens}
            wordItems={wordItems}
            selectedWordId={selectedWordId}
            onSelectWord={handleSelectWord}
            highlightMode={highlightMode}
            onSetHighlightMode={setHighlightMode}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenSentenceIrab={handleOpenSentenceIrab}
          />

          {/* Tabbed View: Grammatical Category Parsing */}
          <GrammarTabs
            categories={categories}
            onSelectWord={(word) => {
              handleSelectWord(word);
              handleInspectWord(word);
            }}
            onInspectWordIrab={handleInspectWord}
          />

          {/* Repeated Words Breakdown Table */}
          <RepeatedWordsTable
            wordItems={wordItems}
            totalWordsCount={stats.totalWords}
            minRepeatThreshold={minRepeatThreshold}
            onChangeMinRepeat={setMinRepeatThreshold}
            ignoreStopWords={ignoreStopWords}
            onToggleStopWords={setIgnoreStopWords}
            ignoreDiacritics={ignoreDiacritics}
            onToggleDiacritics={setIgnoreDiacritics}
            onSelectWord={handleSelectWord}
            selectedWordId={selectedWordId}
          />

        </main>
      </div>

      {/* Footer */}
      <footer className="h-12 bg-[#0A0D11] border-t border-[#2D3748] flex items-center justify-between px-6 text-xs text-[#718096]">
        <span>محلل النحو والبلاغة الذكي باللغة العربية</span>
        <span>مُسند إلى القواعد النحوية وقاموس اللغة • الإصدار 2.4.0</span>
      </footer>

      {/* Modals & Dialogs */}
      <AiGrammarModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        result={aiResult}
        error={aiError}
        isLoading={isAiLoading}
      />

      <WordInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        wordItem={inspectorWord}
        fullText={text}
        tokens={tokens}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        stats={stats}
        wordItems={wordItems}
        categories={categories}
        rawText={text}
        aiResult={aiResult}
      />

      <ImportDocumentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportText={handleImportText}
        currentTextLength={text.trim().length}
      />

      <SentenceIrabModal
        isOpen={isSentenceIrabOpen}
        onClose={() => setIsSentenceIrabOpen(false)}
        initialSentence={sentenceToIrab}
      />

    </div>
  );
}
