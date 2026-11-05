// POST /api/rsvp        -> daftar RSVP (otomatis masuk waiting list kalau slot penuh)
// GET  /api/rsvp?code=  -> cek status pakai kode tiket
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const clean = (v, max) => String(v ?? '').trim().slice(0, max);
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () => 'JJ-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), b => ALPHA[b % ALPHA.length]).join('');

async function withPosition(env, row) {
  let position = null;
  if (row.status === 'waitlist') {
    const p = await env.DB.prepare(`SELECT COUNT(*) AS n FROM rsvps WHERE event_id = ? AND status = 'waitlist' AND id <= ?`).bind(row.event_id, row.id).first();
    position = p.n;
  }
  return { code: row.code, status: row.status, position, name: row.name, event_title: row.event_title };
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ error: 'data tidak valid' }, 400); }
  if (b.website) return json({ error: 'spam terdeteksi' }, 400); // honeypot

  const name = clean(b.name, 60), handle = clean(b.handle, 40), email = clean(b.email, 120).toLowerCase();
  const phone = clean(b.phone, 20), note = clean(b.note, 300), slug = clean(b.slug, 80);
  if (!name || !handle || !email) return json({ error: 'nama, username, dan email wajib diisi ya' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'format email belum benar' }, 400);

  const ev = await env.DB.prepare(`SELECT * FROM events WHERE slug = ? AND visibility = 'public'`).bind(slug).first();
  if (!ev) return json({ error: 'event tidak ditemukan' }, 404);

  // sudah pernah daftar? kembalikan data yang lama
  const old = await env.DB.prepare(`SELECT r.*, e.title AS event_title FROM rsvps r JOIN events e ON e.id = r.event_id WHERE r.event_id = ? AND r.email = ?`).bind(ev.id, email).first();
  if (old && old.status !== 'cancelled') return json({ ...(await withPosition(env, old)), duplicate: true });
  if (ev.status !== 'open') return json({ error: 'RSVP untuk event ini sudah ditutup' }, 409);

  const used = await env.DB.prepare(`SELECT COUNT(*) AS n FROM rsvps WHERE event_id = ? AND status IN ('confirmed','attended')`).bind(ev.id).first();
  if (used.n >= ev.capacity && !ev.waitlist_enabled) return json({ error: 'slot sudah penuh 🥺' }, 409);

  if (old) await env.DB.prepare('DELETE FROM rsvps WHERE id = ?').bind(old.id).run(); // daftar ulang setelah batal

  // status dihitung di dalam satu query supaya aman kalau banyak yang daftar bersamaan
  const code = makeCode();
  await env.DB.prepare(`INSERT INTO rsvps (event_id, code, name, handle, email, phone, note, status)
    SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7,
      CASE WHEN (SELECT COUNT(*) FROM rsvps WHERE event_id = ?1 AND status IN ('confirmed','attended')) < ?8
           THEN 'confirmed' ELSE 'waitlist' END`)
    .bind(ev.id, code, name, handle, email, phone, note, ev.capacity).run();

  const row = await env.DB.prepare(`SELECT r.*, e.title AS event_title FROM rsvps r JOIN events e ON e.id = r.event_id WHERE r.code = ?`).bind(code).first();
  return json(await withPosition(env, row), 201);
}

export async function onRequestGet({ request, env }) {
  const code = clean(new URL(request.url).searchParams.get('code'), 20).toUpperCase();
  if (!code) return json({ error: 'kode kosong' }, 400);
  const row = await env.DB.prepare(`SELECT r.*, e.title AS event_title FROM rsvps r JOIN events e ON e.id = r.event_id WHERE r.code = ?`).bind(code).first();
  if (!row) return json({ error: 'kode tidak ditemukan, cek lagi ya' }, 404);
  return json(await withPosition(env, row));
}
