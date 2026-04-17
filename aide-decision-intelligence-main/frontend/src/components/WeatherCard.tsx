import { useLang } from "../contexts/LanguageContext";
import type { LangCode, Translations } from "../lib/i18n";
import type { StationReading } from "../lib/types";

interface Props {
  reading: StationReading;
  isLight?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: (e: React.MouseEvent) => void;
}

// ── Weather condition logic ──────────────────────────────────────────────
function getWeather(temp: number, humidity: number, windSpeed: number, t: (k: keyof Translations) => string) {
  if (windSpeed > 35)  return { icon: "🌪️", label: t("stormy"),      bg: "#4a5568", sky: ["#636e82","#4a5568"] };
  if (humidity > 85)  return { icon: "🌧️", label: t("rainy"),       bg: "#4a7ba5", sky: ["#6b93b8","#4a5568"] };
  if (humidity > 70)  return { icon: "🌥️", label: t("cloudy"),      bg: "#607d8b", sky: ["#78909c","#546e7a"] };
  if (temp > 38)      return { icon: "🌡️", label: t("veryHot"),    bg: "#d35400", sky: ["#e67e22","#d35400"] };
  if (temp > 30)      return { icon: "⛅", label: t("sunny"),       bg: "#e67e22", sky: ["#f39c12","#e67e22"] };
  if (temp > 22)      return { icon: "☀️", label: t("clearWeather"),       bg: "#2980b9", sky: ["#3498db","#2980b9"] };
  if (temp > 12)      return { icon: "🌤️", label: t("pleasant"),    bg: "#27ae60", sky: ["#2ecc71","#27ae60"] };
  return               { icon: "🌨️", label: t("cold"),         bg: "#7f8c8d", sky: ["#95a5a6","#7f8c8d"] };
}

// ── AQI-based character mood ─────────────────────────────────────────────
function getCharacter(aqi: number, gender: "boy" | "girl") {
  // Boy/girl SVG as data URIs using emoji/inline SVG compositions
  // Using emoji characters with mood overlay
  if (aqi <= 50)   return { mood: "happy",   clothColor: "#27ae60", faceEmoji: gender === "boy" ? "😊" : "😄" };
  if (aqi <= 100)  return { mood: "neutral",  clothColor: "#f39c12", faceEmoji: gender === "boy" ? "😐" : "🙂" };
  if (aqi <= 200)  return { mood: "worried",  clothColor: "#e67e22", faceEmoji: gender === "boy" ? "😟" : "😟" };
  if (aqi <= 300)  return { mood: "unhappy",  clothColor: "#c0392b", faceEmoji: gender === "boy" ? "😨" : "😨" };
  return            { mood: "sick",     clothColor: "#8e44ad", faceEmoji: gender === "boy" ? "😷" : "😷" };
}

function getHealthMessage(aqi: number, t: (k: keyof Translations) => string): string {
  if (aqi <= 50)   return t("healthAdvicePerfect");
  if (aqi <= 100)  return t("healthAdviceAcceptable");
  if (aqi <= 200)  return t("healthAdviceModerate");
  if (aqi <= 300)  return t("healthAdvicePoor");
  if (aqi <= 400)  return t("healthAdviceVeryPoor");
  return t("healthAdviceHazardous");
}

// ── Indian Boy SVG Character ─────────────────────────────────────────────
function IndianBoyCharacter({ aqi, clothColor }: { aqi: number; clothColor: string }) {
  const isWorried = aqi > 100;
  const isSick    = aqi > 250;

  return (
    <svg viewBox="0 0 120 220" className="w-full h-full" style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.3))" }}>
      {/* Shadow on ground */}
      <ellipse cx="60" cy="218" rx="28" ry="5" fill="rgba(0,0,0,0.2)" />

      {/* Body / Kurta */}
      <rect x="34" y="100" width="52" height="65" rx="8" fill={clothColor} />
      {/* Kurta neck detail */}
      <path d="M52,100 Q60,112 68,100" fill="none" stroke={clothColor} strokeWidth="2" opacity="0.7"/>
      {/* Kurta buttons */}
      <circle cx="60" cy="115" r="2.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="60" cy="125" r="2.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="60" cy="135" r="2.5" fill="rgba(255,255,255,0.5)" />
      {/* Kurta side lines */}
      <line x1="50" y1="105" x2="48" y2="160" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="70" y1="105" x2="72" y2="160" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

      {/* Arms */}
      <rect x="18" y="102" width="18" height="45" rx="9" fill={clothColor} />
      <rect x="84" y="102" width="18" height="45" rx="9" fill={clothColor} />

      {/* Hands */}
      <ellipse cx="27" cy="152" rx="9" ry="7" fill="#f5cba7" />
      <ellipse cx="93" cy="152" rx="9" ry="7" fill="#f5cba7" />
      {/* Fingers on worried hand */}
      {isWorried && (
        <g>
          <circle cx="22" cy="156" r="3" fill="#f5cba7" />
          <circle cx="28" cy="158" r="3" fill="#f5cba7" />
          <circle cx="33" cy="156" r="2.5" fill="#f5cba7" />
        </g>
      )}

      {/* Legs / Pajama */}
      <rect x="38" y="160" width="18" height="52" rx="7" fill="#bdc3c7" />
      <rect x="64" y="160" width="18" height="52" rx="7" fill="#bdc3c7" />
      {/* Feet */}
      <ellipse cx="47" cy="213" rx="11" ry="5" fill="#784212" />
      <ellipse cx="73" cy="213" rx="11" ry="5" fill="#784212" />

      {/* Neck */}
      <rect x="53" y="86" width="14" height="18" rx="5" fill="#f5cba7" />

      {/* Head */}
      <ellipse cx="60" cy="72" rx="26" ry="28" fill="#f5cba7" />
      {/* Hair */}
      <path d="M34,66 Q35,40 60,38 Q85,40 86,66 Q80,52 60,50 Q40,52 34,66Z" fill="#2c1810" />
      {/* Hair strands */}
      <path d="M38,55 Q42,47 50,46" fill="none" stroke="#1a0f0a" strokeWidth="2" />
      <path d="M82,57 Q78,48 70,46" fill="none" stroke="#1a0f0a" strokeWidth="2" />
      {/* Side hair */}
      <ellipse cx="35" cy="70" rx="5" ry="8" fill="#2c1810" />
      <ellipse cx="85" cy="70" rx="5" ry="8" fill="#2c1810" />

      {/* Ears */}
      <ellipse cx="34" cy="74" rx="5" ry="7" fill="#f0b890" />
      <ellipse cx="86" cy="74" rx="5" ry="7" fill="#f0b890" />
      <ellipse cx="34" cy="74" rx="3" ry="5" fill="#e8a07a" />
      <ellipse cx="86" cy="74" rx="3" ry="5" fill="#e8a07a" />

      {/* Eyes */}
      <ellipse cx="50" cy="72" rx="7" ry={isWorried ? "6" : "7"} fill="white" />
      <ellipse cx="70" cy="72" rx="7" ry={isWorried ? "6" : "7"} fill="white" />
      {/* Iris */}
      <circle cx="51" cy="73" r="4" fill="#2c1810" />
      <circle cx="71" cy="73" r="4" fill="#2c1810" />
      <circle cx="52" cy="72" r="1.5" fill="white" />
      <circle cx="72" cy="72" r="1.5" fill="white" />

      {/* Eyebrows — furrowed if worried */}
      {isWorried ? (
        <>
          <path d="M43,63 Q50,59 57,62" fill="none" stroke="#2c1810" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M63,62 Q70,59 77,63" fill="none" stroke="#2c1810" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M43,64 Q50,61 57,63" fill="none" stroke="#2c1810" strokeWidth="2" strokeLinecap="round" />
          <path d="M63,63 Q70,61 77,64" fill="none" stroke="#2c1810" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* Mouth */}
      {isSick ? (
        <path d="M52,88 Q60,84 68,88" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
      ) : isWorried ? (
        <path d="M52,88 Q60,85 68,88" fill="none" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M52,86 Q60,92 68,86" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
      )}

      {/* Nose */}
      <ellipse cx="60" cy="80" rx="3.5" ry="2.5" fill="#e8a07a" />

      {/* Worry sweat drops if bad AQI */}
      {isWorried && (
        <>
          <ellipse cx="37" cy="68" rx="3" ry="5" fill="rgba(52,152,219,0.7)" />
          <ellipse cx="37" cy="63" rx="2" ry="3" fill="rgba(52,152,219,0.5)" />
        </>
      )}

      {/* Mask if very bad */}
      {isSick && (
        <rect x="42" y="79" width="36" height="18" rx="6" fill="rgba(255,255,255,0.9)" stroke="#bdc3c7" strokeWidth="1" />
      )}

      {/* Pollution particles floating */}
      {aqi > 200 && (
        <g opacity="0.6">
          <circle cx="15" cy="50" r="3" fill="#95a5a6">
            <animate attributeName="cy" values="50;42;50" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="105" cy="60" r="2" fill="#7f8c8d">
            <animate attributeName="cy" values="60;52;60" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="25" cy="80" r="2" fill="#95a5a6">
            <animate attributeName="cy" values="80;72;80" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}
    </svg>
  );
}

// ── Indian Girl SVG Character ─────────────────────────────────────────────
function IndianGirlCharacter({ aqi, clothColor }: { aqi: number; clothColor: string }) {
  const isWorried = aqi > 100;
  const isSick    = aqi > 250;

  return (
    <svg viewBox="0 0 120 220" className="w-full h-full" style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.3))" }}>
      {/* Shadow */}
      <ellipse cx="60" cy="218" rx="28" ry="5" fill="rgba(0,0,0,0.2)" />

      {/* Salwar suit / dupatta */}
      <rect x="34" y="100" width="52" height="68" rx="8" fill={clothColor} />
      {/* Suit embroidery pattern */}
      <path d="M40,108 Q60,118 80,108" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
      <circle cx="60" cy="108" r="3" fill="rgba(255,255,255,0.4)" />
      <circle cx="48" cy="110" r="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="72" cy="110" r="2" fill="rgba(255,255,255,0.3)" />
      {/* Dupatta */}
      <path d="M34,105 Q20,115 15,140" fill="none" stroke="#e91e63" strokeWidth="5" opacity="0.8" strokeLinecap="round"/>

      {/* Arms */}
      <rect x="18" y="102" width="17" height="42" rx="8" fill={clothColor} />
      <rect x="85" y="102" width="17" height="42" rx="8" fill={clothColor} />
      {/* Bangles */}
      <rect x="17" y="128" width="19" height="4" rx="2" fill="#f1c40f" />
      <rect x="84" y="128" width="19" height="4" rx="2" fill="#f1c40f" />

      {/* Hands */}
      <ellipse cx="27" cy="148" rx="9" ry="7" fill="#f5cba7" />
      <ellipse cx="93" cy="148" rx="9" ry="7" fill="#f5cba7" />

      {/* Churidar */}
      <rect x="38" y="163" width="16" height="50" rx="6" fill={clothColor} opacity="0.85"/>
      <rect x="66" y="163" width="16" height="50" rx="6" fill={clothColor} opacity="0.85"/>

      {/* Feet / Juttis */}
      <ellipse cx="46" cy="214" rx="11" ry="5" fill="#c0392b" />
      <ellipse cx="74" cy="214" rx="11" ry="5" fill="#c0392b" />
      {/* Jutti embroidery */}
      <circle cx="40" cy="213" r="2" fill="#f1c40f" />
      <circle cx="68" cy="213" r="2" fill="#f1c40f" />

      {/* Neck */}
      <rect x="54" y="87" width="12" height="16" rx="5" fill="#f5cba7" />
      {/* Necklace */}
      <path d="M46,100 Q60,108 74,100" fill="none" stroke="#f1c40f" strokeWidth="2"/>
      <circle cx="60" cy="106" r="3" fill="#f1c40f" />

      {/* Head */}
      <ellipse cx="60" cy="68" rx="25" ry="26" fill="#f5cba7" />

      {/* Hair — long with bun */}
      <ellipse cx="60" cy="52" rx="24" ry="12" fill="#1a0f0a" />
      <ellipse cx="60" cy="44" rx="11" ry="10" fill="#2c1810" />
      <circle cx="60" cy="40" r="7" fill="#1a0f0a" />
      {/* Hair sides */}
      <path d="M36,65 Q30,80 32,110" fill="none" stroke="#1a0f0a" strokeWidth="10" strokeLinecap="round"/>
      <path d="M84,65 Q90,80 88,110" fill="none" stroke="#1a0f0a" strokeWidth="10" strokeLinecap="round"/>
      {/* Parting */}
      <line x1="60" y1="42" x2="60" y2="55" stroke="#784212" strokeWidth="2"/>
      {/* Bindi */}
      <circle cx="60" cy="56" r="3" fill="#e74c3c" />

      {/* Ears */}
      <ellipse cx="35" cy="70" rx="5" ry="7" fill="#f0b890" />
      <ellipse cx="85" cy="70" rx="5" ry="7" fill="#f0b890" />
      {/* Earrings */}
      <circle cx="35" cy="78" r="4" fill="#f1c40f" />
      <circle cx="85" cy="78" r="4" fill="#f1c40f" />
      <path d="M33,82 L37,88 L33,88Z" fill="#f1c40f" />
      <path d="M83,82 L87,88 L83,88Z" fill="#f1c40f" />

      {/* Eyes */}
      <ellipse cx="50" cy="69" rx="7" ry={isWorried ? "5.5" : "6.5"} fill="white" />
      <ellipse cx="70" cy="69" rx="7" ry={isWorried ? "5.5" : "6.5"} fill="white" />
      <circle cx="51" cy="70" r="4" fill="#2c1810" />
      <circle cx="71" cy="70" r="4" fill="#2c1810" />
      <circle cx="52" cy="69" r="1.5" fill="white" />
      <circle cx="72" cy="69" r="1.5" fill="white" />
      {/* Kohl/kajal */}
      <path d="M43,68 Q50,72 57,68" fill="none" stroke="#1a0f0a" strokeWidth="1" />
      <path d="M63,68 Q70,72 77,68" fill="none" stroke="#1a0f0a" strokeWidth="1" />

      {/* Eyebrows */}
      {isWorried ? (
        <>
          <path d="M43,61 Q50,57 57,60" fill="none" stroke="#2c1810" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M63,60 Q70,57 77,61" fill="none" stroke="#2c1810" strokeWidth="2.5" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M43,62 Q50,59 57,61" fill="none" stroke="#2c1810" strokeWidth="2" strokeLinecap="round"/>
          <path d="M63,61 Q70,59 77,62" fill="none" stroke="#2c1810" strokeWidth="2" strokeLinecap="round"/>
        </>
      )}

      {/* Mouth */}
      {isSick ? (
        <path d="M52,84 Q60,80 68,84" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
      ) : isWorried ? (
        <path d="M52,84 Q60,81 68,84" fill="none" stroke="#7f8c8d" strokeWidth="1.8" strokeLinecap="round"/>
      ) : (
        <path d="M52,82 Q60,88 68,82" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
      )}

      {/* Nose */}
      <ellipse cx="60" cy="77" rx="3" ry="2" fill="#e8a07a" />

      {/* Worry sweat */}
      {isWorried && (
        <>
          <ellipse cx="36" cy="65" rx="2.5" ry="4" fill="rgba(52,152,219,0.7)"/>
          <ellipse cx="36" cy="61" rx="1.8" ry="2.5" fill="rgba(52,152,219,0.5)"/>
        </>
      )}

      {/* Mask */}
      {isSick && (
        <rect x="43" y="76" width="34" height="16" rx="6" fill="rgba(255,255,255,0.9)" stroke="#bdc3c7" strokeWidth="1"/>
      )}

      {/* Pollution particles */}
      {aqi > 200 && (
        <g opacity="0.6">
          <circle cx="12" cy="55" r="3" fill="#95a5a6">
            <animate attributeName="cy" values="55;47;55" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="108" cy="65" r="2" fill="#7f8c8d">
            <animate attributeName="cy" values="65;57;65" dur="2.5s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}
    </svg>
  );
}

// ── Main WeatherCard Component ────────────────────────────────────────────
export function WeatherCard({ reading, isLight = true, isMinimized = false, onToggleMinimize }: Props) {
  const { t } = useLang();
  const weather = getWeather(reading.temp, reading.humidity, reading.wind_speed, t);
  const boyChar  = getCharacter(reading.aqi, "boy");
  const girlChar = getCharacter(reading.aqi, "girl");
  const uvIndex  = Math.max(0, Math.round((reading.temp / 40) * 11 * (1 - reading.humidity / 200)));
  const healthMsg = getHealthMessage(reading.aqi, t);

  if (isMinimized) {
    return (
      <div
        id="weather-card-minimized"
        onClick={onToggleMinimize}
        className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:scale-105 transition-all animate-fadeIn"
        style={{
          background: `linear-gradient(135deg, ${weather.sky[0]}, ${weather.sky[1]})`,
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <span className="text-xl">{weather.icon}</span>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-white/70 uppercase">Temp</span>
          <span className="text-[18px] font-black text-white leading-none">{reading.temp.toFixed(0)}°</span>
        </div>
        <button className="ml-1 text-white/60 hover:text-white">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
           </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      id="weather-card-panel"
      className="rounded-2xl overflow-hidden animate-slideInRight relative group"
      style={{
        background: `linear-gradient(160deg, ${weather.sky[0]}cc, ${weather.sky[1]}dd)`,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.10)",
      }}
    >
      {/* Decorative clouds */}
      <div className="absolute top-2 left-14 opacity-30 text-3xl pointer-events-none select-none">☁️</div>
      <div className="absolute top-0 right-6 opacity-20 text-2xl pointer-events-none select-none">☁️</div>

      {/* Characters row */}
      <div className="flex items-end justify-between px-2 pt-2 gap-1" style={{ height: 110 }}>
        {/* Boy — left */}
        <div className="flex-shrink-0" style={{ width: 58, height: 108 }}>
          <IndianBoyCharacter aqi={reading.aqi} clothColor={boyChar.clothColor} />
        </div>

        {/* Center weather info */}
        <div className="flex-1 flex flex-col items-center justify-center pb-2 gap-0.5">
          {/* Weather icon + temp */}
          <div className="flex items-center gap-2">
            <span className="text-3xl">{weather.icon}</span>
            <div>
              <span className="text-3xl font-black text-white leading-none"
                style={{ fontFamily: "'Poppins', sans-serif", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                {reading.temp.toFixed(0)}
              </span>
              <span className="text-lg font-semibold text-white/80">°C</span>
            </div>
          </div>
          <div className="text-[13px] font-bold text-white/90">{weather.label}</div>
          {/* Health message pill */}
          <div
            className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-center max-w-[130px]"
            style={{
              background: "rgba(0,0,0,0.25)",
              color: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {healthMsg}
          </div>
        </div>

        {/* Girl — right */}
        <div className="flex-shrink-0" style={{ width: 58, height: 108 }}>
          <IndianGirlCharacter aqi={reading.aqi} clothColor={girlChar.clothColor} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.2)", margin: "0 12px" }} />

      {/* Stats row */}
      <div className="flex items-center" style={{ padding: "10px 12px" }}>
        {[
          { icon: "💧", label: t("humidity"),   value: `${reading.humidity.toFixed(0)}%` },
          { icon: "🌬️", label: t("windSpeed"), value: `${reading.wind_speed.toFixed(1)} km/h` },
          { icon: "☀️", label: t("uvIndex"),   value: uvIndex.toString() },
        ].map((item, idx, arr) => (
          <div key={item.label} className="flex flex-col items-center flex-1 relative">
            {idx > 0 && (
              <div
                className="absolute left-0 top-1 bottom-1"
                style={{ width: 1, background: "rgba(255,255,255,0.25)" }}
              />
            )}
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] font-semibold text-white/70">{item.label}</span>
            </div>
            <span className="text-[15px] font-black text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Expand/External links button */}
      <button
        className="absolute top-2.5 right-10 w-6 h-6 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
        title="External Link"
      >
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>

      {/* Minimize Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleMinimize?.(e); }}
        className="absolute top-2.5 right-2 a-6 h-6 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
        title="Minimize"
      >
         <span className="text-xs text-white">−</span>
      </button>
    </div>
  );
}
