import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ContactForm } from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Lead Technical Consultant',
  description: 'Get in touch to discuss projects, collaborations, or consulting opportunities.',
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-4">Get In Touch</h1>
          <p className="text-muted-foreground">
            Whether you have a project in mind or just want to connect.
          </p>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
