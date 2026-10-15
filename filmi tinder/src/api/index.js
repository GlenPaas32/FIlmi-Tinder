import { supabase } from './supabaseClient';

/**
 * Genereerib täpselt 4 juhuslikku suurtähte (nt "XQZT")
 */
function generateRoomCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

/**
 * Loo uus tuba. Loojast saab user_slot 1.
 * @returns {Promise<{ roomId: string, code: string }>}
 */
export async function createRoom() {
  const code = generateRoomCode();
  
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ code }])
    .select('id, code')
    .single();

  if (error) {
    throw new Error(`Toa loomine ebaõnnestus: ${error.message}`);
  }

  return { roomId: data.id, code: data.code };
}

/**
 * Liitu olemasoleva toaga koodi abil. Liitujast saab user_slot 2.
 * @param {string} code 
 * @returns {Promise<{ roomId: string }>}
 */
export async function joinRoom(code) {
  if (!code || typeof code !== 'string' || !code.trim()) {
    throw new Error('Toakood on puudu.');
  }

  const cleanCode = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', cleanCode)
    .maybeSingle();

  if (error) {
    throw new Error(`Päringu viga: ${error.message}`);
  }

  if (!data) {
    throw new Error('Sellise koodiga tuba ei leitud.');
  }

  return { roomId: data.id };
}

/**
 * Tagastab filmide nimekirja tabelist 'movies'.
 * @returns {Promise<Array<{ id: string, title: string, year: number, poster_url: string, genre: string }>>}
 */
export async function getMovies() {
  const { data, error } = await supabase
    .from('movies')
    .select('id, title, year, poster_url, genre');

  if (error) {
    throw new Error(`Filmide laadimine ebaõnnestus: ${error.message}`);
  }

  return data || [];
}

/**
 * Lisab kasutaja swipe-i tabelisse 'swipes'.
 * @param {string} roomId 
 * @param {number} userSlot (1 või 2)
 * @param {string} movieId 
 * @param {boolean} liked 
 * @returns {Promise<void>}
 */
export async function swipe(roomId, userSlot, movieId, liked) {
  const { error } = await supabase
    .from('swipes')
    .upsert(
      {
        room_id: roomId,
        user_slot: userSlot,
        movie_id: movieId,
        liked: liked
      },
      { onConflict: 'room_id,user_slot,movie_id' }
    );

  if (error) {
    throw new Error(`Swipe'i salvestamine ebaõnnestus: ${error.message}`);
  }
}

/**
 * Tagastab toas tekkinud matchitud filmid (Movie[]).
 * Teeb matches ja movies tabelite vahel JOIN päringu.
 * @param {string} roomId 
 * @returns {Promise<Array<{ id: string, title: string, year: number, poster_url: string, genre: string }>>}
 */
export async function getMatches(roomId) {
  const { data, error } = await supabase
    .from('matches')
    .select('movies (id, title, year, poster_url, genre)')
    .eq('room_id', roomId);

  if (error) {
    throw new Error(`Matchide pärimine ebaõnnestus: ${error.message}`);
  }

  // Supabase tagastab iga rea kujul { movies: { id, title, ... } }, teisendame puhtaks Movie[] massiiviks
  return (data || [])
    .map((item) => item.movies)
    .filter(Boolean);
}

/**
 * Kuulab Realtime'i kaudu uusi match'e spetsiifilises toas.
 * Tagastab koheselt unsubscribe funktsiooni.
 * @param {string} roomId 
 * @param {function(Movie): void} callback 
 * @returns {function(): void} unsubscribe
 */
export function onMatch(roomId, callback) {
  const channel = supabase
    .channel(`realtime_matches_${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `room_id=eq.${roomId}`
      },
      async (payload) => {
        const movieId = payload.new.movie_id;

        const { data: movie, error } = await supabase
          .from('movies')
          .select('id, title, year, poster_url, genre')
          .eq('id', movieId)
          .single();

        if (!error && movie) {
          callback(movie);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}