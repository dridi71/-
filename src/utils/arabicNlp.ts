import {
  PosType,
  PosInfo,
  WordItem,
  TextToken,
  TextStats,
  GrammarCategory,
} from "../types";

// Pos Info Configurations
export const POS_DEFINITIONS: Record<PosType, PosInfo> = {
  noun: {
    type: "noun",
    labelArabic: "الأسماء",
    badgeClass: "bg-blue-500/20 text-blue-400 border border-blue-500/40",
    bgHighlightClass: "bg-blue-500/25 text-blue-200 border-b-2 border-blue-500/60",
    textClass: "text-blue-400",
    description: "تضم أسماء الذات، العلم، المعاني، المصادر، وأسماء الفاعل والمفعول غير المشتقة صفة.",
  },
  verb: {
    type: "verb",
    labelArabic: "الأفعال",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
    bgHighlightClass: "bg-emerald-500/25 text-emerald-200 border-b-2 border-emerald-500/60",
    textClass: "text-emerald-400",
    description: "تضم الأفعال الماضية والمضارعة وأفعال الأمر والمزيدة والمتعدية واللازمة.",
  },
  particle: {
    type: "particle",
    labelArabic: "الحروف والأدوات",
    badgeClass: "bg-red-500/20 text-red-400 border border-red-500/40",
    bgHighlightClass: "bg-red-500/25 text-red-200 border-b-2 border-red-500/60",
    textClass: "text-red-400",
    description: "تضم حروف الجر، العطف، النصب، الجزم، التوكيد، الشرط، وأدوات الاستثناء.",
  },
  pronoun: {
    type: "pronoun",
    labelArabic: "الضمائر والإشارة والموصول",
    badgeClass: "bg-purple-500/20 text-purple-400 border border-purple-500/40",
    bgHighlightClass: "bg-purple-500/25 text-purple-200 border-b-2 border-purple-500/60",
    textClass: "text-purple-400",
    description: "تضم الضمائر المنفصلة والمتصلة، أسماء الإشارة، والأسماء الموصولة.",
  },
  adjective: {
    type: "adjective",
    labelArabic: "الصفات والمشتقات",
    badgeClass: "bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40",
    bgHighlightClass: "bg-[#D4AF37]/25 text-[#F6E05E] border-b-2 border-[#D4AF37]/60",
    textClass: "text-[#D4AF37]",
    description: "تضم النعوت والصفات المشبهة وصيغ المبالغة واسم التفضيل.",
  },
  adverb_number: {
    type: "adverb_number",
    labelArabic: "الظروف والأعداد",
    badgeClass: "bg-teal-500/20 text-teal-400 border border-teal-500/40",
    bgHighlightClass: "bg-teal-500/25 text-teal-200 border-b-2 border-teal-500/60",
    textClass: "text-teal-400",
    description: "تضم ظروف الزمان والمكان والأرقام والأعداد الترتيبية.",
  },
  other: {
    type: "other",
    labelArabic: "كلمات أخرى / غير مصنفة",
    badgeClass: "bg-[#2D3748] text-[#CBD5E0] border border-[#4A5568]",
    bgHighlightClass: "bg-[#2D3748]/80 text-[#E2E8F0]",
    textClass: "text-[#A0AEC0]",
    description: "كلمات أجنبية، رموز، أو مصطلحات تتطلب تحليلاً إعرابياً خاصاً.",
  },
};

// Arabic Diacritics regex
const DIACRITICS_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;
const TATWEEL_REGEX = /\u0640/g;

/**
 * Remove diacritics (Harakat) and Tatweel from Arabic text
 */
export function stripDiacritics(text: string): string {
  if (!text) return "";
  return text.replace(DIACRITICS_REGEX, "").replace(TATWEEL_REGEX, "");
}

/**
 * Normalize Arabic letters for uniform comparison (e.g. أ، إ، آ -> ا)
 */
export function normalizeArabic(text: string, normalizeYaaTaa = false): string {
  let clean = stripDiacritics(text);
  clean = clean.replace(/[أإآءئؤ]/g, "ا");
  if (normalizeYaaTaa) {
    clean = clean.replace(/ى/g, "ي").replace(/ة/g, "ه");
  }
  return clean.trim();
}

// Arabic Prepositions, Particles, Conjunctions
export const ARABIC_PARTICLES = new Set([
  "من", "في", "على", "إلى", "عن", "حتى", "مع", "ب", "ل", "ك",
  "و", "ف", "ثم", "أو", "أم", "بل", "لكن", "لا", "ما", "لم",
  "لن", "إن", "أن", "كي", "إذن", "لو", "لولا", "لوما", "إذا",
  "قد", "سوف", "س", "إياك", "إياكم", "إيانا", "هل", "أ", "أين",
  "متى", "كيف", "كم", "لماذا", "منذ", "مذ", "خلا", "عدا", "حاشا",
  "غير", "سوى", "إلا", "يا", "أيها", "أيتها", "رب", "علها", "لعلك",
  "لعل", "ليت", "إنما", "أنما", "كأنما", "لكنما", "كلما", "حينما",
]);

// Arabic Pronouns, Demonstratives & Relatives
export const ARABIC_PRONOUNS = new Set([
  "أنا", "نحن", "أنت", "أنتِ", "أنتما", "أنتم", "أنتن",
  "هو", "هي", "هما", "هم", "هن",
  "هذا", "هذه", "هذان", "هاتان", "هؤلاء", "ذلك", "تلك", "أولئك", "هنا", "هناك", "هنالك",
  "الذي", "التي", "اللذان", "اللتان", "الذين", "اللاتي", "اللواتي", "اللاتي", "من", "ما",
  "إياي", "إيانا", "إياك", "إياكما", "إياكم", "إياه", "إياها", "إياهم",
]);

// Arabic Adverbs and Numbers
export const ARABIC_ADVERBS_NUMBERS = new Set([
  "اليوم", "أمس", "غدا", "الآن", "صباحا", "مساء", "ليلا", "نهارا",
  "قبل", "بعد", "فوق", "تحت", "أمام", "خلف", "وراء", "يمين", "شمال",
  "يسار", "شرق", "غرب", "جنوب", "شمال", "بين", "وسط", "عند", "لدى",
  "حين", "عوض", "قط", "أبدا", "حديثا", "قديما",
  "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة",
  "أحد", "اثنا", "مائة", "ألف", "مليون", "الأول", "الثاني", "الثالث", "الرابع", "الخامس",
]);

// Common Arabic Stop Words
export const ARABIC_STOP_WORDS = new Set([
  ...Array.from(ARABIC_PARTICLES),
  ...Array.from(ARABIC_PRONOUNS),
]);

/**
 * Basic Rule-based Morphological Heuristic for Arabic Words
 */
export function classifyArabicWordPos(rawWord: string): { pos: PosType; posArabic: string } {
  const clean = normalizeArabic(rawWord, false);
  const cleanLower = clean.toLowerCase();

  if (ARABIC_PARTICLES.has(clean)) {
    return { pos: "particle", posArabic: "حرف / أداة" };
  }
  if (ARABIC_PRONOUNS.has(clean)) {
    return { pos: "pronoun", posArabic: "ضمير / اسم إشارة أو موصول" };
  }
  if (ARABIC_ADVERBS_NUMBERS.has(clean)) {
    return { pos: "adverb_number", posArabic: "ظرف أو عدد" };
  }

  // Definite article "الـ" -> Noun or Adjective
  if (clean.startsWith("ال") && clean.length > 3) {
    // If it ends with "ة" or "ية" -> likely Noun/Adjective
    if (clean.endsWith("ة") || clean.endsWith("ية") || clean.endsWith("ات")) {
      return { pos: "noun", posArabic: "اسم" };
    }
    return { pos: "noun", posArabic: "اسم معرف بالـ" };
  }

  // Taa Marbouta "ة" -> Noun
  if (clean.endsWith("ة")) {
    return { pos: "noun", posArabic: "اسم مؤنث" };
  }

  // Tanween -> Noun
  if (/[\u064B\u064C\u064D]/.test(rawWord)) {
    return { pos: "noun", posArabic: "اسم منون" };
  }

  // Common Verb Prefixes
  if (/^(سوف|س|سيت|ست|يت|تت|نت|أست|نست|يست)/.test(clean) && clean.length >= 4) {
    return { pos: "verb", posArabic: "فعل مضارع" };
  }

  // Past verb patterns with suffixes
  if (/(ت|تما|تم|تن|نا|وا|ن)$/.test(clean) && clean.length >= 3 && !clean.startsWith("ال")) {
    return { pos: "verb", posArabic: "فعل ماضٍ" };
  }

  // Common Adjective Suffixes (e.g. كبير، جميل، عالمي، سريع، مفيد، محترم)
  if (clean.endsWith("ي") || clean.endsWith("ية") || clean.startsWith("مـ")) {
    if (clean.length > 4 && !clean.startsWith("ال")) {
      return { pos: "adjective", posArabic: "صفة / اسم مشتق" };
    }
  }

  // Non-Arabic words / numbers
  if (/^[0-9]+$/.test(clean) || /^[a-zA-Z]+$/.test(cleanLower)) {
    return { pos: "other", posArabic: "رقم / أجنبي" };
  }

  // Default to Noun
  return { pos: "noun", posArabic: "اسم" };
}

/**
 * Extracts approximate tri-literal root heuristics for Arabic words
 */
export function estimateArabicRoot(word: string): string {
  const clean = normalizeArabic(word, true);
  if (clean.length <= 3) return clean.split("").join("-");

  // Strip prefix "ال"
  let stem = clean;
  if (stem.startsWith("ال")) stem = stem.slice(2);
  if (stem.startsWith("و") || stem.startsWith("ف") || stem.startsWith("ب") || stem.startsWith("ك") || stem.startsWith("ل")) {
    if (stem.length > 3) stem = stem.slice(1);
  }

  // Strip common suffixes
  stem = stem.replace(/(ون|ين|ات|ان|ين|تم|تنا|ني|ها|هم|هن|كم|كن)$/, "");
  if (stem.endsWith("ة") || stem.endsWith("ه")) stem = stem.slice(0, -1);

  if (stem.length <= 3) return stem.split("").join("-");

  // Basic pattern reduction
  if (stem.length === 4) {
    if (stem.startsWith("م") || stem.startsWith("ت") || stem.startsWith("ي") || stem.startsWith("أ")) {
      return stem.slice(1).split("").join("-");
    }
    return stem.slice(0, 3).split("").join("-");
  }

  return stem.slice(0, 3).split("").join("-");
}

/**
 * Generate color for frequency highlighting based on count
 */
export function getFrequencyColor(count: number, maxCount: number): string {
  if (count <= 1) return "bg-[#1A202C] text-[#A0AEC0] border-[#2D3748]";
  
  const ratio = maxCount > 1 ? (count - 1) / (maxCount - 1) : 0;
  
  if (ratio < 0.25) {
    return "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold";
  } else if (ratio < 0.5) {
    return "bg-[#D4AF37]/30 text-[#F6E05E] border border-[#D4AF37]/50 font-bold";
  } else if (ratio < 0.75) {
    return "bg-orange-500/25 text-orange-300 border border-orange-500/50 font-extrabold ring-1 ring-orange-500/40";
  } else {
    return "bg-red-500/30 text-red-300 border border-red-500/60 font-black ring-1 ring-red-500/50";
  }
}

/**
 * Full Text Analysis Engine:
 * Tokenizes text, computes word frequency table, generates POS classification,
 * calculates statistics, and prepares highlighted token stream.
 */
export function analyzeArabicText(
  rawText: string,
  options: {
    ignoreDiacriticsForDuplicates?: boolean;
    ignoreStopWordsForDuplicates?: boolean;
    minRepeatThreshold?: number;
  } = {}
) {
  const {
    ignoreDiacriticsForDuplicates = true,
    ignoreStopWordsForDuplicates = false,
    minRepeatThreshold = 2,
  } = options;

  if (!rawText || !rawText.trim()) {
    return {
      tokens: [],
      wordItems: [],
      stats: {
        totalWords: 0,
        uniqueWords: 0,
        repeatedWordsCount: 0,
        repeatedTotalOccurrences: 0,
        repeatedWordsRatio: 0,
        charCountWithSpaces: 0,
        charCountNoSpaces: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        readingTimeMinutes: 0,
        avgWordLength: 0,
      },
      categories: [],
      maxFrequency: 0,
    };
  }

  // 1. Text statistics calculations
  const charCountWithSpaces = rawText.length;
  const charCountNoSpaces = rawText.replace(/\s/g, "").length;
  
  const paragraphs = rawText.split(/\n+/).filter((p) => p.trim().length > 0);
  const paragraphCount = paragraphs.length || 1;

  const sentences = rawText.split(/[.؟!;\n]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  // Tokenization: Keep whitespace and punctuation as tokens so original text can be rendered accurately
  const tokenMatches = Array.from(rawText.matchAll(/([\u0600-\u06FFa-zA-Z0-9]+)|([^\u0600-\u06FFa-zA-Z0-9\s]+)|(\s+)/g));

  const tokens: TextToken[] = [];
  const wordMap = new Map<string, WordItem>();
  let totalWordCount = 0;
  let totalWordChars = 0;

  tokenMatches.forEach((match, idx) => {
    const rawVal = match[0];
    const isWordMatch = !!match[1]; // True if Arabic/Latin/Numeric word

    if (isWordMatch) {
      totalWordCount++;
      totalWordChars += rawVal.length;

      const cleanMatchKey = ignoreDiacriticsForDuplicates
        ? normalizeArabic(rawVal, false)
        : rawVal.trim();

      const existing = wordMap.get(cleanMatchKey);

      if (existing) {
        existing.count += 1;
        existing.tokenIndices.push(idx);
      } else {
        const { pos, posArabic } = classifyArabicWordPos(rawVal);
        const root = estimateArabicRoot(rawVal);
        const isStopWord = ARABIC_STOP_WORDS.has(cleanMatchKey);

        const newItem: WordItem = {
          id: `w_${wordMap.size + 1}`,
          word: rawVal,
          cleanWord: cleanMatchKey,
          count: 1,
          frequencyPercentage: 0,
          tokenIndices: [idx],
          pos,
          posArabic,
          root,
          weight: "غير محدد",
          irabRole: posArabic,
          isStopWord,
          isRepeated: false,
          colorTag: "",
        };
        wordMap.set(cleanMatchKey, newItem);
      }

      const itemRef = wordMap.get(cleanMatchKey)!;

      tokens.push({
        index: idx,
        originalText: rawVal,
        cleanText: cleanMatchKey,
        isWord: true,
        wordItemId: itemRef.id,
        pos: itemRef.pos,
        repeatCount: 1,
      });
    } else {
      tokens.push({
        index: idx,
        originalText: rawVal,
        cleanText: rawVal,
        isWord: false,
      });
    }
  });

  // Calculate frequencies & repeat status
  const wordItems = Array.from(wordMap.values());
  let maxFrequency = 1;
  let repeatedWordsCount = 0;
  let repeatedTotalOccurrences = 0;

  wordItems.forEach((item) => {
    item.frequencyPercentage = totalWordCount > 0 ? (item.count / totalWordCount) * 100 : 0;
    if (item.count > maxFrequency) {
      maxFrequency = item.count;
    }

    const satisfiesRepeatMin = item.count >= minRepeatThreshold;
    const satisfiesStopFilter = ignoreStopWordsForDuplicates ? !item.isStopWord : true;

    item.isRepeated = satisfiesRepeatMin && satisfiesStopFilter;

    if (item.isRepeated) {
      repeatedWordsCount++;
      repeatedTotalOccurrences += item.count;
    }

    item.colorTag = getFrequencyColor(item.count, maxFrequency);
  });

  // Update repeat counts inside tokens
  tokens.forEach((t) => {
    if (t.isWord && t.wordItemId) {
      const matchedItem = wordItems.find((w) => w.id === t.wordItemId);
      if (matchedItem) {
        t.repeatCount = matchedItem.count;
      }
    }
  });

  // Sort word items by frequency descending
  wordItems.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  // Compute Categories Breakdown
  const categoryMap: Record<PosType, WordItem[]> = {
    noun: [],
    verb: [],
    particle: [],
    pronoun: [],
    adjective: [],
    adverb_number: [],
    other: [],
  };

  wordItems.forEach((w) => {
    categoryMap[w.pos]?.push(w);
  });

  const categories: GrammarCategory[] = (Object.keys(POS_DEFINITIONS) as PosType[]).map((type) => {
    const items = categoryMap[type] || [];
    const posMeta = POS_DEFINITIONS[type];
    const categoryTotalCount = items.reduce((acc, item) => acc + item.count, 0);
    const categoryPct = totalWordCount > 0 ? (categoryTotalCount / totalWordCount) * 100 : 0;

    return {
      key: type,
      labelArabic: posMeta.labelArabic,
      count: categoryTotalCount,
      uniqueCount: items.length,
      percentage: Math.round(categoryPct * 10) / 10,
      color: posMeta.textClass,
      badgeClass: posMeta.badgeClass,
      description: posMeta.description,
      words: items,
    };
  });

  const repeatedWordsRatio = totalWordCount > 0 ? (repeatedTotalOccurrences / totalWordCount) * 100 : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(totalWordCount / 180)); // 180 WPM reading speed
  const avgWordLength = totalWordCount > 0 ? totalWordChars / totalWordCount : 0;

  const stats: TextStats = {
    totalWords: totalWordCount,
    uniqueWords: wordItems.length,
    repeatedWordsCount,
    repeatedTotalOccurrences,
    repeatedWordsRatio: Math.round(repeatedWordsRatio * 10) / 10,
    charCountWithSpaces,
    charCountNoSpaces,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
  };

  return {
    tokens,
    wordItems,
    stats,
    categories,
    maxFrequency,
  };
}
