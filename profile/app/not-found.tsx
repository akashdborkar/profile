import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-8xl font-bold text-muted-foreground/30 select-none">404</p>
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className={buttonVariants({ variant: 'default' }) + ' mt-2'}>
          Return Home
        </Link>
      </main>
      <Footer />
    </>
  )
}
