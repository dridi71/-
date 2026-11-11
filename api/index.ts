import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";
import dotenv from "dotenv";
import {
  parseSentenceGrammarRules,
  fallbackFullGrammarAnalysis,
  fallbackSynonyms,
  fallbackAntonyms,
  fallbackLisanLookup,
} from "../src/utils/sentenceRuleParser";

dotenv.config();

const app = express();

// Security: Disable X-Powered-By fingerprinting
app.disable("x-powered-by");

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Server-Proxy", "Arabe-Texte-Analyse-Secure-Gateway");
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

const securityRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "تم تجاوز حد الطلبات المسموح به مؤقتاً لحماية الخادم والمفتاح السري. يرجى الانتظار والمحاولة لاحقاً.",
      errorFr: "Limite de requêtes atteinte sur le serveur mandataire. Veuillez patienter une minute.",
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  record.count += 1;
  next();
};

app.use("/api", securityRateLimiter);

// Helper: Sanitize error output
const sanitizeErrorMessage = (err: any, fallback: string): string => {
  if (!err) return fallback;
  const raw = typeof err === "string" ? err : err.message || "";
  const sanitized = raw
    .replace(/key=[a-zA-Z0-9_\-]+/gi, "key=REDACTED")
    .replace(/AIza[0-9A-Za-z\-_]{35}/g, "REDACTED_API_KEY");
  return sanitized || fallback;
};

// Multi-Key Pool for High Availability & Zero Interruption
const getAllGeminiKeys = (): string[] => {
  const combined = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEYS,
    process.env.GEMINI_BACKUP_KEY,
  ].filter(Boolean).join(",");

  return combined
    .split(/[,;\n]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 5);
};

let currentKeyIndex = 0;

// Initialize Gemini Client (Strictly internal, never exposed to client)
const getGeminiClient = () => {
  const keys = getAllGeminiKeys();
  if (keys.length === 0) {
    return null;
  }
  const activeKey = keys[currentKeyIndex % keys.length];
  return new GoogleGenAI({
    apiKey: activeKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Automatic rotation to next key in pool on error or quota exhaustion
const rotateGeminiKey = () => {
  const keys = getAllGeminiKeys();
  if (keys.length > 1) {
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    console.log(`[API-Rotation] Bascule vers la clé index ${currentKeyIndex % keys.length} sur ${keys.length}`);
  }
};

// API Endpoint: Health Check
app.get("/api/health", (_req, res) => {
  const keys = getAllGeminiKeys();
  res.json({
    status: "healthy",
    projectName: "Arabe Texte Analyse",
    projectNameAr: "محلل النصوص والنحو العربي",
    proxySecurity: "active",
    environment: "vercel-serverless",
    keySecured: true,
    keyConfigured: keys.length > 0,
    keysCount: keys.length,
    autoRotation: keys.length > 1,
    localFallbackEnabled: true,
    officialFreeKeyGuide: "https://aistudio.google.com/apikey",
    architecture: "Client (React SPA) -> Intermediary Express Server -> Google GenAI (Gemini)",
    timestamp: new Date().toISOString(),
  });
});

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
2. تقديم قائمة من 4 إلى 6 مرادفات عربية فصيحة ومتنوعة في الدرجة البلاغية (فصيح راقٍ، أدبي، جزيل، قريب مأنوس).
3. مع كل مرادف، اذكر ظلال المعنى (الفروق الدقيقة)، ومثالاً بليغاً لاستخدام المرادف، ونصيحة أسلوبية متى يُستحسن استعمال هذا المرادف بدلاً من الكلمة الأصلية.
4. إعطاء 2 إلى 3 أضداد (مقابلات لغوية) للكلمة إن وجدت.
5. تقديم توصية ختامية لتحسين الأسلوب والتحسين اللغوي للجملة.

قم بإرجاع النتيجة بصيغة JSON حصرية متوافقة مع هذا المخطط:
{
  "word": "${word.trim()}",
  "stylisticOverview": "ملخص أسلوبي وبلاغي لطبيعة الكلمة في التعبير العربي",
  "synonyms": [
    {
      "synonym": "المرادف مع التشكيل الكامل",
      "nuance": "ظلال المعنى ودرجة البلاغة",
      "exampleUsage": "جملة بليغة موضحة لاستخدام المرادف",
      "styleTip": "نصيحة أسلوبية متى يُفَضَّل استخدام هذا البديل"
    }
  ],
  "antonyms": ["ضد 1", "ضد 2"],
  "stylisticAdvice": "توصية أسلوبية عامة للكاتب لتحسين الصياغة"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
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

// API Endpoint: AI Antonyms & Creative Writing Opposites
app.post("/api/antonyms", async (req, res) => {
  try {
    const { word, contextSentence, root } = req.body;
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return res.status(400).json({ error: "الرجاء تقديم كلمة صالحة لاستخراج المتضادات" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "مفتاح GEMINI_API_KEY غير متوفر. يتعذر إكمال استخراج المتضادات بالذكاء الاصطناعي.",
      });
    }

    const prompt = `أنت أديب وناقد وبلاغي متخصص في أسرار البلاغة العربية (فن الطباق والمقابلة والتناقض الأدبي) وتنمية مهارات الكتابة الإبداعية والسرد الأدبي.
المطلوب استخراج قائمة بالمتضادات (عكس المعنى) للكلمة التالية لتعزيز مهارات الكتابة الإبداعية للمستخدم، مع تقديم إرشادات كتابية وأمثلة بليغة توضح كيف يُبرز التضاد المعنى (فبضدها تتبين الأشياء).

الكلمة المستهدفة: "${word.trim()}"
${root ? `الجذر الصرفي: "${root}"` : ""}
${contextSentence ? `الجملة السياقية التي وردت فيها: "${contextSentence}"` : ""}

المطلوب:
1. تقديم نظرة إبداعية نقدية (creativeOverview) حول بلاغة توظيف الضد لهذه الكلمة في تصوير المشاهد والتناقض الشعوري والوصفي.
2. توضيح سر البلاغة المرتبط (rhetoricalDevice) مثل الطباق (إيجاب وسلب) أو المقابلة وكيفية توظيفه في التعبير.
3. استخراج 3 إلى 5 متضادات دقيقة وغنية دلالياً بالتشكيل الكامل.
4. مع كل متضاد:
   - تحديد درجة ونوع التضاد (contrastDegree) (مثل: تضاد حاد ومباشر | تضاد اعتباري تدريجي | تضاد سياقي مجازي | تضاد سلب).
   - جملة أدبية بليغة (exampleUsage) تجمع بين الكلمة وضدها أو تبرز المفارقة بأسلوب قصصي أو شعري رفيع.
   - فكرة كتابية إبداعية (creativePrompt) تُلهم الكاتب لتطوير فكرة أو مشهد قائم على هذا التضاد.
5. تقديم تحدٍ كتابي إبداعي (creativeWritingChallenge) عملي ومحفز للكاتب.

قم بإرجاع النتيجة بصيغة JSON حصرية متوافقة مع هذا المخطط:
{
  "word": "${word.trim()}",
  "creativeOverview": "نظرة نقدية وإبداعية حول جماليات توظيف التضاد لهذه الكلمة",
  "rhetoricalDevice": "بيان سر الطباق أو المقابلة في إبراز المعنى",
  "antonyms": [
    {
      "antonym": "الضد مع التشكيل الكامل",
      "contrastDegree": "نوع التضاد ودرجته الدلالية",
      "exampleUsage": "شاهد أدبي أو جملة إبداعية تجمع بين الكلمة وضدها بأسلوب بليغ",
      "creativePrompt": "فكرة وإرشاد للكاتب لتوظيف هذا الضد في صياغة مشهد أدبي"
    }
  ],
  "creativeWritingChallenge": "تحدٍ كتابي إبداعي لتطبيق التضاد في فقرة من خيال الكاتب"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            creativeOverview: { type: Type.STRING },
            rhetoricalDevice: { type: Type.STRING },
            antonyms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  antonym: { type: Type.STRING },
                  contrastDegree: { type: Type.STRING },
                  exampleUsage: { type: Type.STRING },
                  creativePrompt: { type: Type.STRING },
                },
                required: ["antonym", "contrastDegree", "exampleUsage", "creativePrompt"],
              },
            },
            creativeWritingChallenge: { type: Type.STRING },
          },
          required: ["word", "creativeOverview", "rhetoricalDevice", "antonyms", "creativeWritingChallenge"],
        },
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (err: any) {
    console.error("Gemini Antonyms API Error:", err);
    return res.status(500).json({
      error: "حدث خطأ أثناء استخراج المتضادات بواسطة الذكاء الاصطناعي",
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

قم بإرجاع النتيجة بصيغة JSON حصرية متوافقة مع المخطط:
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
      model: "gemini-3.8-flash",
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
4. تحليل واستخراج الصور البيانية والبلاغية الموجودة في النص (التشبيه، الاستعارة، الكناية، المجاز، والمحسنات).

قم بإرجاع النتيجة بصيغة JSON حصرية متوافقة مع المخطط:
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
          "root": "الجذر الصرفي",
          "weight": "الوزن الصرفي",
          "irabRole": "الموقع الإعرابي"
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
      "explanation": "شرح وتفكيك الصورة البلاغية",
      "aestheticImpact": "الأثر الجمالي والأدبي وقوة التجسيد للتعبير"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
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

// API Endpoint: Extract Arabic text from documents (PDF, Word docx/doc) using Gemini AI & Mammoth
app.post("/api/extract-document", async (req, res) => {
  try {
    const { fileName, mimeType, base64Data } = req.body;
    if (!base64Data || typeof base64Data !== "string") {
      return res.status(400).json({ error: "الرجاء تقديم بيانات المستند المشفرة (base64)" });
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const lowerName = (fileName || "").toLowerCase();

    // If it's a plain text, markdown, or json file, decode directly
    const isPlainText = lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".json") || (mimeType && mimeType.startsWith("text/"));
    if (isPlainText) {
      try {
        const textContent = Buffer.from(cleanBase64, "base64").toString("utf-8");
        return res.json({
          text: textContent.trim(),
          method: "plaintext",
          fileName,
        });
      } catch (tErr) {
        console.warn("Text decoding note:", tErr);
      }
    }

    // If it's a Word .docx file, attempt fast server-side extraction with mammoth first
    const isDocx = lowerName.endsWith(".docx") || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (isDocx) {
      try {
        const buffer = Buffer.from(cleanBase64, "base64");
        const mammothResult = await mammoth.extractRawText({ buffer });
        if (mammothResult.value && mammothResult.value.trim().length > 0) {
          return res.json({
            text: mammothResult.value.trim(),
            method: "mammoth",
            fileName,
          });
        }
      } catch (mErr) {
        console.warn("Server mammoth extraction note:", mErr);
      }
    }

    // Call Gemini 2.5 Flash for document parsing, scanned PDFs, or complex layouts
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "مفتاح GEMINI_API_KEY غير متوفر لاستخراج النص بواسطة الذكاء الاصطناعي.",
      });
    }

    // Determine correct document MIME type for Gemini
    let resolvedMimeType = "application/pdf";
    if (mimeType && mimeType.includes("pdf")) {
      resolvedMimeType = "application/pdf";
    } else if (lowerName.endsWith(".pdf")) {
      resolvedMimeType = "application/pdf";
    } else if (mimeType && mimeType.startsWith("image/")) {
      resolvedMimeType = mimeType;
    } else if (mimeType && mimeType.length > 0) {
      resolvedMimeType = mimeType;
    }

    const prompt = `أنت خبير لغوي محترف متخصص في استخراج النصوص العربية من الوثائق والمستندات (PDF / Word / صور) بدقة فائقة.
المطلوب منك بدقة:
1. استخراج كامل النص العربي الأصلي الموجود في هذا المستند دون أي نقصان أو تلخيص.
2. الحفاظ التام على تسلسل الفقرات، الفواصل، والعناوين كما وردت في المستند.
3. معالجة وتصحيح أي تشوهات أو حروف مقطعة أو كلمات معكوسة ناتجة عن تصدير ملف الـ PDF ليعود النص فصيحاً ومترابطاً وسليم القراءة من اليمين إلى اليسار.
4. الحفاظ على التشكيل وعلامات الترقيم الأصلية إن وجدت.
5. الإخراج المطلوب: أرسل النص العربي المستخرج فقط مباشرة دون أي مقدمة أو خاتمة أو شروحات إضافية ودون استخدام وسوم كود ماركداون (\`\`\`).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: resolvedMimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const extractedText = (response.text || "").trim();
    return res.json({
      text: extractedText,
      method: "gemini-ai",
      fileName,
    });
  } catch (err: any) {
    console.error("Document extraction error:", err);
    return res.status(500).json({
      error: "حدث خطأ أثناء استخراج النص من المستند",
      details: err?.message || String(err),
    });
  }
});

// API Endpoint: Dedicated Sentence Grammar & Irab Analysis
app.post("/api/analyze-sentence", async (req, res) => {
  try {
    const { sentence } = req.body;
    if (!sentence || typeof sentence !== "string" || sentence.trim().length === 0) {
      return res.status(400).json({ error: "الرجاء تقديم جملة صالحة للإعراب" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "مفتاح GEMINI_API_KEY غير متوفر. يتعذر إكمال التحليل الإعرابي للجملة.",
      });
    }

    const prompt = `أنت علامة وأستاذ كرسي النحو والصرف والبلاغة في مجمع اللغة العربية، خبير في إعراب القرآن الكريم وشواهد الشعر العربي ومصنفات سيبويه وابن هشام والزمخشري.
المطلوب منك إعراب الجملة العربية التالية إعراباً وافياً وشاملاً ودقيقاً للغاية:

الجملة المراد إعرابها:
"${sentence.trim()}"

المعايير النحوية الإلزامية:
1. ضبط الجملة بالتشكيل التام والدقيق لكل حرف وحركة في (diacritizedSentence).
2. بيان نوع الجملة (جملة فعلية، جملة اسمية، شبه جملة، جملة شرطية...).
3. بيان المحل الإعرابي للجملة ككل (sentenceRole): هل لها محل من الإعراب (كأن تكون خبرية، حالية، نعتية، مقول قول، جواب شرط جازم مقترن بالفاء...) أو لا محل لها من الإعراب (ابتدائية، استئنافية، صلة موصول، اعتراضية...).
4. توضيح الأركان الأساسية للجملة (mainPillars): كالمبتدأ والخبر، أو الفعل والفاعل ونائبه، أو اسم كان وخبرها، أو أداة الشرط وفعل الشرط وجوابه.
5. تفكيك كافة كلمات الجملة وإعراب كل كلمة أو ضمير متصل أو حرف إعراباً تفصيلياً (wordsDetail):
   - الكلمة مشكولة تماماً (diacritized).
   - نوعها (pos) وتسميتها بالعربية (posArabic).
   - الإعراب التفصيلي المعياري الكامل (irabDetailed) مثل: "فعل ماض مبني على الفتح الظاهر على آخره لا محل له من الإعراب والفاعل ضمير مستتر تقديره هو".
   - الحالة الإعرابية (grammaticalCase): مرفوع، منصوب، مجرور، مجزوم، مبني في محل...
   - علامة الإعراب (marker): الضمة، الفتحة، الكسرة، السكون، حذف النون، ثبوت النون، الألف، الياء، حذف حرف العلة...
   - نوع العلامة (markerType): أصلية ظاهرة، أصلية مقدرة للتعذر أو الثقل أو اشتغال المحل، أو فرعية.
   - الارتباط النحوي (syntacticRelation): كبيان تعلقه بالفعل أو المبتدأ.
   - الجذر الصرفي (root) والوزن (weight).
6. الجمل الفرعية ومحلها من الإعراب (subClauses) إن وُجدت.
7. فوائد ولطائف نحوية (grammaticalNotes): ملاحظات دقيقة عن التقديم والتأخير، الحذف، التضمين، أو القواعد النحوية المستفادة.
8. اللمسة البلاغية والجمالية في صياغة الجملة (rhetoricalTouch).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalSentence: { type: Type.STRING },
            diacritizedSentence: { type: Type.STRING },
            sentenceType: { type: Type.STRING },
            sentenceRole: { type: Type.STRING },
            mainPillars: {
              type: Type.OBJECT,
              properties: {
                pillar1: { type: Type.STRING },
                pillar2: { type: Type.STRING },
                extra: { type: Type.STRING },
              },
              required: ["pillar1", "pillar2"],
            },
            wordsDetail: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  diacritized: { type: Type.STRING },
                  pos: { type: Type.STRING },
                  posArabic: { type: Type.STRING },
                  irabDetailed: { type: Type.STRING },
                  grammaticalCase: { type: Type.STRING },
                  marker: { type: Type.STRING },
                  markerType: { type: Type.STRING },
                  syntacticRelation: { type: Type.STRING },
                  root: { type: Type.STRING },
                  weight: { type: Type.STRING },
                },
                required: ["word", "diacritized", "pos", "posArabic", "irabDetailed", "grammaticalCase", "marker"],
              },
            },
            subClauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clause: { type: Type.STRING },
                  clauseType: { type: Type.STRING },
                  irabRole: { type: Type.STRING },
                },
                required: ["clause", "clauseType", "irabRole"],
              },
            },
            grammaticalNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            rhetoricalTouch: { type: Type.STRING },
          },
          required: [
            "originalSentence",
            "diacritizedSentence",
            "sentenceType",
            "sentenceRole",
            "mainPillars",
            "wordsDetail",
            "grammaticalNotes",
          ],
        },
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (err: any) {
    console.error("Sentence Irab API Error:", err);
    return res.status(500).json({
      error: "حدث خطأ أثناء إجراء إعراب الجملة بالذكاء الاصطناعي",
      details: err?.message || String(err),
    });
  }
});

export default app;
