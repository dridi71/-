export type PosType =
  | "noun"
  | "verb"
  | "particle"
  | "pronoun"
  | "adjective"
  | "adverb_number"
  | "other";

export interface PosInfo {
  type: PosType;
  labelArabic: string;
  badgeClass: string;
  bgHighlightClass: string;
  textClass: string;
  description: string;
}

export interface WordItem {
  id: string;
  word: string; // Original token with diacritics/punctuation trimmed if needed
  cleanWord: string; // Stripped of diacritics & punctuation for matching
  count: number;
  frequencyPercentage: number;
  tokenIndices: number[]; // Index in the text token stream
  pos: PosType;
  posArabic: string;
  root: string;
  weight: string;
  irabRole: string;
  isStopWord: boolean;
  isRepeated: boolean;
  colorTag: string; // Color code for visual highlighting
}

export interface TextToken {
  index: number;
  originalText: string;
  cleanText: string;
  isWord: boolean;
  wordItemId?: string;
  pos?: PosType;
  repeatCount?: number;
}

export interface TextStats {
  totalWords: number;
  uniqueWords: number;
  repeatedWordsCount: number; // Number of words that appear > 1 time
  repeatedTotalOccurrences: number;
  repeatedWordsRatio: number; // Percentage of total text made of repeated words
  charCountWithSpaces: number;
  charCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
  avgWordLength: number;
}

export interface GrammarCategory {
  key: PosType;
  labelArabic: string;
  count: number;
  uniqueCount: number;
  percentage: number;
  color: string;
  badgeClass: string;
  description: string;
  words: WordItem[];
}

export type HighlightMode = "none" | "frequency" | "pos";

export interface AiWordDetail {
  word: string;
  diacritics?: string;
  pos: PosType;
  posArabic: string;
  root?: string;
  weight?: string;
  irabRole: string;
}

export interface AiSentenceIrab {
  sentence: string;
  translation?: string;
  wordsDetail: AiWordDetail[];
}

export interface AiCategoryBreakdown {
  categoryKey: string;
  categoryLabelArabic: string;
  count: number;
  examples: string[];
}

export interface AiRhetoricalFigure {
  type: string; // "simile" | "metaphor" | "metonymy" | "badic" | "other"
  typeArabicLabel: string; // e.g. "تشبيه بليغ", "استعارة مكنية", "استعارة تصريحية", "كناية عن صفة"
  textSegment: string; // الشاهد أو العبارة البلاغية من النص
  explanation: string; // تفكيك الصورة وشرح عناصرها
  aestheticImpact: string; // الأثر الجمالي والبلاغي في النص
}

export interface AiGrammarResult {
  summary: string;
  rhetoricalSummary?: string;
  totalWordsAnalyzed: number;
  sentencesIrab: AiSentenceIrab[];
  categoriesBreakdown: AiCategoryBreakdown[];
  rhetoricalFigures?: AiRhetoricalFigure[];
}

export interface GrammarError {
  id: string;
  type: string;
  word: string;
  suggestion: string;
  explanation: string;
  index: number;
  length: number;
}

export interface AiSynonymItem {
  synonym: string;
  nuance: string;
  exampleUsage: string;
  styleTip: string;
}

export interface AiSynonymsResult {
  word: string;
  stylisticOverview: string;
  synonyms: AiSynonymItem[];
  antonyms?: string[];
  stylisticAdvice: string;
}

export interface AiAntonymItem {
  antonym: string;
  contrastDegree: string;
  exampleUsage: string;
  creativePrompt: string;
}

export interface AiAntonymsResult {
  word: string;
  creativeOverview: string;
  rhetoricalDevice: string;
  antonyms: AiAntonymItem[];
  creativeWritingChallenge: string;
}

declare module 'html2pdf.js';

export interface DocumentImportResult {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'json' | 'other';
  wordCount: number;
  charCount: number;
  pageCount?: number;
  isScanned?: boolean;
  method: 'mammoth' | 'pdfjs' | 'gemini-ai' | 'plaintext';
}

export interface SingleSentenceWordDetail {
  word: string;
  diacritized: string;
  pos: string;
  posArabic: string;
  irabDetailed: string;
  grammaticalCase: string; // e.g. "مرفوع" | "منصوب" | "مجرور" | "مجزوم" | "مبني"
  marker: string; // e.g. "الضمة الظاهرة على آخره"
  markerType?: string; // "أصلية ظاهرة" | "أصلية مقدرة" | "فرعية"
  syntacticRelation?: string;
  root?: string;
  weight?: string;
}

export interface SingleSentenceSubClause {
  clause: string;
  clauseType: string;
  irabRole: string;
}

export interface SingleSentenceIrabResult {
  originalSentence: string;
  diacritizedSentence: string;
  sentenceType: string; // "جملة اسمية" | "جملة فعلية" | "شبه جملة" | "جملة شرطية"
  sentenceRole: string; // المحل الإعرابي للجملة ككل
  mainPillars: {
    pillar1: string; // مثل: "المبتدأ: العلمُ" أو "الفعل: كَتَبَ"
    pillar2: string; // مثل: "الخبر: نورٌ" أو "الفاعل: الطالبُ"
    extra?: string; // متعلقات أو فضلة
  };
  wordsDetail: SingleSentenceWordDetail[];
  subClauses?: SingleSentenceSubClause[];
  grammaticalNotes: string[];
  rhetoricalTouch?: string;
}
