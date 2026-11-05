// GET /api/events          -> semua event public
// GET /api/events?slug=xx  -> satu event
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const SELECT = `SELECT e.id, e.slug, e.title, e.category, e.event_date, e.event_time, e.venue, e.description,
  e.capacity, e.waitlist_enabled, e.status,
  (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.status IN ('confirmed','attended')) AS confirmed_count,
  (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.status = 'waitlist') AS waitlist_count
  FROM events e WHERE e.visibility = 'public'`;

export async function onRequestGet({ request, env }) {
  const slug = new URL(request.url).searchParams.get('slug');
  if (slug) {
    const event = await env.DB.prepare(SELECT + ' AND e.slug = ?').bind(slug).first();
    return event ? json({ event }) : json({ error: 'event tidak ditemukan' }, 404);
  }
  const { results } = await env.DB.prepare(SELECT + ' ORDER BY e.event_date IS NULL, e.event_date ASC').all();
  return json({ events: results });
}
