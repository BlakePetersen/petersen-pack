// ABOUTME: Client component for brand guide page interactivity
// ABOUTME: Handles copy-to-clipboard for color swatches

'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

type ColorSwatchProps = {
  name: string
  hex: string
  textColor: string
}

export function ColorSwatch({ name, hex, textColor }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:focus-visible:ring-offset-gray-900"
    >
      <div
        className={`flex h-32 items-end justify-between p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] ${textColor}`}
        style={{ backgroundColor: hex }}
      >
        <span className="font-medium">{name}</span>
        <span className="font-mono text-sm opacity-80">
          {copied ? <Check className="h-4 w-4" /> : hex}
        </span>
      </div>
      <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-800">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Click to copy
        </span>
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        )}
      </div>
    </button>
  )
}
