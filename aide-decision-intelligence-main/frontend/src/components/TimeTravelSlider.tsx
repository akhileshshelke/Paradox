interface Props {
  offset: number;
  onChange: (hours: number) => void;
}

export function TimeTravelSlider({ offset, onChange }: Props) {
  const futureTime = new Date(Date.now() + offset * 3600000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="flex items-center gap-4 bg-black p-2 border-b border-[#333] font-mono text-sm">
      <div className="text-cmd-muted whitespace-nowrap min-w-[120px]">
        [PREDICTIVE_HORIZON]
      </div>
      <div className="flex-1 px-4 relative flex items-center">
        <input
          type="range"
          min="0"
          max="12"
          step="1"
          value={offset}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full appearance-none h-1 bg-[#333] outline-none rounded-none disabled:opacity-50"
          style={{
             backgroundImage: "linear-gradient(#00b050, #00b050)",
             backgroundSize: `${(offset / 12) * 100}% 100%`,
             backgroundRepeat: "no-repeat"
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 14px;
            height: 14px;
            background: #fff;
            border: 2px solid #00b050;
            border-radius: 50%;
            cursor: w-resize;
          }
        `}</style>
      </div>
      <div className="text-[#00b050] font-bold min-w-[80px] text-right">
        +{offset}H / {futureTime}
      </div>
    </div>
  );
}
