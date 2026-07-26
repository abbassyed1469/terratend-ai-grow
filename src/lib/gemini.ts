export interface AdviceResult {
  bullets: [string, string, string];
  source: "live" | "offline";
}

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

export async function getCropAdvice(crop: string, soil: string): Promise<AdviceResult> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const fallback: AdviceResult = { bullets: ruleAdvice(crop, soil), source: "offline" };
  if (!key) return fallback;

  const prompt = `You are an expert agronomist. For the crop "${crop}" grown in ${soil} soil, respond with EXACTLY 3 concise bullet points (each 1-2 sentences), covering in order:
1. Irrigation strategy
2. Fertilizer / nutrient recommendation
3. Disease & pest prevention
Return ONLY the three bullets, each starting with "- ". No preamble.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );
    if (!res.ok) return fallback;
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const bullets = text
      .split("\n")
      .map((l) => l.replace(/^[-*•\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
    if (bullets.length < 3) return fallback;
    return { bullets: [bullets[0], bullets[1], bullets[2]], source: "live" };
  } catch {
    return fallback;
  }
}
