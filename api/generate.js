export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { platform, niche, contentType, tone, context } = req.body;

  if (!platform || !niche || !contentType || !tone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cx = context ? `\n\nAdditional context: ${context}` : '';

  const prompts = {
    '3 Caption Variants': `Write 3 distinctly different ${platform} captions for a ${niche} creator. Tone: ${tone}.

Each caption must have:
- A scroll-stopping first line (the hook)
- Strategic emoji placement  
- A CTA or engagement question at the end
- Optimized for ${platform}'s format and character limits

Make each genuinely different:
Caption 1 – Story-driven
Caption 2 – List or tips format
Caption 3 – Bold opinion or relatable confession

After each caption add: ✦ Best for: [when to use it]${cx}`,

    'Video Script': `Write a complete short-form video script for ${platform} in the ${niche} niche. Tone: ${tone}.

HOOK (0–3 sec): One line that stops the scroll. Make it specific and surprising.
SETUP (3–10 sec): Context or relatable problem.
CORE VALUE (10–45 sec): Main content with 3 punchy points. Include [VISUAL DIRECTION] notes in brackets.
CTA (last 5 sec): One strong specific action for viewers.

Make it natural to speak aloud. Keep sentences short.${cx}`,

    'Hashtag Strategy': `Build a complete hashtag strategy for a ${niche} post on ${platform}. Tone: ${tone}.

GROUP 1 – Niche-specific (10 tags): Highly targeted to ${niche}
GROUP 2 – Community hashtags (10 tags): Active communities in this space
GROUP 3 – Broad reach (5 tags): High-traffic discovery tags
GROUP 4 – Trending now (5 tags): Currently performing well in this niche

After the lists:
→ Optimal hashtag count for ${platform}
→ Where to place them (caption vs first comment)
→ One pro tip specific to this niche${cx}`,

    '7-Day Content Calendar': `Create a practical 7-day content calendar for a ${niche} creator on ${platform}. Tone: ${tone}.

For each day:
📅 Day + best posting time for ${platform}
📱 Format: Reel/Carousel/Static/Story/etc
🎯 Topic: Specific angle (not generic)
🪝 Hook: Opening line to use
💬 CTA: Specific engagement prompt

Vary formats and topics. Balance value, entertainment, promotion. End with one weekly strategy tip.${cx}`,

    '5 Hook Ideas': `Generate 5 powerful scroll-stopping hooks for a ${niche} creator on ${platform}. Tone: ${tone}.

Each hook works as: first line of caption, on-screen reel text, or spoken opener.

Format each as:
HOOK: [The hook line]
TYPE: [Curiosity / Controversy / Relatability / Fear / Aspiration]
WHY IT WORKS: One sentence on the psychology
BEST FORMAT: [Reel / Carousel / Static]${cx}`,

    'Profile Bio': `Write 3 optimized ${platform} bio versions for a ${niche} creator. Tone: ${tone}.

BIO A – Authority: Credibility-first, establishes expertise
BIO B – Personality: Voice-forward, makes people want to follow
BIO C – Niche-specific: Ultra-targeted, speaks to ideal follower

Each bio must:
- Show who you help and what you offer instantly
- Have a clear CTA (link in bio, DM, etc)
- Use ${platform}-appropriate formatting (line breaks, emoji)
- Respect ${platform}'s character limit

After each: character count estimate + who it works best for.${cx}`,

    'CTA Pack': `Generate 5 high-converting call-to-action variations for a ${niche} creator on ${platform}. Tone: ${tone}.

CTA 1 – Urgency-based
CTA 2 – Question (drives comments)
CTA 3 – Community-building
CTA 4 – Value-forward (saves/shares)
CTA 5 – Story-driven (DMs)

For each: CTA text + where in content to place it + what metric it optimizes.${cx}`,

    '10 Video Ideas': `Generate 10 specific high-potential video ideas for a ${niche} creator on ${platform}. Tone: ${tone}.

For each idea:
💡 Title / Hook line
📈 Why it performs: algorithm + audience psychology
🎬 Best format: Reel / Long-form / Shorts / Carousel
⚡ Effort: Easy / Medium / High
🔍 Searchability: Low / Medium / High

Mix evergreen and trend-driven ideas.${cx}`
  };

  const userPrompt = prompts[contentType] || prompts['3 Caption Variants'];

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      return res.status(groqRes.status).json({ error: errData?.error?.message || 'Groq API error' });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) return res.status(500).json({ error: 'No content returned' });

    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
