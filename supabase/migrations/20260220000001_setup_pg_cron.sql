-- Migration: setup_pg_cron
-- Description: Enable pg_cron + pg_net and schedule portfolio summary emails
-- via the send-portfolio-summary Edge Function.
--
-- IMPORTANT: Before applying in production, replace the two placeholders below:
--   • REPLACE_WITH_EDGE_FUNCTION_URL  →  https://<PROJECT_REF>.supabase.co/functions/v1/send-portfolio-summary
--   • REPLACE_WITH_SUMMARY_SECRET     →  the value you set with `supabase secrets set SUMMARY_SECRET=...`
--
-- For local development the defaults below point to the local Supabase stack.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Daily summary: weekdays at 22:00 UTC (after US market close + extended hours)
SELECT cron.schedule(
  'daily-portfolio-summary',
  '0 22 * * 1-5',
  $$
  SELECT net.http_post(
    url     := 'http://localhost:54321/functions/v1/send-portfolio-summary',
    headers := '{"Content-Type":"application/json","X-Summary-Secret":"REPLACE_WITH_SUMMARY_SECRET"}'::jsonb,
    body    := '{"type":"daily"}'::jsonb
  );
  $$
);

-- Weekly summary: Saturday at 20:00 UTC
SELECT cron.schedule(
  'weekly-portfolio-summary',
  '0 20 * * 6',
  $$
  SELECT net.http_post(
    url     := 'http://localhost:54321/functions/v1/send-portfolio-summary',
    headers := '{"Content-Type":"application/json","X-Summary-Secret":"REPLACE_WITH_SUMMARY_SECRET"}'::jsonb,
    body    := '{"type":"weekly"}'::jsonb
  );
  $$
);

-- Monthly summary: 1st of each month at 20:00 UTC
SELECT cron.schedule(
  'monthly-portfolio-summary',
  '0 20 1 * *',
  $$
  SELECT net.http_post(
    url     := 'http://localhost:54321/functions/v1/send-portfolio-summary',
    headers := '{"Content-Type":"application/json","X-Summary-Secret":"REPLACE_WITH_SUMMARY_SECRET"}'::jsonb,
    body    := '{"type":"monthly"}'::jsonb
  );
  $$
);
