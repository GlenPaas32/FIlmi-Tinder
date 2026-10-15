# Filmide Tinder

Kaks kasutajat liituvad samasse tuppa 4-tähelise koodiga ja swipevad samu filme
(❌ / ❤️). Kui mõlemad annavad samale filmile ❤️, tekib match, mis ilmub
reaalajas mõlema ekraanile ja lisatakse toa "Meie nimekirja".

Hackatoni projekt, aega 2 tundi. Eelista lihtsat ja töötavat lahendust ilusale.

## Stack
- Vite + React (JavaScript, mitte TypeScript)
- Supabase: Postgres + Realtime, klient `@supabase/supabase-js`
- Võtmed `.env` failis (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). `.env` EI lähe repo'sse.

## Kaustad ja omanikud
Muuda AINULT oma kausta. Kui vajad muudatust teise kaustas, ütle seda tiimile.

| Kaust | Omanik |
|---|---|
| `supabase/` | Supabase-inimene (GlenPaas32) |
| `src/api/` | Back-inimene (Shargathx) |
| `src/components/`, `src/pages/` | Front-inimene (maiko-nigul) |

## Andmemudel

```
rooms    id uuid PK, code text UNIQUE (4 suurtähte), created_at timestamptz
movies   id int PK, title text, year int, poster_url text, genre text
swipes   id uuid PK, room_id uuid FK→rooms, user_slot int (1 või 2),
         movie_id int FK→movies, liked bool,
         UNIQUE (room_id, user_slot, movie_id)
matches  id uuid PK, room_id uuid FK→rooms, movie_id int FK→movies,
         created_at timestamptz, UNIQUE (room_id, movie_id)
```

Matchi loob andmebaasi trigger tabelil `swipes`, mitte frontend.

## API leping (`src/api/index.js` ja `src/api/mock.js`)
Mõlemad failid ekspordivad TÄPSELT need funktsioonid, kõik `async`
(v.a `onMatch`, mis tagastab kohe `unsubscribe`-funktsiooni).

```js
// Movie = { id, title, year, poster_url, genre }

createRoom()                              // → { roomId, code }       — looja on user_slot 1
joinRoom(code)                            // → { roomId }             — liituja on user_slot 2; vale kood → throw Error
getMovies()                               // → Movie[]
swipe(roomId, userSlot, movieId, liked)   // → void
getMatches(roomId)                        // → Movie[]
onMatch(roomId, callback)                 // → unsubscribe()          — callback(movie) iga uue matchi kohta
```

Front impordib alguses `src/api/mock.js`-ist. Kui päris API on valmis
(issue F5), vahetatakse import `src/api/index.js` vastu. Lepingut ei muudeta
ilma tiimiga kokku leppimata. Kui muudate, uuendage seda faili.

## Töövoog
- Üks issue = üks branch = üks PR. Branchi nimi on issue'is kirjas (nt `feature/ui-swipe`).
- Enne uut branchi: `git checkout main && git pull`.
- Commit-sõnum: `feat: lühike kirjeldus (#issue)`. PR-i kirjeldusse `Closes #<number>`.
- PR-i vaatab üle keegi teine tiimist, mitte autor.
- Tee väikesed commitid iga töötava sammu järel.

## Koodistiil
- Funktsionaalsed React komponendid ja hookid.
- UI tekstid eesti keeles.
- Mobiil esimesena: peab töötama telefoni laiusel.
- Vigade korral näita kasutajale arusaadavat teadet, ära lase rakendusel kokku joosta.
