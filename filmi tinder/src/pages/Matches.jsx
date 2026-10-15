import { useEffect, useState } from 'react'
import { getMatches } from '../api/mock.js'
import { useRoom } from '../components/RoomContext.jsx'
import './Matches.css'

export default function Matches({ onBack }) {
  const { room } = useRoom()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMatches(room.roomId)
      .then(setMovies)
      .catch(() => setError('Nimekirja laadimine ebaõnnestus. Proovi uuesti.'))
      .finally(() => setLoading(false))
  }, [room.roomId])

  return (
    <main className="matches">
      <header className="matches-header">
        <button className="swipe-link" onClick={onBack}>
          ← Tagasi
        </button>
        <span>
          Tuba <strong>{room.code}</strong>
        </span>
      </header>

      <h2 className="matches-title">Meie nimekiri ❤️</h2>

      {loading && <p>Laen…</p>}

      {!loading && !error && movies.length === 0 && (
        <p className="matches-empty">
          Veel ühtegi matchi pole. Swipe'ige edasi — kui mõlemad annavad samale
          filmile ❤️, ilmub see siia!
        </p>
      )}

      {movies.length > 0 && (
        <ul className="matches-grid">
          {movies.map((movie) => (
            <li key={movie.id} className="matches-item">
              <img src={movie.poster_url} alt={movie.title} />
              <p>
                <strong>{movie.title}</strong>
                <br />
                {movie.year}
              </p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="home-error" role="alert">{error}</p>}
    </main>
  )
}
