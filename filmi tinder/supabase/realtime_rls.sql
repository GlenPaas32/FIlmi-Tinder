-- Filmi Tinder: Realtime ja RLS
-- Käivita pärast schema.sql faili.
--
-- HOIATUS: AINULT HACKATONI JAOKS!
-- Poliitikad lubavad anon rollil kõiki ridu lugeda ja lisada ilma igasuguse
-- kontrollita. Tootmises tuleb need asendada kitsamate poliitikatega
-- (nt auth.uid() põhised piirangud).

-- Realtime: kliendid saavad tellida uusi matche
alter publication supabase_realtime add table public.matches;

-- RLS kõigil tabelitel
alter table public.rooms   enable row level security;
alter table public.movies  enable row level security;
alter table public.swipes  enable row level security;
alter table public.matches enable row level security;

-- rooms
create policy "anon select rooms" on public.rooms
  for select to anon using (true);
create policy "anon insert rooms" on public.rooms
  for insert to anon with check (true);

-- movies
create policy "anon select movies" on public.movies
  for select to anon using (true);
create policy "anon insert movies" on public.movies
  for insert to anon with check (true);

-- swipes
create policy "anon select swipes" on public.swipes
  for select to anon using (true);
create policy "anon insert swipes" on public.swipes
  for insert to anon with check (true);

-- matches
create policy "anon select matches" on public.matches
  for select to anon using (true);
create policy "anon insert matches" on public.matches
  for insert to anon with check (true);
