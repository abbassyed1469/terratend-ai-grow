type Kind =
  | "clear" | "mainly-clear" | "partly-cloudy" | "cloudy"
  | "fog" | "drizzle" | "rain" | "heavy-rain"
  | "snow" | "thunder";

export function wmoKind(code: number): Kind {
  if (code === 0) return "clear";
  if (code === 1) return "mainly-clear";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 80, 81].includes(code)) return "rain";
  if ([65, 82].includes(code)) return "heavy-rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "thunder";
  return "mainly-clear";
}

export function WeatherIcon({ kind, size = 96, animated = false }: { kind: Kind; size?: number; animated?: boolean }) {
  const s = { width: size, height: size };
  const sunGrad = (
    <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FFE9A8" />
      <stop offset="60%" stopColor="#FFC24C" />
      <stop offset="100%" stopColor="#E88A22" />
    </radialGradient>
  );
  const cloudGrad = (
    <linearGradient id="cloudG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor="#D9DEE3" />
    </linearGradient>
  );
  const darkCloudGrad = (
    <linearGradient id="darkCloudG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8A94A0" />
      <stop offset="100%" stopColor="#5A6472" />
    </linearGradient>
  );

  const Sun = ({ cx = 50, cy = 50, r = 18 }: { cx?: number; cy?: number; r?: number }) => (
    <g className={animated ? "wx-spin" : ""} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {[...Array(8)].map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = cx + Math.cos(a) * (r + 6);
        const y1 = cy + Math.sin(a) * (r + 6);
        const x2 = cx + Math.cos(a) * (r + 14);
        const y2 = cy + Math.sin(a) * (r + 14);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F4B84A" strokeWidth="3" strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r={r} fill="url(#sunG)" />
    </g>
  );

  const Cloud = ({ x = 20, y = 45, scale = 1, fill = "url(#cloudG)" }: { x?: number; y?: number; scale?: number; fill?: string }) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="18" cy="22" rx="16" ry="14" fill={fill} />
      <ellipse cx="36" cy="16" rx="18" ry="16" fill={fill} />
      <ellipse cx="55" cy="24" rx="14" ry="12" fill={fill} />
      <rect x="14" y="24" width="46" height="14" rx="7" fill={fill} />
    </g>
  );

  const Drop = ({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) => (
    <path
      d={`M${x} ${y} q -3 5 0 8 q 3 -3 0 -8 z`}
      fill="#5FB7E6"
      className={animated ? "wx-drop" : ""}
      style={{ animationDelay: `${delay}s` }}
    />
  );

  const Bolt = ({ x, y }: { x: number; y: number }) => (
    <path d={`M${x} ${y} l -6 12 h 5 l -4 12 l 12 -16 h -6 l 5 -8 z`} fill="#F4B84A" stroke="#B8801A" strokeWidth="0.8" strokeLinejoin="round" />
  );

  return (
    <svg {...s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>{sunGrad}{cloudGrad}{darkCloudGrad}</defs>

      {kind === "clear" && <Sun cx={50} cy={50} r={22} />}

      {kind === "mainly-clear" && (
        <>
          <Sun cx={38} cy={40} r={18} />
          <Cloud x={30} y={48} scale={0.7} />
        </>
      )}

      {kind === "partly-cloudy" && (
        <>
          <Sun cx={32} cy={34} r={15} />
          <Cloud x={24} y={44} scale={0.95} />
        </>
      )}

      {kind === "cloudy" && (
        <>
          <Cloud x={10} y={40} scale={0.75} fill="#E5E7EB" />
          <Cloud x={22} y={30} scale={1.05} />
        </>
      )}

      {kind === "fog" && (
        <>
          <Cloud x={22} y={28} scale={0.95} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={18} y1={68 + i * 8} x2={82} y2={68 + i * 8} stroke="#B7BFC8" strokeWidth="3" strokeLinecap="round" opacity={0.8 - i * 0.2} />
          ))}
        </>
      )}

      {(kind === "drizzle" || kind === "rain" || kind === "heavy-rain") && (
        <>
          <Cloud x={22} y={22} scale={1.05} fill={kind === "heavy-rain" ? "url(#darkCloudG)" : "url(#cloudG)"} />
          {(kind === "drizzle" ? [30, 50, 70] : kind === "rain" ? [28, 42, 56, 70] : [24, 38, 52, 66, 80]).map((x, i) => (
            <Drop key={i} x={x} y={68} delay={i * 0.15} />
          ))}
        </>
      )}

      {kind === "snow" && (
        <>
          <Cloud x={22} y={22} scale={1.05} />
          {[28, 44, 60, 76].map((x, i) => (
            <text key={i} x={x} y={80} fontSize="12" fill="#9CC5DA" className={animated ? "wx-drop" : ""} style={{ animationDelay: `${i * 0.2}s` }}>❄</text>
          ))}
        </>
      )}

      {kind === "thunder" && (
        <>
          <Cloud x={22} y={20} scale={1.05} fill="url(#darkCloudG)" />
          <Bolt x={44} y={62} />
          <Drop x={32} y={72} delay={0} />
          <Drop x={68} y={72} delay={0.2} />
        </>
      )}
    </svg>
  );
}
