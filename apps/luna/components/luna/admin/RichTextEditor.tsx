// ABOUTME: TipTap rich text editor wrapper for admin FAQ editing
// ABOUTME: Provides formatted text input with toolbar controls

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { tiptapExtensions } from '@/lib/tiptap'
import { useEffect } from 'react'
import { logger } from '@/lib/logger.edge'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading3,
  Heading4,
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (json: string) => void
  placeholder?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your answer here...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: content ? JSON.parse(content) : '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON())
      onChange(json)
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4 border-t border-gray-200 dark:border-gray-700',
      },
    },
  })

  useEffect(() => {
    if (editor && content && content !== JSON.stringify(editor.getJSON())) {
      try {
        const parsed = JSON.parse(content)
        editor.commands.setContent(parsed)
      } catch (e) {
        logger.error({ err: e }, 'Failed to parse content')
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const buttonClass = (isActive: boolean) =>
    `rounded p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${
      isActive ? 'bg-gray-300 dark:bg-gray-600' : ''
    }`

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive('bold'))}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive('italic'))}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonClass(editor.isActive('underline'))}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="mx-1 h-8 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={buttonClass(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={buttonClass(editor.isActive('heading', { level: 4 }))}
          title="Heading 4"
        >
          <Heading4 className="h-4 w-4" />
        </button>
        <div className="mx-1 h-8 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="mx-1 h-8 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          onClick={setLink}
          className={buttonClass(editor.isActive('link'))}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
