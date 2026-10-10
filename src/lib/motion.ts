import type { Transition } from 'framer-motion'

/** Short ease-out tweens — smoother than springs on many simultaneous nodes. */
export const tweenFast: Transition = {
  duration: 0.22,
  ease: [0.25, 0.1, 0.25, 1],
}

export const tweenMedium: Transition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
}

export const spring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.65,
}

export const springSoft: Transition = tweenFast

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.035, delayChildren: 0.02 },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}
