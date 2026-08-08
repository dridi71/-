import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint: AI Synonyms & Stylistic Alternatives
app.post("/api/synonyms", async (req, res) => {
  try {
    const { word, contextSentence, root } = req.body;
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return res.status(400).json({ error: "الرجاء تقديم كلمة صالحة لاستخراج المرادفات" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "مفتاح GEMINI_API_KEY غير متوفر. يتعذر إكمال توليد المرادفات بالذكاء الاصطناعي.",
      });
    }

    const prompt = `أنت خبير لغوي وبلاغي متعمق في أدبيات اللغة العربية وتراكيب الفصحى.
المطلوب اقتراح مرادفات وبدائل بلاغية وأسلوبية مثرية للكلمة التالية مع مراعاة سياق ورودها في النص لتحسين الأسلوب الكتابي والتعبيري.

الكلمة المستهدفة: "${word.trim()}"
${root ? `الجذر الصرفي: "${root}"` : ""}
${contextSentence ? `الجملة السياقية التي وردت فيها الكلمة: "${contextSentence}"` : ""}

المطلوب:
1. إعطاء ملخص أسلوبي لبلاغة هذه الكلمة وطبيعة استخدامها.
2. تقديم قائمة من 4 إلى 6 مرادفات عربية فصيحة وم تنوعة في الدرجة البلاغية (فصيح راقٍ، أدبي، جزيل، قريب مأنوس).
3. مع كل مرادف، اذكر ظلال المعنى (الفروق الدقيقة)، ومثالاً بليغاً لاستخدام المرادف، ونصيحة أسلوبية متى يُستحسن استعمال هذا المرادف بدلاً من الكلمة الأصلية.
4. إعطاء 2 إلى 3 أضداد (مقابلات لغوية) للكلمة إن وجدت.
5. تقديم توصية ختامية لتحسين الأسلوب والتحسين اللغوي للجملة.

قم بإرجاع النتيجة بصيغة JSON حصرية متوافقة مع هذا المخطط exact structure:
{
  "word": "${word.trim()}",
  "stylisticOverview": "ملخص أسلوبي وبلاغي لطبيعة الكلمة في التعبير العربي",
  "synonyms": [
    {
      "synonym": "المرادف مع التشكيل الكامل",
      "nuance": "ظلال المعنى ودرجة البلاغة (مثال: أدبي جزيل | فصيح راقٍ | قريب مأنوس)",
      "exampleUsage": "جملة بليغة موضحة لاستخدام المرادف",
      "styleTip": "نصيحة أسلوبية متى يُفَضَّل استخدام هذا البديل"
    }
  ],
  "antonyms": ["ضد 1", "ضد 2"],
  "stylisticAdvice": "توصية أسلوبية عامة للكاتب لتحسين الصياغة"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            stylisticOverview: { type: Type.STRING },
            synonyms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  synonym: { type: Type.STRING },
                  nuance: { type: Type.STRING },
                  exampleUsage: { type: Type.STRING },
                  styleTip: { type: Type.STRING },
                },
                required: ["synonym", "nuance", "exampleUsage", "styleTip"],
              },
            },
            antonyms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            stylisticAdvice: { type: Type.STRING },
          },
          required: ["word", "stylisticOverview", "synonyms", "stylisticAdvice"],
        },
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (err: any) {
    console.error("Gemini Synonyms API Error:", err);
    return res.status(500).json({
      error: "حدث خطأ أثناء اقتراح المرادفات بواسطة الذكاء الاصطناعي",
      details: err?.message || String(err),
    });
  }
});

// API Endpoint: Dynamic Lisan Al-Arab Lexicon Lookup via Gemini AI
app.post("/api/lisan-lookup", async (req, res) => {
  try {
    const { word, root } = req.body;
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return res.status(400).json({ error: "الرجاء تقديم كلمة صالحة للبحث في لسان العرب" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "مفتاح GEMINI_API_KEY غير متوفر. يتعذر البحث في لسان العرب بالذكاء الاصطناعي.",
      });
    }

    const prompt = `أنت خبير ومحقق في التراث اللغوي العربي ومعاجم الفصحى، وتملك استحضاراً ودراية كاملة بمعجم «لسان العرب» للعلامة ابن منظور.
المطلوب إخراج مادة معجمية لسانية موثقة ودقيقة للكلمة والجذر التاليين وفق منهج لسان العرب (نظام الأبواب والفصول بحسب الحرف الأخير والحرف الأول).

الكلمة: "${word.trim()}"
${root ? `الجذر المقدر: "${root}"` : ""}

المطلوب:
1. تحديد الجذر اللغوي الدقيق (ثلاثي أو رباعي).
2. تحديد الباب (الحرف الأخير) والفصل (الحرف الأول) بحسب نظام لسان العرب لابن منظور.
3. تقديم الشرح المعجمي والتأصيل اللغوي لنص ابن منظور في لسان العرب.
4. إيراد الشواهد القرآنية والأبيات الشعرية العربية الخالدة المذكورة في لسان العرب للتدليل على المعنى.
5. استخراج أهم المشتقات والوجوه اللغوية للكلمة.

قم بإرجاع النتيجة بصيغة JSON حصرية متوافقة مع المخطط التالي:
{
  "root": "الجذر الثلاثي أو الرباعي",
  "bab": "باب ... (الحرف الأخير)",
  "fasl": "فصل ... (الحرف الأول)",
  "meaning": "شرح مختصر وموجز لمعنى الكلمة في المعجم",
  "fullLexicalText": "قال ابن منظور في لسان العرب: ... (نص مفصل وموثق بأسلوب لسان العرب)",
  "examplesAndVerses": ["شاهد قرآني أو بيت شعر 1", "شاهد 2"],
  "derivatives": ["مشتق 1", "مشتق 2", "مشتق 3", "مشتق 4"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            root: { type: Type.STRING },
            bab: { type: Type.STRING },
            fasl: { type: Type.STRING },
            meaning: { type: Type.STRING },
            fullLexicalText: { type: Type.STRING },
            examplesAndVerses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            derivatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["root", "bab", "fasl", "meaning", "fullLexicalText", "derivatives"],
        },
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (err: any) {
    console.error("Gemini Lexicon Lookup Error:", err);
    return res.status(500).json({
      error: "حدث خطأ أثناء البحث في معجم لسان العرب بواسطة الذكاء الاصطناعي",
      details: err?.message || String(err),
    });
  }
});

// API Endpoint: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// API Endpoint: Deep Arabic Grammatical Analysis & Word Classification
app.post("/api/analyze-grammar", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "الرجاء تقديم نص صالح للتحليل" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "مفتاح GEMINI_API_KEY غير متوفر. يتعذر إكمال التحليل الإعرابي المتقدم.",
      });
    }

    const prompt = `أنت عالم لغوي ونحوي وبلاغي متبحر متخصص في لغة العرب وعلوم البلاغة (البيان، المعاني، البديع)، وتعتمد مرجعية «معجم لسان العرب» للعلامة ابن منظور وكتب أسرار البلاغة.
قم بتحليل النص العربي التالي تحليلاً نحواً ولغوياً وبلاغياً شاملاً ودقيقاً مع استخراج كافة الصور البيانية والبلاغية (التشبيه، الاستعارة، الكناية، المجاز المرسل، والمحسنات البديعية).

النص المراد تحليله:
"""
${text.slice(0, 3000)}
"""

المطلوب:
1. تصنيف كل كلمة فريدة أو جملة في النص بحسب قسمها النحوي (أسماء، أفعال، حروف، ضمائر، صفات، ظروف).
2. استخراج الجذر الصرفي والوزن والتشكيل والدور الإعرابي لكل كلمة.
3. تقديم إعراب تفصيلي موثوق للجمل الرئيسية في النص.
4. **تحليل واستخراج الصور البيانية والبلاغية الموجودة في النص**:
   - التشبيه (بأنواعه: تام، مؤكد، مجمل، بليغ، تمثيلي، ضمني).
   - الاستعارة (بنوعيها: تصريحية، مكنية).
   - الكناية (عن صفة، عن موصوف، عن نسبة).
   - المجاز المرسل والمحسنات البديعية (طِباق، جِناس، سَجَع، مُقابلة).
   لكل صورة بيانية وبلاغية: حدد الشاهد/العبارة، المسمى البلاغي، تفكيك الصورة وشرح المشبه والمشبه به أو القرينة، والأثر الجمالي والأدبي.

قم بإرجاع النتيجة بصيغة JSON حصرية متوافقة مع هذا المخطط exact structure:
{
  "summary": "ملخص عام لطبيعة النص وبنيته النحوية",
  "rhetoricalSummary": "ملخص بلاغي وبياني شامل لجماليات النص والصور البيانية فيه",
  "totalWordsAnalyzed": number,
  "sentencesIrab": [
    {
      "sentence": "الجملة مع التشكيل",
      "translation": "شرح أو معنى بسيط إن وجد",
      "wordsDetail": [
        {
          "word": "الكلمة كما وردت",
          "diacritics": "الكلمة بالتشكيل الكامل",
          "pos": "noun" | "verb" | "particle" | "pronoun" | "adjective" | "adverb_number" | "other",
          "posArabic": "اسم | فعل ماض | فعل مضارع | حرف جر | ..." ,
          "root": "الجذر الصرفي (مثل: ك-ت-ب)",
          "weight": "الوزن الصرفي (مثل: فَعَلَ)",
          "irabRole": "الموقع الإعرابي (مثل: فاعل مرفوع وعلامة رفعه الضمة الظاهرة)"
        }
      ]
    }
  ],
  "categoriesBreakdown": [
    {
      "categoryKey": "nouns" | "verbs" | "particles" | "pronouns" | "adjectives" | "adverbs_numbers" | "others",
      "categoryLabelArabic": "الأسماء | الأفعال | الحروف والأدوات | الضمائر وأسماء الإشارة | الصفات والمشتقات | الظروف والأعداد | أخرى",
      "count": number,
      "examples": ["كلمة1", "كلمة2"]
    }
  ],
  "rhetoricalFigures": [
    {
      "type": "simile" | "metaphor" | "metonymy" | "badic" | "other",
      "typeArabicLabel": "تشبيه بليغ | استعارة مكنية | استعارة تصريحية | كناية عن صفة | مجاز مرسل | جناس | طباق",
      "textSegment": "العبارة أو الشاهد البلاغي المستخرج من النص",
      "explanation": "شرح وتفكيك الصورة البلاغية (المشبه والمشبه به والقرينة المانعة من إرادة المعنى الأصلي)",
      "aestheticImpact": "الأثر الجمالي والأدبي وقوة التجسيد للتعبير"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            rhetoricalSummary: { type: Type.STRING },
            totalWordsAnalyzed: { type: Type.NUMBER },
            sentencesIrab: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  wordsDetail: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        word: { type: Type.STRING },
                        diacritics: { type: Type.STRING },
                        pos: { type: Type.STRING },
                        posArabic: { type: Type.STRING },
                        root: { type: Type.STRING },
                        weight: { type: Type.STRING },
                        irabRole: { type: Type.STRING },
                      },
                      required: ["word", "pos", "posArabic", "irabRole"],
                    },
                  },
                },
                required: ["sentence", "wordsDetail"],
              },
            },
            categoriesBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categoryKey: { type: Type.STRING },
                  categoryLabelArabic: { type: Type.STRING },
                  count: { type: Type.NUMBER },
                  examples: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["categoryKey", "categoryLabelArabic", "count"],
              },
            },
            rhetoricalFigures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  typeArabicLabel: { type: Type.STRING },
                  textSegment: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  aestheticImpact: { type: Type.STRING },
                },
                required: ["type", "typeArabicLabel", "textSegment", "explanation", "aestheticImpact"],
              },
            },
          },
          required: ["summary", "sentencesIrab", "categoriesBreakdown", "rhetoricalFigures"],
        },
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({
      error: "حدث خطأ أثناء إجراء التحليل الإعرابي بواسطة الذكاء الاصطناعي",
      details: err?.message || String(err),
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
