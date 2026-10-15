-- Filmi Tinder: algandmed (20 filmi eri žanridest)
-- Käivita pärast schema.sql faili. id = TMDB filmi id.

insert into public.movies (id, title, year, poster_url, genre) values
  (278,    'The Shawshank Redemption', 1994, 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg', 'Draama'),
  (238,    'The Godfather',            1972, 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'Krimi'),
  (155,    'The Dark Knight',          2008, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'Märul'),
  (680,    'Pulp Fiction',             1994, 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'Krimi'),
  (13,     'Forrest Gump',             1994, 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', 'Draama'),
  (27205,  'Inception',                2010, 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', 'Ulme'),
  (603,    'The Matrix',               1999, 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 'Ulme'),
  (157336, 'Interstellar',             2014, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'Ulme'),
  (129,    'Spirited Away',            2001, 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', 'Animatsioon'),
  (862,    'Toy Story',                1995, 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg', 'Animatsioon'),
  (597,    'Titanic',                  1997, 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', 'Romantika'),
  (313369, 'La La Land',               2016, 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', 'Muusikal'),
  (329,    'Jurassic Park',            1993, 'https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg', 'Seiklus'),
  (105,    'Back to the Future',       1985, 'https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg', 'Seiklus'),
  (496243, 'Parasite',                 2019, 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'Põnevik'),
  (419430, 'Get Out',                  2017, 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', 'Õudus'),
  (694,    'The Shining',              1980, 'https://image.tmdb.org/t/p/w500/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg', 'Õudus'),
  (18785,  'The Hangover',             2009, 'https://image.tmdb.org/t/p/w500/uluhlXubGu1VxU63X9VHCLWDAYP.jpg', 'Komöödia'),
  (8363,   'Superbad',                 2007, 'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg', 'Komöödia'),
  (98,     'Gladiator',                2000, 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', 'Ajalugu')
on conflict (id) do update set
  title      = excluded.title,
  year       = excluded.year,
  poster_url = excluded.poster_url,
  genre      = excluded.genre;
