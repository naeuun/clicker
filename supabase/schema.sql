-- ============================================================
-- Animal Clicker – Supabase schema
-- Run this in the Supabase SQL Editor of your project.
-- ============================================================

-- 1) Extensions
create extension if not exists pgcrypto;

-- 2) Players table
create table if not exists public.players (
  id         uuid        primary key default gen_random_uuid(),
  nickname   text        not null unique,
  pin_hash   text        not null,
  score      bigint      not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists players_score_idx
  on public.players (score desc, updated_at asc);

-- 3) Auto-update updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_players_touch on public.players;
create trigger trg_players_touch
before update on public.players
for each row execute function public.touch_updated_at();

-- 4) RPC: login_or_create_player(p_nickname, p_pin)
--    - Creates a new player if nickname does not exist.
--    - Verifies PIN if nickname already exists.
--    - Returns (nickname, score).
create or replace function public.login_or_create_player(
  p_nickname text,
  p_pin      text
)
returns table(nickname text, score bigint)
language plpgsql
security definer
as $$
declare
  v_pin_hash text;
  v_score    bigint;
begin
  -- Validate inputs
  if p_nickname is null or length(trim(p_nickname)) = 0 then
    raise exception 'nickname required';
  end if;

  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    raise exception 'pin must be exactly 4 digits';
  end if;

  -- Check existing player
  select players.pin_hash, players.score
    into v_pin_hash, v_score
    from public.players
   where players.nickname = p_nickname;

  if v_pin_hash is null then
    -- New player: insert with bcrypt hash
    insert into public.players (nickname, pin_hash, score)
    values (p_nickname, crypt(p_pin, gen_salt('bf')), 0)
    returning players.score into v_score;

    return query select p_nickname as nickname, 0::bigint as score;
  end if;

  -- Existing player: verify PIN
  if v_pin_hash <> crypt(p_pin, v_pin_hash) then
    raise exception 'wrong pin';
  end if;

  return query select p_nickname as nickname, v_score as score;
end $$;

-- 5) RPC: increment_score(p_nickname, p_pin, p_delta)
--    - Verifies PIN, then atomically adds p_delta to score.
--    - Returns new score.
create or replace function public.increment_score(
  p_nickname text,
  p_pin      text,
  p_delta    int
)
returns table(score bigint)
language plpgsql
security definer
as $$
declare
  v_pin_hash text;
  v_score    bigint;
begin
  if p_delta is null or p_delta <= 0 then
    raise exception 'delta must be positive';
  end if;

  select players.pin_hash
    into v_pin_hash
    from public.players
   where players.nickname = p_nickname;

  if v_pin_hash is null then
    raise exception 'unknown nickname';
  end if;

  if v_pin_hash <> crypt(p_pin, v_pin_hash) then
    raise exception 'wrong pin';
  end if;

  update public.players
     set score = players.score + p_delta
   where players.nickname = p_nickname
  returning players.score into v_score;

  return query select v_score as score;
end $$;

-- 6) RPC: get_rankings(p_limit, p_offset)
--    - Returns nickname + score ordered by score desc, updated_at asc.
--    - Supports pagination via p_offset.
create or replace function public.get_rankings(
  p_limit  int default 200,
  p_offset int default 0
)
returns table(nickname text, score bigint)
language sql
security definer
as $$
  select nickname, score
    from public.players
   order by score desc, updated_at asc
   limit  greatest(1, least(p_limit, 200))
   offset greatest(0, p_offset);
$$;
