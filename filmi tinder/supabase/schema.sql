-- Filmi Tinder: andmebaasi skeem (vt CLAUDE.md "Andmemudel")
-- Käivita Supabase SQL Editoris enne realtime_rls.sql faili.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique check (code ~ '^[A-Z]{4}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id         integer primary key,
  title      text not null,
  year       integer,
  poster_url text,
  genre      text
);

create table if not exists public.swipes (
  id        uuid primary key default gen_random_uuid(),
  room_id   uuid    not null references public.rooms(id)  on delete cascade,
  user_slot integer not null check (user_slot in (1, 2)),
  movie_id  integer not null references public.movies(id) on delete cascade,
  liked     boolean not null,
  unique (room_id, user_slot, movie_id)
);

create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid    not null references public.rooms(id)  on delete cascade,
  movie_id   integer not null references public.movies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (room_id, movie_id)
);

create index if not exists swipes_room_movie_idx on public.swipes (room_id, movie_id);
create index if not exists matches_room_idx      on public.matches (room_id);
