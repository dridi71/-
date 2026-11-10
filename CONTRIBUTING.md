# دليل المساهمة في منصة محلل النصوص والنحو العربي
# Contributing to Arabic NLP & Grammar Suite

نرحب بجميع المساهمات والاقتراحات لتطوير هذا المشروع المفتوح المصدر!
We welcome all contributions and suggestions to help improve this open-source project.

---

## 🛠️ بيئة التطوير والتشغيل المحلي (Local Setup)

1. **استنساخ المستودع (Fork & Clone):**
   ```bash
   git clone https://github.com/dridi0207/arabic-nlp-grammar-suite.git
   cd arabic-nlp-grammar-suite
   ```

2. **تثبيت الاعتماديات (Install Dependencies):**
   ```bash
   npm install
   ```

3. **إعداد المتغيرات البيئية (Environment Variables):**
   ```bash
   cp .env.example .env
   # أضف مفتاح GEMINI_API_KEY إذا كنت ترغب باختبار التحليل الذكي المتقدم
   ```

4. **تشغيل خادم التطوير (Run Dev Server):**
   ```bash
   npm run dev
   ```
   افتح المتصفح على: `http://localhost:3000`

---

## 🌿 دورة حياة الفروع وموجّهات Git (Git Workflow)

1. أنشئ فرعاً مخصصاً لميزتك أو للإصلاح:
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   # أو
   git checkout -b fix/nom-du-bug
   ```
2. تأكد من خلو الشيفرة من أخطاء الأنواع والبناء:
   ```bash
   npm run lint
   npm run build
   ```
3. اكتب رسائل إيداع واضحة وموجزة تتبع نمط Conventional Commits (مثل `feat: ...`, `fix: ...`, `docs: ...`).
4. ادفع فرعك وافتح طلب سحب (Pull Request).

---

## ⚖️ معايير الكود (Code Standards)

- الالتزام بكتابة كود TypeScript نظيف ومعرّف بالأنواع بدقة.
- مراعاة قواعد النحو والصرف العربية والمعاجم المعتمدة مثل «لسان العرب».
- الحفاظ على تجربة مستخدم سريعة وسلسة ومتوافقة مع شاشات الهواتف والأجهزة اللوحية والمكتبية.

شكراً لمساهمتك! ✨
