-- nosushidesu ♡ database RSVP (Cloudflare D1)
CREATE TABLE IF NOT EXISTS events (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  category         TEXT,
  event_date       TEXT,            -- YYYY-MM-DD
  event_time       TEXT,
  venue            TEXT,
  description      TEXT,
  capacity         INTEGER NOT NULL DEFAULT 50,
  waitlist_enabled INTEGER NOT NULL DEFAULT 1,
  status           TEXT NOT NULL DEFAULT 'open',    -- open | closed | done
  visibility       TEXT NOT NULL DEFAULT 'public',  -- public | hidden
  created_at       TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rsvps (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id   INTEGER NOT NULL REFERENCES events(id),
  code       TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  handle     TEXT,
  email      TEXT NOT NULL,
  phone      TEXT,
  note       TEXT,
  status     TEXT NOT NULL,  -- confirmed | waitlist | attended | cancelled
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rsvp_event_email ON rsvps(event_id, email);
CREATE INDEX IF NOT EXISTS idx_rsvp_event_status ON rsvps(event_id, status);
