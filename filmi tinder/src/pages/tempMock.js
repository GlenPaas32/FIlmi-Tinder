// AJUTINE: src/api/mock.js (issue B1) pole veel valmis.
// Kui see on main'is olemas, vaheta Home.jsx import '../api/mock.js' vastu ja kustuta see fail.

const rooms = {}

export async function createRoom() {
  const code = Array.from({ length: 4 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join('')
  const roomId = crypto.randomUUID()
  rooms[code] = roomId
  return { roomId, code }
}

export async function joinRoom(code) {
  await new Promise((r) => setTimeout(r, 300))
  if (code === 'TEST') return { roomId: 'test-room' }
  if (!rooms[code]) throw new Error('Sellise koodiga tuba ei leitud')
  return { roomId: rooms[code] }
}
