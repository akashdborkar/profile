import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { fetchContact } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Contact | Lead Technical Consultant',
  description: 'Get in touch to discuss projects, collaborations, or consulting opportunities.',
}

export default async function ContactPage() {
  const contact = await fetchContact()

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Contact</p>
          <h1 className="text-4xl font-bold text-foreground mb-4">Get In Touch</h1>
          <p className="text-muted-foreground">
            Whether you have a project in mind or just want to connect.
          </p>
        </div>

        {contact && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <Card>
              <CardContent className="pt-5 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Phone {contact.phoneLabel ? `(${contact.phoneLabel})` : ''}
                </p>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-base font-medium text-foreground hover:text-accent transition-colors"
                >
                  {contact.phone}
                </a>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardContent className="pt-5 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Email
                </p>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-base font-medium text-foreground hover:text-accent transition-colors break-all"
                >
                  {contact.email}
                </a>
              </CardContent>
            </Card>

            {/* LinkedIn */}
            {contact.linkedinUrl && (
              <Card>
                <CardContent className="pt-5 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    LinkedIn
                  </p>
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-accent hover:underline underline-offset-4 transition-colors break-all"
                  >
                    {contact.linkedinUrl.replace('https://www.', '').replace('https://', '')}
                  </a>
                </CardContent>
              </Card>
            )}

            {/* GitHub */}
            {contact.githubUrl && (
              <Card>
                <CardContent className="pt-5 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    GitHub
                  </p>
                  <a
                    href={contact.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-accent hover:underline underline-offset-4 transition-colors break-all"
                  >
                    {contact.githubUrl.replace('https://www.', '').replace('https://', '')}
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
