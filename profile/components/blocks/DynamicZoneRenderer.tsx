import { BlockErrorBoundary } from './BlockErrorBoundary'
import { HeroBlock } from './HeroBlock'
import { TextBlock } from './TextBlock'
import { CodeBlock } from './CodeBlock'
import { CalloutBox } from './CalloutBox'
import type { ContentBlock } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function DynamicZoneRenderer({ blocks }: Props) {
  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => (
        <BlockErrorBoundary key={`${block.__component}-${block.id}`}>
          {renderBlock(block, idx)}
        </BlockErrorBoundary>
      ))}
    </div>
  )
}

function renderBlock(block: ContentBlock, idx: number) {
  switch (block.__component) {
    case 'content.hero-block':
      return <HeroBlock block={block} priority={idx === 0} />
    case 'content.text-block':
      return <TextBlock block={block} />
    case 'content.code-block':
      return <CodeBlock block={block} />
    case 'content.callout-box':
      return <CalloutBox block={block} />
    default:
      return null
  }
}
