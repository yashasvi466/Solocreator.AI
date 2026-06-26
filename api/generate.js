export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { platform, niche, contentType, tone, context } = req.body;
  if (!platform || !niche || !contentType || !tone) return res.status(400).json({ error: 'Missing required fields' });

  const cx = context ? `\n\nAdditional context: ${context}` : '';
  const prompts = {
    '3 Caption Variants': `Write 3 distinctly different ${platform} captions for a ${niche} creator. Tone: ${tone}.\n\nEach caption must have:\n- A scroll-stopping first line (the hook)\n- Strategic emoji placement\n- A CTA or engagement question at the end\n- Optimized for ${platform}'s format\n\nMake each genuinely different:\nCaption 1 – Story-driven\nCaption 2 – List or tips format\nCaption 3 – Bold opinion or relatable confession\n\nAfter each caption add: ✦ Best for: [when to use it]${cx}`,
    'Video Script': `Write a complete short-form video script for ${platform} in the ${niche} niche. Tone: ${tone}.\n\nHOOK (0–3 sec): One line that stops the scroll.\nSETUP (3–10 sec): Context or relatable problem.\nCORE VALUE (10–45 sec): 3 punchy points with [VISUAL DIRECTION] notes in brackets.\nCTA (last 5 sec): One strong specific action.\n\nKeep sentences short and natural to speak aloud.${cx}`,
    'Hashtag Strategy': `Build a complete hashtag strategy for a ${niche} post on ${platform}. Tone: ${tone}.\n\nGROUP 1 – Niche-specific (10 tags)\nGROUP 2 – Community hashtags (10 tags)\nGROUP 3 – Broad reach (5 tags)\nGROUP 4 – Trending now (5 tags)\n\nAfter the lists:\n→ Optimal hashtag count for ${platform}\n→ Where to place them\n→ One pro tip for this niche${cx}`,
    '7-Day Content Calendar': `Create a practical 7-day content calendar for a ${niche} creator on ${platform}. Tone: ${tone}.\n\nFor each day:\n📅 Day + best posting time\n📱 Format: Reel/Carousel/Static/Story\n🎯 Specific topic angle\n🪝 Hook: Opening line\n💬 CTA: Engagement prompt\n\nEnd with one weekly strategy tip.${cx}`,
    '5 Hook Ideas': `Generate 5 powerful scroll-stopping hooks for a ${niche} creator on ${platform}. Tone: ${tone}.\n\nFormat each as:\nHOOK: [The hook line]\nTYPE: [Curiosity/Controversy/Relatability/Fear/Aspiration]\nWHY IT WORKS: One sentence on the psychology\nBEST FORMAT: [Reel/Carousel/Static]${cx}`,
    'Profile Bio': `Write 3 optimized ${platform} bio versions for a ${niche} creator. Tone: ${tone}.\n\nBIO A – Authority: Credibility-first\nBIO B – Personality: Voice-forward\nBIO C – Niche-specific: Ultra-targeted\n\nEach bio: clear CTA, platform-appropriate formatting, character count.${cx}`,
    'CTA Pack': `Generate 5 high-converting CTAs for a ${niche} creator on ${platform}. Tone: ${tone}.\n\nCTA 1 – Urgency-based\nCTA 2 – Question (drives comments)\nCTA 3 – Community-building\nCTA 4 – Value-forward (saves/shares)\nCTA 5 – Story-driven (DMs)\n\nFor each: CTA text + where to place it + what metric it optimizes.${cx}`,
    '10 Video Ideas': `Generate 10 high-potential video ideas for a ${niche} creator on ${platform}. Tone: ${tone}.\n\nFor each:\n💡 Title / Hook line\n📈 Why it performs\n🎬 Best format\n⚡ Effort: Easy/Medium/High\n🔍 Searchability: Low/Medium/High\n\nMix evergreen and trend-driven ideas.${cx}`
  };

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompts[contentType] || prompts['3 Caption Variants'] }],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    if (!groqRes.ok) {
      const e = await groqRes.json().catch(() => ({}));
      return res.status(groqRes.status).json({ error: e?.error?.message || 'Groq API error' });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ error: 'No content returned' });

    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
