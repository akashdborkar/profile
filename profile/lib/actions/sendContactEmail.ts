'use server'

import { Resend } from 'resend'
import { env } from '@/lib/env'

type ActionResult = { success: boolean; error: string | null }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendContactEmail(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const name    = formData.get('name')?.toString().trim()    ?? ''
  const email   = formData.get('email')?.toString().trim()   ?? ''
  const message = formData.get('message')?.toString().trim() ?? ''

  if (!name || !email || !message) {
    return { success: false, error: 'All fields are required.' }
  }
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const resend = new Resend(env.resendKey)
  const { error } = await resend.emails.send({
    from: 'contact@yourdomain.com',
    to: 'akash.borkar@yourdomain.com',
    subject: `Portfolio Contact: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  })

  if (error) {
    if (error.statusCode === 429) {
      return {
        success: false,
        error: 'Service busy. Please reach out directly via LinkedIn.',
      }
    }
    return { success: false, error: 'Failed to send. Please try again.' }
  }

  return { success: true, error: null }
}
