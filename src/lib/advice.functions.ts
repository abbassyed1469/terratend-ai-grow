import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SOIL_NOTES: Record<string, { drain: string; nutrients: string }> = {
  Sandy: {
    drain: "drains quickly — irrigate in smaller, more frequent doses to prevent leaching",
    nutrients: "low in nutrients; add compost and split nitrogen applications",
  },
  Loamy: {
    drain: "holds water well — deep, less frequent watering works best",
    nutrients: "naturally fertile; a balanced NPK (10-10-10) at key growth stages is usually enough",
  },
  Clay: {
    drain: "retains moisture — water slowly and less often to avoid waterlogging",
    nutrients: "rich but compact; add organic matter and prefer slow-release fertilizers",
  },
  Silt: {
    drain: "retains moisture and nutrients well — moderate, consistent watering",
    nutrients: "fertile; light applications of balanced fertilizer are usually enough",
  },
  Peat: {
    drain: "highly water-retentive and acidic — reduce watering frequency",
    nutrients: "may need lime to balance pH and added potassium and phosphorus",
  },
};

function ruleAdvice(crop: string, soil: string): [string, string, string] {
  const s = SOIL_NOTES[soil] || SOIL_NOTES.Loamy;
  const c = crop.trim();
  return [
    `Irrigation: For ${c} in ${soil.toLowerCase()} soil, ${s.drain}. Aim to keep the top 15–20 cm evenly moist during flowering and fruiting, and let the surface dry slightly between waterings to encourage deep roots.`,
    `Fertilizer & nutrients: ${s.nutrients}. For ${c}, side-dress with nitrogen early in the vegetative stage, then shift toward potassium and phosphorus as it approaches flowering and yield formation.`,
    `Disease & pest prevention: Scout ${c} weekly for common issues (leaf spots, aphids, mildew). Rotate crops each season, keep foliage dry by watering at the base, and use neem-based sprays or approved biocontrols at the first sign of trouble.`,
  ];
}

const Input = z.object({
  crop: z.string().min(1).max(80),
  soil: z.string().min(1).max(40),
});

export const getCropAdviceFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    const fallback = {
      bullets: ruleAdvice(data.crop, data.soil) as [string, string, string],
      source: "offline" as const,
    };
    if (!key) return fallback;

    const prompt = `You are an expert agronomist. For the crop "${data.crop}" grown in ${data.soil} soil, respond with EXACTLY 3 concise bullet points (each 1-2 sentences), covering in order:
1. Irrigation strategy
2. Fertilizer / nutrient recommendation
3. Disease & pest prevention
Return ONLY the three bullets, each starting with "- ". No preamble, no closing remarks.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a concise, practical agronomy assistant." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) return fallback;
      const json = await res.json();
      const text: string = json?.choices?.[0]?.message?.content || "";
      const bullets = text
        .split("\n")
        .map((l) => l.replace(/^[-*•\d.\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
      if (bullets.length < 3) return fallback;
      return {
        bullets: [bullets[0], bullets[1], bullets[2]] as [string, string, string],
        source: "live" as const,
      };
    } catch {
      return fallback;
    }
  });
