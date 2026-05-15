export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Akash Borkar. Built with Next.js &amp; Strapi.
      </p>
    </footer>
  )
}
