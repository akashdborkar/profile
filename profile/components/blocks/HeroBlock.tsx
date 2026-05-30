import Image from 'next/image'
import { env } from '@/lib/env'
import type { HeroBlock as HeroBlockType } from '@/lib/types'

interface Props {
  block: HeroBlockType
  priority?: boolean
}

export function HeroBlock({ block, priority = false }: Props) {
  if (!block.image) return null

  const src = block.image.url.startsWith('http')
    ? block.image.url
    : `${env.strapiUrl}${block.image.url}`

  return (
    <div className="mb-8">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <Image
          src={src}
          alt={block.image.alternativeText ?? block.headingText}
          fill
          className="object-cover"
          priority={priority}
        />
      </div>
      {block.headingText && (
        <h1 className="mt-6 text-3xl font-bold leading-tight">{block.headingText}</h1>
      )}
    </div>
  )
}
