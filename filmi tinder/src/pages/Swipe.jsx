import { useEffect, useState } from 'react'
import { getMovies, swipe } from '../api/mock.js'
import { useRoom } from '../components/RoomContext.jsx'
import MovieCard from '../components/MovieCard.jsx'
import './Swipe.css'

export default function Swipe({ onShowMatches }) {
  const { room } = useRoom()
  const [movies, setMovies] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMovies()
      .then(setMovies)
      .catch(() => setError('Filmide laadimine ebaõnnestus. Värskenda lehte.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSwipe(liked) {
    const movie = movies[index]
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

  const movie = movies[index]

  return (
    <main className="swipe">
      <header className="swipe-header">
        <span>
          Tuba <strong>{room.code}</strong>
        </span>
        <button className="swipe-link" onClick={onShowMatches}>
          Meie nimekiri
        </button>
      </header>

      {loading && <p>Laen filme…</p>}

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
            {index + 1} / {movies.length}
          </p>
        </>
      )}

      {!loading && !movie && !error && (
        <div className="swipe-done">
          <h2>Kõik vaadatud! 🎉</h2>
          <button className="btn btn-primary" onClick={onShowMatches}>
            Vaata matche
          </button>
        </div>
      )}

      {error && <p className="home-error" role="alert">{error}</p>}
    </main>
  )
}
