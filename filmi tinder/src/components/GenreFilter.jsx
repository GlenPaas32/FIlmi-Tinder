import { useState } from 'react'
import './GenreFilter.css'

// Laseb enne swipe'imist valida žanrid. Tühi valik = kõik žanrid.
export default function GenreFilter({ movies, onStart }) {
  const [selected, setSelected] = useState([])
  const genres = [...new Set(movies.map((m) => m.genre).filter(Boolean))].sort()

  function toggle(genre) {
    setSelected((s) => (s.includes(genre) ? s.filter((g) => g !== genre) : [...s, genre]))
  }

  const count = selected.length
    ? movies.filter((m) => selected.includes(m.genre)).length
    : movies.length

  return (
    <div className="genre-filter">
      <h2>Mis žanrit vaatame?</h2>
      <p>Vali üks või mitu. Kui midagi ei vali, näed kõiki filme.</p>
      <div className="genre-chips">
        {genres.map((genre) => (
          <button
            key={genre}
            className={'genre-chip' + (selected.includes(genre) ? ' is-selected' : '')}
            onClick={() => toggle(genre)}
            aria-pressed={selected.includes(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => onStart(selected)}>
        Alusta ({count} filmi)
      </button>
    </div>
  )
}
