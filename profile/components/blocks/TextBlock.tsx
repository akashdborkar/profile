import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import type { TextBlock as TextBlockType } from '@/lib/types'

interface Props {
  block: TextBlockType
}

export function TextBlock({ block }: Props) {
  return <RichTextRenderer blocks={block.body} />
}
