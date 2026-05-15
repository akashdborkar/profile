import type { CalloutBox as CalloutBoxType } from '@/lib/types'

interface Props {
  block: CalloutBoxType
}

const VARIANT_STYLES = {
  Info: {
    wrapper: 'border-blue-500 bg-blue-950/40',
    icon: 'ℹ️',
  },
  Warning: {
    wrapper: 'border-yellow-500 bg-yellow-950/40',
    icon: '⚠️',
  },
  Success: {
    wrapper: 'border-green-500 bg-green-950/40',
    icon: '✅',
  },
} as const

export function CalloutBox({ block }: Props) {
  const { wrapper, icon } = VARIANT_STYLES[block.variant]

  return (
    <div className={`my-6 flex gap-3 rounded-r-lg border-l-4 p-4 ${wrapper}`}>
      <span className="mt-0.5 shrink-0 text-base leading-none">{icon}</span>
      <p className="text-sm leading-relaxed">{block.content}</p>
    </div>
  )
}
