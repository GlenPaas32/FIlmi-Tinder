import { useState } from 'react'
import { RoomProvider, useRoom } from './components/RoomContext.jsx'
import Home from './pages/Home.jsx'
import Swipe from './pages/Swipe.jsx'

function Screens() {
  const { room } = useRoom()
  const [showMatches, setShowMatches] = useState(false)
  if (!room) return <Home />
  if (!showMatches) return <Swipe onShowMatches={() => setShowMatches(true)} />
  // TODO (F4): siia tuleb matchide nimekiri
  return (
    <main style={{ padding: 24 }}>
      <h2>Meie nimekiri</h2>
      <p>Matchide nimekiri tuleb issue F4-s.</p>
      <button className="btn" onClick={() => setShowMatches(false)}>
        ← Tagasi
      </button>
    </main>
  )
}

export default function App() {
  return (
    <RoomProvider>
      <Screens />
    </RoomProvider>
  )
}
