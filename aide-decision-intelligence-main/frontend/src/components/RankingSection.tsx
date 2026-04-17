import type { StationReading } from "../lib/types";
import { colorFor, bandFor } from "../lib/aqi";
import { useLang } from "../contexts/LanguageContext";

interface Props {
  stations: StationReading[];
  onSelect: (id: string) => void;
  isLight?: boolean;
}

function AQIBadge({ aqi }: { aqi: number }) {
  const color = colorFor(aqi);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-lg text-[13px] font-black"
      style={{ color, background: color + "18", border: `1px solid ${color}44` }}
    >
      {aqi}
    </span>
  );
}

function MiniBar({ aqi }: { aqi: number }) {
  const pct = Math.min(100, (aqi / 500) * 100);
  const color = colorFor(aqi);
  return (
    <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function RankingSection({ stations, onSelect, isLight = true }: Props & { isLight?: boolean }) {
  const { t } = useLang();
  const top10  = [...stations].sort((a, b) => b.aqi - a.aqi).slice(0, 10);
  const best10 = [...stations].sort((a, b) => a.aqi - b.aqi).slice(0, 10);

  const bg         = isLight ? "#f8fafc" : "#1b1d24";
  const cardBg     = isLight ? "#ffffff" : "#25272e";
  const border     = isLight ? "#e2e8f0" : "#3f4354";
  const headBg     = isLight ? "#f1f5f9" : "#1a1c22";
  const textPrim   = isLight ? "#1a202c" : "#f8fafc";
  const textMuted  = isLight ? "#718096" : "#94a3b8";
  const rowHover   = isLight ? "#f0f9ff" : "#1b1d24";

  return (
    <section id="rankings-section" style={{ background: bg, borderTop: `1px solid ${border}` }} className="py-14 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2"
              style={{ background: "#0284c710", color: "#0284c7", border: "1px solid #bae6fd" }}
            >
              {t("liveRankings")}
            </span>
            <h2 className="text-2xl font-black" style={{ color: textPrim }}>
              {t("liveRankings")}
            </h2>
            <p className="text-sm mt-1" style={{ color: textMuted }}>
              {t("realTimeAcross")} {stations.length} {t("stations")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: textMuted }}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("updatesEvery")}
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Most Polluted */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold" style={{ color: textPrim }}>🔴 {t("mostPolluted")}</h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                {t("criticalZones")}
              </span>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${border}`, background: cardBg, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ background: headBg }}>
                    {[t("rank"), t("cityStation"), "AQI", t("status")].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                        style={{ color: textMuted }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {top10.map((s, i) => {
                    const b = bandFor(s.aqi);
                    return (
                      <tr
                        key={s.station_id}
                        id={`rank-polluted-${i}`}
                        className="transition-colors cursor-pointer group"
                        style={{ borderTop: `1px solid ${border}` }}
                        onClick={() => onSelect(s.station_id)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-4 py-3 text-[13px] font-black" style={{ color: textMuted }}>
                          {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-semibold group-hover:text-sky-500 transition-colors" style={{ color: textPrim }}>
                            {s.station_name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] capitalize" style={{ color: textMuted }}>{s.zone.replace("_"," ")}</span>
                            <MiniBar aqi={s.aqi} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <AQIBadge aqi={s.aqi} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold" style={{ color: b.color }}>{b.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cleanest */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold" style={{ color: textPrim }}>🟢 {t("cleanestCities")}</h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                {t("healthyZones")}
              </span>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${border}`, background: cardBg, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ background: headBg }}>
                    {[t("rank"), t("cityStation"), "AQI", t("status")].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                        style={{ color: textMuted }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {best10.map((s, i) => {
                    const b = bandFor(s.aqi);
                    return (
                      <tr
                        key={s.station_id}
                        id={`rank-clean-${i}`}
                        className="transition-colors cursor-pointer group"
                        style={{ borderTop: `1px solid ${border}` }}
                        onClick={() => onSelect(s.station_id)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-4 py-3 text-[13px] font-black" style={{ color: textMuted }}>
                          {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-semibold group-hover:text-sky-500 transition-colors" style={{ color: textPrim }}>
                            {s.station_name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] capitalize" style={{ color: textMuted }}>{s.zone.replace("_"," ")}</span>
                            <MiniBar aqi={s.aqi} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <AQIBadge aqi={s.aqi} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold" style={{ color: b.color }}>{b.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
