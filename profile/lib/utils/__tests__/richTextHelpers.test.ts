import { describe, it, expect } from 'vitest'
import { extractFirstParagraph } from '../richTextHelpers'
import type { StrapiBlock } from '../../types'

const paragraph = (text: string): StrapiBlock => ({
  type: 'paragraph',
  children: [{ type: 'text', text }],
})

const heading = (text: string): StrapiBlock => ({
  type: 'heading',
  children: [{ type: 'text', text }],
})

describe('extractFirstParagraph', () => {
  it('returns the text of the first paragraph block', () => {
    const blocks: StrapiBlock[] = [paragraph('Hello, world.')]
    expect(extractFirstParagraph(blocks)).toBe('Hello, world.')
  })

  it('concatenates multiple text children in a paragraph', () => {
    const block: StrapiBlock = {
      type: 'paragraph',
      children: [
        { type: 'text', text: 'Bold ' },
        { type: 'text', text: 'and normal.' },
      ],
    }
    expect(extractFirstParagraph([block])).toBe('Bold and normal.')
  })

  it('returns the first paragraph when mixed block types exist', () => {
    const blocks: StrapiBlock[] = [heading('Title'), paragraph('First para.'), paragraph('Second para.')]
    expect(extractFirstParagraph(blocks)).toBe('First para.')
  })

  it('returns empty string for empty array', () => {
    expect(extractFirstParagraph([])).toBe('')
  })

  it('returns empty string when no paragraph type exists', () => {
    const blocks: StrapiBlock[] = [heading('Just a heading')]
    expect(extractFirstParagraph(blocks)).toBe('')
  })
})
