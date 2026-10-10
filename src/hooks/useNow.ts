import { useEffect, useState } from 'react'

/** Re-render on IST minute boundaries so send counts stay current. */
export function useNow(tickMs = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])
  return now
}
