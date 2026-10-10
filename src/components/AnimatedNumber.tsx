import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 18, mass: 0.6 })
  const display = useTransform(spring, (v) => Math.round(v).toString())

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}
