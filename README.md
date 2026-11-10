# منصة محلل النصوص والنحو والبلاغة العربية (Arabic NLP & Grammar Suite)

[![CI - Build & Lint](https://github.com/dridi0207/arabic-nlp-grammar-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/dridi0207/arabic-nlp-grammar-suite/actions/workflows/ci.yml)
[![Docker Build](https://github.com/dridi0207/arabic-nlp-grammar-suite/actions/workflows/docker.yml/badge.svg)](https://github.com/dridi0207/arabic-nlp-grammar-suite/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

منصة تفاعلية متكاملة لمعالجة وتدقيق النصوص العربية، تعتمد معجم **«لسان العرب»** للعلامة ابن منظور، وتوفر نظام تدقيق إملائي ونحوي مباشر، ونظام نطق صوتي فصيح (Text-to-Speech)، وتحليل الصور البيانية والبلاغية (التشبيه، الاستعارة، الكناية)، بالإضافة إلى تحليل أقسام الكلام والتكرارات والتوليد الذكي للإعراب.

---

## 🌟 الميزات الرئيسية (Key Features)

### 1. ✍️ محرر وتدقيق إملائي ونحوي مباشر (Grammar & Spelling Inspector)
- **اكتشاف الأخطاء الشائعة فورياً**:
  - همزات القطع والوصل (مثل: `إسم` ➔ `اسم` ، `ان` ➔ `إن` ، `الى` ➔ `إلى`).
  - التاء المربوطة والهاء (مثل: `مدرسه` ➔ `مدرسة` ، `اللة` ➔ `الله`).
  - الألف المقصورة والياء (مثل: `حتي` ➔ `حتى` ، `علي المكتب` ➔ `على المكتب`).
  - التمييز بين الضاد والظاء (`الظابط` ➔ `الضابط`).
  - واو العطف والمسافات (`و أحمد` ➔ `وأحمد`).
- **تطبيق التصحيح بضغطة واحدة**: إمكانية تصحيح الخطأ المفرد أو تصحيح كافة الملاحظات دفعة واحدة تلقائياً.

### 2. 📚 اعتماد معجم «لسان العرب» لابن منظور (Lisan Al-Arab Lexicon)
- **تأصيل اللفظ والمفردة**: عند النقر على أي كلمة في النص، يتم فتح بطاقة مفصلة تُظهر:
  - **الباب والفصل**: وفق نظام الترتيب المعجمي لـ «لسان العرب» (الحرف الأخير للباب والأول للفصل).
  - **الشرح المعجمي والمفهوم**: اقتباسات موسعة وموثقة من نص ابن منظور.
  - **الشواهد والآيات**: الآيات القرأنية والأبيات الشعرية التي وردت في المعجم للتدليل على المعنى.
  - **أبرز المشتقات**: استخراج مشتقات الجذر والجُمل السياقية.

### 3. 🔊 محرك تحويل النص إلى كلام (Text-to-Speech - TTS)
- **قراءة صوتیة ناصعة**: الاستماع لقراءة النص كاملاً أو الكلمات المفردة وشروحها بالنطق العربي الفصيح.
- **إعدادات قارئ الصوت**:
  - التحكم في سرعة القراءة (`0.75x` ، `1.0x` ، `1.25x` ، `1.5x`).
  - اختيار صوت القارئ العربي المفضل المتاح في جهاز والمتصفح.
  - زر استماع سريع ومباشر داخل بطاقة الكلمة والمعجم.

### 4. 📊 التظليل التفاعلي وتحليل أقسام الكلام (Interactive POS & Frequency)
- **تبويب أقسام الكلام**: تصنيف الكلمات ملوناً إلى (أسماء، أفعل، حروف، ضمائر، ظروف، أسماء إشارة، موصولة).
- **إبراز الكلمات المكررة**: كشف نسبة التكرار وتلوين الكلمات الأكثر وروداً لتفادي الركاكة اللغوية.
- **بحث وتصفية لحظية**: إبراز موضع أي كلمة أو جذر في النص ومطابقتها.

### 5. 🤖 الإعراب والتحليل اللغوي بالذكاء الاصطناعي (Gemini AI Parser)
- إعراب الجمل والكلمات تفصيلياً مع ذكر الموقع الإعرابي والعلامة والإصطلاح النحوي.
- استخراج الخلاصات اللغوية والإحصاءات المتقدمة للنص.
- إمكانية تصدير تقرير شامل بحجم الخط وتنسيقات مناسبة للطباعة والمشاركة.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Front-end**: React 18, Vite, TypeScript, Tailwind CSS
- **Icons & UI**: Lucide React, Custom Dark/Luxury Aesthetic Components
- **NLP & Lexicon Engine**: Custom Arabic NLP Tokenizer & `Lisan Al-Arab` Lexicon Engine
- **Audio**: Web Speech Synthesis API
- **Back-end Server**: Express.js (Node.js) on Cloud Run Container
- **AI Integration**: `@google/genai` (Gemini API) for advanced syntactic analysis

---

## 🚀 تشغيل المشروع وتطويره (Getting Started)

### تثبيت الحزم (Installation)
```bash
npm install
```

### تشغيل الخادم في وضع التطوير (Development)
```bash
npm run dev
```
سيعمل التطبيق على المنفذ المحدد: `http://localhost:3000`

### بناء النسخة الإنتاجية (Production Build)
```bash
npm run build
npm start
```

---

## 🚀 تشغيل ونشر المشروع (Installation & Deployment)

### 1. التثبيت المباشر عبر GitHub (Direct Install from GitHub)
يمكن لأي مستخدم تثبيت وتشغيل التطبيق مباشرة من مستودع GitHub عبر الأوامر التالية:

```bash
# 1. استنساخ المستودع
git clone https://github.com/dridi0207/arabic-nlp-grammar-suite.git
cd arabic-nlp-grammar-suite

# 2. تثبيت التبعيات
npm install

# 3. إعداد مفتاح API في ملف .env
cp .env.example .env
# ثم قم بإضافة GEMINI_API_KEY داخل ملف .env

# 4. تشغيل خادم التطوير
npm run dev
```

---

### 2. التشغيل باستخدام Docker و Docker Compose (Docker Installation)
يمكن تشغيل المشروع بيسر داخل حاوية Docker دون الحاجة لتثبيت Node.js محلياً:

```bash
# تشغيل الحاوية
docker-compose up -d --build
```
سيكون التطبيق متاحاً على الرابط: `http://localhost:3000`

---

### 3. إصدارات GitHub وإطلاق النسخ (GitHub Releases Automation)
تم إعداد سير عمل آلي مدمج (`.github/workflows/release.yml`) لإطلاق الإصدارات المجمعة تلقائياً عند إنشاء وسْم جديد (Git Tag):

1. **إنشاء إطلاق جديد (Create a Release via Tag)**:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0: Arabic NLP & Grammar Suite with Lisan Al-Arab & Speech Synthesis"
   git push origin v1.0.0
   ```
2. تقوم **GitHub Actions** تلقائياً ببناء الملفات التجميعية وإرفاق ملف مضغوط `arabic-nlp-grammar-suite-release.zip` في صفحة **Releases** للمستودع ليتسنى للمستخدمين تنزيله واستخدامه فوراً.

### 4. النشر على منصة Vercel (Vercel Deployment)
المشروع مهيأ بالكامل للنشر الفوري بنقرة واحدة على **Vercel** بفضل ملف التكوين `vercel.json` ونقاط النهاية السحابية `api/index.ts`:

1. قم بربط مستودع GitHub بحسابك على [Vercel](https://vercel.com).
2. في إعدادات المشروع (Project Settings):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. أضف متغير البيئة:
   - `GEMINI_API_KEY`: مفتاحك الخاص من Google AI Studio
4. سيتم نشر الواجهة تلقائياً مع توجيه طلبات واجهة برمجة التطبيقات `/api/*` كدوال بدون خادم (Serverless Functions).

---

## 📋 ملف البيان (Manifest File)

يتضمن المشروع ملف بيان مفصل [README.mf](./README.mf) يوثق كافة المواصفات التقنية، الإصدارات، المنصات المدعومة، الوحدات الوظيفية، ومخطط المعالجة.

---

## 📄 الترخيص (License)

هذا المشروع مرخص بموجب رخصة **MIT** المفتوحة المصدر - حقوق الطبع والنشر © 2026 **Mohamed DRIDI**.  
This project is open-source and licensed under the **MIT License**.  
Ce projet est open-source et distribué sous les termes de la **Licence MIT**.

يرجى مراجعة ملف [LICENSE](./LICENSE) للاطلاع على النص الكامل للرخصة.

