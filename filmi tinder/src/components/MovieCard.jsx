import './MovieCard.css'

export default function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      <img className="movie-poster" src={movie.poster_url} alt={movie.title} />
      <div className="movie-info">
        <h2 className="movie-title">{movie.title}</h2>
        <p>
          {movie.year} · {movie.genre}
        </p>
      </div>
    </article>
  )
}
