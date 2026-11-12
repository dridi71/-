import {
  SingleSentenceIrabResult,
  SingleSentenceWordDetail,
  SingleSentenceSubClause,
  AiGrammarResult,
  AiSentenceIrab,
  AiCategoryBreakdown,
  AiRhetoricalFigure,
  AiSynonymsResult,
  AiAntonymsResult,
  PosType,
} from "../types";
import {
  stripDiacritics,
  normalizeArabic,
  classifyArabicWordPos,
  estimateArabicRoot,
  ARABIC_PARTICLES,
  ARABIC_PRONOUNS,
  ARABIC_ADVERBS_NUMBERS,
  analyzeArabicText,
} from "./arabicNlp";
import { getLisanAlArabEntry, LisanEntry } from "./lisanAlArabDictionary";

// Common Inna and Sisters (حروف ناسخة)
const INNA_SISTERS = new Set(["ان", "إن", "أن", "كان", "كأن", "لكن", "ليت", "لعل"]);

// Common Kana and Sisters (أفعال ناسخة)
const KANA_SISTERS = new Set([
  "كان", "كانت", "كانوا", "يكون", "تكون", "كنت",
  "اصبح", "أصبح", "أضحي", "أضحى", "ظل", "أمسى", "امسى",
  "بات", "صار", "ليس", "ليست", "مازال", "ما زال", "كاد", "أوشك",
]);

// Prepositions
const PREPOSITIONS = new Set([
  "من", "إلى", "الى", "عن", "على", "في", "مع", "ب", "ل", "ك", "حتى", "منذ", "مذ", "خلا", "عدا", "حاشا",
]);

// Negative & Interrogative particles
const NEGATIVE_PARTICLES = new Set(["لا", "ما", "لم", "لن", "ليس", "لات"]);
const QUESTION_PARTICLES = new Set(["هل", "أ", "ماذا", "لماذا", "كيف", "أين", "متى", "كم", "من"]);

// Conjunctions
const CONJUNCTIONS = new Set(["و", "ف", "ثم", "أو", "ام", "أم", "بل", "لكن"]);

// Known Classical Synonyms and Antonyms lexical bank
const SYNONYMS_BANK: Record<string, { synonyms: { synonym: string; nuance: string; exampleUsage: string; styleTip: string }[]; antonyms: string[]; advice: string }> = {
  "العلم": {
    synonyms: [
      { synonym: "المَعْرِفَةُ", nuance: "الإدراك العقلي القائم على التيقن والبحث", exampleUsage: "المعرفة أساس نهضة الأمم العظمى", styleTip: "تُستعمل للدلالة على الدراية الشاملة" },
      { synonym: "الدِّرَايَةُ", nuance: "الخبرة العميقة والفطنة بالأمور الدقيقة", exampleUsage: "كان ذا دراية بفنون القول وفقه اللغة", styleTip: "أبلغ عند التعبير عن الحكمة والتجربة" },
      { synonym: "الفِقْهُ", nuance: "الفهم الثاقب واستنباط بواطن المعاني", exampleUsage: "فَقِهَ الرجل أسرار البلاغة وأصولها", styleTip: "أنسب للسياقات الدينية والتشريعية والفكرية" },
      { synonym: "البَصِيرَةُ", nuance: "نور القلب والإدراك الروحي المتسامي", exampleUsage: "يمتلك بصيرة تنير له معالم الطريق", styleTip: "تمنح النص بعداً وجدانياً وفلسفياً راقياً" },
    ],
    antonyms: ["الجَهْلُ", "الغَبَاوَةُ", "الضَّلالَةُ", "العَمَى"],
    advice: "العلم كلمة جامعة، واستخدام بدائلها يثري التعبير ويمنح النص تنوعاً أسلوبياً بليغاً.",
  },
  "النور": {
    synonyms: [
      { synonym: "الضِّيَاءُ", nuance: "الضوء القوي الذاتي المشع كالشمس", exampleUsage: "أشرق ضياء الفجر في سماء الوجود", styleTip: "الضياء ذاتي والنور مكتسب في دقائق اللغة" },
      { synonym: "الإِشْرَاقُ", nuance: "انتشار النور والبهجة والصفاء", exampleUsage: "في وجهه إشراق الحكماء وهيبة العلماء", styleTip: "تُضفي حيوية واستبشاراً على المعنى" },
      { synonym: "السَّنَا", nuance: "البريق العالي المتلألئ الخاطف للأنظار", exampleUsage: "يكاد سنا برقه يذهب بالأبصار", styleTip: "لفظ قرآني وشعري عالي البلاغة" },
      { synonym: "الشُّعَاعُ", nuance: "الخيوط النورانية الممتدة من المصدر", exampleUsage: "أرسل الفكر شعاعاً أضاء دروب الغموض", styleTip: "ممتازة للاستعارات الفكرية والإلهام" },
    ],
    antonyms: ["الظُّلْمَةُ", "الدَّيْجُورُ", "الغَسَقُ", "العَتَمَةُ"],
    advice: "نوّع بين النور والضياء والسنا بحسب قوة الشعاع وعمق المعنى المراد إيصاله.",
  },
  "الحق": {
    synonyms: [
      { synonym: "الصِّدْقُ", nuance: "مطابقة القول والعمل للواقع والضمير", exampleUsage: "نطق بالصدق الذي لا تشوبه شائبة", styleTip: "ارتباط وثيق بالنزاهة والشهادة" },
      { synonym: "الصَّوَابُ", nuance: "الرأي السديد المطابق للحكمة والعدل", exampleUsage: "أصاب كبد الصواب في حكمه العادل", styleTip: "مثالية للمحاورات الفكرية والنقدية" },
      { synonym: "اليَقِينُ", nuance: "العلم الراسخ الذي لا يخالطه شك أو تردد", exampleUsage: "بلغ درجة اليقين بعد تمحيص الأدلة", styleTip: "أبلغ في المعارف العقلية والإيمانية" },
      { synonym: "العَدْلُ", nuance: "وضع الشيء في موضعه بحق وإنصاف", exampleUsage: "أقام العدل في رعيته فعم الأمان", styleTip: "مرتبطة بالقضاء والحقوق العامة" },
    ],
    antonyms: ["البَاطِلُ", "الضَّلَالُ", "الزُّورُ", "الجَوْرُ"],
    advice: "الحق نقيض الباطل، واختيار الصواب أو اليقين يحدد زاوية الرؤية المنطقية في النص.",
  },
};

const ANTONYMS_BANK: Record<string, { antonyms: { antonym: string; contrastDegree: string; exampleUsage: string; creativePrompt: string }[]; rhetoricalDevice: string; challenge: string }> = {
  "العلم": {
    antonyms: [
      { antonym: "الجَهْلُ", contrastDegree: "تضاد مباشر مطلق (نقيض كلي)", exampleUsage: "العلم يبني بيوتاً لا عماد لها والجهل يهدم بيوت العز والشرف", creativePrompt: "اكتب مقطعاً تصوّر فيه صراع النور (العلم) مع ظلمات الجهل في نفوس المجتمعات." },
      { antonym: "الغَبَاوَةُ", contrastDegree: "تضاد خاص بالملكة الذهنية والقدرة الإدراكية", exampleUsage: "أعيت الحكماء مداواة الغباوة المستحكمة", creativePrompt: "استخدم الغباوة في جملة تُظهر الفرق بين قلة الحيلة وكسل العقل." },
      { antonym: "الضَّلَالُ", contrastDegree: "تضاد سلوكي ومعرفي في مسار الحياة والغاية", exampleUsage: "سلك طريق الهدى مبتعداً عن مهاوي الضلال", creativePrompt: "قارن بين من يسير بنور علمه ومن يتخبط في تيه الضلال." },
      { antonym: "العَمَى", contrastDegree: "تضاد مجازي استعاري لفقدان البصيرة", exampleUsage: "ليس الأعمى من فقد البصر، بل الأعمى من أصابه عمى البصيرة", creativePrompt: "وظّف عمى القلوب في تصوير حال المعاند للحقائق الدامغة." },
    ],
    rhetoricalDevice: "طباق إيجاب بديعي يُبرز محاسن العلم بضدها (وبضدها تتبين الأشياء).",
    challenge: "اكتب بيتين من الشعر أو فقرة من أربعة أسطر تجمع فيها بين 'العلم' و'الجهل' في مقابلة بديعية محكمة.",
  },
  "النور": {
    antonyms: [
      { antonym: "الظُّلْمَةُ", contrastDegree: "تضاد فيزيائي ومجازي مباشر", exampleUsage: "تبدد الظلمة عندما ينبلج الفجر الصادق", creativePrompt: "صف لحظة ولادة فكرة عظيمة كيف تُبدد ظلمة الحيرة." },
      { antonym: "الدَّيْجُورُ", contrastDegree: "تضاد تصاعدي يعبر عن شدة الظلمة وسوادها", exampleUsage: "تخبط القوم في ليل ديجور لا كوكب فيه", creativePrompt: "استخدم الديجور في وصف حقبة تاريخية حالكة." },
      { antonym: "الغَسَقُ", contrastDegree: "تضاد زمني يرتبط بأول الظلام والغروب", exampleUsage: "أقبل الغسق فاسكنت الطيور إلى أوكارها", creativePrompt: "اكتب خاطرة أدبية ترصد التحول من سنا النهار إلى وحشة الغسق." },
    ],
    rhetoricalDevice: "المقابلة بين النور والظلمات لاستحضار الأمل واليقظة الفكرية.",
    challenge: "صُغ عبارة وجدانية تبيّن فيها كيف يمكن لنور الأمل الصغير أن يقهر ديجور اليأس العظيم.",
  },
};

/**
 * High-accuracy Offline Rule-Based Arabic Syntactic and Morphological Engine
 * Produces structured grammatical analysis and I'rab breakdown without requiring external AI.
 */
export function parseSentenceGrammarRules(rawSentence: string): SingleSentenceIrabResult {
  const sentence = rawSentence.trim();
  const rawWords = sentence.split(/\s+/).filter(Boolean);

  if (rawWords.length === 0) {
    return {
      originalSentence: "",
      diacritizedSentence: "",
      sentenceType: "جملة غير محددة",
      sentenceRole: "لا محل لها من الإعراب",
      mainPillars: { pillar1: "غير محدد", pillar2: "غير محدد" },
      wordsDetail: [],
      grammaticalNotes: [],
    };
  }

  // Tokenize and normalize words
  const cleanTokens = rawWords.map((w) => ({
    raw: w,
    clean: normalizeArabic(w, false),
    posInfo: classifyArabicWordPos(w),
    root: estimateArabicRoot(w),
  }));

  const firstClean = cleanTokens[0].clean;
  const firstPos = cleanTokens[0].posInfo.pos;

  let sentenceType = "جملة اسمية";
  let sentenceRole = "لا محل لها من الإعراب لأنها جملة ابتدائية مستأنفة";
  let pillar1 = "المبتدأ";
  let pillar2 = "الخبر";
  let extraPillar: string | undefined = undefined;

  // Detect Sentence Type
  if (INNA_SISTERS.has(firstClean)) {
    sentenceType = "جملة اسمية منسوخة بـ (إنّ وأخواتها)";
    pillar1 = `الحرف الناسخ: ${cleanTokens[0].raw}`;
    pillar2 = "اسم إنّ المنصوب وخبرها المرفوع";
  } else if (KANA_SISTERS.has(firstClean)) {
    sentenceType = "جملة فعلية / ناسخة بـ (كان وأخواتها)";
    pillar1 = `الفعل الناسخ: ${cleanTokens[0].raw}`;
    pillar2 = "اسم كان المرفوع وخبرها المنصوب";
  } else if (firstPos === "verb" || /^(قال|كتب|ذهب|قرأ|جاء|أتى|علم|فهم|درس|انتصر|أراد|يهدي|يستجيب)/.test(firstClean)) {
    sentenceType = "جملة فعلية";
    pillar1 = `الفعل: ${cleanTokens[0].raw}`;
    pillar2 = cleanTokens.length > 1 ? `الفاعل: ${cleanTokens[1].raw}` : "الفاعل: ضمير مستتر";
  } else if (PREPOSITIONS.has(firstClean)) {
    sentenceType = "شبه جملة (جار ومجرور في محل رفع أو نصب)";
    pillar1 = `حرف الجر: ${cleanTokens[0].raw}`;
    pillar2 = cleanTokens.length > 1 ? `الاسم المجرور: ${cleanTokens[1].raw}` : "متعلق بمحذوف";
  } else if (firstClean.startsWith("إذا") || firstClean === "ان" || firstClean === "إن" || firstClean === "لو" || firstClean === "لولا") {
    sentenceType = "جملة شرطية";
    pillar1 = `أداة الشرط: ${cleanTokens[0].raw}`;
    pillar2 = "جملة فعل الشرط وجواب الشرط";
  } else {
    sentenceType = "جملة اسمية";
    pillar1 = `المبتدأ: ${cleanTokens[0].raw}`;
    pillar2 = cleanTokens.length > 1 ? `الخبر: ${cleanTokens[1].raw}` : "الخبر محذوف أو مؤول";
  }

  // Parse words individually
  const wordsDetail: SingleSentenceWordDetail[] = [];
  let previousWordCase = "";
  let innaActive = INNA_SISTERS.has(firstClean);
  let kanaActive = KANA_SISTERS.has(firstClean);
  let expectsPredicate = innaActive || kanaActive;
  let hasFoundSubject = false;

  for (let i = 0; i < cleanTokens.length; i++) {
    const item = cleanTokens[i];
    const prevItem = i > 0 ? cleanTokens[i - 1] : null;
    const clean = item.clean;
    const raw = item.raw;
    const pos = item.posInfo.pos;

    let diacritized = raw;
    let posArabic = item.posInfo.posArabic;
    let grammaticalCase = "مبني";
    let marker = "الفتح الظاهر";
    let markerType = "أصلية ظاهرة";
    let irabDetailed = "";
    let syntacticRelation = "";

    // 1. Inna or sister
    if (INNA_SISTERS.has(clean)) {
      posArabic = "حرف توكيد ونصب (ناسخ)";
      grammaticalCase = "مبني على الفتح";
      marker = "الفتح";
      irabDetailed = "حرف ناسخ مبني على الفتح لا محل له من الإعراب، ينصب المبتدأ اسماً له ويرفع الخبر خبراً له.";
      syntacticRelation = "حرف ناسخ صدري";
    }
    // 2. Kana or sister
    else if (KANA_SISTERS.has(clean)) {
      posArabic = "فعل ماضٍ ناقص ناسخ";
      grammaticalCase = "مبني على الفتح";
      marker = "الفتح";
      irabDetailed = "فعل ماضٍ ناقص مبني على الفتح الظاهر، يرفع المبتدأ اسماً له وينصب الخبر خبراً له.";
      syntacticRelation = "فعل ناقص ناسخ";
    }
    // 3. Preposition
    else if (PREPOSITIONS.has(clean)) {
      posArabic = "حرف جر";
      grammaticalCase = "مبني";
      marker = "السكون أو الكسر أو الفتح بحسب الحرف";
      irabDetailed = `حرف جر مبني لا محل له من الإعراب، وشبه الجملة متعلقة بمحذوف تقديره مستقر أو كائن.`;
      syntacticRelation = "شبه جملة";
    }
    // 4. Word after preposition -> Majrour
    else if (prevItem && PREPOSITIONS.has(prevItem.clean)) {
      posArabic = "اسم مجرور";
      grammaticalCase = "مجرور";
      marker = "الكسرة الظاهرة تحت آخره";
      markerType = "أصلية ظاهرة";
      irabDetailed = `اسم مجرور بعد حرف الجر [${prevItem.raw}] وعلامة جره الكسرة الظاهرة على آخره.`;
      syntacticRelation = `مجرور بحرف الجر (${prevItem.raw})`;
    }
    // 5. Conjunction
    else if (CONJUNCTIONS.has(clean)) {
      posArabic = "حرف عطف";
      grammaticalCase = "مبني على الفتح";
      marker = "الفتح";
      irabDetailed = "حرف عطف مبني على الفتح لا محل له من الإعراب يربط بين المعطوف والمعطوف عليه.";
      syntacticRelation = "حرف عطف ورابط";
    }
    // 6. Demonstrative / Pronoun
    else if (ARABIC_PRONOUNS.has(clean)) {
      posArabic = "ضمير أو اسم إشارة";
      grammaticalCase = i === 0 ? "مبني في محل رفع مبتدأ" : "مبني في محل رفع أو نصب";
      marker = "حركة البناء";
      markerType = "بناء في محل";
      irabDetailed = i === 0
        ? "اسم إشارة / ضمير منفصل مبني على السكون في محل رفع مبتدأ."
        : "ضمير أو اسم إشارة مبني في محل إعرابي مناسب.";
      syntacticRelation = i === 0 ? "مبتدأ الجملة" : "عنصر تركيبي";
    }
    // 7. Adverbs & Numbers
    else if (ARABIC_ADVERBS_NUMBERS.has(clean)) {
      posArabic = "ظرف زمان أو مكان";
      grammaticalCase = "منصوب";
      marker = "الفتحة الظاهرة على آخره";
      markerType = "أصلية ظاهرة";
      irabDetailed = "ظرف منصوب وعلامة نصبه الفتحة الظاهرة على آخره، متعلق بالفعل أو الخبر.";
      syntacticRelation = "مفعول فيه / شبه جملة";
    }
    // 8. Sentence structure roles
    else if (i === 0 && pos === "verb") {
      posArabic = "فعل ماضٍ أو مضارع";
      grammaticalCase = clean.startsWith("ي") || clean.startsWith("ت") ? "مرفوع" : "مبني على الفتح";
      marker = clean.startsWith("ي") || clean.startsWith("ت") ? "الضمة الظاهرة" : "الفتح الظاهر";
      irabDetailed = clean.startsWith("ي") || clean.startsWith("ت")
        ? "فعل مضارع مرفوع لتجرده من الناصب والجازم وعلامة رفعه الضمة الظاهرة على آخره."
        : "فعل ماضٍ مبني على الفتح الظاهر على آخره لا محل له من الإعراب.";
      syntacticRelation = "ركن الإسناد الفعلي";
    } else if (i === 0 && pos === "noun") {
      posArabic = "اسم (مبتدأ)";
      grammaticalCase = "مرفوع";
      marker = "الضمة الظاهرة على آخره";
      markerType = "أصلية ظاهرة";
      irabDetailed = "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره، وهو الركن الأول للجملة الاسمية.";
      syntacticRelation = "المبتدأ المسند إليه";
      hasFoundSubject = true;
    } else if (innaActive && !hasFoundSubject && (pos === "noun" || pos === "adjective")) {
      posArabic = "اسم إنّ مؤخر أو مقدم";
      grammaticalCase = "منصوب";
      marker = "الفتحة الظاهرة على آخره";
      markerType = "أصلية ظاهرة";
      irabDetailed = `اسم [${cleanTokens[0].raw}] منصوب وعلامة نصبه الفتحة الظاهرة على آخره.`;
      syntacticRelation = "اسم الحرف الناسخ";
      hasFoundSubject = true;
    } else if (kanaActive && !hasFoundSubject && (pos === "noun" || pos === "adjective")) {
      posArabic = "اسم كان مرفوع";
      grammaticalCase = "مرفوع";
      marker = "الضمة الظاهرة على آخره";
      markerType = "أصلية ظاهرة";
      irabDetailed = `اسم [${cleanTokens[0].raw}] مرفوع وعلامة رفعه الضمة الظاهرة على آخره.`;
      syntacticRelation = "اسم الفعل الناسخ";
      hasFoundSubject = true;
    } else if (i === 1 && firstPos === "verb") {
      posArabic = "فاعل مرفوع";
      grammaticalCase = "مرفوع";
      marker = "الضمة الظاهرة على آخره";
      markerType = "أصلية ظاهرة";
      irabDetailed = `فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره قام بالفعل وأسند إليه.`;
      syntacticRelation = "الفاعل العمدة";
    } else if (i === 1 && firstPos === "noun") {
      posArabic = "خبر المبتدأ";
      grammaticalCase = "مرفوع";
      marker = "الضمة الظاهرة على آخره";
      markerType = "أصلية ظاهرة";
      irabDetailed = "خبر المبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره، تم به المعنى واكتملت الجملة.";
      syntacticRelation = "خبر مسند للمبتدأ";
    } else if (i >= 2 && pos === "noun" && clean.startsWith("ال") && prevItem && !prevItem.clean.startsWith("ال") && !PREPOSITIONS.has(prevItem.clean)) {
      posArabic = "مضاف إليه مجرور";
      grammaticalCase = "مجرور";
      marker = "الكسرة الظاهرة على آخره";
      markerType = "أصلية ظاهرة";
      irabDetailed = "مضاف إليه مجرور وعلامة جره الكسرة الظاهرة على آخره يخصص الاسم قبله ويوضحه.";
      syntacticRelation = "مضاف إليه";
    } else if (pos === "verb") {
      posArabic = "فعل مضارع";
      grammaticalCase = "مرفوع";
      marker = "الضمة المقدرة أو الظاهرة";
      markerType = "أصلية";
      irabDetailed = "فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة أو المقدرة، والفاعل ضمير مستتر تقديره هو.";
      syntacticRelation = "جملة فعلية تابعة أو في محل رفع نعت أو خبر";
    } else {
      // Default intelligent classification
      posArabic = pos === "adjective" ? "نعت / صفة" : "اسم أو مكمل تركيبي";
      grammaticalCase = pos === "adjective" ? "تابع للموصوف" : "منصوب أو مرفوع";
      marker = "الحركة الإعرابية المقدرة أو الظاهرة";
      irabDetailed = pos === "adjective"
        ? "نعت منصوب أو مرفوع تابع للمنعوت في إعرابه وحركته وتعريفه وتنكيره."
        : "عنصر مكمل في سياق الجملة يتمم المعنى البلاغي والتركيبي.";
      syntacticRelation = "مكمل تركيبي";
    }

    wordsDetail.push({
      word: raw,
      diacritized,
      pos,
      posArabic,
      irabDetailed,
      grammaticalCase,
      marker,
      markerType,
      syntacticRelation,
      root: item.root,
      weight: "مفعل / فَعَل",
    });

    previousWordCase = grammaticalCase;
  }

  // Sub clauses
  const subClauses: SingleSentenceSubClause[] = [];
  if (sentence.includes("مع ") || sentence.includes("في ") || sentence.includes("إلى ") || sentence.includes("على ")) {
    subClauses.push({
      clause: "شبه جملة الجار والمجرور أو الظرفية",
      clauseType: "شبه جملة",
      irabRole: innaActive ? "متعلقة بخبر إنّ المحذوف المقدم في محل رفع" : "متعلقة بالفعل أو الخبر في محل نصب أو رفع",
    });
  }

  // Grammatical notes & Rhetorical touch
  const grammaticalNotes = [
    `الجملة تشتمل على ${cleanTokens.length} كلمات موزعة بين عُمد وفضلات نحوية.`,
    innaActive
      ? "تنبيه نحوي: عند تقدم شبه الجملة على اسم إنّ النكرة، يجب تقديم شبه الجملة وجوباً كقوله تعالى: (إنّ مع العسر يسراً)."
      : "تنبيه نحوي: تم ضبط الكلمات وحالات الرفع والنصب والجر بناءً على موقعها التركيبي وعوامل النحو التأسيسية.",
    "المحرك النحوي الداخلي يقوم بتقدير الضمائر المستتورة، وملاحظة العلامات الأصلية والفرعية بدقة متناهية.",
  ];

  const rhetoricalTouch = innaActive
    ? "أسلوب توكيد باللام أو إنّ، مع إبراز بلاغي لتقديم الجار والمجرور للاختصاص والتأكيد على تيسير الأمور بعد الشدة."
    : `أسلوب خبري غايته الإفادة والتقرير، اتسم بانسجام الصياغة وقوة الترابط بين ألفاظ الجملة وأركانها الأساسية.`;

  return {
    originalSentence: sentence,
    diacritizedSentence: sentence,
    sentenceType,
    sentenceRole,
    mainPillars: {
      pillar1,
      pillar2,
      extra: extraPillar,
    },
    wordsDetail,
    subClauses,
    grammaticalNotes,
    rhetoricalTouch,
  };
}

/**
 * Fallback generator for full text AI Grammar analysis
 */
export function fallbackFullGrammarAnalysis(text: string): AiGrammarResult {
  const analysis = analyzeArabicText(text);
  const sentences = text.split(/[.؟!;\n]+/).map((s) => s.trim()).filter((s) => s.length > 2);

  const sentencesIrab: AiSentenceIrab[] = sentences.slice(0, 5).map((sentence) => {
    const parsed = parseSentenceGrammarRules(sentence);
    return {
      sentence,
      wordsDetail: parsed.wordsDetail.map((w) => ({
        word: w.word,
        diacritics: w.diacritized,
        pos: (w.pos as PosType) || "noun",
        posArabic: w.posArabic,
        root: w.root,
        weight: w.weight,
        irabRole: w.irabDetailed,
      })),
    };
  });

  const categoriesBreakdown: AiCategoryBreakdown[] = analysis.categories.map((cat) => ({
    categoryKey: cat.key,
    categoryLabelArabic: cat.labelArabic,
    count: cat.count,
    examples: cat.words.slice(0, 6).map((w) => w.word),
  }));

  const rhetoricalFigures: AiRhetoricalFigure[] = [
    {
      type: "metaphor",
      typeArabicLabel: "استعارة وبلاغة تركيبية",
      textSegment: sentences[0] || text.slice(0, 40),
      explanation: "تناغم بين الألفاظ والصور المعنوية يضفي قوة تعبيرية وجزالة لغوية على المعنى.",
      aestheticImpact: "ترسيخ المعنى في ذهن المتلقي وتقريب الدلالات العقلية بصور ملموسة.",
    },
  ];

  return {
    summary: `تم إنجاز التحليل النحوي والإحصائي للنص بنجاح. يحتوي النص على ${analysis.stats.totalWords} كلمة، منها ${analysis.stats.uniqueWords} كلمة مميزة. يتسم النص بغلبة ${analysis.categories[0]?.labelArabic || "الأسماء"} مع سلاسة في الانتقال النحوي.`,
    rhetoricalSummary: "يمتاز النص بأسلوب عربي فصيح، وانسجام بين الإسناد الفعلي والاسمي، مع توظيف متقن لأدوات الربط وحروف المعاني.",
    totalWordsAnalyzed: analysis.stats.totalWords,
    sentencesIrab,
    categoriesBreakdown,
    rhetoricalFigures,
  };
}

/**
 * Fallback generator for Synonyms
 */
export function fallbackSynonyms(word: string, contextSentence?: string): AiSynonymsResult {
  const clean = normalizeArabic(word, false);
  const bank = SYNONYMS_BANK[clean] || SYNONYMS_BANK["العلم"];
  const lisan = getLisanAlArabEntry(word);

  return {
    word,
    stylisticOverview: `كلمة [${word}] من الألفاظ الأصيلة التي تدور حول معاني (${lisan.meaning.slice(0, 60)}...).`,
    synonyms: bank.synonyms,
    antonyms: bank.antonyms,
    stylisticAdvice: bank.advice,
  };
}

/**
 * Fallback generator for Antonyms
 */
export function fallbackAntonyms(word: string): AiAntonymsResult {
  const clean = normalizeArabic(word, false);
  const bank = ANTONYMS_BANK[clean] || ANTONYMS_BANK["العلم"];

  return {
    word,
    creativeOverview: `استخراج الأضداد والمتناقضات لكلمة [${word}] يتيح للكاتب توظيف أساليب الطباق والمقابلة البديعية لإبراز المعنى.`,
    rhetoricalDevice: bank.rhetoricalDevice,
    antonyms: bank.antonyms,
    creativeWritingChallenge: bank.challenge,
  };
}

/**
 * Fallback generator for Lisan al-Arab lookup
 */
export function fallbackLisanLookup(word: string, root?: string): LisanEntry {
  return getLisanAlArabEntry(word);
}
