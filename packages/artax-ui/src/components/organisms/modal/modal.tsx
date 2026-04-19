'use client'
// ABOUTME: Modal — thin composition over artax-ui Dialog with size slots.
// ABOUTME: Applies mounted-flag SSR gate per Phase 24.1 D-09 for above-the-fold usage.
import { useState, useEffect, type ReactNode } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '../dialog/dialog'
import { cn } from '../../../lib/utils'

type ModalProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  trigger?: ReactNode
  children: ReactNode
  className?: string
}

const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' } as const

export function Modal({
  open,
  onOpenChange,
  size = 'md',
  trigger,
  children,
  className
}: ModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted && trigger) return <>{trigger}</>
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn(sizeClass[size], className)}>
        {children}
      </DialogContent>
    </Dialog>
  )
}

Modal.Title = DialogTitle
Modal.Description = DialogDescription
Modal.Close = DialogClose
