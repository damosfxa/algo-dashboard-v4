import crypto from 'crypto';
const SALT = process.env.SALT || 'algo_salt_2024';
const HASH = process.env.PASSWORD_HASH || '';
const rateMap = {};

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  if (!rateMap[ip]) rateMap[ip] = [];
  rateMap[ip] = rateMap[ip].filter(t => now - t < 60000);
  if (rateMap[ip].length >= 10) return res.status(429).json({ error: 'Rate limited' });
  rateMap[ip].push(now);
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'No password' });
  const hash = crypto.createHash('sha256').update(SALT + password).digest('hex');
  try {
    const a = Buffer.from(hash);
    const b = Buffer.from(HASH);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return res.status(200).json({ success: true, token: hash.slice(0,16) });
    }
  } catch(e) {}
  return setTimeout(() => res.status(401).json({ error: 'Invalid' }), 300 + Math.random()*200);
}
