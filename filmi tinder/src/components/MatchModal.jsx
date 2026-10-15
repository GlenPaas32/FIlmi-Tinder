import './MatchModal.css'

export default function MatchModal({ movie, onContinue, onShowMatches }) {
  return (
    <div className="match-backdrop" role="dialog" aria-modal="true">
      <div className="match-modal">
        <h2 className="match-title">It's a match! 🎉</h2>
        <img className="match-poster" src={movie.poster_url} alt={movie.title} />
        <p className="match-movie">
          <strong>{movie.title}</strong> ({movie.year})
        </p>
        <button className="btn btn-primary" onClick={onShowMatches}>
          Vaata nimekirja
        </button>
        <button className="btn" onClick={onContinue}>
          Jätka swipe'imist
        </button>
      </div>
    </div>
  )
}
