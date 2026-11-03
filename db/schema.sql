-- Wird beim ersten Aufruf automatisch ausgefuehrt (idempotent).
CREATE TABLE IF NOT EXISTS items (
  collection text NOT NULL,
  id text NOT NULL,
  data jsonb NOT NULL,
  rev bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text,
  deleted_at timestamptz,
  PRIMARY KEY (collection, id)
);
CREATE SEQUENCE IF NOT EXISTS rev_seq;
CREATE INDEX IF NOT EXISTS items_rev_idx ON items (rev);

CREATE TABLE IF NOT EXISTS activity (
  id bigserial PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  actor text,
  summary text NOT NULL,
  collection text,
  entity_id text
);

CREATE OR REPLACE FUNCTION activity_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'activity is append-only';
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'activity_no_change') THEN
    CREATE TRIGGER activity_no_change BEFORE UPDATE OR DELETE ON activity
      FOR EACH ROW EXECUTE FUNCTION activity_immutable();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'activity_no_truncate') THEN
    CREATE TRIGGER activity_no_truncate BEFORE TRUNCATE ON activity
      FOR EACH STATEMENT EXECUTE FUNCTION activity_immutable();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash text NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_idx ON login_attempts (ip_hash, at);

CREATE TABLE IF NOT EXISTS meta (
  key text PRIMARY KEY,
  value text
);
