// Admin API, wajib header x-admin-key = ADMIN_KEY (diset di Cloudflare)
// GET  /api/admin/events
// POST /api/admin/events            (buat / edit event; kirim id untuk edit)
// GET  /api/admin/rsvps?event_id=1
// POST /api/admin/rsvps/:id         { status }
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const STATUSES = ['confirmed', 'waitlist', 'attended', 'cancelled'];

function same(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

// naikkan antrean waiting list sampai slot penuh lagi
async function promote(env, eventId) {
  const ev = await env.DB.prepare('SELECT capacity FROM events WHERE id = ?').bind(eventId).first();
  const used = await env.DB.prepare(`SELECT COUNT(*) AS n FROM rsvps WHERE event_id = ? AND status IN ('confirmed','attended')`).bind(eventId).first();
  const free = ev.capacity - used.n;
  if (free <= 0) return [];
  const { results } = await env.DB.prepare(`SELECT id, name FROM rsvps WHERE event_id = ? AND status = 'waitlist' ORDER BY id LIMIT ?`).bind(eventId, free).all();
  for (const r of results) await env.DB.prepare(`UPDATE rsvps SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(r.id).run();
  return results.map(r => r.name);
}

export async function onRequest({ request, env, params }) {
  if (!env.ADMIN_KEY || !same(request.headers.get('x-admin-key') || '', env.ADMIN_KEY)) return json({ error: 'unauthorized' }, 401);
  const [route, id] = params.path || [];
  const url = new URL(request.url), m = request.method;

  if (route === 'events' && m === 'GET') {
    const { results } = await env.DB.prepare(`SELECT e.*,
      (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.status IN ('confirmed','attended')) AS confirmed_count,
      (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.status = 'waitlist') AS waitlist_count
      FROM events e ORDER BY e.event_date DESC`).all();
    return json({ events: results });
  }

  if (route === 'events' && m === 'POST') {
    const b = await request.json();
    const f = {
      slug: String(b.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, ''),
      title: String(b.title || '').trim(),
      category: b.category || null, event_date: b.event_date || null, event_time: b.event_time || null,
      venue: b.venue || null, description: b.description || null,
      capacity: Math.max(1, parseInt(b.capacity, 10) || 1),
      waitlist_enabled: String(b.waitlist_enabled) === '0' ? 0 : 1,
      status: ['open', 'closed', 'done'].includes(b.status) ? b.status : 'open',
      visibility: b.visibility === 'hidden' ? 'hidden' : 'public'
    };
    if (!f.slug || !f.title) return json({ error: 'judul dan slug wajib diisi' }, 400);
    const vals = Object.values(f);
    try {
      let eventId = parseInt(b.id, 10);
      if (eventId) {
        await env.DB.prepare(`UPDATE events SET ${Object.keys(f).map(k => k + ' = ?').join(', ')} WHERE id = ?`).bind(...vals, eventId).run();
      } else {
        const r = await env.DB.prepare(`INSERT INTO events (${Object.keys(f).join(', ')}) VALUES (${vals.map(() => '?').join(', ')})`).bind(...vals).run();
        eventId = r.meta.last_row_id;
      }
      const promoted = await promote(env, eventId); // kalau kuota ditambah, antrean naik otomatis
      return json({ ok: true, id: eventId, promoted: promoted.length });
    } catch (e) {
      if (String(e).includes('UNIQUE')) return json({ error: 'slug sudah dipakai event lain' }, 409);
      throw e;
    }
  }

  if (route === 'rsvps' && m === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM rsvps WHERE event_id = ? ORDER BY id').bind(url.searchParams.get('event_id')).all();
    return json({ rsvps: results });
  }

  if (route === 'rsvps' && id && m === 'POST') {
    const { status } = await request.json();
    if (!STATUSES.includes(status)) return json({ error: 'status tidak valid' }, 400);
    const row = await env.DB.prepare('SELECT * FROM rsvps WHERE id = ?').bind(id).first();
    if (!row) return json({ error: 'RSVP tidak ditemukan' }, 404);
    await env.DB.prepare('UPDATE rsvps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(status, id).run();
    const promoted = await promote(env, row.event_id);
    return json({ ok: true, promoted: promoted.join(', ') });
  }

  return json({ error: 'not found' }, 404);
}
