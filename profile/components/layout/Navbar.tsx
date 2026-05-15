'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const NAV_ANCHORS = [
  { label: 'About',          href: '#about' },
  { label: 'Skills',         href: '#skills' },
  { label: 'Featured',       href: '#featured' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Engagements',    href: '#engagements' },
] as const

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between h-16">

        {/* Logo */}
        <a
          href="#hero"
          className="text-lg font-bold text-accent hover:opacity-80 transition-opacity"
        >
          Akash Borkar
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ANCHORS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-foreground/70 hover:text-accent transition-colors"
            >
              {label}
            </a>
          ))}
          <Link
            href="/contact"
            className="text-sm text-foreground/70 hover:text-accent transition-colors"
          >
            Contact
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 flex flex-col gap-3">
          {NAV_ANCHORS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-foreground/70 hover:text-accent transition-colors py-1"
            >
              {label}
            </a>
          ))}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-foreground/70 hover:text-accent transition-colors py-1"
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  )
}
