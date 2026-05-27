-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

-- ─── Profiles (extends auth.users) ────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text,
  company     text,
  plan        text default 'free' check (plan in ('free', 'pro', 'agency')),
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, company)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── Audits ───────────────────────────────────────────────────────────────────
create table if not exists public.audits (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users on delete cascade not null,
  brand_name          text not null,
  brand_url           text not null,
  category            text not null,
  meta_ad_url         text,
  instagram_handle    text,
  competitor_urls     text[],

  -- Headline scores (0-100)
  brand_health_score  integer,
  pdp_score           integer,
  creative_score      integer,
  social_score        integer,
  funnel_score        integer,
  retention_score     integer,
  seo_score           integer,

  -- Full Groq-generated report stored as JSON (populated in Phase 3)
  data                jsonb,

  status              text default 'processing' check (status in ('processing', 'complete', 'failed')),
  created_at          timestamptz default now()
);

alter table public.audits enable row level security;

create policy "Users can view own audits"   on public.audits for select using (auth.uid() = user_id);
create policy "Users can insert own audits" on public.audits for insert with check (auth.uid() = user_id);
create policy "Users can update own audits" on public.audits for update using (auth.uid() = user_id);
create policy "Users can delete own audits" on public.audits for delete using (auth.uid() = user_id);

-- Index for fast per-user queries
create index if not exists audits_user_id_created_at on public.audits (user_id, created_at desc);
