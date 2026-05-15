interface Props {
  sectionName: string
}

export function SectionUnavailable({ sectionName }: Props) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      ⚠️ {sectionName} data is temporarily unavailable. Please check back later.
    </div>
  )
}
