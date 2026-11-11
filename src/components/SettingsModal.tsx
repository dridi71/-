import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
  Palette,
  Wand2,
  Filter,
  Type,
  Volume2,
  RotateCcw,
  Check,
  Save,
  CheckCircle2,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { UserPreferences, DEFAULT_USER_PREFERENCES } from "../utils/userPreferences";
import { HighlightMode } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (newPrefs: UserPreferences) => void;
  onResetPreferences: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onResetPreferences,
}) => {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync incoming preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalPrefs(preferences);
      setSavedSuccess(false);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePreferences(localPrefs);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setLocalPrefs(DEFAULT_USER_PREFERENCES);
    onResetPreferences();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#1A202C] border-b border-[#2D3748] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  إعدادات وتفضيلات المستخدم
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>localStorage</span>
                </span>
              </div>
              <p className="text-xs text-[#A0AEC0] mt-0.5">
                تخصيص سلوك التحليل والواجهة وحفظ التفضيلات تلقائياً في المتصفح
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A0AEC0] hover:text-white hover:bg-[#2D3748] rounded-lg transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto grow">

          {/* 1. Default Highlight Mode */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#D4AF37]" />
              <span>نمط التمييز البصري الافتراضي للنص:</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocalPrefs({ ...localPrefs, defaultHighlightMode: "frequency" })}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                  localPrefs.defaultHighlightMode === "frequency"
                    ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-sm"
                    : "bg-[#0D1117] border-[#2D3748] text-[#CBD5E0] hover:border-[#D4AF37]/50 hover:bg-[#1A202C]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">تكرار الكلمات</span>
                  {localPrefs.defaultHighlightMode === "frequency" && (
                    <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                </div>
                <p className="text-[10px] text-[#A0AEC0] leading-tight">
                  تلوين الكلمات حسب مرات تكرارها في النص
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLocalPrefs({ ...localPrefs, defaultHighlightMode: "pos" })}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                  localPrefs.defaultHighlightMode === "pos"
                    ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-sm"
                    : "bg-[#0D1117] border-[#2D3748] text-[#CBD5E0] hover:border-[#D4AF37]/50 hover:bg-[#1A202C]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">أقسام الكلام</span>
                  {localPrefs.defaultHighlightMode === "pos" && (
                    <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                </div>
                <p className="text-[10px] text-[#A0AEC0] leading-tight">
                  تمييز الأسماء والأفعال والحروف والصفات
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLocalPrefs({ ...localPrefs, defaultHighlightMode: "none" })}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                  localPrefs.defaultHighlightMode === "none"
                    ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-sm"
                    : "bg-[#0D1117] border-[#2D3748] text-[#CBD5E0] hover:border-[#D4AF37]/50 hover:bg-[#1A202C]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">بدون تمييز</span>
                  {localPrefs.defaultHighlightMode === "none" && (
                    <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                </div>
                <p className="text-[10px] text-[#A0AEC0] leading-tight">
                  عرض النص النقي دون أي تلوين خلفي
                </p>
              </button>
            </div>
          </div>

          {/* 2. Auto Grammar & Spelling Check */}
          <div className="bg-[#0D1117] border border-[#2D3748] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    التدقيق النحوي والإملائي التلقائي أثناء الكتابة
                  </h4>
                  <p className="text-[11px] text-[#A0AEC0]">
                    اكتشاف أخطاء الهمزات، التاء المربوطة، الألف المقصورة، وواو العطف تلقائياً
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() =>
                  setLocalPrefs({ ...localPrefs, autoGrammarCheck: !localPrefs.autoGrammarCheck })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  localPrefs.autoGrammarCheck ? "bg-[#D4AF37]" : "bg-[#2D3748]"
                }`}
                role="switch"
                aria-checked={localPrefs.autoGrammarCheck}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localPrefs.autoGrammarCheck ? "-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. Word Repetition & Frequency Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#D4AF37]" />
              <span>خيارات عد واحتساب تكرار الكلمات:</span>
            </label>

            <div className="space-y-2 bg-[#0D1117] border border-[#2D3748] rounded-xl p-4">
              {/* Ignore Diacritics Toggle */}
              <label className="flex items-center justify-between cursor-pointer py-1 border-b border-[#2D3748]/60">
                <div>
                  <div className="text-xs font-semibold text-white">تجاهل حركات التشكيل عند عد التكرار</div>
                  <div className="text-[10px] text-[#A0AEC0]">
                    اعتبار الكلمة مشكولة وغير مشكولة متطابقتين (مثل: «كَتَبَ» و «كتب»)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.ignoreDiacritics}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, ignoreDiacritics: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#161B22] border-[#2D3748]"
                />
              </label>

              {/* Ignore Stop Words Toggle */}
              <label className="flex items-center justify-between cursor-pointer py-1 border-b border-[#2D3748]/60">
                <div>
                  <div className="text-xs font-semibold text-white">استثناء حروف المعاني والضمائر الشائعة</div>
                  <div className="text-[10px] text-[#A0AEC0]">
                    استبعاد حروف الجر (في، على، من...) وأسماء الإشارة والضمائر من حساب الكلمات المكررة
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.ignoreStopWords}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, ignoreStopWords: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#161B22] border-[#2D3748]"
                />
              </label>

              {/* Minimum Repeat Threshold */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-xs font-semibold text-white">الحد الأدنى لعدد مرات التكرار</div>
                  <div className="text-[10px] text-[#A0AEC0]">
                    الحد الأدنى لظهور الكلمة حتى تُصنف ضمن قائمة الكلمات المكررة
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#161B22] p-1 rounded-lg border border-[#2D3748]">
                  {[2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLocalPrefs({ ...localPrefs, minRepeatThreshold: val })}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                        localPrefs.minRepeatThreshold === val
                          ? "bg-[#D4AF37] text-[#1A202C]"
                          : "text-[#CBD5E0] hover:text-white"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Font Size & Display Typography */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-[#D4AF37]" />
              <span>حجم خط القراءة في محرر النصوص:</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "normal", label: "عادي", size: "text-lg" },
                { key: "large", label: "كبير", size: "text-xl" },
                { key: "huge", label: "فخم وعريض", size: "text-2xl" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setLocalPrefs({ ...localPrefs, fontSize: item.key as UserPreferences["fontSize"] })
                  }
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    localPrefs.fontSize === item.key
                      ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white"
                      : "bg-[#0D1117] border-[#2D3748] text-[#CBD5E0] hover:bg-[#1A202C]"
                  }`}
                >
                  <div className="text-xs font-bold mb-1">{item.label}</div>
                  <div className={`font-serif text-[#D4AF37] ${item.size}`}>
                    العربية
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Audio & Text-to-Speech (TTS) Settings */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#D4AF37]" />
              <span>تفضيلات النطق الصوتي الفصيح (TTS):</span>
            </label>

            <div className="bg-[#0D1117] border border-[#2D3748] rounded-xl p-4 space-y-3">
              {/* Auto play on inspect */}
              <label className="flex items-center justify-between cursor-pointer border-b border-[#2D3748]/60 pb-2.5">
                <div>
                  <div className="text-xs font-semibold text-white">نطق المفردة تلقائياً عند فحصها</div>
                  <div className="text-[10px] text-[#A0AEC0]">
                    تشغيل نطق الكلمة فصيحاً فور فتح نافذة فحص المفردة أو الإعراب
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.autoPlayTtsOnInspect}
                  onChange={(e) =>
                    setLocalPrefs({ ...localPrefs, autoPlayTtsOnInspect: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#161B22] border-[#2D3748]"
                />
              </label>

              {/* Speech rate */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-xs font-semibold text-white">سرعة القراءة الصوتية الافتراضية</div>
                  <div className="text-[10px] text-[#A0AEC0]">
                    السرعة المناسبة لنطق الحركات ومخارج الحروف الفصيحة
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#161B22] p-1 rounded-lg border border-[#2D3748]">
                  {[
                    { rate: 0.8, label: "0.8x هادئ" },
                    { rate: 1.0, label: "1.0x طبيعي" },
                    { rate: 1.2, label: "1.2x سريع" },
                  ].map((s) => (
                    <button
                      key={s.rate}
                      type="button"
                      onClick={() => setLocalPrefs({ ...localPrefs, speechRate: s.rate })}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                        localPrefs.speechRate === s.rate
                          ? "bg-[#D4AF37] text-[#1A202C]"
                          : "text-[#CBD5E0] hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#1A202C] border-t border-[#2D3748] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[#A0AEC0] hover:text-red-400 flex items-center gap-1.5 transition-colors"
            title="إعادة التفضيلات إلى الوضع الافتراضي للبرنامج"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الإعدادات الافتراضية</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#CBD5E0] hover:text-white bg-[#161B22] hover:bg-[#2D3748] rounded-xl border border-[#2D3748] transition-colors"
            >
              إلغاء
            </button>

            <button
              id="btn-save-preferences"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-[#1A202C] bg-[#D4AF37] hover:bg-[#e0bb3c] rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                  <span>تم الحفظ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التفضيلات (localStorage)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
