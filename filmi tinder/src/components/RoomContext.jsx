import { createContext, useContext, useState } from 'react'

// Hoiab toa infot: { roomId, code, userSlot } või null, kui tuppa pole veel mindud.
const RoomContext = createContext(/** @type {any} */ (null))

export function RoomProvider({ children }) {
  const [room, setRoom] = useState(null)
  return (
    <RoomContext.Provider value={{ room, setRoom }}>
      {children}
    </RoomContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRoom() {
  return useContext(RoomContext)
}
