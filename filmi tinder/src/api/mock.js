// Mock filmide andmebaas mälus (vähemalt 5 filmi)
const MOCK_MOVIES = [
  { id: 'm1', title: 'The Matrix', year: 1999, poster_url: 'https://placehold.co/300x450?text=The+Matrix', genre: 'Sci-Fi' },
  { id: 'm2', title: 'Inception', year: 2010, poster_url: 'https://placehold.co/300x450?text=Inception', genre: 'Sci-Fi' },
  { id: 'm3', title: 'Interstellar', year: 2014, poster_url: 'https://placehold.co/300x450?text=Interstellar', genre: 'Sci-Fi' },
  { id: 'm4', title: 'Pulp Fiction', year: 1994, poster_url: 'https://placehold.co/300x450?text=Pulp+Fiction', genre: 'Crime' },
  { id: 'm5', title: 'Fight Club', year: 1999, poster_url: 'https://placehold.co/300x450?text=Fight+Club', genre: 'Drama' },
  { id: 'm6', title: 'The Dark Knight', year: 2008, poster_url: 'https://placehold.co/300x450?text=The+Dark+Knight', genre: 'Action' }
];

// Mälus olevad andmestruktuurid
const rooms = new Map();          // roomId -> { code }
const swipes = [];               // Array<{ roomId, userSlot, movieId, liked }>
const matches = new Map();        // roomId -> Set<movieId>
const matchListeners = new Map(); // roomId -> Set<callback>

/**
 * Loo uus tuba (looja on user_slot 1).
 * @returns {Promise<{ roomId: string, code: string }>}
 */
export async function createRoom() {
  const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  rooms.set(roomId, { code });
  matches.set(roomId, new Set());
  matchListeners.set(roomId, new Set());

  return { roomId, code };
}

/**
 * Liitu olemasoleva toaga koodi abil (liituja on user_slot 2).
 * @param {string} code 
 * @returns {Promise<{ roomId: string }>}
 */
export async function joinRoom(code) {
  const cleanCode = code ? code.trim().toUpperCase() : '';
  
  for (const [roomId, room] of rooms.entries()) {
    if (room.code === cleanCode) {
      return { roomId };
    }
  }

  throw new Error('Vale kood');
}

/**
 * Tagastab vähemalt 5 filmi nimekirja.
 * @returns {Promise<Array<{ id: string, title: string, year: number, poster_url: string, genre: string }>>}
 */
export async function getMovies() {
  return MOCK_MOVIES;
}

/**
 * Salvestab kasutaja swipe-i ning tekitab matchi ja käivitab callbacki, 
 * kui mõlemad kasutajad (slot 1 ja 2) panid meeldimise (liked = true).
 * @param {string} roomId 
 * @param {number} userSlot (1 või 2)
 * @param {string} movieId 
 * @param {boolean} liked 
 * @returns {Promise<void>}
 */
export async function swipe(roomId, userSlot, movieId, liked) {
  // Salvestame või uuendame swipe-i
  const existingIndex = swipes.findIndex(
    s => s.roomId === roomId && s.userSlot === userSlot && s.movieId === movieId
  );

  if (existingIndex >= 0) {
    swipes[existingIndex].liked = liked;
  } else {
    swipes.push({ roomId, userSlot, movieId, liked });
  }

  // Kontrollime matchi tekkimist
  if (liked) {
    const otherSlot = userSlot === 1 ? 2 : 1;
    const otherUserLiked = swipes.some(
      s => s.roomId === roomId && s.userSlot === otherSlot && s.movieId === movieId && s.liked === true
    );

    if (otherUserLiked) {
      if (!matches.has(roomId)) {
        matches.set(roomId, new Set());
      }
      const roomMatches = matches.get(roomId);

      // Kui seda filmi pole veel matchitud, lisame ja teavitame kuulajaid
      if (!roomMatches.has(movieId)) {
        roomMatches.add(movieId);

        const movie = MOCK_MOVIES.find(m => m.id === movieId);
        if (movie) {
          const listeners = matchListeners.get(roomId);
          if (listeners) {
            listeners.forEach(callback => callback(movie));
          }
        }
      }
    }
  }
}

/**
 * Tagastab toas tekkinud matchitud filmid.
 * @param {string} roomId 
 * @returns {Promise<Array<Movie>>}
 */
export async function getMatches(roomId) {
  const roomMatches = matches.get(roomId) || new Set();
  return MOCK_MOVIES.filter(m => roomMatches.has(m.id));
}

/**
 * Tellib teavitused uute matchide kohta.
 * Sünkroonne funktsioon, mis tagastab koheselt unsubscribe-funktsiooni.
 * @param {string} roomId 
 * @param {function(Movie): void} callback 
 * @returns {function(): void} unsubscribe
 */
export function onMatch(roomId, callback) {
  if (!matchListeners.has(roomId)) {
    matchListeners.set(roomId, new Set());
  }

  const listeners = matchListeners.get(roomId);
  listeners.add(callback);

  // Tagastab unsubscribe funktsiooni
  return () => {
    listeners.delete(callback);
  };
}