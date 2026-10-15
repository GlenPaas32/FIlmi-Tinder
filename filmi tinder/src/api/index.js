import { supabase } from './supabaseClient';

/**
 * Kuulab Realtime'i kaudu uusi match'e spetsiifilises toas.
 * 
 * @param {string} roomId - Toa ID
 * @param {function(Object): void} callback - Kutsutakse välja matchitud filmi andmetega (Movie)
 * @returns {function(): void} unsubscribe - Funktsioon kuulamise lõpetamiseks
 */
export function onMatch(roomId, callback) {
    const channel = supabase
        .channel(`room_matches_${roomId}`)
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
                    .select('*')
                    .eq('id', movieId)
                    .single();

                if (error) {
                    console.error('Viga filmi andmete laadimisel:', error);
                    return;
                }

                if (movie) {
                    callback(movie);
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}