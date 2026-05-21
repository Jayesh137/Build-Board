-- Single-row table that the GitHub Actions keep-alive workflow writes to.
-- A real DB write is what Supabase's activity detector actually counts —
-- anonymous PostgREST SELECTs alone don't prevent the 7-day auto-pause.

CREATE TABLE IF NOT EXISTS public.keep_alive (
  id int PRIMARY KEY DEFAULT 1,
  last_ping timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT keep_alive_single_row CHECK (id = 1)
);

INSERT INTO public.keep_alive (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can read keep_alive" ON public.keep_alive;
CREATE POLICY "anon can read keep_alive"
  ON public.keep_alive FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon can update keep_alive" ON public.keep_alive;
CREATE POLICY "anon can update keep_alive"
  ON public.keep_alive FOR UPDATE TO anon USING (true) WITH CHECK (true);
