import { useEffect, useState } from 'react'
import { getMovies, swipe, onMatch } from '../api/index.js'
import { useRoom } from '../components/RoomContext.jsx'
import MovieCard from '../components/MovieCard.jsx'
import MatchModal from '../components/MatchModal.jsx'
import GenreFilter from '../components/GenreFilter.jsx'
import './Swipe.css'

export default function Swipe({ hidden, onShowMatches }) {
  const { room } = useRoom()
  const [movies, setMovies] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [matchedMovie, setMatchedMovie] = useState(null)
  const [genres, setGenres] = useState(null) // null = žanrid veel valimata, [] = kõik

  useEffect(() => {
    getMovies()
      .then(setMovies)
      .catch(() => setError('Filmide laadimine ebaõnnestus. Värskenda lehte.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const unsubscribe = onMatch(room.roomId, setMatchedMovie)
    return unsubscribe
  }, [room.roomId])

  const deck = genres?.length ? movies.filter((m) => genres.includes(m.genre)) : movies
  const choosing = genres === null
  const movie = choosing ? null : deck[index]

  async function handleSwipe(liked) {
    setError('')
    setSending(true)
    try {
      await swipe(room.roomId, room.userSlot, movie.id, liked)
      setIndex((i) => i + 1)
    } catch {
      setError('Valiku salvestamine ebaõnnestus. Proovi uuesti.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="swipe" hidden={hidden}>
      <header className="swipe-header">
        <span>
          Tuba <strong>{room.code}</strong>
        </span>
        <button className="swipe-link" onClick={onShowMatches}>
          Meie nimekiri
        </button>
      </header>

      {loading && <p>Laen filme…</p>}

      {!loading && choosing && movies.length > 0 && (
        <GenreFilter movies={movies} onStart={setGenres} />
      )}

      {!loading && movie && (
        <>
          <MovieCard movie={movie} />
          <div className="swipe-buttons">
            <button
              className="swipe-btn"
              onClick={() => handleSwipe(false)}
              disabled={sending}
              aria-label="Ei meeldi"
            >
              ❌
            </button>
            <button
              className="swipe-btn"
              onClick={() => handleSwipe(true)}
              disabled={sending}
              aria-label="Meeldib"
            >
              ❤️
            </button>
          </div>
          <p className="swipe-progress">
            {index + 1} / {deck.length}
          </p>
        </>
      )}

      {!loading && !choosing && !movie && !error && (
        <div className="swipe-done">
          <h2>Kõik vaadatud! 🎉</h2>
          <button className="btn btn-primary" onClick={onShowMatches}>
            Vaata matche
          </button>
        </div>
      )}

      {error && <p className="home-error" role="alert">{error}</p>}

      {matchedMovie && (
        <MatchModal
          movie={matchedMovie}
          onContinue={() => setMatchedMovie(null)}
          onShowMatches={() => {
            setMatchedMovie(null)
            onShowMatches()
          }}
        />
      )}
    </main>
  )
}
