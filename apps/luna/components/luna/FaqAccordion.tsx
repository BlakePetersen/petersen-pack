// ABOUTME: FAQ accordion component with multi-expand functionality
// ABOUTME: Displays questions with collapsible answers and share links

'use client'

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { ChevronDown, Link2, Check } from 'lucide-react'
import { tiptapToHtml } from '@/lib/tiptap-html'

// Easing that matches our hover effects
const easing = [0.22, 1, 0.36, 1] as const

interface FaqItemCardProps {
  faq: FaqItem
  index: number
  isOpen: boolean
  copiedId: string | null
  getFaqLink?: (faq: FaqItem) => string
  onToggle: (id: string) => void
  onCopyLink: (faq: FaqItem) => void
  onRef: (el: HTMLDivElement | null) => void
}

function FaqItemCard({
  faq,
  index,
  isOpen,
  copiedId,
  getFaqLink,
  onToggle,
  onCopyLink,
  onRef,
}: FaqItemCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          opacity: { duration: 0.25, ease: 'easeOut' },
          scale: { duration: 0.3, ease: easing },
          delay: index * 0.04,
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
      <div
        ref={onRef}
        className={`group cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ease-out ${
          isOpen
            ? 'border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-950'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 dark:hover:bg-gray-900/50'
        }`}
        onClick={() => onToggle(faq.id)}
      >
        <div className="flex items-start">
          {/* Question text */}
          <div className="flex-1 p-6 pr-2 text-left">
            <h3 className="font-serif text-xl font-medium leading-relaxed text-gray-900 dark:text-white">
              {faq.question}
            </h3>
          </div>

          {/* Share link button */}
          {getFaqLink && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCopyLink(faq)
              }}
              className="mt-6 flex h-8 w-8 flex-shrink-0 items-center justify-center text-gray-300 opacity-0 transition-all hover:text-gray-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:text-gray-400"
              title="Copy link to this FAQ"
            >
              {copiedId === faq.id ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Chevron */}
          <div className="p-6 pl-2">
            <ChevronDown
              className={`mt-1 h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                isOpen
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-300 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400'
              } ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Answer content with smooth expand/collapse */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-gray-100 px-6 pb-6 pt-4 dark:border-gray-800">
              <div
                className="prose prose-gray max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: tiptapToHtml(faq.answer),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface FaqItem {
  id: string
  question: string
  answer: string | object
  category?: string
}

interface FaqAccordionProps {
  faqs: FaqItem[]
  initialOpenId?: string | null
  getFaqLink?: (faq: FaqItem) => string
  emptyMessage?: string
}

export interface FaqAccordionRef {
  closeAll: () => void
}

export const FaqAccordion = forwardRef<FaqAccordionRef, FaqAccordionProps>(
  function FaqAccordion(
    {
      faqs,
      initialOpenId,
      getFaqLink,
      emptyMessage = 'No FAQs available yet.',
    },
    ref
  ) {
    const [openIds, setOpenIds] = useState<Set<string>>(() =>
      initialOpenId ? new Set([initialOpenId]) : new Set()
    )
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
    const hasScrolled = useRef(false)

    const scrollToFaq = (element: HTMLDivElement) => {
      // Header height (7rem = 112px) plus extra breathing room
      const headerOffset = 140
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.scrollY
      const scrollTarget = absoluteElementTop - headerOffset

      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth',
      })
    }

    // Handle scroll to target FAQ on initial load
    useEffect(() => {
      if (initialOpenId && !hasScrolled.current) {
        // Wait for render then scroll
        const scrollTimeout = setTimeout(() => {
          const targetElement = itemRefs.current.get(initialOpenId)
          if (targetElement) {
            scrollToFaq(targetElement)

            // Add highlight pulse
            targetElement.classList.add(
              'ring-2',
              'ring-primary-500',
              'ring-offset-2'
            )
            setTimeout(() => {
              targetElement.classList.remove(
                'ring-2',
                'ring-primary-500',
                'ring-offset-2'
              )
            }, 2000)
          }
          hasScrolled.current = true
        }, 400)

        return () => clearTimeout(scrollTimeout)
      }
    }, [initialOpenId])

    const toggleFaq = (id: string) => {
      const wasOpen = openIds.has(id)
      setOpenIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })

      // Scroll to FAQ when opening
      if (!wasOpen) {
        const element = itemRefs.current.get(id)
        if (element) {
          // Small delay to let the state update
          setTimeout(() => scrollToFaq(element), 50)
        }
      }
    }

    const openAll = () => {
      setOpenIds(new Set(faqs.map((faq) => faq.id)))
    }

    const closeAll = () => {
      setOpenIds(new Set())
    }

    // Expose closeAll to parent via ref
    useImperativeHandle(ref, () => ({
      closeAll,
    }))

    const copyLink = async (faq: FaqItem) => {
      if (!getFaqLink) return
      const link = getFaqLink(faq)
      const fullUrl = `${window.location.origin}${link}`
      await navigator.clipboard.writeText(fullUrl)
      setCopiedId(faq.id)
      setTimeout(() => setCopiedId(null), 2000)
    }

    if (faqs.length === 0) {
      return (
        <div className="rounded-xl bg-gray-50 py-12 text-center text-gray-500 shadow-soft dark:bg-gray-900 dark:text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      )
    }

    const allOpen = openIds.size === faqs.length
    const allClosed = openIds.size === 0

    return (
      <>
        {/* Open/Close All Controls */}
        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={openAll}
            disabled={allOpen}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Expand All
          </button>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <button
            onClick={closeAll}
            disabled={allClosed}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Collapse All
          </button>
        </div>

        <LayoutGroup>
          <motion.div layout className="space-y-3">
            <AnimatePresence initial={false}>
              {faqs.map((faq, index) => (
                <FaqItemCard
                  key={faq.id}
                  faq={faq}
                  index={index}
                  isOpen={openIds.has(faq.id)}
                  copiedId={copiedId}
                  getFaqLink={getFaqLink}
                  onToggle={toggleFaq}
                  onCopyLink={copyLink}
                  onRef={(el) => {
                    if (el) itemRefs.current.set(faq.id, el)
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </>
    )
  }
)
