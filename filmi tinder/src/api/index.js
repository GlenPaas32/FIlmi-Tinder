import { supabase } from './supabaseClient';

// Abifunktsioon toakoodi genereerimiseks: täpselt 4 suurtähte (A–Z)
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
  // Kontrollime, et kood on olemas
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
 * Tagastab filmide nimekirja.
 * @returns {Promise<Array<{ id: string, title: string, year: number, poster_url: string, genre: string }>>}
 */
export async function getMovies() {
  const { data, error } = await supabase
    .from('movies')
    .select('id, title, year, poster_url, genre');

  if (error) throw error;
  return data || [];
}

/**
 * Salvestab kasutaja swipe-i.
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

  if (error) throw error;
}

/**
 * Tagastab toas tekkinud matchitud filmid.
 * @param {string} roomId 
 * @returns {Promise<Array<Movie>>}
 */
export async function getMatches(roomId) {
  const { data, error } = await supabase
    .from('matches')
    .select('movie_id, movies(id, title, year, poster_url, genre)')
    .eq('room_id', roomId);

  if (error) throw error;
  return (data || []).map((item) => item.movies);
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

        // Laeme uue matchitud filmi andmed
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