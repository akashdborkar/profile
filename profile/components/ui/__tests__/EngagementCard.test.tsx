import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { EngagementAndActivity } from '@/lib/types'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

const { EngagementCard } = await import('../EngagementCard')

// ---------------------------------------------------------------------------
// Fixture factory
// ---------------------------------------------------------------------------

function makeEngagement(
  overrides: Partial<EngagementAndActivity> = {}
): EngagementAndActivity {
  return {
    id: 1,
    documentId: 'doc-eng-1',
    title: 'Test Engagement',
    description: [{ type: 'paragraph', children: [{ type: 'text', text: 'Some description text.' }] }],
    eventDate: '2025-05-01',
    isFeatured: false,
    gallery_items: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// postUrl — title link behaviour
// ---------------------------------------------------------------------------

describe('postUrl', () => {
  it('wraps the title in an anchor with correct href, target, and rel when postUrl is set', () => {
    render(
      <EngagementCard
        engagement={makeEngagement({ postUrl: 'https://linkedin.com/posts/test-123' })}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://linkedin.com/posts/test-123')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveTextContent('Test Engagement')
  })

  it('does not render an anchor when postUrl is absent', () => {
    render(<EngagementCard engagement={makeEngagement()} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Test Engagement')).toBeInTheDocument()
  })

  it('does not render an anchor when postUrl is an empty string', () => {
    render(<EngagementCard engagement={makeEngagement({ postUrl: '' })} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Media rendering
// ---------------------------------------------------------------------------

describe('Media', () => {
  it('renders an image for mediaType=Image', () => {
    render(
      <EngagementCard
        engagement={makeEngagement({
          mediaUrls: ['https://res.cloudinary.com/img.jpg'],
          mediaType: 'Image',
        })}
      />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://res.cloudinary.com/img.jpg')
    expect(img).toHaveAttribute('alt', 'Test Engagement')
  })

  it('renders an image for mediaType=Carousel', () => {
    render(
      <EngagementCard
        engagement={makeEngagement({
          mediaUrls: ['https://res.cloudinary.com/carousel.jpg'],
          mediaType: 'Carousel',
        })}
      />
    )

    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders a video element for mediaType=Video', () => {
    const { container } = render(
      <EngagementCard
        engagement={makeEngagement({
          mediaUrls: ['https://res.cloudinary.com/video.mp4'],
          mediaType: 'Video',
        })}
      />
    )

    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(container.querySelector('source')).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/video.mp4'
    )
  })

  it('renders nothing for mediaType=ExternalLink', () => {
    const { container } = render(
      <EngagementCard
        engagement={makeEngagement({
          mediaUrls: ['https://example.com/article'],
          mediaType: 'ExternalLink',
        })}
      />
    )

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('video')).not.toBeInTheDocument()
  })

  it('renders nothing when mediaUrls is an empty array', () => {
    render(<EngagementCard engagement={makeEngagement({ mediaUrls: [], mediaType: 'Image' })} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Link preview card
// ---------------------------------------------------------------------------

describe('Link preview card', () => {
  it('shows title and description when linkPreviewCard is set and no mediaUrls exist', () => {
    render(
      <EngagementCard
        engagement={makeEngagement({
          linkPreviewCard: {
            title: 'Preview Title',
            description: 'Preview description text',
            thumbnailUrl: 'https://t.co/thumb.jpg',
          },
        })}
      />
    )

    expect(screen.getByText('Preview Title')).toBeInTheDocument()
    expect(screen.getByText('Preview description text')).toBeInTheDocument()
  })

  it('does not show link preview when mediaUrls are also present', () => {
    render(
      <EngagementCard
        engagement={makeEngagement({
          mediaUrls: ['https://res.cloudinary.com/img.jpg'],
          mediaType: 'Image',
          linkPreviewCard: {
            title: 'Should Not Appear',
            description: 'Hidden',
            thumbnailUrl: '',
          },
        })}
      />
    )

    expect(screen.queryByText('Should Not Appear')).not.toBeInTheDocument()
  })

  it('renders nothing when linkPreviewCard has null/undefined title (malformed)', () => {
    expect(() =>
      render(
        <EngagementCard
          engagement={makeEngagement({
            // @ts-expect-error — intentionally testing malformed runtime data
            linkPreviewCard: { title: null, description: null, thumbnailUrl: '' },
          })}
        />
      )
    ).not.toThrow()

    // No preview card rendered
    expect(screen.queryByText('null')).not.toBeInTheDocument()
  })

  it('renders nothing when linkPreviewCard is omitted entirely', () => {
    const { container } = render(<EngagementCard engagement={makeEngagement()} />)
    // No border-border preview div rendered
    expect(container.querySelector('.border-border.p-3')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Regression — existing engagement without new fields
// ---------------------------------------------------------------------------

describe('Regression — manual engagement (no LinkedIn fields)', () => {
  it('renders title, excerpt, date, and photo badge exactly as before', () => {
    render(
      <EngagementCard
        engagement={makeEngagement({
          title: 'Community Talk',
          gallery_items: [
            {
              id: 10, documentId: 'g1', title: 'Photo', categoryTag: 'SpeakingEvents' as const,
              createdAt: '', updatedAt: '',
              imageAsset: {
                id: 1, documentId: 'media-1', url: '', alternativeText: null, caption: null,
                width: null, height: null, formats: null, hash: '', ext: '', mime: 'image/jpeg',
                size: 0, previewUrl: null, provider: 'cloudinary', name: 'photo.jpg',
                createdAt: '', updatedAt: '',
              },
            },
          ],
        })}
      />
    )

    expect(screen.getByText('Community Talk')).toBeInTheDocument()
    expect(screen.getByText('Some description text.')).toBeInTheDocument()
    expect(screen.getByText(/1 Photo/i)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders without errors when all new fields are undefined', () => {
    expect(() =>
      render(<EngagementCard engagement={makeEngagement()} />)
    ).not.toThrow()
  })
})
