export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const BOT_URL = process.env.BOT_SERVER_URL || 'http://45.32.118.44:8081';
  const path = req.query.path || 'status';
  const url = `${BOT_URL}/api/${path}`;
  try {
    const opts = { method: req.method, headers: {'Content-Type':'application/json'} };
    if (req.method !== 'GET' && req.body) opts.body = JSON.stringify(req.body);
    const upstream = await fetch(url, opts);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch(e) {
    return res.status(502).json({ error: 'Bot unreachable', detail: e.message });
  }
}
