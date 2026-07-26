import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Search, Loader2, Sparkles, Leaf, Wind, CloudRain, Droplets, ThermometerSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWeather, todayIrrigation, type WeatherNow, type WeatherDay } from "@/lib/weather";
import { getCropAdviceFn } from "@/lib/advice.functions";
import { isValidCrop } from "@/lib/crops";

type AdviceResult = { bullets: [string, string, string]; source: "live" | "offline" };


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TerraTend — Smart irrigation for small farms" },
      { name: "description", content: "Live weather, daily watering guidance, and an AI crop advisor for small farms." },
      { property: "og:title", content: "TerraTend — Smart irrigation for small farms" },
      { property: "og:description", content: "Live weather, daily watering guidance, and an AI crop advisor for small farms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const SOILS = ["Sandy", "Loamy", "Clay", "Silt", "Peat"] as const;

function Dashboard() {
  const [locationInput, setLocationInput] = useState("Lahore");
  const [pendingLocation, setPendingLocation] = useState("Lahore");
  const [now, setNow] = useState<WeatherNow | null>(null);
  const [week, setWeek] = useState<WeatherDay[]>([]);
  const [wxSource, setWxSource] = useState<"live" | "offline">("offline");
  const [wxLoading, setWxLoading] = useState(true);
  const [wxError, setWxError] = useState<string | null>(null);

  const [crop, setCrop] = useState("");
  const [soil, setSoil] = useState<string>("Loamy");
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);

  const getAdvice = useServerFn(getCropAdviceFn);

  useEffect(() => {
    let alive = true;
    setWxLoading(true);
    setWxError(null);
    fetchWeather(pendingLocation).then((r) => {
      if (!alive) return;
      setNow(r.now);
      setWeek(r.week);
      setWxSource(r.source);
      setWxError(r.error ?? null);
      setWxLoading(false);
    });
    return () => { alive = false; };
  }, [pendingLocation]);

  const handleUpdate = () => {
    const v = locationInput.trim();
    if (v) setPendingLocation(v);
  };

  const handleAdvice = async () => {
    setCropError(null);
    if (!isValidCrop(crop)) {
      setCropError("Please enter a valid crop name.");
      return;
    }
    setAdviceLoading(true);
    setAdvice(null);
    try {
      const r = await getAdvice({ data: { crop: crop.trim(), soil } });
      setAdvice(r as AdviceResult);
    } catch {
      setCropError("Could not fetch advice. Please try again.");
    } finally {
      setAdviceLoading(false);
    }
  };

  const irrigation = now && !wxError ? todayIrrigation(now) : null;


  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header */}
        <header className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              🌱 Smart irrigation for small farms
            </span>
            <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              TerraTend
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Live weather, daily watering guidance, and an AI advisor — built to help you grow more with less water.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 rounded-full bg-card p-2 shadow-sm ring-1 ring-border lg:w-auto">
            <MapPin className="ml-2 h-4 w-4 shrink-0 text-primary" />
            <Input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              placeholder="City, region, country"
              className="h-9 min-w-0 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 lg:w-64"
            />
            <Button onClick={handleUpdate} className="h-9 rounded-full px-5" size="sm">
              <Search className="mr-1 h-3.5 w-3.5" />
              Update
            </Button>
          </div>
        </header>

        {/* Main grid */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Weather */}
          <div className="rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border lg:col-span-3">
            {wxLoading || !now ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading weather…
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{now.location}</span>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
                    {wxSource === "live" ? "Live weather" : "Offline demo"}
                  </span>
                </div>
                <div className="mt-6 flex items-center gap-6">
                  <div className="text-7xl leading-none">{now.icon}</div>
                  <div>
                    <div className="font-serif text-6xl font-semibold text-foreground">
                      {now.temp}°
                    </div>
                    <div className="mt-1 text-lg capitalize text-muted-foreground">{now.condition}</div>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatTile icon={<ThermometerSun className="h-4 w-4" />} label="High / Low" value={`${now.high}° / ${now.low}°`} />
                  <StatTile icon={<CloudRain className="h-4 w-4" />} label="Rain 24h" value={`${now.rain24h} mm`} />
                  <StatTile icon={<Droplets className="h-4 w-4" />} label="Rain chance" value={`${now.rainChance}%`} />
                  <StatTile icon={<Wind className="h-4 w-4" />} label="Wind" value={`${now.wind} km/h`} />
                </div>
              </>
            )}
          </div>

          {/* Irrigation + 7-day */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-3xl bg-secondary p-7 shadow-sm ring-1 ring-border">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                Today's irrigation
              </div>
              {irrigation ? (
                <>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-foreground">
                    {irrigation.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {irrigation.reason}
                  </p>
                </>
              ) : (
                <div className="mt-4 h-16 animate-pulse rounded-lg bg-background/50" />
              )}
            </div>

            <div className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                7-day watering outlook
              </div>
              <div className="mt-4 divide-y divide-border">
                {week.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
                )}
                {week.map((d, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 py-2.5 text-sm">
                    <span className="text-lg">{d.icon}</span>
                    <span className="font-medium text-foreground">{d.day}</span>
                    <ActionBadge action={d.action} />
                    <span className="w-14 text-right tabular-nums text-muted-foreground">{d.rainMm}mm</span>
                    <span className="w-12 text-right tabular-nums text-muted-foreground">{d.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Advisor */}
        <section className="mt-6 rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-2xl font-semibold text-foreground">AI Crop & Soil Advisor</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Get tailored irrigation, nutrient and pest guidance for your field.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto]">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Crop name</label>
              <Input
                value={crop}
                onChange={(e) => { setCrop(e.target.value); if (cropError) setCropError(null); }}
                placeholder="e.g. Wheat, Tomato, Rice"
                className="h-11 rounded-xl bg-secondary/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Soil type</label>
              <Select value={soil} onValueChange={setSoil}>
                <SelectTrigger className="h-11 rounded-xl bg-secondary/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOILS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdvice} disabled={adviceLoading || !crop.trim()} className="h-11 w-full rounded-xl px-6 sm:w-auto">
                {adviceLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking…</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Get AI Advice</>
                )}
              </Button>
            </div>
          </div>

          {cropError && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
              ⚠️ {cropError}
            </div>
          )}

          {advice && (
            <div className="mt-6 rounded-2xl bg-secondary/60 p-6 ring-1 ring-border">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-serif text-lg font-semibold text-foreground">
                  Recommendation for {crop} · {soil} soil
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                  advice.source === "live" ? "bg-primary text-primary-foreground" : "bg-tan text-earth"
                }`}>
                  {advice.source === "live" ? "Live Gemini AI" : "Offline Agricultural Engine"}
                </span>
              </div>
              <ul className="space-y-3">
                {advice.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          TerraTend · Grow more with less water.
        </footer>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-serif text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ActionBadge({ action }: { action: "Water" | "Light" | "Skip" }) {
  const styles = {
    Water: "bg-primary text-primary-foreground",
    Light: "bg-tan text-earth",
    Skip: "bg-secondary text-muted-foreground",
  }[action];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles}`}>
      {action}
    </span>
  );
}
