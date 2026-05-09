require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Generate endpoint ──
app.post("/api/generate", async (req, res) => {
  const { platform, niche, contentType, tone, context } = req.body;

  if (!platform || !niche || !contentType || !tone) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is not configured. Add GROQ_API_KEY to .env" });
  }

  const userPrompt = buildPrompt(platform, niche, contentType, tone, context);

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return res.status(groqRes.status).json({ error: err?.error?.message || "Groq API error" });
    }

    const data = await groqRes.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    if (!result) return res.status(500).json({ error: "No content returned from AI." });

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ── Prompt builder ──
function buildPrompt(platform, niche, contentType, tone, context) {
  const cx = context ? `\n\nAdditional context: ${context}` : "";

  const prompts = {
    "3 Caption Variants": `Write 3 distinctly different ${platform} captions for a ${niche} creator. Tone: ${tone}.

Each caption must have:
- A scroll-stopping first line (the hook)
- Strategic emoji placement
- A CTA or engagement question at the end
- Be optimized for ${platform}'s format and character limits

Make each genuinely different in structure:
Caption 1 – Story-driven
Caption 2 – List or tips format
Caption 3 – Bold opinion or relatable confession

After each caption add: ✦ Best for: [when to use it]${cx}`,

    "Video Script": `Write a complete short-form video script for ${platform} in the ${niche} niche. Tone: ${tone}.

HOOK (0–3 sec): One line that stops the scroll. Make it specific and surprising.
SETUP (3–10 sec): Context or relatable problem.
CORE VALUE (10–45 sec): Main content with 3 clear punchy points. Include [VISUAL DIRECTION] notes in brackets.
CTA (last 5 sec): One strong specific action for viewers.

Make it natural to speak aloud. Keep sentences short.${cx}`,

    "Hashtag Strategy": `Build a complete hashtag strategy for a ${niche} post on ${platform}. Tone: ${tone}.

GROUP 1 – Niche-specific (10 tags): Highly targeted to ${niche}
GROUP 2 – Community hashtags (10 tags): Active communities in this space
GROUP 3 – Broad reach (5 tags): High-traffic discovery tags
GROUP 4 – Trending now (5 tags): Currently performing well in this niche

After the lists include:
→ Optimal hashtag count for ${platform}
→ Where to place them (caption vs first comment)
→ One pro tip specific to this niche${cx}`,

    "7-Day Content Calendar": `Create a practical 7-day content calendar for a ${niche} creator on ${platform}. Tone: ${tone}.

For each day:
📅 Day + best posting time for ${platform}
📱 Format: Reel/Carousel/Static/Story/etc
🎯 Topic: Specific angle (not generic)
🪝 Hook: Opening line to use
💬 CTA: Specific engagement prompt

Vary the formats and topics. Balance value, entertainment, and promotion. End with one weekly strategy tip.${cx}`,

    "5 Hook Ideas": `Generate 5 powerful scroll-stopping hooks for a ${niche} creator on ${platform}. Tone: ${tone}.

Each hook should work as:
- First line of a caption
- On-screen text for a reel
- Spoken opening line

Format each as:
HOOK: [The hook line]
TYPE: [Curiosity / Controversy / Relatability / Fear / Aspiration]
WHY IT WORKS: One sentence on the psychology behind it
BEST FORMAT: [Reel / Carousel / Static]${cx}`,

    "Profile Bio": `Write 3 optimized ${platform} bio versions for a ${niche} creator. Tone: ${tone}.

BIO A – Authority: Credibility-first, establishes expertise
BIO B – Personality: Voice-forward, makes people want to follow
BIO C – Niche-specific: Ultra-targeted, speaks directly to ideal follower

Each bio must:
- Instantly show who you help and what you offer
- Have a clear CTA (link in bio, DM, etc)
- Use ${platform}-appropriate formatting (line breaks, emoji)
- Respect ${platform}'s character limit

After each bio: character count estimate + who it works best for.${cx}`,

    "CTA Pack": `Generate 5 high-converting call-to-action variations for a ${niche} creator on ${platform}. Tone: ${tone}.

CTA 1 – Urgency-based
CTA 2 – Question (drives comments)
CTA 3 – Community-building
CTA 4 – Value-forward (saves/shares)
CTA 5 – Story-driven (DMs)

For each: the CTA text + where in content to place it + what metric it optimizes for.${cx}`,

    "10 Video Ideas": `Generate 10 specific high-potential video ideas for a ${niche} creator on ${platform}. Tone: ${tone}.

For each idea:
💡 Title / Hook line
📈 Why it performs: algorithm + audience psychology reason
🎬 Best format: Reel / Long-form / Shorts / Carousel
⚡ Effort: Easy / Medium / High
🔍 Searchability: Low / Medium / High

Prioritize ideas that are trending, searchable, and shareable. Mix evergreen and trend-driven.${cx}`,
  };

  return prompts[contentType] || prompts["3 Caption Variants"];
}

app.listen(PORT, () => {
  console.log(`✅ SoloCreator.AI running at http://localhost:${PORT}`);
});
