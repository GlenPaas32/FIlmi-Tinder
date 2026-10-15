import { useState } from 'react'
import { RoomProvider, useRoom } from './components/RoomContext.jsx'
import Home from './pages/Home.jsx'
import Swipe from './pages/Swipe.jsx'
import Matches from './pages/Matches.jsx'

function Screens() {
  const { room } = useRoom()
  const [showMatches, setShowMatches] = useState(false)
  if (!room) return <Home />
  // Swipe jääb peidetult alles, et tagasi tulles ei algaks filmid otsast peale
  return (
    <>
      <Swipe hidden={showMatches} onShowMatches={() => setShowMatches(true)} />
      {showMatches && <Matches onBack={() => setShowMatches(false)} />}
    </>
  )
}

export default function App() {
  return (
    <RoomProvider>
      <Screens />
    </RoomProvider>
  )
}
