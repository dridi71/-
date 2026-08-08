import React, { useState } from "react";
import { useArabicTts } from "../utils/useArabicTts";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings2,
  Gauge,
  Mic,
  Sparkles,
} from "lucide-react";

interface TtsPlayerBarProps {
  textToSpeak: string;
  title?: string;
  compact?: boolean;
  className?: string;
}

export const TtsPlayerBar: React.FC<TtsPlayerBarProps> = ({
  textToSpeak,
  title = "الاستماع للنص بالنطق العربي الفصيح",
  compact = false,
  className = "",
}) => {
  const {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    speechRate,
    setSpeechRate,
    arabicVoices,
    selectedVoice,
    setSelectedVoice,
    isSupported,
  } = useArabicTts();

  const [showSettings, setShowSettings] = useState<boolean>(false);

  if (!isSupported) {
    return (
      <div className="text-xs text-[#A0AEC0] p-2 bg-[#0D1117] rounded-lg border border-[#2D3748]">
        خاصية تحويل النص إلى كلام غير مدعومة في هذا المتصفح.
      </div>
    );
  }

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(textToSpeak);
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            isPlaying && !isPaused
              ? "bg-[#D4AF37] text-[#1A202C] border-[#D4AF37] font-bold shadow-sm animate-pulse"
              : "bg-[#0D1117] text-[#E2E8F0] border-[#2D3748] hover:border-[#D4AF37] hover:text-[#D4AF37]"
          }`}
          title={isPlaying ? (isPaused ? "استئناف" : "إيقاف مؤقت") : "استمع للكلمة/النص"}
        >
          {isPlaying && !isPaused ? (
            <>
              <Pause className="w-3.5 h-3.5 text-[#1A202C]" />
              <span>إيقاف</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>استمع</span>
            </>
          )}
        </button>

        {isPlaying && (
          <button
            onClick={stop}
            className="p-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
            title="إيقاف نهائي"
          >
            <Square className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl bg-[#0D1117] border border-[#2D3748] space-y-2.5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        
        {/* Title & Status */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            isPlaying && !isPaused
              ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 animate-pulse"
              : "bg-[#161B22] text-[#A0AEC0] border-[#2D3748]"
          }`}>
            <Volume2 className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
              <span>{title}</span>
              {isPlaying && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                  {isPaused ? "مُتوقف مؤقتاً" : "جاري القراءة..."}
                </span>
              )}
            </h5>
            <p className="text-[11px] text-[#A0AEC0]">
              {selectedVoice ? `الصوت: ${selectedVoice.name}` : "الصوت العربي التلقائي للمتصفح"}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isPlaying && !isPaused
                ? "bg-amber-500 text-[#1A202C] border-amber-500 shadow-md"
                : isPlaying && isPaused
                ? "bg-[#D4AF37] text-[#1A202C] border-[#D4AF37]"
                : "bg-[#D4AF37] hover:bg-[#c29f31] text-[#1A202C] border-[#D4AF37]"
            }`}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>إيقاف مؤقت</span>
              </>
            ) : isPlaying && isPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>استئناف</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>تشغيل النطق</span>
              </>
            )}
          </button>

          {isPlaying && (
            <button
              onClick={stop}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
              title="إيقاف الكلمة"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showSettings
                ? "bg-[#161B22] text-[#D4AF37] border-[#D4AF37]"
                : "bg-[#161B22] text-[#A0AEC0] border-[#2D3748] hover:text-white"
            }`}
            title="إعدادات الصوت والسرعة"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Settings Panel */}
      {showSettings && (
        <div className="pt-2.5 border-t border-[#2D3748] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
          
          {/* Speed Selector */}
          <div className="space-y-1">
            <label className="text-[#A0AEC0] flex items-center gap-1 font-semibold text-[11px]">
              <Gauge className="w-3 h-3 text-[#D4AF37]" />
              سرعة القراءة: ({speechRate}x)
            </label>
            <div className="flex items-center gap-1">
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSpeechRate(rate)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-all flex-1 ${
                    speechRate === rate
                      ? "bg-[#D4AF37] text-[#1A202C] font-bold border-[#D4AF37]"
                      : "bg-[#161B22] text-[#A0AEC0] border-[#2D3748] hover:text-white"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Arabic Voice Selector */}
          <div className="space-y-1">
            <label className="text-[#A0AEC0] flex items-center gap-1 font-semibold text-[11px]">
              <Mic className="w-3 h-3 text-[#D4AF37]" />
              اختر القارئ (أصوات المتصفح المتاحة):
            </label>
            <select
              value={selectedVoice?.name || ""}
              onChange={(e) => {
                const found = arabicVoices.find((v) => v.name === e.target.value);
                if (found) setSelectedVoice(found);
              }}
              className="w-full bg-[#161B22] border border-[#2D3748] rounded px-2 py-1 text-[#E2E8F0] focus:outline-none focus:border-[#D4AF37] text-[11px]"
            >
              {arabicVoices.length === 0 ? (
                <option value="">الصوت العربي الافتراضي للنظام</option>
              ) : (
                arabicVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              )}
            </select>
          </div>

        </div>
      )}
    </div>
  );
};
