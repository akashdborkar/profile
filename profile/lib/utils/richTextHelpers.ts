import type { StrapiBlock } from '../types'

export function extractFirstParagraph(blocks: StrapiBlock[]): string {
  const paragraph = blocks.find((block) => block.type === 'paragraph')
  if (!paragraph) return ''
  return paragraph.children
    .map((child) => (typeof child.text === 'string' ? child.text : ''))
    .join('')
}
