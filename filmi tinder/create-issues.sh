#!/usr/bin/env bash
# Filmide Tinder – loob kõik hackatoni issued GitHubi.
#
# Kasutus (repo kaustas, gh peab olema sisse logitud: `gh auth login`):
SUPA="GlenPaas32"
BACK="Shargathx"
FRONT="maiko-nigul"
# Kasutajanimed on valikulised – ilma nendeta luuakse issued ilma määramata.

set -euo pipefail

assignee() { [ -n "${1:-}" ] && echo "--assignee $1" || true; }

echo "Loon labelid..."
gh label create setup    --color 6E7781 --description "Ühine seadistus"     --force
gh label create supabase --color 3ECF8E --description "Andmebaas, Supabase"  --force
gh label create backend  --color 1F6FEB --description "API-kiht src/api"     --force
gh label create frontend --color D2A8FF --description "UI, ekraanid"         --force
gh label create priority --color E5534B --description "Teised ootavad seda" --force
gh label create extra    --color F2CC60 --description "Kui aega jääb"        --force

issue() { # issue "pealkiri" "labelid" "assignee" <<'EOF' ... EOF
  local title="$1" labels="$2" who="${3:-}"
  # shellcheck disable=SC2046
  gh issue create --title "$title" --label "$labels" $(assignee "$who") --body-file - >/dev/null
  echo "  ✓ $title"
}

echo "Loon issued..."

# ───────────────────────── ÜHINE ─────────────────────────
issue "[0] Projekti seadistus ja CLAUDE.md leping" "setup,priority" "" <<'EOF'
**Kõik koos · 0:00–0:15**

**Mida teha**
- Vite + React projekt, `@supabase/supabase-js` paigaldatud
- `CLAUDE.md` juurkausta: projekti kirjeldus, kaustade omanikud, andmemudel, API leping
- `.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), `.env` lisatud `.gitignore`-i
- GitHub Projects tahvel: To do → In progress → Review → Done

**Valmis, kui**
- [ ] `npm run dev` töötab kõigil kolmel
- [ ] `CLAUDE.md` on `main`-is ja kõik on lepingu läbi lugenud
- [ ] Supabase URL ja anon-võti on tiimile jagatud (mitte repos!)
EOF

# ───────────────────────── SUPABASE ─────────────────────────
issue "[S1] Tabelid: rooms, movies, swipes, matches" "supabase,priority" "${SUPA:-}" <<'EOF'
**Branch:** `feature/db-schema` · **Sõltub:** [0]

**Mida teha:** `supabase/schema.sql` nelja tabeliga vastavalt `CLAUDE.md` andmemudelile.

**Valmis, kui**
- [ ] Tabelid on Supabase'is loodud
- [ ] `rooms.code` on unikaalne
- [ ] `swipes`-il on unikaalsus `(room_id, user_slot, movie_id)`
- [ ] Back-inimesele on öeldud, et tabelid on olemas

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee supabase/schema.sql tabelitega rooms, movies, swipes, matches vastavalt andmemudelile. Lisa foreign keyd ja unikaalsuspiirangud. Muuda ainult supabase/ kausta.
EOF

issue "[S2] Filmide seed-andmed (20 filmi)" "supabase" "${SUPA:-}" <<'EOF'
**Branch:** `feature/db-seed` · **Sõltub:** [S1]

**Mida teha:** `supabase/seed.sql` 20 populaarse filmiga (pealkiri, aasta, žanr, posteri URL).

**Valmis, kui**
- [ ] 20 rida tabelis `movies`
- [ ] Posterid avanevad brauseris
- [ ] Vähemalt 4 erinevat žanri

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee supabase/seed.sql 20 tuntud filmiga eri žanridest. poster_url kasuta TMDB kujul https://image.tmdb.org/t/p/w500/... Muuda ainult supabase/ kausta.
EOF

issue "[S3] Match-trigger" "supabase,priority" "${SUPA:-}" <<'EOF'
**Branch:** `feature/db-match-trigger` · **Sõltub:** [S1]

**Mida teha:** Trigger tabelil `swipes`: kui mõlemad user_slotid (1 ja 2) on samas toas samale filmile andnud `liked = true`, lisatakse rida tabelisse `matches`.

**Valmis, kui**
- [ ] Test: kaks swipe'i (slot 1 ja 2, liked=true) → 1 rida `matches`-is
- [ ] Sama filmi kohta ei teki duplikaat-matchi
- [ ] Ühe ❤️ ja ühe ❌ korral matchi ei teki

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee supabase/match_trigger.sql: plpgsql funktsioon ja AFTER INSERT trigger tabelil swipes, mis lisab matches tabelisse rea, kui sama room_id ja movie_id kohta on mõlemal user_slotil liked=true. Väldi duplikaate. Lisa lõppu kommentaarina testpäringud.
EOF

issue "[S4] Realtime ja RLS" "supabase" "${SUPA:-}" <<'EOF'
**Branch:** `feature/db-realtime` · **Sõltub:** [S1]

**Mida teha:** Lülitada Realtime sisse tabelil `matches` ja seadistada RLS nii, et anon-kasutaja saab lugeda ja kirjutada (hackatoni jaoks lubav).

**Valmis, kui**
- [ ] `matches` on `supabase_realtime` publicationis
- [ ] Anon-võtmega saab teha select/insert kõigis neljas tabelis
- [ ] Back-inimesele on öeldud, et B4 saab alata

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee supabase/realtime_rls.sql: lisa matches tabel supabase_realtime publicationisse, luba RLS kõigil tabelitel ja lisa lubavad poliitikad anon rollile (select, insert). Lisa kommentaar, et see on ainult hackatoni jaoks.
EOF

# ───────────────────────── BACK ─────────────────────────
issue "[B1] Mock API ⚡ (front ootab seda)" "backend,priority" "${BACK:-}" <<'EOF'
**Branch:** `feature/api-mock` · **Sõltub:** [0] · **Tähtaeg: 15 min pärast algust**

**Mida teha:** `src/api/mock.js` kõigi lepingu funktsioonidega (`createRoom`, `joinRoom`, `getMovies`, `swipe`, `getMatches`, `onMatch`), andmed mälus.

**Valmis, kui**
- [ ] Kõik 6 funktsiooni on olemas ja tagastavad õiget kuju andmeid
- [ ] `getMovies` tagastab vähemalt 5 filmi
- [ ] Kui slot 1 ja 2 annavad samale filmile ❤️, tekib match ja `onMatch` callback käivitub
- [ ] Merge'itud `main`-i ja frondile teada antud

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee src/api/mock.js, mis ekspordib täpselt API lepingu funktsioonid. Hoia andmeid mälus, funktsioonid olgu async. onMatch kutsub callbacki, kui swipe tekitab matchi. Muuda ainult src/api kausta.
EOF

issue "[B2] Supabase client + createRoom / joinRoom" "backend" "${BACK:-}" <<'EOF'
**Branch:** `feature/api-rooms` · **Sõltub:** [S1]

**Mida teha:** `src/api/supabaseClient.js` ja `src/api/index.js`-is `createRoom` ja `joinRoom`.

**Valmis, kui**
- [ ] Võtmed loetakse `.env`-ist
- [ ] `createRoom()` loob rea tabelisse `rooms` ja tagastab `{ roomId, code }` (4 suurtähte)
- [ ] `joinRoom(code)` tagastab `{ roomId }` või viskab selge vea, kui koodi pole

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee src/api/supabaseClient.js (import.meta.env võtmetega) ja src/api/index.js-is createRoom ja joinRoom vastavalt lepingule. Kood: 4 juhuslikku suurtähte. Vigade korral viska Error selge eestikeelse sõnumiga. Muuda ainult src/api kausta.
EOF

issue "[B3] getMovies, swipe, getMatches" "backend" "${BACK:-}" <<'EOF'
**Branch:** `feature/api-swipes` · **Sõltub:** [S2]

**Mida teha:** Ülejäänud andmefunktsioonid failis `src/api/index.js`.

**Valmis, kui**
- [ ] `getMovies()` tagastab filmid tabelist `movies`
- [ ] `swipe(roomId, userSlot, movieId, liked)` lisab rea tabelisse `swipes`
- [ ] `getMatches(roomId)` tagastab `Movie[]` (filmide andmed, mitte ainult id-d)

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Lisa src/api/index.js-i getMovies, swipe ja getMatches vastavalt lepingule. getMatches teeb matches ja movies vahel joini (supabase-js select koos seotud tabeliga) ja tagastab Movie[]. Muuda ainult src/api kausta.
EOF

issue "[B4] onMatch Realtime" "backend,priority" "${BACK:-}" <<'EOF'
**Branch:** `feature/api-realtime` · **Sõltub:** [S3], [S4]

**Mida teha:** `onMatch(roomId, callback)`, mis kuulab Realtime'i kaudu uusi ridu tabelis `matches`.

**Valmis, kui**
- [ ] Kaks brauseriakent samas toas: match käivitab callbacki **mõlemas**
- [ ] Callback saab filmi andmed (`Movie`)
- [ ] Funktsioon tagastab `unsubscribe()`
- [ ] Frondile teada antud, et F5 saab alata

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Lisa src/api/index.js-i onMatch, mis tellib Supabase Realtime'i postgres_changes INSERT-sündmused tabelil matches, filter room_id=eq.<roomId>. Lae juurde filmi andmed ja kutsu callback(movie). Tagasta unsubscribe-funktsioon. Muuda ainult src/api kausta.
EOF

issue "[B5] Edge Function create-room (lisa)" "backend,extra" "${BACK:-}" <<'EOF'
**Branch:** `feature/api-edge-room` · **Sõltub:** [B2] · **Ainult kui aega jääb**

**Mida teha:** Viia toa loomine Supabase Edge Functionisse, et kood oleks kindlasti unikaalne.

**Valmis, kui**
- [ ] Funktsioon on deploy'tud (`supabase functions deploy create-room`)
- [ ] Kui kood on juba olemas, genereeritakse uus
- [ ] `createRoom()` kutsub funktsiooni `supabase.functions.invoke('create-room')` kaudu

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee supabase/functions/create-room/index.ts: genereerib 4-tähelise koodi, proovib uuesti, kui see on juba rooms tabelis, lisab toa ja tagastab { roomId, code }. Uuenda src/api/index.js createRoom seda kutsuma.
EOF

# ───────────────────────── FRONT ─────────────────────────
issue "[F1] Avaleht: Loo tuba / Liitu koodiga" "frontend" "${FRONT:-}" <<'EOF'
**Branch:** `feature/ui-home` · **Sõltub:** [B1] (seni tee layout/CSS)

**Mida teha:** Avaleht kahe valikuga: "Loo tuba" (näitab koodi suurelt) ja "Liitu" (koodi sisestusväli).

**Valmis, kui**
- [ ] Toa loonud kasutaja on slot 1, liitunu slot 2
- [ ] Vale koodi korral näidatakse veateadet
- [ ] Pärast liitumist liigub kasutaja swipe-vaatesse
- [ ] Töötab mobiili laiusel

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee src/pages/Home.jsx: nupud "Loo tuba" ja "Liitu koodiga". Kasuta API-t failist src/api/mock.js. Salvesta roomId ja userSlot olekusse (nt React context). Mobiilisõbralik. Muuda ainult src/components ja src/pages kaustu.
EOF

issue "[F2] Swipe-vaade: filmikaart + ❌ / ❤️" "frontend,priority" "${FRONT:-}" <<'EOF'
**Branch:** `feature/ui-swipe` · **Sõltub:** [B1]

**Mida teha:** Näitab ühte filmi korraga (poster, pealkiri, aasta, žanr) ja nuppe ❌ / ❤️.

**Valmis, kui**
- [ ] Nupuvajutus kutsub `swipe(...)` ja näitab järgmist filmi
- [ ] Kui filmid saavad otsa: "Kõik vaadatud!" + link matchide nimekirja
- [ ] Toa kood on ekraanil nähtav

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee src/pages/Swipe.jsx ja src/components/MovieCard.jsx. Lae filmid getMovies()-ga, näita ühte korraga, ❌ ja ❤️ nupud kutsuvad swipe(). Kasuta src/api/mock.js-i. Muuda ainult src/components ja src/pages kaustu.
EOF

issue "[F3] \"It's a match!\" modaal" "frontend" "${FRONT:-}" <<'EOF'
**Branch:** `feature/ui-match-modal` · **Sõltub:** [F2]

**Mida teha:** Kui `onMatch` callback käivitub, avaneb modaal filmi posteri ja tekstiga "It's a match! 🎉".

**Valmis, kui**
- [ ] Modaal avaneb swipe-vaate peal
- [ ] Nupud "Jätka swipe'imist" ja "Vaata nimekirja"
- [ ] Tellimus lõpetatakse, kui kasutaja lahkub vaatest (`unsubscribe`)

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee src/components/MatchModal.jsx ja ühenda see Swipe.jsx-iga onMatch() kaudu useEffectis (koos unsubscribe'iga cleanup'is). Lisa väike animatsioon. Muuda ainult src/components ja src/pages kaustu.
EOF

issue "[F4] Matchide nimekiri" "frontend" "${FRONT:-}" <<'EOF'
**Branch:** `feature/ui-match-list` · **Sõltub:** [B1]

**Mida teha:** "Meie nimekiri" vaade kõigi selle toa matchidega.

**Valmis, kui**
- [ ] Filmid kuvatakse kaartidena (poster + pealkiri + aasta)
- [ ] Tühja nimekirja korral on sõbralik tekst
- [ ] Ligipääs swipe-vaatest ja match-modaalist

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Tee src/pages/Matches.jsx, mis kutsub getMatches(roomId) ja näitab filme gridis. Kasuta src/api/mock.js-i. Muuda ainult src/components ja src/pages kaustu.
EOF

issue "[F5] Mock → päris API vahetus" "frontend,priority" "${FRONT:-}" <<'EOF'
**Branch:** `feature/ui-connect-api` · **Sõltub:** [B4] · **Umbes 1:15**

**Mida teha:** Vahetada kõik importid `src/api/mock.js` → `src/api/index.js` ja testida kahe seadmega.

**Valmis, kui**
- [ ] Kaks telefoni (või brauseriakent) liituvad sama toaga
- [ ] Match ilmub **mõlemale** ekraanile
- [ ] Matchide nimekiri näitab andmebaasi andmeid

**Prompt Claude Code'ile**
> Loe CLAUDE.md. Vaheta kõigis src/pages ja src/components failides API import mock.js-ilt index.js-ile. Kontrolli, et laadimise ja vigade olekud on käsitletud.
EOF

issue "[F6] Žanrifilter / swipe-animatsioon (lisa)" "frontend,extra" "${FRONT:-}" <<'EOF'
**Branch:** `feature/ui-extras` · **Sõltub:** [F5] · **Ainult kui aega jääb**

**Valikud (vali üks)**
- [ ] Žanrifilter enne swipe'imise algust
- [ ] Kaardi lohistamine vasakule/paremale koos animatsiooniga
EOF

echo "Valmis! Ava: $(gh repo view --json url -q .url)/issues"
