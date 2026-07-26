export interface WeatherNow {
  location: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  rain24h: number;
  rainChance: number;
  wind: number;
  icon: string;
}

export interface WeatherDay {
  day: string;
  icon: string;
  action: "Water" | "Light" | "Skip";
  rainMm: number;
  rainChance: number;
  temp: number;
}

function pickAction(rainMm: number, rainChance: number): "Water" | "Light" | "Skip" {
  if (rainMm >= 5 || rainChance >= 70) return "Skip";
  if (rainMm >= 1 || rainChance >= 40) return "Light";
  return "Water";
}

function conditionIcon(cond: string): string {
  const c = cond.toLowerCase();
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("cloud")) return "⛅";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫️";
  return "☀️";
}

// Deterministic pseudo weather generator so the UI feels alive without a key
function mockWeather(location: string): { now: WeatherNow; week: WeatherDay[] } {
  const seed = Array.from(location).reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (i: number) => {
    const x = Math.sin(seed + i * 13.37) * 10000;
    return x - Math.floor(x);
  };
  const baseTemp = 15 + Math.round(rand(0) * 18);
  const conds = ["Mostly clear", "Partly cloudy", "Light rain", "Cloudy", "Sunny"];
  const cond = conds[Math.floor(rand(1) * conds.length)];
  const rainChance = Math.round(rand(2) * 100);
  const rain24 = Number((rand(3) * 3).toFixed(1));
  const wind = Math.round(5 + rand(4) * 20);

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const today = new Date().getDay();
  const week: WeatherDay[] = Array.from({ length: 7 }).map((_, i) => {
    const r = rand(10 + i);
    const rc = Math.round(r * 100);
    const rm = Number((r * 6).toFixed(1));
    const t = baseTemp + Math.round((rand(20 + i) - 0.5) * 8);
    const c = rc > 60 ? "Rain" : rc > 30 ? "Cloud" : "Clear";
    return {
      day: days[(today + i) % 7],
      icon: conditionIcon(c),
      action: pickAction(rm, rc),
      rainMm: rm,
      rainChance: rc,
      temp: t,
    };
  });

  return {
    now: {
      location,
      temp: baseTemp,
      condition: cond,
      high: baseTemp + 4,
      low: baseTemp - 5,
      rain24h: rain24,
      rainChance,
      wind,
      icon: conditionIcon(cond),
    },
    week,
  };
}

export async function fetchWeather(location: string): Promise<{ now: WeatherNow; week: WeatherDay[]; source: "live" | "offline" }> {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;
  if (!key) {
    return { ...mockWeather(location), source: "offline" };
  }
  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${key}`
    );
    const geo = await geoRes.json();
    if (!geo?.[0]) throw new Error("no geo");
    const { lat, lon, name, country, state } = geo[0];
    const [curRes, foreRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`),
    ]);
    const cur = await curRes.json();
    const fore = await foreRes.json();
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    type DayAgg = { temps: number[]; rain: number; pop: number; cond: string };
    const byDay = new Map<string, DayAgg>();
    for (const item of (fore.list || []) as any[]) {
      const d = new Date(item.dt * 1000);
      const k = days[d.getDay()];
      const e: DayAgg = byDay.get(k) || { temps: [], rain: 0, pop: 0, cond: item.weather?.[0]?.main || "" };
      e.temps.push(Number(item.main.temp));
      e.rain += Number(item.rain?.["3h"] || 0);
      e.pop = Math.max(e.pop, Number(item.pop || 0) * 100);
      byDay.set(k, e);
    }
    const week: WeatherDay[] = Array.from(byDay.entries()).slice(0, 7).map(([day, v]) => {
      const rm = Number(v.rain.toFixed(1));
      const rc = Math.round(v.pop);
      const t = Math.round(v.temps.reduce((a, b) => a + b, 0) / v.temps.length);
      return { day, icon: conditionIcon(v.cond), action: pickAction(rm, rc), rainMm: rm, rainChance: rc, temp: t };
    });
    const locName = [name, state, country].filter(Boolean).join(", ");
    return {
      now: {
        location: locName,
        temp: Math.round(cur.main.temp),
        condition: cur.weather?.[0]?.description || "",
        high: Math.round(cur.main.temp_max),
        low: Math.round(cur.main.temp_min),
        rain24h: Number(((cur.rain?.["1h"] || 0) * 24).toFixed(1)),
        rainChance: week[0]?.rainChance ?? 0,
        wind: Math.round((cur.wind?.speed || 0) * 3.6),
        icon: conditionIcon(cur.weather?.[0]?.main || ""),
      },
      week,
      source: "live",
    };
  } catch {
    return { ...mockWeather(location), source: "offline" };
  }
}

export function todayIrrigation(now: WeatherNow): { title: string; reason: string } {
  if (now.rainChance >= 70 || now.rain24h >= 5) {
    return {
      title: "🚫 Skip watering today",
      reason: `Heavy rain is expected (${now.rainChance}% chance, ~${now.rain24h}mm). Let nature do the work.`,
    };
  }
  if (now.rainChance >= 40 || now.rain24h >= 1) {
    return {
      title: "💧 A light top-up only",
      reason: `Rain is likely (${now.rainChance}% chance, ~${now.rain24h}mm). Water lightly if soil looks dry.`,
    };
  }
  return {
    title: "🌾 Water thoroughly",
    reason: `Low rain chance (${now.rainChance}%) and warm temperatures near ${now.temp}°. A deep watering will help roots.`,
  };
}
