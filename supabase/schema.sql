-- ============================================================================
--  Aces & Babes — Supabase schema
--
--  Paste this whole file into Supabase → SQL Editor → "Run".
--  It is idempotent: safe to run on a fresh project AND on the existing one
--  (it adds missing columns, replaces functions, and rewrites policies).
--
--  Data model
--    profiles  one row per signed-up player (auto-created on signup)
--    couples   two players who have linked up; carries the shared ELO
--    matches   one couple beat another at a game; ELO moves on confirmation
--
--  All writes to couples/matches go through the RPC functions at the bottom
--  (invite_partner, respond_to_invite, leave_couple, log_match,
--  confirm_match, reject_match). Row Level Security blocks direct writes, so
--  nobody can edit their own ELO from the browser.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);
alter table public.profiles add column if not exists full_name  text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
create unique index if not exists profiles_username_lower_key on public.profiles (lower(username));

-- ----------------------------------------------------------------------------
-- COUPLES
-- ----------------------------------------------------------------------------
create table if not exists public.couples (
  id           uuid primary key default gen_random_uuid(),
  player1_id   uuid not null references public.profiles (id) on delete cascade,
  player2_id   uuid not null references public.profiles (id) on delete cascade,
  couple_name  text not null,
  elo          integer not null default 1200,
  status       text not null default 'active',   -- pending | active | dissolved
  wins         integer not null default 0,
  losses       integer not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.couples add column if not exists status     text not null default 'active';
alter table public.couples add column if not exists wins       integer not null default 0;
alter table public.couples add column if not exists losses     integer not null default 0;
alter table public.couples add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'couples_status_check') then
    alter table public.couples
      add constraint couples_status_check check (status in ('pending', 'active', 'dissolved'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'couples_distinct_players') then
    alter table public.couples
      add constraint couples_distinct_players check (player1_id <> player2_id);
  end if;
end $$;

create index if not exists couples_player1_idx on public.couples (player1_id);
create index if not exists couples_player2_idx on public.couples (player2_id);
create index if not exists couples_leaderboard_idx on public.couples (status, elo desc);

-- ----------------------------------------------------------------------------
-- MATCHES
-- ----------------------------------------------------------------------------
create table if not exists public.matches (
  id                 uuid primary key default gen_random_uuid(),
  winner_couple_id   uuid not null references public.couples (id) on delete cascade,
  loser_couple_id    uuid not null references public.couples (id) on delete cascade,
  category           text not null,
  status             text not null default 'pending',   -- pending | confirmed | rejected
  submitted_by       uuid not null references public.profiles (id) on delete cascade,
  elo_delta          integer,
  winner_elo_before  integer,
  loser_elo_before   integer,
  resolved_by        uuid references public.profiles (id),
  resolved_at        timestamptz,
  created_at         timestamptz not null default now()
);
alter table public.matches add column if not exists status            text not null default 'pending';
alter table public.matches add column if not exists elo_delta         integer;
alter table public.matches add column if not exists winner_elo_before integer;
alter table public.matches add column if not exists loser_elo_before  integer;
alter table public.matches add column if not exists resolved_by       uuid references public.profiles (id);
alter table public.matches add column if not exists resolved_at       timestamptz;
alter table public.matches add column if not exists created_at        timestamptz not null default now();
-- NOTE: the original prototype had a boolean "confirmed" column. It is left in
-- place if present but is no longer read or written; "status" replaces it.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'matches_status_check') then
    alter table public.matches
      add constraint matches_status_check check (status in ('pending', 'confirmed', 'rejected'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'matches_distinct_couples') then
    alter table public.matches
      add constraint matches_distinct_couples check (winner_couple_id <> loser_couple_id);
  end if;
end $$;

create index if not exists matches_winner_idx on public.matches (winner_couple_id, created_at desc);
create index if not exists matches_loser_idx  on public.matches (loser_couple_id, created_at desc);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Everything is publicly readable (it's a leaderboard). Players may create and
-- edit their own profile. Couples and matches are written only via the RPCs.
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.couples  enable row level security;
alter table public.matches  enable row level security;

-- Drop every existing policy on these tables so this file is the single source of truth.
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('profiles', 'couples', 'matches')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

create policy profiles_select_all on public.profiles for select using (true);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy couples_select_all on public.couples for select using (true);
create policy matches_select_all on public.matches for select using (true);

-- ----------------------------------------------------------------------------
-- AUTO-CREATE A PROFILE WHEN A USER SIGNS UP
-- The signup page passes the chosen username in user metadata. If it is taken
-- by the time the row is written, a short suffix is appended so signup never
-- fails.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  base      text;
  candidate text;
  suffix    text := substr(replace(new.id::text, '-', ''), 1, 4);
begin
  base := lower(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1)));
  base := regexp_replace(base, '[^a-z0-9_]', '', 'g');
  if length(base) < 3 then
    base := 'player' || suffix;
  end if;
  candidate := base;
  if exists (select 1 from public.profiles where lower(username) = candidate) then
    candidate := base || '_' || suffix;
  end if;
  insert into public.profiles (id, username, full_name)
  values (new.id, candidate, candidate)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- GUARD: a player can be in at most one open (pending or active) couple.
-- ----------------------------------------------------------------------------
create or replace function public.enforce_one_open_couple()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('pending', 'active') then
    if exists (
      select 1 from public.couples c
      where c.id <> new.id
        and c.status in ('pending', 'active')
        and (c.player1_id in (new.player1_id, new.player2_id)
          or c.player2_id in (new.player1_id, new.player2_id))
    ) then
      raise exception 'One of these players is already in a couple or has a pending invite';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists couples_one_open_per_player on public.couples;
create trigger couples_one_open_per_player
  before insert or update on public.couples
  for each row execute function public.enforce_one_open_couple();

-- ----------------------------------------------------------------------------
-- HELPERS
-- ----------------------------------------------------------------------------
create or replace function public.open_couple_id(uid uuid)
returns uuid
language sql stable set search_path = public
as $$
  select id from public.couples
  where (player1_id = uid or player2_id = uid) and status in ('pending', 'active')
  order by created_at desc
  limit 1;
$$;

create or replace function public.active_couple_id(uid uuid)
returns uuid
language sql stable set search_path = public
as $$
  select id from public.couples
  where (player1_id = uid or player2_id = uid) and status = 'active'
  order by created_at desc
  limit 1;
$$;

-- ----------------------------------------------------------------------------
-- RPC: invite_partner(partner_username)
-- Creates a pending couple. The partner accepts on their dashboard.
-- ----------------------------------------------------------------------------
create or replace function public.invite_partner(partner_username text)
returns public.couples
language plpgsql security definer set search_path = public
as $$
declare
  me       uuid := auth.uid();
  my_prof  public.profiles;
  partner  public.profiles;
  c        public.couples;
begin
  if me is null then raise exception 'You need to be signed in'; end if;

  select * into my_prof from public.profiles where id = me;
  if not found then raise exception 'Your profile could not be found'; end if;

  select * into partner from public.profiles where lower(username) = lower(trim(partner_username));
  if not found then raise exception 'No player named @% — ask them to sign up first', lower(trim(partner_username)); end if;

  if partner.id = me then raise exception 'You cannot team up with yourself'; end if;
  if public.open_couple_id(me) is not null then raise exception 'You already have a couple or a pending invite'; end if;
  if public.open_couple_id(partner.id) is not null then raise exception '@% is already in a couple or has a pending invite', partner.username; end if;

  insert into public.couples (player1_id, player2_id, couple_name, elo, status)
  values (me, partner.id, my_prof.username || ' & ' || partner.username, 1200, 'pending')
  returning * into c;
  return c;
end $$;

-- ----------------------------------------------------------------------------
-- RPC: respond_to_invite(couple_id, accept)
-- Only the invited player (player2) can accept or decline. Declining deletes
-- the pending row so both players are free again.
-- ----------------------------------------------------------------------------
create or replace function public.respond_to_invite(couple_id uuid, accept boolean)
returns public.couples
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  c  public.couples;
begin
  if me is null then raise exception 'You need to be signed in'; end if;

  select * into c from public.couples where id = couple_id for update;
  if not found then raise exception 'Invite not found'; end if;
  if c.status <> 'pending' then raise exception 'This invite is no longer pending'; end if;
  if c.player2_id <> me then raise exception 'Only the invited player can respond to this invite'; end if;

  if accept then
    update public.couples set status = 'active' where id = couple_id returning * into c;
  else
    delete from public.couples where id = couple_id;
  end if;
  return c;
end $$;

-- ----------------------------------------------------------------------------
-- RPC: leave_couple(couple_id)
-- Either player may cancel a pending invite (row deleted) or dissolve an
-- active couple (row kept as 'dissolved' so match history survives).
-- ----------------------------------------------------------------------------
create or replace function public.leave_couple(couple_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  c  public.couples;
begin
  if me is null then raise exception 'You need to be signed in'; end if;

  select * into c from public.couples where id = couple_id for update;
  if not found then raise exception 'Couple not found'; end if;
  if me not in (c.player1_id, c.player2_id) then raise exception 'You are not part of this couple'; end if;

  if c.status = 'pending' then
    delete from public.couples where id = couple_id;
  elsif c.status = 'active' then
    update public.couples set status = 'dissolved' where id = couple_id;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- RPC: log_match(opponent_username, category, we_won)
-- Records a pending match between the caller's couple and the opponent's
-- couple. ELO does not move until the other couple confirms.
-- ----------------------------------------------------------------------------
create or replace function public.log_match(opponent_username text, category text, we_won boolean)
returns public.matches
language plpgsql security definer set search_path = public
as $$
declare
  me        uuid := auth.uid();
  mine_id   uuid;
  opp       public.profiles;
  theirs_id uuid;
  m         public.matches;
begin
  if me is null then raise exception 'You need to be signed in'; end if;
  if category is null or trim(category) = '' then raise exception 'Pick a game category'; end if;

  mine_id := public.active_couple_id(me);
  if mine_id is null then raise exception 'Link up with your partner before logging matches'; end if;

  select * into opp from public.profiles where lower(username) = lower(trim(opponent_username));
  if not found then raise exception 'No player named @%', lower(trim(opponent_username)); end if;

  theirs_id := public.active_couple_id(opp.id);
  if theirs_id is null then raise exception '@% has not linked up with a partner yet', opp.username; end if;
  if theirs_id = mine_id then raise exception '@% is on your own team', opp.username; end if;

  insert into public.matches (winner_couple_id, loser_couple_id, category, status, submitted_by)
  values (
    case when we_won then mine_id else theirs_id end,
    case when we_won then theirs_id else mine_id end,
    trim(category), 'pending', me
  )
  returning * into m;
  return m;
end $$;

-- ----------------------------------------------------------------------------
-- RPC: confirm_match(match_id)
-- Only a member of the couple that did NOT submit the match can confirm it.
-- Applies standard ELO (K = 32) to both couples atomically.
-- ----------------------------------------------------------------------------
create or replace function public.confirm_match(match_id uuid)
returns public.matches
language plpgsql security definer set search_path = public
as $$
declare
  me            uuid := auth.uid();
  m             public.matches;
  w             public.couples;
  l             public.couples;
  submitter_cid uuid;
  k             constant numeric := 32;
  expected_w    numeric;
  delta         integer;
begin
  if me is null then raise exception 'You need to be signed in'; end if;

  select * into m from public.matches where id = match_id for update;
  if not found then raise exception 'Match not found'; end if;
  if m.status <> 'pending' then raise exception 'This match has already been resolved'; end if;

  select id into submitter_cid from public.couples
  where id in (m.winner_couple_id, m.loser_couple_id)
    and (player1_id = m.submitted_by or player2_id = m.submitted_by);

  if not exists (
    select 1 from public.couples
    where id in (m.winner_couple_id, m.loser_couple_id)
      and id is distinct from submitter_cid
      and (player1_id = me or player2_id = me)
  ) then
    raise exception 'Only the opposing couple can confirm this match';
  end if;

  -- Lock both couples in a stable order to avoid deadlocks.
  perform 1 from public.couples where id in (m.winner_couple_id, m.loser_couple_id) order by id for update;
  select * into w from public.couples where id = m.winner_couple_id;
  select * into l from public.couples where id = m.loser_couple_id;

  expected_w := 1.0 / (1.0 + power(10.0, (l.elo - w.elo) / 400.0));
  delta      := greatest(1, round(k * (1 - expected_w))::integer);

  update public.couples set elo = elo + delta, wins   = wins   + 1 where id = w.id;
  update public.couples set elo = elo - delta, losses = losses + 1 where id = l.id;

  update public.matches
  set status = 'confirmed',
      elo_delta = delta,
      winner_elo_before = w.elo,
      loser_elo_before  = l.elo,
      resolved_by = me,
      resolved_at = now()
  where id = m.id
  returning * into m;
  return m;
end $$;

-- ----------------------------------------------------------------------------
-- RPC: reject_match(match_id)
-- Any member of either couple can reject a pending match (the submitting
-- couple uses this to cancel a mistake). No ELO changes.
-- ----------------------------------------------------------------------------
create or replace function public.reject_match(match_id uuid)
returns public.matches
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  m  public.matches;
begin
  if me is null then raise exception 'You need to be signed in'; end if;

  select * into m from public.matches where id = match_id for update;
  if not found then raise exception 'Match not found'; end if;
  if m.status <> 'pending' then raise exception 'This match has already been resolved'; end if;

  if not exists (
    select 1 from public.couples
    where id in (m.winner_couple_id, m.loser_couple_id)
      and (player1_id = me or player2_id = me)
  ) then
    raise exception 'You are not part of this match';
  end if;

  update public.matches
  set status = 'rejected', resolved_by = me, resolved_at = now()
  where id = m.id
  returning * into m;
  return m;
end $$;

-- ----------------------------------------------------------------------------
-- PERMISSIONS: write RPCs are for signed-in users only.
-- ----------------------------------------------------------------------------
revoke execute on function public.invite_partner(text)              from public, anon;
revoke execute on function public.respond_to_invite(uuid, boolean)  from public, anon;
revoke execute on function public.leave_couple(uuid)                from public, anon;
revoke execute on function public.log_match(text, text, boolean)    from public, anon;
revoke execute on function public.confirm_match(uuid)               from public, anon;
revoke execute on function public.reject_match(uuid)                from public, anon;

grant execute on function public.invite_partner(text)               to authenticated;
grant execute on function public.respond_to_invite(uuid, boolean)   to authenticated;
grant execute on function public.leave_couple(uuid)                 to authenticated;
grant execute on function public.log_match(text, text, boolean)     to authenticated;
grant execute on function public.confirm_match(uuid)                to authenticated;
grant execute on function public.reject_match(uuid)                 to authenticated;

grant execute on function public.open_couple_id(uuid)   to anon, authenticated;
grant execute on function public.active_couple_id(uuid) to anon, authenticated;
