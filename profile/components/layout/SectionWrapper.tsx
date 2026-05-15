import { cn } from '@/lib/utils'

interface SectionWrapperProps {
  id: string
  className?: string
  children: React.ReactNode
}

export function SectionWrapper({ id, className, children }: SectionWrapperProps) {
  return (
    <section id={id} className="py-20">
      <div className={cn('max-w-6xl mx-auto px-4 md:px-8 lg:px-16', className)}>
        {children}
      </div>
    </section>
  )
}
