import { useEffect, useState } from 'react'
import { formatIstClock } from '../lib/schedule'

export function LiveIstClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const msToNextSecond = 1000 - (Date.now() % 1000)
    let intervalId = 0
    const timeoutId = window.setTimeout(() => {
      tick()
      intervalId = window.setInterval(tick, 1000)
    }, msToNextSecond)
    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <time className="live-clock" dateTime={now.toISOString()}>
      {formatIstClock(now)}
    </time>
  )
}
