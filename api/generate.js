export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { platform, niche, contentType, tone, context } = req.body;
  if (!platform || !niche || !contentType || !tone)
    return res.status(400).json({ error: 'Missing fields' });

  const cx = context ? `\n\nAdditional context: ${context}` : '';
  const prompts = {
    '3 Caption Variants': `Write 3 distinctly different ${platform} captions for a ${niche} creator. Tone: ${tone}.\n\nEach caption must have:\n- A scroll-stopping first line (the hook)\n- Strategic emoji placement\n- A CTA or engagement question at the end\n\nCaption 1 – Story-driven\nCaption 2 – List or tips format\nCaption 3 – Bold opinion\n\nAfter each caption add: ✦ Best for: [when to use it]${cx}`,
    'Video Script': `Write a complete short-form video script for ${platform} in the ${niche} niche. Tone: ${tone}.\n\nHOOK (0–3 sec): One scroll-stopping line.\nSETUP (3–10 sec): Context or relatable problem.\nCORE VALUE (10–45 sec): 3 punchy points with [VISUAL DIRECTION] notes.\nCTA (last 5 sec): One strong action.\n\nKeep sentences short and natural to speak aloud.${cx}`,
    'Hashtag Strategy': `Build a complete hashtag strategy for a ${niche} post on ${platform}. Tone: ${tone}.\n\nGROUP 1 – Niche-specific (10 tags)\nGROUP 2 – Community hashtags (10 tags)\nGROUP 3 – Broad reach (5 tags)\nGROUP 4 – Trending now (5 tags)\n\nAfter the lists: optimal count, where to place them, one pro tip.${cx}`,
    '7-Day Content Calendar': `Create a 7-day content calendar for a ${niche} creator on ${platform}. Tone: ${tone}.\n\nFor each day:\n📅 Day + best posting time\n📱 Format\n🎯 Specific topic\n🪝 Hook line\n💬 CTA\n\nEnd with one weekly strategy tip.${cx}`,
    '5 Hook Ideas': `Generate 5 scroll-stopping hooks for a ${niche} creator on ${platform}. Tone: ${tone}.\n\nHOOK: [line]\nTYPE: [Curiosity/Controversy/Relatability/Fear/Aspiration]\nWHY IT WORKS: one sentence\nBEST FORMAT: [Reel/Carousel/Static]${cx}`,
    'Profile Bio': `Write 3 optimized ${platform} bio versions for a ${niche} creator. Tone: ${tone}.\n\nBIO A – Authority\nBIO B – Personality\nBIO C – Niche-specific\n\nEach: clear CTA, platform formatting, character count.${cx}`,
    'CTA Pack': `Generate 5 high-converting CTAs for a ${niche} creator on ${platform}. Tone: ${tone}.\n\nCTA 1 – Urgency\nCTA 2 – Question\nCTA 3 – Community\nCTA 4 – Value (saves/shares)\nCTA 5 – Story (DMs)\n\nFor each: text + placement + metric it optimizes.${cx}`,
    '10 Video Ideas': `Generate 10 video ideas for a ${niche} creator on ${platform}. Tone: ${tone}.\n\n💡 Title/Hook\n📈 Why it performs\n🎬 Best format\n⚡ Effort: Easy/Medium/High\n🔍 Searchability: Low/Medium/High${cx}`
  };

  const userPrompt = prompts[contentType] || prompts['3 Caption Variants'];

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.8 }
        })
      }
    );
    if (!geminiRes.ok) {
      const e = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({ error: e?.error?.message || 'Gemini API error' });
    }
    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return res.status(500).json({ error: 'No content returned' });
    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
