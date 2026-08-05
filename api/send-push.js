import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
  const VAPID_SUBJECT =
    process.env.VAPID_SUBJECT || 'mailto:admin@official-da-united.vercel.app';
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      error: 'Missing server env',
      need: [
        'VAPID_PUBLIC_KEY',
        'VAPID_PRIVATE_KEY',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
      ]
    });
  }

  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (e) {
    return res.status(500).json({ error: 'Invalid VAPID keys', detail: String(e.message || e) });
  }

  const bodyIn = readBody(req);
  const title = bodyIn.title || 'DA United';
  const body = bodyIn.body || 'New update from DA United';
  const url = bodyIn.url || '/pages/dashboard.html';
  const tag = bodyIn.tag || 'da-united';
  const icon = bodyIn.icon || '/img/logo.png';

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: subs, error } = await sb.from('push_subscriptions').select('*');
  if (error) {
    return res.status(500).json({ error: 'Could not load subscriptions', detail: error.message });
  }

  const list = subs || [];
  if (!list.length) {
    return res.status(200).json({
      ok: true,
      sent: 0,
      removed: 0,
      total: 0,
      message: 'No push_subscriptions yet. User must Allow notifications first.'
    });
  }

  const payload = JSON.stringify({ title, body, url, tag, icon });

  let sent = 0;
  const dead = [];
  const failures = [];

  await Promise.all(
    list.map(async (s) => {
      if (!s.endpoint || !s.p256dh || !s.auth) {
        dead.push(s.endpoint);
        return;
      }
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth }
          },
          payload
        );
        sent += 1;
      } catch (err) {
        const code = err && err.statusCode;
        failures.push({ endpoint: (s.endpoint || '').slice(0, 48), code: code || null });
        if (code === 404 || code === 410) {
          dead.push(s.endpoint);
        }
      }
    })
  );

  if (dead.length) {
    await sb.from('push_subscriptions').delete().in('endpoint', dead.filter(Boolean));
  }

  return res.status(200).json({
    ok: true,
    sent,
    removed: dead.length,
    total: list.length,
    failures: failures.slice(0, 5)
  });
}