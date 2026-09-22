export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { platform, niche, contentType, tone, context } = req.body;
  if (!platform || !niche || !contentType || !tone)
    return res.status(400).json({ error: 'Missing fields' });

  const cx = context ? `\n\nExtra info: ${context}` : '';

  const prompts = {
    '3 Caption Variants': `Write 3 different ${platform} captions for a ${niche} creator. Tone: ${tone}. Use simple, everyday words. No complicated language.

Each caption needs:
- A strong first line that makes people stop scrolling
- Emojis used naturally
- A question or call-to-action at the end

Caption 1 – Tell a short story
Caption 2 – Share tips as a list
Caption 3 – Say a bold or honest opinion

After each caption write: ✦ Use this when: [simple reason]${cx}`,

    'Video Script': `Write a short video script for ${platform} about ${niche}. Tone: ${tone}. Use simple words that are easy to say out loud.

HOOK (0-3 sec): One punchy line to grab attention
SETUP (3-10 sec): The problem or relatable moment
MAIN PART (10-45 sec): 3 simple tips or points. Add [what to show on screen] in brackets.
END (last 5 sec): Tell viewers exactly what to do next

Keep each sentence short. Write like you talk.${cx}`,

    'Hashtag Strategy': `Give me a full hashtag plan for a ${niche} post on ${platform}. Tone: ${tone}.

GROUP 1 – Very specific tags (10 tags): Only about ${niche}
GROUP 2 – Community tags (10 tags): Groups and communities in this space
GROUP 3 – Big reach tags (5 tags): Popular discovery tags
GROUP 4 – Trending tags (5 tags): What is hot right now in ${niche}

After the tags also tell me:
→ How many hashtags to use on ${platform}
→ Put them in caption or first comment?
→ One tip that most people miss in ${niche}${cx}`,

    '7-Day Content Calendar': `Make a 7-day posting plan for a ${niche} creator on ${platform}. Tone: ${tone}. Keep it simple and realistic.

For each day write:
📅 Day name + best time to post
📱 Type of post (Reel, Carousel, Story, etc)
🎯 Exact topic — be very specific, not general
🪝 First line to use (the hook)
💬 What to ask in the caption to get comments

Mix different types of posts. End with 1 simple tip for the week.${cx}`,

    '5 Hook Ideas': `Give me 5 strong opening lines for a ${niche} creator on ${platform}. Tone: ${tone}.

These lines should work as:
- First line of a caption
- Text on a reel
- First thing you say in a video

For each hook write:
HOOK: [the line — keep it short and punchy]
TYPE: [Curiosity / Controversy / Relatable / Fear / Dream]
WHY IT WORKS: One simple sentence
BEST FOR: [Reel / Carousel / Static post]${cx}`,

    'Profile Bio': `Write 3 different ${platform} bios for a ${niche} creator. Tone: ${tone}. Use simple words. No fancy language.

BIO 1 – Expert bio: Shows you know your stuff
BIO 2 – Fun bio: Shows your personality
BIO 3 – Target bio: Speaks directly to your ideal follower

Each bio must:
- Say clearly what you do and who you help
- Have a call-to-action (link in bio, DM me, etc)
- Use line breaks and emojis properly for ${platform}
- Show character count at the end${cx}`,

    'CTA Pack': `Write 5 call-to-action lines for a ${niche} creator on ${platform}. Tone: ${tone}. Keep them short and natural.

CTA 1 – Creates urgency
CTA 2 – Asks a question (to get comments)
CTA 3 – Builds community feeling
CTA 4 – Makes people save or share
CTA 5 – Gets people to DM you

For each CTA: the exact line + where to put it + what it helps with${cx}`,

    '10 Video Ideas': `Give me exactly 10 video ideas for a ${niche} creator on ${platform}. Tone: ${tone}.

Write all 10. Do not stop early. Number them 1 to 10.

For each idea write:
💡 VIDEO TITLE: (make it click-worthy)
📈 WHY IT WORKS: Simple reason — 1-2 sentences only
🎬 FORMAT: What type of video (Reel / Long video / Shorts)
⚡ HOW HARD: Easy / Medium / Hard
🔍 HOW SEARCHABLE: Low / Medium / High

Mix some evergreen ideas (always relevant) and some trend ideas. Make them specific to ${niche}, not generic.${cx}`,

    'Meme Captions': `Give me 5 funny and relatable meme caption ideas for a ${niche} creator on ${platform}. Tone: ${tone}.

Each meme idea should:
- Be based on a real pain point or funny moment in ${niche}
- Feel like something real people would share
- Use simple language — the kind friends text each other

For each meme write:
😂 MEME SETUP: The top text (what most people feel/think)
💥 PUNCHLINE: The bottom text (the funny/relatable twist)
📌 MEME FORMAT: Which meme template fits (Drake, Distracted Boyfriend, This is Fine, etc)
🎯 WHY IT WORKS: One line
📱 BEST PLATFORM: Where to post this meme${cx}`
  };

  const userPrompt = prompts[contentType] || prompts['3 Caption Variants'];

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0.85
          }
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
