# منصة محلل النصوص والنحو والبلاغة العربية | Arabe Texte Analyse

[![CI - Build & Lint](https://github.com/dridi0207/arabic-nlp-grammar-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/dridi0207/arabic-nlp-grammar-suite/actions/workflows/ci.yml)
[![Docker Build](https://github.com/dridi0207/arabic-nlp-grammar-suite/actions/workflows/docker.yml/badge.svg)](https://github.com/dridi0207/arabic-nlp-grammar-suite/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Security: Proxy Intermediary](https://img.shields.io/badge/API%20Security-Proxy%20Server-emerald.svg)](#-serveur-interm%C3%A9diaire-s%C3%A9curis%C3%A9--proxy-backend)

**Arabe Texte Analyse** est une plateforme professionnelle intégrée de traitement et d'analyse linguistique de la langue arabe, combinant le lexique traditionnel de **« Lisan Al-Arab »** d'Ibn Manzur, un correcteur grammatical et orthographique instantané, un moteur de synthèse vocale éloquente (Text-to-Speech), l'analyse des figures de rhétorique (métaphore, métonymie, comparaison) et un système d'analyse syntaxique (I'rab) approfondi propulsé par l'IA.

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

## 🛡️ Serveur Intermédiaire Sécurisé & Protection de la Clé API (Proxy Backend)

Pour garantir une sécurité maximale et protéger la clé API secrète (`GEMINI_API_KEY`) contre toute fuite côté navigateur, le projet utilise une architecture de **serveur mandataire intermédiaire (Intermediary Backend Proxy)** :

```
┌─────────────────────────────────┐       ┌──────────────────────────────────────┐       ┌────────────────────────┐
│  Client Navigateur (React SPA)   │ ───> │ Serveur Intermédiaire (Express / API)│ ───>  │ Google GenAI API Cloud │
│  - Aucune clé secrète stockée    │ <─── │ - Clé GEMINI_API_KEY masquée         │ <───  │ (gemini-3.8-flash)     │
│  - Requêtes vers /api/*          │      │ - En-têtes HTTP de sécurité (CSP)    │       └────────────────────────┘
└─────────────────────────────────┘       │ - Limitation de débit (Rate Limit)   │
                                          │ - Assainissement des erreurs         │
                                          └──────────────────────────────────────┘
```

### 🔒 Mesures de Sécurité Appliquées :
1. **Zéro exposition de la clé côté client** : Le code JavaScript téléchargé par l'utilisateur ne contient aucun secret ni clé d'API. Toutes les requêtes vers l'IA transitent exclusivement par les routes internes `/api/analyze-sentence`, `/api/analyze-grammar`, `/api/synonyms`, `/api/antonyms`, et `/api/extract-document`.
2. **Masquage et assainissement des messages d'erreur** : Les piles d'appels internes et les éventuelles traces de clés sont purgées avant tout renvoi au client.
3. **Limiteur de débit intégré (Rate Limiting)** : Protection contre les attaques par force brute et l'épuisement de quota avec une fenêtre glissante (60 requêtes/minute par IP).
4. **En-têtes HTTP sécurisés** :
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - Désactivation de l'en-tête révélateur `X-Powered-By`.
5. **Point de contrôle de santé (`GET /api/health`)** : Permet de vérifier l'état opérationnel du serveur proxy sans jamais dévoiler la valeur de la clé.

---

## 📄 الترخيص (License)

هذا المشروع مرخص بموجب رخصة **MIT** المفتوحة المصدر - حقوق الطبع والنشر © 2026 **Mohamed DRIDI**.  
This project is open-source and licensed under the **MIT License**.  
Ce projet est open-source et distribué sous les termes de la **Licence MIT**.

يرجى مراجعة ملف [LICENSE](./LICENSE) للاطلاع على النص الكامل للرخصة.

