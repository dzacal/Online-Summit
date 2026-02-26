-- ============================================================
-- Global Online Regeneration Summit — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New Query
-- ============================================================

-- Enable RLS on all tables
-- Team members table
CREATE TABLE public.team_members (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  full_name   TEXT NOT NULL,
  role        TEXT,
  department  TEXT,
  email       TEXT,
  phone       TEXT,
  timezone    TEXT,
  handle      TEXT,          -- Slack/Discord handle
  responsibilities TEXT,
  notes       TEXT
);

-- Speakers table
CREATE TABLE public.speakers (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT now(),
  full_name           TEXT NOT NULL,
  organization        TEXT,
  title               TEXT,
  topic               TEXT,
  session_type        TEXT,   -- Keynote / Panel / Workshop / Lightning Talk
  contact_email       TEXT,
  contact_phone       TEXT,
  agent_name          TEXT,
  agent_email         TEXT,
  outreach_date       DATE,
  outreach_method     TEXT,
  follow_up_date      DATE,
  response_status     TEXT DEFAULT 'Not Contacted',
  -- Not Contacted | Outreach Sent | Follow Up Sent | In Conversation | Confirmed | Declined | No Response
  confirmed           BOOLEAN DEFAULT FALSE,
  confirmation_date   DATE,
  contract_sent       BOOLEAN DEFAULT FALSE,
  contract_signed     BOOLEAN DEFAULT FALSE,
  bio_received        BOOLEAN DEFAULT FALSE,
  headshot_received   BOOLEAN DEFAULT FALSE,
  av_requirements     TEXT,
  session_date        DATE,
  session_time_utc    TIME,
  session_length_min  INTEGER,
  honorarium          NUMERIC(10,2),
  travel_notes        TEXT,
  notes               TEXT
);

-- Partners table
CREATE TABLE public.partners (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT now(),
  organization        TEXT NOT NULL,
  partnership_type    TEXT,   -- Sponsor | Media Partner | Community Partner | Co-Organizer | In-Kind | Affiliate
  primary_contact_name  TEXT,
  primary_contact_title TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  secondary_contact_name  TEXT,
  secondary_contact_email TEXT,
  website             TEXT,
  social_handle       TEXT,
  partnership_status  TEXT DEFAULT 'Prospecting',
  -- Prospecting | In Discussion | Agreement Sent | Confirmed | Active | Completed | Declined
  agreement_signed    BOOLEAN DEFAULT FALSE,
  agreement_date      DATE,
  deliverables        TEXT,
  our_commitments     TEXT,
  their_commitments   TEXT,
  logo_received       BOOLEAN DEFAULT FALSE,
  assets_received     BOOLEAN DEFAULT FALSE,
  payment_terms       TEXT,
  partnership_value   NUMERIC(12,2),
  notes               TEXT
);

-- Podcasts table
CREATE TABLE public.podcasts (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT now(),
  podcast_name        TEXT NOT NULL,
  host_name           TEXT,
  host_email          TEXT,
  show_website        TEXT,
  social_handle       TEXT,
  monthly_listeners   INTEGER,
  audience_niche      TEXT,
  outreach_date       DATE,
  outreach_method     TEXT,
  follow_up_date      DATE,
  response_status     TEXT DEFAULT 'Not Contacted',
  -- Not Contacted | Outreach Sent | Follow Up Sent | Confirmed | Recorded | Published | Declined
  confirmed           BOOLEAN DEFAULT FALSE,
  recording_date      DATE,
  recording_format    TEXT,   -- Live | Pre-recorded
  publish_date        DATE,
  episode_title       TEXT,
  episode_url         TEXT,
  talking_points      TEXT,
  assets_sent         BOOLEAN DEFAULT FALSE,
  notes               TEXT
);

-- Marketing assets table
CREATE TABLE public.marketing_assets (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now(),
  asset_name      TEXT NOT NULL,
  asset_type      TEXT,       -- Graphic | Video | Copy | Email Template | Social Post | Press Release | Banner
  category        TEXT,
  platform        TEXT,
  file_name       TEXT,
  file_url        TEXT,       -- Supabase Storage URL or external link
  format          TEXT,
  dimensions      TEXT,
  created_by      TEXT,
  version         TEXT,
  status          TEXT DEFAULT 'Draft',
  -- Draft | In Review | Approved | Published | Archived
  approved_by     TEXT,
  approval_date   DATE,
  publish_date    DATE,
  campaign_phase  TEXT,
  notes           TEXT
);

-- Social media calendar
CREATE TABLE public.social_posts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now(),
  post_date       DATE,
  post_time_utc   TIME,
  platform        TEXT,       -- Instagram | LinkedIn | Twitter/X | Facebook | TikTok | YouTube
  content_type    TEXT,       -- Reel | Story | Post | Thread | Short
  caption         TEXT,
  hashtags        TEXT,
  asset_id        UUID REFERENCES public.marketing_assets(id) ON DELETE SET NULL,
  link            TEXT,
  campaign_phase  TEXT,
  audience_target TEXT,
  assigned_to     TEXT,
  status          TEXT DEFAULT 'Draft',
  -- Draft | Scheduled | Posted
  engagement_notes TEXT
);

-- Email campaigns
CREATE TABLE public.email_campaigns (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now(),
  campaign_name   TEXT NOT NULL,
  subject_line    TEXT,
  audience_segment TEXT,
  send_date       DATE,
  send_time_utc   TIME,
  from_name       TEXT,
  from_email      TEXT,
  template_file   TEXT,
  status          TEXT DEFAULT 'Draft',
  -- Draft | Scheduled | Sent
  recipients      INTEGER,
  opens           INTEGER,
  clicks          INTEGER,
  unsubscribes    INTEGER,
  notes           TEXT
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_assets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns   ENABLE ROW LEVEL SECURITY;

-- Authenticated users can do full CRUD (team dashboard)
CREATE POLICY "Authenticated full access" ON public.team_members
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON public.speakers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON public.partners
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON public.podcasts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON public.marketing_assets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON public.social_posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON public.email_campaigns
  FOR ALL USING (auth.role() = 'authenticated');

-- Public read for speakers and partners (for the public landing page)
CREATE POLICY "Public read confirmed speakers" ON public.speakers
  FOR SELECT USING (confirmed = TRUE);

CREATE POLICY "Public read confirmed partners" ON public.partners
  FOR SELECT USING (agreement_signed = TRUE);
