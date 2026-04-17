import clsx from "clsx";
import type { Alert } from "../lib/types";

const SEV_COLOR: Record<Alert["severity"], string> = {
  info: "text-sky-800 border-sky-300 bg-sky-50",
  warning: "text-amber-800 border-amber-400 bg-amber-50",
  critical: "text-rose-800 border-rose-500 bg-rose-100 font-bold shadow-sm",
};

interface Props {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-sm border border-sky-100 flex flex-col font-sans h-full">
      <div className="flex items-center justify-between mb-4 border-b border-sky-100 pb-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Alerts</div>
        <span className="chip text-sky-700 bg-sky-50 border-sky-200">{alerts.length}</span>
      </div>
      {alerts.length === 0 ? (
        <div className="text-sm text-slate-400 mt-3 flex-1 flex items-center justify-center font-semibold">System Nominal.</div>
      ) : (
        <ul className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className={clsx("border-l-4 rounded-r-lg px-3 py-2.5 text-xs flex flex-col gap-1 hover:shadow-sm transition-shadow", SEV_COLOR[a.severity])}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold leading-tight pr-2">{a.message}</span>
                <span className="text-[10px] font-bold opacity-60 whitespace-nowrap pt-0.5">
                  {new Date(a.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
