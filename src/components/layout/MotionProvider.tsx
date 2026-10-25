'use client'

import { MotionConfig } from 'framer-motion'

// Honour the system "reduce motion" setting for every Framer animation
// (page transitions, staggered week rows, toasts)
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
