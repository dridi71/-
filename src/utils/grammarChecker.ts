import { GrammarError } from "../types";

// Dictionary of known misspelled words and their corrections with rules
interface RulePattern {
  type: string;
  pattern: RegExp | string;
  replacement: string | ((match: string, ...groups: any[]) => string);
  explanation: string;
}

// Fixed word replacements with explanation categories
const WORD_CORRECTIONS: Record<string, { suggestion: string; type: string; explanation: string }> = {
  // 1. Hamzat Qat' & Wasl
  إسم: { suggestion: "اسم", type: "همزة القطع والوصل", explanation: "كلمة 'اسم' من الأسماء السبعة السماعية التي تكتب بـ همزة وصل (بدون همزةقطع)." },
  إبن: { suggestion: "ابن", type: "همزة القطع والوصل", explanation: "كلمة 'ابن' تكتب بـ همزة وصل." },
  إبنة: { suggestion: "ابنة", type: "همزة القطع والوصل", explanation: "كلمة 'ابنة' تكتب بـ همزة وصل." },
  إمرأة: { suggestion: "امرأة", type: "همزة القطع والوصل", explanation: "كلمة 'امرأة' تكتب بـ همزة وصل." },
  إثنان: { suggestion: "اثنان", type: "همزة القطع والوصل", explanation: "كلمة 'اثنان' تكتب بـ همزة وصل." },
  إثنتان: { suggestion: "اثنتان", type: "همزة القطع والوصل", explanation: "كلمة 'اثنتان' تكتب بـ همزة وصل." },
  إستخدام: { suggestion: "استخدام", type: "همزة القطع والوصل", explanation: "مصدر الفعل السداسي 'استخدم' يبدأ بـ همزة وصل." },
  إستخراج: { suggestion: "استخراج", type: "همزة القطع والوصل", explanation: "مصدر الفعل السداسي يبدأ بـ همزة وصل." },
  إستمرار: { suggestion: "استمرار", type: "همزة القطع والوصل", explanation: "مصدر الفعل السداسي يبدأ بـ همزة وصل." },
  إستعادة: { suggestion: "استعادة", type: "همزة القطع والوصل", explanation: "مصدر الفعل السداسي يبدأ بـ همزة وصل." },
  إستجابة: { suggestion: "استجابة", type: "همزة القطع والوصل", explanation: "مصدر الفعل السداسي يبدأ بـ همزة وصل." },
  أسم: { suggestion: "اسم", type: "همزة القطع والوصل", explanation: "كلمة 'اسم' تكتب همزة وصل بدون قطع." },
  أبن: { suggestion: "ابن", type: "همزة القطع والوصل", explanation: "كلمة 'ابن' تكتب همزة وصل." },
  أمرأة: { suggestion: "امرأة", type: "همزة القطع والوصل", explanation: "كلمة 'امرأة' تكتب همزة وصل." },

  ان: { suggestion: "إن", type: "همزة القطع والوصل", explanation: "الحرف 'إن' / 'أن' يكتب بـ همزة قطع." },
  الى: { suggestion: "إلى", type: "همزة القطع والوصل", explanation: "حرف الجر 'إلى' يكتب بـ همزة قطع مكسورة." },
  او: { suggestion: "أو", type: "همزة القطع والوصل", explanation: "حرف العطف 'أو' يكتب بـ همزة قطع." },
  اذا: { suggestion: "إذا", type: "همزة القطع والوصل", explanation: "الظرف/الحرف 'إذا' يكتب بـ همزة قطع." },
  ام: { suggestion: "أم", type: "همزة القطع والوصل", explanation: "حرف العطف 'أم' يكتب بـ همزة قطع." },
  الا: { suggestion: "إلا", type: "همزة القطع والوصل", explanation: "أداة الاستثناء 'إلا' تكتب بـ همزة قطع." },
  انما: { suggestion: "إنما", type: "همزة القطع والوصل", explanation: "الأداة 'إنما' تكتب بـ همزة قطع." },
  ايضا: { suggestion: "أيضا", type: "همزة القطع والوصل", explanation: "المفعول المطلق 'أيضاً' يكتب بـ همزة قطع." },
  ايضاً: { suggestion: "أيضاً", type: "همزة القطع والوصل", explanation: "المفعول المطلق 'أيضاً' يكتب بـ همزة قطع." },
  احمد: { suggestion: "أحمد", type: "همزة القطع والوصل", explanation: "العَلَم 'أحمد' يبدأ بـ همزة قطع مفتوحة." },
  اكبر: { suggestion: "أكبر", type: "همزة القطع والوصل", explanation: "اسم التفضيل 'أكبر' يبدأ بـ همزة قطع." },
  افضل: { suggestion: "أفضل", type: "همزة القطع والوصل", explanation: "اسم التفضيل 'أفضل' يبدأ بـ همزة قطع." },
  اهم: { suggestion: "أهم", type: "همزة القطع والوصل", explanation: "اسم التفضيل 'أهم' يبدأ بـ همزة قطع." },
  اصبح: { suggestion: "أصبح", type: "همزة القطع والوصل", explanation: "الفعل الماضي الرباعي 'أصبح' يبدأ بـ همزة قطع." },
  اعتقد: { suggestion: "أعتقد", type: "همزة القطع والوصل", explanation: "الفعل المضارع المسند للمتكلم يبدأ بـ همزة قطع." },
  اراد: { suggestion: "أراد", type: "همزة القطع والوصل", explanation: "الفعل الماضي الرباعي 'أراد' يبدأ بـ همزة قطع." },
  انشاء: { suggestion: "إنشاء", type: "همزة القطع والوصل", explanation: "مصدر الفعل الرباعي 'أنشأ' يكتب بـ همزة قطع." },
  امس: { suggestion: "أمس", type: "همزة القطع والوصل", explanation: "الظرف 'أمس' يكتب بـ همزة قطع." },
  انت: { suggestion: "أنت", type: "همزة القطع والوصل", explanation: "الضمير 'أنت' يكتب بـ همزة قطع." },
  انتم: { suggestion: "أنتم", type: "همزة القطع والوصل", explanation: "الضمير 'أنتم' يكتب بـ همزة قطع." },
  اعلان: { suggestion: "إعلان", type: "همزة القطع والوصل", explanation: "مصدر الرباعي 'أعلن' يكتب بـ همزة قطع." },
  امكانية: { suggestion: "إمكانية", type: "همزة القطع والوصل", explanation: "تكتب بـ همزة قطع مكسورة 'إمكانية'." },
  امكانيه: { suggestion: "إمكانية", type: "همزة القطع والوصل والتاء المربوطة", explanation: "تكتب بـ همزة قطع مكسورة وتاء مربوطة 'إمكانية'." },
  اهمية: { suggestion: "أهمية", type: "همزة القطع والوصل", explanation: "تكتب بـ همزة قطع مفتوحة 'أهمية'." },
  اهميه: { suggestion: "أهمية", type: "همزة القطع والوصل والتاء المربوطة", explanation: "تكتب بـ همزة قطع وتاء مربوطة 'أهمية'." },

  // 2. Ta Marbuta vs Ha
  مكتبه: { suggestion: "مكتبة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة' لأنها تنطق تاء عند الوصل وهاء عند الوقف." },
  مدرسه: { suggestion: "مدرسة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  جامعه: { suggestion: "جامعة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  قناه: { suggestion: "قناة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  حياه: { suggestion: "حياة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  لغه: { suggestion: "لغة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  صفحه: { suggestion: "صفحة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  فكره: { suggestion: "فكرة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  قصه: { suggestion: "قصة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  طريقه: { suggestion: "طريقة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  نتيجه: { suggestion: "نتيجة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  قيمه: { suggestion: "قيمة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  خدمه: { suggestion: "خدمة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  دوله: { suggestion: "دولة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  مجموعه: { suggestion: "مجموعة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  شخصيه: { suggestion: "شخصية", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  فتره: { suggestion: "فترة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  صوره: { suggestion: "صورة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  حكومه: { suggestion: "حكومة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  مؤسسه: { suggestion: "مؤسسة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  علاقه: { suggestion: "علاقة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  مقدمه: { suggestion: "مقدمة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  خاتمه: { suggestion: "خاتمة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  تجربه: { suggestion: "تجربة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },
  كلمه: { suggestion: "كلمة", type: "التاء المربوطة والهاء", explanation: "تكتب بـ تاء مربوطة 'ة'." },

  اللة: { suggestion: "الله", type: "التاء المربوطة والهاء", explanation: "لفظ الجلالة يكتب بـ هاء مغلقة الأصلية 'الله' وليس بالتاء المربوطة." },
  هذة: { suggestion: "هذه", type: "التاء المربوطة والهاء", explanation: "اسم الإشارة 'هذه' ينتهي بـ هاء وليس تاء مربوطة." },
  علية: { suggestion: "عليه", type: "التاء المربوطة والهاء", explanation: "الضمير المتصل ينتهي بـ هاء 'عليه'." },
  إلية: { suggestion: "إليه", type: "التاء المربوطة والهاء", explanation: "الضمير المتصل ينتهي بـ هاء 'إليه'." },
  وجة: { suggestion: "وجه", type: "التاء المربوطة والهاء", explanation: "اسم ينتهي بـ هاء أصلية 'وجه'." },
  يشبة: { suggestion: "يشبه", type: "التاء المربوطة والهاء", explanation: "فعل ينتهي بـ هاء أصلية 'يشبه'." },
  توجة: { suggestion: "توجه", type: "التاء المربوطة والهاء", explanation: "ينتهي بـ هاء أصلية 'توجه'." },
  نفسة: { suggestion: "نفسه", type: "التاء المربوطة والهاء", explanation: "الضمير المتصل ينتهي بـ هاء 'نفسه'." },
  منة: { suggestion: "منه", type: "التاء المربوطة والهاء", explanation: "الضمير المتصل ينتهي بـ هاء 'منه'." },
  عنة: { suggestion: "عنه", type: "التاء المربوطة والهاء", explanation: "الضمير المتصل ينتهي بـ هاء 'عنه'." },
  فية: { suggestion: "فيه", type: "التاء المربوطة والهاء", explanation: "الضمير المتصل ينتهي بـ هاء 'فيه'." },
  لأنة: { suggestion: "لأنه", type: "التاء المربوطة والهاء", explanation: "الضمير المتصل ينتهي بـ هاء 'لأنه'." },

  // 3. Alif Maqsura vs Ya
  الي: { suggestion: "إلى", type: "الألف المقصورة والهمزة", explanation: "حرف الجر 'إلى' يكتب بـ ألف مقصورة 'ى' وهمزة قطع مكسورة." },
  حتي: { suggestion: "حتى", type: "الألف المقصورة والياء", explanation: "حرف الغاية 'حتى' ينتهي بـ ألف مقصورة 'ى'." },
  متي: { suggestion: "متى", type: "الألف المقصورة والياء", explanation: "اسم الاستفهام 'متى' ينتهي بـ ألف مقصورة 'ى'." },
  لدي: { suggestion: "لدى", type: "الألف المقصورة والياء", explanation: "الظرف 'لدى' ينتهي بـ ألف مقصورة 'ى'." },
  سوي: { suggestion: "سوى", type: "الألف المقصورة والياء", explanation: "أداة الاستثناء 'سوى' تنتهي بـ ألف مقصورة 'ى'." },
  اخري: { suggestion: "أخرى", type: "الألف المقصورة والهمزة", explanation: "تكتب 'أخرى' بـ همزة قطع وألف مقصورة." },
  أخري: { suggestion: "أخرى", type: "الألف المقصورة والياء", explanation: "تنتهي 'أخرى' بـ ألف مقصورة 'ى'." },
  احدى: { suggestion: "إحدى", type: "الألف المقصورة والهمزة", explanation: "تكتب 'إحدى' بـ همزة قطع مكسورة." },
  مستشفي: { suggestion: "مستشفى", type: "الألف المقصورة والياء", explanation: "الاسم المقصور 'مستشفى' ينتهي بـ ألف مقصورة 'ى'." },
  معني: { suggestion: "معنى", type: "الألف المقصورة والياء", explanation: "الاسم المقصور 'معنى' ينتهي بـ ألف مقصورة 'ى'." },
  اعلي: { suggestion: "أعلى", type: "الألف المقصورة والهمزة", explanation: "تكتب 'أعلى' بـ همزة قطع وألف مقصورة." },
  أعلي: { suggestion: "أعلى", type: "الألف المقصورة والياء", explanation: "تكتب 'أعلى' بـ ألف مقصورة 'ى'." },
  ادني: { suggestion: "أدنى", type: "الألف المقصورة والهمزة", explanation: "تكتب 'أدنى' بـ همزة قطع وألف مقصورة." },
  مستوي: { suggestion: "مستوى", type: "الألف المقصورة والياء", explanation: "الاسم المقصور 'مستوى' ينتهي بـ ألف مقصورة 'ى'." },
  فتي: { suggestion: "فتى", type: "الألف المقصورة والياء", explanation: "الاسم المقصور 'فتى' ينتهي بـ ألف مقصورة 'ى'." },
  مقهي: { suggestion: "مقهى", type: "الألف المقصورة والياء", explanation: "الاسم المقصور 'مقهى' ينتهي بـ ألف مقصورة 'ى'." },

  // 4. Dhad vs Zha
  الظابط: { suggestion: "الضابط", type: "الضاد والظاء", explanation: "تكتب بحرف الضاد 'الضابط' وليس الظاء." },
  ظابط: { suggestion: "ضابط", type: "الضاد والظاء", explanation: "تكتب بحرف الضاد 'ضابط'." },
  الظغط: { suggestion: "الضغط", type: "الضاد والظاء", explanation: "تكتب بحرف الضاد 'الضغط'." },
  ظغط: { suggestion: "ضغط", type: "الضاد والظاء", explanation: "تكتب بحرف الضاد 'ضغط'." },
  انظباط: { suggestion: "انضباط", type: "الضاد والظاء", explanation: "تكتب بحرف الضاد 'انضباط'." },
  ملاظحة: { suggestion: "ملاحظة", type: "الضاد والظاء", explanation: "تكتب بحرف الحاء والظاء الخطأ تصحيحه 'ملاحظة'." },
  ملاظحات: { suggestion: "ملاحظات", type: "الضاد والظاء", explanation: "تكتب 'ملاحظات'." },
  بالظبط: { suggestion: "بالضبط", type: "الضاد والظاء", explanation: "تكتب بحرف الضاد 'بالضبط'." },
};

/**
 * Detects common Arabic grammar, spelling, and typography issues in text.
 */
export function detectGrammarErrors(text: string): GrammarError[] {
  if (!text || text.trim().length === 0) return [];

  const errors: GrammarError[] = [];

  // Pattern 1: Waw Conjunction spacing issues e.g., "و أحمد" -> "وأحمد"
  const wawRegex = /(^|\s)(و)\s+([أإآا-ي]+)/g;
  let match: RegExpExecArray | null;

  while ((match = wawRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const prefix = match[1];
    const wordAfter = match[3];
    const wrongPhrase = `و ${wordAfter}`;
    const suggested = `و${wordAfter}`;
    const index = match.index + prefix.length;

    errors.push({
      id: `err_waw_${index}`,
      type: "واو العطف والوصل",
      word: wrongPhrase,
      suggestion: suggested,
      explanation: "واو العطف تتصل بالكلمة التي بعدها مباشرة دون مسافة بينهما.",
      index: index,
      length: wrongPhrase.length,
    });
  }

  // Pattern 2: Punctuation spacing (space before comma/period/etc) e.g., "كلمة ," -> "كلمة,"
  const punctBeforeRegex = /([أإآا-ي0-9]+)\s+([،,.؛:؟!])/g;
  while ((match = punctBeforeRegex.exec(text)) !== null) {
    const word = match[1];
    const punct = match[2];
    const wrongPhrase = `${word} ${punct}`;
    const suggested = `${word}${punct}`;
    const index = match.index;

    errors.push({
      id: `err_punct_before_${index}`,
      type: "علامات الترقيم والمسافات",
      word: wrongPhrase,
      suggestion: suggested,
      explanation: "لا تترك مسافة قبل علامة الترقيم.",
      index: index,
      length: wrongPhrase.length,
    });
  }

  // Pattern 3: Misplaced Hamza on Definite Article "ألبيت" -> "البيت"
  const alifHamzaArticleRegex = /\b(أَل|أَلْ|أَلَ|أَلُ|أَلِ|أل)([أإآا-ي]+)/g;
  while ((match = alifHamzaArticleRegex.exec(text)) !== null) {
    const prefix = match[1];
    const rest = match[2];
    const wrongWord = `${prefix}${rest}`;
    const suggested = `ال${rest}`;
    const index = match.index;

    errors.push({
      id: `err_alif_article_${index}`,
      type: "همزة القطع والوصل",
      word: wrongWord,
      suggestion: suggested,
      explanation: "همزة أداة التعريف 'ال' هي همزة وصل دائمًا ولا يوضع فوق الألف همزة (ألـ).",
      index: index,
      length: wrongWord.length,
    });
  }

  // Pattern 4: Word-by-word Dictionary Matching for Hamza, Ta/Ha, Alif Maqsura, Dhad/Zha
  // Match tokens (Arabic words)
  const wordRegex = /[\u0600-\u06FF]+/g;
  while ((match = wordRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const index = match.index;

    // Strip diacritics for dictionary lookup
    const cleanWord = rawWord.replace(/[\u064B-\u0652]/g, "");

    if (WORD_CORRECTIONS[cleanWord]) {
      const correction = WORD_CORRECTIONS[cleanWord];
      errors.push({
        id: `err_dict_${index}_${cleanWord}`,
        type: correction.type,
        word: rawWord,
        suggestion: correction.suggestion,
        explanation: correction.explanation,
        index: index,
        length: rawWord.length,
      });
    } else {
      // Rule-based check: Preposition "علي" vs "على" when used as preposition (e.g., "علي المكتب" -> "على المكتب")
      if (cleanWord === "علي") {
        const afterText = text.slice(index + rawWord.length, index + rawWord.length + 15).trim();
        // Check if followed by definite article "ال" or common noun
        if (afterText.startsWith("ال") || /^[أإآا-ي]+/.test(afterText)) {
          errors.push({
            id: `err_ala_${index}`,
            type: "الألف المقصورة والياء",
            word: rawWord,
            suggestion: "على",
            explanation: "حرف الجر 'على' يكتب بالألف المقصورة (ى) تمييزاً له عن الاسم 'عَلِيّ'.",
            index: index,
            length: rawWord.length,
          });
        }
      }
    }
  }

  // Sort errors by index
  errors.sort((a, b) => a.index - b.index);

  return errors;
}

/**
 * Applies a single grammar/spelling correction to the text.
 */
export function applyCorrection(text: string, error: GrammarError): string {
  if (!text || error.index < 0 || error.index > text.length) return text;

  const before = text.slice(0, error.index);
  const after = text.slice(error.index + error.length);

  return before + error.suggestion + after;
}

/**
 * Applies all detected grammar/spelling corrections to the text in batch.
 */
export function applyAllCorrections(text: string, errors: GrammarError[]): string {
  if (!text || errors.length === 0) return text;

  // Sort errors in descending order of index to prevent offset shifting
  const sorted = [...errors].sort((a, b) => b.index - a.index);
  let updatedText = text;

  for (const err of sorted) {
    const before = updatedText.slice(0, err.index);
    const after = updatedText.slice(err.index + err.length);
    updatedText = before + err.suggestion + after;
  }

  return updatedText;
}
