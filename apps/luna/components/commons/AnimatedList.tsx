// ABOUTME: Animated list with FLIP animations for filtering
// ABOUTME: Handles enter/exit/reorder animations with staggered timing

'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'

interface AnimatedListProps<T> {
  items: T[]
  keyExtractor: (item: T) => string
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  layout?: 'grid' | 'list'
  gridCols?: 1 | 2 | 3
  staggerDelay?: number
}

// Easing that matches our hover effects
const easing = [0.22, 1, 0.36, 1] as const

export function AnimatedList<T>({
  items,
  keyExtractor,
  renderItem,
  className = '',
  layout = 'list',
  gridCols = 3,
  staggerDelay = 0.04,
}: AnimatedListProps<T>) {
  const gridClass =
    layout === 'grid'
      ? `grid gap-8 ${
          gridCols === 1
            ? 'grid-cols-1'
            : gridCols === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`
      : 'space-y-3'

  return (
    <LayoutGroup>
      <motion.div layout className={`${gridClass} ${className}`}>
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.div
              key={keyExtractor(item)}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  opacity: { duration: 0.25, ease: 'easeOut' },
                  scale: { duration: 0.3, ease: easing },
                  delay: index * staggerDelay,
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                transition: {
                  opacity: { duration: 0.15, ease: 'easeIn' },
                  scale: { duration: 0.2, ease: [0.4, 0, 1, 1] },
                },
              }}
              transition={{
                layout: {
                  duration: 0.3,
                  ease: easing,
                },
              }}
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  )
}
