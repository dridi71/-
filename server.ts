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

    const prompt = `أنت عالم لغوي ونحوي متبحر متخصص في لغة العرب، وتعتمد مرجعية «معجم لسان العرب» للعلامة ابن منظور في شرح المفردات واستخراج الجذور وتوجيه الشواهد والتحليل الإعرابي.
قم بتحليل النص العربي التالي تحليلاً نحواً ولغوياً شاملاً ودقيقاً مع الاستشهاد بأصل المعاني والجذور وفق لسان العرب.

النص المراد تحليله:
"""
${text.slice(0, 3000)}
"""

المطلوب:
1. تصنيف كل كلمة فريدة أو جملة في النص بحسب قسمها النحوي:
   - أسماء (nouns): أسماء علم، أسماء ذات، أسماء معاني، مصادر...
   - أفعال (verbs): ماضٍ، مضارع، أمر.
   - حروف وأدوات (particles): حروف جر، حروف عطف، حروف نصب، حروف جزم، أدوات شرط، حروف توكيد...
   - ضمائر وأسماء موصولة وإشارة (pronouns): ضمائر منفصلة/متصلة، أسماء إشارة، أسماء موصولة...
   - صفات ومشتقات (adjectives): صفات مشبهة، أسماء فاعلين، أسماء مفعولين...
   - ظروف وأعداد (adverbs_numbers): ظروف زمان/مكان، أعداد وأرقام.

2. استخراج الجذر الصرفي والوزن والتشكيل والدور الإعرابي التقريبي والتفصيلي لكل كلمة مهمة في النص.

3. تقديم إعراب تفصيلي موثوق للجمل الرئيسية في النص (جدول الإعراب).

قم بإرجاع النتيجة بصيغة JSON حصرية متوافقة مع هذا المخطط exact structure:
{
  "summary": "ملخص عام لطبيعة النص وبنيته النحوية والبلاغية",
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
          },
          required: ["summary", "sentencesIrab", "categoriesBreakdown"],
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
