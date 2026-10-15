-- Filmi Tinder: matchi trigger (vt CLAUDE.md: "Matchi loob andmebaasi trigger tabelil swipes")
-- Käivita pärast schema.sql faili.
--
-- Kui sama room_id + movie_id kohta on mõlemal user_slotil (1 ja 2) liked = true,
-- lisatakse rida matches tabelisse. Duplikaate väldib UNIQUE (room_id, movie_id)
-- koos "on conflict do nothing"-ga.
-- security definer: töötab sõltumata RLS poliitikatest matches tabelil.

create or replace function public.create_match_on_swipe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not new.liked then
    return new;
  end if;

  if (
    select count(distinct s.user_slot)
    from public.swipes s
    where s.room_id  = new.room_id
      and s.movie_id = new.movie_id
      and s.liked
  ) = 2 then
    insert into public.matches (room_id, movie_id)
    values (new.room_id, new.movie_id)
    on conflict (room_id, movie_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists swipes_create_match on public.swipes;
create trigger swipes_create_match
  after insert on public.swipes
  for each row execute function public.create_match_on_swipe();

-- ---------------------------------------------------------------------------
-- Testpäringud (käivita SQL Editoris; eeldab, et seed.sql on käivitatud).
-- Kõik on transaktsioonis ja rollback koristab lõpus ära.
--
-- begin;
--
-- insert into rooms (code) values ('TEST');
--
-- -- 1) Ainult slot 1 annab ❤️ → matchi pole (oodatud: 0)
-- insert into swipes (room_id, user_slot, movie_id, liked)
--   select id, 1, 603, true from rooms where code = 'TEST';
-- select count(*) from matches m join rooms r on r.id = m.room_id where r.code = 'TEST';
--
-- -- 2) Slot 2 annab samale filmile ❤️ → match tekib (oodatud: 1, The Matrix)
-- insert into swipes (room_id, user_slot, movie_id, liked)
--   select id, 2, 603, true from rooms where code = 'TEST';
-- select mv.title from matches m
--   join rooms r on r.id = m.room_id
--   join movies mv on mv.id = m.movie_id
--   where r.code = 'TEST';
--
-- -- 3) Üks ❤️, teine ❌ → matchi pole (oodatud: ikka 1 match kokku)
-- insert into swipes (room_id, user_slot, movie_id, liked)
--   select id, 1, 155, true from rooms where code = 'TEST';
-- insert into swipes (room_id, user_slot, movie_id, liked)
--   select id, 2, 155, false from rooms where code = 'TEST';
-- select count(*) from matches m join rooms r on r.id = m.room_id where r.code = 'TEST';
--
-- -- 4) Teine tuba sama filmiga → oma match, ei sega TEST tuba (oodatud: 1)
-- insert into rooms (code) values ('TSTB');
-- insert into swipes (room_id, user_slot, movie_id, liked)
--   select id, s, 603, true from rooms, (values (1), (2)) v(s) where code = 'TSTB';
-- select count(*) from matches m join rooms r on r.id = m.room_id where r.code = 'TSTB';
--
-- -- 5) Topelt-swipe on keelatud (oodatud: viga unique_violation)
-- -- insert into swipes (room_id, user_slot, movie_id, liked)
-- --   select id, 1, 603, true from rooms where code = 'TEST';
--
-- rollback;
