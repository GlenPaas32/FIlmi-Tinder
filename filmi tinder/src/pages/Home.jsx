import { useState } from 'react'
import { createRoom, joinRoom } from '../api/index.js'
import { useRoom } from '../components/RoomContext.jsx'
import './Home.css'

export default function Home() {
  const { setRoom } = useRoom()
  const [mode, setMode] = useState('choose') // 'choose' | 'created' | 'join'
  const [created, setCreated] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setError('')
    setLoading(true)
    try {
      const result = await createRoom()
      setCreated(result)
      setMode('created')
    } catch {
      setError('Toa loomine ebaõnnestus. Proovi uuesti.')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean) {
      setError('Sisesta toa kood.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { roomId } = await joinRoom(clean)
      setRoom({ roomId, code: clean, userSlot: 2 })
    } catch {
      setError('Sellise koodiga tuba ei leitud.')
    } finally {
      setLoading(false)
    }
  }

  function back() {
    setMode('choose')
    setError('')
    setCode('')
  }

  return (
    <main className="home">
      <h1 className="home-title">🎬 Filmide Tinder</h1>
      <p className="home-sub">Swipe'i koos sõbraga ja leidke film, mis meeldib mõlemale.</p>

      {mode === 'choose' && (
        <div className="home-actions">
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? 'Loon…' : 'Loo tuba'}
          </button>
          <button className="btn" onClick={() => setMode('join')} disabled={loading}>
            Liitu koodiga
          </button>
        </div>
      )}

      {mode === 'created' && created && (
        <div className="home-card">
          <p>Jaga seda koodi sõbraga:</p>
          <div className="room-code">{created.code}</div>
          <button
            className="btn btn-primary"
            onClick={() => setRoom({ ...created, userSlot: 1 })}
          >
            Alusta swipe'imist
          </button>
        </div>
      )}

      {mode === 'join' && (
        <form className="home-card" onSubmit={handleJoin}>
          <label htmlFor="code">Sisesta toa kood</label>
          <input
            id="code"
            className="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="ABCD"
            autoFocus
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Liitun…' : 'Liitu'}
          </button>
          <button className="btn btn-link" type="button" onClick={back}>
            ← Tagasi
          </button>
        </form>
      )}

      {error && <p className="home-error" role="alert">{error}</p>}
    </main>
  )
}
