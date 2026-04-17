import { useLang } from "../contexts/LanguageContext";

interface Props {
  isLight?: boolean;
}

export function InfoSection({ isLight = true }: Props) {
  const { t } = useLang();
  const bg        = isLight ? "#f0f4f8" : "#121418";
  const cardBg    = isLight ? "#ffffff" : "#1b1d24";
  const border    = isLight ? "#e2e8f0" : "#3f4354";
  const textPrim  = isLight ? "#1a202c" : "#f8fafc";
  const textMuted = isLight ? "#718096" : "#94a3b8";

  const features = [
    {
      icon: "🧠",
      color: "#0284c7",
      bg: "#e0f2fe",
      title: "Monitoring → Intelligence",
      desc: "Moving beyond passive maps. AirTwin doesn't just show data; it predicts future pollution, explains causality, and suggests actionable mitigation.",
    },
    {
      icon: "🔮",
      color: "#7c3aed",
      bg: "#ede9fe",
      title: "Predictive, Not Reactive",
      desc: "Shift from Information to Foresight. We answer 'What will happen?' by fusing AQI, Weather, and Traffic data into LSTM fusion models.",
    },
    {
      icon: "🧪",
      color: "#d97706",
      bg: "#fef3c7",
      title: "Simulation Engine",
      desc: "Our BIGGEST edge. Experiment with policies like 'Odd-Even Traffic' or 'Factory Shutdowns' in a risk-free Digital Twin before real-world enforcement.",
    },
    {
      icon: "🎯",
      color: "#16a34a",
      bg: "#dcfce7",
      title: "Source-Level Intelligence",
      desc: "Stop guessing WHO is responsible. We break down pollution into Traffic, Industrial, Dust, and Weather impacts for evidence-based accountability.",
    },
    {
      icon: "🤖",
      color: "#e11d48",
      bg: "#ffe4e6",
      title: "Autonomous Recommendations",
      desc: "Moving from Data to Action. Context-aware system triggers specific directives like 'Apply water sprinklers' or 'School closure' during hazard events.",
    },
    {
      icon: "🌐",
      color: "#0891b2",
      bg: "#cffafe",
      title: "Living Digital Twin",
      desc: "A learning AI model of the city. Continuous adaptation by fusing multiple data streams (AQI + Weather + Traffic) for high-fidelity intelligence.",
    },
  ];

  return (
    <section style={{ background: bg, borderTop: `1px solid ${border}` }} className="py-16 px-6" id="about-section">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: "#0284c710", color: "#0284c7", border: "1px solid #bae6fd" }}
          >
            {t("platformFeatures")}
          </span>
          <h2 className="text-3xl font-black mb-3" style={{ color: textPrim, fontFamily: "'Poppins', sans-serif" }}>
            {t("whyAirtwin")}
          </h2>
          <p className="text-[15px] max-w-xl mx-auto" style={{ color: textMuted }}>
            {t("platformMission")}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 animate-fadeInUp"
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: f.bg }}
              >
                {f.icon}
              </div>
              <h3 className="text-[15px] font-bold mb-2" style={{ color: textPrim }}>
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: textMuted }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* AQI Scale Reference */}
        <div
          className="rounded-2xl p-6 mb-12"
          style={{ background: cardBg, border: `1px solid ${border}` }}
        >
          <h3 className="text-[15px] font-bold mb-4" style={{ color: textPrim }}>
            📏 {t("naqi_scale")}
          </h3>
          <div 
             className="w-full h-3 md:h-4 rounded-full mb-6 shadow-inner"
             style={{ background: "linear-gradient(to right, #00b050, #92d050, #ffcc00, #ff7c00, #ff0000, #7030a0)" }}
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { range: "0–50",    label: t("good"),          color: "#00b050", text: t("minimalImpact") },
              { range: "51–100",  label: t("satisfactory"),  color: "#92d050", text: t("minorBreathing") },
              { range: "101–200", label: t("moderate"),       color: "#ffcc00", text: t("sensitiveGroups") },
              { range: "201–300", label: t("poor"),           color: "#ff7c00", text: t("breathingDiscomfort") },
              { range: "301–400", label: t("veryPoor"),      color: "#ff0000", text: t("seriousRisk") },
              { range: "401–500", label: t("severe"),         color: "#7030a0", text: t("emergencyAlert") },
            ].map((b) => (
              <div
                key={b.label}
                className="flex flex-col text-center p-2 rounded-xl"
                style={{ background: b.color + "08", border: `1px solid ${b.color}20` }}
              >
                <div className="text-[12px] font-black mb-0.5" style={{ color: b.color }}>{b.label}</div>
                <div className="text-[10px] font-bold" style={{ color: textPrim }}>{b.range}</div>
                <div className="text-[10px] mt-1" style={{ color: textMuted }}>{b.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6"
          style={{ borderTop: `1px solid ${border}` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-sky-500/25">
              AQI
            </div>
            <div>
              <div className="text-[15px] font-bold" style={{ color: textPrim }}>
                Air Quality <span className="text-sky-500">Index</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                AI-Powered Environmental Intelligence
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {["API Docs", "Documentation", "Privacy Policy", "Support"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[12px] font-semibold transition-colors hover:text-sky-500"
                style={{ color: textMuted }}
              >
                {link}
              </a>
            ))}
          </div>

          <div className="text-[11px] font-semibold" style={{ color: textMuted }}>
            © 2026 Air Quality Index · Powered by AIDE
          </div>
        </div>
      </div>
    </section>
  );
}
