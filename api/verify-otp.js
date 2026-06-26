const otpStore = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Missing email or code' });

  const stored = otpStore.get(email.toLowerCase());
  if (!stored) return res.status(400).json({ error: 'No code found for this email. Please request a new one.' });
  if (Date.now() > stored.expiry) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'Code has expired. Please request a new one.' });
  }
  if (stored.otp !== code.trim()) return res.status(400).json({ error: 'Invalid code. Please try again.' });

  otpStore.delete(email.toLowerCase());
  return res.status(200).json({ success: true, email });
}
