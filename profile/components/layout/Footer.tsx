import Link from 'next/link'
import { fetchAboutMe } from '@/lib/api'
import { SocialLinks } from '@/components/ui/SocialLinks'

const QUICK_LINKS = [
  { label: 'About',          href: '/about' },
  { label: 'Blog',           href: '/blog' },
  { label: 'Contact',        href: '/contact' },
] as const

export async function Footer() {
  const aboutMe = await fetchAboutMe().catch(() => null)

  return (
    <footer className="border-t border-border">
      {/* Main columns */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Col 1 — Brand */}
        <div>
          <Link href="/" className="text-base font-bold text-accent hover:opacity-80 transition-opacity">
            Akash Borkar
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">Lead Technical Consultant</p>
        </div>

        {/* Col 2 — Quick Links */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Quick Links</p>
          <ul className="space-y-2">
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-foreground/70 hover:text-accent transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Connect */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Connect</p>
          {aboutMe?.socialLinks?.length ? (
            <SocialLinks links={aboutMe.socialLinks} />
          ) : null}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <p className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-4 text-xs text-muted-foreground text-center md:text-left">
          {`© ${new Date().getFullYear()} Akash Borkar · Built with Next.js & Strapi.`}
        </p>
      </div>
    </footer>
  )
}
