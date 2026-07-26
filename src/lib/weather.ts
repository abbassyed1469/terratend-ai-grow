export interface WeatherNow {
  location: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  rain24h: number;
  rainChance: number;
  wind: number;
  humidity: number;
  icon: string;
  code: number;
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

// WMO weather code → { label, icon }
const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Heavy showers", icon: "🌧️" },
  82: { label: "Violent showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { label: "Severe thunderstorm", icon: "⛈️" },
};

function wmo(code: number) {
  return WMO[code] ?? { label: "Fair", icon: "🌤️" };
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function fetchWeather(
  location: string
): Promise<{ now: WeatherNow; week: WeatherDay[]; source: "live" | "offline"; error?: string }> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    const geo = await geoRes.json();
    const g = geo?.results?.[0];
    if (!g) throw new Error("Location not found");

    const { latitude: lat, longitude: lon, name, admin1, country } = g;

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
      `&hourly=precipitation,precipitation_probability` +
      `&timezone=auto&forecast_days=7&wind_speed_unit=kmh`;
    const wxRes = await fetch(url);
    const wx = await wxRes.json();
    if (!wx?.current || !wx?.daily) throw new Error("Weather unavailable");

    // Next 24h aggregates
    const hourly = wx.hourly || {};
    const rain24h = Number(
      ((hourly.precipitation || []).slice(0, 24).reduce((a: number, b: number) => a + (b || 0), 0)).toFixed(1)
    );
    const rainChance = Math.max(
      0,
      ...(hourly.precipitation_probability || []).slice(0, 24).map((n: number) => n || 0)
    );

    const cur = wx.current;
    const curW = wmo(cur.weather_code);
    const todayMax = Math.round(wx.daily.temperature_2m_max?.[0] ?? cur.temperature_2m);
    const todayMin = Math.round(wx.daily.temperature_2m_min?.[0] ?? cur.temperature_2m);

    const week: WeatherDay[] = (wx.daily.time as string[]).slice(0, 7).map((t, i) => {
      const d = new Date(t);
      const rm = Number((wx.daily.precipitation_sum?.[i] ?? 0).toFixed(1));
      const rc = Math.round(wx.daily.precipitation_probability_max?.[i] ?? 0);
      return {
        day: DAYS[d.getDay()],
        icon: wmo(wx.daily.weather_code?.[i] ?? 0).icon,
        action: pickAction(rm, rc),
        rainMm: rm,
        rainChance: rc,
        temp: Math.round(wx.daily.temperature_2m_max?.[i] ?? 0),
      };
    });

    const locName = [name, admin1, country].filter(Boolean).join(", ");

    return {
      now: {
        location: locName,
        temp: Math.round(cur.temperature_2m),
        condition: curW.label,
        high: todayMax,
        low: todayMin,
        rain24h,
        rainChance,
        wind: Math.round(cur.wind_speed_10m),
        humidity: Math.round(cur.relative_humidity_2m ?? 0),
        icon: curW.icon,
        code: cur.weather_code ?? 0,
      },
      week,
      source: "live",
    };
  } catch (e: any) {
    return {
      now: {
        location,
        temp: 0,
        condition: "Unavailable",
        high: 0,
        low: 0,
        rain24h: 0,
        rainChance: 0,
        wind: 0,
        humidity: 0,
        icon: "🌫️",
      },
      week: [],
      source: "offline",
      error: e?.message || "Could not fetch weather",
    };
  }
}

export function todayIrrigation(now: WeatherNow): { title: string; reason: string } {
  if (now.rainChance >= 70 || now.rain24h >= 5) {
    return {
      title: "🚫 Skip watering today",
      reason: `Heavy rain is expected (${now.rainChance}% chance, ~${now.rain24h}mm in 24h). Let nature do the work.`,
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
    reason: `Low rain chance (${now.rainChance}%) with temperatures near ${now.temp}°C. A deep watering will help roots.`,
  };
}
