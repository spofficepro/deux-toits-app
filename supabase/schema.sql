-- ============================================================
-- Deux Toits — schéma de base de données Supabase
-- À exécuter dans Supabase : Project > SQL Editor > New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- FAMILIES ----------
create table families (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  created_at timestamptz default now()
);

-- ---------- PROFILES (1 profil = 1 parent) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  family_id uuid references families(id) on delete cascade,
  role text check (role in ('A','B')),
  created_at timestamptz default now()
);

-- ---------- SUBSCRIPTIONS (1 par famille) ----------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'incomplete', -- incomplete | trialing | active | past_due | canceled
  trial_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- ANTI-ABUS ESSAI GRATUIT ----------
create table used_trial_fingerprints (
  fingerprint text primary key,
  family_id uuid references families(id),
  first_used_at timestamptz default now()
);

-- ---------- CALENDRIER DE GARDE ----------
create table calendar_days (
  family_id uuid references families(id) on delete cascade,
  day date not null,
  parent text check (parent in ('A','B')),
  updated_at timestamptz default now(),
  primary key (family_id, day)
);

-- ---------- DEPENSES ----------
create table expenses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null,
  payer text check (payer in ('A','B')) not null,
  created_at timestamptz default now()
);

-- ---------- JOURNAL ----------
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  author text check (author in ('A','B')) not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — chaque famille ne voit que ses données
-- ============================================================

alter table families enable row level security;
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table calendar_days enable row level security;
alter table expenses enable row level security;
alter table journal_entries enable row level security;

-- Fonction utilitaire : renvoie le family_id du user connecté
create or replace function my_family_id()
returns uuid
language sql stable
as $$
  select family_id from profiles where id = auth.uid()
$$;

-- profiles : chacun voit/modifie son propre profil
create policy "own profile" on profiles
  for all using (id = auth.uid());

-- families : lecture ouverte (id + invite_code uniquement, voir policy plus bas)

-- subscriptions : visible/modifiable par les membres de la famille
create policy "subscription visible to family" on subscriptions
  for select using (family_id = my_family_id());

-- calendar_days
create policy "calendar select" on calendar_days
  for select using (family_id = my_family_id());
create policy "calendar insert" on calendar_days
  for insert with check (family_id = my_family_id());
create policy "calendar update" on calendar_days
  for update using (family_id = my_family_id());
create policy "calendar delete" on calendar_days
  for delete using (family_id = my_family_id());

-- expenses
create policy "expenses select" on expenses
  for select using (family_id = my_family_id());
create policy "expenses insert" on expenses
  for insert with check (family_id = my_family_id());
create policy "expenses delete" on expenses
  for delete using (family_id = my_family_id());

-- journal_entries
create policy "journal select" on journal_entries
  for select using (family_id = my_family_id());
create policy "journal insert" on journal_entries
  for insert with check (family_id = my_family_id());

-- ============================================================
-- Vue publique restreinte pour rejoindre une famille via code
-- (expose uniquement id + invite_code, jamais les données privées)
-- ============================================================
create or replace view family_lookup as
  select id, invite_code from families;

alter view family_lookup set (security_invoker = true);

create policy "anyone can look up a family by code" on families
  for select using (true);

-- Note : la policy ci-dessus autorise la lecture de la table families
-- (id + invite_code uniquement, pas de données sensibles dedans) pour
-- permettre à un parent de rejoindre via son code. Les vraies données
-- (calendrier, dépenses, journal) restent protégées par my_family_id().
