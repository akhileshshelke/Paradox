import clsx from "clsx";
import type { Recommendation } from "../lib/types";

const ACTION_META: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  traffic:  { icon: "🚘", color: "text-amber-700", bg: "bg-amber-50", label: "Traffic" },
  industry: { icon: "🏭", color: "text-slate-700", bg: "bg-slate-100", label: "Industry" },
  health:   { icon: "❤️", color: "text-rose-700",  bg: "bg-rose-50", label: "Health" },
  school:   { icon: "🏫", color: "text-sky-700",   bg: "bg-sky-50", label: "School" },
  advisory: { icon: "📢", color: "text-emerald-700", bg: "bg-emerald-50", label: "Advisory" },
};

interface Props {
  recommendations: Recommendation[];
  filterStationId?: string | null;
}

export function RecommendationPanel({ recommendations, filterStationId }: Props) {
  const filtered = filterStationId
    ? recommendations.filter((r) => !r.station_id || r.station_id === filterStationId)
    : recommendations;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-sm border border-sky-100 flex flex-col font-sans h-full">
      <div className="flex items-center justify-between mb-4 border-b border-sky-100 pb-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Action Directives
        </div>
        <span className="chip text-sky-700 bg-sky-50 border-sky-200">{filtered.length} ACTIVE</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-slate-400 mt-3 flex-1 flex items-center justify-center font-semibold">
          No active directives for this node.
        </div>
      ) : (
        <ul className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
          {filtered.map((r) => {
            const meta = ACTION_META[r.action_type] || ACTION_META.advisory;
            const urgencyClasses =
              r.urgency >= 8
                ? "text-rose-700 bg-rose-100 border-rose-200"
                : r.urgency >= 5
                ? "text-amber-700 bg-amber-100 border-amber-200"
                : "text-slate-500 border-slate-200 bg-slate-50";
            return (
              <li
                key={r.id}
                className="rounded-lg p-3 border border-slate-200 bg-white relative shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className={clsx("text-xs font-bold uppercase flex items-center gap-2", meta.color)}>
                    <span className={clsx("w-6 h-6 rounded-md flex items-center justify-center", meta.bg)}>{meta.icon}</span>
                    {meta.label}
                  </span>
                  <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border", urgencyClasses)}>
                    PRTY {r.urgency.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm mt-3 font-bold text-slate-800 leading-tight">{r.title}</div>
                <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.detail}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
