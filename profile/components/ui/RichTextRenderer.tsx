import type { StrapiBlock } from '@/lib/types'

// ---------------------------------------------------------------------------
// Inline text node renderer
// ---------------------------------------------------------------------------

type TextNode = {
  type: 'text'
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

type LinkNode = {
  type: 'link'
  url: string
  children: TextNode[]
}

type InlineNode = TextNode | LinkNode

function renderInline(node: InlineNode, idx: number): React.ReactNode {
  if (node.type === 'link') {
    return (
      <a key={idx} href={node.url} target="_blank" rel="noopener noreferrer"
        className="text-accent underline underline-offset-4 hover:opacity-80">
        {node.children.map((c, i) => renderInline(c, i))}
      </a>
    )
  }
  let content: React.ReactNode = node.text
  if (node.bold)      content = <strong key={`b-${idx}`}>{content}</strong>
  if (node.italic)    content = <em key={`i-${idx}`}>{content}</em>
  if (node.underline) content = <u key={`u-${idx}`}>{content}</u>
  return <span key={idx}>{content}</span>
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

function renderBlock(block: StrapiBlock, idx: number): React.ReactNode {
  const children = (block.children ?? []) as InlineNode[]

  switch (block.type) {
    case 'paragraph':
      return <p key={idx}>{children.map(renderInline)}</p>

    case 'heading': {
      const level = (block.level as number) ?? 2
      const text = children.map(renderInline)
      if (level === 1) return <h1 key={idx}>{text}</h1>
      if (level === 2) return <h2 key={idx}>{text}</h2>
      if (level === 3) return <h3 key={idx}>{text}</h3>
      if (level === 4) return <h4 key={idx}>{text}</h4>
      return <h5 key={idx}>{text}</h5>
    }

    case 'list': {
      const items = (block.children ?? []) as StrapiBlock[]
      const listItems = items.map((item, i) => (
        <li key={i}>{(item.children as InlineNode[] ?? []).map(renderInline)}</li>
      ))
      return block.format === 'ordered'
        ? <ol key={idx}>{listItems}</ol>
        : <ul key={idx}>{listItems}</ul>
    }

    case 'quote':
      return <blockquote key={idx}>{children.map(renderInline)}</blockquote>

    case 'code':
      return (
        <pre key={idx}>
          <code>{children.map((c) => (c as TextNode).text ?? '').join('')}</code>
        </pre>
      )

    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface RichTextRendererProps {
  blocks: StrapiBlock[]
}

export function RichTextRenderer({ blocks }: RichTextRendererProps) {
  return (
    <div className="prose prose-invert max-w-none">
      {blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  )
}
