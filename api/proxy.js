import crypto from 'crypto';

const SALT = process.env.SALT || 'algo_salt_2024';
const HASH = process.env.PASSWORD_HASH || '';

function isValidToken(token) {
  if (!token || !HASH) return false;
  try {
    const expected = HASH.slice(0, 16);
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
  // Token check — dari header atau query param
  const token = req.headers['x-auth-token'] || req.query.token || '';
  if (!isValidToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  const BOT_URL = process.env.BOT_SERVER_URL || 'http://45.32.118.44:8081';
  const path = req.query.path || 'status';
  const url = `${BOT_URL}/api/${path}`;

  try {
    const opts = { method: req.method, headers: { 'Content-Type': 'application/json' } };
    if (req.method !== 'GET' && req.body) opts.body = JSON.stringify(req.body);
    const upstream = await fetch(url, opts);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Bot unreachable', detail: e.message });
  }
}
