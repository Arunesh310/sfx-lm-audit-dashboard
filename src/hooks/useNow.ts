import { useEffect, useState } from 'react'

/** Schedule tick aligned to minute boundaries — fewer full-tree re-renders. */
export function useNow(tickMs = 60_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const msToNext =
      tickMs >= 60_000
        ? (60 - (new Date().getSeconds() % 60)) * 1000 - new Date().getMilliseconds()
        : tickMs

    let intervalId = 0
    const timeoutId = window.setTimeout(
      () => {
        tick()
        intervalId = window.setInterval(tick, tickMs)
      },
      Math.max(0, msToNext),
    )

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [tickMs])

  return now
}
