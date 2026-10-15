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
 * Loo uus tuba otse tabelisse 'rooms'. Loojast saab user_slot 1.
 * (Edge Function 'create-room' pole deploy'tud, seega ei kasuta seda.)
 * @returns {Promise<{ roomId: string, code: string }>}
 */
export async function createRoom() {
  // Kui kood on juba kasutusel (UNIQUE viga 23505), proovime uue koodiga
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from('rooms')
      .insert([{ code: generateRoomCode() }])
      .select('id, code')
      .single();

    if (!error) {
      return { roomId: data.id, code: data.code };
    }
    if (error.code !== '23505') {
      throw new Error(`Toa loomine ebaõnnestus: ${error.message}`);
    }
  }

  throw new Error('Toa loomine ebaõnnestus: vaba koodi ei leitud.');
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

  return (data || [])
    .map((item) => item.movies)
    .filter(Boolean);
}

/**
 * Kuulab Realtime'i kaudu uusi match'e spetsiifilises toas.
 * @param {string} roomId 
 * @param {function(Object): void} callback 
 * @returns {function(): void} unsubscribe
 */
export function onMatch(roomId, callback) {
  const channelName = `realtime_matches_${roomId}_${Math.random().toString(36).substring(2, 7)}`;
  
  const channel = supabase
    .channel(channelName)
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