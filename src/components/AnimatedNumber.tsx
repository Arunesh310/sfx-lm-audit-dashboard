/** Plain display — spring counters were costly with 9+ cards updating together. */
export function AnimatedNumber({ value }: { value: number }) {
  return <span className="num-display">{value}</span>
}
