declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void
  }
}

function sendEvent(name: string, params: Record<string, string>) {
  if (typeof window !== 'undefined' && window.gtag) {
window.gtag('event', name, params)
  }
}

export function trackExternalBlogClick(blogTitle: string, externalUrl: string) {
  sendEvent('external_blog_click', { blog_title: blogTitle, external_url: externalUrl })
}

export function trackCertificationVerificationClick(certTitle: string, verificationUrl: string) {
  sendEvent('certification_verification_click', { cert_title: certTitle, verification_url: verificationUrl })
}

export function trackResumeDownloadClick(resumeUrl: string) {
  sendEvent('resume_download_click', { resume_url: resumeUrl })
}
