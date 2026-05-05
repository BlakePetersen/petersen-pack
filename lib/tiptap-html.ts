// ABOUTME: Lightweight TipTap JSON to HTML converter for public display
// ABOUTME: Renders ProseMirror JSON without loading the full TipTap library

type TipTapNode = {
  type: string
  content?: TipTapNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, string> }[]
  attrs?: Record<string, string | number>
}

function renderMarks(
  text: string,
  marks?: { type: string; attrs?: Record<string, string> }[]
): string {
  if (!marks || marks.length === 0) return escapeHtml(text)

  let result = escapeHtml(text)
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `<strong>${result}</strong>`
        break
      case 'italic':
        result = `<em>${result}</em>`
        break
      case 'underline':
        result = `<u>${result}</u>`
        break
      case 'link':
        const href = mark.attrs?.href || ''
        result = `<a href="${escapeHtml(href)}" class="text-blue-600 hover:text-blue-800 underline">${result}</a>`
        break
    }
  }
  return result
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderNode(node: TipTapNode): string {
  if (node.type === 'text') {
    return renderMarks(node.text || '', node.marks)
  }

  const children = node.content?.map(renderNode).join('') || ''

  switch (node.type) {
    case 'doc':
      return children
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading':
      const level = node.attrs?.level || 3
      return `<h${level}>${children}</h${level}>`
    case 'bulletList':
      return `<ul>${children}</ul>`
    case 'orderedList':
      return `<ol>${children}</ol>`
    case 'listItem':
      return `<li>${children}</li>`
    case 'hardBreak':
      return '<br />'
    default:
      return children
  }
}

export function tiptapToHtml(json: string | object): string {
  try {
    let doc: TipTapNode

    if (typeof json === 'object' && json !== null) {
      // Already an object (from Prisma Json field)
      doc = json as TipTapNode
    } else if (typeof json === 'string') {
      // Parse string to object
      let parsed = JSON.parse(json)
      // Handle double-stringified data (legacy corruption)
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed)
      }
      doc = parsed as TipTapNode
    } else {
      return ''
    }

    return renderNode(doc)
  } catch {
    return ''
  }
}
