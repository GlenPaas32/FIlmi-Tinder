import { RoomProvider, useRoom } from './components/RoomContext.jsx'
import Home from './pages/Home.jsx'

function Screens() {
  const { room } = useRoom()
  if (!room) return <Home />
  // TODO (F2): siia tuleb swipe-vaade
  return (
    <main style={{ padding: 24 }}>
      <h2>Tuba {room.code}</h2>
      <p>Oled kasutaja {room.userSlot}. Swipe-vaade tuleb issue F2-s.</p>
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
