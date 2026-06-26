const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });

  const otp = generateOTP();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email.toLowerCase(), { otp, expiry });

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SoloCreator.AI <noreply@solocreator-ai.vercel.app>',
        to: [email],
        subject: 'Your SoloCreator.AI Login Code',
        html: `
          <div style="font-family:'Helvetica Neue',sans-serif;max-width:480px;margin:0 auto;background:#07070E;color:#F0F0FF;padding:40px;border-radius:16px">
            <h2 style="font-size:24px;font-weight:800;margin:0 0 8px;background:linear-gradient(135deg,#7C3AED,#DB2777);-webkit-background-clip:text;-webkit-text-fill-color:transparent">SoloCreator.AI</h2>
            <p style="color:#8B8A9B;margin:0 0 32px">Your personal content studio</p>
            <p style="color:#F0F0FF;margin:0 0 16px;font-size:15px">Here's your login code:</p>
            <div style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.4);border-radius:12px;padding:20px;text-align:center;margin:0 0 24px">
              <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#C4B5FD">${otp}</span>
            </div>
            <p style="color:#55546A;font-size:13px;margin:0">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0">
            <p style="color:#55546A;font-size:12px;margin:0">© 2025 Yashasvi Dhule · SoloCreator.AI. All rights reserved.</p>
          </div>
        `
      })
    });

    if (!emailRes.ok) {
      const err = await emailRes.json().catch(() => ({}));
      throw new Error(err?.message || 'Email send failed');
    }

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    // If email fails, still return success but log it (for dev: return otp)
    console.error('Email error:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(200).json({ success: true, dev_otp: otp });
    }
    return res.status(500).json({ error: 'Failed to send email. Check RESEND_API_KEY.' });
  }
}
