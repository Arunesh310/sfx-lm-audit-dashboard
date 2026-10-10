import { motion } from 'framer-motion'
import { formatIstClock } from '../lib/schedule'
import { useNow } from '../hooks/useNow'

export function LiveIstClock() {
  const now = useNow(1000)
  return (
    <motion.time className="live-clock" dateTime={now.toISOString()}>
      {formatIstClock(now)}
    </motion.time>
  )
}
