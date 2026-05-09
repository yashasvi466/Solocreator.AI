# SoloCreator.AI 🎯

AI-powered content generator for solo creators — captions, scripts, hashtags, calendars & more.

---

## 🚀 Deploy in 5 Minutes (Free)

### Step 1 — Get Free Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `gsk_...`)

### Step 2 — Upload to GitHub
1. Go to [github.com](https://github.com) → New Repository
2. Name it `solocreator-ai` → Create
3. Upload all these files (drag & drop in browser)

### Step 3 — Deploy on Vercel (Free Hosting)
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click "Add New Project" → Import your `solocreator-ai` repo
3. Click "Deploy" (leave all settings as is)

### Step 4 — Add Secret API Key
1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `GROQ_API_KEY`
   - **Value:** `gsk_your_actual_key_here`
3. Click Save → Go to Deployments → Click "Redeploy"

### Done! 🎉
Your site is live at `https://solocreator-ai.vercel.app`
Users never see the API key — it stays safe on the server.

---

## 📁 Project Structure
```
solocreator-ai/
├── public/
│   └── index.html       ← Website frontend
├── api/
│   └── generate.js      ← Backend (hides API key)
├── vercel.json          ← Routing config
├── package.json         ← Project info
└── README.md            ← This file
```

---

## ✨ Features
- 5 platforms: Instagram, TikTok, YouTube, LinkedIn, Twitter/X
- 12 niches: Fashion, Fitness, Food, Travel, Education, Tech, Beauty, Gaming, Finance, Wellness, Business, Parenting
- 8 content types: Captions, Video Script, Hashtag Strategy, Content Calendar, Hooks, Bio, CTA Pack, Video Ideas
- 8 tones to choose from
- Context box for personalized output
- Copy & Download each result
- Session history (last 8 generations)
- Live word count & stats

---

Made by Yashasvi Dhule · 2025
