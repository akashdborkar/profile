import { CopyButton } from './CopyButton'
import type { CodeBlock as CodeBlockType } from '@/lib/types'

interface Props {
  block: CodeBlockType
}

export function CodeBlock({ block }: Props) {
  return (
    <div className="relative my-6 rounded-lg bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">{block.language}</span>
        <CopyButton code={block.code} />
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm whitespace-pre text-gray-100">{block.code}</code>
      </pre>
    </div>
  )
}
