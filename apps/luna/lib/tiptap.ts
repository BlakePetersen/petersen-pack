// ABOUTME: TipTap rich text editor configuration
// ABOUTME: Defines enabled extensions for FAQ content editing and display

import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'

export const tiptapExtensions = [
  StarterKit.configure({
    heading: {
      levels: [3, 4],
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 hover:text-blue-800 underline',
    },
  }),
  Underline,
]
